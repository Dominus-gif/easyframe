import Link from "next/link";
import { devices } from "@/lib/editor/devices";
import { categories } from "@/lib/site";
import SponsorLine from "@/components/SponsorLine";

/** Shared marketing footer (server component). */
export default function SiteFooter() {
  return (
    <footer className="mk-footer">
      <div className="mk-wrap">
        <div className="mk-footer-top">
          <div className="mk-footer-col">
            <h4>Product</h4>
            <Link href="/editor">Free editor</Link>
            <Link href="/templates">All templates</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="mk-footer-col">
            <h4>Devices</h4>
            {devices.map((d) => (
              <Link key={d.slug} href={`/templates/${d.slug}`}>{d.name} mockup</Link>
            ))}
          </div>
          <div className="mk-footer-col">
            <h4>Categories</h4>
            {categories.map((c) => (
              <Link key={c.slug} href={`/${c.slug}`}>{c.name}</Link>
            ))}
          </div>
          <div className="mk-footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div className="mk-footer-bottom">
          <span>© {new Date().getFullYear()} EasyFrame — free device mockup generator.</span>
          <SponsorLine />
        </div>
      </div>
    </footer>
  );
}
