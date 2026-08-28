import '../src/styles/index.css';
import { Panel, type ThemeMode } from '../src/index';
import type { CurveValue } from '../src/index';

// ---------------------------------------------------------------------------
// shared state — survives variant switches so the comparison is honest
// ---------------------------------------------------------------------------
const S = {
  count: 22,
  amplitude: 0.55,
  speed: 1,
  offset: { x: 0, y: 0 },
  easing: { type: 'bezier', points: [0.2, 0, 0, 1] } as CurveValue,
  easingName: 'standard',
  ink: '#f09526',
  animate: true,
  mode: 'sine' as 'sine' | 'ripple' | 'noise',
  label: 'field 01',
  fps: 60,
};
const EASINGS: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1], standard: [0.2, 0, 0, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1], expo: [0.16, 1, 0.3, 1],
};
const bezier = (x1: number, y1: number, x2: number, y2: number) => (t: number): number => {
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; const x = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m ** 2 * x2 + m ** 3; if (x < t) lo = m; else hi = m; }
  const m = (lo + hi) / 2; return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m ** 2 * y2 + m ** 3;
};
let ease = bezier(...EASINGS.standard);
const syncEase = (): void => {
  if (S.easing.type === 'bezier') ease = bezier(...(S.easing.points as [number, number, number, number]));
};

// ---------------------------------------------------------------------------
// background field (the "project" the panel tunes)
// ---------------------------------------------------------------------------
const canvas = document.getElementById('field') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
let t = 0, lastNow = performance.now(), fpsAcc = 0, fpsN = 0;
const noise = (x: number, y: number, z: number): number => {
  const s = Math.sin(x * 1.7 + z) * Math.cos(y * 1.3 - z * 0.7) + Math.sin((x + y) * 0.9 + z * 1.3) * 0.5;
  return s / 1.5;
};
function draw(now: number): void {
  const dt = Math.min(64, now - lastNow); lastNow = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 250) { S.fps = Math.round(1000 / (fpsAcc / fpsN)); fpsAcc = 0; fpsN = 0; }
  if (S.animate) t += (dt / 1000) * S.speed;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const w = innerWidth, h = innerHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  const n = Math.max(4, Math.round(S.count));
  const cell = Math.min(w, h) * 0.72 / n;
  const ox = w / 2 - (n - 1) * cell / 2 + S.offset.x * cell * 2;
  const oy = h / 2 - (n - 1) * cell / 2 - S.offset.y * cell * 2;
  ctx.fillStyle = S.ink;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const u = i / (n - 1) - 0.5, v = j / (n - 1) - 0.5;
    const d = Math.hypot(u, v) * 1.42;
    let f: number;
    if (S.mode === 'sine') f = Math.sin(u * 6 + t * 2) * Math.cos(v * 6 - t * 1.4);
    else if (S.mode === 'ripple') f = Math.sin(d * 18 - t * 4);
    else f = noise(u * 4, v * 4, t);
    const k = ease(Math.max(0, 1 - d)) * S.amplitude;
    const r = cell * 0.08 + cell * 0.22 * Math.max(0, (f + 1) / 2) * k + cell * 0.04;
    ctx.globalAlpha = 0.25 + 0.75 * k;
    ctx.beginPath(); ctx.arc(ox + i * cell + f * cell * 0.3 * k, oy + j * cell + f * cell * 0.3 * k, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 0.5;
  ctx.font = '500 11px "DM Mono", monospace'; ctx.fillStyle = getComputedStyle(document.body).color;
  ctx.fillText(S.label.toUpperCase(), 24, h - 32); ctx.globalAlpha = 1;
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);

// ---------------------------------------------------------------------------
// three compositions of the same panel — the axis is named, the API is identical
// ---------------------------------------------------------------------------
type Variant = { name: string; axis: string; wins: string; cost: string; mount(theme: ThemeMode): Panel };
let theme: ThemeMode = 'dark';
const MODES = ['sine', 'ripple', 'noise'];

