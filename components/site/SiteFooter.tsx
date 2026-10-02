import Link from "next/link";
import { devices } from "@/lib/editor/devices";
import { categories } from "@/lib/site";
import SponsorLine from "@/components/SponsorLine";
import AdSlot from "@/components/ads/AdSlot";

/** Shared marketing footer (server component). */
export default function SiteFooter() {
  return (
    <footer className="mk-footer ft">
      <div className="mk-wrap">
        <AdSlot variant="footer" frame collapse />

        <div className="ft-main">
          {/* Brand block doubles as the sponsor's home, so the credit sits in a
              deliberate place instead of being squeezed into the copyright row. */}
          <div className="ft-brand">
            <Link href="/" className="ft-logo" aria-label="EasyFrame home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.png" alt="EasyFrame" width={900} height={92} />
            </Link>
            <p className="ft-tagline">
              Free device mockups, made in your browser. No account, no watermark, and your
              images never leave your device.
            </p>
            <div className="ft-sponsor">
              <span className="ft-sponsor-label">Sponsor</span>
              <SponsorLine />
            </div>
          </div>

          <div className="ft-cols">
            <nav className="ft-col" aria-label="Product">
              <h4>Product</h4>
              <Link href="/editor">Free editor</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
            </nav>

            <nav className="ft-col ft-col-wide" aria-label="Devices">
              <h4>Devices</h4>
              <div className="ft-devgrid">
                {devices.slice(0, 8).map((d) => (
                  <Link key={d.slug} href={`/editor?device=${d.slug}`}>{d.name}</Link>
                ))}
              </div>
            </nav>

            <nav className="ft-col" aria-label="Categories">
              <h4>Categories</h4>
              {categories.map((c) => (
                <Link key={c.slug} href={`/${c.slug}`}>{c.name}</Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="ft-bottom">
          <span>© {new Date().getFullYear()} EasyFrame — free device mockup generator.</span>
          <nav className="ft-legal" aria-label="Legal">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
