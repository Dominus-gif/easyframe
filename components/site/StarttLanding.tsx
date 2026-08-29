import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BackgroundSetting } from "@/lib/editor/compositor";
import { SITE_URL } from "@/lib/site";
import MockShot from "@/components/site/MockShot";
import StarttFX from "@/components/site/StarttFX";
import JsonLd from "@/components/site/JsonLd";

const rd = (i: number): CSSProperties => ({ "--d": i } as CSSProperties);

const lav: BackgroundSetting = { type: "gradient", from: "#ECECF4", to: "#F6F6FA", angle: 135 };
const purpleT: BackgroundSetting = { type: "gradient", from: "#F6F2FF", to: "#EDE6FF", angle: 135 };
const pinkT: BackgroundSetting = { type: "gradient", from: "#FFF7FC", to: "#FBEFF6", angle: 135 };
const blueT: BackgroundSetting = { type: "gradient", from: "#ECF2FF", to: "#E3EDFF", angle: 135 };

// Tint helpers cycle the four pastel blocks so no two adjacent cards match.
const tints = ["tint-pink", "tint-blue", "tint-purple", "tint-gray"];

const steps = [
  { n: "01", title: "Pick your device", body: "Choose from iPhone, Android, tablet, laptop or desktop frames.", tint: "tint-pink", device: "iphone-mockup", sample: 0, bg: pinkT },
  { n: "02", title: "Drop in your screenshot", body: "Upload a shot of your app and we fit it perfectly into the frame.", tint: "tint-blue", device: "browser-mockup", sample: 1, bg: blueT },
  { n: "03", title: "Export & share", body: "Download PNG or JPG, or copy a share link to show off your work anywhere.", tint: "tint-purple", device: "macbook-pro-mockup", sample: 2, bg: purpleT }
];

const features = [
  { title: "Instant device frames", body: "Every major phone, tablet and laptop frame, ready in one click.", device: "iphone-mockup", sample: 0 },
  { title: "Realistic screenshots", body: "Your app looks exactly as it does on the real hardware.", device: "ipad-mockup", sample: 2 },
  { title: "Custom branding", body: "Add your logo, colors and captions to make it yours.", device: "macbook-pro-mockup", sample: 1 },
  { title: "Export anywhere", body: "PNG, JPG or share link — perfect for App Store listings and decks.", device: "android-phone-mockup", sample: 2 },
  { title: "Free forever", body: "No paywalls, no watermarks, no account required.", device: "apple-watch-mockup", sample: 0 }
];

const templates = [
  { title: "App Store ready", body: "Pre-sized frames for every store listing dimension.", device: "iphone-mockup", sample: 2 },
  { title: "Pitch deck layouts", body: "Clean side-by-side device compositions for investor decks.", device: "macbook-pro-mockup", sample: 0 },
  { title: "Social media kits", body: "Square and vertical crops built for Instagram and X.", device: "ipad-mockup", sample: 1 },
  { title: "Landing page heroes", body: "Device mockups sized to drop straight into your hero section.", device: "browser-mockup", sample: 2 }
];

const useCases = [
  { label: "App Developers", body: "Ship store listings that look shipped." },
  { label: "Designers", body: "Present concepts in real hardware, fast." },
  { label: "Marketers", body: "On-brand visuals for every channel." },
  { label: "Founders", body: "Show investors your product before it's built." },
  { label: "Agencies", body: "Client-ready mockups in a browser tab." },
  { label: "Indie Hackers", body: "Launch assets without a design budget." }
];

