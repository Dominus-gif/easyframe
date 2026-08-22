// Client-side Canvas compositor. Draws background → device body (with shadow) →
// user screenshot (clipped to the screen region) → frame chrome, then exports.
// Nothing here touches the network: uploads never leave the browser.

import { deviceBySlug, type Device } from "@/lib/editor/devices";

export type BackgroundSetting =
  | { type: "solid"; color: string }
  | { type: "gradient"; from: string; to: string; angle: number }
  | { type: "transparent" }; // Premium

export type EditorSettings = {
  deviceSlug: string;
  background: BackgroundSetting;
  padding: number; // 0..1 fraction of frame max dim
  imageScale: number; // 1 = cover baseline
  imageOffsetX: number; // fraction of screen width
  imageOffsetY: number; // fraction of screen height
  imageRotate: number; // degrees
  fit: "cover" | "contain";
  shadow: number; // 0..1
  cornerRadius: number; // 0..1 of scene short edge / 2
};

export const defaultSettings: EditorSettings = {
  deviceSlug: "iphone-mockup",
  background: { type: "gradient", from: "#6d5dfc", to: "#ff5f8f", angle: 135 },
  padding: 0.16,
  imageScale: 1,
  imageOffsetX: 0,
  imageOffsetY: 0,
  imageRotate: 0,
  fit: "cover",
  shadow: 0.6,
  cornerRadius: 0.06
};

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

function laptopBaseHeight(device: Device) {
  return device.kind === "laptop" ? 46 : 0;
}

/** Total scene size (device + base + padding) in design units. */
function sceneSize(device: Device, settings: EditorSettings) {
  const pad = settings.padding * Math.max(device.frameW, device.frameH);
  const sceneW = device.frameW + pad * 2 + (device.kind === "laptop" ? device.frameW * 0.06 : 0);
  const sceneH = device.frameH + laptopBaseHeight(device) + pad * 2;
  return { pad, sceneW, sceneH };
}

function bodyPath(ctx: CanvasRenderingContext2D, device: Device) {
  if (device.kind === "browser") {
    rr(ctx, 0, 0, device.frameW, device.frameH, device.bodyRadius);
  } else if (device.kind === "laptop") {
    rr(ctx, 0, 0, device.frameW, device.frameH, device.bodyRadius);
  } else {
    rr(ctx, 0, 0, device.frameW, device.frameH, device.bodyRadius);
  }
}

