"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { activeIndexAtMiddle, useScrollFrame } from "@/hooks/useScrollFrame";
import { SECTION_IDS } from "@/lib/data/copy";
import { SPECIES } from "@/lib/data/ecosystem";
import { IMAGES } from "@/lib/data/images";

const EASE = "cubic-bezier(.2,.7,.2,1)";

/** Photo crossfade used by Ecosystem and Fragility (v6 `morph`): previous items shrink in, next items wait zoomed. */
export const morph = (i: number, active: number) =>
  i === active ? { opacity: 1, scale: 1, blur: 0 } : i < active ? { opacity: 0, scale: 1.025, blur: 2 } : { opacity: 0, scale: 1.045, blur: 2 };

// "El estero respira" (v6 #ecosistema). Desktop: sticky photo (58%) + one card per 100vh, active by scroll.
// Below 1024 px: every card shows its own 4:5 photo and stays fully visible.
export function Ecosystem() {
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useScrollFrame(() => {
    const next = activeIndexAtMiddle(items.current);
    setActive((prev) => (prev === next ? prev : next));
  });

  const current = SPECIES[active];

  return (
    <section id={SECTION_IDS.ecosystem} data-tone="surface" aria-label="Ecosistema" className="bg-page pt-[clamp(72px,12vw,160px)]">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 pb-[clamp(48px,6vw,96px)]" style={{ paddingInline: "clamp(24px,4vw,64px)" }}>
        <div className="eyebrow text-mute">Ecosistema</div>
        <Reveal lines as="h2" className="title-display m-0 text-[clamp(64px,9vw,156px)] leading-[0.84] text-head">
          <>El estero</>
          <>respira</>
        </Reveal>
        <p className="m-0 max-w-[520px] text-lg leading-[1.55] text-mute [text-wrap:pretty]">
          Más de 4.000 especies comparten el agua. Algunas estuvieron a punto de desaparecer, y volvieron.
        </p>
      </div>

      <div className="flex">
        {/* Sticky photo stack (desktop) */}
        <div className="sticky top-0 hidden h-dvh flex-[0_0_58%] overflow-hidden bg-[#002E1D] lg:block">
          {SPECIES.map((s, i) => {
            const m = morph(i, active);
            return (
              <div
                key={s.name}
                className="absolute inset-0"
                style={{ opacity: m.opacity, transform: `scale(${m.scale})`, filter: `blur(${m.blur}px)`, transition: `opacity 1s ${EASE}, transform 1.2s ${EASE}, filter 1s ${EASE}` }}
              >
                <Image src={IMAGES[s.image].src} alt={IMAGES[s.image].alt} fill sizes="58vw" className="object-cover" />
              </div>
            );
          })}
          <div className="absolute bottom-6 left-6 flex flex-col gap-3 rounded-[12px] border border-white/10 bg-[rgba(12,20,16,.55)] px-4 py-3 text-white shadow-[inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-[18px] backdrop-saturate-[1.2]">
            <span className="eyebrow">
              {current.category} · {current.name}
            </span>
            <span className="flex gap-1.5" aria-hidden="true">
              {SPECIES.map((s, i) => (
                <span key={s.name} className="relative h-0.5 w-7 overflow-hidden bg-white/20">
                  <span className="absolute inset-0 origin-left bg-white" style={{ transform: `scaleX(${i <= active ? 1 : 0})`, transition: `transform .8s ${EASE}` }} />
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_42%] flex-col" style={{ paddingInline: "clamp(24px,4vw,72px)" }}>
          {SPECIES.map((s, i) => {
            const dim = i === active ? "lg:opacity-100" : "lg:opacity-[.22]";
            return (
              <div
                key={s.name}
                ref={(el) => {
                  items.current[i] = el;
                }}
                data-fauna=""
                className="flex flex-col justify-center gap-4 py-12 lg:min-h-dvh"
              >
                <div className="relative mb-4 aspect-[4/5] bg-[#002E1D] lg:hidden" style={{ marginInline: "calc(-1 * clamp(24px,4vw,72px))" }}>
                  <Image src={IMAGES[s.image].src} alt={IMAGES[s.image].alt} fill sizes="100vw" className="object-cover" />
                </div>
                <div className={`eyebrow text-mute transition-opacity duration-[600ms] ${i === active ? "lg:opacity-100" : "lg:opacity-30"}`}>
                  {s.category} · <span className="normal-case italic tracking-normal">{s.scientificName}</span>
                </div>
                <h3 className={`title-display m-0 text-[clamp(44px,4.4vw,72px)] leading-[0.88] text-head transition-opacity delay-100 duration-700 ${dim}`}>{s.name}</h3>
                <p className={`m-0 mt-2 text-[clamp(20px,1.6vw,24px)] font-medium leading-[1.3] text-head transition-opacity delay-150 duration-700 [text-wrap:balance] ${dim}`}>{s.line}</p>
                <p className={`m-0 max-w-[440px] text-[17px] leading-[1.6] transition-opacity delay-200 duration-700 [text-wrap:pretty] ${dim}`}>{s.text}</p>
                <div className={`text-[15px] leading-[1.3] text-mute transition-opacity delay-[260ms] duration-700 ${dim}`}>Dónde verlo: {s.where}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
