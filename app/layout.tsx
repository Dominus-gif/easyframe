import type { Metadata } from "next";
import { AppAnalytics } from "@/components/AppAnalytics";
import CookieConsent from "@/components/CookieConsent";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.easyframe.app"),
  title: "EasyFrame - Create polished visuals",
  description: "Turn Images into polished mockups for social, websites, and product launches.",
  icons: {
    icon: [
      { url: "/brand/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    shortcut: "/brand/icon-32.png",
    apple: "/brand/apple-touch-icon.png"
  },
  openGraph: {
    title: "EasyFrame - Create polished visuals",
    description: "Turn Images into polished mockups for social, websites, and product launches.",
    images: ["/og/default.png"]
  },
  other: {
    "scrolllaunch-verify": "c0a0bc9f16b0312c060ca0b5a42c1bdf"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&family=Caveat:wght@500;600&family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <AppAnalytics />
        <CookieConsent />
      </body>
    </html>
  );
}
