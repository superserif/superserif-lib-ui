# Changelog

## 0.1.1 — 2026-08-28

- Panel: collapsed state clips the body cleanly (no card edge showing); `setTransport({ action })` adds a caption-size text action on the footer right (60% → 100% opacity on hover).
- Starter: Pad 2D leaves the default modules (still in "Add module"); Randomize in the footer.

## 0.1.0 — 2026-08-28

First release. Rework of `superserif-custom-ui` into an importable library.

- Panel, Folder (grid layout, rename, context menu, solo, reorder), Number, Slider (inline, editable max), Knob (stack), Pad 2D, Pads, Toggle, Select (+ preview), Color, Text, Button, Menu, Curve, Monitor, Mixer, Presets, Transport, fps readout.
- Tokens on `.ssui-panel`, `@layer ssui.*`, light / dark / auto with `@property` crossfade, unlayered `revert-layer` shield.
- Builds: ESM (`index`, `auto`), IIFE (`SSUI`), `ssui.css`, types.
