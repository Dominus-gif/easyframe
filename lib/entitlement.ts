"use client";

import { useEffect, useState } from "react";

// Client-side Premium detection, shared across AdSlots and the editor via a
// module-level cache so we only hit /api/account/premium once per page load.
// Guests (401) resolve to non-premium. Trial/free are treated as non-premium.

let cache: boolean | null = null;
let inflight: Promise<boolean> | null = null;

async function load(): Promise<boolean> {
  if (cache !== null) return cache;
  if (inflight) return inflight;
  inflight = fetch("/api/account/premium", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { premium: false }))
    .then((d: { premium?: boolean }) => {
      cache = Boolean(d.premium);
      return cache;
    })
    .catch(() => {
      cache = false;
      return false;
    });
  return inflight;
}

export function usePremium(): { premium: boolean; ready: boolean } {
  const [state, setState] = useState<{ premium: boolean; ready: boolean }>({
    premium: cache ?? false,
    ready: cache !== null
  });
  useEffect(() => {
    let alive = true;
    load().then((premium) => {
      if (alive) setState({ premium, ready: true });
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function invalidatePremium(): void {
  cache = null;
  inflight = null;
}
