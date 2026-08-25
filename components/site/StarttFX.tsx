"use client";

import { useEffect } from "react";

/** Scroll reveals (fade-up, staggered) + nav hairline on scroll. Reduced-motion safe. */
export default function StarttFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    let fallback = 0;

    if (reduce) {
      els.forEach((el) => el.classList.add("in"));
    } else {
      document.documentElement.classList.add("sx-reveal-ready");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      els.forEach((el) => io.observe(el));
      fallback = window.setTimeout(() => els.forEach((el) => el.classList.add("in")), 1600);
    }

    const nav = document.querySelector<HTMLElement>(".sx-nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (fallback) window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
