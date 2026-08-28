import { Container } from '../core/Container';
import { Folder, type FolderOptions } from './Folder';
import { Theme, type ThemeMode, type ResolvedTheme } from '../core/Theme';
import { h, icons, isEditable, slug, uid } from '../core/dom';
import { trackPointer } from '../core/pointer';
import { clamp } from '../core/math';
import { PresetStore } from '../presets/PresetStore';
import { PresetBar, type PresetBarOptions } from './PresetBar';
import { makeReorderable } from '../core/reorder';
import { Scheduler } from '../core/Scheduler';

export type PanelPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'static';

export interface PanelOptions {
  title?: string;
  meta?: string;
  container?: HTMLElement;
  position?: PanelPosition;
  width?: number;
  theme?: ThemeMode;
  collapsed?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  /** key toggles collapse; null disables. default 'h' for floating panels, null for position:'static' */
  hotkey?: string | null;
  /** persists geometry + presets under this key */
  storageKey?: string;
  tokens?: Record<string, string>;
  id?: string;
  footer?: boolean | HTMLElement;
  /** folders can be dragged by their header to reorder (persisted with storageKey) */
  reorderable?: boolean;
  /** folders become "modules": double-click renames, right-click offers Rename / Remove, hover shows a SOLO pill */
  editable?: boolean;
  /** live frame rate in the header, next to the collapse chevron */
  fps?: boolean;
  /** footer link on the right (default: superserif.studio "see our work"); false hides it */
  link?: { label: string; href: string } | false;
}

export interface TransportOptions {
  playing?: boolean;
  onToggle?: (playing: boolean) => void;
  onReset?: () => void;
  /** labels, default Play / Pause */
  labels?: [string, string];
}
export interface Transport { playing: boolean; el: HTMLElement; dispose(): void }

