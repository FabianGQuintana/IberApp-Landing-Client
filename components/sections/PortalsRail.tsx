"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Dot, RoundArrowButton, TextAction } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Reveal";
import { useLanding } from "@/context/LandingContext";
import { SECTION_IDS } from "@/lib/data/copy";
import { IMAGES } from "@/lib/data/images";
import { roadStatusOf } from "@/lib/data/portal-status";
import { PORTALS } from "@/lib/data/portals";

const GUTTER = "clamp(24px,4vw,64px)";

// "Portales" (v6 #portales): horizontal scroll-snap rail with arrows and a progress bar.
// Card image parallax and the "Ver portal" cursor arrive in phase 5.
export function PortalsRail() {
  const { openPortal } = useLanding();
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  // Progress bar: width = visible share, left = scroll position (v6 onRailScroll).
  const updateBar = () => {
    const r = rail.current;
    const b = bar.current;
    if (!r || !b) return;
    const visible = r.clientWidth / r.scrollWidth;
    const p = r.scrollLeft / Math.max(1, r.scrollWidth - r.clientWidth);
    b.style.width = `${(visible * 100).toFixed(1)}%`;
    b.style.left = `${(p * (1 - visible) * 100).toFixed(1)}%`;
  };
  useEffect(() => {
    updateBar();
    window.addEventListener("resize", updateBar);
    return () => window.removeEventListener("resize", updateBar);
  }, []);

  const scrollBy = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.6, behavior: "smooth" });

  return (
    <section id={SECTION_IDS.portals} data-tone="surface" aria-label="Portales" className="bg-page pb-[clamp(72px,12vw,160px)] pt-[clamp(64px,10vw,128px)]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6" style={{ paddingInline: GUTTER }}>
        <div className="flex max-w-[720px] flex-col gap-4">
          <div className="eyebrow text-mute">Portales</div>
          <Reveal lines as="h2" className="m-0 text-[clamp(40px,4.4vw,68px)] font-medium leading-[1.04] text-head [&_[data-line]]:pb-[.06em]">
            <>Explorá las puertas</>
            <>de entrada al Iberá.</>
          </Reveal>
        </div>
        <div className="flex gap-3">
          <RoundArrowButton direction="left" aria-label="Portal anterior" onClick={() => scrollBy(-1)} />
          <RoundArrowButton direction="right" aria-label="Portal siguiente" onClick={() => scrollBy(1)} />
        </div>
      </div>

      <div
        ref={rail}
        onScroll={updateBar}
        className="mt-16 flex snap-x snap-mandatory gap-[clamp(16px,2vw,32px)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
      >
        {PORTALS.map((p) => {
          const status = roadStatusOf(p.id);
          return (
            <article key={p.id} data-card="" className="flex w-[min(84vw,640px)] flex-none snap-start flex-col gap-6 lg:w-[min(58vw,880px)]">
              <button
                type="button"
                onClick={() => openPortal(p.id)}
                aria-label={`Ver portal ${p.name}`}
                className="relative h-[clamp(360px,64vh,680px)] overflow-hidden rounded-[2px] border-none bg-[#002E1D] p-0"
              >
                <span data-cimg="" className="absolute inset-y-0 -inset-x-[6%]">
                  <Image src={IMAGES[p.image].src} alt={IMAGES[p.image].alt} fill sizes="(min-width: 1024px) 60vw, 85vw" className="object-cover" />
                </span>
              </button>
              <div data-ccap="" className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex max-w-[480px] flex-col gap-2">
                  <div className="eyebrow text-mute">{p.locality}</div>
                  <div className="title-display text-[clamp(38px,3.8vw,60px)] leading-[0.88] text-head">{p.name}</div>
                  <div className="text-[17px] leading-[1.45]">{p.tagline}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium leading-none text-mute">
                    <Dot color={status.dot} />
                    {status.label}
                  </span>
                  <TextAction arrow="→" className="text-head" onClick={() => openPortal(p.id)}>
                    Explorar portal
                  </TextAction>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mx-auto mt-12 max-w-[1440px]" style={{ paddingInline: GUTTER }}>
        <div className="relative h-px bg-rule">
          <div ref={bar} data-railbar="" className="absolute -top-px left-0 h-0.5 w-1/5 bg-head transition-[left] duration-300 ease-[cubic-bezier(.2,.7,.2,1)]" />
        </div>
      </div>
    </section>
  );
}
