"use client";

import { useEffect, useState } from "react";

// Simple cookie/ads consent, stored in localStorage. Ad scripts and cookies must not
// load until consent === "granted" (AdSense compliance in most regions).

export type Consent = "granted" | "denied" | null;

const KEY = "ef-consent";
const EVENT = "ef-consent-change";

export function getConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(KEY);
  return v === "granted" || v === "denied" ? v : null;
}

export function setConsent(value: "granted" | "denied"): void {
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function useConsent(): Consent {
  const [consent, setState] = useState<Consent>(null);
  useEffect(() => {
    setState(getConsent());
    const onChange = () => setState(getConsent());
    window.addEventListener(EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return consent;
}
