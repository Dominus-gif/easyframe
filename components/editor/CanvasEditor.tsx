"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppWindow, ChevronDown, ChevronUp, Download, Eye, EyeOff, Image as ImageIcon, ImagePlus, Laptop, Layers, Monitor, Moon, Plus, Redo2, RotateCcw, Smartphone, Sun, Tablet, Trash2, Type, Undo2, Upload, Watch, X } from "lucide-react";
import { editorDevices, gradientPresets, type DeviceKind } from "@/lib/editor/devices";
import {
  composite,
  defaultSettings,
  exportScene,
  loadImageSafely,
  type EditorSettings,
  type ExportFormat,
  type Overlay,
  type ImageOverlay,
  type TextOverlay
} from "@/lib/editor/compositor";
import { TRENDING_FONTS, googleFontsHref, weightsFor } from "@/lib/editor/fonts";
import { usePremium } from "@/lib/entitlement";
import { track } from "@/lib/analytics";

const uid = () => Math.random().toString(36).slice(2, 9);

const SOLID_COLORS = ["#0b0d0f", "#ffffff", "#f4f1ea", "#0f172a", "#2f6bff", "#22b8e6", "#0f9d76", "#64748b"];
const FREE_MAX_EDGE = 2048;
const PREMIUM_MAX_EDGE = 3840;
const PREVIEW_MAX_EDGE = 2000;
const RES_PRESETS: { v: number; label: string; pro?: boolean }[] = [
  { v: 1080, label: "1080p" },
  { v: FREE_MAX_EDGE, label: "2K" },
  { v: PREMIUM_MAX_EDGE, label: "4K", pro: true }
];

const DEVICE_GROUPS: { key: string; label: string }[] = [
  { key: "blank", label: "No frame" },
  { key: "phone", label: "Phones" },
  { key: "tablet", label: "Tablets" },
  { key: "laptop", label: "Laptops" },
  { key: "desktop", label: "Desktop" },
  { key: "browser", label: "Browser" },
  { key: "watch", label: "Watches" }
];

const KIND_ICON: Record<DeviceKind, typeof Smartphone> = {
  blank: ImageIcon,
  phone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  desktop: Monitor,
  browser: AppWindow,
  watch: Watch
};

const ANGLE_PRESETS = [
  { id: "front", label: "Front", x: 0, y: 0, z: 0, p: 45 },
  { id: "left", label: "Left", x: 6, y: -24, z: 0, p: 65 },
  { id: "right", label: "Right", x: 6, y: 24, z: 0, p: 65 },
  { id: "up", label: "Look up", x: -20, y: 0, z: 0, p: 65 },
  { id: "iso", label: "Isometric", x: 16, y: -22, z: -4, p: 70 },
  { id: "tilt", label: "Tilt", x: 12, y: 14, z: 2, p: 65 }
];

