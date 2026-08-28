# @superserif/ui — plan (condensed from the planning pass, 2026-08-28)

One sentence: every control is a label, a value you can scrub, and a small drawing of what the value does.

## Phase 1 — components (this repo, now)
- Tokens scoped on `.ssui-panel`, `@layer ssui.tokens < ssui.base < ssui.controls`, unlayered `revert-layer` shield against hostile page CSS.
- Core: `Emitter`, `Binding` (bindKey / bindXY / bindXYObject / bindValue), `Scheduler` (one rAF: request / listen / animate), `Theme` (`data-ssui-theme`, `@property` crossfade), `trackPointer` (pointer capture), `Controller` (setValue → binding → change sync → flush next frame), `Container` (add* inference, ids, toJSON/fromJSON, change/finish bubbling).
- Controls: Panel, Folder, Number, Slider, Knob, Pad2D, Toggle, Select (+ preview canvas), Color, Text, Button(s), Curve (bezier + points, toFunction/toCSS/toArray), Monitor (+ sparkline), PresetBar/PresetStore, Separator, Label.
- Playground `/` (every control light + dark bound to one state, snippets, Target dot field, Stress/Embed/Reset-survival), `/prototype.html` (picker: Ligne / Module / Instrument), `/dev-*.html`.

## Phase 2 — packaging (built 2026-08-28; publish pending the owner's go)

Done: `npm run build` → `dist/index.js` + `auto.js` (ESM), `ssui.iife.js` (global `SSUI`, CSS injected), `ssui.css`, `index.d.ts`/`auto.d.ts`; `package.json` exports `.`, `./auto`, `./css`, `./tokens`; README, CHANGELOG, MIT LICENSE; local git repo with an initial commit.

Release procedure: `npm run check && npm run build` → bump `version` in package.json + CHANGELOG → `git commit -am 'vX.Y.Z' && git tag vX.Y.Z && git push --tags` → consumers install `github:superserif/superserif-lib-ui#vX.Y.Z` or the jsDelivr GitHub URL; `npm publish` only once the `@superserif` npm org exists.

Original outline:
- `vite build` lib mode: `src/index.ts` (ESM) + `src/auto.ts` (ESM + IIFE `SSUI`, injects `styles/index.css?inline` once via adoptedStyleSheets / `<style data-ssui>`), `vite-plugin-dts` → `dist/index.d.ts`, `cssCodeSplit:false` → `dist/ssui.css`.
- `package.json` exports: `.`, `./auto`, `./css`, `./tokens`; `files: [dist]`; `sideEffects` for auto + css; `unpkg`/`jsdelivr` → iife.
- README: install, 10-line first panel, every add* with option table, theming (token list generated from tokens.css by a script), presets, keyboard reference, a11y, browser support (Chrome 111+, Safari 16.4+, Firefox 128+ for @property/linear/revert-layer; degrades to snap/standard easing/no shield).
- Repo `github.com/superserif/superserif-lib-ui`, npm `@superserif/ui` (check name availability first), semver from 0.1.0, hand-written CHANGELOG, GitHub Actions check+test on PR and `npm publish --provenance` on `v*` tag, playground to GitHub Pages.

## Open decisions for the owner
- Default composition: Ligne / Module / Instrument (see `/prototype.html`); whichever wins becomes the documented default recipe and its token set the defaults.
- Accent: single `#F09526` in both themes (current) vs `#FF4F00` on dark (newfragment).
- Label case: sentence case (current) vs legacy uppercase mono (`--ssui-text-transform-label: uppercase`).
- Font stack: lib never loads a font; defaults `Inter, PP Neue Montreal, system-ui` for labels + `DM Mono, ui-monospace` for values.

## API notes collected from the playground build
- `add()` returns `Controller` and force-casts the button case → give ButtonControl a no-op `listen()` or a distinct return type.
- `addPad2D(obj,'x','y')` default label reads "x / y" — pass `label`.
- `addMonitor<T>` generic for `format`.
