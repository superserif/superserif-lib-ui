import { Panel, type PreviewFn } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './select.ts?raw';

const wave: Record<string, (t: number) => number> = {
  sine: (t) => Math.sin(t * Math.PI * 2),
  triangle: (t) => 1 - 4 * Math.abs(Math.round(t - 0.25) - (t - 0.25)),
  square: (t) => (t % 1 < 0.5 ? 1 : -1),
  saw: (t) => 2 * (t - Math.floor(t + 0.5)),
};

export const drawWave: PreviewFn<string> = (ctx, value, w, h, t, tokens) => {
  const f = wave[value] ?? wave.sine;
  ctx.strokeStyle = tokens('color-canvas-grid');
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
  ctx.strokeStyle = tokens('color-text');
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  for (let x = 0; x <= w; x++) {
    const y = h / 2 - f(x / w * 2 + t * 0.6) * h * 0.34;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
};

export const section: Section = {
  id: 'select', title: 'Select', tag: 'enum', source,
  blurb: 'A listbox with a 01 / 04 index that flips when the value changes. Arrow left/right cycle without opening; type-ahead inside the menu. An optional preview canvas draws the current option.',
  state: () => ({ blend: 'multiply', quality: 2, unit: 'rem', wave: 'sine' }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Select', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addSelect(s, 'blend', { options: ['normal', 'multiply', 'screen', 'overlay'] }).listen();
    panel.addSelect(s, 'quality', { options: { low: 1, medium: 2, high: 4 } }).listen();
    panel.addSelect(s, 'unit', { options: [
      { label: 'pixels', value: 'px' }, { label: 'rem', value: 'rem' }, { label: 'percent', value: '%' },
    ] }).listen();
    panel.addSelect(s, 'wave', {
      options: ['sine', 'triangle', 'square', 'saw'],
      preview: drawWave,          // (ctx, value, w, h, t, tokens) => void
      previewAnimate: true,
    }).listen();
    // snippet:end
    return panel;
  },
};
