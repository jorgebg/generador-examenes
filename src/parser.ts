import { HeaderParseResult, ParsedExam, Question, VarDef, VarType } from './types';

const HEADER_MARK = '\n@@@@\n\n';
const MULTILINE_MARK = '+++p\n';

function normalizeInput(text: string): string {
  // Remove UTF-8 BOM and normalize CRLF/CR to LF
  const noBom = text.replace(/^\uFEFF/, '');
  return noBom.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function parseHeader(text: string): HeaderParseResult {
  const t = normalizeInput(text);
  if (t.includes(HEADER_MARK)) {
    const [cabecera, body] = t.split(HEADER_MARK);
    const lines = cabecera.split('\n').filter(l => l.length > 0);
    const vars: VarDef[] = lines.map(line => {
      const parts = line.split(',');
      const type = parts[0] as VarType;
      const name = parts[1];
      const rest = parts.slice(2).map(x => Number(x));
      return { type, name, values: rest };
    });
    return { hasHeader: true, vars, body };
  }
  return { hasHeader: false, vars: [], body: t };
}

export function splitQuestions(text: string): Question[] {
  const blocks = text.split('\n\n');
  const questions: Question[] = [];
  for (const block of blocks) {
    if (block.trim() === '') continue;
    if (block.includes(MULTILINE_MARK)) {
      const parts = block.split(MULTILINE_MARK);
      const enunciado = parts.shift()!; // includes trailing \n
      const after = parts[0];
      const respuestas = after.split('\n').filter(l => l.length > 0);
      const stmt = enunciado.slice(0, -1); // remove last char as in Python
      questions.push({ lines: [stmt, ...respuestas] });
    } else {
      const lines = block.split('\n').filter(l => l.length > 0);
      questions.push({ lines });
    }
  }
  return questions;
}

export function parseExam(text: string): ParsedExam {
  const { hasHeader, vars, body } = parseHeader(text);
  const questions = splitQuestions(hasHeader ? body : body);
  return { hasHeader, vars, questions };
}

export { HEADER_MARK, MULTILINE_MARK };
