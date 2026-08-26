import { ImageResponse } from "next/og";
import { posts, postBySlug } from "@/lib/blog";

export const runtime = "edge";

export const alt = "EasyFrame blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function OgImage({ params }: { params: { slug: string } }) {
  const post = postBySlug(params.slug);
  const title = post?.title ?? "EasyFrame blog";
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
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 700 }}>EasyFrame · Blog</div>
        <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.06, letterSpacing: "-0.03em", maxWidth: 1040 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, color: "#4B617A" }}>Free device mockups, in your browser · easyframe.app</div>
      </div>
    ),
    size
  );
}
