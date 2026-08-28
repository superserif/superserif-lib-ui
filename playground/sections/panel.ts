import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './panel.ts?raw';

export const section: Section = {
  id: 'panel', title: 'Panel', tag: 'root', source,
  blurb: 'The root container: title, meta, collapse (button or the h key), drag by the header, resize from the right edge. Tokens are overridable per panel.',
  state: () => ({ exposure: 0.5, grain: 12, mono: false }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    // snippet:start
    const panel = new Panel({
      title: 'Film',
      meta: 'v0.1',
      theme,                       // 'light' | 'dark' | 'auto'
      container: slot,             // omit for a fixed top-right panel
      position: 'static',
      hotkey: null,                // default 'h' toggles collapse
    });
    if (theme === 'dark') panel.setToken('color-accent', '#ff4f00');
    panel.add(s, 'exposure', { min: 0, max: 1 }).listen();
    panel.add(s, 'grain', { min: 0, max: 100, step: 1 }).listen();
    panel.add(s, 'mono').listen();
    panel.addButtons([
      { label: 'Collapse', onClick: () => panel.toggle() },
      { label: 'Reset', onClick: () => panel.reset(), variant: 'ghost' },
    ]);
    // snippet:end
    return panel;
  },
};
