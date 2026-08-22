# DECISIONS.md — EasyFrame Freemium + Ad-Monetized Overhaul

A running log of decisions made while executing the overhaul brief, plus corrections
to premises in the brief that did not match the actual codebase. Newest phase on top.

---

## Corrections to the brief's "Verified Current State"

The brief said "do not re-verify," but three premises were checked and are **wrong or
incomplete**. Building on them blindly would produce broken work, so they are corrected here:

1. **Payments are Dodo Payments, NOT Stripe.** There is no Stripe integration anywhere in the
   repo. Checkout runs through Dodo (`app/api/dodo/webhook/route.ts`, `app/api/billing/checkout`,
   `app/api/billing/confirm`, `lib` Dodo helpers). **Decision:** Premium checkout reuses the
   existing **Dodo** infrastructure. Wherever the brief says "Stripe," read "Dodo." No new
   payment dependency is added.

2. **The `/Terms` + `/Privacy` loop is real, and root-caused.** Cause: Next.js `redirects()`
   `source` matching is **case-insensitive**, so the old rule `"/terms" -> "/Terms"` also matched
   `/Terms` and redirected it to itself → infinite 308. **Fix (shipped in Phase 0):** routes
   renamed to lowercase (`app/terms`, `app/privacy`); the case redirects removed from
   `next.config.mjs`; legacy capitalized URLs handled by an exact-string 308 in `middleware.ts`
   (loop-safe). Verified: `/terms` & `/privacy` = 200 (0 hops); `/Terms` & `/Privacy` = 1 hop → 200.

3. **The editor is NOT a Canvas compositing engine today.** The existing editor
   (`components/MockupStudio.tsx`, ~10.4k lines) composites via **DOM + `html-to-image`**, and
   device frames are **CSS-drawn**, not static PNG/SVG mask assets. The brief's Section 4 mandates
   client-side **Canvas API** compositing with static frame assets. That is effectively a
   **from-scratch editor engine**, not an adaptation of the current one. See Phase 1 decision below.

Also confirmed true from the brief: the homepage IS a client-only "Loading experience" shell
(bad for crawlers — Section 5.2 rebuild needed); GA4 `G-T208N0Q261` is wired via
`components/AppAnalytics.tsx`; brand assets live under `public/brand/`.

## Strategic-direction note (flagged, not silently executed)

This brief **reverses** the product direction set earlier in this project (a paywalled,
marketer-first tool with a Midnight-Studio redesign and $4/mo + $80 lifetime plans — see the
project memory roadmap). The new direction is **free + ad-supported, no account for core use**,
retiring the trial/monthly/lifetime plans for a Free-vs-Premium ($6/mo, $99 lifetime) model.
Proceeding per the brief, but this is a business-model change: the plan retirement and the
editor rebuild are the irreversible steps and should be confirmed before execution.

---

## Phase 2 — Template library + SEO + server-rendered homepage (DONE)

New routes (all server-rendered): `/` (rebuilt landing), `/editor` (now accepts `?device=slug`),
`/templates` (index), `/templates/[slug]` (6 device pages via `generateStaticParams` +
per-slug `generateMetadata` + `SoftwareApplication` JSON-LD + per-template OG image), and 4
category pages (`/iphone-mockups`, `/laptop-mockups`, `/tablet-mockups`, `/browser-mockups`).
Shared pieces: `lib/site.ts` (copy/FAQ/how-it-works/category defs), `components/site/*`
(SiteNav, SiteFooter, Landing, CategoryView, JsonLd), and a marketing CSS layer + design tokens
in `app/globals.css`. Sitemap regenerated from the route set (16 URLs); robots allows them.

Verified via raw SSR HTML (dev server curl): homepage title + H1 in HTML with NO "Loading
experience" shell (the old client gate is gone), FAQ JSON-LD present; `/templates/iphone-mockup`
has H1 "Free iPhone Mockup Generator", correct canonical, `SoftwareApplication` JSON-LD, a 154-word
unique description, and `og:image`; category pages 200 with correct H1s. `next build` green — 33
pages generated. Global accent tokens unified to Midnight violet→pink (`--accent-gradient`), which
also re-tints pricing/login/legal for consistency.

- **Lighthouse note:** the SEO-audited signals (title, meta description, canonical, crawlable
  links, valid H1, robots not blocking, structured data) are all present in SSR HTML, which should
  clear the ≥90 SEO bar. An actual Lighthouse run wasn't possible in this headless environment;
  worth confirming on a real deploy.
