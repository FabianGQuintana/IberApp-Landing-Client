"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { PortalMiniMap } from "@/components/map/PortalMiniMap";
import { Dot, RoundArrowButton, TextAction } from "@/components/ui/Controls";
import { Lightbox } from "@/components/ui/Lightbox";
import { Reveal } from "@/components/ui/Reveal";
import { scrollToSection, useLanding } from "@/context/LandingContext";
import { SECTION_IDS } from "@/lib/data/copy";
import { GAMES } from "@/lib/data/games";
import { IMAGES } from "@/lib/data/images";
import { roadStatusOf } from "@/lib/data/portal-status";
import { PORTALS, getPortal } from "@/lib/data/portals";
import { ISSUE_LABEL } from "@/lib/data/statuses";

const GUTTER = "clamp(24px,4vw,64px)";
const EASE = "cubic-bezier(.2,.7,.2,1)";

// "Ficha del portal" (v6 #ficha).
export function PortalSheet() {
  const { portalId, openPortal, openGame, openFeedback } = useLanding();
  const portal = getPortal(portalId) ?? PORTALS[0];
  const status = roadStatusOf(portal.id);
  const game = GAMES.find((g) => g.id === portal.game);

  // Gallery position is per portal: switching portals starts at the first photo (v6 resets `gi`).
  const [gallery, setGallery] = useState({ portalId: portal.id, index: 0 });
  const index = gallery.portalId === portal.id ? gallery.index : 0;
  const setIndex = (i: number) => setGallery({ portalId: portal.id, index: i });
  const n = portal.gallery.length;
  const step = (d: number) => setIndex((index + d + n) % n);

  const [lightbox, setLightbox] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const saved = savedId === portal.id;

  const pointerStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const lastWheel = useRef(0);

  const slides = portal.gallery.map((g) => ({ ...IMAGES[g.image], caption: g.caption }));
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;

  return (
    <section id={SECTION_IDS.portalSheet} data-tone="surface" aria-label="Ficha del portal" className="bg-page-2 py-[clamp(72px,12vw,160px)]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12">
        {/* Portal chips + name */}
        <div className="flex flex-col gap-8" style={{ paddingInline: GUTTER }}>
          <div className="flex flex-wrap gap-x-6 gap-y-1" role="group" aria-label="Elegí un portal">
            {PORTALS.map((p) => {
              const on = p.id === portal.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => openPortal(p.id, { scroll: false })}
                  className={`border-none bg-[linear-gradient(currentColor,currentColor)] bg-left-bottom bg-no-repeat px-0 py-2 text-[15px] font-medium leading-none transition-[color,background-size] duration-[450ms] ${
                    on ? "bg-[length:100%_1px]" : "bg-[length:0%_1px] hover:bg-[length:100%_1px]"
                  }`}
                  style={{ color: on ? "var(--head)" : "var(--mute)" }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="title-display m-0 text-[clamp(56px,8vw,132px)] leading-[0.84] text-head">{portal.name}</h3>
            <div className="eyebrow text-right leading-[1.5] text-mute">
              {portal.locality}
              <br />
              Corrientes, Argentina
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div
          tabIndex={0}
          aria-label={`Galería de fotos de ${portal.name}. Usá las flechas para navegar.`}
          className="relative overflow-hidden [--slide:86%] [touch-action:pan-y] lg:[--slide:74%]"
          style={{ paddingLeft: GUTTER, outlineOffset: -3 }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              step(1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              step(-1);
            }
            if (e.key === "Enter") setLightbox(true);
          }}
          onWheel={(e) => {
            if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 18) return;
            const t = e.timeStamp; // one step per 750 ms of horizontal wheel/trackpad
            if (t - lastWheel.current < 750) return;
            lastWheel.current = t;
            step(e.deltaX > 0 ? 1 : -1);
          }}
          onPointerDown={(e) => {
            pointerStart.current = e.clientX;
            dragged.current = false;
          }}
          onPointerUp={(e) => {
            if (pointerStart.current === null) return;
            const dx = e.clientX - pointerStart.current;
            pointerStart.current = null;
            if (Math.abs(dx) > 50) {
              dragged.current = true;
              step(dx < 0 ? 1 : -1);
              window.setTimeout(() => (dragged.current = false), 60);
            }
          }}
        >
          <div className="flex gap-4" style={{ transform: `translateX(calc(${index} * -1 * (var(--slide) + 16px)))`, transition: "transform 1.1s cubic-bezier(.7,0,.15,1)" }}>
            {slides.map((s, i) => {
              const current = i === index;
              return (
                <button
                  key={portal.id + i}
                  type="button"
                  data-cursor={current ? "Abrir" : i > index ? "Siguiente" : "Anterior"}
                  aria-label={current ? "Abrir en pantalla completa" : `Ir a la foto ${i + 1}`}
                  onClick={() => {
                    if (dragged.current) return;
                    if (current) setLightbox(true);
                    else setIndex(i);
                  }}
                  className="relative h-[clamp(340px,68vh,740px)] flex-[0_0_var(--slide)] overflow-hidden rounded-[2px] border-none bg-[#002E1D] p-0"
                  style={{ opacity: current ? 1 : Math.abs(i - index) === 1 ? 0.55 : 0.25, transition: `opacity 1s ${EASE}` }}
                >
                  <span
                    className="absolute inset-y-0 -inset-x-[8%]"
                    style={{
                      transform: `translateX(${current ? 0 : i < index ? 6 : -6}%) scale(${current ? 1 : 1.04})`,
                      filter: `blur(${current ? 0 : 1.5}px)`,
                      transition: `transform 1.2s ${EASE}, filter .9s`,
                    }}
                  >
                    <Image src={s.src} alt={s.alt} fill sizes="(min-width: 1024px) 74vw, 86vw" className="object-cover" priority={false} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4" style={{ paddingInline: GUTTER }}>
          <div className="grid max-w-[560px] flex-[1_1_280px] text-[15px] leading-[1.45] text-mute">
            {slides.map((s, i) => (
              <span
                key={portal.id + i}
                className="[grid-area:1/1]"
                aria-hidden={i !== index}
                style={{
                  opacity: i === index ? 1 : 0,
                  transform: `translateY(${i === index ? 0 : 6}px)`,
                  transition: `opacity .6s ${EASE} ${i === index ? ".25s" : "0s"}, transform .7s ${EASE} ${i === index ? ".25s" : "0s"}`,
                }}
              >
                {s.caption}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <RoundArrowButton direction="left" aria-label="Foto anterior" onClick={() => step(-1)} />
            <span className="min-w-[72px] text-center text-sm font-medium leading-none text-head">{counter}</span>
            <RoundArrowButton direction="right" aria-label="Foto siguiente" onClick={() => step(1)} />
            <span className="w-4" />
            <TextAction className="text-[15px] text-head" onClick={() => setLightbox(true)}>
              Pantalla completa
            </TextAction>
          </div>
        </div>

        {/* Description, collage, info columns, challenge + "Antes de ir" */}
        <div className="mt-16 flex flex-wrap items-start gap-[clamp(48px,6vw,112px)]" style={{ paddingInline: GUTTER }}>
          <div className="flex min-w-0 flex-[1.6_1_520px] flex-col gap-16">
            <Reveal key={`desc-${portal.id}`} className="flex max-w-[680px] flex-col gap-6">
              <h4 className="m-0 text-[clamp(30px,2.8vw,44px)] font-medium leading-[1.12] text-head [text-wrap:pretty]">{portal.description}</h4>
              <p className="m-0 text-lg leading-[1.65] [text-wrap:pretty]">{portal.history}</p>
            </Reveal>

            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] grid-rows-[auto_auto] gap-4">
              <CollagePhoto image={portal.collage[0]} par={3} className="row-span-2 min-h-[340px]" />
              <CollagePhoto image={portal.collage[1]} par={-2} className="aspect-[4/3]" />
              <CollagePhoto image={portal.collage[2]} par={2} className="aspect-[4/3]" />
            </div>

            <Reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-x-8 gap-y-12">
              <InfoColumn title="Qué hacer">{portal.activities.map((a) => <div key={a}>{a}</div>)}</InfoColumn>
              <InfoColumn title="Puntos de interés">{portal.pointsOfInterest.map((a) => <div key={a}>{a}</div>)}</InfoColumn>
              <InfoColumn title="Dónde quedarse">
                {portal.lodging.map((l) => (
                  <div key={l.name}>
                    {l.name} <span className="text-mute">· {l.where}</span>
                  </div>
                ))}
              </InfoColumn>
            </Reveal>

            <Reveal className="flex max-w-[620px] flex-col gap-4 border-t border-rule pt-8">
              <div className="eyebrow text-mute">El desafío de esta zona · {ISSUE_LABEL[portal.issue]}</div>
              <p className="m-0 text-[clamp(20px,1.6vw,24px)] leading-[1.45] text-head [text-wrap:pretty]">{portal.issueText}</p>
              <div className="mt-2 flex flex-wrap gap-x-8 gap-y-4">
                {game && ( 
                  <TextAction arrow="→" className="text-head" onClick={() => openGame(game.id)}>
                    Aprendelo jugando: {game.title}
                  </TextAction>
                )}
                <TextAction arrow="→" className="text-head" onClick={() => scrollToSection(SECTION_IDS.act)}>
                  Reportar en esta zona
                </TextAction>
                <TextAction arrow="→" className="text-head" onClick={() => openFeedback(portal.id)} aria-haspopup="dialog">
                  Valorar este portal
                </TextAction>
              </div>
            </Reveal>
          </div>

          <aside className="flex max-w-[420px] flex-[1_1_300px] flex-col lg:sticky lg:top-28">
            <div className="eyebrow border-b border-fg pb-4 text-mute">Antes de ir</div>
            <BeforeRow label="Camino">
              <span className="flex items-center gap-2 font-medium">
                <Dot color={status.dot} />
                {status.label}
              </span>
            </BeforeRow>
            <BeforeRow label="Cómo llegar">{portal.route}</BeforeRow>
            <BeforeRow label="Señal">{portal.signal}</BeforeRow>
            <BeforeRow label="Combustible">{portal.fuel}</BeforeRow>
            <BeforeRow label="Visitantes">{portal.phone}</BeforeRow>
            <PortalMiniMap portalId={portal.id} label={`${portal.kind === "national-park" ? "Parque Nacional" : "Portal"} ${portal.name}`} />
            <TextAction className="mt-6 text-head" onClick={() => setSavedId(saved ? null : portal.id)} aria-pressed={saved}>
              {saved && <span className="h-[7px] w-[7px] animate-ib-fadeup rounded-full bg-mint" />}
              {saved ? "Guardada para usar sin conexión" : "Guardar sin conexión ↓"}
            </TextAction>
          </aside>
        </div>
      </div>

      {lightbox && <Lightbox title={portal.name} slides={slides} index={index} onIndexChange={setIndex} onClose={() => setLightbox(false)} />}
    </section>
  );
}

// `par` is the drift amplitude in % (v6 data-par: 3, -2, 2); <ScrollMotion /> animates it.
function CollagePhoto({ image, par, className }: { image: keyof typeof IMAGES; par: number; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2px] bg-[#002E1D] ${className}`}>
      <div data-par={par} className="absolute inset-x-0 -inset-y-[8%] will-change-transform">
        <Image src={IMAGES[image].src} alt={IMAGES[image].alt} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover" />
      </div>
    </div>
  );
}

function InfoColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-fg pt-4 text-[17px] leading-[1.35]">
      <div className="eyebrow text-mute">{title}</div>
      {children}
    </div>
  );
}

function BeforeRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-rule-2 py-4 text-base leading-[1.4]">
      <span className="text-mute">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}
