import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Shared marketing nav (server component). */
export default function SiteNav() {
  return (
    <nav className="mk-nav" aria-label="Primary">
      <div className="mk-wrap mk-nav-inner">
        <Link href="/" className="mk-brand">
          EasyFrame<b>.</b>
        </Link>
        <div className="mk-nav-links">
          <Link href="/editor">Editor</Link>
          <Link href="/templates">Templates</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/editor" className="mk-cta">
            Open free editor <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
