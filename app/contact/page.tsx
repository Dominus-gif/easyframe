import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LifeBuoy, Mail, ShieldCheck } from "lucide-react";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";

const EMAIL = "contact@easyframe.app";

export const metadata: Metadata = {
  title: "Contact — EasyFrame",
  description: "Get in touch with the EasyFrame team. Questions about Premium, refunds, billing or bugs — email contact@easyframe.app.",
  alternates: { canonical: "https://www.easyframe.app/contact" }
};

const topics = [
  { title: "Premium & billing", body: "Questions about a payment, upgrading, or switching between Monthly and Lifetime.", Icon: LifeBuoy },
  { title: "Refunds", body: "One-time Lifetime purchases are refundable within 14 days — just ask and we'll take care of it.", Icon: ShieldCheck },
  { title: "Bugs & feedback", body: "Something broken or an export not looking right? Tell us what you were doing and we'll dig in.", Icon: Mail }
];

export default function ContactPage() {
  return (
    <main className="mk">
      <SiteNav />

      <header className="mk-hero" style={{ paddingBottom: 16 }}>
        <div className="mk-wrap">
          <span className="mk-kicker"><Mail size={15} /> Contact</span>
          <h1 className="mk-h1">Talk to <em>a human</em></h1>
          <p className="mk-sub">
            EasyFrame is run by a small team. Email us and a person reads it — we usually reply within one business day.
          </p>
          <p className="contact-email-wrap">
            <a className="contact-email" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
        </div>
      </header>

      <section className="mk-section" style={{ paddingTop: 8 }}>
        <div className="mk-wrap" style={{ maxWidth: 940 }}>
          <div className="mk-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {topics.map((t) => (
              <div className="mk-card" style={{ padding: 26 }} key={t.title}>
                <span className="mk-feat-icon" aria-hidden="true"><t.Icon size={18} /></span>
                <h3 style={{ fontSize: 18, margin: "14px 0 6px" }}>{t.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}>{t.body}</p>
              </div>
            ))}
          </div>

          <p className="contact-note">
            Your images never leave your browser, so we can&apos;t see what you&apos;re working on — if an export looks wrong,
            attaching the screenshot and telling us which device you picked helps us reproduce it fastest.
          </p>

          <div className="mk-center" style={{ textAlign: "center", marginTop: 28 }}>
            <Link href="/editor" className="mk-cta">Back to the editor <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
