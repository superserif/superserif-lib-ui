import type { RGBA, ColorValue } from '../controls/ColorControl';
import { hslToRgb } from './hsv';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

function num(tok: string, scale: number): number {
  const t = tok.trim();
  if (t === 'none') return 0;
  if (t.endsWith('%')) return parseFloat(t) / 100;
  const n = parseFloat(t);
  return scale === 1 ? n : n / scale;
}
function angle(tok: string): number {
  const t = tok.trim();
  if (t.endsWith('deg')) return parseFloat(t);
  if (t.endsWith('rad')) return parseFloat(t) * 180 / Math.PI;
  if (t.endsWith('turn')) return parseFloat(t) * 360;
  if (t.endsWith('grad')) return parseFloat(t) * 0.9;
  return parseFloat(t);
}
function splitArgs(inner: string): { c: string[]; a: string | null } {
  let a: string | null = null;
  let body = inner;
  if (inner.includes('/')) { const [l, r] = inner.split('/'); body = l; a = r; }
  const c = body.split(/[\s,]+/).filter(Boolean);
  if (c.length === 4 && a === null) a = c.pop()!;
  return { c, a };
}

/** any supported ColorValue -> RGBA with 0..1 channels. Invalid input returns null. */
export function tryParseColor(v: ColorValue): RGBA | null {
  if (typeof v === 'number') {
    if (!isFinite(v)) return null;
    const n = Math.max(0, Math.min(0xffffff, Math.round(v)));
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 };
  }
  if (typeof v === 'object' && v !== null) {
    if (typeof v.r !== 'number' || typeof v.g !== 'number' || typeof v.b !== 'number') return null;
    const max = Math.max(v.r, v.g, v.b);
    const k = max > 1 ? 255 : 1;
    return { r: clamp01(v.r / k), g: clamp01(v.g / k), b: clamp01(v.b / k), a: v.a === undefined ? 1 : clamp01(v.a) };
  }
  if (typeof v !== 'string') return null;
  const s = v.trim().toLowerCase();
  const hex = s.match(/^#?([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split('').map(c => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = parseInt(h, 16);
    if (h.length === 6) return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a: 1 };
    return { r: ((n >>> 24) & 255) / 255, g: ((n >> 16) & 255) / 255, b: ((n >> 8) & 255) / 255, a: (n & 255) / 255 };
  }
  const fn = s.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (!fn) return null;
  const { c, a } = splitArgs(fn[2]);
  if (c.length !== 3) return null;
  const alpha = a === null ? 1 : clamp01(num(a, 1));
  if (fn[1].startsWith('rgb')) {
    return { r: clamp01(num(c[0], 255)), g: clamp01(num(c[1], 255)), b: clamp01(num(c[2], 255)), a: alpha };
  }
  const { r, g, b } = hslToRgb(angle(c[0]), clamp01(num(c[1], 100)), clamp01(num(c[2], 100)));
  return { r, g, b, a: alpha };
}

export function parseColor(v: ColorValue): RGBA {
  return tryParseColor(v) ?? { r: 0, g: 0, b: 0, a: 1 };
}
