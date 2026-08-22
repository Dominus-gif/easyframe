import type { Metadata } from "next";
import CategoryView from "@/components/site/CategoryView";

export const metadata: Metadata = {
  title: "Free Tablet Mockup Generators — iPad & Android | EasyFrame",
  description: "Showcase tablet apps and responsive layouts in iPad and Android tablet mockups — free, browser-based, no account.",
  alternates: { canonical: "https://www.easyframe.app/tablet-mockups" }
};

export default function Page() {
  return <CategoryView slug="tablet-mockups" />;
}
