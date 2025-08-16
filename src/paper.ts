import { parseHeader, splitQuestions } from './parser';
import { PaperOptions } from './types';
import { evaluatePaperExpressions, randomVarValuesForPaper } from './eval';
import { shuffleInPlace, systemRNG } from './rng';

export function generatePaper(input: string, options: PaperOptions = {}): string {
  const rng = options.rng ?? systemRNG;
  const { hasHeader, vars, body } = parseHeader(input);
  let effectiveText = input;
  if (hasHeader) {
    const values = randomVarValuesForPaper(vars, rng);
    effectiveText = evaluatePaperExpressions(body, values);
  }

  const questions = splitQuestions(effectiveText);

  // Shuffle answers and questions as in papel.py
  const modified: string[][] = [];
  for (const q of questions) {
    const lines = q.lines.slice();
    if (lines.length < 2) continue; // Ignore malformed
    lines[1] = '$$$' + lines[1]; // mark correct answer
    const responses = lines.slice(1);
    shuffleInPlace(responses, rng);
    const merged = [lines[0], ...responses];
    modified.push(merged);
  }
  shuffleInPlace(modified, rng);

  // Build key and remove marks
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const key: [string, string][] = [];
  for (let i = 0; i < modified.length; i++) {
    const m = modified[i];
    for (let j = 1; j < m.length; j++) {
      if (m[j].startsWith('$$$')) {
        m[j] = m[j].slice(3);
        key.push([String(i + 1), alphabet[j - 1]]);
        break;
      }
    }
  }

  // Compose output
  let out = '';
  for (let i = 0; i < modified.length; i++) {
    const m = modified[i];
    for (let j = 0; j < m.length; j++) {
      if (j === 0) {
        out += `${i + 1}. ${m[0]}\n`;
      } else {
        out += `${alphabet[j - 1]}) ${m[j]}\n`;
      }
    }
    out += '\n';
  }

  out += '\n'.repeat(5) + 'CLAVE';
  for (const pair of key) {
    out += '\n' + pair[0] + pair[1];
  }

  return out;
}
