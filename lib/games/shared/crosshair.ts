import * as Phaser from "phaser";
import { gameContext } from "./context";
import { onKeyDown } from "./keys";
import type { Palette } from "./palette";

/** A free keyboard crosshair over a fixed scene (E2). Every distance in scene px, times in game ms. */
export interface CrosshairOptions {
  startX: number;
  startY: number;
  /** One arrow press moves exactly this. */
  step: number;
  /** An arrow held this long starts moving the crosshair by itself… */
  holdDelayMs: number;
  /** …at this speed (px/s)… */
  speed: number;
  /** …growing to this one (px/s) over rampMs. */
  maxSpeed: number;
  rampMs: number;
}

const RADIUS = 26;
const TICK = 12;

/**
 * Arrows move the crosshair (keyboard listener on the container, keys captured only with the stage focused: C09).
 * A press is one step; held, it moves by itself and speeds up. The crosshair never moves without input and never
 * tweens: it is not motion. Drawn in two tones (the theme's head over a bg2 halo) so it reads in both themes and over
 * any part of the scene. `graphics` is in scene px: add it to the container that holds the scene.
 */
export function crosshair(scene: Phaser.Scene, options: CrosshairOptions, bounds: { width: number; height: number }) {
  const context = gameContext(scene);
  const position = { x: options.startX, y: options.startY };
  const graphics = scene.add.graphics();
  let palette: Palette | null = null;
  let last: number | null = null;

  const draw = () => {
    if (!palette) return;
    const { x, y } = position;
    graphics.clear();
    for (const [width, color] of [
      [7, palette.bg2.color],
      [3, palette.head.color],
    ] as const) {
      graphics.lineStyle(width, color, 1).strokeCircle(x, y, RADIUS);
      graphics.lineBetween(x - RADIUS - TICK, y, x - RADIUS + 4, y).lineBetween(x + RADIUS - 4, y, x + RADIUS + TICK, y);
      graphics.lineBetween(x, y - RADIUS - TICK, x, y - RADIUS + 4).lineBetween(x, y + RADIUS - 4, x, y + RADIUS + TICK);
    }
  };

  const moveBy = (dx: number, dy: number) => {
    const x = Phaser.Math.Clamp(position.x + dx, 0, bounds.width);
    const y = Phaser.Math.Clamp(position.y + dy, 0, bounds.height);
    if (x === position.x && y === position.y) return;
    position.x = x;
    position.y = y;
    draw();
  };

  const { LEFT, RIGHT, UP, DOWN } = Phaser.Input.Keyboard.KeyCodes;
  const keys = (
    [
      [LEFT, -1, 0],
      [RIGHT, 1, 0],
      [UP, 0, -1],
      [DOWN, 0, 1],
    ] as const
  ).map(([code, dx, dy]) => {
    const held = { key: scene.input.keyboard!.addKey(code, true), dx, dy, since: null as number | null };
    // One step per press; the OS auto-repeat is replaced by the hold in update().
    onKeyDown(held.key, () => {
      if (context.isOver()) return;
      held.since = context.now();
      moveBy(dx * options.step, dy * options.step);
    });
    return held;
  });

  return {
    graphics,
    position: () => ({ ...position }),
    paint(next: Palette) {
      palette = next;
      draw();
    },
    /** Call every frame: moves the crosshair while an arrow is held past holdDelayMs. */
    update() {
      const now = context.now();
      const dt = last === null ? 0 : now - last;
      last = now;
      if (context.isOver()) return;
      let vx = 0;
      let vy = 0;
      for (const held of keys) {
        if (!held.key.isDown) held.since = null; // released, or reset when the stage lost focus
        if (held.since === null) continue;
        const holding = now - held.since - options.holdDelayMs;
        if (holding < 0) continue;
        const speed = options.speed + (options.maxSpeed - options.speed) * Math.min(1, holding / options.rampMs);
        vx += held.dx * speed;
        vy += held.dy * speed;
      }
      if (vx !== 0 || vy !== 0) moveBy((vx * dt) / 1000, (vy * dt) / 1000);
    },
  };
}
