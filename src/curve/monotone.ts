/** Fritsch–Carlson monotone cubic interpolation through sorted points (x in 0..1). */
export function monotoneFn(points: [number, number][]): (t: number) => number {
  const pts = [...points].sort((a, b) => a[0] - b[0]);
  const n = pts.length;
  if (n === 0) return (t) => t;
  if (n === 1) return () => pts[0][1];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const dx: number[] = [], dy: number[] = [], m: number[] = [];
  for (let i = 0; i < n - 1; i++) { dx.push(xs[i + 1] - xs[i] || 1e-9); dy.push(ys[i + 1] - ys[i]); m.push(dy[i] / dx[i]); }
  const tan: number[] = new Array(n).fill(0);
  tan[0] = m[0]; tan[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) tan[i] = 0;
    else {
      const w1 = 2 * dx[i] + dx[i - 1], w2 = dx[i] + 2 * dx[i - 1];
      tan[i] = (w1 + w2) / (w1 / m[i - 1] + w2 / m[i]);
    }
  }
  return (t: number): number => {
    if (t <= xs[0]) return ys[0];
    if (t >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (i < n - 2 && t > xs[i + 1]) i++;
    const h = dx[i], s = (t - xs[i]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    return h00 * ys[i] + h10 * h * tan[i] + h01 * ys[i + 1] + h11 * h * tan[i + 1];
  };
}
