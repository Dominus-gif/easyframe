import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { getUserAccess } from "@/lib/subscription";

// Per-user (reads the session cookie): never prerender.
export const dynamic = "force-dynamic";

const PREMIUM_PLANS = ["monthly", "lifetime", "premium"];

/**
 * Guest-safe entitlement check for the free experience: always 200 (a guest is
 * simply non-premium), so it never logs a 401 in the console.
 *
 * `known` tells the client whether this answer is trustworthy. If the session or
 * database lookup fails we must NOT report `premium: false` as fact — that would
 * downgrade a paying account to the free experience. The client retries while
 * `known` is false.
 */
export async function GET() {
  try {
    const session = await getAppSession();
    if (!session?.user?.id) return NextResponse.json({ premium: false, known: true });

    const access = await getUserAccess(session.user.id);
    const premium = Boolean(access.hasAccess) && PREMIUM_PLANS.includes(access.planType);
    return NextResponse.json({ premium, known: true });
  } catch (e) {
    console.error("[premium] entitlement lookup failed", e instanceof Error ? `${e.name}: ${e.message}` : e);
    return NextResponse.json({ premium: false, known: false }, { status: 200 });
  }
}
