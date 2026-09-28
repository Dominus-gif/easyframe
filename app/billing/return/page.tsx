"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { track } from "@/lib/analytics";

type AccessResponse = {
  hasAccess?: boolean;
  planType?: string;
};

export default function BillingReturnPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "pending">("checking");
  const plan = useMemo(() => {
    if (typeof window === "undefined") return "plan";
    return new URLSearchParams(window.location.search).get("plan") ?? "plan";
  }, []);
  const paymentId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("payment_id");
  }, []);
  const paymentStatus = useMemo(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("status");
  }, []);

  useEffect(() => {
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
  }, [paymentId, paymentStatus, plan]);

  return (
    <main className="billing-return-shell">
      <Link className="billing-return-brand" href="/">EasyFrame</Link>

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

      {/* Themed with the shared --sr-* solidroad tokens (globals.css) so it
          stays in sync whenever the site theme changes. */}
      <style jsx global>{`
        .billing-return-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          color: var(--sr-ink, #1a1712);
          background: var(--sr-paper, #fbf7eb);
          font-family: "Inter", system-ui, -apple-system, sans-serif;
        }
        .billing-return-brand {
          position: fixed;
          top: 28px;
          left: 28px;
          font-family: var(--sr-serif, "Fraunces", Georgia, serif);
          font-weight: 400;
          font-size: 24px;
          letter-spacing: -0.02em;
          color: var(--sr-ink, #1a1712);
          text-decoration: none;
        }
        .billing-return-card {
          width: min(100%, 520px);
          padding: 40px 34px;
          border: 1px solid var(--sr-line, #eae3d3);
          border-radius: 22px;
          background: var(--sr-white, #fff);
          box-shadow: 0 1px 2px rgba(26, 23, 18, 0.05), 0 18px 44px rgba(26, 23, 18, 0.07);
          text-align: center;
        }
        .billing-return-icon {
          width: 54px;
          height: 54px;
          margin: 0 auto 18px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: #1a1712;
          background: #f4ff95;
          border: 1px solid #e6f26a;
        }
        .billing-return-icon svg {
          animation: billing-spin 1s linear infinite;
        }
        .billing-return-eyebrow {
          color: var(--sr-sub, #6e685e);
          font-size: 12.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .billing-return-card h1 {
          margin: 12px 0 12px;
          font-family: var(--sr-serif, "Fraunces", Georgia, serif);
          font-weight: 300;
          font-size: clamp(28px, 5vw, 40px);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: var(--sr-ink, #1a1712);
        }
        .billing-return-card p {
          margin: 0 auto;
          max-width: 420px;
          color: var(--sr-sub, #6e685e);
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
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .billing-return-primary {
          color: var(--sr-paper, #fbf7eb);
          background: var(--sr-btn, #17140f);
          border: 1px solid transparent;
        }
        .billing-return-primary:hover {
          background: #000;
          transform: translateY(-1px);
        }
        .billing-return-ghost {
          color: var(--sr-ink, #1a1712);
          background: var(--sr-white, #fff);
          border: 1px solid var(--sr-line2, #dbd2be);
        }
        .billing-return-ghost:hover {
          border-color: var(--sr-ink, #1a1712);
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
