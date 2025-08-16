export type VarType = 'entero' | 'real' | 'lista';

export interface VarDef {
  type: VarType;
  name: string;
  // for entero/real, [min, max]; for lista, values[]
  values: number[];
}

export interface HeaderParseResult {
  hasHeader: boolean;
  vars: VarDef[];
  body: string;
}

export interface Question {
  // First element is statement; following are options
  lines: string[];
}

export interface ParsedExam {
  hasHeader: boolean;
  vars: VarDef[];
  questions: Question[];
}

export interface RandomSource {
  // returns a float in [0,1)
  next(): number;
}

export interface PaperOptions {
  rng?: RandomSource;
}

export interface MoodleOptions {
  rng?: RandomSource;
}