const variants: Variant[] = [
  {
    name: 'Ligne', axis: 'density — every value is a scrubbable number, one flat register, folders are hairlines',
    wins: 'daily-use tuning, 40+ parameters, screen-share reviews', cost: 'no picture of what a value does; you read, you do not see',
    mount(th) {
      const p = new Panel({ title: 'dot field', meta: 'ligne', theme: th, width: 280, tokens: { 'row-height': '26px', 'panel-padding': '8px', 'radius-lg': '10px', 'label-width': '46%', 'space-2': '6px' } });
      const f1 = p.addFolder('Field');
      f1.addNumber(S, 'count', { min: 4, max: 64, step: 1 }).listen();
      f1.addNumber(S, 'amplitude', { min: 0, max: 1, step: 0.01 }).listen();
      f1.addSelect(S, 'mode', { options: MODES }).listen();
      const f2 = p.addFolder('Motion');
      f2.addNumber(S, 'speed', { min: 0, max: 3, step: 0.01, unit: '×' }).listen();
      f2.addNumber(S.offset, 'x', { min: -1, max: 1, step: 0.01, label: 'offset x' }).listen();
      f2.addNumber(S.offset, 'y', { min: -1, max: 1, step: 0.01, label: 'offset y' }).listen();
      f2.addSelect(S, 'easingName', { options: Object.keys(EASINGS), label: 'easing' }).listen().onChange(n => { S.easing = { type: 'bezier', points: [...EASINGS[n]] }; syncEase(); });
      f2.addToggle(S, 'animate').listen();
      const f3 = p.addFolder('Output');
      f3.addColor(S, 'ink').listen();
      f3.addText(S, 'label').listen();
      f3.addMonitor(S, 'fps');
      p.addButtons([{ label: 'Randomize', onClick: randomize }, { label: 'Reset', onClick: reset, variant: 'ghost' }]);
      return p;
    },
  },
  {
    name: 'Module', axis: 'visualisation — each folder is a card with a drawing of its parameter: waveform, curve, sparkline',
    wins: 'demos, clients, shader work where the shape matters more than the digit', cost: 'tall; three cards eat 600px before the first button',
    mount(th) {
      const p = new Panel({ title: 'dot field', meta: 'module', theme: th, width: 340 });
      const f1 = p.addFolder('Field');
      f1.addSelect(S, 'mode', {
        options: MODES, previewAnimate: true,
        preview: (c, v, w, h, tt, tok) => {
          c.strokeStyle = tok('color-canvas-line'); c.lineWidth = 1.25; c.beginPath();
          for (let x = 0; x <= w; x++) {
            const u = x / w; let y: number;
            if (v === 'sine') y = Math.sin(u * 12 + tt * 2); else if (v === 'ripple') y = Math.sin(Math.abs(u - 0.5) * 40 - tt * 4); else y = noise(u * 6, 0.3, tt);
            const py = h / 2 - y * h * 0.32; if (x) c.lineTo(x, py); else c.moveTo(x, py);
          }
          c.stroke();
          c.fillStyle = tok('color-accent'); const ux = ((tt * 0.15) % 1) * w; c.beginPath(); c.arc(ux, h / 2, 2.5, 0, 7); c.fill();
        },
      }).listen();
      f1.addSlider(S, 'count', { min: 4, max: 64, step: 1 }).listen();
      f1.addSlider(S, 'amplitude', { min: 0, max: 1, step: 0.01 }).listen();
      const f2 = p.addFolder('Motion');
      f2.addCurve(S, 'easing').listen().onChange(syncEase);
      f2.addSlider(S, 'speed', { min: 0, max: 3, step: 0.01 }).listen();
      f2.addToggle(S, 'animate').listen();
      const f3 = p.addFolder('Output');
      f3.addColor(S, 'ink').listen();
      f3.addText(S, 'label').listen();
      f3.addMonitor(S, 'fps', { graph: true });
      p.addButtons([{ label: 'Randomize', onClick: randomize }, { label: 'Reset', onClick: reset, variant: 'ghost' }]);
      return p;
    },
  },
  {
    name: 'Instrument', axis: 'tactility — knobs and a pad, larger targets, the legacy hardware metaphor kept where it earns its space',
    wins: 'live performance, touch screens, one-handed tweaking while watching the canvas', cost: 'lowest density; a knob says less than a number at a glance',
    mount(th) {
      const p = new Panel({ title: 'dot field', meta: 'instrument', theme: th, width: 300, tokens: { 'row-height': '40px', 'control-height': '28px', 'label-width': '40%' } });
      const f1 = p.addFolder('Field');
      f1.addKnob(S, 'count', { min: 4, max: 64, step: 1 }).listen();
      f1.addKnob(S, 'amplitude', { min: 0, max: 1, step: 0.01 }).listen();
      f1.addSelect(S, 'mode', { options: MODES }).listen();
      const f2 = p.addFolder('Motion');
      f2.addKnob(S, 'speed', { min: 0, max: 3, step: 0.01, size: 'lg' }).listen();
      f2.addPad2D(S, 'offset', { x: { min: -1, max: 1, step: 0.01 }, y: { min: -1, max: 1, step: 0.01 } }).listen();
      f2.addSelect(S, 'easingName', { options: Object.keys(EASINGS), label: 'easing' }).listen().onChange(n => { S.easing = { type: 'bezier', points: [...EASINGS[n]] }; syncEase(); });
      f2.addToggle(S, 'animate').listen();
      const f3 = p.addFolder('Output');
      f3.addColor(S, 'ink').listen();
      f3.addMonitor(S, 'fps');
      p.addButtons([{ label: 'Randomize', onClick: randomize }, { label: 'Reset', onClick: reset, variant: 'ghost' }]);
      return p;
    },
  },
];

