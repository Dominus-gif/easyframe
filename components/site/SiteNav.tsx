"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AccountLink from "@/components/auth/AccountLink";
import UpgradeStar from "@/components/auth/UpgradeStar";

const LINKS = [
  { href: "/editor", label: "Editor" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" }
];

/** Shared marketing nav — highlights the current page. */
export default function SiteNav() {
  const pathname = usePathname() || "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="mk-nav" aria-label="Primary">
      <div className="mk-wrap mk-nav-inner">
        <Link href="/" className="mk-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="EasyFrame" width={900} height={92} />
        </Link>
        <div className="mk-nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mk-nav-cta">
          <UpgradeStar />
          <AccountLink className="mk-account" />
          <Link href="/editor" className="mk-cta">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
