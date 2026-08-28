import '../src/styles/index.css';
import { Panel } from '../src/index';

const app = document.getElementById('app')!;
app.innerHTML = `<aside class="pg-side"><div class="pg-brand">@superserif/ui<small>dev · knob + pad2d</small></div></aside><main class="pg-main"><section class="pg-card"><header><h2>Knob + Pad2D</h2></header><div class="pg-pair"><div class="pg-slot" data-theme="light" id="l"></div><div class="pg-slot" data-theme="dark" id="d"></div></div></section></main>`;

const state = { gain: 35, drive: 0.4, pan: 0, offset: { x: 12, y: -8 }, px: 0.25, py: 0.6 };
for (const [slot, theme] of [['l', 'light'], ['d', 'dark']] as const) {
  const p = new Panel({ title: 'instrument', meta: 'dev', container: document.getElementById(slot)!, theme });
  p.addKnob(state, 'gain', { min: 0, max: 100, step: 1 }).listen();
  p.addKnob(state, 'drive', { min: 0, max: 1, size: 'lg', label: 'drive (lg)' }).listen();
  p.addKnob(state, 'pan', { min: -1, max: 1, size: 'sm', mode: 'rotary', label: 'pan (rotary, sm)' }).listen();
  p.addPad2D(state, 'offset', { x: { min: -50, max: 50, step: 1, label: 'intensity' }, y: { min: -50, max: 50, step: 1, label: 'frequency' } }).listen();
  p.addPad2D(state, 'px', 'py', { x: { min: 0, max: 1 }, y: { min: 0, max: 1 }, size: 96, grid: 6 }).listen();
}
