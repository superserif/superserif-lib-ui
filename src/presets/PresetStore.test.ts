import { describe, it, expect, vi } from 'vitest';
import { PresetStore, type PresetHost } from './PresetStore';
import { memoryAdapter } from './storage';

function fakeHost(initial: Record<string, unknown>): PresetHost & { state: Record<string, unknown> } {
  const state = { ...initial };
  const listeners: ((c: any) => void)[] = [];
  return {
    id: 'test', state,
    toJSON: () => ({ ...state }),
    fromJSON: (d) => { Object.assign(state, d); },
    controllers: () => [],
    on: (_ev, cb) => { listeners.push(cb); return () => {}; },
  };
}

describe('PresetStore', () => {
  it('captures defaults lazily and reports dirty', () => {
    const host = fakeHost({ a: 1, b: 'x' });
    const s = new PresetStore(host, 'k', memoryAdapter());
    expect(s.dirty).toBe(false);
    s.captureDefaults();
    host.state.a = 2;
    expect(s.dirty).toBe(true);
    const spy = vi.fn(); s.on('dirty', spy);
    s.checkDirty(); expect(spy).toHaveBeenCalledWith(true);
    s.applyDefault();
    expect(host.state.a).toBe(1);
    expect(s.dirty).toBe(false);
  });

  it('save / load roundtrip and persistence in adapter', () => {
    const adapter = memoryAdapter();
    const host = fakeHost({ a: 1 });
    const s = new PresetStore(host, 'k', adapter);
    host.state.a = 5;
    const p = s.save('Five');
    expect(p.values).toEqual({ a: 5 });
    expect(s.current).toBe('Five');
    expect(s.dirty).toBe(false);
    host.state.a = 9;
    expect(s.dirty).toBe(true);
    s.load('Five');
    expect(host.state.a).toBe(5);
    // second store on the same adapter/key sees the list
    const s2 = new PresetStore(fakeHost({ a: 0 }), 'k', adapter);
    expect(s2.list().map(x => x.name)).toEqual(['Five']);
  });

  it('save on an existing name overwrites', () => {
    const host = fakeHost({ a: 1 });
    const s = new PresetStore(host, null, memoryAdapter());
    s.save('P'); host.state.a = 2; s.save('P');
    expect(s.list()).toHaveLength(1);
    expect(s.getPreset('P')!.values).toEqual({ a: 2 });
  });

  it('rejects Default and empty names', () => {
    const s = new PresetStore(fakeHost({ a: 1 }), null, memoryAdapter());
    expect(() => s.save('Default')).toThrow();
    expect(() => s.save('   ')).toThrow();
  });

  it('rename and remove', () => {
    const host = fakeHost({ a: 1 });
    const s = new PresetStore(host, null, memoryAdapter());
    s.save('A'); s.save('B');
    s.rename('A', 'C');
    expect(s.list().map(p => p.name)).toEqual(['C', 'B']);
    s.rename('C', 'B'); // collision ignored
    expect(s.list().map(p => p.name)).toEqual(['C', 'B']);
    expect(s.current).toBe('B');
    const rm = vi.fn(); s.on('remove', rm);
    s.remove('B');
    expect(rm).toHaveBeenCalledWith('B');
    expect(s.current).toBe(null);
    expect(s.list().map(p => p.name)).toEqual(['C']);
  });

  it('export / import roundtrip, merge and replace', () => {
    const host = fakeHost({ a: 1 });
    const s = new PresetStore(host, null, memoryAdapter());
    s.save('One'); host.state.a = 2; s.save('Two');
    const json = s.exportJSON();
    const parsed = JSON.parse(json);
    expect(parsed.format).toBe('ssui-presets');
    expect(parsed.presets).toHaveLength(2);

    const t = new PresetStore(fakeHost({ a: 0 }), null, memoryAdapter());
    t.save('Local');
    expect(t.importJSON(json)).toBe(2);
    expect(t.list().map(p => p.name)).toEqual(['Local', 'One', 'Two']);
    t.importJSON(json, { merge: false });
    expect(t.list().map(p => p.name)).toEqual(['One', 'Two']);
    expect(() => t.importJSON('{"format":"nope"}')).toThrow();
    expect(() => t.importJSON('not json')).toThrow();
  });

  it('load of unknown preset warns once and does not throw', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const s = new PresetStore(fakeHost({ a: 1 }), null, memoryAdapter());
    s.load('nope'); s.load('nope');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
