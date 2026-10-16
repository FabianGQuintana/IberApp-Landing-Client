import * as Phaser from "phaser";
import { gameResultSchema, type DebugTarget, type GameConfig, type GameHandle, type GameTokens } from "@/lib/games/contract";
import { describeTextures, type ManifestEntry } from "./assets";
import { createBaseConfig } from "./config";
import { PALETTE_KEY, setGameContext, type GameContext, type MotionStats, type SceneRun, type SceneState, type SceneTarget } from "./context";
import { DESIGN_SIZES, layoutFor } from "./layout";
import { toPalette, type Palette } from "./palette";
import { createRandom } from "./random";

export interface GameDefinition {
  /** Scene classes; the first one starts. They reach the runtime through gameContext(this). */
  scenes: Phaser.Types.Scenes.SceneType[];
  manifest: readonly ManifestEntry[];
  /** meta.total */
  total: number;
  /** The game steers with shared/steer.ts: its canvas gets touch-action: pan-y (horizontal drags reach the game). */
  pointerSteer?: boolean;
}

// Phaser assigns window.onblur/onfocus when a game starts and never puts them back (T2 report, §4). They are saved
// when the first live game mounts and restored when the last one is destroyed (P20). Phaser's visibilitychange
// listener on the page stays: it cannot be reached from outside and retains about 96 bytes per destroyed game.
let liveGames = 0;
let savedHandlers: { blur: typeof window.onblur; focus: typeof window.onfocus } | null = null;
const acquireWindowHandlers = () => {
  if (liveGames++ === 0) savedHandlers = { blur: window.onblur, focus: window.onfocus };
};
const restoreWindowHandlers = () => {
  if (liveGames > 0 || !savedHandlers) return;
  window.onblur = savedHandlers.blur;
  window.onfocus = savedHandlers.focus;
};
const releaseWindowHandlers = () => {
  liveGames = Math.max(0, liveGames - 1);
  restoreWindowHandlers();
};

/** Longest real frame the game clock accepts: a hitch (or a wake after a pause) never jumps the simulation. */
const MAX_FRAME_MS = 100;

/**
 * Mounts a game: what every game's mountGame() calls. Synchronous; the canvas is in the container on return and the
 * handle is usable right away (destroy before boot included). Owns everything Phaser does not clean up by itself.
 */
