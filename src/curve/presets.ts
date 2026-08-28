import type { CurveValue } from '../controls/CurveControl';

const bez = (a: number, b: number, c: number, d: number): CurveValue => ({ type: 'bezier', points: [a, b, c, d] });

/** the studio spring, sampled: overshoot ~1.05 near 46%, settles to 1 */
const spring: CurveValue = {
  type: 'points',
  points: [[0, 0], [0.12, 0.34], [0.25, 0.7], [0.36, 0.94], [0.46, 1.05], [0.58, 1.045], [0.72, 1.02], [0.86, 1.005], [1, 1]],
};

export const curvePresets: Record<string, CurveValue> = {
  linear: bez(0, 0, 1, 1),
  ease: bez(0.25, 0.1, 0.25, 1),
  easeIn: bez(0.42, 0, 1, 1),
  easeOut: bez(0, 0, 0.58, 1),
  easeInOut: bez(0.42, 0, 0.58, 1),
  easeInQuad: bez(0.11, 0, 0.5, 0),
  easeInCubic: bez(0.32, 0, 0.67, 0),
  easeInExpo: bez(0.7, 0, 0.84, 0),
  easeOutQuad: bez(0.5, 1, 0.89, 1),
  easeOutCubic: bez(0.33, 1, 0.68, 1),
  easeOutExpo: bez(0.16, 1, 0.3, 1),
  easeInOutCubic: bez(0.65, 0, 0.35, 1),
  spring,
};
