import { RandomSource } from './types';

// Mulberry32 seeded PRNG
export function createSeededRNG(seed: number): RandomSource {
  let t = seed >>> 0;
  return {
    next() {
      t |= 0;
      t = (t + 0x6D2B79F5) | 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    },
  };
}

export const systemRNG: RandomSource = { next: () => Math.random() };

export function shuffleInPlace<T>(arr: T[], rng: RandomSource): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
