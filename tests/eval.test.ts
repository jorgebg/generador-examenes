import { describe, it, expect } from 'vitest';
import { roundToSignificant } from '../src/eval';

describe('roundToSignificant', () => {
  it('rounds to 3 significant digits like Python logic', () => {
    expect(roundToSignificant(1234.56, 3)).toBe(1230);
    expect(roundToSignificant(0.012345, 3)).toBe(0.0123);
    expect(roundToSignificant(1.2345, 3)).toBe(1.23);
    expect(roundToSignificant(99.99, 3)).toBe(100);
  });
});
