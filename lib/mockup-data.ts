import type { BackgroundPreset, DevicePreset, EdgeStyle, EffectPreset, ShadowPreset, TemplatePreset } from "@/lib/types";

export const devices: DevicePreset[] = [
  { id: "blank-canvas", label: "Blank Tile", type: "freeform", ratio: 16 / 10, premium: false },
  { id: "browser-window", label: "Browser Window", type: "browser", ratio: 16 / 10, premium: false },
  { id: "iphone-15-pro", label: "iPhone 15 Pro", type: "phone", ratio: 393 / 852, premium: false },
  { id: "iphone-14-plus", label: "iPhone 14 Plus", type: "phone", ratio: 428 / 926, premium: false },
  { id: "pixel-8", label: "Google Pixel", type: "phone", ratio: 412 / 915, premium: true },
  { id: "ipad-air", label: "iPad Air", type: "tablet", ratio: 4 / 3, premium: false },
  { id: "macbook-pro", label: "MacBook Pro", type: "laptop", ratio: 16 / 10, premium: false },
  { id: "surface-laptop", label: "Surface Laptop", type: "laptop", ratio: 3 / 2, premium: true }
];

// EasyFrame original gradient library. Each preset layers radial highlights over a
// directional base for a soft "mesh" depth that reads as bespoke rather than a stock
// two-stop ramp. IDs are stable — templates reference them by id, so only css/label change.
export const backgrounds: BackgroundPreset[] = [
  { id: "sunset", label: "Ember Drift", css: "radial-gradient(120% 120% at 12% 8%, #ffd5a8 0%, rgba(255,213,168,0) 46%), linear-gradient(135deg, #ff6f6f 0%, #ff8f6b 48%, #ffb486 100%)" },
  { id: "mint", label: "Garden Glass", css: "radial-gradient(110% 110% at 85% 15%, #fff2cf 0%, rgba(255,242,207,0) 50%), linear-gradient(140deg, #4fd1a5 0%, #79e0b8 55%, #c8f3dd 100%)" },
  { id: "paper", label: "Soft Linen", css: "radial-gradient(120% 120% at 20% 0%, #ffffff 0%, rgba(255,255,255,0) 55%), linear-gradient(160deg, #f4f1ea 0%, #ece6dc 45%, #e3dccf 100%)" },
  { id: "graphite", label: "Slate Studio", css: "radial-gradient(130% 130% at 78% 12%, #3a4350 0%, rgba(58,67,80,0) 52%), linear-gradient(150deg, #11151c 0%, #1c2430 55%, #2b3543 100%)" },
  { id: "sky", label: "Open Air", css: "radial-gradient(120% 120% at 18% 10%, #ffffff 0%, rgba(255,255,255,0) 48%), linear-gradient(155deg, #cfe4f5 0%, #acccf0 50%, #d9e4ef 100%)" },
  { id: "aurora", label: "Aurora Veil", css: "radial-gradient(100% 120% at 80% 0%, #7af0d8 0%, rgba(122,240,216,0) 45%), radial-gradient(120% 120% at 10% 90%, #8a7bff 0%, rgba(138,123,255,0) 50%), linear-gradient(150deg, #1b2a4a 0%, #243a63 100%)" },
  { id: "peach-fuzz", label: "Peach Fuzz", css: "radial-gradient(115% 115% at 22% 12%, #fff0e6 0%, rgba(255,240,230,0) 50%), linear-gradient(145deg, #ffb199 0%, #ff8fa3 55%, #f9a8c9 100%)" },
  { id: "cyber-lime", label: "Voltage", css: "radial-gradient(110% 110% at 80% 10%, #d4ff5c 0%, rgba(212,255,92,0) 46%), linear-gradient(140deg, #0f2027 0%, #1c5c4d 55%, #2bd47e 100%)" },
  { id: "ocean-pop", label: "Tide Pool", css: "radial-gradient(120% 120% at 15% 12%, #c9fff4 0%, rgba(201,255,244,0) 50%), linear-gradient(150deg, #0a7e8c 0%, #1aa6b0 55%, #6fe0d2 100%)" },
  { id: "rose-glass", label: "Rose Quartz", css: "radial-gradient(115% 115% at 80% 8%, #ffffff 0%, rgba(255,255,255,0) 48%), linear-gradient(150deg, #ffc0d3 0%, #f7a8c4 50%, #e7b6e8 100%)" },
  { id: "mono-studio", label: "Indigo Wash", css: "radial-gradient(120% 120% at 78% 12%, #6f86ff 0%, rgba(111,134,255,0) 52%), linear-gradient(150deg, #2a2f5b 0%, #3a4a8c 55%, #5a72c9 100%)" },
  { id: "prism-silk", label: "Prism Silk", css: "radial-gradient(110% 110% at 20% 8%, #ffe7d6 0%, rgba(255,231,214,0) 50%), linear-gradient(150deg, #f8c6b3 0%, #f3d9cf 50%, #eef0e9 100%)" },
  { id: "cobalt-rose", label: "Cobalt Rose", css: "radial-gradient(120% 120% at 82% 14%, #ff9ec4 0%, rgba(255,158,196,0) 48%), linear-gradient(150deg, #1f3c88 0%, #4257b2 55%, #8a6fd1 100%)" },
  { id: "emerald-night", label: "Emerald Night", css: "radial-gradient(120% 120% at 80% 8%, #57e0c4 0%, rgba(87,224,196,0) 48%), linear-gradient(150deg, #06243a 0%, #0d4f5e 55%, #1f8f86 100%)" },
  { id: "champagne", label: "Champagne", css: "radial-gradient(120% 120% at 18% 6%, #ffffff 0%, rgba(255,255,255,0) 52%), linear-gradient(155deg, #e7ddc7 0%, #ddd2bb 50%, #cfd6cc 100%)" },
  { id: "arctic-glow", label: "Obsidian", css: "radial-gradient(130% 130% at 75% 12%, #2c2f36 0%, rgba(44,47,54,0) 55%), linear-gradient(150deg, #050608 0%, #14161c 60%, #20242d 100%)" },
  { id: "plum-gold", label: "Plum & Gold", css: "radial-gradient(120% 120% at 82% 10%, #ffcf8a 0%, rgba(255,207,138,0) 46%), linear-gradient(150deg, #2a1135 0%, #5a2a63 55%, #9a5a8c 100%)" },
  { id: "studio-fog", label: "Coral Fog", css: "radial-gradient(115% 115% at 20% 10%, #ffe0e8 0%, rgba(255,224,232,0) 50%), linear-gradient(150deg, #ff7a8a 0%, #ff96ab 50%, #ffbcc7 100%)" },
  { id: "neon-lagoon", label: "Neon Lagoon", css: "radial-gradient(110% 110% at 80% 8%, #43e8ff 0%, rgba(67,232,255,0) 46%), linear-gradient(150deg, #11203a 0%, #1d4f6e 55%, #2bb0c4 100%)" },
  { id: "blush-ink", label: "Blush Ink", css: "radial-gradient(120% 120% at 80% 12%, #f6c1a6 0%, rgba(246,193,166,0) 50%), linear-gradient(150deg, #2c1d2b 0%, #6a4a4f 55%, #c08a7a 100%)" },
  { id: "soft-orbit", label: "Deep Orbit", css: "radial-gradient(120% 120% at 78% 10%, #5f8fc0 0%, rgba(95,143,192,0) 52%), linear-gradient(150deg, #060f1f 0%, #15324f 60%, #2b5a7f 100%)" },
  { id: "gradient-22", label: "Seafoam", css: "radial-gradient(115% 115% at 18% 10%, #e6fff8 0%, rgba(230,255,248,0) 50%), linear-gradient(150deg, #3fc4b4 0%, #5fd6c2 55%, #aef0e2 100%)" },
  { id: "gradient-23", label: "Carbon", css: "radial-gradient(130% 130% at 76% 12%, #3a4350 0%, rgba(58,67,80,0) 55%), linear-gradient(150deg, #1d2430 0%, #303a48 60%, #44505f 100%)" },
  { id: "gradient-24", label: "Cotton Candy", css: "radial-gradient(115% 115% at 80% 8%, #ffffff 0%, rgba(255,255,255,0) 48%), linear-gradient(150deg, #ffb0c4 0%, #ffc9d6 50%, #ffe2ea 100%)" },
  { id: "gradient-25", label: "Deep Sea", css: "radial-gradient(120% 120% at 80% 10%, #3f73c4 0%, rgba(63,115,196,0) 50%), linear-gradient(150deg, #0c2148 0%, #173a6e 55%, #285a9c 100%)" },
  { id: "gradient-26", label: "Apricot", css: "radial-gradient(115% 115% at 20% 10%, #fff1e0 0%, rgba(255,241,224,0) 50%), linear-gradient(150deg, #ffb38a 0%, #ffa6a0 55%, #ffc0b0 100%)" },
  { id: "gradient-27", label: "Lagoon Mist", css: "radial-gradient(115% 115% at 18% 8%, #e3fff4 0%, rgba(227,255,244,0) 50%), linear-gradient(150deg, #6fe0c0 0%, #56c0c0 55%, #3f93b8 100%)" },
  { id: "gradient-28", label: "Electric Plum", css: "radial-gradient(120% 120% at 80% 10%, #ff6f9c 0%, rgba(255,111,156,0) 48%), linear-gradient(150deg, #2a2b80 0%, #6a3a9e 55%, #b14fb0 100%)" },
  { id: "gradient-29", label: "Mango Punch", css: "radial-gradient(115% 115% at 20% 10%, #fff0c2 0%, rgba(255,240,194,0) 50%), linear-gradient(150deg, #ffb031 0%, #ff7a5c 55%, #ff5577 100%)" },
  { id: "gradient-30", label: "Magenta Noir", css: "radial-gradient(120% 120% at 80% 8%, #ff3d8b 0%, rgba(255,61,139,0) 46%), linear-gradient(150deg, #20000f 0%, #5a0a3a 55%, #a01366 100%)" },
  { id: "gradient-31", label: "Wildfire", css: "radial-gradient(115% 115% at 20% 10%, #ffe39a 0%, rgba(255,227,154,0) 50%), linear-gradient(150deg, #f23c06 0%, #ff7a18 55%, #ffb52c 100%)" },
  { id: "gradient-32", label: "Citrus", css: "radial-gradient(115% 115% at 18% 8%, #fff7c2 0%, rgba(255,247,194,0) 52%), linear-gradient(150deg, #ff8c1a 0%, #ffc233 55%, #fff06b 100%)" },
  { id: "gradient-33", label: "Twilight Sand", css: "radial-gradient(120% 120% at 80% 10%, #ffba8a 0%, rgba(255,186,138,0) 48%), linear-gradient(150deg, #2c1a52 0%, #6a4a7a 55%, #d0987a 100%)" },
  { id: "gradient-34", label: "Spring Field", css: "radial-gradient(115% 115% at 18% 10%, #f4ff9a 0%, rgba(244,255,154,0) 50%), linear-gradient(150deg, #6fd11a 0%, #45c44a 55%, #2fae6a 100%)" },
  { id: "gradient-35", label: "Frost Lime", css: "radial-gradient(115% 115% at 18% 8%, #eaffe0 0%, rgba(234,255,224,0) 50%), linear-gradient(150deg, #9af0a2 0%, #4fd6cf 55%, #18b8e8 100%)" },
  { id: "gradient-36", label: "Ultraviolet", css: "radial-gradient(120% 120% at 80% 10%, #f8acff 0%, rgba(248,172,255,0) 48%), linear-gradient(150deg, #4a3fe0 0%, #7a5cf0 55%, #b27dff 100%)" },
  { id: "gradient-37", label: "Azure Beam", css: "radial-gradient(120% 120% at 18% 8%, #c7f6ff 0%, rgba(199,246,255,0) 50%), linear-gradient(150deg, #0047d6 0%, #1f7ff0 55%, #4fd0ff 100%)" },
  { id: "gradient-38", label: "Amber Royal", css: "radial-gradient(120% 120% at 80% 10%, #ffd08a 0%, rgba(255,208,138,0) 48%), linear-gradient(150deg, #6a2f8c 0%, #a85fa0 55%, #e0a86d 100%)" },
  { id: "gradient-39", label: "Orchid Dusk", css: "radial-gradient(120% 120% at 78% 8%, #ffb3d6 0%, rgba(255,179,214,0) 48%), linear-gradient(150deg, #5a2fc4 0%, #8a5fd6 55%, #c98ab8 100%)" },
  { id: "gradient-40", label: "Berry Cream", css: "radial-gradient(115% 115% at 80% 8%, #ffe0ee 0%, rgba(255,224,238,0) 48%), linear-gradient(150deg, #7a0a72 0%, #b84fa0 55%, #f0bcd0 100%)" }
];

