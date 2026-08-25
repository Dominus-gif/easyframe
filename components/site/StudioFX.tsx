"use client";

import { useEffect } from "react";

export default function StudioFX() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let fallback = 0;

    // Scroll reveals (fail-safe: only hide once JS runs).
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduce) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      root.classList.add("st-reveal-ready");
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
      revealEls.forEach((el) => io.observe(el));
      // Fail-safe: if IntersectionObserver never fires (e.g. background tab),
      // reveal everything so the page can never be left invisible.
      fallback = window.setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 1600);
    }

    // Nav: gains a solid background after scrolling past the hero fold.
    const nav = document.querySelector<HTMLElement>(".st-nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Cursor glow inside the hero only (skipped on touch / reduced-motion).
    const hero = document.querySelector<HTMLElement>(".st-hero");
    let onMove: ((e: PointerEvent) => void) | null = null;
    if (hero && !reduce && !window.matchMedia("(pointer: coarse)").matches) {
      onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
        hero.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      hero.addEventListener("pointermove", onMove);
    }

    // Interactive gradient card: click a swatch → the card background animates to it.
    const onClick = (e: Event) => {
      const sw = (e.target as HTMLElement).closest<HTMLElement>("[data-grad]");
      if (!sw) return;
      const card = sw.closest<HTMLElement>(".st-gradcard");
      if (card) {
        card.style.setProperty("--grad-bg", sw.dataset.grad ?? "");
        card.querySelectorAll("[data-grad]").forEach((s) => s.classList.remove("on"));
        sw.classList.add("on");
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (hero && onMove) hero.removeEventListener("pointermove", onMove);
      document.removeEventListener("click", onClick);
      if (fallback) window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
