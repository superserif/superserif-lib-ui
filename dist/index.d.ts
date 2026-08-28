declare interface AddOptions extends NumberOptions, ToggleOptions, TextOptions, Partial<Pick<SelectOptions<any>, 'options' | 'preview' | 'previewAnimate'>>, Partial<Pick<ColorOptions, 'alpha' | 'format'>> {
    color?: boolean;
}

declare interface AxisOptions {
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    invert?: boolean;
}

export declare interface BaseOptions {
    id?: string;
    label?: string;
    disabled?: boolean;
    hidden?: boolean;
    listen?: boolean;
}

export declare interface Binding<T> {
    read(): T;
    write(v: T): void;
    equals(a: T, b: T): boolean;
    readonly target: object | null;
    readonly key: string | null;
}

export declare function bindKey<T>(target: any, key: string, equals?: (a: T, b: T) => boolean): Binding<T>;

export declare function bindValue<T>(initial: T, equals?: (a: T, b: T) => boolean): Binding<T>;

/** two-key form: addPad2D(obj, 'x', 'y') — writes both keys, never replaces the object */
export declare function bindXY(target: any, xKey: string, yKey: string): Binding<XY>;

/** object form: addPad2D(obj, 'offset') where obj.offset = {x,y}; mutates in place */
export declare function bindXYObject(target: any, key: string): Binding<XY>;

/** A button (or a row of buttons). Not a value control: excluded from presets. */
export declare class ButtonControl extends Emitter<{
    click: [string];
    dispose: [];
}> {
    readonly el: HTMLElement;
    readonly id: string;
    readonly serializable = false;
    readonly buttons: HTMLButtonElement[];
    constructor(specs: ButtonSpec[], rowLabel?: string);
    click(i?: number): void;
    disable(on?: boolean): this;
    hide(on?: boolean): this;
    dispose(): void;
}

export declare interface ButtonOptions extends Omit<ButtonSpec, 'label' | 'onClick'> {
    label?: string;
}

export declare interface ButtonSpec {
    label: string;
    onClick?: () => void;
    variant?: 'default' | 'primary' | 'ghost';
    icon?: string;
    title?: string;
    id?: string;
}

declare type Child = ChildLike;

/** anything a container can hold: value controls, buttons, statics, preset bars, folders */
declare interface ChildLike {
    readonly el: HTMLElement;
    readonly id: string;
    dispose(): void;
    disable?(on?: boolean): unknown;
    hide?(on?: boolean): unknown;
}

/**
 * Color: swatch + hex field in the row; a popover (SV square, hue rail, alpha rail,
 * HSV/RGB readouts) that grows out of the swatch. Keeps the consumer's format.
 */
export declare class ColorControl extends Controller<ColorValue, ColorOptions> {
    readonly format: ColorFormat;
    readonly alpha: boolean;
    private hsv;
    private a;
    private mode;
    private box;
    private swatch;
    private hex;
    private pop;
    private sv;
    private hue;
    private alphaEl;
    private modeBtn;
    private hsvWidgets;
    private rgbWidgets;
    private hsvRow;
    private rgbRow;
    private dirtySinceOpen;
    private closeTimer;
    constructor(binding: Binding<ColorValue>, opts?: ColorOptions);
    private readInto;
    private rgba;
    private out;
    protected sanitize(v: ColorValue): ColorValue;
    /** object format: mutate the consumer's object in place (references stay valid) */
    protected setValue(v: ColorValue, commit?: boolean): void;
    private refreshSoon;
    private apply;
    private setHSV;
    private setRGBChannel;
    protected render(): HTMLElement;
    private wireSwatch;
    private wireHex;
    private dragging;
    private wireSliders;
    private wirePopover;
    private setMode;
    get isOpen(): boolean;
    open(): void;
    close(refocus?: boolean): void;
    /** position: fixed popover so it escapes the panel's overflow clip; clip origin = swatch center */
    private place;
    protected update(v: ColorValue): void;
    private paint;
}

declare type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'number' | 'object';

export declare interface ColorOptions extends BaseOptions {
    format?: ColorFormat;
    alpha?: boolean;
}

export declare type ColorValue = string | number | RGBA;

