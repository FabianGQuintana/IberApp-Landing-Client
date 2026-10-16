import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { FeedbackQueueToast } from "@/components/feedback/FeedbackQueueToast";
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
import { Play } from "@/components/sections/Play";
import { PortalSheet } from "@/components/sections/PortalSheet";
import { PortalsRail } from "@/components/sections/PortalsRail";
import { RoadStatus } from "@/components/sections/RoadStatus";
import { Territory } from "@/components/sections/Territory";
import { LandingProvider } from "@/context/LandingContext";

// Ibera Landing v6, section by section and in the same order.
// The v6 "Reportar" section was dropped: tourists use "Valorar" (FeedbackModal) and rangers report from their own app.
// Aprender jugando keeps v6's place, id and index of four topics, but its minigames are NOT copied from v6: the team
// agreed to redesign them to be better (guide §10); they are Phaser modules behind <GameStage /> (components/games).
// Scroll choreography lives in <ScrollMotion /> and <CustomCursor />.
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
        <Play />
        <Future />
      </main>
      <Footer />
      <FeedbackModal />
      <FeedbackQueueToast />
    </LandingProvider>
  );
}
