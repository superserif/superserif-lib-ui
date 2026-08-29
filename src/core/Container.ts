import { Emitter } from './Emitter';
import { Controller } from './Controller';
import { bindKey, bindPair, bindXY, bindXYObject, structuralEquals, type Binding, type XY } from './Binding';
import { NumberControl, type NumberOptions } from '../controls/NumberControl';
import { SliderControl, type SliderOptions } from '../controls/SliderControl';
import { RangeControl, type RangeOptions } from '../controls/RangeControl';
import { KnobControl, type KnobOptions } from '../controls/KnobControl';
import { Pad2DControl, type Pad2DOptions } from '../controls/Pad2DControl';
import { ToggleControl, type ToggleOptions } from '../controls/ToggleControl';
import { SelectControl, type SelectOptions } from '../controls/SelectControl';
import { ColorControl, type ColorOptions, type ColorValue } from '../controls/ColorControl';
import { TextControl, type TextOptions } from '../controls/TextControl';
import { ButtonControl, type ButtonSpec, type ButtonOptions } from '../controls/ButtonControl';
import { CurveControl, type CurveOptions, type CurveValue } from '../controls/CurveControl';
import { MonitorControl, type MonitorOptions } from '../controls/MonitorControl';
import { StaticControl } from '../controls/StaticControl';
import { MenuControl, type MenuItem, type MenuOptions } from '../controls/MenuControl';
import { MixerControl, type MixerOptions, type MixerValue } from '../controls/MixerControl';
import { PadBankControl, type PadBankOptions, type PadBankValue } from '../controls/PadBankControl';

/** anything a container can hold: value controls, buttons, statics, preset bars, folders */
export interface ChildLike {
  readonly el: HTMLElement;
  readonly id: string;
  dispose(): void;
  disable?(on?: boolean): unknown;
  hide?(on?: boolean): unknown;
}
export type AnyControl = Controller<any, any> | ButtonControl | StaticControl;
export type Child = ChildLike;

export interface AddOptions extends NumberOptions, ToggleOptions, TextOptions, Partial<Pick<SelectOptions<any>, 'options' | 'preview' | 'previewAnimate'>>, Partial<Pick<ColorOptions, 'alpha' | 'format'>> {
  color?: boolean;
}

/** Shared by Panel and Folder: owns children, ids, serialization. */
export type ContainerEvents = {
  add: [Child]; remove: [Child]; reorder: [Child, number]; dispose: [];
  change: [Controller<any, any>, unknown]; finish: [Controller<any, any>, unknown];
  /** Folder: title changed by the user */
  rename: [string];
  /** Folder: solo toggled */
  solo: [boolean];
  /** Folder: the user asked to remove this block (via its context menu) */
  'remove-request': [];
  /** Panel: soloed block changed (null = none) */
  'panel-solo': [Container | null];
};

export abstract class Container extends Emitter<ContainerEvents> {
  readonly children: Child[] = [];
  abstract readonly el: HTMLElement;
  protected abstract readonly bodyEl: HTMLElement;
  protected parent: Container | null = null;
  private ids = new Set<string>();

  protected attach<C extends Child>(c: C): C {
    if (c instanceof Container) {
      c.parent = this;
      c.on('change', (ctrl, v) => this.emit('change', ctrl, v));
      c.on('finish', (ctrl, v) => this.emit('finish', ctrl, v));
    } else if (c instanceof Controller) {
      c.on('change', (v) => this.emit('change', c, v));
      c.on('finish', (v) => this.emit('finish', c, v));
    }
    this.children.push(c);
    this.bodyEl.append(c.el);
    this.emit('add', c);
    this.onChildrenChanged();
    return c;
  }
  protected onChildrenChanged(): void { /* Folder updates its count */ }

  remove(c: Child): void {
    const i = this.children.indexOf(c);
    if (i === -1) return;
    this.children.splice(i, 1);
    c.dispose();
    this.emit('remove', c);
    this.onChildrenChanged();
  }

  /** move a child to a new index (DOM + children array); emits 'reorder' */
  move(c: Child, index: number): void {
    const i = this.children.indexOf(c);
    if (i === -1) return;
    const n = this.children.length;
    const target = Math.max(0, Math.min(n - 1, index));
    if (target === i) return;
    this.children.splice(i, 1);
    this.children.splice(target, 0, c);
    const next = this.children[target + 1];
    if (next) this.bodyEl.insertBefore(c.el, next.el); else this.bodyEl.append(c.el);
    this.emit('reorder', c, target);
  }
  /** current order as ids (persist it, then restore with setOrder) */
  order(): string[] { return this.children.map(c => c.id); }
  setOrder(ids: string[]): void {
    ids.forEach((id, i) => { const c = this.children.find(ch => ch.id === id); if (c) this.move(c, i); });
  }

