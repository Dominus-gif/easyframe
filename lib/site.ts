import { devices, type Device } from "@/lib/editor/devices";

export const SITE_URL = "https://www.easyframe.app";

export const howItWorks = [
  {
    title: "Upload your screenshot",
    body: "Drag and drop a PNG, JPEG, or WebP, paste from your clipboard, or pull one in from a URL. Everything is processed in your browser — your image never touches a server."
  },
  {
    title: "Pick a device & style it",
    body: "Drop your image into an iPhone, iPad, MacBook, tablet, browser, or watch frame. Tune the background, padding, shadow, and corner radius until it looks right."
  },
  {
    title: "Download in seconds",
    body: "Export a crisp PNG, JPEG, or WebP with one click — no account, no watermark, no waiting. Free exports go up to 2048px; Premium unlocks 4K and transparent backgrounds."
  }
];

export const faqs = [
  {
    q: "Is EasyFrame really free?",
    a: "Yes. The core mockup generator is free and unlimited, with no account required. We keep it free with unobtrusive display ads and an optional Premium plan for power features."
  },
  {
    q: "Do I need to create an account?",
    a: "No. You can upload, frame, adjust, and download without signing up. An account is only needed if you buy Premium or want to save projects."
  },
  {
    q: "Are my screenshots uploaded anywhere?",
    a: "No. All image compositing happens locally in your browser using the Canvas API. Your images are never sent to, processed by, or stored on our servers."
  },
  {
    q: "What image formats and sizes can I export?",
    a: "PNG, JPEG, and WebP. Free exports go up to 2048px on the longest edge; Premium raises that to 4K (3840px) and adds transparent-background exports."
  },
  {
    q: "What's included in Premium?",
    a: "Premium removes ads and unlocks 4K export, transparent backgrounds, custom background image uploads, batch export, and saved projects. It's $6/month or a one-time $99."
  }
];

export type TemplateCopy = { intro: string; bullets: string[] };

