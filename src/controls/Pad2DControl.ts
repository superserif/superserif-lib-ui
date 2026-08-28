import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding, XY } from '../core/Binding';
import { bindValue } from '../core/Binding';
import { NumberControl } from './NumberControl';
import { h } from '../core/dom';
import { clamp, snap, precisionOf, inferStep } from '../core/math';
import { formatNumber } from '../core/format';
import { trackPointer } from '../core/pointer';
import { keyDelta } from '../core/keys';

export interface AxisOptions { min?: number; max?: number; step?: number; label?: string; invert?: boolean }
export interface Pad2DOptions extends BaseOptions {
  x?: AxisOptions;
  y?: AxisOptions;
  /** surface size in px, sets --ssui-pad-size (default 128) */
  size?: number;
  /** dots per side (default 8) */
  grid?: number;
}

interface Axis { min: number; max: number; step: number; precision: number; label: string; invert: boolean }

/** Pad2D = square surface with a reactive dot field + two scrubbable readouts. */
export class Pad2DControl extends Controller<XY, Pad2DOptions> {
  private ax!: Axis; private ay!: Axis;
  private surface!: HTMLElement;
  private canvas!: HTMLCanvasElement;
  private thumb!: HTMLElement;
  private rx!: NumberControl; private ry!: NumberControl;
  private ro: ResizeObserver | null = null;
  private size = 0;

  constructor(binding: Binding<XY>, opts: Pad2DOptions = {}) {
    super(binding, opts, 'pad2d');
    this.stacked = true;
    const v = binding.read();
    this.ax = Pad2DControl.axis(opts.x, v.x, 'x', false);
    this.ay = Pad2DControl.axis(opts.y, v.y, 'y', true);
    this.mount();
  }

  private static axis(o: AxisOptions = {}, v: number, name: string, invert: boolean): Axis {
    const min = o.min ?? -1, max = o.max ?? 1;
    const step = o.step ?? inferStep(v, min, max);
    return { min, max, step, precision: precisionOf(step), label: o.label ?? name, invert: o.invert ?? invert };
  }

  protected render(): HTMLElement {
    // readouts in the label row, each writing one axis through setValue
    const mk = (axis: Axis, key: 'x' | 'y'): NumberControl => {
      const proxy = bindValue(this.binding.read()[key]);
      proxy.read = () => this.binding.read()[key];
      proxy.write = (n) => this.setValue({ ...this.binding.read(), [key]: n });
      const r = NumberControl.widget(proxy, { min: axis.min, max: axis.max, step: axis.step, precision: axis.precision, label: `${this.opts.label ?? this.id} ${axis.label}`, id: `${this.id}-${key}` });
      r.on('finish', () => this.emit('finish', this.binding.read()));
      r.on('state', (s) => this.setState(s === 'editing' || s === 'dragging' ? s : 'idle'));
      this.cleanups.push(() => r.dispose());
      return r;
    };
    this.rx = mk(this.ax, 'x'); this.ry = mk(this.ay, 'y');
    this.labelEl.append(h('span', { class: 'ssui-pad2d__readouts' }, [
      h('span', { class: 'ssui-pad2d__axis' }, [this.ax.label]), this.rx.widget,
      h('span', { class: 'ssui-pad2d__axis' }, [this.ay.label]), this.ry.widget,
    ]));

    this.canvas = h('canvas', { class: 'ssui-pad2d__dots', 'aria-hidden': 'true' });
    this.thumb = h('div', { class: 'ssui-pad2d__thumb', 'aria-hidden': 'true' });
    this.surface = h('div', {
      class: 'ssui-pad2d__surface', role: 'slider', tabindex: 0, id: this.inputId, 'aria-labelledby': `${this.inputId}-label`,
    }, [
      this.canvas, this.thumb,
      h('span', { class: 'ssui-pad2d__letter ssui-pad2d__letter--y', 'aria-hidden': 'true' }, ['y']),
      h('span', { class: 'ssui-pad2d__letter ssui-pad2d__letter--x', 'aria-hidden': 'true' }, ['x']),
    ]);
    const box = h('div', { class: 'ssui-pad2d', 'data-ssui-state': 'idle' }, [this.surface]);
    if (this.opts.size) box.style.setProperty('--ssui-pad-size', `${this.opts.size}px`);

    const setFrom = (cx: number, cy: number): void => {
      const r = this.surface.getBoundingClientRect();
      const px = clamp((cx - r.left) / r.width, 0, 1);
      const py = clamp((cy - r.top) / r.height, 0, 1);
      const x = this.ax.min + (this.ax.invert ? 1 - px : px) * (this.ax.max - this.ax.min);
      const y = this.ay.min + (this.ay.invert ? 1 - py : py) * (this.ay.max - this.ay.min);
      this.setValue({ x, y });
    };
    this.cleanups.push(trackPointer(this.surface, {
      immediate: true, cursor: 'crosshair',
      onStart: (s) => { this.setState('dragging'); box.setAttribute('data-ssui-state', 'dragging'); setFrom(s.x, s.y); },
      onMove: (s) => setFrom(s.x, s.y),
      onEnd: () => { this.setState('idle'); box.setAttribute('data-ssui-state', 'idle'); this.emit('finish', this.binding.read()); },
    }));
    this.surface.addEventListener('dblclick', () => this.setValue(this.clone(this.initial), true));
    this.surface.addEventListener('keydown', (e) => {
      const v = this.binding.read();
      const dx = keyDelta(e, this.ax, v.x, true);
      const dy = dx === null ? keyDelta(e, this.ay, v.y, false) : null;
      if (dx === null && dy === null) return;
      e.preventDefault();
      this.setValue({ x: v.x + (dx ?? 0), y: v.y + (dy ?? 0) }, true);
    });

    this.ro = new ResizeObserver(() => {
      this.size = this.surface.clientWidth;
      this.surface.style.setProperty('--ssui-pad-w', `${this.size}px`);
      this.draw(this.binding.read());
    });
    this.ro.observe(this.surface);
    this.cleanups.push(() => this.ro?.disconnect());
    return box;
  }

