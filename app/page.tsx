import type { Metadata } from "next";
import StarttLanding from "@/components/site/StarttLanding";

export const metadata: Metadata = {
  title: "EasyFrame — Free Device Mockup Generator",
  description:
    "Free device mockup generator. Frame screenshots in iPhone, iPad, MacBook, tablet, browser, and watch mockups right in your browser — no account, no watermark, nothing uploaded.",
  alternates: { canonical: "https://www.easyframe.app/" },
  openGraph: {
    title: "EasyFrame — Free Device Mockup Generator",
    description: "Frame any screenshot in a device mockup and download for free. No account needed.",
    url: "https://www.easyframe.app/",
    type: "website"
  }
};

export default function Home() {
  return <StarttLanding />;
}
