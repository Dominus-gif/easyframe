"use client";

import { useEffect } from "react";

/**
 * Lightweight, dependency-free motion:
 *  - staggered fade-up for any [data-reveal] element (IntersectionObserver)
 *  - gentle scroll parallax/tilt (max 3deg) for [data-parallax]
 * Fully disabled under prefers-reduced-motion.
 */
export default function SiteMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      revealEls.forEach((el) => el.classList.add("is-in"));
      return;
    }

    // Opt in to the hidden state only now that JS is running (page stays visible without JS).
    document.documentElement.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));

    const hero = document.querySelector<HTMLElement>("[data-parallax]");
    let raf = 0;
    const onScroll = () => {
      if (raf || !hero) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = hero.getBoundingClientRect();
        const vh = window.innerHeight || 1;
        const p = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - vh / 2) / (vh / 2)));
        hero.style.setProperty("--tilt", `${(-p * 3).toFixed(2)}deg`);
        hero.style.setProperty("--pty", `${(p * 12).toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
