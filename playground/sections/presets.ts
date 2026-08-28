import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './presets.ts?raw';

export const section: Section = {
  id: 'presets', title: 'Presets', tag: 'state', source,
  blurb: 'Every panel has a PresetStore; addPresets() renders the bar. Save names inline, load, rename, delete, export or import JSON. Values are keyed by control id, so give ids when labels may change.',
  state: () => ({ speed: 1, density: 0.4, palette: 'warm', dither: true }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    // snippet:start
    const panel = new Panel({
      title: 'Presets', theme, container: slot, position: 'static', hotkey: null,
      storageKey: 'pg-presets',      // localStorage namespace
    });
    panel.addPresets({ allowDelete: true, allowExport: true });
    panel.add(s, 'speed', { min: 0, max: 4 }).listen();
    panel.add(s, 'density', { min: 0, max: 1 }).listen();
    panel.add(s, 'palette', { options: ['warm', 'cold', 'mono'] }).listen();
    panel.add(s, 'dither').listen();
    // panel.presets.save('name') / load('name') / exportJSON()
    // snippet:end
    return panel;
  },
};
