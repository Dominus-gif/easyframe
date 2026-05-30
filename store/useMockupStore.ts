"use client";

import { create } from "zustand";
import { backgrounds, devices, edgeStyles, effects, shadows, templates } from "@/lib/mockup-data";

type MockupState = {
  deviceId: string;
  backgroundId: string;
  backgroundMode: "preset" | "transparent" | "solid" | "image" | "url" | "custom-gradient";
  backgroundColor: string;
  customGradientColors: [string, string, string];
  backgroundImageUrl: string | null;
  backgroundOpacity: number;
  edgeStyleId: string;
  shadowId: string;
  effectId: string;
  borderColor: string;
  glowColor: string;
  shadowColor: string;
  glassColor: string;
  vignetteColor: string;
  edgeColor: string;
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
  mockupX: number;
  mockupY: number;
  selectedMockupUrl: string | null;
  selectedMockupName: string | null;
  exportFormat: "png" | "jpg" | "webp";
  exportWidth: number;
  exportHeight: number;
  exportQuality: number;
  theme: "light" | "dark";
  mediaUrl: string | null;
  mediaName: string | null;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  zoom: number;
  padding: number;
  aiPrompt: string;
  isGenerating: boolean;
  setDevice: (id: string) => void;
  setBackground: (id: string) => void;
  setBackgroundMode: (mode: "preset" | "transparent" | "solid" | "image" | "url" | "custom-gradient") => void;
  setBackgroundColor: (color: string) => void;
  setCustomGradientColors: (colors: [string, string, string]) => void;
  setBackgroundImage: (url: string | null) => void;
  setEdgeStyle: (id: string) => void;
  setShadow: (id: string) => void;
  setEffect: (id: string) => void;
  setBorderColor: (color: string) => void;
  setGlowColor: (color: string) => void;
  setShadowColor: (color: string) => void;
  setGlassColor: (color: string) => void;
  setVignetteColor: (color: string) => void;
  setEdgeColor: (color: string) => void;
  setSelectedMockup: (url: string | null, name?: string | null) => void;
  setExportFormat: (format: "png" | "jpg" | "webp") => void;
  setExportSize: (width: number, height: number) => void;
  setTheme: (theme: "light" | "dark") => void;
  setMedia: (url: string | null, name?: string | null) => void;
  setImageFitMode: (mode: "fit" | "fill") => void;
  setImageAspectLinked: (linked: boolean) => void;
  setTransform: (
    key:
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
      | "exportQuality",
    value: number
  ) => void;
  applyTemplate: (id: string) => void;
  startOver: () => void;
  setAiPrompt: (prompt: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
};

const baseTemplate = templates[0];

export const useMockupStore = create<MockupState>((set) => ({
  deviceId: baseTemplate.deviceId,
  backgroundId: baseTemplate.backgroundId,
  backgroundMode: "preset",
  backgroundColor: "#f7f4ec",
  customGradientColors: ["#F44369", "#3E3B92", "#60EFFF"],
  backgroundImageUrl: null,
  backgroundOpacity: 100,
  edgeStyleId: baseTemplate.edgeStyleId ?? edgeStyles[0].id,
  shadowId: baseTemplate.shadowId ?? shadows[1].id,
  effectId: baseTemplate.effectId ?? effects[0].id,
  borderColor: "#151713",
  glowColor: "#6d5dfc",
  shadowColor: "#111312",
  glassColor: "#b8f4ff",
  vignetteColor: "#111312",
  edgeColor: "#151713",
  borderWidth: 0,
  edgeWidth: 0,
  cornerRadius: edgeStyles.find((edge) => edge.id === (baseTemplate.edgeStyleId ?? edgeStyles[0].id))?.radius ?? 34,
  canvasRadius: 34,
  glassAmount: 18,
  canvasZoom: 100,
  imageScale: 100,
  imageFitMode: "fit",
  imageAspectLinked: true,
  imageWidthScale: 100,
  imageHeightScale: 100,
  imageX: 0,
  imageY: 0,
  imageRotate: 0,
  imageOpacity: 100,
  imageBlur: 0,
  imageBrightness: 100,
  imageContrast: 100,
  shadowIntensity: 80,
  glowIntensity: 32,
  backgroundBlur: 0,
  noiseAmount: 0,
  reflectionIntensity: 0,
  innerShadow: 0,
  mockupX: 0,
  mockupY: 0,
  selectedMockupUrl: null,
  selectedMockupName: null,
  exportFormat: "png",
  exportWidth: baseTemplate.width,
  exportHeight: baseTemplate.height,
  exportQuality: 92,
  theme: "dark",
  mediaUrl: null,
  mediaName: null,
  rotateX: baseTemplate.rotateX,
  rotateY: baseTemplate.rotateY,
  rotateZ: baseTemplate.rotateZ,
  zoom: baseTemplate.zoom,
  padding: baseTemplate.padding ?? 72,
  aiPrompt: "",
  isGenerating: false,
  setDevice: (id) => set({ deviceId: devices.some((device) => device.id === id) ? id : devices[0].id }),
  setBackground: (id) => set({ backgroundId: backgrounds.some((background) => background.id === id) ? id : backgrounds[0].id, backgroundMode: "preset" }),
  setBackgroundMode: (mode) => set({ backgroundMode: mode }),
  setBackgroundColor: (color) => set({ backgroundColor: color, backgroundMode: "solid" }),
  setCustomGradientColors: (colors) => set({ customGradientColors: colors, backgroundMode: "custom-gradient" }),
  setBackgroundImage: (url) => set({ backgroundImageUrl: url }),
  setEdgeStyle: (id) =>
    set(() => {
      const edge = edgeStyles.find((item) => item.id === id) ?? edgeStyles[0];
      return { edgeStyleId: edge.id, cornerRadius: edge.radius, edgeWidth: edge.id === "none" ? 0 : 2 };
    }),
  setShadow: (id) => set({ shadowId: shadows.some((shadow) => shadow.id === id) ? id : shadows[0].id }),
  setEffect: (id) => set({ effectId: effects.some((effect) => effect.id === id) ? id : effects[0].id }),
  setBorderColor: (color) => set({ borderColor: color }),
  setGlowColor: (color) => set({ glowColor: color }),
  setShadowColor: (color) => set({ shadowColor: color }),
  setGlassColor: (color) => set({ glassColor: color }),
  setVignetteColor: (color) => set({ vignetteColor: color }),
  setEdgeColor: (color) => set({ edgeColor: color }),
  setSelectedMockup: (url, name = null) => set({ selectedMockupUrl: url, selectedMockupName: name }),
  setExportFormat: (format) => set({ exportFormat: format }),
  setExportSize: (width, height) => set({ exportWidth: width, exportHeight: height }),
  setTheme: (theme) => set({ theme }),
  setMedia: (url, name = null) => set({ mediaUrl: url, mediaName: name }),
  setImageFitMode: (mode) => set({ imageFitMode: mode }),
  setImageAspectLinked: (linked) => set({ imageAspectLinked: linked }),
  setTransform: (key, value) => set({ [key]: value }),
  applyTemplate: (id) =>
    set(() => {
      const template = templates.find((item) => item.id === id) ?? baseTemplate;
      return {
        deviceId: template.deviceId,
        backgroundId: template.backgroundId,
        backgroundMode: "preset",
        backgroundOpacity: 100,
        edgeStyleId: template.edgeStyleId ?? edgeStyles[0].id,
        cornerRadius: template.safeZone === "circle" ? 999 : edgeStyles.find((edge) => edge.id === (template.edgeStyleId ?? edgeStyles[0].id))?.radius ?? 34,
        edgeWidth: (template.edgeStyleId ?? edgeStyles[0].id) === "none" ? 0 : 2,
        shadowId: template.shadowId ?? shadows[1].id,
        effectId: template.effectId ?? effects[0].id,
        rotateX: template.rotateX,
        rotateY: template.rotateY,
        rotateZ: template.rotateZ,
        zoom: template.zoom,
        padding: template.padding ?? 72,
        exportWidth: template.width,
        exportHeight: template.height,
        canvasZoom: 100,
        imageScale: 100,
        imageFitMode: "fit",
        imageAspectLinked: true,
        imageWidthScale: 100,
        imageHeightScale: 100,
        imageX: 0,
        imageY: 0,
        imageRotate: 0,
        imageOpacity: 100,
        imageBlur: 0,
        imageBrightness: 100,
        imageContrast: 100,
        borderWidth: 0,
        canvasRadius: 34,
        mockupX: 0,
        mockupY: 0
      };
    }),
  startOver: () =>
    set({
      deviceId: baseTemplate.deviceId,
      backgroundId: baseTemplate.backgroundId,
      backgroundMode: "preset",
      backgroundColor: "#f7f4ec",
      customGradientColors: ["#F44369", "#3E3B92", "#60EFFF"],
      backgroundImageUrl: null,
      backgroundOpacity: 100,
      edgeStyleId: baseTemplate.edgeStyleId ?? edgeStyles[0].id,
      shadowId: baseTemplate.shadowId ?? shadows[1].id,
      effectId: baseTemplate.effectId ?? effects[0].id,
      borderColor: "#151713",
      glowColor: "#6d5dfc",
      shadowColor: "#111312",
      glassColor: "#b8f4ff",
      vignetteColor: "#111312",
      edgeColor: "#151713",
      borderWidth: 0,
      edgeWidth: 0,
      cornerRadius: edgeStyles.find((edge) => edge.id === (baseTemplate.edgeStyleId ?? edgeStyles[0].id))?.radius ?? 34,
      canvasRadius: 34,
      glassAmount: 18,
      canvasZoom: 100,
      imageScale: 100,
      imageFitMode: "fit",
      imageAspectLinked: true,
      imageWidthScale: 100,
      imageHeightScale: 100,
      imageX: 0,
      imageY: 0,
      imageRotate: 0,
      imageOpacity: 100,
      imageBlur: 0,
      imageBrightness: 100,
      imageContrast: 100,
      shadowIntensity: 80,
      glowIntensity: 32,
      backgroundBlur: 0,
      noiseAmount: 0,
      reflectionIntensity: 0,
      innerShadow: 0,
      mockupX: 0,
      mockupY: 0,
      selectedMockupUrl: null,
      selectedMockupName: null,
      exportFormat: "png",
      exportWidth: baseTemplate.width,
      exportHeight: baseTemplate.height,
      exportQuality: 92,
      mediaUrl: null,
      mediaName: null,
      rotateX: baseTemplate.rotateX,
      rotateY: baseTemplate.rotateY,
      rotateZ: baseTemplate.rotateZ,
      zoom: baseTemplate.zoom,
      padding: baseTemplate.padding ?? 72
    }),
  setAiPrompt: (prompt) => set({ aiPrompt: prompt }),
  setIsGenerating: (isGenerating) => set({ isGenerating })
}));
