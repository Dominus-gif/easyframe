// Device registry for the free Canvas editor.
// Frames are drawn procedurally on the client (see compositor.ts) in these design-unit
// coordinate spaces — fully client-side, no server rendering (see /DECISIONS.md for the
// note on procedural frames vs. static SVG assets).

export type DeviceKind = "phone" | "tablet" | "laptop" | "browser" | "watch";

export type ScreenRect = { x: number; y: number; w: number; h: number; r: number };

export type Device = {
  slug: string;
  name: string;
  /** Marketing phrase used as the H1 on the template SEO page (Phase 2). */
  seoTitle: string;
  kind: DeviceKind;
  category: "phone" | "tablet" | "laptop" | "browser" | "watch";
  /** Natural frame dimensions in design units. */
  frameW: number;
  frameH: number;
  /** Screen (content) region within the frame where the user image is composited. */
  screen: ScreenRect;
  /** Outer body corner radius (ignored for laptop/browser which draw custom chrome). */
  bodyRadius: number;
  bodyColor: string;
  notch?: "island" | "camera" | "none";
};

export const devices: Device[] = [
  {
    slug: "iphone-mockup",
    name: "iPhone",
    seoTitle: "Free iPhone Mockup Generator",
    kind: "phone",
    category: "phone",
    frameW: 460,
    frameH: 940,
    screen: { x: 18, y: 18, w: 424, h: 904, r: 74 },
    bodyRadius: 90,
    bodyColor: "#0a0a0c",
    notch: "island"
  },
  {
    slug: "ipad-mockup",
    name: "iPad",
    seoTitle: "Free iPad Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 900,
    frameH: 1200,
    screen: { x: 30, y: 30, w: 840, h: 1140, r: 22 },
    bodyRadius: 48,
    bodyColor: "#0c0c0e",
    notch: "camera"
  },
  {
    slug: "macbook-pro-mockup",
    name: "MacBook Pro",
    seoTitle: "Free MacBook Mockup Generator",
    kind: "laptop",
    category: "laptop",
    frameW: 1440,
    frameH: 960,
    // Lid occupies the top; base deck is drawn below the lid by the compositor.
    screen: { x: 60, y: 44, w: 1320, h: 792, r: 14 },
    bodyRadius: 26,
    bodyColor: "#0b0b0d"
  },
  {
    slug: "android-tablet-mockup",
    name: "Android Tablet",
    seoTitle: "Free Android Tablet Mockup Generator",
    kind: "tablet",
    category: "tablet",
    frameW: 920,
    frameH: 1300,
    screen: { x: 28, y: 28, w: 864, h: 1244, r: 18 },
    bodyRadius: 40,
    bodyColor: "#0c0c0e",
    notch: "camera"
  },
  {
    slug: "browser-mockup",
    name: "Browser Window",
    seoTitle: "Free Browser Mockup Generator",
    kind: "browser",
    category: "browser",
    frameW: 1320,
    frameH: 880,
    // Content area sits below a 56u title bar; compositor draws the chrome.
    screen: { x: 0, y: 56, w: 1320, h: 824, r: 0 },
    bodyRadius: 18,
    bodyColor: "#141416"
  },
  {
    slug: "apple-watch-mockup",
    name: "Apple Watch",
    seoTitle: "Free Apple Watch Mockup Generator",
    kind: "watch",
    category: "watch",
    frameW: 372,
    frameH: 452,
    screen: { x: 30, y: 30, w: 312, h: 392, r: 70 },
    bodyRadius: 96,
    bodyColor: "#0a0a0c"
  }
];

export function deviceBySlug(slug: string): Device {
  return devices.find((device) => device.slug === slug) ?? devices[0];
}

export const gradientPresets: { id: string; label: string; from: string; to: string; angle: number }[] = [
  { id: "violet", label: "Violet", from: "#6d5dfc", to: "#ff5f8f", angle: 135 },
  { id: "ocean", label: "Ocean", from: "#0061ff", to: "#60efff", angle: 135 },
  { id: "sunset", label: "Sunset", from: "#ff6f61", to: "#ffb347", angle: 135 },
  { id: "mint", label: "Mint", from: "#13e0c4", to: "#5b8def", angle: 135 },
  { id: "graphite", label: "Graphite", from: "#232526", to: "#414345", angle: 135 },
  { id: "candy", label: "Candy", from: "#f857a6", to: "#ff5858", angle: 135 }
];
