"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AppWindow, ArrowLeftRight, ArrowUp, Check, ChevronDown, ChevronUp, CircleDot, Crop, Download, LayoutGrid, Eye, EyeOff, Image as ImageIcon, ImagePlus, Images, Laptop, Layers, Monitor, Moon, Move3d, Package, Plus, Redo2, RotateCcw, Smartphone, Sun, Tablet, Trash2, Type, Undo2, Upload, Watch, X } from "lucide-react";
import { deviceBySlug, editorDevices, type DeviceKind } from "@/lib/editor/devices";
import { BACKGROUND_PRESETS, backgroundCss, meshFromColors, paletteOf } from "@/lib/editor/backgrounds";
import CropOverlay, { CROP_ASPECTS, fitAspect } from "@/components/editor/CropOverlay";
import AccountLink from "@/components/auth/AccountLink";
import UpgradeStar from "@/components/auth/UpgradeStar";
import { COLLAGE_ASPECTS, COLLAGE_TEMPLATES, defaultCollage, exportCollage, hitCell, panPhoto, renderCollage, templateById, type CollagePhoto, type CollageState } from "@/lib/editor/collage";
import { CAROUSEL_ASPECTS, defaultCarousel, exportCarousel, renderCarousel, type CarouselState } from "@/lib/editor/carousel";
import { makeZip } from "@/lib/editor/zip";
import { blobToImage, getBlob, imageToBlob, pruneBlobs, putBlob } from "@/lib/editor/store";
import {
  canvasTarget,
  composite,
  defaultSettings,
  exportScene,
  loadImageSafely,
  type BackgroundSetting,
  type CropRect,
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
  { key: "browser", label: "Browser" }
];

