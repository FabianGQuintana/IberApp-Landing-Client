import type { SoundEffect } from "@/lib/games/shared/sound";

// clean-channels' four sound effects (G1b), synthesized: all under 200 ms, no files. Pure data, tuned by ear in /play;
// changing them touches no code. Played through shared/sound.ts playEffect (nothing while muted).
export const SOUNDS = {
  /** A piece of waste collected: a short rising chirp. */
  collect: [{ type: "sine", from: 660, to: 990, ms: 120 }],
  /** The kayak hits a camalote or a log: a low thud. */
  collision: [{ type: "triangle", from: 140, to: 90, ms: 160, volume: 0.35 }],
  /** A group classified right: two quick rising notes. */
  right: [
    { type: "sine", from: 660, ms: 70 },
    { type: "sine", from: 880, ms: 70 },
  ],
  /** A group classified wrong: a short falling tone (never harsh: wrong answers do not subtract). */
  wrong: [{ type: "triangle", from: 330, to: 220, ms: 180 }],
} satisfies Record<string, SoundEffect>;
