import { precisionOf } from './math';

export interface FormatOptions { step?: number; precision?: number; unit?: string }

export function formatNumber(v: number, o: FormatOptions = {}): string {
  const p = o.precision ?? (o.step !== undefined ? precisionOf(o.step) : 2);
  let s = Math.abs(v) >= 1e6 ? v.toExponential(2) : v.toFixed(p);
  if (s === '-0' || /^-0\.0*$/.test(s)) s = s.slice(1);
  return o.unit ? `${s}${o.unit}` : s;
}

export function parseNumber(s: string): number | null {
  const t = s.replace(/[^0-9eE+\-.,]/g, '').replace(',', '.');
  if (!t) return null;
  // allow simple arithmetic like "12*2" or "100/3"
  try {
    if (/^[0-9eE+\-.*/() ]+$/.test(s)) {
      const r = Function(`"use strict";return (${s})`)();
      if (typeof r === 'number' && isFinite(r)) return r;
    }
  } catch { /* fall through */ }
  const n = parseFloat(t);
  return isFinite(n) ? n : null;
}

export const pad2 = (n: number): string => String(n).padStart(2, '0');
