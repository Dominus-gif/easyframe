import type { Metadata } from "next";
import Link from "next/link";
import { devices } from "@/lib/editor/devices";
import type { BackgroundSetting } from "@/lib/editor/compositor";
import { categories } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import MockShot from "@/components/site/MockShot";
import { SAMPLE_COUNT } from "@/lib/editor/sampleScreens";

// Soft pastel tiles (Boom theme) with a hint of variation per card.
const tiles: { css: string; bg: BackgroundSetting }[] = [
  { css: "linear-gradient(135deg, #C9DBFF, #E9E2FF)", bg: { type: "gradient", from: "#C9DBFF", to: "#E9E2FF", angle: 135 } },
  { css: "linear-gradient(135deg, #FFE3F1, #FFE7D6)", bg: { type: "gradient", from: "#FFE3F1", to: "#FFE7D6", angle: 135 } },
  { css: "linear-gradient(135deg, #DCD2FF, #CFE6FF)", bg: { type: "gradient", from: "#DCD2FF", to: "#CFE6FF", angle: 135 } },
  { css: "linear-gradient(135deg, #D6F1FF, #E7EFFF)", bg: { type: "gradient", from: "#D6F1FF", to: "#E7EFFF", angle: 135 } }
];

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
              const tile = tiles[i % tiles.length];
              return (
                <Link key={d.slug} href={`/templates/${d.slug}`} className="mk-card">
                  <div className="mk-card-visual" style={{ background: tile.css }}>
                    <MockShot device={d.slug} sample={i % SAMPLE_COUNT} background={tile.bg} padding={0.12} maxEdge={520} className="mk-card-canvas" caption={`${d.name} mockup preview`} />
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
          <div className="mk-grid mk-grid-auto">
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