// Unique 150–200 word descriptions per device (real copy, no placeholders — SEO requirement).
export const templateCopy: Record<string, TemplateCopy> = {
  "iphone-mockup": {
    intro:
      "Turn any app screen or mobile screenshot into a polished iPhone mockup in seconds — for free, right in your browser. EasyFrame drops your image into a clean, modern iPhone frame with a realistic screen cutout, then lets you set the perfect gradient or solid background, shadow, padding, and corner radius. It's the fastest way to make App Store screenshots, product-launch visuals, portfolio shots, or social posts that look professionally designed. Because every pixel is composited locally with the Canvas API, your screenshots stay on your device and never touch a server. There's no sign-up, no watermark, and no export limit on the free tier up to 2048px. Designers, indie makers, and marketers use the iPhone mockup generator to present mobile work with credibility and to keep a consistent look across an entire campaign. Upload a screenshot, choose your background, and download a crisp PNG, JPEG, or WebP — all in under a minute.",
    bullets: ["Realistic modern iPhone frame", "Gradient, solid & transparent (Premium) backgrounds", "Export up to 2048px free · 4K on Premium", "No account, no watermark, nothing uploaded"]
  },
  "ipad-mockup": {
    intro:
      "Present tablet apps, dashboards, and reading experiences inside a clean iPad frame — free and entirely in your browser. The iPad mockup generator is ideal for showcasing landscape or portrait UI, education and productivity apps, or design concepts that need room to breathe. Upload a screenshot, choose a background that matches your brand, and fine-tune shadow, padding, and corner radius until the composition feels intentional. EasyFrame composites everything locally with the Canvas API, so your work never leaves your machine — no uploads, no storage, no account. Free exports reach 2048px on the longest edge in PNG, JPEG, or WebP, and Premium unlocks 4K and transparent backgrounds for pixel-perfect handoff. It's a favorite for product marketers building launch galleries, designers assembling case studies, and teams who need on-brand tablet visuals fast. Frame your screenshot, style it, and download a share-ready image in seconds — no design tools or watermarks required.",
    bullets: ["Portrait & landscape iPad framing", "Brand-matched gradient or solid backgrounds", "Local Canvas compositing — nothing uploaded", "Free 2048px export · Premium 4K & transparent"]
  },
  "macbook-pro-mockup": {
    intro:
      "Show off websites, web apps, and desktop designs inside a sleek MacBook Pro frame — free, browser-based, and watermark-free. The MacBook mockup generator is built for landing-page shots, SaaS dashboards, portfolio hero images, and pitch decks that need a premium desktop presentation. Drop in a screenshot, pick a gradient or solid background, and adjust shadow, padding, and corner radius to get a balanced, professional composition. Every image is composited locally with the Canvas API, so nothing is uploaded and no account is required. Free exports go up to 2048px in PNG, JPEG, or WebP, while Premium adds 4K output and transparent backgrounds for clean embedding anywhere. Founders, marketers, and designers reach for it to make consistent, on-brand desktop visuals in a fraction of the time a design tool would take. Upload your screenshot, style the scene, and download a crisp laptop mockup in under a minute — no sign-up, no friction.",
    bullets: ["Sleek MacBook Pro laptop frame", "Great for websites, SaaS & portfolios", "One-click PNG / JPEG / WebP export", "Free up to 2048px · Premium 4K & transparent"]
  },
  "android-tablet-mockup": {
    intro:
      "Frame Android tablet apps and responsive layouts in a clean, modern tablet mockup — free and fully in your browser. Perfect for Play Store screenshots, cross-platform product galleries, and design reviews, the Android tablet generator handles both portrait and landscape screens with a realistic bezel and screen cutout. Upload your screenshot, choose a background that fits your brand, and dial in shadow, padding, and corner radius for a composition that looks deliberate. EasyFrame does all compositing locally with the Canvas API, so your screenshots never leave your device — no uploads, no storage, no account needed. Free exports reach 2048px on the longest edge in PNG, JPEG, or WebP, and Premium unlocks 4K plus transparent backgrounds for flexible placement. Android developers, PMs, and marketers use it to keep visuals consistent across a whole store listing or campaign. Add your screenshot, style it, and download a polished tablet mockup in seconds — no watermark, no design software.",
    bullets: ["Modern Android tablet frame", "Ideal for Play Store & cross-platform shots", "Portrait and landscape support", "Free 2048px export · Premium 4K & transparent"]
  },
  "browser-mockup": {
    intro:
      "Wrap any web page or screenshot in a clean browser window frame — free, browser-based, and without a watermark. The browser mockup generator is perfect for landing pages, blog headers, feature callouts, and social posts where a simple window with a title bar reads instantly as 'the web.' Upload your screenshot, choose a background, and adjust shadow, padding, and corner radius to frame the page just right. Because compositing happens locally with the Canvas API, your images stay on your machine — nothing is uploaded and no account is required. Free exports go up to 2048px in PNG, JPEG, or WebP, and Premium adds 4K and transparent backgrounds so the window drops cleanly onto any surface. Content marketers, designers, and founders use it to present web work with polish and to keep a consistent look across a full set of assets. Drop in your screenshot, style the scene, and download a share-ready browser mockup in seconds.",
    bullets: ["Clean browser window with title bar", "Perfect for landing pages & blog headers", "Local compositing — nothing uploaded", "Free 2048px export · Premium 4K & transparent"]
  },
  "apple-watch-mockup": {
    intro:
      "Showcase watch faces, complications, and wearable app screens inside a crisp Apple Watch frame — free and entirely in your browser. The watch mockup generator is built for tiny, high-impact visuals: fitness apps, notifications, glanceable UI, and portfolio details that deserve a proper presentation. Upload your screenshot, pick a background that complements the interface, and fine-tune shadow, padding, and corner radius for a clean, focused composition. EasyFrame composites everything locally with the Canvas API, so your work never leaves your device — no uploads, no account, no watermark. Free exports reach 2048px on the longest edge in PNG, JPEG, or WebP, and Premium unlocks 4K and transparent backgrounds for flexible placement in decks and case studies. Designers and wearable developers use it to give small screens the same polish as their phone and desktop shots. Add your screenshot, style it, and download a share-ready Apple Watch mockup in seconds.",
    bullets: ["Crisp Apple Watch frame", "Great for watch faces & wearable apps", "Focused, clean small-screen compositions", "Free 2048px export · Premium 4K & transparent"]
  }
};

export type Category = {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  match: (device: Device) => boolean;
};

export const categories: Category[] = [
  {
    slug: "iphone-mockups",
    name: "iPhone Mockups",
    h1: "Free iPhone Mockup Generators",
    intro: "Frame mobile screenshots and app screens in clean iPhone mockups — free, in your browser, no account required.",
    match: (d) => d.slug === "iphone-mockup"
  },
  {
    slug: "laptop-mockups",
    name: "Laptop Mockups",
    h1: "Free Laptop & MacBook Mockup Generators",
    intro: "Present websites, web apps, and desktop designs in sleek laptop mockups — free and watermark-free.",
    match: (d) => d.category === "laptop"
  },
  {
    slug: "tablet-mockups",
    name: "Tablet Mockups",
    h1: "Free Tablet Mockup Generators",
    intro: "Showcase tablet apps and responsive layouts in iPad and Android tablet mockups — free, browser-based.",
    match: (d) => d.category === "tablet"
  },
  {
    slug: "browser-mockups",
    name: "Browser Mockups",
    h1: "Free Browser Mockup Generators",
    intro: "Wrap web pages and screenshots in a clean browser window frame — free, no sign-up, no watermark.",
    match: (d) => d.category === "browser"
  }
];

export function devicesInCategory(slug: string): Device[] {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return [];
  return devices.filter(category.match);
}

/** Map a device kind to the decorative silhouette class used on marketing pages. */
export function silhouetteClass(device: Device): string {
  return device.kind === "phone"
    ? "phone"
    : device.kind === "laptop"
      ? "laptop"
      : device.kind === "browser"
        ? "browser"
        : device.kind === "watch"
          ? "watch"
          : "tablet";
}
