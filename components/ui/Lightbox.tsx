"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { GlassButton, LineIcon } from "./Controls";

export interface LightboxSlide {
  src: string;
  alt: string;
  caption: string;
}

interface LightboxProps {
  title: string;
  slides: LightboxSlide[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}

const EASE = "cubic-bezier(.2,.7,.2,1)";

// Full-screen gallery from Ibera Landing v6: morphing photos, captions, thumbnails, arrows, swipe, Escape.
export function Lightbox({ title, slides, index, onIndexChange, onClose }: LightboxProps) {
  const [shown, setShown] = useState(false);
  const startX = useRef<number | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const step = (d: number) => onIndexChange((index + d + slides.length) % slides.length);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
    };
  }, []);

  const close = () => {
    setShown(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(onClose, reduce ? 0 : 480);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const n = slides.length;
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
  const fade = { opacity: shown ? 1 : 0, transition: "opacity .6s" };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galería en pantalla completa"
      className="fixed inset-0 z-[90] text-white [touch-action:pan-y]"
      style={{ background: `rgba(11,16,14,${shown ? 1 : 0})`, transition: `background-color .6s ${EASE}` }}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      }}
    >
      <div className="absolute inset-0" style={{ opacity: shown ? 1 : 0, transform: `scale(${shown ? 1 : 0.97})`, transition: `opacity .6s ${EASE}, transform .8s ${EASE}` }}>
        {slides.map((s, i) => {
          const m = i === index ? { op: 1, sc: 1, bl: 0 } : i < index ? { op: 0, sc: 1.025, bl: 2 } : { op: 0, sc: 1.045, bl: 2 };
          return (
            <div
              key={s.src + i}
              className="absolute"
              style={{
                inset: "96px clamp(16px,7vw,128px) 152px",
                opacity: m.op,
                transform: `scale(${m.sc})`,
                filter: `blur(${m.bl}px)`,
                transition: `opacity 1s ${EASE}, transform 1.1s ${EASE}, filter 1s`,
              }}
            >
              <Image src={s.src} alt={s.alt} fill sizes="100vw" className="object-contain" />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-x-0 top-0 flex h-[88px] items-center justify-between" style={{ paddingInline: "clamp(24px,4vw,64px)", ...fade, transitionDelay: ".15s" }}>
        <div className="flex items-center gap-3.5">
          <Logo className="h-7 w-[52px]" color="#FFFFFF" />
          <span className="title-display border-l border-white/30 pl-3.5 text-[18px] leading-none">{title}</span>
        </div>
        <GlassButton ref={closeButton} aria-label="Cerrar" onClick={close}>
          <LineIcon name="close" />
        </GlassButton>
      </div>

      <GlassButton size={56} aria-label="Anterior" onClick={() => step(-1)} className="absolute top-1/2 -mt-7" style={{ left: "clamp(8px,2vw,32px)" }}>
        <LineIcon name="left" />
      </GlassButton>
      <GlassButton size={56} aria-label="Siguiente" onClick={() => step(1)} className="absolute top-1/2 -mt-7" style={{ right: "clamp(8px,2vw,32px)" }}>
        <LineIcon name="right" />
      </GlassButton>

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 pb-8" style={{ paddingInline: "clamp(24px,4vw,64px)", ...fade, transitionDelay: ".2s" }}>
        <div className="flex max-w-[520px] flex-[1_1_260px] flex-col gap-2">
          <span className="text-[13px] font-medium leading-none text-sage">{counter}</span>
          <span className="text-base leading-[1.4]">{slides[index]?.caption}</span>
        </div>
        <div className="flex gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src + i}
              type="button"
              aria-label={`Foto ${i + 1}`}
              onClick={() => onIndexChange(i)}
              className="relative h-11 w-16 overflow-hidden rounded-[2px] border p-0 transition-[opacity,border-color] duration-[450ms] hover:opacity-100"
              style={{ borderColor: i === index ? "#FFFFFF" : "rgba(255,255,255,0)", opacity: i === index ? 1 : 0.45 }}
            >
              <Image src={s.src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
