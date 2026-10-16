/** Deterministic PRNG in [0, 1) (mulberry32). With no seed the game varies between plays; tests pass one. */
export function createRandom(seed?: number): () => number {
  let state = (seed ?? Math.floor(Math.random() * 2 ** 32)) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