export const edgeStyles: EdgeStyle[] = [
  { id: "default", label: "Default", radius: 34, preview: "linear-gradient(135deg, #fbfbf7 0%, #ddd9cf 100%)" },
  { id: "glass-light", label: "Glass Light", radius: 34, preview: "linear-gradient(135deg, rgba(255,255,255,.98), rgba(222,232,233,.66) 58%, rgba(255,255,255,.88))" },
  { id: "glass-dark", label: "Glass Dark", radius: 34, preview: "linear-gradient(135deg, #f8f8f3 0%, #b8beb8 58%, #6c746d 100%)" },
  { id: "liquid", label: "Liquid Glass", radius: 38, preview: "linear-gradient(135deg, #ff8a00 0%, #ffcc28 62%, #fff7a3 100%)" },
  { id: "inset-light", label: "Inset Light", radius: 30, preview: "linear-gradient(135deg, #ffffff 0%, #d7d9d4 100%)" },
  { id: "inset-dark", label: "Inset Dark", radius: 30, preview: "linear-gradient(135deg, #f5f5f1 0%, #b6bbb7 62%, #505852 100%)" },
  { id: "outline", label: "Outline", radius: 24, preview: "linear-gradient(135deg, #f9faf8 0%, #cfd4d2 100%)" },
  { id: "border", label: "Border", radius: 22, preview: "linear-gradient(135deg, #ffffff 0%, #eeeeea 100%)" },
  { id: "retro", label: "Retro", radius: 18, preview: "linear-gradient(135deg, #ffffff 0%, #e9ecea 70%, #7b847d 71%, #363d38 100%)" },
  { id: "card", label: "Card", radius: 18, preview: "linear-gradient(135deg, #ffffff 0%, #eff1f2 100%)" },
  { id: "stack", label: "Stack", radius: 18, preview: "linear-gradient(135deg, #ffffff 0%, #e3e7e8 60%, #cfd5d6 100%)" },
  { id: "stack-2", label: "Stack 2", radius: 22, preview: "linear-gradient(135deg, #ffffff 0%, #edf1f2 52%, #cdd4d7 100%)" }
];

