import type { Container, Child } from './Container';
import { trackPointer } from './pointer';

export interface ReorderTarget extends Child { handle: HTMLElement }
const isReorderable = (c: Child): c is ReorderTarget => 'handle' in c && (c as ReorderTarget).handle instanceof HTMLElement;

/**
 * Drag-to-reorder for a container's direct children that expose a `handle` (Folders).
 * The dragged block follows the pointer; siblings slide out of the way; the order is
 * committed with container.move() on release. Returns a dispose function.
 */
export function makeReorderable(container: Container): () => void {
  const disposers = new Map<Child, () => void>();
  const root = container.el;

  const wire = (c: Child): void => {
    if (!isReorderable(c) || disposers.has(c)) return;
    c.el.setAttribute('data-ssui-reorderable', '');
    let siblings: { el: HTMLElement; mid: number; h: number }[] = [];
    let from = 0, to = 0, startY = 0, minDy = -Infinity, maxDy = Infinity;
    const gap = (): number => parseFloat(getComputedStyle(c.el.parentElement!).gap) || 0;

    const off = trackPointer(c.handle, {
      threshold: 6,
      cursor: 'grabbing',
      ignore: (e) => { const b = (e.target as HTMLElement).closest('button, input'); return !!b && b !== c.handle; },
      onStart: (s) => {
        const list = container.children.filter(isReorderable);
        from = to = list.indexOf(c);
        startY = s.y0;
        siblings = list.map(x => { const r = x.el.getBoundingClientRect(); return { el: x.el, mid: r.top + r.height / 2, h: r.height }; });
        // keep the lifted block inside the scroll body so it never slides under the header/footer
        const body = c.el.parentElement!.getBoundingClientRect();
        const me = c.el.getBoundingClientRect();
        minDy = body.top - me.top; maxDy = body.bottom - me.bottom;
        c.el.setAttribute('data-ssui-reordering', '');
        root.setAttribute('data-ssui-reorder-live', '');
      },
      onMove: (s) => {
        const dy = Math.max(minDy, Math.min(maxDy, s.y - startY));
        c.el.style.transform = `translateY(${dy}px)`;
        const me = siblings[from];
        const y = me.mid + dy;
        // target index: how many siblings' midpoints we've crossed
        let idx = 0;
        siblings.forEach((sb, i) => { if (i !== from && sb.mid < y) idx++; });
        to = idx;
        const g = gap();
        siblings.forEach((sb, i) => {
          if (i === from) return;
          let shift = 0;
          if (i > from && i <= to) shift = -(me.h + g);
          else if (i < from && i >= to) shift = me.h + g;
          sb.el.style.transform = shift ? `translateY(${shift}px)` : '';
        });
      },
      onEnd: () => {
        // commit: move in the container, clear transforms next frame so the slide settles without a jump
        siblings.forEach(sb => { sb.el.style.transform = ''; });
        c.el.style.transform = '';
        c.el.removeAttribute('data-ssui-reordering');
        root.removeAttribute('data-ssui-reorder-live');
        if (to !== from) {
          const list = container.children.filter(isReorderable);
          const target = list[to];
          // indexOf(target) is computed before c is removed: moving down lands after target, moving up lands before it
          container.move(c, container.children.indexOf(target));
        }
        c.el.setAttribute('data-ssui-dragged', '');
        requestAnimationFrame(() => c.el.removeAttribute('data-ssui-dragged'));
      },
    });
    disposers.set(c, () => { off(); c.el.removeAttribute('data-ssui-reorderable'); });
  };

  container.children.forEach(wire);
  const offAdd = container.on('add', wire);
  const offRemove = container.on('remove', (c) => { disposers.get(c)?.(); disposers.delete(c); });
  return () => { offAdd(); offRemove(); disposers.forEach(d => d()); disposers.clear(); };
}
