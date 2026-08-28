import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './folder.ts?raw';

export const section: Section = {
  id: 'folder', title: 'Folder', tag: 'group', source,
  blurb: 'Collapsible groups. The header shows the number of controls inside; nested folders flatten to a hairline instead of a second card.',
  state: () => ({ size: 24, gap: 8, x: 0.2, y: 0.8, rotate: 15, loop: true }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Layout', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    const grid = panel.addFolder('Grid');
    grid.add(s, 'size', { min: 4, max: 64, step: 1 }).listen();
    grid.add(s, 'gap', { min: 0, max: 32, step: 1 }).listen();

    const origin = grid.addFolder('Origin', { collapsed: true });
    origin.add(s, 'x', { min: 0, max: 1 }).listen();
    origin.add(s, 'y', { min: 0, max: 1 }).listen();

    const motion = panel.addFolder('Motion');
    motion.add(s, 'rotate', { min: -180, max: 180, step: 1, unit: '°' }).listen();
    motion.add(s, 'loop').listen();
    // snippet:end
    return panel;
  },
};
