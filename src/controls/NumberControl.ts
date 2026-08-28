import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h } from '../core/dom';
import { clamp, snap, precisionOf, inferStep } from '../core/math';
import { formatNumber, parseNumber } from '../core/format';
import { trackPointer, modifierScale } from '../core/pointer';
import { keyDelta } from '../core/keys';

export interface NumberOptions extends BaseOptions {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  unit?: string;
  /** value change per pixel of vertical scrub at 1x (default: step) */
  scrubSpeed?: number;
  wheel?: boolean;
  /** internal: render without label row (used inside Slider/Knob/Pad2D) */
  bare?: boolean;
  dim?: boolean;
}

export class NumberControl extends Controller<number, NumberOptions> {
  min: number; max: number; step: number; precision: number;
  private valueEl!: HTMLElement;
  private inputEl!: HTMLInputElement;
  private box!: HTMLElement;
  private dragStart = 0;

  constructor(binding: Binding<number>, opts: NumberOptions = {}, kind = 'number') {
    super(binding, opts, kind);
    this.min = opts.min ?? -Infinity;
    this.max = opts.max ?? Infinity;
    this.step = opts.step ?? inferStep(binding.read(), opts.min, opts.max);
    this.precision = opts.precision ?? precisionOf(this.step);
    this.mount();
  }

  /** the standalone widget (also used embedded by Slider / Knob / Pad2D) */
  static widget(binding: Binding<number>, opts: NumberOptions): NumberControl {
    return new NumberControl(binding, { ...opts, bare: true });
  }

  protected render(): HTMLElement {
    this.valueEl = h('span', { class: 'ssui-number__value', id: this.inputId, role: 'spinbutton', tabindex: 0, 'aria-labelledby': `${this.inputId}-label` });
    this.inputEl = h('input', { class: 'ssui-number__input', type: 'text', inputmode: 'decimal', name: this.id, 'aria-label': this.opts.label ?? this.id, tabindex: -1 });
    this.box = h('div', { class: `ssui-number${this.opts.dim ? ' ssui-number--dim' : ''}`, 'data-ssui-state': 'idle' }, [this.valueEl, this.inputEl]);
    if (isFinite(this.min)) this.valueEl.setAttribute('aria-valuemin', String(this.min));
    if (isFinite(this.max)) this.valueEl.setAttribute('aria-valuemax', String(this.max));

    // scrub
    this.cleanups.push(trackPointer(this.box, {
      cursor: 'ns-resize',
      onStart: () => { this.dragStart = this.binding.read(); this.setState('dragging'); this.box.setAttribute('data-ssui-state', 'dragging'); },
      onMove: (s) => {
        const speed = (this.opts.scrubSpeed ?? this.step) * modifierScale(s);
        const stretch = clamp(Math.abs(s.dy) / 80, 0, 1);
        this.box.style.setProperty('--ssui-number-stretch', stretch.toFixed(3));
        this.setValue(this.dragStart - s.dy * speed);
      },
      onEnd: () => { this.box.style.setProperty('--ssui-number-stretch', '0'); this.setState('idle'); this.box.setAttribute('data-ssui-state', 'idle'); this.emit('finish', this.binding.read()); },
      onTap: () => this.edit(),
    }));

    // keyboard on the readout
    this.valueEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); this.edit(); return; }
      const d = keyDelta(e, this, this.binding.read());
      if (d === null) return;
      e.preventDefault();
      this.setValue(this.binding.read() + d, true);
    });

    // edit mode
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.commitEdit(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.cancelEdit(); }
      else if (e.key === 'Tab') { this.commitEdit(false); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const n = parseNumber(this.inputEl.value); if (n === null) return;
        const d = (e.key === 'ArrowUp' ? 1 : -1) * this.step * modifierScale(e);
        this.inputEl.value = formatNumber(this.sanitize(n + d), { precision: this.precision });
      }
      e.stopPropagation();
    });
    this.inputEl.addEventListener('blur', () => { if (this._state === 'editing') this.commitEdit(false); });

    if (this.opts.wheel) {
      this.box.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.setValue(this.binding.read() - Math.sign(e.deltaY) * this.step * modifierScale(e), true);
      }, { passive: false });
    }
    return this.box;
  }

  protected sanitize(v: number): number {
    if (!isFinite(v)) return this.binding.read();
    const origin = isFinite(this.min) ? this.min : 0;
    return clamp(snap(v, this.step, origin), this.min, this.max);
  }

  protected update(v: number): void {
    const s = formatNumber(v, { precision: this.precision });
    this.valueEl.textContent = '';
    this.valueEl.append(s);
    if (this.opts.unit) this.valueEl.append(h('span', { class: 'ssui-number__unit' }, [this.opts.unit]));
    this.valueEl.setAttribute('aria-valuenow', String(v));
    this.valueEl.setAttribute('aria-valuetext', s + (this.opts.unit ?? ''));
  }

  edit(): void {
    if (this._state === 'editing') return;
    this.setState('editing'); this.box.setAttribute('data-ssui-state', 'editing');
    this.inputEl.value = formatNumber(this.binding.read(), { precision: this.precision });
    this.inputEl.focus(); this.inputEl.select();
  }
  private commitEdit(refocus = true): void {
    const n = parseNumber(this.inputEl.value);
    this.setState('idle'); this.box.setAttribute('data-ssui-state', 'idle');
    if (n !== null) this.setValue(n, true); else this.flush();
    if (refocus) this.valueEl.focus();
  }
  private cancelEdit(): void {
    this.setState('idle'); this.box.setAttribute('data-ssui-state', 'idle');
    this.flush(); this.valueEl.focus();
  }

  /** for composite controls: the widget element without the row */
  get widget(): HTMLElement { return this.box; }
}
