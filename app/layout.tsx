import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
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
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