export const shadows: ShadowPreset[] = [
  { id: "none", label: "None", shadow: "none" },
  { id: "spread", label: "Spread", shadow: "0 34px 90px rgba(17, 19, 18, 0.24)" },
  { id: "hug", label: "Hug", shadow: "0 18px 42px rgba(17, 19, 18, 0.2)" },
  { id: "adaptive", label: "Adaptive", shadow: "0 36px 80px rgba(241, 43, 143, 0.28), 0 18px 70px rgba(109, 93, 252, 0.24)" },
  { id: "glow", label: "Glow", shadow: "0 0 0 1px rgba(255,255,255,.25), 0 0 60px rgba(109, 93, 252, 0.38), 0 34px 90px rgba(17, 19, 18, 0.18)" }
];

export const effects: EffectPreset[] = [
  { id: "clean", label: "Clean", className: "effect-clean" },
  { id: "glass", label: "Glass", className: "effect-glass" },
  { id: "border", label: "Border", className: "effect-border" },
  { id: "glow", label: "Glow", className: "effect-glow" },
  { id: "vignette", label: "Vignette", className: "effect-vignette" },
  { id: "grain", label: "Grain", className: "effect-grain" }
];

const formatTemplate = (
  id: string,
  label: string,
  category: TemplatePreset["category"],
  orientation: TemplatePreset["orientation"],
  width: number,
  height: number,
  platform?: string,
  safeZone?: TemplatePreset["safeZone"],
  backgroundId = "paper"
): TemplatePreset => ({
  id,
  label,
  category,
  platform,
  orientation,
  width,
  height,
  safeZone,
  deviceId: "blank-canvas",
  backgroundId,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  zoom: 82,
  padding: 70,
  edgeStyleId: "none",
  shadowId: "spread",
  effectId: "clean"
});

