import { Container } from '../core/Container';
import { h, icons, uid, slug } from '../core/dom';

export interface FolderOptions {
  collapsed?: boolean;
  id?: string;
  /** show the number of controls in the header (off by default) */
  count?: boolean;
  /** 'grid' lays children side by side (knob banks); columns default 3 */
  layout?: 'list' | 'grid';
  columns?: number;
  /** double-click the header to rename (emits 'rename') */
  renamable?: boolean;
  /** right-click menu with Rename / Remove (Remove emits 'remove-request'; the parent removes) */
  contextMenu?: boolean;
  /** SOLO pill on hover: only this block "plays"; the panel dims the others (emits 'solo') */
  soloable?: boolean;
}

export class Folder extends Container {
  readonly el: HTMLElement;
  protected readonly bodyEl: HTMLElement;
  private _id: string;
  private header: HTMLButtonElement;
  private countEl: HTMLElement;
  private titleEl: HTMLElement;
  private gripEl: HTMLElement;
  private soloBtn: HTMLButtonElement | null = null;
  private menuEl: HTMLElement | null = null;
  private opts: FolderOptions;

  constructor(title: string, opts: FolderOptions = {}) {
    super();
    this.opts = opts;
    this._id = opts.id ?? slug(title);
    const bodyId = uid('ssui-folder');
    this.titleEl = h('span', { class: 'ssui-folder__title' }, [title]);
    this.countEl = h('span', { class: 'ssui-folder__count', 'aria-hidden': 'true' });
    const chev = h('span', { class: 'ssui-folder__chevron' }, [icons.chevron()]);
    this.gripEl = h('span', { class: 'ssui-folder__grip', 'aria-hidden': 'true' }, [icons.grip()]);
    this.header = h('button', { class: 'ssui-folder__header', type: 'button', 'aria-expanded': 'true', 'aria-controls': bodyId }, [this.gripEl, this.titleEl, opts.count ? this.countEl : null, chev]);
    this.bodyEl = h('div', { class: 'ssui-folder__body', id: bodyId, role: 'group', 'aria-label': title });
    this.el = h('div', { class: 'ssui-folder', 'data-ssui-id': this._id }, [this.header, h('div', { class: 'ssui-folder__clip' }, [this.bodyEl])]);
    this.header.addEventListener('click', (e) => {
      if (this.el.hasAttribute('data-ssui-dragged') || this.isRenaming) return;
      if ((e.target as HTMLElement).closest('.ssui-folder__solo')) return;
      this.toggle();
    });
    if (opts.collapsed) this.collapsed = true;
    if (opts.layout === 'grid') { this.el.setAttribute('data-ssui-layout', 'grid'); this.el.style.setProperty('--ssui-folder-cols', String(opts.columns ?? 3)); }
    this.setEditable(opts);
  }

  /** (re)wire rename / context menu / solo — Panel calls this with its `editable` defaults */
  setEditable(o: Pick<FolderOptions, 'renamable' | 'contextMenu' | 'soloable'>): void {
    if (o.renamable && !this.el.hasAttribute('data-ssui-renamable')) {
      this.el.setAttribute('data-ssui-renamable', '');
      this.header.addEventListener('dblclick', (e) => { e.preventDefault(); this.rename(); });
    }
    if (o.contextMenu && !this.el.hasAttribute('data-ssui-contextmenu')) {
      this.el.setAttribute('data-ssui-contextmenu', '');
      this.el.addEventListener('contextmenu', (e) => {
        // only for this block, not a nested one
        if ((e.target as HTMLElement).closest('.ssui-folder') !== this.el) return;
        e.preventDefault(); this.openMenu(e.clientX, e.clientY);
      });
    }
    if (o.soloable && !this.soloBtn) {
      this.soloBtn = h('button', { class: 'ssui-folder__solo', type: 'button', 'aria-pressed': 'false', title: 'Solo this block' }, ['solo']);
      this.soloBtn.addEventListener('click', (e) => { e.stopPropagation(); this.solo = !this.solo; });
      // a button inside a button is invalid: the header is a button, so the pill sits beside it
      this.el.insertBefore(this.soloBtn, this.header.nextSibling);
      this.el.setAttribute('data-ssui-soloable', '');
    }
  }

