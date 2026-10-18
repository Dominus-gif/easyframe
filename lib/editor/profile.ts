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

export type ProfileCardSettings = {
  style: ProfileCardStyle;
  theme: ProfileTheme;
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

function statsRow(
  ctx: CanvasRenderingContext2D,
  stats: ProfileStat[],
  x: number,
  y: number,
  pal: Palette,
  scale: number
) {
  let cursor = x;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  for (const s of stats) {
    ctx.font = "700 " + Math.round(26 * scale) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(s.value, cursor, y);
    const vw = ctx.measureText(s.value).width;
    ctx.font = "500 " + Math.round(24 * scale) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    const label = " " + s.label;
    ctx.fillText(label, cursor + vw, y);
    cursor += vw + ctx.measureText(label).width + 34 * scale;
  }
}

/** Natural card height for a style, at the given width. */
function cardHeight(style: ProfileCardStyle, w: number) {
  if (style === "minimal") return Math.round(w * 0.62);
  if (style === "ticket") return Math.round(w * 0.42);
  return Math.round(w * 0.58);
}

/** Draw the card to its own canvas; height follows the chosen style. */
export function renderProfileCard(
  profile: ProfileData,
  cfg: ProfileCardSettings,
  width = 1200
): HTMLCanvasElement {
  const w = Math.max(320, Math.round(width));
  const h = cardHeight(cfg.style, w);
  const scale = w / 1200;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const pal = palette(cfg.theme);

  ctx.save();
  rr(ctx, 0, 0, w, h, 36 * scale);
  ctx.clip();
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  const pad = 64 * scale;
  const name = profile.name || profile.handle;
  const handleText = handlePrefix(profile.platform) + profile.handle;

  if (cfg.style === "native") {
    const bannerH = cfg.showBanner ? Math.round(h * 0.3) : 0;
    if (bannerH) {
      if (profile.banner) {
        const iw = profile.banner.naturalWidth || 1;
        const ih = profile.banner.naturalHeight || 1;
        const s = Math.max(w / iw, bannerH / ih);
        ctx.drawImage(profile.banner, (w - iw * s) / 2, (bannerH - ih * s) / 2, iw * s, ih * s);
      } else {
        const g = ctx.createLinearGradient(0, 0, w, bannerH);
        g.addColorStop(0, cfg.accent);
        g.addColorStop(1, cfg.theme === "dark" ? "#0B1020" : "#BFD4FF");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, bannerH);
      }
    }
    const avR = 86 * scale;
    const avCy = bannerH ? bannerH + avR * 0.18 : pad + avR;
    drawAvatar(ctx, profile, pad + avR, avCy, avR, pal);

    let y = avCy + avR + 54 * scale;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "800 " + Math.round(44 * scale) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(name, pad, y);
    if (cfg.showVerified && profile.verified) {
      drawVerified(ctx, pad + ctx.measureText(name).width + 26 * scale, y - 14 * scale, 30 * scale, cfg.accent);
    }
    y += 36 * scale;
    ctx.font = "500 " + Math.round(27 * scale) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    ctx.fillText(handleText, pad, y);

    if (cfg.showBio && profile.bio) {
      y += 46 * scale;
      ctx.font = "400 " + Math.round(27 * scale) + "px " + FONT;
      ctx.fillStyle = pal.fg;
      for (const l of wrap(ctx, profile.bio, w - pad * 2 - 120 * scale, 2)) {
        ctx.fillText(l, pad, y);
        y += 38 * scale;
      }
    }
    if (cfg.showStats && profile.stats.length) {
      statsRow(ctx, profile.stats, pad, h - pad * 0.72, pal, scale);
    }
    if (cfg.showLogo && profile.platform !== "custom") {
      drawPlatformLogo(ctx, profile.platform, w - pad - 34 * scale, bannerH ? bannerH + 34 * scale : pad, 34 * scale, pal.dim);
    }
  } else if (cfg.style === "minimal") {
    const cx = w / 2;
    const avR = 92 * scale;
    let y = h * 0.2;
    drawAvatar(ctx, profile, cx, y, avR, pal);
    y += avR + 56 * scale;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "800 " + Math.round(46 * scale) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(name, cx, y);
    if (cfg.showVerified && profile.verified) {
      drawVerified(ctx, cx + ctx.measureText(name).width / 2 + 28 * scale, y - 14 * scale, 30 * scale, cfg.accent);
    }
    y += 40 * scale;
    ctx.font = "500 " + Math.round(27 * scale) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    ctx.fillText(handleText, cx, y);
    if (cfg.showBio && profile.bio) {
      y += 48 * scale;
      ctx.font = "400 " + Math.round(26 * scale) + "px " + FONT;
      ctx.fillStyle = pal.fg;
      for (const l of wrap(ctx, profile.bio, w * 0.66, 2)) {
        ctx.fillText(l, cx, y);
        y += 36 * scale;
      }
    }
    if (cfg.showStats && profile.stats.length) {
      ctx.font = "600 " + Math.round(25 * scale) + "px " + FONT;
      const gap = 52 * scale;
      const items = profile.stats.map((s) => {
        ctx.font = "700 " + Math.round(25 * scale) + "px " + FONT;
        const vw = ctx.measureText(s.value).width;
        ctx.font = "500 " + Math.round(24 * scale) + "px " + FONT;
        const lw = ctx.measureText("  " + s.label).width;
        return { s, vw, lw, total: vw + lw };
      });
      const total = items.reduce((a, b) => a + b.total, 0) + gap * (items.length - 1);
      let cursor = cx - total / 2;
      const sy = h - pad * 0.78;
      for (const it of items) {
        ctx.textAlign = "left";
        ctx.font = "700 " + Math.round(25 * scale) + "px " + FONT;
        ctx.fillStyle = pal.fg;
        ctx.fillText(it.s.value, cursor, sy);
        ctx.font = "500 " + Math.round(24 * scale) + "px " + FONT;
        ctx.fillStyle = pal.dim;
        ctx.fillText("  " + it.s.label, cursor + it.vw, sy);
        cursor += it.total + gap;
      }
    }
    if (cfg.showLogo && profile.platform !== "custom") {
      drawPlatformLogo(ctx, profile.platform, cx - 16 * scale, pad * 0.5, 32 * scale, pal.dim);
    }
  } else {
    // Ticket: body on the left, perforated stub on the right.
    const stubX = w * 0.7;
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = Math.max(2, 3 * scale);
    ctx.setLineDash([12 * scale, 12 * scale]);
    ctx.beginPath();
    ctx.moveTo(stubX, 26 * scale);
    ctx.lineTo(stubX, h - 26 * scale);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalCompositeOperation = "destination-out";
    for (const cy of [0, h]) {
      ctx.beginPath();
      ctx.arc(stubX, cy, 22 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    const avR = 68 * scale;
    const avCx = pad + avR;
    const avCy = h / 2 - 22 * scale;
    drawAvatar(ctx, profile, avCx, avCy, avR, pal);

    const tx = avCx + avR + 42 * scale;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.font = "800 " + Math.round(40 * scale) + "px " + FONT;
    ctx.fillStyle = pal.fg;
    ctx.fillText(name, tx, avCy - 6 * scale);
    if (cfg.showVerified && profile.verified) {
      drawVerified(ctx, tx + ctx.measureText(name).width + 24 * scale, avCy - 19 * scale, 28 * scale, cfg.accent);
    }
    ctx.font = "500 " + Math.round(25 * scale) + "px " + FONT;
    ctx.fillStyle = pal.dim;
    ctx.fillText(handleText, tx, avCy + 30 * scale);
    if (cfg.showBio && profile.bio) {
      ctx.font = "400 " + Math.round(23 * scale) + "px " + FONT;
      ctx.fillStyle = pal.dim;
      let by = avCy + 72 * scale;
      for (const l of wrap(ctx, profile.bio, stubX - tx - 40 * scale, 2)) {
        ctx.fillText(l, tx, by);
        by += 31 * scale;
      }
    }
    if (cfg.showStats && profile.stats.length) {
      const sx = stubX + (w - stubX) / 2;
      ctx.textAlign = "center";
      const shown = profile.stats.slice(0, 3);
      let sy = h / 2 - (shown.length - 1) * 38 * scale;
      for (const s of shown) {
        ctx.font = "800 " + Math.round(32 * scale) + "px " + FONT;
        ctx.fillStyle = pal.fg;
        ctx.fillText(s.value, sx, sy);
        ctx.font = "500 " + Math.round(19 * scale) + "px " + FONT;
        ctx.fillStyle = pal.dim;
        ctx.fillText(s.label.toUpperCase(), sx, sy + 26 * scale);
        sy += 76 * scale;
      }
    }
    if (cfg.showLogo && profile.platform !== "custom") {
      drawPlatformLogo(ctx, profile.platform, pad - 6 * scale, pad * 0.42, 28 * scale, pal.dim);
    }
  }

  ctx.restore();
  return canvas;
}