export declare abstract class Container extends Emitter<ContainerEvents> {
    readonly children: Child[];
    abstract readonly el: HTMLElement;
    protected abstract readonly bodyEl: HTMLElement;
    protected parent: Container | null;
    private ids;
    protected attach<C extends Child>(c: C): C;
    protected onChildrenChanged(): void;
    remove(c: Child): void;
    /** move a child to a new index (DOM + children array); emits 'reorder' */
    move(c: Child, index: number): void;
    /** current order as ids (persist it, then restore with setOrder) */
    order(): string[];
    setOrder(ids: string[]): void;
    /** the root Panel */
    get root(): Container;
    add(target: object, key: string, opts?: AddOptions): Controller<any, any>;
    addNumber(target: object, key: string, opts?: NumberOptions): NumberControl;
    addSlider(target: object, key: string, opts: SliderOptions): SliderControl;
    addKnob(target: object, key: string, opts?: KnobOptions): KnobControl;
    /** addPad2D(obj, 'offset') for {x,y} objects, or addPad2D(obj, 'x', 'y', opts) for two keys */
    addPad2D(target: object, key: string, yKeyOrOpts?: string | Pad2DOptions, maybeOpts?: Pad2DOptions): Pad2DControl;
    addToggle(target: object, key: string, opts?: ToggleOptions): ToggleControl;
    addSelect<T = any>(target: object, key: string, opts: SelectOptions<T>): SelectControl<T>;
    addColor(target: object, key: string, opts?: ColorOptions): ColorControl;
    addText(target: object, key: string, opts?: TextOptions): TextControl;
    addButton(label: string, onClick: () => void, opts?: ButtonOptions): ButtonControl;
    addButtons(specs: ButtonSpec[], rowLabel?: string): ButtonControl;
    addCurve(target: object, key: string, opts?: CurveOptions): CurveControl;
    addMonitor(target: object, key: string, opts?: MonitorOptions): MonitorControl;
    addMenu(label: string, items: MenuItem[], opts?: MenuOptions): MenuControl;
    addMixer(target: object, key: string, opts?: MixerOptions): MixerControl;
    /** square on/off pads, one per key of the bound object: addPads(S, 'pads') with S.pads = { amp: true, freq: false } */
    addPads(target: object, key: string, opts?: PadBankOptions): PadBankControl;
    addSeparator(): StaticControl;
    addLabel(text: string): StaticControl;
    /** deep lookup by id or 'folder/id' path */
    get(path: string): Child | undefined;
    /** flat list of value controllers, deep */
    controllers(): Controller<any, any>[];
    folders(): Container[];
    /** registers an id, deduping with -2, -3 … */
    registerId(id: string): string;
    disable(on?: boolean): this;
    hide(on?: boolean): this;
    show(): this;
    reset(): this;
    /** pull every binding into the DOM now (after writing to the target object without listen()) */
    refresh(): this;
    onChange(cb: (ctrl: Controller<any, any>, value: unknown) => void): this;
    onFinishChange(cb: (ctrl: Controller<any, any>, value: unknown) => void): this;
    toJSON(): Record<string, unknown>;
    fromJSON(data: Record<string, unknown>, opts?: {
        silent?: boolean;
    }): void;
    abstract get id(): string;
    dispose(): void;
}

/** Shared by Panel and Folder: owns children, ids, serialization. */
declare type ContainerEvents = {
    add: [Child];
    remove: [Child];
    reorder: [Child, number];
    dispose: [];
    change: [Controller<any, any>, unknown];
    finish: [Controller<any, any>, unknown];
    /** Folder: title changed by the user */
    rename: [string];
    /** Folder: solo toggled */
    solo: [boolean];
    /** Folder: the user asked to remove this block (via its context menu) */
    'remove-request': [];
    /** Panel: soloed block changed (null = none) */
    'panel-solo': [Container | null];
};

/**
 * Base for every value control. Value flow:
 *   user input -> setValue(v, commit) -> sanitize -> binding.write -> emit('change') sync
 *              -> Scheduler.request(this) -> flush() -> update(v) (DOM, once per frame)
 */
