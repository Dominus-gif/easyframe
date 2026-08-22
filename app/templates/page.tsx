import type { Metadata } from "next";
import Link from "next/link";
import { devices, gradientPresets } from "@/lib/editor/devices";
import { categories, silhouetteClass } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Free Mockup Templates — iPhone, iPad, MacBook & More | EasyFrame",
  description:
    "Browse free device mockup templates — iPhone, iPad, MacBook, Android tablet, browser, and Apple Watch. Frame any screenshot in your browser, no account required.",
  alternates: { canonical: "https://www.easyframe.app/templates" }
};

export default function TemplatesIndex() {
  return (
    <main className="mk">
      <SiteNav />
      <header className="mk-hero">
        <div className="mk-wrap">
          <span className="mk-kicker">Templates</span>
          <h1 className="mk-h1">Free mockup <em>templates</em></h1>
          <p className="mk-sub">Pick a device to frame your screenshot. Every template is free, watermark-free, and runs entirely in your browser.</p>
        </div>
      </header>

      <section className="mk-section">
        <div className="mk-wrap">
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

          <div className="mk-section-head" style={{ marginTop: "56px" }}>
            <span className="mk-eyebrow">Browse by category</span>
          </div>
          <div className="mk-grid">
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="mk-card">
                <div className="mk-card-body" style={{ padding: "22px" }}>
                  <h3>{c.name}</h3>
                  <p>{c.intro}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