export default function CanvasEditor({ initialDevice }: { initialDevice?: string }) {
  const startSlug = editorDevices.some((d) => d.slug === initialDevice) ? (initialDevice as string) : defaultSettings.deviceSlug;
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
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState({ from: "#2f6bff", via: "#7c5cff", to: "#22b8e6", angle: 135, threeStop: false });
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ef-editor-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ef-editor-theme", theme); } catch { /* ignore */ }
  }, [theme]);
  const overlayFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const { premium } = usePremium();
  const [resolution, setResolution] = useState(FREE_MAX_EDGE);
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [rememberExport, setRememberExport] = useState(false);

  // Restore saved export preferences (size/format/quality) on load.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ef-export-prefs");
      if (!raw) return;
      const p = JSON.parse(raw) as { format?: ExportFormat; quality?: number; resolution?: number };
      if (p.format) setFormat(p.format);
      if (typeof p.quality === "number") setQuality(p.quality);
      if (typeof p.resolution === "number") setResolution(p.resolution);
      setRememberExport(true);
    } catch { /* ignore */ }
  }, []);

  // Close the export menu on outside-click; close menu + dialog on Escape.
  useEffect(() => {
    if (!exportMenuOpen) return;
    const onDoc = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest(".ed-dl-split")) setExportMenuOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [exportMenuOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setExportMenuOpen(false); setExportOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedOverlay = overlays.find((o) => o.id === selectedId) ?? null;

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 3200);
  };

  const recompose = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const res = composite(canvas, imgRef.current, settings, { maxEdge: PREVIEW_MAX_EDGE }, overlays);
    if (res.width && res.height) setPreviewDims(res);
  }, [settings, overlays]);

  useEffect(() => {
    recompose();
  }, [recompose, imgVersion]);

  // Load trending Google Fonts once (Inter ships locally).
  useEffect(() => {
    if (document.getElementById("ef-google-fonts")) return;
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com";
    pre.crossOrigin = "anonymous";
    document.head.appendChild(pre);
    const link = document.createElement("link");
    link.id = "ef-google-fonts";
    link.rel = "stylesheet";
    link.href = googleFontsHref();
    link.onload = () => setImgVersion((v) => v + 1);
    document.head.appendChild(link);
  }, []);

  const ensureFont = (family: string) => {
    if (typeof document === "undefined" || !document.fonts) return;
    document.fonts.load(`700 40px "${family}"`).then(() => setImgVersion((v) => v + 1)).catch(() => {});
  };

  const updateOverlay = (id: string, patch: Record<string, unknown>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? ({ ...o, ...patch } as Overlay) : o)));
  const removeOverlay = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  };
  const moveOverlay = (id: string, dir: -1 | 1) =>
    setOverlays((prev) => {
      const i = prev.findIndex((o) => o.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const addText = () => {
    const o: TextOverlay = { id: uid(), type: "text", text: "Your text", fontFamily: "Poppins", fontWeight: 700, fontSize: 0.06, color: "#ffffff", align: "center", x: 0.5, y: 0.5, scale: 1, rotation: 0, opacity: 1 };
    setOverlays((prev) => [...prev, o]);
    setSelectedId(o.id);
    ensureFont("Poppins");
  };
  const addImageOverlay = async (file: File | undefined) => {
    if (!file) return;
    try {
      const img = await loadImageSafely(file);
      const o: ImageOverlay = { id: uid(), type: "image", img, x: 0.5, y: 0.5, scale: 0.6, rotation: 0, opacity: 1 };
      setOverlays((prev) => [...prev, o]);
      setSelectedId(o.id);
    } catch {
      flash("Could not add that image.");
    }
  };

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

  const applyCustomGrad = (patch: Partial<{ from: string; via: string; to: string; angle: number; threeStop: boolean }>) => {
    const next = { ...customBg, ...patch };
    setCustomBg(next);
    update({
      background: { type: "gradient", from: next.from, to: next.to, angle: next.angle, ...(next.threeStop ? { via: next.via } : {}) }
    });
  };

  // Custom background image (Premium): load a file and set it as the scene background.
  const onBgImage = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (!premium) {
      flash("Custom background images are a Premium feature.");
      return;
    }
    const img = new Image();
    img.onload = () => update({ background: { type: "image", img } });
    img.src = URL.createObjectURL(file);
  };

  // Effective export resolution (free is capped at 2K) and the resulting output dimensions.
  const effResolution = premium ? resolution : Math.min(resolution, FREE_MAX_EDGE);
  const outDims = previewDims
    ? (() => {
        const m = Math.max(previewDims.width, previewDims.height) || 1;
        return { w: Math.round((previewDims.width * effResolution) / m), h: Math.round((previewDims.height * effResolution) / m) };
      })()
    : null;

  // Shared export controls (used in the dialog and the split-button dropdown).
  const renderExportControls = () => (
    <>
      <div className="ed-subhead">Size</div>
      <div className="ed-seg">
        {RES_PRESETS.map((p) => (
          <button
            key={p.v}
            className={`ed-res-btn ${effResolution === p.v ? "on" : ""}`}
            onClick={() => { if (p.pro && !premium) { flash("4K export is a Premium feature."); return; } setResolution(p.v); }}
          >
            {p.label}{p.pro && !premium ? <span className="ed-pro">PRO</span> : null}
          </button>
        ))}
      </div>
      <p className="ed-dims">{outDims ? `${outDims.w} × ${outDims.h} px` : "Add an image to see the size"}</p>
      <div className="ed-subhead">Format</div>
      <div className="ed-seg">
        {(["png", "jpeg", "webp"] as ExportFormat[]).map((f) => (
          <button key={f} className={format === f ? "on" : ""} onClick={() => setFormat(f)}>{f.toUpperCase()}</button>
        ))}
      </div>
      {format !== "png" ? <Range label="Quality" value={quality} min={40} max={100} step={1} onChange={setQuality} /> : null}
      <label className="ed-remember">
        <input type="checkbox" checked={rememberExport} onChange={(e) => setRememberExport(e.target.checked)} />
        Remember these settings for next time
      </label>
    </>
  );

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
      track("image_uploaded", {});
      try {
        if (!localStorage.getItem("ef-adjust-hint")) {
          flash("Nice! Fine-tune padding, shadow, background & 3D angle in the panel on the right →");
          localStorage.setItem("ef-adjust-hint", "1");
        }
      } catch { /* ignore */ }
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
    if (!hasImage && !selectedOverlay) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - dragRef.current.x) / rect.width;
    const dy = (event.clientY - dragRef.current.y) / rect.height;
    dragRef.current = { x: event.clientX, y: event.clientY };
    if (selectedId && selectedOverlay) {
      setOverlays((prev) => prev.map((o) => (o.id === selectedId ? { ...o, x: o.x + dx, y: o.y + dy } : o)));
    } else {
      setSettings((s) => ({ ...s, imageOffsetX: s.imageOffsetX + dx * 1.4, imageOffsetY: s.imageOffsetY + dy * 1.4 }));
    }
  };
  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
  };

  const onDownload = async () => {
    setBusy(true);
    try {
      const maxEdge = premium ? resolution : Math.min(resolution, FREE_MAX_EDGE);
      // Guard: transparent & custom-image backgrounds are Premium-only; free users fall back to a solid bg.
      const exportSettings =
        (settings.background.type === "transparent" || settings.background.type === "image") && !premium
          ? { ...settings, background: { type: "solid" as const, color: "#0b0d0f" } }
          : settings;
      const blob = await exportScene(imgRef.current, exportSettings, format, quality / 100, maxEdge, overlays);
      track("export_completed", { device: settings.deviceSlug, format, premium });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = format === "jpeg" ? "jpg" : format;
      const filename = `${settings.deviceSlug}-${maxEdge}px.${ext}`;
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      flash(`✓ Saved ${filename} to your downloads`);
      try {
        if (rememberExport) localStorage.setItem("ef-export-prefs", JSON.stringify({ format, quality, resolution }));
        else localStorage.removeItem("ef-export-prefs");
      } catch { /* ignore */ }
      setExportOpen(false);
      setExportMenuOpen(false);
    } catch {
      flash("Export failed — the image may be too large. Try a smaller size.");
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
      className={`ed ${theme === "light" ? "ed-light" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(e) => { e.preventDefault(); setDropActive(false); onFiles(e.dataTransfer.files); }}
    >
      <header className="ed-top">
        <a className="ed-brand" href="/">
          <span className="ed-logo" aria-hidden="true"><i /></span>
          <span className="ed-brand-name">EasyFrame</span>
          <span className="ed-brand-tag">Editor</span>
        </a>
        <div className="ed-top-actions">
          <button
            className="ed-icon-btn ed-theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Light theme" : "Dark theme"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="ed-btn-group">
            <button className="ed-icon-btn" onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
            <button className="ed-icon-btn" onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
          </div>
          <button className="ed-ghost" onClick={resetAll} aria-label="Reset all"><RotateCcw size={15} /> Reset</button>
          <div className="ed-dl-split">
            <button className="ed-primary ed-dl-main" onClick={() => setExportOpen(true)} disabled={busy}>
              <Download size={16} /> {busy ? "Working…" : "Download"}
            </button>
            <button className="ed-primary ed-dl-caret" onClick={() => setExportMenuOpen((o) => !o)} disabled={busy} aria-label="Export options" aria-expanded={exportMenuOpen}>
              <ChevronDown size={15} />
            </button>
            {exportMenuOpen ? (
              <div className="ed-dl-menu" role="menu">
                <div className="ed-dl-menu-title">Export settings</div>
                {renderExportControls()}
                <button className="ed-primary ed-dl-menu-go" onClick={() => onDownload()} disabled={busy}>
                  <Download size={15} /> {busy ? "Working…" : outDims ? `Download ${outDims.w}×${outDims.h}` : "Download"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="ed-body">
        {/* Left rail: devices */}
        <aside className="ed-rail ed-rail-left" aria-label="Devices">
          <section className="ed-card">
            <div className="ed-card-title">Device</div>
            <div className="ed-device-groups">
            {DEVICE_GROUPS.map((group) => {
              const list = editorDevices.filter((d) => d.category === group.key);
              if (!list.length) return null;
              return (
                <div className="ed-group" key={group.key} role="group" aria-label={group.label}>
                  <span className="ed-group-label">{group.label}</span>
                  <div className="ed-device-grid">
                    {list.map((d) => {
                      const Icon = KIND_ICON[d.kind];
                      return (
                        <button
                          key={d.slug}
                          className={`ed-device ${settings.deviceSlug === d.slug ? "on" : ""}`}
                          aria-label={`Select ${d.name} frame`}
                          aria-pressed={settings.deviceSlug === d.slug}
                          onClick={() => update({ deviceSlug: d.slug })}
                          title={d.name}
                        >
                          <Icon size={17} strokeWidth={1.75} />
                          <span>{d.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          </section>

          <section className="ed-card">
            <div className="ed-card-title">Image</div>
            <button className="ed-upload" onClick={() => fileRef.current?.click()}>
              <ImagePlus size={16} /> Choose image
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ""; }} />
            <div className="ed-url">
              <input value={urlValue} onChange={(e) => setUrlValue(e.target.value)} placeholder="Paste image URL" />
              <button onClick={() => { if (urlValue.trim()) void ingest(urlValue.trim()); }}>Add</button>
            </div>
            <p className="ed-hint">or drag &amp; drop / paste from clipboard</p>
            {hasImage ? (
              <button className="ed-remove" onClick={() => setImage(null)}>
                <Trash2 size={14} /> Remove photo
              </button>
            ) : null}
          </section>

          <section className="ed-card">
            <div className="ed-card-title"><Layers size={12} style={{ marginRight: -2 }} /> Layers</div>
            <div className="ed-layer-add">
              <button onClick={addText}><Type size={14} /> Text</button>
              <button onClick={() => overlayFileRef.current?.click()}><ImagePlus size={14} /> Image</button>
            </div>
            <input ref={overlayFileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void addImageOverlay(e.target.files?.[0]); e.currentTarget.value = ""; }} />
            <div className="ed-layers">
              {[...overlays].reverse().map((o) => (
                <div key={o.id} className={`ed-layer ${selectedId === o.id ? "on" : ""}`}>
                  <button className="ed-layer-main" onClick={() => setSelectedId(o.id)}>
                    {o.type === "text" ? <Type size={13} /> : <ImageIcon size={13} />}
                    <span>{o.type === "text" ? (o.text.split("\n")[0] || "Text") : "Image"}</span>
                  </button>
                  <button className="ed-layer-ic" onClick={() => updateOverlay(o.id, { hidden: !o.hidden })} aria-label="Toggle visibility">{o.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                  <button className="ed-layer-ic" onClick={() => moveOverlay(o.id, 1)} aria-label="Bring forward"><ChevronUp size={13} /></button>
                  <button className="ed-layer-ic" onClick={() => moveOverlay(o.id, -1)} aria-label="Send back"><ChevronDown size={13} /></button>
                  <button className="ed-layer-ic danger" onClick={() => removeOverlay(o.id)} aria-label="Delete layer"><X size={13} /></button>
                </div>
              ))}
              <button className={`ed-layer ed-layer-base ${selectedId === null ? "on" : ""}`} onClick={() => setSelectedId(null)}>
                <span className="ed-layer-main"><Smartphone size={13} /> <span>Device screenshot</span></span>
              </button>
            </div>
            {!overlays.length ? <p className="ed-hint">Add text or images as layers, then drag them on the canvas.</p> : null}
          </section>
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
            <>
              <button className="ed-drop" onClick={() => fileRef.current?.click()}>
                <span className="ed-drop-ic"><Upload size={22} /></span>
                <strong>Drop a screenshot to start</strong>
                <span>or <b>browse files</b> · PNG, JPEG or WebP</span>
              </button>
              <p className="ed-privacy-note">Nothing is uploaded — everything stays in your browser.</p>
            </>
          ) : null}
          {dropActive ? (
            <div className="ed-dragmask"><Upload size={28} /><strong>Drop to place</strong></div>
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
          {selectedOverlay ? (
            <section className="ed-card">
              <div className="ed-card-title">{selectedOverlay.type === "text" ? "Text layer" : "Image layer"}</div>
              {selectedOverlay.type === "text" ? (
                <>
                  <textarea className="ed-textarea" rows={2} value={selectedOverlay.text} onChange={(e) => updateOverlay(selectedOverlay.id, { text: e.target.value })} placeholder="Type your text…" />
                  <select className="ed-select" value={selectedOverlay.fontFamily} onChange={(e) => { updateOverlay(selectedOverlay.id, { fontFamily: e.target.value }); ensureFont(e.target.value); }}>
                    {TRENDING_FONTS.map((f) => <option key={f.family} value={f.family}>{f.label}</option>)}
                  </select>
                  <div className="ed-row2">
                    <select className="ed-select" value={selectedOverlay.fontWeight} onChange={(e) => updateOverlay(selectedOverlay.id, { fontWeight: Number(e.target.value) })}>
                      {weightsFor(selectedOverlay.fontFamily).map((w) => <option key={w} value={w}>{w === 400 ? "Regular" : w === 500 ? "Medium" : w === 600 ? "Semibold" : w === 700 ? "Bold" : "Black"}</option>)}
                    </select>
                    <input type="color" className="ed-color" value={selectedOverlay.color} onChange={(e) => updateOverlay(selectedOverlay.id, { color: e.target.value })} aria-label="Text color" />
                  </div>
                  <div className="ed-seg">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button key={a} className={selectedOverlay.align === a ? "on" : ""} onClick={() => updateOverlay(selectedOverlay.id, { align: a })}>{a[0].toUpperCase() + a.slice(1)}</button>
                    ))}
                  </div>
                  <Range label="Size" value={selectedOverlay.fontSize} min={0.02} max={0.22} step={0.005} onChange={(v) => updateOverlay(selectedOverlay.id, { fontSize: v })} />
                </>
              ) : (
                <Range label="Scale" value={selectedOverlay.scale} min={0.1} max={2} step={0.02} onChange={(v) => updateOverlay(selectedOverlay.id, { scale: v })} />
              )}
              <Range label="Rotation" value={selectedOverlay.rotation} min={-180} max={180} step={1} onChange={(v) => updateOverlay(selectedOverlay.id, { rotation: v })} />
              <Range label="Opacity" value={selectedOverlay.opacity} min={0} max={1} step={0.02} onChange={(v) => updateOverlay(selectedOverlay.id, { opacity: v })} />
              <button className="ed-remove" onClick={() => removeOverlay(selectedOverlay.id)}><Trash2 size={14} /> Delete layer</button>
            </section>
          ) : null}

          <section className="ed-card">
          <div className="ed-card-title">Background</div>
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
            <button
              className={`ed-swatch ed-swatch-alpha ${bg.type === "transparent" ? "on" : ""}`}
              aria-label="Transparent background (Premium)"
              title={premium ? "Transparent background" : "Transparent background — Premium"}
              onClick={() => {
                if (premium) update({ background: { type: "transparent" } });
                else flash("Transparent backgrounds are a Premium feature.");
              }}
            >
              {!premium ? <span className="ed-pro">PRO</span> : null}
            </button>
            <button
              className={`ed-swatch ed-swatch-img ${bg.type === "image" ? "on" : ""}`}
              aria-label="Custom background image (Premium)"
              title={premium ? "Upload a background image" : "Custom background image — Premium"}
              onClick={() => { if (premium) bgFileRef.current?.click(); else flash("Custom background images are a Premium feature."); }}
            >
              <ImageIcon size={15} />
              {!premium ? <span className="ed-pro">PRO</span> : null}
            </button>
          </div>
          <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => { onBgImage(e.target.files); e.currentTarget.value = ""; }} />
          <div className="ed-subhead">
            Custom gradient
            <button
              className={`ed-grad-toggle ${customBg.threeStop ? "on" : ""}`}
              onClick={() => applyCustomGrad({ threeStop: !customBg.threeStop })}
              title="Add a middle color for a smoother 3-stop gradient"
            >
              {customBg.threeStop ? "3-stop" : "2-stop"}
            </button>
          </div>
          <div className="ed-grad-preview" style={{ background: `linear-gradient(${customBg.angle}deg, ${customBg.from}${customBg.threeStop ? `, ${customBg.via}` : ""}, ${customBg.to})` }} />
          <div className="ed-grad-stops">
            <label className="ed-grad-stop">
              <input type="color" value={customBg.from} onChange={(e) => applyCustomGrad({ from: e.target.value })} aria-label="Gradient start color" />
              <span>Start</span>
              <b>{customBg.from.toUpperCase()}</b>
            </label>
            {customBg.threeStop ? (
              <label className="ed-grad-stop">
                <input type="color" value={customBg.via} onChange={(e) => applyCustomGrad({ via: e.target.value })} aria-label="Gradient middle color" />
                <span>Middle</span>
                <b>{customBg.via.toUpperCase()}</b>
              </label>
            ) : null}
            <label className="ed-grad-stop">
              <input type="color" value={customBg.to} onChange={(e) => applyCustomGrad({ to: e.target.value })} aria-label="Gradient end color" />
              <span>End</span>
              <b>{customBg.to.toUpperCase()}</b>
            </label>
          </div>
          <Range label="Angle" value={customBg.angle} min={0} max={360} step={1} onChange={(v) => applyCustomGrad({ angle: v })} />
          </section>

          <section className="ed-card">
          <div className="ed-card-title">Adjust</div>
          <Range label="Padding" value={settings.padding} min={0} max={0.4} step={0.01} onChange={(v) => update({ padding: v })} />
          <Range label="Image scale" value={settings.imageScale} min={0.4} max={2.5} step={0.01} onChange={(v) => update({ imageScale: v })} />
          <Range label="Rotate" value={settings.imageRotate} min={-45} max={45} step={1} onChange={(v) => update({ imageRotate: v })} />
          <Range label="Shadow" value={settings.shadow} min={0} max={1} step={0.02} onChange={(v) => update({ shadow: v })} />
          <Range label="Corner radius" value={settings.cornerRadius} min={0} max={0.3} step={0.01} onChange={(v) => update({ cornerRadius: v })} />
          <div className="ed-seg">
            <button className={settings.fit === "cover" ? "on" : ""} onClick={() => update({ fit: "cover" })}>Cover</button>
            <button className={settings.fit === "contain" ? "on" : ""} onClick={() => update({ fit: "contain" })}>Contain</button>
          </div>
          </section>

          <section className="ed-card">
          <div className="ed-card-title">3D angle</div>
          <div className="ed-angles">
            {ANGLE_PRESETS.map((p) => {
              const active = settings.rotateX === p.x && settings.rotateY === p.y && settings.rotateZ === p.z;
              return (
                <button key={p.id} className={`ed-angle ${active ? "on" : ""}`} onClick={() => update({ rotateX: p.x, rotateY: p.y, rotateZ: p.z, perspective: p.p })}>
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="ed-hint" style={{ margin: "2px 0 4px" }}>Pick an angle, then fine-tune. Perspective adds depth to a tilted view.</p>
          <Range label="Tilt (X)" value={settings.rotateX} min={-50} max={50} step={1} onChange={(v) => update({ rotateX: v })} />
          <Range label="Turn (Y)" value={settings.rotateY} min={-50} max={50} step={1} onChange={(v) => update({ rotateY: v })} />
          <Range label="Roll (Z)" value={settings.rotateZ} min={-45} max={45} step={1} onChange={(v) => update({ rotateZ: v })} />
          <Range label="Perspective" value={settings.perspective} min={0} max={100} step={1} onChange={(v) => update({ perspective: v })} />
          <button className="ed-reset-flat" onClick={() => update({ rotateX: 0, rotateY: 0, rotateZ: 0 })}>Reset to flat</button>
          </section>

          <section className="ed-card">
          <div className="ed-card-title">Export</div>
          <button className="ed-upload" onClick={() => setExportOpen(true)}><Download size={15} /> Export options</button>
          <p className="ed-hint">
            Choose size, format &amp; quality in the <b>Download</b> menu (top-right).{" "}
            {!premium ? <a href="/pricing" style={{ color: "var(--acc)" }}>4K &amp; transparent are Premium →</a> : "Premium unlocks 4K & transparent PNGs."}
          </p>
          </section>
        </aside>
      </div>

      {exportOpen ? (
        <div className="ed-modal-backdrop" onClick={() => setExportOpen(false)}>
          <div className="ed-modal" role="dialog" aria-modal="true" aria-label="Export mockup" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-head">
              <h2>Export mockup</h2>
              <button className="ed-icon-btn" onClick={() => setExportOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="ed-modal-body">
              {renderExportControls()}
              <p className="ed-hint">
                {premium ? "Premium: up to 4K (3840px) + transparent backgrounds." : <>Free up to {FREE_MAX_EDGE}px · <a href="/pricing" style={{ color: "var(--acc)" }}>4K &amp; transparent are Premium →</a></>}
              </p>
            </div>
            <div className="ed-modal-actions">
              <button className="ed-ghost" onClick={() => setExportOpen(false)}>Cancel</button>
              <button className="ed-primary" onClick={() => onDownload()} disabled={busy}>
                <Download size={16} /> {busy ? "Working…" : "Download"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <EditorStyles />
    </div>
  );
}

function Range({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <label className="ed-range">
      <span>{label}<b>{Number.isInteger(value) ? value : value.toFixed(2)}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, var(--acc) 0 ${pct}%, rgba(255,255,255,.12) ${pct}% 100%)` }}
      />
    </label>
  );
}

