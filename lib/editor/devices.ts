// Device registry for the free Canvas editor.
// Frames are drawn procedurally on the client (see compositor.ts) in these design-unit
// coordinate spaces — fully client-side, no server rendering (see /DECISIONS.md).

export type DeviceKind = "phone" | "tablet" | "laptop" | "browser" | "watch" | "desktop" | "blank";

export type ScreenRect = { x: number; y: number; w: number; h: number; r: number };

export type Device = {
  slug: string;
  name: string;
  /** Marketing phrase used as the H1 on the template SEO page. */
  seoTitle: string;
  kind: DeviceKind;
  category: "phone" | "tablet" | "laptop" | "browser" | "watch" | "desktop" | "blank";
  frameW: number;
  frameH: number;
  screen: ScreenRect;
  bodyRadius: number;
  bodyColor: string;
  notch?: "island" | "camera" | "punch" | "none";
};

export const devices: Device[] = [
  {
    slug: "iphone-mockup",
    name: "iPhone",
    seoTitle: "Free iPhone Mockup Generator",
    kind: "phone",
    category: "phone",
    frameW: 460, frameH: 940,
    screen: { x: 18, y: 18, w: 424, h: 904, r: 74 },
    bodyRadius: 90, bodyColor: "#0a0a0c", notch: "island"
  },
  {
    slug: "android-phone-mockup",
    name: "Android Phone",
    seoTitle: "Free Android Phone Mockup Generator",
    kind: "phone",
    category: "phone",
    frameW: 452, frameH: 936,
    screen: { x: 15, y: 15, w: 422, h: 906, r: 46 },
    bodyRadius: 56, bodyColor: "#0b0b0d", notch: "punch"
  },
  {
    slug: "pixel-phone-mockup",
    name: "Google Pixel",
    seoTitle: "Free Google Pixel Mockup Generator",
    kind: "phone",
    category: "phone",
    frameW: 456, frameH: 940,
    screen: { x: 16, y: 16, w: 424, h: 908, r: 40 },
    bodyRadius: 50, bodyColor: "#0a0a0c", notch: "punch"
  },
  {
    slug: "ipad-mockup",
    name: "iPad",
    seoTitle: "Free iPad Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 900, frameH: 1200,
    screen: { x: 30, y: 30, w: 840, h: 1140, r: 22 },
    bodyRadius: 48, bodyColor: "#0c0c0e", notch: "camera"
  },
  {
    slug: "ipad-mini-mockup",
    name: "iPad mini",
    seoTitle: "Free iPad mini Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 820, frameH: 1180,
    screen: { x: 26, y: 26, w: 768, h: 1128, r: 26 },
    bodyRadius: 44, bodyColor: "#0c0c0e", notch: "camera"
  },
  {
    slug: "android-tablet-mockup",
    name: "Android Tablet",
    seoTitle: "Free Android Tablet Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 920, frameH: 1300,
    screen: { x: 28, y: 28, w: 864, h: 1244, r: 18 },
    bodyRadius: 40, bodyColor: "#0c0c0e", notch: "camera"
  },
  {
    slug: "macbook-pro-mockup",
    name: "MacBook Pro",
    seoTitle: "Free MacBook Mockup Generator",
    kind: "laptop",
    category: "laptop",
    frameW: 1440, frameH: 960,
    screen: { x: 60, y: 44, w: 1320, h: 792, r: 14 },
    bodyRadius: 26, bodyColor: "#0b0b0d"
  },
  {
    slug: "surface-laptop-mockup",
    name: "Surface Laptop",
    seoTitle: "Free Windows Laptop Mockup Generator",
    kind: "laptop",
    category: "laptop",
    frameW: 1460, frameH: 940,
    screen: { x: 54, y: 40, w: 1352, h: 812, r: 8 },
    bodyRadius: 16, bodyColor: "#0c0c0e"
  },
  {
    slug: "desktop-monitor-mockup",
    name: "Desktop Monitor",
    seoTitle: "Free Desktop Monitor Mockup Generator",
    kind: "desktop",
    category: "desktop",
    frameW: 1520, frameH: 940,
    screen: { x: 40, y: 40, w: 1440, h: 820, r: 10 },
    bodyRadius: 20, bodyColor: "#0c0c0e"
  },
  {
    slug: "browser-mockup",
    name: "Browser Window",
    seoTitle: "Free Browser Mockup Generator",
    kind: "browser",
    category: "browser",
    frameW: 1320, frameH: 880,
    screen: { x: 0, y: 56, w: 1320, h: 824, r: 0 },
    bodyRadius: 18, bodyColor: "#141416"
  },
  {
    slug: "apple-watch-mockup",
    name: "Apple Watch",
    seoTitle: "Free Apple Watch Mockup Generator",
    kind: "watch",
    category: "watch",
    frameW: 372, frameH: 452,
    screen: { x: 30, y: 30, w: 312, h: 392, r: 70 },
    bodyRadius: 96, bodyColor: "#0a0a0c"
  },
  {
    slug: "apple-watch-ultra-mockup",
    name: "Apple Watch Ultra",
    seoTitle: "Free Apple Watch Ultra Mockup Generator",
    kind: "watch",
    category: "watch",
    frameW: 392, frameH: 468,
    screen: { x: 30, y: 32, w: 332, h: 404, r: 60 },
    bodyRadius: 72, bodyColor: "#12100c"
  },
  {
    slug: "iphone-se-mockup",
    name: "iPhone SE",
    seoTitle: "Free iPhone SE Mockup Generator",
    kind: "phone",
    category: "phone",
    frameW: 440, frameH: 884,
    screen: { x: 22, y: 96, w: 396, h: 692, r: 6 },
    bodyRadius: 62, bodyColor: "#0a0a0c", notch: "none"
  },
  {
    slug: "foldable-phone-mockup",
    name: "Foldable Phone",
    seoTitle: "Free Foldable Phone Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 1000, frameH: 1040,
    screen: { x: 26, y: 26, w: 948, h: 988, r: 16 },
    bodyRadius: 30, bodyColor: "#0b0b0d", notch: "punch"
  },
  {
    slug: "kindle-mockup",
    name: "E-Reader",
    seoTitle: "Free E-Reader Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 820, frameH: 1120,
    screen: { x: 64, y: 60, w: 692, h: 1000, r: 6 },
    bodyRadius: 26, bodyColor: "#111214"
  },
  {
    slug: "chromebook-mockup",
    name: "Chromebook",
    seoTitle: "Free Chromebook Mockup Generator",
    kind: "laptop",
    category: "laptop",
    frameW: 1420, frameH: 940,
    screen: { x: 70, y: 44, w: 1280, h: 806, r: 8 },
    bodyRadius: 18, bodyColor: "#0c0c0e"
  },
  {
    slug: "smart-tv-mockup",
    name: "Smart TV",
    seoTitle: "Free Smart TV Mockup Generator",
    kind: "desktop",
    category: "desktop",
    frameW: 1640, frameH: 950,
    screen: { x: 26, y: 26, w: 1588, h: 894, r: 6 },
    bodyRadius: 14, bodyColor: "#0a0a0c"
  },
  {
    slug: "ultrawide-monitor-mockup",
    name: "Ultrawide Monitor",
    seoTitle: "Free Ultrawide Monitor Mockup Generator",
    kind: "desktop",
    category: "desktop",
    frameW: 1720, frameH: 760,
    screen: { x: 24, y: 24, w: 1672, h: 672, r: 8 },
    bodyRadius: 16, bodyColor: "#0c0c0e"
  }
];

