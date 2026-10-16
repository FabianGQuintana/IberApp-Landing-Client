import { createRandom } from "@/lib/games/shared/random";
import { WASTE, type BinId, type WasteId } from "./meta";

// clean-channels: the run as pure data (no Phaser, importable in Node: criteria C37 and C38). Every number of the
// mechanic lives here, so tuning it never touches the scenes. Positions: logical design px (P17), times: game ms.

export type Difficulty = "calm" | "normal" | "fast";
export type Layout = "landscape" | "portrait";
export type ObstacleId = "camalote" | "log";

/** Fixed composition per difficulty (specification table): never random. */
export const COMPOSITION: Record<Difficulty, Record<WasteId, number>> = {
  calm: { batteries: 1, "oily-container": 2, styrofoam: 1, "glass-bottle": 2, "pet-bottle": 1, can: 2, "fruit-peel": 1 },
  normal: { batteries: 1, "oily-container": 2, styrofoam: 2, "glass-bottle": 2, "pet-bottle": 2, can: 2, "fruit-peel": 1 },
  fast: { batteries: 2, "oily-container": 2, styrofoam: 2, "glass-bottle": 2, "pet-bottle": 3, can: 2, "fruit-peel": 2 },
};

/**
 * Per difficulty (specification + N6, approved 11/10/2026): run length, "seconds of visibility" (time from a piece
 * appearing at the top until it reaches the kayak's line; the channel's px/s follow from it in each layout) and
 * obstacles (half camalote, half log; normal: 5 camalotes and 4 logs).
 */
export const DIFFICULTY: Record<Difficulty, { durationMs: number; visibleMs: number; obstacles: Record<ObstacleId, number> }> = {
  calm: { durationMs: 75_000, visibleMs: 3_200, obstacles: { camalote: 3, log: 3 } },
  normal: { durationMs: 75_000, visibleMs: 2_600, obstacles: { camalote: 5, log: 4 } },
  fast: { durationMs: 60_000, visibleMs: 2_000, obstacles: { camalote: 6, log: 6 } },
};

/** The channel strip (720 = bank 120 + water 480 + bank 120), centered in 16:9 with bg2 margins, full width in 4:5. */
export const CHANNEL = { width: 720, bank: 120, frame: 16 } as const;
export const STRIP_OFFSET: Record<Layout, number> = { landscape: (1280 - CHANNEL.width) / 2, portrait: 0 };
export const DESIGN_HEIGHT: Record<Layout, number> = { landscape: 720, portrait: 900 };

export const KAYAK = { width: 96, height: 140, speed: 600, fromBottom: 110, startX: CHANNEL.width / 2 } as const; // speed: px/s
/**
 * The paddler's paddle (G1b): decorative only, it never counts for picking up or hitting (the hull does). It rows the
 * whole run: rotation ±swingDeg around its center plus a small x drift a quarter cycle apart (sin / cos), one stroke
 * every cycleMs. Still with reducedMotion.
 */
export const PADDLE = { swingDeg: 34, cycleMs: 220, driftX: 6 } as const;
export const WASTE_SIZE = 72;
export const OBSTACLE_SIZE: Record<ObstacleId, { width: number; height: number }> = { camalote: { width: 120, height: 96 }, log: { width: 160, height: 72 } };
/** A piece is collected if, when it crosses the kayak's line, the centers are this close (half widths added). */
export const PICKUP_HALF_WIDTH = (KAYAK.width + WASTE_SIZE) / 2;
export const obstacleHalfWidth = (type: ObstacleId) => (KAYAK.width + OBSTACLE_SIZE[type].width) / 2;

/** Strip x ranges (centers): the kayak and the waste stay over the water, never under the banks. */
export const KAYAK_RANGE = { min: CHANNEL.bank + KAYAK.width / 2, max: CHANNEL.width - CHANNEL.bank - KAYAK.width / 2 } as const;
export const WASTE_RANGE = { min: CHANNEL.bank + WASTE_SIZE / 2, max: CHANNEL.width - CHANNEL.bank - WASTE_SIZE / 2 } as const;

/** N2 (criterion C37): max(0, |Δx| − 2R) ≤ factor · speed · Δt and Δt ≥ minGap, between consecutive pieces. */
export const SEPARATION = { factor: 0.7, minGapMs: 600 } as const;
/** Generation keeps a wider margin than N2 (Δt ≥ 1.5 s), so any consecutive pair is reachable even with control latency. */
export const SCHEDULE = { minGapMs: 1_500, firstAfterMs: 1_000, lastBeforeMs: 1_500, obstacleClearMs: 500, obstacleGapMs: 300 } as const;

export interface RunItem {
  /** "item-1"… by arrival; "obstacle-1"… by arrival. */
  id: string;
  kind: "item" | "obstacle";
  type: WasteId | ObstacleId;
  /** Design px in the given layout. */
  x: number;
  /** Game ms at which it crosses the kayak's line. */
  arriveAt: number;
  /** Right bin for waste (the id in review-option-<bin>); null for obstacles. */
  answer: BinId | null;
}

