// Public Supabase settings. Both values are safe to ship to the browser: the
// anon/publishable key only grants what Row Level Security and Auth allow.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Only allow same-site relative redirects (blocks `//evil.com` and absolute URLs). */
export function safeNext(value: string | null | undefined, fallback = "/editor"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
