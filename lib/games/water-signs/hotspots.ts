// water-signs (Señales en el agua): the scene's sensitive zones and the numbers of the mechanic (user specification,
// G2·0 decisions). Pure: no Phaser and no DOM, so the judge can import it in Node (C40, C41). Every position in scene
// px (SCENE, 720 × 900); nothing is random (the seed is ignored).
//
// PROVISIONAL COORDINATES: placed by eye so the game plays on the placeholder, following the rules of the
// specification. They must be measured again on the finished scene.webp: until then G2 is not fully closed.

export const SCENE = { width: 720, height: 900 } as const;

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

export type Zone =
  | { id: SignalId; kind: "signal"; x: number; y: number; r: number }
  | { id: DistractorId; kind: "distractor"; x: number; y: number; r: number };

// Rules (specification, C40): inside 720 × 900, r ≥ 48, at least 16 px between the edges of any two zones, the 15 ids
// once each. Laid out like a lagoon seen from the shore: the far bank on top, the water in the middle, the near shore
// at the bottom. The scene's center (the crosshair's start) is empty water. tannin-water is the largest on purpose: it
// is the distractor that teaches the most and has to be the most visible.
export const ZONES: readonly Zone[] = [
  { id: "buried-waste", kind: "signal", x: 96, y: 120, r: 56 },
  { id: "dead-vegetation", kind: "signal", x: 264, y: 120, r: 56 },
  { id: "capybara", kind: "distractor", x: 432, y: 120, r: 56 },
  { id: "caiman", kind: "distractor", x: 624, y: 144, r: 56 },
  { id: "oil-sheen", kind: "signal", x: 144, y: 312, r: 56 },
  { id: "tannin-water", kind: "distractor", x: 384, y: 336, r: 72 },
  { id: "persistent-foam", kind: "signal", x: 600, y: 312, r: 56 },
  { id: "camalote", kind: "distractor", x: 96, y: 504, r: 56 },
  { id: "algae-bloom", kind: "signal", x: 264, y: 528, r: 56 },
  { id: "irupe", kind: "distractor", x: 456, y: 528, r: 56 },
  { id: "bottom-bubbling", kind: "signal", x: 624, y: 504, r: 56 },
  { id: "dead-fish", kind: "signal", x: 168, y: 696, r: 56 },
  { id: "sunken-log", kind: "distractor", x: 384, y: 720, r: 56 },
  { id: "stirred-mud", kind: "distractor", x: 600, y: 696, r: 56 },
  { id: "murky-patch", kind: "signal", x: 264, y: 840, r: 56 },
];

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
