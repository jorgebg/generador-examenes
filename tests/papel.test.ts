import { describe, it, expect, vi } from 'vitest';
import { generatePapel } from '../src/papel';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

function withMockedRandom<T>(seq: number[], fn: () => T): T {
  const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
    const v = seq.shift() ?? 0.5;
    seq.push(v);
    return v;
  });
  try { return fn(); } finally { spy.mockRestore(); }
}

function ensureDir(p: string) {
  try { mkdirSync(p, { recursive: true }); } catch {}
}

describe('papel generator fixtures', () => {
  const base = join(__dirname, '..');
  const exam1 = readFileSync(join(base, 'examen.txt'), 'utf-8');
  const exam2 = readFileSync(join(base, 'examen2.txt'), 'utf-8');
  const fixturesDir = join(base, 'fixtures');
  ensureDir(fixturesDir);
  const seq = [0.12, 0.34, 0.56, 0.78, 0.9];

  it('matches full output for examen.txt (seeded)', () => {
    const out = withMockedRandom(seq.slice(), () => generatePapel(exam1));
    const fpath = join(fixturesDir, 'papel-examen1.txt');
    if (!existsSync(fpath)) {
      writeFileSync(fpath, out, 'utf-8');
    }
    const expected = readFileSync(fpath, 'utf-8');
    expect(out).toEqual(expected);
  });

  it('matches full output for examen2.txt (seeded)', () => {
    const out = withMockedRandom(seq.slice(), () => generatePapel(exam2));
    const fpath = join(fixturesDir, 'papel-examen2.txt');
    if (!existsSync(fpath)) {
      writeFileSync(fpath, out, 'utf-8');
    }
    const expected = readFileSync(fpath, 'utf-8');
    expect(out).toEqual(expected);
  });
});
