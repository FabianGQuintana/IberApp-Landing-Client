import * as Phaser from "phaser";
import { prepareManifest, queueManifest } from "@/lib/games/shared/assets";
import { createStepper } from "@/lib/games/shared/clock";
import { gameContext, onPalette } from "@/lib/games/shared/context";
import { layoutFor } from "@/lib/games/shared/layout";
import { motion } from "@/lib/games/shared/motion";
import { playEffect } from "@/lib/games/shared/sound";
import type { Palette } from "@/lib/games/shared/palette";
import { pointerSteer } from "@/lib/games/shared/steer";
import {
  buildRun,
  CHANNEL,
  KAYAK,
  KAYAK_RANGE,
  obstacleHalfWidth,
  PADDLE,
  PICKUP_HALF_WIDTH,
  STRIP_OFFSET,
  WASTE_SIZE,
  type Layout,
  type ObstacleId,
  type Run,
  type RunItem,
} from "../data";
import { WASTE, type WasteId } from "../meta";
import { SOUNDS } from "../sounds";

interface Live {
  plan: RunItem;
  sprite: Phaser.GameObjects.Image | null;
  spawnedAt: number | null;
  resolvedAt: number | null;
  collected: boolean;
}

const STEP_MS = 10;
const SPAWN_Y = -WASTE_SIZE / 2;
const TILT_DEG = 6;

// The run (phase 2 of the specification): the channel scrolls by itself, waste and obstacles come down and cross the
// kayak's line at their planned time, the kayak moves sideways (arrows or pointer). Everything that decides the
// outcome runs in the fixed-step simulation (shared/clock.ts), so the run is identical at any timeScale. The plan is
// kept in channel-strip coordinates and placed in the layout's px when drawn or reported (16:9 centers the strip).
export class ChannelScene extends Phaser.Scene {
  private run!: Run;
  private objects: Live[] = [];
  private spawns: { id: string; kind: "item" | "obstacle"; x: number; t: number }[] = [];
  private kayakX: number = KAYAK.startX; // strip coordinates
  private tilt = 0;
  private water!: Phaser.GameObjects.TileSprite;
  private bankLeft!: Phaser.GameObjects.TileSprite;
  private bankRight!: Phaser.GameObjects.TileSprite;
  private frame!: Phaser.GameObjects.Graphics;
  private kayak!: Phaser.GameObjects.Container;
  private hull!: Phaser.GameObjects.Image;
  private paddleHolder!: Phaser.GameObjects.Container;
  private rowing: (Phaser.Tweens.Tween | null)[] = [];
  private keys!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private steer!: ReturnType<typeof pointerSteer>;
  private stepper!: ReturnType<typeof createStepper>;
  private move!: ReturnType<typeof motion>;
  private palette!: Palette;
  private collected = 0;
  private ended = false;

  constructor() {
    super({ key: "clean-channels" });
  }

  preload() {
    if (gameContext(this).isOver()) return;
    queueManifest(this);
  }

