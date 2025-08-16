import { describe, it, expect } from 'vitest';
import { parseExam } from '../src/parser';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('parser', () => {
  const sample = readFileSync(join(__dirname, '..', 'examen2.txt'), 'utf-8');

  it('parses header and questions', () => {
    const parsed = parseExam(sample);
    expect(parsed.hasHeader).toBe(true);
    expect(parsed.vars.length).toBe(3);
    expect(parsed.questions.length).toBe(2);

    const q1 = parsed.questions[0].lines;
    expect(q1[0]).toContain('@@ x1 @@');
    expect(q1.length).toBe(4); // statement + 3 answers

    const q2 = parsed.questions[1].lines;
    // multiline enunciado before +++p is joined into a single line with trailing removal
    expect(q2[0]).toContain('¿Estás de acuerdo');
    expect(q2.length).toBe(5); // statement + 4 answers
  });
});
