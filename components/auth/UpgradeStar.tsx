"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Crown, Sparkles, Star, X } from "lucide-react";
import { useAppSession } from "@/lib/auth/client";
import { usePremium } from "@/lib/entitlement";
import { track } from "@/lib/analytics";

const MONTHLY = process.env.NEXT_PUBLIC_PREMIUM_MONTHLY ?? "6";
const LIFETIME = process.env.NEXT_PUBLIC_PREMIUM_LIFETIME ?? "99";

/**
 * A star shown to signed-in accounts that are still on the free plan. Clicking
 * it opens a short chooser for the two paid options, which posts straight to
 * the existing checkout route. Renders nothing for guests or paid accounts.
 */
export default function UpgradeStar({ className }: { className?: string }) {
  const { status } = useAppSession();
  const { premium, ready } = usePremium();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const show = status === "authenticated" && ready && !premium;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!show) return null;

  return (
    <>
      <button
        type="button"
        className={`upgrade-star${className ? ` ${className}` : ""}`}
        onClick={() => { setOpen(true); track("premium_started", { plan: "chooser" }); }}
        aria-label="Upgrade to Premium"
        title="Upgrade to Premium"
      >
        <Star size={17} />
      </button>

      {/* Portalled to <body>: the navs use backdrop-filter, which makes them a
          containing block for position:fixed children and would otherwise clip
          this dialog into the nav bar. */}
      {open && mounted
        ? createPortal(
        <div className="upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="upgrade-title" onClick={() => setOpen(false)}>
          <div className="upgrade-card" onClick={(e) => e.stopPropagation()}>
            <button className="upgrade-close" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button>
            <span className="upgrade-eyebrow"><Sparkles size={14} /> Go Premium</span>
            <h2 id="upgrade-title">Unlock the pro toolkit</h2>
            <p>Batch export, carousel export, 4K and transparent PNGs, custom backgrounds — and no ads. Both plans unlock exactly the same features.</p>

            <form action="/api/billing/checkout" method="post" onSubmit={() => track("premium_started", { plan: "monthly" })}>
              <input type="hidden" name="plan" value="monthly" />
              <button type="submit" className="upgrade-btn primary">Premium — ${MONTHLY}/month</button>
            </form>
            <form action="/api/billing/checkout" method="post" onSubmit={() => track("premium_started", { plan: "lifetime" })}>
              <input type="hidden" name="plan" value="lifetime" />
              <button type="submit" className="upgrade-btn ghost"><Crown size={15} /> Lifetime — ${LIFETIME} once</button>
            </form>

            <a className="upgrade-compare" href="/pricing">Compare plans</a>
          </div>
        </div>,
            document.body
          )
        : null}
    </>
  );
}
