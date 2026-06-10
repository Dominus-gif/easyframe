import type { Metadata } from "next";
import { AppAnalytics } from "@/components/AppAnalytics";
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
      <body>
        <Providers>{children}</Providers>
        <AppAnalytics />
      </body>
    </html>
  );
}
