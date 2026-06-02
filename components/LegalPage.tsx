"use client";

import Link from "next/link";
import { EasyFrameMark } from "@/components/EasyFrameLogo";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export default function LegalPage({ eyebrow, title, updated, intro, sections }: LegalPageProps) {
  return (
    <main className="legal-shell">
      <nav className="legal-nav">
        <Link className="legal-brand" href="/">
          <span><EasyFrameMark size={34} /></span>
          <strong>EasyFrame</strong>
        </Link>
        <div className="legal-links">
          <Link href="/Privacy">Privacy</Link>
          <Link href="/Terms">Terms</Link>
          <Link className="legal-cta" href="/login">Open app</Link>
        </div>
      </nav>

      <section className="legal-hero">
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{intro}</p>
        <small>Last updated: {updated}</small>
      </section>

      <article className="legal-card">
        {sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>

      <footer className="legal-footer">
        <span>EasyFrame.app</span>
        <div>
          <Link href="/Privacy">Privacy Policy</Link>
          <Link href="/Terms">Terms of Service</Link>
        </div>
      </footer>

      <style jsx global>{`
        .legal-shell {
          min-height: 100vh;
          padding: 24px;
          color: var(--text-primary);
          background:
            radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.2), transparent 30%),
            radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.08), transparent 28%),
            linear-gradient(145deg, #07080a 0%, #0b0c10 52%, #08090b 100%);
          font-family: var(--font-sans);
        }

        .legal-nav,
        .legal-brand,
        .legal-links,
        .legal-footer,
        .legal-footer div {
          display: flex;
          align-items: center;
        }

        .legal-nav {
          width: min(100%, 1120px);
          margin: 0 auto;
          justify-content: space-between;
          gap: 18px;
        }

        .legal-brand {
          gap: 12px;
          color: var(--text-primary);
          text-decoration: none;
        }

        .legal-brand span {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          overflow: visible;
        }

        .legal-brand span img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .legal-brand strong {
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.04em;
        }

        .legal-links,
        .legal-footer div {
          gap: 10px;
        }

        .legal-links a,
        .legal-footer a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .legal-links a {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          padding: 0 15px;
          border-radius: 14px;
          border: 1px solid var(--stroke);
          background: rgba(255, 255, 255, 0.045);
        }

        .legal-links .legal-cta {
          color: white;
          background: var(--accent-gradient);
          border-color: transparent;
        }

        .legal-hero {
          width: min(100%, 900px);
          margin: 82px auto 28px;
          text-align: center;
        }

        .legal-hero span {
          display: inline-flex;
          min-height: 36px;
          align-items: center;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid var(--stroke);
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.045);
          font-size: 13px;
          font-weight: 800;
        }

        .legal-hero h1 {
          margin: 22px 0 14px;
          color: var(--text-primary);
          font-size: clamp(44px, 7vw, 82px);
          line-height: 0.96;
          letter-spacing: -0.07em;
        }

        .legal-hero p {
          width: min(100%, 720px);
          margin: 0 auto;
          color: var(--text-muted);
          font-size: 18px;
          line-height: 1.6;
        }

        .legal-hero small {
          display: inline-flex;
          margin-top: 18px;
          color: var(--text-soft);
          font-size: 13px;
          font-weight: 750;
        }

        .legal-card {
          width: min(100%, 920px);
          margin: 0 auto;
          padding: clamp(24px, 4vw, 46px);
          border: 1px solid var(--stroke);
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018)),
            var(--panel);
          box-shadow: var(--shadow-panel);
        }

        .legal-card section + section {
          margin-top: 34px;
          padding-top: 30px;
          border-top: 1px solid var(--stroke);
        }

        .legal-card h2 {
          margin: 0 0 12px;
          color: var(--text-primary);
          font-size: 22px;
          letter-spacing: -0.03em;
        }

        .legal-card p {
          margin: 0;
          color: var(--text-muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .legal-card p + p {
          margin-top: 12px;
        }

        .legal-footer {
          width: min(100%, 920px);
          margin: 26px auto 0;
          justify-content: space-between;
          gap: 16px;
          color: var(--text-soft);
          font-size: 13px;
          font-weight: 750;
        }

        @media (max-width: 720px) {
          .legal-shell {
            padding: 18px;
          }

          .legal-nav,
          .legal-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .legal-links {
            width: 100%;
            flex-wrap: wrap;
          }

          .legal-links a {
            flex: 1;
            justify-content: center;
          }

          .legal-hero {
            margin-top: 56px;
            text-align: left;
          }

          .legal-hero p {
            margin-left: 0;
          }
        }
      `}</style>
    </main>
  );
}
