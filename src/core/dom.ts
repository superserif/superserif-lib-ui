let counter = 0;
export const uid = (prefix = 'ssui'): string => `${prefix}-${(++counter).toString(36)}`;

type Attrs = Record<string, string | number | boolean | null | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  children: (Node | string | null | undefined | false)[] = [],
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

export function setAttrs(el: Element, attrs: Attrs): void {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) { el.removeAttribute(k); continue; }
    if (k === 'class') { el.setAttribute('class', String(v)); continue; }
    el.setAttribute(k, v === true ? '' : String(v));
  }
}

export function svg(markup: string): SVGElement {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as SVGElement;
}

export const icons = {
  chevron: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>'),
  check: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>'),
  more: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>'),
  copy: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>'),
  plus: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg>'),
  play: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="ssui-icon-play"><path d="M5 3.6v8.8a.6.6 0 0 0 .92.5l6.6-4.4a.6.6 0 0 0 0-1L5.92 3.1A.6.6 0 0 0 5 3.6Z"/></svg>'),
  pause: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="ssui-icon-pause"><rect x="4" y="3.5" width="2.6" height="9" rx=".8"/><rect x="9.4" y="3.5" width="2.6" height="9" rx=".8"/></svg>'),
  refresh: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.6 6.2A5 5 0 1 0 13 8.6"/><path d="M12.8 3v3.4H9.4"/></svg>'),
  grip: () => svg('<svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><circle cx="4" cy="3" r="1"/><circle cx="8" cy="3" r="1"/><circle cx="4" cy="6" r="1"/><circle cx="8" cy="6" r="1"/><circle cx="4" cy="9" r="1"/><circle cx="8" cy="9" r="1"/></svg>'),
  close: () => svg('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>'),
};

export function readToken(root: HTMLElement, name: string): string {
  return getComputedStyle(root).getPropertyValue(`--ssui-${name}`).trim();
}

export const slug = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';

export const reducedMotion = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isEditable = (el: Element | null): boolean =>
  !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || (el as HTMLElement).isContentEditable);
