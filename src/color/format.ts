import type { RGBA, ColorValue, ColorFormat } from '../controls/ColorControl';
import { rgbToHsl } from './hsv';

const to255 = (n: number): number => Math.round(Math.min(1, Math.max(0, n)) * 255);
const hex2 = (n: number): string => to255(n).toString(16).padStart(2, '0');
const r1 = (n: number): number => Math.round(n * 10) / 10;

export function formatColor(c: RGBA, format: ColorFormat, alpha = false): ColorValue {
  const a = c.a === undefined ? 1 : c.a;
  switch (format) {
    case 'hex': return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${alpha ? hex2(a) : ''}`;
    case 'rgb': return alpha ? `rgb(${to255(c.r)} ${to255(c.g)} ${to255(c.b)} / ${r1(a * 100)}%)` : `rgb(${to255(c.r)} ${to255(c.g)} ${to255(c.b)})`;
    case 'hsl': {
      const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
      const base = `${Math.round(h)} ${r1(s * 100)}% ${r1(l * 100)}%`;
      return alpha ? `hsl(${base} / ${r1(a * 100)}%)` : `hsl(${base})`;
    }
    case 'number': return (to255(c.r) << 16) | (to255(c.g) << 8) | to255(c.b);
    case 'object': return alpha ? { r: c.r, g: c.g, b: c.b, a } : { r: c.r, g: c.g, b: c.b };
  }
}

export function inferFormat(v: ColorValue): ColorFormat {
  if (typeof v === 'number') return 'number';
  if (typeof v === 'object' && v !== null) return 'object';
  const s = String(v).trim().toLowerCase();
  if (s.startsWith('rgb')) return 'rgb';
  if (s.startsWith('hsl')) return 'hsl';
  return 'hex';
}

/** does the value carry an alpha channel? (hex8, rgba(), 4th component, object.a) */
export function hasAlpha(v: ColorValue): boolean {
  if (typeof v === 'number') return false;
  if (typeof v === 'object' && v !== null) return typeof v.a === 'number';
  const s = String(v).trim();
  if (s.startsWith('#')) return s.length === 5 || s.length === 9;
  return /\/|rgba|hsla|^(rgb|hsl)\(\s*[^,]+,[^,]+,[^,]+,/.test(s);
}

/** display string for the hex input: always hex (+aa when alpha) */
export function toHexDisplay(c: RGBA, alpha: boolean): string {
  return formatColor(c, 'hex', alpha) as string;
}
