import { Panel } from '../../src/index';
import type { Section } from './_types';
import stressSource from './extras.ts?raw';

const noop = () => { throw new Error('custom section'); };

export const stress: Section = {
  id: 'stress', title: 'Stress', tag: 'scheduler', source: stressSource,
  blurb: '42 listening Number controls in three folders, plus the frame time of the page. Everything runs through one requestAnimationFrame.',
  state: () => ({}), mount: noop as any,
  custom(body) {
    const slot = document.createElement('div'); slot.className = 'pg-slot pg-slot--wide'; slot.dataset.theme = 'auto'; body.append(slot);
    const target: Record<string, number> = { frame: 0 };
    const panel = new Panel({ title: 'Stress', meta: '42 × listen()', theme: 'auto', container: slot, position: 'static', hotkey: null, width: 360 });
    panel.addMonitor(target, 'frame', { graph: true, min: 0, max: 33, format: (v) => (v as number).toFixed(1) + ' ms' });
    for (let f = 0; f < 3; f++) {
      const folder = panel.addFolder(`Bank ${String.fromCharCode(65 + f)}`, { collapsed: f > 0 });
      for (let i = 0; i < 14; i++) {
        const k = `p${f}${i}`; target[k] = Math.round(Math.random() * 100);
        folder.addNumber(target, k, { min: 0, max: 100, step: 1, label: `param ${String(i + 1).padStart(2, '0')}` }).listen();
      }
    }
    let last = performance.now();
    const tick = (now: number) => { target.frame = now - last; last = now; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    // drift a few values so listen() has something to catch
    setInterval(() => { target.p03 = (target.p03 + 1) % 101; target.p110 = Math.round(50 + 50 * Math.sin(performance.now() / 700)); }, 60);
    return [panel];
  },
};

export const embed: Section = {
  id: 'embed', title: 'Embed', tag: 'static', source: stressSource,
  blurb: 'A static panel inside a 360px column, surrounded by ordinary page content, the way it sits in a Framer or Webflow custom-code embed.',
  state: () => ({}), mount: noop as any,
  custom(body) {
    const wrap = document.createElement('div'); wrap.className = 'pg-embed';
    wrap.innerHTML = `<div class="pg-embed__site"><div class="pg-embed__nav"><span>Studio</span><span>Work</span><span>About</span></div><h3>Procedural type, live</h3><p>The sketch below draws a letterform from a grid of strokes. Adjust the density and weight, then export the frame.</p><div class="pg-embed__art"></div></div><aside class="pg-embed__col"></aside>`;
    body.append(wrap);
    const col = wrap.querySelector<HTMLElement>('.pg-embed__col')!;
    const s = { density: 0.6, weight: 3, contrast: 0.4, italic: false, family: 'grotesk' };
    const panel = new Panel({ title: 'Letterform', theme: 'auto', container: col, position: 'static', hotkey: null, width: 320 });
    panel.add(s, 'density', { min: 0, max: 1 });
    panel.add(s, 'weight', { min: 1, max: 9, step: 1 });
    panel.add(s, 'contrast', { min: 0, max: 1 });
    panel.add(s, 'italic');
    panel.add(s, 'family', { options: ['grotesk', 'didone', 'mono'] });
    panel.addButtons([{ label: 'Export PNG', onClick: () => {}, variant: 'primary' }, { label: 'Reset', onClick: () => panel.reset(), variant: 'ghost' }]);
    return [panel];
  },
};

export const reset: Section = {
  id: 'reset', title: 'Reset survival', tag: 'css', source: stressSource,
  blurb: 'The wrapper applies a hostile page stylesheet: serif, uppercase, wide tracking, double line height, red input borders, unstyled buttons. The panel must look the same as everywhere else.',
  state: () => ({}), mount: noop as any,
  custom(body) {
    const pair = document.createElement('div'); pair.className = 'pg-pair'; body.append(pair);
    const s = { size: 24, gap: 0.4, on: true, mode: 'b', name: 'hostile' };
    const out: Panel[] = [];
    for (const theme of ['light', 'dark'] as const) {
      const slot = document.createElement('div'); slot.className = 'pg-slot'; slot.dataset.theme = theme;
      const hostile = document.createElement('div'); hostile.className = 'pg-hostile';
      hostile.innerHTML = '<p class="pg-hostile__note">page text under the reset: serif, uppercase, tracked</p>';
      slot.append(hostile); pair.append(slot);
      const panel = new Panel({ title: 'Survivor', theme, container: hostile, position: 'static', hotkey: null });
      panel.add(s, 'size', { min: 0, max: 64, step: 1 }).listen();
      panel.add(s, 'gap', { min: 0, max: 1 }).listen();
      panel.add(s, 'on').listen();
      panel.add(s, 'mode', { options: ['a', 'b', 'c'] }).listen();
      panel.add(s, 'name').listen();
      panel.addButtons([{ label: 'Action', onClick: () => {} }, { label: 'Ghost', onClick: () => {}, variant: 'ghost' }]);
      out.push(panel);
    }
    return out;
  },
};
