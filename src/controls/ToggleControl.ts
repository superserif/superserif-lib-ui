import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h } from '../core/dom';

export interface ToggleOptions extends BaseOptions { indicator?: boolean }

export class ToggleControl extends Controller<boolean, ToggleOptions> {
  private btn!: HTMLButtonElement;
  private pulseTimer = 0;

  constructor(binding: Binding<boolean>, opts: ToggleOptions = {}) {
    super(binding, opts, 'toggle');
    this.mount();
  }

  protected render(): HTMLElement {
    this.btn = h('button', { class: 'ssui-toggle', type: 'button', role: 'switch', id: this.inputId, 'aria-labelledby': `${this.inputId}-label`, 'aria-checked': 'false' }, [
      h('span', { class: 'ssui-toggle__track' }, [h('span', { class: 'ssui-toggle__thumb' })]),
      this.opts.indicator === false ? null : h('span', { class: 'ssui-toggle__dot', 'aria-hidden': 'true' }),
    ]);
    this.btn.addEventListener('click', () => this.toggle());
    return this.btn;
  }

  toggle(): void {
    this.setValue(!this.binding.read(), true);
    if (this.binding.read()) {
      this.btn.setAttribute('data-ssui-pulse', '');
      clearTimeout(this.pulseTimer);
      this.pulseTimer = window.setTimeout(() => this.btn.removeAttribute('data-ssui-pulse'), 500);
    }
  }

  protected sanitize(v: boolean): boolean { return !!v; }
  protected update(v: boolean): void { this.btn.setAttribute('aria-checked', String(!!v)); }
}
