import { Emitter } from './Emitter';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

export class Theme extends Emitter<{ change: [ResolvedTheme]; settle: [ResolvedTheme]; frame: [] }> {
  private mq = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-color-scheme: dark)') : null;
  private mode: ThemeMode;
  private timer = 0;
  private raf = 0;

  constructor(private root: HTMLElement, mode: ThemeMode = 'auto') {
    super();
    this.mode = mode;
    root.setAttribute('data-ssui-theme', mode);
    this.mq?.addEventListener('change', this.onSystem);
  }

  get(): ThemeMode { return this.mode; }
  resolved(): ResolvedTheme { return this.mode === 'auto' ? (this.mq?.matches ? 'dark' : 'light') : this.mode; }

  set(mode: ThemeMode, animate = true): void {
    if (mode === this.mode) return;
    const before = this.resolved();
    this.mode = mode;
    this.root.setAttribute('data-ssui-theme', mode);
    if (this.resolved() !== before) this.transition(animate);
  }

  private onSystem = (): void => { if (this.mode === 'auto') this.transition(true); };

  private transition(animate: boolean): void {
    const dur = animate ? parseFloat(getComputedStyle(this.root).getPropertyValue('--ssui-dur-theme')) || 0 : 0;
    this.emit('change', this.resolved());
    clearTimeout(this.timer); cancelAnimationFrame(this.raf);
    if (dur <= 0) { this.emit('frame'); this.emit('settle', this.resolved()); return; }
    this.root.setAttribute('data-ssui-switching', '');
    const start = performance.now();
    const loop = (): void => {
      this.emit('frame');
      if (performance.now() - start < dur) this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
    this.timer = window.setTimeout(() => {
      this.root.removeAttribute('data-ssui-switching');
      this.emit('frame');
      this.emit('settle', this.resolved());
    }, dur + 20);
  }

  read(token: string): string { return getComputedStyle(this.root).getPropertyValue(`--ssui-${token}`).trim(); }

  dispose(): void { this.mq?.removeEventListener('change', this.onSystem); clearTimeout(this.timer); cancelAnimationFrame(this.raf); this.clear(); }
}
