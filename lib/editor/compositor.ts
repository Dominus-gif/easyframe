// Client-side Canvas compositor. Draws background → device (body + screenshot + chrome),
// optionally projected in 3D (perspective tilt), then exports. Nothing touches the network.

import { deviceBySlug, type Device } from "@/lib/editor/devices";

export type BackgroundSetting =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; via?: string; to: string; angle: number }
  | { type: "image"; img: HTMLImageElement | HTMLCanvasElement | ImageBitmap } // Premium
  | { type: "transparent" }; // Premium

export type EditorSettings = {
  deviceSlug: string;
  background: BackgroundSetting;
  padding: number; // 0..1 fraction of device max dim
  imageScale: number; // 1 = cover baseline
  imageOffsetX: number; // fraction of screen width
  imageOffsetY: number; // fraction of screen height
  imageRotate: number; // degrees (image inside screen)
  fit: "cover" | "contain";
  shadow: number; // 0..1
  cornerRadius: number; // 0..1 of scene short edge / 2
  rotateX: number; // degrees — tilt top toward/away
  rotateY: number; // degrees — turn left/right
  rotateZ: number; // degrees — in-plane roll
  perspective: number; // 0..100 — strength of the 3D perspective
};

export const defaultSettings: EditorSettings = {
  deviceSlug: "iphone-mockup",
  background: { type: "gradient", from: "#2f6bff", to: "#22b8e6", angle: 135 },
  padding: 0.16,
  imageScale: 1,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageRotate: 0,
  fit: "cover",
  shadow: 0.6,
  cornerRadius: 0.06,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  perspective: 45
};

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Lighten/darken a hex color by an amount (-255..255). Returns an rgb() string. */
function shade(hex: string, amt: number): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(n.slice(0, 2), 16) + amt);
  const g = clamp(parseInt(n.slice(2, 4), 16) + amt);
  const b = clamp(parseInt(n.slice(4, 6), 16) + amt);
  return `rgb(${r},${g},${b})`;
}

// Overlay layers drawn on top of the composited scene (extra images + text).
export type OverlayBase = { id: string; x: number; y: number; scale: number; rotation: number; opacity: number; hidden?: boolean };
export type ImageOverlay = OverlayBase & { type: "image"; img: HTMLImageElement | HTMLCanvasElement | ImageBitmap };
export type TextOverlay = OverlayBase & {
  type: "text";
  text: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number; // fraction of scene height
  color: string;
  align: CanvasTextAlign;
};
export type Overlay = ImageOverlay | TextOverlay;

/** Draw overlay layers in scene-pixel space, on top of the device. */
function drawOverlays(ctx: CanvasRenderingContext2D, overlays: Overlay[] | undefined, sceneW: number, sceneH: number, outScale: number) {
  if (!overlays || !overlays.length) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const o of overlays) {
    if (o.hidden) continue;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, o.opacity));
    ctx.translate(o.x * sceneW * outScale, o.y * sceneH * outScale);
    ctx.rotate(rad(o.rotation));
    if (o.type === "image") {
      const iw = ("naturalWidth" in o.img ? (o.img as HTMLImageElement).naturalWidth : (o.img as { width: number }).width) || 1;
      const ih = ("naturalHeight" in o.img ? (o.img as HTMLImageElement).naturalHeight : (o.img as { height: number }).height) || 1;
      const w = sceneW * 0.4 * o.scale * outScale;
      const h = w * (ih / iw);
      ctx.drawImage(o.img as CanvasImageSource, -w / 2, -h / 2, w, h);
    } else {
      const px = o.fontSize * sceneH * outScale;
      ctx.font = `${o.fontWeight} ${px}px ${o.fontFamily}`;
      ctx.fillStyle = o.color;
      ctx.textAlign = o.align;
      ctx.textBaseline = "middle";
      const lines = o.text.split("\n");
      const lh = px * 1.22;
      lines.forEach((line, i) => ctx.fillText(line, 0, (i - (lines.length - 1) / 2) * lh));
    }
    ctx.restore();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Extra height below the frame for laptop decks and monitor stands. */
