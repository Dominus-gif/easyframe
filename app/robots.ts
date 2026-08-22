import type { MetadataRoute } from "next";

const baseUrl = "https://www.easyframe.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/editor", "/templates", "/iphone-mockups", "/laptop-mockups", "/tablet-mockups", "/browser-mockups", "/blog", "/pricing", "/terms", "/privacy"],
        disallow: ["/api/", "/auth/", "/billing/", "/studio"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
