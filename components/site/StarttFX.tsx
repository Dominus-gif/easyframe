"use client";

import { useEffect } from "react";

/**
 * Homepage motion:
 *  - Staggered entrance reveals for [data-reveal] (variants handled in CSS:
 *    up | left | right | scale | blur | rise).
 *  - Scroll-linked parallax: [data-par] drifts on the Y axis via a --parY var
 *    (transform), [data-bgpar] drifts its background-position-y (%). Both are
 *    rAF-throttled and transform/paint-only, so they stay smooth.
 *  - Nav hairline once the page is scrolled.
 * Fully disabled under prefers-reduced-motion.
 */
export default function StarttFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = document.querySelector<HTMLElement>(".sx-nav, .bx-nav");
    const onNav = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onNav, { passive: true });
    onNav();

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduce) {
      els.forEach((el) => el.classList.add("in"));
      return () => window.removeEventListener("scroll", onNav);
    }

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
    const fallback = window.setTimeout(() => els.forEach((el) => el.classList.add("in")), 1800);

    // Parallax layers.
    const drift = Array.from(document.querySelectorAll<HTMLElement>("[data-par]"));
    const bgDrift = Array.from(document.querySelectorAll<HTMLElement>("[data-bgpar]"));
    let ticking = false;

    const update = () => {
      ticking = false;
      const vh = window.innerHeight || 1;
      for (const el of drift) {
        const r = el.getBoundingClientRect();
        // -1 (element bottom-aligned near top) .. +1 (near bottom); 0 at center.
        const prog = (r.top + r.height / 2 - vh / 2) / vh;
        const speed = parseFloat(el.dataset.par || "0");
        el.style.setProperty("--parY", `${(prog * speed).toFixed(1)}px`);
      }
      for (const el of bgDrift) {
        const r = el.getBoundingClientRect();
        // Clamp so an off-screen element never pushes the background to an edge.
        const prog = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / vh));
        const speed = parseFloat(el.dataset.bgpar || "0");
        el.style.backgroundPositionY = `${(50 + prog * speed).toFixed(1)}%`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    if (drift.length || bgDrift.length) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      update();
    }

    return () => {
      window.removeEventListener("scroll", onNav);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, []);

  return null;
}
