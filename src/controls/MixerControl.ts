import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { bindValue } from '../core/Binding';
import { h } from '../core/dom';
import { clamp, snap } from '../core/math';
import { trackPointer, modifierScale } from '../core/pointer';
import { keyDelta } from '../core/keys';
import { NumberControl } from './NumberControl';

export interface MixerChannel { gain: number; pan: number; mute: boolean; solo: boolean }
export interface MixerValue { channels: MixerChannel[]; output: number; selected: number }
export interface MixerOptions extends BaseOptions {
  /** channel names, default ['Ch 1','Ch 2','Ch 3','Ch 4'] */
  channels?: string[];
  /** show the output fader, default true */
  output?: boolean;
  gain?: { min?: number; max?: number; step?: number };   // default 0..100 step 1
  pan?: boolean;                                          // default true, -50..50
  /** false = faders only: no gain/pan readouts, no mute/solo */
  controls?: boolean;
  /** fader travel in px, default 96 */
  height?: number;
}

const DEFAULT_NAMES = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4'];
const DEFAULT_CH = (): MixerChannel => ({ gain: 80, pan: 0, mute: false, solo: false });

interface Column { el: HTMLButtonElement; fader: HTMLElement; name: HTMLElement; state: HTMLElement | null; index: number; isOutput: boolean }

/** Mixer = channel columns with vertical faders, a sliding selection highlight, gain/pan readouts and Mute/Solo for the selected channel. */
export class MixerControl extends Controller<MixerValue, MixerOptions> {
  private box!: HTMLElement;
  private channelsEl!: HTMLElement;
  private highlight!: HTMLElement;
  private dot!: HTMLElement;
  private cols!: Column[];
  private gainRead!: NumberControl;
  private panRead!: NumberControl | null;
  private panField!: HTMLElement | null;
  private muteBtn!: HTMLButtonElement;
  private soloBtn!: HTMLButtonElement;
  private roundsEl!: HTMLElement;
  private names!: string[];
  private gMin!: number; private gMax!: number; private gStep!: number;
  private height!: number;
  private dragStart!: number;

  constructor(binding: Binding<MixerValue>, opts: MixerOptions = {}) {
    super(binding, opts, 'mixer');
    this.stacked = true;
    this.mount();
  }

  // ---- value helpers -------------------------------------------------------
  private get hasOutput(): boolean { return this.opts.output !== false; }
  private normalize(v: Partial<MixerValue> | null | undefined): MixerValue {
    const n = this.names.length;
    const src = Array.isArray(v?.channels) ? v!.channels : [];
    const channels: MixerChannel[] = [];
    for (let i = 0; i < n; i++) {
      const c = src[i] ?? {};
      channels.push({
        gain: clamp(snap(typeof c.gain === 'number' ? c.gain : 80, this.gStep, this.gMin), this.gMin, this.gMax),
        pan: clamp(Math.round(typeof c.pan === 'number' ? c.pan : 0), -50, 50),
        mute: !!c.mute, solo: !!c.solo,
      });
    }
    const maxSel = this.hasOutput ? n : n - 1;
    return {
      channels,
      output: clamp(snap(typeof v?.output === 'number' ? v.output : 80, this.gStep, this.gMin), this.gMin, this.gMax),
      selected: clamp(Math.round(typeof v?.selected === 'number' ? v.selected : 0), 0, Math.max(0, maxSel)),
    };
  }
  protected sanitize(v: MixerValue): MixerValue { return this.normalize(v); }
  protected clone(v: MixerValue): MixerValue { return v ? { channels: (v.channels ?? []).map(c => ({ ...c })), output: v.output, selected: v.selected } : v; }
  private edit(fn: (v: MixerValue) => void, commit = false): void {
    const v = this.normalize(this.clone(this.binding.read()));
    fn(v);
    this.setValue(v, commit);
  }
  private selIsOutput(v: MixerValue): boolean { return this.hasOutput && v.selected === this.names.length; }
  private gainOf(v: MixerValue, i: number): number { return i === this.names.length ? v.output : v.channels[i].gain; }
  private setGain(v: MixerValue, i: number, g: number): void {
    const c = clamp(snap(g, this.gStep, this.gMin), this.gMin, this.gMax);
    if (i === this.names.length) v.output = c; else v.channels[i].gain = c;
  }

