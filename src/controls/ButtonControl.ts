import { Emitter } from '../core/Emitter';
import { h, svg, slug } from '../core/dom';

export interface ButtonSpec { label: string; onClick?: () => void; variant?: 'default' | 'primary' | 'ghost'; icon?: string; title?: string; id?: string }
export interface ButtonOptions extends Omit<ButtonSpec, 'label' | 'onClick'> { label?: string }

/** A button (or a row of buttons). Not a value control: excluded from presets. */
export class ButtonControl extends Emitter<{ click: [string]; dispose: [] }> {
  readonly el: HTMLElement;
  readonly id: string;
  readonly serializable = false;
  readonly buttons: HTMLButtonElement[] = [];

  constructor(specs: ButtonSpec[], rowLabel?: string) {
    super();
    this.id = specs.length === 1 ? (specs[0].id ?? slug(specs[0].label)) : slug(rowLabel ?? specs.map(s => s.label).join('-'));
    const group = h('div', { class: 'ssui-button-group' });
    for (const s of specs) {
      const b = h('button', { class: `ssui-button${s.variant && s.variant !== 'default' ? ` ssui-button--${s.variant}` : ''}${s.icon && !s.label ? ' ssui-button--icon' : ''}`, type: 'button', title: s.title }, [
        s.icon ? svg(s.icon) : null, s.label || null,
      ]);
      b.addEventListener('click', () => { s.onClick?.(); this.emit('click', s.id ?? slug(s.label)); });
      this.buttons.push(b); group.append(b);
    }
    const isGroup = specs.length > 1 && !rowLabel;
    this.el = h('div', { class: `ssui-row ssui-row--${isGroup ? 'buttons' : 'button'}`, 'data-ssui-id': this.id }, [
      h('div', { class: 'ssui-row__label' }, [rowLabel ?? (isGroup ? '' : '')]),
      h('div', { class: 'ssui-row__control' }, [group]),
    ]);
  }
  click(i = 0): void { this.buttons[i]?.click(); }
  disable(on = true): this { this.el.toggleAttribute('data-ssui-disabled', on); return this; }
  hide(on = true): this { this.el.toggleAttribute('data-ssui-hidden', on); return this; }
  dispose(): void { this.el.remove(); this.emit('dispose'); this.clear(); }
}
