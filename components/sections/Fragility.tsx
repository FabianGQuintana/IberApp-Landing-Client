"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LitText } from "@/components/ui/LitText";
import { activeIndexAtMiddle, sectionProgress, useScrollFrame } from "@/hooks/useScrollFrame";
import { FRAGILITY_INTRO, SECTION_IDS } from "@/lib/data/copy";
import { THREATS } from "@/lib/data/ecosystem";
import { IMAGES } from "@/lib/data/images";
import { morph } from "./Ecosystem";

const EASE = "cubic-bezier(.2,.7,.2,1)";

// "Fragilidad" (v6 #fragilidad): lit intro over a darkening photo, then one threat per 100vh over a sticky grayscale photo.
// When the intro arrives the photo ripples once, like a stone dropped in water (SVG feTurbulence + feDisplacementMap, 850 ms).
export function Fragility() {
  const intro = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const dim = useRef(0);
  const rippling = useRef(false);
  const rippled = useRef(false);
  const rippleFrame = useRef(0);
  const [active, setActive] = useState(0);

  const applyDim = () => {
    if (!photo.current) return;
    const p = dim.current;
    photo.current.style.filter = `${rippling.current ? "url(#ibera-ripple) " : ""}saturate(${(1 - p * 0.25).toFixed(3)}) brightness(${(1 - p * 0.28).toFixed(3)})`;
  };

  const ripple = () => {
    const disp = displacement.current;
    const turb = turbulence.current;
    if (!disp) return;
    const t0 = performance.now();
    rippling.current = true;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 850);
      disp.setAttribute("scale", (48 * Math.sin(Math.PI * t) * (1 - t * 0.4)).toFixed(2));
      turb?.setAttribute("baseFrequency", `${(0.008 + t * 0.004).toFixed(4)} ${(0.03 - t * 0.01).toFixed(4)}`);
      if (t >= 1) {
        rippling.current = false;
        disp.setAttribute("scale", "0");
      } else {
        rippleFrame.current = requestAnimationFrame(step);
      }
      applyDim();
    };
    rippleFrame.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(rippleFrame.current), []);

  useScrollFrame(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (intro.current && overlay.current && photo.current) {
      const p = reduce ? 1 : sectionProgress(intro.current);
      dim.current = p;
      overlay.current.style.opacity = (0.2 + p * 0.4).toFixed(3);
      if (!reduce) {
        photo.current.style.transform = `scale(${(1.08 - p * 0.08).toFixed(4)})`;
        const top = intro.current.getBoundingClientRect().top;
        const vh = window.innerHeight;
        if (top < vh * 0.35 && top > -vh * 0.5 && !rippled.current) {
          rippled.current = true;
          ripple();
        }
        if (top > vh) rippled.current = false;
      }
      applyDim();
    }
    const next = activeIndexAtMiddle(items.current);
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <section id={SECTION_IDS.fragility} data-tone="photo" aria-label="Fragilidad" className="bg-night text-white">
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <filter id="ibera-ripple" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence ref={turbulence} type="fractalNoise" baseFrequency="0.008 0.03" numOctaves={2} seed={4} result="t" />
          <feDisplacementMap ref={displacement} in="SourceGraphic" in2="t" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div ref={intro} data-litsec="" className="relative h-[170vh] lg:h-[210vh]">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <div ref={photo} data-dim="" className="absolute -inset-[2%] will-change-[transform,filter]">
            <Image src={IMAGES.laguna.src} alt={IMAGES.laguna.alt} fill sizes="100vw" className="object-cover" />
          </div>
          <div ref={overlay} className="absolute inset-0 bg-night opacity-20" />
          <div className="relative flex h-full flex-col justify-center gap-8" style={{ paddingInline: "clamp(24px,6vw,128px)" }}>
            <div className="eyebrow">Fragilidad</div>
            <LitText
              text={FRAGILITY_INTRO}
              sectionRef={intro}
              onColor="#FFFFFF"
              offColor="rgba(255,255,255,.26)"
              className="title-display m-0 max-w-[1000px] text-[clamp(48px,6.6vw,112px)] leading-[0.9] [text-wrap:balance]"
            />
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="sticky top-0 h-dvh overflow-hidden">
          {THREATS.map((t, i) => {
            const m = morph(i, active);
            return (
              <div
                key={t.title}
                className="absolute inset-0"
                style={{
                  opacity: m.opacity,
                  transform: `scale(${m.scale})`,
                  filter: `grayscale(.9) contrast(1.05) brightness(.72) blur(${m.blur}px)`,
                  transition: `opacity 1s ${EASE}, transform 1.2s ${EASE}, filter 1s ${EASE}`,
                }}
              >
                <Image src={IMAGES[t.image].src} alt={IMAGES[t.image].alt} fill sizes="100vw" className="object-cover" />
              </div>
            );
          })}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,16,14,.92)_0%,rgba(11,16,14,.7)_50%,rgba(11,16,14,.28)_100%)]" />
        </div>
        <div className="relative z-[1] -mt-[100dvh]">
          {THREATS.map((t, i) => {
            const on = i === active;
            return (
              <div
                key={t.title}
                ref={(el) => {
                  items.current[i] = el;
                }}
                data-frag=""
                className="flex min-h-dvh items-center py-32"
                style={{ paddingInline: "clamp(24px,6vw,128px)" }}
              >
                <div
                  className="flex max-w-[560px] flex-col gap-6"
                  style={{ opacity: on ? 1 : 0.2, transform: `translateY(${on ? 0 : 20}px)`, transition: `opacity .8s ${EASE}, transform 1s ${EASE}` }}
                >
                  <div className="eyebrow text-sage">{t.title}</div>
                  <h3 className="m-0 text-[clamp(32px,3.2vw,50px)] font-medium leading-[1.08] [text-wrap:balance]">{t.line}</h3>
                  <p className="m-0 text-lg leading-[1.6] text-cloud [text-wrap:pretty]">{t.text}</p>
                  <div className="text-[15px] leading-[1.4] text-sage">
                    Pasa en {t.where} · Se aprende en {t.game}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
