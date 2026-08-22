import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { posts, postBySlug, type Block } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import JsonLd from "@/components/site/JsonLd";
import AdSlot from "@/components/ads/AdSlot";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = postBySlug(params.slug);
  if (!post) return {};
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    title: `${post.title} | EasyFrame Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: { title: post.title, description: post.description, url, type: "article", publishedTime: post.date },
    twitter: { card: "summary_large_image", title: post.title, description: post.description }
  };
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return <h2 key={i}>{block.text}</h2>;
    case "p":
      return <p key={i}>{block.text}</p>;
    case "ul":
      return <ul key={i}>{block.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
    case "ol":
      return <ol key={i}>{block.items.map((it, j) => <li key={j}>{it}</li>)}</ol>;
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = postBySlug(params.slug);
  if (!post) notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "EasyFrame" },
    publisher: { "@type": "Organization", name: "EasyFrame" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`
  };

  return (
    <main className="mk">
      <SiteNav />

      <article className="mk-wrap mk-article">
        <div className="mk-article-head">
          <Link href="/blog" className="mk-eyebrow" style={{ textDecoration: "none" }}>← Blog</Link>
          <h1 className="mk-h1" style={{ textAlign: "left", maxWidth: "20ch", margin: "14px 0 12px", fontSize: "clamp(32px,5vw,52px)" }}>{post.title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.readMins} min read · {post.tag}
          </p>
        </div>

        <div className="mk-article-body">
          {post.body.map(renderBlock)}
        </div>

        <div style={{ margin: "36px 0" }}><AdSlot variant="incontent" /></div>

        <div className="mk-band">
          <h2>Try the free mockup generator</h2>
          <p>Frame a screenshot in seconds — no account, no watermark.</p>
          <Link href="/editor" className="mk-cta">Open the free editor <ArrowRight size={18} /></Link>
        </div>
      </article>

      <SiteFooter />
      <JsonLd data={ld} />
    </main>
  );
}
