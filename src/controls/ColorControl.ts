import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { bindValue } from '../core/Binding';
import { h } from '../core/dom';
import { trackPointer, modifierScale } from '../core/pointer';
import { clamp } from '../core/math';
import { Scheduler } from '../core/Scheduler';
import { NumberControl } from './NumberControl';
import { parseColor, tryParseColor } from '../color/parse';
import { formatColor, inferFormat, hasAlpha, toHexDisplay } from '../color/format';
import { rgbToHsv, hsvToRgb } from '../color/hsv';

export type RGBA = { r: number; g: number; b: number; a?: number };
export type ColorValue = string | number | RGBA;
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'number' | 'object';
export interface ColorOptions extends BaseOptions { format?: ColorFormat; alpha?: boolean }

/**
 * Color: swatch + hex field in the row; a popover (SV square, hue rail, alpha rail,
 * HSV/RGB readouts) that grows out of the swatch. Keeps the consumer's format.
 */
export class ColorControl extends Controller<ColorValue, ColorOptions> {
  readonly format: ColorFormat;
  readonly alpha: boolean;
  private hsv = { h: 0, s: 0, v: 0 };
  private a = 1;
  private mode: 'hsv' | 'rgb' = 'hsv';

  private box!: HTMLElement;
  private swatch!: HTMLButtonElement;
  private hex!: HTMLInputElement;
  private pop!: HTMLElement;
  private sv!: HTMLElement;
  private hue!: HTMLElement;
  private alphaEl: HTMLElement | null = null;
  private modeBtn!: HTMLButtonElement;
  private hsvWidgets: NumberControl[] = [];
  private rgbWidgets: NumberControl[] = [];
  private hsvRow!: HTMLElement;
  private rgbRow!: HTMLElement;
  private dirtySinceOpen = false;
  private closeTimer = 0;

  constructor(binding: Binding<ColorValue>, opts: ColorOptions = {}) {
    super(binding, opts, 'color');
    const init = binding.read();
    this.format = opts.format ?? inferFormat(init);
    this.alpha = opts.alpha ?? (this.format !== 'number' && hasAlpha(init));
    this.readInto(parseColor(init), true);
    this.mount();
  }

  // ---- value plumbing -----------------------------------------------------
  private readInto(c: RGBA, force = false): void {
    const { h: hh, s, v } = rgbToHsv(c.r, c.g, c.b);
    // keep hue/saturation memory at the singularities so the thumbs don't jump
    if (force || (s > 0.001 && v > 0.001)) this.hsv.h = hh;
    if (force || v > 0.001) this.hsv.s = s;
    this.hsv.v = v;
    this.a = c.a === undefined ? 1 : c.a;
  }
  private rgba(): RGBA { return { ...hsvToRgb(this.hsv.h, this.hsv.s, this.hsv.v), a: this.a }; }
  private out(c: RGBA = this.rgba()): ColorValue { return formatColor(c, this.format, this.alpha); }

  protected sanitize(v: ColorValue): ColorValue {
    const p = tryParseColor(v);
    return p ? this.out(p) : this.binding.read();
  }

  /** object format: mutate the consumer's object in place (references stay valid) */
  protected setValue(v: ColorValue, commit = false): void {
    if (this.format === 'object') {
      const s = this.sanitize(v) as RGBA;
      const cur = this.binding.read() as RGBA;
      if (cur && typeof cur === 'object') {
        if (!this.binding.equals(s, cur)) {
          if (!this.alpha) delete cur.a;
          Object.assign(cur, s);
          this.binding.write(cur);
          this.emit('change', cur);
        }
        this.refreshSoon();
        if (commit) this.emit('finish', cur);
        return;
      }
    }
    super.setValue(v, commit);
  }
  private refreshSoon(): void { Scheduler.request(this); }

  private apply(commit = false): void { this.dirtySinceOpen = true; this.setValue(this.out(), commit); }
  private setHSV(p: Partial<{ h: number; s: number; v: number; a: number }>, commit = false): void {
    if (p.h !== undefined) this.hsv.h = ((p.h % 360) + 360) % 360;
    if (p.s !== undefined) this.hsv.s = clamp(p.s, 0, 1);
    if (p.v !== undefined) this.hsv.v = clamp(p.v, 0, 1);
    if (p.a !== undefined) this.a = clamp(p.a, 0, 1);
    this.apply(commit);
    this.paint(); // immediate feedback while dragging (update() follows next frame)
  }
  private setRGBChannel(k: 'r' | 'g' | 'b', v255: number, commit = false): void {
    const c = this.rgba(); c[k] = clamp(v255, 0, 255) / 255;
    this.readInto(c); this.apply(commit); this.paint();
  }