  create() {
    const context = gameContext(this);
    if (context.isOver()) return;
    prepareManifest(this);
    // Strip coordinates: the portrait layout has no offset. Same random sequence as buildRun(seed) in Node.
    this.run = buildRun({ difficulty: context.difficulty, layout: "portrait" }, context.random);
    this.objects = this.run.items.map((plan) => ({ plan, sprite: null, spawnedAt: null, resolvedAt: null, collected: false }));
    this.move = motion(this);
    this.stepper = createStepper(this, STEP_MS);
    this.steer = pointerSteer(this);

    this.water = this.add.tileSprite(0, 0, CHANNEL.width, 10, "water-tile").setOrigin(0, 0);
    this.bankLeft = this.add.tileSprite(0, 0, CHANNEL.bank, 10, "bank-left").setOrigin(0, 0).setDepth(2);
    this.bankRight = this.add.tileSprite(0, 0, CHANNEL.bank, 10, "bank-right").setOrigin(0, 0).setDepth(2);
    this.frame = this.add.graphics().setDepth(20);
    // The kayak tilts in its container; motion.impact shakes the hull inside it, so the two never fight. The paddle
    // (decorative, centered on the hull) sits in its own holder, which copies the hull's shake angle every frame, so
    // its own rowing rotation never fights the shake either.
    this.hull = this.add.image(0, 0, "kayak");
    const paddle = this.add.image(0, 0, "kayak-paddle");
    this.paddleHolder = this.add.container(0, 0, [paddle]);
    this.kayak = this.add.container(0, 0, [this.hull, this.paddleHolder]).setDepth(10);
    // Rowing: rotation (sin) and a small x drift a quarter cycle later (cos). Non-essential: with reducedMotion the
    // helper creates nothing and the paddle stays still at 0°.
    if (!this.move.reduced) {
      paddle.setAngle(-PADDLE.swingDeg).setX(-PADDLE.driftX);
      const swing = this.move.ambient(paddle, { angle: PADDLE.swingDeg }, PADDLE.cycleMs / 2);
      const drift = this.move.ambient(paddle, { x: PADDLE.driftX }, PADDLE.cycleMs / 2);
      drift?.seek(PADDLE.cycleMs / 4);
      this.rowing = [swing, drift];
    }

    const keyboard = this.input.keyboard!;
    const { LEFT, RIGHT } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = { left: keyboard.addKey(LEFT, true), right: keyboard.addKey(RIGHT, true) };

    context.setTargets(() =>
      this.objects
        .filter((o) => o.plan.kind === "item" && o.sprite && o.resolvedAt === null)
        .map((o) => ({ id: o.plan.id, x: o.sprite!.x, y: o.sprite!.y, kind: "item" as const })),
    );
    context.setRun(() => {
      const offset = this.offset();
      return {
        durationMs: this.run.durationMs,
        ended: this.ended,
        player: { x: offset + this.kayakX, y: this.lineY() },
        kinematics: { ...this.run.kinematics, playerMinX: offset + KAYAK_RANGE.min, playerMaxX: offset + KAYAK_RANGE.max },
        items: this.objects.map((o) => ({
          id: o.plan.id,
          kind: o.plan.kind,
          type: o.plan.type,
          x: offset + o.plan.x,
          arriveAt: o.plan.arriveAt,
          answer: o.plan.answer,
          collected: o.collected,
          resolvedAt: o.resolvedAt,
        })),
        spawns: this.spawns.map((s) => ({ ...s })),
        groupOrder: [...this.run.groupOrder],
      };
    });

    onPalette(this, (palette) => {
      this.palette = palette;
      this.cameras.main.setBackgroundColor(palette.bg2.color);
      this.layout();
    });
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this));
    this.layout();
    context.ready();
  }

  update() {
    if (!this.run || this.ended || gameContext(this).isOver()) return;
    this.stepper.advance((dt, t) => this.simulate(dt, t));
    this.draw(this.stepper.time());
  }

  private currentLayout(): Layout {
    const { width, height } = this.scale.gameSize;
    return layoutFor(width, height);
  }

  private offset() {
    return STRIP_OFFSET[this.currentLayout()];
  }

  private lineY() {
    return this.scale.gameSize.height - KAYAK.fromBottom;
  }

  private simulate(dt: number, t: number) {
    const context = gameContext(this);
    const offset = this.offset();

    // Kayak: arrows, or toward the pointer while it steers. Strip coordinates, KAYAK.speed px/s.
    const step = (KAYAK.speed * dt) / 1000;
    const target = this.steer.target();
    const before = this.kayakX;
    let x = this.kayakX;
    if (this.keys.left.isDown) x -= step;
    else if (this.keys.right.isDown) x += step;
    else if (target !== null) x += Phaser.Math.Clamp(target - offset - x, -step, step);
    this.kayakX = Phaser.Math.Clamp(x, KAYAK_RANGE.min, KAYAK_RANGE.max);
    const velocity = (this.kayakX - before) / step || 0; // -1 … 1
    this.tilt += (velocity * TILT_DEG - this.tilt) * 0.2;

    const inChannel = this.run.items.filter((i) => i.kind === "item").length;
    for (const o of this.objects) {
      if (o.spawnedAt === null && t >= o.plan.arriveAt - this.run.kinematics.visibleMs) {
        o.spawnedAt = t;
        this.spawns.push({ id: o.plan.id, kind: o.plan.kind, x: offset + o.plan.x, t });
      }
      if (o.spawnedAt === null || o.resolvedAt !== null || t < o.plan.arriveAt) continue;
      o.resolvedAt = t;
      const distance = Math.abs(this.kayakX - o.plan.x);
      if (o.plan.kind === "item") {
        const name = WASTE[o.plan.type as WasteId].name;
        if (distance <= PICKUP_HALF_WIDTH) {
          o.collected = true;
          this.collected += 1;
          context.collect(this.collected, inChannel);
          playEffect(context.audio, SOUNDS.collect);
          context.announce(`Recolectaste: ${name}. Llevás ${this.collected}.`);
        } else {
          context.announce(`Se te pasó: ${name}.`);
        }
      } else if (distance <= obstacleHalfWidth(o.plan.type as ObstacleId)) {
        this.move.impact(this.hull);
        playEffect(context.audio, SOUNDS.collision); // reducedMotion does not silence (G1b)
      }
    }

    if (t >= this.run.durationMs) {
      this.ended = true;
      const collected = this.objects
        .filter((o) => o.collected)
        .map((o) => ({ id: o.plan.id, type: o.plan.type as WasteId, bin: o.plan.answer, points: WASTE[o.plan.type as WasteId].points }));
      for (const tween of this.rowing) tween?.stop(); // the canvas is still once the run is over (raw path keeps it)
      context.announce("Terminó el recorrido. Ahora, a clasificar lo que juntaste.");
      context.runEnd({ collected, groupOrder: this.run.groupOrder });
    }
  }

  /** Draws the simulation state at simulation time `t`: water and banks scroll, sprites follow their planned arrival. */
  private draw(t: number) {
    const offset = this.offset();
    const { height } = this.scale.gameSize;
    const lineY = this.lineY();
    const speed = (lineY - SPAWN_Y) / this.run.kinematics.visibleMs; // px per game ms: arrival lands exactly on arriveAt
    const scroll = -((t * speed) % CHANNEL.width);
    this.water.tilePositionY = scroll;
    this.bankLeft.tilePositionY = scroll;
    this.bankRight.tilePositionY = scroll;
    this.kayak.setPosition(offset + this.kayakX, lineY);
    this.kayak.angle = gameContext(this).reducedMotion ? 0 : this.tilt;
    this.paddleHolder.angle = this.hull.angle; // the paddle shakes with the hull
    for (const o of this.objects) {
      if (o.spawnedAt === null) continue;
      const y = lineY - (o.plan.arriveAt - t) * speed;
      if (o.collected || y > height + WASTE_SIZE * 2) {
        o.sprite?.destroy();
        o.sprite = null;
        continue;
      }
      if (!o.sprite) {
        const key = o.plan.kind === "item" ? `trash-${o.plan.type}` : `obstacle-${o.plan.type}`;
        o.sprite = this.add.image(0, 0, key).setDepth(o.plan.kind === "item" ? 6 : 5);
      }
      o.sprite.setPosition(offset + o.plan.x, y);
    }
  }

  /** Places the strip for the current layout (16:9: centered, bg2 margins; 4:5: full width, bg2 frame over the banks). */
  private layout() {
    if (!this.palette || !this.water) return;
    const offset = this.offset();
    const { height } = this.scale.gameSize;
    this.water.setPosition(offset, 0).setSize(CHANNEL.width, height);
    this.bankLeft.setPosition(offset, 0).setSize(CHANNEL.bank, height);
    this.bankRight.setPosition(offset + CHANNEL.width - CHANNEL.bank, 0).setSize(CHANNEL.bank, height);
    this.frame.clear();
    if (this.currentLayout() === "portrait") {
      this.frame.fillStyle(this.palette.bg2.color, 1).fillRect(0, 0, CHANNEL.frame, height).fillRect(CHANNEL.width - CHANNEL.frame, 0, CHANNEL.frame, height);
    }
    this.draw(this.stepper.time());
  }
}
