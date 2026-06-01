"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Loader2, MonitorUp } from "lucide-react";

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
          window.location.replace("/studio");
          return;
        }

        if (attempts === 1 && await confirmPayment()) {
          setStatus("ready");
          window.location.replace("/studio");
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
      <Link className="billing-return-brand" href="/">
        <span><MonitorUp size={22} /></span>
        <strong>EasyFrame</strong>
      </Link>

      <section className="billing-return-card">
        <div className="billing-return-icon">
          {status === "pending" ? <ArrowRight size={24} /> : <Loader2 size={25} />}
        </div>
        <span>{status === "pending" ? "Payment received" : "Confirming payment"}</span>
        <h1>{status === "pending" ? "Your access is almost ready." : "Setting up your EasyFrame access."}</h1>
        <p>
          {status === "pending"
            ? "Dodo is still sending the final confirmation. This usually finishes in a moment, and you can retry the studio from here."
            : `We are checking your ${plan} access and will redirect you to the studio automatically.`}
        </p>
        <div className="billing-return-actions">
          <Link href="/studio">Open studio</Link>
          <Link href="/pricing">Back to pricing</Link>
        </div>
      </section>

      <style jsx global>{`
        .billing-return-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          color: var(--text-primary);
          background:
            radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.2), transparent 30%),
            radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.08), transparent 28%),
            linear-gradient(145deg, #07080a 0%, #0b0c10 52%, #08090b 100%);
          font-family: var(--font-sans);
        }

        .billing-return-brand {
          position: fixed;
          top: 28px;
          left: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
          text-decoration: none;
        }

        .billing-return-brand span,
        .billing-return-icon {
          display: grid;
          place-items: center;
          background: var(--accent-gradient);
          box-shadow: 0 18px 44px rgba(113, 120, 255, 0.24);
        }

        .billing-return-brand span {
          width: 44px;
          height: 44px;
          border-radius: 14px;
        }

        .billing-return-brand strong {
          font-size: 25px;
          letter-spacing: -0.04em;
        }

        .billing-return-card {
          width: min(100%, 560px);
          padding: 34px;
          border: 1px solid var(--stroke);
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018)),
            var(--panel);
          box-shadow: var(--shadow-panel);
          text-align: center;
        }

        .billing-return-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 18px;
          border-radius: 18px;
          color: white;
        }

        .billing-return-icon svg {
          animation: billing-spin 1s linear infinite;
        }

        .billing-return-card span {
          color: #68d5ec;
          font-size: 13px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .billing-return-card h1 {
          margin: 14px 0 12px;
          font-size: clamp(34px, 6vw, 54px);
          line-height: 0.98;
          letter-spacing: -0.06em;
        }

        .billing-return-card p {
          margin: 0 auto;
          max-width: 450px;
          color: var(--text-muted);
          font-size: 15px;
          line-height: 1.6;
        }

        .billing-return-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 24px;
        }

        .billing-return-actions a {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          border: 1px solid var(--stroke);
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.045);
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
        }

        .billing-return-actions a:first-child {
          color: white;
          border-color: transparent;
          background: var(--accent-gradient);
        }

        @keyframes billing-spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .billing-return-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
