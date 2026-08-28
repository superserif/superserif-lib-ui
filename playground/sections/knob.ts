import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './knob.ts?raw';

export const section: Section = {
  id: 'knob', title: 'Knob', tag: 'value', source,
  blurb: 'A dial with a ring of ticks. Default drag is vertical; mode "rotary" follows the pointer angle. Three sizes via --ssui-knob-size.',
  state: () => ({ drive: 40, tone: 0.5, feedback: 0.25, width: 50 }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Knob', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addKnob(s, 'drive', { min: 0, max: 100, step: 1, size: 'lg' }).listen();
    panel.addKnob(s, 'tone', { min: 0, max: 1, size: 'md' }).listen();
    panel.addKnob(s, 'feedback', { min: 0, max: 1, size: 'sm' }).listen();
    panel.addKnob(s, 'width', { min: 0, max: 100, step: 1, mode: 'rotary' }).listen();
    // snippet:end
    return panel;
  },
};
