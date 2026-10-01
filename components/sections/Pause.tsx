import Image from "next/image";
import { IMAGES } from "@/lib/data/images";

// "Pausa" from Ibera Landing v6: full-bleed photo between the access list and the portals.
// The clip-path reveal and text drift arrive in phase 5; this is the final (fully revealed) state.
export function Pause() {
  return (
    <section data-tone="surface" aria-label="Pausa" className="bg-page pb-[clamp(48px,6vw,96px)]">
      <div data-reveal="" className="relative h-[clamp(420px,92vh,960px)] overflow-hidden rounded-[2px] bg-[#002E1D]">
        <div data-reveal-img="" className="absolute inset-x-0 -inset-y-[6%]">
          <Image src={IMAGES.cormorants.src} alt={IMAGES.cormorants.alt} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,14,0)_55%,rgba(11,16,14,.55)_100%)]" />
        <div
          data-drift="-0.12"
          className="title-display absolute max-w-[760px] text-[clamp(48px,6vw,104px)] leading-[0.86] text-white"
          style={{ left: "clamp(24px,6vw,96px)", bottom: "clamp(48px,8vw,128px)" }}
        >
          El estero se escucha antes de verse
        </div>
        <div className="eyebrow absolute text-white opacity-80" style={{ right: "clamp(24px,4vw,64px)", bottom: "clamp(24px,4vw,48px)" }}>
          Cormoranes · Laguna Iberá
        </div>
      </div>
    </section>
  );
}
