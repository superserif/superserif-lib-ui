import '../src/styles/index.css';
import { Panel } from '../src/index';

const app = document.getElementById('app')!;
app.innerHTML = `<aside class="pg-side"><div class="pg-brand">@superserif/ui<small>dev · presets</small></div>
  <div class="pg-side-group"><h4>storage</h4><button id="clear" class="pg-seg" style="padding:6px 12px;cursor:pointer;border:0;font:inherit;font-size:12px">clear localStorage</button><p class="pg-status" id="status"></p></div></aside>
  <main class="pg-main"><section class="pg-card"><header><h2>Presets</h2><p>Both panels share one state object (listen) and one storage key. Save, rename, delete, export, import; reload to check persistence.</p></header>
  <div class="pg-pair"><div class="pg-slot" data-theme="light" id="l"></div><div class="pg-slot" data-theme="dark" id="d"></div></div></section></main>`;

const state = { amount: 40, spread: 0.25, seed: 7, animate: true, wave: 'sine', label: 'dot field', shape: { size: 12, gap: 4 } };
const panels: Panel[] = [];
for (const [slot, theme] of [['l', 'light'], ['d', 'dark']] as const) {
  const p = new Panel({ title: 'dot field', meta: 'presets', container: document.getElementById(slot)!, theme, storageKey: 'dev-presets' });
  p.addPresets();
  p.add(state, 'amount', { min: 0, max: 100, step: 1 }).listen();
  p.add(state, 'spread', { min: 0, max: 1 }).listen();
  p.add(state, 'seed').listen();
  p.add(state, 'animate').listen();
  p.add(state, 'wave', { options: ['sine', 'noise', 'ripple'] }).listen();
  p.add(state, 'label').listen();
  const f = p.addFolder('Shape');
  f.add(state.shape, 'size', { min: 1, max: 40, step: 1 }).listen();
  f.add(state.shape, 'gap', { min: 0, max: 20, step: 1 }).listen();
  panels.push(p);
}
const status = document.getElementById('status')!;
const tick = (): void => { status.textContent = `presets: ${panels[0].presets.list().length} · current: ${panels[0].presets.current ?? 'Default'} · dirty: ${panels[0].presets.dirty}`; };
panels[0].presets.on('change', tick); panels[0].presets.on('dirty', tick); panels[0].presets.on('load', tick); tick();
document.getElementById('clear')!.addEventListener('click', () => { panels.forEach(p => p.presets.clearAll()); tick(); });
// dev only: expose for e2e scripts
(window as any).__panels = panels;
