import { modifierScale } from './pointer';

export interface StepTarget { step: number; min: number; max: number }

/** returns the delta implied by an arrow/page/home/end key, or null */
export function keyDelta(e: KeyboardEvent, t: StepTarget, current: number, horizontal = false): number | null {
  const up = horizontal ? 'ArrowRight' : 'ArrowUp';
  const down = horizontal ? 'ArrowLeft' : 'ArrowDown';
  const m = modifierScale(e);
  switch (e.key) {
    case up: return t.step * m;
    case down: return -t.step * m;
    case 'PageUp': return t.step * 10;
    case 'PageDown': return -t.step * 10;
    case 'Home': return isFinite(t.min) ? t.min - current : null;
    case 'End': return isFinite(t.max) ? t.max - current : null;
    default: return null;
  }
}