export declare abstract class Controller<T, O extends BaseOptions = BaseOptions> extends Emitter<ControllerEvents<T>> implements Schedulable {
    protected binding: Binding<T>;
    protected opts: O;
    readonly el: HTMLElement;
    readonly id: string;
    readonly initial: T;
    protected labelEl: HTMLElement;
    protected controlEl: HTMLElement;
    protected last: T;
    protected cleanups: (() => void)[];
    protected unlisten: (() => void) | null;
    protected _state: RowState;
    protected inputId: string;
    /** subclasses set true when the row should stack label above control */
    protected stacked: boolean;
    /** serializable in presets (Buttons/Monitors set false) */
    readonly serializable: boolean;
    constructor(binding: Binding<T>, opts: O, kind: string);
    /** call at the end of subclass constructors */
    protected mount(): void;
    protected abstract render(): HTMLElement;
    protected abstract update(v: T): void;
    protected sanitize(v: T): T;
    protected clone(v: T): T;
    /** canvas controls override to redraw with new tokens */
    onThemeChange(): void;
    get value(): T;
    set value(v: T);
    protected setValue(v: T, commit?: boolean): void;
    flush(): void;
    poll(): void;
    protected setState(s: RowState): void;
    get state(): RowState;
    label(text: string): this;
    onChange(cb: (v: T) => void): this;
    onFinishChange(cb: (v: T) => void): this;
    listen(on?: boolean): this;
    bind(binding: Binding<T>): this;
    disable(on?: boolean): this;
    enable(): this;
    hide(on?: boolean): this;
    show(): this;
    refresh(): this;
    reset(): this;
    toJSON(): T;
    fromJSON(v: T): void;
    dispose(): void;
}

declare type ControllerEvents<T> = {
    change: [T];
    finish: [T];
    dispose: [];
    state: [string];
};

/**
 * Curve editor. Outputs a function, a CSS easing string, or a LUT.
 * Defining micro-interaction: an accent dot runs along the curve so the easing is
 * seen as motion, not only as a shape.
 */
export declare class CurveControl extends Controller<CurveValue, CurveOptions> {
    private stage;
    private svg;
    private path;
    private arms;
    private handlesG;
    private ball;
    private ballX;
    private cssOut;
    private presetName;
    private presetMenu;
    private presetBox;
    private modeBtns;
    private handles;
    private fn;
    private time;
    private stopAnim;
    private copyTimer;
    private dragIndex;
    private focusIndex;
    private presets;
    /** viewBox units per CSS px, kept current by a ResizeObserver on the stage */
    private sx;
    private sy;
    constructor(binding: Binding<CurveValue>, opts?: CurveOptions);
    toFunction(): (t: number) => number;
    toCSS(samples?: number): string;
    toArray(n: number): Float32Array;
    /** name of the matching preset or null */
    presetOf(v?: CurveValue): string | null;
    protected render(): HTMLElement;
    protected sanitize(v: CurveValue): CurveValue;
    protected update(v: CurveValue): void;
    private syncHandles;
    private fitHandleRadius;
    private drawBall;
    private toLocal;
    private moveHandle;
    private nudge;
    private onHandleKey;
    private onStageKey;
    private onDblClick;
    private switchMode;
    applyPreset(name: string): void;
    private copyCSS;
    private get isMenuOpen();
    private get curveRoot();
    private openMenu;
    private closeMenu;
    private setMenuActive;
    private onMenuKey;
    onThemeChange(): void;
    dispose(): void;
}

export declare interface CurveOptions extends BaseOptions {
    /** which editors are available; 'both' shows a mode switch (default) */
    mode?: 'bezier' | 'points' | 'both';
    presets?: Record<string, CurveValue>;
    height?: number;
    /** allow y outside 0..1 (default true) */
    overshoot?: boolean;
}

export declare type CurveValue = {
    type: 'bezier';
    points: [number, number, number, number];
} | {
    type: 'points';
    points: [number, number][];
};

declare interface DragSession {
    x: number;
    y: number;
    x0: number;
    y0: number;
    dx: number;
    dy: number;
    mx: number;
    my: number;
    shift: boolean;
    alt: boolean;
    meta: boolean;
    moved: boolean;
}

declare class Emitter<E extends Record<string, unknown[]>> {
    private map;
    on<K extends keyof E>(ev: K, cb: Listener<E[K]>): () => void;
    once<K extends keyof E>(ev: K, cb: Listener<E[K]>): () => void;
    off<K extends keyof E>(ev: K, cb: Listener<E[K]>): void;
    emit<K extends keyof E>(ev: K, ...args: E[K]): void;
    clear(): void;
}

declare type Events = {
    change: [];
    load: [Preset];
    save: [Preset];
    remove: [string];
    dirty: [boolean];
};