function baseHeight(device: Device) {
  if (device.kind === "laptop") return 46;
  if (device.kind === "desktop") return Math.round(device.frameH * 0.17);
  return 0;
}

function bodyPath(ctx: CanvasRenderingContext2D, device: Device) {
  rr(ctx, 0, 0, device.frameW, device.frameH, device.bodyRadius);
}

function screenPath(ctx: CanvasRenderingContext2D, device: Device) {
  const s = device.screen;
  if (device.kind === "browser") {
    rr(ctx, s.x + 12, s.y, s.w - 24, s.h - 12, 12);
  } else {
    rr(ctx, s.x, s.y, s.w, s.h, s.r);
  }
}

function drawImageInScreen(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  device: Device,
  settings: EditorSettings
) {
  const s = device.screen;
  const iw = "width" in img ? (img.width as number) : 0;
  const ih = "height" in img ? (img.height as number) : 0;
  if (!iw || !ih) return;
  const base = settings.fit === "cover" ? Math.max(s.w / iw, s.h / ih) : Math.min(s.w / iw, s.h / ih);
  const scale = base * settings.imageScale;
  const cx = s.x + s.w / 2 + settings.imageOffsetX * s.w;
  const cy = s.y + s.h / 2 + settings.imageOffsetY * s.h;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad(settings.imageRotate));
  ctx.drawImage(img as CanvasImageSource, (-iw * scale) / 2, (-ih * scale) / 2, iw * scale, ih * scale);
  ctx.restore();
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, device: Device) {
  const s = device.screen;
  const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.w, s.y + s.h);
  grad.addColorStop(0, "#1a1d22");
  grad.addColorStop(1, "#0f1114");
  ctx.fillStyle = grad;
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = "rgba(255,255,255,0.34)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(s.w * 0.045)}px Inter, system-ui, sans-serif`;
  ctx.fillText("Your screenshot", s.x + s.w / 2, s.y + s.h / 2);
}

