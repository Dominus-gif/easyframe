import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function normalize(value?: string) {
  if (!value) return "";

  let normalized = value.trim();
  if (normalized.startsWith("DATABASE_URL=")) {
    normalized = normalized.slice("DATABASE_URL=".length).trim();
  }
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function GET() {
  const databaseUrl = normalize(process.env.DATABASE_URL);

  return NextResponse.json({
    databaseUrl: {
      exists: Boolean(process.env.DATABASE_URL),
      startsWithPostgres: databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://"),
      host: safeHost(databaseUrl),
      hasCommonPastePrefix: process.env.DATABASE_URL?.trim().startsWith("DATABASE_URL=") ?? false,
      hasWrappingQuotes:
        Boolean(process.env.DATABASE_URL?.trim().startsWith('"') && process.env.DATABASE_URL?.trim().endsWith('"')) ||
        Boolean(process.env.DATABASE_URL?.trim().startsWith("'") && process.env.DATABASE_URL?.trim().endsWith("'"))
    },
    supabase: {
      hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }
  });
}
