// Generates the static Open Graph images served from /public/og.
//
// These used to be dynamic `opengraph-image.tsx` routes using next/og, but that
// path is unusable here: OpenNext/Cloudflare rejects the edge runtime, and
// next/og's Node build crashes on Windows during prerender. Static PNGs are
// also strictly better on Workers — they're served from the edge with no
// runtime WASM. Re-run with `npm run og:generate` after changing copy.

import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "og");

const BG = "#100E0E";
const CREAM = "#FDFFF0";
const MUTED = "#969692";
const ACCENT = "#FF0055";
const PANEL = "#181616";

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** 1200x630 card: eyebrow pill, two-line headline with an accent word, footer. */
function svg({ eyebrow, line1, line2, accent, footer }) {
  const accentTspan = accent
    ? `<tspan fill="${ACCENT}">${esc(accent)}</tspan>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="-10%" r="80%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.18"/>
      <stop offset="60%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="${BG}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- eyebrow pill -->
  <rect x="80" y="86" rx="19" ry="19" width="${Math.max(150, eyebrow.length * 13 + 44)}" height="38"
        fill="${PANEL}" stroke="#262323" stroke-width="1"/>
  <text x="${80 + 22}" y="111" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="17" font-weight="500" fill="#C9C9C2">${esc(eyebrow)}</text>

  <!-- headline -->
  <text x="80" y="268" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="82" font-weight="600" fill="${CREAM}" letter-spacing="-2.6">${esc(line1)}</text>
  <text x="80" y="366" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="82" font-weight="600" fill="${CREAM}" letter-spacing="-2.6">${esc(line2)} ${accentTspan}</text>

  <!-- footer -->
  <text x="80" y="470" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="27" font-weight="400" fill="${MUTED}">${esc(footer)}</text>

  <!-- wordmark -->
  <rect x="80" y="528" width="30" height="30" rx="9" fill="${CREAM}"/>
  <text x="124" y="551" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="25" font-weight="600" fill="${CREAM}" letter-spacing="-0.6">EasyFrame</text>
  <circle cx="272" cy="543" r="4" fill="${ACCENT}"/>
  <text x="292" y="551" font-family="Inter, Segoe UI, Helvetica, Arial, sans-serif"
        font-size="20" font-weight="400" fill="${MUTED}">easyframe.app</text>
</svg>`;
}

const cards = {
  default: {
    eyebrow: "Free device mockup generator",
    line1: "Make your app look",
    line2: "stunning —",
    accent: "no designer",
    footer: "Drop in a screenshot, get a realistic device mockup in seconds."
  },
  editor: {
    eyebrow: "EasyFrame Editor",
    line1: "Frame any screenshot",
    line2: "right in your",
    accent: "browser",
    footer: "iPhone, iPad, MacBook, Android and browser frames. No sign-up."
  },
  templates: {
    eyebrow: "Templates",
    line1: "Free mockup",
    line2: "templates for",
    accent: "every device",
    footer: "Pick a device, drop your screenshot, export a share-ready shot."
  },
  blog: {
    eyebrow: "EasyFrame Blog",
    line1: "Mockups, design",
    line2: "and launch",
    accent: "tips",
    footer: "Practical guides for shipping better product visuals."
  }
};

mkdirSync(outDir, { recursive: true });

for (const [name, card] of Object.entries(cards)) {
  const resvg = new Resvg(svg(card), {
    fitTo: { mode: "width", value: 1200 },
    font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" }
  });
  const png = resvg.render().asPng();
  const file = resolve(outDir, `${name}.png`);
  writeFileSync(file, png);
  console.log(`og: ${name}.png  ${(png.length / 1024).toFixed(1)} KB`);
}

console.log(`\nWrote ${Object.keys(cards).length} images to public/og/`);
