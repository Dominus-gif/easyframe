"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

type AccessResponse = {
  hasAccess?: boolean;
  planType?: string;
};

export default function BillingReturnPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "pending">("checking");
  // Query params are read after mount so the server and first client render
  // match (reading window during render caused a hydration mismatch).
  const [params, setParams] = useState<{ plan: string; paymentId: string | null; paymentStatus: string | null } | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setParams({ plan: q.get("plan") ?? "plan", paymentId: q.get("payment_id"), paymentStatus: q.get("status") });
  }, []);
  const plan = params?.plan ?? "plan";

  useEffect(() => {
    if (!params) return;
    const { plan, paymentId, paymentStatus } = params;
    let cancelled = false;
    let attempts = 0;

    const confirmPayment = async () => {
      if (!paymentId || paymentStatus !== "succeeded" || (plan !== "monthly" && plan !== "lifetime")) return false;

      const response = await fetch("/api/billing/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, plan })
      });

      return response.ok;
    };

    const checkAccess = async () => {
      attempts += 1;
      try {
        const response = await fetch("/api/account/access", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as AccessResponse | null;

        if (cancelled) return;
        if (response.ok && data?.hasAccess) {
          setStatus("ready");
          track("premium_purchased", { plan });
          window.location.replace("/editor");
          return;
        }

        if (attempts === 1 && (await confirmPayment())) {
          setStatus("ready");
          track("premium_purchased", { plan });
          window.location.replace("/editor");
          return;
        }
      } catch {
        // Keep polling briefly. Dodo webhooks can arrive a few seconds after redirect.
      }

      if (!cancelled) {
        if (attempts >= 15) {
          setStatus("pending");
          return;
        }
        window.setTimeout(checkAccess, 2000);
      }
    };

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [params]);

  return (
    <main className="billing-return-shell">
      <Link className="billing-return-brand" href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/easyframe-app-icon.svg" alt="" width={30} height={30} />
        EasyFrame
      </Link>

      <section className="billing-return-card">
        <div className="billing-return-icon">
          {status === "pending" ? <ArrowRight size={22} /> : <Loader2 size={22} />}
        </div>
        <span className="billing-return-eyebrow">{status === "pending" ? "Payment received" : "Confirming payment"}</span>
        <h1>{status === "pending" ? "Your access is almost ready." : "Setting up your access."}</h1>
        <p>
          {status === "pending"
            ? "The final confirmation is still on its way. This usually finishes in a moment — you can open the editor from here."
            : `We're checking your ${plan} access and will take you to the editor automatically.`}
        </p>
        <div className="billing-return-actions">
          <Link className="billing-return-primary" href="/editor">Open editor <ArrowRight size={16} /></Link>
          <Link className="billing-return-ghost" href="/pricing">Back to pricing</Link>
        </div>
      </section>

      {/* Themed with the shared --bx-* tokens (globals.css, Boom layer) so it
          stays in sync whenever the site theme changes. */}
      <style jsx global>{`
        .billing-return-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          color: var(--bx-ink, #0a0a0a);
          background: url(/bg/hero-glow.webp) center bottom / cover no-repeat, var(--bx-bg, #f8f8f8);
          font-family: var(--bx-body, "Figtree", system-ui, sans-serif);
        }
        .billing-return-brand {
          position: fixed;
          top: 28px;
          left: 28px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--bx-display, "Archivo", sans-serif);
          font-stretch: 112%;
          font-weight: 800;
          font-size: 19px;
          letter-spacing: -0.02em;
          color: var(--bx-ink, #0a0a0a);
          text-decoration: none;
        }
        .billing-return-brand img {
          border-radius: 9px;
          box-shadow: 0 6px 16px -6px rgba(10, 20, 40, 0.35);
        }
        .billing-return-card {
          width: min(100%, 520px);
          padding: 40px 34px;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(22px) saturate(1.4);
          -webkit-backdrop-filter: blur(22px) saturate(1.4);
          box-shadow: 0 30px 70px -30px rgba(23, 53, 140, 0.35);
          text-align: center;
        }
        .billing-return-icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 18px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: #fff;
          background: var(--bx-grad, linear-gradient(140deg, #1753fe, #0841f7));
          box-shadow: 0 12px 26px -12px rgba(23, 83, 254, 0.75);
        }
        .billing-return-icon svg {
          animation: billing-spin 1s linear infinite;
        }
        .billing-return-eyebrow {
          color: var(--bx-sub, #324454);
          font-family: var(--bx-mono, "IBM Plex Mono", monospace);
          font-size: 12.5px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .billing-return-card h1 {
          margin: 12px 0 12px;
          font-family: var(--bx-display, "Archivo", sans-serif);
          font-stretch: 125%;
          font-weight: 800;
          text-transform: uppercase;
          font-size: clamp(26px, 4.4vw, 36px);
          line-height: 0.98;
          letter-spacing: -0.03em;
          color: var(--bx-ink, #0a0a0a);
        }
        .billing-return-card p {
          margin: 0 auto;
          max-width: 420px;
          color: var(--bx-sub, #324454);
          font-size: 15px;
          line-height: 1.6;
        }
        .billing-return-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 26px;
        }
        .billing-return-actions a {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 999px;
          text-decoration: none;
          font-family: var(--bx-display, "Archivo", sans-serif);
          font-stretch: 112%;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .billing-return-primary {
          color: #fff;
          background: var(--bx-grad, linear-gradient(140deg, #1753fe, #0841f7));
          border: 1px solid transparent;
          box-shadow: 0 12px 26px -12px rgba(23, 83, 254, 0.75);
        }
        .billing-return-primary:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
        }
        .billing-return-ghost {
          color: var(--bx-ink, #0a0a0a);
          background: #fff;
          border: 1px solid var(--bx-line, #e6e8ec);
        }
        .billing-return-ghost:hover {
          border-color: var(--bx-ink, #0a0a0a);
        }
        @keyframes billing-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .billing-return-icon svg { animation: none; }
        }
        @media (max-width: 640px) {
          .billing-return-actions { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
