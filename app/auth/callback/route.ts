import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNext } from "@/lib/supabase/config";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Landing point for every emailed link: sign-up confirmation and password
 * reset. Handles both link styles Supabase can send:
 *   ?code=...                      (PKCE, the default templates)
 *   ?token_hash=...&type=...       (custom templates using {{ .TokenHash }})
 * On success the session cookies are set here and the user continues to `next`.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = getServerSupabase();

  if (supabase) {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, url.origin));
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/account?reset=1" : next, url.origin));
    }
  }

  // Expired, already-used, or opened in a different browser than it was requested from.
  return NextResponse.redirect(new URL("/login?error=link", url.origin));
}
