"use client";

import { useRef } from "react";
import { Check, Palette, Plus, Trash2, Upload, X } from "lucide-react";
import { useBrandKitStore, brandGradientCss, type BrandGradient } from "@/store/useBrandKitStore";
import { useMockupStore } from "@/store/useMockupStore";

type BrandKitProps = {
  open: boolean;
  onClose: () => void;
  onApplied?: () => void;
};

export default function BrandKit({ open, onClose, onApplied }: BrandKitProps) {
  const brand = useBrandKitStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const setCustomGradientColors = useMockupStore((state) => state.setCustomGradientColors);
  const setBackgroundColor = useMockupStore((state) => state.setBackgroundColor);
  const setBorderColor = useMockupStore((state) => state.setBorderColor);
  const setEdgeColor = useMockupStore((state) => state.setEdgeColor);
  const setGlowColor = useMockupStore((state) => state.setGlowColor);
  const setShadowColor = useMockupStore((state) => state.setShadowColor);

  const applyBrand = () => {
    // One-tap on-brand styling: brand gradient background + brand accent on the frame.
    setCustomGradientColors(brand.gradient);
    setBorderColor(brand.accentColor);
    setEdgeColor(brand.accentColor);
    setGlowColor(brand.accentColor);
    setShadowColor(brand.accentColor);
    onApplied?.();
    onClose();
  };

  const onLogoFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => brand.setLogo(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const setGradientStop = (index: number, color: string) => {
    const next = [...brand.gradient] as BrandGradient;
    next[index] = color;
    brand.setGradient(next);
  };

  if (!open) return null;

  return (
    <div className="brandkit-overlay" role="dialog" aria-modal="true" aria-label="Brand kit">
      <button className="brandkit-scrim" aria-label="Close brand kit" onClick={onClose} />
      <aside className="brandkit-drawer">
        <header className="brandkit-head">
          <div className="brandkit-title">
            <Palette size={18} />
            <div>
              <strong>Brand Kit</strong>
              <small>Save your brand once, apply it to every design.</small>
            </div>
          </div>
          <button className="brandkit-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="brandkit-body">
          <label className="brandkit-field">
            <span>Brand name</span>
            <input value={brand.name} onChange={(event) => brand.setName(event.target.value)} placeholder="My Brand" />
          </label>

          <section className="brandkit-section">
            <div className="brandkit-section-head">
              <span>Brand colors</span>
              <small>Click a swatch to use it as the background</small>
            </div>
            <div className="brandkit-swatches">
              {brand.colors.map((color, index) => (
                <div className="brandkit-swatch" key={`${color}-${index}`}>
                  <button
                    className="brandkit-swatch-chip"
                    style={{ background: color }}
                    title="Use as background"
                    onClick={() => setBackgroundColor(color)}
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(event) => brand.updateColor(index, event.target.value)}
                    aria-label={`Edit color ${index + 1}`}
                  />
                  <button className="brandkit-swatch-remove" onClick={() => brand.removeColor(index)} aria-label="Remove color">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {brand.colors.length < 8 ? (
                <button className="brandkit-add" onClick={() => brand.addColor("#ffffff")}>
                  <Plus size={16} />
                </button>
              ) : null}
            </div>
          </section>

          <section className="brandkit-section">
            <div className="brandkit-section-head">
              <span>Brand gradient</span>
            </div>
            <div className="brandkit-gradient-preview" style={{ background: brandGradientCss(brand.gradient) }} />
            <div className="brandkit-gradient-stops">
              {brand.gradient.map((stop, index) => (
                <input
                  key={index}
                  type="color"
                  value={stop}
                  onChange={(event) => setGradientStop(index, event.target.value)}
                  aria-label={`Gradient stop ${index + 1}`}
                />
              ))}
            </div>
          </section>

          <section className="brandkit-section">
            <div className="brandkit-section-head">
              <span>Accent color</span>
              <small>Used for frame border &amp; glow</small>
            </div>
            <div className="brandkit-accent-row">
              <input type="color" value={brand.accentColor} onChange={(event) => brand.setAccentColor(event.target.value)} />
              <code>{brand.accentColor.toUpperCase()}</code>
            </div>
          </section>

          <section className="brandkit-section">
            <div className="brandkit-section-head">
              <span>Logo</span>
              <small>Saved with your kit</small>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              hidden
              onChange={(event) => onLogoFile(event.target.files?.[0])}
            />
            {brand.logoUrl ? (
              <div className="brandkit-logo-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={brand.logoUrl} alt="Brand logo" />
                <div className="brandkit-logo-actions">
                  <button onClick={() => logoInputRef.current?.click()}>Replace</button>
                  <button className="danger" onClick={() => brand.setLogo(null)}>Remove</button>
                </div>
              </div>
            ) : (
              <button className="brandkit-upload" onClick={() => logoInputRef.current?.click()}>
                <Upload size={16} />
                Upload logo
              </button>
            )}
          </section>
        </div>

        <footer className="brandkit-foot">
          <button className="brandkit-apply" onClick={applyBrand}>
            <Check size={16} />
            Apply brand to design
          </button>
          <button className="brandkit-reset" onClick={() => brand.reset()}>
            Reset kit
          </button>
        </footer>
      </aside>

      <style jsx>{`
        .brandkit-overlay {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: flex;
          justify-content: flex-end;
        }
        .brandkit-scrim {
          position: absolute;
          inset: 0;
          border: 0;
          background: rgba(8, 10, 12, 0.55);
          backdrop-filter: blur(2px);
          cursor: pointer;
        }
        .brandkit-drawer {
          position: relative;
          width: min(420px, 92vw);
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #14171a;
          color: #f4f4f0;
          border-left: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: -30px 0 80px rgba(0, 0, 0, 0.45);
          animation: brandkit-in 0.22s ease;
        }
        @keyframes brandkit-in {
          from { transform: translateX(24px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .brandkit-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .brandkit-title { display: flex; gap: 12px; align-items: flex-start; }
        .brandkit-title strong { display: block; font-size: 16px; }
        .brandkit-title small { color: rgba(244, 244, 240, 0.55); font-size: 12px; }
        .brandkit-close {
          background: rgba(255, 255, 255, 0.06);
          border: 0;
          color: inherit;
          border-radius: 10px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .brandkit-body { flex: 1; overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 22px; }
        .brandkit-field { display: flex; flex-direction: column; gap: 7px; font-size: 12px; color: rgba(244, 244, 240, 0.7); }
        .brandkit-field input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 10px 12px;
          color: #fff;
          font-size: 14px;
        }
        .brandkit-section { display: flex; flex-direction: column; gap: 12px; }
        .brandkit-section-head { display: flex; flex-direction: column; gap: 2px; }
        .brandkit-section-head span { font-size: 13px; font-weight: 600; }
        .brandkit-section-head small { font-size: 11px; color: rgba(244, 244, 240, 0.45); }
        .brandkit-swatches { display: flex; flex-wrap: wrap; gap: 10px; }
        .brandkit-swatch { position: relative; width: 48px; }
        .brandkit-swatch-chip {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          cursor: pointer;
        }
        .brandkit-swatch input[type="color"] {
          width: 100%;
          height: 18px;
          margin-top: 4px;
          border: 0;
          background: transparent;
          cursor: pointer;
        }
        .brandkit-swatch-remove {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 0;
          background: #ff5470;
          color: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .brandkit-swatch:hover .brandkit-swatch-remove { opacity: 1; }
        .brandkit-add {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.25);
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: grid;
          place-items: center;
        }
        .brandkit-gradient-preview { height: 64px; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .brandkit-gradient-stops { display: flex; gap: 10px; }
        .brandkit-gradient-stops input { flex: 1; height: 30px; border: 0; background: transparent; cursor: pointer; }
        .brandkit-accent-row { display: flex; align-items: center; gap: 12px; }
        .brandkit-accent-row input { width: 54px; height: 38px; border: 0; background: transparent; cursor: pointer; }
        .brandkit-accent-row code { font-size: 13px; color: rgba(244, 244, 240, 0.7); }
        .brandkit-upload, .brandkit-logo-actions button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          cursor: pointer;
        }
        .brandkit-logo-row { display: flex; align-items: center; gap: 14px; }
        .brandkit-logo-row img { width: 72px; height: 72px; object-fit: contain; border-radius: 12px; background: rgba(255, 255, 255, 0.06); padding: 8px; }
        .brandkit-logo-actions { display: flex; flex-direction: column; gap: 8px; }
        .brandkit-logo-actions .danger { color: #ff8aa0; }
        .brandkit-foot { padding: 16px 20px; border-top: 1px solid rgba(255, 255, 255, 0.07); display: flex; flex-direction: column; gap: 10px; }
        .brandkit-apply {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #6d5dfc, #ff5f8f);
          border: 0;
          color: #fff;
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .brandkit-reset {
          background: transparent;
          border: 0;
          color: rgba(244, 244, 240, 0.5);
          font-size: 12px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