  protected sanitize(v: XY): XY {
    const sx = clamp(snap(v.x, this.ax.step, this.ax.min), this.ax.min, this.ax.max);
    const sy = clamp(snap(v.y, this.ay.step, this.ay.min), this.ay.min, this.ay.max);
    return { x: isFinite(sx) ? sx : this.binding.read().x, y: isFinite(sy) ? sy : this.binding.read().y };
  }

  private norm(v: XY): XY {
    let px = (v.x - this.ax.min) / (this.ax.max - this.ax.min || 1);
    let py = (v.y - this.ay.min) / (this.ay.max - this.ay.min || 1);
    if (this.ax.invert) px = 1 - px;
    if (this.ay.invert) py = 1 - py;
    return { x: clamp(px, 0, 1), y: clamp(py, 0, 1) };
  }

  protected update(v: XY): void {
    const n = this.norm(v);
    this.surface.style.setProperty('--ssui-pad-x', n.x.toFixed(4));
    this.surface.style.setProperty('--ssui-pad-y', n.y.toFixed(4));
    this.surface.setAttribute('aria-valuetext', `x ${formatNumber(v.x, { precision: this.ax.precision })} · y ${formatNumber(v.y, { precision: this.ay.precision })}`);
    this.rx?.refresh(); this.ry?.refresh();
    this.draw(v);
  }

  onThemeChange(): void { this.draw(this.binding.read()); }

  private draw(v: XY): void {
    const s = this.size; if (!s) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (this.canvas.width !== s * dpr) { this.canvas.width = s * dpr; this.canvas.height = s * dpr; }
    const ctx = this.canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, s, s);
    const root = this.el.closest('.ssui-panel') as HTMLElement | null;
    const cs = root ? getComputedStyle(root) : null;
    const base = cs?.getPropertyValue('--ssui-color-canvas-grid').trim() || '#ccc';
    const hot = cs?.getPropertyValue('--ssui-color-fill').trim() || '#000';
    const n = this.norm(v);
    const tx = n.x * s, ty = n.y * s;
    const grid = Math.max(2, this.opts.grid ?? 8);
    const cell = s / grid;
    const maxDist = s * 0.45;
    const r0 = Math.max(1, s / 128);
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const x = (i + 0.5) * cell, y = (j + 0.5) * cell;
        const d = Math.hypot(x - tx, y - ty);
        const inf = d < maxDist ? 1 - d / maxDist : 0;
        const r = r0 * (1 + inf * 1.5);
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = base; ctx.fill();
        if (inf > 0) { ctx.globalAlpha = inf * inf; ctx.fillStyle = hot; ctx.fill(); ctx.globalAlpha = 1; }
      }
    }
  }
}
