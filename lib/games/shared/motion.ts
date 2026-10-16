import type * as Phaser from "phaser";
import { gameContext } from "./context";

type Targets = object | object[];
type Bounded = Phaser.GameObjects.Components.GetBounds & Phaser.GameObjects.GameObject;

interface TweenOptions {
  duration: number;
  ease?: string;
  delay?: number;
  onComplete?: () => void;
}

const FLASH_COOLDOWN_MS = 500; // game time; at most 2 flashes per second (WCAG 2.3.1 allows 3)
const FLASH_MS = 180;
const STATIC_FEEDBACK_MS = 300;

/**
 * The only way a game moves things that are not essential to play (plan §2.2, E1): tweens, ambient loops, sprite
 * animations, shakes and flashes. With reducedMotion everything non-essential is still: tweens jump to their end
 * values, loops do nothing, animated sprites rest on frame 0, and a shake or flash becomes a still outline around the
 * target for 300 ms. Essential motion (an auto-scrolling run) is the game's own simulation and does not go through here.
 * Every effect is counted for handle.debugMotion() (testHooks), timed in simulation ms (the same base as debugRun).
 */
export function motion(scene: Phaser.Scene) {
  const context = gameContext(scene);
  const reduced = context.reducedMotion;
  const stats = context.motionStats;
  const track = (isActive: () => boolean) => {
    stats.created += 1;
    stats.effects.push(isActive);
  };

  /** A still outline in the theme's head color, shown for 300 ms: the reducedMotion replacement for shake and flash. */
  const staticFeedback = (target: Bounded) => {
    stats.staticFeedback.push(context.simNow());
    const b = target.getBounds();
    const outline = scene.add
      .rectangle(b.centerX, b.centerY, b.width + 12, b.height + 12)
      .setStrokeStyle(4, context.palette().head.color)
      .setDepth(1000);
    scene.time.delayedCall(STATIC_FEEDBACK_MS, () => outline.destroy());
  };

  // With reducedMotion nothing is recorded as a shake or a flash: only the still feedback (C36).
  const shake = (target?: Bounded & { angle: number }) => {
    if (!target) {
      if (reduced) return;
      stats.shakes.push(context.simNow());
      const camera = scene.cameras.main;
      camera.shake(120, 0.004);
      track(() => camera.shakeEffect.isRunning);
      return;
    }
    if (reduced) return staticFeedback(target);
    stats.shakes.push(context.simNow());
    const tween = scene.tweens.add({
      targets: target,
      angle: { from: -6, to: 6 },
      duration: 60,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        target.angle = 0;
      },
    });
    track(() => tween.isPlaying());
  };

  /** Low-luminance flash over the target only (never full screen), at most once per 500 ms of game time. */
  const flash = (target: Bounded) => {
    if (reduced) return staticFeedback(target);
    const now = context.simNow();
    const last = stats.flashes[stats.flashes.length - 1];
    if (last !== undefined && now - last < FLASH_COOLDOWN_MS) return;
    stats.flashes.push(now);
    const b = target.getBounds();
    const overlay = scene.add.rectangle(b.centerX, b.centerY, b.width, b.height, context.palette().fg.color, 0.35).setDepth(1000);
    const tween = scene.tweens.add({ targets: overlay, alpha: 0, duration: FLASH_MS, onComplete: () => overlay.destroy() });
    track(() => tween.isPlaying());
  };

  return {
    reduced,

    /** Animates numeric properties to `to`. Reduced: sets them at once and calls onComplete. */
    tween(targets: Targets, to: Record<string, number>, options: TweenOptions) {
      if (reduced) {
        for (const target of ([] as object[]).concat(targets)) Object.assign(target, to);
        options.onComplete?.();
        return null;
      }
      const tween = scene.tweens.add({ targets, ...to, duration: options.duration, ease: options.ease ?? "Sine.easeInOut", delay: options.delay ?? 0, onComplete: options.onComplete });
      track(() => tween.isPlaying());
      return tween;
    },

    /**
     * A short entrance (E2): the target grows from 60 % and fades in to its current scale and alpha. Reduced: it is
     * shown at once, and nothing is created or counted.
     */
    appear(target: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha, duration = 150) {
      if (reduced) return null;
      const { scaleX, scaleY, alpha } = target;
      target.setScale(scaleX * 0.6, scaleY * 0.6).setAlpha(0); // no frame at full size before the tween starts
      const tween = scene.tweens.add({
        targets: target,
        scaleX: { from: scaleX * 0.6, to: scaleX },
        scaleY: { from: scaleY * 0.6, to: scaleY },
        alpha: { from: 0, to: alpha },
        duration,
        ease: "Cubic.easeOut",
      });
      track(() => tween.isPlaying());
      return tween;
    },

    /** Endless back-and-forth decoration (yoyo). Reduced: nothing moves. */
    ambient(targets: Targets, to: Record<string, number>, duration: number) {
      if (reduced) return null;
      const tween = scene.tweens.add({ targets, ...to, duration, ease: "Sine.easeInOut", yoyo: true, repeat: -1 });
      track(() => tween.isPlaying());
      return tween;
    },

    /** Plays a manifest animation (shared/assets.ts creates one per spritesheet). Reduced: frame 0, still. */
    play(sprite: Phaser.GameObjects.Sprite, animation: string) {
      if (reduced) {
        sprite.setFrame(0);
        return sprite;
      }
      sprite.play(animation);
      track(() => sprite.active && sprite.anims.isPlaying);
      return sprite;
    },

    /** Shake: the target wobbles (or the camera, without a target). Reduced: a still outline. */
    shake,

    /** Flash over the target. Reduced: a still outline. */
    flash,

    /** A collision: always recorded, then shake + flash (one still outline with reducedMotion). */
    impact(target: Bounded & { angle: number }) {
      stats.collisions.push(context.simNow());
      if (reduced) return staticFeedback(target);
      shake(target);
      flash(target);
    },
  };
}
