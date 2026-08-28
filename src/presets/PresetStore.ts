import { Emitter } from '../core/Emitter';
import { Controller } from '../core/Controller';
import type { Container } from '../core/Container';
import { localStorageAdapter, memoryAdapter } from './storage';

export interface Preset { name: string; values: Record<string, unknown>; createdAt: number; updatedAt: number }
export interface PresetFile { format: 'ssui-presets'; version: 1; panel: string; presets: Preset[] }
export interface StorageAdapter { get(key: string): string | null; set(key: string, v: string): void; remove(key: string): void }

export const DEFAULT_PRESET = 'Default';

type Events = { change: []; load: [Preset]; save: [Preset]; remove: [string]; dirty: [boolean] };

/** minimal view of a Container the store relies on (lets tests pass a fake) */
export interface PresetHost {
  readonly id: string;
  toJSON(): Record<string, unknown>;
  fromJSON(data: Record<string, unknown>, opts?: { silent?: boolean }): void;
  controllers(): Controller<any, any>[];
  on(ev: 'add', cb: (child: any) => void): () => void;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * Presets = named snapshots of `panel.toJSON()`.
 *
 * Defaults capture: the Panel builds its store before any control exists, so the
 * "Default" snapshot is taken lazily — in a microtask after construction (which
 * lands after the consumer's synchronous `add*` calls), or on the first
 * save/load/applyDefault/dirty check, whichever comes first. Controls added later
 * are merged into the defaults with the value they have when added.
 */
export class PresetStore extends Emitter<Events> {
  current: string | null = null;              // null = Default
  readonly adapter: StorageAdapter;
  private presets: Preset[] = [];
  private defaults: Record<string, unknown> | null = null;
  private loaded: Record<string, unknown> | null = null;
  private lastDirty = false;
  private key: string | null;
  private offs: (() => void)[] = [];
  private seen = new WeakSet<object>();
  private warned = false;

  constructor(readonly panel: Container | PresetHost, readonly storageKey: string | null, adapter?: StorageAdapter) {
    super();
    this.key = storageKey ? `ssui:${storageKey}:presets` : null;
    this.adapter = adapter ?? (this.key ? localStorageAdapter : memoryAdapter());
    this.presets = this.read();
    this.watch(panel as PresetHost);
    if (typeof queueMicrotask === 'function') queueMicrotask(() => this.captureDefaults());
  }

  // ---- defaults -----------------------------------------------------------
  /** snapshot current values as "Default" (idempotent; merges ids added later) */
  captureDefaults(): Record<string, unknown> {
    const now = this.panel.toJSON();
    this.defaults = this.defaults ? { ...now, ...this.defaults } : now;
    if (!this.loaded) this.loaded = this.defaults;
    return this.defaults;
  }
  get hasDefaults(): boolean { return this.defaults !== null; }

  // ---- list ---------------------------------------------------------------
  list(): Preset[] {
    if (this.key) this.presets = this.read();   // other panels on the same key stay in sync
    return this.presets.slice();
  }
  has(name: string): boolean { return this.list().some(p => p.name === name); }
  getPreset(name: string): Preset | undefined { return this.list().find(p => p.name === name); }

  // ---- dirty --------------------------------------------------------------
  get dirty(): boolean {
    if (!this.defaults) return false;
    const base = this.loaded ?? this.defaults;
    return !same(this.panel.toJSON(), base);
  }
  /** recompute and emit when it flips */
  checkDirty(): boolean {
    this.captureDefaults();
    const d = this.dirty;
    if (d !== this.lastDirty) { this.lastDirty = d; this.emit('dirty', d); }
    return d;
  }

  // ---- crud ---------------------------------------------------------------
  save(name: string): Preset {
    name = name.trim();
    if (!name || name === DEFAULT_PRESET) throw new Error(`[ssui] invalid preset name "${name}"`);
    this.captureDefaults();
    const values = this.panel.toJSON();
    const list = this.list();
    const now = Date.now();
    const i = list.findIndex(p => p.name === name);
    const preset: Preset = i >= 0 ? { ...list[i], values, updatedAt: now } : { name, values, createdAt: now, updatedAt: now };
    if (i >= 0) list[i] = preset; else list.push(preset);
    this.presets = list; this.write();
    this.current = name; this.loaded = clone(values);
    this.emit('save', preset); this.emit('change'); this.checkDirty();
    return preset;
  }

  load(name: string | null): void {
    if (name === null || name === DEFAULT_PRESET) { this.applyDefault(); return; }
    const p = this.getPreset(name);
    if (!p) { this.warnOnce(`preset "${name}" not found`); return; }
    this.captureDefaults();
    try { this.panel.fromJSON(clone(p.values), { silent: false }); } catch (e) { this.warnOnce(String(e)); }
    this.current = name; this.loaded = clone(p.values);
    this.emit('load', p); this.checkDirty();
  }

  applyDefault(): void {
    const d = this.captureDefaults();
    try { this.panel.fromJSON(clone(d), { silent: true }); } catch (e) { this.warnOnce(String(e)); }
    this.current = null; this.loaded = d;
    this.emit('load', { name: DEFAULT_PRESET, values: clone(d), createdAt: 0, updatedAt: 0 });
    this.checkDirty();
  }

  remove(name: string): void {
    const list = this.list();
    const i = list.findIndex(p => p.name === name);
    if (i === -1) return;
    list.splice(i, 1); this.presets = list; this.write();
    if (this.current === name) { this.current = null; this.loaded = this.defaults; }
    this.emit('remove', name); this.emit('change'); this.checkDirty();
  }

  rename(from: string, to: string): void {
    to = to.trim();
    if (!to || to === DEFAULT_PRESET || from === to) return;
    const list = this.list();
    const p = list.find(x => x.name === from);
    if (!p) return;
    if (list.some(x => x.name === to)) { this.warnOnce(`preset "${to}" already exists`); return; }
    p.name = to; p.updatedAt = Date.now();
    this.presets = list; this.write();
    if (this.current === from) this.current = to;
    this.emit('change');
  }

  // ---- json ---------------------------------------------------------------
  exportJSON(): string {
    const file: PresetFile = { format: 'ssui-presets', version: 1, panel: this.panel.id, presets: this.list() };
    return JSON.stringify(file, null, 2);
  }

  importJSON(json: string, opts: { merge?: boolean } = {}): number {
    let file: PresetFile;
    try { file = JSON.parse(json); } catch { throw new Error('[ssui] import: invalid JSON'); }
    if (!file || file.format !== 'ssui-presets' || !Array.isArray(file.presets)) throw new Error('[ssui] import: not a ssui-presets file');
    const incoming = file.presets.filter(p => p && typeof p.name === 'string' && p.values && typeof p.values === 'object');
    let list = opts.merge === false ? [] : this.list();
    for (const p of incoming) {
      const i = list.findIndex(x => x.name === p.name);
      const clean: Preset = { name: p.name, values: p.values, createdAt: p.createdAt ?? Date.now(), updatedAt: p.updatedAt ?? Date.now() };
      if (i >= 0) list[i] = clean; else list.push(clean);
    }
    this.presets = list; this.write();
    if (this.current && !list.some(p => p.name === this.current)) { this.current = null; this.loaded = this.defaults; }
    this.emit('change'); this.checkDirty();
    return incoming.length;
  }

  clearAll(): void { this.presets = []; if (this.key) this.adapter.remove(this.key); this.current = null; this.loaded = this.defaults; this.emit('change'); this.checkDirty(); }

  // ---- internals ----------------------------------------------------------
  private read(): Preset[] {
    if (!this.key) return this.presets;
    try { const raw = this.adapter.get(this.key); const arr = raw ? JSON.parse(raw) : []; return Array.isArray(arr) ? arr : []; } catch { return []; }
  }
  private write(): void { if (this.key) this.adapter.set(this.key, JSON.stringify(this.presets)); }

  /** subscribe to `finish` of every controller, present and future, for dirty tracking */
  private watch(host: PresetHost): void {
    const hook = (c: any): void => {
      if (!c || this.seen.has(c)) return;
      this.seen.add(c);
      if (c instanceof Controller) { this.offs.push(c.on('finish', () => this.checkDirty())); return; }
      if (typeof c.on === 'function' && Array.isArray(c.children)) {
        this.offs.push(c.on('add', hook));
        c.children.forEach(hook);
        if (this.defaults) this.captureDefaults();
      }
    };
    if (typeof host.on === 'function') this.offs.push(host.on('add', (child) => { hook(child); if (this.defaults) this.captureDefaults(); }));
    host.controllers?.().forEach(hook);
  }
  private warnOnce(msg: string): void { if (this.warned) return; this.warned = true; console.warn(`[ssui] presets: ${msg}`); }

  dispose(): void { for (const off of this.offs.splice(0)) off(); super.clear(); }
}
