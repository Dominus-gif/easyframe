// Profile cards: turn a social profile into a share-ready card.
//
// The card is drawn to its own canvas and then handed to the compositor as the
// subject image (with the frameless "blank" device), so every existing tool —
// backgrounds, frame styles, format presets, shadow, 3D tilt, export, copy and
// batch — applies to it without any special-casing.

export type ProfilePlatform = "github" | "x" | "custom";
export type ProfileCardStyle = "native" | "minimal" | "ticket";
export type ProfileTheme = "light" | "dark";

export type ProfileStat = { label: string; value: string };

export type ProfileData = {
  platform: ProfilePlatform;
  handle: string;
  name: string;
  bio: string;
  verified: boolean;
  stats: ProfileStat[];
  avatar: HTMLImageElement | null;
  banner: HTMLImageElement | null;
};

export type ProfileCardSize = "s" | "m" | "l";

export type ProfileCardSettings = {
  style: ProfileCardStyle;
  theme: ProfileTheme;
  size: ProfileCardSize;
  showStats: boolean;
  showVerified: boolean;
  showBio: boolean;
  showBanner: boolean;
  showLogo: boolean;
  accent: string;
};

export const defaultProfile: ProfileData = {
  platform: "github",
  handle: "octocat",
  name: "The Octocat",
  bio: "Load a handle above, or edit any of these details by hand.",
  verified: false,
  stats: [
    { label: "Followers", value: "18.4K" },
    { label: "Following", value: "212" },
    { label: "Repos", value: "48" }
  ],
  avatar: null,
  banner: null
};

export const defaultCardSettings: ProfileCardSettings = {
  style: "native",
  theme: "dark",
  size: "m",
  showStats: true,
  showVerified: true,
  showBio: true,
  showBanner: true,
  showLogo: true,
  accent: "#1753FE"
};

export const PLATFORM_LABEL: Record<ProfilePlatform, string> = {
  github: "GitHub",
  x: "X",
  custom: "Custom"
};

/** Prefix shown before the handle on the card. */
export function handlePrefix(p: ProfilePlatform) {
  return p === "github" ? "github.com/" : p === "x" ? "@" : "";
}

type Palette = { bg: string; fg: string; dim: string; line: string; chip: string };

