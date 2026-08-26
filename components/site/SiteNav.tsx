"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

const LINKS = [
  { href: "/editor", label: "Editor" },
  { href: "/templates", label: "Templates" },
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
          EasyFrame<b>.</b>
        </Link>
        <div className="mk-nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </div>
        <div className="mk-nav-cta">
          <Link href="/editor" className="mk-cta">
            Open free editor <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
