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

export const backgrounds: BackgroundPreset[] = [
  { id: "sunset", label: "Gradient 01", css: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)" },
  { id: "mint", label: "Gradient 02", css: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { id: "paper", label: "Gradient 03", css: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)" },
  { id: "graphite", label: "Gradient 04", css: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)" },
  { id: "sky", label: "Gradient 05", css: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)" },
  { id: "aurora", label: "Gradient 06", css: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)" },
  { id: "peach-fuzz", label: "Gradient 07", css: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" },
  { id: "cyber-lime", label: "Gradient 08", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "ocean-pop", label: "Gradient 09", css: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)" },
  { id: "rose-glass", label: "Gradient 10", css: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
  { id: "mono-studio", label: "Gradient 11", css: "linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)" },
  { id: "prism-silk", label: "Gradient 12", css: "linear-gradient(135deg, #feada6 0%, #f5efef 100%)" },
  { id: "cobalt-rose", label: "Gradient 13", css: "linear-gradient(135deg, #a3bded 0%, #6991c7 100%)" },
  { id: "emerald-night", label: "Gradient 14", css: "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)" },
  { id: "champagne", label: "Gradient 15", css: "linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%)" },
  { id: "arctic-glow", label: "Gradient 16", css: "linear-gradient(135deg, #434343 0%, #000000 100%)" },
  { id: "plum-gold", label: "Gradient 17", css: "linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%)" },
  { id: "studio-fog", label: "Gradient 18", css: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)" },
  { id: "neon-lagoon", label: "Gradient 19", css: "linear-gradient(135deg, #868f96 0%, #596164 100%)" },
  { id: "blush-ink", label: "Gradient 20", css: "linear-gradient(135deg, #c79081 0%, #dfa579 100%)" },
  { id: "soft-orbit", label: "Gradient 21", css: "linear-gradient(135deg, #09203f 0%, #537895 100%)" },
  { id: "gradient-22", label: "Gradient 22", css: "linear-gradient(135deg, #96deda 0%, #50c9c3 100%)" },
  { id: "gradient-23", label: "Gradient 23", css: "linear-gradient(135deg, #29323c 0%, #485563 100%)" },
  { id: "gradient-24", label: "Gradient 24", css: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)" },
  { id: "gradient-25", label: "Gradient 25", css: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" },
  { id: "gradient-26", label: "Gradient 26", css: "linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)" },
  { id: "gradient-27", label: "Gradient 27", css: "linear-gradient(135deg, #B7F8DB 0%, #50A7C2 100%)" },
  { id: "gradient-28", label: "Gradient 28", css: "linear-gradient(135deg, #F44369 0%, #3E3B92 100%)" },
  { id: "gradient-29", label: "Gradient 29", css: "linear-gradient(135deg, #F9C823 0%, #FC506E 100%)" },
  { id: "gradient-30", label: "Gradient 30", css: "linear-gradient(135deg, #F90C71 0%, #30001A 100%)" },
  { id: "gradient-31", label: "Gradient 31", css: "linear-gradient(135deg, #F74C06 0%, #F9BC2C 100%)" },
  { id: "gradient-32", label: "Gradient 32", css: "linear-gradient(135deg, #FF930F 0%, #FFF95B 100%)" },
  { id: "gradient-33", label: "Gradient 33", css: "linear-gradient(135deg, #432371 0%, #FAAE7B 100%)" },
  { id: "gradient-34", label: "Gradient 34", css: "linear-gradient(135deg, #F3F520 0%, #59D102 100%)" },
  { id: "gradient-35", label: "Gradient 35", css: "linear-gradient(135deg, #ADFDA2 0%, #11D3F3 100%)" },
  { id: "gradient-36", label: "Gradient 36", css: "linear-gradient(135deg, #696EFF 0%, #F8ACFF 100%)" },
  { id: "gradient-37", label: "Gradient 37", css: "linear-gradient(135deg, #0061FF 0%, #60EFFF 100%)" },
  { id: "gradient-38", label: "Gradient 38", css: "linear-gradient(135deg, #EEB86D 0%, #9946B2 100%)" },
  { id: "gradient-39", label: "Gradient 39", css: "linear-gradient(135deg, #8338E3 0%, #E0A9BB 100%)" },
  { id: "gradient-40", label: "Gradient 40", css: "linear-gradient(135deg, #810576 0%, #FCC1CF 100%)" }
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
