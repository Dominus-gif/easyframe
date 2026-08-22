import type { Metadata } from "next";
import CategoryView from "@/components/site/CategoryView";

export const metadata: Metadata = {
  title: "Free Laptop & MacBook Mockup Generators | EasyFrame",
  description: "Present websites, web apps, and desktop designs in sleek laptop mockups — free, in your browser, no watermark.",
  alternates: { canonical: "https://www.easyframe.app/laptop-mockups" }
};

export default function Page() {
  return <CategoryView slug="laptop-mockups" />;
}
