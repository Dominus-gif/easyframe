import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteNav from "@/components/site/SiteNav";
import AccountPanel from "@/components/auth/AccountPanel";
import { getAppSession } from "@/lib/auth/session";
import { getUserAccess } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Account | EasyFrame",
  robots: { index: false, follow: false }
};
export const dynamic = "force-dynamic";

const PREMIUM_PLANS = ["monthly", "lifetime", "premium"];

export default async function AccountPage({ searchParams }: { searchParams?: { reset?: string } }) {
  const session = await getAppSession();
  if (!session) redirect("/login?next=/account");

  const [access, payments] = await Promise.all([
    getUserAccess(session.user.id),
    prisma.paymentEvent.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, eventType: true, createdAt: true }
    })
  ]);

  const premium = Boolean(access.hasAccess) && PREMIUM_PLANS.includes(access.planType);

  return (
    <main className="mk mk-auth">
      <SiteNav />
      <AccountPanel
        email={session.user.email}
        plan={{
          premium,
          label: premium ? (access.planType === "lifetime" ? "Premium · Lifetime" : "Premium · Monthly") : "Free",
          renews: access.expiresAt ? new Date(access.expiresAt).toISOString() : null
        }}
        purchases={payments.map((p) => ({ id: p.id, type: p.eventType, date: p.createdAt.toISOString() }))}
        resetMode={searchParams?.reset === "1"}
      />
    </main>
  );
}
