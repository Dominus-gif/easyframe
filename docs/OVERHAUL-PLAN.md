# EasyFrame Overhaul — Architecture Plan (where each new piece lives)

Companion to `/DECISIONS.md`. Maps every brief deliverable to a concrete location in the repo.
Stack stays **Next.js 14 App Router + React + styled-jsx** (no new CSS framework). New shared
primitives go under `components/`, `lib/`, and design tokens in `app/globals.css`.

## Design tokens (Section 6)
- `app/globals.css` — add a `:root` token block: color, type scale, spacing, radii. Reused across
  landing, editor, template pages, pricing, blog. (Midnight palette already partly exists via
  `components/MidnightTheme.tsx` — promote its `--ef-*` values into shared tokens.)

## Phase 1 — Free editor (Canvas engine, Section 5.1)
- `app/editor/page.tsx` — new server shell; renders the editor client island (code-split).
- `components/editor/CanvasEditor.tsx` — client, `dynamic(() => …, { ssr:false })`, the only heavy
  chunk on this route.
- `lib/editor/compositor.ts` — Canvas/OffscreenCanvas compositing (image → screen mask → shadow →
  background → corner radius). No server round-trip.
- `lib/editor/devices.ts` — device registry: `{ slug, name, frameAsset, screenMask, shadow }` for
  iPhone, iPad, MacBook, Android tablet, browser window, smartwatch.
- `public/frames/*` — static device shell PNG/SVG + mask layers (CDN-served).
- `lib/editor/history.ts` — undo/redo stack; `lib/editor/exports.ts` — PNG/JPEG/WebP encode with
  the Free 2048px / Premium 3840px cap and auto filename from template slug.
- Input: drag-drop, file picker, clipboard paste, URL import; 20MP guard + safe client downscale.

## Phase 2 — Template library + SEO + homepage (Section 5.2)
- `app/templates/[slug]/page.tsx` — per-device SEO page: H1 search phrase, 150–200w copy, 3–6
  sample gallery, per-template OG via `app/templates/[slug]/opengraph-image.tsx`, JSON-LD
  (SoftwareApplication/Product) via a `<Schema>` component.
- `app/(categories)/iphone-mockups`, `/laptop-mockups`, `/tablet-mockups`, `/browser-mockups` —
  category index pages.
- `app/page.tsx` + `components/EasyFrameHome.tsx` — **convert to server-rendered** landing (hero
  demo, 3-step "how it works", template grid, FAQ). Remove the client-only loading-shell gate so
  crawlers get real HTML.
- `app/sitemap.ts` — regenerate from the full route set (home, editor, all templates, categories,
  pricing, terms, privacy, blog posts).

## Phase 3 — Ads + Premium (Sections 5.3, 3)
- `components/AdSlot.tsx` — provider-abstracted slot; AdSense via `NEXT_PUBLIC_ADSENSE_CLIENT`;
  empty equal-height box + logged event when unset or when user is Premium (no CLS).
- `app/pricing/page.tsx` — replace 3-tier paywall with a **Free vs Premium** comparison
  ($6/mo, $99 one-time from env). Retire trial/monthly/lifetime copy.
- Premium checkout reuses **Dodo** (`app/api/billing/checkout`, `/confirm`, `app/api/dodo/webhook`)
  — repriced to the two Premium SKUs; entitlement flips ads off + unlocks 4K/transparent/uploads/
  batch/saved projects.
- Account creation only at "buy Premium" or "save project" (guest-first everywhere else).

## Phase 4 — Blog + analytics + compliance (Sections 5.4, 5.5, 5.6)
- `app/blog/[slug]/page.tsx` + `content/blog/*.mdx` — 5 launch posts (MDX). Add `@next/mdx`
  (justified: only new dep; standard, no runtime bloat).
- `components/CookieConsent.tsx` — lightweight banner gating ad + analytics scripts until consent
  (no heavy CMP).
- Legal rewrite in `app/terms/page.tsx` + `app/privacy/page.tsx` content (ads/analytics/
  browser-only image handling; export licensing; Premium refund policy).
- `lib/analytics.ts` — typed GA4 events: `template_viewed`, `image_uploaded`, `export_completed`
  (template+format, no image data), `ad_impression`, `ad_click`, `premium_started`,
  `premium_purchased`. Keep `G-T208N0Q261`.

## Guardrails honored
- Client-only image processing; no uploads to server (except Premium saved-project storage,
  encrypted at rest, account-scoped).
- Canonical `https://www.easyframe.app`; GA wiring preserved.
- Per-phase `next build` green + browser-verified before moving on.
