import { NumberControl, type NumberOptions } from './NumberControl';
import type { Binding } from '../core/Binding';
import { bindValue } from '../core/Binding';
import { h } from '../core/dom';
import { clamp, mapRange } from '../core/math';
import { trackPointer, modifierScale } from '../core/pointer';
import { keyDelta } from '../core/keys';
import { formatNumber } from '../core/format';

export interface KnobOptions extends NumberOptions {
  size?: 'sm' | 'md' | 'lg';
  /** degrees of travel, default 270 */
  sweep?: number;
  /** tick count around the sweep, default 15 */
  ticks?: number;
  /** 'inline' = label left, dial + readout right (default); 'stack' = readout above, dial, label below */
  layout?: 'inline' | 'stack';
  /** 'linear' = vertical drag (default), 'rotary' = follow the pointer angle */
  mode?: 'rotary' | 'linear';
}

const SIZES = { sm: 40, md: 56, lg: 72 } as const;
const SVG_NS = 'http://www.w3.org/2000/svg';
let warned = false;

/** Knob = dial with a tick ring + embedded scrubbable Number readout. */
export class KnobControl extends NumberControl {
  private kbox!: HTMLElement;
  private dial!: HTMLElement;
  private readout!: NumberControl;
  // no field initializers: NumberControl's constructor runs mount() -> render() before they would run
  private ticks!: { el: SVGCircleElement; angle: number }[];
  private sweep!: number;
  private kStart!: number;
  private prevAngle!: number;
  private dragAngle!: number;

  constructor(binding: Binding<number>, opts: KnobOptions = {}) {
    super(binding, opts, 'knob');
  }

  protected render(): HTMLElement {
    const o = this.opts as KnobOptions;
    if (!isFinite(this.min) || !isFinite(this.max)) {
      if (!warned) { console.warn('[ssui] Knob needs min/max; defaulting to 0..100'); warned = true; }
      if (!isFinite(this.min)) this.min = 0;
      if (!isFinite(this.max)) this.max = 100;
    }
    this.sweep = o.sweep ?? 270;
    this.ticks = []; this.kStart = 0; this.prevAngle = 0; this.dragAngle = 0;
    const count = Math.max(2, o.ticks ?? 15);

    // readout proxies through this controller so both paths share sanitize/emit
    const proxy = bindValue(this.binding.read());
    proxy.read = () => this.binding.read();
    proxy.write = (v) => this.setValue(v);
    this.readout = NumberControl.widget(proxy, { min: this.min, max: this.max, step: this.step, precision: this.precision, unit: this.opts.unit, label: this.opts.label, id: this.id + '-value' });
    this.readout.on('finish', (v) => this.emit('finish', v));
    this.readout.on('state', (s) => this.setState(s === 'editing' || s === 'dragging' ? s : 'idle'));
    this.cleanups.push(() => this.readout.dispose());

    // tick ring: one circle per tick, generated once
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'ssui-knob__ticks');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('aria-hidden', 'true');
    const r = 46;
    for (let i = 0; i < count; i++) {
      const angle = -this.sweep / 2 + (i / (count - 1)) * this.sweep;
      const rad = (angle - 90) * Math.PI / 180;
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', (50 + r * Math.cos(rad)).toFixed(2));
      c.setAttribute('cy', (50 + r * Math.sin(rad)).toFixed(2));
      c.setAttribute('r', '1.6');
      c.setAttribute('class', 'ssui-knob__tick');
      svg.append(c);
      this.ticks.push({ el: c, angle });
    }

