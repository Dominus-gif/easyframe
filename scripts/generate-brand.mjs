// Derives every web brand asset from the two master PNGs in /design.
//
//   node scripts/generate-brand.mjs
//
// Sources (4000x4000, transparent, mostly empty margin):
//   design/Logo_mwb.png     — full wordmark (orange mark + "EASYFRAME.APP")
//   design/Logo_favicon.png — the stacked-squares mark on its own
//
// Outputs land in public/brand/. The wordmark is also emitted in a white-text
// variant for dark surfaces (the editor chrome), where the black original would
// be invisible.

import { mkdirSync } from "node:fs";
import sharp from "sharp";

const OUT = "public/brand";
mkdirSync(OUT, { recursive: true });

const WORDMARK = "design/Logo_mwb.png";
const MARK = "design/Logo_favicon.png";

const log = (f) => console.log("wrote", f);

/** Trim the transparent margin off a master file. */
const trimmed = (src) => sharp(src).trim({ threshold: 1 });

// ---------------------------------------------------------------- wordmark
// Displayed around 150px wide, so 900px gives a comfortable 3x on retina.
await trimmed(WORDMARK).resize({ width: 900 }).png().toFile(`${OUT}/logo.png`);
log(`${OUT}/logo.png`);

// White-text variant: recolour the near-black letterforms to white and leave the
// orange mark alone, judged per pixel by saturation + luminance.
{
  const { data, info } = await trimmed(WORDMARK)
    .resize({ width: 900 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Low saturation + dark => it's part of the wordmark text, not the mark.
    if (max - min < 48 && lum < 140) {
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(`${OUT}/logo-white.png`);
  log(`${OUT}/logo-white.png`);
}

// -------------------------------------------------------------------- mark
// Square-padded so every icon size stays centred and keeps its proportions.
const squareMark = async (size, { background = { r: 0, g: 0, b: 0, alpha: 0 }, pad = 0.1 } = {}) => {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await trimmed(MARK).resize({ width: inner, height: inner, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .png()
    .toBuffer();
};

for (const size of [16, 32, 48, 64, 192, 512]) {
  await sharp(await squareMark(size, { pad: 0.06 })).toFile(`${OUT}/icon-${size}.png`);
  log(`${OUT}/icon-${size}.png`);
}

// The nav/footer mark, shown at ~30px.
await sharp(await squareMark(128, { pad: 0.04 })).toFile(`${OUT}/mark.png`);
log(`${OUT}/mark.png`);

// Apple touch icons are composited on black when transparent, so give it white.
await sharp(await squareMark(180, { background: { r: 255, g: 255, b: 255, alpha: 1 }, pad: 0.14 })).toFile(`${OUT}/apple-touch-icon.png`);
log(`${OUT}/apple-touch-icon.png`);

// Maskable PWA icon needs a filled bleed area for the platform's safe-zone crop.
await sharp(await squareMark(512, { background: { r: 255, g: 255, b: 255, alpha: 1 }, pad: 0.2 })).toFile(`${OUT}/icon-maskable-512.png`);
log(`${OUT}/icon-maskable-512.png`);