function drawChrome(ctx: CanvasRenderingContext2D, device: Device) {
  const s = device.screen;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  screenPath(ctx, device);
  ctx.stroke();
  ctx.restore();

  if (device.notch === "island") {
    const w = s.w * 0.3;
    rr(ctx, s.x + s.w / 2 - w / 2, s.y + 22, w, 30, 15);
    ctx.fillStyle = "#000";
    ctx.fill();
  } else if (device.notch === "punch") {
    ctx.beginPath();
    ctx.arc(s.x + s.w / 2, s.y + 24, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
  } else if (device.notch === "camera") {
    ctx.beginPath();
    ctx.arc(s.x + s.w / 2, s.y / 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
  }

  if (device.kind === "browser") {
    ctx.save();
    rr(ctx, 0, 0, device.frameW, 76, device.bodyRadius);
    ctx.clip();
    ctx.fillStyle = "#1c1c20";
    ctx.fillRect(0, 0, device.frameW, 56);
    ctx.restore();
    ["#ff5f57", "#febc2e", "#28c840"].forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(28 + i * 26, 28, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
    rr(ctx, device.frameW * 0.28, 16, device.frameW * 0.44, 26, 13);
    ctx.fillStyle = "#0e0e11";
    ctx.fill();
  }

  if (device.kind === "laptop") {
    const overhang = device.frameW * 0.06;
    const baseY = device.frameH;
    rr(ctx, -overhang, baseY, device.frameW + overhang * 2, 22, 10);
    ctx.fillStyle = "#141416";
    ctx.fill();
    rr(ctx, device.frameW / 2 - device.frameW * 0.07, baseY, device.frameW * 0.14, 10, 5);
    ctx.fillStyle = "#0a0a0c";
    ctx.fill();
  }

  if (device.kind === "desktop") {
    const stand = baseHeight(device);
    const baseY = device.frameH;
    // Neck.
    rr(ctx, device.frameW / 2 - device.frameW * 0.05, baseY, device.frameW * 0.1, stand * 0.6, 6);
    ctx.fillStyle = "#141416";
    ctx.fill();
    // Foot.
    rr(ctx, device.frameW / 2 - device.frameW * 0.2, baseY + stand * 0.55, device.frameW * 0.4, stand * 0.28, 12);
    ctx.fillStyle = "#101012";
    ctx.fill();
  }

  if (device.kind === "watch") {
    rr(ctx, device.frameW - 4, device.frameH * 0.34, 12, 46, 6);
    ctx.fillStyle = "#1a1a1d";
    ctx.fill();
    rr(ctx, device.frameW - 3, device.frameH * 0.52, 9, 34, 4);
    ctx.fillStyle = "#151517";
    ctx.fill();
  }
}

/** Design-unit dimensions of a device layer (before render-scaling). */
function baseDims(device: Device, img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null): { w: number; h: number } {
  if (device.kind === "blank") {
    const iw = img ? ("naturalWidth" in img ? (img as HTMLImageElement).naturalWidth : (img as { width: number }).width) || 1200 : 1200;
    const ih = img ? ("naturalHeight" in img ? (img as HTMLImageElement).naturalHeight : (img as { height: number }).height) || 750 : 750;
    return { w: Math.max(1, iw), h: Math.max(1, ih) };
  }
  return { w: device.frameW, h: device.frameH + baseHeight(device) };
}

/**
 * Render the device (body + screenshot + chrome) into a transparent offscreen canvas at
 * `renderScale`× resolution. Higher renderScale keeps vector frames razor-sharp and preserves
 * screenshot detail when the mockup is scaled up for export. Returns design-unit w/h + the scale.
 */
function renderDeviceLayer(
  device: Device,
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null,
  settings: EditorSettings,
  renderScale = 1
): { canvas: HTMLCanvasElement; w: number; h: number; scale: number } {
  // Blank / frameless: the image itself is the subject — rounded corners, no device shell.
  if (device.kind === "blank") {
    const iw = img ? ("naturalWidth" in img ? (img as HTMLImageElement).naturalWidth : (img as { width: number }).width) || 1200 : 1200;
    const ih = img ? ("naturalHeight" in img ? (img as HTMLImageElement).naturalHeight : (img as { height: number }).height) || 750 : 750;
    const cap = 3200;
    const capScale = Math.min(1, cap / Math.max(iw, ih));
    const bw = Math.max(1, Math.round(iw * capScale));
    const bh = Math.max(1, Math.round(ih * capScale));
    const c = document.createElement("canvas");
    c.width = bw;
    c.height = bh;
    const bctx = c.getContext("2d");
    if (!bctx) return { canvas: c, w: bw, h: bh, scale: 1 };
    const radius = settings.cornerRadius * Math.min(bw, bh);
    if (radius > 0) {
      rr(bctx, 0, 0, bw, bh, radius);
      bctx.clip();
    }
    if (img) {
      bctx.drawImage(img as CanvasImageSource, 0, 0, bw, bh);
    } else {
      const grad = bctx.createLinearGradient(0, 0, bw, bh);
      grad.addColorStop(0, "#1a1d22");
      grad.addColorStop(1, "#0f1114");
      bctx.fillStyle = grad;
      bctx.fillRect(0, 0, bw, bh);
      bctx.fillStyle = "rgba(255,255,255,0.34)";
      bctx.textAlign = "center";
      bctx.textBaseline = "middle";
      bctx.font = `600 ${Math.round(bw * 0.04)}px Inter, system-ui, sans-serif`;
      bctx.fillText("Paste or drop an image", bw / 2, bh / 2);
    }
    return { canvas: c, w: bw, h: bh, scale: 1 };
  }

  const w = device.frameW;
  const h = device.frameH + baseHeight(device);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * renderScale);
  canvas.height = Math.round(h * renderScale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, w, h, scale: renderScale };
  ctx.scale(renderScale, renderScale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Metallic body: diagonal gradient (light rim top-left → base → darker bottom-right).
  bodyPath(ctx, device);
  const body = ctx.createLinearGradient(0, 0, w, h);
  body.addColorStop(0, shade(device.bodyColor, 16));
  body.addColorStop(0.5, device.bodyColor);
  body.addColorStop(1, shade(device.bodyColor, -8));
  ctx.fillStyle = body;
  ctx.fill();
  // Rim light — a thin lighter edge just inside the body outline (metal catching light).
  ctx.save();
  bodyPath(ctx, device);
  ctx.clip();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  bodyPath(ctx, device);
  ctx.stroke();
  ctx.restore();

  // Screen content + glass.
  const s = device.screen;
  ctx.save();
  screenPath(ctx, device);
  ctx.clip();
  if (img) drawImageInScreen(ctx, img, device, settings);
  else drawPlaceholder(ctx, device);
  // Diagonal glass glare over the screen.
  const glare = ctx.createLinearGradient(s.x, s.y, s.x + s.w * 0.7, s.y + s.h);
  glare.addColorStop(0, "rgba(255,255,255,0.11)");
  glare.addColorStop(0.16, "rgba(255,255,255,0.035)");
  glare.addColorStop(0.42, "rgba(255,255,255,0)");
  ctx.fillStyle = glare;
  ctx.fillRect(s.x, s.y, s.w, s.h);
  // Inner screen recess shadow.
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,0.30)";
  screenPath(ctx, device);
  ctx.stroke();
  ctx.restore();

  drawChrome(ctx, device);
  return { canvas, w, h, scale: renderScale };
}

function paintBackground(ctx: CanvasRenderingContext2D, bg: BackgroundSetting, w: number, h: number) {
  if (bg.type === "transparent") return;
  if (bg.type === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (bg.type === "image") {
    const img = bg.img as HTMLImageElement & { naturalWidth?: number; naturalHeight?: number };
    const iw = (img.naturalWidth ?? (img as unknown as { width: number }).width) || w;
    const ih = (img.naturalHeight ?? (img as unknown as { height: number }).height) || h;
    const scale = Math.max(w / iw, h / ih); // cover
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(bg.img as CanvasImageSource, (w - dw) / 2, (h - dh) / 2, dw, dh);
    return;
  }
  const a = rad(bg.angle);
  const cx = w / 2;
  const cy = h / 2;
  const half = Math.max(w, h);
  const grad = ctx.createLinearGradient(cx - Math.cos(a) * half, cy - Math.sin(a) * half, cx + Math.cos(a) * half, cy + Math.sin(a) * half);
  grad.addColorStop(0, bg.from);
  if (bg.via) grad.addColorStop(0.5, bg.via);
  grad.addColorStop(1, bg.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

type Pt = { x: number; y: number };

/** Project a device-layer point through Z→X→Y rotations + perspective. Returns centered 2D. */
function project(sx: number, sy: number, dW: number, dH: number, ax: number, ay: number, az: number, f: number): Pt {
  let x = sx - dW / 2;
  let y = sy - dH / 2;
  let z = 0;
  // Rz
  const x1 = x * Math.cos(az) - y * Math.sin(az);
  const y1 = x * Math.sin(az) + y * Math.cos(az);
  // Rx
  const y2 = y1 * Math.cos(ax) - z * Math.sin(ax);
  const z2 = y1 * Math.sin(ax) + z * Math.cos(ax);
  // Ry
  const x3 = x1 * Math.cos(ay) + z2 * Math.sin(ay);
  const z3 = -x1 * Math.sin(ay) + z2 * Math.cos(ay);
  const scale = f / Math.max(0.001, f - z3);
  return { x: x3 * scale, y: y2 * scale };
}

/** Map a source triangle onto a destination triangle (affine) and draw. */
function texTri(ctx: CanvasRenderingContext2D, img: CanvasImageSource, s: Pt[], d: Pt[]) {
  const cx = (d[0].x + d[1].x + d[2].x) / 3;
  const cy = (d[0].y + d[1].y + d[2].y) / 3;
  // Expand outward slightly to hide seams between adjacent triangles.
  const D = d.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * 0.7, y: p.y + (dy / len) * 0.7 };
  });
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(D[0].x, D[0].y);
  ctx.lineTo(D[1].x, D[1].y);
  ctx.lineTo(D[2].x, D[2].y);
  ctx.closePath();
  ctx.clip();
  const [s0, s1, s2] = s;
  const denom = s0.x * (s2.y - s1.y) - s1.x * s2.y + s2.x * s1.y + (s1.x - s2.x) * s0.y;
  if (Math.abs(denom) > 1e-6) {
    const a = (D[0].x * (s2.y - s1.y) - D[1].x * s2.y + D[2].x * s1.y + (D[1].x - D[2].x) * s0.y) / denom;
    const b = (D[0].y * (s2.y - s1.y) - D[1].y * s2.y + D[2].y * s1.y + (D[1].y - D[2].y) * s0.y) / denom;
    const c = (s0.x * (D[2].x - D[1].x) - s1.x * D[2].x + s2.x * D[1].x + (s1.x - s2.x) * D[0].x) / denom;
    const dd = (s0.x * (D[2].y - D[1].y) - s1.x * D[2].y + s2.x * D[1].y + (s1.x - s2.x) * D[0].y) / denom;
    const e = (s0.x * (s2.y * D[1].x - s1.y * D[2].x) + s0.y * (s1.x * D[2].x - s2.x * D[1].x) + (s2.x * s1.y - s1.x * s2.y) * D[0].x) / denom;
    const g = (s0.x * (s2.y * D[1].y - s1.y * D[2].y) + s0.y * (s1.x * D[2].y - s2.x * D[1].y) + (s2.x * s1.y - s1.x * s2.y) * D[0].y) / denom;
    ctx.setTransform(a, b, c, dd, e, g);
    ctx.drawImage(img, 0, 0);
  }
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export type CompositeResult = { width: number; height: number };

export function composite(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null,
  settings: EditorSettings,
  opts: { maxEdge: number },
  overlays?: Overlay[]
): CompositeResult {
  const device = deviceBySlug(settings.deviceSlug);
  const { w: dW, h: dH } = baseDims(device, img);
  const maxDim = Math.max(dW, dH);
  const pad = settings.padding * maxDim;
  const tilted = settings.rotateX !== 0 || settings.rotateY !== 0 || settings.rotateZ !== 0;
  const renderScaleFor = (outScale: number) => (device.kind === "blank" ? 1 : Math.max(1, Math.min(4, outScale * 1.15)));

  const ctx = canvas.getContext("2d");
  if (!ctx) return { width: 0, height: 0 };

  if (!tilted) {
    // Flat fast path — crisp 1:1 device, single clean shadow.
    const sceneW = dW + pad * 2;
    const sceneH = dH + pad * 2;
    const outScale = opts.maxEdge / Math.max(sceneW, sceneH);
    const layer = renderDeviceLayer(device, img, settings, renderScaleFor(outScale));
    canvas.width = Math.round(sceneW * outScale);
    canvas.height = Math.round(sceneH * outScale);
    ctx.setTransform(outScale, 0, 0, outScale, 0, 0);
    ctx.clearRect(0, 0, sceneW, sceneH);
    if (settings.cornerRadius > 0 && device.kind !== "blank") {
      rr(ctx, 0, 0, sceneW, sceneH, settings.cornerRadius * (Math.min(sceneW, sceneH) / 2));
      ctx.clip();
    }
    paintBackground(ctx, settings.background, sceneW, sceneH);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    if (settings.shadow > 0) {
      ctx.shadowColor = `rgba(0,0,0,${(settings.shadow * 0.5).toFixed(3)})`;
      ctx.shadowBlur = settings.shadow * maxDim * 0.09 * outScale;
      ctx.shadowOffsetY = settings.shadow * dH * 0.03 * outScale;
    }
    ctx.drawImage(layer.canvas, pad * outScale, pad * outScale, dW * outScale, dH * outScale);
    ctx.restore();
    drawOverlays(ctx, overlays, sceneW, sceneH, outScale);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return { width: canvas.width, height: canvas.height };
  }

  // 3D perspective path.
  const ax = rad(settings.rotateX);
  const ay = rad(settings.rotateY);
  const az = rad(settings.rotateZ);
  const f = maxDim * (7 - (Math.min(100, Math.max(0, settings.perspective)) / 100) * 5.4);
  const cols = 16;
  const rows = 16;
  const raw: Pt[][] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let r = 0; r <= rows; r += 1) {
    raw[r] = [];
    for (let c = 0; c <= cols; c += 1) {
      const p = project((c / cols) * dW, (r / rows) * dH, dW, dH, ax, ay, az, f);
      raw[r][c] = p;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  const sceneW = maxX - minX + pad * 2;
  const sceneH = maxY - minY + pad * 2;
  const outScale = opts.maxEdge / Math.max(sceneW, sceneH);
  const layer = renderDeviceLayer(device, img, settings, renderScaleFor(outScale));
  canvas.width = Math.round(sceneW * outScale);
  canvas.height = Math.round(sceneH * outScale);

  ctx.setTransform(outScale, 0, 0, outScale, 0, 0);
  ctx.clearRect(0, 0, sceneW, sceneH);
  if (settings.cornerRadius > 0 && device.kind !== "blank") {
    rr(ctx, 0, 0, sceneW, sceneH, settings.cornerRadius * (Math.min(sceneW, sceneH) / 2));
    ctx.clip();
  }
  paintBackground(ctx, settings.background, sceneW, sceneH);

  // Warp device onto the projected grid (in pixel space) on an offscreen canvas.
  const warp = document.createElement("canvas");
  warp.width = canvas.width;
  warp.height = canvas.height;
  const wctx = warp.getContext("2d");
  if (wctx) {
    const dest = (r: number, c: number): Pt => ({
      x: (raw[r][c].x - minX + pad) * outScale,
      y: (raw[r][c].y - minY + pad) * outScale
    });
    const src = (r: number, c: number): Pt => ({ x: (c / cols) * dW * layer.scale, y: (r / rows) * dH * layer.scale });
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const s00 = src(r, c);
        const s10 = src(r, c + 1);
        const s11 = src(r + 1, c + 1);
        const s01 = src(r + 1, c);
        const d00 = dest(r, c);
        const d10 = dest(r, c + 1);
        const d11 = dest(r + 1, c + 1);
        const d01 = dest(r + 1, c);
        texTri(wctx, layer.canvas, [s00, s10, s11], [d00, d10, d11]);
        texTri(wctx, layer.canvas, [s00, s11, s01], [d00, d11, d01]);
      }
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.save();
  if (settings.shadow > 0) {
    ctx.shadowColor = `rgba(0,0,0,${(settings.shadow * 0.5).toFixed(3)})`;
    ctx.shadowBlur = settings.shadow * maxDim * 0.08 * outScale;
    ctx.shadowOffsetY = settings.shadow * dH * 0.035 * outScale;
  }
  ctx.drawImage(warp, 0, 0);
  ctx.restore();
  drawOverlays(ctx, overlays, sceneW, sceneH, outScale);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return { width: canvas.width, height: canvas.height };
}

/** Load a File/Blob/URL into an HTMLImageElement, downscaling very large images first (≤20MP guard). */
export async function loadImageSafely(source: Blob | string): Promise<HTMLImageElement> {
  const url = typeof source === "string" ? source : URL.createObjectURL(source);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not load image"));
      el.src = url;
    });
    const mp = (img.naturalWidth * img.naturalHeight) / 1_000_000;
    if (mp <= 20) return img;
    const factor = Math.sqrt(20 / mp);
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * factor);
    c.height = Math.round(img.naturalHeight * factor);
    c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
    const scaled = new Image();
    await new Promise<void>((resolve) => {
      scaled.onload = () => resolve();
      scaled.src = c.toDataURL("image/png");
    });
    return scaled;
  } finally {
    if (typeof source !== "string") setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
}

export type ExportFormat = "png" | "jpeg" | "webp";

export async function exportScene(
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null,
  settings: EditorSettings,
  format: ExportFormat,
  quality: number,
  maxEdge: number,
  overlays?: Overlay[]
): Promise<Blob> {
  // Make sure any custom fonts used by text overlays are ready before rendering.
  if (typeof document !== "undefined" && (document as Document & { fonts?: FontFaceSet }).fonts) {
    try { await (document as Document & { fonts: FontFaceSet }).fonts.ready; } catch { /* ignore */ }
  }
  const canvas = document.createElement("canvas");
  composite(canvas, img, settings, { maxEdge }, overlays);
  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))), mime, format === "png" ? undefined : quality);
  });
}
