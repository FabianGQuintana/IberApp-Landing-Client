"use client";

import { useEffect, useRef, useState } from "react";
import { MapView, type MapApi, type MapStatus } from "@/components/map/MapView";
import { Dot } from "@/components/ui/Controls";
import { scrollToSection, useLanding } from "@/context/LandingContext";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { SECTION_IDS } from "@/lib/data/copy";
import { roadStatusOf } from "@/lib/data/portal-status";
import { PORTALS, isReferenceArea } from "@/lib/data/portals";
import { MAIN_PITCH, attribution, formatDegrees, mainPadding } from "@/lib/map/config";
import type { Portal } from "@/types/portal";

const GUTTER = "clamp(24px,4vw,64px)";
const EASE = "cubic-bezier(.2,.7,.2,1)";
const SPRING = "cubic-bezier(.3,1.2,.4,1)";
const SCALE_STEPS_KM = [2, 5, 10, 20, 25, 50, 100];

// "Territorio" (v6 #territorio): satellite map of the 8 portals with the active portal card.
// Phase 3: portals are picked with the pins (and the name strip below 1024 px).
// Phase 5 adds the 300vh sticky version where scrolling flies through the portals.
export function Territory() {
  const { openPortal } = useLanding();
  const isDesktop = useIsDesktop();
  const narrow = !isDesktop;
  const api = useRef<MapApi>(null);
  const section = useRef<HTMLElement>(null);
  const scaleBar = useRef<HTMLSpanElement>(null);
  const scaleText = useRef<HTMLSpanElement>(null);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [attempt, setAttempt] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [introStage, setIntroStage] = useState(0);
  const [shownPins, setShownPins] = useState(0);

  const ready = status === "ready";
  const introDone = introStage >= 4;
  const hoveredIndex = !narrow && hovered ? PORTALS.findIndex((p) => p.id === hovered) : -1;
  const active = hoveredIndex >= 0 ? hoveredIndex : (picked ?? 0);

  // Intro (v6 runIntro): 4 stages 380 ms apart, then pins appear one by one; starts when the section is in view.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const timers: number[] = [];
    let ran = false;
    const run = () => {
      if (ran) return;
      ran = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        timers.push(
          window.setTimeout(() => {
            setIntroStage(4);
            setShownPins(PORTALS.length);
          }),
        );
        return;
      }
      [1, 2, 3, 4].forEach((stage, i) => timers.push(window.setTimeout(() => setIntroStage(stage), i * 380)));
      PORTALS.forEach((_, k) => timers.push(window.setTimeout(() => setShownPins(k + 1), 1000 + (k + 1) * 100)));
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && run(), { rootMargin: "0px 0px -45% 0px" });
    io.observe(el);
    timers.push(window.setTimeout(run, 6000));
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const updateScale = () => {
    const mpp = api.current?.metersPerPixel();
    if (!mpp || !scaleBar.current || !scaleText.current) return;
    const km = SCALE_STEPS_KM.find((k) => (k * 1000) / mpp >= 48) ?? 100;
    scaleBar.current.style.width = `${((km * 1000) / mpp).toFixed(0)}px`;
    scaleText.current.textContent = `${km} km`;
  };

  const pick = (i: number) => {
    setPicked(i);
    setHovered(null);
    api.current?.flyTo(PORTALS[i], { zoomOffset: narrow ? 1 : 1.3 });
  };
  const resetView = () => {
    setPicked(null);
    api.current?.fitAll();
  };

  return (
    <section ref={section} id={SECTION_IDS.territory} data-tone="photo" aria-label="Territorio" className="relative overflow-clip bg-night text-white lg:h-dvh lg:min-h-[640px]">
      <div className="flex flex-col gap-8 px-[clamp(24px,4vw,64px)] pb-[clamp(72px,12vw,96px)] pt-[112px] lg:h-full lg:flex-row lg:py-0">
        {/* Text column (desktop) — its children join the column flow below 1024 px (display: contents) */}
        <div className="pointer-events-none relative z-[3] contents lg:flex lg:h-full lg:w-[min(28vw,380px)] lg:flex-none lg:flex-col lg:justify-between lg:gap-8 lg:pb-12 lg:pt-[140px]">
          <div className="pointer-events-auto order-0 flex flex-col gap-6">
            <div className="eyebrow text-sage">Territorio</div>
            <h2 className="title-display m-0 text-[clamp(44px,4.4vw,72px)] leading-[0.88] [text-wrap:balance]">Ocho puertas a un mismo estero</h2>
            <p className="m-0 max-w-[360px] text-[17px] leading-[1.55] text-sage [text-wrap:pretty]">
              Más de un millón de hectáreas de lagunas, esteros y embalsados en el centro de Corrientes. Cada acceso tiene su camino, su paisaje y su gente.
            </p>
          </div>

          {/* Portal strip (below 1024 px) */}
          <div
            role="group"
            aria-label="Elegí un portal"
            className="pointer-events-auto order-2 flex gap-6 overflow-x-auto [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
            style={{ marginInline: `calc(-1 * ${GUTTER})`, paddingInline: GUTTER }}
          >
            {PORTALS.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pick(i)}
                  className="flex-none border-none bg-[linear-gradient(#FFFFFF,#FFFFFF)] bg-left-bottom bg-no-repeat px-0 py-3 text-[15px] font-medium leading-none transition-[color,background-size] duration-[600ms]"
                  style={{ color: on ? "#FFFFFF" : "#8FA89A", backgroundSize: `${on ? 100 : 0}% 1px` }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Active portal card */}
          <div className="pointer-events-auto relative order-3 grid w-[min(100%,420px)] rounded-[12px] border border-white/10 bg-[rgba(12,20,16,.55)] px-6 py-5 shadow-[inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-[18px] backdrop-saturate-[1.2] lg:w-full">
            {PORTALS.map((p, i) => (
              <PortalCard key={p.id} portal={p} index={i} active={i === active} onOpen={() => openPortal(p.id)} />
            ))}
          </div>
        </div>

        {/* Map stage */}
        <div
          data-map-stage=""
          className="relative z-[1] order-1 -mx-[clamp(24px,4vw,64px)] h-[min(108vw,560px)] flex-none overflow-hidden bg-night tab:h-[min(72vw,620px)] lg:absolute lg:inset-0 lg:m-0 lg:h-auto"
        >
          <div
            className="absolute inset-0"
            style={{ opacity: ready && introStage >= 1 ? 1 : 0, transform: `scale(${ready && introStage >= 1 ? 1 : 1.03})`, transition: `opacity 1.2s ${EASE}, transform 1.4s ${EASE}` }}
          >
            <MapView
              label="Mapa satelital del Iberá con los ocho portales"
              layerClassName="z-[2] transition-opacity duration-[600ms]"
              points={PORTALS}
              padding={() => mainPadding(window.innerWidth)}
              pitch={narrow ? 0 : MAIN_PITCH}
              dragPan={!narrow}
              attempt={attempt}
              api={api}
              onStatusChange={(s) => {
                setStatus(s);
                if (s === "ready") updateScale();
              }}
              onMove={updateScale}
              pointZ={(p, i) => (i === active ? 3 : hovered === p.id ? 2 : 1)}
              renderPoint={(p, i) => (
                <PortalPin
                  portal={p}
                  index={i}
                  active={i === active}
                  hovered={hovered === p.id}
                  shown={i < shownPins && ready}
                  showLabel={introDone && (i === active || (hovered === p.id && !narrow))}
                  narrow={narrow}
                  onPick={() => pick(i)}
                  onHover={(on) => setHovered(on ? p.id : null)}
                />
              )}
            />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_24px_#0B100E]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(11,16,14,.92)_0%,rgba(11,16,14,.7)_24%,rgba(11,16,14,0)_42%),linear-gradient(0deg,rgba(11,16,14,.55)_0%,rgba(11,16,14,0)_16%)] lg:block"
          />

          {status === "loading" && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center lg:pl-[min(34vw,460px)]">
              <span className="eyebrow flex items-center gap-2.5 text-sage">
                <span className="h-1.5 w-1.5 animate-[ib-breathe_1.6s_ease-in-out_infinite] rounded-full bg-mint" />
                Cargando territorio…
              </span>
            </div>
          )}
          {status === "error" && (
            <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center lg:pl-[min(34vw,460px)]">
              <div role="alert" className="pointer-events-auto m-6 flex max-w-[340px] flex-col gap-4 rounded-[12px] border border-white/10 bg-[rgba(11,16,14,.7)] p-6 backdrop-blur-[12px]">
                <div className="text-[17px] font-medium leading-[1.35] text-white">No pudimos cargar el mapa interactivo.</div>
                <div className="text-sm leading-[1.45] text-sage">Revisá tu conexión. El resto de la página sigue funcionando.</div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("loading");
                      setAttempt((a) => a + 1);
                    }}
                    className="rounded-full border-none bg-cloud px-5 py-3 text-sm font-medium leading-none text-night"
                  >
                    Reintentar
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToSection(SECTION_IDS.portals)}
                    className="border-none bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat px-0 pb-[5px] pt-0 text-sm font-medium leading-none text-white"
                  >
                    Ver portales
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Compass */}
          <div
            className="pointer-events-none absolute top-4 flex items-center gap-3 transition-opacity duration-[800ms] lg:top-[104px]"
            style={{ right: GUTTER, opacity: introStage >= 1 ? 1 : 0 }}
          >
            <span className="eyebrow text-right text-[11px] leading-[1.4] text-sage">
              Corrientes
              <br />
              Argentina
            </span>
            <span className="flex h-9 w-9 flex-col items-center justify-center gap-px rounded-full border border-white/[.18] text-cloud">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20V4M6 10l6-6 6 6" />
              </svg>
              <span className="text-[9px] font-semibold leading-none">N</span>
            </span>
          </div>

          {/* Zoom / reset */}
          <div
            className="absolute top-16 z-[4] flex flex-col overflow-hidden rounded-[12px] border border-white/10 bg-[rgba(11,16,14,.7)] backdrop-blur-[12px] transition-opacity duration-[800ms] lg:top-[calc(50%-66px)]"
            style={{ right: GUTTER, opacity: ready && introStage >= 1 ? 1 : 0, pointerEvents: ready ? "auto" : "none" }}
          >
            <MapControl label="Acercar" onClick={() => api.current?.zoomBy(1)}>
              <path d="M12 5v14M5 12h14" />
            </MapControl>
            <MapControl label="Alejar" onClick={() => api.current?.zoomBy(-1)} divided>
              <path d="M5 12h14" />
            </MapControl>
            <MapControl label="Ver todo Iberá" onClick={resetView} divided size={18}>
              <circle cx="12" cy="12" r="6" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </MapControl>
          </div>

          {/* Legend, scale, note */}
          <div
            className="pointer-events-none absolute bottom-4 flex flex-col items-end gap-3 transition-opacity duration-[800ms] lg:bottom-8"
            style={{ right: GUTTER, opacity: introStage >= 1 ? 1 : 0 }}
          >
            <div className="hidden flex-wrap justify-end gap-x-5 gap-y-2 text-[11px] font-medium leading-none text-[#C9D5CE] [text-shadow:0_1px_8px_rgba(0,0,0,.8)] lg:flex">
              <LegendItem dashed={false}>Portal</LegendItem>
              <LegendItem dashed>Referencia de área protegida</LegendItem>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium leading-none text-cloud [text-shadow:0_1px_8px_rgba(0,0,0,.8)]">
              <span ref={scaleBar} data-scalebar="" className="block h-[5px] w-[60px] border border-t-0 border-[rgba(238,242,238,.8)]" />
              <span ref={scaleText} data-scaletxt="">
                20 km
              </span>
            </div>
            <div className="max-w-[340px] text-right text-[11px] leading-[1.45] text-[#C9D5CE] [text-shadow:0_1px_8px_rgba(0,0,0,.9)]">
              Imagen satelital de referencia, no en tiempo real. Portales ubicados por coordenadas de referencia.
              <br />
              <span className="text-sage">{attribution()}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PortalCard({ portal, index, active, onOpen }: { portal: Portal; index: number; active: boolean; onOpen: () => void }) {
  const status = roadStatusOf(portal.id);
  const reference = isReferenceArea(portal);
  return (
    <div
      aria-hidden={!active}
      inert={!active}
      className="flex flex-col gap-3 [grid-area:1/1]"
      style={{
        opacity: active ? 1 : 0,
        visibility: active ? "visible" : "hidden",
        transform: `translateY(${active ? 0 : 8}px)`,
        transition: `opacity .5s ${EASE}, transform .6s ${EASE}, visibility .5s`,
      }}
    >
      <div className="eyebrow flex justify-between text-sage">
        <span>{reference ? "Parque Nacional" : "Portal"}</span>
        <span>{String(index + 1).padStart(2, "0")} / 08</span>
      </div>
      <div className="title-display text-[32px] leading-[0.9]">{portal.name}</div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] leading-[1.3] text-cloud">{portal.locality}</span>
        <span className="text-[13px] leading-[1.3] text-sage [font-variant-numeric:tabular-nums]">{formatDegrees(portal.lat, portal.lng)}</span>
        <span className="text-xs leading-[1.3] text-sage">
          {reference ? "Referencia del área protegida, no es un acceso exacto" : "Coordenada de referencia del portal"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <span className="flex items-center gap-2 text-sm font-medium leading-none">
          <Dot color={status.dot} />
          Camino hoy: {status.label}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 border-none bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1px] bg-left-bottom bg-no-repeat px-0 pb-[5px] pt-0 text-sm font-medium leading-none text-white transition-[gap] duration-[450ms] hover:gap-3"
          style={{ transitionTimingFunction: SPRING }}
        >
          Explorar<span>→</span>
        </button>
      </div>
    </div>
  );
}

