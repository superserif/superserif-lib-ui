import type { StorageAdapter } from './PresetStore';

/** localStorage, but never throws (private mode, quota, SSR). */
export const localStorageAdapter: StorageAdapter = {
  get(key) { try { return globalThis.localStorage?.getItem(key) ?? null; } catch { return null; } },
  set(key, v) { try { globalThis.localStorage?.setItem(key, v); } catch { /* quota / private mode */ } },
  remove(key) { try { globalThis.localStorage?.removeItem(key); } catch { /* noop */ } },
};

/** in-memory adapter: tests, or panels without a storageKey */
export function memoryAdapter(): StorageAdapter {
  const map = new Map<string, string>();
  return {
    get: (k) => map.get(k) ?? null,
    set: (k, v) => { map.set(k, v); },
    remove: (k) => { map.delete(k); },
  };
}
