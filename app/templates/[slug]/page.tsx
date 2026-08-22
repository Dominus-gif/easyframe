import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { devices, deviceBySlug, gradientPresets } from "@/lib/editor/devices";
import { templateCopy, silhouetteClass, SITE_URL } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import AdSlot from "@/components/ads/AdSlot";
import TrackView from "@/components/site/TrackView";

export function generateStaticParams() {
  return devices.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const device = devices.find((d) => d.slug === params.slug);
  if (!device) return {};
  const title = `${device.seoTitle} — Free & No Sign-up | EasyFrame`;
  const description = `${device.seoTitle}. Frame your screenshot in a ${device.name} mockup and download a crisp PNG, JPEG, or WebP — free, in your browser, no account or watermark.`;
  const url = `${SITE_URL}/templates/${device.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
    twitter: { card: "summary_large_image", title, description }
  };
}

export default function TemplatePage({ params }: { params: { slug: string } }) {
  const device = devices.find((d) => d.slug === params.slug);
  if (!device) notFound();
  const copy = templateCopy[device.slug];
  const related = devices.filter((d) => d.slug !== device.slug);

  const ld = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${device.name} Mockup Generator`,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    url: `${SITE_URL}/templates/${device.slug}`,
    description: copy.intro.slice(0, 200),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };

  return (
    <main className="mk">
      <SiteNav />
      <TrackView event="template_viewed" params={{ device: device.slug }} />

      <section className="mk-wrap">
        <div className="mk-tpl-hero">
          <div>
            <span className="mk-kicker">{device.name} Mockup</span>
            <h1 className="mk-h1">{device.seoTitle}</h1>
            <p className="mk-sub" style={{ margin: "0 0 24px" }}>
              Frame your screenshot in a clean {device.name} mockup and download in seconds — free, no account, nothing uploaded.
            </p>
            <div className="mk-hero-actions" style={{ justifyContent: "flex-start", marginTop: 0 }}>
              <Link href={`/editor?device=${device.slug}`} className="mk-cta">
                Open in editor <ArrowRight size={18} />
              </Link>
              <Link href="/templates" className="mk-ghost">All templates</Link>
            </div>
          </div>
          <div className="mk-tpl-visual">
            <span className={`mk-dev ${silhouetteClass(device)}`}><i /></span>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div className="mk-prose">
            <p>{copy.intro}</p>
            <ul className="mk-bullets">
              {copy.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div style={{ marginBottom: 32 }}><AdSlot variant="incontent" /></div>
          <div className="mk-section-head" style={{ marginBottom: 24, textAlign: "left" }}>
            <span className="mk-eyebrow">Examples</span>
            <h2 className="mk-h2" style={{ margin: "8px 0 0", maxWidth: "none" }}>{device.name} mockup examples</h2>
          </div>
          <div className="mk-gallery">
            {gradientPresets.slice(0, 6).map((g) => (
              <div
                key={g.id}
                className="mk-sample"
                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                role="img"
                aria-label={`${device.name} mockup on a ${g.label.toLowerCase()} background`}
              >
                <span className={`mk-dev ${silhouetteClass(device)}`}><i /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div className="mk-band">
            <h2>Frame your {device.name} screenshot now</h2>
            <p>Free · no account · your image never leaves your browser.</p>
            <Link href={`/editor?device=${device.slug}`} className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
          </div>

          <div className="mk-section-head" style={{ margin: "56px 0 24px", textAlign: "left" }}>
            <span className="mk-eyebrow">More templates</span>
          </div>
          <div className="mk-grid">
            {related.map((d, i) => {
              const g = gradientPresets[(i + 2) % gradientPresets.length];
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

      <SiteFooter />
      <JsonLd data={ld} />
    </main>
  );
}
