"use client";

import { GameStage } from "@/components/games/GameStage";
import { scrollToSection, useLanding } from "@/context/LandingContext";
import { SECTION_IDS } from "@/lib/data/copy";
import { GAMES } from "@/lib/data/games";
import { PORTALS } from "@/lib/data/portals";
import { REGISTRY } from "@/lib/games/registry";
import { useGameProgress } from "@/lib/storage/game-progress";

// "Aprender jugando" (v6 #jugar, plan §2.4): the index of the four topics and the game stage. The minigames are
// redesigned, not copied from v6 (guide §10): each one is a Phaser module behind the single wrapper GameStage, which
// loads Phaser lazily (600 px before the stage shows) and mounts a game only on "Empezar". Two topics play
// (clean-channels, water-signs); the other two show "Próximamente". Changing topic fades in the DOM (opacity only):
// the wrapper is keyed by game, so the previous game is destroyed before the next one can mount. Nothing here moves
// per frame, nothing has a transform and nothing carries data-cursor (the game's area keeps the native cursor).
export function Play() {
  const { gameId, openGame, portalId: sheetPortalId } = useLanding();
  const progress = useGameProgress();

  // Portal shown with the game (P4, display only): the one open in the sheet when it belongs to this game (entry from
  // "Aprendelo jugando"), otherwise the game's home portal (entry from the index).
  const sheetPortal = PORTALS.find((p) => p.id === sheetPortalId);
  const portalId = sheetPortal?.game === gameId ? sheetPortal.id : (GAMES.find((g) => g.id === gameId)?.portalId ?? sheetPortalId);

  return (
    <section id={SECTION_IDS.play} data-tone="surface" aria-label="Aprender jugando" className="bg-page-2 text-fg">
      <div className="flex flex-col gap-12 py-28 lg:py-36" style={{ paddingInline: "clamp(24px,4vw,64px)" }}>
        <header className="flex flex-col gap-3">
          <span className="eyebrow text-mute">Aprender · Desafío Iberá</span>
          <h2 className="title-display m-0 max-w-[1100px] text-[clamp(44px,6vw,104px)] leading-[0.9] text-head [text-wrap:balance]">
            Lo que se hace en el estero, se aprende jugando
          </h2>
        </header>

        <div role="group" aria-label="Temas" className="grid grid-cols-1 gap-3 tab:grid-cols-2 lg:grid-cols-4">
          {GAMES.map((game) => {
            const selected = game.id === gameId;
            const playable = REGISTRY[game.id].status === "ready";
            const saved = progress[game.id];
            return (
              <button
                key={game.id}
                type="button"
                data-game-card={game.id}
                aria-pressed={selected}
                onClick={() => openGame(game.id, { scroll: false })}
                className={`flex flex-col items-start gap-3 rounded-[12px] border p-5 text-left transition-colors duration-300 ${
                  selected ? "border-head bg-page" : "border-rule bg-transparent hover:border-mute"
                }`}
              >
                <span className="eyebrow text-mute">{game.meta}</span>
                <span className="title-display text-[clamp(26px,2.4vw,34px)] leading-[0.95] text-head">{game.title}</span>
                <span className="text-[15px] leading-snug text-mute">{game.description}</span>
                <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[14px]">
                  <span className={`eyebrow rounded-[4px] px-2 py-1 ${playable ? "bg-mint text-night" : "border border-rule text-mute"}`}>
                    {playable ? "Jugar" : "Próximamente"}
                  </span>
                  {saved && (
                    <span className="text-mute">
                      Mejor: {saved.hits} / {saved.total} · {saved.score} puntos
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mx-auto w-full max-w-[1180px]">
          <GameStage gameId={gameId} portalId={portalId} onReport={() => scrollToSection(SECTION_IDS.act)} />
        </div>
      </div>
    </section>
  );
}
