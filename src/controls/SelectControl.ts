import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h, icons } from '../core/dom';
import { pad2 } from '../core/format';
import { Scheduler } from '../core/Scheduler';
import { reducedMotion } from '../core/dom';

export type SelectOption<T> = { label: string; value: T };
export type PreviewFn<T> = (ctx: CanvasRenderingContext2D, value: T, w: number, h: number, t: number, tokens: (name: string) => string) => void;

export interface SelectOptions<T = string | number> extends BaseOptions {
  options: T[] | Record<string, T> | SelectOption<T>[];
  /** draw a small canvas under the row for the current option */
  preview?: PreviewFn<T>;
  previewAnimate?: boolean;
}

export class SelectControl<T = string | number> extends Controller<T, SelectOptions<T>> {
  readonly items: SelectOption<T>[];
  private box!: HTMLElement;
  private trigger!: HTMLButtonElement;
  private indexEl!: HTMLElement;
  private currentEl!: HTMLElement;
  private menu!: HTMLUListElement;
  private optionEls: HTMLLIElement[] = [];
  private active = -1;
  private canvas: HTMLCanvasElement | null = null;
  private time = 0;
  private stopAnim: (() => void) | null = null;
  private typeahead = ''; private typeTimer = 0;

  constructor(binding: Binding<T>, opts: SelectOptions<T>) {
    super(binding, opts, 'select');
    this.items = SelectControl.normalize(opts.options);
    if (opts.preview) this.stacked = true;
    this.mount();
  }

  static normalize<T>(o: SelectOptions<T>['options']): SelectOption<T>[] {
    if (Array.isArray(o)) return o.map((x: any) => (x && typeof x === 'object' && 'value' in x) ? x : { label: String(x), value: x as T });
    return Object.entries(o).map(([label, value]) => ({ label, value }));
  }

