/** cubic-bezier(x1,y1,x2,y2) easing solver: Newton–Raphson, bisection fallback. */
export function bezierFn(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const A = (a: number, b: number): number => 1 - 3 * b + 3 * a;
  const B = (a: number, b: number): number => 3 * b - 6 * a;
  const C = (a: number): number => 3 * a;
  const calc = (t: number, a: number, b: number): number => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
  const slope = (t: number, a: number, b: number): number => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);

  if (x1 === y1 && x2 === y2) return (t) => t;

  const solveX = (x: number): number => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const s = slope(t, x1, x2);
      if (Math.abs(s) < 1e-6) break;
      const err = calc(t, x1, x2) - x;
      if (Math.abs(err) < 1e-7) return t;
      t -= err / s;
    }
    // bisection fallback
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 32 && hi - lo > 1e-7; i++) {
      const cx = calc(t, x1, x2);
      if (cx < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return calc(solveX(t), y1, y2);
  };
}
