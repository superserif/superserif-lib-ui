export const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
export const mapRange = (v: number, a1: number, a2: number, b1: number, b2: number): number =>
  b1 + ((v - a1) / (a2 - a1 || 1)) * (b2 - b1);

/** decimals implied by a step: 0.01 -> 2, 5 -> 0, 0.25 -> 2 */
export function precisionOf(step: number): number {
  if (!isFinite(step) || step === 0) return 2;
  const s = step.toString();
  if (s.includes('e-')) return parseInt(s.split('e-')[1], 10);
  const i = s.indexOf('.');
  return i === -1 ? 0 : s.length - i - 1;
}

/** snap to a step grid anchored at `origin` (min when finite, else 0) */
export function snap(v: number, step: number, origin = 0): number {
  if (!step) return v;
  const p = precisionOf(step);
  return +((Math.round((v - origin) / step) * step + origin).toFixed(p));
}

/** infer a sensible step from an initial value's magnitude & decimals */
export function inferStep(value: number, min?: number, max?: number): number {
  if (isFinite(min as number) && isFinite(max as number)) {
    const range = (max as number) - (min as number);
    if (range <= 1) return 0.001;
    if (range <= 10) return 0.01;
    if (range <= 100) return 0.1;
    return 1;
  }
  const dec = precisionOf(value);
  return dec ? +Math.pow(10, -dec).toFixed(dec) : 1;
}
