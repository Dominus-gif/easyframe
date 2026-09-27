import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { grantTrialAccess } from "@/lib/subscription";

// Per-user (reads the session cookie): never prerender.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAppSession();
  const localBypass = process.env.ALLOW_LOCAL_MOCK_SESSION === "true";

  if (!session?.user?.id) {
    if (localBypass) {
      return NextResponse.redirect(new URL("/studio", request.url), 303);
    }

    return NextResponse.redirect(new URL("/login?reason=session-required", request.url), 303);
  }

  const access = await grantTrialAccess(session.user.id);
  if (!access.hasAccess) {
    return NextResponse.redirect(new URL("/pricing?reason=trial-ended", request.url), 303);
  }

  return NextResponse.redirect(new URL("/studio", request.url), 303);
}