interface PortalPinProps {
  portal: Portal;
  index: number;
  active: boolean;
  hovered: boolean;
  shown: boolean;
  showLabel: boolean;
  narrow: boolean;
  onPick: () => void;
  onHover: (on: boolean) => void;
}

// Pin + label exactly as v6 (`pins` in renderVals).
function PortalPin({ portal, active, hovered, shown, showLabel, narrow, onPick, onHover }: PortalPinProps) {
  const reference = isReferenceArea(portal);
  const ring = active ? 26 : 16;
  const dot = active ? 9 : 6;
  // Below 1024 px v6 places labels by longitude instead of the hand-tuned offsets.
  const align = narrow ? (portal.lng > -57.2 ? "right" : "left") : portal.label.align;
  const lx = narrow ? (align === "right" ? -16 : 16) : portal.label.offsetX;
  const ly = narrow ? -24 : portal.label.offsetY;
  return (
    <>
      <button
        type="button"
        onClick={onPick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-label={`${reference ? "Parque Nacional" : "Portal"} ${portal.name}, ${portal.locality}`}
        aria-pressed={active}
        tabIndex={shown ? 0 : -1}
        className="pointer-events-auto absolute -left-[22px] -top-[22px] flex h-11 w-11 items-center justify-center rounded-full border-none bg-transparent p-0"
        style={{
          opacity: shown ? 1 : 0,
          transform: `scale(${shown ? (hovered && !active ? 1.15 : 1) : 0.4})`,
          transition: `opacity .6s ${EASE}, transform .45s ${SPRING}`,
        }}
      >
        {active && <span className="absolute left-[13px] top-[13px] h-[18px] w-[18px] animate-[ib-pulse_3s_cubic-bezier(.2,.7,.2,1)_infinite] rounded-full border border-mint" />}
        <span
          className="absolute left-1/2 top-1/2 box-border rounded-full border"
          style={{
            width: ring,
            height: ring,
            margin: `${-ring / 2}px 0 0 ${-ring / 2}px`,
            borderStyle: reference ? "dashed" : "solid",
            borderColor: active ? "rgba(0,213,138,.85)" : "rgba(255,255,255,.55)",
            transition: `width .45s ${SPRING}, height .45s ${SPRING}, margin .45s ${SPRING}, border-color .45s`,
          }}
        />
        <span
          className="rounded-full shadow-[0_0_8px_rgba(0,0,0,.55)]"
          style={{ width: dot, height: dot, background: active ? "#00D58A" : "#FFFFFF", transition: `width .45s ${SPRING}, height .45s ${SPRING}, background-color .45s` }}
        />
      </button>
      <div
        className="pointer-events-none absolute flex flex-col gap-1 whitespace-nowrap rounded-[8px] border border-white/10 bg-[rgba(11,16,14,.7)] px-3 py-2 backdrop-blur-[12px]"
        style={{
          left: lx,
          top: ly,
          alignItems: align === "right" ? "flex-end" : "flex-start",
          textAlign: align === "right" ? "right" : "left",
          opacity: showLabel ? 1 : 0,
          transform: `translate(${align === "right" ? "calc(-100% - 6px)" : "6px"},-50%) translateY(${showLabel ? 0 : 5}px)`,
          transition: `opacity .45s ${EASE}, transform .55s ${EASE}`,
        }}
      >
        <span className="title-display text-[17px] leading-[0.95] text-white">{portal.name}</span>
        <span className="text-xs leading-[1.2] text-[#C9D5CE]">{portal.locality}</span>
      </div>
    </>
  );
}

function MapControl({ label, onClick, divided = false, size = 16, children }: { label: string; onClick: () => void; divided?: boolean; size?: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center border-none bg-transparent p-0 text-cloud hover:bg-white/[.08] ${divided ? "border-t border-solid border-white/10" : ""}`}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={size === 18 ? 1.6 : 1.7} strokeLinecap="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}

function LegendItem({ dashed, children }: { dashed: boolean; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-3 w-3 items-center justify-center rounded-full border border-white/60" style={{ borderStyle: dashed ? "dashed" : "solid" }}>
        <span className="h-1 w-1 rounded-full bg-white" />
      </span>
      {children}
    </span>
  );
}