function EditorStyles() {
  return (
    <style jsx global>{`
      .ed { --acc: #6E41E2; --acc2: #8B5CF6; --bg: #0b0d0f; --line: rgba(255,255,255,.11); --line-2: rgba(255,255,255,.20); --text: #f4f5f7; --muted: #9ca0a6; --card: rgba(255,255,255,.022);
        position: fixed; top: 0; left: 0; right: 0; bottom: var(--cc-h, 0); display: flex; flex-direction: column; color: var(--text);
        background: radial-gradient(1200px 700px at 82% -20%, rgba(110,65,226,.08), transparent 60%), var(--bg);
        font-family: "Geist", Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      /* Standalone theme toggle button gets its own border (not in a group). */
      .ed-theme-toggle { border: 1px solid var(--line); border-radius: 10px; }

      /* ---- Light theme ---- */
      .ed.ed-light { --bg: #f4f5f7; --line: rgba(15,18,25,.10); --line-2: rgba(15,18,25,.18); --text: #16181d; --muted: #6b7280; --card: #ffffff;
        background: radial-gradient(1200px 700px at 82% -20%, rgba(110,65,226,.06), transparent 60%), var(--bg); }
      .ed-light .ed-top { background: rgba(255,255,255,.82); }
      .ed-light .ed-btn-group { background: #fff; }
      .ed-light .ed-icon-btn:hover:not(:disabled) { background: rgba(15,18,25,.05); }
      .ed-light .ed-ghost { background: #fff; }
      .ed-light .ed-ghost:hover:not(:disabled) { background: rgba(15,18,25,.04); }
      .ed-light .ed-card { background: #fff; box-shadow: 0 1px 2px rgba(15,18,25,.05); }
      .ed-light .ed-rail-left, .ed-light .ed-rail-right { background: #fafbfc; }
      .ed-light .ed-rail::-webkit-scrollbar-thumb { background: rgba(15,18,25,.16); }
      .ed-light .ed-device { background: #fff; }
      .ed-light .ed-device:hover { background: #f4f2fb; }
      .ed-light .ed-url, .ed-light .ed-zoom, .ed-light .ed-range, .ed-light .ed-angle, .ed-light .ed-reset-flat, .ed-light .ed-layer { background: #fff; }
      .ed-light .ed-seg { background: rgba(15,18,25,.05); }
      .ed-light .ed-textarea, .ed-light .ed-select, .ed-light .ed-color { background: #fff; }
      .ed-light .ed-range { border: 1px solid var(--line); }
      .ed-light .ed-stage { background: #eceef2; }
      .ed-light .ed-canvas-wrap { filter: drop-shadow(0 20px 45px rgba(15,18,25,.22)); }

      /* Accent-consistent control fills (both themes, site purple) */
      .ed-seg button.on { background: var(--acc); box-shadow: 0 2px 8px rgba(110,65,226,.4); }
      .ed-layer-add button { background: rgba(110,65,226,.1); border-color: rgba(110,65,226,.3); color: var(--acc); }
      .ed-layer-add button:hover { background: rgba(110,65,226,.16); }
      .ed-drop:hover, .ed-drop.active { background: rgba(110,65,226,.09); }
      .ed-light .ed-layer-add button { color: #5a2fc0; }

      /* Accessibility + mobile layout */
      .ed-sr { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      @media (max-width: 820px) {
        .ed-top { flex-wrap: wrap; height: auto; min-height: 56px; padding: 8px 12px; gap: 8px; }
        .ed-top-actions { flex-wrap: wrap; justify-content: flex-end; }
        .ed-body { grid-template-columns: 1fr; grid-auto-rows: min-content; overflow-y: auto; }
        .ed-rail-left, .ed-rail-right { border-left: 0; border-right: 0; border-top: 1px solid var(--line); }
        .ed-stage { min-height: 56vh; }
      }
      @media (max-width: 420px) {
        .ed-brand-tag { display: none; }
        .ed-ghost span, .ed-primary { font-size: 12.5px; }
      }

      .ed-top { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 16px; border-bottom: 1px solid var(--line); background: rgba(12,14,18,.72); backdrop-filter: blur(12px); }
      .ed-brand { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; color: var(--text); }
      .ed-logo { width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(135deg, var(--acc), var(--acc2)); display: grid; place-items: center; box-shadow: 0 4px 14px rgba(110,65,226,.4); }
      .ed-logo i { width: 12px; height: 12px; border-radius: 3px; border: 2px solid rgba(255,255,255,.92); }
      .ed-brand-name { font-weight: 700; font-size: 15px; letter-spacing: -.02em; }
      .ed-brand-tag { font-size: 9.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--muted); border: 1px solid var(--line-2); padding: 2px 7px; border-radius: 999px; }
      .ed-top-actions { display: flex; align-items: center; gap: 8px; }
      .ed-btn-group { display: inline-flex; border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.03); }
      .ed-icon-btn { width: 34px; height: 34px; display: grid; place-items: center; background: transparent; border: 0; color: var(--muted); cursor: pointer; transition: background .12s, color .12s; }
      .ed-icon-btn + .ed-icon-btn { border-left: 1px solid var(--line); }
      .ed-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,.06); color: var(--text); }
      .ed-icon-btn:disabled { opacity: .35; cursor: default; }
      .ed-ghost, .ed-primary { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px; border-radius: 10px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: transform .12s, box-shadow .12s, background .12s, border-color .12s; }
      .ed-ghost { background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--text); }
      .ed-ghost:hover:not(:disabled) { background: rgba(255,255,255,.08); border-color: var(--line-2); }
      .ed-ghost:disabled { opacity: .4; cursor: default; }
      .ed-primary { background: linear-gradient(135deg, var(--acc), var(--acc2)); border: 0; color: #fff; padding: 0 18px; box-shadow: 0 6px 18px rgba(110,65,226,.35); }
      .ed-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(110,65,226,.5); }
      .ed-primary:disabled { opacity: .6; }

      .ed-body { flex: 1; display: grid; grid-template-columns: 250px minmax(0,1fr) 292px; min-height: 0; }
      .ed-rail { padding: 14px 14px 28px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
      .ed-rail-left { border-right: 1px solid var(--line); }
      .ed-rail-right { border-left: 1px solid var(--line); }
      .ed-rail::-webkit-scrollbar { width: 8px; }
      .ed-rail::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 999px; }
      .ed-rail::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,.18); }
      .ed-rail::-webkit-scrollbar-track { background: transparent; }

      .ed-card { border: 1px solid var(--line); border-radius: 14px; background: var(--card); padding: 16px; display: flex; flex-direction: column; gap: 12px; transition: border-color .18s ease; }
      .ed-card:hover { border-color: var(--line-2); }
      .ed-card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #b7bcc4; display: flex; align-items: center; gap: 7px; }
      .ed-light .ed-card-title { color: #565d67; }
      .ed-device { transition: border-color .16s ease, background .16s ease, transform .16s ease; }
      .ed-device:hover { transform: translateY(-1px); }
      .ed-card-title::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 8px rgba(110,65,226,.8); }

      .ed-device-groups { display: flex; flex-direction: column; gap: 13px; }
      .ed-group { display: flex; flex-direction: column; gap: 7px; }
      .ed-group-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; color: var(--muted); }
      .ed input::placeholder { color: #8b8f96; }
      .ed-light .ed input::placeholder { color: #8a909a; }
      .ed-device-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .ed-device { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 58px; padding: 9px 6px; border-radius: 10px; background: rgba(255,255,255,.03); border: 1px solid var(--line); color: var(--text); font: inherit; cursor: pointer; text-align: center; transition: border-color .14s, background .14s, transform .14s; }
      .ed-device svg { color: var(--muted); transition: color .14s; }
      .ed-device span { font-size: 10.5px; line-height: 1.15; letter-spacing: -.01em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .ed-device:hover { border-color: var(--line-2); background: rgba(255,255,255,.06); transform: translateY(-1px); }
      .ed-device.on { border-color: var(--acc) !important; background: rgba(110,65,226,.15) !important; box-shadow: 0 0 0 1px var(--acc) inset; }
      .ed-device.on svg { color: #7db1ff !important; }

      .ed-upload { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; border-radius: 10px; background: rgba(110,65,226,.1); border: 1px solid rgba(110,65,226,.3); color: #e3d9ff; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .12s; }
      .ed-upload:hover { background: rgba(110,65,226,.16); }
      .ed-url { display: flex; gap: 6px; }
      .ed-url input { flex: 1; min-width: 0; height: 36px; padding: 0 11px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; }
      .ed-url input:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(110,65,226,.2); }
      .ed-url button { height: 36px; padding: 0 13px; border-radius: 9px; background: rgba(255,255,255,.06); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-url button:hover { background: rgba(255,255,255,.1); }
      .ed-hint { font-size: 11px; color: var(--muted); line-height: 1.5; margin: 0; }
      .ed-hint a { color: var(--acc); }

      .ed-stage { position: relative; display: grid; place-items: center; padding: 32px; overflow: hidden;
        background:
          radial-gradient(1100px 560px at 50% -10%, rgba(255,255,255,.035), transparent 62%),
          radial-gradient(circle at center, rgba(255,255,255,.028) 1px, transparent 1px);
        background-size: auto, 24px 24px; }
      .ed-canvas-wrap { max-width: 100%; max-height: 100%; transition: transform .12s ease; filter: drop-shadow(0 28px 55px rgba(0,0,0,.5)); }
      .ed-canvas { max-width: 100%; max-height: calc(100vh - 150px); display: block; border-radius: 6px; touch-action: none; cursor: grab; }
      .ed-canvas:active { cursor: grabbing; }
      /* Compact empty-state prompt — floats near the bottom so the device preview stays visible. */
      .ed-drop { position: absolute; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 4;
        display: flex; flex-direction: column; align-items: center; gap: 9px; width: min(340px, 80%); padding: 20px 24px;
        border: 1.5px dashed rgba(255,255,255,.24); border-radius: 18px; background: rgba(12,16,20,0.82); backdrop-filter: blur(8px); color: #ffffff; cursor: pointer;
        box-shadow: 0 18px 50px rgba(0,0,0,.55); transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease; }
      .ed-privacy-note { position: absolute; left: 50%; bottom: 6px; transform: translateX(-50%); margin: 0; font-size: 11px; color: rgba(255,255,255,.4); white-space: nowrap; pointer-events: none; }
      .ed-light .ed-privacy-note { color: rgba(15,18,25,.42); }
      .ed-drop:hover { border-color: var(--acc); transform: translateX(-50%) translateY(-2px); box-shadow: 0 24px 60px rgba(0,0,0,.6); }
      .ed-drop-ic { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; color: #c9b4ff; background: rgba(110,65,226,.2); }
      .ed-drop svg { color: #c9b4ff; }
      .ed-drop strong { font-size: 18px; font-weight: 650; color: #ffffff; letter-spacing: -.01em; }
      .ed-drop span { font-size: 12px; color: #bec3c9; text-align: center; line-height: 1.5; }
      .ed-drop span b { color: #b898ff; text-decoration: underline; font-weight: 700; }
      .ed-light .ed-drop { background: rgba(255,255,255,.94); border-color: rgba(15,18,25,.12); box-shadow: 0 18px 44px rgba(15,18,25,.14); color: #16181d; }
      .ed-light .ed-drop strong { color: #16181d; }
      .ed-light .ed-drop span { color: #4B617A; }
      .ed-light .ed-drop span b { color: #6E41E2; }
      .ed-light .ed-drop-ic, .ed-light .ed-drop svg { color: #6E41E2; }
      /* Full-stage drop target — only while a file is being dragged over the editor. */
      .ed-dragmask { position: absolute; inset: 14px; z-index: 6; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
        border: 2px dashed var(--acc); border-radius: 20px; background: rgba(110,65,226,.10); backdrop-filter: blur(2px); color: var(--text); pointer-events: none; }
      .ed-dragmask svg { color: var(--acc); }
      .ed-dragmask strong { font-size: 16px; font-weight: 650; }
      .ed-zoom { position: absolute; bottom: 18px; right: 18px; display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 999px; background: rgba(18,21,26,.85); border: 1px solid var(--line); backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,.4); }
      .ed-zoom button { width: 26px; height: 26px; border-radius: 7px; background: rgba(255,255,255,.06); border: 0; color: var(--text); font: inherit; font-size: 15px; cursor: pointer; display: grid; place-items: center; }
      .ed-zoom button:hover { background: rgba(255,255,255,.12); }
      .ed-zoom b { font-size: 12px; min-width: 42px; text-align: center; font-variant-numeric: tabular-nums; }
      .ed-toast { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); padding: 10px 16px; border-radius: 12px; background: #1c1f24; border: 1px solid var(--line-2); font-size: 13px; box-shadow: 0 16px 40px rgba(0,0,0,.5); }

      .ed-swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .ed-swatch { aspect-ratio: 1; border-radius: 9px; border: 1px solid var(--line); cursor: pointer; transition: transform .12s; }
      .ed-swatch:hover { transform: scale(1.06); }
      .ed-swatch.on { outline: 2px solid var(--acc); outline-offset: 2px; }
      .ed-swatch-alpha { position: relative; background-color: #fff; background-image: linear-gradient(45deg,#bbb 25%,transparent 25%),linear-gradient(-45deg,#bbb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#bbb 75%),linear-gradient(-45deg,transparent 75%,#bbb 75%); background-size: 12px 12px; background-position: 0 0,0 6px,6px -6px,-6px 0; }
      .ed-pro { position: absolute; inset: 0; display: grid; place-items: center; font-size: 8.5px; font-weight: 800; color: #111; background: rgba(255,255,255,.6); border-radius: 8px; }

      .ed-range { display: flex; flex-direction: column; gap: 7px; }
      .ed-range span { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); }
      .ed-range b { color: var(--text); font-variant-numeric: tabular-nums; font-size: 11px; font-weight: 600; background: rgba(255,255,255,.06); padding: 1px 7px; border-radius: 6px; }
      .ed-range input { width: 100%; height: 5px; border-radius: 999px; -webkit-appearance: none; appearance: none; background: rgba(255,255,255,.12); cursor: pointer; }
      .ed-range input::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(110,65,226,.28), 0 1px 4px rgba(0,0,0,.4); transition: box-shadow .12s; }
      .ed-range input::-webkit-slider-thumb:hover { box-shadow: 0 0 0 6px rgba(110,65,226,.34), 0 1px 4px rgba(0,0,0,.4); }
      .ed-range input::-moz-range-thumb { width: 16px; height: 16px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(110,65,226,.28); }

      .ed-seg { display: flex; gap: 4px; padding: 3px; background: rgba(0,0,0,.25); border: 1px solid var(--line); border-radius: 10px; }
      .ed-seg button { flex: 1; height: 30px; border-radius: 7px; background: transparent; border: 0; color: var(--muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .12s, color .12s; }
      .ed-seg button:hover { color: var(--text); }
      .ed-seg button.on { background: rgba(110,65,226,.92); color: #fff; box-shadow: 0 2px 8px rgba(110,65,226,.4); }

      .ed-angles { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
      .ed-angle { height: 32px; border-radius: 8px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 11px; font-weight: 500; cursor: pointer; transition: border-color .12s, background .12s; }
      .ed-angle:hover { border-color: var(--line-2); background: rgba(255,255,255,.07); }
      .ed-angle.on { border-color: var(--acc); background: rgba(110,65,226,.16); color: #e3d9ff; }
      .ed-reset-flat { width: 100%; height: 34px; margin-top: 2px; border-radius: 9px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-reset-flat:hover { color: var(--text); border-color: var(--line-2); }

      .ed-remove { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 34px; border-radius: 9px; background: rgba(255,80,90,.08); border: 1px solid rgba(255,80,90,.28); color: #ff9aa2; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-remove:hover { background: rgba(255,80,90,.14); }
      .ed-layer-add { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .ed-layer-add button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; border-radius: 9px; background: rgba(110,65,226,.1); border: 1px solid rgba(110,65,226,.3); color: #e3d9ff; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-layer-add button:hover { background: rgba(110,65,226,.16); }
      .ed-layers { display: flex; flex-direction: column; gap: 5px; }
      .ed-layer { display: flex; align-items: center; gap: 2px; padding: 3px; border-radius: 9px; border: 1px solid transparent; background: rgba(255,255,255,.03); }
      .ed-layer.on { border-color: var(--acc); background: rgba(110,65,226,.12); }
      .ed-layer-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; background: transparent; border: 0; color: var(--text); font: inherit; font-size: 12px; cursor: pointer; padding: 5px 4px; text-align: left; }
      .ed-layer-main svg { color: var(--muted); flex-shrink: 0; }
      .ed-layer-main span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ed-layer-ic { width: 24px; height: 26px; display: grid; place-items: center; background: transparent; border: 0; color: var(--muted); cursor: pointer; border-radius: 6px; }
      .ed-layer-ic:hover { background: rgba(255,255,255,.08); color: var(--text); }
      .ed-layer-ic.danger:hover { color: #ff9aa2; }
      .ed-layer-base { width: 100%; cursor: pointer; }
      .ed-textarea { width: 100%; resize: vertical; min-height: 48px; padding: 8px 10px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 13px; }
      .ed-textarea:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(110,65,226,.2); }
      .ed-select { width: 100%; height: 36px; padding: 0 10px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
      .ed-select:focus { outline: none; border-color: var(--acc); }
      .ed-row2 { display: grid; grid-template-columns: 1fr 46px; gap: 6px; }
      .ed-color { width: 46px; height: 36px; padding: 2px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); cursor: pointer; }
      .ed-subhead { display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; color: var(--muted); margin-top: 2px; }
      .ed-custom-grad { display: grid; grid-template-columns: 1fr 42px 42px; gap: 8px; align-items: center; }
      .ed-custom-grad .ed-color { width: 100%; height: 40px; }
      .ed-grad-preview { height: 40px; border-radius: 9px; border: 1px solid var(--line); margin-top: 8px; }
      .ed-grad-stops { display: flex; gap: 8px; margin-top: 10px; }
      .ed-grad-stop { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 8px 4px 7px; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.02); cursor: pointer; transition: border-color .15s ease; }
      .ed-grad-stop:hover { border-color: var(--line-2); }
      .ed-grad-stop input { width: 100%; height: 26px; padding: 0; border: 0; border-radius: 6px; background: transparent; cursor: pointer; }
      .ed-grad-stop span { font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); }
      .ed-grad-stop b { font-size: 10px; font-variant-numeric: tabular-nums; color: var(--text); font-weight: 600; }
      .ed-light .ed-grad-stop { background: #fff; }
      .ed-grad-toggle { padding: 3px 9px; border-radius: 999px; border: 1px solid var(--line-2); background: transparent; color: var(--muted); font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; text-transform: none; letter-spacing: 0; }
      .ed-grad-toggle.on { color: #fff; background: var(--acc); border-color: transparent; }
      .ed-swatch-img { position: relative; display: grid; place-items: center; color: var(--muted); background: rgba(255,255,255,.04); }
      .ed-res-btn { position: relative; }
      .ed-res-btn .ed-pro { position: absolute; top: 2px; right: 3px; inset: auto; width: auto; height: auto; padding: 1px 4px; font-size: 7.5px; border-radius: 5px; }
      .ed-dims { margin: 8px 0 2px; font-size: 12px; font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; }
      /* Split Download button + dropdown */
      .ed-dl-split { position: relative; display: inline-flex; }
      .ed-dl-main { border-radius: 10px 0 0 10px; padding: 0 12px 0 16px; box-shadow: none; }
      .ed-dl-caret { border-radius: 0 10px 10px 0; padding: 0 8px; border-left: 1px solid rgba(255,255,255,.28); box-shadow: none; }
      .ed-dl-split .ed-primary:hover:not(:disabled) { transform: none; box-shadow: 0 8px 22px rgba(110,65,226,.45); }
      .ed-dl-menu { position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; width: 264px; padding: 14px; border-radius: 14px; background: #16181c; border: 1px solid var(--line-2); box-shadow: 0 24px 60px rgba(0,0,0,.6); display: flex; flex-direction: column; gap: 10px; text-align: left; }
      .ed-dl-menu-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #b7bcc4; }
      .ed-dl-menu-go { justify-content: center; margin-top: 4px; padding: 0 16px; height: 38px; }
      .ed-remember { display: flex; align-items: center; gap: 9px; font-size: 12.5px; color: var(--text); cursor: pointer; margin-top: 2px; line-height: 1.35; }
      .ed-remember input { width: 16px; height: 16px; accent-color: var(--acc); cursor: pointer; flex: none; }
      /* Export dialog */
      .ed-modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; background: rgba(0,0,0,.55); backdrop-filter: blur(3px); padding: 20px; }
      .ed-modal { width: min(420px, 100%); max-height: 88vh; overflow-y: auto; border-radius: 18px; background: #16181c; border: 1px solid var(--line-2); box-shadow: 0 40px 100px rgba(0,0,0,.65); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
      .ed-modal-head { display: flex; align-items: center; justify-content: space-between; }
      .ed-modal-head h2 { margin: 0; font-size: 18px; font-weight: 650; letter-spacing: -.01em; }
      .ed-modal-body { display: flex; flex-direction: column; gap: 12px; }
      .ed-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
      .ed-modal-actions .ed-primary { height: 40px; padding: 0 22px; }
      .ed-light .ed-dl-menu, .ed-light .ed-modal { background: #fff; }
      .ed :focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
      .ed :focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
      @media (max-width: 900px) {
        .ed-body { grid-template-columns: 1fr; grid-template-rows: auto minmax(0,1fr) auto; }
        .ed-rail { flex-direction: row; flex-wrap: wrap; border: 0; border-bottom: 1px solid var(--line); }
        .ed-card { flex: 1; min-width: 240px; }
        .ed-rail-right { border-top: 1px solid var(--line); }
      }
    `}</style>
  );
}