- **DECISION — hero + sample gallery are lightweight, not a live/rendered demo.** The brief
  suggested "hero with live demo" and "3–6 rendered examples." I used a text-first hero + decorative
  CSS device silhouettes and gradient sample tiles (with descriptive `aria-label`s) instead, to keep
  the landing fully server-rendered and protect LCP < 2.5s (no heavy hero image or client canvas on
  first paint). Real rendered samples can be added later as a client island or pre-generated images.
- **`components/EasyFrameHome.tsx` is now unused** (homepage renders `components/site/Landing.tsx`).
  Left in place for reference; safe to delete later.

## Phase 1 — Free Canvas editor MVP (DONE)

New public route `/editor` (no auth, guest-first). Files: `app/editor/page.tsx` (server shell +
metadata), `components/editor/EditorClient.tsx` (code-splits the engine via `next/dynamic`,
`ssr:false`), `components/editor/CanvasEditor.tsx` (UI), `lib/editor/devices.ts` (6 launch
devices), `lib/editor/compositor.ts` (Canvas engine + export).

Verified in browser: upload (file/URL/paste/drag-drop) → composite into the device screen region
→ switch device → export. Confirmed a red test image lands in the screen (center pixel 255,0,0),
device switch reflows aspect (iPhone 858×1400 → MacBook 1400×1033), and Download produces a valid
**2048×1512 PNG** (longest edge = free cap 2048), all client-side, no console errors. `next build`
green; `/editor` ships **1.3 kB** initial JS (engine in a dynamic chunk).

- **DEVIATION — device frames are drawn procedurally on the client, not loaded as static PNG/SVG
  assets.** The brief's Section 4 says "device frames are static assets … no per-request rendering
  on the server." The *intent* (no server-side/per-request frame rendering; scalable, CDN-cheap) is
  fully satisfied: all frame drawing happens in `lib/editor/compositor.ts` on the client via Canvas
  2D. Procedural frames were chosen for the MVP because (a) no real device art exists in the repo,
  (b) it avoids async asset-load races in the export path, and (c) the `Device` registry interface
  can later point at `public/frames/*.svg` without changing the compositor's callers. Revisit when
  higher-fidelity (photoreal) frames are desired.
- **Free vs Premium gating (partial):** export capped at 2048px (`FREE_MAX_EDGE`); transparent
  background and 4K are labeled Premium in the UI but full entitlement enforcement lands in Phase 3
  with the Dodo-backed Premium tier.
- **Undo/redo** uses coalesced 500ms snapshots (one history step per settling interaction) rather
  than per-event snapshots, to avoid flooding history during slider drags.

## Phase 0 — Audit + legal fix (DONE)

- **Legal loop fixed** (see correction #2). Canonical legal URLs are now lowercase.
- **Decision — lowercase canonical URLs** for `/terms`, `/privacy` (and going forward all new
  routes): conventional, AdSense/crawler-friendly, and it structurally avoids the
  case-insensitive-redirect footgun. `middleware.ts` carries a one-line comment warning against
  re-introducing case-only `redirects()` rules.
- **Decision — legal content rewrite deferred to Phase 3/4**, when the freemium model is built:
  the Privacy Policy must then disclose display advertising, analytics cookies, and
  "images are processed in your browser and never stored"; Terms must cover Free/Premium tiers,
  export licensing (user owns output), and Premium refund policy. Doing this now would hard-code
  claims about a model not yet implemented.

## Decisions reserved for upcoming phases (recorded now to avoid stalling later)

- **Phase 1 editor:** build a new client-side Canvas engine at a new route (proposed `/editor`,
  code-split), leaving the current `/studio` intact during migration rather than rewriting the
  10.4k-line monolith in place. The free public tool becomes the Canvas editor; the legacy studio
  can be retired or folded into Premium once parity is reached. (Confirm before starting.)
- **Premium pricing via env:** `NEXT_PUBLIC_PREMIUM_MONTHLY` (default `6`) and
  `NEXT_PUBLIC_PREMIUM_LIFETIME` (default `99`), so price copy is env-configurable per the brief.
- **AdSense via env:** `NEXT_PUBLIC_ADSENSE_CLIENT` (publisher id). When unset, `<AdSlot>` renders
  an equal-height empty box and logs a dev event — local/dev builds work without ads, no CLS.
- **Ad placements:** header leaderboard, one in-content unit on template pages below the editor,
  footer unit. Never inside the canvas, never between upload and download. Premium renders the
  same-height empty slot (no layout shift).