  // ---- render --------------------------------------------------------------
  protected render(): HTMLElement {
    const o = this.opts;
    this.names = o.channels ?? DEFAULT_NAMES;
    this.gMin = o.gain?.min ?? 0; this.gMax = o.gain?.max ?? 100; this.gStep = o.gain?.step ?? 1;
    this.height = o.height ?? 96;
    this.cols = [];
    this.dragStart = 0;

    // label row: dot indicator on the right
    this.dot = h('span', { class: 'ssui-mixer__dot', 'aria-hidden': 'true' });
    this.labelEl.append(this.dot);

    this.highlight = h('div', { class: 'ssui-mixer__highlight', 'aria-hidden': 'true' });
    this.channelsEl = h('div', { class: 'ssui-mixer__channels', role: 'group', 'aria-label': `${o.label ?? this.id} channels` }, [this.highlight]);
    const total = this.names.length + (this.hasOutput ? 1 : 0);
    this.channelsEl.style.setProperty('--ssui-mixer-count', String(total));
    this.channelsEl.style.setProperty('--ssui-mixer-height', `${this.height}px`);

    for (let i = 0; i < total; i++) {
      const isOutput = i === this.names.length;
      const name = h('span', { class: 'ssui-mixer__name' }, [isOutput ? 'Output' : this.names[i]]);
      const fader = h('div', {
        class: 'ssui-mixer__fader', role: 'slider', tabindex: 0, 'aria-orientation': 'vertical',
        'aria-label': `${isOutput ? 'Output' : this.names[i]} gain`, 'aria-valuemin': String(this.gMin), 'aria-valuemax': String(this.gMax),
      }, [h('span', { class: 'ssui-mixer__rail' }, [h('span', { class: 'ssui-mixer__fill' }), h('span', { class: 'ssui-mixer__cap' })])]);
      const state = isOutput ? null : h('span', { class: 'ssui-mixer__state', 'aria-hidden': 'true' });
      const col = h('button', { class: `ssui-mixer__channel${isOutput ? ' ssui-mixer__channel--output' : ''}`, type: 'button', 'aria-pressed': 'false' }, [name, fader, state]);
      col.addEventListener('click', () => this.select(i));
      // fader
      this.cleanups.push(trackPointer(fader, {
        immediate: true, cursor: 'ns-resize',
        onStart: () => {
          this.dragStart = this.gainOf(this.normalize(this.binding.read()), i);
          this.edit(v => { v.selected = i; });
          this.setState('dragging'); this.box.setAttribute('data-ssui-state', 'dragging'); col.setAttribute('data-ssui-dragging', '');
        },
        onMove: (s) => {
          const perPx = ((this.gMax - this.gMin) / this.height) * modifierScale(s);
          this.edit(v => this.setGain(v, i, this.dragStart - s.dy * perPx));
        },
        onEnd: () => {
          this.setState('idle'); this.box.setAttribute('data-ssui-state', 'idle'); col.removeAttribute('data-ssui-dragging');
          col.setAttribute('data-ssui-released', ''); setTimeout(() => col.removeAttribute('data-ssui-released'), 450);
          this.emit('finish', this.binding.read());
        },
      }));
      fader.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const init = this.normalize(this.initial);
        this.edit(v => this.setGain(v, i, this.gainOf(init, i)), true);
      });
      fader.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const next = clamp(i + (e.key === 'ArrowRight' ? 1 : -1), 0, total - 1);
          this.select(next); this.cols[next].fader.focus();
          return;
        }
        const cur = this.gainOf(this.normalize(this.binding.read()), i);
        const d = keyDelta(e, { step: this.gStep, min: this.gMin, max: this.gMax }, cur);
        if (d === null) return;
        e.preventDefault(); e.stopPropagation();
        this.edit(v => { v.selected = i; this.setGain(v, i, cur + d); }, true);
      });
      fader.addEventListener('focus', () => this.select(i));
      this.cols.push({ el: col, fader, name, state, index: i, isOutput });
      this.channelsEl.append(col);
    }

    // detail: gain / pan readouts + mute / solo
    const gainProxy = bindValue(0);
    gainProxy.read = () => { const v = this.normalize(this.binding.read()); return this.gainOf(v, v.selected); };
    gainProxy.write = (g) => this.edit(v => this.setGain(v, v.selected, g));
    this.gainRead = NumberControl.widget(gainProxy, { min: this.gMin, max: this.gMax, step: this.gStep, label: 'Gain', id: `${this.id}-gain` });
    this.gainRead.on('finish', () => this.emit('finish', this.binding.read()));
    this.gainRead.on('state', (s) => this.setState(s === 'editing' || s === 'dragging' ? s : 'idle'));
    this.cleanups.push(() => this.gainRead.dispose());
    const gainField = h('div', { class: 'ssui-mixer__field' }, [h('span', { class: 'ssui-mixer__field-label' }, ['Gain']), this.gainRead.widget]);

    this.panRead = null; this.panField = null;
    if (o.pan !== false) {
      const panProxy = bindValue(0);
      panProxy.read = () => { const v = this.normalize(this.binding.read()); return this.selIsOutput(v) ? 0 : v.channels[v.selected].pan; };
      panProxy.write = (p) => this.edit(v => { if (!this.selIsOutput(v)) v.channels[v.selected].pan = clamp(Math.round(p), -50, 50); });
      this.panRead = NumberControl.widget(panProxy, { min: -50, max: 50, step: 1, label: 'Pan', id: `${this.id}-pan` });
      this.panRead.on('finish', () => this.emit('finish', this.binding.read()));
      this.panRead.on('state', (s) => this.setState(s === 'editing' || s === 'dragging' ? s : 'idle'));
      this.cleanups.push(() => this.panRead!.dispose());
      this.panField = h('div', { class: 'ssui-mixer__field' }, [h('span', { class: 'ssui-mixer__field-label' }, ['Pan']), this.panRead.widget]);
    }

    this.muteBtn = h('button', { class: 'ssui-mixer__round ssui-mixer__round--mute', type: 'button', 'aria-pressed': 'false' }, ['Mute']);
    this.soloBtn = h('button', { class: 'ssui-mixer__round ssui-mixer__round--solo', type: 'button', 'aria-pressed': 'false' }, ['Solo']);
    this.muteBtn.addEventListener('click', () => this.edit(v => { if (!this.selIsOutput(v)) v.channels[v.selected].mute = !v.channels[v.selected].mute; }, true));
    this.soloBtn.addEventListener('click', () => this.edit(v => { if (!this.selIsOutput(v)) v.channels[v.selected].solo = !v.channels[v.selected].solo; }, true));
    this.roundsEl = h('div', { class: 'ssui-mixer__rounds' }, [this.muteBtn, this.soloBtn]);

    const detail = h('div', { class: 'ssui-mixer__detail' }, [h('div', { class: 'ssui-mixer__fields' }, [gainField, this.panField]), this.roundsEl]);
    if (o.controls === false) detail.setAttribute('hidden', '');
    this.box = h('div', { class: `ssui-mixer${o.controls === false ? ' ssui-mixer--bare' : ''}`, 'data-ssui-state': 'idle' }, [this.channelsEl, detail]);
    return this.box;
  }

  select(i: number): void {
    const v = this.normalize(this.binding.read());
    if (v.selected === i) return;
    this.edit(x => { x.selected = i; }, true);
  }

  protected update(raw: MixerValue): void {
    const v = this.normalize(raw);
    const anySolo = v.channels.some(c => c.solo);
    for (const col of this.cols) {
      const g = this.gainOf(v, col.index);
      const p = (g - this.gMin) / ((this.gMax - this.gMin) || 1);
      col.fader.style.setProperty('--ssui-p', p.toFixed(4));
      col.fader.setAttribute('aria-valuenow', String(g));
      col.fader.setAttribute('aria-valuetext', String(g));
      const sel = col.index === v.selected;
      col.el.toggleAttribute('data-ssui-selected', sel);
      col.el.setAttribute('aria-pressed', String(sel));
      if (!col.isOutput) {
        const c = v.channels[col.index];
        col.el.toggleAttribute('data-ssui-muted', c.mute);
        col.el.toggleAttribute('data-ssui-solo', c.solo);
        col.el.toggleAttribute('data-ssui-dimmed', anySolo && !c.solo);
      }
    }
    this.channelsEl.style.setProperty('--ssui-mixer-sel', String(v.selected));
    const out = this.selIsOutput(v);
    this.box.toggleAttribute('data-ssui-output', out);
    if (!out) {
      const c = v.channels[v.selected];
      this.muteBtn.setAttribute('aria-pressed', String(c.mute));
      this.soloBtn.setAttribute('aria-pressed', String(c.solo));
    }
    this.gainRead?.refresh();
    this.panRead?.refresh();
  }
}
