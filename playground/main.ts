import '../src/styles/index.css';
import { Panel, type ThemeMode } from '../src/index';
import { registry, snippet } from './sections/_registry';
import { DotField, defaults } from './target/DotField';
import { drawWave } from './sections/select';

type Mode = ThemeMode;
const panels: { panel: Panel; slot: HTMLElement | null; slotTheme: 'light' | 'dark' | 'auto' }[] = [];
let mode: Mode = (localStorage.getItem('pg-theme') as Mode) || 'auto';
let reduced = localStorage.getItem('pg-reduced') === '1';

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, html?: string): HTMLElementTagNameMap[K] => {
  const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e;
};
const register = (panel: Panel, slot: HTMLElement | null, slotTheme: 'light' | 'dark' | 'auto'): Panel => {
  panels.push({ panel, slot, slotTheme });
  if (reduced) panel.el.setAttribute('data-ssui-motion', 'reduce');
  return panel;
};

/* ---------------- shell ---------------- */
const app = document.getElementById('app')!;
const side = el('aside', 'pg-side');
const main = el('main', 'pg-main');
app.append(side, main);

side.innerHTML = `
  <div class="pg-brand">@superserif/ui<small>docs · v0.1</small></div>
  <nav class="pg-tabs" aria-label="Pages">
    <a href="./starter.html" class="pg-tab">Starter</a>
    <a href="./index.html" class="pg-tab" aria-current="page">Components</a>
    <a href="./prototype.html" class="pg-tab">Prototype</a>
  </nav>
  <nav class="pg-nav" aria-label="Sections"></nav>
  <div class="pg-side-group">
    <h4>Theme</h4>
    <div class="pg-seg" role="group" aria-label="Theme">
      <button type="button" data-mode="light">Light</button>
      <button type="button" data-mode="dark">Dark</button>
      <button type="button" data-mode="auto">Auto</button>
    </div>
    <label class="pg-check"><input type="checkbox" id="pg-reduced" /> Reduced motion</label>
  </div>
  <div class="pg-side-group"><h4>Fonts</h4><div class="pg-status" id="pg-fonts">…</div></div>
  <div class="pg-side-group"><h4>Keys</h4><div class="pg-status pg-status--keys">drag a value to scrub<br/>⇧ ×10 · ⌥ ×0.1<br/>click a value to type<br/>↑ ↓ step · h collapse</div></div>
`;
const nav = side.querySelector<HTMLElement>('.pg-nav')!;

/* ---------------- theme control ---------------- */
function applyMode(m: Mode): void {
  mode = m; localStorage.setItem('pg-theme', m);
  const dark = m === 'dark' || (m === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  side.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  document.querySelector<HTMLIFrameElement>('.pg-starter__frame')?.contentWindow?.postMessage({ type: 'ssui-theme', theme: m }, '*');
  for (const { panel, slot, slotTheme } of panels) {
    const t: Mode = m === 'auto' ? slotTheme : m;
    panel.setTheme(t);
    if (slot) slot.dataset.theme = t === 'auto' ? (dark ? 'dark' : 'light') : t;
  }
}
side.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b => b.addEventListener('click', () => applyMode(b.dataset.mode as Mode)));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyMode(mode));

const reducedBox = side.querySelector<HTMLInputElement>('#pg-reduced')!;
reducedBox.checked = reduced;
reducedBox.addEventListener('change', () => {
  reduced = reducedBox.checked; localStorage.setItem('pg-reduced', reduced ? '1' : '0');
  document.documentElement.toggleAttribute('data-reduced', reduced);
  for (const { panel } of panels) panel.el.toggleAttribute('data-ssui-motion', reduced);
  if (reduced) for (const { panel } of panels) panel.el.setAttribute('data-ssui-motion', 'reduce');
});
document.documentElement.toggleAttribute('data-reduced', reduced);

document.fonts.ready.then(() => {
  const inter = document.fonts.check('500 11px Inter');
  document.getElementById('pg-fonts')!.textContent = `Inter: ${inter ? 'loaded' : 'fallback (system-ui)'}`;
});

/* ---------------- starter card (first: this is the base of every panel) ---------------- */
{
  const card = el('section', 'pg-card pg-card--starter'); card.id = 'starter';
  card.append(el('header', '', `<h2>Starter <small>template</small></h2><p>The base of every panel: mixer, knobs, pads, sliders, monitor, curve, presets under the title, transport in the footer. Modules reorder by drag, rename on double-click, right-click to remove, hover for SOLO. Copy <code>playground/starter.ts</code>, change the state object and the scene.</p>`));
  const frame = el('div', 'pg-starter');
  const iframe = document.createElement('iframe');
  iframe.className = 'pg-starter__frame'; iframe.title = 'Starter — live'; iframe.loading = 'lazy';
  iframe.src = `./starter.html?embed=1&theme=${mode}`;
  frame.append(iframe);
  const links = el('div', 'pg-starter__links', `<a href="./starter.html">Open full screen →</a><a href="https://github.com/superserif/superserif-lib-ui/blob/main/playground/starter.ts" target="_blank" rel="noopener noreferrer">starter.ts on GitHub →</a>`);
  const code = el('pre', 'pg-code', `<code>npm i github:superserif/superserif-lib-ui#v0.1.1

import { Panel } from '@superserif/ui/auto';
const panel = new Panel({ title: 'sketch_01', reorderable: true, editable: true, fps: true, storageKey: 'sketch_01' });
panel.addPresets();
panel.addFolder('Knobs', { layout: 'grid', columns: 3 }).addKnob(S, 'amplitude', { min: 0, max: 1, layout: 'stack', size: 'lg' });
panel.addFolder('Pads').addPads(S, 'pads');
panel.addFolder('Sliders').addSlider(S, 'speed', { min: 0, max: 3, inline: true });
panel.setTransport({ onToggle: p => (S.playing = p), action: { label: 'Randomize', onClick: randomize } });</code>`);
  card.append(frame, links, code);
  nav.append(Object.assign(el('a', '', 'Starter'), { href: '#starter' }));
  main.append(card);
}

