import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyFrame - Beautiful screenshot mockups",
  description: "Turn Images into polished mockups for social, websites, and product launches."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