  get id(): string { return this._id; }
  /** the element a reorder drag starts from */
  get handle(): HTMLElement { return this.header; }
  get titleText(): string { return this.titleEl.textContent ?? ''; }
  title(t: string): this { this.titleEl.textContent = t; this.bodyEl.setAttribute('aria-label', t); return this; }

  get collapsed(): boolean { return this.el.hasAttribute('data-ssui-collapsed'); }
  set collapsed(v: boolean) { this.el.toggleAttribute('data-ssui-collapsed', v); this.header.setAttribute('aria-expanded', String(!v)); }
  toggle(): void { this.collapsed = !this.collapsed; }
  open(): this { this.collapsed = false; return this; }
  close(): this { this.collapsed = true; return this; }

  // ---- solo ---------------------------------------------------------------
  get solo(): boolean { return this.el.hasAttribute('data-ssui-solo'); }
  set solo(v: boolean) {
    if (v === this.solo) return;
    this.el.toggleAttribute('data-ssui-solo', v);
    this.soloBtn?.setAttribute('aria-pressed', String(v));
    this.emit('solo', v);
  }
  /** dimmed = another block is soloed */
  set dimmed(v: boolean) { this.el.toggleAttribute('data-ssui-dimmed', v); }

  // ---- rename -------------------------------------------------------------
  get isRenaming(): boolean { return this.el.hasAttribute('data-ssui-renaming'); }
  rename(): void {
    if (this.isRenaming) return;
    const input = h('input', { class: 'ssui-folder__rename', type: 'text', value: this.titleText, 'aria-label': 'Rename block', spellcheck: 'false' });
    this.el.setAttribute('data-ssui-renaming', '');
    this.titleEl.replaceWith(input);
    input.focus(); input.select();
    let done = false;
    const finish = (commit: boolean): void => {
      if (done) return; done = true;
      const next = input.value.trim();
      input.replaceWith(this.titleEl);
      this.el.removeAttribute('data-ssui-renaming');
      if (commit && next && next !== this.titleText) { this.title(next); this.emit('rename', next); }
    };
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('pointerdown', (e) => e.stopPropagation());
  }

  // ---- context menu -------------------------------------------------------
  private openMenu(x: number, y: number): void {
    this.closeMenu();
    const items: { label: string; danger?: boolean; run: () => void }[] = [
      { label: this.collapsed ? 'Expand' : 'Collapse', run: () => this.toggle() },
    ];
    if (this.el.hasAttribute('data-ssui-renamable')) items.push({ label: 'Rename', run: () => this.rename() });
    if (this.soloBtn) items.push({ label: this.solo ? 'Unsolo' : 'Solo', run: () => { this.solo = !this.solo; } });
    items.push({ label: 'Remove', danger: true, run: () => this.emit('remove-request') });
    const ul = h('ul', { class: 'ssui-select__menu ssui-folder__menu', role: 'menu' });
    items.forEach((it, i) => {
      const li = h('li', { class: `ssui-select__option${it.danger ? ' ssui-select__option--danger' : ''}`, role: 'menuitem', tabindex: -1 }, [it.label]);
      li.style.setProperty('--i', String(i));
      li.addEventListener('click', (e) => { e.stopPropagation(); this.closeMenu(); it.run(); });
      ul.append(li);
    });
    const r = this.el.getBoundingClientRect();
    ul.style.left = `${Math.max(0, Math.min(x - r.left, r.width - 160))}px`;
    ul.style.top = `${y - r.top}px`;
    this.menuEl = ul;
    this.el.append(ul);
    this.el.setAttribute('data-ssui-menu', '');
    requestAnimationFrame(() => ul.setAttribute('data-ssui-open', ''));
    const outside = (e: Event): void => { if (!ul.contains(e.target as Node)) this.closeMenu(); };
    const key = (e: KeyboardEvent): void => { if (e.key === 'Escape') this.closeMenu(); };
    document.addEventListener('pointerdown', outside, { capture: true, once: true });
    document.addEventListener('keydown', key, { once: true });
    document.addEventListener('scroll', () => this.closeMenu(), { capture: true, once: true });
  }
  private closeMenu(): void { this.menuEl?.remove(); this.menuEl = null; this.el.removeAttribute('data-ssui-menu'); }

  addFolder(title: string, opts: FolderOptions = {}): Folder { return this.attach(new Folder(title, opts)); }

  protected onChildrenChanged(): void {
    const n = this.controllers().length;
    this.countEl.textContent = n ? String(n).padStart(2, '0') : '';
  }
}