export declare class Folder extends Container {
    readonly el: HTMLElement;
    protected readonly bodyEl: HTMLElement;
    private _id;
    private header;
    private countEl;
    private titleEl;
    private gripEl;
    private soloBtn;
    private menuEl;
    private opts;
    constructor(title: string, opts?: FolderOptions);
    /** (re)wire rename / context menu / solo — Panel calls this with its `editable` defaults */
    setEditable(o: Pick<FolderOptions, 'renamable' | 'contextMenu' | 'soloable'>): void;
    get id(): string;
    /** the element a reorder drag starts from */
    get handle(): HTMLElement;
    get titleText(): string;
    title(t: string): this;
    get collapsed(): boolean;
    set collapsed(v: boolean);
    toggle(): void;
    open(): this;
    close(): this;
    get solo(): boolean;
    set solo(v: boolean);
    /** dimmed = another block is soloed */
    set dimmed(v: boolean);
    get isRenaming(): boolean;
    rename(): void;
    private openMenu;
    private closeMenu;
    addFolder(title: string, opts?: FolderOptions): Folder;
    protected onChildrenChanged(): void;
}

export declare interface FolderOptions {
    collapsed?: boolean;
    id?: string;
    /** show the number of controls in the header (off by default) */
    count?: boolean;
    /** 'grid' lays children side by side (knob banks); columns default 3 */
    layout?: 'list' | 'grid';
    columns?: number;
    /** double-click the header to rename (emits 'rename') */
    renamable?: boolean;
    /** right-click menu with Rename / Remove (Remove emits 'remove-request'; the parent removes) */
    contextMenu?: boolean;
    /** SOLO pill on hover: only this block "plays"; the panel dims the others (emits 'solo') */
    soloable?: boolean;
}

/** Knob = dial with a tick ring + embedded scrubbable Number readout. */
export declare class KnobControl extends NumberControl {
    private kbox;
    private dial;
    private readout;
    private ticks;
    private sweep;
    private kStart;
    private prevAngle;
    private dragAngle;
    constructor(binding: Binding<number>, opts?: KnobOptions);
    protected render(): HTMLElement;
    private valueToAngle;
    protected update(v: number): void;
    edit(): void;
    get widget(): HTMLElement;
}

export declare interface KnobOptions extends NumberOptions {
    size?: 'sm' | 'md' | 'lg';
    /** degrees of travel, default 270 */
    sweep?: number;
    /** tick count around the sweep, default 15 */
    ticks?: number;
    /** 'inline' = label left, dial + readout right (default); 'stack' = readout above, dial, label below */
    layout?: 'inline' | 'stack';
    /** 'linear' = vertical drag (default), 'rotary' = follow the pointer angle */
    mode?: 'rotary' | 'linear';
}

declare type Listener<A extends unknown[]> = (...args: A) => void;

/**
 * Drag-to-reorder for a container's direct children that expose a `handle` (Folders).
 * The dragged block follows the pointer; siblings slide out of the way; the order is
 * committed with container.move() on release. Returns a dispose function.
 */
export declare function makeReorderable(container: Container): () => void;

/** A button that opens a list of actions ("Add module…"). Not a value control. */
export declare class MenuControl extends Emitter<{
    select: [MenuItem];
    open: [];
    close: [];
    dispose: [];
}> {
    items: MenuItem[];
    private opts;
    readonly el: HTMLElement;
    readonly id: string;
    readonly serializable = false;
    private box;
    private trigger;
    private menu;
    private active;
    private optionEls;
    private outside;
    constructor(label: string, items: MenuItem[], opts?: MenuOptions);
    setItems(items: MenuItem[]): void;
    get isOpen(): boolean;
    open(): void;
    close(refocus?: boolean): void;
    private setActive;
    private pick;
    private onKey;
    disable(on?: boolean): this;
    hide(on?: boolean): this;
    dispose(): void;
}

export declare interface MenuItem {
    label: string;
    onSelect?: () => void;
    disabled?: boolean;
    hint?: string;
    id?: string;
}

export declare interface MenuOptions {
    icon?: 'plus' | 'more' | 'chevron' | 'none';
    variant?: 'default' | 'primary' | 'ghost';
    align?: 'left' | 'right';
    id?: string;
    full?: boolean;
}

export declare interface MixerChannel {
    gain: number;
    pan: number;
    mute: boolean;
    solo: boolean;
}

