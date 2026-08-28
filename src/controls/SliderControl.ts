import { NumberControl, type NumberOptions } from './NumberControl';
import type { Binding } from '../core/Binding';
import { bindValue } from '../core/Binding';
import { h } from '../core/dom';
import { clamp, mapRange } from '../core/math';
import { trackPointer } from '../core/pointer';
import { keyDelta } from '../core/keys';
import { formatNumber } from '../core/format';

export interface SliderOptions extends NumberOptions {
  min: number; max: number;
  /** show "/ max" after the value */
  showRange?: boolean;
  /** inline: label + "value / max" on one line, full-width bar below (Figma "Sliders Container") */
  inline?: boolean;
  /** the "/ max" readout is itself scrubbable, so the range can be raised from the UI (default true when shown) */
  editableMax?: boolean;
}

/** Slider = track + embedded scrubbable Number readout. */
export class SliderControl extends NumberControl {
  private track!: HTMLElement;
  private readout!: NumberControl;
  private rangeEl: HTMLElement | null = null;
  private maxRead: NumberControl | null = null;
  private ro: ResizeObserver | null = null;

  constructor(binding: Binding<number>, opts: SliderOptions) {
    super(binding, opts, 'slider');
  }

  protected render(): HTMLElement {
    // proxy binding so the readout writes through this controller (single source of truth)
    const proxy = bindValue(this.binding.read());
    proxy.read = () => this.binding.read();
    proxy.write = (v) => this.setValue(v);
    this.readout = NumberControl.widget(proxy, { min: this.min, max: this.max, step: this.step, precision: this.precision, unit: this.opts.unit, label: this.opts.label, id: this.id + '-value' });
    this.readout.on('finish', (v) => this.emit('finish', v));
    this.readout.on('state', (s) => { if (s === 'editing' || s === 'dragging') this.setState(s as any); else this.setState('idle'); });
    this.cleanups.push(() => this.readout.dispose());

    const fill = h('div', { class: 'ssui-slider__fill' });
    const thumb = h('div', { class: 'ssui-slider__thumb' });
    this.track = h('div', {
      class: 'ssui-slider__track', role: 'slider', tabindex: 0, id: this.inputId,
      'aria-labelledby': `${this.inputId}-label`, 'aria-valuemin': String(this.min), 'aria-valuemax': String(this.max), 'aria-orientation': 'horizontal',
    }, [h('div', { class: 'ssui-slider__rail' }), fill, thumb]);

    const o = this.opts as SliderOptions;
    const inline = !!o.inline;
    const box = h('div', { class: `ssui-slider${inline ? ' ssui-slider--inline' : ''}`, 'data-ssui-state': 'idle' }, [this.track]);
    const readoutWrap = h('div', { class: 'ssui-slider__readout' }, [this.readout.widget]);
    if (o.showRange || inline) {
      this.rangeEl = h('span', { class: 'ssui-value ssui-slider__range' }, ['/']);
      readoutWrap.append(this.rangeEl);
      if (o.editableMax !== false) {
        // "/ max" is a scrubbable number: drag it up to widen the range, the fill re-scales live
        const maxProxy = bindValue(this.max);
        maxProxy.read = () => this.max;
        maxProxy.write = (m) => this.setMax(m);
        this.maxRead = NumberControl.widget(maxProxy, { min: this.min + this.step, step: this.step, precision: this.precision, unit: this.opts.unit, label: `${this.opts.label ?? this.id} max`, id: this.id + '-max', dim: true, scrubSpeed: this.step * 2 });
        this.maxRead.on('state', (st) => { if (st === 'editing' || st === 'dragging') this.setState(st as any); else this.setState('idle'); });
        this.cleanups.push(() => this.maxRead?.dispose());
        readoutWrap.append(this.maxRead.widget);
      } else {
        readoutWrap.append(h('span', { class: 'ssui-value ssui-slider__range' }, [formatNumber(this.max, { precision: this.precision })]));
      }
    }
    if (inline) {
      // stacked row: label row carries the readout, the bar takes the full width below
      this.el.classList.add('ssui-row--stack', 'ssui-row--slider-inline');
      this.labelEl.append(readoutWrap);
    } else {
      box.append(readoutWrap);
    }

    const setFromX = (clientX: number): void => {
      const r = this.track.getBoundingClientRect();
      this.setValue(mapRange(clamp((clientX - r.left) / r.width, 0, 1), 0, 1, this.min, this.max));
    };
    this.cleanups.push(trackPointer(this.track, {
      immediate: true, cursor: 'ew-resize',
      onStart: (s) => { this.setState('dragging'); box.setAttribute('data-ssui-state', 'dragging'); setFromX(s.x); },
      onMove: (s) => setFromX(s.x),
      onEnd: () => { this.setState('idle'); box.setAttribute('data-ssui-state', 'idle'); this.emit('finish', this.binding.read()); },
    }));
    this.track.addEventListener('keydown', (e) => {
      const d = keyDelta(e, this, this.binding.read(), true) ?? keyDelta(e, this, this.binding.read(), false);
      if (d === null) return;
      e.preventDefault(); this.setValue(this.binding.read() + d, true);
    });

    this.ro = new ResizeObserver(() => this.track.style.setProperty('--ssui-track-w', `${this.track.clientWidth}px`));
    this.ro.observe(this.track);
    this.cleanups.push(() => this.ro?.disconnect());
    return box;
  }

  protected update(v: number): void {
    const p = clamp(mapRange(v, this.min, this.max, 0, 1), 0, 1);
    this.track.style.setProperty('--ssui-p', p.toFixed(4));
    this.track.setAttribute('aria-valuenow', String(v));
    this.track.setAttribute('aria-valuetext', formatNumber(v, { precision: this.precision }) + (this.opts.unit ?? ''));
    this.readout?.refresh();
  }

  /** raise or lower the range; the current value is clamped into it */
  setMax(m: number): void {
    if (!isFinite(m) || m <= this.min) return;
    this.max = m;
    this.readout.max = m;
    this.track.setAttribute('aria-valuemax', String(m));
    if (this.binding.read() > m) this.setValue(m, true); else this.flush();
    this.maxRead?.refresh();
  }

  /** Slider's own box is the track; the Number's edit() targets the readout */
  edit(): void { this.readout.edit(); }
}
