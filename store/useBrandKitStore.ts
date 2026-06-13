"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BrandGradient = [string, string, string];

export type BrandKitState = {
  name: string;
  colors: string[];
  gradient: BrandGradient;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  watermarkText: string;
  watermarkEnabled: boolean;
  setName: (name: string) => void;
  addColor: (color: string) => void;
  updateColor: (index: number, color: string) => void;
  removeColor: (index: number) => void;
  setGradient: (gradient: BrandGradient) => void;
  setAccentColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setLogo: (url: string | null) => void;
  setWatermarkText: (text: string) => void;
  setWatermarkEnabled: (enabled: boolean) => void;
  reset: () => void;
};

const DEFAULT_STATE = {
  name: "My Brand",
  colors: ["#6d5dfc", "#ff5f8f", "#13e0c4"],
  gradient: ["#6d5dfc", "#a35bff", "#ff5f8f"] as BrandGradient,
  accentColor: "#6d5dfc",
  fontFamily: "Inter, system-ui, sans-serif",
  logoUrl: null as string | null,
  watermarkText: "",
  watermarkEnabled: false
};

export const useBrandKitStore = create<BrandKitState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setName: (name) => set({ name }),
      addColor: (color) => set((state) => (state.colors.length >= 8 ? state : { colors: [...state.colors, color] })),
      updateColor: (index, color) =>
        set((state) => ({ colors: state.colors.map((value, i) => (i === index ? color : value)) })),
      removeColor: (index) => set((state) => ({ colors: state.colors.filter((_, i) => i !== index) })),
      setGradient: (gradient) => set({ gradient }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLogo: (logoUrl) => set({ logoUrl }),
      setWatermarkText: (watermarkText) => set({ watermarkText }),
      setWatermarkEnabled: (watermarkEnabled) => set({ watermarkEnabled }),
      reset: () => set({ ...DEFAULT_STATE })
    }),
    {
      name: "easyframe-brand-kit",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

/** CSS gradient string built from the brand's three gradient stops. */
export function brandGradientCss(gradient: BrandGradient): string {
  return `linear-gradient(150deg, ${gradient[0]} 0%, ${gradient[1]} 52%, ${gradient[2]} 100%)`;
}
