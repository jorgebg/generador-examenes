import { describe, it, expect } from 'vitest';
import { generateMoodle } from '../src/moodle';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { withMockedRandom, defaultSeq } from './helpers/mockRandom';

function ensureDir(p: string) {
  try { mkdirSync(p, { recursive: true }); } catch {}
}

describe('moodle generator fixtures', () => {
  const base = join(__dirname, '..');
  const exam1 = readFileSync(join(base, 'examen.txt'), 'utf-8');
  const exam2 = readFileSync(join(base, 'examen2.txt'), 'utf-8');
  const fixturesDir = join(base, 'fixtures');
  ensureDir(fixturesDir);

  it('matches full XML for examen.txt (seeded)', () => {
    const out = withMockedRandom(defaultSeq, () => generateMoodle(exam1));
    const fpath = join(fixturesDir, 'moodle-examen1.xml');
    if (!existsSync(fpath)) {
      writeFileSync(fpath, out, 'utf-8');
    }
    const expected = readFileSync(fpath, 'utf-8');
    expect(out).toEqual(expected);
  });

  it('matches full XML for examen2.txt (seeded)', () => {
    const out = withMockedRandom(defaultSeq, () => generateMoodle(exam2));
    const fpath = join(fixturesDir, 'moodle-examen2.xml');
    if (!existsSync(fpath)) {
      writeFileSync(fpath, out, 'utf-8');
    }
    const expected = readFileSync(fpath, 'utf-8');
    expect(out).toEqual(expected);
  });
});
