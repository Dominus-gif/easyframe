import type { Metadata } from "next";
import EasyFrameHome from "@/components/EasyFrameHome";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://www.easyframe.app/"
  }
};

export default function Home() {
  return <EasyFrameHome />;
}
