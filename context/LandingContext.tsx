"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { SECTION_IDS } from "@/lib/data/copy";
import { PORTALS } from "@/lib/data/portals";
import type { GameId } from "@/types/portal";

interface LandingState {
  /** Portal shown in the sheet (v6: `portal`) */
  portalId: string;
  /** Selects a portal and, by default, scrolls to the sheet (v6: `openPortal`) */
  openPortal: (id: string, options?: { scroll?: boolean }) => void;
  /** Game shown in "Aprender jugando" (v6: `game`). Team pact: the games themselves are redesigned, not copied from v6 (guide §10); this selection contract stays. */
  gameId: GameId;
  /** Selects a game and scrolls to the games section (v6: `goJuegoCur`) */
  openGame: (id: GameId, options?: { scroll?: boolean }) => void;
}

const LandingContext = createContext<LandingState | null>(null);

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: reduce ? "auto" : "smooth" });
}

export function LandingProvider({ children }: { children: ReactNode }) {
  const [portalId, setPortalId] = useState(PORTALS[0].id);
  const [gameId, setGameId] = useState<GameId>("clean-channels");

  const openPortal = useCallback((id: string, { scroll = true } = {}) => {
    setPortalId(id);
    // v6 waits 30 ms so the sheet re-renders before scrolling.
    if (scroll) window.setTimeout(() => scrollToSection(SECTION_IDS.portalSheet), 30);
  }, []);

  const openGame = useCallback((id: GameId, { scroll = true } = {}) => {
    setGameId(id);
    if (scroll) scrollToSection(SECTION_IDS.play);
  }, []);

  const value = useMemo(() => ({ portalId, openPortal, gameId, openGame }), [portalId, openPortal, gameId, openGame]);
  return <LandingContext.Provider value={value}>{children}</LandingContext.Provider>;
}

export function useLanding() {
  const ctx = useContext(LandingContext);
  if (!ctx) throw new Error("useLanding must be used inside <LandingProvider>");
  return ctx;
}
