import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Gauge,
  Layers,
  Palette,
  Smartphone,
  Download
} from "lucide-react";
import { devices, gradientPresets } from "@/lib/editor/devices";
import { faqs, howItWorks, silhouetteClass, SITE_URL } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import AdSlot from "@/components/ads/AdSlot";

const features = [
  { icon: Lock, title: "Private by design", body: "Every pixel is composed in your browser with the Canvas API. Your screenshots never touch a server." },
  { icon: Gauge, title: "Crisp 4K exports", body: "Device frames render at full output resolution — razor-sharp edges and pixel-perfect screenshots." },
  { icon: Palette, title: "Gradients, your way", body: "Sixteen curated presets plus a custom gradient builder — pick any two colors and an angle." },
  { icon: Layers, title: "Layers & text", body: "Stack multiple images and add text in trending fonts, arranging every layer freely on the canvas." },
  { icon: Smartphone, title: "Every device", body: "iPhone, iPad, MacBook, Android, browser, watch and more — each frame drawn procedurally and sharp." },
  { icon: Download, title: "No watermark", body: "Download clean PNG, JPG, or WebP. No badge, no sign-up, no catch — ever." }
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
          <span className="mk-badge"><i className="mk-badge-dot" /> Free &amp; open <i className="mk-badge-dash" /> no account needed</span>
          <h1 className="mk-h1">Studio-grade <em>device mockups</em> for growing brands</h1>
          <p className="mk-sub">
            Drop a screenshot into an iPhone, iPad, MacBook, browser, or watch frame, style it with
            gradients and layers, and export a crisp mockup in seconds — it all runs in your browser,
            so your images never leave your device.
          </p>
          <div className="mk-hero-actions">
            <Link href="/editor" className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
            <Link href="/templates" className="mk-ghost">Browse templates</Link>
          </div>

          <div className="mk-proof">
            <div className="mk-avatars" aria-hidden="true"><span /><span /><span /><span /></div>
            <p><strong>Free forever</strong> — no watermark, no sign-up, nothing uploaded.</p>
          </div>

          <HeroVisual />

          <div className="mk-logos" aria-label="What you can make">
            <span className="mk-logos-label">Perfect for</span>
            <ul>
              <li>Launch posts</li>
              <li>App Store screenshots</li>
              <li>Landing pages</li>
              <li>Social media</li>
              <li>Product Hunt</li>
              <li>Docs &amp; decks</li>
            </ul>
          </div>
        </div>
      </header>

      <div className="mk-wrap"><AdSlot variant="header" /></div>

      <section className="mk-section" id="features">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <span className="mk-eyebrow">Why EasyFrame</span>
            <h2 className="mk-h2">Everything you need for a polished shot</h2>
            <p>No installs, no accounts, no uploads — just a fast, private mockup studio that lives in a browser tab.</p>
          </div>
          <div className="mk-featgrid">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <article className="mk-feat" key={f.title}>
                  <span className="mk-feat-icon"><Icon size={20} /></span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mk-section" id="how">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <span className="mk-eyebrow">How it works</span>
            <h2 className="mk-h2">Three steps to a polished mockup</h2>
          </div>
          <div className="mk-steps">
            {howItWorks.map((step, i) => (
              <div className="mk-step" key={step.title}>
                <b>{i + 1}</b>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section" id="templates">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <span className="mk-eyebrow">Templates</span>
            <h2 className="mk-h2">Every device you need, ready to frame</h2>
            <p>Pick a device to start, or open any template for examples and tips.</p>
          </div>
          <div className="mk-grid">
            {devices.map((d, i) => {
              const g = gradientPresets[i % gradientPresets.length];
              return (
                <Link key={d.slug} href={`/templates/${d.slug}`} className="mk-card">
                  <div className="mk-card-visual" style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}>
                    <span className={`mk-dev ${silhouetteClass(d)}`}><i /></span>
                  </div>
                  <div className="mk-card-body">
                    <h3>{d.name} Mockup</h3>
                    <p>{d.seoTitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mk-section" id="faq">
        <div className="mk-wrap">
          <div className="mk-section-head">
            <span className="mk-eyebrow">FAQ</span>
            <h2 className="mk-h2">Questions, answered</h2>
          </div>
          <div className="mk-faq">
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
          <div className="mk-band">
            <h2>Make your first mockup — free</h2>
            <p>No account, no watermark, no upload. Just a great-looking mockup in under a minute.</p>
            <Link href="/editor" className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <SiteFooter />
      <JsonLd data={softwareLd} />
      <JsonLd data={faqLd} />
    </main>
  );
}

/** Self-contained CSS mock of the editor output — a device framed on a green stage. */
function HeroVisual() {
  return (
    <div className="mk-hero-visual" aria-hidden="true">
      <div className="mk-glow" />
      <div className="mk-appwin">
        <div className="mk-appwin-bar">
          <i /><i /><i />
          <span>EasyFrame Studio</span>
        </div>
        <div className="mk-appwin-body">
          <aside className="mk-appwin-rail">
            <b /><b /><b /><b />
          </aside>
          <div className="mk-appwin-stage">
            <div className="mk-appwin-phone"><em /></div>
          </div>
          <aside className="mk-appwin-rail mk-appwin-rail-r">
            <b /><b /><b />
          </aside>
        </div>
      </div>
    </div>
  );
}
