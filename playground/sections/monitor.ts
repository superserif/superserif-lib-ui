import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './monitor.ts?raw';

let started = false;
const live = { t: 0, phase: 0, energy: 0, ready: true };
function start(): void {
  if (started) return; started = true;
  const t0 = performance.now();
  const tick = (now: number) => {
    live.t = (now - t0) / 1000;
    live.phase = Math.sin(live.t * 1.3);
    live.energy = 0.5 + 0.5 * Math.sin(live.t * 0.7) * Math.cos(live.t * 2.1);
    live.ready = Math.floor(live.t) % 4 !== 3;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export const section: Section = {
  id: 'monitor', title: 'Monitor', tag: 'read-only', source,
  blurb: 'Read-only readout that always listens. With graph: true it keeps a sparkline of the last samples; booleans draw as a step line.',
  state: () => { start(); return live; },
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Monitor', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addMonitor(s, 't', { format: (v) => (v as number).toFixed(2) + 's' });
    panel.addMonitor(s, 'phase', { graph: true, min: -1, max: 1 });
    panel.addMonitor(s, 'energy', { graph: true, samples: 128 });
    panel.addMonitor(s, 'ready', { graph: true });
    // snippet:end
    return panel;
  },
};
