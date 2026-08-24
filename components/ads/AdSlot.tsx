"use client";

import { useEffect, useRef, useState } from "react";
import { usePremium } from "@/lib/entitlement";
import { useConsent } from "@/lib/consent";
import { track } from "@/lib/analytics";

// Provider-abstracted ad slot (Google AdSense today, swappable later).
// - Always reserves its height so switching between ad / empty causes NO layout shift.
// - Premium users and dev/local builds with no publisher id render an empty slot.
// - Never used inside the editor canvas or between upload and download.

type Variant = "header" | "incontent" | "footer";

const SLOTS: Record<Variant, { h: number; label: string }> = {
  header: { h: 90, label: "leaderboard" },
  incontent: { h: 280, label: "in-content" },
  footer: { h: 90, label: "footer" }
};

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdSlot({
  variant,
  adSlotId,
  frame = false,
  collapse = false
}: {
  variant: Variant;
  adSlotId?: string;
  /** Wrap a filled ad in a branded "Sponsored" card so it reads as intentional. */
  frame?: boolean;
  /** Render nothing (no reserved height) when there is no ad to show. */
  collapse?: boolean;
}) {
  const cfg = SLOTS[variant];
  const { premium, ready } = usePremium();
  const consent = useConsent();
  const [mode, setMode] = useState<"reserved" | "ad">("reserved");
  const pushed = useRef(false);
  const hovered = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (premium || !CLIENT || consent !== "granted") {
      // Ad-free (Premium), no provider configured, or consent not granted — keep it empty.
      if (!CLIENT && !premium) track("ad_unfilled", { slot: variant });
      setMode("reserved");
      return;
    }
    setMode("ad");
  }, [ready, premium, consent, variant]);

  // Best-effort ad-click signal: focus leaves the window while the pointer is over an ad.
  useEffect(() => {
    const onBlur = () => {
      if (hovered.current && mode === "ad") track("ad_click", { slot: variant });
    };
    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [mode, variant]);

  useEffect(() => {
    if (mode !== "ad" || pushed.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
      pushed.current = true;
      track("ad_impression", { slot: variant });
    } catch {
      /* AdSense not ready yet; slot stays reserved */
    }
  }, [mode, variant]);

  // Nothing to show: collapse entirely (no empty box) when asked, else reserve height (no CLS).
  if (mode !== "ad" || !CLIENT) {
    if (collapse) return null;
    return (
      <div
        className={`ad-slot ad-slot-${variant}`}
        data-ad-variant={variant}
        aria-hidden="true"
        style={{ width: "100%", minHeight: cfg.h, margin: "0 auto" }}
      />
    );
  }

  const ins = (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", height: cfg.h }}
      data-ad-client={CLIENT}
      data-ad-slot={adSlotId ?? ""}
      data-full-width-responsive="true"
    />
  );

  return (
    <div
      className={`ad-slot ad-slot-${variant}${frame ? " ad-card" : ""}`}
      data-ad-variant={variant}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
      style={{ width: "100%", margin: "0 auto" }}
    >
      {frame ? <span className="ad-card-label">Sponsored</span> : null}
      <div className="ad-slot-inner" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: cfg.h }}>
        {ins}
      </div>
    </div>
  );
}
