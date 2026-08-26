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
              max-width: 380px;
              margin-left: auto;
              display: flex;
              flex-direction: column;
              gap: 12px;
              padding: 18px 20px;
              border-radius: 16px;
              background: #ffffff;
              border: 1px solid #E6E6E6;
              box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
              color: #1b1b1b;
              font-family: "Inter", system-ui, sans-serif;
            }
            .cc p { margin: 0; font-size: 13.5px; line-height: 1.6; color: #4B617A; }
            .cc a { color: #6E41E2; }
            .cc-actions { display: flex; gap: 10px; justify-content: flex-end; }
            .cc-btn { height: 38px; padding: 0 18px; border-radius: 10px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
            .cc-decline { background: #fff; border: 1px solid #D2D2D2; color: #1b1b1b; }
            .cc-accept { background: #000; border: 0; color: #fff; border-radius: 30px; padding: 0 22px; }
            .cc-btn:focus-visible { outline: 2px solid #6E41E2; outline-offset: 2px; }
          `}</style>
        </div>
      ) : null}
    </>
  );
}
