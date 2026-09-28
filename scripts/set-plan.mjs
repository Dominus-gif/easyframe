// Change a user's plan directly in the database (for testing / support).
//
// Usage (run against the PRODUCTION Supabase DB — use the SESSION pooler URL):
//   DATABASE_URL="postgresql://postgres.<ref>:<pw>@aws-1-<region>.pooler.supabase.com:5432/postgres" \
//     node scripts/set-plan.mjs someone@example.com lifetime
//
//   plan = free | monthly | yearly | lifetime
//
// PowerShell:
//   $env:DATABASE_URL="postgresql://..."; node scripts/set-plan.mjs someone@example.com monthly
//
// "free" revokes access. Any paid plan grants it immediately (no payment).

import { PrismaClient } from "@prisma/client";

const [emailArg, planArg = "lifetime"] = process.argv.slice(2);
const email = (emailArg || "").trim().toLowerCase();
const plan = planArg.trim().toLowerCase();
const PLANS = ["free", "monthly", "yearly", "lifetime"];

if (!email || !email.includes("@") || !PLANS.includes(plan)) {
  console.error("Usage: node scripts/set-plan.mjs <email> <free|monthly|yearly|lifetime>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL to your Supabase session-pooler connection string first.");
  process.exit(1);
}

const prisma = new PrismaClient();

const durationMs = { monthly: 30, yearly: 365, lifetime: null };
const expiresAt = plan === "monthly" || plan === "yearly" ? new Date(Date.now() + durationMs[plan] * 864e5) : null;

try {
  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (!user) {
    console.error(`No user with email ${email}. They must sign in once first.`);
    process.exit(1);
  }

  if (plan === "free") {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: "free", subscriptionPlan: null, lifetimeAccess: false }
    });
    await prisma.subscription.updateMany({ where: { userId: user.id }, data: { status: "canceled", cancelAtPeriodEnd: true } });
    console.log(`Revoked premium for ${email}. Now: free.`);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: "active",
        subscriptionPlan: plan,
        lifetimeAccess: plan === "lifetime",
        trialUsed: true
      }
    });
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: { userId: user.id, planType: plan, status: "active", exportCount: 0, expiresAt, lastPaymentAt: new Date() },
      update: { planType: plan, status: "active", expiresAt, cancelAtPeriodEnd: false, lastPaymentAt: new Date() }
    });
    console.log(`Granted ${plan} to ${email}${expiresAt ? ` (expires ${expiresAt.toISOString().slice(0, 10)})` : " (lifetime)"}.`);
  }
} catch (e) {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
