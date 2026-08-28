/**
 * @superserif/ui — starter
 *
 * Copy this file. Three things to change:
 *   1. `S` — the state object your project reads.
 *   2. `MODULES` / `buildModule()` — the blocks the panel opens with, and what "Add module" offers.
 *   3. `draw()` — replace the oscilloscope with your own scene.
 *
 * Blocks: drag a header to reorder, double-click to rename, right-click for Rename / Remove,
 * hover 200ms for the SOLO pill (only that block plays, the others dim). Everything persists
 * under the `storageKey`.
 */
import '../src/styles/index.css';
import { Panel, Folder, type ThemeMode, type CurveValue, type MixerValue } from '../src/index';

// ---------------------------------------------------------------------------
// 1. state — plain object, the panel reads and writes it
// ---------------------------------------------------------------------------
const TRACES = ['amp', 'freq', 'phase', 'decay'] as const;   // one trace per parameter
const S = {
  // mixer: one fader per trace (gain only)
  mix: { channels: TRACES.map(() => ({ gain: 70, pan: 0, mute: false, solo: false })), output: 100, selected: 0 } as MixerValue,
  // pads: which traces are on
  pads: { amp: true, freq: true, phase: true, decay: true } as Record<string, boolean>,
  // knobs
  amplitude: 0.6,
  frequency: 2,
  phase: 0,
  // sliders
  speed: 1,
  decay: 0.4,
  // pad 2d
  offset: { x: 0, y: 0 },
  // curve: falloff from the centre of the screen outwards
  falloff: { type: 'bezier', points: [0.2, 0, 0, 1] } as CurveValue,
  // monitor (written by the loop)
  level: 0,
  // transport
  playing: true,
};

/** values for modules added at runtime — one fresh slot per module id */
const extra: Record<string, any> = {};
const slot = (id: string, init: () => any): any => (extra[id] ??= init());

// ---------------------------------------------------------------------------
// theme control (page chrome + panel)
// ---------------------------------------------------------------------------
let theme: ThemeMode = 'dark';
const resolved = (): 'light' | 'dark' => theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
document.documentElement.dataset.theme = resolved();

