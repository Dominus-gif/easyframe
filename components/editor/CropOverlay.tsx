"use client";

import { useRef } from "react";
import type { CropRect } from "@/lib/editor/compositor";

type Handle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export const CROP_ASPECTS: { id: string; label: string; ratio: number | null }[] = [
  { id: "free", label: "Free", ratio: null },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "4:5", label: "4:5", ratio: 4 / 5 },
  { id: "3:4", label: "3:4", ratio: 3 / 4 },
  { id: "9:16", label: "9:16", ratio: 9 / 16 },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "3:2", label: "3:2", ratio: 3 / 2 }
];

const MIN = 0.05;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Largest rect of `ratio` (output px w/h) that fits the frame, centered on `around`. */
export function fitAspect(ratio: number, frame: { w: number; h: number }, around?: CropRect): CropRect {
  // Normalized height for a normalized width of 1 at this ratio.
  let w = 1;
  let h = (frame.w / frame.h) / ratio;
  if (h > 1) {
    w = 1 / h;
    h = 1;
  }
  const cx = around ? around.x + around.w / 2 : 0.5;
  const cy = around ? around.y + around.h / 2 : 0.5;
  return { w, h, x: clamp(cx - w / 2, 0, 1 - w), y: clamp(cy - h / 2, 0, 1 - h) };
}

/**
 * Interactive crop frame laid over the (uncropped) preview canvas. Works in
 * normalized 0..1 coordinates; `frame` is the canvas size in pixels, needed to
 * hold an aspect ratio that is defined in output pixels.
 */
export default function CropOverlay({
  crop,
  ratio,
  frame,
  onChange
}: {
  crop: CropRect;
  ratio: number | null;
  frame: { w: number; h: number };
  onChange: (next: CropRect) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ handle: Handle; start: CropRect; px: number; py: number } | null>(null);

  const point = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width, 0, 1), y: clamp((e.clientY - r.top) / r.height, 0, 1) };
  };

  const begin = (handle: Handle) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const p = point(e);
    drag.current = { handle, start: crop, px: p.x, py: p.y };
    try {
      boxRef.current?.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety; moves still arrive while the pointer is over the box */
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const p = point(e);
    const s = d.start;

    if (d.handle === "move") {
      onChange({ ...s, x: clamp(s.x + (p.x - d.px), 0, 1 - s.w), y: clamp(s.y + (p.y - d.py), 0, 1 - s.h) });
      return;
    }

    const hasN = d.handle.includes("n");
    const hasS = d.handle.includes("s");
    const hasW = d.handle.includes("w");
    const hasE = d.handle.includes("e");
    // Fixed (anchor) edges are the ones opposite the dragged handle.
    let left = s.x;
    let top = s.y;
    let right = s.x + s.w;
    let bottom = s.y + s.h;
    if (hasW) left = clamp(p.x, 0, right - MIN);
    if (hasE) right = clamp(p.x, left + MIN, 1);
    if (hasN) top = clamp(p.y, 0, bottom - MIN);
    if (hasS) bottom = clamp(p.y, top + MIN, 1);

    let w = right - left;
    let h = bottom - top;

    if (ratio) {
      // Shrink the free-form box until it matches the ratio (in output pixels).
      const wPx = w * frame.w;
      const hPx = h * frame.h;
      if (wPx / hPx > ratio) w = (hPx * ratio) / frame.w;
      else h = wPx / ratio / frame.h;
      // Re-anchor on the fixed corner.
      if (hasW) left = right - w;
      else right = left + w;
      if (hasN) top = bottom - h;
      else bottom = top + h;
    }

    onChange({ x: clamp(left, 0, 1 - w), y: clamp(top, 0, 1 - h), w: clamp(w, MIN, 1), h: clamp(h, MIN, 1) });
  };

  const end = (e: React.PointerEvent) => {
    drag.current = null;
    try {
      boxRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const handles: Handle[] = ratio ? ["nw", "ne", "sw", "se"] : ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

  return (
    <div ref={boxRef} className="ed-crop" onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}>
      <div
        className="ed-crop-frame"
        style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%` }}
        onPointerDown={begin("move")}
      >
        <i className="ed-crop-grid" aria-hidden="true" />
        {handles.map((h) => (
          <span key={h} className={`ed-crop-h ed-crop-${h}`} onPointerDown={begin(h)} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
