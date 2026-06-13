"use client";

import type { CSSProperties } from "react";
import { Sparkles } from "lucide-react";
import { useMockupStore } from "@/store/useMockupStore";
import { lookPresets, lookPreviewCss, type LookPreset } from "@/lib/look-presets";

export default function QuickLooks() {
  const theme = useMockupStore((state) => state.theme);
  const setBackground = useMockupStore((state) => state.setBackground);
  const setShadow = useMockupStore((state) => state.setShadow);
  const setEffect = useMockupStore((state) => state.setEffect);
  const setEdgeStyle = useMockupStore((state) => state.setEdgeStyle);
  const setTransform = useMockupStore((state) => state.setTransform);

  const applyLook = (look: LookPreset) => {
    setBackground(look.backgroundId);
    setShadow(look.shadowId);
    setEffect(look.effectId);
    setEdgeStyle(look.edgeStyleId);
    setTransform("padding", look.padding);
    setTransform("rotateX", look.rotateX);
    setTransform("rotateY", look.rotateY);
    setTransform("rotateZ", look.rotateZ);
  };

  const themeVars =
    theme === "dark"
      ? ({
          "--ql-label": "rgba(244, 244, 240, 0.7)",
          "--ql-chip": "rgba(255, 255, 255, 0.08)",
          "--ql-border": "rgba(255, 255, 255, 0.12)",
          "--ql-text": "rgba(244, 244, 240, 0.9)",
          "--ql-panel": "rgba(22, 25, 28, 0.74)"
        } as CSSProperties)
      : ({
          "--ql-label": "rgba(20, 20, 20, 0.6)",
          "--ql-chip": "rgba(0, 0, 0, 0.05)",
          "--ql-border": "rgba(0, 0, 0, 0.08)",
          "--ql-text": "rgba(20, 20, 20, 0.85)",
          "--ql-panel": "rgba(255, 255, 255, 0.78)"
        } as CSSProperties);

  return (
    <div className="quick-looks" data-export-ignore="true" style={themeVars}>
      <span className="quick-looks-label">
        <Sparkles size={14} />
        Quick looks
      </span>
      <div className="quick-looks-row">
        {lookPresets.map((look) => (
          <button key={look.id} className="quick-look" onClick={() => applyLook(look)} title={look.label}>
            <i style={{ background: lookPreviewCss(look) }} />
            <span>{look.label}</span>
          </button>
        ))}
      </div>

      <style jsx>{`
        .quick-looks {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: min(640px, calc(100% - 56px));
          padding: 8px 14px;
          border-radius: 999px;
          background: var(--ql-panel, rgba(255, 255, 255, 0.72));
          border: 1px solid var(--ql-border);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(12px);
        }
        .quick-looks-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ql-label, rgba(20, 20, 20, 0.6));
          white-space: nowrap;
          flex-shrink: 0;
        }
        .quick-looks-row {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .quick-looks-row::-webkit-scrollbar { display: none; }
        .quick-look {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          background: var(--ql-chip, rgba(0, 0, 0, 0.05));
          border: 1px solid var(--ql-border, rgba(0, 0, 0, 0.08));
          border-radius: 999px;
          padding: 6px 12px 6px 6px;
          font-size: 12.5px;
          color: var(--ql-text, inherit);
          cursor: pointer;
          transition: transform 0.12s ease, border-color 0.12s ease;
        }
        .quick-look:hover { transform: translateY(-1px); border-color: #6d5dfc; }
        .quick-look i {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}
