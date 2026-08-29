# Changelog

## 0.1.1 — 2026-08-28

- **Range**: two-thumb slider for `[lo, hi]` pairs — `panel.addRange(obj, 'band', { min, max, step, unit, inline })`. Drag grabs the nearest thumb (they never cross), both readout numbers scrub and type, arrows / Home / End on each thumb. `panel.add()` infers it from a two-number array plus `{ min, max }`.
- Slider: inline layout refined to the Figma spec — thin rail, square thumb, tighter label-to-track spacing. `showRange` (the editable "/ max") is now opt-in for inline sliders instead of always on.
- Panel: collapsed state clips the body cleanly (no card edge showing); `setTransport({ action })` adds a caption-size text action on the footer right (60% → 100% opacity on hover).
- Starter: Pad 2D leaves the default modules (still in "Add module"); Randomize in the footer; a `window` range slider clips the traces' span.

## 0.1.0 — 2026-08-28

First release. Rework of `superserif-custom-ui` into an importable library.

- Panel, Folder (grid layout, rename, context menu, solo, reorder), Number, Slider (inline, editable max), Knob (stack), Pad 2D, Pads, Toggle, Select (+ preview), Color, Text, Button, Menu, Curve, Monitor, Mixer, Presets, Transport, fps readout.
- Tokens on `.ssui-panel`, `@layer ssui.*`, light / dark / auto with `@property` crossfade, unlayered `revert-layer` shield.
- Builds: ESM (`index`, `auto`), IIFE (`SSUI`), `ssui.css`, types.
