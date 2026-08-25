"use client";

import { useEffect, useRef } from "react";
import { composite, defaultSettings, type BackgroundSetting } from "@/lib/editor/compositor";
import { sampleScreenCanvas } from "@/lib/editor/sampleScreens";

/**
 * A real EasyFrame output rendered client-side by the actual compositor:
 * the given device frame around a sample screenshot on the given background.
 */
export default function MockShot({
  device,
  sample = 0,
  background,
  padding = 0.14,
  maxEdge = 900,
  className,
  caption
}: {
  device: string;
  sample?: number;
  background: BackgroundSetting;
  padding?: number;
  maxEdge?: number;
  className?: string;
  caption?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const img = sampleScreenCanvas(sample);
    composite(canvas, img, { ...defaultSettings, deviceSlug: device, background, padding, shadow: 0.5, cornerRadius: 0.04 }, { maxEdge });
  }, [device, sample, background, padding, maxEdge]);

  return <canvas ref={ref} className={className} role="img" aria-label={caption ?? `${device} mockup`} />;
}
