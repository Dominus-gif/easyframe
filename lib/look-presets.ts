import { backgrounds } from "@/lib/mockup-data";

// Curated one-tap "looks" — each bundles a background + shadow + effect + frame + framing
// so a non-designer can get a polished, on-trend result in a single click.
export type LookPreset = {
  id: string;
  label: string;
  backgroundId: string;
  shadowId: string;
  effectId: string;
  edgeStyleId: string;
  padding: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
};

export const lookPresets: LookPreset[] = [
  { id: "clean-studio", label: "Clean Studio", backgroundId: "champagne", shadowId: "spread", effectId: "clean", edgeStyleId: "default", padding: 78, rotateX: 0, rotateY: 0, rotateZ: 0 },
  { id: "bold-pop", label: "Bold Pop", backgroundId: "gradient-29", shadowId: "hug", effectId: "clean", edgeStyleId: "card", padding: 64, rotateX: 0, rotateY: 0, rotateZ: 0 },
  { id: "deep-focus", label: "Deep Focus", backgroundId: "soft-orbit", shadowId: "glow", effectId: "glow", edgeStyleId: "glass-light", padding: 84, rotateX: 0, rotateY: 0, rotateZ: 0 },
  { id: "tilt-hero", label: "Tilt Hero", backgroundId: "gradient-37", shadowId: "spread", effectId: "clean", edgeStyleId: "default", padding: 92, rotateX: 6, rotateY: -16, rotateZ: 0 },
  { id: "soft-light", label: "Soft Light", backgroundId: "aurora", shadowId: "adaptive", effectId: "glass", edgeStyleId: "glass-light", padding: 88, rotateX: 0, rotateY: 0, rotateZ: 0 },
  { id: "dark-mode", label: "Midnight", backgroundId: "arctic-glow", shadowId: "glow", effectId: "glow", edgeStyleId: "inset-dark", padding: 80, rotateX: 0, rotateY: 0, rotateZ: 0 },
  { id: "warm-sunset", label: "Warm Sunset", backgroundId: "studio-fog", shadowId: "hug", effectId: "vignette", edgeStyleId: "default", padding: 74, rotateX: 0, rotateY: 0, rotateZ: 0 },
  { id: "emerald", label: "Emerald", backgroundId: "emerald-night", shadowId: "spread", effectId: "clean", edgeStyleId: "border", padding: 82, rotateX: 0, rotateY: 12, rotateZ: 0 }
];

/** Lightweight preview swatch for a look, derived from its background preset. */
export function lookPreviewCss(look: LookPreset): string {
  return backgrounds.find((background) => background.id === look.backgroundId)?.css ?? "#222";
}
