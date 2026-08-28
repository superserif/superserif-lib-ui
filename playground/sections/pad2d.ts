import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './pad2d.ts?raw';

export const section: Section = {
  id: 'pad2d', title: 'Pad 2D', tag: 'value', source,
  blurb: 'Two axes on one surface. Binds an {x, y} object in place, or two separate keys. Arrow keys move one axis at a time.',
  state: () => ({ offset: { x: 0, y: 0 }, px: 0.5, py: 0.5 }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Pad 2D', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    // object form: s.offset = { x, y } is mutated in place
    panel.addPad2D(s, 'offset', {
      x: { min: -1, max: 1, label: 'pan' },
      y: { min: -1, max: 1, label: 'tilt' },
    }).listen();
    // two-key form
    panel.addPad2D(s, 'px', 'py', {
      x: { min: 0, max: 1 }, y: { min: 0, max: 1 }, size: 96,
    }).listen();
    // snippet:end
    return panel;
  },
};