  /** the root Panel */
  get root(): Container { let c: Container = this; while (c.parent) c = c.parent; return c; }

  // ---- generic add with type inference ----------------------------------
  add(target: object, key: string, opts: AddOptions = {}): Controller<any, any> {
    const v = (target as any)[key];
    const base = { label: key, ...opts };
    if (typeof v === 'number') {
      return opts.min !== undefined && opts.max !== undefined
        ? this.addSlider(target, key, base as SliderOptions)
        : this.addNumber(target, key, base);
    }
    if (typeof v === 'boolean') return this.addToggle(target, key, base);
    if (typeof v === 'function') return this.addButton(base.label ?? key, () => v.call(target)) as unknown as Controller<any, any>;
    if (opts.options) return this.addSelect(target, key, { ...base, options: opts.options } as SelectOptions<any>);
    if (opts.color || (typeof v === 'string' && /^#([0-9a-f]{3,8})$/i.test(v))) return this.addColor(target, key, base);
    if (typeof v === 'string') return this.addText(target, key, base);
    if (Array.isArray(v) && v.length === 2 && typeof v[0] === 'number' && typeof v[1] === 'number' && opts.min !== undefined && opts.max !== undefined) {
      return this.addRange(target, key, base as RangeOptions);
    }
    if (v && typeof v === 'object') {
      if ('type' in v && 'points' in v) return this.addCurve(target, key, base as CurveOptions);
      if (typeof v.x === 'number' && typeof v.y === 'number') return this.addPad2D(target, key, base as Pad2DOptions);
      if ('r' in v && 'g' in v && 'b' in v) return this.addColor(target, key, base);
    }
    throw new Error(`[ssui] cannot infer a control for "${key}" (${typeof v})`);
  }

  addNumber(target: object, key: string, opts: NumberOptions = {}): NumberControl {
    return this.attach(new NumberControl(bindKey<number>(target, key), { label: key, ...opts }));
  }
  addSlider(target: object, key: string, opts: SliderOptions): SliderControl {
    return this.attach(new SliderControl(bindKey<number>(target, key), { label: key, ...opts }));
  }
  /** two-thumb slider for a [lo, hi] pair: addRange(obj, 'band', { min: 0, max: 100 }) with obj.band = [20, 80] */
  addRange(target: object, key: string, opts: RangeOptions): RangeControl {
    return this.attach(new RangeControl(bindPair(target, key), { label: key, ...opts }));
  }
  addKnob(target: object, key: string, opts: KnobOptions = {}): KnobControl {
    return this.attach(new KnobControl(bindKey<number>(target, key), { label: key, ...opts }));
  }
  /** addPad2D(obj, 'offset') for {x,y} objects, or addPad2D(obj, 'x', 'y', opts) for two keys */
  addPad2D(target: object, key: string, yKeyOrOpts?: string | Pad2DOptions, maybeOpts?: Pad2DOptions): Pad2DControl {
    const twoKeys = typeof yKeyOrOpts === 'string';
    const b: Binding<XY> = twoKeys ? bindXY(target, key, yKeyOrOpts) : bindXYObject(target, key);
    const opts = (twoKeys ? maybeOpts : yKeyOrOpts) ?? {};
    return this.attach(new Pad2DControl(b, { label: twoKeys ? `${key} / ${yKeyOrOpts}` : key, ...opts }));
  }
  addToggle(target: object, key: string, opts: ToggleOptions = {}): ToggleControl {
    return this.attach(new ToggleControl(bindKey<boolean>(target, key), { label: key, ...opts }));
  }
  addSelect<T = any>(target: object, key: string, opts: SelectOptions<T>): SelectControl<T> {
    return this.attach(new SelectControl<T>(bindKey<T>(target, key), { label: key, ...opts }));
  }
  addColor(target: object, key: string, opts: ColorOptions = {}): ColorControl {
    return this.attach(new ColorControl(bindKey<ColorValue>(target, key, structuralEquals), { label: key, ...opts }));
  }
  addText(target: object, key: string, opts: TextOptions = {}): TextControl {
    return this.attach(new TextControl(bindKey<string>(target, key), { label: key, ...opts }));
  }
  addButton(label: string, onClick: () => void, opts: ButtonOptions = {}): ButtonControl {
    return this.attach(new ButtonControl([{ label, onClick, ...opts }]));
  }
  addButtons(specs: ButtonSpec[], rowLabel?: string): ButtonControl {
    return this.attach(new ButtonControl(specs, rowLabel));
  }
  addCurve(target: object, key: string, opts: CurveOptions = {}): CurveControl {
    return this.attach(new CurveControl(bindKey<CurveValue>(target, key, structuralEquals), { label: key, ...opts }));
  }
  addMonitor(target: object, key: string, opts: MonitorOptions = {}): MonitorControl {
    return this.attach(new MonitorControl(bindKey<unknown>(target, key), { label: key, ...opts }));
  }
  addMenu(label: string, items: MenuItem[], opts: MenuOptions = {}): MenuControl { return this.attach(new MenuControl(label, items, opts)); }
  addMixer(target: object, key: string, opts: MixerOptions = {}): MixerControl {
    return this.attach(new MixerControl(bindKey<MixerValue>(target, key, structuralEquals), { label: key, ...opts }));
  }
  /** square on/off pads, one per key of the bound object: addPads(S, 'pads') with S.pads = { amp: true, freq: false } */
  addPads(target: object, key: string, opts: PadBankOptions = {}): PadBankControl {
    return this.attach(new PadBankControl(bindKey<PadBankValue>(target, key, structuralEquals), { label: key, ...opts }));
  }
  addSeparator(): StaticControl { return this.attach(new StaticControl('separator')); }
  addLabel(text: string): StaticControl { return this.attach(new StaticControl('label', text)); }

  // ---- lookup -------------------------------------------------------------
  /** deep lookup by id or 'folder/id' path */
  get(path: string): Child | undefined {
    const [head, ...rest] = path.split('/');
    const c = this.children.find(ch => ch.id === head);
    if (!c) return undefined;
    return rest.length ? (c instanceof Container ? c.get(rest.join('/')) : undefined) : c;
  }
  /** flat list of value controllers, deep */
  controllers(): Controller<any, any>[] {
    const out: Controller<any, any>[] = [];
    for (const c of this.children) {
      if (c instanceof Container) out.push(...c.controllers());
      else if (c instanceof Controller) out.push(c);
    }
    return out;
  }
  folders(): Container[] { return this.children.filter((c): c is Container => c instanceof Container); }

  /** registers an id, deduping with -2, -3 … */
  registerId(id: string): string {
    let out = id, n = 2;
    while (this.ids.has(out)) out = `${id}-${n++}`;
    this.ids.add(out);
    return out;
  }

  disable(on = true): this { this.children.forEach(c => c.disable?.(on)); return this; }
  hide(on = true): this { this.el.toggleAttribute('data-ssui-hidden', on); return this; }
  show(): this { return this.hide(false); }
  reset(): this { this.controllers().forEach(c => c.reset()); return this; }
  /** pull every binding into the DOM now (after writing to the target object without listen()) */
  refresh(): this { this.controllers().forEach(c => c.refresh()); return this; }
  onChange(cb: (ctrl: Controller<any, any>, value: unknown) => void): this { this.on('change', cb); return this; }
  onFinishChange(cb: (ctrl: Controller<any, any>, value: unknown) => void): this { this.on('finish', cb); return this; }

  // ---- serialization ------------------------------------------------------
  toJSON(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const c of this.children) {
      if (c instanceof Container) { for (const [k, v] of Object.entries(c.toJSON())) out[`${c.id}/${k}`] = v; }
      else if (c instanceof Controller && c.serializable) out[c.id] = c.toJSON();
    }
    return out;
  }
  fromJSON(data: Record<string, unknown>, opts: { silent?: boolean } = {}): void {
    const missing: string[] = [];
    for (const [path, v] of Object.entries(data)) {
      const c = this.get(path);
      if (c instanceof Controller) { try { c.fromJSON(v as never); } catch { missing.push(path); } }
      else missing.push(path);
    }
    if (missing.length && !opts.silent) console.warn(`[ssui] preset: skipped ${missing.length} value(s): ${missing.join(', ')}`);
  }

  abstract get id(): string;

  dispose(): void {
    for (const c of this.children.splice(0)) c.dispose();
    this.el.remove();
    this.emit('dispose');
    this.clear();
  }
}
