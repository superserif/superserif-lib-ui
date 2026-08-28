import '../src/styles/index.css';
import { Panel } from '../src/index';

const app = document.getElementById('app')!;
app.innerHTML = `<aside class="pg-side"><div class="pg-brand">@superserif/ui<small>dev · color</small></div></aside>
<main class="pg-main"><section class="pg-card"><header><h2>Color</h2><p>Swatch + hex in the row; the popover grows out of the swatch. Both panels share one state object.</p></header>
<div class="pg-pair"><div class="pg-slot" data-theme="light" id="l"></div><div class="pg-slot" data-theme="dark" id="d"></div></div>
<div id="proof" style="height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;font:500 11px/1 'DM Mono',monospace;letter-spacing:.06em"></div>
</section></main>`;

const state = { ink: '#1b1b1b', tint: '#f0952680', three: 0xf09526, rgb: { r: 0.2, g: 0.4, b: 0.9 } };
const rgbRef = state.rgb;

for (const [slot, theme] of [['l', 'light'], ['d', 'dark']] as const) {
  const p = new Panel({ title: 'palette', meta: 'color', container: document.getElementById(slot)!, theme });
  p.addColor(state, 'ink').listen();
  p.addColor(state, 'tint', { alpha: true }).listen();
  p.addColor(state, 'three', { format: 'number' }).listen();
  p.addColor(state, 'rgb').listen();
}

const proof = document.getElementById('proof')!;
const tick = (): void => {
  proof.style.background = state.ink;
  proof.style.color = state.tint;
  proof.textContent = `ink ${state.ink} · tint ${state.tint} · three 0x${state.three.toString(16).padStart(6, '0')} · rgb ${state.rgb.r.toFixed(2)} ${state.rgb.g.toFixed(2)} ${state.rgb.b.toFixed(2)} · same ref ${state.rgb === rgbRef}`;
  requestAnimationFrame(tick);
};
tick();
