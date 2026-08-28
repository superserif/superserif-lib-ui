import { Emitter } from './Emitter';
import type { Binding } from './Binding';
import { Scheduler, type Schedulable } from './Scheduler';
import { h, uid, slug } from './dom';

export interface BaseOptions {
  id?: string;
  label?: string;
  disabled?: boolean;
  hidden?: boolean;
  listen?: boolean;
}

export type ControllerEvents<T> = { change: [T]; finish: [T]; dispose: []; state: [string] };
export type RowState = 'idle' | 'dragging' | 'editing' | 'open';

/**
 * Base for every value control. Value flow:
 *   user input -> setValue(v, commit) -> sanitize -> binding.write -> emit('change') sync
 *              -> Scheduler.request(this) -> flush() -> update(v) (DOM, once per frame)
 */
export abstract class Controller<T, O extends BaseOptions = BaseOptions> extends Emitter<ControllerEvents<T>> implements Schedulable {
  readonly el: HTMLElement;
  readonly id: string;
  readonly initial: T;
  protected labelEl: HTMLElement;
  protected controlEl: HTMLElement;
  protected last!: T;
  protected cleanups: (() => void)[] = [];
  protected unlisten: (() => void) | null = null;
  protected _state: RowState = 'idle';
  protected inputId = uid('ssui-in');
  /** subclasses set true when the row should stack label above control */
  protected stacked = false;
  /** serializable in presets (Buttons/Monitors set false) */
  readonly serializable: boolean = true;

  constructor(protected binding: Binding<T>, protected opts: O, kind: string) {
    super();
    this.id = opts.id ?? slug(opts.label ?? binding.key ?? kind);
    this.initial = this.clone(binding.read());
    this.labelEl = h('label', { class: 'ssui-row__label', for: this.inputId, id: `${this.inputId}-label` }, [opts.label ?? binding.key ?? kind]);
    this.controlEl = h('div', { class: 'ssui-row__control' });
    this.el = h('div', { class: `ssui-row ssui-row--${kind}`, 'data-ssui-id': this.id, 'data-ssui-state': 'idle' }, [this.labelEl, this.controlEl]);
  }

  /** call at the end of subclass constructors */
  protected mount(): void {
    if (this.stacked) this.el.classList.add('ssui-row--stack');
    this.controlEl.append(this.render());
    this.last = this.clone(this.binding.read());
    this.update(this.last);
    if (this.opts.disabled) this.disable(true);
    if (this.opts.hidden) this.hide(true);
    if (this.opts.listen) this.listen(true);
  }

  protected abstract render(): HTMLElement;
  protected abstract update(v: T): void;
  protected sanitize(v: T): T { return v; }
  protected clone(v: T): T { return (v !== null && typeof v === 'object') ? JSON.parse(JSON.stringify(v)) as T : v; }
  /** canvas controls override to redraw with new tokens */
  onThemeChange(): void { /* noop */ }

  get value(): T { return this.binding.read(); }
  set value(v: T) { this.setValue(v, true); }

  protected setValue(v: T, commit = false): void {
    const s = this.sanitize(v);
    const cur = this.binding.read();
    const changed = !this.binding.equals(s, cur);
    if (changed) { this.binding.write(s); this.emit('change', this.binding.read()); }
    Scheduler.request(this);
    if (commit) this.emit('finish', this.binding.read());
  }

  flush(): void { const v = this.binding.read(); this.last = this.clone(v); this.update(v); }
  poll(): void {
    if (this._state === 'dragging' || this._state === 'editing') return;
    const v = this.binding.read();
    if (!this.binding.equals(v, this.last)) this.flush();
  }

  protected setState(s: RowState): void {
    if (this._state === s) return;
    this._state = s;
    this.el.setAttribute('data-ssui-state', s);
    const panel = this.el.closest('.ssui-panel');
    if (panel) {
      const live = panel.querySelectorAll('.ssui-row[data-ssui-state="dragging"],.ssui-row[data-ssui-state="editing"]').length > 0;
      if (live) panel.setAttribute('data-ssui-live', ''); else panel.removeAttribute('data-ssui-live');
    }
    this.emit('state', s);
  }
  get state(): RowState { return this._state; }

  label(text: string): this { this.labelEl.textContent = text; return this; }
  onChange(cb: (v: T) => void): this { this.on('change', cb); return this; }
  onFinishChange(cb: (v: T) => void): this { this.on('finish', cb); return this; }
  listen(on = true): this {
    if (on && !this.unlisten) { this.unlisten = Scheduler.listen(this); this.el.setAttribute('data-ssui-listening', ''); }
    if (!on && this.unlisten) { this.unlisten(); this.unlisten = null; this.el.removeAttribute('data-ssui-listening'); }
    return this;
  }
  bind(binding: Binding<T>): this { this.binding = binding; this.refresh(); return this; }
  disable(on = true): this { this.el.toggleAttribute('data-ssui-disabled', on); this.controlEl.querySelectorAll('[tabindex],input,button').forEach(e => on ? e.setAttribute('aria-disabled', 'true') : e.removeAttribute('aria-disabled')); return this; }
  enable(): this { return this.disable(false); }
  hide(on = true): this { this.el.toggleAttribute('data-ssui-hidden', on); return this; }
  show(): this { return this.hide(false); }
  refresh(): this { this.flush(); return this; }
  reset(): this { this.setValue(this.clone(this.initial), true); return this; }
  toJSON(): T { return this.clone(this.binding.read()); }
  fromJSON(v: T): void { this.setValue(v, false); }

  dispose(): void {
    this.listen(false);
    Scheduler.unlisten(this);
    for (const c of this.cleanups.splice(0)) c();
    this.el.remove();
    this.emit('dispose');
    this.clear();
  }
}