  // ---- DOM ----------------------------------------------------------------
  protected render(): HTMLElement {
    this.swatch = h('button', { class: 'ssui-color__swatch', type: 'button', id: this.inputId, 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-labelledby': `${this.inputId}-label`, title: 'Pick color' });
    this.hex = h('input', { class: 'ssui-color__hex', type: 'text', name: this.id, spellcheck: 'false', autocomplete: 'off', 'aria-label': `${this.opts.label ?? this.id} hex`, size: this.alpha ? 9 : 7 });

    // popover
    this.sv = h('div', { class: 'ssui-color__sv', role: 'slider', tabindex: 0, 'aria-label': 'Saturation and value' }, [h('span', { class: 'ssui-color__thumb' })]);
    this.hue = h('div', { class: 'ssui-color__hue', role: 'slider', tabindex: 0, 'aria-label': 'Hue', 'aria-valuemin': 0, 'aria-valuemax': 360 }, [h('span', { class: 'ssui-color__thumb' })]);
    if (this.alpha) this.alphaEl = h('div', { class: 'ssui-color__alpha', role: 'slider', tabindex: 0, 'aria-label': 'Alpha', 'aria-valuemin': 0, 'aria-valuemax': 100 }, [h('span', { class: 'ssui-color__thumb' })]);

    const mk = (label: string, read: () => number, write: (n: number) => void, max: number): NumberControl => {
      const b = bindValue(read());
      b.read = read; b.write = (n) => write(n);
      const w = NumberControl.widget(b, { min: 0, max, step: 1, precision: 0, label, id: `${this.id}-${label.toLowerCase()}`, dim: true });
      w.on('finish', () => this.apply(true));
      w.on('state', (s) => { if (s === 'dragging') this.dragging(true); else if (s === 'idle') this.dragging(false); });
      this.cleanups.push(() => w.dispose());
      return w;
    };
    this.hsvWidgets = [
      mk('H', () => Math.round(this.hsv.h), (n) => this.setHSV({ h: n }), 360),
      mk('S', () => Math.round(this.hsv.s * 100), (n) => this.setHSV({ s: n / 100 }), 100),
      mk('V', () => Math.round(this.hsv.v * 100), (n) => this.setHSV({ v: n / 100 }), 100),
    ];
    this.rgbWidgets = (['r', 'g', 'b'] as const).map(k => mk(k.toUpperCase(), () => Math.round(this.rgba()[k] * 255), (n) => this.setRGBChannel(k, n), 255));
    const field = (w: NumberControl, label: string): HTMLElement => h('div', { class: 'ssui-color__field' }, [h('span', { class: 'ssui-color__field-label' }, [label]), w.widget]);
    this.hsvRow = h('div', { class: 'ssui-color__fields' }, this.hsvWidgets.map((w, i) => field(w, 'HSV'[i])));
    this.rgbRow = h('div', { class: 'ssui-color__fields', hidden: true }, this.rgbWidgets.map((w, i) => field(w, 'RGB'[i])));
    this.modeBtn = h('button', { class: 'ssui-color__mode', type: 'button', 'aria-label': 'Switch readout mode' }, ['HSV']);
    this.modeBtn.addEventListener('click', () => this.setMode(this.mode === 'hsv' ? 'rgb' : 'hsv'));

    this.pop = h('div', { class: 'ssui-color__popover', role: 'dialog', 'aria-label': `${this.opts.label ?? this.id} color`, 'aria-modal': 'false' }, [
      this.sv, this.hue, this.alphaEl,
      h('div', { class: 'ssui-color__readouts' }, [this.hsvRow, this.rgbRow, this.modeBtn]),
    ]);
    this.box = h('div', { class: 'ssui-color', 'data-ssui-state': 'idle' }, [this.swatch, this.hex, this.pop]);

    this.wireSwatch(); this.wireHex(); this.wireSliders(); this.wirePopover();
    return this.box;
  }

  private wireSwatch(): void {
    this.swatch.addEventListener('click', (e) => { e.stopPropagation(); this.isOpen ? this.close(true) : this.open(); });
  }
  private wireHex(): void {
    this.hex.addEventListener('input', () => {
      const p = tryParseColor(this.hex.value.trim());
      this.hex.toggleAttribute('data-ssui-invalid', !p);
      if (p) { this.readInto(p); this.setValue(this.out(p)); this.paint(false); }
    });
    this.hex.addEventListener('focus', () => this.setState('editing'));
    this.hex.addEventListener('blur', () => { this.hex.removeAttribute('data-ssui-invalid'); this.setState('idle'); this.paint(); });
    this.hex.addEventListener('keydown', (ev: Event) => {
      const e = ev as KeyboardEvent; e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); const p = tryParseColor(this.hex.value.trim()); if (p) { this.readInto(p); this.setValue(this.out(p), true); } this.hex.blur(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.paint(); this.hex.blur(); }
    });
  }
  private dragging(on: boolean): void {
    const s = on ? 'dragging' : (this.isOpen ? 'open' : 'idle');
    this.box.setAttribute('data-ssui-state', s); // before setState: the panel's live check reads the DOM
    this.setState(s);
  }
  private wireSliders(): void {
    const drag = (el: HTMLElement, onPos: (px: number, py: number) => void): void => {
      const at = (x: number, y: number): void => { const r = el.getBoundingClientRect(); onPos(clamp((x - r.left) / r.width, 0, 1), clamp((y - r.top) / r.height, 0, 1)); };
      this.cleanups.push(trackPointer(el, {
        immediate: true, cursor: 'crosshair',
        onStart: (s) => { this.dragging(true); at(s.x, s.y); },
        onMove: (s) => at(s.x, s.y),
        onEnd: () => { this.dragging(false); this.apply(true); el.focus({ preventScroll: true }); },
      }));
    };
    drag(this.sv, (px, py) => this.setHSV({ s: px, v: 1 - py }));
    drag(this.hue, (px) => this.setHSV({ h: px * 359.999 }));
    if (this.alphaEl) drag(this.alphaEl, (px) => this.setHSV({ a: px }));

    this.sv.addEventListener('keydown', (e) => {
      const m = modifierScale(e) * 0.01; let d: Partial<{ s: number; v: number }> | null = null;
      if (e.key === 'ArrowLeft') d = { s: this.hsv.s - m }; else if (e.key === 'ArrowRight') d = { s: this.hsv.s + m };
      else if (e.key === 'ArrowUp') d = { v: this.hsv.v + m }; else if (e.key === 'ArrowDown') d = { v: this.hsv.v - m };
      if (d) { e.preventDefault(); e.stopPropagation(); this.setHSV(d, true); }
    });
    this.hue.addEventListener('keydown', (e) => {
      const m = modifierScale(e);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); this.setHSV({ h: this.hsv.h - m }, true); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); this.setHSV({ h: this.hsv.h + m }, true); }
    });
    this.alphaEl?.addEventListener('keydown', (e) => {
      const m = modifierScale(e) * 0.01;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); this.setHSV({ a: this.a - m }, true); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); this.setHSV({ a: this.a + m }, true); }
    });
  }
  private wirePopover(): void {
    const outside = (e: PointerEvent): void => { if (this.isOpen && !this.box.contains(e.target as Node)) this.close(); };
    document.addEventListener('pointerdown', outside, true);
    this.cleanups.push(() => document.removeEventListener('pointerdown', outside, true));
    const onScroll = (): void => { if (this.isOpen) this.close(); };
    const body = (): HTMLElement | null => this.el.closest('.ssui-panel__body');
    let scrollEl: HTMLElement | null = null;
    this.cleanups.push(() => scrollEl?.removeEventListener('scroll', onScroll));
    this.pop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.close(true); return; }
      if (e.key !== 'Tab') return;
      const f = [...this.pop.querySelectorAll<HTMLElement>('[tabindex="0"],button,input')].filter(el => !el.hidden && el.offsetParent !== null);
      if (!f.length) return;
      const i = f.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? f[f.length - 1] : f[i - 1]) : (i === -1 || i >= f.length - 1 ? f[0] : f[i + 1]);
      e.preventDefault(); next.focus();
    });
    // lazy: attach the scroll listener the first time we open (body exists by then)
    this.open = ((orig) => (): void => {
      if (!scrollEl) { scrollEl = body(); scrollEl?.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); this.cleanups.push(() => window.removeEventListener('resize', onScroll)); }
      orig();
    })(this.open.bind(this));
  }

  private setMode(m: 'hsv' | 'rgb'): void {
    this.mode = m;
    this.hsvRow.hidden = m !== 'hsv'; this.rgbRow.hidden = m !== 'rgb';
    this.modeBtn.textContent = m === 'hsv' ? 'HSV' : 'RGB';
    this.paint();
  }

  // ---- open / close -------------------------------------------------------
  get isOpen(): boolean { return this.box.hasAttribute('data-ssui-open'); }
  open(): void {
    if (this.isOpen) return;
    clearTimeout(this.closeTimer);
    this.dirtySinceOpen = false;
    this.place();
    this.box.setAttribute('data-ssui-open', '');
    this.swatch.setAttribute('aria-expanded', 'true');
    this.setState('open'); this.box.setAttribute('data-ssui-state', 'open');
    this.sv.focus({ preventScroll: true });
  }
  close(refocus = false): void {
    if (!this.isOpen) return;
    this.box.removeAttribute('data-ssui-open');
    this.swatch.setAttribute('aria-expanded', 'false');
    this.setState('idle'); this.box.setAttribute('data-ssui-state', 'idle');
    if (this.dirtySinceOpen) { this.dirtySinceOpen = false; this.emit('finish', this.binding.read()); }
    if (refocus) this.swatch.focus({ preventScroll: true });
  }
  /** position: fixed popover so it escapes the panel's overflow clip; clip origin = swatch center */
  private place(): void {
    const s = this.swatch.getBoundingClientRect();
    const row = this.el.getBoundingClientRect();
    const w = this.pop.offsetWidth || 208, hgt = this.pop.offsetHeight || 220;
    const gap = 6;
    let left = clamp(row.right - w, 8, innerWidth - w - 8);
    let top = s.bottom + gap;
    if (top + hgt > innerHeight - 8) top = Math.max(8, s.top - gap - hgt);
    this.pop.style.left = `${Math.round(left)}px`;
    this.pop.style.top = `${Math.round(top)}px`;
    const cx = s.left + s.width / 2 - left, cy = s.top + s.height / 2 - top;
    this.pop.style.setProperty('--ssui-cx', `${Math.round(cx)}px`);
    this.pop.style.setProperty('--ssui-cy', `${Math.round(cy)}px`);
  }

  // ---- paint --------------------------------------------------------------
  protected update(v: ColorValue): void {
    const p = tryParseColor(v);
    if (p && this._state !== 'dragging') this.readInto(p);
    this.paint();
  }
  private paint(hexToo = true): void {
    const c = this.rgba();
    const css = `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)} / ${this.a})`;
    const opaque = `rgb(${Math.round(c.r * 255)} ${Math.round(c.g * 255)} ${Math.round(c.b * 255)})`;
    this.box.style.setProperty('--ssui-color-current', css);
    this.box.style.setProperty('--ssui-color-opaque', opaque);
    this.box.style.setProperty('--ssui-h', `${this.hsv.h.toFixed(1)}`);
    this.box.style.setProperty('--ssui-sx', `${(this.hsv.s * 100).toFixed(2)}%`);
    this.box.style.setProperty('--ssui-sy', `${((1 - this.hsv.v) * 100).toFixed(2)}%`);
    this.box.style.setProperty('--ssui-hx', `${(this.hsv.h / 360 * 100).toFixed(2)}%`);
    this.box.style.setProperty('--ssui-ax', `${(this.a * 100).toFixed(2)}%`);
    if (hexToo && document.activeElement !== this.hex) this.hex.value = toHexDisplay(c, this.alpha);
    this.sv.setAttribute('aria-valuetext', `s ${Math.round(this.hsv.s * 100)}% v ${Math.round(this.hsv.v * 100)}%`);
    this.hue.setAttribute('aria-valuenow', String(Math.round(this.hsv.h)));
    this.hue.setAttribute('aria-valuetext', `${Math.round(this.hsv.h)}°`);
    this.alphaEl?.setAttribute('aria-valuenow', String(Math.round(this.a * 100)));
    this.alphaEl?.setAttribute('aria-valuetext', `${Math.round(this.a * 100)}%`);
    (this.mode === 'hsv' ? this.hsvWidgets : this.rgbWidgets).forEach(w => w.refresh());
  }
}
