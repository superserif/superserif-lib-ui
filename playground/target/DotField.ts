import type { CurveControl } from '../../src/index';

export interface FieldState {
  count: number;
  mode: 'sine' | 'ripple' | 'noise';
  amplitude: number;
  speed: number;
  offset: { x: number; y: number };
  ink: string;
  animate: boolean;
  label: string;
  fps: number;
}

export const defaults = (): FieldState => ({
  count: 24, mode: 'sine', amplitude: 0.5, speed: 1, offset: { x: 0, y: 0 },
  ink: '#1b1b1b', animate: true, label: 'dot field', fps: 0,
});

/* cheap value noise */
const hash = (x: number, y: number): number => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number): number => t * t * (3 - 2 * t);
function noise2(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  const u = smooth(xf), v = smooth(yf);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

export class DotField {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private ro: ResizeObserver;
  private raf = 0;
  private t = 0;
  private last = 0;
  private fpsAcc: number[] = [];
  private w = 0; private h = 0;
  easing: CurveControl | null = null;

  constructor(private host: HTMLElement, private state: FieldState) {
    this.canvas = document.createElement('canvas');
    host.append(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private resize(): void {
    const dpr = Math.min(2, devicePixelRatio || 1);
    this.w = this.host.clientWidth; this.h = this.host.clientHeight;
    this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  }

  private frame = (now: number): void => {
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now;
    this.fpsAcc.push(1 / Math.max(dt, 1e-4)); if (this.fpsAcc.length > 20) this.fpsAcc.shift();
    this.state.fps = Math.round(this.fpsAcc.reduce((a, b) => a + b, 0) / this.fpsAcc.length);
    if (this.state.animate) this.t += dt * this.state.speed;
    this.draw();
    this.raf = requestAnimationFrame(this.frame);
  };

  private field(u: number, v: number): number {
    const s = this.state, t = this.t;
    const cx = u - 0.5 - s.offset.x * 0.5, cy = v - 0.5 + s.offset.y * 0.5;
    switch (s.mode) {
      case 'ripple': { const d = Math.hypot(cx, cy); return Math.sin(d * 18 - t * 3) * Math.exp(-d * 2.2); }
      case 'noise': return noise2(u * 4 + t * 0.6, v * 4 + t * 0.35);
      default: return Math.sin((u + s.offset.x * 0.5) * Math.PI * 2 + t * 2) * Math.cos((v - s.offset.y * 0.5) * Math.PI * 2 + t * 1.3);
    }
  }

  private draw(): void {
    const { ctx, w, h, state: s } = this;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const n = Math.max(2, Math.round(s.count));
    const pad = 32;
    const cell = Math.min((w - pad * 2) / (n - 1), (h - pad * 2) / (n - 1));
    const gw = cell * (n - 1), gh = cell * (n - 1);
    const ox = (w - gw) / 2, oy = (h - gh) / 2;
    const ease = this.easing ? this.easing.toFunction() : (t: number) => t;
    const rBase = Math.max(1, cell * 0.12);
    ctx.fillStyle = s.ink;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const u = i / (n - 1), v = j / (n - 1);
        const f = this.field(u, v);                     // -1..1
        const m = ease(Math.min(1, Math.abs(f)));       // falloff shaped by the curve
        const disp = Math.sign(f) * m * s.amplitude * cell * 0.9;
        const x = ox + i * cell + disp * 0.6, y = oy + j * cell + disp;
        const r = rBase * (0.6 + m * 1.6);
        ctx.globalAlpha = 0.35 + m * 0.65;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (s.label) {
      ctx.font = '500 11px "DM Mono", ui-monospace, monospace';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = s.ink; ctx.globalAlpha = 0.6;
      ctx.fillText(s.label.toUpperCase(), 20, h - 18);
      ctx.textAlign = 'right';
      ctx.fillText(`${s.mode} · ${s.fps} fps`, w - 20, h - 18);
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
    }
  }

  dispose(): void { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.canvas.remove(); }
}
