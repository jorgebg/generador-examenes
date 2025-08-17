import { VarDef } from './types';
import { Parser } from 'expr-eval';

export interface PapelVarValues {
  [name: string]: number;
}

export function randomVarValuesForPapel(vars: VarDef[]): PapelVarValues {
  const result: PapelVarValues = {};
  for (const v of vars) {
    if (v.type === 'entero') {
      const min0 = v.values[0];
      const max0 = v.values[1];
      if (min0 === undefined || max0 === undefined) {
        throw new Error(`Variable '${v.name}': rango inválido`);
      }
      const min = Math.trunc(min0);
      const max = Math.trunc(max0);
      const val = min + Math.floor(Math.random() * (max - min + 1));
      result[v.name] = val;
    } else if (v.type === 'real') {
      const min0 = v.values[0];
      const max0 = v.values[1];
      if (min0 === undefined || max0 === undefined) {
        throw new Error(`Variable '${v.name}': rango inválido`);
      }
      const val = min0 + Math.random() * (max0 - min0);
      result[v.name] = val;
    } else if (v.type === 'lista') {
      // In papel.py list values are cast to int
      const list = v.values.map(n => Math.trunc(n));
      const idx = Math.floor(Math.random() * list.length);
      result[v.name] = list[idx]!;
    }
  }
  return result;
}

// Python's round: bankers rounding (round half to even)
function roundHalfToEven(x: number, decimals: number): number {
  if (!isFinite(x)) return x;
  const factor = Math.pow(10, decimals);
  const n = x * factor;
  const floorN = Math.floor(n);
  const diff = n - floorN; // in [0,1) even for negatives
  const EPS = 1e-12;
  let rounded: number;
  if (Math.abs(diff - 0.5) <= EPS) {
    // tie: choose even
    rounded = (floorN % 2 === 0) ? floorN : floorN + 1;
  } else {
    rounded = Math.round(n);
  }
  return rounded / factor;
}

export function roundToSignificant(x: number, n: number): number {
  if (!isFinite(x)) return x;
  const ax = Math.abs(x);
  if (ax === 0) return 0;
  const m = Math.ceil(Math.log10(ax));
  const decimals = n - m;
  return roundHalfToEven(x, decimals);
}

const RE = /@@ (.+?) @@/g;

export function evaluatePapelExpressions(body: string, varValues: PapelVarValues): string {
  // Find all occurrences non-greedily
  const occurrences: string[] = [];
  body.replace(RE, (_, expr: string) => {
    occurrences.push(expr);
    return '';
  });

  // Unique mapping as in papel.py (dict, then replace all occurrences of each key)
  const map = new Map<string, number>();
  const parser = new Parser({ operators: { logical: false, comparison: false, concatenate: false } });

  // expr-eval uses ^ for power; Python uses **
  const normalize = (s: string) => s.replace(/\*\*/g, '^');

  for (const expr of occurrences) {
    if (!map.has(expr)) {
      const jsExpr = normalize(expr);
      const compiled = parser.parse(jsExpr);
      const value = compiled.evaluate(varValues as any) as number;
      map.set(expr, roundToSignificant(value, 3));
    }
  }

  let out = body;
  for (const [expr, value] of map.entries()) {
    const needle = '@@ ' + expr + ' @@';
    out = out.split(needle).join(String(value));
  }
  return out;
}

export interface DatasetVar {
  name: string;
  min: number;
  max: number;
  series: number[]; // length >= 10
}

export function buildDatasets(vars: VarDef[]): DatasetVar[] {
  const seriesLen = 10;
  const datasets: DatasetVar[] = [];
  for (const v of vars) {
    if (v.type === 'entero') {
      const min0 = v.values[0];
      const max0 = v.values[1];
      if (min0 === undefined || max0 === undefined) {
        throw new Error(`Variable '${v.name}': rango inválido`);
      }
      const min = Math.trunc(min0);
      const max = Math.trunc(max0);
      const series: number[] = [];
      for (let i = 0; i < seriesLen; i++) {
        const val = min + Math.floor(Math.random() * (max - min + 1));
        series.push(val);
      }
      datasets.push({ name: v.name, min, max, series });
    } else if (v.type === 'real') {
      const min0 = v.values[0];
      const max0 = v.values[1];
      if (min0 === undefined || max0 === undefined) {
        throw new Error(`Variable '${v.name}': rango inválido`);
      }
      const series: number[] = [];
      for (let i = 0; i < seriesLen; i++) {
        const x = min0 + Math.random() * (max0 - min0);
        const decimals = 2 + Math.ceil(-Math.log10(Math.abs(x)));
        const val = roundHalfToEven(x, decimals);
        series.push(val);
      }
      datasets.push({ name: v.name, min: min0, max: max0, series });
    } else if (v.type === 'lista') {
      const values = v.values.map(Number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      let list = values.slice();
      if (list.length < seriesLen) {
        const k = Math.floor(seriesLen / list.length);
        list = list.concat(Array.from({ length: k }, () => values).flat());
      }
      datasets.push({ name: v.name, min, max, series: list });
    }
  }
  return datasets;
}

export function replaceForMoodle(body: string, vars: VarDef[]): string {
  // Sequentially replace each occurrence transforming var names into {var}
  const matches: RegExpExecArray[] = [];
  const re = new RegExp(RE);
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    matches.push(m);
  }

  let out = body;
  for (const match of matches) {
    const raw = match[1];
    let transformed = raw;
    for (const v of vars) {
      transformed = transformed.split(v.name).join('{' + v.name + '}');
    }
    transformed = '{=' + transformed + '}';
    out = out.replace(/@@ (.+?) @@/, transformed);
  }
  return out;
}