export default function StarttLanding() {
  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EasyFrame",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: "Free device mockup generator. Frame screenshots in iPhone, iPad, MacBook, tablet, browser, and watch mockups — in your browser, no account required.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  return (
    <div className="sx">
      {/* A — Nav */}
      <nav className="sx-nav" aria-label="Primary">
        <div className="sx-wrap sx-nav-in">
          <Link href="/" className="sx-word">EasyFrame</Link>
          <div className="sx-nav-links">
            <Link href="#how">How it works</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <Link href="/editor" className="sx-white sx-nav-cta">Open EasyFrame</Link>
        </div>
      </nav>

      {/* B — Hero */}
      <header className="sx-hero">
        <div className="sx-wrap sx-hero-in">
          <span className="sx-scribble" data-reveal aria-hidden="true">no designer needed</span>
          <h1 className="sx-display sx-hero-h1" data-reveal>Make your app look <em className="sx-accent-serif">stunning</em> — without a designer.</h1>
          <p className="sx-sub sx-hero-sub" data-reveal style={rd(1)}>
            Drop in a screenshot and get a realistic device mockup in seconds. Free, no sign-up required.
          </p>
          <div className="sx-cta-row" data-reveal style={rd(2)}>
            <Link href="/editor" className="sx-pill sx-pill-lg">Generate a mockup <ArrowRight size={17} /></Link>
            <Link href="/templates" className="sx-white sx-white-lg">See templates</Link>
          </div>
          <div className="sx-proof" data-reveal style={rd(3)}>
            <div className="sx-proof-avatars" aria-hidden="true">
              {["AR", "MK", "JS", "TP"].map((t, i) => (
                <span className="sx-proof-av" key={i}>{t}</span>
              ))}
            </div>
            <span className="sx-proof-text">Free forever · no sign-up required</span>
          </div>
          <div className="sx-hero-shot" data-reveal style={rd(2)}>
            <MockShot device="macbook-pro-mockup" sample={1} background={lav} padding={0.11} maxEdge={1400} className="sx-hero-canvas" />
          </div>
        </div>
      </header>

      {/* C — How it works */}
      <section className="sx-section sx-bordered" id="how">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h2 className="sx-display">How it works</h2>
            <p className="sx-sub">Three steps to a mockup you'll be proud to share.</p>
          </div>
          <div className="sx-steps2">
            {steps.map((s) => (
              <article className={`sx-stepblock ${s.tint}`} data-reveal key={s.n}>
                <div className="sx-stepblock-shot">
                  <MockShot device={s.device} sample={s.sample} background={s.bg} padding={0.12} maxEdge={1100} className="sx-stepblock-canvas" />
                </div>
                <div className="sx-stepblock-copy">
                  <span className="sx-stepnum">{s.n}</span>
                  <h3 className="sx-card-h">{s.title}</h3>
                  <p className="sx-card-p">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D — Feature grid */}
      <section className="sx-section sx-bordered" id="features">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h2 className="sx-display">One tool for every mockup need</h2>
            <p className="sx-sub">Everything you need to turn a screenshot into a share-ready shot.</p>
          </div>
          <div className="sx-fgrid">
            {features.map((f, i) => (
              <article className={`sx-fcard ${tints[i % tints.length]}`} data-reveal style={rd(i % 3)} key={f.title}>
                <div className="sx-fcard-shot">
                  <MockShot device={f.device} sample={f.sample} background={lav} padding={0.1} maxEdge={560} className="sx-fcard-canvas" />
                </div>
                <div className="sx-fcard-copy">
                  <h3 className="sx-card-h">{f.title}</h3>
                  <p className="sx-card-p">{f.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* E — Templates */}
      <section className="sx-section sx-bordered" id="templates">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h2 className="sx-display">Pick a template, make it yours.</h2>
            <p className="sx-sub">Starting points sized for exactly where your mockup is going.</p>
          </div>
          <div className="sx-fgrid sx-fgrid-4">
            {templates.map((t, i) => (
              <article className={`sx-fcard ${tints[(i + 1) % tints.length]}`} data-reveal style={rd(i % 2)} key={t.title}>
                <div className="sx-fcard-shot">
                  <MockShot device={t.device} sample={t.sample} background={lav} padding={0.1} maxEdge={560} className="sx-fcard-canvas" />
                </div>
                <div className="sx-fcard-copy">
                  <h3 className="sx-card-h">{t.title}</h3>
                  <p className="sx-card-p">{t.body}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="sx-center"><Link href="/templates" className="sx-white">Browse all templates <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      {/* F — Use cases */}
      <section className="sx-section sx-bordered" id="use-cases">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h2 className="sx-display">Made for everyone who ships.</h2>
          </div>
          <div className="sx-usecases2" data-reveal>
            {useCases.map((u) => (
              <div className="sx-uc-item" key={u.label}>
                <h4>{u.label}</h4>
                <p>{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* G — Final CTA */}
      <section className="sx-section">
        <div className="sx-wrap">
          <div className="sx-finalcard" data-reveal>
            <h2 className="sx-display">Start creating beautiful mockups today.</h2>
            <p className="sx-sub">Free forever. No sign-up. Just drop in a screenshot and go.</p>
            <Link href="/editor" className="sx-pill sx-pill-lg">Generate your first mockup <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      {/* H — Footer */}
      <footer className="sx-footer sx-footer-slim">
        <div className="sx-wrap sx-footer-slim-in">
          <span className="sx-word">EasyFrame</span>
          <nav className="sx-footer-links" aria-label="Footer">
            <Link href="#how">How it works</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
          </nav>
          <span className="sx-footer-copy">© {new Date().getFullYear()} EasyFrame · Made in your browser.</span>
        </div>
      </footer>

      <StarttFX />
      <JsonLd data={softwareLd} />
    </div>
  );
}
