"use client";

import { useEffect, useState } from "react";

/**
 * Client-side Premium detection, shared across AdSlots, the upgrade star and the
 * editor via a module-level cache.
 *
 * The important rule here: a *failed* check means "unknown", never "not
 * premium". Caching a failure as false used to downgrade paying accounts for the
 * rest of the page load — hiding 4K export and showing them an upgrade prompt —
 * because one blip (cold database, dropped request, expired cookie mid-refresh)
 * was indistinguishable from a genuine free account. So failures are retried,
 * only successful answers are cached, and `ready` stays false until we actually
 * know. Callers gate "you are free" UI on `ready`.
 */

type Known = { premium: boolean; at: number };

let cache: Known | null = null;
let inflight: Promise<Known | null> | null = null;
const listeners = new Set<(v: Known | null) => void>();

/** Re-check this often so a purchase made in another tab is picked up. */
const TTL_MS = 60_000;
const RETRY_DELAYS = [600, 1800, 4000];

function publish(value: Known | null) {
  cache = value;
  listeners.forEach((fn) => fn(value));
}

async function fetchOnce(): Promise<Known | null> {
  try {
    const res = await fetch("/api/account/premium", { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return null; // server trouble: unknown, not "free"
    const data = (await res.json()) as { premium?: boolean; known?: boolean };
    // `known: false` is the server telling us it couldn't determine entitlement.
    if (data?.known === false) return null;
    return { premium: Boolean(data?.premium), at: Date.now() };
  } catch {
    return null;
  }
}

async function load(force = false): Promise<Known | null> {
  if (!force && cache && Date.now() - cache.at < TTL_MS) return cache;
  if (inflight) return inflight;

  inflight = (async () => {
    for (let attempt = 0; ; attempt++) {
      const result = await fetchOnce();
      if (result) {
        publish(result);
        return result;
      }
      if (attempt >= RETRY_DELAYS.length) return null; // stay "unknown"
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function usePremium(): { premium: boolean; ready: boolean; refresh: () => void } {
  const [state, setState] = useState<{ premium: boolean; ready: boolean }>({
    premium: cache?.premium ?? false,
    ready: cache !== null
  });

  useEffect(() => {
    let alive = true;
    const apply = (v: Known | null) => {
      if (alive && v) setState({ premium: v.premium, ready: true });
    };
    listeners.add(apply);
    void load().then(apply);

    // Coming back to the tab is the usual moment entitlement has changed —
    // after paying in the Dodo window, or signing in elsewhere.
    const onFocus = () => {
      if (document.visibilityState === "visible") void load().then(apply);
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      listeners.delete(apply);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return { ...state, refresh: () => void load(true) };
}

export function invalidatePremium(): void {
  publish(null);
  inflight = null;
}
