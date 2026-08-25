import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, Lock, Sparkles } from "lucide-react";
import type { BackgroundSetting } from "@/lib/editor/compositor";
import { devices } from "@/lib/editor/devices";
import { faqs, howItWorks, SITE_URL } from "@/lib/site";
import HeroDemo from "@/components/site/HeroDemo";
import MockShot from "@/components/site/MockShot";
import StudioFX from "@/components/site/StudioFX";
import JsonLd from "@/components/site/JsonLd";

const raiseBg: BackgroundSetting = { type: "gradient", from: "#1a1e26", to: "#0c0e13", angle: 135 };
const steelBg: BackgroundSetting = { type: "gradient", from: "#26303a", to: "#141a20", angle: 135 };
const violetBg: BackgroundSetting = { type: "gradient", from: "#241a2e", to: "#12101a", angle: 135 };
const inkBg: BackgroundSetting = { type: "solid", color: "#0e1116" };

const marquee = [
  "iPhone", "iPad", "MacBook", "Apple Watch", "Browser", "Android", "Smart TV",
  "Launch posts", "App Store shots", "Product Hunt", "Landing pages", "Social media"
];

const gallery: { device: string; sample: number; bg: BackgroundSetting; name: string }[] = [
  { device: "iphone-mockup", sample: 0, bg: raiseBg, name: "iPhone 15 Pro" },
  { device: "macbook-pro-mockup", sample: 1, bg: steelBg, name: "MacBook Pro" },
  { device: "ipad-mockup", sample: 2, bg: violetBg, name: "iPad Pro" },
  { device: "browser-mockup", sample: 1, bg: inkBg, name: "Browser" },
  { device: "android-phone-mockup", sample: 2, bg: steelBg, name: "Android" },
  { device: "apple-watch-mockup", sample: 0, bg: violetBg, name: "Apple Watch" }
];

const gradSwatches = [
  "linear-gradient(135deg,#FF5B3A,#8B7CFF)",
  "linear-gradient(135deg,#0EA5A3,#34d399)",
  "linear-gradient(135deg,#F59E0B,#EF4444)",
  "linear-gradient(135deg,#6366F1,#22D3EE)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)"
];