export const templates: TemplatePreset[] = [
  formatTemplate("blank-custom", "Blank Canvas", "Blank", "Landscape", 1920, 1200, "EasyFrame", undefined, "sunset"),
  formatTemplate("blank-square", "Blank Square", "Blank", "Square", 1080, 1080, "EasyFrame", undefined, "paper"),
  formatTemplate("blank-portrait", "Blank Portrait", "Blank", "Portrait", 1080, 1350, "EasyFrame", undefined, "rose-glass"),
  formatTemplate("blank-story", "Blank Story", "Blank", "Vertical", 1080, 1920, "EasyFrame", "vertical-ui", "plum-gold"),

  formatTemplate("x-post", "X Post", "Post", "Landscape", 1600, 900, "X", undefined, "graphite"),
  formatTemplate("x-header", "X Header", "Banner", "Wide", 1500, 500, "X", undefined, "cobalt-rose"),
  formatTemplate("x-square", "X Square Post", "Post", "Square", 1080, 1080, "X", undefined, "mint"),
  formatTemplate("x-link-preview", "X Link Preview", "Post", "Landscape", 1200, 630, "X", undefined, "studio-fog"),
  formatTemplate("x-profile", "X Profile Picture", "Avatar", "Square", 400, 400, "X", "circle", "paper"),

  formatTemplate("instagram-square", "Instagram Square", "Post", "Square", 1080, 1080, "Instagram", undefined, "mint"),
  formatTemplate("instagram-feed", "Instagram Feed Portrait", "Post", "Portrait", 1080, 1350, "Instagram", undefined, "sunset"),
  formatTemplate("instagram-grid-portrait", "Instagram Grid Portrait", "Post", "Portrait", 1080, 1440, "Instagram", undefined, "rose-glass"),
  formatTemplate("instagram-story", "Instagram Story", "Story", "Vertical", 1080, 1920, "Instagram", "vertical-ui", "plum-gold"),
  formatTemplate("instagram-profile", "Instagram Profile Picture", "Avatar", "Square", 320, 320, "Instagram", "circle", "rose-glass"),

  formatTemplate("linkedin-feed", "LinkedIn Feed Portrait", "Post", "Portrait", 1080, 1350, "LinkedIn", undefined, "champagne"),
  formatTemplate("linkedin-link-preview", "LinkedIn Link Preview", "Post", "Landscape", 1200, 630, "LinkedIn", undefined, "studio-fog"),
  formatTemplate("linkedin-company-banner", "LinkedIn Company Banner", "Banner", "Wide", 1584, 396, "LinkedIn", undefined, "champagne"),
  formatTemplate("linkedin-profile", "LinkedIn Profile Picture", "Avatar", "Square", 400, 400, "LinkedIn", "circle", "paper"),

  formatTemplate("youtube-profile", "YouTube Profile", "Avatar", "Square", 800, 800, "YouTube", "circle", "studio-fog"),
  formatTemplate("youtube-banner", "YouTube Channel Banner", "Banner", "Landscape", 2560, 1440, "YouTube", "youtube-banner", "arctic-glow"),
  formatTemplate("youtube-shorts", "YouTube Shorts", "Story", "Vertical", 1080, 1920, "YouTube", "vertical-ui", "plum-gold"),
  formatTemplate("youtube-thumbnail", "YouTube Thumbnail", "Post", "Landscape", 1280, 720, "YouTube", undefined, "ocean-pop"),

  formatTemplate("facebook-cover", "Facebook Desktop Cover", "Banner", "Wide", 851, 315, "Facebook", undefined, "soft-orbit"),
  formatTemplate("facebook-group-cover", "Facebook Group Cover", "Banner", "Landscape", 1640, 856, "Facebook", undefined, "prism-silk"),
  formatTemplate("facebook-story", "Facebook Story", "Story", "Vertical", 1080, 1920, "Facebook", "vertical-ui", "plum-gold"),
  formatTemplate("facebook-profile", "Facebook Profile Picture", "Avatar", "Square", 320, 320, "Facebook", "circle", "rose-glass"),

  formatTemplate("tiktok-profile", "TikTok Profile", "Avatar", "Square", 200, 200, "TikTok", "circle", "graphite"),
  formatTemplate("tiktok-video", "TikTok Video", "Story", "Vertical", 1080, 1920, "TikTok", "vertical-ui", "plum-gold"),
  formatTemplate("threads-square", "Threads Square", "Post", "Square", 1080, 1080, "Threads", undefined, "mint"),
  formatTemplate("threads-profile", "Threads Profile Picture", "Avatar", "Square", 320, 320, "Threads", "circle", "paper"),
  formatTemplate("pinterest-pin", "Pinterest Pin", "Post", "Portrait", 1000, 1500, "Pinterest", undefined, "blush-ink"),
  formatTemplate("pinterest-square", "Pinterest Square", "Post", "Square", 1000, 1000, "Pinterest", undefined, "gradient-24"),
  formatTemplate("pinterest-profile", "Pinterest Profile Picture", "Avatar", "Square", 600, 600, "Pinterest", "circle", "prism-silk"),

  formatTemplate("dribbble-shot", "Dribbble Shot", "Shot", "Landscape", 1600, 1200, "Dribbble", undefined, "soft-orbit"),
  formatTemplate("dribbble-cover", "Dribbble Cover", "Shot", "Landscape", 1600, 1200, "Dribbble", undefined, "prism-silk"),
  formatTemplate("dribbble-profile", "Dribbble Profile Picture", "Avatar", "Square", 400, 400, "Dribbble", "circle", "studio-fog"),

  formatTemplate("snapchat-spotlight", "Snapchat Spotlight", "Story", "Vertical", 1080, 1920, "Snapchat", "vertical-ui", "gradient-32"),
  formatTemplate("snapchat-profile", "Snapchat Profile Picture", "Avatar", "Square", 600, 600, "Snapchat", "circle", "gradient-29"),

  formatTemplate("whatsapp-status", "WhatsApp Status", "Story", "Vertical", 1080, 1920, "WhatsApp", "vertical-ui", "gradient-35"),
  formatTemplate("whatsapp-profile", "WhatsApp Profile Picture", "Avatar", "Square", 500, 500, "WhatsApp", "circle", "gradient-35"),

  formatTemplate("product-hunt-gallery", "Product Hunt Gallery", "Post", "Landscape", 1270, 760, "Product Hunt", undefined, "gradient-31"),
  formatTemplate("product-hunt-thumbnail", "Product Hunt Thumbnail", "Post", "Square", 800, 800, "Product Hunt", undefined, "gradient-29"),

  formatTemplate("app-store-screenshot", "App Store Screenshot", "Post", "Portrait", 1290, 2796, "App Store", undefined, "gradient-37"),
  formatTemplate("play-store-feature", "Play Store Feature Graphic", "Banner", "Landscape", 1024, 500, "Play Store", undefined, "gradient-30"),
  formatTemplate("behance-cover", "Behance Cover", "Banner", "Landscape", 1400, 808, "Behance", undefined, "gradient-36"),
  formatTemplate("medium-header", "Medium Header", "Banner", "Landscape", 1500, 600, "Medium", undefined, "gradient-23")
];
