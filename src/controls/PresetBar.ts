import { h, icons } from '../core/dom';
import type { Panel } from './Panel';
import { DEFAULT_PRESET, type PresetStore } from '../presets/PresetStore';

export interface PresetBarOptions { allowDelete?: boolean; allowExport?: boolean; includeDefault?: boolean }

interface MenuItem { label: string; onPick: () => void; danger?: boolean; confirm?: boolean; hidden?: boolean; selected?: boolean; index?: string }

/** popover menu reusing the .ssui-select look; keyboard: arrows / Home / End / Enter / Escape */
class Menu {
  readonly el: HTMLUListElement;
  private items: MenuItem[] = [];
  private lis: HTMLLIElement[] = [];
  private active = -1;
  private confirmTimer = 0;
  private confirming = -1;
  constructor(private wrap: HTMLElement, private trigger: HTMLElement, private role: 'listbox' | 'menu', private onOpen?: () => void) {
    this.el = h('ul', { class: 'ssui-select__menu', role, tabindex: -1 });
    wrap.append(this.el);
    trigger.addEventListener('click', (e) => { e.stopPropagation(); this.isOpen ? this.close() : this.open(); });
    trigger.addEventListener('keydown', (e) => this.key(e));
    this.el.addEventListener('keydown', (e) => this.key(e));
  }
  set(items: MenuItem[]): void {
    this.items = items.filter(i => !i.hidden);
    this.el.replaceChildren();
    this.lis = this.items.map((it, i) => {
      const li = h('li', { class: 'ssui-select__option', role: this.role === 'listbox' ? 'option' : 'menuitem', 'aria-selected': this.role === 'listbox' ? String(!!it.selected) : null, 'data-ssui-danger': it.danger || null }, [
        h('span', { class: 'ssui-presets__option-text' }, [it.label]),
        it.index !== undefined ? h('span', { class: 'ssui-select__option-index' }, [it.index]) : (it.selected ? icons.check() : null),
      ]);
      li.style.setProperty('--i', String(i));
      li.addEventListener('pointerenter', () => this.setActive(i));
      li.addEventListener('click', (e) => { e.stopPropagation(); this.pick(i); });
      return li;
    });
    this.el.append(...this.lis);
  }
  get isOpen(): boolean { return this.wrap.hasAttribute('data-ssui-open'); }
  open(): void {
    if (this.isOpen) return;
    this.onOpen?.();   // rebuild items: another panel on the same storage key may have saved
    this.wrap.setAttribute('data-ssui-open', ''); this.trigger.setAttribute('aria-expanded', 'true');
    this.setActive(Math.max(0, this.items.findIndex(i => i.selected)));
    this.el.focus({ preventScroll: true });
  }
  close(refocus = false): void {
    if (!this.isOpen) return;
    this.wrap.removeAttribute('data-ssui-open'); this.trigger.setAttribute('aria-expanded', 'false');
    this.resetConfirm();
    if (refocus) this.trigger.focus();
  }
  private setActive(i: number): void { this.active = i; this.lis.forEach((li, j) => li.toggleAttribute('data-ssui-active', j === i)); }
  private resetConfirm(): void {
    clearTimeout(this.confirmTimer);
    if (this.confirming >= 0 && this.lis[this.confirming]) this.lis[this.confirming].querySelector('.ssui-presets__option-text')!.textContent = this.items[this.confirming].label;
    this.confirming = -1;
  }
  private pick(i: number): void {
    const it = this.items[i]; if (!it) return;
    if (it.confirm && this.confirming !== i) {
      this.resetConfirm();
      this.confirming = i;
      this.lis[i].querySelector('.ssui-presets__option-text')!.textContent = `${it.label}?`;
      this.confirmTimer = window.setTimeout(() => this.resetConfirm(), 2000);
      return;
    }
    this.resetConfirm();
    this.close(true);
    it.onPick();
  }
  private key(e: KeyboardEvent): void {
    const n = this.items.length;
    if (!this.isOpen) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); this.open(); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); this.setActive((this.active + 1) % n); break;
      case 'ArrowUp': e.preventDefault(); this.setActive((this.active - 1 + n) % n); break;
      case 'Home': e.preventDefault(); this.setActive(0); break;
      case 'End': e.preventDefault(); this.setActive(n - 1); break;
      case 'Enter': case ' ': e.preventDefault(); this.pick(this.active); break;
      case 'Escape': e.preventDefault(); this.close(true); break;
      case 'Tab': this.close(); break;
    }
  }
}

