import { useSyncExternalStore } from "react";
import { progressEntrySchema, type GameResult, type ProgressEntry } from "@/lib/games/contract";
import { createLocalStore } from "@/lib/storage/local-store";

// Minigame progress (plan §2.2, P1, E1): localStorage["ibera-games-progress"] = { [gameId]: { completed, hits, total, score, savedAt } }.
// One entry per game, whatever the difficulty played. Only GameStage writes it, with the final result (onComplete or
// the review's onDone); the games never touch storage.
export const PROGRESS_KEY = "ibera-games-progress";

export type GameProgress = Record<string, ProgressEntry>;

const store = createLocalStore<Record<string, unknown>>(PROGRESS_KEY, {});

// The store caches its parsed value by raw string, so validating per object keeps snapshots stable for React.
const validated = new WeakMap<object, GameProgress>();
const NO_SOURCE = {};
const readValid = (): GameProgress => {
  const raw = store.read();
  const source = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : NO_SOURCE;
  let value = validated.get(source);
  if (!value) {
    value = {};
    for (const [id, entry] of Object.entries(source)) {
      const parsed = progressEntrySchema.safeParse(entry);
      if (parsed.success) value[id] = parsed.data;
    }
    validated.set(source, value);
  }
  return value;
};
const EMPTY: GameProgress = {};

/** The result to keep (P1, E1): more score wins; on a tie, the latest (`next`). Pure. */
export function pickBest(previous: ProgressEntry | undefined, next: ProgressEntry): ProgressEntry {
  return previous && previous.score > next.score ? previous : next;
}

/** Saves `result` if it is the best so far for `gameId`. Returns what is stored afterwards. */
export function saveBestResult(gameId: string, result: GameResult): ProgressEntry {
  const current = readValid();
  const next: ProgressEntry = { completed: result.completed, hits: result.hits, total: result.total, score: result.score, savedAt: new Date().toISOString() };
  const best = pickBest(current[gameId], next);
  store.write({ ...current, [gameId]: best });
  return best;
}

/** Saved progress for every game (empty on the server and before hydration). */
export function useGameProgress(): GameProgress {
  return useSyncExternalStore(store.subscribe, readValid, () => EMPTY);
}
