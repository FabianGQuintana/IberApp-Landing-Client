import Image from "next/image";
import { IMAGES } from "@/lib/data/images";
import type { ImageId } from "@/types/portal";

interface SectionPlaceholderProps {
  id?: string;
  tone: "photo" | "surface";
  label: string;
  title: string;
  /** Tailwind height classes mirroring v6 (e.g. "h-[160vh] lg:h-[190vh]") */
  heightClass: string;
  image?: ImageId;
  surface?: "bg" | "bg2";
}

// TEMPORARY (phase 1): keeps v6's ids, tones and heights so the header, menu and band can be built
// and tested against real scroll positions. Phase 2 replaces each one with the real section.
// "Aprender jugando" is the exception to "match v6": when it is built, its minigames are redesigned (guide §10).
export function SectionPlaceholder({ id, tone, label, title, heightClass, image, surface = "bg" }: SectionPlaceholderProps) {
  const photo = tone === "photo";
  return (
    <section
      id={id}
      data-tone={tone}
      aria-label={label}
      className={`relative flex items-end overflow-hidden ${heightClass} ${photo ? "bg-night text-white" : surface === "bg2" ? "bg-page-2 text-fg" : "bg-page text-fg"}`}
    >
      {photo && image && (
        <>
          <Image src={IMAGES[image].src} alt="" fill sizes="100vw" className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />
        </>
      )}
      <div className="relative flex flex-col gap-3 pb-24 pt-32" style={{ paddingInline: "clamp(24px,4vw,64px)" }}>
        <span className={`eyebrow ${photo ? "text-sage" : "text-mute"}`}>{label}</span>
        <h2 className={`title-display m-0 text-[clamp(44px,6vw,104px)] leading-[0.9] ${photo ? "text-white" : "text-head"}`}>{title}</h2>
      </div>
    </section>
  );
}
