export interface DragSession {
  x: number; y: number;      // current client coords
  x0: number; y0: number;    // origin
  dx: number; dy: number;    // delta since origin
  mx: number; my: number;    // delta since last move
  shift: boolean; alt: boolean; meta: boolean;
  moved: boolean;
}
export interface PointerHandlers {
  threshold?: number;                        // px before onStart fires (default 3)
  immediate?: boolean;                       // start on pointerdown (tracks, pads)
  onStart?(s: DragSession, e: PointerEvent): void;
  onMove?(s: DragSession, e: PointerEvent): void;
  onEnd?(s: DragSession, e: PointerEvent): void;
  onTap?(e: PointerEvent): void;             // up without crossing threshold
  cursor?: string;                            // body cursor while dragging
  /** return true to let this pointerdown through untouched (e.g. a button inside a drag handle) */
  ignore?(e: PointerEvent): boolean;
}

/** pointer-capture drag helper. Every control uses this; no window.mousemove anywhere. */
export function trackPointer(el: HTMLElement, hd: PointerHandlers): () => void {
  const threshold = hd.threshold ?? 3;
  let s: DragSession | null = null;
  let started = false;
  let prevCursor = '';

  const root = (): HTMLElement | null => el.closest('.ssui-panel');

  const down = (e: PointerEvent): void => {
    if (e.button !== 0 || s) return;
    if (hd.ignore?.(e)) return;
    s = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, dx: 0, dy: 0, mx: 0, my: 0, shift: e.shiftKey, alt: e.altKey, meta: e.metaKey || e.ctrlKey, moved: false };
    started = false;
    el.setPointerCapture(e.pointerId);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    if (hd.immediate) begin(e);
  };
  const begin = (e: PointerEvent): void => {
    if (!s || started) return;
    started = true;
    root()?.setAttribute('data-ssui-dragging', '');
    if (hd.cursor) { prevCursor = document.body.style.cursor; document.body.style.cursor = hd.cursor; }
    hd.onStart?.(s, e);
  };
  const move = (e: PointerEvent): void => {
    if (!s) return;
    s.mx = e.clientX - s.x; s.my = e.clientY - s.y;
    s.x = e.clientX; s.y = e.clientY;
    s.dx = s.x - s.x0; s.dy = s.y - s.y0;
    s.shift = e.shiftKey; s.alt = e.altKey; s.meta = e.metaKey || e.ctrlKey;
    if (!started) {
      if (Math.hypot(s.dx, s.dy) < threshold) return;
      s.moved = true;
      begin(e);
    }
    s.moved = true;
    hd.onMove?.(s, e);
  };
  const up = (e: PointerEvent): void => {
    if (!s) return;
    const session = s; s = null;
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('lostpointercapture', up);
    try { if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    if (started) {
      root()?.removeAttribute('data-ssui-dragging');
      if (hd.cursor) document.body.style.cursor = prevCursor;
      hd.onEnd?.(session, e);
    } else if (e.type === 'pointerup') {
      hd.onTap?.(e);
    }
    started = false;
  };

  el.addEventListener('pointerdown', down);
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    el.removeEventListener('lostpointercapture', up);
  };
}

/** modifier multiplier shared by scrub + arrow keys: shift x10, alt x0.1 */
export const modifierScale = (e: { shiftKey?: boolean; altKey?: boolean } | DragSession): number => {
  const shift = 'shift' in e ? e.shift : !!e.shiftKey;
  const alt = 'alt' in e ? e.alt : !!e.altKey;
  return shift ? 10 : alt ? 0.1 : 1;
};
