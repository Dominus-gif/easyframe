import { readdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

type InferredMockup = {
  kind: string;
  frameWidth?: number;
  frameHeight?: number;
  screen: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
  };
};

export const dynamic = "force-dynamic";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "mockups", "devices");

  try {
    const files = await readdir(dir, { withFileTypes: true });
    const imageFiles = files
      .filter((file) => file.isFile() && SUPPORTED.has(path.extname(file.name).toLowerCase()));
    const mockups = imageFiles.map((file) => {
        const name = path.basename(file.name, path.extname(file.name)).replace(/[-_]+/g, " ");
        const inferred = inferMockupFromName(file.name);

        return {
          id: file.name,
          name: name.replace(/\b\w/g, (char) => char.toUpperCase()),
          url: `/mockups/devices/${file.name}`,
          frameWidth: inferred.frameWidth,
          frameHeight: inferred.frameHeight,
          screen: inferred.screen,
          kind: inferred.kind
        };
      });

    return NextResponse.json({ mockups });
  } catch {
    return NextResponse.json({ mockups: [] });
  }
}

function inferMockupFromName(fileName: string): InferredMockup {
  const id = path.basename(fileName, path.extname(fileName)).toLowerCase();

  if (id.includes("macbook") || id.includes("laptop")) {
    return {
      kind: "laptop",
      frameWidth: 1440,
      frameHeight: 900,
      screen: { x: 10.5, y: 7.8, width: 79, height: 78, radius: 1.8 }
    };
  }

  if (id.includes("ipad") || id.includes("tablet")) {
    return {
      kind: "tablet",
      frameWidth: 820,
      frameHeight: 1080,
      screen: { x: 7.4, y: 5.8, width: 85.2, height: 88.4, radius: 4.8 }
    };
  }

  if (id.includes("browser") || id.includes("window")) {
    return {
      kind: "browser",
      frameWidth: 1440,
      frameHeight: 900,
      screen: { x: 3.2, y: 10.5, width: 93.6, height: 86.3, radius: 1.6 }
    };
  }

  if (id.includes("pixel") || id.includes("android")) {
    return {
      kind: "phone",
      frameWidth: 412,
      frameHeight: 915,
      screen: { x: 6.9, y: 2.9, width: 86.2, height: 94.2, radius: 7.2 }
    };
  }

  return {
    kind: "phone",
    frameWidth: 393,
    frameHeight: 852,
    screen: { x: 7.2, y: 3.2, width: 85.6, height: 93.6, radius: 8 }
  };
}
