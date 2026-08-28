import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './text.ts?raw';

export const section: Section = {
  id: 'text', title: 'Text', tag: 'string', source,
  blurb: 'A plain input. change on every keystroke, finish on blur or Enter; Escape reverts. The only motion is the underline on focus.',
  state: () => ({ name: 'dot field', suffix: '', notes: 'Grain at 12 reads as film.\nAbove 40 it turns to noise.' }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Text', theme, container: slot, position: 'static', hotkey: null });
    // snippet:start
    panel.addText(s, 'name').listen();
    panel.addText(s, 'suffix', { placeholder: 'optional' }).listen();
    panel.addText(s, 'notes', { multiline: true }).listen();
    // snippet:end
    return panel;
  },
};
