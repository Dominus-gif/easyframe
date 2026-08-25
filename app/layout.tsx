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
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
    apple: "/brand/easyframe-app-icon.svg"
  },
  openGraph: {
    title: "EasyFrame - Create polished visuals",
    description: "Turn Images into polished mockups for social, websites, and product launches.",
    images: ["/brand/easyframe-app-icon.svg"]
  },
  other: {
    "scrolllaunch-verify": "c0a0bc9f16b0312c060ca0b5a42c1bdf"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400..600&family=Inter:wght@400;500;600&display=swap"
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