export default function StudioLanding() {
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
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
  };

  return (
    <div className="st">
      {/* S0 — Nav */}
      <nav className="st-nav" aria-label="Primary">
        <div className="st-wrap st-nav-in">
          <Link href="/" className="st-word">EasyFrame</Link>
          <div className="st-nav-links">
            <Link href="/editor">Editor</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <Link href="/editor" className="st-btn st-btn-accent st-nav-cta">Open free editor <ArrowRight size={16} /></Link>
        </div>
      </nav>

      {/* S1 — Hero */}
      <header className="st-hero">
        <div className="st-wrap st-hero-grid">
          <div className="st-hero-copy">
            <span className="st-badge" data-reveal><i className="st-pulse" /> FREE · NO ACCOUNT · NOTHING UPLOADED</span>
            <h1 className="st-h1" data-reveal style={{ "--d": 1 } as CSSProperties}>Studio-grade <em>device mockups</em> for growing brands</h1>
            <p className="st-lead" data-reveal style={{ "--d": 2 } as CSSProperties}>
              Drop a screenshot into a real device frame, style the background, and export a crisp mockup in
              seconds. It all runs in your browser — your images never leave your device.
            </p>
            <div className="st-hero-actions" data-reveal style={{ "--d": 3 } as CSSProperties}>
              <Link href="/editor" className="st-btn st-btn-accent st-btn-lg">Open the free editor <ArrowRight size={18} /></Link>
              <Link href="/templates" className="st-btn st-btn-ghost st-btn-lg">Browse templates</Link>
            </div>
            <p className="st-proof" data-reveal style={{ "--d": 4 } as CSSProperties}>Free forever · no watermark · runs in your browser</p>
          </div>

          <div className="st-hero-demo" data-reveal style={{ "--d": 2 } as CSSProperties}>
            <HeroDemo />
          </div>
        </div>
      </header>

      {/* S2 — Marquee */}
      <div className="st-marquee" aria-hidden="true">
        <div className="st-marquee-track">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i}>{m}<b>◇</b></span>
          ))}
        </div>
      </div>

      {/* S3 — Bento */}
      <section className="st-section" id="features">
        <div className="st-wrap">
          <div className="st-head" data-reveal>
            <span className="st-eyebrow">Why EasyFrame</span>
            <h2 className="st-h2">A studio in a browser tab</h2>
          </div>
          <div className="st-bento">
            <article className="st-card st-c-a" data-reveal>
              <div className="st-card-body">
                <span className="st-chip"><Lock size={14} /> Private by design</span>
                <h3>Your screenshots never leave the browser</h3>
                <p>Every pixel is composed locally with the Canvas API. There is no upload, no server, no storage — the file goes from your clipboard to your download.</p>
              </div>
              <div className="st-privacy" aria-hidden="true">
                <span className="st-node st-node-file">PNG</span>
                <span className="st-flow" />
                <span className="st-node st-node-browser">Browser</span>
                <code>canvas.toBlob() → download · no network calls</code>
              </div>
            </article>

            <article className="st-card st-c-b" data-reveal style={{ "--d": 1 } as CSSProperties}>
              <span className="st-chip"><Sparkles size={14} /> Crisp 4K exports</span>
              <h3>Razor-sharp, up to 3840px</h3>
              <p>Frames render at full output resolution — no upscaled mush.</p>
              <div className="st-res">
                <div><b>2048</b><span>Free</span></div>
                <div className="on"><b>3840</b><span>Premium · 4K</span></div>
              </div>
            </article>

            <article className="st-card st-c-c st-gradcard" data-reveal style={{ "--d": 2, "--grad-bg": gradSwatches[0] } as CSSProperties}>
              <span className="st-chip">Gradients, your way</span>
              <h3>Sixteen presets + a custom builder</h3>
              <div className="st-gradpreview" />
              <div className="st-gradswatches">
                {gradSwatches.map((g, i) => (
                  <button key={g} type="button" data-grad={g} className={i === 0 ? "on" : ""} style={{ background: g }} aria-label={`Gradient ${i + 1}`} />
                ))}
              </div>
            </article>

            <article className="st-card st-c-d" data-reveal style={{ "--d": 1 } as CSSProperties}>
              <div className="st-card-body">
                <span className="st-chip">Every device, drawn procedurally</span>
                <h3>iPhone to Smart TV — all sharp, all free</h3>
              </div>
              <div className="st-devrow">
                {[
                  { d: "iphone-mockup", s: 0 },
                  { d: "ipad-mockup", s: 2 },
                  { d: "android-phone-mockup", s: 1 },
                  { d: "apple-watch-mockup", s: 0 }
                ].map((x) => (
                  <div className="st-devrow-item" key={x.d}>
                    <MockShot device={x.d} sample={x.s} background={raiseBg} padding={0.1} maxEdge={520} className="st-devrow-canvas" />
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* S4 — Gallery of real outputs */}
      <section className="st-section" id="gallery">
        <div className="st-wrap">
          <div className="st-head" data-reveal>
            <span className="st-eyebrow">Made with EasyFrame</span>
            <h2 className="st-h2">Every device you need, ready to frame</h2>
            <p>Real output from the same engine that powers the editor — on any device, any background.</p>
          </div>
          <div className="st-gallery">
            {gallery.map((g, i) => (
              <figure className="st-tile" data-reveal style={{ "--d": i % 3 } as CSSProperties} key={g.name}>
                <div className="st-tile-shot">
                  <MockShot device={g.device} sample={g.sample} background={g.bg} className="st-tile-canvas" caption={`${g.name} mockup`} />
                </div>
                <figcaption>{g.name}<span> · EasyFrame export</span></figcaption>
              </figure>
            ))}
          </div>
          <div className="st-center"><Link href="/templates" className="st-btn st-btn-ghost">Browse all templates <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      {/* S5 — How it works */}
      <section className="st-section" id="how">
        <div className="st-wrap">
          <div className="st-head" data-reveal>
            <span className="st-eyebrow">How it works</span>
            <h2 className="st-h2">Three steps to a polished mockup</h2>
          </div>
          <div className="st-steps">
            {howItWorks.map((step, i) => (
              <div className="st-step" data-reveal style={{ "--d": i } as CSSProperties} key={step.title}>
                <span className="st-step-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S7 — Pricing teaser */}
      <section className="st-section" id="pricing">
        <div className="st-wrap">
          <div className="st-head" data-reveal>
            <span className="st-eyebrow">Pricing</span>
            <h2 className="st-h2">Free to start, forever</h2>
          </div>
          <div className="st-price">
            <div className="st-price-card" data-reveal>
              <h3>Free</h3>
              <p className="st-price-amt">$0</p>
              <ul>
                <li><Check size={16} /> Unlimited mockups &amp; exports</li>
                <li><Check size={16} /> Every device frame</li>
                <li><Check size={16} /> Up to 2048px · no watermark</li>
                <li><Check size={16} /> No account required</li>
              </ul>
              <Link href="/editor" className="st-btn st-btn-ghost st-btn-block">Open the editor</Link>
            </div>
            <div className="st-price-card is-premium" data-reveal style={{ "--d": 1 } as CSSProperties}>
              <span className="st-price-flag">Premium</span>
              <h3>Premium</h3>
              <p className="st-price-amt">$6<span>/mo · or $99 once</span></p>
              <ul>
                <li><Check size={16} /> 4K exports (3840px)</li>
                <li><Check size={16} /> Transparent PNGs</li>
                <li><Check size={16} /> Custom background uploads</li>
                <li><Check size={16} /> Batch export &amp; saved projects</li>
              </ul>
              <Link href="/pricing" className="st-btn st-btn-accent st-btn-block">See Premium <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* S8 — FAQ */}
      <section className="st-section" id="faq">
        <div className="st-wrap st-faq-wrap">
          <div className="st-head" data-reveal>
            <span className="st-eyebrow">FAQ</span>
            <h2 className="st-h2">Questions, answered</h2>
          </div>
          <div className="st-faq" data-reveal>
            {faqs.map((f) => (
              <details key={f.q} name="faq">
                <summary>{f.q}<i /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* S9 — Final CTA */}
      <section className="st-final">
        <div className="st-final-glow" aria-hidden="true" />
        <div className="st-wrap st-final-in" data-reveal>
          <h2 className="st-h1">Make your first mockup — <em>free</em>.</h2>
          <Link href="/editor" className="st-btn st-btn-accent st-btn-lg">Open the free editor <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* S10 — Footer */}
      <footer className="st-footer">
        <div className="st-wrap st-footer-grid">
          <div className="st-footer-brand">
            <span className="st-word">EasyFrame</span>
            <p>Studio-grade device mockups, made in your browser.</p>
          </div>
          <div className="st-footer-col">
            <h4>Product</h4>
            <Link href="/editor">Free editor</Link>
            <Link href="/templates">Templates</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="st-footer-col">
            <h4>Devices</h4>
            {devices.slice(0, 8).map((dv) => (
              <Link key={dv.slug} href={`/templates/${dv.slug}`}>{dv.name}</Link>
            ))}
          </div>
          <div className="st-footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div className="st-wrap st-footer-bottom">
          <span>© {new Date().getFullYear()} EasyFrame</span>
          <span className="st-mono">Made in your browser</span>
        </div>
      </footer>

      <StudioFX />
      <JsonLd data={softwareLd} />
      <JsonLd data={faqLd} />
    </div>
  );
}
