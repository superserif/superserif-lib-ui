import '../src/styles/index.css';
import { Panel } from '../src/index';

const app = document.getElementById('app')!;
app.innerHTML = `<aside class="pg-side"><div class="pg-brand">@superserif/ui<small>dev · core</small></div></aside><main class="pg-main"><section class="pg-card"><header><h2>Inline slider · knob bank · menu · reorder</h2></header><div class="pg-pair"><div class="pg-slot" data-theme="light" id="l"></div><div class="pg-slot" data-theme="dark" id="d"></div></div></section></main>`;
const S = { a: 30, b: 0.42, gain: 64, tone: 0.5, drive: 12, on: true, mode: 'sine' };
for (const [slot, theme] of [['l', 'light'], ['d', 'dark']] as const) {
  const p = new Panel({ title: 'starter parts', meta: 'dev', container: document.getElementById(slot)!, theme, reorderable: true, storageKey: `dev-core-${theme}` });
  const knobs = p.addFolder('Knobs', { layout: 'grid', columns: 3 });
  knobs.addKnob(S, 'gain', { min: 0, max: 100, step: 1, layout: 'stack', size: 'lg' }).listen();
  knobs.addKnob(S, 'tone', { min: 0, max: 1, step: 0.01, layout: 'stack', size: 'lg' }).listen();
  knobs.addKnob(S, 'drive', { min: 0, max: 24, step: 0.1, layout: 'stack', size: 'lg', unit: 'dB' }).listen();
  const sl = p.addFolder('Sliders');
  sl.addSlider(S, 'a', { min: 0, max: 100, step: 1, inline: true }).listen();
  sl.addSlider(S, 'b', { min: 0, max: 1, step: 0.01, inline: true }).listen();
  const misc = p.addFolder('Misc');
  misc.addToggle(S, 'on').listen();
  misc.addSelect(S, 'mode', { options: ['sine', 'ripple', 'noise'] }).listen();
  p.addMenu('Add module', [
    { label: 'Knobs', hint: '×3', onSelect: () => { const f = p.addFolder(`Knobs ${p.children.length}`, { layout: 'grid' }); f.addKnob(S, 'gain', { min: 0, max: 100, layout: 'stack' }); f.addKnob(S, 'tone', { min: 0, max: 1, layout: 'stack' }); f.addKnob(S, 'drive', { min: 0, max: 24, layout: 'stack' }); } },
    { label: 'Slider', onSelect: () => p.addFolder(`Slider ${p.children.length}`).addSlider(S, 'a', { min: 0, max: 100, inline: true }) },
    { label: 'Toggle', onSelect: () => p.addFolder(`Toggle ${p.children.length}`).addToggle(S, 'on') },
    { label: 'Disabled thing', disabled: true },
  ], { full: true, variant: 'ghost' });
}
