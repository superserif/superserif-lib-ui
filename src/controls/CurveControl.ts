import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h, icons, reducedMotion } from '../core/dom';
import { clamp } from '../core/math';
import { trackPointer, modifierScale } from '../core/pointer';
import { Scheduler } from '../core/Scheduler';
import { bezierFn } from '../curve/bezier';
import { monotoneFn } from '../curve/monotone';
import { toLinearCSS } from '../curve/linear';
import { curvePresets } from '../curve/presets';

export type CurveValue =
  | { type: 'bezier'; points: [number, number, number, number] }
  | { type: 'points'; points: [number, number][] };

export interface CurveOptions extends BaseOptions {
  /** which editors are available; 'both' shows a mode switch (default) */
  mode?: 'bezier' | 'points' | 'both';
  presets?: Record<string, CurveValue>;
  height?: number;
  /** allow y outside 0..1 (default true) */
  overshoot?: boolean;
}

const SVGNS = 'http://www.w3.org/2000/svg';
const s = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}): SVGElementTagNameMap[K] => {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  return el;
};
const fmt = (n: number): string => (Math.round(n * 1000) / 1000).toString().replace(/^(-?)0\./, '$1.');
const PAD_Y = 0.2;   // 20% vertical padding so overshoot stays visible
const PAD_X = 0.03;  // room for the end handles

/**
 * Curve editor. Outputs a function, a CSS easing string, or a LUT.
 * Defining micro-interaction: an accent dot runs along the curve so the easing is
 * seen as motion, not only as a shape.
 */
export class CurveControl extends Controller<CurveValue, CurveOptions> {
  private stage!: HTMLElement;
  private svg!: SVGSVGElement;
  private path!: SVGPathElement;
  private arms!: SVGPathElement;
  private handlesG!: SVGGElement;
  private ball!: SVGCircleElement;
  private ballX!: SVGLineElement;
  private cssOut!: HTMLOutputElement;
  private presetName!: HTMLElement;
  private presetMenu!: HTMLUListElement;
  private presetBox!: HTMLElement;
  private modeBtns: HTMLButtonElement[] = [];
  private handles: SVGCircleElement[] = [];
  private fn: (t: number) => number = (t) => t;
  private time = 0;
  private stopAnim: (() => void) | null = null;
  private copyTimer = 0;
  private dragIndex = -1;
  private focusIndex = -1;
  private presets: Record<string, CurveValue>;
  /** viewBox units per CSS px, kept current by a ResizeObserver on the stage */
  private sx = (1 + 2 * PAD_X) / 288;
  private sy = (1 + 2 * PAD_Y) / 128;

  constructor(binding: Binding<CurveValue>, opts: CurveOptions = {}) {
    super(binding, opts, 'curve');
    this.presets = opts.presets ?? curvePresets;
    this.stacked = true;
    this.mount();
  }

  // ---- public output --------------------------------------------------------
  toFunction(): (t: number) => number { return this.fn; }
  toCSS(samples = 24): string {
    const v = this.binding.read();
    if (v.type === 'bezier') return `cubic-bezier(${v.points.map(fmt).join(', ')})`;
    return toLinearCSS(this.fn, samples);
  }
  toArray(n: number): Float32Array {
    const a = new Float32Array(n);
    for (let i = 0; i < n; i++) a[i] = this.fn(n === 1 ? 0 : i / (n - 1));
    return a;
  }
  /** name of the matching preset or null */
  presetOf(v: CurveValue = this.binding.read()): string | null {
    const j = JSON.stringify(v);
    for (const [k, p] of Object.entries(this.presets)) if (JSON.stringify(p) === j) return k;
    return null;
  }

