import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { consumeExport, getUserAccess } from "@/lib/subscription";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const before = await getUserAccess(session.user.id);
  if (!before.hasAccess) {
    return NextResponse.json(
      {
        error: "Active plan required",
        access: { ...before, expiresAt: before.expiresAt?.toISOString() ?? null }
      },
      { status: 403 }
    );
  }

  if (before.planType === "trial" && (before.exportsRemaining ?? 0) <= 0) {
    return NextResponse.json(
      {
        error: "Trial export limit reached",
        access: { ...before, hasAccess: true, exportsRemaining: 0, expiresAt: before.expiresAt?.toISOString() ?? null }
      },
      { status: 403 }
    );
  }

  const access = await consumeExport(session.user.id);
  return NextResponse.json({
    access: { ...access, expiresAt: access.expiresAt?.toISOString() ?? null }
  });
}
