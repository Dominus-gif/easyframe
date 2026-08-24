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

## Enhancement pass 4 — layers, text, remove photo, realistic frames (DONE)

- **Remove photo** — button on the Image card clears the device screenshot.
- **Multi-photo layers + text** — new overlay system (`Overlay`/`ImageOverlay`/`TextOverlay` in
  `lib/editor/compositor.ts`, rendered on top of the composited scene in `drawOverlays`). Editor
  gains a **Layers** card (add Text / add Image, per-layer select / show-hide / reorder / delete)
  and a **selected-layer** controls card; overlays are drag-positioned on the canvas. Verified: text
  renders (2553 white px in the center band), 14 fonts + weight/color/align/size/rotation controls.
- **Text fonts** — `lib/editor/fonts.ts` curates 14 trending families (Inter, Poppins, Montserrat,
  Roboto, DM Sans, Space Grotesk, Playfair Display, Oswald, Bebas Neue, Anton, Archivo Black,
  Lobster, Pacifico, Caveat), loaded on demand from Google Fonts; export awaits `document.fonts.ready`.
- **Realistic frames** — `renderDeviceLayer` now paints a metallic **body gradient** + inner **rim
  light**, and the screen gets a diagonal **glass glare** + inner recess shadow. Verified visually
  (metallic iPhone with glassy screen). NOTE: this is enhanced-procedural realism (glass/metal
  shading), not photoreal device renders — true photorealism would need real device art or a
  WebGL/3D pipeline (offer as a follow-up).

## Enhancement pass 3 — editor UI polish + more mockups (DONE)

- **6 more devices** (12 → 18): iPhone SE, Foldable Phone, E-Reader, Chromebook, Smart TV, Ultrawide
  Monitor. Build now emits 52 pages. Editor picker shows 19 tiles (18 + Blank) across 7 groups.
- **Editor UI polish** (`components/editor/CanvasEditor.tsx`): new app bar with a gradient logo mark +
  brand/tag, undo/redo as a joined icon group, prominent gradient Download; right-and-left rails
  reorganized into titled **cards** (Device / Image / Background / Adjust / 3D angle / Export) for
  clear hierarchy; sliders now show a **filled accent track** (inline gradient by value) with a value
  chip; iOS-style **segmented controls**; refined swatches (hover scale + accent ring), device tiles,
  upload button, zoom pill, and a subtle **dot-grid canvas backdrop** with a soft canvas drop-shadow;
  themed thin scrollbars and focus-visible throughout. Verified via DOM + computed styles (full-page
  screenshots are blocked in the headless pane; canvas output was viewed separately).

## Enhancement pass 2 — Blank/frameless mockup + viewing-angle fixes (DONE)

- **Blank (frameless) device** — new editor-only device (`BLANK_DEVICE`/`editorDevices` in
  `lib/editor/devices.ts`; picker group "No frame"). Renders the pasted/dropped image directly with
  rounded corners (no device shell), then applies background, padding, shadow, and 3D angle. Sizes
  itself to the image aspect (capped 2600px). Excluded from SEO/template pages (editor-only). The
  compositor's `renderDeviceLayer` has a `kind === "blank"` branch; scene rounding is skipped for
  blank (the image itself is rounded). Verified in-browser: iso-tilted Blank renders a correct 3D
  trapezoid with the image uncropped.
