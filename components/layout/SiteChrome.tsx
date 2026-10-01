"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useLandingScroll } from "@/hooks/useLandingScroll";
import { useTheme } from "@/hooks/useTheme";
import { NAV_LINKS, SECTION_IDS } from "@/lib/data/copy";
import { ROAD_STATUS_BY_PORTAL } from "@/lib/data/road-status";
import { Logo } from "./Logo";

const GUTTER = "clamp(24px,4vw,64px)"; // v6 constant `G`
const MENU_LINKS = [...NAV_LINKS, { label: "Reportar", target: SECTION_IDS.act }];
const openRoads = Object.values(ROAD_STATUS_BY_PORTAL).filter((s) => s === "open").length;
const totalRoads = Object.keys(ROAD_STATUS_BY_PORTAL).length;

/** Fixed header, full-screen mobile menu and the floating "Caminos hoy" band (Ibera Landing v6). */
export function SiteChrome() {
  const { scrolled, tone, activeNav, bandVisible } = useLandingScroll();
  const { isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // Colors exactly as v6 computes them (navFg, navInk, navBg, navLine, navLineStrong).
  const onPhoto = tone === "photo";
  const fg = onPhoto || isDark ? "#FFFFFF" : "var(--head)";
  const ink = onPhoto || isDark ? "#0B100E" : "#FFFFFF";
  const lineStrong = onPhoto || isDark ? "rgba(255,255,255,.3)" : "rgba(0,62,37,.3)";
  const background = !scrolled ? "rgba(11,16,14,0)" : onPhoto ? "rgba(11,16,14,.42)" : "var(--navglass)";
  const line = !scrolled ? "rgba(255,255,255,0)" : onPhoto ? "rgba(255,255,255,.08)" : "var(--navline)";
  const blur = scrolled ? "blur(18px) saturate(120%)" : "none";

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-[60] flex h-[76px] items-center justify-between gap-6 border-b"
        style={{
          paddingInline: GUTTER,
          background,
          borderColor: line,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          transition: "background-color .5s, border-color .5s",
        }}
      >
        <a
          href={`#${SECTION_IDS.hero}`}
          aria-label="Iberá, inicio"
          className="flex animate-[ib-fadeup_1s_var(--ease-soft)_.25s_both] items-center gap-3.5 no-underline hover:opacity-90"
          style={{ color: fg, transition: "color .5s" }}
        >
          <Logo className="h-8 w-[60px]" color={fg} />
          <span className="flex flex-col items-start gap-1 border-l pl-3.5 text-left" style={{ borderColor: lineStrong }}>
            <span className="title-display text-[18px] leading-[0.9]">Iberá</span>
            <span className="text-[11px] font-medium uppercase leading-none tracking-[.08em] opacity-75">Corrientes · Argentina</span>
          </span>
        </a>

        <div className="flex items-center gap-[clamp(16px,2.6vw,36px)]">
          <nav aria-label="Principal" className="hidden items-center gap-[34px] lg:flex">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.target}
                href={`#${link.target}`}
                aria-current={i === activeNav ? "true" : undefined}
                className="link-underline py-2 text-[15px] font-medium leading-none no-underline"
                style={{ color: fg, transition: "color .5s, background-size .6s cubic-bezier(.2,.7,.2,1)" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href={`#${SECTION_IDS.act}`}
              className="flex h-10 items-center rounded-[10px] px-[18px] text-[15px] font-medium leading-none no-underline transition-transform duration-[350ms] hover:scale-[1.015]"
              style={{ background: fg, color: ink }}
            >
              Reportar
            </a>
          </nav>
          <ThemeToggle color={fg} borderColor={lineStrong} />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="border-none bg-transparent py-2.5 text-base font-medium leading-none lg:hidden"
            style={{ color: fg }}
          >
            Menú
          </button>
        </div>
      </header>

      {/* Full-screen menu (v6, < 1024 px) */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className="fixed inset-0 z-[80] flex flex-col bg-[#002E1D] pb-12 text-white"
        style={{
          paddingInline: GUTTER,
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? "visible" : "hidden",
          transform: `translateY(${menuOpen ? 0 : -12}px)`,
          transition: "opacity .55s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1), visibility .55s",
        }}
      >
        <div className="flex h-[76px] items-center justify-between">
          <span className="title-display text-[18px] leading-none">Iberá</span>
          <button type="button" onClick={() => setMenuOpen(false)} className="border-none bg-transparent py-2.5 text-base font-medium leading-none text-white">
            Cerrar
          </button>
        </div>
        <nav aria-label="Secciones" className="mt-auto flex flex-col gap-1">
          {MENU_LINKS.map((link, i) => (
            <span key={link.target} className="block overflow-hidden">
              <a
                href={`#${link.target}`}
                onClick={() => setMenuOpen(false)}
                className="title-display block py-2 text-left text-[clamp(44px,12vw,64px)] leading-[0.95] text-white no-underline hover:text-white"
                style={{
                  transform: `translateY(${menuOpen ? 0 : 100}%)`,
                  transition: `transform .8s cubic-bezier(.2,.7,.2,1) ${menuOpen ? (0.12 + i * 0.06).toFixed(2) : 0}s`,
                }}
              >
                {link.label}
              </a>
            </span>
          ))}
        </nav>
        <div className="eyebrow mt-8 border-t border-white/[.14] pt-6 leading-[1.4] text-sage">Gran Parque Iberá · Corrientes, Argentina</div>
      </div>

      {/* Floating band (v6 `bandOn`) */}
      <a
        href={`#${SECTION_IDS.roads}`}
        aria-hidden={!bandVisible}
        tabIndex={bandVisible ? 0 : -1}
        className="fixed bottom-6 z-[55] flex h-11 items-center gap-2.5 rounded-[12px] border border-white/10 bg-[rgba(12,20,16,.55)] px-4 text-sm font-medium leading-none text-white no-underline shadow-[inset_0_1px_rgba(255,255,255,.05)] hover:gap-3.5 hover:text-white"
        style={{
          left: "clamp(16px,4vw,64px)",
          backdropFilter: "blur(18px) saturate(120%)",
          WebkitBackdropFilter: "blur(18px) saturate(120%)",
          opacity: bandVisible ? 1 : 0,
          pointerEvents: bandVisible ? "auto" : "none",
          transition: "gap .45s cubic-bezier(.3,1.2,.4,1), opacity .4s",
        }}
      >
        <span className="h-[7px] w-[7px] rounded-full bg-leaf" />
        {/* Separate flex items, as in v6, so the 10 px gap spaces the count */}
        <span>Caminos hoy:</span>
        <span>{openRoads}</span>
        <span>de {totalRoads} transitables</span>
        <span className="opacity-70">→</span>
      </a>
    </>
  );
}
