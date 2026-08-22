import { ImageResponse } from "next/og";
import { devices } from "@/lib/editor/devices";

export const runtime = "edge";

export const alt = "EasyFrame device mockup generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return devices.map((d) => ({ slug: d.slug }));
}

export default function OgImage({ params }: { params: { slug: string } }) {
  const device = devices.find((d) => d.slug === params.slug);
  const title = device?.seoTitle ?? "Free Device Mockup Generator";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #0b0d0f 0%, #171029 55%, #2a1030 100%)",
          color: "#f4f5f7",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>
          EasyFrame
          <span style={{ marginLeft: 8, color: "#ff5f8f" }}>.</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", maxWidth: 980 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, color: "#b7bcc6", marginTop: 20 }}>
            Free · no account · nothing uploaded · easyframe.app
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "14px 26px",
            borderRadius: 999,
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(135deg, #6d5dfc, #ff5f8f)"
          }}
        >
          Open the free editor →
        </div>
      </div>
    ),
    size
  );
}
