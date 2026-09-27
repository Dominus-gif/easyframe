import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/config";

/**
 * Supabase client for route handlers and server components, reading the
 * session from request cookies. Server components can't write cookies, so
 * token refreshes there are ignored; middleware and route handlers persist them.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  const store = cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a server component: cookies are read-only there */
        }
      }
    }
  });
}
