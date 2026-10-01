"use client";

import { useRef, type CSSProperties, type RefObject } from "react";
import { sectionProgress, useScrollFrame } from "@/hooks/useScrollFrame";

interface LitTextProps {
  text: string;
  /** Section whose scroll progress lights the words (v6 `data-litsec`) */
  sectionRef: RefObject<HTMLElement | null>;
  onColor: string;
  offColor: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Words light up one by one while the section is scrolled (v6 `data-w`, `data-on`, `data-off`).
 * Lit words = round(clamp((progress − .08) / .7) × count). Styles are written through refs.
 */
export function LitText({ text, sectionRef, onColor, offColor, className = "", style }: LitTextProps) {
  const words = text.split(" ");
  const spans = useRef<(HTMLSpanElement | null)[]>([]);
  const litCount = useRef(-1);

  useScrollFrame(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = reduce ? 1 : sectionProgress(section);
    const n = Math.round(Math.max(0, Math.min(1, (p - 0.08) / 0.7)) * words.length);
    if (n === litCount.current) return;
    litCount.current = n;
    spans.current.forEach((el, i) => {
      if (!el) return;
      const lit = i < n;
      el.style.color = lit ? onColor : offColor;
      el.style.opacity = lit ? "1" : ".55";
    });
  });

  return (
    <p className={className} style={{ color: offColor, ...style }}>
      {words.map((w, i) => (
        <span
          key={i}
          ref={(el) => {
            spans.current[i] = el;
          }}
          data-w=""
          style={{ opacity: 0.55, transition: "color .45s cubic-bezier(.2,.7,.2,1), opacity .45s cubic-bezier(.2,.7,.2,1)" }}
        >
          {w}{" "}
        </span>
      ))}
    </p>
  );
}
