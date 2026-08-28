import { describe, it, expect } from 'vitest';
import { bezierFn } from './bezier';
import { monotoneFn } from './monotone';
import { toLinearCSS, parseLinearCSS } from './linear';

describe('bezier', () => {
  it('symmetric ease-in-out hits 0.5 at 0.5', () => {
    expect(bezierFn(0.42, 0, 0.58, 1)(0.5)).toBeCloseTo(0.5, 4);
  });
  it('clamps ends', () => {
    const f = bezierFn(0.25, 0.1, 0.25, 1);
    expect(f(0)).toBe(0); expect(f(1)).toBe(1);
  });
  it('linear passthrough', () => {
    expect(bezierFn(0, 0, 1, 1)(0.37)).toBeCloseTo(0.37, 6);
  });
});

describe('monotone', () => {
  it('is non-decreasing through monotone points', () => {
    const f = monotoneFn([[0, 0], [0.5, 1], [1, 1]]);
    let prev = -Infinity;
    for (let i = 0; i <= 100; i++) { const v = f(i / 100); expect(v).toBeGreaterThanOrEqual(prev - 1e-9); prev = v; }
    expect(f(0.5)).toBeCloseTo(1, 6);
  });
});

describe('linear css', () => {
  it('roundtrips within 0.01', () => {
    const f = bezierFn(0.33, 1, 0.68, 1);
    const g = parseLinearCSS(toLinearCSS(f, 32));
    for (let i = 0; i <= 20; i++) expect(Math.abs(g(i / 20) - f(i / 20))).toBeLessThan(0.01);
  });
  it('compacts numbers', () => {
    expect(toLinearCSS((t) => t, 2)).toBe('linear(0, 0.5, 1)');
  });
});
