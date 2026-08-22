"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires a GA4 event once on mount (for server-rendered pages). */
export default function TrackView({ event, params }: { event: AnalyticsEvent; params?: Record<string, unknown> }) {
  useEffect(() => {
    track(event, params ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
