import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getUserAccess } from "@/lib/subscription";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ hasAccess: false, planType: "free", status: "signed_out", exportCount: 0, exportsRemaining: 0 }, { status: 401 });
  }

  const access = await getUserAccess(session.user.id);
  return NextResponse.json({
    ...access,
    expiresAt: access.expiresAt?.toISOString() ?? null
  });
}
