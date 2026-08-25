"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const KEY = "ef-annc-4k";

export default function AnnouncementBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      setShow(localStorage.getItem(KEY) !== "dismissed");
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="sx-annc">
      <span>
        <b>New</b> · Premium now includes 4K exports &amp; transparent PNGs
        <Link href="/pricing">See what&apos;s new →</Link>
      </span>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(KEY, "dismissed");
          } catch {
            /* ignore */
          }
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
