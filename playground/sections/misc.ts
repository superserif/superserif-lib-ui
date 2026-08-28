import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './misc.ts?raw';

export const section: Section = {
  id: 'misc', title: 'Separator, label, states', tag: 'layout', source,
  blurb: 'addSeparator() draws a hairline, addLabel() a small mono caption. Every controller can hide(), disable(), listen() and reset(); listen() polls the target each frame so external writes show up.',
  state: () => { const s = { a: 0.3, b: 0.6, secret: 7, external: 0 }; setInterval(() => { s.external += 1; }, 1000); return s; },
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Misc', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addLabel('Input');
    panel.add(s, 'a', { min: 0, max: 1 }).listen();
    panel.addSeparator();
    panel.addLabel('Output');
    const b = panel.add(s, 'b', { min: 0, max: 1 }).listen();
    const hidden = panel.addNumber(s, 'secret').hide();
    const ext = panel.addNumber(s, 'external', { step: 1 }).listen();
    panel.addButtons([
      { label: 'Toggle hidden', onClick: () => hidden.hide(!hidden.el.hasAttribute('data-ssui-hidden')) },
      { label: 'Disable b', onClick: () => b.disable(!b.el.hasAttribute('data-ssui-disabled')), variant: 'ghost' },
    ]);
    // s.external is incremented by a timer elsewhere: listen() picks it up
    void ext;
    // snippet:end
    return panel;
  },
};
