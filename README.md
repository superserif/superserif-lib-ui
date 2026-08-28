# @superserif/ui

A control panel for creative dev — parameters, curves, presets — in the spirit of dat.gui, built the Super Serif way: one stylesheet driven by CSS custom properties, light and dark, one type size, two easings, no framework, no dependency.

- **Panel** (drag, resize, collapse, `H`, fps, transport), **Folder** as modules (grid layout, rename, right-click, solo, drag to reorder)
- **Number** (the digit is the control: scrub, shift ×10, alt ×0.1, click to type), **Slider** (inline mode, editable max), **Knob** (stack layout), **Pad 2D**, **Pads** (on/off bank), **Toggle**, **Select** (with preview canvas), **Color**, **Text**, **Button**, **Menu**, **Curve** (bezier / points → `toFunction()` `toCSS()` `toArray()`), **Monitor** (sparkline), **Mixer** (faders), **Presets** (save / load / export JSON)

## Install

Three ways, pick one per project.

**1. npm (bundlers: Vite, Next, Astro…)**

```sh
npm i @superserif/ui
```

```ts
import { Panel } from '@superserif/ui/auto';     // injects the CSS once
// or, if you prefer to own the stylesheet:
import { Panel } from '@superserif/ui';
import '@superserif/ui/css';
```

**2. From GitHub (no npm publish needed)**

```sh
npm i github:superserif/superserif-ui#v0.1.0
```

Same imports as above — `dist/` is committed on tagged releases.

**3. Script tag (Framer, Webflow, CodePen, plain HTML)**

```html
<script src="https://cdn.jsdelivr.net/gh/superserif/superserif-ui@v0.1.0/dist/ssui.iife.js"></script>
<script>
  const { Panel } = SSUI;
</script>
```

Or as a module from the same CDN: `import { Panel } from 'https://cdn.jsdelivr.net/gh/superserif/superserif-ui@v0.1.0/dist/auto.js'`.

The library never loads a font. It uses `Inter` if the page has it, then the system sans. Load Inter yourself if you want the reference look.

## Ten lines

```ts
import { Panel } from '@superserif/ui/auto';

const params = { count: 24, amplitude: 0.5, mode: 'sine', ink: '#f09526', animate: true };
const panel = new Panel({ title: 'sketch_01', theme: 'auto', fps: true });
panel.add(params, 'count', { min: 4, max: 64, step: 1 });          // → Slider
panel.add(params, 'amplitude', { min: 0, max: 1 });                // → Slider
panel.add(params, 'mode', { options: ['sine', 'ripple', 'noise'] });// → Select
panel.add(params, 'ink');                                          // → Color
panel.add(params, 'animate');                                      // → Toggle
panel.onChange((ctrl, value) => { /* uniforms.u_count.value = params.count … */ });
```

`params` is written in place — read it in your render loop; nothing else to wire. Every controller has `.onChange() .onFinishChange() .listen() .disable() .hide() .reset() .value`. Use `finish` for expensive work (geometry), `change` for uniforms.

## Modules (the starter shape)

```ts
const panel = new Panel({ title: 'sketch_20260828', reorderable: true, editable: true, fps: true, storageKey: 'my-sketch' });
panel.addPresets();                                                 // pinned under the title

const mix = panel.addFolder('Mixer');
mix.addMixer(S, 'mix', { channels: ['amp', 'freq', 'phase', 'decay'], controls: false, pan: false, output: false });

const knobs = panel.addFolder('Knobs', { layout: 'grid', columns: 3 });
knobs.addKnob(S, 'amplitude', { min: 0, max: 1, layout: 'stack', size: 'lg' });

panel.addFolder('Pads').addPads(S, 'pads');                          // S.pads = { amp: true, freq: false, … }
panel.addFolder('Sliders').addSlider(S, 'speed', { min: 0, max: 3, inline: true });
panel.addFolder('Curve').addCurve(S, 'falloff');                      // .toFunction() for your falloff
panel.addMenu('Add module', [{ label: 'Knobs', onSelect: () => { /* … */ } }], { full: true, variant: 'ghost' });
panel.setTransport({ playing: true, onToggle: p => (S.playing = p) });
```

Folders are the modules: drag a header to reorder, double-click to rename, right-click for Rename / Remove, hover 200 ms for the SOLO pill (`panel.on('panel-solo', folder)`). Order, renames and presets persist under `storageKey`.

`playground/starter.ts` in this repo is a complete, commented template to copy.

## Theme and tokens

`theme: 'light' | 'dark' | 'auto'`, `panel.setTheme()`. Switching crossfades the colour tokens.

Everything is a CSS custom property scoped on the panel and layered below your CSS, so one line re-themes it:

```css
.ssui-panel { --ssui-color-accent: #ff4f00; --ssui-font-family: "PP Neue Montreal", sans-serif; --ssui-radius-lg: 12px; }
```

Full list in `src/styles/tokens.css` (also exported as `@superserif/ui/tokens`). Type is one size (`--ssui-font-size` 11px) plus a 9px caption size; hierarchy is colour. Motion has two easings: `--ssui-ease-standard` and `--ssui-ease-spring`; `prefers-reduced-motion` zeroes the durations.

## Browser support

Chrome 111+, Safari 16.4+, Firefox 128+ (for `@property`, `linear()`, `revert-layer`, `color-mix`). Older browsers still work; they lose the theme crossfade, the spring easing and the CSS shield against hostile page resets.

## Develop

```sh
npm i
npm run dev          # http://localhost:4402 — components, /starter.html, /prototype.html
npm run check        # typecheck + tests
npm run build        # dist/: index.js, auto.js, ssui.css, ssui.iife.js, *.d.ts
```

Contributor rules: `CONVENTIONS.md`. Roadmap and decisions: `PLAN.md`.
