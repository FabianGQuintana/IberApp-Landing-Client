import type * as Phaser from "phaser";

const DECIDE_PX = 10;

/**
 * Generic pointer steering (E1): while the primary pointer is pressed on the canvas, target() is its x in design px;
 * the scene moves its player toward it at a limited speed. Mouse steers at once. A touch only steers when the gesture
 * starts horizontal (|dx| > |dy| within the first 10 px): a vertical swipe belongs to the page, which keeps scrolling
 * because the canvas has touch-action: pan-y (runtime option pointerSteer).
 */
export function pointerSteer(scene: Phaser.Scene) {
  let pointer: Phaser.Input.Pointer | null = null;
  let start = { x: 0, y: 0 };
  let mode: "pending" | "steer" | "ignore" = "ignore";

  const down = (p: Phaser.Input.Pointer) => {
    pointer = p;
    start = { x: p.x, y: p.y };
    mode = p.wasTouch ? "pending" : "steer";
  };
  const move = (p: Phaser.Input.Pointer) => {
    if (p !== pointer || mode !== "pending") return;
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    if (Math.hypot(dx, dy) >= DECIDE_PX) mode = Math.abs(dx) > Math.abs(dy) ? "steer" : "ignore";
  };
  const up = (p: Phaser.Input.Pointer) => {
    if (p !== pointer) return;
    pointer = null;
    mode = "ignore";
  };

  scene.input.on("pointerdown", down);
  scene.input.on("pointermove", move);
  scene.input.on("pointerup", up);
  scene.input.on("pointerupoutside", up);
  const off = () => {
    scene.input.off("pointerdown", down);
    scene.input.off("pointermove", move);
    scene.input.off("pointerup", up);
    scene.input.off("pointerupoutside", up);
  };
  scene.events.once("shutdown", off);
  scene.events.once("destroy", off);

  return {
    /** Design-px x the player should head to, or null when the pointer is not steering. */
    target: (): number | null => (pointer && mode === "steer" && pointer.isDown ? pointer.worldX : null),
  };
}
