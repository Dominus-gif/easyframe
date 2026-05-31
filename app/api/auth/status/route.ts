import { NextResponse } from "next/server";
import { isGoogleAuthConfigured } from "@/lib/auth/options";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    google: isGoogleAuthConfigured()
  });
}
