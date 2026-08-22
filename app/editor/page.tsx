import type { Metadata } from "next";
import EditorClient from "@/components/editor/EditorClient";

export const metadata: Metadata = {
  title: "Free Mockup Generator — EasyFrame",
  description:
    "Create device mockups for free in your browser. Upload a screenshot, frame it in an iPhone, iPad, MacBook, tablet, browser, or watch, and download in seconds. No sign-up, no watermark.",
  alternates: { canonical: "https://www.easyframe.app/editor" },
  openGraph: {
    title: "Free Mockup Generator — EasyFrame",
    description: "Frame any screenshot in a device mockup and download for free. No account needed.",
    url: "https://www.easyframe.app/editor"
  }
};

export default function EditorPage({ searchParams }: { searchParams?: { device?: string } }) {
  return <EditorClient initialDevice={searchParams?.device} />;
}
