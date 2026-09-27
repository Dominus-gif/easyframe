import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth/session";
import { getUserAccess } from "@/lib/subscription";

// Per-user (reads the session cookie): never prerender.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ hasAccess: false, planType: "free", status: "signed_out", exportCount: 0, exportsRemaining: 0 }, { status: 401 });
  }

  const access = await getUserAccess(session.user.id);
  return NextResponse.json({
    ...access,
    expiresAt: access.expiresAt?.toISOString() ?? null
  });
}
