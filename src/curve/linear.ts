const fmt = (v: number): string => {
  const s = v.toFixed(4).replace(/\.?0+$/, '');
  return s === '' || s === '-0' ? '0' : s;
};

/** sample an easing function into a CSS linear() string */
export function toLinearCSS(fn: (t: number) => number, samples = 24): string {
  const out: string[] = [];
  for (let i = 0; i <= samples; i++) out.push(fmt(fn(i / samples)));
  return `linear(${out.join(', ')})`;
}

/** parse linear(a, b, c …) (optionally with `<percentage>` stops) back into a function */
export function parseLinearCSS(s: string): (t: number) => number {
  const inner = s.trim().replace(/^linear\(/i, '').replace(/\)$/, '');
  const stops: { v: number; p: number | null }[] = inner.split(',').map(part => {
    const [v, p] = part.trim().split(/\s+/);
    return { v: parseFloat(v), p: p ? parseFloat(p) / 100 : null };
  }).filter(st => isFinite(st.v));
  if (!stops.length) return (t) => t;
  if (stops[0].p === null) stops[0].p = 0;
  if (stops[stops.length - 1].p === null) stops[stops.length - 1].p = 1;
  // fill missing positions linearly between known ones
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].p !== null) continue;
    let j = i; while (stops[j].p === null) j++;
    const p0 = stops[i - 1].p as number, p1 = stops[j].p as number;
    for (let k = i; k < j; k++) stops[k].p = p0 + ((p1 - p0) * (k - i + 1)) / (j - i + 1);
  }
  return (t: number): number => {
    if (t <= (stops[0].p as number)) return stops[0].v;
    for (let i = 1; i < stops.length; i++) {
      const a = stops[i - 1], b = stops[i];
      if (t <= (b.p as number)) {
        const span = (b.p as number) - (a.p as number) || 1e-9;
        return a.v + ((b.v - a.v) * (t - (a.p as number))) / span;
      }
    }
    return stops[stops.length - 1].v;
  };
}