function randomize(): void {
  S.count = 6 + Math.round(Math.random() * 40); S.amplitude = +Math.random().toFixed(2); S.speed = +(0.2 + Math.random() * 2).toFixed(2);
  S.offset.x = +(Math.random() * 2 - 1).toFixed(2); S.offset.y = +(Math.random() * 2 - 1).toFixed(2);
  S.mode = MODES[Math.floor(Math.random() * 3)] as typeof S.mode;
}
function reset(): void { S.count = 22; S.amplitude = 0.55; S.speed = 1; S.offset.x = 0; S.offset.y = 0; S.mode = 'sine'; S.ink = '#f09526'; S.easingName = 'standard'; S.easing = { type: 'bezier', points: [0.2, 0, 0, 1] }; syncEase(); }

// ---------------------------------------------------------------------------
// picker wiring — behaviour contract from PICKER.md (variants are mount functions)
// ---------------------------------------------------------------------------
const stage = document.getElementById('stage')!;
const note = document.getElementById('note')!;
const picker = document.querySelector('.proto-picker')!;
const highlight = picker.querySelector<HTMLElement>('.proto-picker-highlight')!;
const items = [...picker.querySelectorAll<HTMLElement>('.proto-picker-item:not(.proto-picker-replay)')];
const replay = picker.querySelector<HTMLElement>('.proto-picker-replay');
let current = 0;
let panel: Panel | null = null;

function moveHighlight(): void {
  const el = items[current];
  highlight.style.width = el.offsetWidth + 'px';
  highlight.style.transform = `translateX(${el.offsetLeft}px)`;
}
function mount(i: number): void {
  panel?.dispose(); panel = null;
  requestAnimationFrame(() => {
    const v = variants[i];
    panel = v.mount(theme);
    stage.append(panel.el);
    note.innerHTML = `<b>${v.name}</b>axis — ${v.axis}<br><br>wins — ${v.wins}<br>cost — ${v.cost}<br><br><code>1 2 3</code> switch · <code>R</code> remount · <code>H</code> collapse`;
  });
}
function setActive(i: number): void {
  if (i < 0 || i >= variants.length) return;
  current = i;
  items.forEach((el, j) => { el.toggleAttribute('data-active', j === i); if (j === i) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current'); });
  moveHighlight();
  const url = new URL(location.href); url.searchParams.set('v', String(i + 1)); history.replaceState(null, '', url);
  mount(i);
}
items.forEach((el, i) => el.addEventListener('click', () => setActive(i)));
replay?.addEventListener('click', () => mount(current));
window.addEventListener('resize', moveHighlight);
document.addEventListener('keydown', (e) => {
  const tgt = e.target as HTMLElement;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName) || tgt.isContentEditable) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (tgt.closest?.('.ssui-panel')) return;
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= variants.length) setActive(num - 1);
  else if (e.key === 'ArrowRight') setActive((current + 1) % variants.length);
  else if (e.key === 'ArrowLeft') setActive((current - 1 + variants.length) % variants.length);
  else if (e.key === 'r' || e.key === 'R') mount(current);
});

// theme control
document.querySelectorAll<HTMLButtonElement>('.pt-seg button').forEach(b => b.addEventListener('click', () => {
  theme = b.dataset.theme as ThemeMode;
  document.querySelectorAll('.pt-seg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  const resolved = theme === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  document.documentElement.dataset.theme = resolved;
  panel?.setTheme(theme);
}));
document.documentElement.dataset.theme = 'dark';

setActive((parseInt(new URLSearchParams(location.search).get('v') ?? '1', 10) || 1) - 1);
requestAnimationFrame(() => requestAnimationFrame(() => picker.setAttribute('data-ready', '')));