/** Mixer = channel columns with vertical faders, a sliding selection highlight, gain/pan readouts and Mute/Solo for the selected channel. */
export declare class MixerControl extends Controller<MixerValue, MixerOptions> {
    private box;
    private channelsEl;
    private highlight;
    private dot;
    private cols;
    private gainRead;
    private panRead;
    private panField;
    private muteBtn;
    private soloBtn;
    private roundsEl;
    private names;
    private gMin;
    private gMax;
    private gStep;
    private height;
    private dragStart;
    constructor(binding: Binding<MixerValue>, opts?: MixerOptions);
    private get hasOutput();
    private normalize;
    protected sanitize(v: MixerValue): MixerValue;
    protected clone(v: MixerValue): MixerValue;
    private edit;
    private selIsOutput;
    private gainOf;
    private setGain;
    protected render(): HTMLElement;
    select(i: number): void;
    protected update(raw: MixerValue): void;
}

export declare interface MixerOptions extends BaseOptions {
    /** channel names, default ['Ch 1','Ch 2','Ch 3','Ch 4'] */
    channels?: string[];
    /** show the output fader, default true */
    output?: boolean;
    gain?: {
        min?: number;
        max?: number;
        step?: number;
    };
    pan?: boolean;
    /** false = faders only: no gain/pan readouts, no mute/solo */
    controls?: boolean;
    /** fader travel in px, default 96 */
    height?: number;
}

export declare interface MixerValue {
    channels: MixerChannel[];
    output: number;
    selected: number;
}

/** Read-only readout, optionally with a sparkline. Always listening; never in presets. */
export declare class MonitorControl extends Controller<unknown, MonitorOptions> {
    readonly serializable: boolean;
    private out;
    private canvas;
    private buf;
    private head;
    private filled;
    private acc;
    private stopTick;
    constructor(binding: Binding<unknown>, opts?: MonitorOptions);
    protected render(): HTMLElement;
    private sample;
    protected update(v: unknown): void;
    onThemeChange(): void;
    private draw;
}

export declare interface MonitorOptions extends BaseOptions {
    graph?: boolean;
    min?: number;
    max?: number;
    /** ring buffer length (default 64) */
    samples?: number;
    /** ms between samples; 0 = every frame */
    interval?: number;
    format?: (v: unknown) => string;
}

export declare class NumberControl extends Controller<number, NumberOptions> {
    min: number;
    max: number;
    step: number;
    precision: number;
    private valueEl;
    private inputEl;
    private box;
    private dragStart;
    constructor(binding: Binding<number>, opts?: NumberOptions, kind?: string);
    /** the standalone widget (also used embedded by Slider / Knob / Pad2D) */
    static widget(binding: Binding<number>, opts: NumberOptions): NumberControl;
    protected render(): HTMLElement;
    protected sanitize(v: number): number;
    protected update(v: number): void;
    edit(): void;
    private commitEdit;
    private cancelEdit;
    /** for composite controls: the widget element without the row */
    get widget(): HTMLElement;
}

export declare interface NumberOptions extends BaseOptions {
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    unit?: string;
    /** value change per pixel of vertical scrub at 1x (default: step) */
    scrubSpeed?: number;
    wheel?: boolean;
    /** internal: render without label row (used inside Slider/Knob/Pad2D) */
    bare?: boolean;
    dim?: boolean;
}

/** Pad2D = square surface with a reactive dot field + two scrubbable readouts. */
export declare class Pad2DControl extends Controller<XY, Pad2DOptions> {
    private ax;
    private ay;
    private surface;
    private canvas;
    private thumb;
    private rx;
    private ry;
    private ro;
    private size;
    constructor(binding: Binding<XY>, opts?: Pad2DOptions);
    private static axis;
    protected render(): HTMLElement;
    protected sanitize(v: XY): XY;
    private norm;
    protected update(v: XY): void;
    onThemeChange(): void;
    private draw;
}

export declare interface Pad2DOptions extends BaseOptions {
    x?: AxisOptions;
    y?: AxisOptions;
    /** surface size in px, sets --ssui-pad-size (default 128) */
    size?: number;
    /** dots per side (default 8) */
    grid?: number;
}

/**
 * Pad bank: square on/off pads (MPC-like, very light skeuomorphism), each tied to a parameter.
 * Value: { [key]: boolean }. The parameter name sits discreetly left of its pad.
 */
