import type { CSSProperties } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Gauge,
  Layers,
  Palette,
  Smartphone,
  Download,
  Tablet,
  Laptop,
  AppWindow,
  Watch,
  Rocket,
  LayoutTemplate,
  Share2,
  TrendingUp,
  FileText
} from "lucide-react";
import { devices, gradientPresets } from "@/lib/editor/devices";
import { faqs, howItWorks, silhouetteClass, SITE_URL } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import SiteMotion from "@/components/site/SiteMotion";
import JsonLd from "@/components/site/JsonLd";
import AdSlot from "@/components/ads/AdSlot";

/** Small helper for staggered reveal delay via a CSS custom property. */
const d = (i: number): CSSProperties => ({ "--d": i } as CSSProperties);

const useCases = [
  { icon: Rocket, label: "Launch posts" },
  { icon: Smartphone, label: "App Store screenshots" },
  { icon: LayoutTemplate, label: "Landing pages" },
  { icon: Share2, label: "Social media" },
  { icon: TrendingUp, label: "Product Hunt" },
  { icon: FileText, label: "Docs & decks" }
];

/** Representative outputs for the gallery (device silhouette + gradient), by kind. */
const shots = [
  { kind: "phone", name: "iPhone", g: gradientPresets[0] },
  { kind: "browser", name: "Browser", g: gradientPresets[4] },
  { kind: "laptop", name: "MacBook Pro", g: gradientPresets[2] },
  { kind: "tablet", name: "iPad", g: gradientPresets[6] },
  { kind: "phone", name: "Android", g: gradientPresets[10] },
  { kind: "watch", name: "Apple Watch", g: gradientPresets[8] }
];

