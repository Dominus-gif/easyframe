"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Download, Smartphone, Tablet, Laptop } from "lucide-react";
import { composite, exportScene, defaultSettings, type EditorSettings, type BackgroundSetting } from "@/lib/editor/compositor";
import { sampleScreenCanvas, SAMPLE_COUNT } from "@/lib/editor/sampleScreens";

type Src = HTMLImageElement | HTMLCanvasElement;

const DEVICES = [
  { slug: "iphone-mockup", label: "iPhone", icon: Smartphone },
  { slug: "ipad-mockup", label: "iPad", icon: Tablet },
  { slug: "macbook-pro-mockup", label: "MacBook", icon: Laptop }
];

const BACKGROUNDS: { id: string; bg: BackgroundSetting; css: string }[] = [
  { id: "ink", bg: { type: "solid", color: "#0A0A0C" }, css: "#0A0A0C" },
  { id: "raise", bg: { type: "gradient", from: "#1a1e26", to: "#0c0e13", angle: 135 }, css: "linear-gradient(135deg,#1a1e26,#0c0e13)" },
  { id: "violet", bg: { type: "gradient", from: "#241a2e", to: "#12101a", angle: 135 }, css: "linear-gradient(135deg,#241a2e,#12101a)" },
  { id: "steel", bg: { type: "gradient", from: "#26303a", to: "#141a20", angle: 135 }, css: "linear-gradient(135deg,#26303a,#141a20)" },
  { id: "vermilion", bg: { type: "gradient", from: "#FF5B3A", to: "#E8471F", angle: 135 }, css: "linear-gradient(135deg,#FF5B3A,#E8471F)" }
];

const PREVIEW_EDGE = 1200;

export default function HeroDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState(DEVICES[0].slug);
  const [bgIndex, setBgIndex] = useState(1);
  const [img, setImg] = useState<Src | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const settings: EditorSettings = {
    ...defaultSettings,
    deviceSlug: device,
    background: BACKGROUNDS[bgIndex].bg,
    padding: 0.12,
    shadow: 0.55,
    cornerRadius: 0.05
  };

  // Active image: the user's drop, or the rotating sample.
  const active: Src | null = img ?? (typeof document !== "undefined" ? sampleScreenCanvas(sampleIndex) : null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    composite(canvas, active, settings, { maxEdge: PREVIEW_EDGE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device, bgIndex, img, sampleIndex]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Idle auto-rotation of sample screens until the visitor interacts.
  useEffect(() => {
    if (engaged || img) return;
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = window.setInterval(() => setSampleIndex((i) => (i + 1) % SAMPLE_COUNT), 6000);
    return () => window.clearInterval(t);
  }, [engaged, img]);

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setEngaged(true);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  }, []);

  // Paste-to-frame anywhere on the page.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) loadFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadFile]);

  // Parallax tilt on pointer move (respects reduced-motion).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty("--rx", `${(-py * 3).toFixed(2)}deg`);
      stage.style.setProperty("--ry", `${(px * 3).toFixed(2)}deg`);
    };
    const reset = () => {
      stage.style.setProperty("--rx", "0deg");
      stage.style.setProperty("--ry", "0deg");
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", reset);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", reset);
    };
  }, []);

  const onExport = useCallback(async () => {
    if (!active) return;
    setBusy(true);
    try {
      const blob = await exportScene(active, settings, "png", 1, 2048);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "easyframe-mockup.png";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, device, bgIndex, img, sampleIndex]);

  return (
    <div className="hd">
      <div
        ref={stageRef}
        className={`hd-stage${dragging ? " is-drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) loadFile(file);
        }}
      >
        <canvas ref={canvasRef} className="hd-canvas" aria-label="Live device mockup preview" />
        <button type="button" className="hd-drop" onClick={() => fileRef.current?.click()}>
          <Upload size={15} /> Drop or paste a screenshot
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) loadFile(f);
          }}
        />
      </div>

      <div className="hd-controls">
        <div className="hd-seg" role="group" aria-label="Device">
          {DEVICES.map((dv) => {
            const Icon = dv.icon;
            return (
              <button
                key={dv.slug}
                type="button"
                className={device === dv.slug ? "on" : ""}
                onClick={() => {
                  setDevice(dv.slug);
                  setEngaged(true);
                }}
              >
                <Icon size={15} /> <span>{dv.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hd-swatches" role="group" aria-label="Background">
          {BACKGROUNDS.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={b.id}
              className={bgIndex === i ? "on" : ""}
              style={{ background: b.css }}
              onClick={() => {
                setBgIndex(i);
                setEngaged(true);
              }}
            />
          ))}
        </div>

        <button type="button" className="hd-export" onClick={onExport} disabled={busy}>
          <Download size={15} /> {busy ? "Exporting…" : "Export PNG"}
        </button>
      </div>
    </div>
  );
}
