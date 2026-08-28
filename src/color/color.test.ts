import { describe, it, expect } from 'vitest';
import { parseColor, tryParseColor } from './parse';
import { formatColor, inferFormat, hasAlpha } from './format';
import { rgbToHsv, hsvToRgb } from './hsv';

const close = (a: number, b: number, eps = 1 / 255): boolean => Math.abs(a - b) <= eps;

describe('parse', () => {
  it('hex forms', () => {
    expect(parseColor('#fff')).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseColor('#f09526')).toEqual({ r: 240 / 255, g: 149 / 255, b: 38 / 255, a: 1 });
    expect(parseColor('#1b1b1b80').a).toBeCloseTo(128 / 255, 5);
    expect(parseColor('#abcd').a).toBeCloseTo(221 / 255, 5);
    expect(tryParseColor('#12345')).toBeNull();
    expect(tryParseColor('nope')).toBeNull();
  });
  it('rgb legacy and space syntax', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor('rgba(0, 0, 255, 0.5)')).toEqual({ r: 0, g: 0, b: 1, a: 0.5 });
    expect(parseColor('rgb(0 128 0 / 50%)').g).toBeCloseTo(128 / 255, 5);
    expect(parseColor('rgb(0 128 0 / 50%)').a).toBe(0.5);
    expect(parseColor('rgb(100% 0% 0%)')).toEqual({ r: 1, g: 0, b: 0, a: 1 });
  });
  it('hsl', () => {
    const c = parseColor('hsl(120 100% 50%)');
    expect(close(c.r, 0) && close(c.g, 1) && close(c.b, 0)).toBe(true);
    expect(parseColor('hsla(0, 100%, 50%, .25)').a).toBe(0.25);
    expect(parseColor('hsl(0.5turn 100% 50%)').b).toBeCloseTo(1, 5);
  });
  it('number and object', () => {
    expect(parseColor(0xf09526)).toEqual(parseColor('#f09526'));
    expect(parseColor({ r: 255, g: 0, b: 0 })).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor({ r: 0.5, g: 0.5, b: 0.5, a: 0.5 })).toEqual({ r: 0.5, g: 0.5, b: 0.5, a: 0.5 });
  });
});

describe('format roundtrips', () => {
  const samples = ['#000000', '#ffffff', '#f09526', '#1b1b1b', '#7f3fbf'];
  it('hex', () => { for (const s of samples) expect(formatColor(parseColor(s), 'hex')).toBe(s); });
  it('hex8', () => { expect(formatColor(parseColor('#f0952680'), 'hex', true)).toBe('#f0952680'); });
  it('rgb', () => { for (const s of samples) expect(formatColor(parseColor(formatColor(parseColor(s), 'rgb') as string), 'hex')).toBe(s); });
  it('hsl', () => { for (const s of samples) expect(formatColor(parseColor(formatColor(parseColor(s), 'hsl') as string), 'hex')).toBe(s); });
  it('number', () => { expect(formatColor(parseColor('#f09526'), 'number')).toBe(0xf09526); expect(formatColor(parseColor(0x0000ff), 'number')).toBe(255); });
  it('object', () => {
    const o = formatColor(parseColor('#ff0000'), 'object') as { r: number; g: number; b: number; a?: number };
    expect(o).toEqual({ r: 1, g: 0, b: 0 });
    expect((formatColor(parseColor('#ff000080'), 'object', true) as any).a).toBeCloseTo(128 / 255, 5);
  });
  it('inferFormat / hasAlpha', () => {
    expect(inferFormat('#abc')).toBe('hex');
    expect(inferFormat('rgb(1 2 3)')).toBe('rgb');
    expect(inferFormat('hsl(1 2% 3%)')).toBe('hsl');
    expect(inferFormat(12)).toBe('number');
    expect(inferFormat({ r: 0, g: 0, b: 0 })).toBe('object');
    expect(hasAlpha('#12345678')).toBe(true);
    expect(hasAlpha('#123456')).toBe(false);
    expect(hasAlpha('rgb(1 2 3 / 50%)')).toBe(true);
    expect(hasAlpha({ r: 0, g: 0, b: 0, a: 1 })).toBe(true);
  });
});

describe('hsv', () => {
  it('known values', () => {
    expect(rgbToHsv(1, 0, 0)).toEqual({ h: 0, s: 1, v: 1 });
    expect(rgbToHsv(0, 1, 0).h).toBe(120);
    expect(rgbToHsv(0, 0, 1).h).toBe(240);
    expect(rgbToHsv(0.5, 0.5, 0.5)).toEqual({ h: 0, s: 0, v: 0.5 });
  });
  it('roundtrip', () => {
    for (const [r, g, b] of [[0.2, 0.4, 0.9], [0.94, 0.58, 0.15], [0, 0, 0], [1, 1, 1], [0.3, 0.3, 0.31]]) {
      const { h, s, v } = rgbToHsv(r, g, b); const o = hsvToRgb(h, s, v);
      expect(close(o.r, r, 1e-6) && close(o.g, g, 1e-6) && close(o.b, b, 1e-6)).toBe(true);
    }
  });
});