    const face = h('div', { class: 'ssui-knob__face' }, [h('div', { class: 'ssui-knob__indicator' })]);
    this.dial = h('div', {
      class: 'ssui-knob__dial', role: 'slider', tabindex: 0, id: this.inputId,
      'aria-labelledby': `${this.inputId}-label`, 'aria-valuemin': String(this.min), 'aria-valuemax': String(this.max),
    }, [svg, face]);
    this.kbox = h('div', { class: `ssui-knob ssui-knob--${o.size ?? 'md'}${o.layout === 'stack' ? ' ssui-knob--stack' : ''}`, 'data-ssui-state': 'idle' }, [this.dial, this.readout.widget]);
    this.kbox.style.setProperty('--ssui-knob-size', `${SIZES[o.size ?? 'md']}px`);
    if (o.layout === 'stack') {
      // readout above, dial, label below — the row becomes a centered column
      this.el.classList.add('ssui-row--stack', 'ssui-row--knob-stack');
      this.el.append(this.labelEl);
    }

    const range = this.max - this.min;
    const rotary = o.mode === 'rotary';
    const angleAt = (x: number, y: number): number => {
      const rc = this.dial.getBoundingClientRect();
      return Math.atan2(y - (rc.top + rc.height / 2), x - (rc.left + rc.width / 2)) * 180 / Math.PI + 90;
    };
    this.cleanups.push(trackPointer(this.dial, {
      cursor: rotary ? 'grabbing' : 'ns-resize',
      immediate: rotary,
      onStart: (s) => {
        this.kStart = this.binding.read();
        this.dragAngle = this.valueToAngle(this.kStart);
        this.prevAngle = angleAt(s.x, s.y);
        this.setState('dragging'); this.kbox.setAttribute('data-ssui-state', 'dragging');
      },
      onMove: (s) => {
        if (rotary) {
          const a = angleAt(s.x, s.y);
          let d = a - this.prevAngle;
          if (d > 180) d -= 360; else if (d < -180) d += 360;
          this.prevAngle = a;
          this.dragAngle = clamp(this.dragAngle + d, -this.sweep / 2, this.sweep / 2);
          this.setValue(mapRange(this.dragAngle, -this.sweep / 2, this.sweep / 2, this.min, this.max));
        } else {
          const speed = (this.opts.scrubSpeed ?? range / 150) * modifierScale(s);
          this.setValue(this.kStart - s.dy * speed);
        }
      },
      onEnd: () => { this.setState('idle'); this.kbox.setAttribute('data-ssui-state', 'idle'); this.emit('finish', this.binding.read()); },
    }));
    this.dial.addEventListener('dblclick', () => this.setValue(this.initial, true));
    this.dial.addEventListener('keydown', (e) => {
      const d = keyDelta(e, this, this.binding.read());
      if (d === null) return;
      e.preventDefault(); this.setValue(this.binding.read() + d, true);
    });
    if (this.opts.wheel) {
      this.dial.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.setValue(this.binding.read() - Math.sign(e.deltaY) * this.step * modifierScale(e), true);
      }, { passive: false });
    }
    return this.kbox;
  }

  private valueToAngle(v: number): number {
    return mapRange(clamp(v, this.min, this.max), this.min, this.max, -this.sweep / 2, this.sweep / 2);
  }

  protected update(v: number): void {
    const angle = this.valueToAngle(v);
    this.dial.style.setProperty('--ssui-knob-angle', `${angle.toFixed(2)}deg`);
    this.dial.setAttribute('aria-valuenow', String(v));
    this.dial.setAttribute('aria-valuetext', formatNumber(v, { precision: this.precision }) + (this.opts.unit ?? ''));
    // tick weights: nearest tick scales up, neighbours fall off with distance
    const falloff = (this.sweep / (this.ticks.length - 1)) * 3;
    for (const t of this.ticks) {
      const w = clamp(1 - Math.abs(t.angle - angle) / falloff, 0, 1);
      t.el.style.setProperty('--ssui-tick-w', (w * w).toFixed(3));
      t.el.toggleAttribute('data-ssui-on', t.angle <= angle + 0.01);
    }
    this.readout?.refresh();
  }

  edit(): void { this.readout.edit(); }
  get widget(): HTMLElement { return this.kbox; }
}
