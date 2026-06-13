"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";
import { toJpeg, toPng } from "html-to-image";
import { signOut, useSession } from "next-auth/react";
import {
  ArrowUpRight,
  Copy,
  Crop,
  Crown,
  Droplet,
  FolderOpen,
  ImagePlus,
  Laptop,
  Link2,
  Layers3,
  Maximize2,
  MonitorUp,
  Palette,
  RotateCcw,
  Share2,
  Moon,
  Square,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Type,
  Unlink,
  Upload,
} from "lucide-react";
import { backgrounds, devices, edgeStyles, effects, shadows, templates } from "@/lib/mockup-data";
import { useMockupStore } from "@/store/useMockupStore";
import type { DevicePreset, TemplatePreset } from "@/lib/types";
import { EasyFrameMark } from "@/components/EasyFrameLogo";
import BrandKit from "@/components/BrandKit";
import BatchExportDialog from "@/components/BatchExportDialog";
import QuickLooks from "@/components/QuickLooks";
import { createZip, dataUrlToBytes } from "@/lib/zip";

type TransformKey =
  | "rotateX"
  | "rotateY"
  | "rotateZ"
  | "zoom"
  | "padding"
  | "borderWidth"
  | "edgeWidth"
  | "cornerRadius"
  | "canvasRadius"
  | "glassAmount"
  | "canvasZoom"
  | "backgroundOpacity"
  | "imageScale"
  | "imageWidthScale"
  | "imageHeightScale"
  | "imageX"
  | "imageY"
  | "imageRotate"
  | "imageOpacity"
  | "imageBlur"
  | "imageBrightness"
  | "imageContrast"
  | "shadowIntensity"
  | "glowIntensity"
  | "backgroundBlur"
  | "noiseAmount"
  | "reflectionIntensity"
  | "innerShadow"
  | "mockupX"
  | "mockupY"
  | "exportWidth"
  | "exportHeight"
  | "exportQuality";

type LocalMockup = {
  id: string;
  name: string;
  url: string;
  kind?: string;
  frameWidth?: number;
  frameHeight?: number;
  screen?: MockupScreen;
};

type MockupScreen = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
};

type MediaAsset = {
  id: string;
  name: string;
  url: string;
};

type StudioLayerKind = "text" | "badge" | "arrow" | "rect" | "ellipse" | "highlight" | "blur";

type StudioLayer = {
  id: string;
  kind: StudioLayerKind;
  label: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity?: number;
  color: string;
  background: string;
  fontFamily?: string;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  textShadowBlur?: number;
  textShadowX?: number;
  textShadowY?: number;
  textShadowOpacity?: number;
  textShadowColor?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  blurAmount?: number;
  lineStyle?: "solid" | "dashed" | "dotted";
  hidden?: boolean;
};

type ExtraMediaSlot = {
  id: string;
  name: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  framed: boolean;
  fit: "cover" | "contain";
  blur: number;
  brightness: number;
  contrast: number;
  hidden?: boolean;
};

type StudioSnapshot = {
  mediaItems: MediaAsset[];
  studioLayers: StudioLayer[];
  extraMediaSlots: ExtraMediaSlot[];
  selectedLayerId: string | null;
  selectedSlotId: string | null;
};

type BackgroundMode = "preset" | "transparent" | "solid" | "image" | "url" | "custom-gradient";

type AccessSummary = {
  hasAccess: boolean;
  planType: "trial" | "monthly" | "yearly" | "lifetime" | "free";
  status: string;
  exportCount: number;
  exportsRemaining: number | null;
  expiresAt: string | null;
};

type ExportConsumePayload = {
  access?: AccessSummary;
  error?: string;
  redirectTo?: string;
};

type FontOption = {
  label: string;
  family: string;
  url?: string;
};

const colorPalette = ["#ffffff", "#151713", "#f12b8f", "#6d5dfc", "#09c6f9", "#ff7b54", "#2fbf71", "#f7f4ec"];

const fallbackFontOptions: FontOption[] = [
  { label: "Inter", family: "Inter" },
  { label: "Georgia", family: "Georgia" },
  { label: "Arial", family: "Arial" },
  { label: "Courier", family: "Courier New" }
];

const exportPresets = [
  { label: "1080p", width: 1920, height: 1080 },
  { label: "1440p", width: 2560, height: 1440 },
  { label: "4K", width: 3840, height: 2160 },
  { label: "Square", width: 2000, height: 2000 },
  { label: "Story", width: 1080, height: 1920 }
];

const draftStorageKey = "easyframe-studio-draft-v2";
const trialExportLimit = 5;
const defaultFrameScreen: MockupScreen = { x: 7.2, y: 3.2, width: 85.6, height: 93.6, radius: 8 };

const presentPresets = [
  { id: "default", name: "Default", rotateX: 0, rotateY: 0, rotateZ: 0, zoom: 82 },
  { id: "left-depth", name: "Left Depth", rotateX: 15, rotateY: 20, rotateZ: -9, zoom: 85 },
  { id: "right-depth", name: "Right Depth", rotateX: 15, rotateY: -20, rotateZ: 10, zoom: 85 },
  { id: "axis-drift", name: "Axis Drift", rotateX: 2, rotateY: -6, rotateZ: -4, zoom: 92 },
  { id: "axis-stage-left", name: "Axis Stage L", rotateX: 42, rotateY: 12, rotateZ: -18, zoom: 92 },
  { id: "axis-front", name: "Axis Front", rotateX: 24, rotateY: 0, rotateZ: 0, zoom: 92 }
];

const layoutPresets = [
  { id: "side-by-side", name: "Side by Side", rotateX: 0, rotateY: 0, rotateZ: 0, zoom: 82, slots: [{ x: 74, y: 50, scale: 36, rotation: 0 }] },
  { id: "depth-duo", name: "Depth Duo", rotateX: 0, rotateY: -18, rotateZ: 0, zoom: 86, slots: [{ x: 72, y: 62, scale: 34, rotation: 0 }] },
  { id: "fan-out", name: "Fan Out", rotateX: 0, rotateY: 0, rotateZ: -13, zoom: 78, slots: [{ x: 73, y: 50, scale: 35, rotation: 14 }] },
  { id: "scatter", name: "Scatter", rotateX: 0, rotateY: 0, rotateZ: -9, zoom: 78, slots: [{ x: 28, y: 72, scale: 32, rotation: -10 }, { x: 74, y: 32, scale: 30, rotation: 8 }] },
  { id: "cascade", name: "Cascade", rotateX: 0, rotateY: 0, rotateZ: -16, zoom: 84, slots: [{ x: 50, y: 42, scale: 32, rotation: 0 }, { x: 78, y: 54, scale: 30, rotation: 16 }] },
  { id: "stacked", name: "Stacked", rotateX: 0, rotateY: 0, rotateZ: -16, zoom: 78, slots: [{ x: 67, y: 54, scale: 34, rotation: 9 }] }
];

const enhancementPresets = [
  { id: "auto", name: "Auto", blur: 0, brightness: 106, contrast: 108 },
  { id: "vivid", name: "Vivid", blur: 0, brightness: 110, contrast: 124 },
  { id: "soft", name: "Soft", blur: 0, brightness: 104, contrast: 92 },
  { id: "dramatic", name: "Dramatic", blur: 0, brightness: 92, contrast: 142 },
  { id: "sharp", name: "Sharp", blur: 0, brightness: 104, contrast: 132 }
];

