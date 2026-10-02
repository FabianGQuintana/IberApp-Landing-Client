import Image from "next/image";
import { SECTION_IDS } from "@/lib/data/copy";
import { IMAGES } from "@/lib/data/images";

const linkClass =
  "inline-flex items-center gap-2 self-start bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat pb-1.5 text-base font-medium leading-none text-white no-underline transition-[gap] duration-[450ms] ease-[cubic-bezier(.3,1.2,.4,1)] hover:gap-3 hover:text-white";

// "Cierre" (v6 #futuro), staged so it neither sticks to the section above nor ends abruptly on the footer.
// <ScrollMotion /> choreographs it: the frame opens like the Pause (data-reveal), the photo is pinned while it heals
// (data-heal: grayscale → color), the title drifts (data-drift) and the stage fades into the footer's night (data-outro).
export function Future() {
  return (
    <section id={SECTION_IDS.future} data-tone="photo" aria-label="Cierre" className="bg-night pt-[clamp(48px,6vw,96px)] text-white">
      <div data-reveal="" className="relative h-[170vh] rounded-[2px] lg:h-[210vh]">
        <div className="sticky top-0 h-dvh min-h-[640px] overflow-hidden bg-night">
          <div data-heal="" className="absolute inset-x-0 -inset-y-[4%] will-change-[transform,filter]" style={{ filter: "grayscale(1) brightness(.55)" }}>
            <Image src={IMAGES["jaguar-standing"].src} alt={IMAGES["jaguar-standing"].alt} fill sizes="100vw" className="object-cover object-[60%_center]" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,14,.35)_0%,rgba(11,16,14,0)_40%,rgba(11,16,14,.8)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-8" style={{ padding: "0 clamp(24px,4vw,64px) clamp(48px,8vh,96px)" }}>
            <h2 data-drift="-0.1" className="title-display m-0 max-w-[900px] text-[clamp(64px,10vw,176px)] leading-[0.82]">
              Conocer para cuidar
            </h2>
            <div className="flex max-w-[320px] flex-col gap-6">
              <p className="m-0 text-[17px] leading-normal">El yaguareté volvió a nacer en el Iberá después de más de setenta años. El estero es de todos. Cuidarlo también.</p>
              <a href={`#${SECTION_IDS.territory}`} className={linkClass}>
                Explorar el Iberá<span>→</span>
              </a>
            </div>
          </div>
          <div data-outro="" aria-hidden="true" className="pointer-events-none absolute inset-0 bg-night" style={{ opacity: 0 }} />
        </div>
      </div>
    </section>
  );
}
