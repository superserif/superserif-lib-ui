import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h } from '../core/dom';
import { formatNumber } from '../core/format';
import { Scheduler } from '../core/Scheduler';

export interface MonitorOptions extends BaseOptions {
  graph?: boolean;
  min?: number;
  max?: number;
  /** ring buffer length (default 64) */
  samples?: number;
  /** ms between samples; 0 = every frame */
  interval?: number;
  format?: (v: unknown) => string;
}

/** Read-only readout, optionally with a sparkline. Always listening; never in presets. */
export class MonitorControl extends Controller<unknown, MonitorOptions> {
  readonly serializable: boolean = false;
  private out!: HTMLOutputElement;
  private canvas: HTMLCanvasElement | null = null;
  private buf!: Float32Array;
  private head = 0;
  private filled = 0;
  private acc = 0;
  private stopTick: (() => void) | null = null;

  constructor(binding: Binding<unknown>, opts: MonitorOptions = {}) {
    super(binding, { ...opts, listen: true }, 'monitor');
    if (opts.graph) this.stacked = true;
    this.mount();
  }

  protected render(): HTMLElement {
    this.out = h('output', { class: 'ssui-monitor__value ssui-value', id: this.inputId, 'aria-live': 'off', 'aria-labelledby': `${this.inputId}-label` });
    if (!this.opts.graph) return this.out;

    this.buf = new Float32Array(Math.max(2, this.opts.samples ?? 64));
    this.canvas = h('canvas', { class: 'ssui-monitor__graph', 'aria-hidden': 'true' });
    // stacked layout: readout sits in the label row, graph below
    this.labelEl.append(this.out);
    const ro = new ResizeObserver(() => this.draw());
    ro.observe(this.canvas);
    this.cleanups.push(() => ro.disconnect());
    this.stopTick = Scheduler.animate({ flush() {}, poll() {}, tick: (dt) => this.sample(dt) });
    this.cleanups.push(() => this.stopTick?.());
    return h('div', { class: 'ssui-monitor' }, [this.canvas]);
  }

  private sample(dt: number): void {
    const iv = this.opts.interval ?? 0;
    this.acc += dt;
    if (iv > 0 && this.acc < iv) return;
    this.acc = 0;
    const v = this.binding.read();
    const n = typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : NaN;
    if (!isFinite(n)) return;
    this.buf[this.head] = n;
    this.head = (this.head + 1) % this.buf.length;
    this.filled = Math.min(this.filled + 1, this.buf.length);
    this.draw();
  }

  protected update(v: unknown): void {
    const text = this.opts.format ? this.opts.format(v)
      : typeof v === 'number' ? formatNumber(v, { precision: Number.isInteger(v) ? 0 : 2 })
      : typeof v === 'boolean' ? (v ? 'on' : 'off')
      : String(v ?? '');
    this.out.textContent = text;
    this.out.classList.toggle('ssui-monitor__value--bool', typeof v === 'boolean');
    this.out.toggleAttribute('data-ssui-on', v === true);
  }

  onThemeChange(): void { this.draw(); }

  private draw(): void {
    if (!this.canvas) return;
    const w = this.canvas.clientWidth, hh = this.canvas.clientHeight;
    if (!w || !hh) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (this.canvas.width !== w * dpr || this.canvas.height !== hh * dpr) { this.canvas.width = w * dpr; this.canvas.height = hh * dpr; }
    const ctx = this.canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, hh);
    if (this.filled < 2) return;

    const root = this.el.closest('.ssui-panel') as HTMLElement | null;
    const cs = root ? getComputedStyle(root) : null;
    const line = cs?.getPropertyValue('--ssui-color-canvas-line').trim() || '#888';
    const accent = cs?.getPropertyValue('--ssui-color-accent').trim() || '#f09526';

    const N = this.buf.length, count = this.filled;
    let min = this.opts.min ?? Infinity, max = this.opts.max ?? -Infinity;
    if (this.opts.min === undefined || this.opts.max === undefined) {
      for (let i = 0; i < count; i++) { const v = this.buf[(this.head - count + i + N) % N]; if (this.opts.min === undefined) min = Math.min(min, v); if (this.opts.max === undefined) max = Math.max(max, v); }
      const margin = (max - min || 1) * 0.1;
      if (this.opts.min === undefined) min -= margin;
      if (this.opts.max === undefined) max += margin;
    }
    const range = max - min || 1;
    const pad = 3;
    const xAt = (i: number): number => pad + ((w - 2 * pad) * i) / (N - 1);
    const yAt = (v: number): number => hh - pad - ((v - min) / range) * (hh - 2 * pad);

    ctx.beginPath();
    ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.lineJoin = 'round';
    let lx = 0, ly = 0;
    for (let i = 0; i < count; i++) {
      const v = this.buf[(this.head - count + i + N) % N];
      lx = xAt(N - count + i); ly = yAt(v);
      if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.fillStyle = accent; ctx.arc(lx, ly, 1.5, 0, Math.PI * 2); ctx.fill();
  }
}
