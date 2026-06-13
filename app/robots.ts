import type { MetadataRoute } from "next";

const baseUrl = "https://www.easyframe.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/Terms", "/Privacy"],
        disallow: ["/api/", "/auth/", "/billing/", "/studio"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
