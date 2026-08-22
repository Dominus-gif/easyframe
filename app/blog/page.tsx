import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/blog";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Blog — Mockups, Design & Launch Tips | EasyFrame",
  description: "Guides on device mockups, App Store screenshots, design portfolios, and product launches — from the team behind the free EasyFrame mockup generator.",
  alternates: { canonical: "https://www.easyframe.app/blog" }
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main className="mk">
      <SiteNav />
      <header className="mk-hero" style={{ paddingBottom: 20 }}>
        <div className="mk-wrap">
          <span className="mk-kicker">Blog</span>
          <h1 className="mk-h1">Mockup &amp; <em>design</em> tips</h1>
          <p className="mk-sub">Practical guides on mockups, screenshots, portfolios, and launches.</p>
        </div>
      </header>

      <section className="mk-section" style={{ paddingTop: 8 }}>
        <div className="mk-wrap">
          <div className="mk-grid">
            {sorted.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="mk-card">
                <div className="mk-card-body" style={{ padding: 24 }}>
                  <span className="mk-eyebrow">{post.tag}</span>
                  <h3 style={{ margin: "10px 0 8px", fontSize: 19, lineHeight: 1.25 }}>{post.title}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.55 }}>{post.description}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 14 }}>
                    {formatDate(post.date)} · {post.readMins} min read
                  </p>
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
