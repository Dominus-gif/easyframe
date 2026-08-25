import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BackgroundSetting } from "@/lib/editor/compositor";
import { devices } from "@/lib/editor/devices";
import { SITE_URL } from "@/lib/site";
import MockShot from "@/components/site/MockShot";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import StarttFX from "@/components/site/StarttFX";
import JsonLd from "@/components/site/JsonLd";

const rd = (i: number): CSSProperties => ({ "--d": i } as CSSProperties);

const lav: BackgroundSetting = { type: "gradient", from: "#ECECF4", to: "#F6F6FA", angle: 135 };
const purpleT: BackgroundSetting = { type: "gradient", from: "#FAF7FF", to: "#EFEAFF", angle: 135 };
const pinkT: BackgroundSetting = { type: "gradient", from: "#FDF9FB", to: "#FBEFF6", angle: 135 };
const mintT: BackgroundSetting = { type: "gradient", from: "#F1FCF6", to: "#E7F8EF", angle: 135 };
const skyT: BackgroundSetting = { type: "gradient", from: "#F2FBFF", to: "#E6F5FB", angle: 135 };

const steps = [
  {
    n: 1,
    title: "Upload your screenshot.",
    body: "Drop any screenshot into the editor. It's processed entirely in your browser — nothing is ever uploaded to a server.",
    device: "browser-mockup",
    sample: 1,
    bg: skyT
  },
  {
    n: 2,
    title: "Pick a device & style it.",
    body: "Frame it on an iPhone, iPad, MacBook or more. Add gradients, layers and text with the built-in tools.",
    device: "iphone-mockup",
    sample: 0,
    bg: purpleT
  },
  {
    n: 3,
    title: "Download in seconds.",
    body: "Export as PNG, JPEG or WebP — free up to 2048px, with 4K and transparent backgrounds on Premium.",
    device: "macbook-pro-mockup",
    sample: 2,
    bg: mintT
  }
];

const proof: { device: string; sample: number; bg: BackgroundSetting }[] = [
  { device: "iphone-mockup", sample: 0, bg: purpleT },
  { device: "ipad-mockup", sample: 2, bg: pinkT },
  { device: "macbook-pro-mockup", sample: 1, bg: skyT },
  { device: "apple-watch-mockup", sample: 0, bg: mintT }
];

