import { Panel } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './button.ts?raw';

const refresh = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 8a5 5 0 1 1-1.7-3.75"/><path d="M13 2.5V5.5H10"/></svg>';

export const section: Section = {
  id: 'button', title: 'Button', tag: 'action', source,
  blurb: 'Buttons scale to 0.96 on press and release with the spring. One primary per panel; the rest default or ghost. Excluded from presets.',
  state: () => ({ runs: 0 }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Button', theme, container: slot, position: 'static', hotkey: null });
    const counter = panel.addMonitor(s, 'runs');
    // snippet:start
    panel.addButton('Export frame', () => { s.runs++; });
    panel.addButtons([
      { label: 'Render', onClick: () => { s.runs++; }, variant: 'primary' },
      { label: 'Clear', onClick: () => { s.runs = 0; }, variant: 'ghost' },
    ]);
    panel.addButtons([{ label: '', icon: refresh, title: 'Refresh', onClick: () => { s.runs++; } }], 'refresh');
    // snippet:end
    void counter;
    return panel;
  },
};
