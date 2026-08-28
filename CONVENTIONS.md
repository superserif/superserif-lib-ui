# @superserif/ui — conventions for contributors (human or agent)

Read `_ref/` for the legacy and the two references. Read `src/core/*` and `src/controls/NumberControl.ts`, `SliderControl.ts`, `SelectControl.ts`, `ToggleControl.ts` before writing a control: they are the pattern.

## Files
- One control = `src/controls/<Name>Control.ts` + `src/styles/controls/<name>.css`. Nothing else. Do not edit `Container.ts`, `Panel.ts`, `index.ts`, `tokens.css`, `base.css` — public signatures there are frozen; if you need a new token, add it to your own CSS scoped under `.ssui-<name>` and say so in your report.
- CSS lives in `@layer ssui.controls { … }`. Class names: block `ssui-<name>`, element `ssui-<name>__<part>`, variant `ssui-<name>--<variant>`. State is a data attribute, never a class: `data-ssui-state="idle|dragging|editing|open"`, `data-ssui-on`, `data-ssui-open`…
- Only `var(--ssui-*)` tokens for color, spacing, radius, type, motion. No raw hex, no raw ms. Read `src/styles/tokens.css` for the list.

## Controller pattern
- Extend `Controller<T, Options>`; call `this.mount()` at the end of your constructor; implement `render(): HTMLElement` (build DOM once) and `update(v: T): void` (value → DOM). Set `this.stacked = true` before `mount()` when the control needs the full row width (label above control).
- User input → `this.setValue(v)` while dragging, `this.setValue(v, true)` or `this.emit('finish', v)` on release. Never write the binding directly.
- Drag: `trackPointer(el, {...})` from `src/core/pointer.ts`. Never `window.addEventListener('mousemove')`. Call `this.setState('dragging')` / `'idle'` so the panel dot lights up and `listen()` pauses.
- Keyboard: `keyDelta()` from `src/core/keys.ts`; every interactive element needs `tabindex`, a role, and `aria-value*` where applicable. Focus ring comes free from `:focus-visible`.
- Canvas: size on `ResizeObserver`, `dpr = min(2, devicePixelRatio)`, `ctx.setTransform(dpr,0,0,dpr,0,0)` each draw. Read colors with `getComputedStyle(this.el.closest('.ssui-panel')).getPropertyValue('--ssui-color-…')`. Override `onThemeChange()` to redraw (it's called every frame during the theme crossfade).
- Embedded numeric readouts: `NumberControl.widget(binding, opts)` gives you a scrubbable value without the row; proxy the binding so writes go through your `setValue` (see `SliderControl.render`).
- Class fields: `tsconfig` has `useDefineForClassFields: false` on purpose — subclass fields would otherwise reset after `super()` runs `mount()`. Do not change it. Field *initializers* (`private foo = 0`) in a subclass still run after `super()`, i.e. after `mount()`/`render()` — declare with `!` and assign inside `render()`. Also: `NumberControl` has private `box`/`dragStart`; pick other names in subclasses.
- Motion: two easings only, `--ssui-ease-standard` for things moving into place, `--ssui-ease-spring` for things the user released. Transition specific properties, never `all`. Durations from tokens. Transitions off while `[data-ssui-state="dragging"]`.

## Verify
- `npx tsc --noEmit` clean.
- A dev page `playground/dev-<name>.html` + `playground/dev-<name>.ts` mounting your control in a light and a dark panel (copy the shape of `playground/main.ts`). Dev server already runs on http://localhost:4402 — open `/dev-<name>.html`.
- Playwright MCP is shared: open your own tab (`browser_tabs` action `new`), work only in it, close it when done. Screenshot both themes, check hover/drag/keyboard, check the console is clean.

## Type (decided 2026-08-28)
One family (Inter, `--ssui-font-family`; `--ssui-font-family-mono` aliases it), one size (`--ssui-font-size` 11px — the xs/sm/md/lg tokens all resolve to it), one weight (500). Hierarchy is colour only: text / text-2 / text-3. Numbers are tabular through `--ssui-font-features`. Cards (`--ssui-radius-lg`) are 8px, the panel is 8 + padding.

## Modules (starter)
- A "module" is a Folder. `panel.addFolder(title, { layout: 'grid', columns: 3 })` lays children side by side; knobs use `layout: 'stack'` there.
- `new Panel({ reorderable: true, storageKey })` lets folders be dragged by their header (threshold 6px; the header click still toggles); order persists under `ssui:<key>:order`. `container.move(child, index)`, `order()`, `setOrder(ids)`.
- `container.addMenu(label, items, { full, variant, icon })` is the "Add module…" button; items are plain actions.
- Sliders: `inline: true` = label + "value / max" line, thick full-width bar below.
- `new Panel({ editable: true })`: folders become modules — double-click renames (`rename` event), right-click opens Expand / Rename / Solo / Remove (`remove-request`, the panel removes), hover 200ms shows the SOLO pill; one solo at a time, the others get `data-ssui-dimmed` (opacity .6); `panel.on('panel-solo', folder|null)`.
- `container.addPads(target, key, { pads?, columns? })`: square on/off pads (`{ [key]: boolean }`), parameter name left of each pad, accent rim when on.
- Mixer `{ controls: false, pan: false, output: false }` = faders only.
- Layer gotcha: a rule that must beat a controls-layer rule (e.g. `.ssui-select__menu`) has to live in `@layer ssui.controls` too — layer order beats specificity.
- `new Panel({ fps: true })` shows the live frame rate in the header (accent under 50). `panel.setTransport({ playing, onToggle, onReset })` renders the play/pause pill + round reset in the footer centre (Figma 2073:1387); the footer is brand | transport | link (`link` option).
- Sliders with a range readout expose the max as a scrubbable number (`editableMax`, default on): drag "/ 3.00" to widen the range; the value is clamped and the fill re-scales.
- `panel.addPresets()` pins the bar under the title (flat, hairline below, outside the scrolling body); `{ placement: 'body' }` keeps it as a row. Pads default to one row of four with the caption inside the pad; captions (SOLO, PRESETS, PLAY, pad names) use `--ssui-font-size-caption` 9px + `--ssui-hairline-thin` 0.5px strokes.