/* ---------------- target card ---------------- */
{
  const card = el('section', 'pg-card pg-card--target'); card.id = 'target';
  card.append(el('header', '', `<h2>Target <small>live</small></h2><p>One panel, one canvas. Every control changes the picture: scrub a value and the field moves. This is the review artifact.</p>`));
  const grid = el('div', 'pg-target');
  const canvasHost = el('div', 'pg-canvas');
  const slot = el('div', 'pg-target__panel');
  grid.append(canvasHost, slot); card.append(grid); main.append(card);
  nav.append(Object.assign(el('a', '', 'Target'), { href: '#target' }));

  const state = defaults();
  const field = new DotField(canvasHost, state);
  const panel = register(new Panel({ title: 'dot field', meta: 'v0.1', theme: 'auto', container: slot, position: 'static', hotkey: null, storageKey: 'pg-target' }), null, 'auto');
  panel.addPresets({ allowDelete: true, allowExport: true });
  panel.addSelect(state, 'mode', { options: ['sine', 'ripple', 'noise'] });
  panel.addSlider(state, 'count', { min: 4, max: 64, step: 1 });
  panel.addSlider(state, 'amplitude', { min: 0, max: 1 });
  const motion = panel.addFolder('Motion');
  motion.addKnob(state, 'speed', { min: 0, max: 3, size: 'sm' });
  motion.addPad2D(state, 'offset', { x: { min: -1, max: 1 }, y: { min: -1, max: 1 } });
  motion.addToggle(state, 'animate');
  const look = panel.addFolder('Look');
  field.easing = look.addCurve({ ease: { type: 'bezier', points: [0.2, 0, 0, 1] } }, 'ease', { mode: 'both' });
  look.addColor(state, 'ink');
  look.addText(state, 'label');
  panel.addMonitor(state, 'fps', { graph: true, min: 0, max: 120 });
  panel.addButtons([
    { label: 'Randomize', onClick: () => { state.mode = (['sine', 'ripple', 'noise'] as const)[Math.floor(Math.random() * 3)]; state.count = 4 + Math.round(Math.random() * 60); state.amplitude = Math.random(); state.speed = Math.random() * 3; state.offset.x = Math.random() * 2 - 1; state.offset.y = Math.random() * 2 - 1; panel.controllers().forEach(c => c.refresh()); } },
    { label: 'Reset', onClick: () => panel.reset(), variant: 'ghost' },
  ]);
  // the canvas ink follows the page theme when the user has not changed it
  const inkDefault = () => { if (state.ink === '#1b1b1b' || state.ink === '#f2f2f2') state.ink = document.documentElement.dataset.theme === 'dark' ? '#f2f2f2' : '#1b1b1b'; look.controllers().forEach(c => c.refresh()); };
  new MutationObserver(inkDefault).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  queueMicrotask(inkDefault);
}

/* ---------------- component sections ---------------- */
for (const sec of registry) {
  const card = el('section', 'pg-card'); card.id = sec.id;
  card.append(el('header', '', `<h2>${sec.title} <small>${sec.tag}</small></h2><p>${sec.blurb}</p>`));
  nav.append(Object.assign(el('a', '', sec.title), { href: `#${sec.id}` }));
  main.append(card);
  if (sec.custom) {
    const body = el('div', 'pg-custom'); card.append(body);
    for (const p of sec.custom(body)) register(p, p.el.closest<HTMLElement>('.pg-slot'), (p.el.closest<HTMLElement>('.pg-slot')?.dataset.theme as any) ?? 'auto');
    continue;
  }
  const pair = el('div', 'pg-pair');
  const shared = sec.state();
  for (const theme of ['light', 'dark'] as const) {
    const slot = el('div', 'pg-slot'); slot.dataset.theme = theme; pair.append(slot);
    register(sec.mount(slot, theme, shared), slot, theme);
  }
  card.append(pair);
  const pre = el('pre', 'pg-code'); const code = el('code'); code.textContent = snippet(sec.source); pre.append(code); card.append(pre);
}

/* ---------------- nav highlight ---------------- */
const links = [...nav.querySelectorAll<HTMLAnchorElement>('a')];
const visible = new Map<string, number>();
const io = new IntersectionObserver((entries) => {
  for (const e of entries) visible.set((e.target as HTMLElement).id, e.isIntersecting ? e.intersectionRatio : 0);
  let best = '', score = 0;
  for (const [id, r] of visible) if (r > score) { score = r; best = id; }
  if (!best) return;
  links.forEach(a => a.getAttribute('href') === `#${best}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
}, { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
main.querySelectorAll('.pg-card').forEach(c => io.observe(c));

applyMode(mode);
void drawWave;
