import Image from "next/image";
import { IMAGES } from "@/lib/data/images";

// Phase 0 placeholder. Phase 1 replaces it with the Ibera Landing v6 sections
// (#descubrir, #intro, #territorio, #caminos, #portales, #ficha, #ecosistema, #fragilidad, #jugar, #actuar, #futuro).
export default function LandingPage() {
  return (
    <main id="descubrir" className="relative flex min-h-dvh items-end overflow-hidden">
      <Image src={IMAGES.wetlands.src} alt={IMAGES.wetlands.alt} fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/30 to-transparent" />
      <div className="relative flex flex-col gap-3 px-[clamp(24px,4vw,64px)] pb-[clamp(48px,8vw,96px)] text-white">
        <span className="eyebrow">Gran Parque Iberá · Corrientes, Argentina</span>
        <h1 className="title-display m-0 text-[clamp(64px,10vw,176px)] leading-[0.85]">Iberá</h1>
        <p className="m-0 max-w-md text-lg">Landing en construcción · Fase 0 completa.</p>
      </div>
    </main>
  );
}
