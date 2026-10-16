import type { ComponentType } from "react";
import { z } from "zod";
import type { GameId } from "@/types/portal";

// Contract between the landing (GameStage) and every game module (plan §2.2, amendment E1). No Phaser here: the wrapper
// imports this file eagerly, and a game is only reached through its registry entry's load().
//
// Two kinds of game share it:
// - single phase: the canvas plays and reports onProgress / onComplete (e.g. the harness `_dummy`).
// - run + review: the canvas plays a run and reports onCollect / onRunEnd; the wrapper then destroys it and mounts the
//   game's review component (ReadyEntry.review, plain DOM), which reports each answer and the final result.

export type GameTheme = "dark" | "light";

/** Landing tokens the canvas may paint with, resolved by the wrapper (getComputedStyle) as CSS color strings. */
export const TOKEN_NAMES = ["bg2", "fg", "head", "mute", "rule", "mint", "leaf", "yellow", "orange", "sky"] as const;
export type TokenName = (typeof TOKEN_NAMES)[number];
export type GameTokens = Record<TokenName, string>;

const resultShape = {
  completed: z.boolean(),
  hits: z.number().int().min(0),
  /** Denominator of hits in this play (e.g. objects collected); at most the meta maximum for the difficulty played. */
  total: z.number().int().min(0),
  /** Points; games without points report score = hits. */
  score: z.number().int().min(0),
};
const hitsWithinTotal = (r: { hits: number; total: number }) => r.hits <= r.total;

/** `onComplete` / review `onDone` payload, the same for every game (P2, P14, E1). */
export const gameResultSchema = z.object(resultShape).refine(hitsWithinTotal, { message: "hits > total" });
export type GameResult = z.infer<typeof gameResultSchema>;

/** ReviewProps.onAnswer `count` (E3a): units decided by one answer. */
export const answerCountSchema = z.number().int().min(1);

/** One entry of localStorage["ibera-games-progress"], keyed by game id (P1). */
export const progressEntrySchema = z.object({ ...resultShape, savedAt: z.iso.datetime() }).refine(hitsWithinTotal, { message: "hits > total" });
export type ProgressEntry = z.infer<typeof progressEntrySchema>;

export interface GameDifficulty {
  id: string;
  /** Visible name in the intro selector, e.g. "Tranquilo". */
  label: string;
  /** Most result.total possible with this difficulty. */
  total: number;
}

/** Pure data read by the wrapper before the game loads. Title and description come from GAMES (landing). */
export interface GameMeta {
  /** Paragraphs shown before "Empezar". */
  instructions: string[];
  controls: { pointer: string; keyboard: string };
  /** What the game teaches, shown on the result screen. */
  learning: string;
  /** Most result.total possible in a play. With difficulties: the largest of their totals. */
  total: number;
  /** Noun for the score, e.g. "residuos". */
  scoreLabel: string;
  /** A point (logical design px) that is background (bg2) in every layout: the theme test reads its color. */
  backgroundProbe: { x: number; y: number };
  /** True when the play moves by itself without input (an auto-scrolling run). reducedMotion then stops only what is not essential. */
  essentialMotion: boolean;
  /** Chosen in the wrapper's intro (DOM), never inside the canvas. */
  difficulties?: GameDifficulty[];
  defaultDifficulty?: string;
  /** Run marker label (onCollect), e.g. "recolectados". */
  collectLabel?: string;
  /**
   * Result screen that replaces the usual title and score when `when` holds: "total" (default) = result.total is 0,
   * "hits" = result.hits is 0 (E2).
   */
  emptyResult?: { title: string; text: string; when?: "total" | "hits" };
  /** Unit after the score on the result screen. Default "puntos". */
  pointsLabel?: string;
  /**
   * Games with a review (E2): who reports the hits. "review" (default, E1): the wrapper counts the review's right
   * answers. "game": the game reports hits with onProgress during the canvas phase and the review answers are neutral;
   * the hits marker shows in playing and in review, and the result is exactly what the review's onDone reports.
   */
  hitsFrom?: "review" | "game";
  /** Visible text panel under the stage with the last announce() (E2). The aria-live region stays. */
  textPanel?: boolean;
  /** Label of the secondary counter (onCounter), e.g. "marcas". Without it the wrapper shows no counter (E2). */
  counterLabel?: string;
  /** Nothing on the canvas changes without input: no essential motion and no ambient effect (E2). */
  stillWithoutInput?: boolean;
  /** The game plays sound effects (E3b): the wrapper creates its AudioContext and shows the mute button. */
  sounds?: boolean;
}

