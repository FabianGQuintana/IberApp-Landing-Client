import * as Phaser from "phaser";

/**
 * Runs `handler` once per real keydown of `key` (no OS auto-repeat). Phaser 3.90 handles each key event as it arrives
 * but keeps the frame's events queued until the step ends, and a later event in the same frame replays that queue: a
 * replayed keydown fires the key's DOWN again. Two presses within one frame would count three times; deduplicating by
 * the DOM event object makes every press count once, whatever the frame rate (and also while the loop is paused).
 */
export function onKeyDown(key: Phaser.Input.Keyboard.Key, handler: (event: KeyboardEvent) => void) {
  const seen = new WeakSet<KeyboardEvent>();
  key.on(Phaser.Input.Keyboard.Events.DOWN, (_key: Phaser.Input.Keyboard.Key, event?: KeyboardEvent) => {
    if (!event || event.repeat || seen.has(event)) return;
    seen.add(event);
    handler(event);
  });
  return key;
}
