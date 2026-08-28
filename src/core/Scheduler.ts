/**
 * One rAF loop for the whole library. Controllers request a DOM update (flushed
 * once per frame) and can be polled (`listen`) so external writes to the target
 * object show up without proxies.
 */
export interface Schedulable {
  flush(): void;          // push binding -> DOM
  poll(): void;           // compare binding to last pushed value, flush if changed
  tick?(dt: number): void; // optional per-frame animation
}

class SchedulerImpl {
  private requests = new Set<Schedulable>();
  private listeners = new Set<Schedulable>();
  private tickers = new Set<Schedulable>();
  private raf = 0;
  private last = 0;

  request(c: Schedulable): void { this.requests.add(c); this.start(); }
  listen(c: Schedulable): () => void { this.listeners.add(c); this.start(); return () => this.listeners.delete(c); }
  animate(c: Schedulable): () => void { this.tickers.add(c); this.start(); return () => this.tickers.delete(c); }
  unlisten(c: Schedulable): void { this.listeners.delete(c); this.tickers.delete(c); this.requests.delete(c); }

  private start(): void { if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.frame); } }

  private frame = (now: number): void => {
    this.raf = 0;
    const dt = Math.min(64, now - this.last); this.last = now;
    if (this.requests.size) { const r = [...this.requests]; this.requests.clear(); for (const c of r) c.flush(); }
    for (const c of this.listeners) c.poll();
    for (const c of this.tickers) c.tick?.(dt);
    if (this.listeners.size || this.tickers.size || this.requests.size) this.raf = requestAnimationFrame(this.frame);
  };
}

export const Scheduler = new SchedulerImpl();
