import { Controller, type BaseOptions } from '../core/Controller';
import type { Binding } from '../core/Binding';
import { h } from '../core/dom';

export interface TextOptions extends BaseOptions { placeholder?: string; maxLength?: number; multiline?: boolean }

export class TextControl extends Controller<string, TextOptions> {
  private input!: HTMLInputElement | HTMLTextAreaElement;

  constructor(binding: Binding<string>, opts: TextOptions = {}) {
    super(binding, opts, 'text');
    if (opts.multiline) this.stacked = true;
    this.mount();
  }

  protected render(): HTMLElement {
    const attrs = { class: 'ssui-text__input', id: this.inputId, name: this.id, placeholder: this.opts.placeholder ?? '', maxlength: this.opts.maxLength, 'aria-labelledby': `${this.inputId}-label` };
    this.input = this.opts.multiline ? h('textarea', { ...attrs, rows: 3 }) : h('input', { ...attrs, type: 'text', autocomplete: 'off', spellcheck: 'false' });
    this.input.addEventListener('input', () => this.setValue(this.input.value));
    this.input.addEventListener('focus', () => this.setState('editing'));
    this.input.addEventListener('blur', () => { this.setState('idle'); this.emit('finish', this.binding.read()); });
    this.input.addEventListener('keydown', (ev: Event) => {
      const e = ev as KeyboardEvent;
      e.stopPropagation();
      if (e.key === 'Enter' && !this.opts.multiline) { e.preventDefault(); this.input.blur(); }
      if (e.key === 'Escape') { this.input.value = this.last; this.setValue(this.last); this.input.blur(); }
    });
    return h('div', { class: `ssui-text${this.opts.multiline ? ' ssui-text--multiline' : ''}` }, [this.input]);
  }
  protected sanitize(v: string): string { return String(v ?? ''); }
  protected update(v: string): void { if (this.input.value !== v) this.input.value = v; }
}