/** Same shape as handle.debugRun() without its execution fields (agreed with the judge for C38). */
export interface Run {
  difficulty: Difficulty;
  layout: Layout;
  durationMs: number;
  kinematics: { playerSpeed: number; pickupHalfWidth: number; visibleMs: number; playerMinX: number; playerMaxX: number };
  items: RunItem[];
  /** Order of the review's groups, one per waste type (G1b): a seeded permutation of the 7 types. */
  groupOrder: WasteId[];
}

export const difficultyOf = (id: string | undefined): Difficulty => (id === "normal" || id === "fast" ? id : "calm");

/**
 * The planned run. The seed only changes order and positions (specification): the composition is fixed, there is
 * always at least one batteries piece and both tricky pieces (oily container, styrofoam), and consecutive pieces
 * keep the generation margin. `random` defaults to the seeded generator; the game passes its own (same seed, same run).
 */
export function buildRun({ difficulty, seed, layout }: { difficulty?: string; seed?: number; layout: Layout }, random: () => number = createRandom(seed)): Run {
  const level = difficultyOf(difficulty);
  const { durationMs, visibleMs, obstacles } = DIFFICULTY[level];

  // Waste: fixed list, order shuffled by the seed.
  const waste = (Object.entries(COMPOSITION[level]) as [WasteId, number][]).flatMap(([id, n]) => Array.from({ length: n }, () => id));
  shuffle(waste, random);

  // Arrivals spread over the run with a bounded jitter (±25 % of a slot): every gap stays ≥ SCHEDULE.minGapMs.
  const first = visibleMs + SCHEDULE.firstAfterMs;
  const last = durationMs - SCHEDULE.lastBeforeMs;
  const slot = (last - first) / (waste.length - 1);
  const times = waste.map((_, i) => Math.round(first + i * slot + (i > 0 && i < waste.length - 1 ? (random() - 0.5) * 0.5 * slot : 0)));

  // x: each piece reachable from the previous one (from the kayak's start for the first), with the 0.7 margin.
  const strip: { kind: "item" | "obstacle"; type: WasteId | ObstacleId; x: number; t: number }[] = [];
  let prevX: number = KAYAK.startX;
  let prevT = 0;
  waste.forEach((type, i) => {
    const reach = (SEPARATION.factor * KAYAK.speed * (times[i] - prevT)) / 1000 + PICKUP_HALF_WIDTH;
    const min = Math.max(WASTE_RANGE.min, prevX - reach);
    const max = Math.min(WASTE_RANGE.max, prevX + reach);
    const x = Math.round(min + random() * (max - min));
    strip.push({ kind: "item", type, x, t: times[i] });
    prevX = x;
    prevT = times[i];
  });

  // Obstacles: anywhere over the water, ≥ obstacleClearMs from every piece of waste and ≥ obstacleGapMs from each other.
  const kinds = (Object.entries(obstacles) as [ObstacleId, number][]).flatMap(([id, n]) => Array.from({ length: n }, () => id));
  shuffle(kinds, random);
  const taken: number[] = [];
  for (const type of kinds) {
    const t = freeTime(first, last, times, taken, random);
    taken.push(t);
    const half = OBSTACLE_SIZE[type].width / 2;
    const x = Math.round(CHANNEL.bank + half + random() * (CHANNEL.width - 2 * CHANNEL.bank - 2 * half));
    strip.push({ kind: "obstacle", type, x, t });
  }

  // Ids by arrival within each kind; x into the layout's px.
  const byTime = (a: { t: number }, b: { t: number }) => a.t - b.t;
  const offset = STRIP_OFFSET[layout];
  const items: RunItem[] = [];
  for (const kind of ["item", "obstacle"] as const) {
    strip
      .filter((s) => s.kind === kind)
      .sort(byTime)
      .forEach((s, i) => {
        const isWaste = kind === "item";
        items.push({
          id: `${kind}-${i + 1}`,
          kind,
          type: s.type,
          x: offset + s.x,
          arriveAt: s.t,
          answer: isWaste ? WASTE[s.type as WasteId].bin : null,
        });
      });
  }
  items.sort((a, b) => a.arriveAt - b.arriveAt || a.id.localeCompare(b.id));
  const kinematics = { playerSpeed: KAYAK.speed, pickupHalfWidth: PICKUP_HALF_WIDTH, visibleMs, playerMinX: offset + KAYAK_RANGE.min, playerMaxX: offset + KAYAK_RANGE.max };

  // Review groups (G1b): drawn after everything above, so every seed keeps the run it had before the grouping.
  const groupOrder = Object.keys(COMPOSITION[level]) as WasteId[];
  shuffle(groupOrder, random);
  return { difficulty: level, layout, durationMs, kinematics, items, groupOrder };
}

function shuffle<T>(list: T[], random: () => number) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}

/** A seeded time in [from, to] clear of the waste arrivals and of the obstacles already placed (deterministic fallback scan). */
function freeTime(from: number, to: number, waste: number[], taken: number[], random: () => number): number {
  const ok = (t: number) => waste.every((w) => Math.abs(w - t) >= SCHEDULE.obstacleClearMs) && taken.every((o) => Math.abs(o - t) >= SCHEDULE.obstacleGapMs);
  for (let tries = 0; tries < 64; tries++) {
    const t = Math.round(from + random() * (to - from));
    if (ok(t)) return t;
  }
  for (let t = from; t <= to; t += 50) if (ok(t)) return t;
  throw new Error("clean-channels: no room for an obstacle");
}
