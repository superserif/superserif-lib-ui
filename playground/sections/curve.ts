import { Panel, type CurveValue } from '../../src/index';
import type { Section, SlotTheme } from './_types';
import source from './curve.ts?raw';

export const section: Section = {
  id: 'curve', title: 'Curve', tag: 'easing', source,
  blurb: 'An easing editor: cubic-bezier handles or free points. toFunction() returns f(t), toCSS() a cubic-bezier() or linear() string, toArray(n) a lookup table for shaders. The dot outside the panel runs on the current curve.',
  state: () => ({ ease: { type: 'bezier', points: [0.2, 0, 0, 1] } as CurveValue, fall: { type: 'points', points: [[0, 0], [0.3, 0.8], [0.7, 0.9], [1, 1]] } as CurveValue }),
  mount(slot: HTMLElement, theme: SlotTheme, s) {
    const panel = new Panel({ title: 'Curve', theme, container: slot, position: 'static', hotkey: null });
    // demo runner: a dot that animates with the current easing
    const runner = document.createElement('div');
    runner.className = 'pg-runner';
    runner.innerHTML = '<span class="pg-runner__dot"></span><code class="pg-runner__css"></code>';
    slot.append(runner);
    const dot = runner.querySelector<HTMLElement>('.pg-runner__dot')!;
    const css = runner.querySelector<HTMLElement>('.pg-runner__css')!;
    // snippet:start
    const ease = panel.addCurve(s, 'ease', { mode: 'both' }).listen();
    panel.addCurve(s, 'fall', { mode: 'points', height: 96 }).listen();

    const apply = () => {
      const timing = ease.toCSS();
      css.textContent = timing;
      dot.style.transitionTimingFunction = timing;
    };
    ease.on('change', apply); apply();
    // snippet:end
    let flip = false;
    const loop = () => { flip = !flip; dot.style.transform = `translateX(${flip ? 'calc(100% + 160px)' : '0'})`; };
    const timer = setInterval(loop, 1400);
    panel.on('dispose', () => clearInterval(timer));
    return panel;
  },
};
