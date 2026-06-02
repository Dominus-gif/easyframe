import { Check, Crown, Sparkles } from "lucide-react";
import { EasyFrameMark } from "@/components/EasyFrameLogo";

const plans = [
  {
    id: "trial",
    badge: "Try it out",
    name: "1-Day Free Trial",
    price: "$0",
    description: "Full feature access for one day.",
    features: ["5 exports maximum", "All features included", "No credit card required"],
    action: "/api/billing/trial",
    cta: "Start free trial"
  },
  {
    id: "monthly",
    badge: "Most popular",
    name: "1-Month Plan",
    price: "$4",
    suffix: "/month",
    description: "Simple monthly access.",
    features: ["Unlimited exports", "All features included", "Cancel anytime"],
    action: "/api/billing/checkout",
    cta: "Choose monthly"
  },
  {
    id: "lifetime",
    badge: "Best value",
    name: "Lifetime Plan",
    price: "$80",
    description: "Pay once. Keep everything.",
    features: ["Unlimited exports", "All features included", "Future updates included"],
    action: "/api/billing/checkout",
    cta: "Choose lifetime"
  }
];

export default async function PricingPage({ searchParams }: { searchParams?: { reason?: string; checkout?: string } }) {
  const reason = searchParams?.reason;

  return (
    <main className="paywall-shell">
      <header className="paywall-nav">
        <a className="paywall-brand" href="/">
          <span><EasyFrameMark size={26} /></span>
          <strong>EasyFrame</strong>
        </a>
        <a href="/login">Account</a>
      </header>

      <section className="paywall-hero">
        <span><Sparkles size={16} /> Choose your access</span>
        <h1>Unlock the EasyFrame studio.</h1>
        <p>Start with a one-day trial, choose monthly access, or get lifetime access with all future updates.</p>
        {reason === "trial-ended" ? (
          <div className="paywall-notice">Your free trial has ended. Choose monthly or lifetime access to continue creating.</div>
        ) : null}
        {searchParams?.checkout === "pending" ? (
          <div className="paywall-notice">Your payment is still being confirmed. If you completed checkout, try opening the studio again in a moment.</div>
        ) : null}
      </section>

      <section className="paywall-grid">
        {plans.map((plan) => (
          <article key={plan.id} className={`paywall-card ${plan.id}`}>
            <b>{plan.badge}</b>
            <h2>{plan.name}</h2>
            <strong>{plan.price}{plan.suffix ? <small>{plan.suffix}</small> : null}</strong>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}><Check size={16} /> {feature}</li>
              ))}
            </ul>
            <form action={plan.action} method="post">
              {plan.id !== "trial" ? <input type="hidden" name="plan" value={plan.id} /> : null}
              <button type="submit">
                {plan.id === "lifetime" ? <Crown size={17} /> : null}
                {plan.cta}
              </button>
            </form>
          </article>
        ))}
      </section>

      <PaywallStyles />
    </main>
  );
}

function PaywallStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      .paywall-shell {
        min-height: 100vh;
        padding: 24px;
        color: #f8f6ef;
        background:
          radial-gradient(circle at 14% 8%, rgba(255, 104, 88, 0.18), transparent 28%),
          radial-gradient(circle at 86% 14%, rgba(109, 93, 252, 0.24), transparent 30%),
          linear-gradient(145deg, #08090a 0%, #101211 52%, #171612 100%);
        font-family: var(--font-sans);
      }

      .paywall-nav,
      .paywall-brand {
        display: flex;
        align-items: center;
      }

      .paywall-nav {
        width: min(100%, 1240px);
        margin: 0 auto;
        justify-content: space-between;
      }

      .paywall-brand,
      .paywall-nav a {
        color: #fffaf2;
        text-decoration: none;
        font-weight: 850;
      }

      .paywall-brand {
        gap: 12px;
      }

      .paywall-brand span {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border-radius: 14px;
        background: radial-gradient(circle at 24% 18%, rgba(124, 58, 237, 0.95), transparent 44%), linear-gradient(135deg, #020617, #1e1b4b 48%, #0f172a);
        box-shadow: 0 18px 46px rgba(37, 99, 235, 0.28);
      }

      .paywall-brand strong {
        font-size: 25px;
        letter-spacing: -0.04em;
      }

      .paywall-hero {
        width: min(100%, 820px);
        margin: 72px auto 34px;
        text-align: center;
      }

      .paywall-hero span {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 38px;
        padding: 0 15px;
        border-radius: 999px;
        background: rgba(255,255,255,.07);
        border: 1px solid rgba(255,255,255,.1);
        color: rgba(248,246,239,.86);
        font-size: 13px;
        font-weight: 850;
      }

      .paywall-hero h1 {
        margin: 22px 0 12px;
        color: #fffdf7;
        font-size: clamp(44px, 6vw, 76px);
        line-height: .98;
        letter-spacing: -0.07em;
      }

      .paywall-hero p {
        margin: 0 auto;
        max-width: 640px;
        color: rgba(248,246,239,.66);
        font-size: 19px;
        line-height: 1.5;
      }

      .paywall-notice {
        width: min(100%, 620px);
        margin: 22px auto 0;
        padding: 13px 16px;
        border-radius: 16px;
        border: 1px solid rgba(104, 213, 236, 0.28);
        color: var(--text-primary);
        background: rgba(104, 213, 236, 0.09);
        font-size: 14px;
        font-weight: 750;
      }

      .paywall-grid {
        width: min(100%, 1240px);
        margin: 0 auto;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 22px;
      }

      .paywall-card {
        padding: 26px;
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,.12);
        background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));
        box-shadow: 0 30px 90px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.08);
      }

      .paywall-card b {
        display: inline-flex;
        min-height: 30px;
        align-items: center;
        padding: 0 13px;
        border-radius: 999px;
        background: rgba(255,255,255,.08);
        color: #74f0b3;
        font-size: 12px;
      }

      .paywall-card.monthly b { color: #ff7367; }
      .paywall-card.lifetime b { color: #6aa8ff; }

      .paywall-card h2 {
        margin: 24px 0 10px;
        color: #fffdf7;
        font-size: 25px;
      }

      .paywall-card > strong {
        display: block;
        color: #fffdf7;
        font-size: 58px;
        line-height: 1;
        letter-spacing: -0.06em;
      }

      .paywall-card > strong small {
        margin-left: 8px;
        color: rgba(248,246,239,.58);
        font-size: 16px;
        letter-spacing: 0;
      }

      .paywall-card p,
      .paywall-card li {
        color: rgba(248,246,239,.68);
      }

      .paywall-card > p {
        min-height: 44px;
      }

      .paywall-card ul {
        display: grid;
        gap: 11px;
        padding: 0;
        margin: 24px 0;
        list-style: none;
      }

      .paywall-card li {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        font-weight: 700;
      }

      .paywall-card li svg {
        color: #74f0b3;
      }

      .paywall-card button {
        width: 100%;
        min-height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        border: 0;
        border-radius: 15px;
        color: white;
        background: linear-gradient(135deg, #ff6858 0%, #f12b8f 55%, #6d5dfc 100%);
        box-shadow: 0 18px 46px rgba(241, 43, 143, 0.24);
        font-weight: 900;
        cursor: pointer;
      }

      .paywall-shell {
        color: var(--text-primary);
        background:
          radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.2), transparent 30%),
          radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.08), transparent 28%),
          linear-gradient(145deg, #07080a 0%, #0b0c10 52%, #08090b 100%);
      }

      .paywall-brand span,
      .paywall-card button {
        background: var(--accent-gradient);
        box-shadow: 0 18px 44px rgba(113, 120, 255, 0.24);
      }

      .paywall-brand strong {
        color: var(--text-primary);
        font-size: 24px;
        font-weight: 700;
      }

      .paywall-nav a,
      .paywall-hero p,
      .paywall-card p,
      .paywall-card li,
      .paywall-card > strong small {
        color: var(--text-muted);
      }

      .paywall-hero span,
      .paywall-card {
        border-color: var(--stroke);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018)),
          var(--panel);
        box-shadow: var(--shadow-panel);
      }

      .paywall-hero h1,
      .paywall-card h2,
      .paywall-card > strong {
        color: var(--text-primary);
      }

      .paywall-card button {
        border-radius: 14px;
        font-weight: 650;
      }

      @media (max-width: 900px) {
        .paywall-grid {
          grid-template-columns: 1fr;
        }
      }
    ` }} />
  );
}
