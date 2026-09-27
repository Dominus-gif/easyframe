import type { BackgroundSetting, MeshBlob } from "@/lib/editor/compositor";
import { gradientPresets } from "@/lib/editor/devices";

export type BackgroundPreset = { id: string; label: string; bg: BackgroundSetting };

const mesh = (base: string, blobs: MeshBlob[], grain = 0): BackgroundSetting => ({ type: "mesh", base, blobs, angle: 0, grain });
const b = (x: number, y: number, r: number, color: string): MeshBlob => ({ x, y, r, color });

/**
 * Editor background presets. The first eight are what the panel shows before
 * "Show more", so they lead with the signature mesh/grain looks.
 */
export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  // Grainy navy -> electric blue -> icy highlight.
  { id: "abyss", label: "Abyss", bg: mesh("#030616", [b(0.3, 0.78, 0.75, "#0b1f6b"), b(0.74, 0.6, 0.55, "#1e4fc4"), b(1.0, 0.36, 0.34, "#3f86e6"), b(0.98, 0.84, 0.4, "#bfeeff")], 0.55) },
  // Soft pastel mesh: white, periwinkle, pink, coral, cornflower.
  { id: "candy", label: "Candy", bg: mesh("#d9c8f3", [b(0.0, 0.0, 0.5, "#fdfbff"), b(0.6, 0.14, 0.46, "#9b8cf1"), b(1.0, 0.45, 0.5, "#f4a8ff"), b(0.22, 0.76, 0.46, "#f5747a"), b(0.95, 1.0, 0.44, "#79a6ff")]) },
  // Deep violet night with a hot pink corner and an ember-orange flare.
  { id: "ember", label: "Ember", bg: mesh("#06041c", [b(0.25, 0.95, 0.6, "#2b0a78"), b(0.0, 0.0, 0.42, "#ff0a4a"), b(1.0, 0.96, 0.46, "#c8100f"), b(1.0, 1.0, 0.22, "#ff6a1f")]) },
  { id: "tangerine", label: "Tangerine", bg: { type: "gradient", kind: "linear", from: "#ff5f1f", to: "#ffffff", angle: 180 } },
  { id: "aurora", label: "Aurora", bg: mesh("#04121a", [b(0.2, 0.3, 0.5, "#13c7a1"), b(0.58, 0.08, 0.36, "#6cf29a"), b(0.88, 0.6, 0.52, "#7b4dff"), b(0.3, 0.98, 0.5, "#1b3f9c")], 0.35) },
  { id: "peach", label: "Peach", bg: mesh("#ffd8c8", [b(0.1, 0.92, 0.55, "#ff9a8b"), b(0.92, 0.1, 0.5, "#ffd3a5"), b(0.86, 0.86, 0.44, "#ffb8d9"), b(0.18, 0.12, 0.44, "#fff4e6")], 0.1) },
  { id: "holo", label: "Holo", bg: mesh("#e8f0ff", [b(0.1, 0.2, 0.46, "#a6f6ff"), b(0.9, 0.18, 0.46, "#fbb6ff"), b(0.5, 0.98, 0.5, "#ffe29a"), b(0.5, 0.5, 0.34, "#c3b4ff")], 0.06) },
  { id: "noir", label: "Noir Glow", bg: mesh("#050507", [b(0.86, 0.14, 0.46, "#3a2dff"), b(0.14, 0.9, 0.42, "#ff2e88")], 0.45) },

  { id: "lagoon", label: "Lagoon", bg: mesh("#062a3a", [b(0.82, 0.18, 0.5, "#00c2d1"), b(0.15, 0.86, 0.55, "#1c6dd0"), b(0.96, 0.96, 0.3, "#7cf5d6")], 0.3) },
  { id: "dusk", label: "Dusk", bg: mesh("#1a1033", [b(0.1, 1.0, 0.56, "#ff7e5f"), b(0.42, 1.05, 0.36, "#feb47b"), b(0.9, 0.1, 0.56, "#6a3093")], 0.25) },
  { id: "plasma", label: "Plasma", bg: mesh("#120433", [b(0.2, 0.2, 0.46, "#ff00c8"), b(0.82, 0.82, 0.46, "#00e5ff"), b(0.82, 0.18, 0.4, "#7a00ff")], 0.2) },
  { id: "mint-cream", label: "Mint Cream", bg: mesh("#e6fff5", [b(0.2, 0.82, 0.5, "#9ff5d0"), b(0.86, 0.2, 0.5, "#b8e0ff"), b(0.82, 0.92, 0.4, "#fdfdf5")]) },
  { id: "spotlight", label: "Spotlight", bg: { type: "gradient", kind: "radial", from: "#43436a", to: "#08080e", angle: 0, cx: 0.5, cy: 0.32, grain: 0.3 } },
  { id: "sunrise", label: "Sunrise", bg: { type: "gradient", kind: "radial", from: "#ffd27f", via: "#ff7a59", to: "#2b1b4a", angle: 0, cx: 0.5, cy: 1 } },
  { id: "halo", label: "Halo", bg: { type: "gradient", kind: "radial", from: "#ffffff", via: "#dfe8ff", to: "#8aa4ff", angle: 0, cx: 0.5, cy: 0.5 } },
  { id: "blush", label: "Blush Fade", bg: { type: "gradient", kind: "linear", from: "#ffc7d6", to: "#ffffff", angle: 180 } },
  { id: "midnight-fade", label: "Midnight Fade", bg: { type: "gradient", kind: "linear", from: "#0b1026", to: "#3a4a9f", angle: 180, grain: 0.3 } },
  ...gradientPresets.map((g) => ({
    id: g.id,
    label: g.label,
    bg: { type: "gradient" as const, kind: "linear" as const, from: g.from, to: g.to, angle: g.angle }
  }))
];