export default function MockupStudio() {
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const backgroundFileRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: session, status: sessionStatus } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const [access, setAccess] = useState<AccessSummary | null>(null);
  const [localTrialExportCount, setLocalTrialExportCount] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [studioReady, setStudioReady] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaAsset[]>([]);
  const [studioLayers, setStudioLayers] = useState<StudioLayer[]>([]);
  const [brandOpen, setBrandOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [extraMediaSlots, setExtraMediaSlots] = useState<ExtraMediaSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState("");
  const [projectFonts, setProjectFonts] = useState<FontOption[]>([]);
  const [historyPast, setHistoryPast] = useState<StudioSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<StudioSnapshot[]>([]);
  const {
    deviceId,
    backgroundId,
    backgroundMode,
    backgroundColor,
    customGradientColors,
    backgroundImageUrl,
    backgroundOpacity,
    edgeStyleId,
    shadowId,
    effectId,
    borderColor,
    glowColor,
    shadowColor,
    glassColor,
    vignetteColor,
    edgeColor,
    borderWidth,
    edgeWidth,
    cornerRadius,
    canvasRadius,
    glassAmount,
    canvasZoom,
    imageScale,
    imageFitMode,
    imageAspectLinked,
    imageWidthScale,
    imageHeightScale,
    imageX,
    imageY,
    imageRotate,
    imageOpacity,
    imageBlur,
    imageBrightness,
    imageContrast,
    shadowIntensity,
    glowIntensity,
    backgroundBlur,
    noiseAmount,
    reflectionIntensity,
    innerShadow,
    mockupX,
    mockupY,
    selectedMockupUrl,
    selectedMockupName,
    exportFormat,
    exportWidth,
    exportHeight,
    exportQuality,
    theme,
    mediaUrl,
    mediaName,
    rotateX,
    rotateY,
    rotateZ,
    zoom,
    padding,
    aiPrompt,
    isGenerating,
    setDevice,
    setBackground,
    setBackgroundMode,
    setBackgroundColor,
    setCustomGradientColors,
    setBackgroundImage,
    setEdgeStyle,
    setShadow,
    setEffect,
    setBorderColor,
    setGlowColor,
    setShadowColor,
    setGlassColor,
    setVignetteColor,
    setEdgeColor,
    setSelectedMockup,
    setExportFormat,
    setExportSize,
    setTheme,
    setMedia,
    setImageFitMode,
    setImageAspectLinked,
    setTransform,
    applyTemplate,
    startOver,
    setAiPrompt
  } = useMockupStore();

  const device = useMemo(() => devices.find((item) => item.id === deviceId) ?? devices[0], [deviceId]);
  const canvasRatio = exportWidth / exportHeight;
  const background = useMemo(() => backgrounds.find((item) => item.id === backgroundId) ?? backgrounds[0], [backgroundId]);
  const backgroundCss = useMemo(() => {
    if (backgroundMode === "transparent") return "transparent";
    if (backgroundMode === "solid") return backgroundColor;
    if (backgroundMode === "custom-gradient") return `linear-gradient(135deg, ${customGradientColors[0]} 0%, ${customGradientColors[1]} 52%, ${customGradientColors[2]} 100%)`;
    if ((backgroundMode === "image" || backgroundMode === "url") && backgroundImageUrl) return `url("${backgroundImageUrl}") center / cover no-repeat`;
    return background.css;
  }, [background.css, backgroundColor, backgroundImageUrl, backgroundMode, customGradientColors]);
  const isTransparentBackground = backgroundMode === "transparent";
  const edgeStyle = useMemo(() => edgeStyles.find((item) => item.id === edgeStyleId) ?? edgeStyles[0], [edgeStyleId]);
  const shadow = useMemo(() => shadows.find((item) => item.id === shadowId) ?? shadows[0], [shadowId]);
  const effect = useMemo(() => effects.find((item) => item.id === effectId) ?? effects[0], [effectId]);
  const resolvedShadow = useMemo(
    () => buildShadow(shadow.shadow, shadowIntensity, glowIntensity, effectId, shadowColor, glowColor),
    [shadow.shadow, shadowIntensity, glowIntensity, effectId, shadowColor, glowColor]
  );
  const localTrialKey = useMemo(() => {
    const userKey = session?.user?.email || session?.user?.id || "anonymous";
    return `easyframe-trial-exports:${userKey}`;
  }, [session?.user?.email, session?.user?.id]);
  const effectiveAccess = useMemo(() => {
    if (!access || access.planType !== "trial") return access;
    const countedExports = Math.max(access.exportCount, localTrialExportCount ?? access.exportCount);
    const exportsRemaining = Math.max(0, trialExportLimit - countedExports);
    return {
      ...access,
      exportCount: countedExports,
      exportsRemaining,
      hasAccess: access.hasAccess && exportsRemaining > 0,
      status: exportsRemaining <= 0 ? "trial_limit_reached" : access.status
    };
  }, [access, localTrialExportCount]);
  const [localMockups, setLocalMockups] = useState<LocalMockup[]>([]);
  const selectedMockup = useMemo(() => localMockups.find((mockup) => mockup.url === selectedMockupUrl) ?? null, [localMockups, selectedMockupUrl]);
  const [isPreviewFull, setIsPreviewFull] = useState(false);
  const trialLimitReached = effectiveAccess?.planType === "trial" && (effectiveAccess.exportsRemaining ?? 0) <= 0;
  const exportDisabled = isExporting || effectiveAccess == null || (effectiveAccess.hasAccess === false && !trialLimitReached);
  const exportUpgradeMode = trialLimitReached;
  const selectedLayer = studioLayers.find((layer) => layer.id === selectedLayerId) ?? null;
  const selectedSlot = extraMediaSlots.find((slot) => slot.id === selectedSlotId) ?? null;
  const fontOptions = useMemo(() => {
    const seen = new Set<string>();
    return [...projectFonts, ...fallbackFontOptions].filter((font) => {
      if (seen.has(font.family)) return false;
      seen.add(font.family);
      return true;
    });
  }, [projectFonts]);
  const defaultTextFont = fontOptions[0]?.family ?? "Inter";

  const captureStudioSnapshot = (): StudioSnapshot => ({
    mediaItems,
    studioLayers,
    extraMediaSlots,
    selectedLayerId,
    selectedSlotId
  });

  const rememberStudioState = () => {
    setHistoryPast((items) => [...items.slice(-49), captureStudioSnapshot()]);
    setHistoryFuture([]);
  };

  const restoreStudioSnapshot = (snapshot: StudioSnapshot) => {
    setMediaItems(snapshot.mediaItems);
    setStudioLayers(snapshot.studioLayers);
    setExtraMediaSlots(snapshot.extraMediaSlots);
    setSelectedLayerId(snapshot.selectedLayerId);
    setSelectedSlotId(snapshot.selectedSlotId);
  };

  useEffect(() => {
    let alive = true;
    fetch("/api/mockups/devices")
      .then((response) => response.json())
      .then((data: { mockups?: LocalMockup[] }) => {
        if (alive) setLocalMockups(data.mockups ?? []);
      })
      .catch(() => {
        if (alive) setLocalMockups([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
      if (randomBackground) setBackground(randomBackground.id);
      timer = window.setTimeout(() => setStudioReady(true), 180);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timer) window.clearTimeout(timer);
    };
  }, [setBackground]);

  useEffect(() => {
    let alive = true;
    fetch("/api/fonts", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { fonts?: FontOption[] }) => {
        if (alive) setProjectFonts(data.fonts ?? []);
      })
      .catch(() => {
        if (alive) setProjectFonts([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const refreshAccess = async () => {
    if (sessionStatus === "unauthenticated") {
      setAccess(null);
      return;
    }

    try {
      const response = await fetch("/api/account/access", { cache: "no-store" });
      if (!response.ok) return;
      setAccess((await response.json()) as AccessSummary);
    } catch (error) {
      console.error("Failed to load access status", error);
    }
  };

  useEffect(() => {
    if (sessionStatus !== "loading") {
      void refreshAccess();
    }
  }, [sessionStatus]);

  useEffect(() => {
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!access || access.planType !== "trial") {
      setLocalTrialExportCount(null);
      if (access?.hasAccess) localStorage.removeItem(localTrialKey);
      return;
    }

    const stored = Number(localStorage.getItem(localTrialKey) ?? "0");
    const nextCount = Math.max(Number.isFinite(stored) ? stored : 0, access.exportCount);
    localStorage.setItem(localTrialKey, String(nextCount));
    setLocalTrialExportCount(nextCount);
  }, [access, localTrialKey]);

  const shareApp = async () => {
    await navigator.clipboard?.writeText("https://www.easyframe.app/");
  };

  const addMediaAsset = (url: string, name: string) => {
    rememberStudioState();
    const asset = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      url
    };
    setMediaItems((items) => [asset, ...items]);
    setMedia(asset.url, asset.name);
    setImageFitMode("fit");
    setImageAspectLinked(true);
    setTransform("imageWidthScale", 100);
    setTransform("imageHeightScale", 100);
    setTransform("imageScale", 100);
    setTransform("imageX", 0);
    setTransform("imageY", 0);
    setTransform("mockupX", 0);
    setTransform("mockupY", 0);
  };

  const handleFiles = (files?: FileList | null) => {
    if (!files?.length) return;
    rememberStudioState();
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const asset = {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          url: String(reader.result)
        };
        setMediaItems((items) => [asset, ...items]);
        if (index === 0) {
          setMedia(asset.url, asset.name);
          setImageFitMode("fit");
          setImageAspectLinked(true);
          setTransform("imageWidthScale", 100);
          setTransform("imageHeightScale", 100);
          setTransform("imageScale", 100);
          setTransform("imageX", 0);
          setTransform("imageY", 0);
          setTransform("mockupX", 0);
          setTransform("mockupY", 0);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const selectMediaAsset = (asset: MediaAsset) => {
    if (mediaUrl === asset.url) {
      setMedia(null, null);
      return;
    }
    setMedia(asset.url, asset.name);
  };

  const removeMediaAsset = (assetId: string) => {
    rememberStudioState();
    setMediaItems((items) => {
      const removing = items.find((item) => item.id === assetId);
      const nextItems = items.filter((item) => item.id !== assetId);
      if (removing?.url === mediaUrl) {
        const nextActive = nextItems[0];
        setMedia(nextActive?.url ?? null, nextActive?.name ?? null);
      }
      return nextItems;
    });
  };

  const addExtraMediaSlot = (asset: MediaAsset) => {
    if (extraMediaSlots.length >= 3) {
      alert("You can add up to 3 extra screenshots on the canvas.");
      return;
    }
    rememberStudioState();
    const slotDefaults = [
      { x: 24, y: 72, scale: 34, rotation: -8 },
      { x: 76, y: 30, scale: 32, rotation: 7 },
      { x: 78, y: 74, scale: 28, rotation: 3 }
    ];
    const defaults = slotDefaults[extraMediaSlots.length] ?? slotDefaults[0];
    const nextSlot: ExtraMediaSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: asset.name,
      url: asset.url,
      ...defaults,
      opacity: 100,
      framed: true,
      fit: "cover",
      blur: 0,
      brightness: 100,
      contrast: 100
    };
    setExtraMediaSlots((slots) => [...slots, nextSlot]);
    setSelectedSlotId(nextSlot.id);
    setSelectedLayerId(null);
  };

  const updateExtraMediaSlot = (id: string, patch: Partial<ExtraMediaSlot>) => {
    setExtraMediaSlots((slots) => slots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)));
  };

  const removeExtraMediaSlot = (id: string) => {
    rememberStudioState();
    setExtraMediaSlots((slots) => slots.filter((slot) => slot.id !== id));
    setSelectedSlotId((current) => (current === id ? null : current));
  };

  const moveExtraMediaSlot = (id: string, direction: "up" | "down") => {
    setExtraMediaSlots((slots) => moveArrayItem(slots, id, direction));
  };

  const addStudioLayer = (kind: StudioLayerKind) => {
    rememberStudioState();
    const layerDefaults: Partial<Record<StudioLayerKind, Partial<StudioLayer>>> = {
      text: { label: "Made with EasyFrame.App", color: "#fffaf2", background: "transparent", size: 42, rotation: 0, x: 50, y: 18, opacity: 100, fontFamily: defaultTextFont, fontWeight: 950, align: "center", letterSpacing: 0, lineHeight: 110, textShadowBlur: 22, textShadowX: 0, textShadowY: 10, textShadowOpacity: 38, textShadowColor: "#000000" },
      badge: { label: "New feature", color: "#151713", background: "#9ef2c8", size: 18, rotation: 0, x: 50, y: 82, opacity: 100, fontFamily: defaultTextFont, fontWeight: 900, align: "center", letterSpacing: 0, lineHeight: 110, textShadowBlur: 0, textShadowX: 0, textShadowY: 0, textShadowOpacity: 0, textShadowColor: "#000000" },
      arrow: { label: "→", color: "#fffaf2", background: "transparent", size: 82, rotation: -12, x: 70, y: 50 }
    };
    const nextLayer: StudioLayer = {
      id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      kind,
      label: "",
      color: kind === "ellipse" ? "#9ef2c8" : kind === "highlight" ? "#fff25f" : "#fffaf2",
      background: kind === "badge" ? "#9ef2c8" : kind === "highlight" ? "rgba(255,242,95,0.34)" : kind === "blur" ? "rgba(15,15,14,0.5)" : "transparent",
      size: kind === "arrow" ? 82 : 22,
      rotation: kind === "arrow" ? -12 : 0,
      x: 50,
      y: kind === "badge" ? 82 : kind === "text" ? 18 : 50,
      opacity: kind === "highlight" ? 80 : 100,
      fontFamily: kind === "arrow" ? "Georgia" : defaultTextFont,
      fontWeight: 900,
      align: "center",
      letterSpacing: 0,
      lineHeight: 110,
      textShadowBlur: 0,
      textShadowX: 0,
      textShadowY: 0,
      textShadowOpacity: 0,
      textShadowColor: "#000000",
      width: kind === "highlight" ? 36 : kind === "blur" ? 34 : 30,
      height: kind === "highlight" ? 10 : kind === "blur" ? 16 : 20,
      strokeWidth: kind === "highlight" || kind === "blur" ? 0 : 3,
      blurAmount: kind === "blur" ? 10 : 0,
      lineStyle: "solid",
      ...layerDefaults[kind]
    };
    setStudioLayers((layers) => [...layers, nextLayer]);
    setSelectedLayerId(nextLayer.id);
    setSelectedSlotId(null);
  };

  const updateStudioLayer = (id: string, patch: Partial<StudioLayer>) => {
    setStudioLayers((layers) => layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)));
  };

  const removeStudioLayer = (id: string) => {
    rememberStudioState();
    setStudioLayers((layers) => layers.filter((layer) => layer.id !== id));
    setSelectedLayerId((current) => (current === id ? null : current));
  };

  const moveStudioLayer = (id: string, direction: "up" | "down") => {
    setStudioLayers((layers) => moveArrayItem(layers, id, direction));
  };

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addMediaAsset(String(reader.result), file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBackgroundImage(String(reader.result));
      setBackgroundMode("image");
    };
    reader.readAsDataURL(file);
  };

  const addMediaFromUrl = () => {
    const url = mediaUrlInput.trim();
    if (!url) return;
    rememberStudioState();
    addMediaAsset(url, new URL(url, window.location.href).hostname || "Remote image");
    setMediaUrlInput("");
  };

  const applyPresentPreset = (presetId: string) => {
    const preset = presentPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setTransform("rotateX", preset.rotateX);
    setTransform("rotateY", preset.rotateY);
    setTransform("rotateZ", preset.rotateZ);
    setTransform("zoom", preset.zoom);
  };

  const applyLayoutPreset = (presetId: string) => {
    const preset = layoutPresets.find((item) => item.id === presetId);
    if (!preset) return;
    const slotSources = mediaItems.filter((item) => item.url !== mediaUrl);
    const fallbackSource = mediaItems.find((item) => item.url === mediaUrl) ?? mediaItems[0];
    if (!fallbackSource) {
      alert("Add at least one image before using multi-screenshot layouts.");
      return;
    }
    rememberStudioState();
    setTransform("rotateX", preset.rotateX);
    setTransform("rotateY", preset.rotateY);
    setTransform("rotateZ", preset.rotateZ);
    setTransform("zoom", preset.zoom);
    const nextSlots = preset.slots.map((slot, index) => {
      const source = slotSources[index] ?? fallbackSource;
      return {
        id: `slot-${preset.id}-${Date.now()}-${index}`,
        name: source.name,
        url: source.url,
        x: slot.x,
        y: slot.y,
        scale: slot.scale,
        rotation: slot.rotation,
        opacity: 100,
        framed: true,
        fit: "cover" as const,
        blur: 0,
        brightness: 100,
        contrast: 100
      };
    });
    setExtraMediaSlots(nextSlots);
    setSelectedSlotId(nextSlots[0]?.id ?? null);
    setSelectedLayerId(null);
  };

  const applyEnhancementPreset = (presetId: string) => {
    const preset = enhancementPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setTransform("imageBlur", preset.blur);
    setTransform("imageBrightness", preset.brightness);
    setTransform("imageContrast", preset.contrast);
  };

  const applyAutoBackdrop = async () => {
    if (!mediaUrl) {
      alert("Add a screenshot first, then EasyFrame can sample an automatic backdrop.");
      return;
    }
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = mediaUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 24;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, 24, 24);
      const pixels = context.getImageData(0, 0, 24, 24).data;
      let r = 0;
      let g = 0;
      let b = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        r += pixels[index];
        g += pixels[index + 1];
        b += pixels[index + 2];
      }
      const count = pixels.length / 4;
      setBackgroundColor(rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count)));
      setBackgroundMode("solid");
      setTransform("backgroundOpacity", 100);
    } catch (error) {
      console.error("Auto backdrop failed", error);
      alert("Auto backdrop needs an uploaded image or a remote image that allows browser sampling.");
    }
  };

  const shareExportImage = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await renderExportDataUrl("png");
      if (!dataUrl) return;
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "easyframe-share.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "EasyFrame mockup", files: [file] });
        return;
      }
      await navigator.clipboard.writeText(dataUrl);
      alert("Share image data copied. Configure cloud share storage to create public URLs.");
    } catch (error) {
      console.error("Share failed", error);
      alert("Share failed in this browser.");
    } finally {
      setIsExporting(false);
    }
  };

  const undoStudio = () => {
    const previous = historyPast.at(-1);
    if (!previous) return;
    setHistoryPast((items) => items.slice(0, -1));
    setHistoryFuture((items) => [captureStudioSnapshot(), ...items].slice(0, 50));
    restoreStudioSnapshot(previous);
  };

  const redoStudio = () => {
    const next = historyFuture[0];
    if (!next) return;
    setHistoryFuture((items) => items.slice(1));
    setHistoryPast((items) => [...items.slice(-49), captureStudioSnapshot()]);
    restoreStudioSnapshot(next);
  };

  const consumeExportAccess = async () => {
    if (exportUpgradeMode) {
      window.location.href = "/pricing?reason=trial-ended";
      return false;
    }
    if (exportDisabled) {
      alert(
        access == null
          ? "Checking your plan. Try exporting again in a moment."
          : trialLimitReached
            ? "Your free trial includes 5 exports. Choose monthly or lifetime access to unlock unlimited exports."
            : "An active plan is required before exporting."
      );
      return false;
    }

    try {
      const consumeResponse = await fetch("/api/export/consume", { method: "POST" });
      const payload = await consumeResponse.json().catch(() => null) as ExportConsumePayload | null;
      if (!consumeResponse.ok) {
        if (payload?.access) setAccess(payload.access);
        if (payload?.redirectTo) {
          window.location.href = payload.redirectTo;
          return false;
        }
        alert(payload?.error ?? "Export limit reached. Choose monthly or lifetime access to continue exporting.");
        return false;
      }
      if (payload?.access) setAccess(payload.access);
      return true;
    } catch (error) {
      if (effectiveAccess?.planType !== "trial") {
        return Boolean(effectiveAccess?.hasAccess);
      }

      const currentCount = Math.max(effectiveAccess.exportCount, localTrialExportCount ?? 0);
      if (currentCount >= trialExportLimit) {
        const exhaustedAccess = { ...effectiveAccess, hasAccess: false, exportsRemaining: 0, status: "trial_limit_reached" };
        setAccess(exhaustedAccess);
        localStorage.setItem(localTrialKey, String(trialExportLimit));
        setLocalTrialExportCount(trialExportLimit);
        window.location.href = "/pricing?reason=trial-ended";
        return false;
      }

      const nextCount = currentCount + 1;
      localStorage.setItem(localTrialKey, String(nextCount));
      setLocalTrialExportCount(nextCount);
      setAccess({
        ...effectiveAccess,
        exportCount: nextCount,
        exportsRemaining: Math.max(0, trialExportLimit - nextCount),
        hasAccess: nextCount < trialExportLimit,
        status: nextCount >= trialExportLimit ? "trial_limit_reached" : effectiveAccess.status
      });
      return true;
    }
  };

  const updateExportProgress = async (value: number) => {
    setExportProgress(value);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  };

  const renderExportDataUrl = async (format: "png" | "jpg" | "webp" = exportFormat) => {
    if (!stageRef.current) return null;
    await updateExportProgress(28);
    const exportBackground = format === "png" && (isTransparentBackground || canvasRadius > 0) ? undefined : theme === "dark" ? "#111312" : "#f4f1e8";
    await updateExportProgress(42);
    const sourceDataUrl = format === "jpg"
        ? await toJpeg(stageRef.current, {
            quality: exportQuality / 100,
            pixelRatio: 3,
            cacheBust: true,
            backgroundColor: exportBackground,
            filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === "true")
          })
        : await toPng(stageRef.current, {
            pixelRatio: 3,
            cacheBust: true,
            backgroundColor: exportBackground,
            filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === "true")
          });
    await updateExportProgress(82);
    return resizeExport(sourceDataUrl, exportWidth, exportHeight, format, exportQuality, canvasRadius);
  };

  const exportImage = async () => {
    setIsExporting(true);
    setExportProgress(8);
    try {
      if (!(await consumeExportAccess())) return;
      const safeFormat = canvasRadius > 0 && exportFormat !== "png" ? "png" : exportFormat;
      const dataUrl = await renderExportDataUrl(safeFormat);
      if (!dataUrl) return;
      await updateExportProgress(94);
      const link = document.createElement("a");
      link.download = `easyframe-export.${safeFormat}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportProgress(100);
    } catch (error) {
      console.error("Export failed", error);
      alert("Export failed. Try a different image or refresh the page, then export again.");
    } finally {
      window.setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 350);
    }
  };

  const exportBatch = async (
    ids: string[],
    onProgress: (progress: { done: number; total: number; label: string }) => void
  ) => {
    if (!stageRef.current || !ids.length) return;
    if (!(await consumeExportAccess())) return;
    // Snapshot the current design so we can restore it after re-laying-out per format.
    const snapshot = { ...useMockupStore.getState() };
    const files: { name: string; bytes: Uint8Array }[] = [];
    try {
      for (let index = 0; index < ids.length; index += 1) {
        const id = ids[index];
        const template = templates.find((item) => item.id === id);
        onProgress({ done: index, total: ids.length, label: template?.label ?? "Rendering" });
        applyTemplate(id);
        // Let React commit the new aspect ratio and CSS transitions settle before capture.
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        await new Promise<void>((resolve) => window.setTimeout(resolve, 240));
        const node = stageRef.current;
        if (!node) continue;
        const state = useMockupStore.getState();
        const exportBackground =
          state.backgroundMode === "transparent" || state.canvasRadius > 0
            ? undefined
            : state.theme === "dark"
              ? "#111312"
              : "#f4f1e8";
        const sourceDataUrl = await toPng(node, {
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: exportBackground,
          filter: (filterNode) => !(filterNode instanceof HTMLElement && filterNode.dataset.exportIgnore === "true")
        });
        const finalUrl = await resizeExport(
          sourceDataUrl,
          state.exportWidth,
          state.exportHeight,
          "png",
          state.exportQuality,
          state.canvasRadius
        );
        const safeName = `${template?.platform ?? "easyframe"}-${template?.label ?? id}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        files.push({ name: `${safeName}-${state.exportWidth}x${state.exportHeight}.png`, bytes: dataUrlToBytes(finalUrl) });
      }
      onProgress({ done: ids.length, total: ids.length, label: "Packaging zip" });
      const zipBlob = createZip(files);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "easyframe-batch.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Batch export failed", error);
      alert("Batch export failed. Try selecting fewer formats, then export again.");
    } finally {
      // Restore the original design exactly as it was before the batch run.
      useMockupStore.setState(snapshot);
    }
  };

  const copyExportImage = async () => {
    setIsExporting(true);
    setExportProgress(8);
    try {
      if (!(await consumeExportAccess())) return;
      const dataUrl = await renderExportDataUrl("png");
      if (!dataUrl) return;
      await updateExportProgress(92);
      const blob = await (await fetch(dataUrl)).blob();
      if ("ClipboardItem" in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        setExportProgress(100);
        alert("Copied PNG to clipboard.");
        return;
      }
      const link = document.createElement("a");
      link.download = "easyframe-export.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setExportProgress(100);
    } catch (error) {
      console.error("Copy failed", error);
      alert("Copy failed. Your browser may require HTTPS or clipboard permission.");
    } finally {
      window.setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 350);
    }
  };

  const saveDraft = () => {
    const state = useMockupStore.getState();
    const draft = {
      savedAt: new Date().toISOString(),
      mediaItems,
      studioLayers,
      extraMediaSlots,
      selectedLayerId,
      selectedSlotId,
      store: {
        deviceId: state.deviceId,
        backgroundId: state.backgroundId,
        backgroundMode: state.backgroundMode,
        backgroundColor: state.backgroundColor,
        customGradientColors: state.customGradientColors,
        backgroundImageUrl: state.backgroundImageUrl,
        backgroundOpacity: state.backgroundOpacity,
        edgeStyleId: state.edgeStyleId,
        shadowId: state.shadowId,
        effectId: state.effectId,
        borderColor: state.borderColor,
        glowColor: state.glowColor,
        shadowColor: state.shadowColor,
        glassColor: state.glassColor,
        vignetteColor: state.vignetteColor,
        edgeColor: state.edgeColor,
        borderWidth: state.borderWidth,
        edgeWidth: state.edgeWidth,
        cornerRadius: state.cornerRadius,
        canvasRadius: state.canvasRadius,
        glassAmount: state.glassAmount,
        canvasZoom: state.canvasZoom,
        imageScale: state.imageScale,
        imageFitMode: state.imageFitMode,
        imageAspectLinked: state.imageAspectLinked,
        imageWidthScale: state.imageWidthScale,
        imageHeightScale: state.imageHeightScale,
        imageX: state.imageX,
        imageY: state.imageY,
        imageRotate: state.imageRotate,
        imageOpacity: state.imageOpacity,
        imageBlur: state.imageBlur,
        imageBrightness: state.imageBrightness,
        imageContrast: state.imageContrast,
        shadowIntensity: state.shadowIntensity,
        glowIntensity: state.glowIntensity,
        backgroundBlur: state.backgroundBlur,
        noiseAmount: state.noiseAmount,
        reflectionIntensity: state.reflectionIntensity,
        innerShadow: state.innerShadow,
        mockupX: state.mockupX,
        mockupY: state.mockupY,
        selectedMockupUrl: state.selectedMockupUrl,
        selectedMockupName: state.selectedMockupName,
        exportFormat: state.exportFormat,
        exportWidth: state.exportWidth,
        exportHeight: state.exportHeight,
        exportQuality: state.exportQuality,
        mediaUrl: state.mediaUrl,
        mediaName: state.mediaName,
        rotateX: state.rotateX,
        rotateY: state.rotateY,
        rotateZ: state.rotateZ,
        zoom: state.zoom,
        padding: state.padding
      }
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    alert("Draft saved in this browser.");
  };

  const loadDraft = () => {
    const rawDraft = localStorage.getItem(draftStorageKey);
    if (!rawDraft) {
      alert("No local draft saved yet.");
      return;
    }
    const draft = JSON.parse(rawDraft) as {
      mediaItems?: MediaAsset[];
      studioLayers?: StudioLayer[];
      extraMediaSlots?: ExtraMediaSlot[];
      selectedLayerId?: string | null;
      selectedSlotId?: string | null;
      store?: Record<string, unknown>;
    };
    const state = draft.store ?? {};
    Object.entries(state).forEach(([key, value]) => {
      if (typeof value === "number") setTransform(key as TransformKey, value);
    });
    if (typeof state.deviceId === "string") setDevice(state.deviceId);
    if (typeof state.backgroundId === "string") setBackground(state.backgroundId);
    if (typeof state.backgroundColor === "string") setBackgroundColor(state.backgroundColor);
    if (Array.isArray(state.customGradientColors) && state.customGradientColors.length === 3 && state.customGradientColors.every((color) => typeof color === "string")) {
      setCustomGradientColors(state.customGradientColors as [string, string, string]);
    }
    if (typeof state.backgroundImageUrl === "string" || state.backgroundImageUrl === null) setBackgroundImage(state.backgroundImageUrl as string | null);
    if (typeof state.edgeStyleId === "string") setEdgeStyle(state.edgeStyleId);
    if (typeof state.shadowId === "string") setShadow(state.shadowId);
    if (typeof state.effectId === "string") setEffect(state.effectId);
    if (typeof state.borderColor === "string") setBorderColor(state.borderColor);
    if (typeof state.glowColor === "string") setGlowColor(state.glowColor);
    if (typeof state.shadowColor === "string") setShadowColor(state.shadowColor);
    if (typeof state.glassColor === "string") setGlassColor(state.glassColor);
    if (typeof state.vignetteColor === "string") setVignetteColor(state.vignetteColor);
    if (typeof state.edgeColor === "string") setEdgeColor(state.edgeColor);
    if (typeof state.selectedMockupUrl === "string" || state.selectedMockupUrl === null) setSelectedMockup(state.selectedMockupUrl as string | null, state.selectedMockupName as string | null);
    if (typeof state.exportFormat === "string") setExportFormat(state.exportFormat as "png" | "jpg" | "webp");
    if (typeof state.exportWidth === "number" && typeof state.exportHeight === "number") setExportSize(state.exportWidth, state.exportHeight);
    if (typeof state.mediaUrl === "string" || state.mediaUrl === null) setMedia(state.mediaUrl as string | null, state.mediaName as string | null);
    if (state.imageFitMode === "fit" || state.imageFitMode === "fill") setImageFitMode(state.imageFitMode);
    if (typeof state.imageAspectLinked === "boolean") setImageAspectLinked(state.imageAspectLinked);
    if (typeof state.backgroundMode === "string") setBackgroundMode(state.backgroundMode as BackgroundMode);
    setMediaItems(draft.mediaItems ?? []);
    setStudioLayers(draft.studioLayers ?? []);
    setExtraMediaSlots(draft.extraMediaSlots ?? []);
    setSelectedLayerId(draft.selectedLayerId ?? null);
    setSelectedSlotId(draft.selectedSlotId ?? null);
  };

  if (!studioReady) {
    return <StudioLoadingScreen theme={theme} />;
  }

  return (
    <main className={`studio-app ${theme}`}>
      <header className="topbar">
        <div className="brand-area">
          <div className="brand">
            <span className="brand-mark"><EasyFrameMark size={28} /></span>
            <span>
              <span className="brand-title-line">
                <strong>EasyFrame</strong>
                <b>v.1.5</b>
              </span>
              <small>Create polished visuals for every image.</small>
            </span>
          </div>
          <div className="brand-share-wrap">
            <button className="brand-share-button" onClick={shareApp}>
              <Share2 size={16} />
              Share app
            </button>
          </div>
        </div>

        <div className="top-actions">
          <a className="ghost-button" href="/">Home</a>
          <button className="ghost-button" onClick={undoStudio} disabled={!historyPast.length}>
            Undo
          </button>
          <button className="ghost-button" onClick={redoStudio} disabled={!historyFuture.length}>
            Redo
          </button>
          <button className="ghost-button" onClick={() => {
            rememberStudioState();
            startOver();
            setStudioLayers([]);
            setSelectedLayerId(null);
            setExtraMediaSlots([]);
            setSelectedSlotId(null);
          }}>
            <RotateCcw size={16} />
            Start over
          </button>
          <button className="ghost-button" onClick={() => setBrandOpen(true)}>
            <Palette size={16} />
            Brand kit
          </button>
          <button className="ghost-button accent-button" onClick={() => setBatchOpen(true)}>
            <Layers3 size={16} />
            Resize &amp; export all
          </button>
          <button className="ghost-button theme-toggle-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <div className="profile-menu" ref={profileRef}>
            <button className="profile-button" onClick={() => setProfileOpen((value) => !value)}>
              {session?.user?.image ? <img src={session.user.image} alt="" /> : <span>{session?.user?.name?.[0] ?? "E"}</span>}
              <strong>{session?.user?.name ?? "Local user"}</strong>
            </button>
            {profileOpen ? (
              <div className="profile-dropdown">
                <small>{session?.user?.email ?? "Local development session"}</small>
                <div className="account-plan">
                  <b>{formatPlanName(access)}</b>
                  <span>{formatAccessLine(access)}</span>
                  <span>{formatExpiryLine(access)}</span>
                </div>
                {access?.planType === "trial" || access?.planType === "monthly" ? (
                  <a className="account-upgrade-button" href="/pricing">Upgrade plan</a>
                ) : null}
                <button onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <section className="workspace">
        <LeftPanel
          activeDevice={device}
          activeBackgroundId={backgroundId}
          backgroundMode={backgroundMode}
          backgroundColor={backgroundColor}
          customGradientColors={customGradientColors}
          backgroundOpacity={backgroundOpacity}
          activeEdgeStyleId={edgeStyleId}
          activeShadowId={shadowId}
          activeEffectId={effectId}
          borderColor={borderColor}
          glowColor={glowColor}
          shadowColor={shadowColor}
          glassColor={glassColor}
          vignetteColor={vignetteColor}
          edgeColor={edgeColor}
          borderWidth={borderWidth}
          edgeWidth={edgeWidth}
          cornerRadius={cornerRadius}
          localMockups={localMockups}
          selectedMockupUrl={selectedMockupUrl}
          onTemplate={applyTemplate}
          onDevice={setDevice}
          onBackground={setBackground}
          onBackgroundMode={setBackgroundMode}
          onBackgroundColor={setBackgroundColor}
          onCustomGradientColors={setCustomGradientColors}
          onBackgroundImage={setBackgroundImage}
          onBackgroundUpload={() => backgroundFileRef.current?.click()}
          onEdgeStyle={setEdgeStyle}
          onShadow={setShadow}
          onEffect={setEffect}
          onBorderColor={setBorderColor}
          onGlowColor={setGlowColor}
          onShadowColor={setShadowColor}
          onGlassColor={setGlassColor}
          onVignetteColor={setVignetteColor}
          onEdgeColor={setEdgeColor}
          onSelectedMockup={setSelectedMockup}
          onTransform={setTransform}
          activeMediaUrl={mediaUrl}
          backgroundCss={backgroundCss}
          onPresentPreset={applyPresentPreset}
          onLayoutPreset={applyLayoutPreset}
        />

        <section className={`canvas-shell ${isPreviewFull ? "preview-fullscreen" : ""}`}>
          <div className="canvas-toolbar">
            <button className="ghost-button" data-export-ignore="true" onClick={() => setIsPreviewFull((value) => !value)}>
              <Maximize2 size={15} />
              {isPreviewFull ? "Exit preview" : "Full preview"}
            </button>
            <div className="canvas-meta">
              <span>{device.label}</span>
              <button onClick={() => setTransform("canvasZoom", Math.max(50, canvasZoom - 10))}>-</button>
              <b>{Math.round(canvasZoom)}%</b>
              <button onClick={() => setTransform("canvasZoom", Math.min(150, canvasZoom + 10))}>+</button>
            </div>
          </div>

          <QuickLooks />

          <MockupCanvas
            refEl={stageRef}
            device={device}
            backgroundCss={backgroundCss}
            backgroundMode={backgroundMode}
            backgroundOpacity={backgroundOpacity}
            canvasRatio={canvasRatio}
            edgeStyleId={edgeStyleId}
            edgeRadius={cornerRadius}
            edgeShadow={resolvedShadow}
            effectClass={effect.className}
            borderColor={borderColor}
            glowColor={glowColor}
            shadowColor={shadowColor}
            glassColor={glassColor}
            vignetteColor={vignetteColor}
            edgeColor={edgeColor}
            borderWidth={borderWidth}
            edgeWidth={edgeWidth}
            glassAmount={glassAmount}
            canvasRadius={canvasRadius}
            canvasZoom={canvasZoom}
            imageScale={imageScale}
            imageFitMode={imageFitMode}
            imageAspectLinked={imageAspectLinked}
            imageWidthScale={imageWidthScale}
            imageHeightScale={imageHeightScale}
            imageX={imageX}
            imageY={imageY}
            imageRotate={imageRotate}
            imageOpacity={imageOpacity}
            imageBlur={imageBlur}
            imageBrightness={imageBrightness}
            imageContrast={imageContrast}
            backgroundBlur={backgroundBlur}
            noiseAmount={noiseAmount}
            reflectionIntensity={reflectionIntensity}
            innerShadow={innerShadow}
            mockupX={mockupX}
            mockupY={mockupY}
            selectedMockup={selectedMockup}
            selectedMockupUrl={selectedMockupUrl}
            mediaUrl={mediaUrl}
            exportWidth={exportWidth}
            exportHeight={exportHeight}
            rotateX={rotateX}
            rotateY={rotateY}
            rotateZ={rotateZ}
            zoom={zoom}
            padding={padding}
            onPick={() => fileRef.current?.click()}
            onMediaDrop={addMediaAsset}
            onImageFitMode={setImageFitMode}
            onImageAspectLinked={setImageAspectLinked}
            onTransform={setTransform}
            layers={studioLayers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={updateStudioLayer}
            extraMediaSlots={extraMediaSlots}
            selectedSlotId={selectedSlotId}
            onSelectSlot={setSelectedSlotId}
            onUpdateSlot={updateExtraMediaSlot}
          />

        </section>

        <RightPanel
          access={effectiveAccess}
          isExporting={isExporting}
          exportProgress={exportProgress}
          exportDisabled={exportDisabled}
          exportUpgradeMode={exportUpgradeMode}
          mediaItems={mediaItems}
          mediaName={mediaName}
          activeMediaUrl={mediaUrl}
          rotateX={rotateX}
          rotateY={rotateY}
          rotateZ={rotateZ}
          zoom={zoom}
          padding={padding}
          borderWidth={borderWidth}
          edgeWidth={edgeWidth}
          cornerRadius={cornerRadius}
          canvasRadius={canvasRadius}
          glassAmount={glassAmount}
          canvasZoom={canvasZoom}
          imageScale={imageScale}
          imageFitMode={imageFitMode}
          imageAspectLinked={imageAspectLinked}
          imageWidthScale={imageWidthScale}
          imageHeightScale={imageHeightScale}
          imageX={imageX}
          imageY={imageY}
          imageRotate={imageRotate}
          imageOpacity={imageOpacity}
          imageBlur={imageBlur}
          imageBrightness={imageBrightness}
          imageContrast={imageContrast}
          shadowIntensity={shadowIntensity}
          glowIntensity={glowIntensity}
          backgroundBlur={backgroundBlur}
          noiseAmount={noiseAmount}
          reflectionIntensity={reflectionIntensity}
          innerShadow={innerShadow}
          exportFormat={exportFormat}
          exportWidth={exportWidth}
          exportHeight={exportHeight}
          exportQuality={exportQuality}
          selectedMockupName={selectedMockupName}
          aiPrompt={aiPrompt}
          isGenerating={isGenerating}
          setAiPrompt={setAiPrompt}
          backgroundCss={backgroundCss}
          backgroundOpacity={backgroundOpacity}
          onImageFitMode={setImageFitMode}
          onImageAspectLinked={setImageAspectLinked}
          onTransform={setTransform}
          onExport={exportImage}
          onCopyExport={copyExportImage}
          onPick={() => fileRef.current?.click()}
          mediaUrlInput={mediaUrlInput}
          onMediaUrlInput={setMediaUrlInput}
          onAddMediaFromUrl={addMediaFromUrl}
          onSelectMedia={selectMediaAsset}
          onRemoveMedia={removeMediaAsset}
          onAddMediaLayer={addExtraMediaSlot}
          onPresentPreset={applyPresentPreset}
          onLayoutPreset={applyLayoutPreset}
          onEnhancementPreset={applyEnhancementPreset}
          onExportFormat={setExportFormat}
          onExportSize={setExportSize}
          layers={studioLayers}
          selectedLayer={selectedLayer}
          selectedLayerId={selectedLayerId}
          onAddLayer={addStudioLayer}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={updateStudioLayer}
          onRemoveLayer={removeStudioLayer}
          onMoveLayer={moveStudioLayer}
          fontOptions={fontOptions}
          extraMediaSlots={extraMediaSlots}
          selectedSlot={selectedSlot}
          selectedSlotId={selectedSlotId}
          onSelectSlot={setSelectedSlotId}
          onUpdateSlot={updateExtraMediaSlot}
          onRemoveSlot={removeExtraMediaSlot}
          onMoveSlot={moveExtraMediaSlot}
        />
      </section>

      <input
        ref={fileRef}
        className="hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={backgroundFileRef}
        className="hidden-input"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => handleBackgroundFile(event.target.files?.[0])}
      />

      {projectFonts.length ? (
        <style>
          {projectFonts
            .filter((font) => font.url)
            .map((font) => `@font-face{font-family:"${font.family}";src:url("${font.url}") format("${font.url?.endsWith(".woff2") ? "woff2" : font.url?.endsWith(".woff") ? "woff" : font.url?.endsWith(".otf") ? "opentype" : "truetype"}");font-display:swap;}`)
            .join("\n")}
        </style>
      ) : null}

      <BrandKit open={brandOpen} onClose={() => setBrandOpen(false)} />
      <BatchExportDialog open={batchOpen} onClose={() => setBatchOpen(false)} onExport={exportBatch} />

      <StudioStyles />
    </main>
  );
}

function LeftPanel({
  activeDevice,
  activeBackgroundId,
  backgroundMode,
  backgroundColor,
  customGradientColors,
  backgroundOpacity,
  activeEdgeStyleId,
  activeShadowId,
  activeEffectId,
  borderColor,
  glowColor,
  shadowColor,
  glassColor,
  vignetteColor,
  edgeColor,
  borderWidth,
  edgeWidth,
  cornerRadius,
  localMockups,
  selectedMockupUrl,
  onTemplate,
  onDevice,
  onBackground,
  onBackgroundMode,
  onBackgroundColor,
  onCustomGradientColors,
  onBackgroundImage,
  onBackgroundUpload,
  onEdgeStyle,
  onShadow,
  onEffect,
  onBorderColor,
  onGlowColor,
  onShadowColor,
  onGlassColor,
  onVignetteColor,
  onEdgeColor,
  onSelectedMockup,
  onTransform,
  activeMediaUrl,
  backgroundCss,
  onPresentPreset,
  onLayoutPreset
}: {
  activeDevice: DevicePreset;
  activeBackgroundId: string;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  customGradientColors: [string, string, string];
  backgroundOpacity: number;
  activeEdgeStyleId: string;
  activeShadowId: string;
  activeEffectId: string;
  borderColor: string;
  glowColor: string;
  shadowColor: string;
  glassColor: string;
  vignetteColor: string;
  edgeColor: string;
  borderWidth: number;
  edgeWidth: number;
  cornerRadius: number;
  localMockups: LocalMockup[];
  selectedMockupUrl: string | null;
  onTemplate: (id: string) => void;
  onDevice: (id: string) => void;
  onBackground: (id: string) => void;
  onBackgroundMode: (mode: BackgroundMode) => void;
  onBackgroundColor: (color: string) => void;
  onCustomGradientColors: (colors: [string, string, string]) => void;
  onBackgroundImage: (url: string | null) => void;
  onBackgroundUpload: () => void;
  onEdgeStyle: (id: string) => void;
  onShadow: (id: string) => void;
  onEffect: (id: string) => void;
  onBorderColor: (color: string) => void;
  onGlowColor: (color: string) => void;
  onShadowColor: (color: string) => void;
  onGlassColor: (color: string) => void;
  onVignetteColor: (color: string) => void;
  onEdgeColor: (color: string) => void;
  onSelectedMockup: (url: string | null, name?: string | null) => void;
  onTransform: (key: TransformKey, value: number) => void;
  activeMediaUrl: string | null;
  backgroundCss: string;
  onPresentPreset: (id: string) => void;
  onLayoutPreset: (id: string) => void;
}) {
  const [colorTarget, setColorTarget] = useState<"border" | "glow" | "shadow" | "edge">("border");
  const [effectColorTarget, setEffectColorTarget] = useState<"shadow" | "glass" | "glow" | "vignette" | "border">("shadow");
  const [backgroundUrlDraft, setBackgroundUrlDraft] = useState("");
  const [gradientDrafts, setGradientDrafts] = useState<[string, string, string]>(customGradientColors);
  const [openTools, setOpenTools] = useState<string[]>(["backgrounds", "presets"]);
  const toggleTool = (id: string) => setOpenTools((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const updateCustomGradientColor = (index: number, color: string) => {
    const next = [...gradientDrafts] as [string, string, string];
    next[index] = color;
    setGradientDrafts(next);
    if (/^#[0-9a-fA-F]{6}$/.test(color)) onCustomGradientColors(next);
  };
  useEffect(() => {
    setGradientDrafts(customGradientColors);
  }, [customGradientColors]);
  const templateGroups = useMemo(() => {
    return templates.reduce<Record<string, Record<string, TemplatePreset[]>>>((groups, template) => {
      const platform = template.platform ?? "Other";
      const groupKey = `${template.orientation} ${template.category}`;
      groups[platform] = groups[platform] ?? {};
      groups[platform][groupKey] = [...(groups[platform][groupKey] ?? []), template];
      return groups;
    }, {});
  }, []);
  const colorConfig = {
    border: { label: "Border", value: borderColor, onChange: onBorderColor },
    glow: { label: "Glow", value: glowColor, onChange: onGlowColor },
    shadow: { label: "Shadow", value: shadowColor, onChange: onShadowColor },
    edge: { label: "Edge", value: edgeColor, onChange: onEdgeColor }
  }[colorTarget];
  const effectColorConfig = {
    shadow: { label: "Spread / Hug / Adaptive", value: shadowColor, onChange: onShadowColor },
    glass: { label: "Glass", value: glassColor, onChange: onGlassColor },
    glow: { label: "Glow", value: glowColor, onChange: onGlowColor },
    vignette: { label: "Vignette", value: vignetteColor, onChange: onVignetteColor },
    border: { label: "Border", value: borderColor, onChange: onBorderColor }
  }[effectColorTarget];

  return (
    <aside className="side-panel">
      <ToolSection id="library" title="Templates" openId={openTools} onToggle={toggleTool}>
          <div className="template-folder-list">
            {Object.entries(templateGroups).map(([platform, orientationGroups]) => (
              <details key={platform} className="template-folder">
                <summary>
                  <span><FolderOpen size={14} /> {platform}</span>
                  <small>{Object.values(orientationGroups).flat().length} sizes</small>
                </summary>
                <div className="template-folder-body">
                  {Object.entries(orientationGroups).map(([groupName, group]) => (
                    <div key={groupName} className="template-folder-group">
                      <h3>{groupName}</h3>
                      <div className="template-line-list">
                        {group.map((template) => (
                          <button key={template.id} className="template-line-row" onClick={() => onTemplate(template.id)}>
                            <span className={template.safeZone === "circle" ? "template-size-icon circle" : "template-size-icon"}>
                              <i style={{ aspectRatio: `${template.width} / ${template.height}` }} />
                            </span>
                            <span className="template-line-copy">
                              <strong>{template.label}</strong>
                              <small>{template.width} x {template.height} · {formatRatio(template.width, template.height)}{template.safeZone === "circle" ? " · circular PFP" : ""}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
      </ToolSection>

      <ToolSection id="backgrounds" title="Backgrounds" openId={openTools} onToggle={toggleTool}>
        <div className="background-panel">
          <div className="background-group">
            <span className="micro-label">Source</span>
            <div className="background-source-grid">
              <button className={backgroundMode === "transparent" ? "active" : ""} onClick={() => onBackgroundMode("transparent")}>Transparent</button>
              <button className={backgroundMode === "solid" ? "active" : ""} onClick={() => onBackgroundMode("solid")}>Solid</button>
              <button className={backgroundMode === "image" ? "active" : ""} onClick={onBackgroundUpload}>Upload</button>
              <button className={backgroundMode === "url" ? "active" : ""} onClick={() => onBackgroundMode("url")}>URL</button>
            </div>
          </div>
          {backgroundMode === "url" ? (
            <div className="background-group">
              <span className="micro-label">Remote image</span>
              <div className="background-url-row">
                <input value={backgroundUrlDraft} placeholder="Paste image URL" onChange={(event) => setBackgroundUrlDraft(event.target.value)} />
                <button
                  onClick={() => {
                    if (!backgroundUrlDraft.trim()) return;
                    onBackgroundImage(backgroundUrlDraft.trim());
                    onBackgroundMode("url");
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          ) : null}
          <div className="background-group">
            <ColorPalette label="Base color" value={backgroundColor} onChange={onBackgroundColor} />
          </div>
          <div className="background-group">
            <Slider label="Opacity" value={backgroundOpacity} min={0} max={100} onChange={(value) => onTransform("backgroundOpacity", value)} />
          </div>
          <div className="background-group">
            <span className="micro-label">Presets</span>
            <div className="swatches">
              {backgrounds.map((background) => (
                <button
                  key={background.id}
                  title={background.label}
                  className={`swatch ${backgroundMode === "preset" && activeBackgroundId === background.id ? "active" : ""}`}
                  style={{ background: background.css }}
                  onClick={() => onBackground(background.id)}
                />
              ))}
            </div>
          </div>
          <div className="custom-gradient-card">
            <label className="custom-gradient-toggle">
              <input
                type="checkbox"
                checked={backgroundMode === "custom-gradient"}
                onChange={(event) => {
                  if (event.target.checked) onCustomGradientColors(customGradientColors);
                  else onBackground(activeBackgroundId);
                }}
              />
              <span>Use custom gradient</span>
            </label>
            <div className="custom-gradient-preview" style={{ background: `linear-gradient(135deg, ${customGradientColors[0]}, ${customGradientColors[1]} 52%, ${customGradientColors[2]})` }} />
            <div className="custom-gradient-pickers">
              {gradientDrafts.map((color, index) => (
                <label key={index}>
                  <span>{index === 0 ? "First" : index === 1 ? "Second" : "Third"}</span>
                  <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : customGradientColors[index]} onChange={(event) => updateCustomGradientColor(index, event.target.value)} />
                  <input
                    value={color}
                    maxLength={7}
                    onChange={(event) => updateCustomGradientColor(index, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </ToolSection>

      <ToolSection id="presets" title="Presets & Layouts" openId={openTools} onToggle={toggleTool}>
        <div className="preset-preview-grid left-preset-grid">
          {presentPresets.map((preset) => (
            <PresetPreviewButton
              key={preset.id}
              label={preset.name}
              mediaUrl={activeMediaUrl}
              backgroundCss={backgroundCss}
              backgroundOpacity={backgroundOpacity}
              rotateX={preset.rotateX}
              rotateY={preset.rotateY}
              rotateZ={preset.rotateZ}
              zoom={preset.zoom}
              onClick={() => onPresentPreset(preset.id)}
            />
          ))}
        </div>
        <small className="muted tight">Layouts use your current media library and add extra screenshots.</small>
        <div className="preset-preview-grid left-preset-grid">
          {layoutPresets.map((preset) => (
            <PresetPreviewButton
              key={preset.id}
              label={preset.name}
              mediaUrl={activeMediaUrl}
              backgroundCss={backgroundCss}
              backgroundOpacity={backgroundOpacity}
              rotateX={preset.rotateX}
              rotateY={preset.rotateY}
              rotateZ={preset.rotateZ}
              zoom={preset.zoom}
              slots={preset.slots}
              onClick={() => onLayoutPreset(preset.id)}
            />
          ))}
        </div>
      </ToolSection>

      <ToolSection id="edge" title="Edge Styles" openId={openTools} onToggle={toggleTool}>
        <div className="style-grid">
          {edgeStyles.map((edge) => (
            <button key={edge.id} className={activeEdgeStyleId === edge.id ? "active" : ""} onClick={() => onEdgeStyle(edge.id)}>
              <span className="style-thumb" style={{ borderRadius: edge.radius / 2, background: edge.preview }} />
              {edge.label}
            </button>
          ))}
        </div>
        <div className="border-mode-row">
          {[
            ["sharp", "Sharp", 8],
            ["curved", "Curved", 24],
            ["round", "Round", 54]
          ].map(([id, label, radius]) => (
            <button key={id} className={Math.abs(cornerRadius - Number(radius)) < 10 ? "active" : ""} onClick={() => onTransform("cornerRadius", Number(radius))}>
              {label}
            </button>
          ))}
        </div>
        <Slider label="Radius" value={cornerRadius} min={0} max={72} onChange={(value) => onTransform("cornerRadius", value)} />
        <Slider label="Edge size" value={edgeWidth} min={0} max={18} onChange={(value) => onTransform("edgeWidth", value)} />
        <Slider label="Outer border" value={borderWidth} min={0} max={16} onChange={(value) => onTransform("borderWidth", value)} />
      </ToolSection>

      <ToolSection id="colors" title="Colors" openId={openTools} onToggle={toggleTool}>
        <div className="color-target-row">
          {(["border", "glow", "shadow", "edge"] as const).map((target) => (
            <button key={target} className={colorTarget === target ? "active" : ""} onClick={() => setColorTarget(target)}>
              {target}
            </button>
          ))}
        </div>
        <ColorPalette label={colorConfig.label} value={colorConfig.value} onChange={colorConfig.onChange} />
      </ToolSection>

      <ToolSection id="effects" title="Shadows & Effects" openId={openTools} onToggle={toggleTool}>
        <div className="effect-color-panel">
          <div className="effect-color-tabs">
            {(["shadow", "glass", "glow", "vignette", "border"] as const).map((target) => (
              <button key={target} className={effectColorTarget === target ? "active" : ""} onClick={() => setEffectColorTarget(target)}>
                {target}
              </button>
            ))}
          </div>
          <ColorPalette label={effectColorConfig.label} value={effectColorConfig.value} onChange={effectColorConfig.onChange} />
        </div>
        <div className="effect-grid">
          {shadows.map((shadow) => (
            <button key={shadow.id} className={activeShadowId === shadow.id ? "active" : ""} onClick={() => onShadow(shadow.id)}>
              {shadow.label}
            </button>
          ))}
        </div>
        <div className="effect-grid separated-grid">
          {effects.map((effect) => (
            <button key={effect.id} className={activeEffectId === effect.id ? "active" : ""} onClick={() => onEffect(effect.id)}>
              {effect.id === "glass" ? <Droplet size={16} /> : effect.id === "border" ? <Square size={16} /> : effect.id === "glow" ? <Sparkles size={16} /> : <Palette size={16} />}
              {effect.label}
            </button>
          ))}
        </div>
      </ToolSection>

    </aside>
  );
}

function RightPanel({
  access,
  isExporting,
  exportProgress,
  exportDisabled,
  exportUpgradeMode,
  mediaItems,
  mediaName,
  activeMediaUrl,
  rotateX,
  rotateY,
  rotateZ,
  zoom,
  padding,
  borderWidth,
  edgeWidth,
  cornerRadius,
  canvasRadius,
  glassAmount,
  canvasZoom,
  imageScale,
  imageFitMode,
  imageAspectLinked,
  imageWidthScale,
  imageHeightScale,
  imageX,
  imageY,
  imageRotate,
  imageOpacity,
  imageBlur,
  imageBrightness,
  imageContrast,
  shadowIntensity,
  glowIntensity,
  backgroundBlur,
  noiseAmount,
  reflectionIntensity,
  innerShadow,
  exportFormat,
  exportWidth,
  exportHeight,
  exportQuality,
  selectedMockupName,
  aiPrompt,
  isGenerating,
  setAiPrompt,
  backgroundCss,
  backgroundOpacity,
  onImageFitMode,
  onImageAspectLinked,
  onTransform,
  onExport,
  onCopyExport,
  onPick,
  mediaUrlInput,
  onMediaUrlInput,
  onAddMediaFromUrl,
  onSelectMedia,
  onRemoveMedia,
  onAddMediaLayer,
  onPresentPreset,
  onLayoutPreset,
  onEnhancementPreset,
  onExportFormat,
  onExportSize,
  layers,
  selectedLayer,
  selectedLayerId,
  onAddLayer,
  onSelectLayer,
  onUpdateLayer,
  onRemoveLayer,
  onMoveLayer,
  fontOptions,
  extraMediaSlots,
  selectedSlot,
  selectedSlotId,
  onSelectSlot,
  onUpdateSlot,
  onRemoveSlot,
  onMoveSlot
}: {
  access: AccessSummary | null;
  isExporting: boolean;
  exportProgress: number;
  exportDisabled: boolean;
  exportUpgradeMode: boolean;
  mediaItems: MediaAsset[];
  mediaName: string | null;
  activeMediaUrl: string | null;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  zoom: number;
  padding: number;
  borderWidth: number;
  edgeWidth: number;
  cornerRadius: number;
  canvasRadius: number;
  glassAmount: number;
  canvasZoom: number;
  imageScale: number;
  imageFitMode: "fit" | "fill";
  imageAspectLinked: boolean;
  imageWidthScale: number;
  imageHeightScale: number;
  imageX: number;
  imageY: number;
  imageRotate: number;
  imageOpacity: number;
  imageBlur: number;
  imageBrightness: number;
  imageContrast: number;
  shadowIntensity: number;
  glowIntensity: number;
  backgroundBlur: number;
  noiseAmount: number;
  reflectionIntensity: number;
  innerShadow: number;
  exportFormat: "png" | "jpg" | "webp";
  exportWidth: number;
  exportHeight: number;
  exportQuality: number;
  selectedMockupName: string | null;
  aiPrompt: string;
  isGenerating: boolean;
  setAiPrompt: (prompt: string) => void;
  backgroundCss: string;
  backgroundOpacity: number;
  onImageFitMode: (mode: "fit" | "fill") => void;
  onImageAspectLinked: (linked: boolean) => void;
  onTransform: (key: TransformKey, value: number) => void;
  onExport: () => void;
  onCopyExport: () => void;
  onPick: () => void;
  mediaUrlInput: string;
  onMediaUrlInput: (value: string) => void;
  onAddMediaFromUrl: () => void;
  onSelectMedia: (asset: MediaAsset) => void;
  onRemoveMedia: (assetId: string) => void;
  onAddMediaLayer: (asset: MediaAsset) => void;
  onPresentPreset: (id: string) => void;
  onLayoutPreset: (id: string) => void;
  onEnhancementPreset: (id: string) => void;
  onExportFormat: (format: "png" | "jpg" | "webp") => void;
  onExportSize: (width: number, height: number) => void;
  layers: StudioLayer[];
  selectedLayer: StudioLayer | null;
  selectedLayerId: string | null;
  onAddLayer: (kind: StudioLayerKind) => void;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<StudioLayer>) => void;
  onRemoveLayer: (id: string) => void;
  onMoveLayer: (id: string, direction: "up" | "down") => void;
  fontOptions: FontOption[];
  extraMediaSlots: ExtraMediaSlot[];
  selectedSlot: ExtraMediaSlot | null;
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
  onUpdateSlot: (id: string, patch: Partial<ExtraMediaSlot>) => void;
  onRemoveSlot: (id: string) => void;
  onMoveSlot: (id: string, direction: "up" | "down") => void;
}) {
  const setImageWidth = (value: number) => {
    onTransform("imageWidthScale", value);
    if (imageAspectLinked) onTransform("imageHeightScale", value);
  };
  const setImageHeight = (value: number) => {
    onTransform("imageHeightScale", value);
    if (imageAspectLinked) onTransform("imageWidthScale", value);
  };
  const exportCaption = exportUpgradeMode
    ? "Trial limit reached"
    : access?.planType === "trial"
      ? `${access.exportsRemaining ?? 0} of 5 exports left`
      : access?.hasAccess
        ? `${exportFormat.toUpperCase()} export ready`
        : "Active plan required";
  const exportOptions = (
    <div className="control-card export-options-card">
      <PanelTitle title="Export options" flush />
      <div className="format-row">
        {(["png", "jpg", "webp"] as const).map((format) => (
          <button key={format} className={exportFormat === format ? "active" : ""} onClick={() => onExportFormat(format)}>
            {format.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="preset-row">
        {exportPresets.map((preset) => (
          <button key={preset.label} onClick={() => onExportSize(preset.width, preset.height)}>
            {preset.label}
          </button>
        ))}
      </div>
      <div className="size-row">
        <label>
          W
          <input value={exportWidth} onChange={(event) => onExportSize(Number(event.target.value) || 1, exportHeight)} />
        </label>
        <label>
          H
          <input value={exportHeight} onChange={(event) => onExportSize(exportWidth, Number(event.target.value) || 1)} />
        </label>
      </div>
      <Slider label="Quality" value={exportQuality} min={40} max={100} onChange={(value) => onTransform("exportQuality", value)} />
    </div>
  );
  const selectedSlotCard = selectedSlot ? (
    <div className="control-card layer-access-card">
      <PanelTitle title="Selected layer" flush />
      <div className="selected-layer-summary">
        <span>image</span>
        <strong>{selectedSlot.name || "Selected item"}</strong>
      </div>
      <div className="selected-layer-actions">
        <button onClick={() => onMoveSlot(selectedSlot.id, "up")}>Move up</button>
        <button onClick={() => onMoveSlot(selectedSlot.id, "down")}>Move down</button>
        <button className="danger" onClick={() => onRemoveSlot(selectedSlot.id)}>
          <Trash2 size={14} />
          Remove image
        </button>
      </div>
    </div>
  ) : null;

  return (
    <aside className="side-panel right-panel">
      <button
        className={`export-card ${isExporting ? "exporting" : ""}`}
        onClick={onExport}
        disabled={exportDisabled}
        style={{ "--export-progress": `${exportProgress}%` } as React.CSSProperties}
      >
        <i className="export-progress-fill" />
        <span>
          <strong>{exportUpgradeMode ? "Upgrade to export" : isExporting ? "Exporting..." : "Export"}</strong>
          <small>{isExporting ? `${Math.max(8, Math.round(exportProgress))}% preparing file` : exportCaption}</small>
        </span>
        <ArrowUpRight size={18} />
      </button>
      {exportOptions}
      <div className="control-card export-actions-card">
        <div className="quick-action-row">
          <button onClick={onCopyExport} disabled={exportDisabled}>
            <Copy size={15} />
            Copy PNG
          </button>
        </div>
      </div>

      <div className="control-card">
        <PanelTitle title="Select media" flush />
        <button className="media-drop" onClick={onPick}>
          {activeMediaUrl ? (
            <>
              <img className="media-drop-main" src={activeMediaUrl} alt="" />
              <span className="media-drop-badge"><ImagePlus size={17} /> Change media</span>
              {mediaItems.length > 1 ? (
                <span className="media-drop-strip">
                  {mediaItems.slice(0, 4).map((asset) => (
                    <img key={asset.id} src={asset.url} alt="" />
                  ))}
                  {mediaItems.length > 4 ? <b>+{mediaItems.length - 4}</b> : null}
                </span>
              ) : null}
            </>
          ) : (
            <span className="media-drop-empty"><ImagePlus size={24} /></span>
          )}
        </button>
        <strong className="file-name">{mediaName ?? "No image selected"}</strong>
        <small className="muted">PNG, JPG, or WEBP photo</small>
        {selectedMockupName ? <small className="muted">Mockup: {selectedMockupName}</small> : null}
        <div className="url-import-row">
          <input value={mediaUrlInput} onChange={(event) => onMediaUrlInput(event.target.value)} placeholder="Paste image URL" />
          <button onClick={onAddMediaFromUrl}>Add URL</button>
        </div>
        {mediaItems.length ? (
          <div className="media-library">
            {mediaItems.map((asset) => (
              <div key={asset.id} className={activeMediaUrl === asset.url ? "media-item active" : "media-item"}>
                <button className="media-preview" onClick={() => onSelectMedia(asset)} title={activeMediaUrl === asset.url ? "Unselect media" : "Use this media"}>
                  <img src={asset.url} alt="" />
                  <span>{activeMediaUrl === asset.url ? "Selected" : "Use"}</span>
                </button>
                <div>
                  <strong>{asset.name}</strong>
                  <small>{activeMediaUrl === asset.url ? "Active on canvas" : "Click to use"}</small>
                </div>
                <button className="media-layer" onClick={() => onAddMediaLayer(asset)} aria-label={`Add ${asset.name} as a floating screenshot`}>
                  <Layers3 size={14} />
                </button>
                <button className="media-remove" onClick={() => onRemoveMedia(asset.id)} aria-label={`Remove ${asset.name}`}>
                  x
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="control-card">
        <PanelTitle title="Canvas" flush />
        <Slider label="Canvas zoom" value={canvasZoom} min={50} max={150} onChange={(value) => onTransform("canvasZoom", value)} />
        <Slider label="Mockup zoom" value={zoom} min={48} max={120} onChange={(value) => onTransform("zoom", value)} />
        <Slider label="Frame padding" value={padding} min={16} max={130} onChange={(value) => onTransform("padding", value)} />
        <Slider label="Bg blur" value={backgroundBlur} min={0} max={28} onChange={(value) => onTransform("backgroundBlur", value)} />
      </div>
      {selectedSlotCard}

      <div className="control-card">
        <PanelTitle title="Layers & callouts" flush />
        <div className="layer-tools">
          <small>Content</small>
          <div className="layer-action-row single">
            <button onClick={() => onAddLayer("text")}>
              <Type size={15} />
              Text
            </button>
          </div>
        </div>
        {layers.length ? (
            <div className="layer-list layer-stack">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={selectedLayerId === layer.id ? "layer-row active" : "layer-row"}
                >
                  <button
                    className="layer-row-select"
                    onClick={() => {
                      onSelectLayer(layer.id);
                      onSelectSlot(null);
                    }}
                  >
                    <span>{layer.kind}</span>
                    <strong>{layer.label || layer.kind}</strong>
                    <small>{Math.round(layer.x)} / {Math.round(layer.y)}</small>
                  </button>
                  <button
                    className="layer-row-delete"
                    onClick={() => onRemoveLayer(layer.id)}
                    aria-label={`Delete ${layer.label || layer.kind} layer`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
        ) : (
          <small className="muted">Add editable text over the canvas.</small>
        )}
        {selectedLayer ? (
          <div className="layer-editor">
            <div className="selected-layer-actions inline-layer-actions">
              <button onClick={() => onMoveLayer(selectedLayer.id, "up")}>Move up</button>
              <button onClick={() => onMoveLayer(selectedLayer.id, "down")}>Move down</button>
            </div>
            {["text", "badge", "arrow"].includes(selectedLayer.kind) ? (
              <label>
                Label
                <input
                  value={selectedLayer.label}
                  onChange={(event) => onUpdateLayer(selectedLayer.id, { label: event.target.value })}
                />
              </label>
            ) : null}
            <div className="layer-color-grid">
              <label>
                Text
                <input
                  type="color"
                  value={selectedLayer.color}
                  onChange={(event) => onUpdateLayer(selectedLayer.id, { color: event.target.value })}
                />
              </label>
              <label>
                Fill
                <input
                  type="color"
                  value={selectedLayer.background.startsWith("#") ? selectedLayer.background : "#151713"}
                  onChange={(event) => onUpdateLayer(selectedLayer.id, { background: event.target.value })}
                  disabled={!["badge", "highlight", "blur"].includes(selectedLayer.kind)}
                />
              </label>
            </div>
            <div className="layer-quick-row">
              <button onClick={() => onUpdateLayer(selectedLayer.id, { x: 50, y: 50 })}>Center</button>
              <button onClick={() => onUpdateLayer(selectedLayer.id, { rotation: 0 })}>Straighten</button>
              <button onClick={() => onUpdateLayer(selectedLayer.id, { hidden: !selectedLayer.hidden })}>
                {selectedLayer.hidden ? "Show" : "Hide"}
              </button>
            </div>
            {["rect", "ellipse", "highlight", "blur", "arrow"].includes(selectedLayer.kind) ? (
              <>
                <Slider label="Layer width" value={selectedLayer.width ?? 30} min={6} max={100} onChange={(value) => onUpdateLayer(selectedLayer.id, { width: value })} />
                <Slider label="Layer height" value={selectedLayer.height ?? 20} min={4} max={80} onChange={(value) => onUpdateLayer(selectedLayer.id, { height: value })} />
                <Slider label="Stroke" value={selectedLayer.strokeWidth ?? 0} min={0} max={16} onChange={(value) => onUpdateLayer(selectedLayer.id, { strokeWidth: value })} />
              </>
            ) : null}
            {selectedLayer.kind === "blur" ? (
              <Slider label="Redact blur" value={selectedLayer.blurAmount ?? 10} min={0} max={24} onChange={(value) => onUpdateLayer(selectedLayer.id, { blurAmount: value })} />
            ) : null}
            <div className="layer-select-grid">
              <label>
                Font
                <select value={selectedLayer.fontFamily ?? "Inter"} onChange={(event) => onUpdateLayer(selectedLayer.id, { fontFamily: event.target.value })}>
                  {fontOptions.map((font) => (
                    <option key={font.family} value={font.family}>{font.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Align
                <select value={selectedLayer.align ?? "center"} onChange={(event) => onUpdateLayer(selectedLayer.id, { align: event.target.value as StudioLayer["align"] })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </label>
            </div>
            {["text", "badge", "arrow"].includes(selectedLayer.kind) ? (
              <div className="text-property-panel">
                <div className="text-property-title">
                  <span>Text properties</span>
                  <small>Spacing and shadow</small>
                </div>
                <Slider label="Letter spacing" value={selectedLayer.letterSpacing ?? 0} min={-4} max={14} onChange={(value) => onUpdateLayer(selectedLayer.id, { letterSpacing: value })} />
                <Slider label="Line spacing" value={selectedLayer.lineHeight ?? 110} min={70} max={190} onChange={(value) => onUpdateLayer(selectedLayer.id, { lineHeight: value })} />
                <div className="text-shadow-color-row">
                  <label>
                    Shadow color
                    <input
                      type="color"
                      value={selectedLayer.textShadowColor ?? "#000000"}
                      onChange={(event) => onUpdateLayer(selectedLayer.id, { textShadowColor: event.target.value })}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => onUpdateLayer(selectedLayer.id, {
                      textShadowBlur: 0,
                      textShadowX: 0,
                      textShadowY: 0,
                      textShadowOpacity: 0
                    })}
                  >
                    Clear shadow
                  </button>
                </div>
                <Slider label="Shadow opacity" value={selectedLayer.textShadowOpacity ?? 0} min={0} max={100} onChange={(value) => onUpdateLayer(selectedLayer.id, { textShadowOpacity: value })} />
                <Slider label="Shadow blur" value={selectedLayer.textShadowBlur ?? 0} min={0} max={80} onChange={(value) => onUpdateLayer(selectedLayer.id, { textShadowBlur: value })} />
                <Slider label="Shadow X" value={selectedLayer.textShadowX ?? 0} min={-40} max={40} onChange={(value) => onUpdateLayer(selectedLayer.id, { textShadowX: value })} />
                <Slider label="Shadow Y" value={selectedLayer.textShadowY ?? 0} min={-40} max={40} onChange={(value) => onUpdateLayer(selectedLayer.id, { textShadowY: value })} />
              </div>
            ) : null}
            <Slider label="Layer X" value={selectedLayer.x} min={0} max={100} onChange={(value) => onUpdateLayer(selectedLayer.id, { x: value })} />
            <Slider label="Layer Y" value={selectedLayer.y} min={0} max={100} onChange={(value) => onUpdateLayer(selectedLayer.id, { y: value })} />
            <Slider label="Layer size" value={selectedLayer.size} min={10} max={120} onChange={(value) => onUpdateLayer(selectedLayer.id, { size: value })} />
            <Slider label="Layer rotate" value={selectedLayer.rotation} min={-180} max={180} onChange={(value) => onUpdateLayer(selectedLayer.id, { rotation: value })} />
            <Slider label="Layer opacity" value={selectedLayer.opacity ?? 100} min={0} max={100} onChange={(value) => onUpdateLayer(selectedLayer.id, { opacity: value })} />
          </div>
        ) : null}
      </div>

      <div className="control-card">
        <PanelTitle title="Image Adjustments" flush />
        <div className="preset-row two-column">
          {enhancementPresets.map((preset) => (
            <button key={preset.id} onClick={() => onEnhancementPreset(preset.id)}>
              {preset.name}
            </button>
          ))}
        </div>
        <div className="fit-mode-row">
          <button className={imageFitMode === "fit" ? "active" : ""} onClick={() => onImageFitMode("fit")}>Fit</button>
          <button className={imageFitMode === "fill" ? "active" : ""} onClick={() => onImageFitMode("fill")}>Fill Canvas</button>
        </div>
        <div className="dimension-toolbar">
          <button className={imageAspectLinked ? "active icon" : "icon"} onClick={() => onImageAspectLinked(!imageAspectLinked)} aria-label={imageAspectLinked ? "Unlink aspect ratio" : "Link aspect ratio"}>
            {imageAspectLinked ? <Link2 size={15} /> : <Unlink size={15} />}
          </button>
          <span>{imageAspectLinked ? "Linked aspect" : "Free stretch"}</span>
        </div>
        <Slider label="Canvas roundness" value={Math.min(canvasRadius, 160)} min={0} max={160} onChange={(value) => onTransform("canvasRadius", value)} />
        <Slider label="Width" value={imageWidthScale} min={0} max={300} onChange={setImageWidth} />
        <Slider label="Height" value={imageHeightScale} min={0} max={300} onChange={setImageHeight} />
        <Slider label="Scale" value={imageScale} min={40} max={220} onChange={(value) => onTransform("imageScale", value)} />
        <Slider label="Move X" value={imageX} min={-120} max={120} onChange={(value) => onTransform("imageX", value)} />
        <Slider label="Move Y" value={imageY} min={-120} max={120} onChange={(value) => onTransform("imageY", value)} />
        <Slider label="Rotate" value={imageRotate} min={-45} max={45} onChange={(value) => onTransform("imageRotate", value)} />
        <Slider label="Opacity" value={imageOpacity} min={0} max={100} onChange={(value) => onTransform("imageOpacity", value)} />
        <Slider label="Blur" value={imageBlur} min={0} max={24} onChange={(value) => onTransform("imageBlur", value)} />
        <Slider label="Brightness" value={imageBrightness} min={40} max={180} onChange={(value) => onTransform("imageBrightness", value)} />
        <Slider label="Contrast" value={imageContrast} min={40} max={180} onChange={(value) => onTransform("imageContrast", value)} />
      </div>

      <div className="control-card">
        <PanelTitle title="Style Intensity" flush />
        <Slider label="Pitch 3D" value={rotateX} min={-55} max={55} onChange={(value) => onTransform("rotateX", value)} />
        <Slider label="Yaw 3D" value={rotateY} min={-55} max={55} onChange={(value) => onTransform("rotateY", value)} />
        <Slider label="Roll" value={rotateZ} min={-180} max={180} onChange={(value) => onTransform("rotateZ", value)} />
        <Slider label="Border" value={borderWidth} min={0} max={16} onChange={(value) => onTransform("borderWidth", value)} />
        <Slider label="Edge" value={edgeWidth} min={0} max={18} onChange={(value) => onTransform("edgeWidth", value)} />
        <Slider label="Shadow" value={shadowIntensity} min={0} max={140} onChange={(value) => onTransform("shadowIntensity", value)} />
        <Slider label="Glow" value={glowIntensity} min={0} max={120} onChange={(value) => onTransform("glowIntensity", value)} />
        <Slider label="Glass" value={glassAmount} min={0} max={36} onChange={(value) => onTransform("glassAmount", value)} />
        <Slider label="Grain" value={noiseAmount} min={0} max={100} onChange={(value) => onTransform("noiseAmount", value)} />
        <Slider label="Reflection" value={reflectionIntensity} min={0} max={100} onChange={(value) => onTransform("reflectionIntensity", value)} />
        <Slider label="Inner shadow" value={innerShadow} min={0} max={100} onChange={(value) => onTransform("innerShadow", value)} />
      </div>

    </aside>
  );
}

function PresetPreviewButton({
  label,
  mediaUrl,
  backgroundCss,
  backgroundOpacity,
  rotateX,
  rotateY,
  rotateZ,
  zoom,
  slots = [],
  onClick
}: {
  label: string;
  mediaUrl: string | null;
  backgroundCss: string;
  backgroundOpacity: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  zoom: number;
  slots?: Array<{ x: number; y: number; scale: number; rotation: number }>;
  onClick: () => void;
}) {
  return (
    <button className="preset-preview-card" onClick={(event) => {
      event.currentTarget.blur();
      onClick();
    }}>
      <span
        className="preset-preview-stage"
        style={{
          "--preset-preview-bg": backgroundCss,
          "--preset-preview-bg-opacity": backgroundOpacity / 100
        } as React.CSSProperties}
      >
        <span className="preset-preview-background" />
        <span className="preset-preview-light" />
        <span
          className="preset-preview-main"
          style={{
            width: `${Math.max(54, Math.min(90, zoom * 0.92))}%`,
            transform: `translate(-50%, -50%) perspective(340px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
          }}
        >
          {mediaUrl ? <img src={mediaUrl} alt="" /> : <i />}
        </span>
        {slots.slice(0, 2).map((slot, index) => (
          <span
            key={`${label}-${index}`}
            className="preset-preview-slot"
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.scale * 1.18}%`,
              transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`
            }}
          >
            {mediaUrl ? <img src={mediaUrl} alt="" /> : <i />}
          </span>
        ))}
      </span>
      <strong>{label}</strong>
    </button>
  );
}

function MockupCanvas({
  refEl,
  device,
  backgroundCss,
  backgroundMode,
  backgroundOpacity,
  canvasRatio,
  edgeStyleId,
  edgeRadius,
  edgeShadow,
  effectClass,
  borderColor,
  glowColor,
  shadowColor,
  glassColor,
  vignetteColor,
  edgeColor,
  borderWidth,
  edgeWidth,
  glassAmount,
  canvasRadius,
  canvasZoom,
  imageScale,
  imageFitMode,
  imageAspectLinked,
  imageWidthScale,
  imageHeightScale,
  imageX,
  imageY,
  imageRotate,
  imageOpacity,
  imageBlur,
  imageBrightness,
  imageContrast,
  backgroundBlur,
  noiseAmount,
  reflectionIntensity,
  innerShadow,
  mockupX,
  mockupY,
  selectedMockup,
  selectedMockupUrl,
  mediaUrl,
  exportWidth,
  exportHeight,
  rotateX,
  rotateY,
  rotateZ,
  zoom,
  padding,
  onPick,
  onMediaDrop,
  onImageFitMode,
  onImageAspectLinked,
  onTransform,
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  extraMediaSlots,
  selectedSlotId,
  onSelectSlot,
  onUpdateSlot
}: {
  refEl: RefObject<HTMLDivElement>;
  device: DevicePreset;
  backgroundCss: string;
  backgroundMode: BackgroundMode;
  backgroundOpacity: number;
  canvasRatio: number;
  edgeStyleId: string;
  edgeRadius: number;
  edgeShadow: string;
  effectClass: string;
  borderColor: string;
  glowColor: string;
  shadowColor: string;
  glassColor: string;
  vignetteColor: string;
  edgeColor: string;
  borderWidth: number;
  edgeWidth: number;
  glassAmount: number;
  canvasRadius: number;
  canvasZoom: number;
  imageScale: number;
  imageFitMode: "fit" | "fill";
  imageAspectLinked: boolean;
  imageWidthScale: number;
  imageHeightScale: number;
  imageX: number;
  imageY: number;
  imageRotate: number;
  imageOpacity: number;
  imageBlur: number;
  imageBrightness: number;
  imageContrast: number;
  backgroundBlur: number;
  noiseAmount: number;
  reflectionIntensity: number;
  innerShadow: number;
  mockupX: number;
  mockupY: number;
  selectedMockup: LocalMockup | null;
  selectedMockupUrl: string | null;
  mediaUrl: string | null;
  exportWidth: number;
  exportHeight: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  zoom: number;
  padding: number;
  onPick: () => void;
  onMediaDrop: (url: string, name: string) => void;
  onImageFitMode: (mode: "fit" | "fill") => void;
  onImageAspectLinked: (linked: boolean) => void;
  onTransform: (key: TransformKey, value: number) => void;
  layers: StudioLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, patch: Partial<StudioLayer>) => void;
  extraMediaSlots: ExtraMediaSlot[];
  selectedSlotId: string | null;
  onSelectSlot: (id: string | null) => void;
  onUpdateSlot: (id: string, patch: Partial<ExtraMediaSlot>) => void;
}) {
  const [mediaSize, setMediaSize] = useState<{ width: number; height: number } | null>(null);
  const isFreeform = device.type === "freeform";
  const hasFrameMockup = Boolean(selectedMockup);
  const frameScreen = selectedMockup?.screen ?? defaultFrameScreen;
  const frameRatio = selectedMockup?.frameWidth && selectedMockup?.frameHeight ? selectedMockup.frameWidth / selectedMockup.frameHeight : 393 / 852;
  const fallbackMediaSize = { width: exportWidth, height: exportHeight };
  const activeMediaSize = mediaSize ?? fallbackMediaSize;
  const baseScale = imageFitMode === "fill"
    ? Math.max(exportWidth / activeMediaSize.width, exportHeight / activeMediaSize.height)
    : Math.min(exportWidth / activeMediaSize.width, exportHeight / activeMediaSize.height);
  const baseWidthPercent = (activeMediaSize.width * baseScale / exportWidth) * 100;
  const baseHeightPercent = (activeMediaSize.height * baseScale / exportHeight) * 100;
  const isCircleFrame = isFreeform && edgeRadius >= 500;
  const circleBasePercent = Math.min(baseWidthPercent, baseHeightPercent);
  const freeformWidthPercent = (isCircleFrame ? circleBasePercent : baseWidthPercent) * (imageWidthScale / 100);
  const freeformHeightPercent = (isCircleFrame ? circleBasePercent : baseHeightPercent) * (imageHeightScale / 100);
  const deviceRatio = hasFrameMockup ? frameRatio : isFreeform ? activeMediaSize.width / activeMediaSize.height : device.ratio;
  const width = hasFrameMockup ? 360 : device.type === "phone" ? 286 : device.type === "tablet" ? 440 : isFreeform ? `${freeformWidthPercent}%` : 620;
  const height = hasFrameMockup ? (width as number) / deviceRatio : isFreeform ? `${freeformHeightPercent}%` : (width as number) / deviceRatio;
  const outerEdgeShadow = buildFrameEdgeShadow(edgeStyleId, edgeColor, edgeWidth);
  const combinedFrameShadow = [edgeShadow === "none" ? "" : edgeShadow, outerEdgeShadow].filter(Boolean).join(", ") || "none";
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const imageDragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const layerDragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);
  const slotDragRef = useRef<{ id: string; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const setWidthScale = (value: number) => {
    onTransform("imageWidthScale", value);
    if (imageAspectLinked) onTransform("imageHeightScale", value);
  };
  const setHeightScale = (value: number) => {
    onTransform("imageHeightScale", value);
    if (imageAspectLinked) onTransform("imageWidthScale", value);
  };
  const stretchToWidth = () => {
    const nextWidth = Math.round(10000 / Math.max(baseWidthPercent, 0.01));
    setWidthScale(Math.min(300, Math.max(0, nextWidth)));
  };
  const fillBannerZone = () => {
    const safeWidthPercent = (1546 / 2560) * 100;
    const safeHeightPercent = (423 / 1440) * 100;
    const nextWidth = Math.round((safeWidthPercent / Math.max(baseWidthPercent, 0.01)) * 100);
    const nextHeight = Math.round((safeHeightPercent / Math.max(baseHeightPercent, 0.01)) * 100);
    onTransform("imageWidthScale", Math.min(300, Math.max(0, nextWidth)));
    onTransform("imageHeightScale", Math.min(300, Math.max(0, imageAspectLinked ? nextWidth : nextHeight)));
  };

  useEffect(() => {
    setMediaSize(null);
  }, [mediaUrl]);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if ((event.target as HTMLElement).classList.contains("media-image")) {
      imageDragRef.current = { startX: event.clientX, startY: event.clientY, originX: imageX, originY: imageY };
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }
    dragRef.current = { startX: event.clientX, startY: event.clientY, originX: mockupX, originY: mockupY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const layerDrag = layerDragRef.current;
    if (layerDrag) {
      const rect = event.currentTarget.getBoundingClientRect();
      const nextX = layerDrag.originX + ((event.clientX - layerDrag.startX) / Math.max(rect.width, 1)) * 100;
      const nextY = layerDrag.originY + ((event.clientY - layerDrag.startY) / Math.max(rect.height, 1)) * 100;
      onUpdateLayer(layerDrag.id, {
        x: Math.round(Math.min(100, Math.max(0, nextX))),
        y: Math.round(Math.min(100, Math.max(0, nextY)))
      });
      return;
    }
    const imageDrag = imageDragRef.current;
    if (imageDrag) {
      onTransform("imageX", Math.round(imageDrag.originX + event.clientX - imageDrag.startX));
      onTransform("imageY", Math.round(imageDrag.originY + event.clientY - imageDrag.startY));
      return;
    }
    const drag = dragRef.current;
    if (!drag) return;
    const nextX = Math.round(drag.originX + event.clientX - drag.startX);
    const nextY = Math.round(drag.originY + event.clientY - drag.startY);
    if (Math.abs(nextX - drag.originX) > 2 || Math.abs(nextY - drag.originY) > 2) drag.moved = true;
    onTransform("mockupX", nextX);
    onTransform("mockupY", nextY);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const imageDrag = imageDragRef.current;
    const layerDrag = layerDragRef.current;
    layerDragRef.current = null;
    dragRef.current = null;
    imageDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (imageDrag || layerDrag) return;
    if (drag && !drag.moved) onPick();
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const placementRect = event.currentTarget.getBoundingClientRect();
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      image.onload = () => {
        const initialScale = Math.min(placementRect.width / image.naturalWidth, placementRect.height / image.naturalHeight);
        setMediaSize({ width: image.naturalWidth, height: image.naturalHeight });
        onMediaDrop(dataUrl, file.name);
        onImageFitMode("fit");
        onTransform("imageWidthScale", 100);
        onTransform("imageHeightScale", 100);
        onTransform("imageScale", 100);
        onTransform("imageX", 0);
        onTransform("imageY", 0);
        if (Number.isFinite(initialScale)) {
          onTransform("mockupX", 0);
          onTransform("mockupY", 0);
        }
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleStagePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const slotDrag = slotDragRef.current;
    const layerDrag = layerDragRef.current;
    if (layerDrag) {
      const rect = event.currentTarget.getBoundingClientRect();
      const nextX = layerDrag.originX + ((event.clientX - layerDrag.startX) / Math.max(rect.width, 1)) * 100;
      const nextY = layerDrag.originY + ((event.clientY - layerDrag.startY) / Math.max(rect.height, 1)) * 100;
      onUpdateLayer(layerDrag.id, {
        x: Math.round(Math.min(100, Math.max(0, nextX))),
        y: Math.round(Math.min(100, Math.max(0, nextY)))
      });
      return;
    }
    if (!slotDrag) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nextX = slotDrag.originX + ((event.clientX - slotDrag.startX) / Math.max(rect.width, 1)) * 100;
    const nextY = slotDrag.originY + ((event.clientY - slotDrag.startY) / Math.max(rect.height, 1)) * 100;
    onUpdateSlot(slotDrag.id, {
      x: Math.round(Math.min(100, Math.max(0, nextX))),
      y: Math.round(Math.min(100, Math.max(0, nextY)))
    });
  };

  const handleStagePointerUp = () => {
    slotDragRef.current = null;
    layerDragRef.current = null;
  };

  return (
    <div className="canvas-stage">
      <div
        ref={refEl}
        className={`export-stage ${backgroundMode === "transparent" ? "transparent-stage" : ""}`}
        onPointerMove={handleStagePointerMove}
        onPointerUp={handleStagePointerUp}
        onPointerCancel={handleStagePointerUp}
        onPointerDown={(event) => {
          if (!(event.target as HTMLElement).closest(".annotation-item")) {
            onSelectLayer(null);
          }
        }}
        style={
          {
            padding,
            borderRadius: canvasRadius,
            aspectRatio: `${canvasRatio}`,
            transform: `scale(${canvasZoom / 100})`,
            "--bg-blur": `${backgroundBlur}px`,
            "--stage-background": backgroundCss,
            "--background-opacity": backgroundOpacity / 100,
            "--noise-opacity": noiseAmount / 100,
            "--reflection-opacity": reflectionIntensity / 100,
            "--inner-shadow": innerShadow / 100
          } as React.CSSProperties
        }
      >
        {backgroundMode === "transparent" ? <div className="transparent-checker" data-export-ignore="true" /> : null}
        <div className="stage-background" />
        <div className="stage-light" />
        <div className="stage-noise" />
        {extraMediaSlots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className={`extra-media-slot ${slot.framed ? "framed" : ""} ${slot.hidden ? "hidden-layer" : ""} ${selectedSlotId === slot.id ? "selected" : ""}`}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
              width: `${slot.scale}%`,
              opacity: slot.opacity / 100,
              transform: `translate(-50%, -50%) rotate(${slot.rotation}deg)`,
              filter: `blur(${slot.blur ?? 0}px) brightness(${slot.brightness ?? 100}%) contrast(${slot.contrast ?? 100}%)`
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              onSelectSlot(slot.id);
              onSelectLayer(null);
              slotDragRef.current = {
                id: slot.id,
                startX: event.clientX,
                startY: event.clientY,
                originX: slot.x,
                originY: slot.y
              };
            }}
          >
            <img src={slot.url} alt="" style={{ objectFit: slot.fit ?? "cover" }} />
          </button>
        ))}
        <button
          className={`device-frame ${device.type} ${effectClass} edge-${edgeStyleId} ${hasFrameMockup ? "has-frame-mockup" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          style={{
            width,
            height,
            maxWidth: hasFrameMockup ? `${zoom}%` : isFreeform ? "none" : `${zoom}%`,
            borderRadius: edgeRadius,
            boxShadow: combinedFrameShadow,
            border: "0 solid transparent",
            outline: borderWidth ? `${borderWidth}px solid ${borderColor}` : "1px solid transparent",
            outlineOffset: borderWidth ? `${Math.max(1, Math.round(borderWidth / 3))}px` : "0",
            backdropFilter: `blur(${glassAmount}px)`,
            transform: `translate(${mockupX}px, ${mockupY}px) perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
            "--glass-effect-color": hexToRgba(glassColor, 0.46),
            "--glow-effect-color": hexToRgba(glowColor, 0.62),
            "--vignette-effect-color": hexToRgba(vignetteColor, 0.42),
            "--shadow-effect-color": hexToRgba(shadowColor, 0.46),
            "--border-effect-color": borderColor
          } as React.CSSProperties}
        >
          <span className="tile-shell" />
          <span className="tile-back" />
          {hasFrameMockup && selectedMockupUrl ? (
            <>
              <span
                className="mockup-screen"
                style={{
                  left: `${frameScreen.x}%`,
                  top: `${frameScreen.y}%`,
                  width: `${frameScreen.width}%`,
                  height: `${frameScreen.height}%`,
                  borderRadius: `${frameScreen.radius ?? 8}%`
                }}
              >
                {mediaUrl ? (
                  <img
                    className="media-image mockup-screen-media"
                    src={mediaUrl}
                    alt="Uploaded mockup media"
                    onLoad={(event) => {
                      const image = event.currentTarget;
                      if (image.naturalWidth && image.naturalHeight) setMediaSize({ width: image.naturalWidth, height: image.naturalHeight });
                    }}
                    style={{
                      opacity: imageOpacity / 100,
                      transform: `translate(${imageX}px, ${imageY}px) rotate(${imageRotate}deg) scale(${imageScale / 100})`,
                      filter: `blur(${imageBlur}px) brightness(${imageBrightness}%) contrast(${imageContrast}%)`
                    }}
                  />
                ) : (
                  <span className="empty-state frame-empty-state">
                    <span><ImagePlus size={26} /></span>
                    <strong>Drop or select</strong>
                    <small>Add a photo to preview</small>
                  </span>
                )}
              </span>
              <img className="mockup-frame" src={selectedMockupUrl} alt={selectedMockup?.name ?? "Device frame"} />
            </>
          ) : (
            <>
          <DeviceChrome device={device} edgeStyleId={edgeStyleId} edgeRadius={edgeRadius} edgeColor={edgeColor} edgeWidth={edgeWidth} />
          {mediaUrl ? (
            <img
              className="media-image"
              src={mediaUrl}
              alt="Uploaded mockup media"
              onLoad={(event) => {
                const image = event.currentTarget;
                if (image.naturalWidth && image.naturalHeight) setMediaSize({ width: image.naturalWidth, height: image.naturalHeight });
              }}
              style={{
                opacity: imageOpacity / 100,
                transform: `translate(${imageX}px, ${imageY}px) rotate(${imageRotate}deg) scale(${imageScale / 100})`,
                filter: `blur(${imageBlur}px) brightness(${imageBrightness}%) contrast(${imageContrast}%)`
              }}
            />
          ) : (
            <span className="empty-state">
              <span><ImagePlus size={30} /></span>
              <strong>Drop or select</strong>
              <small>Add a photo to preview</small>
            </span>
          )}
            </>
          )}
          <span className="reflection" />
          <span className="inner-shadow" />
          <span className="hover-pick"><ImagePlus size={26} /></span>
        </button>
        {layers.length ? (
          <span className="annotation-layer canvas-annotation-layer">
            {layers.map((layer) => (
              <span
                key={layer.id}
                className={`annotation-item ${layer.kind} ${layer.hidden ? "hidden-layer" : ""} ${selectedLayerId === layer.id ? "selected" : ""}`}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  color: layer.color,
                  background: ["badge", "highlight", "blur"].includes(layer.kind) ? layer.background : "transparent",
                  fontSize: layer.size,
                  opacity: (layer.opacity ?? 100) / 100,
                  fontFamily: layer.fontFamily ?? (layer.kind === "arrow" ? "Georgia" : "Inter"),
                  fontWeight: layer.fontWeight ?? 900,
                  textAlign: layer.align ?? "center",
                  letterSpacing: `${layer.letterSpacing ?? 0}px`,
                  lineHeight: (layer.lineHeight ?? 110) / 100,
                  textShadow: getLayerTextShadow(layer),
                  width: ["rect", "ellipse", "highlight", "blur", "arrow"].includes(layer.kind) ? `${layer.width ?? 30}%` : undefined,
                  height: ["rect", "ellipse", "highlight", "blur", "arrow"].includes(layer.kind) ? `${layer.height ?? 20}%` : undefined,
                  borderColor: ["rect", "ellipse"].includes(layer.kind) ? layer.color : undefined,
                  borderWidth: ["rect", "ellipse"].includes(layer.kind) ? layer.strokeWidth ?? 3 : undefined,
                  borderStyle: ["rect", "ellipse"].includes(layer.kind) ? layer.lineStyle ?? "solid" : undefined,
                  backdropFilter: layer.kind === "blur" ? `blur(${layer.blurAmount ?? 10}px)` : undefined,
                  transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`
                }}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelectLayer(layer.id);
                  onSelectSlot(null);
                  layerDragRef.current = {
                    id: layer.id,
                    startX: event.clientX,
                    startY: event.clientY,
                    originX: layer.x,
                    originY: layer.y
                  };
                }}
              >
                {layer.label}
              </span>
            ))}
          </span>
        ) : null}
      </div>
      <div className="bottom-action-bar" data-export-ignore="true">
        <button className="primary-button compact" onClick={onPick}>
          <Upload size={16} />
          Select media
        </button>
        <button className="icon-button" onClick={() => {
          onTransform("mockupX", 0);
          onTransform("mockupY", 0);
          onTransform("imageX", 0);
          onTransform("imageY", 0);
        }} aria-label="Center media">
          <RotateCcw size={17} />
        </button>
        <button className={imageAspectLinked ? "active icon" : "icon"} onClick={() => onImageAspectLinked(!imageAspectLinked)} aria-label={imageAspectLinked ? "Unlink aspect ratio" : "Link aspect ratio"}>
          {imageAspectLinked ? <Link2 size={15} /> : <Unlink size={15} />}
        </button>
        <button className={imageFitMode === "fit" ? "active" : ""} onClick={() => onImageFitMode("fit")}>Fit</button>
        <button className={imageFitMode === "fill" ? "active" : ""} onClick={() => onImageFitMode("fill")}>Fill Canvas</button>
        <button onClick={stretchToWidth}>Stretch Width</button>
        <button onClick={fillBannerZone}>Banner Zone</button>
        <span>{Math.round(imageWidthScale)}% x {Math.round(imageHeightScale)}%</span>
      </div>
    </div>
  );
}

function getLayerTextShadow(layer: StudioLayer) {
  if (!["text", "badge", "arrow"].includes(layer.kind)) return "none";
  const opacity = layer.textShadowOpacity ?? (layer.kind === "text" ? 34 : 0);
  const blur = layer.textShadowBlur ?? (layer.kind === "text" ? 22 : 0);
  const x = layer.textShadowX ?? 0;
  const y = layer.textShadowY ?? (layer.kind === "text" ? 10 : 0);
  if (opacity <= 0 || (blur <= 0 && x === 0 && y === 0)) return "none";
  return `${x}px ${y}px ${blur}px ${hexToRgba(layer.textShadowColor ?? "#000000", opacity / 100)}`;
}

function DeviceChrome({
  device,
  edgeStyleId,
  edgeRadius,
  edgeColor,
  edgeWidth
}: {
  device: DevicePreset;
  edgeStyleId: string;
  edgeRadius: number;
  edgeColor: string;
  edgeWidth: number;
}) {
  if (edgeWidth <= 0) return null;
  const chromeBorderColor = getEdgeChromeColor(edgeStyleId, edgeColor);
  const chromeBorderWidth = getEdgeChromeWidth(edgeStyleId, edgeWidth);

  if (device.type === "freeform") {
    return <span className="freeform-outline" style={{ borderRadius: edgeRadius, boxShadow: buildEdgeBoxShadow(edgeStyleId, edgeColor, edgeWidth) }} />;
  }

  if (device.type === "browser") {
    return (
      <>
        <span className="browser-bar" style={{ borderRadius: `${edgeRadius}px ${edgeRadius}px 0 0` }}>
          <i />
          <i />
          <i />
        </span>
        <span className="browser-outline" style={{ borderRadius: edgeRadius, borderColor: chromeBorderColor, borderWidth: chromeBorderWidth, boxShadow: buildEdgeBoxShadow(edgeStyleId, edgeColor, Math.max(1, edgeWidth - 1)) }} />
      </>
    );
  }

  if (device.type === "laptop") {
    return (
      <>
        <span className="laptop-bezel" style={{ borderRadius: edgeRadius, borderColor: chromeBorderColor, borderWidth: chromeBorderWidth, boxShadow: buildEdgeBoxShadow(edgeStyleId, edgeColor, Math.max(1, edgeWidth - 1)) }} />
        <span className="laptop-base" />
      </>
    );
  }

  return (
    <>
      <span className="phone-bezel" style={{ borderRadius: edgeRadius, borderColor: chromeBorderColor, borderWidth: chromeBorderWidth, boxShadow: buildEdgeBoxShadow(edgeStyleId, edgeColor, Math.max(1, edgeWidth - 1)) }} />
      {device.type === "phone" ? <span className="phone-island" /> : null}
    </>
  );
}

function MiniDevice({ device }: { device: DevicePreset }) {
  return (
    <span className={`mini-device ${device.type}`}>
      <span />
    </span>
  );
}

function DeviceIcon({ device }: { device: DevicePreset }) {
  if (device.type === "phone") return <Smartphone size={18} />;
  if (device.type === "laptop") return <Laptop size={18} />;
  if (device.type === "freeform") return <Square size={18} />;
  return <MonitorUp size={18} />;
}

function formatRatio(width: number, height: number) {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function formatPlanName(access: AccessSummary | null) {
  if (!access) return "Checking plan";
  if (access.planType === "trial") return "1-Day Free Trial";
  if (access.planType === "monthly") return "1-Month Plan";
  if (access.planType === "yearly") return "1-Year Plan";
  if (access.planType === "lifetime") return "Lifetime Access";
  return "No active plan";
}

function formatAccessLine(access: AccessSummary | null) {
  if (!access) return "Loading account access";
  if (access.planType === "trial") return `${access.exportsRemaining ?? 0} of 5 exports remaining`;
  if (access.planType === "monthly" || access.planType === "yearly" || access.planType === "lifetime") return "Unlimited exports";
  return "Choose a plan to export";
}

function formatExpiryLine(access: AccessSummary | null) {
  if (!access) return "Checking subscription expiry";
  if (!access.hasAccess) return "No active subscription";
  if (!access.expiresAt || access.planType === "lifetime") return "Lifetime access";

  const date = new Date(access.expiresAt);
  if (Number.isNaN(date.getTime())) return "Expiry unavailable";

  return `Expires ${date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  })}`;
}

function StudioLoadingScreen({ theme }: { theme: "light" | "dark" }) {
  return (
    <main className={`studio-loading-shell ${theme}`}>
      <section className="studio-loading-card">
        <span className="studio-loading-mark"><EasyFrameMark size={34} /></span>
        <small>EasyFrame Studio</small>
        <h1>Studio is loading</h1>
        <p>Preparing your canvas, presets, media tools, and export controls.</p>
        <div className="studio-loading-bar"><i /></div>
      </section>
      <style jsx global>{`
        .studio-loading-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          color: #f5f7fb;
          background:
            radial-gradient(circle at 78% -10%, rgba(139, 140, 246, 0.22), transparent 30%),
            radial-gradient(circle at 12% 12%, rgba(88, 213, 201, 0.1), transparent 28%),
            linear-gradient(145deg, #07080a 0%, #0b0c10 52%, #08090b 100%);
          font-family: var(--font-sans);
        }

        .studio-loading-shell.light {
          color: #101827;
          background:
            radial-gradient(circle at 8% 8%, rgba(112, 224, 218, 0.26), transparent 32%),
            radial-gradient(circle at 92% 0%, rgba(139, 140, 246, 0.26), transparent 34%),
            linear-gradient(145deg, #f8fbff 0%, #eef5f7 52%, #f7f2ff 100%);
        }

        .studio-loading-card {
          width: min(100%, 520px);
          padding: 34px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,.12);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));
          box-shadow: 0 34px 110px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.08);
          text-align: center;
        }

        .studio-loading-shell.light .studio-loading-card {
          border-color: rgba(15, 23, 42, 0.1);
          background: rgba(255,255,255,.78);
          box-shadow: 0 28px 90px rgba(15, 23, 42, 0.12);
        }

        .studio-loading-mark {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border-radius: 0;
          color: white;
          background: transparent;
          box-shadow: none;
        }

        .studio-loading-mark img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .studio-loading-card small {
          color: #68d5ec;
          font-size: 13px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .studio-loading-card h1 {
          margin: 14px 0 10px;
          font-size: clamp(38px, 6vw, 58px);
          line-height: 0.98;
          letter-spacing: -0.06em;
        }

        .studio-loading-card p {
          max-width: 390px;
          margin: 0 auto 24px;
          color: rgba(245, 247, 251, 0.68);
          font-size: 15px;
          line-height: 1.55;
        }

        .studio-loading-shell.light .studio-loading-card p {
          color: rgba(16, 24, 39, 0.62);
        }

        .studio-loading-bar {
          height: 9px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(255,255,255,.12);
        }

        .studio-loading-bar i {
          display: block;
          width: 42%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #7779f6, #56d0d2);
          animation: studio-loading-slide 1.05s ease-in-out infinite;
        }

        @keyframes studio-loading-slide {
          0% { transform: translateX(-110%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </main>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function ColorPalette({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <div className="color-control">
      <span>{label}</span>
      <div className="color-row">
        {colorPalette.map((color) => (
          <button
            type="button"
            key={color}
            className={`color-dot ${value === color ? "active" : ""}`}
            style={{ background: color }}
            onClick={() => onChange(color)}
            aria-label={`${label} ${color}`}
          />
        ))}
        <label className="color-picker custom-color-picker" style={{ background: value }} aria-label={`${label} custom color`}>
          <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        </label>
      </div>
    </div>
  );
}

function buildEdgeBoxShadow(edgeStyleId: string, edgeColor: string, edgeWidth: number) {
  const colorSoft = hexToRgba(edgeColor, 0.3);
  const colorFaint = hexToRgba(edgeColor, 0.16);
  const px = Math.max(1, edgeWidth);

  if (edgeStyleId === "default") {
    return `inset 0 0 0 1px rgba(255,255,255,.42)`;
  }

  if (edgeStyleId === "glass-light") {
    return `inset 0 0 0 1px rgba(255,255,255,.46), inset 0 1px 0 rgba(255,255,255,.68)`;
  }

  if (edgeStyleId === "glass-dark") {
    return `inset 0 0 0 1px rgba(15,18,22,.24), inset 0 1px 0 rgba(255,255,255,.26)`;
  }

  if (edgeStyleId === "liquid") {
    return `inset 0 0 0 1px rgba(255,255,255,.44), inset 0 1px 0 rgba(255,255,255,.78), inset 0 -12px 24px rgba(255,255,255,.11), 0 0 22px ${hexToRgba(edgeColor, 0.2)}`;
  }

  if (edgeStyleId === "inset-light") {
    return `inset 0 0 0 1px rgba(255,255,255,.58), inset 4px 4px 10px rgba(15,23,42,.08)`;
  }

  if (edgeStyleId === "inset-dark") {
    return `inset 0 0 0 1px rgba(15,18,22,.26), inset 4px 4px 10px rgba(0,0,0,.16)`;
  }

  if (edgeStyleId === "outline") {
    return `inset 0 0 0 ${Math.max(2, px)}px ${colorSoft}, inset 0 0 0 ${Math.max(3, px + 1)}px rgba(255,255,255,.5)`;
  }

  if (edgeStyleId === "border") {
    return `inset 0 0 0 ${Math.max(3, px + 1)}px rgba(255,255,255,.9), inset 0 -7px 14px rgba(15,23,42,.16), 0 18px 44px rgba(15,23,42,.14)`;
  }

  if (edgeStyleId === "retro") {
    return `inset 0 0 0 1px rgba(15,18,22,.28), inset 6px 6px 0 rgba(255,255,255,.13)`;
  }

  if (edgeStyleId === "card") {
    return `0 2px 0 rgba(255,255,255,.72) inset, 0 16px 0 -10px rgba(255,255,255,.82), 0 30px 55px rgba(15,23,42,.14)`;
  }

  if (edgeStyleId === "stack") {
    return `0 2px 0 rgba(255,255,255,.78) inset, 0 10px 0 -4px rgba(255,255,255,.78), 0 20px 0 -8px rgba(229,234,236,.72), 0 34px 58px rgba(15,23,42,.16)`;
  }

  if (edgeStyleId === "stack-2") {
    return `0 2px 0 rgba(255,255,255,.82) inset, -11px 12px 0 -5px rgba(255,255,255,.72), -22px 24px 0 -12px rgba(222,228,232,.62), 0 36px 62px rgba(15,23,42,.16)`;
  }

  return `inset 0 0 0 ${px}px ${edgeColor}`;
}

function buildFrameEdgeShadow(edgeStyleId: string, edgeColor: string, edgeWidth: number) {
  if (edgeWidth <= 0) return "";
  const px = Math.max(1, edgeWidth);

  if (edgeStyleId === "liquid") {
    return `0 0 0 ${px}px rgba(255,255,255,.66), 0 0 0 ${px + 4}px ${hexToRgba(edgeColor, 0.2)}, 0 0 30px ${hexToRgba(edgeColor, 0.3)}, 0 24px 54px rgba(15,23,42,.18)`;
  }

  if (edgeStyleId === "glass-light") {
    return `0 0 0 ${px}px rgba(255,255,255,.62), 0 0 0 ${px + 3}px rgba(255,255,255,.24), 0 20px 46px rgba(15,23,42,.15)`;
  }

  if (edgeStyleId === "glass-dark") {
    return `0 0 0 ${px}px rgba(15,18,22,.34), 0 0 0 ${px + 3}px rgba(255,255,255,.16), 0 22px 48px rgba(0,0,0,.2)`;
  }

  if (edgeStyleId === "inset-light") {
    return `0 0 0 ${px}px rgba(255,255,255,.5), 0 18px 42px rgba(15,23,42,.12)`;
  }

  if (edgeStyleId === "inset-dark") {
    return `0 0 0 ${px}px rgba(15,18,22,.36), 0 18px 42px rgba(0,0,0,.16)`;
  }

  if (edgeStyleId === "retro") {
    return `0 0 0 ${Math.max(2, px)}px rgba(15,18,22,.72), 8px 8px 0 rgba(15,18,22,.7), 0 22px 46px rgba(15,23,42,.16)`;
  }

  if (edgeStyleId === "card") {
    return `0 12px 0 -6px rgba(255,255,255,.8), 0 28px 48px rgba(15,23,42,.14)`;
  }

  if (edgeStyleId === "stack") {
    return `0 10px 0 -4px rgba(255,255,255,.8), 0 20px 0 -8px rgba(222,228,232,.72), 0 34px 58px rgba(15,23,42,.16)`;
  }

  if (edgeStyleId === "stack-2") {
    return `-10px 12px 0 -5px rgba(255,255,255,.72), -20px 24px 0 -11px rgba(222,228,232,.64), 0 34px 58px rgba(15,23,42,.16)`;
  }

  return `0 0 0 ${px}px ${colorSoftSafe(edgeColor)}, 0 18px 42px rgba(15,23,42,.12)`;
}

function colorSoftSafe(color: string) {
  return /^#[0-9a-fA-F]{3,6}$/.test(color) ? hexToRgba(color, 0.34) : "rgba(15,23,42,.22)";
}

function getEdgeChromeColor(edgeStyleId: string, edgeColor: string) {
  if (["glass-light", "liquid", "inset-light", "card", "stack", "stack-2"].includes(edgeStyleId)) return "rgba(255,255,255,.52)";
  if (["glass-dark", "inset-dark", "retro"].includes(edgeStyleId)) return "rgba(15,18,22,.58)";
  if (edgeStyleId === "border") return "rgba(255,255,255,.8)";
  return edgeColor;
}

function getEdgeChromeWidth(edgeStyleId: string, edgeWidth: number) {
  if (["liquid", "glass-light", "glass-dark", "card", "stack", "stack-2"].includes(edgeStyleId)) return Math.max(1, Math.round(edgeWidth / 2));
  if (edgeStyleId === "retro") return Math.max(3, edgeWidth);
  return edgeWidth;
}

async function resizeExport(sourceDataUrl: string, width: number, height: number, format: "png" | "jpg" | "webp", quality: number, cornerRadius = 0) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = sourceDataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return sourceDataUrl;
  context.clearRect(0, 0, width, height);
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const outputRadius = Math.min(width / 2, height / 2, Math.max(0, cornerRadius * scale));
  if (format === "png" && outputRadius > 0) {
    context.save();
    drawRoundedRectPath(context, 0, 0, width, height, outputRadius);
    context.clip();
  }
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
  if (format === "png" && outputRadius > 0) {
    context.restore();
  }
  if (format === "jpg") return canvas.toDataURL("image/jpeg", quality / 100);
  if (format === "webp") return canvas.toDataURL("image/webp", quality / 100);
  return canvas.toDataURL("image/png");
}

function drawRoundedRectPath(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function buildShadow(baseShadow: string, shadowIntensity: number, glowIntensity: number, effectId: string, shadowColor: string, glowColor: string) {
  const opacityScale = shadowIntensity / 100;
  const tonedShadow = baseShadow === "none" ? "none" : `0 ${Math.round(16 + shadowIntensity * 0.18)}px ${Math.round(32 + shadowIntensity * 0.6)}px ${hexToRgba(shadowColor, Math.min(0.5 * opacityScale, 0.65))}`;
  const glow = glowIntensity > 0 || effectId === "glow" ? `0 0 ${Math.round(24 + glowIntensity * 0.8)}px ${hexToRgba(glowColor, glowIntensity / 160)}` : "";
  return [tonedShadow === "none" ? "" : tonedShadow, glow].filter(Boolean).join(", ") || "none";
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(Math.max(alpha, 0), 0.85).toFixed(3)})`;
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")).join("")}`;
}

function moveArrayItem<T extends { id: string }>(items: T[], id: string, direction: "up" | "down") {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return items;
  const nextIndex = direction === "up" ? Math.min(items.length - 1, index + 1) : Math.max(0, index - 1);
  if (nextIndex === index) return items;
  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, item);
  return nextItems;
}

const sliderResetValues: Record<string, number> = {
  Opacity: 100,
  Radius: 34,
  "Edge size": 0,
  "Outer border": 0,
  Quality: 92,
  "Canvas zoom": 100,
  "Mockup zoom": 82,
  "Frame padding": 70,
  "Bg blur": 0,
  Width: 100,
  Height: 100,
  Scale: 100,
  "Move X": 0,
  "Move Y": 0,
  Rotate: 0,
  Blur: 0,
  Brightness: 100,
  Contrast: 100,
  "Pitch 3D": 0,
  "Yaw 3D": 0,
  Roll: 0,
  Border: 0,
  Edge: 0,
  Shadow: 80,
  Glow: 32,
  Glass: 18,
  Grain: 0,
  Reflection: 0,
  "Inner shadow": 0
  ,
  "Layer X": 50,
  "Layer Y": 50,
  "Layer size": 42,
  "Layer rotate": 0,
  "Layer opacity": 100,
  "Layer width": 30,
  "Layer height": 20,
  Stroke: 3,
  "Redact blur": 10,
  "Slot X": 50,
  "Slot Y": 50,
  "Slot scale": 32,
  "Slot rotate": 0,
  "Slot opacity": 100,
  "Slot blur": 0,
  "Slot brightness": 100,
  "Slot contrast": 100,
  "Canvas roundness": 34
};

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  const resetValue = Math.min(max, Math.max(min, sliderResetValues[label] ?? min));

  return (
    <div className="slider">
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <button type="button" className="slider-reset" onClick={() => onChange(resetValue)} aria-label={`Reset ${label}`}>
        <RotateCcw size={12} />
      </button>
    </div>
  );
}

function ToolSection({
  id,
  title,
  openId,
  onToggle,
  children
}: {
  id: string;
  title: string;
  openId: string | string[];
  onToggle: (id: string) => void;
  children: ReactNode;
}) {
  const open = Array.isArray(openId) ? openId.includes(id) : openId === id;

  return (
    <section className={`left-tool-card left-tool-${id} ${open ? "open" : ""}`}>
      <button className="left-tool-header" type="button" aria-expanded={open} onClick={() => onToggle(id)}>
        <span className="left-tool-copy">
          <strong>{title}</strong>
          <small>{open ? "Editing controls visible" : "Click to expand controls"}</small>
        </span>
        <b aria-hidden="true">{open ? "-" : "+"}</b>
      </button>
      {open ? <div className="left-tool-body">{children}</div> : null}
    </section>
  );
}

function PanelTitle({ title, flush = false }: { title: string; flush?: boolean }) {
  return <h2 className={flush ? "panel-title flush" : "panel-title"}>{title}</h2>;
}

function StudioStyles() {
  return (
    <style jsx global>{`
      .studio-app {
        min-height: 100vh;
        background:
          radial-gradient(circle at 16% 0%, rgba(255, 255, 255, 0.95), transparent 30%),
          linear-gradient(135deg, #f5f1e8 0%, #ebe4d7 52%, #ddd7cc 100%);
        color: #151713;
        font-family: var(--font-sans);
        overflow: hidden;
      }

      .studio-app.dark {
        background:
          radial-gradient(circle at 12% 0%, rgba(255, 104, 88, 0.16), transparent 28%),
          radial-gradient(circle at 88% 4%, rgba(109, 93, 252, 0.22), transparent 30%),
          linear-gradient(135deg, #08090a 0%, #101211 52%, #171612 100%);
        color: #f7f4ec;
      }

      .studio-app button,
      .studio-app a {
        border: 0;
        cursor: pointer;
        font: inherit;
        text-decoration: none;
      }

      .studio-app.dark .side-panel,
      .studio-app.dark .control-card,
      .studio-app.dark .template-card,
      .studio-app.dark .device-row,
      .studio-app.dark .ghost-button,
      .studio-app.dark .segmented,
      .studio-app.dark .canvas-meta,
      .studio-app.dark .floating-toolbar {
        border-color: rgba(255, 255, 255, 0.11);
        background: rgba(20, 22, 20, 0.78);
        color: #f7f4ec;
      }

      .studio-app.dark .brand small,
      .studio-app.dark .template-card small,
      .studio-app.dark .device-row small,
      .studio-app.dark .muted,
      .studio-app.dark .soon-card small {
        color: rgba(247, 244, 236, 0.54);
      }

      .studio-app.dark .tabs,
      .studio-app.dark .device-icon {
        background: rgba(255, 255, 255, 0.08);
      }

      .studio-app.dark .tabs button {
        color: rgba(247, 244, 236, 0.62);
      }

      .studio-app.dark .tabs .active,
      .studio-app.dark .media-drop span {
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
        color: white;
      }

      .studio-app.dark .format-row button,
      .studio-app.dark .preset-row button,
      .studio-app.dark .size-row input,
      .studio-app.dark .disabled-card input {
        color: #f7f4ec;
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.12);
      }

      .studio-app.dark .format-row .active,
      .studio-app.dark .device-row.active,
      .studio-app.dark .local-mockup-grid .active {
        color: #fff;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
      }

      .studio-app.dark .preset-row button:hover,
      .studio-app.dark .format-row button:hover {
        background: rgba(255, 255, 255, 0.16);
      }

      .studio-app.dark .canvas-shell {
        border-color: rgba(255, 255, 255, 0.12);
        background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.025)), #111312;
      }

      .studio-app.dark .panel-title,
      .studio-app.dark .slider small {
        color: rgba(247, 244, 236, 0.46);
      }

      .topbar {
        height: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
      }

      .topbar,
      .side-panel,
      .canvas-toolbar,
      .canvas-meta,
      .bottom-action-bar,
      .tool-section,
      .floating-toolbar,
      .right-panel {
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }

      .studio-app input,
      .studio-app textarea,
      .studio-app [contenteditable="true"] {
        -webkit-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }

      .brand,
      .top-actions,
      .canvas-toolbar,
      .canvas-meta,
      .floating-toolbar,
      .device-row,
      .export-card {
        display: flex;
        align-items: center;
      }

      .brand {
        gap: 12px;
      }

      .brand-mark {
        width: 38px;
        height: 42px;
        display: grid;
        place-items: center;
        color: white;
        background: transparent;
        box-shadow: none;
      }

      .brand strong,
      .export-card strong,
      .template-card strong,
      .device-row strong,
      .file-name {
        display: block;
        font-size: 14px;
        line-height: 1.2;
      }

      .brand-title-line {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .brand-title-line b {
        display: inline-flex;
        align-items: center;
        min-height: 20px;
        padding: 0 7px;
        border-radius: 999px;
        border: 1px solid var(--ef-line, var(--stroke));
        color: var(--ef-text-soft, var(--text-secondary));
        background: var(--ef-panel-soft, var(--panel-soft));
        font-size: 11px;
        font-weight: 850;
        line-height: 1;
      }

      .studio-app.light .brand-title-line b {
        color: #172033 !important;
        border-color: rgba(17, 24, 39, 0.14) !important;
        background: rgba(255, 255, 255, 0.76) !important;
      }

      .brand small,
      .export-card small,
      .template-card small,
      .device-row small,
      .muted,
      .soon-card small {
        display: block;
        color: rgba(21, 23, 19, 0.52);
        font-size: 12px;
        margin-top: 3px;
      }

      .top-actions {
        gap: 10px;
        position: relative;
      }

      .primary-button,
      .ghost-button,
      .icon-button {
        border-radius: 999px;
        min-height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 750;
        transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
      }

      .primary-button {
        padding: 0 18px;
        color: #fff;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
        box-shadow: 0 18px 42px rgba(241, 43, 143, 0.24);
      }

      .primary-button.compact {
        min-height: 42px;
        padding: 0 16px;
      }

      .ghost-button {
        padding: 0 15px;
        color: #151713;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(21, 23, 19, 0.1);
      }

      .icon-button {
        width: 42px;
        color: #151713;
        background: rgba(255, 255, 255, 0.72);
      }

      .primary-button:hover,
      .ghost-button:hover,
      .icon-button:hover,
      .template-card:hover,
      .device-row:hover {
        transform: translateY(-1px);
      }

      .profile-menu {
        position: relative;
      }

      .profile-button {
        min-height: 42px;
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 4px 12px 4px 5px;
        border-radius: 999px;
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.1) !important;
        font-size: 13px;
        font-weight: 850;
      }

      .profile-button img,
      .profile-button span {
        width: 32px;
        height: 32px;
        border-radius: 999px;
      }

      .profile-button img {
        object-fit: cover;
      }

      .profile-button span {
        display: grid;
        place-items: center;
        color: white;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
      }

      .profile-dropdown {
        position: absolute;
        z-index: 40;
        top: calc(100% + 10px);
        right: 0;
        width: 230px;
        padding: 12px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(17,19,18,.94);
        box-shadow: 0 24px 70px rgba(0,0,0,.42);
        backdrop-filter: blur(18px);
      }

      .profile-dropdown small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(247,244,236,.56);
        font-size: 12px;
        margin-bottom: 10px;
      }

      .account-plan {
        margin: 0 0 10px;
        padding: 11px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.1);
        background: rgba(255,255,255,.07);
      }

      .account-plan b {
        display: block;
        color: #f7f4ec;
        font-size: 13px;
        line-height: 1.2;
      }

      .account-plan span {
        display: block;
        margin-top: 4px;
        color: rgba(247,244,236,.62);
        font-size: 12px;
      }

      .profile-dropdown button {
        width: 100%;
        height: 38px;
        border-radius: 12px;
        color: #151713;
        background: #f7f4ec;
        font-size: 13px;
        font-weight: 900;
      }

      .account-upgrade-button {
        width: 100%;
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        border-radius: 12px;
        color: #ffffff;
        background: linear-gradient(135deg, #7779f6, #56d0d2);
        text-decoration: none;
        font-size: 13px;
        font-weight: 900;
      }

      .workspace {
        height: calc(100vh - 72px);
        display: grid;
        grid-template-columns: 320px minmax(0, 1fr) 360px;
        gap: 14px;
        padding: 0 18px 18px;
      }

      .side-panel {
        overflow: auto;
        padding: 16px;
        border: 1px solid rgba(21, 23, 19, 0.09);
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.68);
        box-shadow: 0 24px 70px rgba(26, 24, 18, 0.12);
        backdrop-filter: blur(22px);
      }

      .studio-app.dark .side-panel {
        box-shadow: 0 30px 90px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.06);
      }

      .tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 4px;
        margin-bottom: 18px;
        border-radius: 999px;
        background: rgba(21, 23, 19, 0.06);
      }

      .tabs button {
        height: 36px;
        border-radius: 999px;
        background: transparent;
        color: rgba(21, 23, 19, 0.52);
        font-size: 13px;
        font-weight: 800;
      }

      .tabs .active {
        color: #151713;
        background: #fff;
        box-shadow: 0 10px 24px rgba(21, 23, 19, 0.1);
      }

      .compact-tabs {
        margin-bottom: 12px;
      }

      .tool-section {
        border: 1px solid rgba(21,23,19,.08);
        border-radius: 20px;
        background: rgba(255,255,255,.78);
        margin-bottom: 0;
        overflow: hidden;
        padding: 0;
        box-shadow: 0 12px 32px rgba(26, 24, 18, 0.08);
      }

      .tool-section-header {
        width: 100%;
        min-height: 62px;
        padding: 0 15px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 34px;
        align-items: center;
        gap: 12px;
        color: #151713;
        background: transparent;
        text-align: left;
      }

      .tool-section-copy {
        min-width: 0;
        display: grid;
        gap: 3px;
      }

      .tool-section-copy strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #151713;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .07em;
        text-transform: uppercase;
      }

      .tool-section-copy small {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: rgba(21,23,19,.48);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: none;
      }

      .tool-section-header b {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: #fff;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
        font-size: 20px;
        font-weight: 950;
        line-height: 1;
        box-shadow: 0 12px 28px rgba(241,43,143,.24);
      }

      .tool-section-body {
        padding: 0 15px 15px;
        border-top: 1px solid rgba(21,23,19,.08);
      }

      .studio-app.dark .tool-section {
        border-color: rgba(255,255,255,.09);
        background: rgba(20, 22, 20, 0.78);
      }

      .studio-app.dark .tool-section-header {
        color: #f7f4ec;
      }

      .studio-app.dark .tool-section-copy strong {
        color: #f7f4ec;
      }

      .studio-app.dark .tool-section-copy small {
        color: rgba(247,244,236,.54);
      }

      .studio-app.dark .tool-section-header b {
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
      }

      .studio-app.dark .tool-section-body {
        border-color: rgba(255,255,255,.1);
      }

      .panel-title {
        margin: 22px 0 10px;
        color: rgba(21, 23, 19, 0.48);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .panel-title.flush {
        margin-top: 0;
      }

      .template-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .template-section + .template-section {
        margin-top: 4px;
      }

      .template-subsection {
        margin-bottom: 14px;
      }

      .template-subsection h3 {
        margin: 0 0 8px;
        color: rgba(21,23,19,.54);
        font-size: 12px;
        font-weight: 900;
      }

      .studio-app.dark .template-subsection h3 {
        color: rgba(247,244,236,.54);
      }

      .template-card,
      .control-card {
        border: 1px solid rgba(21, 23, 19, 0.08);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.78);
        box-shadow: 0 12px 32px rgba(26, 24, 18, 0.08);
      }

      .template-card {
        min-height: 150px;
        padding: 11px;
        text-align: left;
      }

      .format-template-card {
        min-height: 146px;
      }

      .template-preview {
        height: 88px;
        margin-bottom: 10px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background:
          radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.9), transparent 32%),
          linear-gradient(135deg, #ebe6da, #d8d0c1);
      }

      .format-preview {
        height: 78px;
        margin-bottom: 10px;
        display: grid;
        place-items: center;
        border-radius: 16px;
        background:
          radial-gradient(circle at 30% 20%, rgba(255,255,255,.82), transparent 34%),
          linear-gradient(135deg, #e9e4d9, #d4ccbf);
      }

      .format-preview i {
        position: relative;
        width: min(82%, 86px);
        max-height: 62px;
        display: block;
        border-radius: 10px;
        background: rgba(21,23,19,.78);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.12), 0 10px 24px rgba(21,23,19,.16);
      }

      .format-preview.safe-circle i::after,
      .format-preview.safe-youtube-banner i::after,
      .format-preview.safe-vertical-ui i::before,
      .format-preview.safe-vertical-ui i::after {
        content: "";
        position: absolute;
        pointer-events: none;
      }

      .format-preview.safe-circle i::after {
        inset: 12%;
        border-radius: 999px;
        border: 2px dashed rgba(255,255,255,.78);
      }

      .format-preview.safe-youtube-banner i::after {
        left: 20%;
        right: 20%;
        top: 35%;
        bottom: 35%;
        border: 2px dashed rgba(255,255,255,.78);
      }

      .format-preview.safe-vertical-ui i::before {
        left: 0;
        right: 0;
        top: 0;
        height: 13%;
        background: rgba(255,255,255,.2);
      }

      .format-preview.safe-vertical-ui i::after {
        left: 0;
        right: 0;
        bottom: 0;
        height: 13%;
        background: rgba(255,255,255,.2);
      }

      .format-template-card em {
        display: block;
        margin-top: 7px;
        color: rgba(21,23,19,.48);
        font-size: 11px;
        font-style: normal;
        font-weight: 850;
      }

      .studio-app.dark .format-template-card em {
        color: rgba(247,244,236,.5);
      }

      .mini-device {
        display: block;
        padding: 4px;
        border-radius: 9px;
        background: #151713;
        box-shadow: 0 10px 28px rgba(21, 23, 19, 0.22);
      }

      .mini-device.phone {
        width: 34px;
        height: 68px;
      }

      .mini-device.laptop {
        width: 86px;
        height: 54px;
      }

      .mini-device.freeform {
        width: 76px;
        height: 48px;
        background: rgba(255,255,255,.72);
        border: 2px dashed rgba(21,23,19,.38);
      }

      .mini-device.browser {
        width: 86px;
        height: 52px;
      }

      .mini-device.tablet {
        width: 58px;
        height: 72px;
      }

      .mini-device span {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 6px;
        background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.35));
      }

      .device-list {
        display: grid;
        gap: 8px;
      }

      .device-row {
        width: 100%;
        min-height: 58px;
        gap: 11px;
        padding: 10px 12px;
        border-radius: 18px;
        text-align: left;
        color: #151713;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(21, 23, 19, 0.08);
      }

      .device-row.active {
        color: #fff;
        background: #151713;
      }

      .device-row.active small {
        color: rgba(255, 255, 255, 0.56);
      }

      .device-icon {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: rgba(21, 23, 19, 0.07);
      }

      .device-row.active .device-icon {
        background: rgba(255, 255, 255, 0.12);
      }

      .device-copy {
        flex: 1;
      }

      .swatches {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 8px;
      }

      .background-source-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .background-source-grid button,
      .background-url-row button {
        min-height: 38px;
        border-radius: 13px;
        color: #151713;
        background: rgba(255,255,255,.74);
        border: 1px solid rgba(21,23,19,.09);
        font-size: 12px;
        font-weight: 850;
      }

      .background-source-grid .active {
        color: #fff;
        background: #151713;
      }

      .background-url-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 64px;
        gap: 8px;
        margin-bottom: 12px;
      }

      .background-url-row input {
        min-width: 0;
        height: 38px;
        padding: 0 12px;
        border-radius: 13px;
        color: #151713;
        background: rgba(255,255,255,.74);
        border: 1px solid rgba(21,23,19,.09);
        font-size: 12px;
        font-weight: 700;
      }

      .swatch {
        aspect-ratio: 1;
        border-radius: 15px;
        border: 3px solid rgba(255, 255, 255, 0.95);
        box-shadow: inset 0 0 0 1px rgba(21, 23, 19, 0.08), 0 10px 22px rgba(21, 23, 19, 0.08);
      }

      .swatch.active {
        border-color: #151713;
      }

      .studio-app.dark .background-source-grid button,
      .studio-app.dark .background-url-row button,
      .studio-app.dark .background-url-row input {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1);
      }

      .studio-app.dark .background-source-grid .active {
        color: #151713;
        background: #f7f4ec;
      }

      .style-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .style-grid button {
        min-height: 76px;
        display: grid;
        gap: 7px;
        justify-items: start;
        padding: 8px;
        border-radius: 15px;
        color: #151713;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(21, 23, 19, 0.08);
        font-size: 12px;
        font-weight: 800;
      }

      .style-grid .active,
      .effect-grid .active {
        color: #fff;
        background: #151713;
      }

      .studio-app.dark .style-grid button,
      .studio-app.dark .effect-grid button,
      .studio-app.dark .local-mockup-grid button {
        border-color: rgba(255,255,255,.1);
        background: rgba(255,255,255,.08);
        color: #f7f4ec;
      }

      .studio-app.dark .style-grid .active,
      .studio-app.dark .effect-grid .active {
        background: #f7f4ec;
        color: #151713;
      }

      .style-thumb {
        width: 100%;
        height: 38px;
        display: block;
        border: 1px solid rgba(21,23,19,.12);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.4);
      }

      .color-row {
        display: grid;
        grid-template-columns: repeat(9, 1fr);
        gap: 8px;
      }

      .color-control {
        margin-bottom: 12px;
      }

      .color-control > span {
        display: block;
        margin-bottom: 7px;
        color: rgba(21,23,19,.56);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .06em;
        text-transform: uppercase;
      }

      .studio-app.dark .color-control > span {
        color: rgba(247,244,236,.5);
      }

      .color-dot {
        aspect-ratio: 1;
        border-radius: 999px;
        border: 3px solid rgba(255,255,255,.95) !important;
        box-shadow: inset 0 0 0 1px rgba(21,23,19,.12), 0 8px 18px rgba(21,23,19,.1);
      }

      .color-dot.active {
        outline: 2px solid #151713;
        outline-offset: 2px;
      }

      .color-picker {
        position: relative;
        display: block;
        aspect-ratio: 1;
        border-radius: 999px;
        border: 3px solid rgba(255,255,255,.95);
        box-shadow: inset 0 0 0 1px rgba(21,23,19,.12), 0 8px 18px rgba(21,23,19,.1);
        overflow: hidden;
        cursor: pointer;
      }

      .color-picker input {
        position: absolute;
        inset: -8px;
        width: calc(100% + 16px);
        height: calc(100% + 16px);
        opacity: 0;
        cursor: pointer;
      }

      .color-target-row,
      .border-mode-row {
        display: grid;
        gap: 8px;
        margin-bottom: 12px;
      }

      .color-target-row {
        grid-template-columns: repeat(4, 1fr);
      }

      .border-mode-row {
        grid-template-columns: repeat(3, 1fr);
      }

      .color-target-row button,
      .border-mode-row button {
        height: 38px;
        border-radius: 13px;
        color: #151713;
        background: rgba(255,255,255,.74);
        border: 1px solid rgba(21,23,19,.09);
        font-size: 12px;
        font-weight: 850;
        text-transform: capitalize;
      }

      .color-target-row .active,
      .border-mode-row .active {
        color: #fff;
        background: #151713;
      }

      .studio-app.dark .color-target-row button,
      .studio-app.dark .border-mode-row button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1);
      }

      .studio-app.dark .color-target-row .active,
      .studio-app.dark .border-mode-row .active {
        color: #151713;
        background: #f7f4ec;
      }

      .local-mockup-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .local-mockup-grid button {
        min-height: 86px;
        padding: 8px;
        display: grid;
        gap: 7px;
        border-radius: 16px;
        color: #151713;
        background: rgba(255,255,255,.72);
        border: 1px solid rgba(21,23,19,.08);
        font-size: 12px;
        font-weight: 800;
        text-align: left;
      }

      .local-mockup-grid .active {
        color: #fff;
        background: #151713;
      }

      .mockup-thumb {
        height: 42px;
        display: grid;
        place-items: center;
        overflow: hidden;
        border-radius: 12px;
        background: rgba(21,23,19,.06);
      }

      .mockup-thumb img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .effect-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .effect-grid button {
        min-height: 50px;
        display: grid;
        place-items: center;
        gap: 5px;
        padding: 8px;
        border-radius: 15px;
        color: #151713;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(21, 23, 19, 0.08);
        font-size: 12px;
        font-weight: 800;
      }

      .soon-card {
        margin-top: 18px;
        padding: 14px;
        display: grid;
        gap: 5px;
        border-radius: 20px;
        border: 1px dashed rgba(21, 23, 19, 0.18);
        background: rgba(255, 255, 255, 0.5);
      }

      .canvas-shell {
        position: relative;
        overflow: hidden;
        min-width: 0;
        border-radius: 32px;
        border: 1px solid rgba(21, 23, 19, 0.1);
        background:
          linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,255,255,0.08)),
          #e8e1d5;
        box-shadow: 0 26px 80px rgba(30, 28, 22, 0.16);
      }

      .canvas-shell.preview-fullscreen {
        position: fixed;
        inset: 12px;
        z-index: 50;
        border-radius: 28px;
        box-shadow: 0 30px 120px rgba(0,0,0,.34);
      }

      .canvas-toolbar {
        position: absolute;
        z-index: 3;
        top: 18px;
        left: 18px;
        right: 18px;
        justify-content: space-between;
        pointer-events: none;
      }

      .canvas-toolbar > .ghost-button {
        pointer-events: auto;
      }

      .segmented,
      .canvas-meta,
      .floating-toolbar {
        pointer-events: auto;
        border: 1px solid rgba(21, 23, 19, 0.08);
        background: rgba(255, 255, 255, 0.72);
        box-shadow: 0 14px 40px rgba(21, 23, 19, 0.1);
        backdrop-filter: blur(18px);
      }

      .segmented {
        display: flex;
        gap: 4px;
        padding: 4px;
        border-radius: 999px;
      }

      .segmented button {
        min-width: 78px;
        height: 34px;
        border-radius: 999px;
        background: transparent;
        color: rgba(21, 23, 19, 0.52);
        font-size: 13px;
        font-weight: 800;
      }

      .segmented .active {
        color: #fff;
        background: #151713;
      }

      .canvas-meta {
        gap: 9px;
        min-height: 42px;
        padding: 0 13px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 800;
      }

      .canvas-meta button {
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: inherit;
        background: rgba(21, 23, 19, 0.08);
        font-weight: 900;
      }

      .canvas-meta b {
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(21, 23, 19, 0.08);
      }

      .canvas-stage {
        position: relative;
        height: 100%;
        min-height: 620px;
        display: grid;
        place-items: center;
        padding: 86px 38px 82px;
      }

      .export-stage {
        position: relative;
        isolation: isolate;
        width: min(100%, 1020px);
        aspect-ratio: 16 / 10;
        display: grid;
        place-items: center;
        overflow: hidden;
        border-radius: 34px;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
        transform-origin: center;
        transition: transform 180ms ease, padding 180ms ease;
      }

      .export-stage.transparent-stage {
        background-color: transparent;
      }

      .transparent-checker {
        position: absolute;
        inset: 0;
        z-index: -4;
        background-image:
          linear-gradient(45deg, rgba(130,130,130,.16) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(130,130,130,.16) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(130,130,130,.16) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(130,130,130,.16) 75%);
        background-size: 26px 26px;
        background-position: 0 0, 0 13px, 13px -13px, -13px 0;
      }

      .stage-background {
        position: absolute;
        inset: 0;
        z-index: -3;
        opacity: var(--background-opacity);
        background: var(--stage-background);
        background-size: cover;
        background-position: center;
        filter: blur(var(--bg-blur));
        transform: scale(1.04);
      }

      .stage-light {
        position: absolute;
        inset: 0;
        z-index: -1;
        background:
          radial-gradient(circle at 26% 18%, rgba(255, 255, 255, 0.48), transparent 30%),
          radial-gradient(circle at 78% 82%, rgba(255, 255, 255, 0.25), transparent 34%);
      }

      .stage-noise {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        opacity: var(--noise-opacity);
        background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,.8) 0 1px, transparent 1px);
        background-size: 7px 7px;
        mix-blend-mode: overlay;
      }

      .extra-media-slot {
        position: absolute;
        z-index: 3;
        aspect-ratio: 16 / 10;
        padding: 0;
        border-radius: 18px;
        overflow: hidden;
        background: transparent;
        box-shadow: 0 24px 70px rgba(15, 17, 14, 0.2);
        transform-origin: center;
        touch-action: none;
        cursor: move;
      }

      .extra-media-slot.framed {
        padding: 6px;
        background: rgba(255, 255, 255, 0.82);
        border: 1px solid rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(12px);
      }

      .extra-media-slot img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 13px;
        pointer-events: none;
      }

      .extra-media-slot.selected {
        outline: 2px solid rgba(255, 255, 255, 0.9);
        outline-offset: 5px;
      }

      .device-frame {
        position: relative;
        display: grid;
        place-items: center;
        overflow: hidden;
        color: white;
        background: transparent;
        transform-style: preserve-3d;
        transition: box-shadow 180ms ease, border-color 160ms ease, background 160ms ease;
        backface-visibility: hidden;
        cursor: grab;
        outline: 1px solid transparent;
        touch-action: none;
        will-change: transform;
      }

      .device-frame:active {
        cursor: grabbing;
      }

      .device-frame.freeform {
        overflow: hidden;
        background: transparent;
      }

      .device-frame.browser {
        overflow: hidden;
        background: transparent;
      }

      .device-frame.tablet {
        background: transparent;
      }

      .tile-shell {
        position: absolute;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        border-radius: inherit;
        background: #10120f;
        pointer-events: none;
      }

      .device-frame.browser .tile-shell {
        background: #f8f8f4;
      }

      .effect-glass {
        background:
          linear-gradient(145deg, rgba(255,255,255,.24), rgba(255,255,255,.06) 42%, var(--glass-effect-color, rgba(184,244,255,.18))),
          color-mix(in srgb, var(--glass-effect-color, rgba(184,244,255,.24)) 22%, transparent);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.56),
          inset 0 -18px 38px rgba(255,255,255,.1),
          inset 0 0 0 1px rgba(255,255,255,.28),
          0 34px 90px var(--shadow-effect-color, rgba(17,19,18,.22));
      }

      .effect-border {
        box-shadow: inset 0 0 0 1px var(--border-effect-color, rgba(255,255,255,.45)), 0 22px 56px rgba(17,19,18,.2);
      }

      .effect-glow {
        background: #10120f;
        box-shadow: 0 0 54px var(--glow-effect-color, rgba(109,93,252,.42)), 0 34px 90px rgba(17,19,18,.22);
      }

      .effect-vignette::after {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        border-radius: inherit;
        box-shadow: inset 0 0 90px var(--vignette-effect-color, rgba(0,0,0,.34));
      }

      .effect-grain::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        opacity: .16;
        border-radius: inherit;
        background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,.8) 0 1px, transparent 1px);
        background-size: 9px 9px;
      }

      .device-frame:hover {
        filter: none;
      }

      .device-frame img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
        transform-origin: center;
        transition: transform 160ms ease, filter 160ms ease, opacity 160ms ease;
      }

      .media-image {
        z-index: 1;
        overflow: visible;
        transform-origin: center center;
        cursor: move;
      }

      .device-frame.has-frame-mockup {
        overflow: visible;
        background: transparent;
        outline: 0 !important;
        border-radius: 0;
      }

      .device-frame.has-frame-mockup .tile-shell,
      .device-frame.has-frame-mockup .tile-back {
        display: none;
      }

      .device-frame.has-frame-mockup .reflection,
      .device-frame.has-frame-mockup .inner-shadow {
        display: none;
      }

      .mockup-screen {
        position: absolute;
        z-index: 3;
        display: grid;
        place-items: center;
        overflow: hidden;
        background: #10120f;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), inset 0 18px 42px rgba(0,0,0,.18);
      }

      .mockup-screen-media {
        z-index: 2;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        border-radius: 0 !important;
      }

      .mockup-frame {
        position: absolute;
        inset: 0;
        z-index: 2;
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        border-radius: 0 !important;
        pointer-events: none;
        filter: drop-shadow(0 28px 44px rgba(15, 23, 42, 0.24));
      }

      .frame-empty-state {
        transform: scale(.72);
        pointer-events: none;
      }

      .tile-back {
        position: absolute;
        inset: 0;
        z-index: -1;
        border-radius: inherit;
        background: #10120f;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.04);
        transform: translateZ(-18px) rotateY(180deg);
        backface-visibility: hidden;
        pointer-events: none;
      }

      .mockup-underlay,
      .mockup-overlay {
        position: absolute;
        inset: -10%;
        width: 120% !important;
        height: 120% !important;
        object-fit: contain !important;
        pointer-events: none;
      }

      .mockup-underlay {
        z-index: 0;
      }

      .mockup-overlay {
        z-index: 6;
      }

      .annotation-layer {
        position: absolute;
        inset: 0;
        z-index: 7;
        pointer-events: none;
      }

      .canvas-annotation-layer {
        z-index: 8;
      }

      .annotation-item {
        position: absolute;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        max-width: 82%;
        padding: 0.08em 0.22em;
        border-radius: 14px;
        font-weight: 950;
        line-height: 1;
        letter-spacing: 0;
        text-align: center;
        white-space: pre-wrap;
        text-shadow: none;
        pointer-events: auto;
        cursor: move;
        user-select: none;
      }

      .annotation-item.text {
        max-width: none;
        white-space: pre;
      }

      .annotation-item.badge {
        padding: 0.55em 0.8em;
        border-radius: 999px;
        letter-spacing: 0;
        text-transform: uppercase;
        box-shadow: 0 14px 38px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.28);
      }

      .annotation-item.arrow {
        font-family: Georgia, serif;
        line-height: 0.8;
      }

      .annotation-item.rect,
      .annotation-item.ellipse,
      .annotation-item.highlight,
      .annotation-item.blur {
        padding: 0;
        min-width: 20px;
        min-height: 12px;
        text-shadow: none;
      }

      .annotation-item.rect,
      .annotation-item.ellipse {
        border-style: solid;
        background: transparent !important;
      }

      .annotation-item.ellipse {
        border-radius: 999px;
      }

      .annotation-item.highlight {
        border-radius: 999px;
        mix-blend-mode: screen;
      }

      .annotation-item.blur {
        border-radius: 14px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.18);
      }

      .hidden-layer {
        display: none !important;
      }

      .annotation-item.selected {
        outline: 2px solid rgba(255,255,255,.86);
        outline-offset: 5px;
      }

      .phone-bezel,
      .laptop-bezel,
      .browser-outline,
      .freeform-outline {
        position: absolute;
        inset: 0;
        z-index: 2;
        pointer-events: none;
        border-style: solid;
        border-color: #10120f;
      }

      .freeform-outline {
        border: 0;
      }

      .browser-outline {
        border: 1px solid rgba(21,23,19,.16);
      }

      .browser-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 3;
        height: 38px;
        display: flex;
        gap: 7px;
        align-items: center;
        padding-left: 15px;
        background: rgba(255,255,255,.86);
        border-bottom: 1px solid rgba(21,23,19,.08);
      }

      .browser-bar i {
        width: 9px;
        height: 9px;
        border-radius: 999px;
        background: #d6d2c7;
      }

      .reflection {
        position: absolute;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        opacity: var(--reflection-opacity);
        border-radius: inherit;
        background: linear-gradient(115deg, rgba(255,255,255,.38), transparent 32%, transparent 58%, rgba(255,255,255,.18));
      }

      .inner-shadow {
        position: absolute;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        border-radius: inherit;
        opacity: var(--inner-shadow);
        box-shadow: inset 0 0 64px rgba(0,0,0,.45);
      }

      .phone-island {
        position: absolute;
        z-index: 3;
        top: 13px;
        width: 78px;
        height: 24px;
        border-radius: 999px;
        background: #10120f;
      }

      .laptop-base {
        position: absolute;
        z-index: -1;
        left: 50%;
        bottom: -28px;
        width: 116%;
        height: 30px;
        transform: translateX(-50%);
        border-radius: 0 0 28px 28px;
        background: linear-gradient(180deg, #dad7ce, #aaa59b);
        box-shadow: 0 18px 30px rgba(21, 23, 19, 0.18);
      }

      .empty-state {
        position: relative;
        z-index: 4;
        display: grid;
        justify-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.68);
        text-align: center;
      }

      .empty-state span,
      .hover-pick,
      .media-drop-empty {
        display: grid;
        place-items: center;
      }

      .empty-state span {
        width: 66px;
        height: 66px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
      }

      .empty-state strong {
        font-size: 24px;
      }

      .empty-state small {
        font-size: 13px;
      }

      .hover-pick {
        position: absolute;
        inset: 0;
        z-index: 5;
        color: #151713;
        opacity: 0;
        border-radius: inherit;
        background: rgba(0, 0, 0, 0.22);
        transition: opacity 160ms ease;
      }

      .hover-pick svg {
        width: 58px;
        height: 58px;
        padding: 15px;
        border-radius: 999px;
        background: #fff;
        box-shadow: 0 18px 46px rgba(0,0,0,0.2);
      }

      .device-frame:hover .hover-pick {
        opacity: 1;
      }

      .bottom-action-bar {
        position: absolute;
        z-index: 20;
        left: 50%;
        bottom: 18px;
        min-height: 62px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 7px;
        border-radius: 999px;
        border: 1px solid rgba(21,23,19,.08);
        background: rgba(255,255,255,.76);
        box-shadow: 0 14px 40px rgba(21,23,19,.1);
        backdrop-filter: blur(18px);
        transform: translateX(-50%);
      }

      .bottom-action-bar button,
      .fit-mode-row button {
        min-height: 34px;
        padding: 0 12px;
        border-radius: 999px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 12px;
        font-weight: 850;
      }

      .bottom-action-bar .active,
      .fit-mode-row .active {
        color: #fff;
        background: #151713;
      }

      .bottom-action-bar span {
        min-width: 36px;
        padding: 0 8px;
        color: rgba(21,23,19,.62);
        font-size: 12px;
        font-weight: 900;
        font-variant-numeric: tabular-nums;
      }

      .fit-mode-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }

      .dimension-toolbar {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .dimension-toolbar button {
        min-height: 38px;
        border-radius: 13px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 12px;
        font-weight: 850;
      }

      .dimension-toolbar .active {
        color: #fff;
        background: #151713;
      }

      .dimension-toolbar .icon {
        display: grid;
        place-items: center;
        padding: 0;
      }

      .dimension-toolbar span {
        min-width: 0;
        color: rgba(21,23,19,.54);
        font-size: 12px;
        font-weight: 850;
      }

      .studio-app.dark .bottom-action-bar {
        border-color: rgba(255,255,255,.1);
        background: rgba(35,37,33,.72);
      }

      .studio-app.dark .bottom-action-bar button,
      .studio-app.dark .fit-mode-row button,
      .studio-app.dark .dimension-toolbar button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .quick-action-row button,
      .studio-app.dark .toggle-button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .url-import-row input,
      .studio-app.dark .url-import-row button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1);
      }

      .studio-app.dark .preset-preview-card {
        color: #f7f4ec;
        background: rgba(255,255,255,.06);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .preset-preview-card:hover {
        background: rgba(241,43,143,.12);
        border-color: rgba(241,43,143,.38) !important;
      }

      .studio-app.dark .preset-preview-stage {
        background: #111312;
      }

      .studio-app.dark .toggle-button.active {
        color: #151713;
        background: #f7f4ec;
      }

      .studio-app.dark .bottom-action-bar .active,
      .studio-app.dark .fit-mode-row .active,
      .studio-app.dark .dimension-toolbar .active {
        color: #151713;
        background: #f7f4ec;
      }

      .studio-app.dark .bottom-action-bar span,
      .studio-app.dark .dimension-toolbar span {
        color: rgba(247,244,236,.62);
      }

      .right-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .quick-action-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .quick-action-row.two {
        grid-template-columns: 1fr 1fr;
      }

      .quick-action-row button {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-radius: 14px;
        color: #151713;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(21, 23, 19, 0.08) !important;
        font-size: 12px;
        font-weight: 900;
      }

      .quick-action-row button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .url-import-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 82px;
        gap: 8px;
        margin-top: 12px;
      }

      .url-import-row input,
      .url-import-row button {
        height: 38px;
        border-radius: 12px;
        border: 1px solid rgba(21,23,19,.08);
        background: rgba(255,255,255,.7);
        color: #151713;
        font-size: 12px;
        font-weight: 850;
      }

      .url-import-row input {
        min-width: 0;
        padding: 0 11px;
      }

      .export-card {
        min-height: 70px;
        position: relative;
        overflow: hidden;
        justify-content: space-between;
        padding: 16px;
        border-radius: 22px;
        text-align: left;
        color: white;
        background: #151713;
        box-shadow: 0 20px 52px rgba(21, 23, 19, 0.24);
      }

      .export-card > span,
      .export-card > svg {
        position: relative;
        z-index: 1;
      }

      .export-progress-fill {
        position: absolute;
        left: 0;
        bottom: 0;
        width: var(--export-progress, 0%);
        height: 5px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.88);
        box-shadow: 0 0 26px rgba(255, 255, 255, 0.42);
        opacity: 0;
        transition: width 220ms ease, opacity 160ms ease;
      }

      .export-card.exporting .export-progress-fill {
        opacity: 1;
      }

      .export-card:disabled {
        cursor: not-allowed;
        opacity: 0.52;
        transform: none !important;
        box-shadow: none;
      }

      .export-card small {
        color: rgba(255,255,255,0.56);
      }

      .export-options-card {
        border-color: rgba(241,43,143,.16);
      }

      .control-card {
        padding: 15px;
      }

      .media-drop {
        position: relative;
        width: 100%;
        height: 136px;
        margin: 10px 0;
        border-radius: 18px;
        border: 1px solid rgba(21, 23, 19, 0.08);
        background-color: #f0eee8;
        background-image:
          linear-gradient(45deg, rgba(21,23,19,0.035) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(21,23,19,0.035) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(21,23,19,0.035) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(21,23,19,0.035) 75%);
        background-size: 22px 22px;
        background-position: 0 0, 0 11px, 11px -11px, -11px 0;
        overflow: hidden;
      }

      .media-drop-empty {
        width: 58px;
        height: 58px;
        margin: auto;
        border-radius: 18px;
        background: white;
        box-shadow: 0 12px 30px rgba(21, 23, 19, 0.12);
      }

      .media-drop-main {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-drop-badge {
        position: absolute;
        left: 12px;
        bottom: 12px;
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 0 11px;
        border-radius: 999px;
        color: #151713;
        background: rgba(255,255,255,.9);
        box-shadow: 0 12px 30px rgba(21,23,19,.16);
        font-size: 12px;
        font-weight: 900;
      }

      .media-drop-strip {
        position: absolute;
        top: 12px;
        right: 12px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px;
        border-radius: 999px;
        background: rgba(21,23,19,.58);
        backdrop-filter: blur(12px);
      }

      .media-drop-strip img,
      .media-drop-strip b {
        width: 24px;
        height: 24px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.5);
      }

      .media-drop-strip img {
        object-fit: cover;
      }

      .media-drop-strip b {
        display: grid;
        place-items: center;
        color: white;
        font-size: 10px;
        font-weight: 950;
      }

      .media-library {
        display: grid;
        gap: 8px;
        margin-top: 12px;
      }

      .media-item {
        min-width: 0;
        display: grid;
        grid-template-columns: 54px minmax(0, 1fr) 30px 30px;
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-radius: 16px;
        border: 1px solid rgba(21,23,19,.08);
        background: rgba(255,255,255,.62);
      }

      .media-item.active {
        border-color: rgba(241,43,143,.5);
        box-shadow: 0 0 0 2px rgba(241,43,143,.12);
      }

      .media-preview {
        position: relative;
        width: 54px;
        height: 42px;
        overflow: hidden;
        border-radius: 11px;
        background: rgba(21,23,19,.08);
      }

      .media-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-preview span {
        position: absolute;
        inset: auto 5px 5px;
        height: 16px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: white;
        background: rgba(21,23,19,.72);
        font-size: 9px;
        font-weight: 900;
      }

      .media-item strong {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #151713;
        font-size: 12px;
        line-height: 1.2;
      }

      .media-item small {
        display: block;
        margin-top: 3px;
        color: rgba(21,23,19,.5);
        font-size: 11px;
      }

      .media-layer,
      .media-remove {
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: rgba(21,23,19,.6);
        background: rgba(21,23,19,.06);
        font-size: 13px;
        font-weight: 900;
      }

      .media-layer {
        color: #151713;
      }

      .studio-app.dark .media-item {
        border-color: rgba(255,255,255,.1);
        background: rgba(255,255,255,.06);
      }

      .studio-app.dark .media-item.active {
        border-color: rgba(241,43,143,.58);
        box-shadow: 0 0 0 2px rgba(241,43,143,.16);
      }

      .studio-app.dark .media-item strong {
        color: #f7f4ec;
      }

      .studio-app.dark .media-item small {
        color: rgba(247,244,236,.52);
      }

      .studio-app.dark .media-layer,
      .studio-app.dark .media-remove {
        color: rgba(247,244,236,.68);
        background: rgba(255,255,255,.08);
      }

      .layer-access-card {
        border-color: rgba(241,43,143,.18);
      }

      .selected-layer-summary {
        display: grid;
        grid-template-columns: 62px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        margin-top: 10px;
        padding: 10px;
        border-radius: 14px;
        background: rgba(21,23,19,.05);
      }

      .selected-layer-summary span {
        color: rgba(21,23,19,.5);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .selected-layer-summary strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #151713;
        font-size: 12px;
      }

      .selected-layer-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 10px;
      }

      .selected-layer-actions button {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-radius: 13px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 12px;
        font-weight: 900;
      }

      .selected-layer-actions .danger {
        grid-column: 1 / -1;
        color: white;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
        box-shadow: 0 14px 34px rgba(241, 43, 143, 0.2);
      }

      .studio-app.dark .selected-layer-summary {
        background: rgba(255,255,255,.06);
      }

      .studio-app.dark .selected-layer-summary span {
        color: rgba(247,244,236,.52);
      }

      .studio-app.dark .selected-layer-summary strong {
        color: #f7f4ec;
      }

      .studio-app.dark .selected-layer-actions button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .selected-layer-actions .danger {
        color: white;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
      }

      .layer-tools {
        display: grid;
        gap: 9px;
        margin-top: 10px;
      }

      .layer-tools small {
        color: rgba(21,23,19,.46);
        font-size: 10px;
        font-weight: 950;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .layer-action-row {
        display: grid;
        gap: 8px;
      }

      .layer-action-row.three {
        grid-template-columns: repeat(3, 1fr);
      }

      .layer-action-row.four {
        grid-template-columns: repeat(4, 1fr);
      }

      .layer-action-row button,
      .remove-layer-button {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        border-radius: 13px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 12px;
        font-weight: 850;
      }

      .layer-action-row button {
        flex-direction: column;
        min-height: 54px;
        gap: 5px;
      }

      .layer-list {
        display: grid;
        gap: 8px;
        margin-top: 12px;
      }

      .layer-row {
        min-width: 0;
        display: grid;
        grid-template-columns: 58px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        padding: 7px 10px;
        border-radius: 14px;
        color: #151713;
        background: rgba(21,23,19,.05);
        border: 1px solid rgba(21,23,19,.08) !important;
        text-align: left;
      }

      .layer-row span {
        color: rgba(21,23,19,.48);
        font-size: 10px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .layer-row strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
      }

      .layer-row small {
        color: rgba(21,23,19,.42);
        font-size: 10px;
        font-weight: 900;
        font-variant-numeric: tabular-nums;
      }

      .layer-row.active {
        color: #fff;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
      }

      .layer-row.active span {
        color: rgba(255,255,255,.68);
      }

      .layer-row.active small {
        color: rgba(255,255,255,.72);
      }

      .layer-editor {
        display: grid;
        gap: 10px;
        margin-top: 14px;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid rgba(21,23,19,.08);
        background: rgba(255,255,255,.46);
      }

      .layer-editor label {
        display: grid;
        gap: 6px;
        color: rgba(21,23,19,.5);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: .06em;
        text-transform: uppercase;
      }

      .layer-editor input,
      .layer-editor select {
        width: 100%;
        min-width: 0;
        height: 38px;
        padding: 0 10px;
        border-radius: 12px;
        border: 1px solid rgba(21,23,19,.1);
        background: rgba(255,255,255,.7);
        color: #151713;
        font-size: 12px;
        font-weight: 800;
        text-transform: none;
        letter-spacing: 0;
      }

      .layer-select-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .hidden-library-switch {
        display: none !important;
      }

      .text-property-panel {
        display: grid;
        gap: 12px;
        margin-top: 4px;
        padding: 12px;
        border: 1px solid rgba(21,23,19,.08);
        border-radius: 16px;
        background: rgba(255,255,255,.42);
      }

      .text-property-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .text-property-title span {
        color: #151713;
        font-size: 12px;
        font-weight: 850;
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .text-property-title small {
        color: rgba(21,23,19,.5);
        font-size: 11px;
        font-weight: 750;
      }

      .text-shadow-color-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: end;
        gap: 10px;
      }

      .text-shadow-color-row button {
        min-height: 38px;
        padding: 0 12px;
        border-radius: 12px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }

      .layer-editor input[type="color"] {
        padding: 4px;
      }

      .layer-color-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      .layer-quick-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .layer-quick-row button {
        min-height: 34px;
        border-radius: 12px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 11px;
        font-weight: 900;
      }

      .remove-layer-button {
        color: #fff;
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
        box-shadow: 0 14px 34px rgba(241, 43, 143, 0.22);
      }

      .slot-panel {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid rgba(21,23,19,.08);
      }

      .toggle-button {
        min-height: 38px;
        border-radius: 13px;
        color: #151713;
        background: rgba(21,23,19,.06);
        border: 1px solid rgba(21,23,19,.08) !important;
        font-size: 12px;
        font-weight: 900;
      }

      .toggle-button.active {
        color: #fff;
        background: #151713;
      }

      .studio-app.dark .layer-action-row button,
      .studio-app.dark .remove-layer-button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .layer-tools small {
        color: rgba(247,244,236,.46);
      }

      .studio-app.dark .remove-layer-button {
        background: linear-gradient(135deg, #ff6858, #f12b8f 58%, #6d5dfc);
      }

      .studio-app.dark .layer-row {
        color: #f7f4ec;
        background: rgba(255,255,255,.06);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .layer-row span,
      .studio-app.dark .layer-editor label {
        color: rgba(247,244,236,.52);
      }

      .studio-app.dark .layer-row small {
        color: rgba(247,244,236,.42);
      }

      .studio-app.dark .layer-editor {
        border-color: rgba(255,255,255,.1);
        background: rgba(255,255,255,.04);
      }

      .studio-app.dark .layer-editor input,
      .studio-app.dark .layer-editor select {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.12);
      }

      .studio-app.dark .text-property-panel {
        border-color: rgba(255,255,255,.1);
        background: rgba(255,255,255,.045);
      }

      .studio-app.dark .text-property-title span {
        color: #f7f4ec;
      }

      .studio-app.dark .text-property-title small {
        color: rgba(247,244,236,.48);
      }

      .studio-app.dark .layer-quick-row button,
      .studio-app.dark .text-shadow-color-row button {
        color: #f7f4ec;
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1) !important;
      }

      .file-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .format-row,
      .preset-row,
      .size-row {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }

      .format-row {
        grid-template-columns: repeat(3, 1fr);
      }

      .preset-row {
        grid-template-columns: repeat(5, 1fr);
      }

      .preset-row.two-column {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .preset-preview-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
        margin-top: 10px;
      }

      .preset-preview-card {
        min-width: 0;
        display: grid;
        gap: 8px;
        padding: 8px;
        border-radius: 16px;
        color: #151713;
        background: rgba(21,23,19,.055);
        border: 1px solid rgba(21,23,19,.09) !important;
        text-align: left;
        transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
      }

      .preset-preview-card:hover {
        transform: translateY(-1px);
        border-color: rgba(241,43,143,.32) !important;
        background: rgba(241,43,143,.08);
      }

      .preset-preview-card strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 11px;
        font-weight: 950;
      }

      .preset-preview-stage {
        position: relative;
        height: 62px;
        overflow: hidden;
        border-radius: 12px;
        background: #151713;
        isolation: isolate;
      }

      .preset-preview-background,
      .preset-preview-light {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .preset-preview-background {
        z-index: 0;
        opacity: var(--preset-preview-bg-opacity);
        background: var(--preset-preview-bg);
        background-size: cover;
        background-position: center;
      }

      .preset-preview-light {
        z-index: 1;
        background:
          radial-gradient(circle at 24% 18%, rgba(255,255,255,.45), transparent 32%),
          radial-gradient(circle at 76% 82%, rgba(255,255,255,.16), transparent 34%);
      }

      .preset-preview-main,
      .preset-preview-slot {
        position: absolute;
        left: 50%;
        top: 50%;
        aspect-ratio: 16 / 10;
        overflow: hidden;
        border-radius: 8px;
        background: #151713;
        box-shadow: 0 12px 26px rgba(21,23,19,.18);
      }

      .preset-preview-main {
        z-index: 3;
      }

      .preset-preview-slot {
        z-index: 2;
      }

      .preset-preview-main img,
      .preset-preview-slot img,
      .preset-preview-main i,
      .preset-preview-slot i {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .preset-preview-main i,
      .preset-preview-slot i {
        background:
          linear-gradient(135deg, rgba(255,255,255,.12), transparent),
          repeating-linear-gradient(135deg, #2a2d27 0 8px, #171916 8px 16px);
      }

      .muted.tight {
        margin: 10px 0 2px;
      }

      .format-row button,
      .preset-row button {
        min-height: 34px;
        border-radius: 12px;
        color: #151713;
        background: rgba(21,23,19,.06);
        font-size: 12px;
        font-weight: 850;
        border: 1px solid rgba(21,23,19,.08);
      }

      .format-row .active {
        color: #fff;
        background: #151713;
      }

      .size-row {
        grid-template-columns: 1fr 1fr;
      }

      .size-row label {
        min-width: 0;
        display: grid;
        grid-template-columns: 20px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        color: rgba(21,23,19,.5);
        font-size: 11px;
        font-weight: 900;
      }

      .size-row input {
        width: 100%;
        min-width: 0;
        height: 36px;
        padding: 0 10px;
        border-radius: 12px;
        border: 1px solid rgba(21,23,19,.1);
        background: rgba(255,255,255,.7);
        color: inherit;
        font-weight: 800;
      }

      .slider {
        display: grid;
        grid-template-columns: 92px minmax(0, 1fr) 28px 38px;
        align-items: center;
        gap: 10px;
        margin-top: 13px;
      }

      .slider span {
        display: contents;
      }

      .slider small {
        color: rgba(21, 23, 19, 0.5);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      .slider b {
        order: 4;
        text-align: right;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }

      .slider input {
        order: 2;
        width: 100%;
        height: 18px;
        appearance: none;
        background: transparent;
        margin: 0;
      }

      .slider-reset {
        order: 3;
        width: 26px;
        height: 26px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        color: rgba(21,23,19,.62);
        background: rgba(21,23,19,.07);
        border: 1px solid rgba(21,23,19,.08) !important;
        transition: background 160ms ease, color 160ms ease, transform 160ms ease;
      }

      .slider-reset:hover {
        color: #151713;
        background: rgba(21,23,19,.12);
        transform: rotate(-18deg);
      }

      .slider input::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 999px;
        background: linear-gradient(90deg, rgba(21,23,19,.92), rgba(21,23,19,.28));
        border: 1px solid rgba(21,23,19,.12);
      }

      .slider input::-webkit-slider-thumb {
        appearance: none;
        width: 18px;
        height: 18px;
        margin-top: -7px;
        border-radius: 999px;
        background: #f7f4ec;
        border: 2px solid #151713;
        box-shadow: 0 4px 14px rgba(0,0,0,.18);
      }

      .slider input::-moz-range-track {
        height: 6px;
        border-radius: 999px;
        background: rgba(21,23,19,.26);
        border: 1px solid rgba(21,23,19,.12);
      }

      .slider input::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: #f7f4ec;
        border: 2px solid #151713;
        box-shadow: 0 4px 14px rgba(0,0,0,.18);
      }

      .studio-app.dark .slider input::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, rgba(247,244,236,.95), rgba(247,244,236,.22));
        border-color: rgba(255,255,255,.12);
      }

      .studio-app.dark .slider-reset {
        color: rgba(247,244,236,.68);
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.1) !important;
      }

      .studio-app.dark .slider-reset:hover {
        color: #fff;
        background: rgba(255,255,255,.16);
      }

      .studio-app.dark .slider input::-webkit-slider-thumb {
        background: #f7f4ec;
        border-color: #111312;
      }

      .studio-app.dark .slider input::-moz-range-track {
        background: rgba(247,244,236,.28);
        border-color: rgba(255,255,255,.12);
      }

      .studio-app.dark .slider input::-moz-range-thumb {
        background: #f7f4ec;
        border-color: #111312;
      }

      .studio-app {
        --ef-font: var(--font-sans, "EasyFrame Sans", Manrope, "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif);
        --ef-ink: #171915;
        --ef-muted: rgba(23, 25, 21, 0.56);
        --ef-subtle: rgba(23, 25, 21, 0.38);
        --ef-border: rgba(23, 25, 21, 0.1);
        --ef-border-strong: rgba(23, 25, 21, 0.16);
        --ef-surface: rgba(255, 255, 255, 0.76);
        --ef-surface-raised: rgba(255, 255, 255, 0.88);
        --ef-control: rgba(23, 25, 21, 0.055);
        --ef-control-hover: rgba(23, 25, 21, 0.09);
        --ef-brand: linear-gradient(135deg, #4f46e5 0%, #2563eb 45%, #06b6d4 100%);
        --ef-shadow-soft: 0 16px 42px rgba(27, 28, 24, 0.1);
        --ef-shadow-panel: 0 18px 56px rgba(27, 28, 24, 0.13);
        font-family: var(--ef-font);
        font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        letter-spacing: 0;
        background:
          radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.86), transparent 28%),
          radial-gradient(circle at 90% 6%, rgba(109, 93, 252, 0.12), transparent 26%),
          linear-gradient(135deg, #f6f2ea 0%, #ede7dd 48%, #dfd8cc 100%);
      }

      .studio-app.dark {
        --ef-ink: #f7f4ec;
        --ef-muted: rgba(247, 244, 236, 0.6);
        --ef-subtle: rgba(247, 244, 236, 0.42);
        --ef-border: rgba(255, 255, 255, 0.1);
        --ef-border-strong: rgba(255, 255, 255, 0.16);
        --ef-surface: rgba(19, 21, 20, 0.82);
        --ef-surface-raised: rgba(27, 29, 27, 0.9);
        --ef-control: rgba(255, 255, 255, 0.065);
        --ef-control-hover: rgba(255, 255, 255, 0.105);
        --ef-shadow-soft: 0 18px 48px rgba(0, 0, 0, 0.28);
        --ef-shadow-panel: 0 24px 70px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.045);
        background:
          radial-gradient(circle at 15% 0%, rgba(255, 104, 88, 0.13), transparent 27%),
          radial-gradient(circle at 86% 3%, rgba(109, 93, 252, 0.17), transparent 28%),
          linear-gradient(135deg, #090a0a 0%, #101211 48%, #161713 100%);
      }

      .topbar {
        height: 76px;
        padding: 14px 22px;
      }

      .brand {
        gap: 13px;
      }

      .brand-mark {
        width: 40px;
        height: 40px;
        box-shadow: none;
      }

      .brand strong,
      .export-card strong,
      .template-card strong,
      .device-row strong,
      .file-name {
        color: var(--ef-ink);
        font-size: 13px;
        font-weight: 820;
        letter-spacing: 0;
      }

      .brand small,
      .export-card small,
      .template-card small,
      .device-row small,
      .muted,
      .soon-card small,
      .dimension-toolbar span {
        color: var(--ef-muted);
        font-size: 11px;
        font-weight: 650;
      }

      .studio-app.dark .brand strong,
      .studio-app.dark .export-card strong,
      .studio-app.dark .template-card strong,
      .studio-app.dark .device-row strong,
      .studio-app.dark .file-name {
        color: var(--ef-ink);
      }

      .workspace {
        height: calc(100vh - 76px);
        grid-template-columns: 316px minmax(0, 1fr) 364px;
        gap: 16px;
        padding: 0 22px 22px;
      }

      .side-panel,
      .control-card,
      .template-card,
      .tool-section {
        border: 1px solid var(--ef-border);
        background: var(--ef-surface);
        box-shadow: var(--ef-shadow-soft);
        backdrop-filter: blur(22px);
      }

      .side-panel {
        padding: 15px;
        border-radius: 24px;
        box-shadow: var(--ef-shadow-panel);
      }

      .right-panel {
        gap: 10px;
      }

      .control-card {
        padding: 14px;
        border-radius: 18px;
      }

      .export-options-card,
      .layer-access-card {
        border-color: rgba(241, 43, 143, 0.2);
        box-shadow: 0 14px 42px rgba(241, 43, 143, 0.08), var(--ef-shadow-soft);
      }

      .panel-title {
        margin: 18px 0 9px;
        color: var(--ef-subtle);
        font-size: 10px;
        font-weight: 860;
        letter-spacing: 0.08em;
      }

      .panel-title.flush {
        margin-top: 0;
      }

      .tabs,
      .segmented,
      .canvas-meta,
      .floating-toolbar,
      .bottom-action-bar {
        border: 1px solid var(--ef-border);
        background: rgba(255, 255, 255, 0.72);
        box-shadow: 0 12px 34px rgba(21, 23, 19, 0.1);
      }

      .studio-app.dark .tabs,
      .studio-app.dark .segmented,
      .studio-app.dark .canvas-meta,
      .studio-app.dark .floating-toolbar,
      .studio-app.dark .bottom-action-bar {
        border-color: var(--ef-border);
        background: rgba(24, 26, 24, 0.78);
      }

      .primary-button,
      .ghost-button,
      .icon-button,
      .export-card,
      .quick-action-row button,
      .format-row button,
      .preset-row button,
      .fit-mode-row button,
      .dimension-toolbar button,
      .selected-layer-actions button,
      .layer-action-row button,
      .layer-quick-row button,
      .toggle-button,
      .url-import-row button {
        font-weight: 800;
        letter-spacing: 0;
        transition: transform 140ms ease, border-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
      }

      .ghost-button,
      .icon-button,
      .quick-action-row button,
      .format-row button,
      .preset-row button,
      .fit-mode-row button,
      .dimension-toolbar button,
      .selected-layer-actions button,
      .layer-action-row button,
      .layer-quick-row button,
      .toggle-button {
        color: var(--ef-ink);
        background: var(--ef-control);
        border: 1px solid var(--ef-border) !important;
      }

      .ghost-button:hover,
      .icon-button:hover,
      .quick-action-row button:hover,
      .format-row button:hover,
      .preset-row button:hover,
      .fit-mode-row button:hover,
      .dimension-toolbar button:hover,
      .selected-layer-actions button:hover,
      .layer-action-row button:hover,
      .layer-quick-row button:hover,
      .toggle-button:hover {
        background: var(--ef-control-hover);
        border-color: var(--ef-border-strong) !important;
      }

      .primary-button,
      .export-card,
      .remove-layer-button,
      .selected-layer-actions .danger,
      .layer-row.active,
      .format-row .active,
      .fit-mode-row .active,
      .dimension-toolbar .active,
      .tabs .active,
      .segmented .active,
      .toggle-button.active,
      .studio-app.dark .format-row .active,
      .studio-app.dark .device-row.active,
      .studio-app.dark .local-mockup-grid .active {
        color: #fff;
        background: var(--ef-brand);
      }

      .export-card {
        min-height: 68px;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        box-shadow: 0 20px 48px rgba(241, 43, 143, 0.2);
      }

      .export-card strong,
      .export-card small {
        color: #fff;
      }

      .canvas-shell {
        border-color: var(--ef-border);
        border-radius: 28px;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.66), rgba(255, 255, 255, 0.12)),
          #e9e3d8;
        box-shadow: 0 24px 68px rgba(21, 23, 19, 0.14);
      }

      .studio-app.dark .canvas-shell {
        border-color: var(--ef-border);
        background:
          linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.02)),
          #111312;
      }

      .canvas-stage {
        min-height: 620px;
        padding: 88px 42px 84px;
      }

      .export-stage {
        border-radius: 28px;
      }

      .media-drop,
      .layer-editor,
      .selected-layer-summary,
      .slot-panel,
      .preset-preview-card,
      .media-item,
      .layer-row,
      .device-row,
      .template-card {
        border-color: var(--ef-border) !important;
        background: var(--ef-control);
      }

      .media-item,
      .layer-row,
      .selected-layer-summary {
        border-radius: 14px;
      }

      .media-item.active,
      .preset-preview-card:hover,
      .layer-row.active {
        border-color: rgba(241, 43, 143, 0.36) !important;
        box-shadow: 0 0 0 2px rgba(241, 43, 143, 0.12);
      }

      .media-item strong,
      .layer-row strong,
      .selected-layer-summary strong {
        color: var(--ef-ink);
        font-weight: 800;
      }

      .media-item small,
      .layer-row small,
      .selected-layer-summary span,
      .layer-tools small,
      .layer-editor label,
      .size-row label,
      .slider small {
        color: var(--ef-subtle);
        font-weight: 780;
        letter-spacing: 0.055em;
      }

      .url-import-row input,
      .background-url-row input,
      .size-row input,
      .layer-editor input,
      .layer-editor select,
      .disabled-card input {
        color: var(--ef-ink);
        background: var(--ef-control);
        border: 1px solid var(--ef-border);
        outline: none;
      }

      .url-import-row input:focus,
      .background-url-row input:focus,
      .size-row input:focus,
      .layer-editor input:focus,
      .layer-editor select:focus {
        border-color: rgba(241, 43, 143, 0.42);
        box-shadow: 0 0 0 3px rgba(241, 43, 143, 0.12);
      }

      .slider {
        grid-template-columns: 86px minmax(0, 1fr) 28px 38px;
        gap: 9px;
        margin-top: 12px;
      }

      .slider input::-webkit-slider-runnable-track {
        height: 5px;
        background: linear-gradient(90deg, rgba(241, 43, 143, 0.8), rgba(109, 93, 252, 0.42));
        border: 0;
      }

      .slider input::-webkit-slider-thumb {
        width: 17px;
        height: 17px;
        margin-top: -6px;
        border-color: rgba(23, 25, 21, 0.7);
      }

      .studio-app.dark .slider input::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, rgba(255, 104, 88, 0.88), rgba(109, 93, 252, 0.5));
      }

      .studio-app {
        --ef-page: #070707;
        --ef-panel: rgba(10, 10, 10, 0.78);
        --ef-panel-raised: rgba(15, 15, 15, 0.92);
        --ef-panel-soft: rgba(255, 255, 255, 0.045);
        --ef-line: rgba(255, 255, 255, 0.105);
        --ef-line-strong: rgba(255, 255, 255, 0.18);
        --ef-copy: #f7f4ee;
        --ef-copy-muted: rgba(247, 244, 238, 0.58);
        --ef-copy-dim: rgba(247, 244, 238, 0.36);
        --ef-hot: #ff4738;
        --ef-coral: #ff6a52;
        --ef-warm: #ffe1b9;
        --ef-cool: #7ed8ff;
        --ef-red-glow: rgba(255, 71, 56, 0.34);
        --ef-shadow-deep: 0 36px 120px rgba(0, 0, 0, 0.52);
        --ef-shadow-card: 0 18px 54px rgba(0, 0, 0, 0.34);
        background:
          radial-gradient(circle at 82% -12%, rgba(255, 71, 56, 0.82), transparent 31%),
          radial-gradient(circle at 52% 92%, rgba(255, 128, 78, 0.18), transparent 28%),
          radial-gradient(circle at 0% 68%, rgba(255, 255, 255, 0.08), transparent 30%),
          linear-gradient(115deg, #050505 0%, #090909 47%, #170c0b 100%);
        color: var(--ef-copy);
      }

      .studio-app.dark {
        background:
          radial-gradient(circle at 84% -12%, rgba(255, 71, 56, 0.86), transparent 31%),
          radial-gradient(circle at 48% 96%, rgba(255, 137, 76, 0.22), transparent 28%),
          radial-gradient(circle at 0% 74%, rgba(255, 255, 255, 0.09), transparent 31%),
          linear-gradient(115deg, #050505 0%, #090909 48%, #170b09 100%);
      }

      .topbar {
        height: 84px;
        padding: 18px 30px 12px;
      }

      .brand {
        padding: 9px 14px 9px 10px;
        border: 1px solid var(--ef-line);
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.42);
        box-shadow: 0 16px 52px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(18px);
      }

      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        overflow: visible;
      }

      .brand strong {
        color: var(--ef-copy);
        font-size: 14px;
        font-weight: 780;
      }

      .brand small {
        color: var(--ef-copy-muted);
        font-size: 11px;
      }

      .top-actions {
        padding: 6px;
        border: 1px solid var(--ef-line);
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.36);
        box-shadow: 0 16px 52px rgba(0, 0, 0, 0.28);
        backdrop-filter: blur(18px);
      }

      .workspace {
        height: calc(100vh - 84px);
        grid-template-columns: 318px minmax(0, 1fr) 372px;
        gap: 18px;
        padding: 0 30px 26px;
      }

      .side-panel,
      .canvas-shell {
        border: 1px solid var(--ef-line);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018)),
          var(--ef-panel);
        box-shadow: var(--ef-shadow-deep);
        backdrop-filter: blur(24px);
      }

      .side-panel {
        padding: 18px;
        border-radius: 28px;
      }

      .right-panel {
        gap: 14px;
      }

      .control-card,
      .template-card,
      .tool-section {
        border: 1px solid var(--ef-line);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.018)),
          var(--ef-panel-raised);
        box-shadow: var(--ef-shadow-card);
      }

      .control-card {
        padding: 18px;
        border-radius: 24px;
      }

      .tool-section {
        border-radius: 24px;
        overflow: hidden;
      }

      .tool-section-header {
        min-height: 68px;
        padding: 0 18px;
      }

      .tool-section-copy strong,
      .panel-title,
      .micro-label {
        color: var(--ef-copy-dim);
        font-size: 10px;
        font-weight: 860;
        letter-spacing: 0.09em;
        text-transform: uppercase;
      }

      .tool-section-copy small {
        color: var(--ef-copy-muted);
        font-size: 11px;
        font-weight: 620;
      }

      .tool-section-header b {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, var(--ef-coral), var(--ef-hot));
        box-shadow: 0 16px 38px var(--ef-red-glow);
      }

      .tool-section-body {
        padding: 0 18px 18px;
        border-color: var(--ef-line);
      }

      .panel-title {
        margin: 20px 0 11px;
      }

      .tabs,
      .segmented,
      .canvas-meta,
      .floating-toolbar,
      .bottom-action-bar,
      .top-actions,
      .profile-button {
        border-color: var(--ef-line) !important;
        background: rgba(8, 8, 8, 0.72);
        box-shadow: 0 16px 54px rgba(0, 0, 0, 0.36);
      }

      .tabs {
        padding: 5px;
        margin-bottom: 20px;
      }

      .tabs button,
      .segmented button {
        color: var(--ef-copy-muted);
        font-weight: 720;
      }

      .tabs .active,
      .segmented .active {
        color: #fff;
        background: linear-gradient(135deg, rgba(255, 106, 82, 0.96), rgba(255, 71, 56, 0.96));
        box-shadow: 0 10px 28px rgba(255, 71, 56, 0.24);
      }

      .primary-button,
      .export-card,
      .selected-layer-actions .danger,
      .remove-layer-button,
      .layer-row.active,
      .format-row .active,
      .fit-mode-row .active,
      .dimension-toolbar .active,
      .toggle-button.active {
        color: #fff;
        background: linear-gradient(135deg, var(--ef-coral), var(--ef-hot));
        box-shadow: 0 18px 44px rgba(255, 71, 56, 0.26);
      }

      .ghost-button,
      .icon-button,
      .quick-action-row button,
      .format-row button,
      .preset-row button,
      .fit-mode-row button,
      .dimension-toolbar button,
      .selected-layer-actions button,
      .layer-action-row button,
      .layer-quick-row button,
      .toggle-button,
      .background-source-grid button,
      .color-target-row button,
      .border-mode-row button,
      .effect-grid button,
      .style-grid button,
      .local-mockup-grid button,
      .url-import-row button,
      .background-url-row button {
        color: var(--ef-copy);
        background: rgba(255, 255, 255, 0.055);
        border: 1px solid var(--ef-line) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035);
      }

      .ghost-button:hover,
      .icon-button:hover,
      .quick-action-row button:hover,
      .format-row button:hover,
      .preset-row button:hover,
      .fit-mode-row button:hover,
      .dimension-toolbar button:hover,
      .selected-layer-actions button:hover,
      .layer-action-row button:hover,
      .layer-quick-row button:hover,
      .toggle-button:hover,
      .background-source-grid button:hover,
      .color-target-row button:hover,
      .border-mode-row button:hover,
      .effect-grid button:hover,
      .style-grid button:hover,
      .local-mockup-grid button:hover {
        border-color: var(--ef-line-strong) !important;
        background: rgba(255, 255, 255, 0.085);
      }

      .background-source-grid .active,
      .style-grid .active,
      .effect-grid .active,
      .color-target-row .active,
      .border-mode-row .active,
      .local-mockup-grid .active {
        color: #fff;
        background: linear-gradient(135deg, var(--ef-coral), var(--ef-hot));
        border-color: rgba(255, 106, 82, 0.7) !important;
      }

      .canvas-shell {
        border-radius: 34px;
        background:
          radial-gradient(circle at 54% 82%, rgba(255, 215, 172, 0.16), transparent 25%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.016)),
          rgba(7, 7, 7, 0.86);
      }

      .canvas-stage {
        min-height: 650px;
        padding: 96px 52px 96px;
      }

      .export-stage {
        border-radius: 32px;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.14),
          0 36px 96px rgba(0, 0, 0, 0.36);
      }

      .stage-light {
        background:
          radial-gradient(circle at 52% 96%, rgba(255, 228, 188, 0.42), transparent 23%),
          radial-gradient(circle at 76% 12%, rgba(255, 71, 56, 0.14), transparent 28%),
          radial-gradient(circle at 22% 20%, rgba(126, 216, 255, 0.12), transparent 30%);
      }

      .media-drop,
      .layer-editor,
      .selected-layer-summary,
      .preset-preview-card,
      .media-item,
      .layer-row,
      .device-row,
      .template-card,
      .slot-panel {
        border-color: var(--ef-line) !important;
        background: rgba(255, 255, 255, 0.045);
      }

      .template-card,
      .device-row,
      .media-item,
      .layer-row,
      .preset-preview-card {
        border-radius: 18px;
      }

      .template-card:hover,
      .device-row:hover,
      .preset-preview-card:hover,
      .media-item.active {
        border-color: rgba(255, 106, 82, 0.42) !important;
        background: rgba(255, 106, 82, 0.075);
        box-shadow: 0 0 0 1px rgba(255, 106, 82, 0.08), 0 18px 48px rgba(0, 0, 0, 0.24);
      }

      .brand strong,
      .export-card strong,
      .template-card strong,
      .device-row strong,
      .file-name,
      .media-item strong,
      .layer-row strong,
      .selected-layer-summary strong {
        color: var(--ef-copy);
      }

      .brand small,
      .export-card small,
      .template-card small,
      .device-row small,
      .muted,
      .soon-card small,
      .media-item small,
      .layer-row small,
      .selected-layer-summary span,
      .layer-tools small,
      .layer-editor label,
      .size-row label,
      .slider small {
        color: var(--ef-copy-muted);
      }

      .background-panel {
        display: grid;
        gap: 16px;
      }

      .background-group {
        display: grid;
        gap: 10px;
        padding: 13px;
        border: 1px solid rgba(255, 255, 255, 0.075);
        border-radius: 18px;
        background:
          radial-gradient(circle at 100% 0%, rgba(255, 106, 82, 0.08), transparent 34%),
          rgba(255, 255, 255, 0.032);
      }

      .micro-label {
        display: block;
      }

      .background-source-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 7px;
        margin: 0;
      }

      .background-source-grid button {
        min-height: 40px;
        padding: 0 6px;
        border-radius: 13px;
        font-size: 11px;
      }

      .background-url-row {
        grid-template-columns: minmax(0, 1fr) 68px;
        gap: 8px;
        margin: 0;
      }

      .background-url-row input,
      .url-import-row input,
      .background-url-row button,
      .url-import-row button,
      .size-row input,
      .layer-editor input,
      .layer-editor select,
      .disabled-card input {
        height: 40px;
        color: var(--ef-copy);
        background: rgba(255, 255, 255, 0.055);
        border: 1px solid var(--ef-line);
        border-radius: 13px;
      }

      .background-url-row input,
      .url-import-row input,
      .size-row input,
      .layer-editor input,
      .layer-editor select {
        color: var(--ef-copy);
      }

      .background-url-row input::placeholder,
      .url-import-row input::placeholder {
        color: rgba(247, 244, 238, 0.38);
      }

      .color-control {
        margin: 0;
      }

      .color-control > span {
        margin-bottom: 10px;
        color: var(--ef-copy-dim);
        font-size: 10px;
        font-weight: 860;
        letter-spacing: 0.09em;
      }

      .color-row,
      .swatches {
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 9px;
      }

      .color-dot,
      .color-picker,
      .swatch {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 999px;
        border: 2px solid rgba(255, 255, 255, 0.72) !important;
        box-shadow:
          inset 0 0 0 1px rgba(0, 0, 0, 0.28),
          0 10px 22px rgba(0, 0, 0, 0.28);
      }

      .swatch {
        border-radius: 14px;
      }

      .color-dot.active,
      .swatch.active {
        outline: 2px solid var(--ef-hot);
        outline-offset: 3px;
        box-shadow:
          inset 0 0 0 1px rgba(0, 0, 0, 0.3),
          0 0 0 5px rgba(255, 71, 56, 0.14),
          0 14px 30px rgba(255, 71, 56, 0.16);
      }

      .background-group .slider {
        margin-top: 0;
      }

      .slider {
        grid-template-columns: 82px minmax(0, 1fr) 28px 38px;
      }

      .slider small {
        color: var(--ef-copy-muted);
      }

      .slider b {
        color: var(--ef-copy);
      }

      .slider-reset {
        color: var(--ef-copy-muted);
        background: rgba(255, 255, 255, 0.055);
        border-color: var(--ef-line) !important;
      }

      .slider input::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, var(--ef-hot), rgba(255, 225, 185, 0.78), rgba(126, 216, 255, 0.56));
      }

      .slider input::-webkit-slider-thumb {
        background: #fff7ec;
        border-color: #121212;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
      }

      .export-card {
        min-height: 76px;
        border-radius: 24px;
        background:
          radial-gradient(circle at 86% 24%, rgba(255, 225, 185, 0.24), transparent 28%),
          linear-gradient(135deg, #ff6a52 0%, #ff4738 68%, #c7271d 100%);
      }

      .quick-action-row {
        gap: 9px;
      }

      .quick-action-row button {
        min-height: 42px;
        border-radius: 15px;
      }

      .preset-preview-stage {
        background:
          radial-gradient(circle at 68% 90%, rgba(255, 225, 185, 0.28), transparent 34%),
          #090909;
      }

      .media-layer,
      .media-remove {
        color: var(--ef-copy-muted);
        background: rgba(255, 255, 255, 0.07);
      }

      .soon-card {
        border: 1px solid var(--ef-line);
        background:
          radial-gradient(circle at 90% 0%, rgba(255, 106, 82, 0.1), transparent 40%),
          rgba(255, 255, 255, 0.035);
      }

      .studio-app,
      .studio-app button,
      .studio-app input,
      .studio-app select,
      .studio-app textarea {
        font-family: var(--font-sans);
      }

      .studio-app {
        font-size: 13px;
        line-height: 1.45;
        font-weight: 500;
      }

      .studio-app strong,
      .studio-app b {
        font-weight: 700;
      }

      .topbar {
        height: 88px;
        padding: 20px 32px 14px;
      }

      .workspace {
        height: calc(100vh - 88px);
        gap: 20px;
        padding: 0 32px 28px;
      }

      .side-panel {
        padding: 20px;
      }

      .right-panel {
        gap: 16px;
      }

      .control-card {
        padding: 20px;
      }

      .tool-section-header {
        min-height: 72px;
        padding: 0 20px;
      }

      .tool-section-body {
        padding: 0 20px 20px;
      }

      .panel-title,
      .tool-section-copy strong,
      .micro-label,
      .color-control > span {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.105em;
      }

      .brand strong,
      .export-card strong,
      .template-card strong,
      .device-row strong,
      .media-item strong,
      .layer-row strong,
      .selected-layer-summary strong,
      .file-name {
        font-size: 13px;
        font-weight: 700;
        line-height: 1.25;
      }

      .brand small,
      .export-card small,
      .template-card small,
      .device-row small,
      .media-item small,
      .layer-row small,
      .muted {
        font-size: 11px;
        font-weight: 500;
        line-height: 1.35;
      }

      .primary-button,
      .ghost-button,
      .icon-button,
      .profile-button,
      .export-card,
      .quick-action-row button,
      .format-row button,
      .preset-row button,
      .fit-mode-row button,
      .dimension-toolbar button,
      .selected-layer-actions button,
      .layer-action-row button,
      .layer-quick-row button,
      .toggle-button,
      .background-source-grid button,
      .color-target-row button,
      .border-mode-row button,
      .effect-grid button,
      .style-grid button,
      .local-mockup-grid button,
      .url-import-row button,
      .background-url-row button,
      .tabs button,
      .segmented button {
        min-height: 42px;
        padding-inline: 14px;
        border-radius: 14px;
        font-size: 12px;
        font-weight: 650;
        line-height: 1;
        white-space: nowrap;
      }

      .primary-button,
      .ghost-button {
        min-height: 44px;
        padding-inline: 18px;
      }

      .icon-button {
        width: 44px;
        height: 44px;
        min-height: 44px;
        padding: 0;
      }

      .profile-button {
        min-height: 44px;
        padding: 5px 14px 5px 6px;
      }

      .tabs,
      .segmented {
        gap: 6px;
        padding: 6px;
      }

      .tabs button,
      .segmented button {
        height: 38px;
        min-height: 38px;
      }

      .quick-action-row,
      .fit-mode-row,
      .background-source-grid,
      .color-target-row,
      .border-mode-row,
      .effect-grid,
      .style-grid,
      .local-mockup-grid,
      .selected-layer-actions,
      .layer-action-row,
      .layer-quick-row,
      .format-row,
      .preset-row,
      .size-row,
      .preset-preview-grid,
      .media-library,
      .layer-list,
      .device-list {
        gap: 10px;
      }

      .template-grid {
        gap: 12px;
      }

      .template-card {
        padding: 13px;
      }

      .device-row,
      .media-item,
      .layer-row {
        min-height: 56px;
        padding: 10px 12px;
      }

      .media-item {
        grid-template-columns: 56px minmax(0, 1fr) 32px 32px;
      }

      .media-layer,
      .media-remove {
        width: 32px;
        height: 32px;
      }

      .selected-layer-summary {
        padding: 12px;
      }

      .layer-editor {
        gap: 12px;
        padding: 14px;
      }

      .layer-editor input,
      .layer-editor select,
      .size-row input,
      .url-import-row input,
      .background-url-row input {
        height: 42px;
        font-size: 12px;
        font-weight: 500;
      }

      .slider {
        grid-template-columns: 90px minmax(0, 1fr) 30px 40px;
        gap: 10px;
        margin-top: 14px;
      }

      .slider small {
        font-size: 10px;
        font-weight: 650;
        letter-spacing: 0.075em;
      }

      .slider b {
        font-size: 12px;
        font-weight: 650;
      }

      .slider-reset {
        width: 28px;
        height: 28px;
      }

      .background-panel {
        gap: 18px;
      }

      .background-group {
        gap: 12px;
        padding: 15px;
        border-radius: 20px;
      }

      .color-row,
      .swatches {
        gap: 10px;
      }

      .canvas-toolbar {
        top: 20px;
        left: 20px;
        right: 20px;
      }

      .canvas-stage {
        padding: 104px 56px 104px;
      }

      .bottom-action-bar {
        min-height: 66px;
        gap: 8px;
        padding: 8px;
      }

      .bottom-action-bar button {
        min-height: 38px;
      }

      .studio-app {
        --ef-bg: #08090b;
        --ef-bg-elevated: #0d0e12;
        --ef-surface-premium: rgba(18, 19, 24, 0.82);
        --ef-surface-solid: rgba(23, 24, 30, 0.96);
        --ef-surface-hover: rgba(255, 255, 255, 0.07);
        --ef-border-premium: rgba(255, 255, 255, 0.09);
        --ef-border-focus: rgba(139, 140, 246, 0.48);
        --ef-text: #f5f7fb;
        --ef-text-soft: rgba(245, 247, 251, 0.72);
        --ef-text-muted: rgba(245, 247, 251, 0.52);
        --ef-text-faint: rgba(245, 247, 251, 0.34);
        --ef-accent: #8b8cf6;
        --ef-accent-2: #58d5c9;
        --ef-accent-warm: #ff765f;
        --ef-premium-gradient: linear-gradient(135deg, #9a9bff 0%, #7178ff 48%, #58d5c9 100%);
        --ef-control-height: 44px;
        --ef-radius-sm: 12px;
        --ef-radius-md: 16px;
        --ef-radius-lg: 22px;
        --ef-shadow-elevated: 0 24px 80px rgba(0, 0, 0, 0.36);
        --ef-shadow-soft-premium: 0 14px 44px rgba(0, 0, 0, 0.24);
        background:
          radial-gradient(circle at 78% -12%, rgba(139, 140, 246, 0.22), transparent 30%),
          radial-gradient(circle at 16% 6%, rgba(88, 213, 201, 0.08), transparent 26%),
          radial-gradient(circle at 50% 108%, rgba(255, 118, 95, 0.09), transparent 32%),
          linear-gradient(145deg, #07080a 0%, #0b0c10 50%, #090a0d 100%);
        color: var(--ef-text);
      }

      .studio-app.dark {
        background:
          radial-gradient(circle at 78% -12%, rgba(139, 140, 246, 0.22), transparent 30%),
          radial-gradient(circle at 16% 6%, rgba(88, 213, 201, 0.08), transparent 26%),
          radial-gradient(circle at 50% 108%, rgba(255, 118, 95, 0.09), transparent 32%),
          linear-gradient(145deg, #07080a 0%, #0b0c10 50%, #090a0d 100%);
      }

      .topbar {
        height: 86px;
        padding: 18px 28px 14px;
      }

      .workspace {
        height: calc(100vh - 86px);
        grid-template-columns: 324px minmax(0, 1fr) 380px;
        gap: 18px;
        padding: 0 28px 28px;
      }

      .brand,
      .top-actions,
      .side-panel,
      .canvas-shell,
      .control-card,
      .template-card,
      .tool-section,
      .tabs,
      .segmented,
      .canvas-meta,
      .floating-toolbar,
      .bottom-action-bar,
      .profile-button,
      .profile-dropdown {
        border-color: var(--ef-border-premium) !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.052), rgba(255, 255, 255, 0.018)),
          var(--ef-surface-premium) !important;
        box-shadow: var(--ef-shadow-soft-premium);
        backdrop-filter: blur(22px);
      }

      .side-panel,
      .canvas-shell {
        box-shadow: var(--ef-shadow-elevated);
      }

      .side-panel {
        padding: 18px;
        border-radius: 26px;
      }

      .right-panel {
        gap: 14px;
      }

      .control-card {
        padding: 18px;
        border-radius: var(--ef-radius-lg);
      }

      .brand {
        gap: 12px;
        padding: 8px 14px 8px 9px;
      }

      .brand-mark {
        width: 34px;
        height: 34px;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        overflow: visible;
      }

      .brand strong,
      .export-card strong,
      .template-card strong,
      .device-row strong,
      .media-item strong,
      .layer-row strong,
      .selected-layer-summary strong,
      .file-name {
        color: var(--ef-text);
        font-size: 13px;
        font-weight: 650;
        letter-spacing: -0.01em;
      }

      .brand small,
      .export-card small,
      .template-card small,
      .device-row small,
      .media-item small,
      .layer-row small,
      .muted,
      .soon-card small,
      .tool-section-copy small {
        color: var(--ef-text-muted);
        font-size: 11px;
        font-weight: 500;
      }

      .panel-title,
      .tool-section-copy strong,
      .micro-label,
      .color-control > span,
      .layer-tools small,
      .selected-layer-summary span,
      .layer-editor label,
      .size-row label,
      .slider small {
        color: var(--ef-text-faint);
        font-size: 10px;
        font-weight: 650;
        letter-spacing: 0.095em;
        text-transform: uppercase;
      }

      .primary-button,
      .ghost-button,
      .icon-button,
      .profile-button,
      .quick-action-row button,
      .format-row button,
      .preset-row button,
      .fit-mode-row button,
      .dimension-toolbar button,
      .selected-layer-actions button,
      .layer-action-row button,
      .layer-quick-row button,
      .toggle-button,
      .background-source-grid button,
      .color-target-row button,
      .border-mode-row button,
      .effect-grid button,
      .style-grid button,
      .local-mockup-grid button,
      .url-import-row button,
      .background-url-row button,
      .tabs button,
      .segmented button,
      .bottom-action-bar button {
        min-height: var(--ef-control-height);
        border-radius: var(--ef-radius-sm);
        color: var(--ef-text-soft);
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid var(--ef-border-premium) !important;
        box-shadow: none;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0;
      }

      .icon-button {
        width: var(--ef-control-height);
        padding: 0;
      }

      .primary-button,
      .export-card,
      .selected-layer-actions .danger,
      .remove-layer-button,
      .tabs .active,
      .segmented .active,
      .format-row .active,
      .fit-mode-row .active,
      .dimension-toolbar .active,
      .toggle-button.active,
      .background-source-grid .active,
      .style-grid .active,
      .effect-grid .active,
      .color-target-row .active,
      .border-mode-row .active,
      .local-mockup-grid .active,
      .layer-row.active {
        color: #ffffff;
        background: var(--ef-premium-gradient) !important;
        border-color: rgba(154, 155, 255, 0.52) !important;
        box-shadow: 0 14px 34px rgba(113, 120, 255, 0.2);
      }

      .ghost-button:hover,
      .icon-button:hover,
      .quick-action-row button:hover,
      .format-row button:hover,
      .preset-row button:hover,
      .fit-mode-row button:hover,
      .dimension-toolbar button:hover,
      .selected-layer-actions button:hover,
      .layer-action-row button:hover,
      .layer-quick-row button:hover,
      .toggle-button:hover,
      .background-source-grid button:hover,
      .color-target-row button:hover,
      .border-mode-row button:hover,
      .effect-grid button:hover,
      .style-grid button:hover,
      .local-mockup-grid button:hover,
      .bottom-action-bar button:hover {
        color: var(--ef-text);
        background: var(--ef-surface-hover);
        border-color: rgba(255, 255, 255, 0.16) !important;
        transform: translateY(-1px);
      }

      .tool-section {
        border-radius: var(--ef-radius-lg);
      }

      .tool-section-header {
        min-height: 70px;
        padding: 0 18px;
      }

      .tool-section-header b {
        width: 34px;
        height: 34px;
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid var(--ef-border-premium);
        box-shadow: none;
      }

      .tool-section-body {
        padding: 0 18px 18px;
      }

      .canvas-shell {
        border-radius: 30px;
        background:
          radial-gradient(circle at 50% 90%, rgba(139, 140, 246, 0.12), transparent 34%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
          rgba(8, 9, 11, 0.92) !important;
      }

      .canvas-stage {
        min-height: 640px;
        padding: 96px 48px 96px;
      }

      .export-stage {
        border-radius: 30px;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.1),
          0 28px 72px rgba(0, 0, 0, 0.28);
      }

      .stage-light {
        background:
          radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.22), transparent 30%),
          radial-gradient(circle at 74% 88%, rgba(139, 140, 246, 0.18), transparent 34%);
      }

      .media-drop,
      .background-group,
      .layer-editor,
      .selected-layer-summary,
      .preset-preview-card,
      .media-item,
      .layer-row,
      .device-row,
      .template-card,
      .slot-panel,
      .soon-card {
        border-color: var(--ef-border-premium) !important;
        background: rgba(255, 255, 255, 0.035) !important;
        box-shadow: none;
      }

      .template-card,
      .device-row,
      .media-item,
      .layer-row,
      .preset-preview-card,
      .background-group,
      .layer-editor,
      .selected-layer-summary {
        border-radius: var(--ef-radius-md);
      }

      .media-item.active,
      .template-card:hover,
      .device-row:hover,
      .preset-preview-card:hover {
        border-color: var(--ef-border-focus) !important;
        background: rgba(139, 140, 246, 0.08) !important;
        box-shadow: 0 0 0 1px rgba(139, 140, 246, 0.12);
      }

      .background-panel,
      .layer-editor,
      .media-library,
      .layer-list,
      .device-list,
      .preset-preview-grid {
        gap: 12px;
      }

      .background-group {
        padding: 14px;
        gap: 12px;
      }

      .color-row,
      .swatches {
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;
      }

      .color-dot,
      .color-picker,
      .swatch {
        border: 1px solid rgba(255, 255, 255, 0.32) !important;
        box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.22);
      }

      .color-dot.active,
      .swatch.active {
        outline: 2px solid var(--ef-accent);
        outline-offset: 3px;
        box-shadow: 0 0 0 5px rgba(139, 140, 246, 0.13);
      }

      .background-url-row input,
      .url-import-row input,
      .size-row input,
      .layer-editor input,
      .layer-editor select,
      .disabled-card input {
        height: var(--ef-control-height);
        border-radius: var(--ef-radius-sm);
        color: var(--ef-text);
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid var(--ef-border-premium);
        font-size: 12px;
        font-weight: 500;
      }

      .background-url-row input:focus,
      .url-import-row input:focus,
      .size-row input:focus,
      .layer-editor input:focus,
      .layer-editor select:focus {
        border-color: var(--ef-border-focus);
        box-shadow: 0 0 0 4px rgba(139, 140, 246, 0.12);
      }

      .slider {
        grid-template-columns: 92px minmax(0, 1fr) 30px 40px;
        gap: 10px;
      }

      .slider input::-webkit-slider-runnable-track {
        height: 5px;
        background: linear-gradient(90deg, var(--ef-accent), var(--ef-accent-2));
      }

      .slider input::-webkit-slider-thumb {
        width: 17px;
        height: 17px;
        margin-top: -6px;
        background: #f5f7fb;
        border: 2px solid #0b0c10;
      }

      .export-card {
        min-height: 76px;
        border-radius: var(--ef-radius-lg);
      }

      .bottom-action-bar {
        min-height: 64px;
        padding: 8px;
      }

      .studio-app {
        --ef-control-height: 42px;
        overflow-x: hidden;
      }

      .topbar {
        min-width: 0;
        gap: 18px;
      }

      .top-actions {
        max-width: min(100%, 560px);
        min-width: 0;
        display: flex;
        justify-content: flex-end;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .top-actions::-webkit-scrollbar,
      .bottom-action-bar::-webkit-scrollbar {
        display: none;
      }

      .top-actions > *,
      .top-actions button,
      .top-actions a {
        flex: 0 0 auto;
      }

      .workspace,
      .side-panel,
      .right-panel,
      .control-card,
      .tool-section,
      .canvas-shell {
        min-width: 0;
      }

      .side-panel,
      .right-panel {
        overflow-x: hidden;
      }

      .background-source-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .background-source-grid button {
        width: 100%;
        min-width: 0;
        justify-content: center;
        padding-inline: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .export-options-card {
        overflow: hidden;
      }

      .export-options-card .format-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .export-options-card .preset-row {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .export-options-card .format-row button,
      .export-options-card .preset-row button,
      .preset-row.two-column button,
      .fit-mode-row button,
      .dimension-toolbar button,
      .bottom-action-bar button {
        min-width: 0;
        white-space: normal;
        line-height: 1.18;
      }

      .quick-action-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .quick-action-row.two,
      .fit-mode-row,
      .preset-row.two-column {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .dimension-toolbar {
        grid-template-columns: 44px minmax(0, 1fr);
      }

      .dimension-toolbar span {
        line-height: 1.3;
      }

      .color-row,
      .swatches {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .color-dot,
      .color-picker,
      .swatch {
        aspect-ratio: 1.65 / 1;
        min-height: 34px;
        border-radius: 11px !important;
      }

      .swatch {
        border-radius: 12px !important;
      }

      .slider {
        width: 100%;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 30px 44px;
        grid-template-areas:
          "label reset value"
          "range range range";
        align-items: center;
        gap: 10px;
        margin-top: 14px;
      }

      .slider span {
        display: contents;
      }

      .slider small,
      .slider b,
      .slider input,
      .slider-reset {
        order: initial;
      }

      .slider small {
        grid-area: label;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .slider b {
        grid-area: value;
        min-width: 34px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      .slider input {
        grid-area: range;
        width: 100%;
        min-width: 0;
      }

      .slider-reset {
        grid-area: reset;
        width: 30px;
        height: 30px;
        min-height: 30px;
        padding: 0;
      }

      .slider input::-webkit-slider-runnable-track {
        height: 6px;
        border-radius: 999px;
      }

      .slider input::-moz-range-track {
        height: 6px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--ef-accent), var(--ef-accent-2));
      }

      .bottom-action-bar {
        width: max-content;
        max-width: calc(100% - 32px);
        overflow-x: auto;
        justify-content: flex-start;
        border-radius: 22px;
      }

      .bottom-action-bar button,
      .bottom-action-bar span {
        flex: 0 0 auto;
      }

      @media (max-width: 1500px) {
        .workspace {
          grid-template-columns: 340px minmax(0, 1fr) 420px;
          padding-inline: 20px;
        }

        .topbar {
          padding-inline: 20px;
        }
      }

      @media (max-width: 1320px) {
        .workspace {
          grid-template-columns: 320px minmax(0, 1fr) 380px;
        }

        .export-options-card .preset-row {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 1180px) {
        .topbar {
          height: auto;
          align-items: stretch;
          flex-direction: column;
        }

        .top-actions {
          max-width: 100%;
          justify-content: flex-start;
        }
      }

      .top-actions {
        gap: 10px !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      }

      .top-actions .ghost-button,
      .top-actions .profile-button {
        min-height: 44px;
        height: 44px;
        padding-inline: 18px;
        border-radius: 14px !important;
        background: rgba(255, 255, 255, 0.045) !important;
        border: 1px solid var(--ef-border-premium) !important;
        box-shadow: none !important;
      }

      .top-actions .ghost-button:hover,
      .top-actions .profile-button:hover {
        background: rgba(255, 255, 255, 0.075) !important;
        border-color: rgba(255, 255, 255, 0.16) !important;
      }

      .top-actions .profile-button {
        padding: 5px 14px 5px 6px;
      }

      .top-actions .profile-button span {
        background: var(--ef-premium-gradient) !important;
      }

      .tool-section-header b,
      .studio-app.dark .tool-section-header b {
        color: var(--ef-text) !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035)),
          rgba(255, 255, 255, 0.045) !important;
        border: 1px solid var(--ef-border-premium) !important;
        box-shadow: none !important;
      }

      .export-options-card {
        display: grid !important;
        gap: 14px !important;
        min-height: 0 !important;
        height: auto !important;
        overflow: visible !important;
        padding: 18px !important;
      }

      .export-options-card .panel-title {
        margin-bottom: 0;
      }

      .export-options-card .format-row,
      .export-options-card .preset-row,
      .export-options-card .size-row {
        display: grid !important;
        width: 100%;
        margin-top: 0 !important;
      }

      .export-options-card .format-row {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .export-options-card .preset-row {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .export-options-card .size-row {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      .export-options-card button,
      .export-options-card input {
        width: 100%;
      }

      .export-options-card .slider {
        margin-top: 0;
      }

      .preset-row.two-column {
        row-gap: 10px !important;
      }

      .preset-row.two-column button:last-child:nth-child(odd) {
        grid-column: 1 / -1;
      }

      .preset-row.two-column + .fit-mode-row {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--ef-border-premium);
      }

      .fit-mode-row {
        gap: 12px !important;
      }

      .dimension-toolbar {
        margin-top: 12px;
        margin-bottom: 16px;
      }

      .format-row .active,
      .fit-mode-row .active,
      .dimension-toolbar .active,
      .toggle-button.active,
      .background-source-grid .active,
      .style-grid .active,
      .effect-grid .active,
      .color-target-row .active,
      .border-mode-row .active,
      .local-mockup-grid .active,
      .tabs .active,
      .segmented .active,
      .primary-button,
      .export-card,
      .selected-layer-actions .danger,
      .remove-layer-button,
      .layer-row.active {
        background: var(--ef-premium-gradient) !important;
        border-color: rgba(154, 155, 255, 0.54) !important;
        box-shadow: 0 14px 34px rgba(113, 120, 255, 0.18) !important;
      }

      @media (max-width: 1320px) {
        .export-options-card .preset-row {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }

      .right-panel {
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;
      }

      .right-panel > * {
        position: relative;
        flex: 0 0 auto;
        width: 100%;
      }

      .export-options-card {
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;
        min-height: 292px !important;
        overflow: hidden !important;
      }

      .export-options-card .format-row,
      .export-options-card .preset-row,
      .export-options-card .size-row {
        flex: 0 0 auto;
      }

      .export-actions-card {
        display: grid;
        gap: 12px;
        padding: 0 !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .export-actions-card .quick-action-row {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
      }

      .export-actions-card .quick-action-row:first-child button:first-child {
        grid-column: 1 / -1;
      }

      .export-actions-card .quick-action-row button {
        min-height: 48px !important;
        border-radius: 14px !important;
      }

      .template-section {
        margin-top: 14px;
      }

      .template-section .panel-title {
        margin: 14px 0 10px;
      }

      .template-subsection {
        margin-bottom: 16px !important;
      }

      .template-subsection h3 {
        margin-bottom: 8px !important;
        font-size: 11px !important;
      }

      .template-grid.format-template-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      .format-template-card {
        min-height: 0 !important;
        padding: 10px !important;
        border-radius: 16px !important;
      }

      .format-template-card .format-preview {
        height: 54px !important;
        margin-bottom: 9px !important;
        border-radius: 13px !important;
      }

      .format-template-card strong {
        font-size: 12px !important;
        line-height: 1.12 !important;
      }

      .format-template-card small,
      .format-template-card em {
        font-size: 10px !important;
        line-height: 1.2 !important;
      }

      .compact-tabs {
        position: sticky;
        top: -18px;
        z-index: 5;
        margin-bottom: 12px !important;
      }

      .tool-section {
        overflow: hidden;
      }

      .tool-section-body {
        display: grid;
        gap: 14px;
      }

      .style-grid,
      .effect-grid,
      .color-target-row,
      .border-mode-row,
      .local-mockup-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
        width: 100%;
        min-width: 0;
        margin: 0 !important;
      }

      .style-grid + .border-mode-row,
      .effect-grid + .effect-grid,
      .color-target-row + .color-control {
        margin-top: 14px !important;
        padding-top: 14px;
        border-top: 1px solid var(--ef-border-premium);
      }

      .border-mode-row {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .color-target-row {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .color-target-row button:last-child {
        grid-column: 1 / -1;
      }

      .style-grid button,
      .effect-grid button,
      .color-target-row button,
      .border-mode-row button,
      .local-mockup-grid button {
        position: relative;
        width: 100%;
        min-width: 0;
        transform: none !important;
        box-sizing: border-box;
        overflow: hidden;
        text-align: center;
      }

      .style-grid button {
        min-height: 92px !important;
        padding: 10px !important;
        align-content: start;
        justify-items: stretch;
        gap: 8px !important;
      }

      .style-thumb {
        width: 100% !important;
        height: 42px !important;
        border-radius: 12px !important;
      }

      .style-grid button,
      .effect-grid button {
        border-radius: 16px !important;
      }

      .effect-grid button {
        min-height: 58px !important;
        padding: 10px !important;
        display: grid !important;
        place-items: center;
        gap: 6px !important;
      }

      .color-target-row button,
      .border-mode-row button {
        min-height: 42px !important;
        height: auto !important;
        padding: 0 10px !important;
        border-radius: 13px !important;
        white-space: nowrap;
      }

      .style-grid .active,
      .effect-grid .active,
      .color-target-row .active,
      .border-mode-row .active {
        box-shadow: 0 0 0 1px rgba(139, 140, 246, 0.22), 0 10px 28px rgba(113, 120, 255, 0.14) !important;
        z-index: 1;
      }

      .color-control {
        min-width: 0;
        margin: 0 !important;
      }

      .color-row {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .layer-action-row.three,
      .layer-action-row.four {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }

      .layer-action-row button {
        min-width: 0;
      }

      .template-folder-list {
        display: grid;
        gap: 10px;
      }

      .template-folder {
        border: 1px solid var(--ef-border-premium);
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.035);
        overflow: hidden;
      }

      .template-folder summary {
        min-height: 48px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        padding: 0 12px;
        color: var(--ef-text);
        cursor: pointer;
        list-style: none;
      }

      .template-folder summary::-webkit-details-marker {
        display: none;
      }

      .template-folder summary span {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        font-weight: 700;
      }

      .template-folder summary small {
        color: var(--ef-text-muted);
        font-size: 11px;
        font-weight: 600;
      }

      .template-folder-body {
        display: grid;
        gap: 12px;
        padding: 0 10px 12px;
      }

      .template-folder-group {
        display: grid;
        gap: 7px;
      }

      .template-folder-group h3 {
        margin: 0;
        color: var(--ef-text-faint);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .template-line-list {
        display: grid;
        gap: 7px;
      }

      .template-line-row {
        width: 100%;
        min-height: 52px;
        display: grid;
        grid-template-columns: 38px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        padding: 8px;
        border-radius: 13px;
        color: var(--ef-text);
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid var(--ef-border-premium) !important;
        text-align: left;
      }

      .template-line-row:hover {
        background: rgba(139, 140, 246, 0.08);
        border-color: var(--ef-border-focus) !important;
      }

      .template-size-icon {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        border-radius: 11px;
        background: rgba(255, 255, 255, 0.075);
        border: 1px solid var(--ef-border-premium);
      }

      .template-size-icon.circle {
        border-radius: 999px;
      }

      .template-size-icon i {
        display: block;
        width: 24px;
        max-height: 28px;
        border-radius: 5px;
        background: var(--ef-text-muted);
      }

      .template-size-icon.circle i {
        width: 22px;
        height: 22px;
        border-radius: 999px;
      }

      .template-line-copy {
        min-width: 0;
        display: grid;
        gap: 2px;
      }

      .template-line-copy strong,
      .template-line-copy small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .template-line-copy strong {
        font-size: 12px;
        font-weight: 700;
      }

      .template-line-copy small {
        color: var(--ef-text-muted);
        font-size: 10px;
        font-weight: 600;
      }

      .left-preset-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      .left-preset-grid .preset-preview-stage {
        height: 48px;
        border-radius: 12px;
      }

      .left-preset-grid .preset-preview-card {
        padding: 7px !important;
        border-radius: 14px !important;
        gap: 6px;
      }

      .left-preset-grid .preset-preview-card strong {
        font-size: 10px;
        line-height: 1.15;
      }

      .layer-action-row.single {
        grid-template-columns: 1fr !important;
      }

      .layer-action-row.single button {
        min-height: 50px;
        display: inline-flex;
        flex-direction: row;
        gap: 8px;
      }

      .custom-color-picker {
        position: relative;
        display: grid;
        place-items: center;
        overflow: hidden;
      }

      .custom-color-picker::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(90deg, #ff3b30, #ffcc00, #34c759, #00c7ff, #5856d6, #ff2d55);
        opacity: 0.95;
      }

      .custom-color-picker input {
        z-index: 2;
      }

      .theme-toggle-button {
        min-width: 96px;
      }

      .studio-app.light {
        --ef-bg: #f6f7fb;
        --ef-bg-elevated: #ffffff;
        --ef-surface-premium: rgba(255, 255, 255, 0.86);
        --ef-surface-solid: rgba(255, 255, 255, 0.96);
        --ef-surface-hover: rgba(15, 23, 42, 0.055);
        --ef-border-premium: rgba(15, 23, 42, 0.1);
        --ef-border-focus: rgba(99, 102, 241, 0.42);
        --ef-text: #111827;
        --ef-text-soft: rgba(17, 24, 39, 0.76);
        --ef-text-muted: rgba(17, 24, 39, 0.56);
        --ef-text-faint: rgba(17, 24, 39, 0.38);
        background:
          radial-gradient(circle at 82% -12%, rgba(99, 102, 241, 0.18), transparent 30%),
          radial-gradient(circle at 10% 14%, rgba(20, 184, 166, 0.12), transparent 28%),
          linear-gradient(145deg, #f8fafc 0%, #eef2f7 52%, #f7f7fb 100%);
        color: var(--ef-text);
      }

      .studio-app.light .brand,
      .studio-app.light .side-panel,
      .studio-app.light .canvas-shell,
      .studio-app.light .control-card,
      .studio-app.light .template-card,
      .studio-app.light .tool-section,
      .studio-app.light .tabs,
      .studio-app.light .segmented,
      .studio-app.light .canvas-meta,
      .studio-app.light .floating-toolbar,
      .studio-app.light .bottom-action-bar,
      .studio-app.light .profile-button,
      .studio-app.light .profile-dropdown {
        background:
          linear-gradient(180deg, rgba(255,255,255,.82), rgba(255,255,255,.66)),
          rgba(255, 255, 255, 0.86) !important;
        border-color: var(--ef-border-premium) !important;
        color: var(--ef-text);
        box-shadow: 0 20px 70px rgba(15, 23, 42, 0.1);
      }

      .studio-app.light .tool-section-header b,
      .studio-app.light .template-folder,
      .studio-app.light .template-line-row,
      .studio-app.light .background-group,
      .studio-app.light .media-drop,
      .studio-app.light .layer-editor,
      .studio-app.light .selected-layer-summary,
      .studio-app.light .preset-preview-card,
      .studio-app.light .media-item,
      .studio-app.light .layer-row,
      .studio-app.light .device-row,
      .studio-app.light .slot-panel,
      .studio-app.light .soon-card {
        background: rgba(15, 23, 42, 0.035) !important;
        border-color: var(--ef-border-premium) !important;
        color: var(--ef-text);
      }

      .studio-app.light .ghost-button,
      .studio-app.light .icon-button,
      .studio-app.light .quick-action-row button,
      .studio-app.light .format-row button,
      .studio-app.light .preset-row button,
      .studio-app.light .fit-mode-row button,
      .studio-app.light .dimension-toolbar button,
      .studio-app.light .selected-layer-actions button,
      .studio-app.light .layer-action-row button,
      .studio-app.light .layer-quick-row button,
      .studio-app.light .toggle-button,
      .studio-app.light .background-source-grid button,
      .studio-app.light .color-target-row button,
      .studio-app.light .border-mode-row button,
      .studio-app.light .effect-grid button,
      .studio-app.light .style-grid button,
      .studio-app.light .local-mockup-grid button,
      .studio-app.light .url-import-row button,
      .studio-app.light .background-url-row button,
      .studio-app.light .tabs button,
      .studio-app.light .segmented button,
      .studio-app.light .bottom-action-bar button {
        color: var(--ef-text-soft);
        background: rgba(15, 23, 42, 0.045) !important;
        border-color: var(--ef-border-premium) !important;
      }

      .studio-app.light input,
      .studio-app.light select {
        color: var(--ef-text) !important;
        background: rgba(255, 255, 255, 0.72) !important;
        border-color: var(--ef-border-premium) !important;
      }

      .studio-app.light .canvas-shell {
        background:
          radial-gradient(circle at 50% 88%, rgba(99, 102, 241, 0.12), transparent 34%),
          linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,.55)),
          #f8fafc !important;
      }

      .studio-app.light .export-stage {
        box-shadow:
          inset 0 0 0 1px rgba(15, 23, 42, 0.08),
          0 26px 70px rgba(15, 23, 42, 0.12);
      }

      .studio-app {
        scrollbar-width: thin;
        scrollbar-color: rgba(245, 247, 251, 0.28) transparent;
      }

      .studio-app * {
        scrollbar-width: thin;
        scrollbar-color: rgba(245, 247, 251, 0.28) transparent;
      }

      .studio-app ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      .studio-app ::-webkit-scrollbar-track {
        background: transparent;
      }

      .studio-app ::-webkit-scrollbar-thumb {
        border: 3px solid transparent;
        border-radius: 999px;
        background: rgba(245, 247, 251, 0.28);
        background-clip: content-box;
      }

      .studio-app.light,
      .studio-app.light * {
        scrollbar-color: rgba(15, 23, 42, 0.22) transparent;
      }

      .studio-app.light ::-webkit-scrollbar-thumb {
        border-color: rgba(248, 250, 252, 0.82);
        background: rgba(15, 23, 42, 0.24);
        background-clip: content-box;
      }

      .brand {
        min-width: 360px !important;
        min-height: 56px !important;
        align-items: center !important;
        gap: 11px !important;
        padding: 8px 18px 8px 10px !important;
        border-radius: 20px !important;
      }

      .brand-mark {
        width: 38px !important;
        height: 38px !important;
        border-radius: 13px !important;
        flex: 0 0 38px !important;
      }

      .brand strong {
        font-size: 15px !important;
        line-height: 1.1 !important;
      }

      .brand small {
        max-width: 275px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .top-actions {
        max-width: none !important;
        gap: 8px !important;
        padding: 6px !important;
        overflow: visible !important;
        border-radius: 20px !important;
      }

      .top-actions .ghost-button,
      .top-actions .profile-button {
        width: auto !important;
        min-width: 76px !important;
        height: 42px !important;
        min-height: 42px !important;
        padding: 0 14px !important;
        border-radius: 13px !important;
      }

      .top-actions .theme-toggle-button {
        min-width: 92px !important;
      }

      .profile-menu {
        position: relative !important;
        z-index: 50 !important;
        flex: 0 0 auto !important;
        overflow: visible !important;
      }

      .profile-dropdown {
        top: calc(100% + 10px) !important;
        right: 0 !important;
        z-index: 999 !important;
        width: 268px !important;
        gap: 10px !important;
        padding: 14px !important;
      }

      .account-plan {
        gap: 3px !important;
      }

      .workspace {
        grid-template-columns: 372px minmax(0, 1fr) 372px !important;
        gap: 20px !important;
      }

      .side-panel,
      .right-panel {
        width: 100% !important;
      }

      .tool-section-library .tool-section-body {
        padding: 0 14px 14px !important;
      }

      .tool-section-library .compact-tabs {
        margin: 0 !important;
      }

      .tool-section-library .template-folder-list {
        gap: 10px !important;
        margin: 0 !important;
      }

      .left-preset-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      .left-preset-grid .preset-preview-stage {
        display: none !important;
      }

      .left-preset-grid .preset-preview-card {
        min-height: 50px !important;
        aspect-ratio: 1.72 / 1 !important;
        display: grid !important;
        place-items: center !important;
        padding: 8px !important;
        border-radius: 15px !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
          rgba(255, 255, 255, 0.045) !important;
        text-align: center !important;
        overflow: hidden !important;
      }

      .left-preset-grid .preset-preview-card.active,
      .left-preset-grid .preset-preview-card:hover {
        border-color: rgba(126, 216, 255, 0.58) !important;
        background: linear-gradient(135deg, rgba(139, 140, 246, 0.95), rgba(80, 205, 210, 0.86)) !important;
        color: #ffffff !important;
        box-shadow: 0 14px 34px rgba(85, 118, 255, 0.24) !important;
      }

      .left-preset-grid .preset-preview-card strong {
        color: currentColor !important;
        font-size: 10.5px !important;
        font-weight: 760 !important;
        line-height: 1.15 !important;
        text-align: center !important;
        white-space: normal !important;
      }

      .studio-app.light .left-preset-grid .preset-preview-card {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.52)),
          rgba(15, 23, 42, 0.035) !important;
      }

      .studio-app {
        height: 100vh;
        overflow: hidden;
      }

      .side-panel,
      .right-panel {
        scrollbar-gutter: stable;
        padding-right: 14px !important;
      }

      .side-panel::-webkit-scrollbar,
      .right-panel::-webkit-scrollbar {
        width: 12px;
      }

      .side-panel::-webkit-scrollbar-track,
      .right-panel::-webkit-scrollbar-track {
        margin: 16px 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.035);
      }

      .side-panel::-webkit-scrollbar-thumb,
      .right-panel::-webkit-scrollbar-thumb {
        border: 4px solid rgba(14, 15, 19, 0.72);
        border-radius: 999px;
        background: rgba(245, 247, 251, 0.32);
        background-clip: padding-box;
      }

      .studio-app.light .side-panel::-webkit-scrollbar-track,
      .studio-app.light .right-panel::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.055);
      }

      .studio-app.light .side-panel::-webkit-scrollbar-thumb,
      .studio-app.light .right-panel::-webkit-scrollbar-thumb {
        border-color: rgba(255, 255, 255, 0.9);
        background: rgba(15, 23, 42, 0.28);
        background-clip: padding-box;
      }

      .side-panel .tool-section-copy strong,
      .side-panel .panel-title,
      .side-panel .micro-label,
      .side-panel .color-control > span {
        font-size: 11px !important;
        line-height: 1.1 !important;
        white-space: nowrap !important;
      }

      .side-panel .tool-section-copy small,
      .side-panel .template-line-copy small,
      .side-panel .muted {
        font-size: 12px !important;
        line-height: 1.25 !important;
      }

      .side-panel .template-line-copy strong,
      .side-panel .style-grid button,
      .side-panel .effect-grid button,
      .side-panel .background-source-grid button,
      .side-panel .tabs button,
      .side-panel .segmented button {
        font-size: 12.5px !important;
        line-height: 1.2 !important;
      }

      .left-preset-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      .left-preset-grid .preset-preview-card {
        min-height: 108px !important;
        aspect-ratio: auto !important;
        display: grid !important;
        grid-template-rows: 66px auto !important;
        align-items: center !important;
        justify-items: stretch !important;
        gap: 7px !important;
        padding: 8px !important;
        border-radius: 16px !important;
      }

      .left-preset-grid .preset-preview-stage {
        display: block !important;
        width: 100% !important;
        height: 66px !important;
        border-radius: 12px !important;
        overflow: hidden !important;
      }

      .left-preset-grid .preset-preview-card strong {
        min-width: 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .export-card strong {
        color: #ffffff !important;
        font-size: 15px !important;
        line-height: 1.1 !important;
        text-shadow: 0 1px 12px rgba(0, 0, 0, 0.28);
      }

      .export-card small {
        color: rgba(255, 255, 255, 0.86) !important;
        font-size: 12px !important;
        line-height: 1.2 !important;
      }

      .right-panel .panel-title,
      .right-panel .micro-label,
      .right-panel .slider small {
        font-size: 11px !important;
      }

      .right-panel button,
      .right-panel input,
      .right-panel select,
      .right-panel .muted,
      .right-panel .slider b {
        font-size: 12.5px !important;
      }

      .studio-app.light .profile-button,
      .studio-app.light .profile-dropdown {
        color: #111827 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.86)),
          rgba(255, 255, 255, 0.94) !important;
      }

      .studio-app.light .profile-button strong,
      .studio-app.light .profile-dropdown small,
      .studio-app.light .account-plan b,
      .studio-app.light .account-plan span {
        color: #111827 !important;
      }

      .studio-app.light .profile-dropdown small,
      .studio-app.light .account-plan span {
        opacity: 0.68;
      }

      .studio-app.light .account-plan {
        background: rgba(15, 23, 42, 0.045) !important;
        border-color: rgba(15, 23, 42, 0.1) !important;
      }

      .studio-app.light .profile-dropdown button {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6, #43cbd0) !important;
      }

      .studio-app.light .ghost-button,
      .studio-app.light .icon-button,
      .studio-app.light .quick-action-row button,
      .studio-app.light .format-row button,
      .studio-app.light .preset-row button,
      .studio-app.light .fit-mode-row button,
      .studio-app.light .dimension-toolbar button,
      .studio-app.light .selected-layer-actions button,
      .studio-app.light .layer-action-row button,
      .studio-app.light .layer-quick-row button,
      .studio-app.light .toggle-button,
      .studio-app.light .background-source-grid button,
      .studio-app.light .color-target-row button,
      .studio-app.light .border-mode-row button,
      .studio-app.light .effect-grid button,
      .studio-app.light .style-grid button,
      .studio-app.light .local-mockup-grid button,
      .studio-app.light .tabs button,
      .studio-app.light .segmented button,
      .studio-app.light .template-line-row,
      .studio-app.light .device-row {
        color: #172033 !important;
      }

      .studio-app.light .ghost-button:hover,
      .studio-app.light .icon-button:hover,
      .studio-app.light .quick-action-row button:hover,
      .studio-app.light .format-row button:hover,
      .studio-app.light .preset-row button:hover,
      .studio-app.light .fit-mode-row button:hover,
      .studio-app.light .dimension-toolbar button:hover,
      .studio-app.light .selected-layer-actions button:hover,
      .studio-app.light .layer-action-row button:hover,
      .studio-app.light .layer-quick-row button:hover,
      .studio-app.light .toggle-button:hover,
      .studio-app.light .background-source-grid button:hover,
      .studio-app.light .color-target-row button:hover,
      .studio-app.light .border-mode-row button:hover,
      .studio-app.light .effect-grid button:hover,
      .studio-app.light .style-grid button:hover,
      .studio-app.light .local-mockup-grid button:hover,
      .studio-app.light .tabs button:hover,
      .studio-app.light .segmented button:hover,
      .studio-app.light .template-line-row:hover,
      .studio-app.light .device-row:hover {
        color: #0f172a !important;
        background: rgba(15, 23, 42, 0.075) !important;
      }

      .studio-app.light .primary-button,
      .studio-app.light .export-card,
      .studio-app.light .format-row .active,
      .studio-app.light .fit-mode-row .active,
      .studio-app.light .dimension-toolbar .active,
      .studio-app.light .tabs .active,
      .studio-app.light .segmented .active,
      .studio-app.light .toggle-button.active,
      .studio-app.light .left-preset-grid .preset-preview-card:hover {
        color: #ffffff !important;
      }

      .studio-app.light .bottom-action-bar .primary-button,
      .studio-app.light .canvas-shell .primary-button,
      .studio-app.light .select-media-button {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6 0%, #56d0d2 100%) !important;
        border-color: rgba(99, 102, 241, 0.32) !important;
        box-shadow: 0 12px 30px rgba(99, 102, 241, 0.22) !important;
        opacity: 1 !important;
      }

      .studio-app.light .bottom-action-bar .primary-button svg,
      .studio-app.light .canvas-shell .primary-button svg {
        color: #ffffff !important;
        stroke: currentColor !important;
      }

      .studio-app.light .url-import-row {
        grid-template-columns: minmax(0, 1fr) 78px !important;
      }

      .studio-app.light .url-import-row input {
        color: #111827 !important;
        background: rgba(255, 255, 255, 0.92) !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
        opacity: 1 !important;
      }

      .studio-app.light .url-import-row input::placeholder {
        color: rgba(17, 24, 39, 0.48) !important;
      }

      .studio-app.light .url-import-row button {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6, #43cbd0) !important;
        border-color: rgba(99, 102, 241, 0.25) !important;
      }

      .side-panel {
        display: flex !important;
        flex-direction: column !important;
        gap: 18px !important;
      }

      .side-panel .tool-section {
        border-radius: 26px !important;
        overflow: hidden !important;
      }

      .side-panel .tool-section-header {
        min-height: 86px !important;
        padding: 0 22px !important;
        grid-template-columns: minmax(0, 1fr) 40px !important;
      }

      .side-panel .tool-section-header b {
        width: 40px !important;
        height: 40px !important;
        color: #172033 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.8)) !important;
        border: 1px solid rgba(15, 23, 42, 0.12) !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
      }

      .studio-app.dark .side-panel .tool-section-header b {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
      }

      .tool-section-library .tool-section-body {
        padding: 0 22px 22px !important;
      }

      .library-switch {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 12px !important;
        padding: 0 !important;
        margin: 0 0 16px !important;
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .library-switch button {
        min-height: 48px !important;
        border-radius: 15px !important;
        color: #172033 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(248, 250, 252, 0.72)) !important;
        border: 1px solid rgba(15, 23, 42, 0.12) !important;
        font-size: 12.5px !important;
        font-weight: 780 !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06) !important;
      }

      .library-switch button:hover {
        color: #0f172a !important;
        background: rgba(255, 255, 255, 0.96) !important;
      }

      .library-switch .active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6 0%, #56d0d2 100%) !important;
        border-color: rgba(99, 102, 241, 0.24) !important;
        box-shadow: 0 16px 34px rgba(99, 102, 241, 0.2) !important;
      }

      .studio-app.dark .library-switch button {
        color: rgba(245, 247, 251, 0.72) !important;
        background: rgba(255, 255, 255, 0.055) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      .studio-app.dark .library-switch .active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6 0%, #56d0d2 100%) !important;
      }

      .studio-app.light .preset-row.two-column button,
      .studio-app.light .fit-mode-row button,
      .studio-app.light .dimension-toolbar button,
      .studio-app.light .layer-quick-row button {
        color: #172033 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.86), rgba(248, 250, 252, 0.74)) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.045) !important;
        opacity: 1 !important;
      }

      .studio-app.light .preset-row.two-column button:hover,
      .studio-app.light .fit-mode-row button:hover,
      .studio-app.light .dimension-toolbar button:hover,
      .studio-app.light .layer-quick-row button:hover {
        color: #0f172a !important;
        background: rgba(255, 255, 255, 0.98) !important;
      }

      .studio-app.light .fit-mode-row .active,
      .studio-app.light .dimension-toolbar .active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6 0%, #56d0d2 100%) !important;
      }

      .fit-mode-row {
        align-items: stretch !important;
        gap: 12px !important;
      }

      .fit-mode-row button {
        min-height: 48px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .dimension-toolbar {
        display: grid !important;
        grid-template-columns: 48px minmax(0, 1fr) !important;
        align-items: center !important;
        gap: 10px !important;
      }

      .dimension-toolbar button {
        width: 48px !important;
        height: 48px !important;
        min-height: 48px !important;
      }

      .layer-editor {
        gap: 14px !important;
        padding: 16px !important;
      }

      .layer-editor > label {
        gap: 8px !important;
      }

      .layer-editor > label input {
        height: 44px !important;
        padding-inline: 14px !important;
        font-size: 13px !important;
      }

      .layer-quick-row {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 10px !important;
      }

      .layer-quick-row button {
        min-height: 46px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 10px !important;
        text-align: center !important;
        white-space: nowrap !important;
      }

      .side-panel {
        gap: 16px !important;
        padding-block: 18px !important;
      }

      .side-panel .tool-section {
        position: relative !important;
        overflow: visible !important;
        contain: none !important;
        border-radius: 24px !important;
      }

      .side-panel .tool-section-header {
        min-height: 78px !important;
        padding: 0 20px !important;
      }

      .side-panel .tool-section.open {
        z-index: 2 !important;
      }

      .side-panel .tool-section.open .tool-section-body {
        display: grid !important;
        gap: 14px !important;
        padding: 0 20px 20px !important;
        overflow: visible !important;
      }

      .side-panel .tool-section:not(.open) {
        overflow: hidden !important;
      }

      .side-panel .tool-section:not(.open) .tool-section-body {
        display: none !important;
      }

      .tool-section-colors.open {
        margin-bottom: 16px !important;
      }

      .tool-section-effects.open {
        margin-top: 4px !important;
      }

      .studio-app.light .export-options-card .format-row button,
      .studio-app.light .export-options-card .preset-row button {
        color: #172033 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.78)) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
        opacity: 1 !important;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.045) !important;
      }

      .studio-app.light .export-options-card .format-row button:hover,
      .studio-app.light .export-options-card .preset-row button:hover {
        color: #0f172a !important;
        background: rgba(255, 255, 255, 0.98) !important;
      }

      .studio-app.light .export-options-card .format-row .active,
      .studio-app.light .export-options-card .preset-row .active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6 0%, #56d0d2 100%) !important;
        border-color: rgba(99, 102, 241, 0.28) !important;
        box-shadow: 0 14px 30px rgba(99, 102, 241, 0.2) !important;
      }

      .studio-app.dark .export-options-card .format-row .active,
      .studio-app.dark .export-options-card .preset-row .active {
        color: #ffffff !important;
      }

      .side-panel .tool-section,
      .side-panel .tool-section.open,
      .side-panel .tool-section:not(.open) {
        position: relative !important;
        z-index: auto !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: hidden !important;
        isolation: isolate !important;
      }

      .side-panel .tool-section.open {
        overflow: hidden !important;
      }

      .side-panel .tool-section-header,
      .side-panel .tool-section-copy,
      .side-panel .tool-section-copy strong,
      .side-panel .tool-section-copy small,
      .side-panel .tool-section-header b {
        position: relative !important;
        z-index: 1 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      .side-panel .tool-section-body,
      .side-panel .tool-section.open .tool-section-body {
        position: relative !important;
        z-index: 0 !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        overflow: visible !important;
      }

      .side-panel .tool-section:not(.open) .tool-section-body {
        display: none !important;
      }

      .studio-app.light .side-panel .tool-section-copy strong {
        color: rgba(17, 24, 39, 0.58) !important;
      }

      .studio-app.light .side-panel .tool-section-copy small {
        color: rgba(17, 24, 39, 0.56) !important;
      }

      .studio-app.light .side-panel .tool-section-header b {
        color: #111827 !important;
      }

      .side-panel {
        display: flex !important;
        flex-direction: column !important;
        gap: 18px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      .left-tool-card {
        flex: 0 0 auto !important;
        width: 100% !important;
        min-width: 0 !important;
        height: auto !important;
        min-height: 0 !important;
        display: block !important;
        overflow: hidden !important;
        border: 1px solid rgba(15, 23, 42, 0.1) !important;
        border-radius: 26px !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.78)),
          rgba(255, 255, 255, 0.9) !important;
        box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08) !important;
        backdrop-filter: blur(18px);
      }

      .left-tool-header {
        width: 100% !important;
        min-height: 86px !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 42px !important;
        align-items: center !important;
        gap: 14px !important;
        padding: 0 24px !important;
        border: 0 !important;
        color: #111827 !important;
        background: transparent !important;
        text-align: left !important;
      }

      .left-tool-copy {
        min-width: 0 !important;
        display: grid !important;
        gap: 4px !important;
      }

      .left-tool-copy strong {
        color: rgba(17, 24, 39, 0.6) !important;
        font-size: 12px !important;
        font-weight: 820 !important;
        line-height: 1.1 !important;
        letter-spacing: 0.095em !important;
        text-transform: uppercase !important;
        white-space: nowrap !important;
      }

      .left-tool-copy small {
        color: rgba(17, 24, 39, 0.62) !important;
        font-size: 13px !important;
        font-weight: 560 !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
      }

      .left-tool-header b {
        width: 42px !important;
        height: 42px !important;
        display: grid !important;
        place-items: center !important;
        border-radius: 999px !important;
        color: #111827 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.84)) !important;
        border: 1px solid rgba(15, 23, 42, 0.12) !important;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
        font-size: 20px !important;
        font-weight: 760 !important;
        line-height: 1 !important;
      }

      .left-tool-body {
        width: 100% !important;
        height: auto !important;
        min-height: 0 !important;
        display: grid !important;
        gap: 16px !important;
        padding: 0 24px 24px !important;
        overflow: visible !important;
      }

      .left-tool-library .left-tool-body {
        gap: 14px !important;
      }

      .left-tool-library .compact-tabs,
      .left-tool-library .library-switch {
        margin: 0 0 14px !important;
      }

      .left-tool-backgrounds .background-panel {
        gap: 16px !important;
      }

      .left-tool-presets .left-preset-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .studio-app.dark .left-tool-card {
        border-color: rgba(255, 255, 255, 0.1) !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.022)),
          rgba(13, 14, 18, 0.9) !important;
        box-shadow: 0 18px 52px rgba(0, 0, 0, 0.28) !important;
      }

      .studio-app.dark .left-tool-copy strong {
        color: rgba(245, 247, 251, 0.58) !important;
      }

      .studio-app.dark .left-tool-copy small {
        color: rgba(245, 247, 251, 0.62) !important;
      }

      .studio-app.dark .left-tool-header b {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.07) !important;
        border-color: rgba(255, 255, 255, 0.12) !important;
      }

      .left-tool-presets .preset-preview-card,
      .left-tool-presets .preset-preview-card strong {
        color: #172033 !important;
        opacity: 1 !important;
        visibility: visible !important;
      }

      .left-tool-presets .preset-preview-card:hover {
        color: #ffffff !important;
      }

      .left-tool-presets .preset-preview-card:hover strong {
        color: #ffffff !important;
      }

      .left-tool-presets .preset-preview-card:focus,
      .left-tool-presets .preset-preview-card:focus-visible,
      .left-tool-presets .preset-preview-card:active {
        color: #172033 !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.52)),
          rgba(15, 23, 42, 0.035) !important;
      }

      .left-tool-presets .preset-preview-card:focus strong,
      .left-tool-presets .preset-preview-card:focus-visible strong,
      .left-tool-presets .preset-preview-card:active strong {
        color: #172033 !important;
      }

      .studio-app.dark .left-tool-presets .preset-preview-card,
      .studio-app.dark .left-tool-presets .preset-preview-card strong {
        color: rgba(245, 247, 251, 0.92) !important;
      }

      .studio-app.light .left-tool-presets .preset-preview-card:hover,
      .studio-app.light .left-tool-presets .preset-preview-card:focus,
      .studio-app.light .left-tool-presets .preset-preview-card:focus-visible,
      .studio-app.light .left-tool-presets .preset-preview-card:active {
        color: #172033 !important;
      }

      .studio-app.light .left-tool-presets .preset-preview-card:hover strong,
      .studio-app.light .left-tool-presets .preset-preview-card:focus strong,
      .studio-app.light .left-tool-presets .preset-preview-card:focus-visible strong,
      .studio-app.light .left-tool-presets .preset-preview-card:active strong {
        color: #172033 !important;
        opacity: 1 !important;
      }

      .brand-area {
        min-width: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 14px !important;
      }

      .brand {
        min-width: 0 !important;
        min-height: 0 !important;
        gap: 12px !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
      }

      .brand-mark {
        width: 44px !important;
        height: 44px !important;
        border-radius: 0 !important;
        flex: 0 0 44px !important;
        background: transparent !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .brand-mark img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }

      .brand strong {
        font-size: 21px !important;
        line-height: 1.05 !important;
        letter-spacing: -0.02em !important;
      }

      .brand small {
        max-width: 330px !important;
        font-size: 12px !important;
      }

      .brand-share-button {
        min-height: 40px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        padding: 0 14px !important;
        border-radius: 13px !important;
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6, #56d0d2) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        box-shadow: 0 14px 34px rgba(85, 118, 255, 0.24) !important;
        font-size: 12px !important;
        font-weight: 780 !important;
        white-space: nowrap !important;
      }

      .brand-share-button svg {
        stroke: currentColor !important;
      }

      .layer-select-grid select {
        min-height: 46px !important;
        border-radius: 16px !important;
        padding: 0 14px !important;
        font-size: 13px !important;
        font-weight: 720 !important;
        color-scheme: dark !important;
      }

      .studio-app.dark .layer-select-grid select,
      .studio-app.dark .layer-editor select {
        color: #f5f7fb !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.035)),
          #2b2d34 !important;
        border-color: rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 0 0 1px rgba(139, 140, 246, 0.08) inset !important;
      }

      .studio-app.dark .layer-select-grid select option,
      .studio-app.dark .layer-editor select option {
        color: #f5f7fb !important;
        background: #252730 !important;
      }

      .studio-app.dark .layer-select-grid select option:checked,
      .studio-app.dark .layer-editor select option:checked {
        color: #ffffff !important;
        background: #3a3d78 !important;
      }

      .studio-app.light .layer-select-grid select,
      .studio-app.light .layer-editor select {
        color: #172033 !important;
        background: rgba(255, 255, 255, 0.94) !important;
        border-color: rgba(15, 23, 42, 0.14) !important;
      }

      .layer-editor .inline-layer-actions {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 10px !important;
        margin: 0 0 2px !important;
      }

      .layer-editor .inline-layer-actions button {
        min-height: 42px !important;
      }

      .layer-select-grid {
        grid-template-columns: 1fr 1fr !important;
        align-items: end !important;
      }

      .layer-select-grid label {
        min-width: 0 !important;
      }

      .layer-select-grid select {
        width: 100% !important;
        text-align: left !important;
      }

      .brand-area {
        padding: 6px 10px 6px 6px !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 20px !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.035)),
          rgba(10, 12, 18, 0.58) !important;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.22) !important;
        backdrop-filter: blur(18px) !important;
      }

      .brand {
        gap: 14px !important;
      }

      .brand strong {
        font-size: 23px !important;
        font-weight: 820 !important;
      }

      .brand small {
        color: rgba(245, 247, 251, 0.62) !important;
        max-width: 360px !important;
      }

      .brand-mark {
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .studio-app.light .brand-area {
        border-color: rgba(15, 23, 42, 0.08) !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.78)),
          rgba(255, 255, 255, 0.9) !important;
        box-shadow: 0 18px 54px rgba(15, 23, 42, 0.12) !important;
      }

      .studio-app.light .brand strong {
        color: #0f172a !important;
      }

      .studio-app.light .brand small {
        color: rgba(15, 23, 42, 0.58) !important;
      }

      .layer-list.layer-stack {
        gap: 10px !important;
      }

      .layer-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) 36px !important;
        align-items: center !important;
        gap: 8px !important;
        min-height: 52px !important;
        padding: 6px 8px 6px 0 !important;
        overflow: hidden !important;
      }

      .layer-row-select {
        min-width: 0 !important;
        width: 100% !important;
        min-height: 40px !important;
        display: grid !important;
        grid-template-columns: 54px minmax(0, 1fr) auto !important;
        align-items: center !important;
        gap: 10px !important;
        padding: 0 0 0 12px !important;
        border: 0 !important;
        border-radius: 12px !important;
        color: inherit !important;
        background: transparent !important;
        text-align: left !important;
      }

      .layer-row-select:hover,
      .layer-row-select:focus,
      .layer-row-select:focus-visible {
        color: inherit !important;
        background: rgba(255, 255, 255, 0.08) !important;
        outline: none !important;
      }

      .layer-row-delete {
        width: 32px !important;
        height: 32px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 999px !important;
        color: rgba(15, 23, 42, 0.58) !important;
        background: rgba(15, 23, 42, 0.06) !important;
        border: 1px solid rgba(15, 23, 42, 0.08) !important;
      }

      .layer-row-delete:hover,
      .layer-row-delete:focus-visible {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6, #56d0d2) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        outline: none !important;
      }

      .layer-row.active .layer-row-select:hover,
      .layer-row.active .layer-row-select:focus,
      .layer-row.active .layer-row-select:focus-visible {
        background: rgba(255, 255, 255, 0.1) !important;
      }

      .layer-row.active .layer-row-delete {
        color: rgba(255, 255, 255, 0.9) !important;
        background: rgba(255, 255, 255, 0.13) !important;
        border-color: rgba(255, 255, 255, 0.16) !important;
      }

      .studio-app.dark .layer-row-delete {
        color: rgba(245, 247, 251, 0.7) !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      .studio-app.light .layer-row {
        color: #172033 !important;
        background: rgba(255, 255, 255, 0.76) !important;
        border-color: rgba(15, 23, 42, 0.1) !important;
        box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05) !important;
      }

      .studio-app.light .layer-row.active {
        color: #172033 !important;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(239, 250, 255, 0.9)) !important;
        border-color: rgba(86, 208, 210, 0.48) !important;
        box-shadow: 0 16px 36px rgba(86, 208, 210, 0.16) !important;
      }

      .studio-app.light .layer-row span,
      .studio-app.light .layer-row strong,
      .studio-app.light .layer-row small,
      .studio-app.light .layer-row.active span,
      .studio-app.light .layer-row.active strong,
      .studio-app.light .layer-row.active small {
        color: #172033 !important;
      }

      .studio-app.light .layer-row span,
      .studio-app.light .layer-row.active span {
        color: rgba(23, 32, 51, 0.5) !important;
      }

      .studio-app.light .layer-row small,
      .studio-app.light .layer-row.active small {
        color: rgba(23, 32, 51, 0.48) !important;
      }

      .studio-app.light .layer-row-select:hover,
      .studio-app.light .layer-row-select:focus,
      .studio-app.light .layer-row-select:focus-visible {
        background: rgba(15, 23, 42, 0.04) !important;
      }

      .studio-app.light .layer-row-delete,
      .studio-app.light .layer-row.active .layer-row-delete {
        color: #172033 !important;
        background: rgba(15, 23, 42, 0.055) !important;
        border-color: rgba(15, 23, 42, 0.08) !important;
      }

      .studio-app.light .layer-row-delete:hover,
      .studio-app.light .layer-row-delete:focus-visible {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6, #56d0d2) !important;
      }

      .mockup-device-list {
        display: grid !important;
        gap: 12px !important;
      }

      .mockup-device-row {
        width: 100% !important;
        min-height: 68px !important;
        display: grid !important;
        grid-template-columns: 52px minmax(0, 1fr) 20px !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 10px 12px !important;
        border-radius: 20px !important;
        color: #172033 !important;
        text-align: left !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.64)),
          rgba(255, 255, 255, 0.74) !important;
        border: 1px solid rgba(15, 23, 42, 0.08) !important;
        box-shadow: 0 12px 28px rgba(15, 23, 42, 0.05) !important;
      }

      .mockup-device-row:hover,
      .mockup-device-row:focus-visible {
        color: #172033 !important;
        border-color: rgba(86, 208, 210, 0.46) !important;
        box-shadow: 0 16px 34px rgba(86, 208, 210, 0.14) !important;
        outline: none !important;
      }

      .mockup-device-row.active {
        border-color: rgba(119, 121, 246, 0.48) !important;
        box-shadow: 0 18px 40px rgba(119, 121, 246, 0.14) !important;
      }

      .mockup-device-thumb {
        width: 46px !important;
        height: 46px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        overflow: hidden !important;
        border-radius: 15px !important;
        color: #172033 !important;
        background: rgba(15, 23, 42, 0.055) !important;
        border: 1px solid rgba(15, 23, 42, 0.07) !important;
      }

      .mockup-device-thumb img {
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
      }

      .mockup-device-copy {
        min-width: 0 !important;
        display: grid !important;
        gap: 4px !important;
      }

      .mockup-device-copy strong,
      .mockup-device-copy small {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .mockup-device-copy strong {
        color: inherit !important;
        font-size: 14px !important;
        font-weight: 820 !important;
      }

      .mockup-device-copy small {
        color: rgba(23, 32, 51, 0.56) !important;
        font-size: 12px !important;
        font-weight: 650 !important;
      }

      .studio-app.dark .mockup-device-row {
        color: #f5f7fb !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.035)),
          rgba(255, 255, 255, 0.045) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.16) !important;
      }

      .studio-app.dark .mockup-device-row:hover,
      .studio-app.dark .mockup-device-row:focus-visible,
      .studio-app.dark .mockup-device-row.active {
        color: #f5f7fb !important;
        border-color: rgba(86, 208, 210, 0.36) !important;
      }

      .studio-app.dark .mockup-device-thumb {
        color: #f5f7fb !important;
        background: rgba(255, 255, 255, 0.08) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }

      .studio-app.dark .mockup-device-copy small {
        color: rgba(245, 247, 251, 0.58) !important;
      }

      .brand-area {
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
        backdrop-filter: none !important;
        gap: 16px !important;
      }

      .brand {
        min-width: 0 !important;
        gap: 13px !important;
      }

      .brand-mark {
        width: 50px !important;
        height: 50px !important;
        border-radius: 0 !important;
        flex: 0 0 50px !important;
        background: transparent !important;
        box-shadow: none !important;
        overflow: visible !important;
      }

      .brand strong {
        font-size: 25px !important;
        line-height: 1.02 !important;
        font-weight: 850 !important;
        letter-spacing: -0.01em !important;
      }

      .brand small {
        max-width: 380px !important;
        margin-top: 4px !important;
        font-size: 13px !important;
        line-height: 1.25 !important;
      }

      .studio-app.light .brand-area {
        border: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .custom-gradient-card {
        display: grid !important;
        gap: 12px !important;
        margin-top: 16px !important;
        padding: 14px !important;
        border-radius: 18px !important;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
          rgba(255, 255, 255, 0.055) !important;
        border: 1px solid var(--ef-border-premium) !important;
      }

      .custom-gradient-toggle {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        color: var(--ef-text) !important;
        font-size: 13px !important;
        font-weight: 800 !important;
      }

      .custom-gradient-toggle input {
        width: 18px !important;
        height: 18px !important;
        accent-color: #7779f6 !important;
      }

      .custom-gradient-preview {
        height: 46px !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.22) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.32), 0 14px 32px rgba(15, 23, 42, 0.12) !important;
      }

      .custom-gradient-pickers {
        display: grid !important;
        gap: 10px !important;
      }

      .custom-gradient-pickers label {
        display: grid !important;
        grid-template-columns: 58px 42px minmax(0, 1fr) !important;
        align-items: center !important;
        gap: 8px !important;
        color: var(--ef-text-muted) !important;
        font-size: 11px !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        letter-spacing: .06em !important;
      }

      .custom-gradient-pickers input[type="color"] {
        width: 42px !important;
        height: 34px !important;
        padding: 3px !important;
        border-radius: 11px !important;
      }

      .custom-gradient-pickers input:not([type="color"]) {
        height: 34px !important;
        border-radius: 11px !important;
        font-size: 12px !important;
        font-weight: 760 !important;
      }

      .studio-app.light .custom-gradient-card {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.86)),
          rgba(255, 255, 255, 0.94) !important;
        border-color: rgba(15, 23, 42, 0.11) !important;
        box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08) !important;
      }

      .studio-app.light .custom-gradient-toggle,
      .studio-app.light .custom-gradient-pickers label {
        color: #172033 !important;
      }

      .studio-app.light .custom-gradient-pickers label span {
        color: rgba(23, 32, 51, 0.62) !important;
      }

      .studio-app.light .custom-gradient-pickers input:not([type="color"]) {
        color: #172033 !important;
        background: rgba(255, 255, 255, 0.96) !important;
        border-color: rgba(15, 23, 42, 0.12) !important;
      }

      .effect-color-panel {
        display: grid !important;
        gap: 12px !important;
        margin-bottom: 14px !important;
        padding: 12px !important;
        border-radius: 16px !important;
        background: rgba(255, 255, 255, 0.045) !important;
        border: 1px solid var(--ef-border-premium) !important;
      }

      .effect-color-tabs {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 8px !important;
      }

      .effect-color-tabs button {
        min-height: 38px !important;
        border-radius: 12px !important;
        border: 1px solid var(--ef-border-premium) !important;
        background: rgba(255, 255, 255, 0.055) !important;
        color: var(--ef-text) !important;
        font-size: 12px !important;
        font-weight: 820 !important;
        text-transform: capitalize !important;
      }

      .effect-color-tabs button.active {
        color: #fff !important;
        border-color: transparent !important;
        background: linear-gradient(135deg, #7779f6, #56d0d2) !important;
        box-shadow: 0 14px 34px rgba(86, 208, 210, 0.16) !important;
      }

      .effect-color-panel .color-row {
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
      }

      .studio-app.light .effect-color-panel {
        background: rgba(255, 255, 255, 0.82) !important;
        border-color: rgba(15, 23, 42, 0.1) !important;
      }

      .studio-app.light .effect-color-tabs button {
        color: #172033 !important;
        background: rgba(255, 255, 255, 0.78) !important;
        border-color: rgba(15, 23, 42, 0.1) !important;
      }

      .studio-app.light .effect-color-tabs button.active {
        color: #ffffff !important;
        background: linear-gradient(135deg, #7779f6, #56d0d2) !important;
      }

      .swatch,
      .color-dot,
      .preset-preview-card,
      .primary-button,
      .brand-share-button,
      .library-switch button.active,
      .background-source-grid button.active,
      .color-target-row button.active,
      .effect-color-tabs button.active,
      .style-grid button.active,
      .effect-grid button.active {
        background-clip: padding-box !important;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.18),
          0 10px 24px rgba(15, 23, 42, 0.12) !important;
      }

      .color-dot,
      .swatch,
      .custom-color-picker {
        cursor: pointer !important;
        transform: translateZ(0) !important;
        transition: border-color 80ms ease, box-shadow 80ms ease, transform 80ms ease !important;
      }

      .color-dot:active,
      .swatch:active {
        transform: scale(0.96) translateZ(0) !important;
      }

      .swatch::before,
      .color-dot::before {
        display: none !important;
      }

      .style-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      }

      .style-thumb {
        position: relative !important;
        overflow: hidden !important;
        background-blend-mode: normal !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.46),
          inset 0 -8px 16px rgba(15, 23, 42, 0.08),
          0 10px 20px rgba(15, 23, 42, 0.12) !important;
      }

      .style-thumb::after {
        content: "" !important;
        position: absolute !important;
        inset: 8px 8px auto auto !important;
        width: 42% !important;
        height: 42% !important;
        border-radius: 0 0 0 18px !important;
        background: rgba(255, 255, 255, 0.76) !important;
        box-shadow: -4px 5px 10px rgba(15, 23, 42, 0.08) !important;
      }

      .style-grid button,
      .studio-app.light .style-grid button {
        overflow: hidden !important;
      }

      .studio-app.light .slider small,
      .studio-app.light .right-panel .slider small {
        color: rgba(23, 32, 51, 0.68) !important;
        opacity: 1 !important;
      }

      .studio-app.light .slider b,
      .studio-app.light .right-panel .slider b {
        color: #172033 !important;
        opacity: 1 !important;
      }

      .studio-app.light .slider-reset {
        color: rgba(23, 32, 51, 0.7) !important;
        background: rgba(15, 23, 42, 0.065) !important;
        border-color: rgba(15, 23, 42, 0.1) !important;
        opacity: 1 !important;
      }

      .studio-app.light .slider input::-webkit-slider-runnable-track {
        background: linear-gradient(90deg, #8b8cf6, #56d0d2) !important;
        opacity: 1 !important;
      }

      .studio-app.light .slider input::-moz-range-track {
        background: linear-gradient(90deg, #8b8cf6, #56d0d2) !important;
        opacity: 1 !important;
      }

      .studio-app.light .slider input::-webkit-slider-thumb {
        border-color: #0f172a !important;
        background: #ffffff !important;
      }

      .device-frame.edge-liquid .freeform-outline,
      .device-frame.edge-liquid .phone-bezel,
      .device-frame.edge-liquid .tablet-bezel,
      .device-frame.edge-liquid .browser-outline,
      .device-frame.edge-liquid .laptop-bezel {
        inset: -3px !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
        background:
          linear-gradient(135deg, rgba(255,255,255,.46), rgba(255,255,255,.11) 38%, rgba(86,208,210,.14) 68%, rgba(255,255,255,.32)),
          rgba(255,255,255,.08) !important;
        backdrop-filter: blur(12px) saturate(1.35) !important;
        -webkit-backdrop-filter: blur(12px) saturate(1.35) !important;
        mix-blend-mode: normal !important;
      }

      .device-frame.edge-glass-light .freeform-outline,
      .device-frame.edge-glass-light .phone-bezel,
      .device-frame.edge-glass-light .browser-outline,
      .device-frame.edge-glass-light .laptop-bezel {
        mix-blend-mode: screen !important;
      }

      .device-frame.edge-liquid .freeform-outline::after,
      .device-frame.edge-liquid .phone-bezel::after,
      .device-frame.edge-liquid .browser-outline::after,
      .device-frame.edge-liquid .laptop-bezel::after {
        content: "" !important;
        position: absolute !important;
        inset: 3px !important;
        border-radius: inherit !important;
        border: 1px solid rgba(255,255,255,.34) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.82),
          inset 0 -10px 22px rgba(255,255,255,.16),
          0 0 18px rgba(255,255,255,.2) !important;
      }

      .device-frame.edge-card .freeform-outline,
      .device-frame.edge-stack .freeform-outline,
      .device-frame.edge-stack-2 .freeform-outline {
        overflow: visible !important;
      }

      @media (max-width: 1500px) {
        .workspace {
          grid-template-columns: 352px minmax(0, 1fr) 352px !important;
        }

        .brand {
          min-width: 332px !important;
        }
      }

      @media (max-width: 1320px) {
        .workspace {
          grid-template-columns: 330px minmax(0, 1fr) 330px !important;
        }

        .brand {
          min-width: 306px !important;
        }
      }

      .brand,
      .studio-app.light .brand,
      .studio-app.dark .brand {
        min-width: 0 !important;
        min-height: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .disabled-card {
        opacity: 0.68;
      }

      .disabled-card input {
        width: 100%;
        height: 42px;
        margin-top: 10px;
        padding: 0 12px;
        border: 1px solid rgba(21, 23, 19, 0.1);
        border-radius: 14px;
        background: #fff;
      }

      .hidden-input {
        display: none;
      }

      @media (max-width: 1180px) {
        .studio-app {
          overflow: auto;
        }

        .workspace {
          height: auto;
          grid-template-columns: 1fr !important;
        }

        .side-panel {
          max-height: none;
        }
      }

      @media (max-width: 720px) {
        .topbar {
          height: auto;
          align-items: flex-start;
          gap: 12px;
          flex-direction: column;
        }

        .workspace {
          padding: 0 10px 12px;
        }

        .canvas-toolbar {
          align-items: flex-start;
          gap: 10px;
          flex-direction: column;
        }

        .canvas-stage {
          padding: 126px 14px 86px;
        }

        .export-stage {
          aspect-ratio: 4 / 5;
          padding: 34px !important;
        }

        .template-grid {
          grid-template-columns: 1fr 1fr;
        }
      }
    `}</style>
  );
}
