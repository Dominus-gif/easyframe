import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

const fontExtensions = new Set([".ttf", ".otf", ".woff", ".woff2"]);

export const dynamic = "force-dynamic";

export async function GET() {
  const fontDir = path.join(process.cwd(), "public", "fonts");

  try {
    const entries = await readdir(fontDir, { withFileTypes: true });
    const fonts = entries
      .filter((entry) => entry.isFile())
      .filter((entry) => fontExtensions.has(path.extname(entry.name).toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((entry) => {
        const basename = path.basename(entry.name, path.extname(entry.name));
        const label = basename
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
        const family = `EasyFrame ${basename.replace(/[^a-zA-Z0-9]+/g, " ").trim()}`;

        return {
          label,
          family,
          url: `/fonts/${encodeURIComponent(entry.name)}`
        };
      });

    return NextResponse.json({ fonts });
  } catch {
    return NextResponse.json({ fonts: [] });
  }
}
