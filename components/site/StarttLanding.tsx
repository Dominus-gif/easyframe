import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight, Smartphone, Tablet, Laptop, AppWindow, Watch,
  MousePointerClick, Upload, Download,
  Store, Presentation, Share2, LayoutTemplate
} from "lucide-react";
import { SITE_URL } from "@/lib/site";
import StarttFX from "@/components/site/StarttFX";
import JsonLd from "@/components/site/JsonLd";
import FeaturesCards from "@/components/ui/features-cards";

const rd = (i: number): CSSProperties => ({ "--d": i } as CSSProperties);

const devices = [
  { label: "iPhone", Icon: Smartphone },
  { label: "Android", Icon: Smartphone },
  { label: "iPad", Icon: Tablet },
  { label: "MacBook", Icon: Laptop },
  { label: "Browser", Icon: AppWindow },
  { label: "Apple Watch", Icon: Watch }
];

const steps = [
  { n: "01", title: "Pick your device", body: "Choose from iPhone, Android, tablet, laptop or browser frames.", Icon: MousePointerClick },
  { n: "02", title: "Drop in your screenshot", body: "Upload a shot of your app and we fit it perfectly into the frame.", Icon: Upload },
  { n: "03", title: "Export & share", body: "Download a PNG or JPG, or copy a share link to show off your work anywhere.", Icon: Download }
];

const destinations = [
  { title: "App Store ready", body: "Frames sized for every store listing dimension.", Icon: Store },
  { title: "Pitch deck layouts", body: "Clean device compositions for investor decks.", Icon: Presentation },
  { title: "Social media kits", body: "Square and vertical crops built for Instagram and X.", Icon: Share2 },
  { title: "Landing page heroes", body: "Mockups sized to drop straight into your hero section.", Icon: LayoutTemplate }
];

const stats = [
  { b: "6", s: "Device families" },
  { b: "9", s: "Sample UIs built in" },
  { b: "100%", s: "In your browser" },
  { b: "$0", s: "Free, forever" }
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
          <Link href="/editor" className="sx-pill sx-nav-cta">Open EasyFrame</Link>
        </div>
      </nav>

      {/* B — Hero */}
      <header className="sx-hero">
        <div className="sx-wrap sx-hero-in">
          <span className="sx-eyebrow-tag" data-reveal>Free device mockup generator</span>
          <h1 className="sx-display sx-hero-h1" data-reveal>Make your app look <em className="sx-accent">stunning</em> — without a designer.</h1>
          <p className="sx-sub sx-hero-sub" data-reveal style={rd(1)}>
            Drop in a screenshot and get a realistic device mockup in seconds. Free, no sign-up required.
          </p>
          <div className="sx-cta-row" data-reveal style={rd(2)}>
            <Link href="/editor" className="sx-pill sx-pill-lg">Generate a mockup <ArrowRight size={17} /></Link>
            <Link href="/templates" className="sx-white sx-white-lg">See templates</Link>
          </div>
          <div className="sx-devstrip" data-reveal style={rd(3)} aria-label="Supported devices">
            {devices.map(({ label, Icon }) => (
              <span className="sx-devchip" key={label}><Icon size={16} strokeWidth={1.75} /> {label}</span>
            ))}
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
          <div className="sx-fgrid">
            {steps.map((s, i) => (
              <article className="sx-fcard sx-icard" data-reveal style={rd(i)} key={s.n}>
                <div className="sx-icard-top">
                  <div className="sx-fcard-ic"><s.Icon size={20} strokeWidth={1.9} /></div>
                  <span className="sx-stepnum">{s.n}</span>
                </div>
                <div className="sx-fcard-copy">
                  <h3 className="sx-card-h">{s.title}</h3>
                  <p className="sx-card-p">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D — Feature grid (soft cards) */}
      <div className="sx-bordered">
        <FeaturesCards />
      </div>

      {/* E — Stat band */}
      <section className="sx-section sx-bordered">
        <div className="sx-wrap">
          <div className="sx-statband" data-reveal>
            {stats.map((st) => (
              <div className="sx-stat" key={st.s}>
                <b className="sx-display">{st.b}</b>
                <span>{st.s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* F — Where your work goes (was Templates) */}
      <section className="sx-section sx-bordered" id="templates">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h2 className="sx-display">Made for where your work goes.</h2>
            <p className="sx-sub">Starting points sized for exactly where your mockup is headed.</p>
          </div>
          <div className="sx-fgrid sx-fgrid-4">
            {destinations.map((t, i) => (
              <article className="sx-fcard sx-icard" data-reveal style={rd(i % 2)} key={t.title}>
                <div className="sx-icard-top">
                  <div className="sx-fcard-ic"><t.Icon size={20} strokeWidth={1.9} /></div>
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

      {/* G — Use cases */}
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

      {/* H — Final CTA */}
      <section className="sx-section">
        <div className="sx-wrap">
          <div className="sx-finalcard" data-reveal>
            <h2 className="sx-display">Start creating beautiful mockups today.</h2>
            <p className="sx-sub">Free forever. No sign-up. Just drop in a screenshot and go.</p>
            <Link href="/editor" className="sx-pill sx-pill-lg">Generate your first mockup <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      {/* I — Footer */}
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
