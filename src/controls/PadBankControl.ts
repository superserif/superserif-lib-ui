import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h } from '../core/dom';

export type PadBankValue = Record<string, boolean>;
export interface PadSpec { key: string; label?: string }
export interface PadBankOptions extends BaseOptions {
  /** which pads, in order; default: every key of the bound object */
  pads?: (string | PadSpec)[];
  /** pads per row, default 4 (one row of four) */
  columns?: number;
}

/**
 * Pad bank: square on/off pads (MPC-like, very light skeuomorphism), each tied to a parameter.
 * Value: { [key]: boolean }. The parameter name sits discreetly left of its pad.
 */
export class PadBankControl extends Controller<PadBankValue, PadBankOptions> {
  private pads!: { key: string; btn: HTMLButtonElement }[];
  private box!: HTMLElement;

  constructor(binding: Binding<PadBankValue>, opts: PadBankOptions = {}) {
    super(binding, opts, 'pads');
    this.stacked = true;
    this.mount();
  }

  protected render(): HTMLElement {
    const v = this.binding.read() ?? {};
    const specs: PadSpec[] = (this.opts.pads ?? Object.keys(v)).map(p => typeof p === 'string' ? { key: p } : p);
    this.pads = [];
    this.box = h('div', { class: 'ssui-pads', role: 'group', 'aria-labelledby': `${this.inputId}-label` });
    this.box.style.setProperty('--ssui-pads-cols', String(this.opts.columns ?? 4));
    specs.forEach((sp, i) => {
      const btn = h('button', { class: 'ssui-pad__face', type: 'button', role: 'switch', 'aria-checked': 'false', 'aria-label': sp.label ?? sp.key, id: i === 0 ? this.inputId : undefined });
      btn.addEventListener('click', () => this.togglePad(sp.key));
      btn.addEventListener('keydown', (e) => {
        const n = this.pads.length, j = this.pads.findIndex(p => p.key === sp.key);
        const cols = this.opts.columns ?? 4;
        const go = (k: number): void => { e.preventDefault(); this.pads[(k + n) % n].btn.focus(); };
        if (e.key === 'ArrowRight') go(j + 1); else if (e.key === 'ArrowLeft') go(j - 1);
        else if (e.key === 'ArrowDown') go(j + cols); else if (e.key === 'ArrowUp') go(j - cols);
      });
      // the parameter name lives inside the pad, bottom-left, as a micro caption
      btn.append(h('span', { class: 'ssui-pad__label', 'aria-hidden': 'true' }, [sp.label ?? sp.key]));
      const cell = h('div', { class: 'ssui-pad' }, [btn]);
      this.box.append(cell);
      this.pads.push({ key: sp.key, btn });
    });
    return this.box;
  }

  togglePad(key: string): void {
    const cur = this.binding.read() ?? {};
    this.setValue({ ...cur, [key]: !cur[key] }, true);
  }
  set(key: string, on: boolean): void { this.setValue({ ...(this.binding.read() ?? {}), [key]: on }, true); }

  protected sanitize(v: PadBankValue): PadBankValue {
    const out: PadBankValue = {};
    for (const k of Object.keys(v ?? {})) out[k] = !!v[k];
    return out;
  }
  protected update(v: PadBankValue): void {
    for (const p of this.pads) p.btn.setAttribute('aria-checked', String(!!v?.[p.key]));
  }
}
