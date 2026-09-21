# Cloudflare migration — EasyFrame

Moves the app off Vercel onto **Cloudflare Workers** using
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), with the existing
production Postgres reached through **Hyperdrive**.

The code side is done and verified locally against the real `workerd` runtime.
What remains needs *your* credentials, so it's listed under "Your steps" below.

---

## What changed

| Area | Before (Vercel) | After (Cloudflare Workers) |
| --- | --- | --- |
| Host | Vercel | Workers + static assets binding |
| Adapter | — | `@opennextjs/cloudflare@1.15.1` (last line supporting Next 14) |
| Database | Prisma → Postgres directly | Prisma → **Hyperdrive** via `@prisma/adapter-pg` |
| OG images | 4 dynamic `opengraph-image.tsx` (edge runtime) | 4 **static PNGs** in `public/og/` |
| Analytics | `@vercel/analytics` + `@vercel/speed-insights` | removed (Google Analytics kept) |

### Why the adapter is pinned to 1.15.1
`@opennextjs/cloudflare@1.16+` requires Next 15/16. Upgrading Next 14→15 would
force React 19, which `@react-three/fiber@8` / `@react-three/drei@9` don't
support (and NextAuth v4 is rocky on React 19). `1.15.1` explicitly peers
`next@^14.2.35` — exactly our version. Revisit when we upgrade Next.

### Why OG images became static
OpenNext **cannot bundle `runtime = "edge"` routes**, but `next/og`'s Node build
crashes on Windows during prerender (`fileURLToPath` → `Invalid URL`). Static
PNGs sidestep both and are strictly better on Workers — served from the edge
with no runtime WASM. Regenerate with `npm run og:generate`
(`scripts/generate-og.mjs`).

> Trade-off: blog posts and template pages now share one OG image per section
> instead of a per-slug image. Easy to extend in the generator if we want
> per-slug cards back.

### How Prisma talks to Hyperdrive
`lib/prisma.ts` exports a **lazy proxy**. On Workers the Hyperdrive binding only
exists *during a request*, and Workers forbids reusing a socket opened by a
previous request — so the client is built on first use and cached per request
(`WeakMap` keyed on the request env). Locally it falls back to the normal
`DATABASE_URL` client. All call sites still just use `prisma.user.findUnique(...)`.

---

## Your steps

### 1. Create the Hyperdrive config (needs your prod Postgres URL)

Run this yourself so the connection string never leaves your machine:

```bash
npx wrangler hyperdrive create easyframe-db --connection-string="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
```

Copy the returned **id** into `wrangler.jsonc`, replacing
`REPLACE_WITH_HYPERDRIVE_ID`.

### 2. Set runtime secrets

These are read at request time and belong in Cloudflare (never in git):

```bash
npx wrangler secret put NEXTAUTH_SECRET
npx wrangler secret put NEXTAUTH_URL            # https://www.easyframe.app
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put DODO_API_KEY
npx wrangler secret put DODO_WEBHOOK_SECRET
npx wrangler secret put DODO_MONTHLY_PRODUCT_ID
npx wrangler secret put DODO_YEARLY_PRODUCT_ID
npx wrangler secret put DODO_LIFETIME_PRODUCT_ID
npx wrangler secret put DODO_MONTHLY_CHECKOUT_URL
npx wrangler secret put DODO_LIFETIME_CHECKOUT_URL
npx wrangler secret put DATABASE_URL            # optional fallback; Hyperdrive is preferred
```

**`NEXT_PUBLIC_*` vars are different** — Next inlines them at *build* time, so
they must be present in the shell/CI when you run the build, not as secrets:

```
NEXT_PUBLIC_ADSENSE_CLIENT
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_PREMIUM_MONTHLY
NEXT_PUBLIC_PREMIUM_LIFETIME
```

Keep them in `.env.local` (gitignored) for local builds.

### 3. Deploy

```bash
npm run cf:deploy
```

### 4. Point the domain at the Worker

Once the apex nameserver migration finishes, add custom domains to the Worker
(dashboard → Workers → easyframe → Settings → Domains & Routes), or in
`wrangler.jsonc`:

```jsonc
"routes": [
  { "pattern": "www.easyframe.app", "custom_domain": true },
  { "pattern": "easyframe.app",     "custom_domain": true }
]
```

`next.config.mjs` already 308-redirects apex → `www`, so both can point here.

### 5. Post-deploy checklist

- **Google OAuth** — add `https://www.easyframe.app/api/auth/callback/google` to
  the authorized redirect URIs (should already be there if the domain is unchanged).
- **Dodo webhook** — confirm it points at `https://www.easyframe.app/api/dodo/webhook`.
- Hit `/api/diagnostics/env` to confirm the Worker sees the DB + auth config.
- Verify sign-in, a checkout, and a webhook delivery end-to-end.
- Turn off the Vercel deployment only after the above passes.

---

## Local development

`next dev` is unchanged (`npm run dev`) and still uses `DATABASE_URL`.

To exercise the Workers runtime locally:

```bash
npm run cf:preview
```

Hyperdrive needs a local Postgres to emulate against:

```bash
export CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE="postgresql://user:pass@127.0.0.1:5432/easyframe"
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run cf:build` | Next build + OpenNext Worker bundle |
| `npm run cf:preview` | Build, then run the Worker in `workerd` |
| `npm run cf:deploy` | Build, then deploy to Cloudflare |
| `npm run cf:typegen` | Generate `cloudflare-env.d.ts` from bindings |
| `npm run og:generate` | Regenerate the static OG images |

## Verified locally

Built and run under `workerd` (`wrangler dev`): `/`, `/editor`, `/templates`,
`/pricing`, `/privacy`, `/blog`, `/iphone-mockups`, `/og/default.png`,
`/robots.txt`, `/sitemap.xml` all returned 200 with correct content types;
middleware redirect `/Terms` → 308 → `/terms` works; `/api/mockups/devices`
returned 200. Database-backed routes were not exercised (no Hyperdrive id yet).
