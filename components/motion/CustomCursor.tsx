"use client";

import { useEffect, useRef } from "react";

/**
 * Round "Ver" cursor from Ibera Landing v6 (`cursorRef`, `curEnter/Move/Leave`).
 * Any element with `data-cursor="<label>"` summons it; the label can change while hovering (gallery slides).
 * Only for fine pointers with hover and without reduced motion; touch and keyboard keep the native behavior.
 * Position eases toward the pointer (lerp .16) on rAF and is written straight to the DOM.
 */
export function CustomCursor() {
  const el = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = el.current;
    const text = label.current;
    if (!node || !text) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let on = false;
    let seen = false;
    let pressed = false;
    let frame = 0;

    const paint = () => {
      node.style.transform = `translate3d(${(x - 48).toFixed(1)}px,${(y - 48).toFixed(1)}px,0) scale(${on ? (pressed ? 0.9 : 1) : 0.5})`;
    };
    const loop = () => {
      frame = 0;
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      paint();
      if (on || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) frame = requestAnimationFrame(loop);
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const target = (e: Event) => (e.target instanceof Element ? e.target.closest<HTMLElement>("[data-cursor]") : null);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX;
      ty = e.clientY;
      const t = target(e);
      if (!t) {
        if (on) {
          on = false;
          node.style.opacity = "0";
          run();
        }
        return;
      }
      const next = t.dataset.cursor ?? "Ver";
      if (text.textContent !== next) text.textContent = next;
      if (!on) {
        on = true;
        if (!seen) {
          x = tx;
          y = ty;
          seen = true;
        }
        node.style.opacity = "1";
      }
      run();
    };
    const hide = () => {
      on = false;
      pressed = false;
      node.style.opacity = "0";
      run();
    };
    const down = () => {
      if (!on) return;
      pressed = true;
      run();
    };
    const up = () => {
      pressed = false;
      run();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    document.documentElement.dataset.customCursor = "on";
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      delete document.documentElement.dataset.customCursor;
    };
  }, []);

  return (
    <div
      ref={el}
      data-testid="custom-cursor"
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[95] flex h-24 w-24 items-center justify-center rounded-full bg-[rgba(238,242,238,.92)] text-[#002E1D] opacity-0 transition-opacity duration-300"
      style={{ transform: "translate3d(-200px,-200px,0) scale(.5)" }}
    >
      <span ref={label} className="eyebrow text-[12px] font-semibold leading-none tracking-[.08em]">
        Ver
      </span>
    </div>
  );
}
