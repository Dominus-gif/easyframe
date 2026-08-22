import type { MetadataRoute } from "next";
import { devices } from "@/lib/editor/devices";
import { categories } from "@/lib/site";

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
    entry("/templates", 0.9, "weekly"),
    ...devices.map((d) => entry(`/templates/${d.slug}`, 0.8, "monthly")),
    ...categories.map((c) => entry(`/${c.slug}`, 0.7, "monthly")),
    entry("/pricing", 0.6, "monthly"),
    entry("/terms", 0.3, "yearly"),
    entry("/privacy", 0.3, "yearly")
  ];
}
