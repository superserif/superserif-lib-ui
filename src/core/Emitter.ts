export type Listener<A extends unknown[]> = (...args: A) => void;

export class Emitter<E extends Record<string, unknown[]>> {
  private map = new Map<keyof E, Set<Listener<any>>>();

  on<K extends keyof E>(ev: K, cb: Listener<E[K]>): () => void {
    let set = this.map.get(ev);
    if (!set) this.map.set(ev, (set = new Set()));
    set.add(cb);
    return () => this.off(ev, cb);
  }
  once<K extends keyof E>(ev: K, cb: Listener<E[K]>): () => void {
    const off = this.on(ev, ((...a: E[K]) => { off(); cb(...a); }) as Listener<E[K]>);
    return off;
  }
  off<K extends keyof E>(ev: K, cb: Listener<E[K]>): void { this.map.get(ev)?.delete(cb); }
  emit<K extends keyof E>(ev: K, ...args: E[K]): void {
    const set = this.map.get(ev);
    if (!set) return;
    for (const cb of [...set]) cb(...args);
  }
  clear(): void { this.map.clear(); }
}