function screenPath(ctx: CanvasRenderingContext2D, device: Device) {
  const s = device.screen;
  if (device.kind === "browser") {
    // Inset content with a small bottom rounding that sits safely inside the window.
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
  ctx.rotate((settings.imageRotate * Math.PI) / 180);
  const dw = iw * scale;
  const dh = ih * scale;
  ctx.drawImage(img as CanvasImageSource, -dw / 2, -dh / 2, dw, dh);
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
  // Subtle inner bezel highlight around the screen.
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 2;
  screenPath(ctx, device);
  ctx.stroke();
  ctx.restore();

  if (device.notch === "island") {
    const w = s.w * 0.3;
    const h = 30;
    rr(ctx, s.x + s.w / 2 - w / 2, s.y + 22, w, h, h / 2);
    ctx.fillStyle = "#000";
    ctx.fill();
  } else if (device.notch === "camera") {
    ctx.beginPath();
    ctx.arc(s.x + s.w / 2, s.y / 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.fill();
  }

  if (device.kind === "browser") {
    // Title bar.
    ctx.save();
    rr(ctx, 0, 0, device.frameW, 56 + 20, device.bodyRadius);
    ctx.clip();
    ctx.fillStyle = "#1c1c20";
    ctx.fillRect(0, 0, device.frameW, 56);
    ctx.restore();
    const dots = ["#ff5f57", "#febc2e", "#28c840"];
    dots.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(28 + i * 26, 28, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
    // Address pill.
    rr(ctx, device.frameW * 0.28, 16, device.frameW * 0.44, 26, 13);
    ctx.fillStyle = "#0e0e11";
    ctx.fill();
  }

  if (device.kind === "laptop") {
    // Base deck below the lid.
    const overhang = device.frameW * 0.06;
    const baseY = device.frameH;
    const baseH = 22;
    rr(ctx, -overhang, baseY, device.frameW + overhang * 2, baseH, 10);
    ctx.fillStyle = "#141416";
    ctx.fill();
    // Hinge notch.
    rr(ctx, device.frameW / 2 - device.frameW * 0.07, baseY, device.frameW * 0.14, 10, 5);
    ctx.fillStyle = "#0a0a0c";
    ctx.fill();
  }

  if (device.kind === "watch") {
    // Digital crown + side button on the right edge.
    rr(ctx, device.frameW - 4, device.frameH * 0.34, 12, 46, 6);
    ctx.fillStyle = "#1a1a1d";
    ctx.fill();
    rr(ctx, device.frameW - 3, device.frameH * 0.52, 9, 34, 4);
    ctx.fillStyle = "#151517";
    ctx.fill();
  }
}

function paintBackground(ctx: CanvasRenderingContext2D, bg: BackgroundSetting, w: number, h: number) {
  if (bg.type === "transparent") return;
  if (bg.type === "solid") {
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
    return;
  }
  const rad = (bg.angle * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  const cx = w / 2;
  const cy = h / 2;
  const half = Math.max(w, h);
  const grad = ctx.createLinearGradient(cx - x * half, cy - y * half, cx + x * half, cy + y * half);
  grad.addColorStop(0, bg.from);
  grad.addColorStop(1, bg.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

export type CompositeResult = { width: number; height: number };

/**
 * Render the full scene into `canvas`, scaled so the longest edge equals `maxEdge`.
 * Used both for the on-screen preview and for export.
 */
export function composite(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null,
  settings: EditorSettings,
  opts: { maxEdge: number }
): CompositeResult {
  const device = deviceBySlug(settings.deviceSlug);
  const { pad, sceneW, sceneH } = sceneSize(device, settings);
  const outScale = opts.maxEdge / Math.max(sceneW, sceneH);
  const width = Math.round(sceneW * outScale);
  const height = Math.round(sceneH * outScale);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return { width, height };
  ctx.clearRect(0, 0, width, height);
  ctx.setTransform(outScale, 0, 0, outScale, 0, 0);

  // Optional rounded output corners.
  if (settings.cornerRadius > 0) {
    const r = settings.cornerRadius * (Math.min(sceneW, sceneH) / 2);
    rr(ctx, 0, 0, sceneW, sceneH, r);
    ctx.clip();
  }

  paintBackground(ctx, settings.background, sceneW, sceneH);

  ctx.translate(pad + (device.kind === "laptop" ? device.frameW * 0.03 : 0), pad);

  // Device body + drop shadow.
  ctx.save();
  if (settings.shadow > 0) {
    ctx.shadowColor = `rgba(0,0,0,${(settings.shadow * 0.5).toFixed(3)})`;
    ctx.shadowBlur = settings.shadow * Math.max(device.frameW, device.frameH) * 0.09;
    ctx.shadowOffsetY = settings.shadow * device.frameH * 0.03;
  }
  bodyPath(ctx, device);
  ctx.fillStyle = device.bodyColor;
  ctx.fill();
  ctx.restore();

  // Screenshot, clipped to the screen region.
  ctx.save();
  screenPath(ctx, device);
  ctx.clip();
  if (img) drawImageInScreen(ctx, img, device, settings);
  else drawPlaceholder(ctx, device);
  ctx.restore();

  drawChrome(ctx, device);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return { width, height };
}

/** Load a File/Blob into an HTMLImageElement, downscaling very large images first (≤20MP guard). */
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
    // Downscale oversized images once, client-side, to keep compositing at 60fps.
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
    if (typeof source !== "string") {
      // Revoke after a tick so the image has decoded.
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
  }
}

export type ExportFormat = "png" | "jpeg" | "webp";

/** Export the current scene to a Blob at up to `maxEdge` px on the longest side. */
export async function exportScene(
  img: HTMLImageElement | HTMLCanvasElement | ImageBitmap | null,
  settings: EditorSettings,
  format: ExportFormat,
  quality: number,
  maxEdge: number
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  composite(canvas, img, settings, { maxEdge });
  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      mime,
      format === "png" ? undefined : quality
    );
  });
}