export default function Landing() {
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
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
  };

  return (
    <main className="mk mk--light">
      <SiteNav />

      <header className="mk-hero">
        <div className="mk-wrap">
          <span className="mk-badge" data-reveal style={d(0)}><i className="mk-badge-dot" /> Free &amp; open <i className="mk-badge-dash" /> no account needed</span>
          <h1 className="mk-h1" data-reveal style={d(1)}>Studio-grade <em>device mockups</em> for growing brands</h1>
          <p className="mk-sub" data-reveal style={d(2)}>
            Drop a screenshot into an iPhone, iPad, MacBook, browser, or watch frame, style it with
            gradients and layers, and export a crisp mockup in seconds — it all runs in your browser,
            so your images never leave your device.
          </p>
          <div className="mk-hero-actions" data-reveal style={d(3)}>
            <Link href="/editor" className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
            <Link href="/templates" className="mk-ghost">Browse templates</Link>
          </div>

          <div className="mk-proof" data-reveal style={d(4)}>
            <div className="mk-avatars" aria-hidden="true"><span /><span /><span /><span /></div>
            <p><strong>Free forever</strong> — no watermark, no sign-up, nothing uploaded.</p>
          </div>

          <HeroVisual />
        </div>
      </header>

      <section className="mk-section" id="features">
        <div className="mk-wrap">
          <div className="mk-section-head" data-reveal>
            <span className="mk-eyebrow">Why EasyFrame</span>
            <h2 className="mk-h2">Everything you need for a polished shot</h2>
            <p>No installs, no accounts, no uploads — just a fast, private mockup studio that lives in a browser tab.</p>
          </div>

          <div className="mk-bento">
            <article className="mk-feat b-lg" data-reveal style={d(0)}>
              <div className="mk-feat-head">
                <span className="mk-feat-icon"><Palette size={20} /></span>
                <div>
                  <h3>Gradients, your way</h3>
                  <p>Sixteen curated presets plus a custom gradient builder — pick any two colors and an angle.</p>
                </div>
              </div>
              <div className="mk-graddemo" aria-hidden="true">
                <div className="mk-graddevice" />
                <div className="mk-gradswatches">
                  {gradientPresets.slice(0, 8).map((g) => (
                    <i key={g.id} style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />
                  ))}
                </div>
              </div>
            </article>

            <article className="mk-feat b-md" data-reveal style={d(1)}>
              <span className="mk-feat-icon"><Gauge size={20} /></span>
              <h3>Crisp 4K exports</h3>
              <p>Device frames render at full output resolution — razor-sharp edges and pixel-perfect screenshots.</p>
            </article>

            <article className="mk-feat b-md" data-reveal style={d(2)}>
              <span className="mk-feat-icon"><Lock size={20} /></span>
              <h3>Private by design</h3>
              <p>Every pixel is composed in your browser with the Canvas API. Your screenshots never touch a server.</p>
            </article>

            <article className="mk-feat b-sm" data-reveal style={d(3)}>
              <span className="mk-feat-icon"><Layers size={20} /></span>
              <h3>Layers &amp; text</h3>
              <p>Stack multiple images and add text in trending fonts, arranging every layer freely on the canvas.</p>
            </article>

            <article className="mk-feat b-sm" data-reveal style={d(4)}>
              <span className="mk-feat-icon"><Smartphone size={20} /></span>
              <h3>Every device</h3>
              <p>iPhone, iPad, MacBook, Android, browser, watch and more — each frame drawn procedurally and sharp.</p>
            </article>

            <article className="mk-feat b-sm" data-reveal style={d(5)}>
              <span className="mk-feat-icon"><Download size={20} /></span>
              <h3>No watermark</h3>
              <p>Download clean PNG, JPG, or WebP. No badge, no sign-up, no catch — ever.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--tight" id="gallery">
        <div className="mk-wrap">
          <div className="mk-section-head" data-reveal>
            <span className="mk-eyebrow">Made with EasyFrame</span>
            <h2 className="mk-h2">Real output, every device</h2>
            <p>A quick look at the kind of clean, on-brand mockups you can export — in any frame, on any background.</p>
          </div>
        </div>
        <div className="mk-gallery" data-reveal role="list" aria-label="Example mockups">
          {shots.map((s, i) => (
            <figure className="mk-shot" role="listitem" key={`${s.name}-${i}`}>
              <div className="mk-shot-stage" style={{ background: `linear-gradient(135deg, ${s.g.from}, ${s.g.to})` }}>
                <span className={`mk-shot-dev ${s.kind}`}>
                  <span className="mk-shot-screen" />
                </span>
              </div>
              <figcaption>{s.name} mockup</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <div className="mk-wrap"><AdSlot variant="incontent" frame collapse /></div>

      <section className="mk-section" id="how">
        <div className="mk-wrap">
          <div className="mk-section-head" data-reveal>
            <span className="mk-eyebrow">How it works</span>
            <h2 className="mk-h2">Three steps to a polished mockup</h2>
          </div>
          <div className="mk-steps">
            {howItWorks.map((step, i) => (
              <div className="mk-step" data-reveal style={d(i)} key={step.title}>
                <b>{i + 1}</b>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section--tight" id="use-cases">
        <div className="mk-wrap">
          <div className="mk-usecases" data-reveal>
            <span className="mk-usecases-label">Perfect for</span>
            <ul>
              {useCases.map((u, i) => {
                const Icon = u.icon;
                return (
                  <li key={u.label} style={d(i)}>
                    <span className="mk-usecard-icon"><Icon size={16} /></span>
                    {u.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="mk-section" id="templates">
        <div className="mk-wrap">
          <div className="mk-section-head" data-reveal>
            <span className="mk-eyebrow">Templates</span>
            <h2 className="mk-h2">Every device you need, ready to frame</h2>
            <p>Pick a device to start, or open any template for examples and tips.</p>
          </div>
          <div className="mk-grid">
            {devices.map((dev, i) => {
              const g = gradientPresets[i % gradientPresets.length];
              return (
                <Link key={dev.slug} href={`/templates/${dev.slug}`} className="mk-card" data-reveal style={d(i % 3)}>
                  <div className="mk-card-visual" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
                    <span className={`mk-dev ${silhouetteClass(dev)}`}><i /></span>
                  </div>
                  <div className="mk-card-body">
                    <h3>{dev.name} Mockup</h3>
                    <p>{dev.seoTitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mk-section" id="faq">
        <div className="mk-wrap">
          <div className="mk-section-head" data-reveal>
            <span className="mk-eyebrow">FAQ</span>
            <h2 className="mk-h2">Questions, answered</h2>
          </div>
          <div className="mk-faq" data-reveal>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-wrap">
          <div className="mk-band" data-reveal>
            <h2>Make your first mockup — free</h2>
            <p>No account, no watermark, no upload. Just a great-looking mockup in under a minute.</p>
            <Link href="/editor" className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <SiteMotion />
      <JsonLd data={softwareLd} />
      <JsonLd data={faqLd} />
    </main>
  );
}

/** Detailed, CSS-drawn mock of the EasyFrame editor — real UI, not lorem blocks. */
function HeroVisual() {
  const sideDevices = [
    { icon: Smartphone, name: "iPhone 15 Pro", on: true },
    { icon: Tablet, name: "iPad Pro", on: false },
    { icon: Laptop, name: "MacBook Pro", on: false },
    { icon: AppWindow, name: "Browser", on: false },
    { icon: Watch, name: "Apple Watch", on: false }
  ];
  return (
    <div className="mk-visual" data-parallax data-reveal style={d(5)}>
      <div className="mk-visual-glow" aria-hidden="true" />
      <div className="mk-editor" aria-label="EasyFrame editor preview" role="img">
        <div className="mk-editor-bar">
          <div className="mk-editor-dots"><i /><i /><i /></div>
          <span className="mk-editor-title">EasyFrame Studio</span>
          <span className="mk-editor-tag">Auto-saved</span>
        </div>
        <div className="mk-editor-body">
          <aside className="mk-editor-side">
            <p className="mk-side-h">Devices</p>
            <ul className="mk-devlist">
              {sideDevices.map((dv) => {
                const Icon = dv.icon;
                return (
                  <li key={dv.name} className={dv.on ? "on" : ""}>
                    <Icon size={15} /> {dv.name}
                  </li>
                );
              })}
            </ul>
            <p className="mk-side-h">Background</p>
            <div className="mk-side-swatches">
              {gradientPresets.slice(0, 5).map((g) => (
                <i key={g.id} style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }} />
              ))}
            </div>
          </aside>

          <div className="mk-editor-canvas">
            <div className="mk-canvas-toolbar">
              <span className="on">Frame</span>
              <span>Background</span>
              <span>Layers</span>
              <span>Text</span>
              <span className="mk-canvas-zoom">100%</span>
            </div>
            <div className="mk-canvas-stage">
              <div className="mk-phone">
                <span className="mk-phone-island" />
                <div className="mk-phone-screen">
                  <div className="app-status"><b>9:41</b><span /></div>
                  <div className="app-head"><strong>Discover</strong><i /></div>
                  <div className="app-hero"><em>Featured</em></div>
                  <div className="app-cards"><i /><i /></div>
                  <div className="app-row"><i /><span><b /><s /></span></div>
                  <div className="app-row"><i /><span><b /><s /></span></div>
                  <div className="app-tabs"><i className="on" /><i /><i /><i /></div>
                </div>
              </div>
            </div>
          </div>

          <aside className="mk-editor-panel">
            <p className="mk-side-h">Export</p>
            <div className="mk-fmt"><b>PNG</b><span>JPG</span><span>WebP</span></div>
            <div className="mk-res"><span className="on">2K</span><span>4K</span></div>
            <div className="mk-slider"><i /></div>
            <button className="mk-export" type="button" tabIndex={-1}>Download <Download size={15} /></button>
          </aside>
        </div>
      </div>
    </div>
  );
}
