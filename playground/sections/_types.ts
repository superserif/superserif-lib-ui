import type { Panel } from '../../src/index';

export type SlotTheme = 'light' | 'dark';

export interface Section {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  /** one shared object per section; both panels of the pair bind to it */
  state(): any;
  mount(slot: HTMLElement, theme: SlotTheme, shared: any): Panel;
  /** raw source of the section file; main slices between the snippet markers */
  source: string;
  /** custom card body instead of the light/dark pair (stress, embed, reset) */
  custom?(body: HTMLElement): Panel[];
}

/** slice between `// snippet:start` and `// snippet:end`, strip common indent */
export function snippet(raw: string): string {
  const m = raw.match(/\/\/ snippet:start\n([\s\S]*?)\n\s*\/\/ snippet:end/);
  const body = m ? m[1] : raw;
  const lines = body.split('\n');
  const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^\s*/)![0].length));
  return lines.map(l => l.slice(indent)).join('\n').trim();
}
