import { HOTSPOTS, SCENE_HEIGHT, SCENE_WIDTH, type Hotspot } from "./hotspots";

// water-signs (Señales en el agua): the numbers of the mechanic, derived from the scene's zones. Pure: no Phaser and
// no DOM, so it can be imported in Node. The zones themselves (ids, kinds, coordinates) come from hotspots.ts, which is
// generated together with scene.webp by the art pipeline (scripts/water-signs/): never edit them here.

export const SCENE = { width: SCENE_WIDTH, height: SCENE_HEIGHT } as const;

/** bg2 frame around the scene in the 4:5 design (design px): the scene shows at 688 × 860. 16:9: bg2 side bands. */
export const FRAME = 16;

export type SignalId =
  | "dead-fish"
  | "oil-sheen"
  | "bottom-bubbling"
  | "persistent-foam"
  | "dead-vegetation"
  | "algae-bloom"
  | "buried-waste"
  | "murky-patch";

export type DistractorId = "tannin-water" | "camalote" | "irupe" | "caiman" | "capybara" | "sunken-log" | "stirred-mud";

export type ElementId = SignalId | DistractorId;

/** A zone of the scene with its id narrowed to the specification's elements. */
export type Zone = (Hotspot & { id: SignalId; kind: "signal" }) | (Hotspot & { id: DistractorId; kind: "distractor" });

/** The 15 zones, as hotspots.ts declares them (every id is one of the specification's elements). */
export const ZONES = HOTSPOTS as readonly Zone[];

/** Points per signal: they measure how serious it is, not how hard it is to find (specification). Max 185. */
export const POINTS: Record<SignalId, number> = {
  "dead-fish": 40,
  "oil-sheen": 30,
  "bottom-bubbling": 25,
  "persistent-foam": 25,
  "dead-vegetation": 20,
  "algae-bloom": 20,
  "buried-waste": 15,
  "murky-patch": 10,
};

/** Signals in the scene: result.total, in every difficulty. */
export const TOTAL = ZONES.filter((z) => z.kind === "signal").length;

/** Marks per difficulty (the only thing the difficulty changes). */
export const MARKS: Record<string, number> = { calm: 12, normal: 10, fast: 8 };
export const DEFAULT_DIFFICULTY = "calm";

export const marksFor = (difficulty: string | undefined) => MARKS[difficulty ?? DEFAULT_DIFFICULTY] ?? MARKS[DEFAULT_DIFFICULTY];

/** Announce the marks left when this many or fewer remain (specification). */
export const MARKS_WARNING = 3;

/**
 * Keyboard crosshair (shared/crosshair.ts), scene px: starts at the center; one arrow press moves exactly `step`
 * (specification); held for holdDelayMs it moves by itself at `speed`, up to `maxSpeed` over rampMs. Calibrated in /play.
 */
export const CROSSHAIR = { startX: 360, startY: 450, step: 20, holdDelayMs: 300, speed: 360, maxSpeed: 900, rampMs: 600 } as const;

/** A pointer marks on release only if it moved at most this (design px) since it went down: a swipe never marks. */
export const TAP_SLOP = 16;

/** The marker's entrance (shared/motion.ts appear): the game's only non-essential motion. */
export const MARKER_APPEAR_MS = 150;

/** The zone under a point (scene px), or null: empty water. */
export function zoneAt(x: number, y: number): Zone | null {
  return ZONES.find((z) => Math.hypot(x - z.x, y - z.y) <= z.r) ?? null;
}

/** Hits and score of a set of marked zones: only signals count; distractors and unknown ids count for nothing. */
export function scoreOf(markedIds: readonly string[]): { hits: number; score: number } {
  const found = ZONES.filter((z): z is Extract<Zone, { kind: "signal" }> => z.kind === "signal" && markedIds.includes(z.id));
  return { hits: found.length, score: found.reduce((sum, z) => sum + POINTS[z.id], 0) };
}

/** What the observation hands to the review (onRunEnd). */
export interface ObservationSummary {
  difficulty: string;
  marks: number;
  found: SignalId[];
  distractors: DistractorId[];
  hits: number;
  total: number;
  score: number;
}