  // ---- render ---------------------------------------------------------------
  protected render(): HTMLElement {
    const mode = this.opts.mode ?? 'both';

    // header (lives in the label row)
    const chev = icons.chevron();
    this.presetName = h('span', { class: 'ssui-curve__preset-name' });
    const trigger = h('button', { class: 'ssui-curve__preset', type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': 'Curve preset' }, [this.presetName, chev]);
    this.presetMenu = h('ul', { class: 'ssui-select__menu', role: 'listbox', tabindex: -1 });
    Object.keys(this.presets).forEach((name, i) => {
      const li = h('li', { class: 'ssui-select__option', role: 'option', 'aria-selected': 'false', 'data-name': name }, [name]);
      li.style.setProperty('--i', String(i));
      li.addEventListener('click', (e) => { e.stopPropagation(); this.applyPreset(name); this.closeMenu(true); });
      this.presetMenu.append(li);
    });
    this.presetBox = h('div', { class: 'ssui-select ssui-curve__menu-wrap' }, [trigger, this.presetMenu]);
    trigger.addEventListener('click', (e) => { e.stopPropagation(); this.isMenuOpen ? this.closeMenu() : this.openMenu(); });
    trigger.addEventListener('keydown', (e) => this.onMenuKey(e));
    this.presetMenu.addEventListener('keydown', (e) => this.onMenuKey(e));
    const outside = (e: PointerEvent): void => { if (!this.presetBox.contains(e.target as Node)) this.closeMenu(); };
    document.addEventListener('pointerdown', outside, true);
    this.cleanups.push(() => document.removeEventListener('pointerdown', outside, true));

    const head = h('div', { class: 'ssui-curve__head' }, [this.presetBox]);
    if (mode === 'both') {
      const seg = h('div', { class: 'ssui-curve__mode', role: 'group', 'aria-label': 'Curve mode' });
      for (const m of ['bezier', 'points'] as const) {
        const b = h('button', { type: 'button', 'aria-pressed': 'false', 'data-mode': m }, [m]);
        b.addEventListener('click', () => this.switchMode(m));
        this.modeBtns.push(b); seg.append(b);
      }
      head.append(seg);
    }
    this.labelEl.append(head);

    // stage
    this.svg = s('svg', { class: 'ssui-curve__svg', viewBox: `${-PAD_X} ${-PAD_Y} ${1 + 2 * PAD_X} ${1 + 2 * PAD_Y}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
    const grid = s('path', { class: 'ssui-curve__grid', d: 'M.25 -1V2M.5 -1V2M.75 -1V2M-1 .25H2M-1 .5H2M-1 .75H2' });
    const unit = s('path', { class: 'ssui-curve__unit', d: 'M-1 0H2M-1 1H2' });
    this.arms = s('path', { class: 'ssui-curve__arm' });
    this.path = s('path', { class: 'ssui-curve__path' });
    this.ballX = s('line', { class: 'ssui-curve__ball-x', y1: -PAD_Y, y2: 1 + PAD_Y });
    this.ball = s('circle', { class: 'ssui-curve__ball' });
    this.handlesG = s('g');
    this.svg.append(grid, unit, this.arms, this.path, this.ballX, this.ball, this.handlesG);
    // svg y axis points down: flip so y=1 is top
    this.svg.style.transform = 'scaleY(-1)';

    this.stage = h('div', { class: 'ssui-curve__stage', role: 'application', 'aria-label': `${this.opts.label ?? 'curve'} editor`, tabindex: -1 }, [
      this.svg, h('span', { class: 'ssui-curve__hint', 'aria-hidden': 'true' }, ['dbl-click: add']),
    ]);
    if (this.opts.height) this.stage.style.setProperty('--ssui-curve-height', `${this.opts.height}px`);
    const ro = new ResizeObserver(() => {
      const w = this.stage.clientWidth, hh = this.stage.clientHeight;
      if (!w || !hh) return;
      this.sx = (1 + 2 * PAD_X) / w; this.sy = (1 + 2 * PAD_Y) / hh;
      this.fitHandleRadius(); this.drawBall();
    });
    ro.observe(this.stage);
    this.cleanups.push(() => ro.disconnect());
    this.stage.addEventListener('dblclick', (e) => this.onDblClick(e));
    this.stage.addEventListener('keydown', (e) => this.onStageKey(e));

    // css readout
    this.cssOut = h('output', { class: 'ssui-curve__css', title: 'Click to copy', 'aria-label': 'CSS easing, click to copy' });
    this.cssOut.addEventListener('click', () => this.copyCSS());

    // ball animation
    if (!reducedMotion()) {
      this.stopAnim = Scheduler.animate({ flush() {}, poll() {}, tick: (dt) => { this.time = (this.time + dt / 1400) % 1; this.drawBall(); } });
      this.cleanups.push(() => this.stopAnim?.());
    } else { this.time = 0.5; }

    return h('div', { class: 'ssui-curve' }, [this.stage, this.cssOut]);
  }

  // ---- value -> DOM ---------------------------------------------------------
  protected sanitize(v: CurveValue): CurveValue {
    const allowOver = this.opts.overshoot !== false;
    const cy = (y: number): number => allowOver ? clamp(y, -0.5, 1.5) : clamp(y, 0, 1);
    if (v.type === 'bezier') {
      const [x1, y1, x2, y2] = v.points;
      return { type: 'bezier', points: [clamp(x1, 0, 1), cy(y1), clamp(x2, 0, 1), cy(y2)] };
    }
    const pts = v.points.map(([x, y]) => [clamp(x, 0, 1), cy(y)] as [number, number]).sort((a, b) => a[0] - b[0]);
    if (pts.length < 2) return { type: 'points', points: [[0, 0], [1, 1]] };
    pts[0][0] = 0; pts[pts.length - 1][0] = 1;
    return { type: 'points', points: pts };
  }

  protected update(v: CurveValue): void {
    this.fn = v.type === 'bezier' ? bezierFn(...v.points) : monotoneFn(v.points);
    // path
    const N = 64; let d = '';
    for (let i = 0; i <= N; i++) { const t = i / N; d += `${i ? 'L' : 'M'}${t.toFixed(4)} ${this.fn(t).toFixed(4)}`; }
    this.path.setAttribute('d', d);
    // arms + handles
    const pts: [number, number][] = v.type === 'bezier' ? [[v.points[0], v.points[1]], [v.points[2], v.points[3]]] : v.points;
    this.arms.setAttribute('d', v.type === 'bezier' ? `M0 0L${pts[0][0]} ${pts[0][1]}M1 1L${pts[1][0]} ${pts[1][1]}` : '');
    this.syncHandles(pts, v.type);
    // readouts
    this.cssOut.textContent = this.toCSS();
    const name = this.presetOf(v);
    this.presetName.textContent = name ?? 'custom';
    this.presetName.toggleAttribute('data-ssui-custom', !name);
    this.presetMenu.querySelectorAll<HTMLLIElement>('.ssui-select__option').forEach(li => li.setAttribute('aria-selected', String(li.dataset.name === name)));
    this.modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === v.type)));
    this.curveRoot.setAttribute('data-ssui-mode', v.type);
    this.drawBall();
  }

  private syncHandles(pts: [number, number][], type: CurveValue['type']): void {
    while (this.handles.length > pts.length) this.handles.pop()!.remove();
    while (this.handles.length < pts.length) {
      const idx = this.handles.length;
      const c = s('circle', { class: 'ssui-curve__handle', role: 'slider', tabindex: 0, 'aria-orientation': 'vertical' });
      c.addEventListener('focus', () => { this.focusIndex = idx; });
      c.addEventListener('keydown', (e) => this.onHandleKey(e as KeyboardEvent, idx));
      this.cleanups.push(trackPointer(c as unknown as HTMLElement, {
        immediate: true, cursor: 'grabbing',
        onStart: () => { this.dragIndex = idx; c.setAttribute('data-ssui-dragging', ''); this.setState('dragging'); },
        onMove: (sess) => this.moveHandle(idx, sess.x, sess.y),
        onEnd: () => { this.dragIndex = -1; c.removeAttribute('data-ssui-dragging'); this.setState('idle'); this.emit('finish', this.binding.read()); },
      }));
      this.handlesG.append(c); this.handles.push(c);
    }
    pts.forEach(([x, y], i) => {
      const c = this.handles[i];
      c.dataset.x = String(x); c.dataset.y = String(y);
      const locked = type === 'points' && (i === 0 || i === pts.length - 1);
      c.toggleAttribute('data-ssui-locked', locked);
      c.setAttribute('aria-label', type === 'bezier' ? `control point ${i + 1}` : locked ? (i === 0 ? 'start' : 'end') : `point ${i + 1}`);
      c.setAttribute('aria-valuetext', `x ${fmt(x)} y ${fmt(y)}`);
      c.setAttribute('aria-valuenow', fmt(y));
    });
    // r is set in CSS; keep handles in screen-pixel size despite preserveAspectRatio:none
    this.fitHandleRadius();
  }

  private fitHandleRadius(): void {
    // the stage is non-uniformly scaled (preserveAspectRatio none); counter it per handle so circles stay round and 5px
    this.handles.forEach(c => {
      c.setAttribute('transform', `translate(${c.dataset.x ?? 0} ${c.dataset.y ?? 0}) scale(${this.sx} ${this.sy})`);
    });
  }

  private drawBall(): void {
    const t = this.time, y = this.fn(t);
    this.ball.setAttribute('transform', `translate(${t} ${y}) scale(${this.sx} ${this.sy})`);
    this.ballX.setAttribute('x1', String(t)); this.ballX.setAttribute('x2', String(t));
  }

  // ---- interaction ----------------------------------------------------------
  private toLocal(clientX: number, clientY: number): [number, number] {
    const r = this.stage.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * (1 + 2 * PAD_X) - PAD_X;
    const y = 1 - ((clientY - r.top) / r.height) * (1 + 2 * PAD_Y) + PAD_Y;
    return [x, y];
  }

  private moveHandle(i: number, clientX: number, clientY: number): void {
    const v = this.clone(this.binding.read());
    const [x, y] = this.toLocal(clientX, clientY);
    if (v.type === 'bezier') {
      v.points[i * 2] = x; v.points[i * 2 + 1] = y;
    } else {
      const last = v.points.length - 1;
      const lo = i === 0 ? 0 : v.points[i - 1][0] + 0.001;
      const hi = i === last ? 1 : v.points[i + 1][0] - 0.001;
      v.points[i] = [i === 0 || i === last ? v.points[i][0] : clamp(x, lo, hi), y];
    }
    this.setValue(v);
  }

  private nudge(i: number, dx: number, dy: number, commit = true): void {
    const v = this.clone(this.binding.read());
    if (v.type === 'bezier') { v.points[i * 2] += dx; v.points[i * 2 + 1] += dy; }
    else {
      const last = v.points.length - 1;
      const lo = i === 0 ? 0 : v.points[i - 1][0] + 0.001, hi = i === last ? 1 : v.points[i + 1][0] - 0.001;
      const nx = i === 0 || i === last ? v.points[i][0] : clamp(v.points[i][0] + dx, lo, hi);
      v.points[i] = [nx, v.points[i][1] + dy];
    }
    this.setValue(v, commit);
  }

  private onHandleKey(e: KeyboardEvent, i: number): void {
    const step = 0.01 * modifierScale(e);
    const v = this.binding.read();
    switch (e.key) {
      case 'ArrowUp': this.nudge(i, 0, step); break;
      case 'ArrowDown': this.nudge(i, 0, -step); break;
      case 'ArrowRight': this.nudge(i, step, 0); break;
      case 'ArrowLeft': this.nudge(i, -step, 0); break;
      case 'Backspace': case 'Delete':
        if (v.type === 'points' && i > 0 && i < v.points.length - 1) {
          const nv = this.clone(v) as Extract<CurveValue, { type: 'points' }>;
          nv.points.splice(i, 1);
          this.setValue(nv, true);
          this.handles[Math.max(0, i - 1)]?.focus();
        }
        break;
      default: return;
    }
    e.preventDefault(); e.stopPropagation();
  }
  private onStageKey(e: KeyboardEvent): void { if (e.key === 'Escape') this.stage.blur(); }

  private onDblClick(e: MouseEvent): void {
    const v = this.binding.read();
    if (v.type !== 'points') return;
    if ((e.target as Element).classList.contains('ssui-curve__handle')) return;
    const [x, y] = this.toLocal(e.clientX, e.clientY);
    const nv = this.clone(v) as Extract<CurveValue, { type: 'points' }>;
    nv.points.push([clamp(x, 0.001, 0.999), y]);
    nv.points.sort((a, b) => a[0] - b[0]);
    this.setValue(nv, true);
    const idx = nv.points.findIndex(p => p[0] === clamp(x, 0.001, 0.999));
    requestAnimationFrame(() => this.handles[idx]?.focus());
  }

  private switchMode(m: 'bezier' | 'points'): void {
    const v = this.binding.read();
    if (v.type === m) return;
    if (m === 'points') {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([t, +this.fn(t).toFixed(3)]); }
      this.setValue({ type: 'points', points: pts }, true);
    } else {
      // fit a bezier: use the curve's tangents near the ends as control points
      const y1 = this.fn(0.25), y2 = this.fn(0.75);
      this.setValue({ type: 'bezier', points: [0.25, +y1.toFixed(3), 0.75, +y2.toFixed(3)] }, true);
    }
  }

  applyPreset(name: string): void {
    const p = this.presets[name]; if (!p) return;
    const mode = this.opts.mode ?? 'both';
    if (mode !== 'both' && p.type !== mode) {
      // convert preset into the only allowed mode
      const f = p.type === 'bezier' ? bezierFn(...p.points) : monotoneFn(p.points);
      if (mode === 'points') { const pts: [number, number][] = []; for (let i = 0; i <= 8; i++) pts.push([i / 8, +f(i / 8).toFixed(3)]); this.setValue({ type: 'points', points: pts }, true); }
      else this.setValue({ type: 'bezier', points: [0.25, +f(0.25).toFixed(3), 0.75, +f(0.75).toFixed(3)] }, true);
      return;
    }
    this.setValue(this.clone(p), true);
  }

  private copyCSS(): void {
    const text = this.toCSS();
    navigator.clipboard?.writeText(text).catch(() => { /* clipboard blocked: readout still shows the string */ });
    this.cssOut.setAttribute('data-ssui-copied', '');
    clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => this.cssOut.removeAttribute('data-ssui-copied'), 300);
  }

  // ---- preset menu ----------------------------------------------------------
  private get isMenuOpen(): boolean { return this.el.querySelector('.ssui-curve')?.hasAttribute('data-ssui-open') ?? false; }
  private get curveRoot(): HTMLElement { return this.el.querySelector('.ssui-curve') as HTMLElement; }
  private openMenu(): void {
    this.curveRoot.setAttribute('data-ssui-open', ''); this.presetBox.setAttribute('data-ssui-open', '');
    this.presetBox.querySelector('button')!.setAttribute('aria-expanded', 'true');
    this.setState('open');
    const sel = this.presetMenu.querySelector<HTMLElement>('[aria-selected="true"]') ?? this.presetMenu.firstElementChild as HTMLElement;
    this.setMenuActive(sel);
    this.presetMenu.focus({ preventScroll: true });
  }
  private closeMenu(refocus = false): void {
    if (!this.isMenuOpen) return;
    this.curveRoot.removeAttribute('data-ssui-open'); this.presetBox.removeAttribute('data-ssui-open');
    this.presetBox.querySelector('button')!.setAttribute('aria-expanded', 'false');
    this.setState('idle');
    if (refocus) this.presetBox.querySelector('button')!.focus();
  }
  private setMenuActive(el: HTMLElement | null): void {
    this.presetMenu.querySelectorAll('.ssui-select__option').forEach(li => li.toggleAttribute('data-ssui-active', li === el));
    el?.scrollIntoView({ block: 'nearest' });
  }
  private onMenuKey(e: KeyboardEvent): void {
    const items = [...this.presetMenu.querySelectorAll<HTMLElement>('.ssui-select__option')];
    const cur = items.findIndex(li => li.hasAttribute('data-ssui-active'));
    if (!this.isMenuOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); this.openMenu(); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.setMenuActive(items[(cur + 1) % items.length]); break;
      case 'ArrowUp': e.preventDefault(); this.setMenuActive(items[(cur - 1 + items.length) % items.length]); break;
      case 'Enter': case ' ': e.preventDefault(); if (cur >= 0) { this.applyPreset(items[cur].dataset.name!); this.closeMenu(true); } break;
      case 'Escape': e.preventDefault(); this.closeMenu(true); break;
      case 'Tab': this.closeMenu(); break;
    }
    e.stopPropagation();
  }

  onThemeChange(): void { /* SVG is themed by CSS; nothing to redraw */ }

  dispose(): void { clearTimeout(this.copyTimer); super.dispose(); }
}