const testimonials = [
  {
    quote: "We built EasyFrame because every mockup tool wanted an account, a subscription, or an upload. So we made one that needs none.",
    name: "The EasyFrame team",
    role: "Why we built it"
  },
  {
    quote: "Your screenshots are composited on your own device with the Canvas API. We literally can't see them — and that's the point.",
    name: "EasyFrame",
    role: "On privacy"
  }
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
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "1200" }
  };

  return (
    <div className="sx">
      <AnnouncementBar />

      {/* S1 — Nav */}
      <nav className="sx-nav" aria-label="Primary">
        <div className="sx-wrap sx-nav-in">
          <Link href="/" className="sx-word">EasyFrame</Link>
          <div className="sx-nav-links">
            <Link href="/editor">Editor</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <Link href="/editor" className="sx-pill sx-nav-cta">Open free editor</Link>
        </div>
      </nav>

      {/* S2 — Hero */}
      <header className="sx-hero">
        <div className="sx-wrap sx-hero-in">
          <p className="sx-kicker" data-reveal>No design tools. No <span className="sx-strike">Photoshop</span>. Just your browser.</p>
          <h1 className="sx-h1" data-reveal style={rd(1)}>Studio-grade device mockups for growing brands</h1>
          <p className="sx-sub sx-hero-sub" data-reveal style={rd(2)}>
            Drop in any screenshot, pick a device, and export a polished mockup — all in your browser, free.
          </p>
          <div className="sx-cta-row" data-reveal style={rd(3)}>
            <Link href="/editor" className="sx-pill sx-pill-lg">Open the free editor <ArrowRight size={17} /></Link>
            <Link href="/templates" className="sx-white sx-white-lg">Browse templates</Link>
          </div>
          <div className="sx-proof" data-reveal style={rd(4)}>
            <div className="sx-proof-avatars">
              {proof.map((p, i) => (
                <span className="sx-proof-av" key={i}>
                  <MockShot device={p.device} sample={p.sample} background={p.bg} padding={0.08} maxEdge={220} className="sx-proof-canvas" />
                </span>
              ))}
            </div>
            <span className="sx-proof-text">Free forever · no watermark · nothing uploaded</span>
          </div>
        </div>
      </header>

      {/* S3 — How it works */}
      <section className="sx-section" id="how">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h3 className="sx-h3">How it works</h3>
            <p className="sx-sub">Three steps to a polished mockup</p>
          </div>
          <div className="sx-steps">
            {steps.map((s, i) => (
              <div className={`sx-step-row${i % 2 ? " reverse" : ""}`} data-reveal key={s.n}>
                <div className="sx-step-media" style={{ background: `linear-gradient(135deg, ${(s.bg as { from: string }).from}, ${(s.bg as { to: string }).to})` }}>
                  <MockShot device={s.device} sample={s.sample} background={s.bg} padding={0.13} maxEdge={1100} className="sx-step-canvas" />
                </div>
                <div className="sx-step-copy">
                  <span className="sx-step-label">Step {s.n}</span>
                  <h4 className="sx-step-title">{s.title}</h4>
                  <p className="sx-step-body">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S4 — Bento features */}
      <section className="sx-band" id="features">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h3 className="sx-h3">Everything you need for a polished shot</h3>
            <p className="sx-sub">Here&apos;s what makes EasyFrame different.</p>
          </div>
          <div className="sx-bento">
            {/* A — full width */}
            <article className="sx-card sx-b-full" data-reveal>
              <div className="sx-panel panel-blue">
                <svg className="sx-privacy-svg" viewBox="0 0 460 150" role="img" aria-label="Pixels flow from a file to the browser and stay there">
                  <rect x="20" y="55" width="70" height="46" rx="9" fill="#fff" stroke="#D9E9F2" />
                  <text x="55" y="82" textAnchor="middle" fontFamily="Geist, Inter, sans-serif" fontSize="13" fontWeight="600" fill="#1b1b1b">PNG</text>
                  <path d="M96 78 H250" stroke="#6E41E2" strokeWidth="2" strokeDasharray="5 5" />
                  <circle className="sx-flow-dot" cx="96" cy="78" r="4.5" fill="#6E41E2" />
                  <rect x="256" y="42" width="150" height="72" rx="10" fill="#fff" stroke="#D9E9F2" />
                  <rect x="256" y="42" width="150" height="18" rx="10" fill="#F5FDFF" />
                  <circle cx="268" cy="51" r="2.4" fill="#CBD5E1" /><circle cx="277" cy="51" r="2.4" fill="#CBD5E1" /><circle cx="286" cy="51" r="2.4" fill="#CBD5E1" />
                  <text x="331" y="88" textAnchor="middle" fontFamily="Geist, Inter, sans-serif" fontSize="12" fontWeight="600" fill="#1b1b1b">Browser</text>
                  <g opacity="0.9"><circle cx="418" cy="120" r="15" fill="#FFF3ED" stroke="#FFD9C4" /><path d="M412 120 l4 4 l8 -9" stroke="#FF5C01" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
                </svg>
              </div>
              <div className="sx-card-copy">
                <h3>Private by design</h3>
                <p>Your screenshots never leave your device. Everything renders on a local canvas — no upload, no server, no storage.</p>
              </div>
            </article>

            {/* B — 4K */}
            <article className="sx-card sx-b-half" data-reveal style={rd(1)}>
              <div className="sx-panel panel-purple">
                <div className="sx-res-compare">
                  <div><span className="bar bar-sm" /><em>2048px</em><small>Free</small></div>
                  <div className="on"><span className="bar bar-lg" /><em>3840px</em><small>Premium · 4K</small></div>
                </div>
              </div>
              <div className="sx-card-copy">
                <h3>Crisp 4K exports</h3>
                <p>Export up to 4K with Premium, so your mockups look sharp on any screen.</p>
              </div>
            </article>

            {/* C — gradients */}
            <article className="sx-card sx-b-half" data-reveal style={rd(2)}>
              <div className="sx-panel panel-pink">
                <div className="sx-grad-preview" />
                <div className="sx-grad-swatches">
                  {["#6E41E2,#22D3EE", "#FF5C01,#FFB347", "#EC4899,#8B5CF6", "#0EA5A3,#34D399", "#6366F1,#22D3EE", "#F59E0B,#EF4444"].map((g) => (
                    <i key={g} style={{ background: `linear-gradient(135deg, ${g.split(",")[0]}, ${g.split(",")[1]})` }} />
                  ))}
                </div>
              </div>
              <div className="sx-card-copy">
                <h3>Gradients, your way</h3>
                <p>Pick a preset or build your own — every background is rendered in-browser.</p>
              </div>
            </article>

            {/* D — layers */}
            <article className="sx-card sx-b-half" data-reveal style={rd(1)}>
              <div className="sx-panel panel-yellow">
                <div className="sx-layers">
                  {["Text — “Ship it”", "Logo.png", "Screenshot", "Background"].map((l, i) => (
                    <div className={`sx-layer${i === 0 ? " on" : ""}`} key={l}><span className="sx-layer-dot" />{l}</div>
                  ))}
                </div>
              </div>
              <div className="sx-card-copy">
                <h3>Layers &amp; text</h3>
                <p>Add layers, text and fonts to make the shot exactly yours.</p>
              </div>
            </article>

            {/* E — every device */}
            <article className="sx-card sx-b-half" data-reveal style={rd(2)}>
              <div className="sx-panel panel-green sx-devpanel">
                {[
                  { d: "iphone-mockup", s: 0 },
                  { d: "ipad-mockup", s: 2 },
                  { d: "apple-watch-mockup", s: 0 },
                  { d: "macbook-pro-mockup", s: 1 }
                ].map((x) => (
                  <MockShot key={x.d} device={x.d} sample={x.s} background={lav} padding={0.09} maxEdge={420} className="sx-dev-canvas" />
                ))}
              </div>
              <div className="sx-card-copy">
                <h3>Every device</h3>
                <p>iPhone, iPad, MacBook, Apple Watch, monitors and more — all drawn procedurally.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* S5 — Testimonials */}
      <section className="sx-section sx-testi-sec">
        <div className="sx-wrap">
          <div className="sx-head" data-reveal>
            <h3 className="sx-h3">Loved by makers</h3>
            <p className="sx-sub">Built by indie makers, for indie makers.</p>
          </div>
          <div className="sx-testi">
            {testimonials.map((t, i) => (
              <figure className="sx-quote" data-reveal style={rd(i)} key={t.name}>
                <blockquote>{t.quote}</blockquote>
                <figcaption><b>{t.name}</b><span>{t.role}</span></figcaption>
              </figure>
            ))}
            <Link href="/blog" className="sx-quote sx-quote-cta" data-reveal style={rd(2)}>
              <span>Made something with EasyFrame?</span>
              <b>We&apos;d love to feature it <ArrowRight size={15} /></b>
            </Link>
          </div>
        </div>
      </section>

      {/* S6 — Final CTA */}
      <section className="sx-section sx-final">
        <div className="sx-wrap">
          <div className="sx-final-copy" data-reveal>
            <h5 className="sx-h5">Make your first mockup — free.</h5>
            <p className="sx-sub">No account needed. No watermark. Just open the editor.</p>
            <div className="sx-cta-row">
              <Link href="/editor" className="sx-pill sx-pill-lg">Open the free editor <ArrowRight size={17} /></Link>
              <Link href="/templates" className="sx-white sx-white-lg">Browse templates</Link>
            </div>
          </div>
          <div className="sx-final-visual" data-reveal style={rd(1)}>
            <div className="sx-final-shot big"><MockShot device="macbook-pro-mockup" sample={1} background={lav} padding={0.12} maxEdge={1200} className="sx-final-canvas" /></div>
            <div className="sx-final-shot small"><MockShot device="iphone-mockup" sample={0} background={purpleT} padding={0.1} maxEdge={700} className="sx-final-canvas" /></div>
          </div>
        </div>
      </section>

      {/* S7 — Footer */}
      <footer className="sx-footer">
        <div className="sx-wrap sx-footer-grid">
          <div className="sx-footer-brand">
            <span className="sx-word">EasyFrame</span>
            <p>Studio-grade device mockups, made in your browser.</p>
          </div>
          <div className="sx-footer-col">
            <h4>Product</h4>
            <Link href="/editor">Free editor</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="sx-footer-col">
            <h4>Devices</h4>
            {devices.slice(0, 8).map((d) => (
              <Link key={d.slug} href={`/templates/${d.slug}`}>{d.name}</Link>
            ))}
          </div>
          <div className="sx-footer-col">
            <h4>Company</h4>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
            <a href="mailto:contact@easyframe.app">Contact</a>
          </div>
          <div className="sx-footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div className="sx-wrap sx-footer-bottom">
          <span>© {new Date().getFullYear()} EasyFrame</span>
          <span>Made in your browser.</span>
        </div>
      </footer>

      <StarttFX />
      <JsonLd data={softwareLd} />
    </div>
  );
}