// "Blank" is editor-only (no device frame, no SEO template page). It sizes itself to the
// pasted image; the compositor renders the image directly with rounded corners.
export const BLANK_DEVICE: Device = {
  slug: "blank",
  name: "Blank",
  seoTitle: "",
  kind: "blank",
  category: "blank",
  frameW: 1200,
  frameH: 750,
  screen: { x: 0, y: 0, w: 1200, h: 750, r: 0 },
  bodyRadius: 0,
  bodyColor: "#0a0a0c"
};

/** Devices shown in the editor picker — includes Blank (frameless). */
export const editorDevices: Device[] = [BLANK_DEVICE, ...devices];

export function deviceBySlug(slug: string): Device {
  return editorDevices.find((device) => device.slug === slug) ?? devices[0];
}

export const gradientPresets: { id: string; label: string; from: string; to: string; angle: number }[] = [
  { id: "azure", label: "Azure", from: "#2f6bff", to: "#22b8e6", angle: 135 },
  { id: "ocean", label: "Ocean", from: "#0061ff", to: "#60efff", angle: 135 },
  { id: "sky", label: "Sky", from: "#56ccf2", to: "#2f80ed", angle: 135 },
  { id: "indigo", label: "Indigo", from: "#4f46e5", to: "#7aa2ff", angle: 135 },
  { id: "teal", label: "Teal", from: "#0f9d76", to: "#3dd7a1", angle: 135 },
  { id: "mint", label: "Mint", from: "#13e0c4", to: "#5b8def", angle: 135 },
  { id: "lime", label: "Lime", from: "#56ab2f", to: "#a8e063", angle: 135 },
  { id: "sunset", label: "Sunset", from: "#ff6f61", to: "#ffb347", angle: 135 },
  { id: "coral", label: "Coral", from: "#ff7a59", to: "#ff4d6d", angle: 135 },
  { id: "rose", label: "Rose", from: "#f857a6", to: "#ff8a5c", angle: 135 },
  { id: "magenta", label: "Magenta", from: "#ec38bc", to: "#7303c0", angle: 135 },
  { id: "violet", label: "Violet", from: "#7b4dff", to: "#4f8cff", angle: 135 },
  { id: "gold", label: "Gold", from: "#f7971e", to: "#ffd200", angle: 135 },
  { id: "midnight", label: "Midnight", from: "#0f2027", to: "#2c5364", angle: 135 },
  { id: "slate", label: "Slate", from: "#334155", to: "#0f172a", angle: 135 },
  { id: "steel", label: "Steel", from: "#64748b", to: "#cbd5e1", angle: 135 }
];