export declare class PadBankControl extends Controller<PadBankValue, PadBankOptions> {
    private pads;
    private box;
    constructor(binding: Binding<PadBankValue>, opts?: PadBankOptions);
    protected render(): HTMLElement;
    togglePad(key: string): void;
    set(key: string, on: boolean): void;
    protected sanitize(v: PadBankValue): PadBankValue;
    protected update(v: PadBankValue): void;
}

export declare interface PadBankOptions extends BaseOptions {
    /** which pads, in order; default: every key of the bound object */
    pads?: (string | PadSpec)[];
    /** pads per row, default 4 (one row of four) */
    columns?: number;
}

export declare type PadBankValue = Record<string, boolean>;

export declare interface PadSpec {
    key: string;
    label?: string;
}

export declare class Panel extends Container {
    readonly el: HTMLElement;
    protected readonly bodyEl: HTMLElement;
    readonly theme: Theme;
    readonly presets: PresetStore;
    private _id;
    private header;
    private collapseBtn;
    private cleanups;
    private opts;
    private soloed;
    private footerCenter;
    private footerRight;
    private subEl;
    private fpsEl;
    private stopFps;
    constructor(opts?: PanelOptions);
    get id(): string;
    get themeMode(): ThemeMode;
    set themeMode(m: ThemeMode);
    get resolvedTheme(): ResolvedTheme;
    setTheme(m: ThemeMode): this;
    setToken(name: string, value: string): this;
    get collapsed(): boolean;
    set collapsed(v: boolean);
    toggle(): void;
    open(): this;
    close(): this;
    title(t: string): this;
    addFolder(title: string, opts?: FolderOptions): Folder;
    /** the block currently soloed, or null */
    get solo(): Folder | null;
    setSolo(f: Folder | null): void;
    /** preset bar: pinned under the title by default (outside the scrolling body); `placement: 'body'` adds it as a row */
    addPresets(opts?: PresetBarOptions & {
        placement?: 'header' | 'body';
    }): PresetBar;
    private startFps;
    setTransport(o?: TransportOptions): Transport;
    private enableDrag;
    private enableResize;
    private geomKey;
    private saveGeometry;
    private restoreGeometry;
    dispose(): void;
}

export declare interface PanelOptions {
    title?: string;
    meta?: string;
    container?: HTMLElement;
    position?: PanelPosition;
    width?: number;
    theme?: ThemeMode;
    collapsed?: boolean;
    draggable?: boolean;
    resizable?: boolean;
    /** key toggles collapse; null disables. default 'h' for floating panels, null for position:'static' */
    hotkey?: string | null;
    /** persists geometry + presets under this key */
    storageKey?: string;
    tokens?: Record<string, string>;
    id?: string;
    footer?: boolean | HTMLElement;
    /** folders can be dragged by their header to reorder (persisted with storageKey) */
    reorderable?: boolean;
    /** folders become "modules": double-click renames, right-click offers Rename / Remove, hover shows a SOLO pill */
    editable?: boolean;
    /** live frame rate in the header, next to the collapse chevron */
    fps?: boolean;
    /** footer link on the right (default: superserif.studio "see our work"); false hides it */
    link?: {
        label: string;
        href: string;
    } | false;
}

export declare type PanelPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'static';

declare interface PointerHandlers {
    threshold?: number;
    immediate?: boolean;
    onStart?(s: DragSession, e: PointerEvent): void;
    onMove?(s: DragSession, e: PointerEvent): void;
    onEnd?(s: DragSession, e: PointerEvent): void;
    onTap?(e: PointerEvent): void;
    cursor?: string;
    /** return true to let this pointerdown through untouched (e.g. a button inside a drag handle) */
    ignore?(e: PointerEvent): boolean;
}

export declare interface Preset {
    name: string;
    values: Record<string, unknown>;
    createdAt: number;
    updatedAt: number;
}

/**
 * Preset bar: pick / save / more. Placed with `panel.addPresets()`.
 * Order of operations for defaults: the store snapshots "Default" in a microtask
 * after the panel is built, so add your controls synchronously after `new Panel()`;
 * anything added later is merged into the defaults with its value at add time.
 */
