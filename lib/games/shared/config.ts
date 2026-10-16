import * as Phaser from "phaser";

// Base Phaser config for a game living inside a long, scrolling landing page (T2 report, section 1). Every option keeps
// Phaser inside its container:
// - keyboard: listens on the container only (focus inside the stage), never on window. No global key captures: a
//   scene prevents the default of the keys it uses with keyboard.addKey(code, true), and that only applies while
//   the stage has focus, because the listener lives on the container.
// - mouse: no preventDefault, so a click focuses the stage and the wheel keeps scrolling the page (passive listener).
// - touch: no preventDefault and passive listeners, so a vertical swipe over the canvas scrolls the page.
// - windowEvents: no mouse/touch listeners on window (Phaser would also forget to remove the touch ones).
// - expandParent: off, otherwise Phaser may set height: 100% on <html> and <body>.
// - autoFocus: off, otherwise Phaser calls window.focus() on boot and on every mousedown.
// - audio: off (no sound in this release), which also avoids the audio unlock listeners on the page body.
export function createBaseConfig(container: HTMLElement, width: number, height: number, background: number): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: container,
    width,
    height,
    backgroundColor: background,
    banner: false,
    autoFocus: false,
    disableContextMenu: false,
    audio: { noAudio: true },
    input: {
      keyboard: { target: container },
      mouse: { preventDefaultDown: false, preventDefaultUp: false, preventDefaultMove: false, preventDefaultWheel: false },
      touch: { capture: false },
      windowEvents: false,
      gamepad: false,
      activePointers: 1,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      expandParent: false,
    },
    render: { antialias: true, pixelArt: false, transparent: false },
  };
}
