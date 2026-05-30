export type DeviceKind = "freeform" | "phone" | "laptop" | "browser" | "tablet";

export type DevicePreset = {
  id: string;
  label: string;
  type: DeviceKind;
  ratio: number;
  premium: boolean;
};

export type BackgroundPreset = {
  id: string;
  label: string;
  css: string;
};

export type EdgeStyle = {
  id: string;
  label: string;
  radius: number;
  preview: string;
};

export type ShadowPreset = {
  id: string;
  label: string;
  shadow: string;
};

export type EffectPreset = {
  id: string;
  label: string;
  className: string;
};

export type TemplatePreset = {
  id: string;
  label: string;
  category: "Blank" | "Avatar" | "Banner" | "Post" | "Story" | "Shot";
  platform?: string;
  orientation: "Square" | "Portrait" | "Landscape" | "Vertical" | "Wide";
  width: number;
  height: number;
  safeZone?: "circle" | "youtube-banner" | "vertical-ui";
  deviceId: string;
  backgroundId: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  zoom: number;
  padding?: number;
  edgeStyleId?: string;
  shadowId?: string;
  effectId?: string;
};
