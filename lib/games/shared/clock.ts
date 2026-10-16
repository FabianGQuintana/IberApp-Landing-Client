import type * as Phaser from "phaser";
import { gameContext } from "./context";

/**
 * Fixed-step simulation over the game clock (context.now(): scaled by timeScale, pauses excluded). Each update() of the
 * scene calls advance(); the callback runs once per whole step that fits, with a constant dt. Everything that decides
 * the outcome (spawns, movement, pickups, collisions) must run inside it, so a run is identical at ×1 and at ×10:
 * only the number of steps per rendered frame changes.
 */
export function createStepper(scene: Phaser.Scene, stepMs = 10) {
  const context = gameContext(scene);
  let simTime = 0;
  let started: number | null = null;
  context.setSimClock(() => simTime);
  return {
    /** Simulation ms since the first advance(). */
    time: () => simTime,
    advance(step: (dtMs: number, simTimeMs: number) => void) {
      const now = context.now();
      if (started === null) started = now;
      const target = now - started;
      // Catch up fully (no dropped time): a slow frame only means more steps on the next one.
      while (simTime + stepMs <= target) {
        simTime += stepMs;
        step(stepMs, simTime);
        if (context.isOver()) break;
      }
    },
  };
}
