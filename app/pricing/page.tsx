import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Crown, Sparkles } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import PremiumButtons from "@/components/PremiumButtons";

export const metadata: Metadata = {
  title: "Pricing — Free Forever & Premium | EasyFrame",
  description:
    "EasyFrame is free forever — unlimited mockups, no account. Premium adds 4K & transparent exports, custom backgrounds, and batch export.",
  alternates: { canonical: "https://www.easyframe.app/pricing" }
};

const MONTHLY = process.env.NEXT_PUBLIC_PREMIUM_MONTHLY ?? "6";
const LIFETIME = process.env.NEXT_PUBLIC_PREMIUM_LIFETIME ?? "99";

const freeFeatures = [
  "Unlimited mockups — no account",
  "All device templates",
  "Export up to 2048px",
  "PNG, JPEG & WebP",
  "Solid & gradient backgrounds",
  "Ad-supported"
];

const premiumFeatures = [
  "Everything in Free, ad-free",
  "4K export (up to 3840px)",
  "Transparent-background PNGs",
  "Custom background image uploads",
  "Batch export",
  "Saved projects"
];

export default function PricingPage({ searchParams }: { searchParams?: { reason?: string } }) {
  const reason = searchParams?.reason;
  return (
    <main className="mk">
      <SiteNav />

      <header className="mk-hero" style={{ paddingBottom: 24 }}>
        <div className="mk-wrap">
          <span className="mk-kicker"><Sparkles size={15} /> Free forever · Premium when you need more</span>
          <h1 className="mk-h1">Simple, honest <em>pricing</em></h1>
          <p className="mk-sub">The mockup tool is free and unlimited. Premium removes ads and unlocks pro export options — support the tool and get more done.</p>
          {reason === "trial-ended" || reason === "plan-required" ? (
            <p className="mk-sub" style={{ marginTop: 14, color: "var(--accent)" }}>Sign in to manage or upgrade your plan.</p>
          ) : null}
        </div>
      </header>

      <section className="mk-section" style={{ paddingTop: 8 }}>
        <div className="mk-wrap" style={{ maxWidth: 900 }}>
          <div className="mk-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Free */}
            <div className="mk-card" style={{ padding: 30 }}>
              <h3 style={{ fontSize: 20, margin: 0 }}>Free</h3>
              <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", margin: "10px 0 2px" }}>$0</div>
              <p style={{ color: "var(--text-muted)", margin: "0 0 20px", fontSize: 14 }}>No account required</p>
              <ul className="mk-bullets">
                {freeFeatures.map((f) => (<li key={f}>{f}</li>))}
              </ul>
              <Link href="/editor" className="mk-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 24 }}>
                Open the free editor <ArrowRight size={16} />
              </Link>
            </div>

            {/* Premium */}
            <div className="mk-card" style={{ padding: 30, borderColor: "rgba(47,107,255,.5)", background: "linear-gradient(180deg, rgba(47,107,255,.1), rgba(34,184,230,.04))" }}>
              <h3 style={{ fontSize: 20, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Crown size={18} /> Premium
              </h3>
              <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em", margin: "10px 0 2px" }}>
                ${MONTHLY}<span style={{ fontSize: 18, fontWeight: 500, color: "var(--text-muted)" }}> /month</span>
              </div>
              <p style={{ color: "var(--text-muted)", margin: "0 0 20px", fontSize: 14 }}>or ${LIFETIME} once — lifetime access</p>
              <ul className="mk-bullets">
                {premiumFeatures.map((f) => (<li key={f}>{f}</li>))}
              </ul>
              <PremiumButtons monthly={MONTHLY} lifetime={LIFETIME} />
            </div>
          </div>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 22 }}>
            You&apos;ll be asked to sign in at checkout. Premium one-time purchases are refundable within 14 days.
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
