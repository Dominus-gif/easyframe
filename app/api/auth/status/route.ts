import { NextResponse } from "next/server";
import { isGoogleAuthConfigured } from "@/lib/auth/options";

export function GET() {
  return NextResponse.json({
    google: isGoogleAuthConfigured
  });
}
