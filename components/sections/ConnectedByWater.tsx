"use client";

import { useRef } from "react";
import { LitText } from "@/components/ui/LitText";
import { CONNECTED_BY_WATER, SECTION_IDS } from "@/lib/data/copy";

// "Conectado por el agua" (v6 #intro): sticky paragraph lit word by word. 160vh below 1024 px, 190vh above.
export function ConnectedByWater() {
  const section = useRef<HTMLElement>(null);
  return (
    <section ref={section} id={SECTION_IDS.intro} data-tone="surface" aria-label="Conectado por el agua" className="relative h-[160vh] bg-page lg:h-[190vh]">
      <div className="sticky top-0 flex h-dvh items-center justify-center" style={{ paddingInline: "clamp(24px,6vw,128px)" }}>
        <LitText
          text={CONNECTED_BY_WATER}
          sectionRef={section}
          onColor="var(--head)"
          offColor="var(--litoff)"
          className="m-0 max-w-[1100px] text-[clamp(30px,4.2vw,64px)] font-medium leading-[1.12] [text-wrap:pretty]"
        />
      </div>
    </section>
  );
}
