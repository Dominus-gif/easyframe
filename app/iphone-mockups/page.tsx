import type { Metadata } from "next";
import CategoryView from "@/components/site/CategoryView";

export const metadata: Metadata = {
  title: "Free iPhone Mockup Generators | EasyFrame",
  description: "Frame mobile screenshots and app screens in clean iPhone mockups — free, in your browser, no account or watermark.",
  alternates: { canonical: "https://www.easyframe.app/iphone-mockups" }
};

export default function Page() {
  return <CategoryView slug="iphone-mockups" />;
}
