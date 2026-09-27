"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { useAppSession } from "@/lib/auth/client";

/** "Sign in" for visitors, "Account" once signed in. Returns you here after signing in. */
export default function AccountLink({ className, icon = false }: { className?: string; icon?: boolean }) {
  const { status } = useAppSession();
  const pathname = usePathname() || "/";
  const signedIn = status === "authenticated";
  const href = signedIn ? "/account" : `/login?next=${encodeURIComponent(pathname)}`;
  const label = signedIn ? "Account" : "Sign in";

  return (
    <Link
      href={href}
      className={className}
      aria-label={label}
      title={label}
      // Avoid a flash of the wrong label while the session loads.
      style={status === "loading" ? { visibility: "hidden" } : undefined}
    >
      {icon ? <UserRound size={16} /> : null}
      {icon ? <span className="sr-only">{label}</span> : label}
    </Link>
  );
}
