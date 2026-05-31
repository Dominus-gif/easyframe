import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { grantTrialAccess } from "@/lib/subscription";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
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
