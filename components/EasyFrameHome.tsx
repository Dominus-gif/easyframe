"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Crown,
  FolderOpen,
  ImagePlus,
  Layers3,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { EasyFrameMark } from "@/components/EasyFrameLogo";

const plans = [
  {
    eyebrow: "Try it out",
    name: "1-Day Free Trial",
    price: "$0",
    accent: "green",
    description: "Full feature access for one day.",
    features: ["5 exports maximum", "All features included", "No credit card required"]
  },
  {
    eyebrow: "Most popular",
    name: "1-Month Plan",
    price: "$4",
    suffix: "/month",
    accent: "coral",
    description: "Simple monthly access.",
    features: ["Unlimited exports", "All features included", "Cancel anytime"]
  },
  {
    eyebrow: "Best value",
    name: "Lifetime Plan",
    price: "$80",
    accent: "blue",
    description: "One payment for all features and future updates.",
    features: ["Unlimited exports", "All features included", "Future updates included"]
  }
];

export default function EasyFrameHome() {
  const [homeReady, setHomeReady] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => setHomeReady(true), 120);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!homeReady) {
    return <HomeLoadingScreen />;
  }

  return (
    <main className="home-shell">
      <nav className="home-nav" aria-label="Main navigation">
        <Link className="home-brand" href="/">
          <span><EasyFrameMark size={26} /></span>
          <strong>EasyFrame</strong>
        </Link>

        <div className="nav-actions">
          <Link className="login-link" href="/login">Login</Link>
          <Link className="trial-button" href="/login">
            Start free trial
            <ArrowRight size={17} />
          </Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={16} />
            The easiest way to create stunning mockups
          </span>
          <h1>
            Turn Images into <span>polished</span> visuals
          </h1>
          <p>
            Upload, style, and export clean mockups for social, websites, and product launches in a focused design workspace.
          </p>

          <div className="hero-actions">
            <Link className="trial-button large" href="/login">
              Start free trial
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" href="/login">Login</Link>
          </div>

          <div className="trust-row" aria-label="Trial highlights">
            <span><CreditCard size={18} /> No credit card required</span>
            <span><Layers3 size={18} /> 1 day free trial, 5 exports</span>
            <span><ShieldCheck size={18} /> All features included</span>
          </div>
        </div>

        <ProductPreview />
      </section>

      <section className="showcase-section" id="showcase">
        <div className="showcase-heading">
          <span>Showcase</span>
          <h2>Five polished formats, ready from the start.</h2>
        </div>
        <div className="showcase-grid">
          {["Launch Post", "App Screenshot", "Profile Frame", "Wide Banner", "Story Visual"].map((item, index) => (
            <article key={item} className={`showcase-card showcase-${index + 1}`}>
              <div><i /></div>
              <strong>{item}</strong>
              <small>{["Square", "Browser", "Avatar", "Landscape", "Vertical"][index]}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <span className="pricing-kicker"><Sparkles size={16} /> Choose your access</span>
        <h2>Unlock the EasyFrame studio.</h2>
        <p className="pricing-copy">Start with a one-day trial, choose monthly access, or get lifetime access with all future updates.</p>
        <div className="plan-grid">
          {plans.map((plan) => (
            <article key={plan.name} className={`plan-card ${plan.accent}`}>
              <span>{plan.eyebrow}</span>
              <h3>{plan.name}</h3>
              <strong>
                {plan.price}
                {plan.suffix ? <small>{plan.suffix}</small> : null}
              </strong>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                {plan.name === "Lifetime Plan" ? <Crown size={17} /> : null}
                {plan.name === "1-Day Free Trial" ? "Start free trial" : plan.name === "1-Month Plan" ? "Choose monthly" : "Choose lifetime"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <div>
          <strong>EasyFrame</strong>
          <span>Create polished visuals for every image.</span>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/Terms">Terms</Link>
          <Link href="/Privacy">Privacy Policy</Link>
          <a className="support-link" href="mailto:contact@easyframe.app">Contact support</a>
          <a className="fazier-badge" href="https://fazier.com/launches/www.easyframe.app" target="_blank" rel="noopener noreferrer" aria-label="View EasyFrame on Fazier">
            <img src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark" width={120} height={31} alt="Fazier badge" />
          </a>
          <a className="scrolllaunch-badge" href="https://www.scrolllaunch.com/products/easyframe?utm_source=badge&utm_medium=embed&utm_campaign=easyframe&ref=scrolllaunch" target="_blank" rel="noopener noreferrer" aria-label="View EasyFrame on ScrollLaunch">
            <img src="https://www.scrolllaunch.com/api/badge/easyframe" alt="Featured on ScrollLaunch" width={220} height={48} loading="lazy" />
          </a>
        </nav>
      </footer>

      <HomeStyles />
    </main>
  );
}

function ProductPreview() {
  const [useFallback, setUseFallback] = useState(false);

  return (
    <div className="product-preview" aria-label="EasyFrame editor preview">
      {!useFallback ? (
        <img className="custom-home-preview" src="/home-preview/studio-preview.png" alt="EasyFrame studio preview" onError={() => setUseFallback(true)} />
      ) : null}
      <div className="studio-preview-top">
        <div className="studio-preview-brand">
          <span><EasyFrameMark size={16} /></span>
          <strong>EasyFrame</strong>
        </div>
        <div className="studio-preview-actions">
          <i />
          <i />
        </div>
      </div>

      <div className="studio-preview-grid">
        <aside className="studio-preview-left">
          <div className="studio-preview-card open">
            <div className="studio-preview-card-head">
              <span>
                <strong>Templates</strong>
                <small>Editing controls visible</small>
              </span>
              <b>-</b>
            </div>
            {["EasyFrame", "X", "Instagram", "LinkedIn"].map((item, index) => (
              <div className="studio-preview-folder" key={item}>
                <span><FolderOpen size={13} /> {item}</span>
                <small>{[4, 5, 5, 4][index]} sizes</small>
              </div>
            ))}
          </div>

          <div className="studio-preview-card open compact">
            <div className="studio-preview-card-head">
              <span>
                <strong>Backgrounds</strong>
                <small>Editing controls visible</small>
              </span>
              <b>-</b>
            </div>
            <div className="studio-preview-source">
              <button>Transparent</button>
              <button>Solid</button>
              <button>Upload</button>
              <button>URL</button>
            </div>
            <div className="studio-preview-colors">
              {["#ffffff", "#111712", "#ec2b91", "#6d5dfc", "#16bfe8", "#ff744f"].map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </div>
          </div>
        </aside>

        <section className="studio-preview-canvas">
          <div className="studio-preview-canvas-bar">
            <button>Full preview</button>
            <span>Blank Tile</span>
            <span>100%</span>
          </div>
          <div className="studio-preview-stage">
            <div className="studio-preview-drop">
              <ImageIcon />
              <strong>Drop or select</strong>
              <small>Add a photo to preview</small>
            </div>
          </div>
          <div className="studio-preview-bottom">
            <button>Select media</button>
            <span>Fit</span>
            <span>Fill Canvas</span>
            <small>100% x 100%</small>
          </div>
        </section>

        <aside className="studio-preview-right">
          <button className="studio-preview-export">
            <span>
              <strong>Export</strong>
              <small>PNG export ready</small>
            </span>
            <ArrowRight size={16} />
          </button>
          <div className="studio-preview-panel">
            <strong>Export options</strong>
            <div className="studio-preview-format">
              <b>PNG</b>
              <span>JPG</span>
              <span>WEBP</span>
            </div>
            <div className="studio-preview-sizes">
              <span>1080p</span>
              <span>1440p</span>
              <span>4K</span>
            </div>
            <div className="studio-preview-slider"><i /></div>
          </div>
          <div className="studio-preview-panel">
            <strong>Select media</strong>
            <div className="studio-preview-media">
              <ImageIcon />
              <span>No image selected</span>
            </div>
          </div>
          <div className="studio-preview-panel sliders">
            <strong>Canvas</strong>
            <div className="studio-preview-slider"><i /></div>
            <div className="studio-preview-slider"><i /></div>
            <div className="studio-preview-slider"><i /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function HomeLoadingScreen() {
  return (
    <main className="home-loading-shell">
      <section className="home-loading-card">
        <span><EasyFrameMark size={32} /></span>
        <small>EasyFrame</small>
        <h1>Loading experience</h1>
        <p>Preparing a polished workspace preview.</p>
        <div><i /></div>
      </section>
      <style jsx global>{`
        .home-loading-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          color: #f5f7fb;
          background:
            radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.2), transparent 30%),
            radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.09), transparent 28%),
            linear-gradient(145deg, #07080a 0%, #0b0c10 48%, #08090b 100%);
          font-family: var(--font-sans);
        }

        .home-loading-card {
          width: min(100%, 480px);
          padding: 32px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.1);
          background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
          box-shadow: 0 32px 100px rgba(0,0,0,.32);
          text-align: center;
        }

        .home-loading-card > span {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border-radius: 0;
          color: white;
          background: transparent;
        }

        .home-loading-card > span img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .home-loading-card small {
          color: #68d5ec;
          font-size: 13px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .home-loading-card h1 {
          margin: 12px 0 10px;
          font-size: clamp(38px, 6vw, 56px);
          line-height: 0.98;
          letter-spacing: -0.06em;
        }

        .home-loading-card p {
          margin: 0 0 24px;
          color: rgba(245,247,251,.68);
        }

        .home-loading-card div {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
        }

        .home-loading-card i {
          display: block;
          width: 42%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7779f6, #56d0d2);
          animation: home-loading-slide 1.05s ease-in-out infinite;
        }

        @keyframes home-loading-slide {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </main>
  );
}

function ImageIcon() {
  return (
    <span className="studio-preview-image-icon">
      <ImagePlus size={20} />
    </span>
  );
}

function HomeStyles() {
  return (
    <style jsx global>{`
      :root {
        color-scheme: dark;
      }

      body {
        background: #090a0b;
      }

      .home-shell {
        min-height: 100vh;
        overflow: hidden;
        color: #f8f6ef;
        background:
          radial-gradient(circle at 8% 12%, rgba(255, 100, 84, 0.22), transparent 28%),
          radial-gradient(circle at 86% 10%, rgba(99, 102, 241, 0.26), transparent 30%),
          linear-gradient(145deg, #08090a 0%, #101211 48%, #171612 100%);
        font-family: var(--font-sans);
      }

      .home-shell a,
      .home-shell button {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .home-nav {
        width: min(100% - 56px, 1780px);
        height: 88px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 24px;
      }

      .home-brand,
      .nav-links,
      .nav-actions,
      .hero-actions,
      .trust-row,
      .benefit-row {
        display: flex;
        align-items: center;
      }

      .home-brand {
        width: max-content;
        gap: 13px;
        color: #fffaf2;
        text-decoration: none;
      }

      .home-brand span {
        width: 38px;
        height: 44px;
        display: grid;
        place-items: center;
        color: #fff;
        background: transparent;
        box-shadow: none;
      }

      .home-brand strong {
        font-size: 28px;
        letter-spacing: -0.04em;
      }

      .nav-links {
        gap: 46px;
      }

      .nav-links a,
      .login-link {
        color: rgba(248, 246, 239, 0.76);
        font-size: 15px;
        font-weight: 750;
        text-decoration: none;
      }

      .nav-links a:hover,
      .login-link:hover {
        color: #fff;
      }

      .nav-actions {
        justify-self: end;
        justify-content: flex-end;
        gap: 18px;
      }

      .trial-button,
      .secondary-button {
        min-height: 54px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 0 24px;
        border-radius: 16px;
        font-size: 15px;
        font-weight: 850;
        text-decoration: none;
      }

      .trial-button {
        color: white;
        background: linear-gradient(135deg, #ff6858 0%, #f12b8f 55%, #6d5dfc 100%);
        box-shadow: 0 18px 46px rgba(241, 43, 143, 0.32);
      }

      .trial-button.large {
        min-width: 240px;
        min-height: 64px;
        border-radius: 18px;
      }

      .secondary-button {
        min-width: 168px;
        color: #f8f6ef;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.06);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }

      .hero-section {
        width: min(100% - 56px, 1780px);
        min-height: 596px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(360px, 0.72fr) minmax(620px, 1.28fr);
        align-items: center;
        gap: 36px;
        padding: 20px 0 22px;
      }

      .hero-copy {
        padding-top: 6px;
      }

      .hero-kicker,
      .pricing-kicker {
        width: max-content;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.1);
        color: rgba(248,246,239,.86);
        background: rgba(255,255,255,.07);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.07);
      }

      .hero-kicker {
        min-height: 46px;
        padding: 0 18px;
        font-size: 15px;
        font-weight: 750;
      }

      .hero-copy h1 {
        max-width: 690px;
        margin: 28px 0 22px;
        color: #fffdf7;
        font-size: clamp(48px, 4.35vw, 82px);
        line-height: 0.98;
        letter-spacing: -0.07em;
      }

      .hero-copy h1 span {
        color: transparent;
        background: linear-gradient(100deg, #ff6b5f, #f12b8f 45%, #8b5cf6 82%);
        -webkit-background-clip: text;
        background-clip: text;
      }

      .hero-copy p {
        max-width: 560px;
        margin: 0;
        color: rgba(248, 246, 239, 0.68);
        font-size: 20px;
        line-height: 1.48;
      }

      .hero-actions {
        gap: 20px;
        margin-top: 28px;
      }

      .trust-row {
        max-width: 720px;
        gap: 22px;
        margin-top: 30px;
        flex-wrap: wrap;
      }

      .trust-row span,
      .benefit-row span {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        color: rgba(248, 246, 239, 0.7);
        font-size: 14px;
        font-weight: 650;
      }

      .trust-row svg,
      .benefit-row svg {
        color: #74f0b3;
      }

      .product-preview {
        min-height: 560px;
        position: relative;
        border-radius: 28px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.13);
        background:
          linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,.025)),
          #121412;
        box-shadow:
          0 40px 120px rgba(0, 0, 0, 0.48),
          0 0 0 1px rgba(255,255,255,.04);
      }

      .studio-preview-top {
        height: 54px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        border-bottom: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.035);
      }

      .studio-preview-brand,
      .studio-preview-actions,
      .studio-preview-card-head,
      .studio-preview-folder,
      .studio-preview-export,
      .studio-preview-canvas-bar,
      .studio-preview-bottom {
        display: flex;
        align-items: center;
      }

      .studio-preview-brand {
        gap: 10px;
      }

      .studio-preview-brand span {
        width: 20px;
        height: 24px;
        display: grid;
        place-items: center;
        color: #fff;
        background: transparent;
      }

      .studio-preview-brand strong {
        font-size: 15px;
      }

      .studio-preview-actions {
        gap: 10px;
      }

      .studio-preview-actions i {
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: rgba(255,255,255,.72);
      }

      .studio-preview-grid {
        height: 506px;
        display: grid;
        grid-template-columns: 230px minmax(0, 1fr) 236px;
        background:
          radial-gradient(circle at 50% 90%, rgba(99, 102, 241, 0.12), transparent 34%),
          linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.012));
      }

      .studio-preview-left,
      .studio-preview-right {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 18px;
        overflow: hidden;
      }

      .studio-preview-left {
        border-right: 1px solid rgba(255,255,255,.08);
      }

      .studio-preview-right {
        border-left: 1px solid rgba(255,255,255,.08);
      }

      .studio-preview-card,
      .studio-preview-panel {
        border: 1px solid rgba(255,255,255,.1);
        border-radius: 20px;
        background: rgba(255,255,255,.045);
        box-shadow: 0 18px 44px rgba(0,0,0,.14);
      }

      .studio-preview-card {
        padding: 14px;
      }

      .studio-preview-card.compact {
        padding-bottom: 16px;
      }

      .studio-preview-card-head {
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 12px;
      }

      .studio-preview-card-head span {
        display: grid;
        gap: 3px;
      }

      .studio-preview-card-head strong,
      .studio-preview-panel > strong {
        color: rgba(248,246,239,.62);
        font-size: 10px;
        font-weight: 860;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .studio-preview-card-head small {
        color: rgba(248,246,239,.58);
        font-size: 11px;
        font-weight: 600;
      }

      .studio-preview-card-head b {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: rgba(248,246,239,.86);
        background: rgba(255,255,255,.07);
        border: 1px solid rgba(255,255,255,.12);
      }

      .studio-preview-switch {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }

      .studio-preview-switch em,
      .studio-preview-switch span,
      .studio-preview-source button,
      .studio-preview-sizes span,
      .studio-preview-format b,
      .studio-preview-format span {
        min-height: 34px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 760;
        font-style: normal;
      }

      .studio-preview-switch em,
      .studio-preview-format b {
        color: #fff;
        background: linear-gradient(135deg, #7779f6, #56d0d2);
      }

      .studio-preview-switch span,
      .studio-preview-source button,
      .studio-preview-sizes span,
      .studio-preview-format span {
        color: rgba(248,246,239,.72);
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(255,255,255,.055);
      }

      .studio-preview-folder {
        justify-content: space-between;
        min-height: 38px;
        padding: 0 11px;
        margin-top: 8px;
        border-radius: 12px;
        color: rgba(248,246,239,.82);
        background: rgba(255,255,255,.055);
        border: 1px solid rgba(255,255,255,.08);
        font-size: 11px;
        font-weight: 760;
      }

      .studio-preview-folder span {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }

      .studio-preview-folder small {
        color: rgba(248,246,239,.48);
        font-size: 10px;
      }

      .studio-preview-source {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,.08);
        background: rgba(255,255,255,.035);
      }

      .studio-preview-source button {
        border: 0;
      }

      .studio-preview-colors {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-top: 12px;
      }

      .studio-preview-colors i {
        height: 36px;
        border-radius: 11px;
        border: 1px solid rgba(255,255,255,.13);
      }

      .studio-preview-canvas {
        min-width: 0;
        position: relative;
        display: grid;
        place-items: center;
        padding: 82px 34px 74px;
      }

      .studio-preview-canvas-bar {
        position: absolute;
        top: 18px;
        left: 24px;
        right: 24px;
        justify-content: space-between;
        gap: 10px;
      }

      .studio-preview-canvas-bar button,
      .studio-preview-canvas-bar span,
      .studio-preview-bottom,
      .studio-preview-bottom button,
      .studio-preview-bottom span {
        min-height: 34px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 999px;
        color: rgba(248,246,239,.8);
        background: rgba(255,255,255,.06);
        font-size: 11px;
        font-weight: 760;
      }

      .studio-preview-canvas-bar button,
      .studio-preview-canvas-bar span {
        padding: 0 13px;
      }

      .studio-preview-stage {
        width: min(100%, 620px);
        aspect-ratio: 16 / 10;
        display: grid;
        place-items: center;
        border-radius: 30px;
        background: linear-gradient(135deg, #ff6858 0%, #f12b8f 52%, #6d5dfc 100%);
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.18),
          0 34px 80px rgba(0,0,0,.34);
      }

      .studio-preview-drop {
        width: 72%;
        aspect-ratio: 16 / 9;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 8px;
        border-radius: 24px;
        background: #0d130f;
        box-shadow: 0 28px 58px rgba(0,0,0,.3);
      }

      .studio-preview-image-icon {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        color: rgba(248,246,239,.76);
        background: rgba(255,255,255,.1);
      }

      .studio-preview-drop strong {
        color: rgba(248,246,239,.74);
        font-size: 18px;
      }

      .studio-preview-drop small {
        color: rgba(248,246,239,.46);
        font-size: 12px;
      }

      .studio-preview-bottom {
        position: absolute;
        bottom: 22px;
        left: 50%;
        transform: translateX(-50%);
        gap: 7px;
        padding: 7px;
      }

      .studio-preview-bottom button,
      .studio-preview-bottom span {
        border-radius: 12px;
        padding: 0 11px;
      }

      .studio-preview-bottom button {
        color: #fff;
        border: 0;
        background: linear-gradient(135deg, #7779f6, #56d0d2);
      }

      .studio-preview-bottom small {
        color: rgba(248,246,239,.62);
        font-size: 10px;
        padding: 0 5px;
      }

      .studio-preview-export {
        min-height: 64px;
        justify-content: space-between;
        gap: 12px;
        padding: 0 16px;
        border: 0;
        border-radius: 20px;
        color: #fff;
        background: linear-gradient(135deg, #7779f6, #56d0d2);
      }

      .studio-preview-export span {
        display: grid;
        text-align: left;
      }

      .studio-preview-export strong {
        font-size: 13px;
      }

      .studio-preview-export small {
        color: rgba(255,255,255,.72);
        font-size: 11px;
      }

      .studio-preview-panel {
        display: grid;
        gap: 10px;
        padding: 14px;
      }

      .studio-preview-format,
      .studio-preview-sizes {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 7px;
      }

      .studio-preview-sizes {
        grid-template-columns: repeat(2, 1fr);
      }

      .studio-preview-media {
        min-height: 86px;
        display: grid;
        place-items: center;
        gap: 8px;
        border-radius: 16px;
        color: rgba(248,246,239,.55);
        background: rgba(255,255,255,.04);
      }

      .studio-preview-media span {
        font-size: 11px;
        font-weight: 700;
      }

      .studio-preview-slider {
        height: 6px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,.14);
      }

      .studio-preview-slider i {
        width: 72%;
        height: 100%;
        display: block;
        border-radius: inherit;
        background: linear-gradient(90deg, #8b8cf6, #56d0d2);
      }

      .preview-top {
        height: 54px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        border-bottom: 1px solid rgba(255,255,255,.09);
      }

      .preview-brand,
      .preview-window-actions,
      .preview-toolbar,
      .format-pills,
      .toggle-row {
        display: flex;
        align-items: center;
      }

      .preview-brand {
        gap: 10px;
      }

      .preview-brand span {
        width: 22px;
        height: 22px;
        display: grid;
        place-items: center;
        border-radius: 7px;
        color: #fff;
        background: linear-gradient(135deg, #ff6554, #f12b8f 54%, #6d5dfc);
        font-size: 10px;
        font-weight: 900;
      }

      .preview-brand strong {
        font-size: 15px;
      }

      .preview-window-actions {
        gap: 12px;
      }

      .preview-window-actions i {
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: rgba(255,255,255,.78);
      }

      .preview-grid {
        height: 506px;
        display: grid;
        grid-template-columns: 228px minmax(0, 1fr) 230px;
      }

      .preview-left,
      .preview-right {
        padding: 18px;
        background: rgba(255,255,255,.035);
      }

      .preview-left {
        border-right: 1px solid rgba(255,255,255,.08);
      }

      .preview-right {
        border-left: 1px solid rgba(255,255,255,.08);
      }

      .preview-left small,
      .preview-right small {
        display: block;
        margin: 15px 0 8px;
        color: rgba(248,246,239,.48);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .preview-tabs,
      .format-pills {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 34px 34px;
        gap: 4px;
        padding: 4px;
        border-radius: 28px;
        background: rgba(255,255,255,.08);
      }

      .format-pills span:last-child {
        grid-column: 1 / -1;
      }

      .preview-tabs b,
      .preview-tabs span,
      .format-pills b,
      .format-pills span {
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 850;
      }

      .preview-tabs b,
      .format-pills b {
        color: #121412;
        background: #f8f6ef;
      }

      .preview-tabs span,
      .format-pills span {
        color: rgba(248,246,239,.56);
      }

      .preview-menu-row {
        height: 42px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 12px;
        border-radius: 14px;
        color: rgba(248,246,239,.66);
        font-size: 12px;
        font-weight: 750;
      }

      .preview-menu-row.active {
        color: #f8f6ef;
        background: rgba(255,255,255,.11);
      }

      .preview-menu-row span {
        width: 14px;
        height: 14px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,.32);
      }

      .preview-divider {
        height: 1px;
        margin: 12px 0 4px;
        background: rgba(255,255,255,.1);
      }

      .preview-swatches,
      .preview-edge-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }

      .preview-swatches i,
      .preview-swatches button {
        aspect-ratio: 1;
        border: 1px solid rgba(255,255,255,.14);
        border-radius: 10px;
      }

      .preview-swatches button {
        color: #f8f6ef;
        background: rgba(255,255,255,.08);
        font-weight: 800;
      }

      .preview-edge-grid i {
        height: 30px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,.22);
        background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(255,255,255,.18));
      }

      .preview-canvas {
        position: relative;
        display: grid;
        place-items: center;
        padding: 72px 28px 28px;
      }

      .preview-toolbar {
        position: absolute;
        top: 20px;
        left: 24px;
        right: 24px;
        gap: 8px;
        justify-content: space-between;
      }

      .preview-toolbar button,
      .preview-toolbar span {
        height: 36px;
        min-width: 36px;
        display: grid;
        place-items: center;
        border: 0;
        border-radius: 999px;
        color: rgba(248,246,239,.8);
        background: rgba(255,255,255,.08);
        font-size: 12px;
        font-weight: 850;
        padding: 0 13px;
      }

      .preview-stage {
        width: min(100%, 640px);
        aspect-ratio: 16 / 10;
        display: grid;
        place-items: center;
        border-radius: 28px;
        background:
          radial-gradient(circle at 24% 20%, rgba(255,255,255,.48), transparent 30%),
          linear-gradient(135deg, #ff6b5f 0%, #f12b8f 50%, #6d5dfc 100%);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.18);
      }

      .preview-output {
        width: 60%;
        aspect-ratio: 16 / 10;
        position: relative;
        overflow: hidden;
        border-radius: 22px;
        border: 2px solid rgba(255,255,255,.62);
        background: #10120f;
        box-shadow: 0 30px 72px rgba(0,0,0,.34);
      }

      .preview-browser-dots {
        position: absolute;
        z-index: 2;
        top: 12px;
        left: 14px;
        display: flex;
        gap: 6px;
      }

      .preview-browser-dots i {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255,255,255,.42);
      }

      .preview-photo {
        position: absolute;
        inset: 36px 0 0;
        background:
          radial-gradient(circle at 44% 18%, #d7e6e7 0 9%, transparent 9.5%),
          linear-gradient(135deg, #263637 0%, #8ba3a0 48%, #172326 100%);
      }

      .preview-photo span,
      .preview-photo em {
        position: absolute;
        display: block;
      }

      .preview-photo span {
        left: 10%;
        right: 10%;
        bottom: 0;
        height: 54%;
        clip-path: polygon(0 100%, 20% 24%, 36% 62%, 52% 8%, 70% 56%, 86% 28%, 100% 100%);
        background: linear-gradient(180deg, #4f6462, #172326);
      }

      .preview-photo em {
        left: 8%;
        right: 8%;
        bottom: 11%;
        height: 12%;
        border-radius: 999px;
        background: rgba(208, 65, 50, 0.86);
        box-shadow: 90px 2px 0 rgba(208,65,50,.86), 170px -3px 0 rgba(208,65,50,.86);
      }

      .preview-option {
        height: 38px;
        display: flex;
        align-items: center;
        padding: 0 12px;
        margin-bottom: 7px;
        border-radius: 9px;
        color: rgba(248,246,239,.58);
        background: rgba(255,255,255,.045);
        border: 1px solid rgba(255,255,255,.08);
        font-size: 11px;
        font-weight: 750;
        white-space: pre;
      }

      .preview-option.active {
        color: #f8f6ef;
        border-color: rgba(255,255,255,.16);
        background: rgba(255,255,255,.1);
      }

      .fake-slider {
        height: 6px;
        margin: 12px 0 16px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,.16);
      }

      .fake-slider i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #6aa8ff, #f8f6ef);
      }

      .toggle-row {
        justify-content: space-between;
        color: rgba(248,246,239,.7);
        font-size: 12px;
        font-weight: 800;
      }

      .toggle-row b {
        width: 34px;
        height: 20px;
        border-radius: 999px;
        background: linear-gradient(135deg, #6d5dfc, #77f2c2);
      }

      .pricing-section {
        width: min(100% - 56px, 1600px);
        margin: 0 auto 64px;
        padding: 58px 28px 52px;
        border-radius: 0;
        border: 0;
        background:
          radial-gradient(circle at 5% 18%, rgba(255, 104, 88, 0.14), transparent 30%),
          radial-gradient(circle at 94% 10%, rgba(109, 93, 252, 0.22), transparent 34%),
          linear-gradient(145deg, rgba(8,9,10,.18), rgba(16,18,17,.08));
        box-shadow: none;
      }

      .showcase-section {
        width: min(100% - 56px, 1600px);
        margin: 0 auto 24px;
        padding: 28px;
        border-radius: 32px;
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(255,255,255,.04);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.07);
      }

      .showcase-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 20px;
      }

      .showcase-heading span {
        color: #74f0b3;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .12em;
        text-transform: uppercase;
      }

      .showcase-heading h2 {
        max-width: 620px;
        margin: 0;
        color: #fffdf7;
        font-size: 32px;
        line-height: 1.05;
        letter-spacing: -0.05em;
        text-align: right;
      }

      .showcase-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 14px;
      }

      .showcase-card {
        min-height: 220px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(255,255,255,.045);
      }

      .showcase-card div {
        height: 140px;
        flex: 0 0 140px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border-radius: 17px;
        background: linear-gradient(135deg, #ff6858, #f12b8f 52%, #6d5dfc);
      }

      .showcase-card:nth-child(2) div { background: linear-gradient(135deg, #15201d, #4ca8ff); }
      .showcase-card:nth-child(3) div { background: linear-gradient(135deg, #f8f6ef, #9ef2c8); }
      .showcase-card:nth-child(4) div { background: linear-gradient(135deg, #21152e, #7b3fb2 46%, #ffce73); }
      .showcase-card:nth-child(5) div { background: linear-gradient(135deg, #08090a, #f12b8f); }

      .showcase-card i {
        display: block;
        width: 58%;
        aspect-ratio: 16 / 10;
        border-radius: 14px;
        background: #10120f;
        box-shadow: 0 24px 56px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,.1);
      }

      .showcase-3 i {
        width: 72px;
        border-radius: 999px;
        aspect-ratio: 1;
      }

      .showcase-4 i {
        width: 74%;
        aspect-ratio: 3 / 1;
      }

      .showcase-5 i {
        width: auto;
        height: 112px;
        aspect-ratio: 9 / 16;
        border-radius: 16px;
      }

      .showcase-card strong {
        display: block;
        margin-top: 12px;
        color: #fffdf7;
        font-size: 14px;
      }

      .showcase-card small {
        display: block;
        margin-top: 4px;
        color: rgba(248,246,239,.52);
        font-size: 12px;
        font-weight: 750;
      }

      .pricing-kicker {
        width: max-content;
        min-height: 38px;
        margin: 0 auto 26px;
        padding: 0 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.12);
        color: rgba(248,246,239,.9);
        background: rgba(255,255,255,.07);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
        font-size: 12px;
        font-weight: 900;
      }

      .pricing-section h2 {
        max-width: 740px;
        margin: 0 auto 18px;
        text-align: center;
        color: #fffdf7;
        font-size: clamp(54px, 6vw, 82px);
        line-height: .98;
        letter-spacing: -0.075em;
      }

      .pricing-copy {
        max-width: 720px;
        margin: 0 auto 44px;
        text-align: center;
        color: rgba(248,246,239,.72);
        font-size: 20px;
        line-height: 1.45;
      }

      .plan-grid {
        max-width: 1320px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 24px;
      }

      .plan-card {
        min-height: 452px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        padding: 30px;
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,.14);
        background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));
        box-shadow: 0 28px 90px rgba(0,0,0,.26), inset 0 1px 0 rgba(255,255,255,.08);
      }

      .plan-card::after {
        content: "";
        position: absolute;
        right: -74px;
        bottom: 28px;
        width: 210px;
        height: 112px;
        border: 2px solid currentColor;
        border-left: 0;
        border-bottom: 0;
        border-radius: 0 110px 0 0;
        opacity: .42;
        pointer-events: none;
      }

      .plan-card.green { color: #74f0b3; }
      .plan-card.coral { color: #ff7367; }
      .plan-card.blue { color: #6aa8ff; }

      .plan-card > span {
        display: inline-flex;
        width: max-content;
        min-height: 30px;
        align-items: center;
        padding: 0 14px;
        border-radius: 999px;
        color: currentColor;
        background: color-mix(in srgb, currentColor 13%, transparent);
        font-size: 12px;
        font-weight: 850;
      }

      .plan-card h3 {
        margin: 34px 0 18px;
        color: #fffdf7;
        font-size: 27px;
        line-height: 1.08;
        letter-spacing: -0.035em;
      }

      .plan-card p {
        margin: 6px 0 0;
        color: rgba(248,246,239,.78);
        font-size: 16px;
        line-height: 1.4;
      }

      .plan-card strong {
        display: block;
        color: #fffdf7;
        font-size: 62px;
        line-height: 1;
        letter-spacing: -0.05em;
      }

      .plan-card strong small {
        margin-left: 8px;
        color: rgba(248,246,239,.68);
        font-size: 16px;
        letter-spacing: 0;
      }

      .plan-card ul {
        display: grid;
        gap: 13px;
        padding: 0;
        margin: 30px 0 24px;
        list-style: none;
      }

      .plan-card li {
        display: flex;
        align-items: center;
        gap: 10px;
        color: rgba(248,246,239,.72);
        font-size: 15px;
        font-weight: 800;
      }

      .plan-card li svg {
        color: #74f0b3;
      }

      .plan-card a {
        height: 54px;
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border-radius: 15px;
        color: white;
        background: linear-gradient(135deg, #ff6858 0%, #f12b8f 55%, #6d5dfc 100%);
        box-shadow: 0 18px 46px rgba(241, 43, 143, 0.22);
        text-decoration: none;
        font-size: 15px;
        font-weight: 900;
      }

      .home-footer {
        width: min(100% - 56px, 1320px);
        margin: 0 auto;
        padding: 0 0 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      .home-footer div,
      .home-footer nav {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .home-footer strong {
        color: #fffdf7;
        font-size: 18px;
        letter-spacing: -0.03em;
      }

      .home-footer span,
      .home-footer a {
        color: rgba(248,246,239,.62);
        font-size: 15px;
        font-weight: 750;
        text-decoration: none;
      }

      .home-footer .support-link {
        min-height: 44px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 18px;
        border-radius: 14px;
        color: white;
        background: linear-gradient(135deg, #7779f6, #56d0d2);
        box-shadow: 0 14px 34px rgba(85, 118, 255, 0.22);
      }

      .home-footer .fazier-badge,
      .home-footer .scrolllaunch-badge {
        display: inline-flex;
        align-items: center;
        min-height: 44px;
      }

      .home-footer .fazier-badge img {
        display: block;
        width: 120px;
        height: auto;
      }

      .home-footer .scrolllaunch-badge img {
        display: block;
        width: 220px;
        max-width: 100%;
        height: auto;
      }

      .home-shell {
        --home-bg: #08090b;
        --home-panel: rgba(18, 19, 24, 0.84);
        --home-panel-raised: rgba(24, 25, 30, 0.94);
        --home-border: rgba(255, 255, 255, 0.095);
        --home-border-strong: rgba(255, 255, 255, 0.16);
        --home-text: #f5f7fb;
        --home-soft: rgba(245, 247, 251, 0.72);
        --home-muted: rgba(245, 247, 251, 0.52);
        --home-accent: linear-gradient(135deg, #9a9bff 0%, #7178ff 52%, #58d5c9 100%);
        color: var(--home-text);
        background:
          radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.2), transparent 30%),
          radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.09), transparent 28%),
          linear-gradient(145deg, #07080a 0%, #0b0c10 48%, #08090b 100%);
        font-size: 15px;
        line-height: 1.55;
      }

      .home-nav {
        height: 92px;
      }

      .home-brand span,
      .studio-preview-brand span,
      .trial-button,
      .plan-card a {
        background: var(--home-accent);
        box-shadow: 0 18px 44px rgba(113, 120, 255, 0.24);
      }

      .home-brand span,
      .studio-preview-brand span {
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .home-brand span img,
      .studio-preview-brand span img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        border-radius: 0 !important;
      }

      .home-brand strong {
        color: var(--home-text);
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.035em;
      }

      .nav-links a,
      .login-link,
      .hero-copy p,
      .pricing-copy,
      .plan-card p,
      .plan-card li,
      .showcase-card small {
        color: var(--home-soft);
      }

      .nav-links a,
      .login-link,
      .trial-button,
      .secondary-button,
      .plan-card a {
        font-weight: 650;
        letter-spacing: 0;
      }

      .trial-button,
      .secondary-button,
      .plan-card a {
        min-height: 50px;
        border-radius: 14px;
      }

      .hero-copy h1,
      .pricing-section h2 {
        color: var(--home-text);
        letter-spacing: -0.065em;
      }

      .hero-copy h1 span {
        background: linear-gradient(100deg, #ffffff, #bfc2ff 48%, #76e4d9);
        -webkit-background-clip: text;
        background-clip: text;
      }

      .hero-kicker,
      .pricing-kicker,
      .secondary-button,
      .product-preview,
      .showcase-section,
      .showcase-card,
      .plan-card {
        border-color: var(--home-border);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018)),
          var(--home-panel);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.32);
      }

      .product-preview,
      .plan-card {
        border-radius: 28px;
      }

      .custom-home-preview {
        position: absolute;
        inset: 0;
        z-index: 4;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
        background: #0b0c10;
      }

      .preview-left,
      .preview-right,
      .preview-option,
      .preview-tabs,
      .format-pills,
      .preview-toolbar button,
      .preview-toolbar span {
        background: rgba(255, 255, 255, 0.045);
        border-color: var(--home-border);
      }

      .preview-stage {
        background:
          radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.24), transparent 30%),
          linear-gradient(135deg, #30334d 0%, #7178ff 52%, #58d5c9 100%);
      }

      .showcase-card div {
        background: linear-gradient(135deg, #30334d 0%, #7178ff 52%, #58d5c9 100%);
      }

      .plan-card > span {
        background: rgba(139, 140, 246, 0.12);
      }

      @media (max-width: 1120px) {
        .hero-section {
          grid-template-columns: 1fr;
        }

        .hero-copy {
          text-align: center;
        }

        .hero-kicker,
        .hero-actions,
        .trust-row {
          margin-left: auto;
          margin-right: auto;
          justify-content: center;
        }

        .hero-copy p {
          margin-left: auto;
          margin-right: auto;
        }
      }

      @media (max-width: 900px) {
        .home-nav {
          width: min(100% - 28px, 1780px);
          height: auto;
          grid-template-columns: 1fr;
          padding: 16px 0;
        }

        .nav-links {
          display: none;
        }

        .nav-actions {
          justify-content: flex-start;
        }

        .hero-section,
        .pricing-section {
          width: min(100% - 28px, 1780px);
        }

        .hero-section {
          gap: 34px;
          padding-top: 16px;
        }

        .hero-copy h1 {
          font-size: 52px;
        }

        .hero-copy p {
          font-size: 18px;
        }

        .hero-actions {
          flex-direction: column;
        }

        .trial-button.large,
        .secondary-button {
          width: 100%;
        }

        .product-preview {
          min-height: auto;
        }

        .preview-grid {
          height: auto;
          grid-template-columns: 1fr;
        }

        .preview-left,
        .preview-right {
          display: none;
        }

        .preview-canvas {
          min-height: 420px;
          padding: 64px 18px 22px;
        }

        .plan-grid {
          grid-template-columns: 1fr;
        }

        .showcase-heading {
          display: block;
        }

        .showcase-heading h2 {
          margin-top: 8px;
          text-align: left;
          font-size: 26px;
        }

        .showcase-grid {
          grid-template-columns: 1fr;
        }

        .home-footer,
        .home-footer div,
        .home-footer nav {
          align-items: flex-start;
          flex-direction: column;
        }

        .home-footer {
          width: min(100% - 28px, 1780px);
        }
      }
    `}</style>
  );
}
