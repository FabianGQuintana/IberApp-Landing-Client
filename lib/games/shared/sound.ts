import type { GameAudio } from "@/lib/games/contract";

// Synthesized sound effects (E3b): oscillators and a gain envelope, no files and no network. No Phaser here, so a
// review component (plain DOM, its own chunk) can play them too. The wrapper owns the AudioContext; effects only
// connect to its master output.

/** One note of an effect: a waveform gliding from `from` to `to` Hz over `ms`, at `volume` (0–1, default 0.25). */
export interface Tone {
  type: OscillatorType;
  from: number;
  to?: number;
  ms: number;
  volume?: number;
}

/** An effect: its notes, played one after the other. */
export type SoundEffect = readonly Tone[];

const ATTACK_S = 0.01;
const SILENT = 0.0001; // exponential ramps cannot reach 0

/** Plays `effect` now. Nothing at all (no source is started) without audio, while muted or once the context closed. */
export function playEffect(audio: GameAudio | undefined, effect: SoundEffect) {
  if (!audio || audio.muted() || audio.context.state === "closed") return;
  const { context, output } = audio;
  let at = context.currentTime;
  for (const tone of effect) {
    const seconds = tone.ms / 1000;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.from, at);
    if (tone.to !== undefined) oscillator.frequency.exponentialRampToValueAtTime(tone.to, at + seconds);
    envelope.gain.setValueAtTime(SILENT, at);
    envelope.gain.exponentialRampToValueAtTime(tone.volume ?? 0.25, at + ATTACK_S);
    envelope.gain.exponentialRampToValueAtTime(SILENT, at + seconds);
    oscillator.connect(envelope).connect(output);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
    oscillator.start(at);
    oscillator.stop(at + seconds);
    at += seconds;
  }
}
