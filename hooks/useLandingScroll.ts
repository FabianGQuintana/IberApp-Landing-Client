"use client";

import { useEffect, useState } from "react";
import { NAV_LINKS, SECTION_IDS } from "@/lib/data/copy";

export type Tone = "photo" | "surface";

export interface LandingScrollState {
  /** Page scrolled past 40 px: the header turns into glass */
  scrolled: boolean;
  /** Tone of the section under the header (v6: `data-tone`), drives header colors */
  tone: Tone;
  /** Index in NAV_LINKS of the section being read, or -1 */
  activeNav: number;
  /** Whether the floating "Caminos hoy" band is shown */
  bandVisible: boolean;
}

const HEADER_PROBE_Y = 38; // v6 samples the tone 38 px from the top

function compute(): LandingScrollState {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const rect = (id: string) => document.getElementById(id)?.getBoundingClientRect();

  let tone: Tone = "photo";
  document.querySelectorAll<HTMLElement>("[data-tone]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top <= HEADER_PROBE_Y && r.bottom > HEADER_PROBE_Y) tone = el.dataset.tone === "surface" ? "surface" : "photo";
  });

  let activeNav = -1;
  NAV_LINKS.forEach((link, i) => {
    const r = rect(link.target);
    if (r && r.top < vh * 0.4) activeNav = i;
  });
  const end = rect(SECTION_IDS.future);
  if (activeNav === NAV_LINKS.length - 1 && end && end.top < vh * 0.4) activeNav = -1;

  // v6 hides the band on top of the page, over Territorio and Caminos, and near the end (v6: Reportar, now Futuro).
  const roads = rect(SECTION_IDS.roads);
  const territory = rect(SECTION_IDS.territory);
  let hide = true;
  if (roads && end) {
    hide =
      (roads.top < vh && roads.bottom > 0) ||
      end.top < vh * 0.8 ||
      y < vh * 1.5 ||
      (!!territory && territory.bottom > vh * 0.5 && territory.top < vh);
  }

  return { scrolled: y > 40, tone, activeNav, bandVisible: !hide };
}

const same = (a: LandingScrollState, b: LandingScrollState) =>
  a.scrolled === b.scrolled && a.tone === b.tone && a.activeNav === b.activeNav && a.bandVisible === b.bandVisible;

/**
 * Scroll-derived chrome state (header glass, tone, active link, band).
 * One passive listener throttled with requestAnimationFrame; React state only changes when a value changes.
 */
export function useLandingScroll(): LandingScrollState {
  const [state, setState] = useState<LandingScrollState>({ scrolled: false, tone: "photo", activeNav: -1, bandVisible: false });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = compute();
      setState((prev) => (same(prev, next) ? prev : next));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return state;
}
