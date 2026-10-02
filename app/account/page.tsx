import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteNav from "@/components/site/SiteNav";
import AccountPanel from "@/components/auth/AccountPanel";
import { getAppSession, getAuthUser } from "@/lib/auth/session";
import { getUserAccess } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Account | EasyFrame",
  robots: { index: false, follow: false }
};
export const dynamic = "force-dynamic";

const PREMIUM_PLANS = ["monthly", "lifetime", "premium"];

// Dates are formatted here, on the server, with an explicit locale and time zone:
// formatting them in the client component instead produced a different string on
// the server (UTC) than in the browser (local time) whenever the two fell on
// different days, and that hydration mismatch crashed the page.
//
// It must never throw. Intl.DateTimeFormat.format() raises a RangeError for a
// date *string* or an invalid Date, and Prisma's wasm client over the pg driver
// adapter (the Workers path) does not always hand back real Date objects the way
// the Node client does locally. An uncaught throw here takes the whole page down
// with "Application error: a client-side exception has occurred".
const DATE_FMT = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
/** Safe ISO string for <time dateTime>, or "" when the value is unusable. */
function isoValue(value: Date | string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function dateLabel(value: Date | string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return DATE_FMT.format(d);
  } catch {
    return null;
  }
}

/** Retry a transient failure once before giving up (cold DB, dropped connection). */
async function withRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (first) {
    console.error(`[account] ${label} failed, retrying`, first instanceof Error ? `${first.name}: ${first.message}` : first);
    await new Promise((r) => setTimeout(r, 300));
    return fn();
  }
}

export default async function AccountPage({ searchParams }: { searchParams?: { reset?: string } }) {
  // Identity comes from Supabase alone, so the page still renders when the
  // database is unreachable. Plan and purchases are the only parts that need it,
  // and both degrade below rather than taking the page down.
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login?next=/account");

  let access: Awaited<ReturnType<typeof getUserAccess>> | null = null;
  let payments: { id: string; eventType: string; createdAt: Date }[] = [];
  let planKnown = false;

  try {
    const session = await withRetry("session", () => getAppSession());
    if (session) {
      [access, payments] = await withRetry("plan/purchases", () =>
        Promise.all([
          getUserAccess(session.user.id),
          prisma.paymentEvent.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20,
            select: { id: true, eventType: true, createdAt: true }
          })
        ])
      );
      planKnown = true;
    }
  } catch (e) {
    console.error("[account] could not load plan or purchases", e instanceof Error ? `${e.name}: ${e.message}` : e);
  }

  const premium = Boolean(access?.hasAccess) && PREMIUM_PLANS.includes(access?.planType ?? "free");

  return (
    <main className="mk mk-auth">
      <SiteNav />
      <AccountPanel
        email={authUser.email}
        planKnown={planKnown}
        plan={{
          premium,
          label: premium ? (access?.planType === "lifetime" ? "Premium · Lifetime" : "Premium · Monthly") : "Free",
          renews: dateLabel(access?.expiresAt)
        }}
        purchases={payments.map((p) => ({
          id: p.id,
          type: p.eventType ?? "",
          date: isoValue(p.createdAt),
          dateLabel: dateLabel(p.createdAt) ?? "—"
        }))}
        resetMode={searchParams?.reset === "1"}
      />
    </main>
  );
}
