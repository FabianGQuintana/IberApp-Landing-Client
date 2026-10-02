"use client";

import { useScrollFrame } from "@/hooks/useScrollFrame";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
/** 0 when the element's top enters the viewport bottom, 1 when its bottom leaves the top (v6 `viewP`) */
const viewProgress = (el: Element, vh: number) => {
  const r = el.getBoundingClientRect();
  return clamp((vh - r.top) / (vh + r.height), 0, 1);
};

/**
 * Scroll choreography from Ibera Landing v6 `update()`, driven by data attributes so the sections stay Server Components:
 *   data-hero-img / data-hero-txt / data-hero-meta  hero parallax and fade
 *   data-par="<amp>"                                image drifts inside its parent while it crosses the viewport
 *   data-drift="<factor>"                           element trails the scroll relative to its parent's center
 *   data-reveal (+ data-reveal-img)                 clip-path opens as the block enters; the photo settles
 *   data-heal / data-outro                          grayscale → color as the closing section arrives; fade to night at its end
 * One passive listener, one rAF per frame, styles written straight to the DOM (never React state).
 * Off-screen elements are skipped, so the cost scales with what is visible.
 * With prefers-reduced-motion only the static end states apply.
 */
export function ScrollMotion() {
  useScrollFrame(() => {
    const vh = window.innerHeight;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = <T extends HTMLElement>(s: string) => document.querySelector<T>(s);

    if (reduce) {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => (el.style.clipPath = "none"));
      document.querySelectorAll<HTMLElement>("[data-heal]").forEach((el) => (el.style.filter = "none"));
      return;
    }

    // Hero: the photo sinks and settles, the title block rises and fades (cheap: three writes per frame).
    const hp = clamp(window.scrollY / vh, 0, 1);
    const img = q("[data-hero-img]");
    if (img) img.style.transform = `translate3d(0,${(hp * 4).toFixed(2)}%,0) scale(${(1.08 - hp * 0.08).toFixed(4)})`;
    const txt = q("[data-hero-txt]");
    if (txt) {
      txt.style.transform = `translate3d(0,${(-hp * 70).toFixed(1)}px,0)`;
      txt.style.opacity = String(clamp(1 - hp * 1.4, 0, 1));
    }
    const meta = q("[data-hero-meta]");
    if (meta) meta.style.transform = `translate3d(0,${(-hp * 50).toFixed(1)}px,0)`;

    document.querySelectorAll<HTMLElement>("[data-par]").forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) return;
      const p = viewProgress(parent, vh);
      const amp = Number(el.dataset.par) || 4;
      el.style.transform = `translate3d(0,${((-1 + 2 * p) * amp).toFixed(2)}%,0) scale(${(1.06 - p * 0.04).toFixed(4)})`;
    });

    document.querySelectorAll<HTMLElement>("[data-drift]").forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
      const f = Number(el.dataset.drift) || 0;
      el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) * f).toFixed(1)}px,0)`;
    });

    // Clip-path reveal: the block grows from an inset frame to full bleed (ease-out quad).
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh * 1.2) return;
      const p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
      const e = 1 - Math.pow(1 - p, 2);
      el.style.clipPath = `inset(${((1 - e) * 10).toFixed(2)}% ${((1 - e) * 8).toFixed(2)}% round 2px)`;
      const img = el.querySelector<HTMLElement>("[data-reveal-img]");
      if (img) img.style.transform = `translate3d(0,${(-4 + viewProgress(el, vh) * 8).toFixed(2)}%,0) scale(${(1.08 - e * 0.08).toFixed(4)})`;
    });

    // "Sanación": the closing photo regains color and light as its section arrives (progress follows the
    // section, because the photo itself is pinned inside it) and, at the very end, the stage fades into the footer's night.
    const heal = q("[data-heal]");
    const closing = heal?.closest("section");
    if (heal && closing) {
      const r = closing.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 1.5) {
        const p = clamp((vh - r.top) / (vh * 1.1), 0, 1);
        const settle = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
        heal.style.filter = `grayscale(${(1 - p).toFixed(3)}) brightness(${(0.55 + p * 0.45).toFixed(3)})`;
        heal.style.transform = `translate3d(0,${(-3 + p * 6).toFixed(2)}%,0) scale(${(1.06 - p * 0.06 + settle * 0.05).toFixed(4)})`;
        const outro = q("[data-outro]");
        if (outro) outro.style.opacity = clamp((settle - 0.55) / 0.45, 0, 1).toFixed(3);
      }
    }
  });

  return null;
}