/**
 * Sound output for games with meta.sounds (E3b), owned by the wrapper: created inside the click that starts a play,
 * suspended while the game is paused or out of view, closed when the play ends. Effects are synthesized (no files).
 */
export interface GameAudio {
  context: AudioContext;
  /** The wrapper's master gain: connect every effect here (0 while muted). */
  output: AudioNode;
  /** True while the mute button is on: start no sound at all. */
  muted(): boolean;
}

/** Highest result.total allowed for the difficulty played (meta.total when the game has no difficulties). */
export function maxTotal(meta: GameMeta, difficulty?: string): number {
  return meta.difficulties?.find((d) => d.id === difficulty)?.total ?? meta.total;
}

export interface GameConfig {
  /** Ends in "/", e.g. "/games/clean-channels/". The only place the game requests files from. */
  assetBase: string;
  theme: GameTheme;
  tokens: GameTokens;
  reducedMotion: boolean;
  /** Makes the game deterministic. Tests only; production leaves it out. */
  seed?: number;
  /** Enables the handle's debug* methods and timeScale. Test benches only. */
  testHooks?: boolean;
  /** One of meta.difficulties[].id, chosen in the intro; undefined for games without difficulties. */
  difficulty?: string;
  /** Multiplies game time (fixed-step simulation, so the schedule does not depend on it). Ignored without testHooks. */
  timeScale?: number;
  /** Games with meta.sounds, when the wrapper could open audio in the start gesture (E3b). Never closed by the game. */
  audio?: GameAudio;
  /** Assets loaded (or replaced by placeholders) and first scene ready. At most once. */
  onReady: () => void;
  /** Hits changed (once per change, never per frame). Single-phase games, and games with meta.hitsFrom "game". */
  onProgress: (progress: { hits: number; total: number }) => void;
  /** Run marker: objects collected so far and objects in the run (once per change). */
  onCollect: (progress: { collected: number; inChannel: number }) => void;
  /** Secondary counter, e.g. marks left out of the marks of the difficulty (once per change; E2). */
  onCounter: (counter: { value: number; max: number }) => void;
  /** Spanish text for the wrapper's aria-live="polite" region. */
  announce: (text: string) => void;
  /** Single-phase games: the final result, at most once; afterwards the game ignores input. */
  onComplete: (result: GameResult) => void;
  /** Run games: the playable part ended (at most once). `summary` is opaque to the wrapper: it goes to the review. */
  onRunEnd: (summary: unknown) => void;
  /** Unrecoverable error. */
  onError: (error: unknown) => void;
}

/**
 * A tappable target, in CSS px relative to the container (testHooks). In run games: a visible, uncollected item. In
 * scene games: an unmarked zone ("item" for a signal, which scores when marked; "decoy" spends a mark, scores nothing).
 */
export interface DebugTarget {
  /** In run games, the id of debugRun().items; in scene games, the id of debugScene().zones. */
  id: string;
  x: number;
  y: number;
  kind?: "item" | "obstacle" | "decoy";
}

/** A manifest texture as the game uses it (testHooks). `frames`: sliced frames for spritesheets, 1 for images. */
export interface DebugTexture {
  key: string;
  width: number;
  height: number;
  frames: number;
  /** file: the file matches the manifest · scaled: redrawn at the manifest size · placeholder: the file is missing. */
  source: "file" | "scaled" | "placeholder";
}

/** One scheduled object of a run (testHooks). Positions in logical design px, times in game ms. */
export interface DebugRunItem {
  /** Stable for a seed: "item-1", "obstacle-1"… */
  id: string;
  kind: "item" | "obstacle";
  /** Game-specific type, e.g. "round". */
  type: string;
  x: number;
  /** Game time at which it crosses the player's line. */
  arriveAt: number;
  /** Id of the correct review option; null for obstacles. */
  answer: string | null;
  collected: boolean;
  /** Game time at which the simulation resolved it (item: collected or missed; obstacle: hit or passed); null until then. */
  resolvedAt: number | null;
}

/** An object as it actually appeared in the run (testHooks). `t`: simulation ms of the moment it spawned. */
export interface DebugRunSpawn {
  id: string;
  kind: "item" | "obstacle";
  x: number;
  t: number;
}

