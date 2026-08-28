import '../src/styles/index.css';
import { Panel } from '../src/index';

const app = document.getElementById('app')!;
app.innerHTML = `<aside class="pg-side"><div class="pg-brand">@superserif/ui<small>dev · mixer</small></div></aside><main class="pg-main"><section class="pg-card"><header><h2>Mixer</h2><p>Channel columns with vertical faders; the selection highlight slides; Gain / Pan / Mute / Solo edit the selected channel. Both panels share one state.</p></header><div class="pg-pair"><div class="pg-slot" data-theme="light" id="l"></div><div class="pg-slot" data-theme="dark" id="d"></div></div><pre class="pg-code" id="out"></pre></section></main>`;

const S = {
  mix: { channels: [{ gain: 20, pan: 0, mute: false, solo: false }, { gain: 64, pan: -10, mute: false, solo: false }, { gain: 48, pan: 20, mute: true, solo: false }, { gain: 72, pan: 0, mute: false, solo: false }], output: 80, selected: 0 },
  drums: { channels: [{ gain: 90, pan: 0, mute: false, solo: false }, { gain: 70, pan: 0, mute: false, solo: false }, { gain: 55, pan: 0, mute: false, solo: false }], output: 80, selected: 1 },
};
const panels: Panel[] = [];
for (const [slot, theme] of [['l', 'light'], ['d', 'dark']] as const) {
  const p = new Panel({ title: 'mixer', meta: 'dev', container: document.getElementById(slot)!, theme, width: 340 });
  p.addMixer(S, 'mix', { channels: ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4'] }).listen();
  p.addMixer(S, 'drums', { channels: ['Kick', 'Snare', 'Hat'], output: false, pan: false, height: 72 }).listen();
  panels.push(p);
}
(window as any).__panels = panels; (window as any).__S = S;
const out = document.getElementById('out')!;
const tick = (): void => { out.textContent = JSON.stringify(S.mix); requestAnimationFrame(tick); }; tick();
