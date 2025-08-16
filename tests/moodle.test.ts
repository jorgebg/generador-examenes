import { describe, it, expect } from 'vitest';
import { generateMoodle } from '../src/moodle';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('moodle generator', () => {
  const sample = readFileSync(join(__dirname, '..', 'examen2.txt'), 'utf-8');

  it('generates XML with quiz and questions', () => {
    const xml = generateMoodle(sample);
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<quiz>');
    expect(xml).toContain('<question');
    expect(xml).toContain('</quiz>');
  });
});
