import { describe, it, expect } from 'vitest';
import { generatePaper } from '../src/paper';
import { createSeededRNG } from '../src/rng';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('paper generator', () => {
  const sample = readFileSync(join(__dirname, '..', 'examen2.txt'), 'utf-8');

  it('generates text with questions, answers and key', () => {
    const rng = createSeededRNG(123456);
    const out = generatePaper(sample, { rng });
    expect(out).toContain('CLAVE');
    expect(out).toMatch(/(?:^|\n)1\. /);
    expect(out).toMatch(/[a-d]\) /);
    expect(out).not.toContain('@@');
  });
});
