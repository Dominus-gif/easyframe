// Thin GA4 event helper. Safe to call anywhere on the client; no-ops on the server
// and when no analytics provider is present. Keeps GA4 (G-T208N0Q261) wiring intact.

export type AnalyticsEvent =
  | "template_viewed"
  | "image_uploaded"
  | "export_completed"
  | "ad_impression"
  | "ad_unfilled"
  | "ad_click"
  | "premium_started"
  | "premium_purchased";

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === "function") {
    w.gtag("event", event, params);
  } else {
    (w.dataLayer = w.dataLayer || []).push({ event, ...params });
  }
}
