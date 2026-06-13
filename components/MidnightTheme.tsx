"use client";

/**
 * Midnight Studio — a complete visual redesign layered over the existing studio.
 * It works by (1) redefining the --ef-* design tokens to a true near-black,
 * violet→pink identity, which cascades everywhere, and (2) restyling the chrome
 * (top bar, buttons, panels, cards, sliders, inputs, canvas, dialogs) for a
 * crisp, premium, designer-grade feel. Scoped under `.studio-app.midnight` so it
 * outranks the base theme without touching the 10k-line StudioStyles block.
 */
export default function MidnightTheme() {
  return (
    <style jsx global>{`
      /* ---------- Tokens ---------- */
      .studio-app.midnight {
        --mid-accent: #6d5dfc;
        --mid-accent-2: #ff5f8f;
        --mid-grad: linear-gradient(135deg, #6d5dfc 0%, #8b5cf6 46%, #ff5f8f 100%);
        --mid-glow: 0 0 0 1px rgba(109, 93, 252, 0.35), 0 8px 30px rgba(109, 93, 252, 0.35);

        --ef-bg: #0b0d0f;
        --ef-bg-elevated: #14171a;
        --ef-page: #0b0d0f;
        --ef-surface: rgba(255, 255, 255, 0.022);
        --ef-surface-solid: #16191d;
        --ef-surface-raised: #1b1f25;
        --ef-surface-premium: rgba(20, 23, 27, 0.86);
        --ef-surface-hover: rgba(255, 255, 255, 0.06);
        --ef-panel: rgba(20, 23, 27, 0.82);
        --ef-panel-soft: rgba(255, 255, 255, 0.03);
        --ef-panel-raised: #16191d;
        --ef-subtle: rgba(255, 255, 255, 0.04);
        --ef-control: rgba(255, 255, 255, 0.05);
        --ef-control-hover: rgba(255, 255, 255, 0.09);

        --ef-border: rgba(255, 255, 255, 0.08);
        --ef-border-strong: rgba(255, 255, 255, 0.14);
        --ef-border-premium: rgba(255, 255, 255, 0.08);
        --ef-border-focus: rgba(109, 93, 252, 0.55);
        --ef-line: rgba(255, 255, 255, 0.08);
        --ef-line-strong: rgba(255, 255, 255, 0.14);

        --ef-text: #f4f5f7;
        --ef-text-soft: rgba(244, 245, 247, 0.74);
        --ef-text-muted: #8a8f98;
        --ef-text-faint: rgba(244, 245, 247, 0.34);
        --ef-ink: #f4f5f7;
        --ef-muted: #8a8f98;

        --ef-accent: #6d5dfc;
        --ef-accent-2: #ff5f8f;
        --ef-accent-warm: #ff5f8f;
        --ef-hot: #ff5f8f;
        --ef-red-glow: rgba(109, 93, 252, 0.4);
        --ef-premium-gradient: var(--mid-grad);

        --ef-radius-sm: 12px;
        --ef-radius-md: 16px;
        --ef-radius-lg: 20px;
        --ef-shadow-soft: 0 10px 30px rgba(0, 0, 0, 0.4);
        --ef-shadow-panel: 0 24px 70px rgba(0, 0, 0, 0.5);
        --ef-shadow-card: 0 18px 50px rgba(0, 0, 0, 0.45);
        --ef-shadow-elevated: 0 28px 90px rgba(0, 0, 0, 0.55);
        --ef-shadow-deep: 0 40px 120px rgba(0, 0, 0, 0.6);
        --ef-shadow-soft-premium: 0 14px 44px rgba(0, 0, 0, 0.3);
      }

      /* ---------- App backdrop ---------- */
      .studio-app.midnight,
      .studio-app.dark.midnight {
        background:
          radial-gradient(1100px 600px at 86% -12%, rgba(109, 93, 252, 0.2), transparent 60%),
          radial-gradient(820px 460px at 8% 4%, rgba(255, 95, 143, 0.07), transparent 58%),
          linear-gradient(180deg, #0b0d0f 0%, #090a0c 100%);
        color: var(--ef-text);
      }

      /* ---------- Top bar ---------- */
      .studio-app.midnight .topbar {
        height: 84px;
        border-bottom: 1px solid var(--ef-border);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
        backdrop-filter: blur(8px);
      }
      .studio-app.midnight .brand-title-line strong {
        background: var(--mid-grad);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .studio-app.midnight .brand-title-line b {
        background: rgba(109, 93, 252, 0.14);
        border: 1px solid rgba(109, 93, 252, 0.3);
        color: #b9b0ff;
        border-radius: 999px;
        padding: 1px 8px;
        font-size: 10px;
      }
      .studio-app.midnight .brand-mark {
        filter: drop-shadow(0 4px 14px rgba(109, 93, 252, 0.45));
      }

      /* ---------- Buttons ---------- */
      .studio-app.midnight .ghost-button {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--ef-border);
        color: var(--ef-text-soft);
        border-radius: 11px;
        font-weight: 500;
        transition: transform 0.14s ease, border-color 0.14s ease, background 0.14s ease, color 0.14s ease;
      }
      .studio-app.midnight .ghost-button:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--ef-border-strong);
        color: var(--ef-text);
        transform: translateY(-1px);
      }
      .studio-app.midnight .ghost-button:disabled {
        opacity: 0.4;
        transform: none;
      }
      .studio-app.midnight .ghost-button.accent-button,
      .studio-app.midnight .brand-share-button {
        background: var(--mid-grad);
        border: 0;
        color: #fff;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(109, 93, 252, 0.4);
      }
      .studio-app.midnight .ghost-button.accent-button:hover,
      .studio-app.midnight .brand-share-button:hover {
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 12px 32px rgba(109, 93, 252, 0.55);
      }

      /* ---------- Panels & cards ---------- */
      .studio-app.midnight .side-panel {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.012));
        border: 1px solid var(--ef-border);
        border-radius: 22px;
        box-shadow: var(--ef-shadow-panel);
      }
      .studio-app.midnight .control-card {
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid var(--ef-border);
        border-radius: 16px;
      }
      .studio-app.midnight .control-card:hover {
        border-color: rgba(255, 255, 255, 0.12);
      }

      /* ---------- Inputs ---------- */
      .studio-app.midnight input[type="text"],
      .studio-app.midnight input[type="number"],
      .studio-app.midnight input:not([type]),
      .studio-app.midnight .size-row input,
      .studio-app.midnight .url-import-row input {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid var(--ef-border);
        color: var(--ef-text);
        border-radius: 10px;
      }
      .studio-app.midnight input:focus {
        outline: none;
        border-color: var(--mid-accent);
        box-shadow: 0 0 0 3px rgba(109, 93, 252, 0.22);
      }

      /* ---------- Segmented / pill toggles ---------- */
      .studio-app.midnight .format-row button,
      .studio-app.midnight .preset-row button {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--ef-border);
        color: var(--ef-text-soft);
        border-radius: 10px;
        font-weight: 500;
      }
      .studio-app.midnight .format-row button:hover,
      .studio-app.midnight .preset-row button:hover {
        border-color: var(--ef-border-strong);
        color: var(--ef-text);
      }
      .studio-app.midnight .format-row button.active,
      .studio-app.midnight .preset-row button.active {
        background: var(--mid-grad);
        border-color: transparent;
        color: #fff;
        box-shadow: 0 6px 18px rgba(109, 93, 252, 0.4);
      }

      /* ---------- Sliders ---------- */
      .studio-app.midnight .slider input {
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--mid-accent), var(--mid-accent-2));
        appearance: none;
        -webkit-appearance: none;
      }
      .studio-app.midnight .slider input::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: #fff;
        border: 0;
        box-shadow: 0 0 0 4px rgba(109, 93, 252, 0.28), 0 2px 6px rgba(0, 0, 0, 0.5);
        transition: box-shadow 0.14s ease;
      }
      .studio-app.midnight .slider input::-webkit-slider-thumb:hover {
        box-shadow: 0 0 0 6px rgba(109, 93, 252, 0.34), 0 2px 8px rgba(0, 0, 0, 0.55);
      }
      .studio-app.midnight .slider input::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border: 0;
        border-radius: 999px;
        background: #fff;
        box-shadow: 0 0 0 4px rgba(109, 93, 252, 0.28);
      }
      .studio-app.midnight .slider-reset {
        color: var(--ef-text-faint);
        background: transparent;
        border: 0;
      }
      .studio-app.midnight .slider-reset:hover {
        color: var(--mid-accent-2);
      }

      /* ---------- Export hero card ---------- */
      .studio-app.midnight .export-card {
        background: var(--mid-grad);
        border: 0;
        color: #fff;
        border-radius: 16px;
        box-shadow: 0 16px 44px rgba(109, 93, 252, 0.42);
      }
      .studio-app.midnight .export-card small {
        color: rgba(255, 255, 255, 0.85);
      }
      .studio-app.midnight .export-progress-fill {
        background: rgba(255, 255, 255, 0.25);
      }

      /* ---------- Media drop ---------- */
      .studio-app.midnight .media-drop {
        background: rgba(255, 255, 255, 0.02);
        border: 1.5px dashed var(--ef-border-strong);
        border-radius: 16px;
      }
      .studio-app.midnight .media-drop:hover {
        border-color: var(--mid-accent);
        background: rgba(109, 93, 252, 0.06);
      }

      /* ---------- Canvas stage ---------- */
      .studio-app.midnight .canvas-shell {
        border: 1px solid var(--ef-border);
        border-radius: 26px;
        background:
          radial-gradient(120% 120% at 50% 0%, rgba(255, 255, 255, 0.04), transparent 60%),
          #0e1013;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 30px 90px rgba(0, 0, 0, 0.5);
      }

      /* ---------- Bottom action bar (floating glass) ---------- */
      .studio-app.midnight .bottom-action-bar {
        background: rgba(18, 20, 24, 0.8);
        border: 1px solid var(--ef-border);
        border-radius: 16px;
        backdrop-filter: blur(14px);
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
      }

      /* ---------- Profile ---------- */
      .studio-app.midnight .profile-button {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid var(--ef-border);
        border-radius: 999px;
      }
      .studio-app.midnight .profile-dropdown {
        background: var(--ef-surface-solid);
        border: 1px solid var(--ef-border);
        border-radius: 14px;
        box-shadow: var(--ef-shadow-elevated);
      }
      .studio-app.midnight .account-upgrade-button {
        background: var(--mid-grad);
        color: #fff;
        border-radius: 10px;
      }

      /* ---------- Section labels ---------- */
      .studio-app.midnight .panel-title,
      .studio-app.midnight .tool-section > button > span:first-child {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 11px;
        color: var(--ef-text-muted);
      }

      /* ---------- Thin scrollbars ---------- */
      .studio-app.midnight *::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .studio-app.midnight *::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.12);
        border-radius: 999px;
      }
      .studio-app.midnight *::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .studio-app.midnight *::-webkit-scrollbar-track {
        background: transparent;
      }
    `}</style>
  );
}