const LOGO = '<svg class="ssui-panel__logo" viewBox="0 0 78 16" width="78" height="16" fill="currentColor" aria-label="superserif"><path d="M22.9082 3.7627C23.5931 3.75668 24.2639 3.95631 24.834 4.33594C25.4311 4.73889 25.9082 5.29596 26.2139 5.94824C26.5542 6.6403 26.7246 7.45836 26.7246 8.40234C26.7246 9.33403 26.5571 10.147 26.2227 10.8398C25.9239 11.4914 25.4487 12.0468 24.8516 12.4434C24.2736 12.819 23.5975 13.0156 22.9082 13.0078C22.3284 13.0062 21.7584 12.8576 21.251 12.5771C20.7426 12.3136 20.327 11.9009 20.0596 11.3945V16H17.9092V3.99512H20.0059V5.375C20.2743 4.85582 20.7006 4.43556 21.2236 4.1748C21.7438 3.90421 22.3219 3.76285 22.9082 3.7627ZM10.7393 9.24512C10.7393 10.7502 11.2775 11.5029 12.3525 11.5029C12.6286 11.5114 12.903 11.4555 13.1533 11.3389C13.4038 11.2222 13.6238 11.048 13.7949 10.8311C14.1597 10.3832 14.3414 9.77693 14.3408 9.0127V3.99609H16.4727V12.7754H14.3945V11.3955C14.1342 11.8942 13.7364 12.3077 13.248 12.5869C12.7398 12.8723 12.1648 13.0174 11.582 13.0078C10.5787 13.0078 9.82871 12.6822 9.33301 12.0312C8.8375 11.3804 8.58991 10.5416 8.58984 9.51465V3.99609H10.7393V9.24512ZM3.8877 3.76172C4.92689 3.76172 5.7606 3.98003 6.3877 4.41602C6.68665 4.61312 6.93327 4.87994 7.10645 5.19336C7.27966 5.50701 7.37426 5.85857 7.38184 6.2168H5.41113C5.4079 6.05606 5.36518 5.89835 5.28711 5.75781C5.20904 5.61733 5.09761 5.49779 4.96289 5.41016C4.67625 5.20721 4.2997 5.10547 3.83398 5.10547C3.34438 5.10551 2.96781 5.21656 2.70508 5.4375C2.57487 5.54814 2.47159 5.68712 2.40332 5.84375C2.33504 6.00048 2.30387 6.17102 2.31152 6.3418C2.30455 6.47218 2.32644 6.60283 2.37598 6.72363C2.42553 6.84443 2.50115 6.95308 2.59766 7.04102C2.78877 7.20884 3.09366 7.32834 3.51172 7.39941L5.08887 7.68555C6.76091 7.98421 7.59668 8.79727 7.59668 10.123C7.59659 11.0663 7.25948 11.7828 6.58496 12.2725C5.91015 12.7621 5.01696 13.0068 3.90625 13.0068C2.78344 13.0068 1.86599 12.7594 1.15527 12.2637C0.444751 11.768 0.0597154 11.1016 0 10.2656H1.98926C2.0125 10.4657 2.07729 10.6591 2.18066 10.832C2.28414 11.005 2.42346 11.1544 2.58887 11.2695C2.94124 11.5317 3.38068 11.6625 3.90625 11.6631C4.39572 11.663 4.78372 11.55 5.07031 11.3232C5.35699 11.0963 5.50098 10.7735 5.50098 10.3555C5.50758 10.2184 5.4849 10.0811 5.43555 9.95312C5.3862 9.82531 5.31062 9.70932 5.21387 9.6123C5.02276 9.42717 4.71221 9.2926 4.28223 9.20898L2.8125 8.94043C1.94134 8.7732 1.29653 8.50402 0.87793 8.13379C0.459296 7.76351 0.250379 7.24971 0.250977 6.59277C0.251032 5.69711 0.582357 5.00152 1.24512 4.50586C1.90799 4.0102 2.78893 3.76177 3.8877 3.76172ZM31.9346 3.76172C33.2127 3.76172 34.2195 4.14472 34.9541 4.90918C35.6884 5.6736 36.0556 6.7843 36.0557 8.24121V8.76074H29.6768C29.7012 9.62066 29.9225 10.3077 30.3398 10.8213C30.7572 11.3348 31.3127 11.5917 32.0059 11.5918C32.5075 11.5918 32.9235 11.4638 33.252 11.207C33.5675 10.9698 33.7917 10.631 33.8877 10.248H35.9482C35.8789 10.6506 35.7302 11.0354 35.5107 11.3799C35.2913 11.7244 35.0054 12.0219 34.6699 12.2549C33.9694 12.7565 33.0695 13.0068 31.9707 13.0068C31.0635 13.0068 30.2778 12.8196 29.6143 12.4434C28.9579 12.0741 28.4247 11.5193 28.082 10.8486C27.7237 10.1618 27.5449 9.34598 27.5449 8.40234C27.545 7.459 27.7239 6.64089 28.082 5.94824C28.4243 5.27269 28.9571 4.71137 29.6143 4.33496C30.2771 3.95278 31.0507 3.76173 31.9346 3.76172ZM46.8467 3.76172C47.8859 3.76172 48.7196 3.98003 49.3467 4.41602C49.6457 4.61311 49.8922 4.87993 50.0654 5.19336C50.2386 5.50701 50.3332 5.85857 50.3408 6.2168H48.3701C48.3669 6.05606 48.3242 5.89835 48.2461 5.75781C48.168 5.61737 48.0566 5.49777 47.9219 5.41016C47.6352 5.20726 47.2586 5.10547 46.793 5.10547C46.3041 5.10554 45.9283 5.21668 45.665 5.4375C45.5347 5.5482 45.4306 5.68697 45.3623 5.84375C45.294 6.00048 45.2629 6.17102 45.2705 6.3418C45.2635 6.47216 45.2854 6.60284 45.335 6.72363C45.3845 6.84439 45.4602 6.95309 45.5566 7.04102C45.7483 7.20882 46.0533 7.32834 46.4707 7.39941L48.0479 7.68555C49.72 7.98419 50.5557 8.79723 50.5557 10.123C50.5556 11.0664 50.2185 11.7828 49.5439 12.2725C48.8691 12.7622 47.976 13.0068 46.8652 13.0068C45.7432 13.0068 44.8265 12.7593 44.1152 12.2637C43.4039 11.768 43.0181 11.1018 42.959 10.2656H44.9482C44.9717 10.4658 45.0372 10.6591 45.1406 10.832C45.2441 11.0049 45.3826 11.1543 45.5479 11.2695C45.9008 11.5317 46.3403 11.6625 46.8652 11.6631C47.3553 11.6631 47.7433 11.55 48.0293 11.3232C48.3154 11.0963 48.4594 10.7735 48.46 10.3555C48.4666 10.2184 48.4439 10.0811 48.3945 9.95312C48.3452 9.82529 48.2696 9.70932 48.1729 9.6123C47.9823 9.42716 47.6718 9.2926 47.2412 9.20898L45.7725 8.94043C44.9005 8.7732 44.255 8.50408 43.8369 8.13379C43.4189 7.76351 43.21 7.24966 43.21 6.59277C43.21 5.69715 43.5414 5.00151 44.2041 4.50586C44.8669 4.01022 45.748 3.76179 46.8467 3.76172ZM55.6562 3.76172C56.9336 3.76177 57.9397 4.14477 58.6748 4.90918C59.4099 5.67361 59.7779 6.78409 59.7773 8.24121V8.76074H53.3984C53.4217 9.62076 53.6429 10.3077 54.0615 10.8213C54.4802 11.3349 55.0354 11.5918 55.7275 11.5918C56.229 11.5918 56.6442 11.4637 56.9727 11.207C57.2879 10.9695 57.5131 10.6308 57.6094 10.248H59.6689C59.5991 10.6507 59.4503 11.0354 59.2305 11.3799C59.0106 11.7243 58.7245 12.022 58.3887 12.2549C57.6899 12.7566 56.7903 13.0068 55.6914 13.0068C54.7833 13.0068 53.9981 12.8194 53.3359 12.4434C52.6796 12.0741 52.1464 11.5192 51.8037 10.8486C51.4454 10.1618 51.2666 9.34598 51.2666 8.40234C51.2666 7.45894 51.4455 6.64092 51.8037 5.94824C52.146 5.27269 52.6788 4.71137 53.3359 4.33496C53.9988 3.95287 54.7725 3.76172 55.6562 3.76172ZM69.3037 12.7754H67.1709V3.99609H69.3037V12.7754ZM42.1572 3.7627C42.2441 3.76266 42.3309 3.76831 42.417 3.78027V5.57227C42.3211 5.56062 42.2198 5.55119 42.1123 5.54492C42.005 5.53866 41.8914 5.53614 41.7725 5.53613C41.0319 5.53613 40.44 5.78077 39.998 6.27051C39.5561 6.76024 39.335 7.4114 39.335 8.22363V12.7744H37.1855V3.99512H39.2812V5.64355C39.5321 5.03441 39.8728 4.5686 40.3027 4.24609C40.7543 3.91668 41.3026 3.74689 41.8613 3.7627H42.1572ZM65.8906 3.7627C65.9774 3.7627 66.0644 3.76834 66.1504 3.78027V5.57227C66.0546 5.56063 65.9531 5.55119 65.8457 5.54492C65.7382 5.53865 65.624 5.53613 65.5049 5.53613C64.7645 5.53617 64.1733 5.78091 63.7314 6.27051C63.2895 6.76024 63.0684 7.41139 63.0684 8.22363V12.7744H60.918V3.99512H63.0146V5.64355C63.2655 5.03437 63.6061 4.5686 64.0361 4.24609C64.4878 3.91669 65.0359 3.74684 65.5947 3.7627H65.8906ZM74.4961 0C74.7775 0.00043544 75.0587 0.0183472 75.3379 0.0537109V1.54102C75.2594 1.51768 75.1776 1.50532 75.0957 1.50488H74.8359C74.4305 1.50492 74.1377 1.60373 73.958 1.80078C73.7783 1.99788 73.6889 2.30569 73.6895 2.72363V3.99512H75.3418V5.48242H73.6934V12.7744H71.5576V5.48242H70.2852V3.99512H71.5576V2.8125C71.5577 1.91688 71.8023 1.22402 72.292 0.734375C72.7817 0.244728 73.5167 0 74.4961 0ZM77.1748 12.7744H74.8809V10.4453H77.1748V12.7744ZM22.3164 5.21387C21.9887 5.20721 21.6643 5.2802 21.3711 5.42676C21.0777 5.57344 20.8242 5.78931 20.6328 6.05566C20.2028 6.61766 19.9873 7.3582 19.9873 8.27734V8.49219C19.9873 9.42374 20.2086 10.1673 20.6504 10.7227C21.0923 11.278 21.6476 11.5566 22.3164 11.5566C22.9853 11.5566 23.5236 11.2725 23.9297 10.7051C24.3357 10.1377 24.5381 9.36411 24.5381 8.38477C24.5381 7.39339 24.3264 6.61705 23.9023 6.05566C23.4783 5.49426 22.9495 5.21387 22.3164 5.21387ZM31.8984 5.15918C31.2775 5.15927 30.7757 5.37758 30.3936 5.81348C30.0114 6.2494 29.7846 6.80192 29.7129 7.4707H33.9414C33.9175 6.74219 33.7293 6.17463 33.377 5.76855C33.0246 5.36254 32.5314 5.15918 31.8984 5.15918ZM55.6201 5.15918C54.9985 5.15919 54.4968 5.37759 54.1152 5.81348C53.7336 6.2494 53.5069 6.80192 53.4346 7.4707H57.6631C57.6392 6.74219 57.451 6.17463 57.0986 5.76855C56.7463 5.36243 56.2532 5.15918 55.6201 5.15918ZM69.375 2.29395H67.0996V0.34082H69.375V2.29395Z"/></svg>';

