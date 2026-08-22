"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Redo2, RotateCcw, Undo2, Upload } from "lucide-react";
import { devices, gradientPresets } from "@/lib/editor/devices";
import {
  composite,
  defaultSettings,
  exportScene,
  loadImageSafely,
  type EditorSettings,
  type ExportFormat
} from "@/lib/editor/compositor";

const SOLID_COLORS = ["#0b0d0f", "#ffffff", "#f4f1ea", "#111827", "#6d5dfc", "#ff5f8f", "#13e0c4", "#ff9f45"];
const FREE_MAX_EDGE = 2048;
const PREVIEW_MAX_EDGE = 1400;

export default function CanvasEditor({ initialDevice }: { initialDevice?: string }) {
  const startSlug = devices.some((d) => d.slug === initialDevice) ? (initialDevice as string) : defaultSettings.deviceSlug;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const historyRef = useRef<{ past: EditorSettings[]; future: EditorSettings[] }>({ past: [], future: [] });
  const lastCommittedRef = useRef<EditorSettings>({ ...defaultSettings, deviceSlug: startSlug });
  const commitTimer = useRef<number | undefined>(undefined);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [settings, setSettings] = useState<EditorSettings>({ ...defaultSettings, deviceSlug: startSlug });
  const [imgVersion, setImgVersion] = useState(0);
  const [hasImage, setHasImage] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [dropActive, setDropActive] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(92);
  const [urlValue, setUrlValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  };

  const recompose = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    composite(canvas, imgRef.current, settings, { maxEdge: PREVIEW_MAX_EDGE });
  }, [settings]);

  useEffect(() => {
    recompose();
  }, [recompose, imgVersion]);

  // Coalesced undo/redo: snapshot the last committed settings ~500ms after changes settle.
  useEffect(() => {
    window.clearTimeout(commitTimer.current);
    commitTimer.current = window.setTimeout(() => {
      const prev = lastCommittedRef.current;
      if (JSON.stringify(prev) !== JSON.stringify(settings)) {
        historyRef.current.past.push(prev);
        if (historyRef.current.past.length > 60) historyRef.current.past.shift();
        historyRef.current.future = [];
        lastCommittedRef.current = settings;
        setCanUndo(historyRef.current.past.length > 0);
        setCanRedo(false);
      }
    }, 500);
    return () => window.clearTimeout(commitTimer.current);
  }, [settings]);

  const undo = useCallback(() => {
    const h = historyRef.current;
    const prev = h.past.pop();
    if (!prev) return;
    h.future.unshift(lastCommittedRef.current);
    lastCommittedRef.current = prev;
    setSettings(prev);
    setCanUndo(h.past.length > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    const h = historyRef.current;
    const next = h.future.shift();
    if (!next) return;
    h.past.push(lastCommittedRef.current);
    lastCommittedRef.current = next;
    setSettings(next);
    setCanUndo(true);
    setCanRedo(h.future.length > 0);
  }, []);

  const update = (partial: Partial<EditorSettings>) => setSettings((s) => ({ ...s, ...partial }));

  const setImage = (img: HTMLImageElement | null) => {
    imgRef.current = img;
    setHasImage(!!img);
    setImgVersion((v) => v + 1);
  };

  const ingest = useCallback(async (source: Blob | string) => {
    setBusy(true);
    try {
      const img = await loadImageSafely(source);
      setImage(img);
    } catch {
      flash("Could not load that image. Try a PNG, JPEG, or WebP.");
    } finally {
      setBusy(false);
    }
  }, []);

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!/image\/(png|jpeg|webp)/.test(file.type)) {
      flash("Unsupported file. Use PNG, JPEG, or WebP.");
      return;
    }
    void ingest(file);
  };

  // Clipboard paste.
  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const item = Array.from(event.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
      const file = item?.getAsFile();
      if (file) void ingest(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [ingest]);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const meta = event.ctrlKey || event.metaKey;
      if (meta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if (meta && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      const step = event.shiftKey ? 0.04 : 0.01;
      if (event.key === "ArrowLeft") { event.preventDefault(); update({ imageOffsetX: settings.imageOffsetX - step }); }
      else if (event.key === "ArrowRight") { event.preventDefault(); update({ imageOffsetX: settings.imageOffsetX + step }); }
      else if (event.key === "ArrowUp") { event.preventDefault(); update({ imageOffsetY: settings.imageOffsetY - step }); }
      else if (event.key === "ArrowDown") { event.preventDefault(); update({ imageOffsetY: settings.imageOffsetY + step }); }
      else if (event.key === "+" || event.key === "=") { event.preventDefault(); setPreviewZoom((z) => Math.min(3, z + 0.1)); }
      else if (event.key === "-" || event.key === "_") { event.preventDefault(); setPreviewZoom((z) => Math.max(0.5, z - 0.1)); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, undo, settings.imageOffsetX, settings.imageOffsetY]);

  // Drag the image within the frame.
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!hasImage) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - dragRef.current.x) / rect.width;
    const dy = (event.clientY - dragRef.current.y) / rect.height;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setSettings((s) => ({ ...s, imageOffsetX: s.imageOffsetX + dx * 1.4, imageOffsetY: s.imageOffsetY + dy * 1.4 }));
  };
  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
  };

  const onDownload = async () => {
    setBusy(true);
    try {
      const blob = await exportScene(imgRef.current, settings, format, quality / 100, FREE_MAX_EDGE);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = format === "jpeg" ? "jpg" : format;
      link.href = url;
      link.download = `${settings.deviceSlug}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      flash("Export failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const resetAll = () => {
    setSettings({ ...defaultSettings, deviceSlug: settings.deviceSlug });
  };

  const bg = settings.background;

  return (
    <div
      className="ed"
      onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(e) => { e.preventDefault(); setDropActive(false); onFiles(e.dataTransfer.files); }}
    >
      <header className="ed-top">
        <div className="ed-brand">EasyFrame <span>Editor</span></div>
        <div className="ed-top-actions">
          <button className="ed-ghost" onClick={undo} disabled={!canUndo} aria-label="Undo"><Undo2 size={16} /></button>
          <button className="ed-ghost" onClick={redo} disabled={!canRedo} aria-label="Redo"><Redo2 size={16} /></button>
          <button className="ed-ghost" onClick={resetAll} aria-label="Reset"><RotateCcw size={16} /> Reset</button>
          <button className="ed-primary" onClick={onDownload} disabled={busy}>
            <Download size={16} /> {busy ? "Working…" : "Download"}
          </button>
        </div>
      </header>

      <div className="ed-body">
        {/* Left rail: devices */}
        <aside className="ed-rail ed-rail-left" aria-label="Devices">
          <h3>Device</h3>
          <div className="ed-devices">
            {devices.map((d) => (
              <button
                key={d.slug}
                className={`ed-device ${settings.deviceSlug === d.slug ? "on" : ""}`}
                onClick={() => update({ deviceSlug: d.slug })}
              >
                {d.name}
              </button>
            ))}
          </div>

          <h3>Upload</h3>
          <button className="ed-upload" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={16} /> Choose image
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
          <div className="ed-url">
            <input value={urlValue} onChange={(e) => setUrlValue(e.target.value)} placeholder="Paste image URL" />
            <button onClick={() => { if (urlValue.trim()) void ingest(urlValue.trim()); }}>Add</button>
          </div>
          <p className="ed-hint">or drag &amp; drop / paste from clipboard</p>
        </aside>

        {/* Canvas */}
        <main className="ed-stage" aria-label="Preview">
          <div className="ed-canvas-wrap" style={{ transform: `scale(${previewZoom})` }}>
            <canvas
              ref={canvasRef}
              className="ed-canvas"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          {!hasImage ? (
            <button className={`ed-drop ${dropActive ? "active" : ""}`} onClick={() => fileRef.current?.click()}>
              <Upload size={26} />
              <strong>Drop a screenshot to start</strong>
              <span>PNG, JPEG or WebP · up to 20MP · nothing is uploaded to a server</span>
            </button>
          ) : null}
          <div className="ed-zoom">
            <button onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.1))}>−</button>
            <b>{Math.round(previewZoom * 100)}%</b>
            <button onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.1))}>+</button>
          </div>
          {notice ? <div className="ed-toast" role="status">{notice}</div> : null}
        </main>

        {/* Right rail: adjustments */}
        <aside className="ed-rail ed-rail-right" aria-label="Adjustments">
          <h3>Background</h3>
          <div className="ed-swatches">
            {gradientPresets.map((g) => (
              <button
                key={g.id}
                className={`ed-swatch ${bg.type === "gradient" && bg.from === g.from ? "on" : ""}`}
                style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                aria-label={g.label}
                onClick={() => update({ background: { type: "gradient", from: g.from, to: g.to, angle: g.angle } })}
              />
            ))}
            {SOLID_COLORS.map((c) => (
              <button
                key={c}
                className={`ed-swatch ${bg.type === "solid" && bg.color === c ? "on" : ""}`}
                style={{ background: c }}
                aria-label={`Solid ${c}`}
                onClick={() => update({ background: { type: "solid", color: c } })}
              />
            ))}
          </div>

          <Range label="Padding" value={settings.padding} min={0} max={0.4} step={0.01} onChange={(v) => update({ padding: v })} />
          <Range label="Image scale" value={settings.imageScale} min={0.4} max={2.5} step={0.01} onChange={(v) => update({ imageScale: v })} />
          <Range label="Rotate" value={settings.imageRotate} min={-45} max={45} step={1} onChange={(v) => update({ imageRotate: v })} />
          <Range label="Shadow" value={settings.shadow} min={0} max={1} step={0.02} onChange={(v) => update({ shadow: v })} />
          <Range label="Corner radius" value={settings.cornerRadius} min={0} max={0.3} step={0.01} onChange={(v) => update({ cornerRadius: v })} />

          <div className="ed-seg">
            <button className={settings.fit === "cover" ? "on" : ""} onClick={() => update({ fit: "cover" })}>Cover</button>
            <button className={settings.fit === "contain" ? "on" : ""} onClick={() => update({ fit: "contain" })}>Contain</button>
          </div>

          <h3>Export</h3>
          <div className="ed-seg">
            {(["png", "jpeg", "webp"] as ExportFormat[]).map((f) => (
              <button key={f} className={format === f ? "on" : ""} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
            ))}
          </div>
          {format !== "png" ? (
            <Range label="Quality" value={quality} min={40} max={100} step={1} onChange={setQuality} />
          ) : null}
          <p className="ed-hint">Free export up to {FREE_MAX_EDGE}px · 4K &amp; transparent background are Premium.</p>
        </aside>
      </div>

      <EditorStyles />
    </div>
  );
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="ed-range">
      <span>{label}<b>{Number.isInteger(value) ? value : value.toFixed(2)}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function EditorStyles() {
  return (
    <style jsx global>{`
      .ed { --acc: #6d5dfc; --acc2: #ff5f8f; --bg: #0b0d0f; --panel: #14171a; --line: rgba(255,255,255,.08); --text: #f4f5f7; --muted: #8a8f98;
        position: fixed; inset: 0; display: flex; flex-direction: column; background: var(--bg); color: var(--text);
        font-family: Inter, system-ui, sans-serif; }
      .ed-top { display: flex; align-items: center; justify-content: space-between; height: 60px; padding: 0 18px; border-bottom: 1px solid var(--line); }
      .ed-brand { font-weight: 700; letter-spacing: -.02em; }
      .ed-brand span { background: linear-gradient(135deg, var(--acc), var(--acc2)); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
      .ed-top-actions { display: flex; gap: 8px; }
      .ed-ghost, .ed-primary { display: inline-flex; align-items: center; gap: 6px; height: 38px; padding: 0 14px; border-radius: 10px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
      .ed-ghost { background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--text); }
      .ed-ghost:hover:not(:disabled) { background: rgba(255,255,255,.08); }
      .ed-ghost:disabled { opacity: .4; cursor: default; }
      .ed-primary { background: linear-gradient(135deg, var(--acc), var(--acc2)); border: 0; color: #fff; box-shadow: 0 8px 24px rgba(109,93,252,.4); }
      .ed-primary:disabled { opacity: .6; }
      .ed-body { flex: 1; display: grid; grid-template-columns: 232px minmax(0,1fr) 264px; min-height: 0; }
      .ed-rail { padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
      .ed-rail-left { border-right: 1px solid var(--line); }
      .ed-rail-right { border-left: 1px solid var(--line); }
      .ed-rail h3 { margin: 6px 0 2px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
      .ed-devices { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .ed-device { height: 42px; border-radius: 10px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12.5px; cursor: pointer; }
      .ed-device.on { border-color: var(--acc); background: rgba(109,93,252,.16); }
      .ed-upload { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; border-radius: 10px; background: rgba(255,255,255,.05); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
      .ed-url { display: flex; gap: 6px; }
      .ed-url input { flex: 1; min-width: 0; height: 38px; padding: 0 10px; border-radius: 9px; background: rgba(0,0,0,.3); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; }
      .ed-url button { height: 38px; padding: 0 12px; border-radius: 9px; background: rgba(255,255,255,.06); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; cursor: pointer; }
      .ed-hint { font-size: 11px; color: var(--muted); line-height: 1.5; }
      .ed-stage { position: relative; display: grid; place-items: center; padding: 28px; overflow: hidden; background:
        radial-gradient(900px 500px at 50% -10%, rgba(109,93,252,.12), transparent 60%); }
      .ed-canvas-wrap { max-width: 100%; max-height: 100%; transition: transform .12s ease; }
      .ed-canvas { max-width: 100%; max-height: calc(100vh - 140px); display: block; border-radius: 8px; touch-action: none; cursor: grab; }
      .ed-canvas:active { cursor: grabbing; }
      .ed-drop { position: absolute; inset: 28px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
        border: 2px dashed var(--line); border-radius: 20px; background: rgba(11,13,15,.55); color: var(--text); cursor: pointer; backdrop-filter: blur(2px); }
      .ed-drop.active { border-color: var(--acc); background: rgba(109,93,252,.1); }
      .ed-drop strong { font-size: 17px; }
      .ed-drop span { font-size: 12.5px; color: var(--muted); }
      .ed-zoom { position: absolute; bottom: 16px; right: 16px; display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 999px; background: rgba(20,23,26,.8); border: 1px solid var(--line); backdrop-filter: blur(8px); }
      .ed-zoom button { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,.06); border: 0; color: var(--text); font: inherit; cursor: pointer; }
      .ed-zoom b { font-size: 12px; min-width: 38px; text-align: center; }
      .ed-toast { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); padding: 10px 16px; border-radius: 12px; background: #1c1f24; border: 1px solid var(--line); font-size: 13px; box-shadow: 0 16px 40px rgba(0,0,0,.5); }
      .ed-swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .ed-swatch { aspect-ratio: 1; border-radius: 9px; border: 1px solid var(--line); cursor: pointer; }
      .ed-swatch.on { outline: 2px solid var(--acc); outline-offset: 1px; }
      .ed-range { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--muted); }
      .ed-range span { display: flex; justify-content: space-between; }
      .ed-range b { color: var(--text); }
      .ed-range input { width: 100%; height: 4px; border-radius: 999px; -webkit-appearance: none; appearance: none; background: linear-gradient(90deg, var(--acc), var(--acc2)); }
      .ed-range input::-webkit-slider-thumb { -webkit-appearance: none; width: 15px; height: 15px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(109,93,252,.3); }
      .ed-range input::-moz-range-thumb { width: 15px; height: 15px; border: 0; border-radius: 50%; background: #fff; }
      .ed-seg { display: flex; gap: 6px; }
      .ed-seg button { flex: 1; height: 36px; border-radius: 9px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; cursor: pointer; }
      .ed-seg button.on { background: linear-gradient(135deg, var(--acc), var(--acc2)); border-color: transparent; color: #fff; }
      .ed :focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
      @media (max-width: 900px) {
        .ed-body { grid-template-columns: 1fr; grid-template-rows: auto minmax(0,1fr) auto; }
        .ed-rail { flex-direction: row; flex-wrap: wrap; border: 0; border-bottom: 1px solid var(--line); }
        .ed-rail-right { border-top: 1px solid var(--line); }
      }
    `}</style>
  );
}