export declare class PresetBar {
    readonly panel: Panel;
    readonly opts: PresetBarOptions;
    readonly el: HTMLElement;
    readonly id = "presets";
    readonly serializable = false;
    private store;
    private nameEl;
    private dirtyEl;
    private input;
    private pick;
    private more;
    private saveBtn;
    private fileInput;
    private editMode;
    private offs;
    private liveTimer;
    private copiedTimer;
    constructor(panel: Panel, opts?: PresetBarOptions);
    private refresh;
    /** the one micro-interaction: the name cross-fades in (4px rise) */
    private swapName;
    /** header dot pulses once on load */
    private pulse;
    private onSave;
    private startEdit;
    private nextName;
    private commitEdit;
    private cancelEdit;
    private exportFile;
    private onImportFile;
    private copy;
    disable(on?: boolean): this;
    hide(on?: boolean): this;
    dispose(): void;
}

export declare interface PresetBarOptions {
    allowDelete?: boolean;
    allowExport?: boolean;
    includeDefault?: boolean;
}

export declare interface PresetFile {
    format: 'ssui-presets';
    version: 1;
    panel: string;
    presets: Preset[];
}

/** minimal view of a Container the store relies on (lets tests pass a fake) */
declare interface PresetHost {
    readonly id: string;
    toJSON(): Record<string, unknown>;
    fromJSON(data: Record<string, unknown>, opts?: {
        silent?: boolean;
    }): void;
    controllers(): Controller<any, any>[];
    on(ev: 'add', cb: (child: any) => void): () => void;
}

/**
 * Presets = named snapshots of `panel.toJSON()`.
 *
 * Defaults capture: the Panel builds its store before any control exists, so the
 * "Default" snapshot is taken lazily — in a microtask after construction (which
 * lands after the consumer's synchronous `add*` calls), or on the first
 * save/load/applyDefault/dirty check, whichever comes first. Controls added later
 * are merged into the defaults with the value they have when added.
 */
export declare class PresetStore extends Emitter<Events> {
    readonly panel: Container | PresetHost;
    readonly storageKey: string | null;
    current: string | null;
    readonly adapter: StorageAdapter;
    private presets;
    private defaults;
    private loaded;
    private lastDirty;
    private key;
    private offs;
    private seen;
    private warned;
    constructor(panel: Container | PresetHost, storageKey: string | null, adapter?: StorageAdapter);
    /** snapshot current values as "Default" (idempotent; merges ids added later) */
    captureDefaults(): Record<string, unknown>;
    get hasDefaults(): boolean;
    list(): Preset[];
    has(name: string): boolean;
    getPreset(name: string): Preset | undefined;
    get dirty(): boolean;
    /** recompute and emit when it flips */
    checkDirty(): boolean;
    save(name: string): Preset;
    load(name: string | null): void;
    applyDefault(): void;
    remove(name: string): void;
    rename(from: string, to: string): void;
    exportJSON(): string;
    importJSON(json: string, opts?: {
        merge?: boolean;
    }): number;
    clearAll(): void;
    private read;
    private write;
    /** subscribe to `finish` of every controller, present and future, for dirty tracking */
    private watch;
    private warnOnce;
    dispose(): void;
}

export declare type PreviewFn<T> = (ctx: CanvasRenderingContext2D, value: T, w: number, h: number, t: number, tokens: (name: string) => string) => void;

export declare type ResolvedTheme = 'light' | 'dark';

export declare type RGBA = {
    r: number;
    g: number;
    b: number;
    a?: number;
};

declare type RowState = 'idle' | 'dragging' | 'editing' | 'open';

/**
 * One rAF loop for the whole library. Controllers request a DOM update (flushed
 * once per frame) and can be polled (`listen`) so external writes to the target
 * object show up without proxies.
 */
declare interface Schedulable {
    flush(): void;
    poll(): void;
    tick?(dt: number): void;
}

export declare const Scheduler: SchedulerImpl;

declare class SchedulerImpl {
    private requests;
    private listeners;
    private tickers;
    private raf;
    private last;
    request(c: Schedulable): void;
    listen(c: Schedulable): () => void;
    animate(c: Schedulable): () => void;
    unlisten(c: Schedulable): void;
    private start;
    private frame;
}

