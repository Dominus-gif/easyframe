"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { invalidatePremium } from "@/lib/entitlement";

export type ClientSession = {
  user: { id: string; email: string | null; name: string | null; image: string | null };
};

function toSession(user: User | null): ClientSession | null {
  if (!user) return null;
  const meta = user.user_metadata ?? {};
  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      name: (meta.name as string | undefined) ?? (meta.full_name as string | undefined) ?? null,
      image: (meta.avatar_url as string | undefined) ?? null
    }
  };
}

/**
 * Client-side auth state, shaped like next-auth's `useSession()` so existing
 * components keep working: `{ data, status }`.
 */
export function useAppSession(): { data: ClientSession | null; status: "loading" | "authenticated" | "unauthenticated" } {
  const [state, setState] = useState<{ data: ClientSession | null; status: "loading" | "authenticated" | "unauthenticated" }>({
    data: null,
    status: "loading"
  });

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setState({ data: null, status: "unauthenticated" });
      return;
    }
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      const session = toSession(data.user);
      setState({ data: session, status: session ? "authenticated" : "unauthenticated" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      const session = toSession(s?.user ?? null);
      setState({ data: session, status: session ? "authenticated" : "unauthenticated" });
      invalidatePremium();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

/** Sign out everywhere this browser is signed in, then navigate. */
export async function signOutApp(options: { callbackUrl?: string } = {}) {
  const supabase = getBrowserSupabase();
  await supabase?.auth.signOut();
  invalidatePremium();
  window.location.href = options.callbackUrl ?? "/";
}
