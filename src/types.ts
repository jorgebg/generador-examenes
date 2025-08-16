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
  lines: [string, ...string[]];
}

export interface ParsedExam {
  hasHeader: boolean;
  vars: VarDef[];
  questions: Question[];
}
