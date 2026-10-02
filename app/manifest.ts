import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EasyFrame",
    short_name: "EasyFrame",
    description: "Create polished screenshot mockups and image presentations.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F8F8",
    theme_color: "#FE6902",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
