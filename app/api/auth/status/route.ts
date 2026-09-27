import { NextResponse } from "next/server";
import { supabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ supabase: supabaseConfigured });
}
