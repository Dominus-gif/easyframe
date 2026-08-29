"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { setConsent, useConsent } from "@/lib/consent";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

// Loads the AdSense script only after consent is granted, and shows a lightweight
// banner until the visitor chooses. No heavy CMP dependency.
export default function CookieConsent() {
  const consent = useConsent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const ccRef = useRef<HTMLDivElement>(null);

  // While the banner is visible, reserve its height at the bottom of the page so it
  // never floats over primary content (pricing CTAs) or the fixed full-screen editor.
  useEffect(() => {
    if (!(mounted && consent === null)) return;
    const apply = () => {
      const h = ccRef.current?.offsetHeight ?? 64;
      document.documentElement.style.setProperty("--cc-h", `${h}px`);
      document.body.style.paddingBottom = `${h}px`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--cc-h");
      document.body.style.paddingBottom = "";
    };
  }, [mounted, consent]);

  if (!mounted) return null; // avoid SSR/client hydration mismatch on localStorage

  return (
    <>
      {consent === "granted" && CLIENT ? (
        <Script
          id="adsbygoogle-init"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
        />
      ) : null}

      {consent === null ? (
        <div className="cc" role="dialog" aria-label="Cookie consent" ref={ccRef}>
          <p>
            We use cookies for analytics and to show ads that keep EasyFrame free. Your images are always
            processed in your browser and never uploaded. See our <a href="/privacy">Privacy Policy</a>.
          </p>
          <div className="cc-actions">
            <button className="cc-btn cc-decline" onClick={() => setConsent("denied")}>Decline</button>
            <button className="cc-btn cc-accept" onClick={() => setConsent("granted")}>Accept</button>
          </div>
          <style jsx>{`
            /* Dark by default — the whole site is dark (supercut). */
            .cc {
              position: fixed;
              left: 0;
              right: 0;
              bottom: 0;
              z-index: 200;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              align-items: center;
              justify-content: center;
              gap: 14px 20px;
              padding: 12px 24px;
              background: #181616;
              border-top: 1px solid #262323;
              box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.5);
              color: #FDFFF0;
              font-family: "Inter", system-ui, sans-serif;
            }
            .cc p { margin: 0; font-size: 13px; line-height: 1.5; color: #969692; max-width: 760px; }
            .cc a { color: #FF6B9D; text-decoration: underline; }
            .cc-actions { display: flex; gap: 10px; flex: none; }
            .cc-btn { height: 38px; padding: 0 18px; border-radius: 999px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
            .cc-decline { background: transparent; border: 1px solid #2C2828; color: #FDFFF0; }
            .cc-decline:hover { border-color: #4A4444; }
            .cc-accept { background: #FDFFF0; border: 0; color: #100E0E; padding: 0 22px; }
            .cc-accept:hover { background: #fff; }
            /* Light variant — only when the editor is explicitly toggled to light. */
            :global(html[data-editor-theme="light"]) .cc { background: #fafafb; border-top-color: rgba(0,0,0,.10); box-shadow: 0 -6px 24px rgba(0,0,0,.10); color: #28282c; }
            :global(html[data-editor-theme="light"]) .cc p { color: #40404a; }
            :global(html[data-editor-theme="light"]) .cc a { color: #6E41E2; }
            :global(html[data-editor-theme="light"]) .cc-decline { background: #fff; border-color: rgba(0,0,0,.12); color: #28282c; }
            :global(html[data-editor-theme="light"]) .cc-decline:hover { border-color: rgba(0,0,0,.28); }
            :global(html[data-editor-theme="light"]) .cc-accept { background: #6E41E2; color: #fff; }
            .cc-btn:focus-visible { outline: 2px solid #FF0055; outline-offset: 2px; }
          `}</style>
        </div>
      ) : null}
    </>
  );
}
