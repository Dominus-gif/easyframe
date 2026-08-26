import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "EasyFrame Mockup Editor";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "#ffffff",
          color: "#000000",
          fontFamily: "sans-serif"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}>EasyFrame</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.02, letterSpacing: "-0.03em", maxWidth: 1000 }}>
            The free device mockup editor.
          </div>
          <div style={{ fontSize: 30, color: "#4B617A", marginTop: 24 }}>
            Drop a screenshot, pick a device, export — in your browser · easyframe.app
          </div>
        </div>
        <div style={{ display: "flex", alignSelf: "flex-start", padding: "14px 28px", borderRadius: 999, fontSize: 26, fontWeight: 600, color: "#fff", background: "#000" }}>
          Open the editor →
        </div>
      </div>
    ),
    size
  );
}
