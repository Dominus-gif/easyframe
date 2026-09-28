// Collage engine: layout templates, rendering, hit-testing and export.
// Cells are in normalized 0..1 space of the content box; everything else
// (gaps, padding, radius) is a fraction of the canvas short edge so a layout
// looks identical at preview and export resolutions.

import { drawOverlays, paintBackground, type BackgroundSetting, type Overlay, type ExportFormat } from "@/lib/editor/compositor";

export type CollageCell = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Degrees; freeform layouts only. */
  rot?: number;
  /** White instant-photo card with a thick bottom border. */
  polaroid?: boolean;
  /** Circular crop (drawn as the largest circle that fits the cell). */
  circle?: boolean;
};

export type CollageTemplate = {
  id: string;
  label: string;
  cells: CollageCell[];
  /** Freeform layouts ignore gap insets (cells can overlap and rotate). */
  freeform?: boolean;
};

export type CollagePhoto = {
  img: HTMLImageElement;
  /** 1 = cover the cell; up to 3. */
  zoom: number;
  /** Pan within the overflow, -1..1 (0 = centered). */
  ox: number;
  oy: number;
};

export type CollageAspect = "1:1" | "4:5" | "9:16" | "16:9";

export type CollageState = {
  templateId: string;
  aspect: CollageAspect;
  gap: number; // fraction of short edge
  padding: number; // fraction of short edge
  radius: number; // fraction of short edge
  /** Photo for cell i. Kept independent of the template so switching layouts never loses photos. */
  photos: (CollagePhoto | null)[];
};

export const COLLAGE_ASPECTS: { id: CollageAspect; label: string; w: number; h: number }[] = [
  { id: "1:1", label: "Post 1:1", w: 1080, h: 1080 },
  { id: "4:5", label: "Portrait 4:5", w: 1080, h: 1350 },
  { id: "9:16", label: "Story 9:16", w: 1080, h: 1920 },
  { id: "16:9", label: "Wide 16:9", w: 1920, h: 1080 }
];

const grid = (cols: number, rows: number): CollageCell[] =>
  Array.from({ length: cols * rows }, (_, i) => ({ x: (i % cols) / cols, y: Math.floor(i / cols) / rows, w: 1 / cols, h: 1 / rows }));

export const COLLAGE_TEMPLATES: CollageTemplate[] = [
  { id: "duo", label: "Duo", cells: grid(2, 1) },
  { id: "stack", label: "Stack", cells: grid(1, 2) },
  { id: "grid4", label: "Grid", cells: grid(2, 2) },
  { id: "hero-left", label: "Hero", cells: [{ x: 0, y: 0, w: 0.6, h: 1 }, { x: 0.6, y: 0, w: 0.4, h: 0.5 }, { x: 0.6, y: 0.5, w: 0.4, h: 0.5 }] },
  { id: "hero-top", label: "Headline", cells: [{ x: 0, y: 0, w: 1, h: 0.62 }, { x: 0, y: 0.62, w: 0.5, h: 0.38 }, { x: 0.5, y: 0.62, w: 0.5, h: 0.38 }] },
  { id: "bento", label: "Bento", cells: [
    { x: 0, y: 0, w: 0.66, h: 0.66 }, { x: 0.66, y: 0, w: 0.34, h: 0.33 }, { x: 0.66, y: 0.33, w: 0.34, h: 0.33 },
    { x: 0, y: 0.66, w: 0.33, h: 0.34 }, { x: 0.33, y: 0.66, w: 0.33, h: 0.34 }, { x: 0.66, y: 0.66, w: 0.34, h: 0.34 }
  ] },
  { id: "polaroids", label: "Polaroids", freeform: true, cells: [
    { x: 0.06, y: 0.1, w: 0.46, h: 0.5, rot: -8, polaroid: true },
    { x: 0.48, y: 0.06, w: 0.46, h: 0.5, rot: 6, polaroid: true },
    { x: 0.25, y: 0.45, w: 0.5, h: 0.52, rot: -2, polaroid: true }
  ] },
  { id: "trio", label: "Trio", cells: grid(3, 1) },
  { id: "strip", label: "Film strip", cells: grid(1, 3) },
  { id: "hero-top3", label: "Feature", cells: [{ x: 0, y: 0, w: 1, h: 0.6 }, { x: 0, y: 0.6, w: 1 / 3, h: 0.4 }, { x: 1 / 3, y: 0.6, w: 1 / 3, h: 0.4 }, { x: 2 / 3, y: 0.6, w: 1 / 3, h: 0.4 }] },
  { id: "mosaic", label: "Mosaic", cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 0.55 }, { x: 0.5, y: 0.55, w: 0.25, h: 0.45 }, { x: 0.75, y: 0.55, w: 0.25, h: 0.45 }] },
  { id: "grid6", label: "Six", cells: grid(3, 2) },
  { id: "grid9", label: "Nine", cells: grid(3, 3) },
  { id: "quad-strip", label: "Story strip", cells: grid(1, 4) },
  { id: "bubbles", label: "Bubbles", freeform: true, cells: [
    { x: 0.04, y: 0.1, w: 0.58, h: 0.58, circle: true },
    { x: 0.56, y: 0.08, w: 0.4, h: 0.4, circle: true },
    { x: 0.44, y: 0.5, w: 0.46, h: 0.46, circle: true }
  ] },
  { id: "row4", label: "Row of 4", cells: grid(4, 1) },
  { id: "tallsix", label: "Tall six", cells: grid(2, 3) },
  { id: "grid8", label: "Eight", cells: grid(4, 2) },
  { id: "sidebar", label: "Sidebar", cells: [
    { x: 0, y: 0, w: 0.58, h: 1 },
    { x: 0.58, y: 0, w: 0.42, h: 1 / 3 }, { x: 0.58, y: 1 / 3, w: 0.42, h: 1 / 3 }, { x: 0.58, y: 2 / 3, w: 0.42, h: 1 / 3 }
  ] },
  { id: "magazine", label: "Magazine", cells: [
    { x: 0, y: 0, w: 0.5, h: 1 },
    { x: 0.5, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.25, h: 0.5 }, { x: 0.75, y: 0.5, w: 0.25, h: 0.5 }
  ] },
  { id: "single", label: "Single", cells: [{ x: 0, y: 0, w: 1, h: 1 }] }
];

