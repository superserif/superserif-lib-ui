import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './slider.ts?raw';

export const section: Section = {
  id: 'slider', title: 'Slider', tag: 'value', source,
  blurb: 'A track plus the same scrubbable readout. Click or drag the track to set; the fill glides on programmatic changes and tracks 1:1 while dragging.',
  state: () => ({ mix: 0.35, count: 30, opacity: 80 }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Slider', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addSlider(s, 'mix', { min: 0, max: 1 }).listen();
    panel.addSlider(s, 'count', { min: 0, max: 100, step: 1, showRange: true }).listen();
    panel.addSlider(s, 'opacity', { min: 0, max: 100, step: 1, unit: '%' }).listen();
    // panel.add(obj, key, { min, max }) also resolves to a Slider
    // snippet:end
    return panel;
  },
};
