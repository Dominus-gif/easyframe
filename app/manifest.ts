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
      {
        src: "/brand/favicon.svg",
        sizes: "64x64",
        type: "image/svg+xml"
      },
      {
        src: "/brand/easyframe-app-icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
