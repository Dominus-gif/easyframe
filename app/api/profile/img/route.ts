import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Same-origin image proxy for profile avatars and banners.
 *
 * Canvas taints on cross-origin images, which would make the exported PNG
 * unreadable, so these have to be served from our own origin.
 *
 * It is NOT a general proxy. Only the exact image CDNs behind the supported
 * platforms are allowed, over https, and only responses that really are images
 * are passed through — otherwise this would be an open relay usable to probe
 * private addresses from the Worker.
 */
const ALLOWED_HOSTS = new Set([
  "avatars.githubusercontent.com",
  "pbs.twimg.com",
  "abs.twimg.com"
]);

const MAX_BYTES = 8 * 1024 * 1024;

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("url") || "";

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Bad url" }, { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 8000);
  try {
    const upstream = await fetch(target.toString(), {
      signal: abort.signal,
      redirect: "follow",
      headers: { "User-Agent": "EasyFrame-ProfileCard", Accept: "image/*" }
    });
    if (!upstream.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });

    const type = upstream.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 415 });

    const length = Number(upstream.headers.get("content-length") || 0);
    if (length && length > MAX_BYTES) return NextResponse.json({ error: "Image too large" }, { status: 413 });

    const buf = await upstream.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: "Image too large" }, { status: 413 });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=3600",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (e) {
    console.error("[profile/img] proxy failed", e instanceof Error ? `${e.name}: ${e.message}` : e);
    return NextResponse.json({ error: "Could not load image" }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
