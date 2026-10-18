import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Normalised public-profile lookup for the card generator.
 *
 * Only sources with a documented public API are supported: GitHub's REST API
 * and FxTwitter for X. Instagram, YouTube and LinkedIn are deliberately absent
 * — they have no public API, so fetching them means scraping a logged-out HTML
 * page, which breaks without warning and is blocked outright for Instagram.
 * Those are handled by typing the details in ("Custom"), which always works.
 *
 * Nothing is stored: the handle is used for this request and the result goes
 * straight back to the browser.
 */

type Out = {
  platform: string;
  handle: string;
  name: string;
  bio: string;
  verified: boolean;
  avatarUrl: string | null;
  bannerUrl: string | null;
  stats: { label: string; value: string }[];
};

/** 18432 -> "18.4K", as social sites display counts. */
function compact(n: number | null | undefined): string {
  if (typeof n !== "number" || !Number.isFinite(n)) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1000;
    return (v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)) + "K";
  }
  const v = n / 1_000_000;
  return (v < 10 ? v.toFixed(1).replace(/\.0$/, "") : Math.round(v)) + "M";
}

/** Strip a full URL or leading @ down to the bare handle. */
function cleanHandle(raw: string): string {
  let h = (raw || "").trim();
  h = h.replace(/^https?:\/\/(www\.)?(github\.com|x\.com|twitter\.com)\//i, "");
  h = h.replace(/^@/, "").split(/[/?#]/)[0];
  return h.slice(0, 40);
}

const TIMEOUT_MS = 8000;

async function getJson(url: string, headers: Record<string, string>) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: abort.signal, cache: "no-store" });
    if (!res.ok) return { ok: false as const, status: res.status };
    return { ok: true as const, data: (await res.json()) as unknown };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const platform = (url.searchParams.get("platform") || "").toLowerCase();
  const handle = cleanHandle(url.searchParams.get("handle") || "");

  if (!handle) return NextResponse.json({ error: "Enter a handle." }, { status: 400 });

  try {
    if (platform === "github") {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "User-Agent": "EasyFrame-ProfileCard"
      };
      // Optional: lifts the unauthenticated 60/hour limit to 5,000.
      if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
      const r = await getJson(`https://api.github.com/users/${encodeURIComponent(handle)}`, headers);
      if (!r.ok) {
        return NextResponse.json(
          { error: r.status === 404 ? "No GitHub user with that handle." : "GitHub is rate-limiting or unavailable — try again shortly." },
          { status: r.status === 404 ? 404 : 502 }
        );
      }
      const d = r.data as Record<string, unknown>;
      const out: Out = {
        platform: "github",
        handle: String(d.login ?? handle),
        name: String(d.name || d.login || handle),
        bio: String(d.bio || ""),
        verified: false,
        avatarUrl: d.avatar_url ? String(d.avatar_url) : null,
        bannerUrl: null,
        stats: [
          { label: "Followers", value: compact(d.followers as number) },
          { label: "Following", value: compact(d.following as number) },
          { label: "Repos", value: compact(d.public_repos as number) }
        ]
      };
      return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=3600" } });
    }

    if (platform === "x") {
      const r = await getJson(`https://api.fxtwitter.com/${encodeURIComponent(handle)}`, {
        "User-Agent": "EasyFrame-ProfileCard"
      });
      if (!r.ok) {
        return NextResponse.json(
          { error: r.status === 404 ? "No X account with that handle." : "Couldn't reach X right now — try again shortly." },
          { status: r.status === 404 ? 404 : 502 }
        );
      }
      const body = r.data as { user?: Record<string, unknown> };
      const u = body.user;
      if (!u) return NextResponse.json({ error: "No X account with that handle." }, { status: 404 });
      const out: Out = {
        platform: "x",
        handle: String(u.screen_name ?? handle),
        name: String(u.name || u.screen_name || handle),
        bio: String(u.description || ""),
        verified: Boolean(u.verified),
        avatarUrl: u.avatar_url ? String(u.avatar_url) : null,
        bannerUrl: u.banner_url ? String(u.banner_url) : null,
        stats: [
          { label: "Followers", value: compact(u.followers as number) },
          { label: "Following", value: compact(u.following as number) },
          { label: "Posts", value: compact(u.tweets as number) }
        ]
      };
      return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=3600" } });
    }

    return NextResponse.json({ error: "Pick GitHub or X, or fill the card in by hand." }, { status: 400 });
  } catch (e) {
    console.error("[profile] lookup failed", e instanceof Error ? `${e.name}: ${e.message}` : e);
    return NextResponse.json({ error: "That lookup failed. Try again, or fill the card in by hand." }, { status: 502 });
  }
}
