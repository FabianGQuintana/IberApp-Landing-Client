import { Footer } from "@/components/layout/Footer";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { ScrollMotion } from "@/components/motion/ScrollMotion";
import { ConnectedByWater } from "@/components/sections/ConnectedByWater";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Fragility } from "@/components/sections/Fragility";
import { Future } from "@/components/sections/Future";
import { Hero } from "@/components/sections/Hero";
import { Pause } from "@/components/sections/Pause";
import { PortalSheet } from "@/components/sections/PortalSheet";
import { PortalsRail } from "@/components/sections/PortalsRail";
import { RoadStatus } from "@/components/sections/RoadStatus";
import { SectionPlaceholder } from "@/components/sections/SectionPlaceholder";
import { Territory } from "@/components/sections/Territory";
import { LandingProvider } from "@/context/LandingContext";
import { SECTION_IDS } from "@/lib/data/copy";

// Ibera Landing v6, section by section and in the same order.
// Placeholders: Aprender jugando and Reportar (phase 4: interactive).
// Aprender jugando keeps v6's place, id and index of four topics, but its minigames are NOT copied from v6: the team
// agreed to redesign them to be better (guide §10). Reportar does follow v6. Scroll choreography lives in <ScrollMotion /> and <CustomCursor />.
export default function LandingPage() {
  return (
    <LandingProvider>
      <SiteChrome />
      <ScrollMotion />
      <CustomCursor />
      <main>
        <Hero />
        <ConnectedByWater />
        <Territory />
        <RoadStatus />
        <Pause />
        <PortalsRail />
        <PortalSheet />
        <Ecosystem />
        <Fragility />
        <SectionPlaceholder id={SECTION_IDS.play} tone="surface" label="Aprender · Desafío Iberá" title="Lo que se hace en el estero, se aprende jugando" heightClass="min-h-[150vh]" surface="bg2" />
        <SectionPlaceholder id={SECTION_IDS.act} tone="photo" label="Actuar" title="¿Viste algo que no debería estar acá?" heightClass="min-h-[120vh]" image="caiman" />
        <Future />
      </main>
      <Footer />
    </LandingProvider>
  );
}