export const defaultCollage: CollageState = {
  templateId: "grid4",
  aspect: "1:1",
  gap: 0.024,
  padding: 0.04,
  radius: 0.02,
  photos: []
};

export function templateById(id: string): CollageTemplate {
  return COLLAGE_TEMPLATES.find((t) => t.id === id) ?? COLLAGE_TEMPLATES[0];
}

export function aspectDims(aspect: CollageAspect) {
  const a = COLLAGE_ASPECTS.find((x) => x.id === aspect) ?? COLLAGE_ASPECTS[0];
  return { w: a.w, h: a.h };
}

type Rect = { x: number; y: number; w: number; h: number; rot: number; polaroid: boolean; circle: boolean };

/** Cell rectangles in canvas pixels for a canvas of W x H. */
export function cellRects(state: CollageState, W: number, H: number): Rect[] {
  const t = templateById(state.templateId);
  const short = Math.min(W, H);
  const pad = state.padding * short;
  const gap = state.gap * short;
  const cw = W - pad * 2;
  const ch = H - pad * 2;
  const edge = (v: number) => v < 0.001 || v > 0.999;
  return t.cells.map((c) => {
    let x = pad + c.x * cw;
    let y = pad + c.y * ch;
    let w = c.w * cw;
    let h = c.h * ch;
    if (!t.freeform) {
      // Half a gap on every internal edge => exactly one gap between neighbours.
      const l = edge(c.x) ? 0 : gap / 2;
      const r = edge(c.x + c.w) ? 0 : gap / 2;
      const tp = edge(c.y) ? 0 : gap / 2;
      const b = edge(c.y + c.h) ? 0 : gap / 2;
      x += l;
      y += tp;
      w -= l + r;
      h -= tp + b;
    }
    if (c.circle) {
      const d = Math.min(w, h);
      x += (w - d) / 2;
      y += (h - d) / 2;
      w = d;
      h = d;
    }
    return { x, y, w, h, rot: c.rot ?? 0, polaroid: Boolean(c.polaroid), circle: Boolean(c.circle) };
  });
}

