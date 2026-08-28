import { Emitter } from '../core/Emitter';
import { h, icons, slug } from '../core/dom';

export interface MenuItem { label: string; onSelect?: () => void; disabled?: boolean; hint?: string; id?: string }
export interface MenuOptions { icon?: 'plus' | 'more' | 'chevron' | 'none'; variant?: 'default' | 'primary' | 'ghost'; align?: 'left' | 'right'; id?: string; full?: boolean }

/** A button that opens a list of actions ("Add module…"). Not a value control. */
export class MenuControl extends Emitter<{ select: [MenuItem]; open: []; close: []; dispose: [] }> {
  readonly el: HTMLElement;
  readonly id: string;
  readonly serializable = false;
  private box: HTMLElement;
  private trigger: HTMLButtonElement;
  private menu: HTMLUListElement;
  private active = -1;
  private optionEls: HTMLLIElement[] = [];
  private outside = (e: PointerEvent): void => { if (!this.box.contains(e.target as Node)) this.close(); };

  constructor(label: string, public items: MenuItem[], private opts: MenuOptions = {}) {
    super();
    this.id = opts.id ?? slug(label);
    const icon = opts.icon ?? 'plus';
    this.trigger = h('button', { class: `ssui-button ssui-menu__trigger${opts.variant && opts.variant !== 'default' ? ` ssui-button--${opts.variant}` : ''}`, type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' }, [
      icon === 'plus' ? icons.plus() : icon === 'more' ? icons.more() : null, label, icon === 'chevron' ? icons.chevron() : null,
    ]);
    this.menu = h('ul', { class: 'ssui-select__menu ssui-menu__list', role: 'menu', tabindex: -1 });
    this.box = h('div', { class: `ssui-select ssui-menu${opts.align === 'left' ? ' ssui-menu--left' : ''}` }, [this.trigger, this.menu]);
    this.el = h('div', { class: `ssui-row ssui-row--menu${opts.full ? ' ssui-row--menu-full' : ''}`, 'data-ssui-id': this.id }, [h('div', { class: 'ssui-row__label' }), h('div', { class: 'ssui-row__control' }, [this.box])]);
    this.setItems(items);
    this.trigger.addEventListener('click', (e) => { e.stopPropagation(); this.isOpen ? this.close() : this.open(); });
    this.trigger.addEventListener('keydown', (e) => this.onKey(e));
    this.menu.addEventListener('keydown', (e) => this.onKey(e));
    document.addEventListener('pointerdown', this.outside, true);
  }

  setItems(items: MenuItem[]): void {
    this.items = items;
    this.menu.textContent = '';
    this.optionEls = items.map((it, i) => {
      const li = h('li', { class: 'ssui-select__option', role: 'menuitem', 'aria-disabled': it.disabled ? 'true' : null }, [it.label, it.hint ? h('span', { class: 'ssui-select__option-index' }, [it.hint]) : null]);
      li.style.setProperty('--i', String(i));
      li.addEventListener('pointerenter', () => this.setActive(i));
      li.addEventListener('click', (e) => { e.stopPropagation(); this.pick(i); });
      this.menu.append(li);
      return li;
    });
  }
  get isOpen(): boolean { return this.box.hasAttribute('data-ssui-open'); }
  open(): void { if (this.isOpen) return; this.box.setAttribute('data-ssui-open', ''); this.trigger.setAttribute('aria-expanded', 'true'); this.setActive(0); this.menu.focus({ preventScroll: true }); this.emit('open'); }
  close(refocus = false): void { if (!this.isOpen) return; this.box.removeAttribute('data-ssui-open'); this.trigger.setAttribute('aria-expanded', 'false'); if (refocus) this.trigger.focus(); this.emit('close'); }
  private setActive(i: number): void { this.active = i; this.optionEls.forEach((el, j) => el.toggleAttribute('data-ssui-active', j === i)); }
  private pick(i: number): void { const it = this.items[i]; if (!it || it.disabled) return; this.close(true); it.onSelect?.(); this.emit('select', it); }
  private onKey(e: KeyboardEvent): void {
    const n = this.items.length;
    if (!this.isOpen) { if (['Enter', ' ', 'ArrowDown'].includes(e.key)) { e.preventDefault(); this.open(); } return; }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.setActive((this.active + 1) % n); break;
      case 'ArrowUp': e.preventDefault(); this.setActive((this.active - 1 + n) % n); break;
      case 'Enter': case ' ': e.preventDefault(); this.pick(this.active); break;
      case 'Escape': e.preventDefault(); this.close(true); break;
      case 'Tab': this.close(); break;
    }
  }
  disable(on = true): this { this.el.toggleAttribute('data-ssui-disabled', on); return this; }
  hide(on = true): this { this.el.toggleAttribute('data-ssui-hidden', on); return this; }
  dispose(): void { document.removeEventListener('pointerdown', this.outside, true); this.el.remove(); this.emit('dispose'); this.clear(); }
}
