import type { MetadataRoute } from "next";
import { categories } from "@/lib/site";
import { posts } from "@/lib/blog";

const baseUrl = "https://www.easyframe.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency,
    priority
  });

  return [
    entry("", 1, "weekly"),
    entry("/editor", 0.95, "weekly"),
    ...categories.map((c) => entry(`/${c.slug}`, 0.7, "monthly")),
    entry("/blog", 0.7, "weekly"),
    ...posts.map((p) => entry(`/blog/${p.slug}`, 0.6, "monthly")),
    entry("/pricing", 0.6, "monthly"),
    entry("/contact", 0.4, "yearly"),
    entry("/terms", 0.3, "yearly"),
    entry("/privacy", 0.3, "yearly")
  ];
}
