// Generates the marketing-site background images (soft pastel glows, the
// final-CTA aurora, tinted card fields) and the sample app screen shown in the
// homepage product window. Everything is drawn here as SVG -> PNG (resvg) ->
// WebP (sharp), so the site ships original art with no third-party images.
//
//   node scripts/generate-backgrounds.mjs
//
// Output: public/bg/*.webp, public/showcase/*.webp

import { mkdirSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

mkdirSync("public/bg", { recursive: true });
mkdirSync("public/showcase", { recursive: true });

const grain = (opacity) => `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="table" tableValues="0 ${opacity}"/></feComponentTransfer>
  </filter>`;

/** Blurred colour blobs on a base colour, optional grain. */
function glow({ w, h, base, blur, blobs, grainOpacity = 0.05, fadeTop = 0 }) {
  const ellipses = blobs
    .map(([cx, cy, rx, ry, color, op = 1]) =>
      `<ellipse cx="${cx * w}" cy="${cy * h}" rx="${rx * w}" ry="${ry * h}" fill="${color}" fill-opacity="${op}"/>`)
    .join("");
  const fade = fadeTop
    ? `<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${base}" stop-opacity="1"/>
         <stop offset="${fadeTop}" stop-color="${base}" stop-opacity="0"/>
       </linearGradient>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>
      ${grain(grainOpacity)}
      ${fade}
    </defs>
    <rect width="100%" height="100%" fill="${base}"/>
    <g filter="url(#b)">${ellipses}</g>
    ${fadeTop ? `<rect width="100%" height="100%" fill="url(#fade)"/>` : ""}
    <rect width="100%" height="100%" filter="url(#grain)"/>
  </svg>`;
}

async function out(svg, file, quality = 82) {
  const png = new Resvg(svg, { fitTo: { mode: "original" } }).render().asPng();
  await sharp(png).webp({ quality, effort: 6 }).toFile(file);
  console.log("wrote", file);
}

const BASE = "#F8F8F8";

// 1. Hero glow — pastel aurora rising behind the product window.
await out(glow({
  w: 2400, h: 1500, base: BASE, blur: 150, fadeTop: 0.42,
  blobs: [
    [0.16, 0.78, 0.22, 0.2, "#7DB3FF", 0.95],
    [0.42, 0.66, 0.2, 0.17, "#A9C8FF", 0.9],
    [0.62, 0.72, 0.2, 0.18, "#B3A6FF", 0.9],
    [0.86, 0.7, 0.18, 0.2, "#FFA9D9", 0.9],
    [0.96, 0.95, 0.16, 0.14, "#FFCB9A", 0.8],
    [0.04, 1.0, 0.16, 0.14, "#8FE3F0", 0.7]
  ]
}), "public/bg/hero-glow.webp");

// 2. Section wash — very soft blue/lilac field for alternating bands.
await out(glow({
  w: 2400, h: 1200, base: BASE, blur: 190, grainOpacity: 0.035,
  blobs: [
    [0.12, 0.3, 0.24, 0.3, "#DCE8FF", 1],
    [0.88, 0.55, 0.26, 0.32, "#EADFFF", 1],
    [0.5, 1.0, 0.3, 0.2, "#E3F1FF", 1]
  ]
}), "public/bg/section-wash.webp");

// 3. Final-CTA aurora — saturated, sits behind a frosted glass card.
await out(glow({
  w: 2400, h: 1300, base: BASE, blur: 120, grainOpacity: 0.06,
  blobs: [
    [0.22, 0.55, 0.2, 0.3, "#2F6BFF", 0.95],
    [0.42, 0.4, 0.16, 0.24, "#7C6CFF", 0.9],
    [0.62, 0.62, 0.17, 0.26, "#FF6FB8", 0.9],
    [0.8, 0.42, 0.15, 0.24, "#FFB257", 0.9],
    [0.5, 0.85, 0.2, 0.14, "#5FD4FF", 0.8]
  ]
}), "public/bg/cta-aurora.webp");

// 4. Card fields — tinted squares behind feature visuals.
const cards = {
  blue: ["#E7EFFF", [[0.2, 0.2, 0.5, 0.45, "#C9DBFF"], [0.9, 0.9, 0.5, 0.45, "#D9E4FF"], [0.8, 0.1, 0.3, 0.3, "#F1F5FF"]]],
  lilac: ["#EFEAFF", [[0.15, 0.85, 0.5, 0.45, "#DCD2FF"], [0.9, 0.2, 0.45, 0.45, "#E9E2FF"], [0.5, 0.5, 0.2, 0.2, "#F6F2FF"]]],
  peach: ["#FFF0E8", [[0.85, 0.85, 0.5, 0.45, "#FFD9C4"], [0.1, 0.15, 0.45, 0.45, "#FFE7F1"], [0.5, 0.5, 0.2, 0.2, "#FFF7F2"]]]
};
for (const [name, [base, blobs]] of Object.entries(cards)) {
  await out(glow({ w: 1200, h: 1200, base, blur: 140, grainOpacity: 0.04, blobs }), `public/bg/card-${name}.webp`);
}

// 5. Canvas mesh — the gradient an EasyFrame mockup sits on inside the hero window.
await out(glow({
  w: 1600, h: 1000, base: "#C7D7FF", blur: 110, grainOpacity: 0.07,
  blobs: [
    [0.1, 0.15, 0.35, 0.4, "#8FB4FF"],
    [0.85, 0.2, 0.3, 0.4, "#D6B8FF"],
    [0.75, 0.9, 0.35, 0.35, "#FFB8D9"],
    [0.2, 0.9, 0.3, 0.3, "#A8E6FF"]
  ]
}), "public/showcase/canvas-mesh.webp", 86);

// 6. Sample app screen (fictional "Tempo" habit app) — the screenshot being framed.
const W = 780, H = 1688;
const bars = [0.42, 0.66, 0.55, 0.9, 0.72, 0.38, 0.6];
const days = ["M", "T", "W", "T", "F", "S", "S"];
const habits = [
  ["Morning run", "5.2 km · 28 min", "#2F6BFF", true],
  ["Read 20 pages", "Chapter 7", "#7C6CFF", true],
  ["Drink water", "6 of 8 glasses", "#1FB5E8", false],
  ["Meditate", "10 min", "#FF6FB8", false]
];
const font = `font-family="Inter, 'Segoe UI', Arial, sans-serif"`;
const appSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ${font}>
  <defs>
    <linearGradient id="hero" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1753FE"/><stop offset="1" stop-color="#6A5CFF"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#F6F7FB"/>
  <text x="64" y="92" font-size="30" font-weight="600" fill="#0A0A0A">9:41</text>
  <rect x="640" y="70" width="60" height="26" rx="7" fill="none" stroke="#0A0A0A" stroke-width="3"/>
  <rect x="646" y="76" width="40" height="14" rx="3" fill="#0A0A0A"/>
  <text x="56" y="222" font-size="30" fill="#6B7485">Thursday, 14 March</text>
  <text x="56" y="290" font-size="60" font-weight="700" fill="#0A0A0A" letter-spacing="-1.5">Good morning</text>
  <circle cx="700" cy="262" r="40" fill="#E4E9F6"/>
  <text x="700" y="274" font-size="32" font-weight="700" fill="#1753FE" text-anchor="middle">M</text>

  <rect x="40" y="350" width="700" height="360" rx="44" fill="url(#hero)"/>
  <text x="92" y="432" font-size="30" fill="#FFFFFF" fill-opacity=".8">Today's streak</text>
  <text x="92" y="532" font-size="104" font-weight="700" fill="#FFFFFF" letter-spacing="-3">12</text>
  <text x="232" y="532" font-size="40" font-weight="600" fill="#FFFFFF" fill-opacity=".85">days</text>
  <text x="92" y="630" font-size="28" fill="#FFFFFF" fill-opacity=".8">3 of 4 habits done</text>
  <circle cx="590" cy="530" r="96" fill="none" stroke="#FFFFFF" stroke-opacity=".25" stroke-width="26"/>
  <circle cx="590" cy="530" r="96" fill="none" stroke="#FFFFFF" stroke-width="26" stroke-linecap="round"
    stroke-dasharray="${2 * Math.PI * 96 * 0.75} 999" transform="rotate(-90 590 530)"/>
  <text x="590" y="546" font-size="44" font-weight="700" fill="#FFFFFF" text-anchor="middle">75%</text>

  <rect x="40" y="750" width="700" height="360" rx="40" fill="#FFFFFF"/>
  <text x="84" y="824" font-size="32" font-weight="700" fill="#0A0A0A">This week</text>
  <text x="696" y="824" font-size="28" fill="#1753FE" text-anchor="end">Details</text>
  ${bars.map((v, i) => {
    const bx = 92 + i * 90, bh = 170 * v, by = 1040 - bh;
    return `<rect x="${bx}" y="${by}" width="46" height="${bh}" rx="14" fill="${i === 3 ? "#1753FE" : "#DCE4FB"}"/>
      <text x="${bx + 23}" y="1086" font-size="24" fill="#8A93A6" text-anchor="middle">${days[i]}</text>`;
  }).join("")}

  <text x="56" y="1188" font-size="32" font-weight="700" fill="#0A0A0A">Habits</text>
  ${habits.map(([t, s, c, done], i) => {
    const y = 1220 + i * 112;
    return `<rect x="40" y="${y}" width="700" height="96" rx="30" fill="#FFFFFF"/>
      <rect x="68" y="${y + 20}" width="56" height="56" rx="18" fill="${c}" fill-opacity=".14"/>
      <circle cx="96" cy="${y + 48}" r="11" fill="${c}"/>
      <text x="148" y="${y + 44}" font-size="29" font-weight="600" fill="#0A0A0A">${t}</text>
      <text x="148" y="${y + 76}" font-size="24" fill="#8A93A6">${s}</text>
      ${done
        ? `<circle cx="692" cy="${y + 48}" r="22" fill="#1753FE"/><path d="M681 ${y + 48} l8 8 l15 -16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="692" cy="${y + 48}" r="20" fill="none" stroke="#CBD3E3" stroke-width="4"/>`}`;
  }).join("")}
  <rect x="270" y="1650" width="240" height="10" rx="5" fill="#0A0A0A"/>
</svg>`;
await out(appSvg, "public/showcase/app-screen.webp", 90);
