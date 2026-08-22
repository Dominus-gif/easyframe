// Blog content authored in-repo as structured blocks (see /DECISIONS.md for the
// note on this vs. an MDX toolchain). Fully server-rendered; each post is SEO-complete.

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readMins: number;
  tag: string;
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "app-store-screenshots-that-convert",
    title: "How to Make App Store Screenshots That Convert",
    description:
      "Your app's screenshots do more selling than your description. Here's how to design App Store and Play Store screenshots that turn browsers into installs.",
    date: "2026-08-04",
    readMins: 6,
    tag: "Marketing",
    body: [
      { type: "p", text: "On the App Store and Google Play, most people decide whether to install before they read a single word of your description. Your screenshots are the pitch. Treat them like landing-page sections, not like a photo dump of your UI." },
      { type: "h2", text: "Lead with the outcome, not the interface" },
      { type: "p", text: "The first screenshot should answer 'what do I get?' in under two seconds. Pair a real screen inside a clean device frame with a short benefit headline above it — 'Track every subscription in one place,' not 'Dashboard.' Frame the screen in a device mockup so it reads instantly as a real, trustworthy app." },
      { type: "h2", text: "Design the set as a story" },
      { type: "ol", items: [
        "Screenshot 1 — the core promise (the one feature people came for).",
        "Screenshot 2 — proof it's easy (onboarding, a single tap, a clean empty state).",
        "Screenshot 3 — depth (power features that justify the download).",
        "Screenshot 4–5 — trust (reviews, privacy, integrations)."
      ] },
      { type: "h2", text: "Keep it legible at thumbnail size" },
      { type: "ul", items: [
        "Use big, high-contrast headline text — it must survive being shrunk to a phone thumbnail.",
        "One idea per screenshot. Crowded frames read as noise.",
        "Match your brand colors in the background so the whole set feels like one campaign."
      ] },
      { type: "h2", text: "Ship the exact required sizes" },
      { type: "p", text: "Apple and Google are strict about dimensions. Frame your screen once, then export it into each required size rather than re-cropping by hand. With EasyFrame you can drop your screenshot into an iPhone or Android frame, style the background, and export a crisp, correctly-sized image in seconds — free, in your browser." },
      { type: "p", text: "The goal is simple: make a stranger scrolling the store feel, in two seconds, that your app is polished and worth their tap." }
    ]
  },
  {
    slug: "free-device-mockup-tools-compared-2026",
    title: "Free Device Mockup Tools Compared (2026)",
    description:
      "A practical 2026 comparison of free device mockup generators — what to look for, common trade-offs, and how to pick the right one for your workflow.",
    date: "2026-08-11",
    readMins: 5,
    tag: "Tools",
    body: [
      { type: "p", text: "There are dozens of free mockup generators now. Most do the same core job — drop a screenshot into a device frame — so the real differences are in speed, privacy, output quality, and how many hoops you jump through before you can download." },
      { type: "h2", text: "What actually matters" },
      { type: "ul", items: [
        "No forced sign-up. If you have to create an account to download one image, that's friction you don't need.",
        "No watermark on the free tier. A watermark on 'free' output is really a paywall.",
        "Privacy. Prefer tools that composite in your browser so your screenshots never upload to a server.",
        "Export control. PNG/JPEG/WebP, a resolution you choose, and transparent backgrounds when you need them.",
        "Enough devices. iPhone, iPad, MacBook, Android tablet, browser, and watch cover almost every real need."
      ] },
      { type: "h2", text: "Common trade-offs" },
      { type: "p", text: "Heavier design apps give you 3D scenes and photorealistic frames but are slow and have a learning curve. Lightweight web tools are fast but sometimes cap resolution or add watermarks. Decide what you're optimizing for: a one-off social post wants speed; a store listing wants pixel-perfect sizes." },
      { type: "h2", text: "How EasyFrame fits" },
      { type: "p", text: "EasyFrame is built for the fast path: free, no account, no watermark, everything processed in your browser. You get the common device frames, gradient and solid backgrounds, and exports up to 2048px free (4K and transparent backgrounds on Premium). If your workflow is 'screenshot in, polished mockup out, on with your day,' it's hard to beat." },
      { type: "p", text: "The best tool is the one that gets out of your way. Try a couple with a real screenshot and keep whichever one lets you download fastest without asking for your email." }
    ]
  },
  {
    slug: "portfolio-tips-for-mobile-designers",
    title: "Portfolio Tips for Mobile Designers",
    description:
      "How to present mobile design work so it looks credible and hireable — framing, consistency, context, and the small details that separate strong portfolios.",
    date: "2026-08-15",
    readMins: 6,
    tag: "Design",
    body: [
      { type: "p", text: "Great mobile work often looks worse than it is because it's presented as bare, floating screens. Presentation is part of the craft. Here's how to make your case studies read as senior." },
      { type: "h2", text: "Frame your screens" },
      { type: "p", text: "A raw screenshot looks like a bug report. The same screen inside a clean device mockup looks like a shipped product. Framing signals attention to detail before anyone reads a word." },
      { type: "h2", text: "Be ruthlessly consistent" },
      { type: "ul", items: [
        "Use the same device frame and background style across a case study.",
        "Keep padding, shadow, and corner radius identical from shot to shot.",
        "Pick one or two background colors that match the product's brand and stick to them."
      ] },
      { type: "h2", text: "Show context, not just screens" },
      { type: "p", text: "Pair the final UI with a sentence of the problem and the decision you made. 'Users abandoned checkout at address entry, so we split it into two steps' tells a hiring manager how you think — which is what they're actually evaluating." },
      { type: "h2", text: "Sweat the presentation details" },
      { type: "ol", items: [
        "Export at high resolution so screens stay crisp on retina displays.",
        "Align everything to a grid — misaligned mockups undercut the work.",
        "Lead each project with your single best frame; it's the thumbnail people judge."
      ] },
      { type: "p", text: "You can frame a whole portfolio's worth of screens in minutes with a free mockup generator — same frame, same background, consistent output. The work is already good; make sure the presentation says so." }
    ]
  },
  {
    slug: "mockups-for-product-launches-checklist",
    title: "Mockups for Product Launches: A Checklist",
    description:
      "A practical checklist of the mockups and visuals you need for a product launch — from the website hero to social, Product Hunt, and the app stores.",
    date: "2026-08-18",
    readMins: 5,
    tag: "Launch",
    body: [
      { type: "p", text: "Launch day needs a lot of images, and they all need to look like they came from the same team. Here's the checklist so you're not exporting screenshots at midnight." },
      { type: "h2", text: "The core set" },
      { type: "ul", items: [
        "Website hero — your product in a browser or laptop frame, above the fold.",
        "Social cards — square and portrait versions for X, LinkedIn, and Instagram.",
        "Open Graph image — the link preview that shows when people share you.",
        "Product Hunt gallery — clean device shots that read at a glance.",
        "App Store / Play Store screenshots — correctly sized, benefit-led.",
        "Email header — a framed screenshot for your announcement send."
      ] },
      { type: "h2", text: "Keep it on-brand" },
      { type: "p", text: "Choose one background style and one device treatment and apply them everywhere. Consistency is what makes a scrappy launch look funded. A shared background color across every asset is the single cheapest way to look coordinated." },
      { type: "h2", text: "Work in one pass" },
      { type: "ol", items: [
        "Gather your best two or three product screenshots.",
        "Frame each one and set your brand background.",
        "Export each into the sizes you need for every channel.",
        "Drop them into your site, posts, and store listings."
      ] },
      { type: "p", text: "A free browser-based mockup tool lets you do this without design software or a sign-up — frame, style, export, done. Build the set once, and launch day gets a lot calmer." }
    ]
  },
  {
    slug: "why-free-mockup-tools-are-ad-supported",
    title: "Why Free Mockup Tools Are Ad-Supported",
    description:
      "An honest look at how free mockup tools stay free — the cost of hosting, why ads beat forced sign-ups, and how EasyFrame keeps your images private.",
    date: "2026-08-20",
    readMins: 4,
    tag: "Behind the scenes",
    body: [
      { type: "p", text: "Free tools aren't free to run. Someone pays for the domain, the hosting, and the bandwidth every time you load a page. The interesting question is how a tool chooses to cover that — because the choice shapes your experience." },
      { type: "h2", text: "The usual options" },
      { type: "ul", items: [
        "Charge everyone — simple, but most people just bounce to a free alternative.",
        "Force sign-ups and sell data — cheap for you up front, expensive for your privacy.",
        "Watermark the free output — 'free' with an asterisk.",
        "Show a few tasteful ads — the tool stays genuinely free and open."
      ] },
      { type: "h2", text: "Why we chose classy ads" },
      { type: "p", text: "We'd rather keep the core tool completely free and unlimited — no account, no watermark — and cover our costs with a few unobtrusive display ads. Ads never sit between you and your download, never appear inside the editor, and never touch your images." },
      { type: "h2", text: "Your images stay yours" },
      { type: "p", text: "This is the part we care about most: EasyFrame composites everything in your browser. Your screenshots are never uploaded to, processed by, or stored on our servers — ads or not. If you'd like an ad-free experience plus 4K and transparent exports, Premium supports the tool directly." },
      { type: "p", text: "Free, private, and honest about how it stays that way. That's the trade we think is fair." }
    ]
  }
];

export function postBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
