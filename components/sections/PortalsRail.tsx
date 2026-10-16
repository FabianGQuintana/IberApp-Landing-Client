"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { Dot, RoundArrowButton, TextAction } from "@/components/ui/Controls";
import { Reveal } from "@/components/ui/Reveal";
import { useLanding } from "@/context/LandingContext";
import { SECTION_IDS } from "@/lib/data/copy";
import { IMAGES } from "@/lib/data/images";
import { roadStatusOf } from "@/lib/data/portal-status";
import { PORTALS } from "@/lib/data/portals";

const GUTTER = "clamp(24px,4vw,64px)";

// "Portales" (v6 #portales): horizontal scroll-snap rail with arrows and a progress bar.
// Each card's photo slides against the scroll and brightens as the card reaches the left edge (v6 onRailScroll);
// the "Ver portal" cursor comes from data-cursor + <CustomCursor />.
export function PortalsRail() {
  const { openPortal } = useLanding();
  const rail = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const frame = useRef(0);
  const opening = useRef<string | null>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startScrollLeft: number;
    lastX: number;
    lastTime: number;
    velocityX: number;
    dragging: boolean;
  } | null>(null);
  const suppressClick = useRef(false);
  const finishSnap = useRef<(() => void) | null>(null);

  const animateSnap = (r: HTMLDivElement, destination: number) => {
  finishSnap.current?.();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    r.scrollTo({ left: destination, behavior: "instant" });
    delete r.dataset.snapDisabled;
    return;
  }

  const finish = () => {
    window.clearTimeout(timer);
    r.removeEventListener("scrollend", onScrollEnd);
    delete r.dataset.snapDisabled;
    if (finishSnap.current === finish) finishSnap.current = null;
  };

  const onScrollEnd = () => {
    if (Math.abs(r.scrollLeft - destination) < 2) finish();
  };

  const timer = window.setTimeout(finish, 1200);
  finishSnap.current = finish;
  r.addEventListener("scrollend", onScrollEnd);
  r.scrollTo({ left: destination, behavior: "smooth" });
};

  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    if (finishSnap.current) {
      finishSnap.current();
      event.currentTarget.scrollTo({
        left: event.currentTarget.scrollLeft,
        behavior: "instant",
      });
    }
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
      dragging: false,
    };
  };

  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    const r = rail.current;
    if (!current || !r || current.pointerId !== event.pointerId) return;
    const distance = event.clientX - current.startX;
    const elapsed = Math.max(1, event.timeStamp - current.lastTime);
    current.velocityX = (event.clientX - current.lastX) / elapsed;
    current.lastX = event.clientX;
    current.lastTime = event.timeStamp;
    if (!current.dragging && Math.abs(distance) > 6) {
      current.dragging = true;
      finishSnap.current?.();
      r.scrollTo({ left: r.scrollLeft, behavior: "instant" });
      r.setPointerCapture(event.pointerId);
      r.dataset.dragging = "true";
      r.dataset.snapDisabled = "true";
      r.style.userSelect = "none";
    }
    if (current.dragging) {
      event.preventDefault();
      r.scrollLeft = current.startScrollLeft - distance;
    }
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const current = drag.current;
    const r = rail.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.dragging && !cancelled) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
    if (current.dragging) {
      if (r) {
        delete r.dataset.dragging;
        r.style.userSelect = "";
        if (!cancelled) {
          const cards = Array.from(
            r.querySelectorAll<HTMLElement>("[data-card]"),
          );
          const railLeft = r.getBoundingClientRect().left;
          const paddingLeft = parseFloat(getComputedStyle(r).paddingLeft) || 0;
          const maxScroll = Math.max(0, r.scrollWidth - r.clientWidth);
          const snapPoints = cards.map((card) =>
            Math.max(
              0,
              Math.min(
                maxScroll,
                r.scrollLeft +
                  card.getBoundingClientRect().left -
                  railLeft -
                  paddingLeft,
              ),
            ),
          );
          const startIndex = snapPoints.reduce(
            (closest, point, index) =>
              Math.abs(point - current.startScrollLeft) <
              Math.abs(snapPoints[closest] - current.startScrollLeft)
                ? index
                : closest,
            0,
          );
          const direction = event.clientX < current.startX ? 1 : -1;
          const targetIndex = Math.max(
            0,
            Math.min(snapPoints.length - 1, startIndex + direction),
          );
          let destination = snapPoints[startIndex] ?? r.scrollLeft;
          if (targetIndex !== startIndex) {
            const distanceToTarget =
              snapPoints[targetIndex] - snapPoints[startIndex];
            const progress =
              (r.scrollLeft - snapPoints[startIndex]) / distanceToTarget;
            const flickedFarEnough =
              Math.abs(event.clientX - current.startX) > 35 &&
              Math.abs(current.velocityX) > 0.5 &&
              (event.clientX - current.startX) * current.velocityX > 0;
            if (progress >= 0.22 || flickedFarEnough) {
              destination = snapPoints[targetIndex];
            }
          }
          animateSnap(r, destination);
        } else {
          finishSnap.current?.();
          delete r.dataset.snapDisabled;
        }
      }
    }
    drag.current = null;
  };

  const preventClickAfterDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  // Progress bar: width = visible share, left = scroll position. Cards: parallax, brightness and caption fade.
  const updateRail = useCallback(() => {
    frame.current = 0;
    const r = rail.current;
    const b = bar.current;
    if (!r || !b) return;
    const visible = r.clientWidth / r.scrollWidth;
    const p = r.scrollLeft / Math.max(1, r.scrollWidth - r.clientWidth);
    b.style.width = `${(visible * 100).toFixed(1)}%`;
    b.style.left = `${(p * (1 - visible) * 100).toFixed(1)}%`;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rr = r.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(r).paddingLeft) || 0;
    r.querySelectorAll<HTMLElement>("[data-card]").forEach((card) => {
      const cr = card.getBoundingClientRect();
      const d = (cr.left - rr.left - pad) / Math.max(1, cr.width);
      const f = Math.max(0, 1 - Math.abs(d));
      const img = card.querySelector<HTMLElement>("[data-cimg]");
      const cap = card.querySelector<HTMLElement>("[data-ccap]");
      if (img && card.dataset.card !== opening.current) {
        img.style.transform = `translate3d(${(-Math.max(-1, Math.min(1, d)) * 5).toFixed(2)}%,0,0) scale(${(1.025 - 0.025 * f).toFixed(4)})`;
        img.style.filter = `brightness(${(0.85 + 0.15 * f).toFixed(3)})`;
      }
      if (cap) cap.style.opacity = (0.6 + 0.4 * f).toFixed(3);
    });
  }, []);
  const scheduleRail = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(updateRail);
  }, [updateRail]);
  useEffect(() => {
    scheduleRail();
    window.addEventListener("resize", scheduleRail);
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      window.removeEventListener("resize", scheduleRail);
      finishSnap.current?.();
    };
  }, [scheduleRail]);

  // Opening a card: its photo swells for a beat, then the sheet takes over (v6 openFromRail).
  const openFromRail = (id: string, e: MouseEvent<HTMLElement>) => {
    const card = e.currentTarget.closest<HTMLElement>("[data-card]");
    const img = card?.querySelector<HTMLElement>("[data-cimg]");
    if (
      !card ||
      !img ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      openPortal(id);
      return;
    }
    opening.current = card.dataset.card ?? null;
    img.style.transition =
      "transform .6s cubic-bezier(.2,.7,.2,1), filter .6s cubic-bezier(.2,.7,.2,1)";
    img.style.transform = "scale(1.06)";
    img.style.filter = "brightness(1.06)";
    window.setTimeout(() => openPortal(id), 420);
    window.setTimeout(() => {
      opening.current = null;
      img.style.transition = "";
      scheduleRail();
    }, 1600);
  };

  const scrollBy = (dir: 1 | -1) =>
    rail.current?.scrollBy({
      left: dir * rail.current.clientWidth * 0.6,
      behavior: "smooth",
    });

  return (
    <section
      id={SECTION_IDS.portals}
      data-tone="surface"
      aria-label="Portales"
      className="bg-page pb-[clamp(72px,12vw,160px)] pt-[clamp(64px,10vw,128px)]"
    >
      <div
        className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6"
        style={{ paddingInline: GUTTER }}
      >
        <div className="flex max-w-[720px] flex-col gap-4">
          <div className="eyebrow text-mute">Portales</div>
          <Reveal
            lines
            as="h2"
            className="m-0 text-[clamp(40px,4.4vw,68px)] font-medium leading-[1.04] text-head [&_[data-line]]:pb-[.06em]"
          >
            <>Explorá las puertas</>
            <>de entrada al Iberá.</>
          </Reveal>
        </div>
        <div className="flex gap-3">
          <RoundArrowButton
            direction="left"
            aria-label="Portal anterior"
            onClick={() => scrollBy(-1)}
          />
          <RoundArrowButton
            direction="right"
            aria-label="Portal siguiente"
            onClick={() => scrollBy(1)}
          />
        </div>
      </div>

      <div
        ref={rail}
        onScroll={scheduleRail}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={(event) => endDrag(event, true)}
        onClickCapture={preventClickAfterDrag}
        onDragStart={(event) => event.preventDefault()}
        className="mt-16 flex cursor-grab snap-x snap-mandatory gap-[clamp(16px,2vw,32px)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden data-[dragging=true]:cursor-grabbing data-[dragging=true]:snap-none data-[snap-disabled=true]:snap-none"
        style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
      >
        {PORTALS.map((p) => {
          const status = roadStatusOf(p.id);
          return (
            <article
              key={p.id}
              data-card={p.id}
              className="flex w-[min(84vw,640px)] flex-none snap-start flex-col gap-6 lg:w-[min(58vw,880px)]"
            >
              <button
                type="button"
                onClick={(e) => openFromRail(p.id, e)}
                data-cursor="Ver portal"
                aria-label={`Ver portal ${p.name}`}
                className="relative h-[clamp(360px,64vh,680px)] overflow-hidden rounded-[2px] border-none bg-[#002E1D] p-0"
              >
                <span
                  data-cimg=""
                  className="absolute inset-y-0 -inset-x-[6%] will-change-transform"
                >
                  <Image
                    src={IMAGES[p.image].src}
                    alt={IMAGES[p.image].alt}
                    fill
                    sizes="(min-width: 1024px) 60vw, 85vw"
                    className="object-cover"
                  />
                </span>
              </button>
              <div
                data-ccap=""
                className="flex flex-wrap items-end justify-between gap-4"
              >
                <div className="flex max-w-[480px] flex-col gap-2">
                  <div className="eyebrow text-mute">{p.locality}</div>
                  <div className="title-display text-[clamp(38px,3.8vw,60px)] leading-[0.88] text-head">
                    {p.name}
                  </div>
                  <div className="text-[17px] leading-[1.45]">{p.tagline}</div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="flex items-center gap-2 text-sm font-medium leading-none text-mute">
                    <Dot color={status.dot} />
                    {status.label}
                  </span>
                  <TextAction
                    arrow="→"
                    className="text-head"
                    onClick={() => openPortal(p.id)}
                  >
                    Explorar portal
                  </TextAction>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div
        className="mx-auto mt-12 max-w-[1440px]"
        style={{ paddingInline: GUTTER }}
      >
        <div className="relative h-px bg-rule">
          <div
            ref={bar}
            data-railbar=""
            className="absolute -top-px left-0 h-0.5 w-1/5 bg-head transition-[left] duration-300 ease-[cubic-bezier(.2,.7,.2,1)]"
          />
        </div>
      </div>
    </section>
  );
}
