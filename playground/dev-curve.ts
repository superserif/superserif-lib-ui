import '../src/styles/index.css';
import { Panel, type CurveValue } from '../src/index';

const app = document.getElementById('app')!;
app.innerHTML = `<aside class="pg-side"><div class="pg-brand">@superserif/ui<small>dev · curve + monitor</small></div></aside>
<main class="pg-main"><section class="pg-card"><header><h2>Curve <small>+ Monitor</small></h2></header>
<div class="pg-pair"><div class="pg-slot" data-theme="light" id="l"></div><div class="pg-slot" data-theme="dark" id="d"></div></div></section></main>`;

const state = {
  easing: { type: 'bezier', points: [0.33, 1, 0.68, 1] } as CurveValue,
  shape: { type: 'points', points: [[0, 0], [0.3, 0.8], [0.6, 0.5], [1, 1]] } as CurveValue,
  fps: 60,
  t: 0,
  running: true,
};

for (const [slot, theme] of [['l', 'light'], ['d', 'dark']] as const) {
  const p = new Panel({ title: 'curves', meta: 'dev', container: document.getElementById(slot)!, theme });
  p.addCurve(state, 'easing').listen();
  p.addCurve(state, 'shape', { mode: 'points', label: 'shape (points)' }).listen();
  const f = p.addFolder('Monitor');
  f.addMonitor(state, 'fps', { graph: true, min: 0, max: 120 });
  f.addMonitor(state, 't', { graph: true });
  f.addMonitor(state, 'running');
  f.add(state, 'running');
}

let last = performance.now();
const loop = (now: number): void => {
  const dt = now - last; last = now;
  if (state.running) { state.fps = Math.round(1000 / Math.max(1, dt)); state.t = +(Math.sin(now / 900) * 50 + 50).toFixed(2); }
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