export class Panel extends Container {
  readonly el: HTMLElement;
  protected readonly bodyEl: HTMLElement;
  readonly theme: Theme;
  readonly presets: PresetStore;
  private _id: string;
  private header: HTMLElement;
  private collapseBtn: HTMLButtonElement;
  private cleanups: (() => void)[] = [];
  private opts: PanelOptions;
  private soloed: Folder | null = null;
  private footerCenter: HTMLElement | null = null;
  private subEl!: HTMLElement;
  private fpsEl: HTMLElement | null = null;
  private stopFps: (() => void) | null = null;

  constructor(opts: PanelOptions = {}) {
    super();
    this.opts = opts;
    this._id = opts.id ?? slug(opts.title ?? 'panel');
    const position = opts.position ?? (opts.container ? 'static' : 'top-right');
    const bodyId = uid('ssui-body');

    const title = h('span', { class: 'ssui-panel__title' }, [opts.title ?? 'Controls']);
    const meta = opts.meta ? h('span', { class: 'ssui-panel__meta' }, [opts.meta]) : null;
    const dot = h('span', { class: 'ssui-panel__dot', 'aria-hidden': 'true' });
    this.collapseBtn = h('button', { class: 'ssui-panel__collapse', type: 'button', 'aria-expanded': 'true', 'aria-controls': bodyId, 'aria-label': 'Collapse panel' }, [icons.chevron()]);
    const toggle = h('div', { class: 'ssui-panel__toggle' }, [dot, title, meta]);
    if (opts.fps) this.fpsEl = h('span', { class: 'ssui-panel__fps', 'aria-label': 'frames per second' }, ['— fps']);
    this.header = h('header', { class: 'ssui-panel__header' }, [toggle, this.fpsEl, this.collapseBtn]);
    this.subEl = h('div', { class: 'ssui-panel__sub' });
    this.bodyEl = h('div', { class: 'ssui-panel__body', id: bodyId });
    const clip = h('div', { class: 'ssui-panel__clip' }, [this.bodyEl]);

    const footerChildren: (Node | string)[] = [];
    if (opts.footer instanceof HTMLElement) footerChildren.push(opts.footer);
    else if (opts.footer !== false) {
      const t = document.createElement('template'); t.innerHTML = LOGO;
      footerChildren.push(h('a', { class: 'ssui-panel__brand', href: 'https://superserif.studio', target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Super Serif' }, [t.content.firstElementChild!]));
      this.footerCenter = h('div', { class: 'ssui-panel__footer-center' });
      footerChildren.push(this.footerCenter);
      const link = opts.link === undefined ? { label: 'see our work', href: 'https://superserif.studio' } : opts.link;
      footerChildren.push(link ? h('a', { class: 'ssui-panel__link', href: link.href, target: '_blank', rel: 'noopener noreferrer' }, [link.label]) : h('span', { class: 'ssui-panel__meta' }, ['ui']));
    }
    const footer = footerChildren.length ? h('footer', { class: 'ssui-panel__footer' }, footerChildren) : null;
    const resize = opts.resizable === false ? null : h('div', { class: 'ssui-panel__resize', 'aria-hidden': 'true' });

    this.el = h('section', { class: 'ssui-panel', role: 'region', 'aria-label': opts.title ?? 'Controls', 'data-ssui-position': position, id: opts.id }, [this.header, this.subEl, clip, footer, resize]);
    if (opts.width) this.el.style.setProperty('--ssui-panel-width', `${opts.width}px`);
    if (opts.tokens) for (const [k, v] of Object.entries(opts.tokens)) this.setToken(k, v);

    this.theme = new Theme(this.el, opts.theme ?? 'auto');
    this.theme.on('frame', () => this.controllers().forEach(c => c.onThemeChange()));
    this.cleanups.push(() => this.theme.dispose());

    this.presets = new PresetStore(this, opts.storageKey ?? null);

    // collapse
    this.collapseBtn.addEventListener('click', () => this.toggle());
    if (opts.collapsed) this.collapsed = true;

    // drag (fixed panels only)
    if (position !== 'static' && opts.draggable !== false) this.enableDrag(position);
    else this.header.style.cursor = 'default';
    if (resize) this.enableResize(resize);

    // hotkey
    // static (embedded) panels get no hotkey by default: several on one page would all toggle together
    const hotkey = opts.hotkey === undefined ? (position === 'static' ? null : 'h') : opts.hotkey;
    if (hotkey) {
      const onKey = (e: KeyboardEvent): void => {
        if (e.key.toLowerCase() !== hotkey.toLowerCase() || e.metaKey || e.ctrlKey || e.altKey) return;
        if (isEditable(document.activeElement)) return;
        if (document.querySelector('.ssui-panel [data-ssui-state="editing"]')) return;
        this.toggle();
      };
      window.addEventListener('keydown', onKey);
      this.cleanups.push(() => window.removeEventListener('keydown', onKey));
    }

    (opts.container ?? document.body).append(this.el);
    this.restoreGeometry();
    this.startFps();

    if (opts.reorderable) {
      this.cleanups.push(makeReorderable(this));
      const key = opts.storageKey ? `ssui:${opts.storageKey}:order` : null;
      if (key) {
        this.on('reorder', () => { try { localStorage.setItem(key, JSON.stringify(this.order())); } catch { /* noop */ } });
        // restore once the consumer has added its folders (same tick)
        queueMicrotask(() => { try { const o = JSON.parse(localStorage.getItem(key) ?? 'null'); if (Array.isArray(o)) this.setOrder(o); } catch { /* noop */ } });
      }
    }
  }

  get id(): string { return this._id; }

  // ---- theme / tokens -----------------------------------------------------
  get themeMode(): ThemeMode { return this.theme.get(); }
  set themeMode(m: ThemeMode) { this.theme.set(m); }
  get resolvedTheme(): ResolvedTheme { return this.theme.resolved(); }
  setTheme(m: ThemeMode): this { this.theme.set(m); return this; }
  setToken(name: string, value: string): this { this.el.style.setProperty(name.startsWith('--') ? name : `--ssui-${name}`, value); return this; }

  // ---- collapse -----------------------------------------------------------
  get collapsed(): boolean { return this.el.hasAttribute('data-ssui-collapsed'); }
  set collapsed(v: boolean) { this.el.toggleAttribute('data-ssui-collapsed', v); this.collapseBtn.setAttribute('aria-expanded', String(!v)); this.saveGeometry(); }
  toggle(): void { this.collapsed = !this.collapsed; }
  open(): this { this.collapsed = false; return this; }
  close(): this { this.collapsed = true; return this; }

  title(t: string): this { this.el.querySelector('.ssui-panel__title')!.textContent = t; this.el.setAttribute('aria-label', t); return this; }

  addFolder(title: string, opts: FolderOptions = {}): Folder {
    const f = this.attach(new Folder(title, opts));
    if (this.opts.editable) {
      f.setEditable({ renamable: true, contextMenu: true, soloable: true });
      f.on('remove-request', () => { if (this.soloed === f) this.setSolo(null); this.remove(f); });
      f.on('solo', (on) => this.setSolo(on ? f : (this.soloed === f ? null : this.soloed)));
    }
    return f;
  }
  /** the block currently soloed, or null */
  get solo(): Folder | null { return this.soloed; }
  setSolo(f: Folder | null): void {
    if (this.soloed && this.soloed !== f) this.soloed.solo = false;
    this.soloed = f;
    for (const c of this.children) if (c instanceof Folder) c.dimmed = !!f && c !== f;
    this.emit('panel-solo', f);
  }
  /** preset bar: pinned under the title by default (outside the scrolling body); `placement: 'body'` adds it as a row */
  addPresets(opts: PresetBarOptions & { placement?: 'header' | 'body' } = {}): PresetBar {
    const bar = new PresetBar(this, opts);
    if (opts.placement === 'body') return this.attach(bar);
    bar.el.setAttribute('data-ssui-placement', 'header');
    this.subEl.replaceChildren(bar.el);
    this.el.setAttribute('data-ssui-has-sub', '');
    return bar;
  }

  // ---- fps ----------------------------------------------------------------
  private startFps(): void {
    if (!this.fpsEl || this.stopFps) return;
    let acc = 0, n = 0;
    this.stopFps = Scheduler.animate({ flush() {}, poll() {}, tick: (dt) => {
      acc += dt; n++;
      if (acc >= 500) { const fps = Math.round(1000 / (acc / n)); this.fpsEl!.textContent = `${fps} fps`; this.fpsEl!.toggleAttribute('data-ssui-low', fps < 50); acc = 0; n = 0; }
    } });
    this.cleanups.push(() => { this.stopFps?.(); this.stopFps = null; });
  }

  // ---- transport (footer): play/pause pill + reset -------------------------
  setTransport(o: TransportOptions = {}): Transport {
    if (!this.footerCenter) throw new Error('[ssui] setTransport needs the default footer');
    const [playLabel, pauseLabel] = o.labels ?? ['Play', 'Pause'];
    let playing = o.playing ?? true;
    const icon = h('span', { class: 'ssui-transport__icon', 'aria-hidden': 'true' }, [icons.play(), icons.pause()]);
    const label = h('span', { class: 'ssui-transport__label' }, [playing ? pauseLabel : playLabel]);
    const toggle = h('button', { class: 'ssui-transport__toggle', type: 'button', 'aria-pressed': String(playing) }, [icon, label]);
    const reset = h('button', { class: 'ssui-transport__reset', type: 'button', 'aria-label': 'Reset', title: 'Reset' }, [icons.refresh()]);
    const el = h('div', { class: 'ssui-transport', 'data-ssui-playing': playing ? '' : null }, [toggle, reset]);
    const paint = (): void => { el.toggleAttribute('data-ssui-playing', playing); toggle.setAttribute('aria-pressed', String(playing)); label.textContent = playing ? pauseLabel : playLabel; };
    toggle.addEventListener('click', () => { playing = !playing; paint(); o.onToggle?.(playing); });
    reset.addEventListener('click', () => {
      reset.setAttribute('data-ssui-spin', ''); setTimeout(() => reset.removeAttribute('data-ssui-spin'), 500);
      if (o.onReset) o.onReset(); else this.reset();
    });
    this.footerCenter.replaceChildren(el);
    return {
      el,
      get playing() { return playing; },
      set playing(v: boolean) { if (v !== playing) { playing = v; paint(); } },
      dispose: () => el.remove(),
    };
  }

  // ---- drag / resize ------------------------------------------------------
  private enableDrag(position: PanelPosition): void {
    let x0 = 0, y0 = 0, w = 0, hgt = 0;
    this.cleanups.push(trackPointer(this.header, {
      cursor: 'grabbing',
      ignore: (e) => !!(e.target as HTMLElement).closest('button'),
      onStart: () => {
        const r = this.el.getBoundingClientRect();
        // switch from corner anchoring to explicit left/top once dragged
        this.el.style.left = `${r.left}px`; this.el.style.top = `${r.top}px`;
        this.el.style.right = 'auto'; this.el.style.bottom = 'auto';
        x0 = r.left; y0 = r.top; w = r.width; hgt = r.height;
      },
      onMove: (s) => {
        const x = clamp(x0 + s.dx, 0, innerWidth - w), y = clamp(y0 + s.dy, 0, innerHeight - Math.min(hgt, 48));
        this.el.style.left = `${x}px`; this.el.style.top = `${y}px`;
      },
      onEnd: () => this.saveGeometry(),
    }));
    // ignore clicks on the collapse button for drag purposes: it stops propagation naturally via pointerdown threshold
    void position;
  }
  private enableResize(handle: HTMLElement): void {
    let w0 = 0;
    this.cleanups.push(trackPointer(handle, {
      immediate: true, cursor: 'ew-resize',
      onStart: () => { w0 = this.el.getBoundingClientRect().width; this.el.setAttribute('data-ssui-resizing', ''); },
      onMove: (s) => this.el.style.setProperty('--ssui-panel-width', `${Math.round(w0 + s.dx)}px`),
      onEnd: () => { this.el.removeAttribute('data-ssui-resizing'); this.saveGeometry(); },
    }));
  }
  private geomKey(): string | null { return this.opts.storageKey ? `ssui:${this.opts.storageKey}:geometry` : null; }
  private saveGeometry(): void {
    const k = this.geomKey(); if (!k) return;
    try { localStorage.setItem(k, JSON.stringify({ left: this.el.style.left, top: this.el.style.top, width: this.el.style.getPropertyValue('--ssui-panel-width'), collapsed: this.collapsed })); } catch { /* noop */ }
  }
  private restoreGeometry(): void {
    const k = this.geomKey(); if (!k) return;
    try {
      const g = JSON.parse(localStorage.getItem(k) ?? 'null');
      if (!g) return;
      if (g.left && g.top && this.opts.position !== 'static') { this.el.style.left = g.left; this.el.style.top = g.top; this.el.style.right = 'auto'; this.el.style.bottom = 'auto'; }
      if (g.width) this.el.style.setProperty('--ssui-panel-width', g.width);
      if (typeof g.collapsed === 'boolean') this.collapsed = g.collapsed;
    } catch { /* noop */ }
  }

  dispose(): void {
    for (const c of this.cleanups.splice(0)) c();
    this.presets.dispose();
    super.dispose();
  }
}
