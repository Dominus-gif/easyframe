import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { getUserAccess } from "@/lib/subscription";

// Per-user (reads the session cookie): never prerender.
export const dynamic = "force-dynamic";

const PREMIUM_PLANS = ["monthly", "lifetime", "premium"];

// Guest-safe entitlement check for the free experience: always 200 (a guest is simply
// non-premium), so it never logs a 401 in the console like /api/account/access does.
export async function GET() {
  const session = await getAppSession();
  if (!session?.user?.id) return NextResponse.json({ premium: false });
  const access = await getUserAccess(session.user.id);
  const premium = Boolean(access.hasAccess) && PREMIUM_PLANS.includes(access.planType);
  return NextResponse.json({ premium });
}
