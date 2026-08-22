import Link from "next/link";
import { gradientPresets } from "@/lib/editor/devices";
import { categories, devicesInCategory, silhouetteClass } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export default function CategoryView({ slug }: { slug: string }) {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  const list = devicesInCategory(slug);
  const others = categories.filter((c) => c.slug !== slug);

  return (
    <main className="mk">
      <SiteNav />
      <header className="mk-hero">
        <div className="mk-wrap">
          <span className="mk-kicker">{category.name}</span>
          <h1 className="mk-h1">{category.h1}</h1>
          <p className="mk-sub">{category.intro}</p>
        </div>
      </header>

      <section className="mk-section" style={{ paddingTop: 0 }}>
        <div className="mk-wrap">
          <div className="mk-grid">
            {list.map((d, i) => {
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

          <div className="mk-section-head" style={{ margin: "56px 0 24px", textAlign: "left" }}>
            <span className="mk-eyebrow">Other categories</span>
          </div>
          <div className="mk-grid">
            {others.map((c) => (
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
