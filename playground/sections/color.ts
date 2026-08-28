import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './color.ts?raw';

export const section: Section = {
  id: 'color', title: 'Color', tag: 'value', source,
  blurb: 'Swatch plus editable hex; the popover holds saturation/value, hue and alpha sliders. Reads and writes hex strings, 0xRRGGBB numbers (three.js) or {r, g, b} objects in place.',
  state: () => ({ ink: '#1b1b1b', glow: '#f0952680', tint: 0x506ffb, fog: { r: 0.9, g: 0.85, b: 0.8 } }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Color', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addColor(s, 'ink').listen();                            // '#1b1b1b'
    panel.addColor(s, 'glow', { alpha: true }).listen();          // '#f0952680'
    panel.addColor(s, 'tint', { format: 'number' }).listen();     // 0x506ffb
    panel.addColor(s, 'fog', { format: 'object' }).listen();      // { r, g, b } 0..1
    // snippet:end
    return panel;
  },
};
