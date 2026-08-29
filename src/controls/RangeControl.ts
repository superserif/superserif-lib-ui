import { Controller, type BaseOptions } from '../core/Controller';
import { bindValue, type Binding, type Pair } from '../core/Binding';
import { NumberControl } from './NumberControl';
import { h } from '../core/dom';
import { clamp, mapRange, snap, precisionOf, inferStep } from '../core/math';
import { trackPointer } from '../core/pointer';
import { keyDelta } from '../core/keys';
import { formatNumber } from '../core/format';

export interface RangeOptions extends BaseOptions {
  min: number; max: number;
  step?: number;
  precision?: number;
  unit?: string;
  /** inline: label + "lo – hi" on one line, full-width track below (same layout as the inline Slider) */
  inline?: boolean;
}

/** Range = one track, two thumbs; the value is a [lo, hi] pair. */
export class RangeControl extends Controller<Pair, RangeOptions> {
  min: number; max: number; step: number; precision: number;
  private track!: HTMLElement;
  private loThumb!: HTMLElement;
  private hiThumb!: HTMLElement;
  private readouts: NumberControl[] = [];
  /** which end the current gesture moves; the pair never crosses */
  private active: 0 | 1 = 1;
  private ro: ResizeObserver | null = null;

  constructor(binding: Binding<Pair>, opts: RangeOptions) {
    super(binding, opts, 'range');
    this.min = opts.min;
    this.max = opts.max;
    this.step = opts.step ?? inferStep(binding.read()[1], opts.min, opts.max);
    this.precision = opts.precision ?? precisionOf(this.step);
    this.mount();
  }

  protected render(): HTMLElement {
    const o = this.opts;
    const inline = !!o.inline;

    const thumb = (end: 0 | 1): HTMLElement => h('div', {
      class: `ssui-slider__thumb ssui-slider__thumb--${end === 0 ? 'lo' : 'hi'}`,
      role: 'slider', tabindex: 0,
      'aria-label': `${o.label ?? this.id} ${end === 0 ? 'min' : 'max'}`,
      'aria-valuemin': String(this.min), 'aria-valuemax': String(this.max), 'aria-orientation': 'horizontal',
    });
    this.loThumb = thumb(0);
    this.hiThumb = thumb(1);
    this.track = h('div', { class: 'ssui-slider__track', id: this.inputId },
      [h('div', { class: 'ssui-slider__rail' }), h('div', { class: 'ssui-slider__fill' }), this.loThumb, this.hiThumb]);
    const box = h('div', { class: `ssui-slider ssui-slider--range${inline ? ' ssui-slider--inline' : ''}`, 'data-ssui-state': 'idle' }, [this.track]);

    // readout "lo – hi": two scrubbable numbers writing through this controller
    const readout = (end: 0 | 1): NumberControl => {
      const proxy = bindValue(this.binding.read()[end]);
      proxy.read = () => this.binding.read()[end];
      proxy.write = (n) => this.setEnd(end, n);
      const r = NumberControl.widget(proxy, { min: this.min, max: this.max, step: this.step, precision: this.precision, unit: o.unit, label: `${o.label ?? this.id} ${end === 0 ? 'min' : 'max'}`, id: `${this.id}-${end === 0 ? 'lo' : 'hi'}` });
      r.on('finish', () => this.emit('finish', this.binding.read()));
      r.on('state', (s) => { if (s === 'editing' || s === 'dragging') this.setState(s as any); else this.setState('idle'); });
      this.cleanups.push(() => r.dispose());
      return r;
    };
    this.readouts = [readout(0), readout(1)];
    const readoutWrap = h('div', { class: 'ssui-slider__readout' }, [
      this.readouts[0].widget,
      h('span', { class: 'ssui-value ssui-slider__range' }, ['–']),
      this.readouts[1].widget,
    ]);
    if (inline) {
      this.el.classList.add('ssui-row--stack', 'ssui-row--slider-inline');
      this.labelEl.append(readoutWrap);
    } else {
      box.append(readoutWrap);
    }

    const valueAt = (clientX: number): number => {
      const r = this.track.getBoundingClientRect();
      return mapRange(clamp((clientX - r.left) / r.width, 0, 1), 0, 1, this.min, this.max);
    };
    const setFromX = (clientX: number): void => this.setEnd(this.active, valueAt(clientX));
    this.cleanups.push(trackPointer(this.track, {
      immediate: true, cursor: 'ew-resize',
      onStart: (s) => {
        const [lo, hi] = this.binding.read();
        const v = valueAt(s.x);
        this.active = Math.abs(v - lo) <= Math.abs(v - hi) ? 0 : 1;
        this.setState('dragging'); box.setAttribute('data-ssui-state', 'dragging');
        setFromX(s.x);
      },
      onMove: (s) => setFromX(s.x),
      onEnd: () => { this.setState('idle'); box.setAttribute('data-ssui-state', 'idle'); this.emit('finish', this.binding.read()); },
    }));

    const keys = (t: HTMLElement, end: 0 | 1): void => t.addEventListener('keydown', (e) => {
      const d = keyDelta(e, this, this.binding.read()[end], true) ?? keyDelta(e, this, this.binding.read()[end], false);
      if (d === null) return;
      e.preventDefault();
      this.setEnd(end, this.binding.read()[end] + d, true);
    });
    keys(this.loThumb, 0);
    keys(this.hiThumb, 1);

    this.ro = new ResizeObserver(() => this.track.style.setProperty('--ssui-track-w', `${this.track.clientWidth}px`));
    this.ro.observe(this.track);
    this.cleanups.push(() => this.ro?.disconnect());
    return box;
  }

  private setEnd(end: 0 | 1, n: number, commit = false): void {
    const [lo, hi] = this.binding.read();
    this.active = end;
    this.setValue(end === 0 ? [n, hi] : [lo, n], commit);
  }

  protected sanitize(v: Pair): Pair {
    let lo = clamp(snap(v[0], this.step, this.min), this.min, this.max);
    let hi = clamp(snap(v[1], this.step, this.min), this.min, this.max);
    if (lo > hi) { if (this.active === 0) lo = hi; else hi = lo; }
    return [lo, hi];
  }

  protected update(v: Pair): void {
    this.track.style.setProperty('--ssui-p0', clamp(mapRange(v[0], this.min, this.max, 0, 1), 0, 1).toFixed(4));
    this.track.style.setProperty('--ssui-p1', clamp(mapRange(v[1], this.min, this.max, 0, 1), 0, 1).toFixed(4));
    const aria = (t: HTMLElement, n: number): void => {
      t.setAttribute('aria-valuenow', String(n));
      t.setAttribute('aria-valuetext', formatNumber(n, { precision: this.precision }) + (this.opts.unit ?? ''));
    };
    aria(this.loThumb, v[0]);
    aria(this.hiThumb, v[1]);
    this.loThumb.setAttribute('aria-valuemax', String(v[1]));
    this.hiThumb.setAttribute('aria-valuemin', String(v[0]));
    this.readouts.forEach(r => r.refresh());
  }

  /** the Number's edit() targets the hi readout */
  edit(): void { this.readouts[1]?.edit(); }
}