function palette(theme: ProfileTheme): Palette {
  return theme === "dark"
    ? { bg: "#15171B", fg: "#F5F6F8", dim: "#9AA1AC", line: "rgba(255,255,255,.12)", chip: "rgba(255,255,255,.06)" }
    : { bg: "#FFFFFF", fg: "#0D1117", dim: "#5B6472", line: "rgba(10,20,40,.12)", chip: "rgba(10,20,40,.04)" };
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif';

/** Greedy word wrap, ellipsising the last line when it runs out of room. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = (text || "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  let truncated = false;
  for (const word of words) {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      if (lines.length >= maxLines) {
        truncated = true;
        line = "";
        break;
      }
      line = word;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  else if (line) truncated = true;
  if (truncated && lines.length) {
    let last = lines[lines.length - 1];
    while (last.length > 1 && ctx.measureText(last + "…").width > maxWidth) last = last.slice(0, -1);
    lines[lines.length - 1] = last + "…";
  }
  return lines;
}

function drawAvatar(ctx: CanvasRenderingContext2D, p: ProfileData, cx: number, cy: number, r: number, pal: Palette) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (p.avatar) {
    const iw = p.avatar.naturalWidth || p.avatar.width || 1;
    const ih = p.avatar.naturalHeight || p.avatar.height || 1;
    const s = Math.max((r * 2) / iw, (r * 2) / ih);
    ctx.drawImage(p.avatar, cx - (iw * s) / 2, cy - (ih * s) / 2, iw * s, ih * s);
  } else {
    ctx.fillStyle = pal.chip;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = pal.dim;
    ctx.font = "700 " + Math.round(r) + "px " + FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText((p.name || p.handle || "?").trim().charAt(0).toUpperCase(), cx, cy + 2);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(2, r * 0.06);
  ctx.strokeStyle = pal.bg;
  ctx.stroke();
}

function drawVerified(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    ctx.lineTo(Math.cos(a) * 12, Math.sin(a) * 12);
    const a2 = a + Math.PI / 8;
    ctx.lineTo(Math.cos(a2) * 9.4, Math.sin(a2) * 9.4);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-5, 0.5);
  ctx.lineTo(-1.5, 4);
  ctx.lineTo(5.5, -3.5);
  ctx.stroke();
  ctx.restore();
}

function drawPlatformLogo(
  ctx: CanvasRenderingContext2D,
  platform: ProfilePlatform,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = color;
  if (platform === "x") {
    ctx.beginPath();
    ctx.moveTo(1.5, 1.5);
    ctx.lineTo(9.5, 11.6);
    ctx.lineTo(1.9, 22.5);
    ctx.lineTo(4.4, 22.5);
    ctx.lineTo(10.7, 13.4);
    ctx.lineTo(17.6, 22.5);
    ctx.lineTo(23.2, 22.5);
    ctx.lineTo(14.8, 11.8);
    ctx.lineTo(22.0, 1.5);
    ctx.lineTo(19.5, 1.5);
    ctx.lineTo(13.6, 10.0);
    ctx.lineTo(7.1, 1.5);
    ctx.closePath();
    ctx.fill();
  } else if (platform === "github") {
    ctx.beginPath();
    ctx.arc(12, 12, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(12, 9.6, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(9.6, 13.5, 4.8, 9);
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}


/** A throwaway context used to measure text before the real canvas is sized. */
function measuringCtx(): CanvasRenderingContext2D | null {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 8;
  return c.getContext("2d");
}

/** A compact row of numbers, in the "31 followers  63 following" style. */
function drawStats(
  ctx: CanvasRenderingContext2D,
  stats: ProfileStat[],
  x: number,
  y: number,
  pal: Palette,
  W: number,
  centred = false
) {
  const valueFont = "700 " + Math.round(W * 0.034) + "px " + FONT;
  const labelFont = "400 " + Math.round(W * 0.034) + "px " + FONT;
  const gap = W * 0.035;
  ctx.textBaseline = "alphabetic";
  const parts = stats.map((s) => {
    ctx.font = valueFont;
    const vw = ctx.measureText(s.value).width;
    ctx.font = labelFont;
    const lw = ctx.measureText(" " + s.label.toLowerCase()).width;
    return { s, vw, lw };
  });
  const total = parts.reduce((a, b) => a + b.vw + b.lw, 0) + gap * Math.max(0, parts.length - 1);
  let cursor = centred ? x - total / 2 : x;
  ctx.textAlign = "left";
  for (const p of parts) {
    ctx.font = valueFont;
    ctx.fillStyle = pal.fg;
    ctx.fillText(p.s.value, cursor, y);
    ctx.font = labelFont;
    ctx.fillStyle = pal.dim;
    ctx.fillText(" " + p.s.label.toLowerCase(), cursor + p.vw, y);
    cursor += p.vw + p.lw + gap;
  }
}

/**
 * Draw the card to its own canvas.
 *
 * Height follows the content rather than a fixed ratio: a long bio makes the
 * card taller, a short one keeps it tight. A fixed height is what left a block
 * of dead space between the bio and the numbers and forced the card into a wide
 * letterbox, where a profile card wants to be close to square. Every metric is
 * a fraction of the width, so the card is resolution-independent.
 */
export function renderProfileCard(
  profile: ProfileData,
  cfg: ProfileCardSettings,
  width = 1200
): HTMLCanvasElement {
  const W = Math.max(320, Math.round(width));
  const pal = palette(cfg.theme);
  const pad = W * 0.05;
  const name = profile.name || profile.handle;
  const handleText = handlePrefix(profile.platform) + profile.handle;
  const bioSize = W * 0.034;
  const bioLH = bioSize * 1.42;

  // Measure first, so the canvas can be sized to its content.
  const m = measuringCtx();
  const bioMaxW = cfg.style === "minimal" ? W * 0.76 : W - pad * 2;
  let bioLines: string[] = [];
  if (m && cfg.showBio && profile.bio) {
    m.font = "400 " + Math.round(bioSize) + "px " + FONT;
    bioLines = wrap(m, profile.bio, bioMaxW, 3);
  }

  const bannerH = cfg.showBanner && cfg.style === "native" ? W * 0.27 : 0;
  const avR = cfg.style === "minimal" ? W * 0.105 : W * 0.095;

  let H: number;
  if (cfg.style === "ticket") {
    H = W * 0.38;
  } else if (cfg.style === "minimal") {
    H =
      W * 0.1 +
      avR * 2 +
      W * 0.07 +
      W * 0.052 +
      W * 0.045 +
      (bioLines.length ? W * 0.03 + bioLines.length * bioLH : 0) +
      (cfg.showStats && profile.stats.length ? W * 0.075 : 0) +
      W * 0.07;
  } else {
    const avBottom = (bannerH || pad + avR) + avR;
    H =
      avBottom +
      W * 0.062 +
      W * 0.044 +
      (bioLines.length ? W * 0.018 + bioLines.length * bioLH : 0) +
      (cfg.showStats && profile.stats.length ? W * 0.072 : 0) +
      pad;
  }
  H = Math.round(H);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.save();
  rr(ctx, 0, 0, W, H, W * 0.045);
  ctx.clip();
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, W, H);

  if (cfg.style === "native") {
    if (bannerH) {
      if (profile.banner) {
        const iw = profile.banner.naturalWidth || 1;
        const ih = profile.banner.naturalHeight || 1;
        const s = Math.max(W / iw, bannerH / ih);
        ctx.drawImage(profile.banner, (W - iw * s) / 2, (bannerH - ih * s) / 2, iw * s, ih * s);
      } else {
        const g = ctx.createLinearGradient(0, 0, W, bannerH);
        g.addColorStop(0, cfg.accent);
        g.addColorStop(1, cfg.theme === "dark" ? "#0B1020" : "#C7D9FF");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, bannerH);
      }
    }
    const avCy = bannerH ? bannerH : pad + avR;
    drawAvatar(ctx, profile, pad + avR, avCy, avR, pal);

    let y = avCy + avR + W * 0.062;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "800 " + Math.round(W * 0.052) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(name, pad, y);
    if (cfg.showVerified && profile.verified) {
      drawVerified(ctx, pad + ctx.measureText(name).width + W * 0.022, y - W * 0.017, W * 0.032, cfg.accent);
    }
    y += W * 0.044;
    ctx.font = "400 " + Math.round(W * 0.036) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    ctx.fillText(handleText, pad, y);

    if (bioLines.length) {
      y += W * 0.018 + bioLH * 0.78;
      ctx.font = "400 " + Math.round(bioSize) + "px " + FONT;
      ctx.fillStyle = pal.fg;
      for (const l of bioLines) {
        ctx.fillText(l, pad, y);
        y += bioLH;
      }
      y -= bioLH;
    }
    if (cfg.showStats && profile.stats.length) {
      drawStats(ctx, profile.stats, pad, y + W * 0.062, pal, W);
    }
    if (cfg.showLogo && profile.platform !== "custom") {
      drawPlatformLogo(ctx, profile.platform, W - pad - W * 0.028, pad * 0.82, W * 0.028, pal.dim);
    }
  } else if (cfg.style === "minimal") {
    const cx = W / 2;
    let y = W * 0.1 + avR;
    drawAvatar(ctx, profile, cx, y, avR, pal);
    y += avR + W * 0.07;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "800 " + Math.round(W * 0.052) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(name, cx, y);
    if (cfg.showVerified && profile.verified) {
      drawVerified(ctx, cx + ctx.measureText(name).width / 2 + W * 0.024, y - W * 0.017, W * 0.032, cfg.accent);
    }
    y += W * 0.045;
    ctx.font = "400 " + Math.round(W * 0.036) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    ctx.fillText(handleText, cx, y);
    if (bioLines.length) {
      y += W * 0.03 + bioLH * 0.78;
      ctx.font = "400 " + Math.round(bioSize) + "px " + FONT;
      ctx.fillStyle = pal.fg;
      for (const l of bioLines) {
        ctx.fillText(l, cx, y);
        y += bioLH;
      }
      y -= bioLH;
    }
    if (cfg.showStats && profile.stats.length) {
      drawStats(ctx, profile.stats, cx, y + W * 0.07, pal, W, true);
    }
    if (cfg.showLogo && profile.platform !== "custom") {
      drawPlatformLogo(ctx, profile.platform, cx - W * 0.014, W * 0.042, W * 0.028, pal.dim);
    }
  } else {
    const stubX = W * 0.71;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = Math.max(2, W * 0.0025);
    ctx.setLineDash([W * 0.01, W * 0.01]);
    ctx.beginPath();
    ctx.moveTo(stubX, W * 0.022);
    ctx.lineTo(stubX, H - W * 0.022);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = "destination-out";
    for (const cy of [0, H]) {
      ctx.beginPath();
      ctx.arc(stubX, cy, W * 0.018, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    const tAvR = W * 0.072;
    const avCx = pad + tAvR;
    const avCy = H / 2 - W * 0.012;
    drawAvatar(ctx, profile, avCx, avCy, tAvR, pal);

    const tx = avCx + tAvR + W * 0.035;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "800 " + Math.round(W * 0.044) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(name, tx, avCy - W * 0.004);
    if (cfg.showVerified && profile.verified) {
      drawVerified(ctx, tx + ctx.measureText(name).width + W * 0.02, avCy - W * 0.019, W * 0.03, cfg.accent);
    }
    ctx.font = "400 " + Math.round(W * 0.032) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    ctx.fillText(handleText, tx, avCy + W * 0.032);
    if (m && cfg.showBio && profile.bio) {
      const tSize = Math.round(W * 0.028);
      m.font = "400 " + tSize + "px " + FONT;
      const lines = wrap(m, profile.bio, stubX - tx - W * 0.03, 2);
      ctx.font = "400 " + tSize + "px " + FONT;
      ctx.fillStyle = pal.dim;
      let by = avCy + W * 0.072;
      for (const l of lines) {
        ctx.fillText(l, tx, by);
        by += W * 0.038;
      }
    }
    if (cfg.showStats && profile.stats.length) {
      const sx = stubX + (W - stubX) / 2;
      ctx.textAlign = "center";
      const shown = profile.stats.slice(0, 3);
      let sy = H / 2 - (shown.length - 1) * W * 0.035 - W * 0.004;
      for (const st of shown) {
        ctx.font = "800 " + Math.round(W * 0.032) + "px " + FONT;
        ctx.fillStyle = pal.fg;
        ctx.fillText(st.value, sx, sy);
        ctx.font = "500 " + Math.round(W * 0.017) + "px " + FONT;
        ctx.fillStyle = pal.dim;
        ctx.fillText(st.label.toUpperCase(), sx, sy + W * 0.024);
        sy += W * 0.07;
      }
    }
    if (cfg.showLogo && profile.platform !== "custom") {
      drawPlatformLogo(ctx, profile.platform, pad - W * 0.005, pad * 0.6, W * 0.026, pal.dim);
    }
  }

  ctx.restore();
  return canvas;
}
