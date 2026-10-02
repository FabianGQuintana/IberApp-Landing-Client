import Image from "next/image";
import { HERO_LINES, SECTION_IDS } from "@/lib/data/copy";
import { IMAGES } from "@/lib/data/images";

const EASE = "cubic-bezier(.2,.7,.2,1)";

// "Portada" from Ibera Landing v6. Entrance runs in CSS on first paint; scroll parallax is written by <ScrollMotion />.
export function Hero() {
  return (
    <section id={SECTION_IDS.hero} data-tone="photo" aria-label="Portada" className="relative h-dvh min-h-[620px] overflow-hidden bg-[#002E1D] text-white">
      <div className="absolute inset-0" style={{ animation: `ib-settle 2.4s ${EASE} both` }}>
        <div data-hero-img="" className="absolute inset-x-0 -inset-y-[4%] will-change-transform" style={{ transform: "scale(1.08)" }}>
          <Image src={IMAGES.wetlands.src} alt={IMAGES.wetlands.alt} fill priority sizes="100vw" className="object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,16,14,.5)_0%,rgba(11,16,14,0)_24%,rgba(11,16,14,0)_48%,rgba(11,16,14,.78)_100%)]" />

      <div
        data-hero-txt=""
        className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-8"
        style={{ padding: "0 clamp(24px,4vw,64px) clamp(32px,6vh,64px)" }}
      >
        <div className="flex flex-col gap-4">
          <div data-hero-meta="" className="eyebrow leading-[1.5]" style={{ animation: `ib-appear 1.2s ${EASE} .5s both` }}>
            Gran Parque Iberá
            <br />
            Corrientes, Argentina
          </div>
          <h1 className="title-display m-0 -ml-[0.03em] -mt-[0.2em] overflow-hidden pt-[.2em] text-[clamp(104px,16vw,260px)] leading-[0.78]">
            <span className="block" style={{ animation: `ib-rise 1.6s ${EASE} .15s both` }}>
              Iberá
            </span>
          </h1>
        </div>
        <div className="flex max-w-[360px] flex-col gap-6 pb-1.5" style={{ animation: `ib-subup 1.2s ${EASE} .8s both` }}>
          <p className="m-0 text-[clamp(18px,1.6vw,22px)] leading-[1.4] [text-wrap:pretty]">{HERO_LINES.water}</p>
          <a
            href={`#${SECTION_IDS.intro}`}
            className="inline-flex items-center gap-2 self-start bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat pb-1.5 text-base font-medium leading-none text-white no-underline transition-[gap] duration-[450ms] ease-[cubic-bezier(.3,1.2,.4,1)] hover:gap-3 hover:text-white"
          >
            Explorar<span>↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