// ---------------------------------------------------------------------------
// 2. panel + modules
// ---------------------------------------------------------------------------
const d = new Date();
const sketchName = `sketch_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
const panel = new Panel({ title: sketchName, meta: 'v0.1', theme, reorderable: true, editable: true, fps: true, storageKey: 'ssui-starter', position: 'top-right', width: 320 });
panel.addPresets();                                          // presets live right under the title

type ModuleType = 'Mixer' | 'Knobs' | 'Pads' | 'Sliders' | 'Pad' | 'Monitor' | 'Curve' | 'Toggle' | 'Select' | 'Color' | 'Text';
const MODULES: ModuleType[] = ['Mixer', 'Knobs', 'Pads', 'Sliders', 'Pad', 'Monitor', 'Curve'];

// persisted: titles (renames) and modules added at runtime
const TITLES_KEY = 'ssui-starter:titles', ADDED_KEY = 'ssui-starter:modules';
const load = <T,>(k: string, fb: T): T => { try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fb; } catch { return fb; } };
const save = (k: string, v: unknown): void => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ } };
const titles: Record<string, string> = load(TITLES_KEY, {});
type Added = { type: ModuleType; id: string; title: string };
const added: Added[] = load(ADDED_KEY, []);

/** builds one module block; `id` is stable so reorder, renames and presets survive reloads */
function buildModule(type: ModuleType, id: string, title: string, isDefault: boolean): Folder {
  const grid = type === 'Knobs';
  const f = panel.addFolder(titles[id] ?? title, { id, layout: grid ? 'grid' : 'list', columns: 3, collapsed: type !== 'Knobs' });
  f.on('rename', (t) => { titles[id] = t; save(TITLES_KEY, titles); });
  switch (type) {
    case 'Mixer': {
      const target = isDefault ? S : slot(id, () => ({ mix: { channels: [{ gain: 60, pan: 0, mute: false, solo: false }, { gain: 60, pan: 0, mute: false, solo: false }], output: 100, selected: 0 } }));
      // channels are named after the parameters they mix; gain only
      f.addMixer(target, 'mix', { channels: isDefault ? [...TRACES] : ['a', 'b'], controls: false, pan: false, output: false });
      break;
    }
    case 'Knobs': {
      if (isDefault) {
        f.addKnob(S, 'amplitude', { min: 0, max: 1, step: 0.01, layout: 'stack', size: 'lg' });
        f.addKnob(S, 'frequency', { min: 0.1, max: 8, step: 0.01, layout: 'stack', size: 'lg' });
        f.addKnob(S, 'phase', { min: 0, max: 360, step: 1, layout: 'stack', size: 'lg', unit: '°' });
      } else {
        const t = slot(id, () => ({ a: 50, b: 50, c: 50 }));
        f.addKnob(t, 'a', { min: 0, max: 100, step: 1, layout: 'stack', size: 'lg' });
        f.addKnob(t, 'b', { min: 0, max: 100, step: 1, layout: 'stack', size: 'lg' });
        f.addKnob(t, 'c', { min: 0, max: 100, step: 1, layout: 'stack', size: 'lg' });
      }
      break;
    }
    case 'Pads': {
      const t = isDefault ? S : slot(id, () => ({ pads: { a: true, b: false, c: false, d: true } }));
      f.addPads(t, 'pads');
      break;
    }
    case 'Sliders': {
      if (isDefault) {
        f.addSlider(S, 'speed', { min: 0, max: 3, step: 0.01, inline: true });
        f.addSlider(S, 'decay', { min: 0, max: 1, step: 0.01, inline: true });
      } else {
        const t = slot(id, () => ({ value: 30 }));
        f.addSlider(t, 'value', { min: 0, max: 100, step: 1, inline: true });
      }
      break;
    }
    case 'Pad': {
      const t = isDefault ? S : slot(id, () => ({ offset: { x: 0, y: 0 } }));
      f.addPad2D(t, 'offset', { x: { min: -1, max: 1, step: 0.01 }, y: { min: -1, max: 1, step: 0.01 } });
      break;
    }
    case 'Monitor': {
      f.addMonitor(S, 'level', { graph: true });
      break;
    }
    case 'Curve': {
      const t = isDefault ? S : slot(id, () => ({ falloff: { type: 'bezier', points: [0.42, 0, 0.58, 1] } }));
      f.addCurve(t, 'falloff');
      break;
    }
    case 'Toggle': { const t = slot(id, () => ({ on: true })); f.addToggle(t, 'on'); break; }
    case 'Select': { const t = slot(id, () => ({ mode: 'sine' })); f.addSelect(t, 'mode', { options: ['sine', 'square', 'saw', 'noise'] }); break; }
    case 'Color': { const t = slot(id, () => ({ ink: '#f09526' })); f.addColor(t, 'ink'); break; }
    case 'Text': { const t = slot(id, () => ({ name: title })); f.addText(t, 'name'); break; }
  }
  return f;
}

// defaults, then the modules added in earlier sessions
MODULES.forEach((type, i) => buildModule(type, `${type.toLowerCase()}-${String(i + 1).padStart(2, '0')}`, type, true));
added.forEach(a => buildModule(a.type, a.id, a.title, false));

// a block removed from its context menu is forgotten
panel.on('remove', (c) => {
  const i = added.findIndex(a => a.id === c.id);
  if (i >= 0) { added.splice(i, 1); save(ADDED_KEY, added); }
});

// "Add module" stays last
const ADDABLE: { type: ModuleType; hint?: string }[] = [
  { type: 'Knobs', hint: '×3' }, { type: 'Pads', hint: '×4' }, { type: 'Sliders' }, { type: 'Pad', hint: '2D' }, { type: 'Toggle' }, { type: 'Select' }, { type: 'Color' }, { type: 'Text' }, { type: 'Monitor' }, { type: 'Curve' }, { type: 'Mixer' },
];
const menu = panel.addMenu('Add module', ADDABLE.map(({ type, hint }) => ({
  label: type, hint,
  onSelect: () => {
    const n = panel.children.filter(c => c instanceof Folder && c.id.startsWith(type.toLowerCase() + '-')).length + 1;
    const id = `${type.toLowerCase()}-${String(n).padStart(2, '0')}-${Date.now().toString(36)}`;
    const title = `${type} ${String(n).padStart(2, '0')}`;
    const f = buildModule(type, id, title, false);
    f.open();
    panel.move(f, panel.children.indexOf(menu));          // before the menu
    added.push({ type, id, title }); save(ADDED_KEY, added);
    f.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },
})), { full: true, variant: 'ghost' });

// the panel restores a saved order in a microtask; whatever it says, the menu stays last
queueMicrotask(() => panel.move(menu, panel.children.length - 1));

// solo: which block "plays" alone (null = all)
let soloId: string | null = null;
panel.on('panel-solo', (f) => { soloId = f ? f.id : null; });

// ---------------------------------------------------------------------------
// transport (panel footer): play / pause pill + reset — the lib's own
// ---------------------------------------------------------------------------
const transport = panel.setTransport({
  playing: S.playing,
  onToggle: (p) => { S.playing = p; },
  onReset: () => panel.reset(),
});

// space toggles play (not while typing)
document.addEventListener('keydown', (e) => {
  const t = e.target as HTMLElement;
  if (e.key !== ' ' || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName) || t.isContentEditable) return;
  e.preventDefault(); S.playing = !S.playing; transport.playing = S.playing;
});

// theme buttons
document.querySelectorAll<HTMLButtonElement>('.st-seg button').forEach(b => b.addEventListener('click', () => {
  theme = b.dataset.theme as ThemeMode;
  document.querySelectorAll('.st-seg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  document.documentElement.dataset.theme = resolved();
  panel.setTheme(theme);
}));
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (theme === 'auto') document.documentElement.dataset.theme = resolved(); });

// ---------------------------------------------------------------------------
// 3. target — a quiet oscilloscope. Replace with your scene.
//    Four traces, one per parameter; the mixer sets their level, the pads switch them,
//    knobs / sliders / pad / curve shape them. A soloed block silences the others' effect.
// ---------------------------------------------------------------------------
const canvas = document.getElementById('scope') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const curveCtrl = panel.get('curve-07/falloff') as { toFunction?: () => (t: number) => number } | undefined;
let t = 0, last = performance.now();

/** a block's effect applies when nothing is soloed or when it is the soloed block */
const plays = (id: string): boolean => soloId === null || soloId === id;

function draw(now: number): void {
  const dt = Math.min(64, now - last); last = now;

  // effective parameters (neutral when their block is not playing)
  const A = plays('knobs-02') ? S.amplitude : 0.6, F = plays('knobs-02') ? S.frequency : 2, P = plays('knobs-02') ? S.phase : 0;
  const speed = plays('sliders-04') ? S.speed : 1, decay = plays('sliders-04') ? S.decay : 0;
  const off = plays('pad-05') ? S.offset : { x: 0, y: 0 };
  const fall = plays('curve-07') ? (curveCtrl?.toFunction?.() ?? ((x: number) => x)) : (x: number) => x;
  const gains = TRACES.map((_, i) => plays('mixer-01') ? (S.mix.channels[i]?.gain ?? 70) / 100 : 0.7);
  const on = TRACES.map(k => plays('pads-03') ? S.pads[k] !== false : true);
  if (S.playing) t += (dt / 1000) * speed;

  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = innerWidth, h = innerHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);

  const cs = getComputedStyle(panel.el);
  const lineColor = cs.getPropertyValue('--ssui-color-text-3').trim() || '#666';
  const accent = cs.getPropertyValue('--ssui-color-accent').trim() || '#f09526';

  const cx = w * 0.42 + off.x * w * 0.15;             // leave the right side to the panel
  const cy = h * 0.5 - off.y * h * 0.2;
  const span = Math.min(w, h) * 0.6;
  let sum = 0, count = 0;

  TRACES.forEach((key, i) => {
    if (!on[i]) return;
    const g = gains[i];
    const isSel = i === S.mix.selected;
    ctx.beginPath();
    ctx.strokeStyle = isSel ? accent : lineColor;
    ctx.globalAlpha = isSel ? 0.9 : 0.45;
    ctx.lineWidth = isSel ? 1.25 : 1;
    const steps = 240;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const x = cx - span / 2 + u * span;
      const env = fall(1 - Math.abs(u - 0.5) * 2);
      const ph = (P / 360) * Math.PI * 2;
      let y: number;
      switch (key) {
        case 'amp':   y = Math.sin(u * Math.PI * 2 * F + t * 2) * A; break;
        case 'freq':  y = Math.sin(u * Math.PI * 2 * F * 2 + t * 2) * A * 0.5; break;
        case 'phase': y = Math.sin(u * Math.PI * 2 * F + t * 2 + ph) * A * 0.7; break;
        default:      y = Math.sin(u * Math.PI * 2 * F + t * 2) * A * Math.exp(-decay * u * 4);
      }
      const py = cy + y * g * env * span * 0.22;
      if (k) ctx.lineTo(x, py); else ctx.moveTo(x, py);
      if (isSel) { sum += (py - cy) ** 2; count++; }
    }
    ctx.stroke();
  });
  ctx.globalAlpha = 1;
  S.level = count ? +Math.sqrt(sum / count).toFixed(1) : 0;
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
