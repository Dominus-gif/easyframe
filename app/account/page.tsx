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

// Dates are formatted here, on the server, with an explicit locale and time zone.
// Formatting them in the client component instead produced a different string on
// the server (UTC) than in the browser (local time) whenever the two fell on
// different days, and that hydration mismatch crashed the page with
// "Application error: a client-side exception has occurred".
const dateLabel = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);

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
          renews: access.expiresAt ? dateLabel(new Date(access.expiresAt)) : null
        }}
        purchases={payments.map((p) => ({ id: p.id, type: p.eventType, date: p.createdAt.toISOString(), dateLabel: dateLabel(p.createdAt) }))}
        resetMode={searchParams?.reset === "1"}
      />
    </main>
  );
}