/** The run as the game is playing it (testHooks). `items` is the planned schedule; `spawns` the observed one. */
export interface DebugRun {
  difficulty: string | null;
  layout: "landscape" | "portrait";
  /** Effective scale (1 without testHooks). */
  timeScale: number;
  durationMs: number;
  /** Simulation ms since the run started (same base as items[].arriveAt), pauses excluded. */
  elapsedMs: number;
  ended: boolean;
  player: { x: number; y: number };
  /** px/s, px, ms; playerMinX/playerMaxX: range of the player's center in design px (G1). */
  kinematics: { playerSpeed: number; pickupHalfWidth: number; visibleMs: number; playerMinX?: number; playerMaxX?: number };
  items: DebugRunItem[];
  /** Fixed-step simulation: identical at any timeScale for the same seed and difficulty. */
  spawns: DebugRunSpawn[];
  /** Games whose review groups the run's objects: the order of the groups (e.g. waste types). */
  groupOrder?: string[];
}

/** Non-essential motion created through shared/motion (testHooks). Times in game ms. */
export interface DebugMotion {
  /** Non-essential motion running now (ambient pulse, shakes, flashes, tweens, sprite animations); never the still feedback. */
  active: number;
  /** Effects created since the mount. */
  created: number;
  flashes: number[];
  shakes: number[];
  /** The still replacement used instead of a shake or a flash with reducedMotion. */
  staticFeedback: number[];
  /** Every collision, even when its flash was skipped by the cooldown. */
  collisions: number[];
}

/** A fixed scene with zones to mark (testHooks; E2). Positions in scene px. */
export interface DebugScene {
  difficulty: string | null;
  layout: "landscape" | "portrait";
  /** Scene px → CSS px relative to the container (as debugTargets): cssX = left + x × scale. width/height in scene px. */
  view: { left: number; top: number; scale: number; width: number; height: number };
  /** Marks of the difficulty played, and marks left. */
  marks: number;
  marksLeft: number;
  hits: number;
  score: number;
  /** Keyboard crosshair; one arrow press moves it exactly `step`. */
  crosshair: { x: number; y: number; step: number };
  /** signal: scores when marked (debugTargets kind "item") · decoy: spends a mark without scoring. */
  zones: { id: string; kind: "signal" | "decoy"; x: number; y: number; r: number; marked: boolean }[];
  ended: boolean;
}

export interface GameHandle {
  /** Idempotent, safe before boot, releases the WebGL context and every listener. No callback runs afterwards. */
  destroy(): void;
  /** No requestAnimationFrame while paused. */
  pause(): void;
  resume(): void;
  /** Repaints the same canvas, without remounting. */
  setTheme(theme: GameTheme, tokens: GameTokens): void;
  /** Only with testHooks. */
  debugTargets?(): DebugTarget[];
  /** Only with testHooks. */
  debugTextures?(): DebugTexture[];
  /** Only with testHooks; null for games without a run. */
  debugRun?(): DebugRun | null;
  /** Only with testHooks. */
  debugMotion?(): DebugMotion;
  /** Only with testHooks; null for games without a fixed scene (E2). */
  debugScene?(): DebugScene | null;
}

/** Synchronous: returns a usable handle right away, while the game is still booting. */
export type MountGame = (container: HTMLElement, config: GameConfig) => GameHandle;

export interface GameModule {
  mountGame: MountGame;
}

/** Props of a game's review component (plain DOM, mounted by the wrapper after onRunEnd). */
export interface ReviewProps {
  /** What the run reported in onRunEnd (the component knows its shape). */
  summary: unknown;
  meta: GameMeta;
  difficulty?: string;
  /** The same assetBase the game got (E3b): the only place the review loads files from. */
  assetBase: string;
  /** The play's audio, when the game has meta.sounds (E3b). */
  audio?: GameAudio;
  /**
   * Once per reviewed object, or per group of objects (E3a). The wrapper announces the text and, on a hit, adds
   * `count` hits (default 1, an integer ≥ 1: the units that answer decides) and reports progress once.
   */
  onAnswer: (answer: { hit: boolean; announcement: string; count?: number }) => void;
  /** At most once: the final result. The wrapper validates it, saves it and shows the result screen. */
  onDone: (result: GameResult) => void;
}

export interface ReviewModule {
  Review: ComponentType<ReviewProps>;
}

export interface ReadyEntry {
  status: "ready";
  meta: GameMeta;
  load: () => Promise<GameModule>;
  /** Run games only: the review step (its own chunk, no Phaser). */
  review?: () => Promise<ReviewModule>;
}

export type RegistryEntry = { status: "coming-soon" } | ReadyEntry;

export type GameRegistry = Record<GameId, RegistryEntry>;
