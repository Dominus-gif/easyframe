import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);
const DEFAULT_SCREEN = { x: 7.2, y: 3.2, width: 85.6, height: 93.6, radius: 8 };

type MockupMetadata = {
  name?: string;
  frameWidth?: number;
  frameHeight?: number;
  screen?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    radius?: number;
  };
};

export const dynamic = "force-dynamic";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "mockups", "devices");

  try {
    const files = await readdir(dir, { withFileTypes: true });
    const imageFiles = files
      .filter((file) => file.isFile() && SUPPORTED.has(path.extname(file.name).toLowerCase()))
    const mockups = await Promise.all(imageFiles.map(async (file) => {
        const name = path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, " ");
        const metadata = await readMetadata(dir, file.name);
        const screen = normalizeScreen(metadata?.screen);
        return {
          id: file.name,
          name: metadata?.name ?? name.replace(/\b\w/g, (char) => char.toUpperCase()),
          url: `/mockups/devices/${file.name}`,
          frameWidth: metadata?.frameWidth,
          frameHeight: metadata?.frameHeight,
          screen
        };
      }));

    return NextResponse.json({ mockups });
  } catch {
    return NextResponse.json({ mockups: [] });
  }
}

async function readMetadata(dir: string, fileName: string) {
  const metadataPath = path.join(dir, `${path.basename(fileName, path.extname(fileName))}.json`);

  try {
    return JSON.parse(await readFile(metadataPath, "utf8")) as MockupMetadata;
  } catch {
    return null;
  }
}

function normalizeScreen(screen: MockupMetadata["screen"]) {
  return {
    x: clampPercent(screen?.x ?? DEFAULT_SCREEN.x),
    y: clampPercent(screen?.y ?? DEFAULT_SCREEN.y),
    width: clampPercent(screen?.width ?? DEFAULT_SCREEN.width),
    height: clampPercent(screen?.height ?? DEFAULT_SCREEN.height),
    radius: clampPercent(screen?.radius ?? DEFAULT_SCREEN.radius)
  };
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
