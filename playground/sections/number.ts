import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './number.ts?raw';

export const section: Section = {
  id: 'number', title: 'Number', tag: 'value', source,
  blurb: 'The value is the control: drag it vertically to scrub (shift ×10, alt ×0.1), click to type, arrows to step. A hairline under the digits stretches with the drag distance.',
  state: () => ({ radius: 24, blur: 0.5, seed: 1337, threshold: 0.125, locked: 42 }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Number', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addNumber(s, 'radius', { min: 0, max: 200, step: 1, unit: 'px' }).listen();
    panel.addNumber(s, 'blur', { min: 0, max: 1, step: 0.01 }).listen();
    panel.addNumber(s, 'threshold', { step: 0.001 }).listen();
    panel.addNumber(s, 'seed', { step: 1 }).listen();            // unbounded
    panel.addNumber(s, 'locked', { disabled: true }).listen();
    // snippet:end
    return panel;
  },
};
