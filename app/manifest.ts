import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EasyFrame",
    short_name: "EasyFrame",
    description: "Create polished screenshot mockups and image presentations.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#4F46E5",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
