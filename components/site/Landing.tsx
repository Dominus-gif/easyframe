import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { devices, gradientPresets } from "@/lib/editor/devices";
import { faqs, howItWorks, silhouetteClass, SITE_URL } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import AdSlot from "@/components/ads/AdSlot";

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
    <main className="mk">
      <SiteNav />

      <header className="mk-hero">
        <div className="mk-wrap">
          <span className="mk-kicker"><Sparkles size={15} /> Free · no account · nothing uploaded</span>
          <h1 className="mk-h1">The free <em>device mockup</em> generator</h1>
          <p className="mk-sub">
            Drop a screenshot into an iPhone, iPad, MacBook, tablet, browser, or watch frame, style it,
            and download a crisp mockup in seconds. It all runs in your browser — your images never leave your device.
          </p>
          <div className="mk-hero-actions">
            <Link href="/editor" className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
            <Link href="/templates" className="mk-ghost">Browse templates</Link>
          </div>
          <div className="mk-trust">
            <span><Check size={16} /> No sign-up required</span>
            <span><Zap size={16} /> Unlimited free exports</span>
            <span><ShieldCheck size={16} /> Processed in your browser</span>
          </div>
        </div>
      </header>

      <div className="mk-wrap"><AdSlot variant="header" /></div>

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
