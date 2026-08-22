"use client";

import dynamic from "next/dynamic";

// Code-split the canvas engine so the editor route ships lean initial JS and the
// heavy compositing code loads client-side only (no SSR of the canvas).
const CanvasEditor = dynamic(() => import("@/components/editor/CanvasEditor"), {
  ssr: false,
  loading: () => (
    <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "#0b0d0f", color: "#8a8f98", fontFamily: "Inter, system-ui, sans-serif" }}>
      Loading editor…
    </div>
  )
});

export default function EditorClient({ initialDevice }: { initialDevice?: string }) {
  return <CanvasEditor initialDevice={initialDevice} />;
}