  protected render(): HTMLElement {
    this.indexEl = h('span', { class: 'ssui-select__index', 'aria-hidden': 'true' }, [h('span', { class: 'ssui-select__index-cur' }, ['01']), h('span', { class: 'ssui-select__index-sep' }, ['/']), h('span', {}, [pad2(this.items.length)])]);
    this.currentEl = h('span', { class: 'ssui-select__current' });
    const chev = icons.chevron(); chev.classList.add('ssui-select__chevron');
    this.trigger = h('button', { class: 'ssui-select__trigger', type: 'button', id: this.inputId, 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-labelledby': `${this.inputId}-label` }, [this.indexEl, this.currentEl, chev]);
    this.menu = h('ul', { class: 'ssui-select__menu', role: 'listbox', tabindex: -1, 'aria-labelledby': `${this.inputId}-label` });
    this.items.forEach((it, i) => {
      const li = h('li', { class: 'ssui-select__option', role: 'option', 'aria-selected': 'false', 'data-i': i }, [it.label, h('span', { class: 'ssui-select__option-index' }, [pad2(i + 1)])]);
      li.style.setProperty('--i', String(i));
      li.addEventListener('pointerenter', () => this.setActive(i));
      li.addEventListener('click', (e) => { e.stopPropagation(); this.select(i); });
      this.optionEls.push(li); this.menu.append(li);
    });
    this.box = h('div', { class: 'ssui-select' }, [this.trigger, this.menu]);

    this.trigger.addEventListener('click', (e) => { e.stopPropagation(); this.isOpen ? this.close() : this.open(); });
    this.trigger.addEventListener('keydown', (e) => this.onKey(e));
    this.menu.addEventListener('keydown', (e) => this.onKey(e));
    const outside = (e: PointerEvent): void => { if (!this.box.contains(e.target as Node)) this.close(); };
    document.addEventListener('pointerdown', outside, true);
    this.cleanups.push(() => document.removeEventListener('pointerdown', outside, true));

    if (this.opts.preview) {
      // stacked layout: trigger sits in the label row, preview canvas below
      this.canvas = h('canvas', { class: 'ssui-select__preview-canvas', 'aria-hidden': 'true' });
      const wrap = h('div', { class: 'ssui-select__preview' }, [this.canvas]);
      this.labelEl.append(this.box);
      const ro = new ResizeObserver(() => this.draw());
      ro.observe(wrap); this.cleanups.push(() => ro.disconnect());
      if (this.opts.previewAnimate && !reducedMotion()) {
        this.stopAnim = Scheduler.animate({ flush() {}, poll() {}, tick: (dt) => { this.time += dt / 1000; this.draw(); } });
        this.cleanups.push(() => this.stopAnim?.());
      }
      return wrap;
    }
    return this.box;
  }

  get isOpen(): boolean { return this.box.hasAttribute('data-ssui-open'); }
  open(): void {
    if (this.isOpen) return;
    this.box.setAttribute('data-ssui-open', ''); this.trigger.setAttribute('aria-expanded', 'true');
    this.setState('open');
    this.setActive(Math.max(0, this.selectedIndex()));
    this.menu.focus({ preventScroll: true });
  }
  close(refocus = false): void {
    if (!this.isOpen) return;
    this.box.removeAttribute('data-ssui-open'); this.trigger.setAttribute('aria-expanded', 'false');
    this.setState('idle');
    if (refocus) this.trigger.focus();
  }
  private selectedIndex(): number { const v = this.binding.read(); return this.items.findIndex(it => it.value === v); }
  private setActive(i: number): void {
    this.active = i;
    this.optionEls.forEach((el, j) => el.toggleAttribute('data-ssui-active', j === i));
    this.optionEls[i]?.scrollIntoView({ block: 'nearest' });
  }
  select(i: number): void {
    const it = this.items[i]; if (!it) return;
    this.setValue(it.value, true);
    this.close(true);
  }
  private onKey(e: KeyboardEvent): void {
    const n = this.items.length;
    if (!this.isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); this.open(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.select((this.selectedIndex() + 1) % n); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.select((this.selectedIndex() - 1 + n) % n); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.setActive((this.active + 1) % n); break;
      case 'ArrowUp': e.preventDefault(); this.setActive((this.active - 1 + n) % n); break;
      case 'Home': e.preventDefault(); this.setActive(0); break;
      case 'End': e.preventDefault(); this.setActive(n - 1); break;
      case 'Enter': case ' ': e.preventDefault(); this.select(this.active); break;
      case 'Escape': e.preventDefault(); this.close(true); break;
      case 'Tab': this.close(); break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
          clearTimeout(this.typeTimer); this.typeahead += e.key.toLowerCase();
          this.typeTimer = window.setTimeout(() => { this.typeahead = ''; }, 600);
          const i = this.items.findIndex(it => it.label.toLowerCase().startsWith(this.typeahead));
          if (i >= 0) this.setActive(i);
        }
    }
  }

  protected update(v: T): void {
    const i = this.items.findIndex(it => it.value === v);
    const it = this.items[i];
    this.currentEl.textContent = it ? it.label : String(v);
    const cur = this.indexEl.firstElementChild as HTMLElement;
    const next = pad2(Math.max(0, i) + 1);
    if (cur.textContent !== next) { cur.textContent = next; cur.removeAttribute('data-ssui-flip'); void cur.offsetWidth; cur.setAttribute('data-ssui-flip', ''); }
    this.optionEls.forEach((el, j) => el.setAttribute('aria-selected', String(j === i)));
    this.draw();
  }

  onThemeChange(): void { this.draw(); }

  private draw(): void {
    if (!this.canvas || !this.opts.preview) return;
    const wrap = this.canvas.parentElement!; const w = wrap.clientWidth, hh = wrap.clientHeight; if (!w || !hh) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    if (this.canvas.width !== w * dpr || this.canvas.height !== hh * dpr) { this.canvas.width = w * dpr; this.canvas.height = hh * dpr; }
    const ctx = this.canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, hh);
    const root = this.el.closest('.ssui-panel') as HTMLElement | null;
    const tokens = (name: string): string => root ? getComputedStyle(root).getPropertyValue(`--ssui-${name}`).trim() : '';
    this.opts.preview(ctx, this.binding.read(), w, hh, this.time, tokens);
  }
}