export declare class SelectControl<T = string | number> extends Controller<T, SelectOptions<T>> {
    readonly items: SelectOption<T>[];
    private box;
    private trigger;
    private indexEl;
    private currentEl;
    private menu;
    private optionEls;
    private active;
    private canvas;
    private time;
    private stopAnim;
    private typeahead;
    private typeTimer;
    constructor(binding: Binding<T>, opts: SelectOptions<T>);
    static normalize<T>(o: SelectOptions<T>['options']): SelectOption<T>[];
    protected render(): HTMLElement;
    get isOpen(): boolean;
    open(): void;
    close(refocus?: boolean): void;
    private selectedIndex;
    private setActive;
    select(i: number): void;
    private onKey;
    protected update(v: T): void;
    onThemeChange(): void;
    private draw;
}

export declare type SelectOption<T> = {
    label: string;
    value: T;
};

export declare interface SelectOptions<T = string | number> extends BaseOptions {
    options: T[] | Record<string, T> | SelectOption<T>[];
    /** draw a small canvas under the row for the current option */
    preview?: PreviewFn<T>;
    previewAnimate?: boolean;
}

/** Slider = track + embedded scrubbable Number readout. */
export declare class SliderControl extends NumberControl {
    private track;
    private readout;
    private rangeEl;
    private maxRead;
    private ro;
    constructor(binding: Binding<number>, opts: SliderOptions);
    protected render(): HTMLElement;
    protected update(v: number): void;
    /** raise or lower the range; the current value is clamped into it */
    setMax(m: number): void;
    /** Slider's own box is the track; the Number's edit() targets the readout */
    edit(): void;
}

export declare interface SliderOptions extends NumberOptions {
    min: number;
    max: number;
    /** show "/ max" after the value */
    showRange?: boolean;
    /** inline: label + "value / max" on one line, full-width bar below (Figma "Sliders Container") */
    inline?: boolean;
    /** the "/ max" readout is itself scrubbable, so the range can be raised from the UI (default true when shown) */
    editableMax?: boolean;
}

/** Separator and Label: layout-only nodes with the same lifecycle shape as controls. */
declare class StaticControl {
    readonly el: HTMLElement;
    readonly id: string;
    readonly serializable = false;
    constructor(kind: 'separator' | 'label', text?: string);
    text(t: string): this;
    hide(on?: boolean): this;
    disable(): this;
    dispose(): void;
}

export declare interface StorageAdapter {
    get(key: string): string | null;
    set(key: string, v: string): void;
    remove(key: string): void;
}

export declare class TextControl extends Controller<string, TextOptions> {
    private input;
    constructor(binding: Binding<string>, opts?: TextOptions);
    protected render(): HTMLElement;
    protected sanitize(v: string): string;
    protected update(v: string): void;
}

export declare interface TextOptions extends BaseOptions {
    placeholder?: string;
    maxLength?: number;
    multiline?: boolean;
}

export declare class Theme extends Emitter<{
    change: [ResolvedTheme];
    settle: [ResolvedTheme];
    frame: [];
}> {
    private root;
    private mq;
    private mode;
    private timer;
    private raf;
    constructor(root: HTMLElement, mode?: ThemeMode);
    get(): ThemeMode;
    resolved(): ResolvedTheme;
    set(mode: ThemeMode, animate?: boolean): void;
    private onSystem;
    private transition;
    read(token: string): string;
    dispose(): void;
}

export declare type ThemeMode = 'light' | 'dark' | 'auto';

export declare class ToggleControl extends Controller<boolean, ToggleOptions> {
    private btn;
    private pulseTimer;
    constructor(binding: Binding<boolean>, opts?: ToggleOptions);
    protected render(): HTMLElement;
    toggle(): void;
    protected sanitize(v: boolean): boolean;
    protected update(v: boolean): void;
}

export declare interface ToggleOptions extends BaseOptions {
    indicator?: boolean;
}

/** pointer-capture drag helper. Every control uses this; no window.mousemove anywhere. */
export declare function trackPointer(el: HTMLElement, hd: PointerHandlers): () => void;

export declare interface Transport {
    playing: boolean;
    el: HTMLElement;
    dispose(): void;
}

export declare interface TransportOptions {
    playing?: boolean;
    onToggle?: (playing: boolean) => void;
    onReset?: () => void;
    /** labels, default Play / Pause */
    labels?: [string, string];
    /** a text action on the right of the footer (e.g. Randomize); replaces the link */
    action?: {
        label: string;
        onClick: () => void;
    };
}

export declare const version = "0.1.0";

export declare interface XY {
    x: number;
    y: number;
}

export { }