function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

function rotated(blobs: MeshBlob[], angle = 0): MeshBlob[] {
  if (!angle) return blobs;
  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return blobs.map((bl) => {
    const x = bl.x - 0.5;
    const y = bl.y - 0.5;
    return { ...bl, x: 0.5 + x * cos - y * sin, y: 0.5 + x * sin + y * cos };
  });
}

function grainLayer(amount: number) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='${(amount * 0.5).toFixed(2)}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** CSS `background` equivalent of a background setting, for swatches and previews. */
export function backgroundCss(bg: BackgroundSetting): string {
  if (bg.type === "solid") return bg.color;
  if (bg.type === "transparent" || bg.type === "image") return "transparent";

  const layers: string[] = [];
  const grain = bg.grain ?? 0;
  if (grain > 0) layers.push(grainLayer(grain));

  if (bg.type === "mesh") {
    // CSS paints the first layer on top; the canvas paints later blobs on top.
    for (const bl of [...rotated(bg.blobs, bg.angle)].reverse()) {
      const r = (bl.r * 100).toFixed(1);
      layers.push(
        `radial-gradient(${r}% ${r}% at ${(bl.x * 100).toFixed(1)}% ${(bl.y * 100).toFixed(1)}%, ` +
          `${rgba(bl.color, 1)} 0%, ${rgba(bl.color, 0.82)} 35%, ${rgba(bl.color, 0.36)} 65%, ${rgba(bl.color, 0)} 100%)`
      );
    }
    layers.push(`linear-gradient(${bg.base}, ${bg.base})`);
    return layers.join(", ");
  }

  const stops = [bg.from, bg.via, bg.to].filter(Boolean).join(", ");
  layers.push(
    bg.kind === "radial"
      ? `radial-gradient(circle farthest-corner at ${((bg.cx ?? 0.5) * 100).toFixed(1)}% ${((bg.cy ?? 0.5) * 100).toFixed(1)}%, ${stops})`
      : `linear-gradient(${bg.angle}deg, ${stops})`
  );
  return layers.join(", ");
}

/** Colors a gradient/mesh is made of, in order. Used when switching types. */
export function paletteOf(bg: BackgroundSetting): string[] {
  if (bg.type === "mesh") return [bg.base, ...bg.blobs.map((bl) => bl.color)];
  if (bg.type === "gradient") return [bg.from, bg.via, bg.to].filter(Boolean) as string[];
  if (bg.type === "solid") return [bg.color];
  return ["#2f6bff", "#22b8e6"];
}

/** Turn a list of colors into a pleasant mesh (base + corner blobs). */
export function meshFromColors(colors: string[], grain = 0, angle = 0): BackgroundSetting {
  const [first, ...rest] = colors.length ? colors : ["#2f6bff"];
  const spots = [
    [0.12, 0.18, 0.62],
    [0.9, 0.86, 0.6],
    [0.86, 0.14, 0.46],
    [0.16, 0.9, 0.46],
    [0.5, 0.5, 0.4]
  ];
  const blobColors = rest.length ? rest : [first];
  return {
    type: "mesh",
    base: first,
    blobs: blobColors.slice(0, spots.length).map((c, i) => b(spots[i][0], spots[i][1], spots[i][2], c)),
    angle,
    grain
  };
}