/** The photo window inside a cell (polaroids have a white border). */
function photoWindow(r: Rect) {
  if (!r.polaroid) return { x: 0, y: 0, w: r.w, h: r.h };
  const side = Math.max(4, Math.min(r.w, r.h) * 0.055);
  const bottom = side * 3.4;
  return { x: side, y: side, w: r.w - side * 2, h: r.h - side - bottom };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Where a photo is drawn inside a window of cw x ch (cover-fit, zoom, pan). */
function photoPlacement(p: CollagePhoto, cw: number, ch: number) {
  const iw = p.img.naturalWidth || p.img.width || 1;
  const ih = p.img.naturalHeight || p.img.height || 1;
  const s = Math.max(cw / iw, ch / ih) * Math.max(1, p.zoom);
  const dw = iw * s;
  const dh = ih * s;
  const x0 = (cw - dw) / 2; // <= 0
  const y0 = (ch - dh) / 2;
  return { dw, dh, x: x0 * (1 + p.ox), y: y0 * (1 + p.oy), x0, y0 };
}

export type RenderOpts = { maxEdge: number; preview?: boolean; selected?: number | null };

export function renderCollage(
  canvas: HTMLCanvasElement,
  state: CollageState,
  background: BackgroundSetting,
  overlays: Overlay[] | undefined,
  opts: RenderOpts
) {
  const base = aspectDims(state.aspect);
  const scale = opts.maxEdge / Math.max(base.w, base.h);
  const W = Math.round(base.w * scale);
  const H = Math.round(base.h * scale);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: 0, height: 0 };
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  paintBackground(ctx, background, W, H);

  const short = Math.min(W, H);
  const radius = state.radius * short;
  const rects = cellRects(state, W, H);

  rects.forEach((r, i) => {
    const photo = state.photos[i] ?? null;
    if (!photo && !opts.preview) return; // empty cells are invisible in exports

    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
    if (r.rot) ctx.rotate((r.rot * Math.PI) / 180);
    ctx.translate(-r.w / 2, -r.h / 2);

    if (r.polaroid) {
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.28)";
      ctx.shadowBlur = short * 0.03;
      ctx.shadowOffsetY = short * 0.012;
      ctx.fillStyle = "#fbfaf7";
      roundRect(ctx, 0, 0, r.w, r.h, Math.min(radius, short * 0.01));
      ctx.fill();
      ctx.restore();
    }

    const win = photoWindow(r);
    ctx.save();
    if (r.circle) {
      ctx.beginPath();
      ctx.arc(win.x + win.w / 2, win.y + win.h / 2, win.w / 2, 0, Math.PI * 2);
    } else {
      roundRect(ctx, win.x, win.y, win.w, win.h, r.polaroid ? radius * 0.3 : radius);
    }
    ctx.clip();

    if (photo) {
      const pl = photoPlacement(photo, win.w, win.h);
      ctx.drawImage(photo.img, win.x + pl.x, win.y + pl.y, pl.dw, pl.dh);
    } else {
      // Preview-only placeholder with a "+".
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(win.x, win.y, win.w, win.h);
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(win.x, win.y, win.w, win.h);
      const s = Math.min(win.w, win.h) * 0.12;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = Math.max(2, s * 0.14);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(win.x + win.w / 2 - s / 2, win.y + win.h / 2);
      ctx.lineTo(win.x + win.w / 2 + s / 2, win.y + win.h / 2);
      ctx.moveTo(win.x + win.w / 2, win.y + win.h / 2 - s / 2);
      ctx.lineTo(win.x + win.w / 2, win.y + win.h / 2 + s / 2);
      ctx.stroke();
    }
    ctx.restore();

    if (opts.preview && opts.selected === i) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(2, short * 0.006);
      ctx.setLineDash([short * 0.018, short * 0.012]);
      if (r.circle) {
        ctx.beginPath();
        ctx.arc(win.x + win.w / 2, win.y + win.h / 2, win.w / 2, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        roundRect(ctx, win.x, win.y, win.w, win.h, radius);
        ctx.stroke();
      }
    }
    ctx.restore();
  });

  // Text, stickers and image layers sit on top, in the collage's own space.
  drawOverlays(ctx, overlays, base.w, base.h, scale);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return { width: W, height: H };
}

/** Index of the top-most cell under a canvas-pixel point, or -1. */
export function hitCell(state: CollageState, W: number, H: number, px: number, py: number): number {
  const rects = cellRects(state, W, H);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    // Undo the cell's rotation around its center.
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const a = (-r.rot * Math.PI) / 180;
    const lx = (px - cx) * Math.cos(a) - (py - cy) * Math.sin(a);
    const ly = (px - cx) * Math.sin(a) + (py - cy) * Math.cos(a);
    if (r.circle ? Math.hypot(lx, ly) <= r.w / 2 : Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2) return i;
  }
  return -1;
}

/** New pan (ox, oy) after dragging a cell's photo by (dx, dy) canvas pixels. */
export function panPhoto(state: CollageState, index: number, W: number, H: number, dx: number, dy: number) {
  const photo = state.photos[index];
  const r = cellRects(state, W, H)[index];
  if (!photo || !r) return null;
  // Drag in screen space; rotate into the cell's own axes.
  const a = (-r.rot * Math.PI) / 180;
  const ldx = dx * Math.cos(a) - dy * Math.sin(a);
  const ldy = dx * Math.sin(a) + dy * Math.cos(a);
  const win = photoWindow(r);
  const pl = photoPlacement(photo, win.w, win.h);
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  // x = x0 * (1 + ox)  =>  d(ox) = dx / x0  (x0 <= 0; no overflow => no pan)
  return {
    ox: pl.x0 < -0.5 ? clamp(photo.ox + ldx / pl.x0) : photo.ox,
    oy: pl.y0 < -0.5 ? clamp(photo.oy + ldy / pl.y0) : photo.oy
  };
}

export async function exportCollage(
  state: CollageState,
  background: BackgroundSetting,
  overlays: Overlay[] | undefined,
  format: ExportFormat,
  quality: number,
  maxEdge: number
): Promise<Blob> {
  if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      /* ignore */
    }
  }
  const canvas = document.createElement("canvas");
  renderCollage(canvas, state, background, overlays, { maxEdge, preview: false });
  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), mime, format === "png" ? undefined : quality);
  });
}
