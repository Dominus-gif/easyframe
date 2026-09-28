// Instagram-style "seamless carousel": one wide image spread across N panels so
// that, posted in order and swiped, the panels read as one continuous picture.
// The whole strip is drawn once (cover-fit with zoom/pan over N panels wide),
// then sliced into N equal columns — each an individual square/portrait post.

import { paintBackground, type BackgroundSetting, type ExportFormat } from "@/lib/editor/compositor";

export type CarouselAspect = "4:5" | "1:1" | "9:16" | "16:9";

export type CarouselState = {
  panels: number; // 2..10
  aspect: CarouselAspect;
  zoom: number; // >= 1 (cover baseline)
  ox: number; // pan -1..1
  oy: number;
};

export const CAROUSEL_ASPECTS: { id: CarouselAspect; label: string; w: number; h: number }[] = [
  { id: "4:5", label: "Portrait 4:5", w: 1080, h: 1350 },
  { id: "1:1", label: "Square 1:1", w: 1080, h: 1080 },
  { id: "9:16", label: "Tall 9:16", w: 1080, h: 1920 },
  { id: "16:9", label: "Wide 16:9", w: 1920, h: 1080 }
];

export const defaultCarousel: CarouselState = { panels: 3, aspect: "4:5", zoom: 1, ox: 0, oy: 0 };

export function panelBase(aspect: CarouselAspect) {
  const a = CAROUSEL_ASPECTS.find((x) => x.id === aspect) ?? CAROUSEL_ASPECTS[0];
  return { w: a.w, h: a.h };
}

/** Cover-fit placement of the source image over the full W x H strip. */
function placement(img: HTMLImageElement, W: number, H: number, state: CarouselState) {
  const iw = img.naturalWidth || img.width || 1;
  const ih = img.naturalHeight || img.height || 1;
  const s = Math.max(W / iw, H / ih) * Math.max(1, state.zoom);
  const dw = iw * s;
  const dh = ih * s;
  const x0 = (W - dw) / 2; // <= 0
  const y0 = (H - dh) / 2;
  return { dw, dh, x: x0 * (1 + state.ox), y: y0 * (1 + state.oy) };
}

export type CarouselRenderOpts = { panelPx: number; preview?: boolean; selected?: number | null };

/** Draw the full N-wide strip. In preview mode it adds panel dividers/numbers. */
export function renderCarousel(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | null,
  background: BackgroundSetting,
  state: CarouselState,
  opts: CarouselRenderOpts
) {
  const base = panelBase(state.aspect);
  const scale = opts.panelPx / base.w;
  const PW = Math.max(1, Math.round(base.w * scale));
  const PH = Math.max(1, Math.round(base.h * scale));
  const N = Math.max(2, Math.min(10, state.panels));
  const W = PW * N;
  const H = PH;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: 0, height: 0, PW, PH, N };
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  paintBackground(ctx, background, W, H);

  if (img) {
    const pl = placement(img, W, H, state);
    ctx.drawImage(img, pl.x, pl.y, pl.dw, pl.dh);
  } else if (opts.preview) {
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${Math.round(PH * 0.06)}px Inter, sans-serif`;
    ctx.fillText("Add a wide image", W / 2, H / 2);
  }

  if (opts.preview) {
    for (let k = 1; k < N; k++) {
      const x = k * PW;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = Math.max(2, PW * 0.006);
      ctx.setLineDash([PH * 0.02, PH * 0.02]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Panel numbers.
    ctx.fillStyle = "rgba(15,23,42,0.55)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = `600 ${Math.round(PH * 0.05)}px Inter, sans-serif`;
    for (let k = 0; k < N; k++) {
      const pad = PH * 0.03;
      const label = String(k + 1);
      const bx = k * PW + pad;
      const r = PH * 0.045;
      ctx.beginPath();
      ctx.arc(bx + r, pad + r, r, 0, Math.PI * 2);
      ctx.fillStyle = opts.selected === k ? "rgba(23,83,254,0.9)" : "rgba(15,23,42,0.55)";
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, bx + r, pad + r + 1);
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return { width: W, height: H, PW, PH, N };
}

/** Render the strip once at export resolution, then slice into N panel blobs. */
export async function exportCarousel(
  img: HTMLImageElement | null,
  background: BackgroundSetting,
  state: CarouselState,
  format: ExportFormat,
  quality: number,
  panelPx: number
): Promise<{ name: string; blob: Blob }[]> {
  if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      /* ignore */
    }
  }
  const strip = document.createElement("canvas");
  const { PW, PH, N } = renderCarousel(strip, img, background, state, { panelPx, preview: false });
  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  const ext = format === "jpeg" ? "jpg" : format;

  const out: { name: string; blob: Blob }[] = [];
  for (let k = 0; k < N; k++) {
    const panel = document.createElement("canvas");
    panel.width = PW;
    panel.height = PH;
    const pctx = panel.getContext("2d");
    if (!pctx) continue;
    pctx.drawImage(strip, k * PW, 0, PW, PH, 0, 0, PW, PH);
    // eslint-disable-next-line no-await-in-loop
    const blob = await new Promise<Blob | null>((res) =>
      panel.toBlob((b) => res(b), mime, format === "png" ? undefined : quality)
    );
    if (blob) out.push({ name: `panel-${String(k + 1).padStart(2, "0")}.${ext}`, blob });
  }
  return out;
}
