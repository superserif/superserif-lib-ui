import { h } from '../core/dom';

/** Separator and Label: layout-only nodes with the same lifecycle shape as controls. */
export class StaticControl {
  readonly el: HTMLElement;
  readonly id: string;
  readonly serializable = false;
  constructor(kind: 'separator' | 'label', text?: string) {
    this.id = `${kind}-${Math.random().toString(36).slice(2, 6)}`;
    this.el = kind === 'separator' ? h('hr', { class: 'ssui-separator', role: 'separator' }) : h('p', { class: 'ssui-label' }, [text ?? '']);
  }
  text(t: string): this { this.el.textContent = t; return this; }
  hide(on = true): this { this.el.toggleAttribute('data-ssui-hidden', on); return this; }
  disable(): this { return this; }
  dispose(): void { this.el.remove(); }
}
