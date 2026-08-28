/**
 * Zero-config entry: injects the stylesheet once, then re-exports the library.
 *   import { Panel } from '@superserif/ui/auto'
 * or, as a script tag (IIFE build): window.SSUI.Panel
 */
import css from './styles/index.css?inline';
export * from './index';

const ID = 'ssui-styles';
export function injectStyles(target: Document = document): void {
  if (target.getElementById(ID)) return;
  const style = target.createElement('style');
  style.id = ID;
  style.setAttribute('data-ssui-version', __SSUI_VERSION__);
  style.textContent = css;
  target.head.append(style);
}
declare const __SSUI_VERSION__: string;
if (typeof document !== 'undefined') injectStyles();
