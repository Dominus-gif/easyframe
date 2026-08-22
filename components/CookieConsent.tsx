"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { setConsent, useConsent } from "@/lib/consent";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

// Loads the AdSense script only after consent is granted, and shows a lightweight
// banner until the visitor chooses. No heavy CMP dependency.
export default function CookieConsent() {
  const consent = useConsent();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
        <div className="cc" role="dialog" aria-label="Cookie consent">
          <p>
            We use cookies for analytics and to show ads that keep EasyFrame free. Your images are always
            processed in your browser and never uploaded. See our <a href="/privacy">Privacy Policy</a>.
          </p>
          <div className="cc-actions">
            <button className="cc-btn cc-decline" onClick={() => setConsent("denied")}>Decline</button>
            <button className="cc-btn cc-accept" onClick={() => setConsent("granted")}>Accept</button>
          </div>
          <style jsx>{`
            .cc {
              position: fixed;
              left: 16px;
              right: 16px;
              bottom: 16px;
              z-index: 200;
              max-width: 560px;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 12px;
              padding: 18px 20px;
              border-radius: 16px;
              background: rgba(18, 20, 24, 0.96);
              border: 1px solid rgba(255, 255, 255, 0.12);
              box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
              backdrop-filter: blur(10px);
              color: #f4f5f7;
              font-family: var(--font-sans);
            }
            .cc p { margin: 0; font-size: 13.5px; line-height: 1.6; color: rgba(244, 245, 247, 0.82); }
            .cc a { color: #b9b0ff; }
            .cc-actions { display: flex; gap: 10px; justify-content: flex-end; }
            .cc-btn { height: 38px; padding: 0 18px; border-radius: 10px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
            .cc-decline { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14); color: #f4f5f7; }
            .cc-accept { background: linear-gradient(135deg, #6d5dfc, #ff5f8f); border: 0; color: #fff; }
            .cc-btn:focus-visible { outline: 2px solid #8b8cf6; outline-offset: 2px; }
          `}</style>
        </div>
      ) : null}
    </>
  );
}
