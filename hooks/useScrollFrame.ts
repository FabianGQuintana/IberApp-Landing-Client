"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `onFrame` once per animation frame while the page scrolls or resizes (and once on mount).
 * The callback should write to the DOM through refs; it must not set React state every frame.
 */
export function useScrollFrame(onFrame: () => void) {
  const callback = useRef(onFrame);
  useEffect(() => {
    callback.current = onFrame;
  });

  useEffect(() => {
    let frame = 0;
    const run = () => {
      frame = 0;
      callback.current();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(run);
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
}

/** Progress of a tall section while its sticky content is pinned: 0 at its top, 1 at its bottom (v6 `secP`). */
export function sectionProgress(el: Element) {
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - window.innerHeight)));
}

/** Index of the last item whose top crossed the middle of the viewport (v6 `idx()` for fauna / frag). */
export function activeIndexAtMiddle(items: (Element | null)[]) {
  let active = 0;
  items.forEach((el, i) => {
    if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) active = i;
  });
  return active;
}