// Decorative elements added as image overlays (dark-ink annotation look).
const EL_INK = "#1f2937";
const ELEMENTS: { id: string; label: string; svg: string }[] = [
  { id: "arrow", label: "Arrow", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 56"><path d="M6 28 H86 M66 11 L88 28 L66 45" fill="none" stroke="__C__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: "curve", label: "Curved arrow", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 84"><path d="M12 72 C12 26 46 14 84 24" fill="none" stroke="__C__" stroke-width="7" stroke-linecap="round"/><path d="M64 10 L88 22 L70 42" fill="none" stroke="__C__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: "circle", label: "Circle", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 92"><path d="M52 8 C86 8 94 38 86 56 C78 86 26 90 12 64 C0 42 16 10 52 8" fill="none" stroke="__C__" stroke-width="6" stroke-linecap="round"/></svg>` },
  { id: "underline", label: "Underline", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 28"><path d="M6 16 C30 6 42 24 60 13 C74 6 88 20 95 11" fill="none" stroke="__C__" stroke-width="6" stroke-linecap="round"/></svg>` },
  { id: "star", label: "Star", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 6 L62 37 L95 38 L69 59 L78 92 L50 72 L22 92 L31 59 L5 38 L38 37 Z" fill="__C__"/></svg>` },
  { id: "sparkle", label: "Sparkle", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 8 C53 40 60 47 92 50 C60 53 53 60 50 92 C47 60 40 53 8 50 C40 47 47 40 50 8 Z" fill="__C__"/></svg>` },
  { id: "cursor", label: "Cursor", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80"><path d="M8 6 L8 62 L22 48 L32 76 L43 71 L32 44 L52 44 Z" fill="__C__"/></svg>` },
  { id: "box", label: "Callout box", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"><rect x="5" y="5" width="90" height="60" rx="9" fill="none" stroke="__C__" stroke-width="5" stroke-dasharray="11 8"/></svg>` },
  { id: "arrow-double", label: "Double arrow", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 44"><path d="M22 8 L6 22 L22 36 M6 22 H94 M78 8 L94 22 L78 36" fill="none" stroke="__C__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: "chevron", label: "Chevron", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100"><path d="M14 12 L44 50 L14 88" fill="none" stroke="__C__" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: "check", label: "Check", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 84"><path d="M10 46 L38 72 L90 12" fill="none" stroke="__C__" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: "cross", label: "Cross", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 L80 80 M80 20 L20 80" fill="none" stroke="__C__" stroke-width="11" stroke-linecap="round"/></svg>` },
  { id: "plus", label: "Plus", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 14 V86 M14 50 H86" fill="none" stroke="__C__" stroke-width="11" stroke-linecap="round"/></svg>` },
  { id: "heart", label: "Heart", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 92"><path d="M50 86 C6 56 8 22 30 16 C44 12 50 24 50 30 C50 24 56 12 70 16 C92 22 94 56 50 86 Z" fill="__C__"/></svg>` },
  { id: "bolt", label: "Lightning", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 100"><path d="M44 6 L12 56 L34 56 L28 94 L60 40 L38 40 Z" fill="__C__"/></svg>` },
  { id: "bubble", label: "Speech bubble", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 88"><path d="M14 10 H86 A8 8 0 0 1 94 18 V56 A8 8 0 0 1 86 64 H44 L26 82 L28 64 H14 A8 8 0 0 1 6 56 V18 A8 8 0 0 1 14 10 Z" fill="none" stroke="__C__" stroke-width="6" stroke-linejoin="round"/></svg>` },
  { id: "pin", label: "Location pin", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 100"><path d="M34 94 C34 94 8 60 8 36 A26 26 0 0 1 60 36 C60 60 34 94 34 94 Z" fill="__C__"/><circle cx="34" cy="34" r="9" fill="#ffffff"/></svg>` },
  { id: "bang", label: "Exclamation", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100"><path d="M20 10 V64" fill="none" stroke="__C__" stroke-width="12" stroke-linecap="round"/><circle cx="20" cy="88" r="8" fill="__C__"/></svg>` },
  { id: "scribble", label: "Scribble", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><path d="M6 30 C18 6 26 6 34 24 C40 38 48 38 54 20 C60 4 70 6 76 26 C80 38 88 34 94 14" fill="none" stroke="__C__" stroke-width="6" stroke-linecap="round"/></svg>` },
  // Trending UI / social elements (SaaS showcase, posts, decks).
  { id: "menu", label: "Menu (3 lines)", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path d="M12 16 H88 M12 30 H88 M12 44 H88" fill="none" stroke="__C__" stroke-width="8" stroke-linecap="round"/></svg>` },
  { id: "lines2", label: "Text lines", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 44"><path d="M6 12 H94 M6 24 H94 M6 36 H64" fill="none" stroke="__C__" stroke-width="7" stroke-linecap="round"/></svg>` },
  { id: "ellipsis", label: "More (•••)", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 24"><circle cx="18" cy="12" r="8" fill="__C__"/><circle cx="50" cy="12" r="8" fill="__C__"/><circle cx="82" cy="12" r="8" fill="__C__"/></svg>` },
  { id: "divider", label: "Divider", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 12"><path d="M6 6 H114" fill="none" stroke="__C__" stroke-width="5" stroke-linecap="round"/></svg>` },
  { id: "dashed", label: "Dashed line", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 12"><path d="M6 6 H114" fill="none" stroke="__C__" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14"/></svg>` },
  { id: "progress", label: "Progress bar", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 20"><rect x="2" y="5" width="116" height="10" rx="5" fill="rgba(148,163,184,.35)"/><rect x="2" y="5" width="74" height="10" rx="5" fill="__C__"/></svg>` },
  { id: "toggle", label: "Toggle", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76 40"><rect x="2" y="2" width="72" height="36" rx="18" fill="__C__"/><circle cx="56" cy="20" r="14" fill="#ffffff"/></svg>` },
  { id: "stars5", label: "5 stars", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48"><g fill="__C__">${[0,1,2,3,4].map((i)=>`<path transform="translate(${i*48},0)" d="M24 4 L30 18 L45 19 L33 29 L37 44 L24 35 L11 44 L15 29 L3 19 L18 18 Z"/>`).join("")}</g></svg>` },
  { id: "quote", label: "Quote marks", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 72"><path d="M8 64 C8 40 20 20 42 12 L46 24 C34 30 28 40 28 48 L44 48 L44 64 Z M56 64 C56 40 68 20 90 12 L94 24 C82 30 76 40 76 48 L92 48 L92 64 Z" fill="__C__"/></svg>` },
  { id: "play", label: "Play button", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="__C__"/><path d="M40 32 L72 50 L40 68 Z" fill="#ffffff"/></svg>` },
  { id: "hashtag", label: "Hashtag", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M38 12 L30 88 M70 12 L62 88 M14 36 H86 M10 64 H82" fill="none" stroke="__C__" stroke-width="9" stroke-linecap="round"/></svg>` },
  { id: "mention", label: "Mention @", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="18" fill="none" stroke="__C__" stroke-width="8"/><path d="M68 50 C68 38 68 68 78 62 C90 55 90 20 62 12 C32 4 8 28 12 58 C16 86 46 96 72 84" fill="none" stroke="__C__" stroke-width="8" stroke-linecap="round"/></svg>` },
  { id: "bars", label: "Bar chart", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><g fill="__C__"><rect x="8" y="46" width="16" height="30" rx="4"/><rect x="34" y="30" width="16" height="46" rx="4"/><rect x="60" y="14" width="16" height="62" rx="4"/></g><rect x="8" y="20" width="16" height="0" fill="__C__"/></svg>` },
  { id: "trend", label: "Trend up", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 72"><path d="M8 60 L36 34 L52 46 L92 12" fill="none" stroke="__C__" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 12 H92 V34" fill="none" stroke="__C__" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: "dotgrid", label: "Dot grid", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><g fill="__C__">${[0,1,2].flatMap((r)=>[0,1,2].map((c)=>`<circle cx="${16+c*24}" cy="${16+r*24}" r="6"/>`)).join("")}</g></svg>` },
  { id: "tag", label: "Tag", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><path d="M6 30 L34 8 H88 A6 6 0 0 1 94 14 V46 A6 6 0 0 1 88 52 H34 Z" fill="none" stroke="__C__" stroke-width="6" stroke-linejoin="round"/><circle cx="30" cy="30" r="6" fill="__C__"/></svg>` },
  { id: "brackets", label: "Brackets", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M28 10 H14 A4 4 0 0 0 10 14 V66 A4 4 0 0 0 14 70 H28 M72 10 H86 A4 4 0 0 1 90 14 V66 A4 4 0 0 1 86 70 H72" fill="none" stroke="__C__" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>` }
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
  const [previewZoom, setPreviewZoom] = useState(0.8);
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [collapsed, setCollapsed] = useState<{ devices: boolean; elements: boolean; threeD: boolean }>({ devices: false, elements: false, threeD: false });
  const [dragRotate, setDragRotate] = useState(false);
  const [showAllBg, setShowAllBg] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [draftCrop, setDraftCrop] = useState<CropRect>({ x: 0, y: 0, w: 1, h: 1 });
  const [cropAspect, setCropAspect] = useState("free");
  // Collage mode
  const [mode, setMode] = useState<"mockup" | "collage" | "carousel">("mockup");
  const [collage, setCollage] = useState<CollageState>(defaultCollage);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const collageFileRef = useRef<HTMLInputElement>(null);
  const collageTarget = useRef<number | null>(null);
  const cellDrag = useRef<{ index: number; x: number; y: number } | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const collageRef = useRef(collage);
  collageRef.current = collage;
  // Carousel mode (one wide image -> N seamless panels)
  const [carousel, setCarousel] = useState<CarouselState>(defaultCarousel);
  const carouselImgRef = useRef<HTMLImageElement | null>(null);
  const [carouselVersion, setCarouselVersion] = useState(0);
  const carouselFileRef = useRef<HTMLInputElement>(null);
  const batchFileRef = useRef<HTMLInputElement>(null);
  const hasCarousel = carouselVersion > 0 && !!carouselImgRef.current;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ef-editor-theme");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ef-editor-theme", theme); } catch { /* ignore */ }
    // Publish the editor surface theme so global chrome (cookie bar) can match it.
    document.documentElement.setAttribute("data-editor-theme", theme);
    return () => { document.documentElement.removeAttribute("data-editor-theme"); };
  }, [theme]);
  const overlayFileRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const { premium } = usePremium();
  const [resolution, setResolution] = useState(FREE_MAX_EDGE);
  // Custom export size (longest edge in px). Kept as raw text so it can be typed
  // freely; the value is clamped to the plan's ceiling when it leaves the field.
  const [customOn, setCustomOn] = useState(false);
  const [customText, setCustomText] = useState(String(FREE_MAX_EDGE));
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  // Batch export progress (Premium): rendering runs file-by-file so the queue
  // stays responsive and cancellable.
  const [batch, setBatch] = useState<{ total: number; done: number; current: string; status: "running" | "done" | "error"; message?: string } | null>(null);
  const batchCancel = useRef(false);
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
      if (typeof p.resolution === "number") {
        setResolution(p.resolution);
        // A saved size that isn't one of the presets was a custom one.
        if (!RES_PRESETS.some((r) => r.v === p.resolution)) {
          setCustomOn(true);
          setCustomText(String(p.resolution));
        }
      }
      setRememberExport(true);
    } catch { /* ignore */ }
  }, []);

  // ---- Local, in-browser save --------------------------------------------
  // Everything you do in the editor survives navigating away or closing the
  // browser: the small stuff (device, background, sliders, layouts, layer
  // positions) goes to localStorage, and the images go to IndexedDB. It is all
  // local to this browser — nothing is uploaded.
  type SavedOverlay = Record<string, unknown> & { id: string; kind: "text" | "element" | "image" };
  const restoredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let s: {
        mode?: string;
        settings?: Partial<EditorSettings>;
        collage?: Partial<CollageState>;
        collagePhotos?: ({ zoom: number; ox: number; oy: number } | null)[];
        carousel?: Partial<CarouselState>;
        overlays?: SavedOverlay[];
        hasMockup?: boolean;
        hasCarousel?: boolean;
      } | null = null;
      try {
        const raw = localStorage.getItem("ef-editor-state");
        s = raw ? JSON.parse(raw) : null;
      } catch { /* ignore */ }
      if (!s || cancelled) { restoredRef.current = true; return; }

      if (s.settings) {
        setSettings((prev) => {
          const next = { ...prev, ...s.settings, background: s.settings?.background ?? prev.background } as EditorSettings;
          // A deep-linked device (e.g. /templates/iphone-mockup) wins over the saved one.
          if (initialDevice) next.deviceSlug = prev.deviceSlug;
          lastCommittedRef.current = next;
          return next;
        });
      }
      if (s.collage) setCollage((c) => ({ ...c, ...s.collage, photos: c.photos }));
      if (s.carousel) setCarousel((c) => ({ ...c, ...s.carousel }));
      if (!initialDevice && (s.mode === "mockup" || s.mode === "collage" || s.mode === "carousel")) setMode(s.mode);

      // Images.
      if (s.hasMockup) {
        const blob = await getBlob("mockup");
        const img = blob ? await blobToImage(blob) : null;
        if (img && !cancelled) { imgRef.current = img; setHasImage(true); setImgVersion((v) => v + 1); }
      }
      if (s.hasCarousel) {
        const blob = await getBlob("carousel");
        const img = blob ? await blobToImage(blob) : null;
        if (img && !cancelled) { carouselImgRef.current = img; setCarouselVersion((v) => v + 1); }
      }
      if (s.collagePhotos?.length) {
        const photos: (CollagePhoto | null)[] = [];
        for (let i = 0; i < s.collagePhotos.length; i++) {
          const meta = s.collagePhotos[i];
          if (!meta) { photos.push(null); continue; }
          // eslint-disable-next-line no-await-in-loop
          const blob = await getBlob(`collage-${i}`);
          // eslint-disable-next-line no-await-in-loop
          const img = blob ? await blobToImage(blob) : null;
          photos.push(img ? { img, zoom: meta.zoom, ox: meta.ox, oy: meta.oy } : null);
        }
        if (!cancelled && photos.some(Boolean)) setCollage((c) => ({ ...c, photos }));
      }
      if (s.overlays?.length) {
        const rebuilt: Overlay[] = [];
        for (const o of s.overlays) {
          if (o.kind === "text") {
            rebuilt.push({ ...(o as unknown as TextOverlay), type: "text" });
          } else if (o.kind === "element" && typeof o.svgTemplate === "string") {
            const svg = (o.svgTemplate as string).split("__C__").join((o.color as string) || EL_INK);
            // eslint-disable-next-line no-await-in-loop
            const img = await new Promise<HTMLImageElement | null>((res) => {
              const i = new Image();
              i.onload = () => res(i);
              i.onerror = () => res(null);
              i.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
            });
            if (img) rebuilt.push({ ...(o as unknown as ImageOverlay), type: "image", img });
          } else if (o.kind === "image") {
            // eslint-disable-next-line no-await-in-loop
            const blob = await getBlob(`ovl-${o.id}`);
            // eslint-disable-next-line no-await-in-loop
            const img = blob ? await blobToImage(blob) : null;
            if (img) rebuilt.push({ ...(o as unknown as ImageOverlay), type: "image", img });
          }
        }
        if (!cancelled && rebuilt.length) setOverlays(rebuilt);
      }
      restoredRef.current = true;
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced autosave. Runs only after the initial restore so an empty first
  // render can't wipe a saved session.
  useEffect(() => {
    if (!restoredRef.current) return;
    const id = window.setTimeout(() => {
      try {
        const st: Partial<EditorSettings> = { ...settings };
        if (st.background && st.background.type === "image") delete st.background; // can't serialize an <img>
        const { photos, ...collageCfg } = collage;
        const savedOverlays: SavedOverlay[] = overlays.map((o) => {
          const base = { id: o.id, x: o.x, y: o.y, scale: o.scale, rotation: o.rotation, opacity: o.opacity, hidden: o.hidden, name: o.name };
          if (o.type === "text") {
            const { text, fontFamily, fontWeight, fontSize, color, align } = o;
            return { ...base, kind: "text", text, fontFamily, fontWeight, fontSize, color, align };
          }
          return o.svgTemplate
            ? { ...base, kind: "element", svgTemplate: o.svgTemplate, color: o.color }
            : { ...base, kind: "image" };
        });
        localStorage.setItem(
          "ef-editor-state",
          JSON.stringify({
            v: 2,
            mode,
            settings: st,
            collage: collageCfg,
            collagePhotos: photos.map((p) => (p ? { zoom: p.zoom, ox: p.ox, oy: p.oy } : null)),
            carousel,
            overlays: savedOverlays,
            hasMockup: !!imgRef.current,
            hasCarousel: !!carouselImgRef.current
          })
        );
        // Drop blobs nothing points at any more (removed photos, deleted layers).
        const keep = new Set<string>();
        if (imgRef.current) keep.add("mockup");
        if (carouselImgRef.current) keep.add("carousel");
        photos.forEach((p, i) => { if (p) keep.add(`collage-${i}`); });
        overlays.forEach((o) => { if (o.type === "image" && !o.svgTemplate) keep.add(`ovl-${o.id}`); });
        void pruneBlobs(keep);
      } catch { /* quota or private mode — the session just won't persist */ }
    }, 600);
    return () => window.clearTimeout(id);
  }, [settings, collage, carousel, mode, overlays, imgVersion, carouselVersion]);

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
    if (mode === "collage") {
      const res = renderCollage(canvas, collage, settings.background, overlays, { maxEdge: PREVIEW_MAX_EDGE, preview: true, selected: selectedCell });
      if (res.width && res.height) setPreviewDims(res);
      return;
    }
    if (mode === "carousel") {
      // Fit the whole N-wide strip inside the preview budget.
      const panelPx = Math.max(120, Math.floor(PREVIEW_MAX_EDGE / Math.max(2, Math.min(10, carousel.panels))));
      const res = renderCarousel(canvas, carouselImgRef.current, settings.background, carousel, { panelPx, preview: true });
      if (res.width && res.height) setPreviewDims({ width: res.width, height: res.height });
      return;
    }
    // While cropping, show the full frame so the region can be chosen from it.
    const renderSettings = cropMode ? { ...settings, crop: null } : settings;
    const res = composite(canvas, imgRef.current, renderSettings, { maxEdge: PREVIEW_MAX_EDGE }, overlays);
    if (res.width && res.height) setPreviewDims(res);
  }, [settings, overlays, cropMode, mode, collage, selectedCell, carousel, carouselVersion]);

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
  // Slide the device (screenshot) layer up/down through the overlay stack.
  const moveDevice = (dir: -1 | 1) =>
    setSettings((s) => ({ ...s, deviceZ: Math.max(0, Math.min(overlays.length, (s.deviceZ ?? 0) + dir)) }));

  const addText = () => {
    const o: TextOverlay = { id: uid(), type: "text", text: "Your text", fontFamily: "Poppins", fontWeight: 700, fontSize: 0.06, color: "#ffffff", align: "center", x: 0.5, y: 0.5, scale: 1, rotation: 0, opacity: 1 };
    setOverlays((prev) => [...prev, o]);
    setSelectedId(o.id);
    ensureFont("Poppins");
  };
  const svgToImage = (svg: string, cb: (img: HTMLImageElement) => void) => {
    const img = new Image();
    img.onload = () => cb(img);
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  };
  const addElement = (template: string, name: string) => {
    const color = EL_INK;
    svgToImage(template.split("__C__").join(color), (img) => {
      const ratio = img.naturalHeight / (img.naturalWidth || 1);
      const o: ImageOverlay = { id: uid(), type: "image", img, x: 0.5, y: 0.5, scale: ratio > 1.4 ? 0.28 : 0.4, rotation: 0, opacity: 1, name, svgTemplate: template, color };
      setOverlays((prev) => [...prev, o]);
      setSelectedId(o.id);
    });
  };
  const recolorElement = (id: string, color: string) => {
    const o = overlays.find((x) => x.id === id);
    if (o?.type === "image" && o.svgTemplate) {
      svgToImage(o.svgTemplate.split("__C__").join(color), (img) => updateOverlay(id, { img, color }));
    }
  };

  const addImageOverlay = async (file: File | undefined) => {
    if (!file) return;
    try {
      const img = await loadImageSafely(file);
      const o: ImageOverlay = { id: uid(), type: "image", img, x: 0.5, y: 0.5, scale: 0.6, rotation: 0, opacity: 1 };
      void imageToBlob(img, img.naturalWidth || img.width, img.naturalHeight || img.height).then((b) => {
        if (b) void putBlob(`ovl-${o.id}`, b);
      });
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

  // ---- Gradient editing: always acts on the live background ----
  type GradientBg = Extract<BackgroundSetting, { type: "gradient" } | { type: "mesh" }>;
  const DEFAULT_GRADIENT: GradientBg = { type: "gradient", kind: "linear", from: "#2f6bff", to: "#22b8e6", angle: 135 };
  const liveBg = settings.background;
  // What the gradient controls edit: the current gradient/mesh, or a default
  // (so touching a control while a solid/image is active starts a gradient).
  const gradBg: GradientBg = liveBg.type === "gradient" || liveBg.type === "mesh" ? liveBg : DEFAULT_GRADIENT;
  const gradKind: "linear" | "radial" | "mesh" = gradBg.type === "mesh" ? "mesh" : gradBg.kind ?? "linear";
  const setBackground = (next: BackgroundSetting) => update({ background: next });

  const setGradKind = (kind: "linear" | "radial" | "mesh") => {
    if (kind === gradKind && gradBg === liveBg) return;
    const colors = paletteOf(gradBg);
    const grain = gradBg.grain ?? 0;
    if (kind === "mesh") {
      setBackground(meshFromColors(colors, grain, gradBg.type === "mesh" ? gradBg.angle ?? 0 : 0));
      return;
    }
    // A mesh's first color is its base; its blobs read better as the stops.
    const stops = gradBg.type === "mesh" && colors.length > 2 ? colors.slice(1) : colors;
    const from = stops[0];
    const to = stops[stops.length - 1] ?? from;
    const via = stops.length > 2 ? stops[Math.floor(stops.length / 2)] : undefined;
    setBackground({
      type: "gradient",
      kind,
      from,
      to,
      ...(via ? { via } : {}),
      angle: gradBg.type === "gradient" ? gradBg.angle : 135,
      cx: gradBg.type === "gradient" ? gradBg.cx ?? 0.5 : 0.5,
      cy: gradBg.type === "gradient" ? gradBg.cy ?? 0.5 : 0.5,
      grain
    });
  };

  const patchGrad = (patch: Partial<Extract<BackgroundSetting, { type: "gradient" }>> & Partial<Extract<BackgroundSetting, { type: "mesh" }>>) =>
    setBackground({ ...gradBg, ...patch } as BackgroundSetting);

  /** 3x3 direction pad: (dx, dy) in -1..1. Meaning depends on the gradient type. */
  const padAngle = (dx: number, dy: number) => ((Math.round((Math.atan2(dx, -dy) * 180) / Math.PI) % 360) + 360) % 360;
  const onPad = (dx: number, dy: number) => {
    if (gradKind === "radial") {
      patchGrad({ cx: (dx + 1) / 2, cy: (dy + 1) / 2 });
    } else if (dx === 0 && dy === 0) {
      if (gradBg.type === "gradient") patchGrad({ from: gradBg.to, to: gradBg.from }); // swap colors
      else patchGrad({ angle: 0 }); // reset mesh rotation
    } else {
      patchGrad({ angle: padAngle(dx, dy) });
    }
  };
  const padActive = (dx: number, dy: number) => {
    if (gradKind === "radial" && gradBg.type === "gradient") {
      return Math.abs((gradBg.cx ?? 0.5) - (dx + 1) / 2) < 0.01 && Math.abs((gradBg.cy ?? 0.5) - (dy + 1) / 2) < 0.01;
    }
    if (dx === 0 && dy === 0) return false;
    return (gradBg.angle ?? 0) === padAngle(dx, dy);
  };

  /** Stable identity for highlighting the matching preset swatch. */
  const bgKey = (b: BackgroundSetting) =>
    b.type === "mesh"
      ? `m:${b.base}:${b.blobs.map((x) => x.color).join(",")}`
      : b.type === "gradient"
        ? `g:${b.kind ?? "linear"}:${b.from}:${b.via ?? ""}:${b.to}`
        : b.type === "solid"
          ? `s:${b.color}`
          : b.type;

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
  const maxAllowedEdge = premium ? PREMIUM_MAX_EDGE : FREE_MAX_EDGE;
  const effResolution = premium ? resolution : Math.min(resolution, FREE_MAX_EDGE);
  // An exact canvas size (mockup mode) wins over the size presets.
  const activeCanvas = mode === "mockup" ? canvasTarget(settings) : null;
  const activeDevice = deviceBySlug(settings.deviceSlug);
  const outDims = activeCanvas
    ? { w: activeCanvas.w * activeCanvas.density, h: activeCanvas.h * activeCanvas.density }
    : previewDims
      ? (() => {
          const m = Math.max(previewDims.width, previewDims.height) || 1;
          return { w: Math.round((previewDims.width * effResolution) / m), h: Math.round((previewDims.height * effResolution) / m) };
        })()
      : null;

  // Shared export controls (used in the dialog and the split-button dropdown).
  const renderExportControls = () => (
    <>
      {activeCanvas ? (
        <p className="ed-hint" style={{ marginTop: 0 }}>
          Using your custom canvas: <b>{activeCanvas.w * activeCanvas.density} × {activeCanvas.h * activeCanvas.density}px</b>. Switch Canvas size back to Auto to use these presets.
        </p>
      ) : null}
      <div className="ed-subhead">Size</div>
      <div className="ed-seg">
        {RES_PRESETS.map((p) => (
          <button
            key={p.v}
            className={`ed-res-btn ${!customOn && effResolution === p.v ? "on" : ""}`}
            onClick={() => { if (p.pro && !premium) { flash("4K export is a Premium feature."); return; } setCustomOn(false); setResolution(p.v); }}
          >
            {p.label}{p.pro && !premium ? <span className="ed-pro">PRO</span> : null}
          </button>
        ))}
        <button
          className={`ed-res-btn ${customOn ? "on" : ""}`}
          onClick={() => { setCustomOn(true); setCustomText(String(effResolution)); }}
          title="Set your own export size"
        >
          Custom
        </button>
      </div>
      {customOn ? (
        <label className="ed-custom-res">
          <span>Longest edge</span>
          <input
            type="number"
            min={256}
            max={maxAllowedEdge}
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 256 && n <= maxAllowedEdge) setResolution(Math.round(n));
            }}
            onBlur={() => {
              const n = Math.round(Number(customText));
              const clamped = Math.max(256, Math.min(maxAllowedEdge, Number.isFinite(n) && n > 0 ? n : effResolution));
              setCustomText(String(clamped));
              setResolution(clamped);
            }}
            aria-label="Custom export size in pixels"
          />
          <span>px</span>
        </label>
      ) : null}
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

  /** Fill or fit the screenshot and recenter it (clears manual zoom/pan/tilt). */
  const fitImage = (fit: "cover" | "contain") => update({ fit, imageScale: 1, imageOffsetX: 0, imageOffsetY: 0, imageRotate: 0 });

  const setImage = (img: HTMLImageElement | null) => {
    // A new screenshot starts centered and filling the screen, rather than
    // inheriting the previous image's zoom and position.
    if (img) setSettings((cur) => ({ ...cur, fit: "cover", imageScale: 1, imageOffsetX: 0, imageOffsetY: 0, imageRotate: 0 }));
    imgRef.current = img;
    setHasImage(!!img);
    setImgVersion((v) => v + 1);
    // Keep a copy in this browser so the screenshot survives a reload.
    if (img) {
      void imageToBlob(img, img.naturalWidth || img.width, img.naturalHeight || img.height).then((b) => {
        if (b) void putBlob("mockup", b);
      });
    }
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

  /** Load photos into the collage: the first goes to `startAt` (if given), the rest fill empty slots. */
  const loadPhotos = async (files: File[], startAt: number | null = null) => {
    const usable = files.filter((file) => /image\/(png|jpeg|webp)/.test(file.type));
    if (!usable.length) {
      if (files.length) flash("Unsupported file. Use PNG, JPEG, or WebP.");
      return;
    }
    setBusy(true);
    try {
      const loaded = await Promise.all(usable.map((file) => loadImageSafely(file)));
      const c = collageRef.current;
      const slots = templateById(c.templateId).cells.length;
      const photos: (CollagePhoto | null)[] = [...c.photos];
      while (photos.length < slots) photos.push(null);
      const targets: number[] = [];
      if (startAt != null) targets.push(startAt);
      for (let i = 0; i < slots; i++) if (!photos[i] && i !== startAt) targets.push(i);
      let placed = 0;
      for (const img of loaded) {
        const t = targets[placed];
        if (t == null) break;
        photos[t] = { img, zoom: 1, ox: 0, oy: 0 };
        // Keep a local copy so the collage survives a reload.
        void imageToBlob(img, img.naturalWidth || img.width, img.naturalHeight || img.height).then((b) => {
          if (b) void putBlob(`collage-${t}`, b);
        });
        placed++;
      }
      setCollage({ ...c, photos });
      if (placed < loaded.length) flash(`This layout has ${slots} photo slots. Pick a bigger layout for more.`);
      track("collage_photos_added", { count: placed });
    } catch {
      flash("Could not load one of those images.");
    } finally {
      setBusy(false);
    }
  };
  const loadPhotosRef = useRef(loadPhotos);
  loadPhotosRef.current = loadPhotos;
  const patchPhoto = (index: number, patch: Partial<CollagePhoto>) =>
    setCollage((c) => ({ ...c, photos: c.photos.map((p, i) => (i === index && p ? { ...p, ...patch } : p)) }));
  const removePhoto = (index: number) => setCollage((c) => ({ ...c, photos: c.photos.map((p, i) => (i === index ? null : p)) }));
  const pickPhotos = (target: number | null) => {
    collageTarget.current = target;
    collageFileRef.current?.click();
  };
  const switchMode = (next: "mockup" | "collage" | "carousel") => {
    if (next === mode) return;
    setMode(next);
    setCropMode(false);
    setDragRotate(false);
    setSelectedCell(null);
    setSelectedId(null);
    track("editor_mode", { mode: next });
  };

  /** Load the single wide source image used by carousel mode. */
  const loadCarouselImage = async (file: File | undefined) => {
    if (!file) return;
    if (!/image\/(png|jpeg|webp)/.test(file.type)) {
      flash("Unsupported file. Use PNG, JPEG, or WebP.");
      return;
    }
    setBusy(true);
    try {
      const img = await loadImageSafely(file);
      carouselImgRef.current = img;
      setCarouselVersion((v) => v + 1);
      void imageToBlob(img, img.naturalWidth || img.width, img.naturalHeight || img.height).then((b) => {
        if (b) void putBlob("carousel", b);
      });
      track("carousel_image_added", {});
    } catch {
      flash("Could not load that image.");
    } finally {
      setBusy(false);
    }
  };
  const loadCarouselRef = useRef(loadCarouselImage);
  loadCarouselRef.current = loadCarouselImage;

  const onFiles = (files: FileList | null) => {
    if (mode === "collage") {
      void loadPhotos(Array.from(files ?? []));
      return;
    }
    if (mode === "carousel") {
      void loadCarouselImage(files?.[0]);
      return;
    }
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
      if (!file) return;
      if (modeRef.current === "collage") void loadPhotosRef.current([file]);
      else if (modeRef.current === "carousel") void loadCarouselRef.current(file);
      else void ingest(file);
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
    if (mode === "collage" && !(selectedId && selectedOverlay)) {
      const cv = event.currentTarget;
      const rect = cv.getBoundingClientRect();
      const px = ((event.clientX - rect.left) / rect.width) * cv.width;
      const py = ((event.clientY - rect.top) / rect.height) * cv.height;
      const i = hitCell(collage, cv.width, cv.height, px, py);
      if (i < 0) {
        setSelectedCell(null);
        return;
      }
      setSelectedCell(i);
      if (!collage.photos[i]) {
        pickPhotos(i); // empty slot: fill it
        return;
      }
      cellDrag.current = { index: i, x: event.clientX, y: event.clientY };
      try {
        cv.setPointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
      return;
    }
    if (mode === "carousel") {
      if (!hasCarousel) return;
      dragRef.current = { x: event.clientX, y: event.clientY };
      try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* ignore */ }
      return;
    }
    if (!hasImage && !selectedOverlay && !dragRotate) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (cellDrag.current) {
      // Pan the photo inside its collage slot.
      const cv = event.currentTarget;
      const rect = cv.getBoundingClientRect();
      const d = cellDrag.current;
      const dxPx = ((event.clientX - d.x) / rect.width) * cv.width;
      const dyPx = ((event.clientY - d.y) / rect.height) * cv.height;
      cellDrag.current = { ...d, x: event.clientX, y: event.clientY };
      setCollage((c) => {
        const pan = panPhoto(c, d.index, cv.width, cv.height, dxPx, dyPx);
        return pan ? { ...c, photos: c.photos.map((p, i) => (i === d.index && p ? { ...p, ...pan } : p)) } : c;
      });
      return;
    }
    if (!dragRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - dragRef.current.x) / rect.width;
    const dy = (event.clientY - dragRef.current.y) / rect.height;
    dragRef.current = { x: event.clientX, y: event.clientY };
    if (mode === "carousel") {
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      // Drag the wide image behind the panels (pan across the overflow).
      setCarousel((c) => ({ ...c, ox: clamp(c.ox - dx * 2), oy: clamp(c.oy - dy * 2) }));
      return;
    }
    if (dragRotate && !(selectedId && selectedOverlay)) {
      const clamp = (v: number) => Math.max(-50, Math.min(50, v));
      setSettings((s) => ({ ...s, rotateY: clamp(s.rotateY + dx * 90), rotateX: clamp(s.rotateX - dy * 90), perspective: s.perspective || 55 }));
      return;
    }
    // With a crop applied the canvas shows only the kept region, so a drag covers
    // less of the full scene: scale moves back into full-scene fractions.
    const cropped = mode === "mockup" ? settings.crop : null;
    const mx = dx * (cropped?.w ?? 1);
    const my = dy * (cropped?.h ?? 1);
    if (selectedId && selectedOverlay) {
      const transform = event.ctrlKey || event.metaKey;
      setOverlays((prev) => prev.map((o) => {
        if (o.id !== selectedId) return o;
        if (transform) {
          const scale = Math.max(0.1, Math.min(3, o.scale - dy * 2.4));
          const rotation = Math.max(-180, Math.min(180, o.rotation + dx * 220));
          return { ...o, scale, rotation };
        }
        return { ...o, x: o.x + mx, y: o.y + my };
      }));
    } else {
      // Move the whole mockup over the (static) background.
      setSettings((s) => ({ ...s, frameOffsetX: s.frameOffsetX + mx, frameOffsetY: s.frameOffsetY + my }));
    }
  };
  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    cellDrag.current = null;
    dragRef.current = null;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch {}
  };

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Carousel export: slice the wide image into N seamless panels and bundle them
  // into one .zip. Multi-file output is a paid (batch) feature.
  const onExportCarousel = async () => {
    if (!premium) {
      flash("Carousel export is a Premium feature.");
      return;
    }
    if (!hasCarousel) {
      flash("Add a wide image to split first.");
      return;
    }
    setBusy(true);
    try {
      const bg =
        (settings.background.type === "transparent" || settings.background.type === "image") && !premium
          ? { type: "solid" as const, color: "#0b0d0f" }
          : settings.background;
      const panelPx = Math.min(premium ? 1440 : FREE_MAX_EDGE, 1440);
      const panels = await exportCarousel(carouselImgRef.current, bg, carousel, format, quality / 100, panelPx);
      if (!panels.length) { flash("Export failed. Try a smaller size."); return; }
      const zip = await makeZip(panels);
      const name = `easyframe-carousel-${carousel.panels}up-${carousel.aspect.replace(":", "x")}.zip`;
      triggerBlobDownload(zip, name);
      track("carousel_exported", { panels: carousel.panels, aspect: carousel.aspect });
      flash(`✓ Saved ${panels.length} panels as ${name}`);
      setExportOpen(false);
      setExportMenuOpen(false);
    } catch {
      flash("Export failed — the image may be too large. Try a smaller size.");
    } finally {
      setBusy(false);
    }
  };

  // Batch export (mockup): apply the current frame + settings to many screenshots
  // at once and bundle the results into one .zip. Paid feature.
  const onBatchFiles = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter((f) => /image\/(png|jpeg|webp)/.test(f.type));
    if (!list.length) return;
    if (!premium) {
      flash("Batch export is a Premium feature.");
      return;
    }
    batchCancel.current = false;
    setBatch({ total: list.length, done: 0, current: list[0].name, status: "running" });
    try {
      const maxEdge = premium ? resolution : Math.min(resolution, FREE_MAX_EDGE);
      const ext = format === "jpeg" ? "jpg" : format;
      const out: { name: string; blob: Blob }[] = [];
      const used = new Set<string>();
      for (let i = 0; i < list.length; i++) {
        if (batchCancel.current) break;
        setBatch({ total: list.length, done: i, current: list[i].name, status: "running" });
        // Yield so the dialog can paint between renders. setTimeout, not
        // requestAnimationFrame: rAF is paused while the tab is in the
        // background, which would stall the whole export until you came back.
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 0));
        // eslint-disable-next-line no-await-in-loop
        const img = await loadImageSafely(list[i]);
        // eslint-disable-next-line no-await-in-loop
        const blob = await exportScene(img, settings, format, quality / 100, maxEdge, overlays);
        let base = (list[i].name.replace(/\.[^.]+$/, "") || `mockup-${i + 1}`).slice(0, 60);
        while (used.has(base)) base = `${base}-1`;
        used.add(base);
        out.push({ name: `${base}-${settings.deviceSlug}.${ext}`, blob });
      }
      if (batchCancel.current || !out.length) {
        setBatch(null);
        if (batchCancel.current) flash("Batch export cancelled.");
        return;
      }
      setBatch({ total: list.length, done: out.length, current: "Packaging…", status: "running" });
      const zip = await makeZip(out);
      const name = `easyframe-batch-${out.length}.zip`;
      triggerBlobDownload(zip, name);
      track("batch_exported", { count: out.length, device: settings.deviceSlug });
      setBatch({ total: list.length, done: out.length, current: name, status: "done" });
    } catch {
      setBatch({ total: list.length, done: 0, current: "", status: "error", message: "Something went wrong — one of the images may be too large." });
    }
  };

  const onDownload = async () => {
    if (mode === "carousel") { await onExportCarousel(); return; }
    setBusy(true);
    try {
      const maxEdge = premium ? resolution : Math.min(resolution, FREE_MAX_EDGE);
      // Guard: transparent & custom-image backgrounds are Premium-only; free users fall back to a solid bg.
      const exportSettings =
        (settings.background.type === "transparent" || settings.background.type === "image") && !premium
          ? { ...settings, background: { type: "solid" as const, color: "#0b0d0f" } }
          : settings;
      if (mode === "collage" && !collage.photos.some(Boolean)) {
        flash("Add at least one photo to your collage first.");
        return;
      }
      const blob =
        mode === "collage"
          ? await exportCollage(collage, exportSettings.background, overlays, format, quality / 100, maxEdge)
          : await exportScene(imgRef.current, exportSettings, format, quality / 100, maxEdge, overlays);
      track("export_completed", { device: settings.deviceSlug, format, premium });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ext = format === "jpeg" ? "jpg" : format;
      const filename = `${mode === "collage" ? `collage-${collage.aspect.replace(":", "x")}` : settings.deviceSlug}-${maxEdge}px.${ext}`;
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
  // Reset only the Adjust sliders (frame/screenshot placement) to their defaults.
  // ---- Crop (applies to the final output) ----
  const cropFrame = { w: previewDims?.width || 1, h: previewDims?.height || 1 };
  const startCrop = () => {
    setDragRotate(false);
    setSelectedId(null);
    setDraftCrop(settings.crop ?? { x: 0, y: 0, w: 1, h: 1 });
    setCropAspect("free");
    setCropMode(true);
  };
  const chooseAspect = (id: string) => {
    setCropAspect(id);
    const ratio = CROP_ASPECTS.find((a) => a.id === id)?.ratio;
    if (ratio) setDraftCrop((c) => fitAspect(ratio, cropFrame, c));
  };
  const applyCrop = () => {
    const full = draftCrop.w > 0.995 && draftCrop.h > 0.995;
    update({ crop: full ? null : draftCrop });
    setCropMode(false);
  };
  const clearCrop = () => {
    setDraftCrop({ x: 0, y: 0, w: 1, h: 1 });
    setCropAspect("free");
  };

  const resetAdjust = () =>
    update({
      padding: defaultSettings.padding,
      imageScale: defaultSettings.imageScale,
      imageRotate: defaultSettings.imageRotate,
      imageOffsetX: defaultSettings.imageOffsetX,
      imageOffsetY: defaultSettings.imageOffsetY,
      shadow: defaultSettings.shadow,
      cornerRadius: defaultSettings.cornerRadius,
      fit: defaultSettings.fit,
      frameOffsetX: defaultSettings.frameOffsetX,
      frameOffsetY: defaultSettings.frameOffsetY
    });

  const bg = settings.background;

  // ---- Collage panels ----
  const collageSlots = templateById(collage.templateId).cells.length;
  const collageFilled = collage.photos.slice(0, collageSlots).filter(Boolean).length;
  const selectedPhoto = selectedCell != null ? collage.photos[selectedCell] ?? null : null;

  const collageLeft = (
    <section className="ed-card">
      <div className="ed-card-title">Collage</div>
      <div className="ed-subhead">Canvas size</div>
      <div className="ed-seg ed-collage-aspects" role="group" aria-label="Canvas size">
        {COLLAGE_ASPECTS.map((a) => (
          <button key={a.id} className={collage.aspect === a.id ? "on" : ""} onClick={() => setCollage((c) => ({ ...c, aspect: a.id }))} title={a.label}>
            {a.id}
          </button>
        ))}
      </div>
      <div className="ed-subhead">
        Layout
        <span className="ed-collage-count">{collageFilled}/{collageSlots} photos</span>
      </div>
      <div className="ed-layouts">
        {COLLAGE_TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={`ed-layout ${collage.templateId === t.id ? "on" : ""}`}
            onClick={() => {
              setCollage((c) => ({ ...c, templateId: t.id }));
              setSelectedCell(null);
            }}
            title={`${t.label} (${t.cells.length} photo${t.cells.length > 1 ? "s" : ""})`}
            aria-label={`${t.label} layout`}
          >
            <span className="ed-layout-art">
              {t.cells.map((c, i) => (
                <i
                  key={i}
                  className={c.polaroid ? "polaroid" : c.circle ? "circle" : ""}
                  style={{
                    left: `calc(${c.x * 100}% + 1.5px)`,
                    top: `calc(${c.y * 100}% + 1.5px)`,
                    width: `calc(${c.w * 100}% - 3px)`,
                    height: c.circle ? undefined : `calc(${c.h * 100}% - 3px)`,
                    aspectRatio: c.circle ? "1 / 1" : undefined,
                    transform: c.rot ? `rotate(${c.rot}deg)` : undefined
                  }}
                />
              ))}
            </span>
            <span className="ed-layout-name">{t.label}</span>
          </button>
        ))}
      </div>
      <input
        ref={collageFileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        onChange={(e) => {
          void loadPhotos(Array.from(e.target.files ?? []), collageTarget.current);
          collageTarget.current = null;
          e.currentTarget.value = "";
        }}
      />
      <div className="ed-subhead">
        Spacing
        <button
          className="ed-mini-reset"
          onClick={() => setCollage((c) => ({ ...c, gap: defaultCollage.gap, padding: defaultCollage.padding, radius: defaultCollage.radius }))}
          title="Reset spacing"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <Range label="Space between photos" value={Math.round(collage.gap * 1000)} min={0} max={120} step={1} onChange={(v) => setCollage((c) => ({ ...c, gap: v / 1000 }))} />
      <Range label="Outer margin" value={Math.round(collage.padding * 1000)} min={0} max={180} step={1} onChange={(v) => setCollage((c) => ({ ...c, padding: v / 1000 }))} />
      <Range label="Corner radius" value={Math.round(collage.radius * 1000)} min={0} max={150} step={1} onChange={(v) => setCollage((c) => ({ ...c, radius: v / 1000 }))} />
      <p className="ed-hint">Click an empty slot to add a photo, or drop several at once. Drag a photo to reposition it.</p>
    </section>
  );

  const collageRight = (
    <>
      {selectedCell != null && selectedPhoto ? (
        <section className="ed-card">
          <div className="ed-card-title ed-card-title-row">
            <span>Photo {selectedCell + 1}</span>
            <button className="ed-mini-reset" onClick={() => patchPhoto(selectedCell, { zoom: 1, ox: 0, oy: 0 })} title="Recenter and reset zoom">
              <RotateCcw size={12} /> Reset
            </button>
          </div>
          <Range label="Zoom" value={selectedPhoto.zoom} min={1} max={3} step={0.01} onChange={(v) => patchPhoto(selectedCell, { zoom: v })} />
          <div className="ed-photo-actions">
            <button className="ed-upload" onClick={() => pickPhotos(selectedCell)}>
              <ImagePlus size={14} /> Replace
            </button>
            <button className="ed-remove" onClick={() => removePhoto(selectedCell)}>
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </section>
      ) : null}
    </>
  );

  const PANEL_CHOICES = [2, 3, 4, 5, 6, 8, 10];
  const carouselLeft = (
    <section className="ed-card">
      <div className="ed-card-title">Carousel</div>
      <p className="ed-hint" style={{ marginTop: 0 }}>Split one wide image into seamless posts that read as one picture when swiped on Instagram.</p>
      <div className="ed-subhead">Panels</div>
      <div className="ed-seg ed-carousel-panels" role="group" aria-label="Number of panels">
        {PANEL_CHOICES.map((n) => (
          <button key={n} className={carousel.panels === n ? "on" : ""} onClick={() => setCarousel((c) => ({ ...c, panels: n }))} title={`${n} panels`}>
            {n}
          </button>
        ))}
      </div>
      <div className="ed-subhead">Each panel</div>
      <div className="ed-seg ed-collage-aspects" role="group" aria-label="Panel size">
        {CAROUSEL_ASPECTS.map((a) => (
          <button key={a.id} className={carousel.aspect === a.id ? "on" : ""} onClick={() => setCarousel((c) => ({ ...c, aspect: a.id }))} title={a.label}>
            {a.id}
          </button>
        ))}
      </div>
      <div className="ed-subhead">
        Position
        <button className="ed-mini-reset" onClick={() => setCarousel((c) => ({ ...c, zoom: 1, ox: 0, oy: 0 }))} title="Recenter and reset zoom">
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <Range label="Zoom" value={carousel.zoom} min={1} max={3} step={0.01} onChange={(v) => setCarousel((c) => ({ ...c, zoom: v }))} />
      <p className="ed-hint">Drag on the canvas to reposition. Export bundles all {carousel.panels} panels into a ZIP{premium ? "" : " (Premium)"}.</p>
    </section>
  );
  // Background swatches: show the first 8, reveal the rest behind "Show more".
  const bgSwatches: Array<{ id: string; label: string; bg: BackgroundSetting }> = [
    ...BACKGROUND_PRESETS,
    ...SOLID_COLORS.map((c) => ({ id: `solid-${c}`, label: `Solid ${c}`, bg: { type: "solid" as const, color: c } }))
  ];
  const shownSwatches = showAllBg ? bgSwatches : bgSwatches.slice(0, 8);
  const deviceZ = Math.min(overlays.length, Math.max(0, settings.deviceZ ?? 0));
  // Build the layer stack bottom→top with the device inserted at its z-position.
  const layerStack: Array<{ kind: "device" } | { kind: "overlay"; o: Overlay }> = [];
  overlays.forEach((o, i) => {
    if (i === deviceZ) layerStack.push({ kind: "device" });
    layerStack.push({ kind: "overlay", o });
  });
  if (deviceZ >= overlays.length) layerStack.push({ kind: "device" });

  return (
    <div
      className={`ed ${theme === "light" ? "ed-light" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
      onDragLeave={() => setDropActive(false)}
      onDrop={(e) => { e.preventDefault(); setDropActive(false); onFiles(e.dataTransfer.files); }}
    >
      <header className="ed-top">
        <a className="ed-brand" href="/">
          {/* Two variants: the wordmark is black, so the dark chrome needs the
              white one. CSS shows whichever matches the editor theme. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ed-logo-dark" src="/brand/logo-white.png" alt="EasyFrame" width={900} height={92} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ed-logo-light" src="/brand/logo.png" alt="" aria-hidden="true" width={900} height={92} />
          <span className="ed-brand-tag">Editor</span>
        </a>
        <div className="ed-modes" role="tablist" aria-label="Editor mode">
          <button role="tab" aria-selected={mode === "mockup"} className={mode === "mockup" ? "on" : ""} onClick={() => switchMode("mockup")}>
            <Smartphone size={14} /> Mockup
          </button>
          <button role="tab" aria-selected={mode === "collage"} className={mode === "collage" ? "on" : ""} onClick={() => switchMode("collage")}>
            <LayoutGrid size={14} /> Collage
          </button>
          <button role="tab" aria-selected={mode === "carousel"} className={mode === "carousel" ? "on" : ""} onClick={() => switchMode("carousel")}>
            <Images size={14} /> Carousel
          </button>
        </div>
        <div className="ed-top-actions">
          <UpgradeStar />
          <AccountLink className="ed-icon-btn ed-account" icon />
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
                  <Download size={15} /> {busy ? "Working…" : mode === "carousel" ? `Download ${carousel.panels}-panel ZIP` : outDims ? `Download ${outDims.w}×${outDims.h}` : "Download"}
                </button>
                {mode === "mockup" ? (
                  <button className="ed-dl-menu-batch" onClick={() => { setExportMenuOpen(false); if (premium) batchFileRef.current?.click(); else flash("Batch export is a Premium feature."); }} disabled={busy}>
                    <Package size={15} /> Batch export{premium ? "" : " (Premium)"}…
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="ed-body">
        {/* Left rail: devices */}
        <aside className="ed-rail ed-rail-left" aria-label={mode === "collage" ? "Collage" : mode === "carousel" ? "Carousel" : "Devices"}>
          {mode === "collage" ? collageLeft : null}
          {mode === "carousel" ? carouselLeft : null}
          {mode === "mockup" ? (
          <section className="ed-card">
            <button className="ed-card-title ed-collapse-head" onClick={() => setCollapsed((c) => ({ ...c, devices: !c.devices }))} aria-expanded={!collapsed.devices}>
              <span>Device</span>
              {collapsed.devices ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
            {!collapsed.devices ? (
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
            ) : null}
          </section>

          ) : null}

          {/* Browser frames: let the address in the chrome be edited. */}
          {mode === "mockup" && activeDevice.kind === "browser" ? (
            <section className="ed-card">
              <div className="ed-card-title ed-card-title-row">
                <span>Address bar</span>
                {settings.browserUrl ? (
                  <button className="ed-mini-reset" onClick={() => update({ browserUrl: "" })} title="Use the default address">
                    <RotateCcw size={12} /> Reset
                  </button>
                ) : null}
              </div>
              <label className="ed-url-field">
                <input
                  type="text"
                  value={settings.browserUrl ?? ""}
                  placeholder={activeDevice.browser?.label ?? "yoursite.com"}
                  onChange={(e) => update({ browserUrl: e.target.value })}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Address shown in the browser window"
                />
              </label>
              <p className="ed-hint">Shown in the browser&apos;s URL field. Leave empty for {activeDevice.browser?.label ?? "the default"}.</p>
            </section>
          ) : null}

          {mode !== "carousel" ? (<>
          <section className="ed-card">
            <button className="ed-card-title ed-collapse-head" onClick={() => setCollapsed((c) => ({ ...c, elements: !c.elements }))} aria-expanded={!collapsed.elements}>
              <span>Elements</span>
              {collapsed.elements ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
            {!collapsed.elements ? (
              <>
                <div className="ed-elements">
                  {ELEMENTS.map((el) => (
                    <button key={el.id} type="button" className="ed-element" onClick={() => addElement(el.svg, el.label)} aria-label={`Add ${el.label}`} title={el.label}>
                      <span className="ed-element-ic" dangerouslySetInnerHTML={{ __html: el.svg.split("__C__").join("currentColor") }} />
                    </button>
                  ))}
                </div>
                <p className="ed-hint">Tap to drop an arrow, doodle or shape — then drag &amp; resize it on the canvas.</p>
              </>
            ) : null}
          </section>

          {mode === "mockup" ? (
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

          ) : null}
          <section className="ed-card">
            <div className="ed-card-title"><Layers size={12} style={{ marginRight: -2 }} /> Layers</div>
            <div className="ed-layer-add">
              <button onClick={addText}><Type size={14} /> Text</button>
              <button onClick={() => overlayFileRef.current?.click()}><ImagePlus size={14} /> Image</button>
            </div>
            <input ref={overlayFileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void addImageOverlay(e.target.files?.[0]); e.currentTarget.value = ""; }} />
            <div className="ed-layers">
              {[...layerStack].reverse().map((item) => {
                if (item.kind === "device") {
                  if (mode === "collage") return null;
                  return (
                    <div key="__device__" className={`ed-layer ${selectedId === null ? "on" : ""}`}>
                      <button className="ed-layer-main" onClick={() => setSelectedId(null)}>
                        <Smartphone size={13} />
                        <span>Device screenshot</span>
                      </button>
                      <button className="ed-layer-ic" onClick={() => moveDevice(1)} disabled={deviceZ >= overlays.length} aria-label="Move screenshot layer up"><ChevronUp size={13} /></button>
                      <button className="ed-layer-ic" onClick={() => moveDevice(-1)} disabled={deviceZ <= 0} aria-label="Move screenshot layer down"><ChevronDown size={13} /></button>
                    </div>
                  );
                }
                const o = item.o;
                return (
                  <div key={o.id} className={`ed-layer ${selectedId === o.id ? "on" : ""}`}>
                    <button className="ed-layer-main" onClick={() => setSelectedId(o.id)}>
                      {o.type === "text" ? <Type size={13} /> : <ImageIcon size={13} />}
                      <span>{o.name ? o.name : o.type === "text" ? (o.text.split("\n")[0] || "Text") : "Image"}</span>
                    </button>
                    <button className="ed-layer-ic" onClick={() => updateOverlay(o.id, { hidden: !o.hidden })} aria-label="Toggle visibility">{o.hidden ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                    <button className="ed-layer-ic" onClick={() => moveOverlay(o.id, 1)} aria-label="Bring forward"><ChevronUp size={13} /></button>
                    <button className="ed-layer-ic" onClick={() => moveOverlay(o.id, -1)} aria-label="Send back"><ChevronDown size={13} /></button>
                    <button className="ed-layer-ic danger" onClick={() => removeOverlay(o.id)} aria-label="Delete layer"><X size={13} /></button>
                  </div>
                );
              })}
            </div>
            {!overlays.length ? <p className="ed-hint">Add text or images as layers, then drag them on the canvas.</p> : null}
          </section>
          </>) : null}
        </aside>

        {/* Canvas */}
        <main className="ed-stage" aria-label="Preview">
          {mode !== "mockup" ? null : cropMode ? (
            <div className="ed-cropbar" role="toolbar" aria-label="Crop">
              <div className="ed-crop-aspects" role="group" aria-label="Aspect ratio">
                {CROP_ASPECTS.map((a) => (
                  <button key={a.id} className={cropAspect === a.id ? "on" : ""} onClick={() => chooseAspect(a.id)} aria-pressed={cropAspect === a.id}>
                    {a.label}
                  </button>
                ))}
              </div>
              <span className="ed-cropbar-sep" aria-hidden="true" />
              <button className="ed-cropbar-btn" onClick={clearCrop} title="Reset to the full frame">
                <RotateCcw size={13} /> Reset
              </button>
              <button className="ed-cropbar-btn" onClick={() => setCropMode(false)}>Cancel</button>
              <button className="ed-cropbar-btn primary" onClick={applyCrop}>
                <Check size={14} strokeWidth={2.6} /> Apply
              </button>
            </div>
          ) : (
            <div className="ed-stage-tools">
              <button
                className={`ed-tool-toggle ${settings.crop ? "on" : ""}`}
                onClick={startCrop}
                title="Crop the final image to a region or aspect ratio"
              >
                <Crop size={15} /> {settings.crop ? "Cropped" : "Crop"}
              </button>
              <button
                className={`ed-tool-toggle ${dragRotate ? "on" : ""}`}
                onClick={() => setDragRotate((v) => !v)}
                aria-pressed={dragRotate}
                title="Grab the mockup and rotate it in 3D"
              >
                <Move3d size={15} /> {dragRotate ? "Rotating in 3D" : "Rotate 3D"}
              </button>
            </div>
          )}
          <div className="ed-canvas-wrap" style={{ transform: `scale(${previewZoom})` }}>
            {cropMode ? (
              <CropOverlay
                crop={draftCrop}
                ratio={CROP_ASPECTS.find((a) => a.id === cropAspect)?.ratio ?? null}
                frame={cropFrame}
                onChange={setDraftCrop}
              />
            ) : null}
            <canvas
              ref={canvasRef}
              className="ed-canvas"
              style={{ cursor: dragRotate ? (dragRef.current ? "grabbing" : "grab") : undefined, touchAction: "none" }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          <div className={`ed-uploadbar ${(mode === "collage" ? collageFilled > 0 : mode === "carousel" ? hasCarousel : hasImage) ? "has-image" : ""}`} style={dragRotate || cropMode ? { pointerEvents: "none", opacity: cropMode ? 0 : 1 } : undefined}>
            {mode === "collage" ? (
              <button className="ed-upload-btn" onClick={() => pickPhotos(null)}>
                <ImagePlus size={collageFilled ? 14 : 16} strokeWidth={2.2} />
                {collageFilled ? "Add more photos" : "Add photos"}
              </button>
            ) : mode === "carousel" ? (
              <button className="ed-upload-btn" onClick={() => carouselFileRef.current?.click()}>
                <Images size={hasCarousel ? 14 : 16} strokeWidth={2.2} />
                {hasCarousel ? "Replace wide image" : "Upload a wide image"}
              </button>
            ) : (
              <button className="ed-upload-btn" onClick={() => fileRef.current?.click()}>
                <Upload size={hasImage ? 14 : 16} strokeWidth={2.2} />
                {hasImage ? "Replace screenshot" : "Upload screenshot"}
              </button>
            )}
            {mode === "collage" ? (
              collageFilled ? null : <span className="ed-upload-hint">pick several at once · they fill the layout in order</span>
            ) : mode === "carousel" ? (
              hasCarousel ? <span className="ed-upload-hint">drag on the canvas to reposition · panels export as a ZIP</span> : <span className="ed-upload-hint">a wide/panoramic image works best · it splits into seamless posts</span>
            ) : !hasImage ? (
              <span className="ed-upload-hint">or drop / paste anywhere · PNG, JPG, WebP · never leaves your device</span>
            ) : null}
          </div>
          <input ref={carouselFileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { void loadCarouselImage(e.target.files?.[0]); e.currentTarget.value = ""; }} />
          <input ref={batchFileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={(e) => { void onBatchFiles(e.target.files); e.currentTarget.value = ""; }} />
          {dropActive ? (
            <div className="ed-dragmask"><Upload size={28} /><strong>Drop to place</strong></div>
          ) : null}
          <div className="ed-zoom">
            <button onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.1))}>−</button>
            <b>{Math.round(previewZoom * 100)}%</b>
            <button onClick={() => setPreviewZoom((z) => Math.min(3, z + 0.1))}>+</button>
          </div>
          {notice ? (
            <div className="ed-toast" role="status">
              <span>{notice}</span>
              {/Premium/.test(notice) ? <a href="/pricing">See Premium</a> : null}
            </div>
          ) : null}
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
                <>
                  {selectedOverlay.svgTemplate ? (
                    <label className="ed-el-color">
                      <span>Color</span>
                      <input type="color" className="ed-color" value={selectedOverlay.color || EL_INK} onChange={(e) => recolorElement(selectedOverlay.id, e.target.value)} aria-label="Element color" />
                    </label>
                  ) : null}
                  <Range label="Scale" value={selectedOverlay.scale} min={0.1} max={2} step={0.02} onChange={(v) => updateOverlay(selectedOverlay.id, { scale: v })} />
                </>
              )}
              <Range label="Rotation" value={selectedOverlay.rotation} min={-180} max={180} step={1} onChange={(v) => updateOverlay(selectedOverlay.id, { rotation: v })} />
              <Range label="Opacity" value={selectedOverlay.opacity} min={0} max={1} step={0.02} onChange={(v) => updateOverlay(selectedOverlay.id, { opacity: v })} />
              <p className="ed-hint">Drag to move · <b>Ctrl-drag</b> on the canvas to resize &amp; rotate.</p>
              <button className="ed-remove" onClick={() => removeOverlay(selectedOverlay.id)}><Trash2 size={14} /> Delete layer</button>
            </section>
          ) : null}

          <section className="ed-card">
          <div className="ed-card-title">Background</div>
          <div className="ed-swatches">
            {shownSwatches.map((s) => (
              <button
                key={s.id}
                className={`ed-swatch ${bgKey(bg) === bgKey(s.bg) ? "on" : ""}`}
                style={{ background: backgroundCss(s.bg) }}
                aria-label={s.label}
                title={s.label}
                onClick={() => setBackground(s.bg)}
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
          {bgSwatches.length > 8 ? (
            <button className="ed-showmore" onClick={() => setShowAllBg((v) => !v)}>
              {showAllBg ? "Show less" : `Show more (${bgSwatches.length - 8})`}
            </button>
          ) : null}
          <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => { onBgImage(e.target.files); e.currentTarget.value = ""; }} />

          <div className="ed-subhead">Gradient</div>
          <div className="ed-seg ed-gradtype" role="group" aria-label="Gradient type">
            {(["linear", "radial", "mesh"] as const).map((k) => (
              <button key={k} className={gradKind === k && gradBg === bg ? "on" : ""} onClick={() => setGradKind(k)}>
                {k === "linear" ? "Linear" : k === "radial" ? "Radial" : "Mesh"}
              </button>
            ))}
          </div>
          <div className="ed-grad-editor">
            <div className="ed-grad-preview" style={{ background: backgroundCss(gradBg) }} />
            <div className="ed-dirpad" role="group" aria-label={gradKind === "radial" ? "Glow position" : "Direction"}>
              {[-1, 0, 1].flatMap((dy) =>
                [-1, 0, 1].map((dx) => {
                  const center = dx === 0 && dy === 0;
                  const label =
                    gradKind === "radial" ? "Place glow here" : center ? (gradBg.type === "gradient" ? "Swap colors" : "Reset rotation") : `Point ${padAngle(dx, dy)}°`;
                  return (
                    <button
                      key={`${dx},${dy}`}
                      className={`ed-dir ${padActive(dx, dy) ? "on" : ""}`}
                      onClick={() => onPad(dx, dy)}
                      aria-label={label}
                      title={label}
                    >
                      {gradKind === "radial" ? (
                        <CircleDot size={11} />
                      ) : center ? (
                        gradBg.type === "gradient" ? <ArrowLeftRight size={12} /> : <RotateCcw size={11} />
                      ) : (
                        <ArrowUp size={12} style={{ transform: `rotate(${padAngle(dx, dy)}deg)` }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
          {gradBg.type === "gradient" ? (
            <div className="ed-grad-stops">
              <label className="ed-grad-stop">
                <input type="color" value={gradBg.from} onChange={(e) => patchGrad({ from: e.target.value })} aria-label="Gradient start color" />
                <span>Start</span>
                <b>{gradBg.from.toUpperCase()}</b>
              </label>
              {gradBg.via ? (
                <label className="ed-grad-stop">
                  <input type="color" value={gradBg.via} onChange={(e) => patchGrad({ via: e.target.value })} aria-label="Gradient middle color" />
                  <span>Middle</span>
                  <b>{gradBg.via.toUpperCase()}</b>
                </label>
              ) : null}
              <label className="ed-grad-stop">
                <input type="color" value={gradBg.to} onChange={(e) => patchGrad({ to: e.target.value })} aria-label="Gradient end color" />
                <span>End</span>
                <b>{gradBg.to.toUpperCase()}</b>
              </label>
            </div>
          ) : (
            <div className="ed-mesh-colors">
              <label className="ed-mesh-color" title="Base color">
                <input type="color" value={gradBg.base} onChange={(e) => patchGrad({ base: e.target.value })} aria-label="Mesh base color" />
                <span>Base</span>
              </label>
              {gradBg.blobs.map((blob, i) => (
                <label key={i} className="ed-mesh-color" title={`Color ${i + 1}`}>
                  <input
                    type="color"
                    value={blob.color}
                    onChange={(e) => patchGrad({ blobs: gradBg.blobs.map((x, j) => (j === i ? { ...x, color: e.target.value } : x)) })}
                    aria-label={`Mesh color ${i + 1}`}
                  />
                  <span>{i + 1}</span>
                </label>
              ))}
            </div>
          )}
          {gradBg.type === "gradient" ? (
            <button
              className="ed-grad-toggle ed-grad-mid"
              onClick={() => patchGrad(gradBg.via ? { via: undefined } : { via: "#7c5cff" })}
              title="Add or remove a middle color"
            >
              {gradBg.via ? "Remove middle color" : "+ Middle color"}
            </button>
          ) : null}
          {gradKind !== "radial" ? (
            <Range
              label={gradKind === "mesh" ? "Rotate" : "Angle"}
              value={gradBg.angle ?? 0}
              min={0}
              max={360}
              step={1}
              onChange={(v) => patchGrad({ angle: v })}
            />
          ) : null}
          <Range label="Grain" value={Math.round((gradBg.grain ?? 0) * 100)} min={0} max={100} step={1} onChange={(v) => patchGrad({ grain: v / 100 })} />
          {bg.type === "image" ? (
            <>
              <div className="ed-subhead">Background image</div>
              <Range label="Rotate" value={bg.angle ?? 0} min={0} max={360} step={1} onChange={(v) => update({ background: { type: "image", img: bg.img, angle: v } })} />
            </>
          ) : null}
          </section>

          {mode === "carousel" ? null : mode === "collage" ? collageRight : (<>
          <section className="ed-card">
          <div className="ed-card-title ed-card-title-row">
            <span>Canvas size</span>
            {activeCanvas ? (
              <button className="ed-mini-reset" onClick={() => update({ canvasW: null, canvasH: null })} title="Back to automatic sizing">
                <RotateCcw size={12} /> Auto
              </button>
            ) : null}
          </div>
          <div className="ed-seg" role="group" aria-label="Canvas sizing">
            <button className={!activeCanvas ? "on" : ""} onClick={() => update({ canvasW: null, canvasH: null })}>Auto</button>
            <button
              className={activeCanvas ? "on" : ""}
              onClick={() => {
                if (activeCanvas) return;
                // Seed from what's on screen so switching to custom doesn't jump.
                const w = previewDims?.width ?? 1200;
                const h = previewDims?.height ?? 1200;
                const scale = 1200 / Math.max(w, h);
                update({ canvasW: Math.round(w * scale), canvasH: Math.round(h * scale), canvasDensity: settings.canvasDensity || 1 });
              }}
            >
              Custom
            </button>
          </div>
          {activeCanvas ? (
            <>
              <div className="ed-size-row">
                <label>
                  <span>Width</span>
                  <input
                    type="number" min={16} max={8000} value={settings.canvasW ?? ""}
                    onChange={(e) => update({ canvasW: Math.max(0, Math.round(Number(e.target.value) || 0)) || null })}
                    aria-label="Canvas width in pixels"
                  />
                </label>
                <span className="ed-size-x" aria-hidden="true">×</span>
                <label>
                  <span>Height</span>
                  <input
                    type="number" min={16} max={8000} value={settings.canvasH ?? ""}
                    onChange={(e) => update({ canvasH: Math.max(0, Math.round(Number(e.target.value) || 0)) || null })}
                    aria-label="Canvas height in pixels"
                  />
                </label>
              </div>
              <div className="ed-subhead">Density</div>
              <div className="ed-seg" role="group" aria-label="Pixel density">
                {[1, 2, 3].map((d) => (
                  <button key={d} className={(settings.canvasDensity || 1) === d ? "on" : ""} onClick={() => update({ canvasDensity: d })}>{d}×</button>
                ))}
              </div>
              <p className="ed-hint">
                Exports at <b>{activeCanvas.w * activeCanvas.density} × {activeCanvas.h * activeCanvas.density}px</b>
                {activeCanvas.density > 1 ? ` (${activeCanvas.w} × ${activeCanvas.h} at ${activeCanvas.density}×)` : ""}. The mockup is centred and the background fills the rest.
              </p>
            </>
          ) : (
            <p className="ed-hint">Automatic: the canvas follows the device and padding. Choose <b>Custom</b> to set exact width, height and density.</p>
          )}
          </section>

          <section className="ed-card">
          <div className="ed-card-title ed-card-title-row">
            <span>Adjust</span>
            <button className="ed-mini-reset" onClick={resetAdjust} title="Reset these sliders to default"><RotateCcw size={12} /> Reset</button>
          </div>
          <div className="ed-subhead">Screenshot in frame</div>
          <div className="ed-seg ed-fitseg" role="group" aria-label="Screenshot fit">
            <button className={settings.fit === "cover" ? "on" : ""} onClick={() => fitImage("cover")} title="Scale the screenshot to fill the whole screen (edges may crop)">Fill screen</button>
            <button className={settings.fit === "contain" ? "on" : ""} onClick={() => fitImage("contain")} title="Show the entire screenshot inside the screen">Fit whole image</button>
          </div>
          <Range label="Image scale" value={settings.imageScale} min={0.1} max={3} step={0.01} onChange={(v) => update({ imageScale: v })} />
          <p className="ed-hint">Arrow keys nudge the screenshot inside the frame (Shift for bigger steps).</p>
          <Range label="Padding" value={settings.padding} min={0} max={0.4} step={0.01} onChange={(v) => update({ padding: v })} />
          <Range label="Rotate" value={settings.imageRotate} min={-45} max={45} step={1} onChange={(v) => update({ imageRotate: v })} />
          <Range label="Shadow" value={settings.shadow} min={0} max={1} step={0.02} onChange={(v) => update({ shadow: v })} />
          <Range label="Corner radius" value={settings.cornerRadius} min={0} max={0.3} step={0.01} onChange={(v) => update({ cornerRadius: v })} />
          </section>

          <section className="ed-card">
          <button className="ed-card-title ed-collapse-head" onClick={() => setCollapsed((c) => ({ ...c, threeD: !c.threeD }))} aria-expanded={!collapsed.threeD}>
            <span>3D angle</span>
            {collapsed.threeD ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
          </button>
          {!collapsed.threeD ? (<>
          <button
            className={`ed-dragrotate ${dragRotate ? "on" : ""}`}
            onClick={() => setDragRotate((v) => !v)}
            aria-pressed={dragRotate}
          >
            <Move3d size={14} /> {dragRotate ? "Drag on canvas to rotate — on" : "Free rotate: drag the mockup in 3D"}
          </button>
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
          </>) : null}
          </section>
          </>)}
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
                {premium ? "Premium: up to 4K (3840px) + transparent backgrounds." : <>Free up to {FREE_MAX_EDGE}px · <a href="/pricing" className="ed-prolink">4K &amp; transparent are Premium →</a></>}
              </p>
            </div>
            {mode === "mockup" ? (
              <div className="ed-batch-row">
                <div>
                  <strong>Batch export{premium ? "" : " · Premium"}</strong>
                  <span>Apply this exact frame, background and layers to many screenshots at once and download them as one .zip.</span>
                </div>
                <button
                  className="ed-ghost"
                  onClick={() => { if (premium) { setExportOpen(false); batchFileRef.current?.click(); } else flash("Batch export is a Premium feature."); }}
                  disabled={busy}
                >
                  <Package size={15} /> Choose images…
                </button>
              </div>
            ) : null}
            <div className="ed-modal-actions">
              <button className="ed-ghost" onClick={() => setExportOpen(false)}>Cancel</button>
              <button className="ed-primary" onClick={() => onDownload()} disabled={busy}>
                <Download size={16} /> {busy ? "Working…" : "Download"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {batch ? (
        <div className="ed-modal-backdrop">
          <div className="ed-modal ed-batch-modal" role="dialog" aria-modal="true" aria-label="Batch export">
            <div className="ed-modal-head">
              <h2>{batch.status === "done" ? "Batch export complete" : batch.status === "error" ? "Batch export failed" : "Exporting your mockups"}</h2>
            </div>
            <div className="ed-modal-body">
              {batch.status === "error" ? (
                <p className="ed-hint">{batch.message}</p>
              ) : (
                <>
                  <div className="ed-batch-bar" role="progressbar" aria-valuemin={0} aria-valuemax={batch.total} aria-valuenow={batch.done}>
                    <span style={{ width: `${Math.round((batch.done / Math.max(1, batch.total)) * 100)}%` }} />
                  </div>
                  <p className="ed-batch-status">
                    {batch.status === "done"
                      ? `Saved ${batch.done} mockup${batch.done === 1 ? "" : "s"} to ${batch.current}`
                      : `${batch.done} of ${batch.total} · ${batch.current}`}
                  </p>
                </>
              )}
            </div>
            <div className="ed-modal-actions">
              {batch.status === "running" ? (
                <button className="ed-ghost" onClick={() => { batchCancel.current = true; }}>Cancel</button>
              ) : (
                <button className="ed-primary" onClick={() => setBatch(null)}>Done</button>
              )}
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
        style={{ background: `linear-gradient(90deg, var(--acc) 0 ${pct}%, var(--track) ${pct}% 100%)` }}
      />
    </label>
  );
}

function EditorStyles() {
  return (
    <style jsx global>{`
      .ed { --acc: #f4f5f7; --acc2: #d7dade; --acc-ink: #14161a; --bg: #0b0d0f; --line: rgba(255,255,255,.11); --line-2: rgba(255,255,255,.20); --text: #f4f5f7; --muted: #9ca0a6; --card: rgba(255,255,255,.022); --track: rgba(255,255,255,.14);
        position: fixed; top: 0; left: 0; right: 0; bottom: var(--cc-h, 0); display: flex; flex-direction: column; color: var(--text);
        background: radial-gradient(1200px 700px at 82% -20%, rgba(255,255,255,.05), transparent 60%), var(--bg);
        font-family: "Inter", system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

      /* Standalone theme toggle button gets its own border (not in a group). */
      .ed-theme-toggle { border: 1px solid var(--line); border-radius: 10px; }

      /* ---- Light theme ---- */
      .ed.ed-light { --acc: #16181d; --acc2: #3a3d44; --acc-ink: #ffffff; --bg: #f4f5f7; --line: rgba(15,18,25,.10); --line-2: rgba(15,18,25,.18); --text: #16181d; --muted: #6b7280; --card: #ffffff; --track: rgba(15,18,25,.14);
        background: radial-gradient(1200px 700px at 82% -20%, rgba(15,18,25,.05), transparent 60%), var(--bg); }
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
      .ed-light .ed-url, .ed-light .ed-zoom, .ed-light .ed-angle, .ed-light .ed-reset-flat, .ed-light .ed-layer { background: #fff; }
      .ed-light .ed-seg { background: rgba(15,18,25,.05); }
      .ed-light .ed-textarea, .ed-light .ed-select, .ed-light .ed-color { background: #fff; }
      .ed-light .ed-stage { background: #eceef2; }
      .ed-light .ed-canvas-wrap { filter: drop-shadow(0 20px 45px rgba(15,18,25,.22)); }

      /* Accent-consistent control fills (both themes, site purple) */
      .ed-seg button.on { background: var(--acc); box-shadow: 0 2px 8px rgba(255,255,255,.4); }
      .ed-layer-add button { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.3); color: var(--acc); }
      .ed-layer-add button:hover { background: rgba(255,255,255,.16); }
      .ed-drop:hover, .ed-drop.active { background: rgba(255,255,255,.09); }
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

      /* backdrop-filter makes this a stacking context, so without a z-index the
         rails below would paint over the export dropdown inside it. */
      .ed-top { position: relative; z-index: 50; display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 16px; border-bottom: 1px solid var(--line); background: rgba(12,14,18,.72); backdrop-filter: blur(12px); }
      .ed-brand { display: inline-flex; align-items: center; gap: 9px; text-decoration: none; color: var(--text); }
      .ed-brand img { height: 20px; width: auto; display: block; }
      /* .ed-brand img is class+element, so the variant toggles must out-rank it. */
      .ed-brand img.ed-logo-light { display: none; }
      .ed-light .ed-brand img.ed-logo-dark { display: none; }
      .ed-light .ed-brand img.ed-logo-light { display: block; }
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
      .ed-primary { background: linear-gradient(135deg, var(--acc), var(--acc2)); border: 0; color: #fff; padding: 0 18px; box-shadow: 0 6px 18px rgba(255,255,255,.35); }
      .ed-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(255,255,255,.5); }
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
      .ed-card-title-row > span:first-of-type { margin-right: auto; }
      .ed-mini-reset { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 7px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--muted); font: inherit; font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; cursor: pointer; transition: color .14s ease, border-color .14s ease; }
      .ed-mini-reset:hover { color: var(--text); border-color: var(--line-2); }
      .ed-light .ed-mini-reset { background: #fff; }
      .ed-device { transition: border-color .16s ease, background .16s ease, transform .16s ease; }
      .ed-device:hover { transform: translateY(-1px); }
      .ed-card-title::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 8px rgba(255,255,255,.8); }

      .ed-device-groups { display: flex; flex-direction: column; gap: 13px; }
      .ed-collapse-head { width: 100%; justify-content: space-between; background: transparent; border: 0; padding: 0; cursor: pointer; }
      .ed-collapse-head svg { color: var(--muted); }
      .ed-collapse-head:hover svg { color: var(--text); }
      .ed-elements { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .ed-element { aspect-ratio: 1; display: grid; place-items: center; padding: 9px; border-radius: 10px; background: #eef0f3; border: 1px solid var(--line); color: #1f2937; cursor: pointer; transition: border-color .14s ease, transform .14s ease, box-shadow .14s ease; }
      .ed-element:hover { border-color: var(--acc); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.25); }
      .ed-element-ic { display: block; width: 100%; line-height: 0; }
      .ed-element-ic svg { width: 100%; height: 22px; display: block; }
      .ed-dragrotate { display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 100%; min-height: 34px; padding: 6px 10px; border-radius: 9px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; text-align: center; transition: border-color .14s ease, color .14s ease, background .14s ease; }
      .ed-dragrotate:hover { color: var(--text); border-color: var(--line-2); }
      .ed-dragrotate.on { color: #fff; background: var(--acc); border-color: transparent; }
      .ed-light .ed-dragrotate { background: #fff; }
      .ed-light .ed-dragrotate.on { color: #fff; }
      .ed-el-color { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12px; color: var(--text); }
      .ed-el-color .ed-color { width: 46px; height: 34px; }
      .ed-group { display: flex; flex-direction: column; gap: 7px; }
      .ed-group-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; color: var(--muted); }
      .ed input::placeholder { color: #8b8f96; }
      .ed-light .ed input::placeholder { color: #8a909a; }
      .ed .ed-prolink { color: #f4f5f7; }
      .ed.ed-light .ed-prolink { color: #16181d; }
      .ed.ed-light .ed-seg button:not(.on) { color: #606374; }
      .ed-light .ed-privacy-note { color: rgba(15,18,25,.5); }
      .ed-device-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .ed-device { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 58px; padding: 9px 6px; border-radius: 10px; background: rgba(255,255,255,.03); border: 1px solid var(--line); color: var(--text); font: inherit; cursor: pointer; text-align: center; transition: border-color .14s, background .14s, transform .14s; }
      .ed-device svg { color: var(--muted); transition: color .14s; }
      .ed-device span { font-size: 10.5px; line-height: 1.15; letter-spacing: -.01em; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      .ed-device:hover { border-color: var(--line-2); background: rgba(255,255,255,.06); transform: translateY(-1px); }
      .ed-device.on { border-color: var(--acc) !important; background: rgba(255,255,255,.15) !important; box-shadow: 0 0 0 1px var(--acc) inset; }
      .ed-device.on svg { color: #7db1ff !important; }

      .ed-upload { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; border-radius: 10px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.3); color: #f4f5f7; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .12s; }
      .ed-upload:hover { background: rgba(255,255,255,.16); }
      .ed-url { display: flex; gap: 6px; }
      .ed-url input { flex: 1; min-width: 0; height: 36px; padding: 0 11px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; }
      .ed-url input:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(255,255,255,.2); }
      .ed-url button { height: 36px; padding: 0 13px; border-radius: 9px; background: rgba(255,255,255,.06); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-url button:hover { background: rgba(255,255,255,.1); }
      .ed-hint { font-size: 11px; color: var(--muted); line-height: 1.5; margin: 0; }
      .ed-hint a { color: var(--acc); }

      .ed-stage { position: relative; display: grid; place-items: center; padding: 32px; overflow: hidden;
        background:
          radial-gradient(1100px 560px at 50% -10%, rgba(255,255,255,.035), transparent 62%),
          radial-gradient(circle at center, rgba(255,255,255,.028) 1px, transparent 1px);
        background-size: auto, 24px 24px; }
      .ed-canvas-wrap { position: relative; max-width: 100%; max-height: 100%; transition: transform .12s ease; filter: drop-shadow(0 28px 55px rgba(0,0,0,.5)); }
      /* Crop */
      .ed-crop { position: absolute; inset: 0; z-index: 3; overflow: hidden; touch-action: none; cursor: crosshair; border-radius: 6px; }
      .ed-crop-frame { position: absolute; box-shadow: 0 0 0 9999px rgba(6,8,10,.62); outline: 1.5px solid #fff; cursor: move; }
      .ed-crop-grid { position: absolute; inset: 0; pointer-events: none;
        background:
          linear-gradient(to right, transparent calc(33.333% - .5px), rgba(255,255,255,.45) calc(33.333% - .5px), rgba(255,255,255,.45) calc(33.333% + .5px), transparent calc(33.333% + .5px), transparent calc(66.666% - .5px), rgba(255,255,255,.45) calc(66.666% - .5px), rgba(255,255,255,.45) calc(66.666% + .5px), transparent calc(66.666% + .5px)),
          linear-gradient(to bottom, transparent calc(33.333% - .5px), rgba(255,255,255,.45) calc(33.333% - .5px), rgba(255,255,255,.45) calc(33.333% + .5px), transparent calc(33.333% + .5px), transparent calc(66.666% - .5px), rgba(255,255,255,.45) calc(66.666% - .5px), rgba(255,255,255,.45) calc(66.666% + .5px), transparent calc(66.666% + .5px)); }
      .ed-crop-h { position: absolute; width: 16px; height: 16px; background: #fff; border-radius: 4px; box-shadow: 0 1px 6px rgba(0,0,0,.45); }
      .ed-crop-nw { left: -8px; top: -8px; cursor: nwse-resize; }
      .ed-crop-ne { right: -8px; top: -8px; cursor: nesw-resize; }
      .ed-crop-sw { left: -8px; bottom: -8px; cursor: nesw-resize; }
      .ed-crop-se { right: -8px; bottom: -8px; cursor: nwse-resize; }
      .ed-crop-n, .ed-crop-s { left: 50%; width: 26px; height: 8px; margin-left: -13px; cursor: ns-resize; }
      .ed-crop-n { top: -4px; }
      .ed-crop-s { bottom: -4px; }
      .ed-crop-e, .ed-crop-w { top: 50%; width: 8px; height: 26px; margin-top: -13px; cursor: ew-resize; }
      .ed-crop-e { right: -4px; }
      .ed-crop-w { left: -4px; }
      .ed-cropbar { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); z-index: 6; display: flex; align-items: center; gap: 6px; padding: 5px; border-radius: 14px; background: rgba(18,21,26,.9); border: 1px solid var(--line-2); backdrop-filter: blur(12px); box-shadow: 0 12px 30px rgba(0,0,0,.45); max-width: calc(100% - 24px); overflow-x: auto; }
      .ed-crop-aspects { display: flex; gap: 2px; }
      .ed-crop-aspects button { height: 30px; min-width: 42px; padding: 0 9px; border-radius: 9px; border: 0; background: transparent; color: var(--muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; font-variant-numeric: tabular-nums; }
      .ed-crop-aspects button:hover { color: var(--text); background: rgba(255,255,255,.06); }
      .ed-crop-aspects button.on { background: var(--acc); color: var(--acc-ink); }
      .ed-cropbar-sep { width: 1px; height: 20px; background: var(--line-2); margin: 0 2px; flex: none; }
      .ed-cropbar-btn { display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 11px; border-radius: 9px; border: 1px solid var(--line); background: transparent; color: var(--text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
      .ed-cropbar-btn:hover { border-color: var(--line-2); }
      .ed-cropbar-btn.primary { background: var(--acc); color: var(--acc-ink); border-color: transparent; }
      .ed-light .ed-cropbar { background: rgba(255,255,255,.95); }
      .ed-light .ed-crop-aspects button:hover { background: rgba(15,18,25,.05); }
      .ed-canvas { max-width: 100%; max-height: calc(100vh - 150px); display: block; border-radius: 6px; touch-action: none; cursor: grab; }
      .ed-canvas:active { cursor: grabbing; }
      /* Compact empty-state prompt — floats near the bottom so the device preview stays visible. */
      .ed-drop { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 4;
        display: flex; flex-direction: column; align-items: center; gap: 5px; width: min(240px, 72%); padding: 16px 16px 0; overflow: hidden;
        border: 1.5px dashed rgba(255,255,255,.22); border-radius: 14px; background: rgba(12,16,20,0.86); backdrop-filter: blur(8px); color: #ffffff; cursor: pointer;
        box-shadow: 0 16px 44px rgba(0,0,0,.55); transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease; }
      .ed-privacy-note { position: absolute; left: 50%; bottom: 5px; transform: translateX(-50%); margin: 0; font-size: 10.5px; color: rgba(255,255,255,.4); white-space: nowrap; pointer-events: none; }
      .ed-light .ed-privacy-note { color: rgba(15,18,25,.42); }
      .ed-drop:hover { border-color: var(--acc); transform: translateX(-50%) translateY(-2px); box-shadow: 0 22px 54px rgba(0,0,0,.6); }
      .ed-drop-ic { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; }
      .ed-drop strong { font-size: 14.5px; font-weight: 650; color: #ffffff; letter-spacing: -.01em; }
      .ed-drop-sub { font-size: 11.5px; color: #bec3c9; text-align: center; line-height: 1.4; }
      .ed-drop-sub b { color: #ffffff; text-decoration: underline; font-weight: 650; }
      /* Small window bar at the bottom for an organized, app-like frame. */
      .ed-drop-win { margin-top: 12px; width: calc(100% + 32px); margin-left: -16px; margin-right: -16px;
        display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 7px 13px;
        border-top: 1px solid rgba(255,255,255,.10); background: rgba(255,255,255,.04); }
      .ed-drop-dots { display: inline-flex; gap: 5px; }
      .ed-drop-dots i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.24); }
      .ed-drop-formats { font-size: 10.5px; letter-spacing: .03em; color: rgba(255,255,255,.55); }
      .ed-light .ed-drop { background: rgba(255,255,255,.96); border-color: rgba(15,18,25,.12); box-shadow: 0 16px 40px rgba(15,18,25,.14); color: #16181d; }
      .ed-light .ed-drop strong { color: #16181d; }
      .ed-light .ed-drop-sub { color: #4B617A; }
      .ed-light .ed-drop-sub b { color: #16181d; }
      .ed-light .ed-drop-win { border-top-color: rgba(15,18,25,.10); background: rgba(15,18,25,.03); }
      .ed-light .ed-drop-dots i { background: rgba(15,18,25,.22); }
      .ed-light .ed-drop-formats { color: rgba(15,18,25,.5); }
      .ed-light .ed-drop-ic, .ed-light .ed-drop svg { color: #16181d; }
      /* Full-stage drop target — only while a file is being dragged over the editor. */
      .ed-dragmask { position: absolute; inset: 14px; z-index: 6; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
        border: 2px dashed var(--acc); border-radius: 20px; background: rgba(255,255,255,.10); backdrop-filter: blur(2px); color: var(--text); pointer-events: none; }
      .ed-dragmask svg { color: var(--acc); }
      .ed-dragmask strong { font-size: 16px; font-weight: 650; }
      /* Upload: a docked pill at the bottom of the canvas (replaces the old drop card). */
      .ed-uploadbar { position: absolute; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 5; display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; }
      .ed-upload-btn { pointer-events: auto; display: inline-flex; align-items: center; gap: 9px; height: 46px; padding: 0 24px; border-radius: 999px; border: 0; background: var(--acc); color: var(--acc-ink); font: inherit; font-size: 14px; font-weight: 650; letter-spacing: -.005em; cursor: pointer; box-shadow: 0 1px 0 rgba(255,255,255,.35) inset, 0 12px 32px rgba(0,0,0,.45), 0 0 0 6px rgba(255,255,255,.06); transition: transform .16s ease, box-shadow .16s ease, filter .16s ease; }
      .ed-upload-btn:hover { transform: translateY(-2px); box-shadow: 0 1px 0 rgba(255,255,255,.35) inset, 0 18px 40px rgba(0,0,0,.5), 0 0 0 7px rgba(255,255,255,.08); }
      .ed-upload-btn:active { transform: translateY(0); filter: brightness(.96); }
      .ed-upload-hint { font-size: 11px; color: rgba(255,255,255,.78); white-space: nowrap; padding: 4px 11px; border-radius: 999px; background: rgba(12,14,18,.58); backdrop-filter: blur(8px); }
      .ed-uploadbar.has-image .ed-upload-btn { height: 34px; padding: 0 14px; gap: 7px; font-size: 12px; font-weight: 600; background: rgba(18,21,26,.82); color: var(--text); border: 1px solid var(--line-2); backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,.4); }
      .ed-uploadbar.has-image .ed-upload-btn:hover { background: rgba(28,32,38,.92); }
      .ed-light .ed-upload-btn { box-shadow: 0 12px 32px rgba(15,18,25,.22), 0 0 0 6px rgba(15,18,25,.06); }
      .ed-light .ed-upload-hint { color: rgba(15,18,25,.66); background: rgba(255,255,255,.72); }
      .ed-light .ed-uploadbar.has-image .ed-upload-btn { background: rgba(255,255,255,.92); color: #16181d; }
      @media (max-width: 720px) { .ed-upload-hint { display: none; } }
      .ed-zoom { position: absolute; bottom: 18px; right: 18px; display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 999px; background: rgba(18,21,26,.85); border: 1px solid var(--line); backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,.4); }
      .ed-zoom button { width: 26px; height: 26px; border-radius: 7px; background: rgba(255,255,255,.06); border: 0; color: var(--text); font: inherit; font-size: 15px; cursor: pointer; display: grid; place-items: center; }
      .ed-zoom button:hover { background: rgba(255,255,255,.12); }
      .ed-zoom b { font-size: 12px; min-width: 42px; text-align: center; font-variant-numeric: tabular-nums; }
      .ed-stage-tools { position: absolute; top: 18px; right: 18px; z-index: 6; display: flex; gap: 8px; }
      .ed-tool-toggle { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px; border-radius: 999px; background: rgba(18,21,26,.85); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; backdrop-filter: blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,.4); transition: background .14s ease, border-color .14s ease, color .14s ease; }
      .ed-tool-toggle:hover { border-color: var(--line-2); }
      .ed-tool-toggle.on { background: var(--acc); border-color: transparent; color: #fff; }
      .ed-light .ed-tool-toggle { background: rgba(255,255,255,.92); box-shadow: 0 8px 24px rgba(0,0,0,.12); }
      .ed-light .ed-tool-toggle.on { background: var(--acc); color: #fff; }
      .ed-toast { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); padding: 10px 16px; border-radius: 12px; background: #1c1f24; border: 1px solid var(--line-2); font-size: 13px; color: #f4f5f7; z-index: 30; display: flex; align-items: center; gap: 12px; max-width: calc(100% - 32px); box-shadow: 0 16px 40px rgba(0,0,0,.5); }
      .ed-toast a { color: inherit; font-weight: 650; white-space: nowrap; text-decoration: underline; text-underline-offset: 3px; }
      .ed-light .ed-toast { background: #ffffff; color: #16181d; border-color: rgba(15,18,25,.14); box-shadow: 0 16px 40px rgba(15,18,25,.18); }

      .ed-swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .ed-swatch { aspect-ratio: 1; border-radius: 9px; border: 1px solid var(--line); cursor: pointer; transition: transform .12s; }
      .ed-swatch:hover { transform: scale(1.06); }
      .ed-swatch.on { outline: 2px solid var(--acc); outline-offset: 2px; }
      .ed-showmore { width: 100%; height: 32px; margin-top: 9px; border-radius: 9px; background: rgba(255,255,255,.05); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: border-color .14s ease, background .14s ease; }
      .ed-showmore:hover { border-color: var(--line-2); background: rgba(255,255,255,.08); }
      .ed-light .ed-showmore { background: rgba(15,18,25,.04); }
      .ed-light .ed-showmore:hover { background: rgba(15,18,25,.07); }
      .ed-swatch-alpha { position: relative; background-color: #fff; background-image: linear-gradient(45deg,#bbb 25%,transparent 25%),linear-gradient(-45deg,#bbb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#bbb 75%),linear-gradient(-45deg,transparent 75%,#bbb 75%); background-size: 12px 12px; background-position: 0 0,0 6px,6px -6px,-6px 0; }
      .ed-pro { position: absolute; inset: 0; display: grid; place-items: center; font-size: 8.5px; font-weight: 800; color: #111; background: rgba(255,255,255,.6); border-radius: 8px; }

      .ed-range { display: flex; flex-direction: column; gap: 7px; }
      .ed-range span { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted); }
      .ed-range b { color: var(--text); font-variant-numeric: tabular-nums; font-size: 11px; font-weight: 600; background: rgba(255,255,255,.06); padding: 1px 7px; border-radius: 6px; }
      .ed-range input { width: 100%; height: 5px; border-radius: 999px; -webkit-appearance: none; appearance: none; background: var(--track); cursor: pointer; }
      .ed-range input::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(255,255,255,.28), 0 1px 4px rgba(0,0,0,.4); transition: box-shadow .12s; }
      .ed-range input::-webkit-slider-thumb:hover { box-shadow: 0 0 0 6px rgba(255,255,255,.34), 0 1px 4px rgba(0,0,0,.4); }
      .ed-range input::-moz-range-thumb { width: 16px; height: 16px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(255,255,255,.28); }

      .ed-seg { display: flex; gap: 4px; padding: 3px; background: rgba(0,0,0,.25); border: 1px solid var(--line); border-radius: 10px; }
      .ed-seg button { flex: 1; height: 30px; border-radius: 7px; background: transparent; border: 0; color: var(--muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .12s, color .12s; }
      .ed-seg button:hover { color: var(--text); }
      .ed-seg button.on { background: rgba(255,255,255,.92); color: #fff; box-shadow: 0 2px 8px rgba(255,255,255,.4); }

      .ed-angles { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
      .ed-angle { height: 32px; border-radius: 8px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 11px; font-weight: 500; cursor: pointer; transition: border-color .12s, background .12s; }
      .ed-angle:hover { border-color: var(--line-2); background: rgba(255,255,255,.07); }
      .ed-angle.on { border-color: var(--acc); background: rgba(255,255,255,.16); color: #f4f5f7; }
      .ed-reset-flat { width: 100%; height: 34px; margin-top: 2px; border-radius: 9px; background: rgba(255,255,255,.04); border: 1px solid var(--line); color: var(--muted); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-reset-flat:hover { color: var(--text); border-color: var(--line-2); }

      .ed-remove { display: inline-flex; align-items: center; justify-content: center; gap: 7px; height: 34px; border-radius: 9px; background: #d32f2f; border: 1px solid #d32f2f; color: #ffffff; font: inherit; font-size: 12px; font-weight: 650; cursor: pointer; transition: background .12s ease, border-color .12s ease; }
      .ed-remove:hover { background: #b02525; border-color: #b02525; }
      .ed-layer-add { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .ed-layer-add button { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; border-radius: 9px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.3); color: #f4f5f7; font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
      .ed-layer-add button:hover { background: rgba(255,255,255,.16); }
      .ed-layers { display: flex; flex-direction: column; gap: 5px; }
      .ed-layer { display: flex; align-items: center; gap: 2px; padding: 3px; border-radius: 9px; border: 1px solid transparent; background: rgba(255,255,255,.03); }
      .ed-layer.on { border-color: var(--acc); background: rgba(255,255,255,.12); }
      .ed-layer-main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; background: transparent; border: 0; color: var(--text); font: inherit; font-size: 12px; cursor: pointer; padding: 5px 4px; text-align: left; }
      .ed-layer-main svg { color: var(--muted); flex-shrink: 0; }
      .ed-layer-main span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .ed-layer-ic { width: 24px; height: 26px; display: grid; place-items: center; background: transparent; border: 0; color: var(--muted); cursor: pointer; border-radius: 6px; }
      .ed-layer-ic:hover { background: rgba(255,255,255,.08); color: var(--text); }
      .ed-layer-ic.danger { color: #ef5b60; }
      .ed-layer-ic.danger:hover { background: #d32f2f; color: #ffffff; }
      .ed-layer-base { width: 100%; cursor: pointer; }
      .ed-textarea { width: 100%; resize: vertical; min-height: 48px; padding: 8px 10px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 13px; }
      .ed-textarea:focus { outline: none; border-color: var(--acc); box-shadow: 0 0 0 3px rgba(255,255,255,.2); }
      .ed-select { width: 100%; height: 36px; padding: 0 10px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 13px; cursor: pointer; }
      .ed-select:focus { outline: none; border-color: var(--acc); }
      .ed-row2 { display: grid; grid-template-columns: 1fr 46px; gap: 6px; }
      .ed-color { width: 46px; height: 36px; padding: 2px; border-radius: 9px; background: rgba(0,0,0,.35); border: 1px solid var(--line); cursor: pointer; }
      .ed-subhead { display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 600; color: var(--muted); margin-top: 2px; }
      .ed-custom-grad { display: grid; grid-template-columns: 1fr 42px 42px; gap: 8px; align-items: center; }
      .ed-custom-grad .ed-color { width: 100%; height: 40px; }
      .ed-grad-preview { height: 40px; border-radius: 9px; border: 1px solid var(--line); margin-top: 8px; }
      /* Mode switch (Mockup | Collage) */
      .ed-modes { display: flex; gap: 3px; padding: 3px; border-radius: 12px; background: rgba(255,255,255,.05); border: 1px solid var(--line); }
      .ed-modes button { display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 14px; border-radius: 9px; border: 0; background: transparent; color: var(--muted); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .14s ease, color .14s ease; }
      .ed-modes button:hover { color: var(--text); }
      .ed-modes button.on { background: var(--acc); color: var(--acc-ink); }
      .ed-light .ed-modes { background: rgba(15,18,25,.04); }
      @media (max-width: 720px) { .ed-modes button { padding: 0 10px; } }
      /* Collage */
      .ed-collage-aspects button { flex: 1; font-variant-numeric: tabular-nums; }
      .ed-collage-count { font-weight: 600; font-variant-numeric: tabular-nums; color: var(--muted); text-transform: none; letter-spacing: 0; }
      .ed-layouts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin-top: 8px; }
      .ed-layout { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-width: 0; gap: 5px; padding: 6px 4px 5px; border-radius: 10px; border: 1px solid var(--line); background: rgba(255,255,255,.02); color: var(--muted); cursor: pointer; transition: border-color .14s ease, color .14s ease, transform .14s ease; }
      .ed-layout:hover { border-color: var(--line-2); color: var(--text); transform: translateY(-1px); }
      .ed-layout.on { border-color: var(--acc); color: var(--text); box-shadow: 0 0 0 1px var(--acc) inset; }
      .ed-layout-art { position: relative; width: 100%; aspect-ratio: 1; border-radius: 5px; background: rgba(255,255,255,.04); overflow: hidden; }
      .ed-layout-art i { position: absolute; border-radius: 2px; background: rgba(255,255,255,.34); }
      .ed-layout.on .ed-layout-art i { background: var(--acc); opacity: .85; }
      .ed-layout-art i.circle { border-radius: 50%; }
      .ed-layout-art i.polaroid { background: #f4f1ea; box-shadow: inset 0 0 0 2px #f4f1ea, inset 0 -5px 0 #f4f1ea, 0 1px 3px rgba(0,0,0,.4); }
      .ed-layout-art i.polaroid::after { content: ""; position: absolute; inset: 2px 2px 6px; background: rgba(120,130,150,.55); border-radius: 1px; }
      .ed-layout-name { font-size: 9.5px; font-weight: 600; line-height: 1.2; text-align: center; max-width: 100%; min-height: 22px; white-space: normal; overflow-wrap: anywhere; }
      .ed-light .ed-layout { background: #fff; }
      .ed-light .ed-layout-art { background: rgba(15,18,25,.05); }
      .ed-light .ed-layout-art i { background: rgba(15,18,25,.28); }
      .ed-photo-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; }
      .ed-photo-actions > * { height: 34px; }
      /* Gradient type + direction pad */
      .ed-gradtype { margin-top: 6px; }
      .ed-fitseg { margin-top: 6px; margin-bottom: 4px; }
      .ed-fitseg button { flex: 1; }
      .ed-gradtype button { flex: 1; }
      .ed-grad-editor { display: flex; gap: 10px; align-items: stretch; margin-top: 10px; }
      .ed-grad-editor .ed-grad-preview { flex: 1; height: auto; min-height: 78px; margin-top: 0; }
      .ed-dirpad { display: grid; grid-template-columns: repeat(3, 24px); grid-template-rows: repeat(3, 24px); gap: 3px; flex: none; }
      .ed-dir { display: grid; place-items: center; padding: 0; border-radius: 7px; border: 1px solid var(--line); background: rgba(255,255,255,.03); color: var(--muted); cursor: pointer; transition: background .12s ease, color .12s ease, border-color .12s ease; }
      .ed-dir:hover { color: var(--text); border-color: var(--line-2); }
      .ed-dir.on { background: var(--acc); border-color: transparent; color: var(--acc-ink); }
      .ed-light .ed-dir { background: #fff; }
      .ed-mesh-colors { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-top: 10px; }
      .ed-mesh-color { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; }
      .ed-mesh-color input { width: 100%; height: 28px; padding: 0; border: 1px solid var(--line); border-radius: 7px; background: transparent; cursor: pointer; }
      .ed-mesh-color span { font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
      .ed-grad-mid { width: 100%; margin-top: 8px; justify-content: center; }
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
      .ed-dl-split .ed-primary:hover:not(:disabled) { transform: none; box-shadow: 0 8px 22px rgba(255,255,255,.45); }
      .ed-dl-menu { position: absolute; top: calc(100% + 8px); right: 0; z-index: 30; width: 264px; padding: 14px; border-radius: 14px; background: #16181c; border: 1px solid var(--line-2); box-shadow: 0 24px 60px rgba(0,0,0,.6); display: flex; flex-direction: column; gap: 10px; text-align: left; }
      .ed-dl-menu-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: #b7bcc4; }
      .ed-dl-menu-go { justify-content: center; margin-top: 4px; padding: 0 16px; height: 38px; }
      .ed-url-field { display: block; margin-top: 4px; }
      .ed-url-field input { width: 100%; height: 34px; padding: 0 12px; border-radius: 9px; background: rgba(0,0,0,.25); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 13px; }
      .ed-url-field input::placeholder { color: var(--muted); }
      .ed-url-field input:focus { outline: none; border-color: var(--acc); }
      .ed-light .ed-url-field input { background: #fff; color: #16181d; }
      .ed-size-row { display: flex; align-items: flex-end; gap: 8px; margin-top: 4px; }
      .ed-size-row label { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; font-size: 11.5px; color: var(--muted); }
      .ed-size-row input { width: 100%; min-width: 0; height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(0,0,0,.25); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12.5px; }
      .ed-size-row input:focus { outline: none; border-color: var(--acc); }
      .ed-light .ed-size-row input { background: #fff; color: #16181d; }
      .ed-size-x { padding-bottom: 8px; color: var(--muted); font-size: 12px; }
      .ed-custom-res { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }
      .ed-custom-res input { flex: 1; min-width: 0; height: 32px; padding: 0 10px; border-radius: 8px; background: rgba(0,0,0,.25); border: 1px solid var(--line); color: var(--text); font: inherit; font-size: 12.5px; }
      .ed-custom-res input:focus { outline: none; border-color: var(--acc); }
      .ed-light .ed-custom-res input { background: #fff; color: #16181d; }
      .ed-batch-row { display: flex; align-items: center; gap: 14px; margin: 4px 0 2px; padding: 14px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255,255,255,.03); }
      .ed-batch-row > div { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
      .ed-batch-row strong { font-size: 13px; font-weight: 700; }
      .ed-batch-row span { font-size: 12px; line-height: 1.45; color: var(--muted); }
      .ed-batch-row button { flex: none; white-space: nowrap; }
      .ed-light .ed-batch-row { background: rgba(15,18,25,.03); }
      .ed-batch-modal { max-width: 420px; }
      .ed-batch-bar { height: 8px; border-radius: 999px; background: var(--track); overflow: hidden; }
      .ed-batch-bar span { display: block; height: 100%; border-radius: 999px; background: var(--acc); transition: width .25s ease; }
      .ed-batch-status { margin: 12px 0 0; font-size: 13px; color: var(--muted); overflow-wrap: anywhere; }
      .ed-dl-menu-batch { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 36px; padding: 0 14px; border-radius: 9px; background: transparent; border: 1px solid var(--line-2); color: var(--text); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: border-color .12s, background .12s; }
      .ed-dl-menu-batch:hover { border-color: var(--acc); background: rgba(255,255,255,.04); }
      .ed-dl-menu-batch:disabled { opacity: .5; cursor: default; }
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

      /* ---- White (monochrome) accent — dark text on the light accent, neutral glows ---- */
      .ed-primary { background: var(--acc); color: var(--acc-ink); box-shadow: none; }
      .ed-primary:hover { filter: brightness(.94); }
      .ed-seg button.on { background: var(--acc) !important; color: var(--acc-ink) !important; box-shadow: none !important; }
      .ed-dragrotate.on, .ed-tool-toggle.on, .ed-grad-toggle.on { background: var(--acc); color: var(--acc-ink); }
      .ed-upload { background: rgba(255,255,255,.06); border-color: var(--line-2); color: var(--text); }
      .ed-upload:hover { background: rgba(255,255,255,.11); }
      .ed-light .ed-upload { background: rgba(15,18,25,.05); }
      .ed-light .ed-upload:hover { background: rgba(15,18,25,.09); }
      .ed-card-title::before { box-shadow: none; }
      .ed-layer-add button { background: rgba(255,255,255,.06); border-color: var(--line-2); color: var(--text); }
      .ed-light .ed-layer-add button { background: rgba(15,18,25,.05); }
      .ed-device.on { background: rgba(255,255,255,.12) !important; box-shadow: 0 0 0 1px var(--acc) inset; }
      .ed-light .ed-device.on { background: rgba(15,18,25,.06) !important; }
      .ed-layer.on { background: rgba(255,255,255,.08); }
      .ed-light .ed-layer.on { background: rgba(15,18,25,.05); }
      .ed-angle.on { background: rgba(255,255,255,.12); color: var(--text); }
      .ed-url input:focus, .ed-textarea:focus { box-shadow: 0 0 0 3px rgba(255,255,255,.14); }
      .ed-light .ed-url input:focus, .ed-light .ed-textarea:focus { box-shadow: 0 0 0 3px rgba(15,18,25,.10); }
      .ed-drop-ic { color: var(--text); background: rgba(255,255,255,.10); }
      .ed-light .ed-drop-ic, .ed-light .ed-drop svg { color: #16181d; }
      .ed-dragmask { background: rgba(255,255,255,.06); }
      .ed-prolink, .ed .ed-prolink, .ed.ed-light .ed-prolink { color: var(--text) !important; text-decoration: underline; }
    `}</style>
  );
}
