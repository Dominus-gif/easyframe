"use client";

import { Crown } from "lucide-react";
import { track } from "@/lib/analytics";

/** The two Premium checkout CTAs — fires premium_started before posting to Dodo checkout. */
export default function PremiumButtons({ monthly, lifetime }: { monthly: string; lifetime: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
      <form action="/api/billing/checkout" method="post" onSubmit={() => track("premium_started", { plan: "monthly" })}>
        <input type="hidden" name="plan" value="monthly" />
        <button type="submit" className="mk-cta" style={{ width: "100%", justifyContent: "center", border: 0, cursor: "pointer" }}>
          Get Premium — ${monthly}/mo
        </button>
      </form>
      <form action="/api/billing/checkout" method="post" onSubmit={() => track("premium_started", { plan: "lifetime" })}>
        <input type="hidden" name="plan" value="lifetime" />
        <button type="submit" className="mk-ghost" style={{ width: "100%", justifyContent: "center", cursor: "pointer" }}>
          <Crown size={16} /> Lifetime — ${lifetime} once
        </button>
      </form>
    </div>
  );
}