/**
 * Preset bar: pick / save / more. Placed with `panel.addPresets()`.
 * Order of operations for defaults: the store snapshots "Default" in a microtask
 * after the panel is built, so add your controls synchronously after `new Panel()`;
 * anything added later is merged into the defaults with its value at add time.
 */
export class PresetBar {
  readonly el: HTMLElement;
  readonly id = 'presets';
  readonly serializable = false;
  private store: PresetStore;
  private nameEl: HTMLElement;
  private dirtyEl: HTMLElement;
  private input: HTMLInputElement;
  private pick: Menu;
  private more: Menu;
  private saveBtn: HTMLButtonElement;
  private fileInput: HTMLInputElement;
  private editMode: 'save' | 'rename' | null = null;
  private offs: (() => void)[] = [];
  private liveTimer = 0;
  private copiedTimer = 0;

  constructor(readonly panel: Panel, readonly opts: PresetBarOptions = {}) {
    this.store = panel.presets;

    // --- picker ---
    this.nameEl = h('span', { class: 'ssui-select__current ssui-presets__name' });
    this.dirtyEl = h('span', { class: 'ssui-presets__dirty', 'aria-hidden': 'true' }, ['*']);
    const chev = icons.chevron(); chev.classList.add('ssui-select__chevron');
    const trigger = h('button', { class: 'ssui-select__trigger ssui-presets__trigger', type: 'button', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': 'Preset' }, [this.nameEl, this.dirtyEl, chev]);
    this.input = h('input', { class: 'ssui-presets__input', type: 'text', name: 'ssui-preset-name', 'aria-label': 'Preset name', autocomplete: 'off', spellcheck: 'false', tabindex: -1 });
    const pickWrap = h('div', { class: 'ssui-select ssui-presets__pick' }, [trigger, this.input]);
    this.pick = new Menu(pickWrap, trigger, 'listbox', () => this.refresh());

    // --- actions ---
    this.saveBtn = h('button', { class: 'ssui-button ssui-button--ghost ssui-presets__save', type: 'button' }, ['Save']);
    this.saveBtn.addEventListener('click', () => this.onSave());
    const moreBtn = h('button', { class: 'ssui-button ssui-button--ghost ssui-button--icon', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': 'More preset actions' }, [icons.more()]);
    const moreWrap = h('div', { class: 'ssui-select ssui-presets__more' }, [moreBtn]);
    this.more = new Menu(moreWrap, moreBtn, 'menu', () => this.refresh());
    this.fileInput = h('input', { type: 'file', accept: 'application/json,.json', class: 'ssui-presets__file', tabindex: -1, 'aria-hidden': 'true' });
    this.fileInput.addEventListener('change', () => this.onImportFile());

    this.el = h('div', { class: 'ssui-presets', 'data-ssui-id': this.id, role: 'group', 'aria-label': 'Presets' }, [
      h('span', { class: 'ssui-presets__label' }, ['presets']),
      pickWrap,
      h('div', { class: 'ssui-presets__actions' }, [this.saveBtn, moreWrap, this.fileInput]),
    ]);

    // --- inline name editing ---
    this.input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); this.commitEdit(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.cancelEdit(); }
    });
    this.input.addEventListener('blur', () => { if (this.editMode) this.commitEdit(); });

    // --- outside click closes menus ---
    const outside = (e: PointerEvent): void => { if (!this.el.contains(e.target as Node)) { this.pick.close(); this.more.close(); } };
    document.addEventListener('pointerdown', outside, true);
    this.offs.push(() => document.removeEventListener('pointerdown', outside, true));

    // --- store events ---
    this.offs.push(this.store.on('change', () => this.refresh()));
    this.offs.push(this.store.on('dirty', () => this.refresh()));
    this.offs.push(this.store.on('save', () => this.swapName()));
    this.offs.push(this.store.on('load', () => { this.swapName(); this.pulse(); }));
    this.offs.push(this.store.on('remove', () => this.swapName()));

    queueMicrotask(() => { this.store.captureDefaults(); this.refresh(); });
    this.refresh();
  }

  // ---- rendering ----------------------------------------------------------
  private refresh(): void {
    const cur = this.store.current;
    const dirty = this.store.dirty;
    this.nameEl.textContent = cur ?? DEFAULT_PRESET;
    this.dirtyEl.toggleAttribute('data-ssui-on', dirty);
    this.el.toggleAttribute('data-ssui-dirty', dirty);
    this.saveBtn.textContent = cur ? 'Save' : 'Save as';
    this.saveBtn.title = cur ? `Overwrite “${cur}”` : 'Save current values as a new preset';

    const list = this.store.list();
    const items: MenuItem[] = [];
    if (this.opts.includeDefault !== false) items.push({ label: DEFAULT_PRESET, selected: cur === null, onPick: () => this.store.applyDefault() });
    list.forEach((p, i) => items.push({ label: p.name, selected: cur === p.name, index: String(i + 1).padStart(2, '0'), onPick: () => this.store.load(p.name) }));
    this.pick.set(items);

    const isUser = cur !== null;
    this.more.set([
      { label: 'Save as…', onPick: () => this.startEdit('save') },
      { label: 'Rename…', hidden: !isUser, onPick: () => this.startEdit('rename') },
      { label: 'Delete', hidden: !isUser || this.opts.allowDelete === false, danger: true, confirm: true, onPick: () => this.store.remove(cur!) },
      { label: 'Export JSON', hidden: this.opts.allowExport === false, onPick: () => this.exportFile() },
      { label: 'Import JSON', hidden: this.opts.allowExport === false, onPick: () => this.fileInput.click() },
      { label: 'Copy JSON', onPick: () => this.copy() },
    ]);
  }

  /** the one micro-interaction: the name cross-fades in (4px rise) */
  private swapName(): void {
    this.refresh();
    this.nameEl.removeAttribute('data-ssui-swap'); void this.nameEl.offsetWidth; this.nameEl.setAttribute('data-ssui-swap', '');
  }
  /** header dot pulses once on load */
  private pulse(): void {
    const root = this.panel.el;
    root.setAttribute('data-ssui-live', '');
    clearTimeout(this.liveTimer);
    this.liveTimer = window.setTimeout(() => {
      if (!root.querySelector('[data-ssui-state="dragging"],[data-ssui-state="editing"]')) root.removeAttribute('data-ssui-live');
    }, 400);
  }

  // ---- actions ------------------------------------------------------------
  private onSave(): void {
    const cur = this.store.current;
    if (cur) { this.store.save(cur); return; }
    this.startEdit('save');
  }
  private startEdit(mode: 'save' | 'rename'): void {
    this.editMode = mode;
    this.el.setAttribute('data-ssui-editing', '');
    const list = this.store.list();
    this.input.value = mode === 'rename' ? (this.store.current ?? '') : this.nextName(list.map(p => p.name));
    this.input.focus(); this.input.select();
  }
  private nextName(names: string[]): string {
    let n = names.length + 1, name = `Preset ${n}`;
    while (names.includes(name)) name = `Preset ${++n}`;
    return name;
  }
  private commitEdit(): void {
    const mode = this.editMode; if (!mode) return;
    this.editMode = null; this.el.removeAttribute('data-ssui-editing');
    const name = this.input.value.trim();
    if (!name || name === DEFAULT_PRESET) { this.refresh(); return; }
    try {
      if (mode === 'save') this.store.save(name);
      else if (this.store.current) this.store.rename(this.store.current, name);
    } catch (e) { console.warn(e); }
    this.refresh();
  }
  private cancelEdit(): void { this.editMode = null; this.el.removeAttribute('data-ssui-editing'); this.refresh(); }

  private exportFile(): void {
    const blob = new Blob([this.store.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: `${this.panel.id}-presets.json` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  private onImportFile(): void {
    const f = this.fileInput.files?.[0]; if (!f) return;
    f.text().then((t) => { try { this.store.importJSON(t, { merge: true }); } catch (e) { console.warn(e); } }).finally(() => { this.fileInput.value = ''; });
  }
  private copy(): void {
    const json = this.store.exportJSON();
    const done = (): void => {
      this.el.setAttribute('data-ssui-copied', '');
      clearTimeout(this.copiedTimer);
      this.copiedTimer = window.setTimeout(() => this.el.removeAttribute('data-ssui-copied'), 1200);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(json).then(done, done);
    else { const ta = h('textarea', {}, [json]); document.body.append(ta); ta.select(); try { document.execCommand('copy'); } catch { /* noop */ } ta.remove(); done(); }
  }

  // ---- ChildLike ----------------------------------------------------------
  disable(on = true): this { this.el.toggleAttribute('data-ssui-disabled', on); return this; }
  hide(on = true): this { this.el.toggleAttribute('data-ssui-hidden', on); return this; }
  dispose(): void { for (const off of this.offs.splice(0)) off(); clearTimeout(this.liveTimer); clearTimeout(this.copiedTimer); this.el.remove(); }
}
