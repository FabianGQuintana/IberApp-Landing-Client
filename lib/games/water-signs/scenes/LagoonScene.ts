import * as Phaser from "phaser";
import { prepareManifest, queueManifest } from "@/lib/games/shared/assets";
import { gameContext, onPalette } from "@/lib/games/shared/context";
import { crosshair } from "@/lib/games/shared/crosshair";
import { onKeyDown } from "@/lib/games/shared/keys";
import { layoutFor } from "@/lib/games/shared/layout";
import { motion } from "@/lib/games/shared/motion";
import { fitScene, toDesign, toScene, type SceneFit } from "@/lib/games/shared/scene-fit";
import {
  CROSSHAIR,
  DEFAULT_DIFFICULTY,
  FRAME,
  MARKER_APPEAR_MS,
  MARKS_WARNING,
  marksFor,
  POINTS,
  SCENE,
  TAP_SLOP,
  TOTAL,
  ZONES,
  zoneAt,
  type DistractorId,
  type ObservationSummary,
  type SignalId,
  type Zone,
} from "../rules";
import { DISTRACTOR_TEXTS, ELEMENT_LABELS, NOTICES, SIGNAL_TEXTS } from "../meta";

// Phase 2, the observation: a still lagoon (scene.webp) with 15 invisible zones. Everything lives in one container in
// scene px; only the container moves when the layout changes (16:9: ×0.8 between bg2 bands; 4:5: 688 × 860 inside a
// bg2 frame). Marking: Enter or Space at the keyboard crosshair, or a tap/click released where it went down. A zone
// spends a mark; a signal also scores. Empty water and marked zones do nothing at all (no mark, no text, no event).
// The phase ends when the marks run out or the 8 signals are found; the canvas is then destroyed by the wrapper.
// Nothing moves without input: the only motion is a marker's entrance (motion.appear), which reducedMotion removes.
export class LagoonScene extends Phaser.Scene {
  private world!: Phaser.GameObjects.Container;
  private cross!: ReturnType<typeof crosshair>;
  private move!: ReturnType<typeof motion>;
  private fit: SceneFit = { x: 0, y: 0, scale: 1 };
  private marks = 0;
  private marked: Zone[] = [];
  private hits = 0;
  private score = 0;
  private ended = false;

  constructor() {
    super({ key: "lagoon" });
  }

  preload() {
    if (gameContext(this).isOver()) return;
    queueManifest(this);
  }

  create() {
    const context = gameContext(this);
    if (context.isOver()) return;
    prepareManifest(this);
    this.move = motion(this);
    this.marks = marksFor(context.difficulty);

    this.world = this.add.container(0, 0);
    this.cross = crosshair(this, CROSSHAIR, SCENE);
    this.world.add([this.add.image(0, 0, "scene").setOrigin(0), this.cross.graphics]);

    const keyboard = this.input.keyboard!;
    for (const code of [Phaser.Input.Keyboard.KeyCodes.ENTER, Phaser.Input.Keyboard.KeyCodes.SPACE]) {
      onKeyDown(keyboard.addKey(code, true), () => {
        const { x, y } = this.cross.position();
        this.markAt(x, y);
      });
    }
    // On release, and only if the pointer stayed put: a swipe that scrolls the page never marks (C12). No hand cursor
    // and no interactive zones: hovering must not reveal where the zones are.
    this.input.on(Phaser.Input.Events.POINTER_UP, (pointer: Phaser.Input.Pointer) => {
      if (Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.upX, pointer.upY) > TAP_SLOP) return;
      const { x, y } = toScene(this.fit, pointer.upX, pointer.upY);
      this.markAt(x, y);
    });

    // Hooks (testHooks): a distractor is a "decoy"; for debugTargets a signal is an "item", as in run games.
    context.setTargets(() =>
      ZONES.filter((z) => !this.isMarked(z)).map((z) => ({ id: z.id, ...toDesign(this.fit, z.x, z.y), kind: z.kind === "signal" ? ("item" as const) : ("decoy" as const) })),
    );
    context.setScene(() => ({
      fit: { ...this.fit },
      size: { ...SCENE },
      marks: this.marks,
      marksLeft: this.marksLeft(),
      hits: this.hits,
      score: this.score,
      crosshair: { ...this.cross.position(), step: CROSSHAIR.step },
      zones: ZONES.map((z) => ({ id: z.id, kind: z.kind === "signal" ? ("signal" as const) : ("decoy" as const), x: z.x, y: z.y, r: z.r, marked: this.isMarked(z) })),
      ended: this.ended,
    }));

    onPalette(this, (palette) => {
      this.cameras.main.setBackgroundColor(palette.bg2.color);
      this.cross.paint(palette);
    });
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this));
    this.layout();
    context.counter(this.marks, this.marks);
    context.ready();
  }

  update() {
    if (!this.cross || this.ended) return;
    this.cross.update();
  }

  private marksLeft() {
    return this.marks - this.marked.length;
  }

  private isMarked(zone: Zone) {
    return this.marked.includes(zone);
  }

  private markAt(x: number, y: number) {
    const context = gameContext(this);
    if (this.ended || context.isOver()) return;
    const zone = zoneAt(x, y);
    if (!zone || this.isMarked(zone)) return;

    this.marked.push(zone);
    if (zone.kind === "signal") {
      this.hits += 1;
      this.score += POINTS[zone.id];
      context.progress(this.hits, TOTAL);
    }
    const marker = this.add.image(zone.x, zone.y, zone.kind === "signal" ? "marker-signal" : "marker-distractor");
    this.world.addAt(marker, this.world.getIndex(this.cross.graphics)); // under the crosshair
    this.move.appear(marker, MARKER_APPEAR_MS);

    const left = this.marksLeft();
    context.counter(left, this.marks);
    const allFound = this.hits === TOTAL;
    const done = allFound || left === 0;
    const notice = allFound ? NOTICES.allFound : left === 0 ? NOTICES.noMarks : left <= MARKS_WARNING ? NOTICES.marksLeft(left) : null;
    // The revealed name heads the educational text: the verdict shows only once the element is marked.
    const text = `${ELEMENT_LABELS[zone.id].revealedLabel}. ${zone.kind === "signal" ? SIGNAL_TEXTS[zone.id] : DISTRACTOR_TEXTS[zone.id]}`;
    context.announce(notice ? `${text} ${notice}` : text); // one announcement per mark: the panel shows only the last one
    if (!done) return;

    this.ended = true;
    const summary: ObservationSummary = {
      difficulty: context.difficulty ?? DEFAULT_DIFFICULTY,
      marks: this.marks,
      found: this.marked.filter((z) => z.kind === "signal").map((z) => z.id as SignalId),
      distractors: this.marked.filter((z) => z.kind === "distractor").map((z) => z.id as DistractorId),
      hits: this.hits,
      total: TOTAL,
      score: this.score,
    };
    context.runEnd(summary);
  }

  private layout() {
    const { width, height } = this.scale.gameSize;
    this.fit = fitScene(width, height, SCENE.width, SCENE.height, layoutFor(width, height) === "portrait" ? FRAME : 0);
    this.world.setPosition(this.fit.x, this.fit.y).setScale(this.fit.scale);
  }
}