export function mountPhaserGame(container: HTMLElement, config: GameConfig, definition: GameDefinition): GameHandle {
  let destroyed = false;
  let completed = false;
  let runEnded = false;
  let readied = false;
  let failed = false;
  let lastHits = 0;
  let lastCollected: string | null = null;
  let lastCounter: string | null = null;
  let paused = false;
  let palette: Palette = toPalette(config.tokens);
  let targets: (() => SceneTarget[]) | null = null;
  let run: (() => SceneRun) | null = null;
  let sceneState: (() => SceneState) | null = null;
  let simClock: (() => number) | null = null;
  const textureSources = new Map<string, "file" | "scaled" | "placeholder">();
  const motionStats: MotionStats = { created: 0, effects: [], flashes: [], shakes: [], staticFeedback: [], collisions: [] };
  const timeScale = config.testHooks && config.timeScale && config.timeScale > 0 ? config.timeScale : 1;

  // Game clock: real frame time × timeScale, from Phaser's step timestamps; a paused (sleeping) loop adds nothing.
  let clock = 0;
  let lastStep: number | null = null;

  const context: GameContext = {
    assetBase: config.assetBase,
    reducedMotion: config.reducedMotion,
    total: definition.total,
    manifest: definition.manifest,
    difficulty: config.difficulty,
    timeScale,
    random: createRandom(config.seed),
    audio: config.audio,
    now: () => clock,
    simNow: () => (simClock ? simClock() : clock),
    setSimClock(next) {
      simClock = next;
    },
    palette: () => palette,
    ready() {
      if (destroyed || readied) return;
      readied = true;
      config.onReady();
    },
    progress(hits, total = definition.total) {
      if (destroyed || completed || failed || hits === lastHits) return;
      lastHits = hits;
      config.onProgress({ hits, total });
    },
    collect(collected, inChannel) {
      const key = `${collected}/${inChannel}`;
      if (destroyed || runEnded || failed || key === lastCollected) return;
      lastCollected = key;
      config.onCollect({ collected, inChannel });
    },
    counter(value, max) {
      const key = `${value}/${max}`;
      if (destroyed || completed || runEnded || failed || key === lastCounter) return;
      lastCounter = key;
      config.onCounter({ value, max });
    },
    announce(text) {
      if (!destroyed) config.announce(text);
    },
    complete({ completed: isCompleted, hits, total = definition.total, score = hits }) {
      if (destroyed || completed || runEnded || failed) return;
      const result = gameResultSchema.safeParse({ completed: isCompleted, hits, total, score });
      if (!result.success) return context.fail(result.error);
      completed = true;
      stopInput();
      config.onComplete(result.data);
    },
    runEnd(summary) {
      if (destroyed || completed || runEnded || failed) return;
      runEnded = true;
      stopInput();
      config.onRunEnd(summary);
    },
    fail(error) {
      if (destroyed || failed) return;
      failed = true;
      stopInput();
      config.onError(error);
    },
    isOver: () => destroyed || completed || runEnded || failed,
    setTargets(provider) {
      targets = provider;
    },
    setRun(provider) {
      run = provider;
    },
    setScene(provider) {
      sceneState = provider;
    },
    textureSources,
    motionStats,
  };

  const size = DESIGN_SIZES[layoutFor(container.clientWidth, container.clientHeight)];
  acquireWindowHandlers();
  let game: Phaser.Game;
  try {
    // Boot is synchronous here (the DOM is ready): the renderer exists and the canvas is in the container on return.
    game = new Phaser.Game({ ...createBaseConfig(container, size.width, size.height, palette.bg2.color), scene: definition.scenes });
  } catch (error) {
    releaseWindowHandlers();
    queueMicrotask(() => context.fail(error));
    return { destroy: () => void (destroyed = true), pause() {}, resume() {}, setTheme() {} };
  }
  setGameContext(game, context);
  game.registry.set(PALETTE_KEY, palette);

  game.events.on(Phaser.Core.Events.PRE_STEP, (time: number) => {
    if (lastStep !== null) clock += Math.min(Math.max(time - lastStep, 0), MAX_FRAME_MS) * timeScale;
    lastStep = time;
  });

  function stopInput() {
    for (const scene of game.scene.getScenes(false)) {
      if (!scene.input) continue; // not booted yet
      scene.input.enabled = false;
      if (scene.input.keyboard) scene.input.keyboard.enabled = false;
    }
  }

  // Size follows the container, not the window: Phaser alone only polls its parent every 500 ms. The observer also
  // switches the design layout when the section flips between 16:9 and 4:5; scenes listen to the scale RESIZE event.
  const resize = new ResizeObserver(() => {
    if (destroyed) return;
    const next = DESIGN_SIZES[layoutFor(container.clientWidth, container.clientHeight)];
    const { gameSize } = game.scale;
    if (next.width !== gameSize.width || next.height !== gameSize.height) game.scale.setGameSize(next.width, next.height);
    game.scale.getParentBounds();
    game.scale.refresh();
  });
  resize.observe(container);

  // A key held while focus leaves the stage never gets its keyup here: release everything.
  const onFocusOut = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) return;
    for (const scene of game.scene.getScenes(true)) scene.input.keyboard?.resetKeys();
  };
  container.addEventListener("focusout", onFocusOut);

  // Touch capture is off (so swipes scroll the page), which lets the browser follow a tap with emulated mouse events
  // and Phaser would count the tap twice. Cancelling touchend drops them; the touchend of a scroll is not cancelable.
  const canvas = game.canvas;
  const onTouchEnd = (event: TouchEvent) => {
    if (event.cancelable) event.preventDefault();
  };
  canvas.addEventListener("touchend", onTouchEnd, { passive: false });
  // Pointer-steered games: vertical pans stay with the page, horizontal drags reach the game.
  if (definition.pointerSteer) canvas.style.touchAction = "pan-y";

  // A pause requested before the loop starts is applied on its first step (start() would undo an earlier sleep).
  game.events.once(Phaser.Core.Events.PRE_STEP, () => {
    if (paused && !destroyed) game.loop.sleep();
  });

  /** Design px → CSS px relative to the container: offset and scale of the canvas inside it. */
  const cssFrame = () => {
    const box = container.getBoundingClientRect();
    const rect = canvas.getBoundingClientRect();
    return {
      left: rect.left - box.left,
      top: rect.top - box.top,
      sx: rect.width / game.scale.gameSize.width,
      sy: rect.height / game.scale.gameSize.height,
    };
  };

  const toCss = (points: SceneTarget[]): DebugTarget[] => {
    const f = cssFrame();
    return points.map((p) => ({ id: p.id, x: f.left + p.x * f.sx, y: f.top + p.y * f.sy, ...(p.kind ? { kind: p.kind } : {}) }));
  };

  const handle: GameHandle = {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      resize.disconnect();
      container.removeEventListener("focusout", onFocusOut);
      canvas.removeEventListener("touchend", onTouchEnd);

      // Phaser does not release the WebGL context: without this, about 16 mounts later Chrome drops the oldest one
      // with a console warning. Lose it once Phaser has finished its own GL cleanup (after its destroy step returns).
      const gl = game.renderer instanceof Phaser.Renderer.WebGL.WebGLRenderer ? game.renderer.gl : null;
      game.events.once(Phaser.Core.Events.DESTROY, () =>
        queueMicrotask(() => {
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
          restoreWindowHandlers(); // again: a game destroyed before it started assigns them on its way out
        }),
      );
      releaseWindowHandlers();

      // Phaser destroys on its next step: before the first one (boot waiting for its textures) that happens as soon as
      // it starts, and the scenes see isOver() so they neither load nor report. The canvas leaves the DOM now, and a
      // sleeping loop is woken so the pending destroy actually runs.
      game.destroy(true);
      canvas.remove();
      if (game.isRunning && !game.loop.running) game.loop.wake();
    },
    pause() {
      if (destroyed || paused) return;
      paused = true;
      if (game.isRunning) game.loop.sleep();
      // E3b: no sound while paused. The context is the wrapper's: suspended here, never closed.
      if (config.audio?.context.state === "running") config.audio.context.suspend().catch(() => undefined);
    },
    resume() {
      if (destroyed || !paused) return;
      paused = false;
      if (config.audio?.context.state === "suspended") config.audio.context.resume().catch(() => undefined);
      lastStep = null; // the paused gap is not game time
      if (game.isRunning && !game.loop.running) {
        game.loop.wake();
        game.loop.resetDelta();
      }
    },
    setTheme(_theme: unknown, tokens: GameTokens) {
      if (destroyed) return;
      palette = toPalette(tokens);
      game.registry.set(PALETTE_KEY, palette);
      for (const scene of game.scene.getScenes(false)) scene.cameras?.main?.setBackgroundColor(palette.bg2.color);
      // A sleeping loop does not render: draw one frame so the new colors show while paused.
      if (paused && game.isRunning) game.loop.tick();
    },
  };

  if (config.testHooks) {
    handle.debugTargets = () => (destroyed || !targets ? [] : toCss(targets()));
    handle.debugTextures = () => (destroyed ? [] : describeTextures(game, definition.manifest, textureSources));
    handle.debugRun = () => {
      if (destroyed || !run) return null;
      const { width, height } = game.scale.gameSize;
      // elapsedMs in the run's simulation time: the same base as items[].arriveAt and debugMotion (not the boot clock).
      return { difficulty: config.difficulty ?? null, layout: layoutFor(width, height), timeScale, elapsedMs: context.simNow(), ...run() };
    };
    handle.debugScene = () => {
      if (destroyed || !sceneState) return null;
      const { fit, size, ...state } = sceneState();
      const { width, height } = game.scale.gameSize;
      const f = cssFrame();
      // FIT keeps the canvas proportion, so sx = sy (up to rounding): one scale for the view.
      const view = { left: f.left + fit.x * f.sx, top: f.top + fit.y * f.sy, scale: fit.scale * f.sx, width: size.width, height: size.height };
      return { difficulty: config.difficulty ?? null, layout: layoutFor(width, height), view, ...state };
    };
    handle.debugMotion = () => ({
      active: motionStats.effects.filter((isActive) => isActive()).length,
      created: motionStats.created,
      flashes: [...motionStats.flashes],
      shakes: [...motionStats.shakes],
      staticFeedback: [...motionStats.staticFeedback],
      collisions: [...motionStats.collisions],
    });
  }
  return handle;
}
