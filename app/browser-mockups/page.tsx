import type { Metadata } from "next";
import CategoryView from "@/components/site/CategoryView";

export const metadata: Metadata = {
  title: "Free Browser Mockup Generators | EasyFrame",
  description: "Wrap web pages and screenshots in a clean browser window frame — free, no sign-up, no watermark.",
  alternates: { canonical: "https://www.easyframe.app/browser-mockups" }
};

export default function Page() {
  return <CategoryView slug="browser-mockups" />;
}
