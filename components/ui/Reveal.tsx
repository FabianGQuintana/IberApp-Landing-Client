"use client";

import { Children, useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Reveal each child as a line that slides up (v6 `data-lines` / `data-line`), staggered 0.12 s. */
  lines?: boolean;
}

/**
 * Scroll reveal from Ibera Landing v6 (`data-rv`, `data-lines`).
 * Elements already in view on load stay visible; the rest fade/slide in once.
 * Styles are written through refs, so scrolling never triggers React renders.
 */
export function Reveal({ children, as: Tag = "div", className = "", lines = false }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    const targets = lines ? Array.from(el.querySelectorAll<HTMLElement>("[data-line]")) : [el];
    targets.forEach((t, i) => {
      if (lines) {
        t.style.transform = "translateY(108%)";
        t.style.transition = `transform 1.15s cubic-bezier(.2,.75,.15,1) ${(i * 0.12).toFixed(2)}s`;
      } else {
        t.style.opacity = "0";
        t.style.transform = "translateY(28px)";
        t.style.transition = "opacity 1.2s cubic-bezier(.2,.7,.2,1), transform 1.2s cubic-bezier(.2,.7,.2,1)";
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        targets.forEach((t) => {
          t.style.opacity = "";
          t.style.transform = "none";
        });
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lines]);

  return (
    <Tag ref={ref} className={className}>
      {lines
        ? Children.map(children, (child) => (
            <span className="block overflow-hidden">
              <span data-line="" className="block">
                {child}
              </span>
            </span>
          ))
        : children}
    </Tag>
  );
}
