import { vi } from 'vitest';

export const defaultSeq = [0.12, 0.34, 0.56, 0.78, 0.9];

export function withMockedRandom<T>(seq: number[] = defaultSeq, fn: () => T): T {
  const local = seq.slice();
  const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
    const v = local.shift() ?? 0.5;
    local.push(v);
    return v;
  });
  try {
    return fn();
  } finally {
    spy.mockRestore();
  }
}
