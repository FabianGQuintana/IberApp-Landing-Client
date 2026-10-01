import Image from "next/image";
import { Footer } from "@/components/layout/Footer";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SectionPlaceholder } from "@/components/sections/SectionPlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import { HERO_LINES, SECTION_IDS } from "@/lib/data/copy";
import { IMAGES } from "@/lib/data/images";

// Ibera Landing v6, in order. Sections marked as placeholders are replaced in phase 2.
export default function LandingPage() {
  return (
    <>
      <SiteChrome />
      <main>
        <section id={SECTION_IDS.hero} data-tone="photo" aria-label="Portada" className="relative flex h-dvh min-h-[620px] items-end overflow-hidden bg-night">
          <Image src={IMAGES.wetlands.src} alt={IMAGES.wetlands.alt} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/25 to-transparent" />
          <div className="relative flex w-full flex-col gap-6 pb-[clamp(48px,8vw,96px)] text-white lg:flex-row lg:items-end lg:justify-between" style={{ paddingInline: "clamp(24px,4vw,64px)" }}>
            <div className="flex flex-col gap-3">
              <span className="eyebrow">
                Gran Parque Iberá
                <br />
                Corrientes, Argentina
              </span>
              <h1 className="title-display m-0 text-[clamp(64px,10vw,176px)] leading-[0.85]">Iberá</h1>
            </div>
            <div className="flex max-w-[360px] flex-col gap-4">
              <p className="m-0 text-[17px] leading-snug">{HERO_LINES.water}</p>
              <a href={`#${SECTION_IDS.intro}`} className="link-underline self-start text-[15px] font-medium text-white no-underline [background-size:100%_1px]">
                Explorar ↓
              </a>
            </div>
          </div>
        </section>

        <SectionPlaceholder id={SECTION_IDS.intro} tone="surface" label="Conectado por el agua" title="En el Iberá todo está conectado por el agua" heightClass="h-[160vh] lg:h-[190vh]" />
        <SectionPlaceholder id={SECTION_IDS.territory} tone="photo" label="Territorio" title="Ocho puertas a un mismo estero" heightClass="min-h-dvh lg:h-[300vh]" image="satellite" />
        <SectionPlaceholder id={SECTION_IDS.roads} tone="surface" label="Estado de accesos" title="Antes de salir, mirá el camino." heightClass="min-h-dvh" />
        <SectionPlaceholder tone="surface" label="Pausa" title="El estero se escucha antes de verse" heightClass="min-h-[80vh]" />
        <SectionPlaceholder id={SECTION_IDS.portals} tone="surface" label="Portales" title="Explorá las puertas de entrada al Iberá." heightClass="min-h-dvh" />
        <SectionPlaceholder id={SECTION_IDS.portalSheet} tone="surface" label="Ficha del portal" title="Laguna Iberá" heightClass="min-h-[150vh]" surface="bg2" />
        <SectionPlaceholder id={SECTION_IDS.ecosystem} tone="surface" label="Ecosistema" title="El estero respira" heightClass="min-h-[200vh]" />
        <SectionPlaceholder id={SECTION_IDS.fragility} tone="photo" label="Fragilidad" title="Pero un ecosistema tan vivo también es vulnerable." heightClass="h-[170vh] lg:h-[210vh]" image="laguna" />
        <SectionPlaceholder id={SECTION_IDS.play} tone="surface" label="Aprender · Desafío Iberá" title="Lo que se hace en el estero, se aprende jugando" heightClass="min-h-[150vh]" surface="bg2" />
        <SectionPlaceholder id={SECTION_IDS.act} tone="photo" label="Actuar" title="¿Viste algo que no debería estar acá?" heightClass="min-h-[120vh]" image="caiman" />

        <section id={SECTION_IDS.future} data-tone="photo" aria-label="Cierre" className="relative flex h-[110vh] min-h-[640px] items-end overflow-hidden bg-night text-white">
          <Image src={IMAGES.jaguar.src} alt={IMAGES.jaguar.alt} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 to-transparent" />
          <Reveal lines as="h2" className="title-display relative m-0 pb-[clamp(48px,8vw,96px)] text-[clamp(64px,9vw,156px)] leading-[0.88]">
            <span style={{ paddingInline: "clamp(24px,4vw,64px)" }} className="block">
              Conocer
            </span>
            <span style={{ paddingInline: "clamp(24px,4vw,64px)" }} className="block">
              para cuidar
            </span>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}
