"use client";

import Image from "next/image";
import { useState } from "react";
import { Dot } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Reveal";
import { useLanding } from "@/context/LandingContext";
import { SECTION_IDS } from "@/lib/data/copy";
import { IMAGES } from "@/lib/data/images";
import { roadStatusOf } from "@/lib/data/portal-status";
import { PORTALS } from "@/lib/data/portals";
import { ROAD_STATUS_SOURCE } from "@/lib/data/road-status";

const TIPS = [
  ["Sin señal al final", "Guardá la ficha del portal antes de salir; funciona sin conexión."],
  ["Combustible antes", "En varios accesos no hay estación en más de 100 km."],
  ["Tu basura vuelve con vos", "En la reserva no hay recolección."],
];
const SPRING = "cubic-bezier(.3,1.2,.4,1)";

// "Estado de accesos" (v6 #caminos). Hover/focus slides the row and shows a thumbnail (desktop only).
export function RoadStatus() {
  const { openPortal } = useLanding();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id={SECTION_IDS.roads}
      data-tone="surface"
      aria-label="Estado de accesos"
      className="bg-page"
      style={{ padding: "clamp(72px,12vw,160px) clamp(24px,4vw,64px)" }}
    >
      <div className="mx-auto flex max-w-[1320px] flex-wrap gap-[clamp(48px,6vw,128px)]">
        <Reveal className="flex max-w-[420px] flex-[1_1_300px] flex-col gap-6">
          <div className="eyebrow text-mute">Estado de accesos</div>
          <h2 className="m-0 text-[clamp(36px,3.4vw,52px)] font-medium leading-[1.05] text-head [text-wrap:balance]">Antes de salir, mirá el camino.</h2>
          <p className="m-0 text-[17px] leading-[1.55] text-mute [text-wrap:pretty]">
            Los accesos son de ripio, tierra o arena. Una lluvia cambia el viaje. {ROAD_STATUS_SOURCE.updatedSentence}
          </p>
        </Reveal>

        <div className="flex min-w-0 flex-[2_1_520px] flex-col border-t border-rule">
          {PORTALS.map((p, i) => {
            const status = roadStatusOf(p.id);
            const on = hovered === i;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => openPortal(p.id)}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 border-x-0 border-b border-t-0 border-solid border-rule bg-transparent py-6 text-left text-fg"
              >
                <span className="flex flex-[1_1_240px] flex-col gap-1.5 transition-transform duration-500" style={{ transform: `translateX(${on ? 8 : 0}px)`, transitionTimingFunction: SPRING }}>
                  <span className="text-[clamp(22px,2vw,28px)] font-medium leading-[1.1]">{p.name}</span>
                  <span className="text-[15px] leading-[1.3] text-mute">{p.route}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="relative hidden h-12 w-[72px] flex-none overflow-hidden rounded-[2px] bg-[#002E1D] lg:block"
                  style={{ opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 0.94})`, transition: "opacity .45s cubic-bezier(.2,.7,.2,1), transform .6s cubic-bezier(.2,.7,.2,1)" }}
                >
                  <Image src={IMAGES[p.image].src} alt="" fill sizes="72px" className="object-cover" />
                </span>
                <span className="flex min-w-40 flex-none items-center gap-2.5 text-base font-medium leading-none">
                  <Dot color={status.dot} className="transition-transform duration-[450ms]" />
                  {status.label}
                </span>
                <span className="text-xl leading-none text-head transition-transform duration-[450ms]" style={{ transform: `translateX(${on ? 4 : 0}px)`, transitionTimingFunction: SPRING }}>
                  →
                </span>
              </button>
            );
          })}

          <Reveal className="mt-16 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-8">
            {TIPS.map(([title, text]) => (
              <div key={title} className="flex flex-col gap-2">
                <div className="text-[17px] font-medium leading-[1.3]">{title}</div>
                <div className="text-[15px] leading-normal text-mute">{text}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
