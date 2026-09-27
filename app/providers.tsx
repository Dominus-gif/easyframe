"use client";

// Auth state now lives in Supabase cookies (see lib/auth/client.ts), so no
// context provider is needed. Kept as a seam for future app-wide providers.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
