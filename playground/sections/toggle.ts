import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './toggle.ts?raw';

export const section: Section = {
  id: 'toggle', title: 'Toggle', tag: 'boolean', source,
  blurb: 'A switch with a status dot that goes accent and pulses once when turned on. Space or Enter toggles.',
  state: () => ({ animate: true, autoplay: false, loop: true }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Toggle', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addToggle(s, 'animate').listen();
    panel.addToggle(s, 'autoplay').listen();
    panel.addToggle(s, 'loop', { indicator: false }).listen();
    // snippet:end
    return panel;
  },
};
