import type { GameRegistry } from "./contract";
import { meta as cleanChannelsMeta } from "./clean-channels/meta";
import { meta as waterSignsMeta } from "./water-signs/meta";

// One entry per GameId (types/portal.ts). A game becomes `ready` only once approved; until then it is coming-soon.
// Ready entries only hold pure data (meta, no Phaser) and lazy imports: the game (Phaser) and its review (plain DOM)
// load in their own chunks.
export const REGISTRY: GameRegistry = {
  "clean-channels": {
    status: "ready",
    meta: cleanChannelsMeta,
    load: () => import("./clean-channels"),
    review: () => import("@/components/games/clean-channels/Review"),
  },
  "water-signs": {
    status: "ready",
    meta: waterSignsMeta,
    load: () => import("./water-signs"),
    review: () => import("@/components/games/water-signs/Review"),
    overlay: () => import("@/components/games/water-signs/Labels"),
  },
  "dark-sky": { status: "coming-soon" },
  "night-voices": { status: "coming-soon" },
};