- **Viewing-angle / perspective** — the 3D warp was verified CORRECT (rendered a proper perspective
  card; the Perspective slider measurably changes the projection — weak vs strong produced different
  output dimensions). The real complaint was UX: **Perspective does nothing with no tilt applied**
  (mathematically correct, but confusing). Fixes: angle presets now also set a good `perspective`
  value (one click → great 3D), added a hint ("Pick an angle, then fine-tune. Perspective adds depth
  to a tilted view."), a "Reset to flat" button, and slightly stronger preset angles.

## Enhancement pass — more devices, 3D viewing angle, professional theme (DONE)

- **More devices (6 → 12):** added Android Phone, Google Pixel, iPad mini, Surface Laptop, Desktop
  Monitor (new `desktop` kind with stand), and Apple Watch Ultra. Each auto-generates a
  `/templates/[slug]` SEO page (build now emits 46 pages). New devices use a generated fallback
  in `lib/site.ts` `getTemplateCopy()` so every template page has valid copy.
- **True 3D viewing angle:** `lib/editor/compositor.ts` rewritten with an offscreen device layer +
  perspective projection (rotateX/rotateY/rotateZ + `perspective`), warped onto a 16×16
  texture-mapped grid, with an auto-fitting scene and a single clean projected shadow. Flat
  (angles = 0) keeps a crisp fast path. Editor adds a "Viewing angle" panel: 6 presets
  (Front/Left/Right/Look up/Isometric/Tilt) + Tilt/Turn/Roll/Perspective sliders. Verified
  in-browser: applying a tilt reflows the scene and exports a valid 2048px PNG, no console errors.
- **Professional theme:** replaced the violet→pink palette with a **blue/cyan/slate** system
  (`--accent #2f6bff`, gradient `#2f6bff → #22b8e6`) across marketing, editor, ads, consent, OG,
  and legacy pages via a global token replace (0 violet/pink tokens remain). Editor swatches +
  gradient presets recolored to Azure/Ocean/Slate/Emerald/Sunset/Steel.
- **Trade-off:** the device layer renders at natural resolution, so 4K (Premium) exports of tilted
  frames are marginally soft; can add supersampling later if needed.

## Phase 4 — Blog + analytics + compliance + polish (DONE)

- **Blog** — `/blog` index + `/blog/[slug]` (5 posts) statically generated. Posts authored as
  structured content in `lib/blog.ts` with a small block renderer. Each post: per-slug
  title/description/canonical/OG + `BlogPosting` JSON-LD + an in-content AdSlot + CTA. Added to
  nav, footer, sitemap, and robots.
- **Cookie consent** — `components/CookieConsent.tsx` + `lib/consent.ts`. Banner shows until the
  visitor chooses; the AdSense script now loads **only after consent granted** (moved out of
  `layout.tsx`), and `AdSlot` only enters "ad" mode when `consent === "granted"`. Verified
  in-browser: banner shows for new visitors, Accept stores `granted` and dismisses it, ads stay
  empty with no publisher id.
- **Analytics events** (`lib/analytics.ts` + GA4 `G-T208N0Q261`): `template_viewed` (TrackView on
  template pages — verified in dataLayer), `image_uploaded` + `export_completed` (editor),
  `premium_started` (PremiumButtons on /pricing), `premium_purchased` (billing return),
  `ad_impression` / `ad_unfilled` (verified) / `ad_click` (best-effort blur heuristic). In dev
  `gtag` isn't loaded so events fall back to `dataLayer.push`; in prod they reach GA4 debug view.
- **Legal rewrite** — Privacy now discloses browser-only image processing ("processed in your
  browser and never stored"), Google AdSense advertising + cookies, GA4 analytics, and
  consent-gated cookies. Terms now covers Free vs Premium tiers, output licensing (you own your
  exports), advertising, and a 14-day refund policy for one-time Premium. Verified in SSR HTML.
- **Polish** — `prefers-reduced-motion` reset + `:focus-visible` styles added; marketing/editor
  layouts already responsive (mobile breakpoints). Post-purchase now lands on `/editor`.

**DECISION — blog is structured-content, not an MDX toolchain.** The brief said MDX; I authored
posts as typed blocks in `lib/blog.ts` (no `@next/mdx`/`@mdx-js` dependency) for reliability and to
avoid build-toolchain risk right before shipping. Fully SSR + SEO-complete; can migrate to `.mdx`
later without changing routes. **A11y/perf note:** an actual Lighthouse/axe audit wasn't runnable
headless here — the structural signals are in place; confirm on deploy.

## Phase 3 — Ads + Premium (DONE, with documented gaps)

- **`<AdSlot>`** (`components/ads/AdSlot.tsx`) — provider-abstracted (AdSense). Reserves its height
  always, so empty ⇄ ad causes no CLS. Renders empty for Premium users and when
  `NEXT_PUBLIC_ADSENSE_CLIENT` is unset (dev-safe), logging an `ad_unfilled` GA event. AdSense
  script loads from `app/layout.tsx` only when the env var is set. Placements: header + footer on
  the landing, in-content + footer on template pages, footer on categories/pricing (via
  `SiteFooter`). Never in the editor or between upload and download. Verified in-browser: no
  publisher id → two 90px empty reserved slots, no `ins.adsbygoogle`, no script, no CLS.
- **Pricing** rewritten to a **Free vs Premium** comparison using `.mk` styles + SiteNav/SiteFooter.
  Prices from `NEXT_PUBLIC_PREMIUM_MONTHLY` (default 6) / `NEXT_PUBLIC_PREMIUM_LIFETIME` (default 99).
  Two forms POST to the existing `/api/billing/checkout` with `plan=monthly|lifetime` (Dodo).
  Verified: $0 / $6 / $99, "Get Premium — $6/mo" + "Lifetime — $99 once". Old 3-tier paywall retired.
- **Entitlement:** new guest-safe `GET /api/account/premium` (always 200; guest ⇒ `{premium:false}`,
  so no console 401s) + `lib/entitlement.ts` `usePremium()` (module-cached). Editor gates export cap
  to `premium ? 3840 : 2048` and a transparent-background swatch (shows a "PRO" badge + routes free
  users to /pricing). `lib/analytics.ts` added; editor fires `image_uploaded` / `export_completed`.
  Post-checkout redirects now go to `/editor` (was `/studio`).

**Gaps to close (flagged, not silently shipped):**
- **Dodo checkout is plumbed but not E2E-tested here** — it reuses the existing
  `DODO_MONTHLY_CHECKOUT_URL` / `DODO_LIFETIME_CHECKOUT_URL` env config. A real test-mode purchase
  needs the user's Dodo products (priced $6/$99) and test keys. Without a `checkout_url` env set, dev
  falls back to granting access directly (existing behavior).
- **Ad units need real slot ids.** `AdSlot` accepts an `adSlotId` prop but placements pass none yet;
  filling ads requires the user's AdSense publisher id + per-unit slot ids (create ad units in
  AdSense, then thread the ids in). Until then slots stay empty by design.
- **Premium features advertised but not yet built in the new editor:** custom background image
  upload, batch export, and saved projects are listed on /pricing but only ad-free + 4K + transparent
  are implemented so far. These should be built (or the pricing copy trimmed) before charging.
- **"Ad-free verified for a purchased account"** — verified the code path (Premium ⇒ empty slot), not
  with a live purchased session (needs a real Premium account).

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

## Enhancement pass 5 — render sharpness + custom gradients (DONE)
- **Root cause of "blurry text / bad-quality mockups":** the device layer was rendered at its tiny
  natural design units (~460px for a phone) then bitmap-upscaled to fill the export — softening both
  the vector frame and the embedded screenshot. Fix: `renderDeviceLayer(device,img,settings,renderScale)`
  now renders at `renderScale ≈ outScale*1.15` (capped 4×) so vector frames stay razor-sharp and the
  screenshot is sampled at output resolution. `baseDims()` computes design-unit size up front so the
  layer is rendered once per path at the right scale; tilt path scales source coords by `layer.scale`.
- **Preview resolution:** `PREVIEW_MAX_EDGE` 1400 → 2000 so the on-screen canvas isn't CSS-upscaled on
  large/retina displays (measured sharpnessRatio 3.5 = no upscaling). Blank cap 2600 → 3200.
- **Gradients:** `gradientPresets` expanded 6 → 16, plus a **custom gradient builder** in the Background
  card (two color pickers + angle slider → writes `background:{type:"gradient",from,to,angle}`).
- Verified: tsc + next build pass; decoded native-res crop shows crisp text; custom gradient paints the
  canvas; no rail overflow.
