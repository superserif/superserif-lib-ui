class K {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  on(t, e) {
    let s = this.map.get(t);
    return s || this.map.set(t, s = /* @__PURE__ */ new Set()), s.add(e), () => this.off(t, e);
  }
  once(t, e) {
    const s = this.on(t, ((...i) => {
      s(), e(...i);
    }));
    return s;
  }
  off(t, e) {
    this.map.get(t)?.delete(e);
  }
  emit(t, ...e) {
    const s = this.map.get(t);
    if (s)
      for (const i of [...s]) i(...e);
  }
  clear() {
    this.map.clear();
  }
}
class Et {
  constructor() {
    this.requests = /* @__PURE__ */ new Set(), this.listeners = /* @__PURE__ */ new Set(), this.tickers = /* @__PURE__ */ new Set(), this.raf = 0, this.last = 0, this.frame = (t) => {
      this.raf = 0;
      const e = Math.min(64, t - this.last);
      if (this.last = t, this.requests.size) {
        const s = [...this.requests];
        this.requests.clear();
        for (const i of s) i.flush();
      }
      for (const s of this.listeners) s.poll();
      for (const s of this.tickers) s.tick?.(e);
      (this.listeners.size || this.tickers.size || this.requests.size) && (this.raf = requestAnimationFrame(this.frame));
    };
  }
  request(t) {
    this.requests.add(t), this.start();
  }
  listen(t) {
    return this.listeners.add(t), this.start(), () => this.listeners.delete(t);
  }
  animate(t) {
    return this.tickers.add(t), this.start(), () => this.tickers.delete(t);
  }
  unlisten(t) {
    this.listeners.delete(t), this.tickers.delete(t), this.requests.delete(t);
  }
  start() {
    this.raf || (this.last = performance.now(), this.raf = requestAnimationFrame(this.frame));
  }
}
const B = new Et();
let At = 0;
const ot = (a = "ssui") => `${a}-${(++At).toString(36)}`;
function o(a, t = {}, e = []) {
  const s = document.createElement(a);
  kt(s, t);
  for (const i of e)
    i == null || i === !1 || s.append(typeof i == "string" ? document.createTextNode(i) : i);
  return s;
}
function kt(a, t) {
  for (const [e, s] of Object.entries(t)) {
    if (s == null || s === !1) {
      a.removeAttribute(e);
      continue;
    }
    if (e === "class") {
      a.setAttribute("class", String(s));
      continue;
    }
    a.setAttribute(e, s === !0 ? "" : String(s));
  }
}
function $(a) {
  const t = document.createElement("template");
  return t.innerHTML = a.trim(), t.content.firstElementChild;
}
const E = {
  chevron: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>'),
  check: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>'),
  more: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><circle cx="3.5" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12.5" cy="8" r="1.2"/></svg>'),
  copy: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2"/></svg>'),
  plus: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg>'),
  play: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="ssui-icon-play"><path d="M5 3.6v8.8a.6.6 0 0 0 .92.5l6.6-4.4a.6.6 0 0 0 0-1L5.92 3.1A.6.6 0 0 0 5 3.6Z"/></svg>'),
  pause: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="ssui-icon-pause"><rect x="4" y="3.5" width="2.6" height="9" rx=".8"/><rect x="9.4" y="3.5" width="2.6" height="9" rx=".8"/></svg>'),
  refresh: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.6 6.2A5 5 0 1 0 13 8.6"/><path d="M12.8 3v3.4H9.4"/></svg>'),
  grip: () => $('<svg viewBox="0 0 12 12" width="12" height="12" fill="currentColor"><circle cx="4" cy="3" r="1"/><circle cx="8" cy="3" r="1"/><circle cx="4" cy="6" r="1"/><circle cx="8" cy="6" r="1"/><circle cx="4" cy="9" r="1"/><circle cx="8" cy="9" r="1"/></svg>'),
  close: () => $('<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>')
}, H = (a) => a.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item", bt = () => typeof matchMedia < "u" && matchMedia("(prefers-reduced-motion: reduce)").matches, St = (a) => !!a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable);
class _ extends K {
  constructor(t, e, s) {
    super(), this.binding = t, this.opts = e, this.cleanups = [], this.unlisten = null, this._state = "idle", this.inputId = ot("ssui-in"), this.stacked = !1, this.serializable = !0, this.id = e.id ?? H(e.label ?? t.key ?? s), this.initial = this.clone(t.read()), this.labelEl = o("label", { class: "ssui-row__label", for: this.inputId, id: `${this.inputId}-label` }, [e.label ?? t.key ?? s]), this.controlEl = o("div", { class: "ssui-row__control" }), this.el = o("div", { class: `ssui-row ssui-row--${s}`, "data-ssui-id": this.id, "data-ssui-state": "idle" }, [this.labelEl, this.controlEl]);
  }
  /** call at the end of subclass constructors */
  mount() {
    this.stacked && this.el.classList.add("ssui-row--stack"), this.controlEl.append(this.render()), this.last = this.clone(this.binding.read()), this.update(this.last), this.opts.disabled && this.disable(!0), this.opts.hidden && this.hide(!0), this.opts.listen && this.listen(!0);
  }
  sanitize(t) {
    return t;
  }
  clone(t) {
    return t !== null && typeof t == "object" ? JSON.parse(JSON.stringify(t)) : t;
  }
  /** canvas controls override to redraw with new tokens */
  onThemeChange() {
  }
  get value() {
    return this.binding.read();
  }
  set value(t) {
    this.setValue(t, !0);
  }
  setValue(t, e = !1) {
    const s = this.sanitize(t), i = this.binding.read();
    !this.binding.equals(s, i) && (this.binding.write(s), this.emit("change", this.binding.read())), B.request(this), e && this.emit("finish", this.binding.read());
  }
  flush() {
    const t = this.binding.read();
    this.last = this.clone(t), this.update(t);
  }
  poll() {
    if (this._state === "dragging" || this._state === "editing") return;
    const t = this.binding.read();
    this.binding.equals(t, this.last) || this.flush();
  }
  setState(t) {
    if (this._state === t) return;
    this._state = t, this.el.setAttribute("data-ssui-state", t);
    const e = this.el.closest(".ssui-panel");
    e && (e.querySelectorAll('.ssui-row[data-ssui-state="dragging"],.ssui-row[data-ssui-state="editing"]').length > 0 ? e.setAttribute("data-ssui-live", "") : e.removeAttribute("data-ssui-live")), this.emit("state", t);
  }
  get state() {
    return this._state;
  }
  label(t) {
    return this.labelEl.textContent = t, this;
  }
  onChange(t) {
    return this.on("change", t), this;
  }
  onFinishChange(t) {
    return this.on("finish", t), this;
  }
  listen(t = !0) {
    return t && !this.unlisten && (this.unlisten = B.listen(this), this.el.setAttribute("data-ssui-listening", "")), !t && this.unlisten && (this.unlisten(), this.unlisten = null, this.el.removeAttribute("data-ssui-listening")), this;
  }
  bind(t) {
    return this.binding = t, this.refresh(), this;
  }
  disable(t = !0) {
    return this.el.toggleAttribute("data-ssui-disabled", t), this.controlEl.querySelectorAll("[tabindex],input,button").forEach((e) => t ? e.setAttribute("aria-disabled", "true") : e.removeAttribute("aria-disabled")), this;
  }
  enable() {
    return this.disable(!1);
  }
  hide(t = !0) {
    return this.el.toggleAttribute("data-ssui-hidden", t), this;
  }
  show() {
    return this.hide(!1);
  }
  refresh() {
    return this.flush(), this;
  }
  reset() {
    return this.setValue(this.clone(this.initial), !0), this;
  }
  toJSON() {
    return this.clone(this.binding.read());
  }
  fromJSON(t) {
    this.setValue(t, !1);
  }
  dispose() {
    this.listen(!1), B.unlisten(this);
    for (const t of this.cleanups.splice(0)) t();
    this.el.remove(), this.emit("dispose"), this.clear();
  }
}
function M(a, t, e = Object.is) {
  return {
    target: a,
    key: t,
    equals: e,
    read: () => a[t],
    write: (s) => {
      a[t] = s;
    }
  };
}
function N(a, t = Object.is) {
  let e = a;
  return { target: null, key: null, equals: t, read: () => e, write: (s) => {
    e = s;
  } };
}
const vt = (a, t) => a.x === t.x && a.y === t.y;
function Ct(a, t, e) {
  return {
    target: a,
    key: `${t},${e}`,
    equals: vt,
    read: () => ({ x: a[t], y: a[e] }),
    write: (s) => {
      a[t] = s.x, a[e] = s.y;
    }
  };
}
function Mt(a, t) {
  return {
    target: a,
    key: t,
    equals: vt,
    read: () => ({ x: a[t].x, y: a[t].y }),
    write: (e) => {
      a[t].x = e.x, a[t].y = e.y;
    }
  };
}
const Y = (a, t) => JSON.stringify(a) === JSON.stringify(t), m = (a, t, e) => Math.min(e, Math.max(t, a)), st = (a, t, e, s, i) => s + (a - t) / (e - t || 1) * (i - s);
function Z(a) {
  if (!isFinite(a) || a === 0) return 2;
  const t = a.toString();
  if (t.includes("e-")) return parseInt(t.split("e-")[1], 10);
  const e = t.indexOf(".");
  return e === -1 ? 0 : t.length - e - 1;
}
function W(a, t, e = 0) {
  if (!t) return a;
  const s = Z(t);
  return +(Math.round((a - e) / t) * t + e).toFixed(s);
}
function yt(a, t, e) {
  if (isFinite(t) && isFinite(e)) {
    const i = e - t;
    return i <= 1 ? 1e-3 : i <= 10 ? 0.01 : i <= 100 ? 0.1 : 1;
  }
  const s = Z(a);
  return s ? +Math.pow(10, -s).toFixed(s) : 1;
}
function I(a, t = {}) {
  const e = t.precision ?? (t.step !== void 0 ? Z(t.step) : 2);
  let s = Math.abs(a) >= 1e6 ? a.toExponential(2) : a.toFixed(e);
  return (s === "-0" || /^-0\.0*$/.test(s)) && (s = s.slice(1)), t.unit ? `${s}${t.unit}` : s;
}
function ht(a) {
  const t = a.replace(/[^0-9eE+\-.,]/g, "").replace(",", ".");
  if (!t) return null;
  try {
    if (/^[0-9eE+\-.*/() ]+$/.test(a)) {
      const s = Function(`"use strict";return (${a})`)();
      if (typeof s == "number" && isFinite(s)) return s;
    }
  } catch {
  }
  const e = parseFloat(t);
  return isFinite(e) ? e : null;
}
const rt = (a) => String(a).padStart(2, "0");
function D(a, t) {
  const e = t.threshold ?? 3;
  let s = null, i = !1, n = "";
  const r = () => a.closest(".ssui-panel"), h = (d) => {
    d.button !== 0 || s || t.ignore?.(d) || (s = { x: d.clientX, y: d.clientY, x0: d.clientX, y0: d.clientY, dx: 0, dy: 0, mx: 0, my: 0, shift: d.shiftKey, alt: d.altKey, meta: d.metaKey || d.ctrlKey, moved: !1 }, i = !1, a.setPointerCapture(d.pointerId), a.addEventListener("pointermove", l), a.addEventListener("pointerup", u), a.addEventListener("pointercancel", u), a.addEventListener("lostpointercapture", u), t.immediate && c(d));
  }, c = (d) => {
    !s || i || (i = !0, r()?.setAttribute("data-ssui-dragging", ""), t.cursor && (n = document.body.style.cursor, document.body.style.cursor = t.cursor), t.onStart?.(s, d));
  }, l = (d) => {
    if (s) {
      if (s.mx = d.clientX - s.x, s.my = d.clientY - s.y, s.x = d.clientX, s.y = d.clientY, s.dx = s.x - s.x0, s.dy = s.y - s.y0, s.shift = d.shiftKey, s.alt = d.altKey, s.meta = d.metaKey || d.ctrlKey, !i) {
        if (Math.hypot(s.dx, s.dy) < e) return;
        s.moved = !0, c(d);
      }
      s.moved = !0, t.onMove?.(s, d);
    }
  }, u = (d) => {
    if (!s) return;
    const p = s;
    s = null, a.removeEventListener("pointermove", l), a.removeEventListener("pointerup", u), a.removeEventListener("pointercancel", u), a.removeEventListener("lostpointercapture", u);
    try {
      a.hasPointerCapture(d.pointerId) && a.releasePointerCapture(d.pointerId);
    } catch {
    }
    i ? (r()?.removeAttribute("data-ssui-dragging"), t.cursor && (document.body.style.cursor = n), t.onEnd?.(p, d)) : d.type === "pointerup" && t.onTap?.(d), i = !1;
  };
  return a.addEventListener("pointerdown", h), () => {
    a.removeEventListener("pointerdown", h), a.removeEventListener("pointermove", l), a.removeEventListener("pointerup", u), a.removeEventListener("pointercancel", u), a.removeEventListener("lostpointercapture", u);
  };
}
const L = (a) => {
  const t = "shift" in a ? a.shift : !!a.shiftKey, e = "alt" in a ? a.alt : !!a.altKey;
  return t ? 10 : e ? 0.1 : 1;
};
function q(a, t, e, s = !1) {
  const i = s ? "ArrowRight" : "ArrowUp", n = s ? "ArrowLeft" : "ArrowDown", r = L(a);
  switch (a.key) {
    case i:
      return t.step * r;
    case n:
      return -t.step * r;
    case "PageUp":
      return t.step * 10;
    case "PageDown":
      return -t.step * 10;
    case "Home":
      return isFinite(t.min) ? t.min - e : null;
    case "End":
      return isFinite(t.max) ? t.max - e : null;
    default:
      return null;
  }
}
class S extends _ {
  constructor(t, e = {}, s = "number") {
    super(t, e, s), this.dragStart = 0, this.min = e.min ?? -1 / 0, this.max = e.max ?? 1 / 0, this.step = e.step ?? yt(t.read(), e.min, e.max), this.precision = e.precision ?? Z(this.step), this.mount();
  }
  /** the standalone widget (also used embedded by Slider / Knob / Pad2D) */
  static widget(t, e) {
    return new S(t, { ...e, bare: !0 });
  }
  render() {
    return this.valueEl = o("span", { class: "ssui-number__value", id: this.inputId, role: "spinbutton", tabindex: 0, "aria-labelledby": `${this.inputId}-label` }), this.inputEl = o("input", { class: "ssui-number__input", type: "text", inputmode: "decimal", name: this.id, "aria-label": this.opts.label ?? this.id, tabindex: -1 }), this.box = o("div", { class: `ssui-number${this.opts.dim ? " ssui-number--dim" : ""}`, "data-ssui-state": "idle" }, [this.valueEl, this.inputEl]), isFinite(this.min) && this.valueEl.setAttribute("aria-valuemin", String(this.min)), isFinite(this.max) && this.valueEl.setAttribute("aria-valuemax", String(this.max)), this.cleanups.push(D(this.box, {
      cursor: "ns-resize",
      onStart: () => {
        this.dragStart = this.binding.read(), this.setState("dragging"), this.box.setAttribute("data-ssui-state", "dragging");
      },
      onMove: (t) => {
        const e = (this.opts.scrubSpeed ?? this.step) * L(t), s = m(Math.abs(t.dy) / 80, 0, 1);
        this.box.style.setProperty("--ssui-number-stretch", s.toFixed(3)), this.setValue(this.dragStart - t.dy * e);
      },
      onEnd: () => {
        this.box.style.setProperty("--ssui-number-stretch", "0"), this.setState("idle"), this.box.setAttribute("data-ssui-state", "idle"), this.emit("finish", this.binding.read());
      },
      onTap: () => this.edit()
    })), this.valueEl.addEventListener("keydown", (t) => {
      if (t.key === "Enter" || t.key === "F2") {
        t.preventDefault(), this.edit();
        return;
      }
      const e = q(t, this, this.binding.read());
      e !== null && (t.preventDefault(), this.setValue(this.binding.read() + e, !0));
    }), this.inputEl.addEventListener("keydown", (t) => {
      if (t.key === "Enter")
        t.preventDefault(), this.commitEdit();
      else if (t.key === "Escape")
        t.preventDefault(), this.cancelEdit();
      else if (t.key === "Tab")
        this.commitEdit(!1);
      else if (t.key === "ArrowUp" || t.key === "ArrowDown") {
        t.preventDefault();
        const e = ht(this.inputEl.value);
        if (e === null) return;
        const s = (t.key === "ArrowUp" ? 1 : -1) * this.step * L(t);
        this.inputEl.value = I(this.sanitize(e + s), { precision: this.precision });
      }
      t.stopPropagation();
    }), this.inputEl.addEventListener("blur", () => {
      this._state === "editing" && this.commitEdit(!1);
    }), this.opts.wheel && this.box.addEventListener("wheel", (t) => {
      t.preventDefault(), this.setValue(this.binding.read() - Math.sign(t.deltaY) * this.step * L(t), !0);
    }, { passive: !1 }), this.box;
  }
  sanitize(t) {
    if (!isFinite(t)) return this.binding.read();
    const e = isFinite(this.min) ? this.min : 0;
    return m(W(t, this.step, e), this.min, this.max);
  }
  update(t) {
    const e = I(t, { precision: this.precision });
    this.valueEl.textContent = "", this.valueEl.append(e), this.opts.unit && this.valueEl.append(o("span", { class: "ssui-number__unit" }, [this.opts.unit])), this.valueEl.setAttribute("aria-valuenow", String(t)), this.valueEl.setAttribute("aria-valuetext", e + (this.opts.unit ?? ""));
  }
  edit() {
    this._state !== "editing" && (this.setState("editing"), this.box.setAttribute("data-ssui-state", "editing"), this.inputEl.value = I(this.binding.read(), { precision: this.precision }), this.inputEl.focus(), this.inputEl.select());
  }
  commitEdit(t = !0) {
    const e = ht(this.inputEl.value);
    this.setState("idle"), this.box.setAttribute("data-ssui-state", "idle"), e !== null ? this.setValue(e, !0) : this.flush(), t && this.valueEl.focus();
  }
  cancelEdit() {
    this.setState("idle"), this.box.setAttribute("data-ssui-state", "idle"), this.flush(), this.valueEl.focus();
  }
  /** for composite controls: the widget element without the row */
  get widget() {
    return this.box;
  }
}
class $t extends S {
  constructor(t, e) {
    super(t, e, "slider"), this.rangeEl = null, this.maxRead = null, this.ro = null;
  }
  render() {
    const t = N(this.binding.read());
    t.read = () => this.binding.read(), t.write = (l) => this.setValue(l), this.readout = S.widget(t, { min: this.min, max: this.max, step: this.step, precision: this.precision, unit: this.opts.unit, label: this.opts.label, id: this.id + "-value" }), this.readout.on("finish", (l) => this.emit("finish", l)), this.readout.on("state", (l) => {
      l === "editing" || l === "dragging" ? this.setState(l) : this.setState("idle");
    }), this.cleanups.push(() => this.readout.dispose());
    const e = o("div", { class: "ssui-slider__fill" }), s = o("div", { class: "ssui-slider__thumb" });
    this.track = o("div", {
      class: "ssui-slider__track",
      role: "slider",
      tabindex: 0,
      id: this.inputId,
      "aria-labelledby": `${this.inputId}-label`,
      "aria-valuemin": String(this.min),
      "aria-valuemax": String(this.max),
      "aria-orientation": "horizontal"
    }, [o("div", { class: "ssui-slider__rail" }), e, s]);
    const i = this.opts, n = !!i.inline, r = o("div", { class: `ssui-slider${n ? " ssui-slider--inline" : ""}`, "data-ssui-state": "idle" }, [this.track]), h = o("div", { class: "ssui-slider__readout" }, [this.readout.widget]);
    if (i.showRange || n)
      if (this.rangeEl = o("span", { class: "ssui-value ssui-slider__range" }, ["/"]), h.append(this.rangeEl), i.editableMax !== !1) {
        const l = N(this.max);
        l.read = () => this.max, l.write = (u) => this.setMax(u), this.maxRead = S.widget(l, { min: this.min + this.step, step: this.step, precision: this.precision, unit: this.opts.unit, label: `${this.opts.label ?? this.id} max`, id: this.id + "-max", dim: !0, scrubSpeed: this.step * 2 }), this.maxRead.on("state", (u) => {
          u === "editing" || u === "dragging" ? this.setState(u) : this.setState("idle");
        }), this.cleanups.push(() => this.maxRead?.dispose()), h.append(this.maxRead.widget);
      } else
        h.append(o("span", { class: "ssui-value ssui-slider__range" }, [I(this.max, { precision: this.precision })]));
    n ? (this.el.classList.add("ssui-row--stack", "ssui-row--slider-inline"), this.labelEl.append(h)) : r.append(h);
    const c = (l) => {
      const u = this.track.getBoundingClientRect();
      this.setValue(st(m((l - u.left) / u.width, 0, 1), 0, 1, this.min, this.max));
    };
    return this.cleanups.push(D(this.track, {
      immediate: !0,
      cursor: "ew-resize",
      onStart: (l) => {
        this.setState("dragging"), r.setAttribute("data-ssui-state", "dragging"), c(l.x);
      },
      onMove: (l) => c(l.x),
      onEnd: () => {
        this.setState("idle"), r.setAttribute("data-ssui-state", "idle"), this.emit("finish", this.binding.read());
      }
    })), this.track.addEventListener("keydown", (l) => {
      const u = q(l, this, this.binding.read(), !0) ?? q(l, this, this.binding.read(), !1);
      u !== null && (l.preventDefault(), this.setValue(this.binding.read() + u, !0));
    }), this.ro = new ResizeObserver(() => this.track.style.setProperty("--ssui-track-w", `${this.track.clientWidth}px`)), this.ro.observe(this.track), this.cleanups.push(() => this.ro?.disconnect()), r;
  }
  update(t) {
    const e = m(st(t, this.min, this.max, 0, 1), 0, 1);
    this.track.style.setProperty("--ssui-p", e.toFixed(4)), this.track.setAttribute("aria-valuenow", String(t)), this.track.setAttribute("aria-valuetext", I(t, { precision: this.precision }) + (this.opts.unit ?? "")), this.readout?.refresh();
  }
  /** raise or lower the range; the current value is clamped into it */
  setMax(t) {
    !isFinite(t) || t <= this.min || (this.max = t, this.readout.max = t, this.track.setAttribute("aria-valuemax", String(t)), this.binding.read() > t ? this.setValue(t, !0) : this.flush(), this.maxRead?.refresh());
  }
  /** Slider's own box is the track; the Number's edit() targets the readout */
  edit() {
    this.readout.edit();
  }
}
const Lt = { sm: 40, md: 56, lg: 72 }, ut = "http://www.w3.org/2000/svg";
let dt = !1;
class Ot extends S {
  constructor(t, e = {}) {
    super(t, e, "knob");
  }
  render() {
    const t = this.opts;
    (!isFinite(this.min) || !isFinite(this.max)) && (dt || (console.warn("[ssui] Knob needs min/max; defaulting to 0..100"), dt = !0), isFinite(this.min) || (this.min = 0), isFinite(this.max) || (this.max = 100)), this.sweep = t.sweep ?? 270, this.ticks = [], this.kStart = 0, this.prevAngle = 0, this.dragAngle = 0;
    const e = Math.max(2, t.ticks ?? 15), s = N(this.binding.read());
    s.read = () => this.binding.read(), s.write = (u) => this.setValue(u), this.readout = S.widget(s, { min: this.min, max: this.max, step: this.step, precision: this.precision, unit: this.opts.unit, label: this.opts.label, id: this.id + "-value" }), this.readout.on("finish", (u) => this.emit("finish", u)), this.readout.on("state", (u) => this.setState(u === "editing" || u === "dragging" ? u : "idle")), this.cleanups.push(() => this.readout.dispose());
    const i = document.createElementNS(ut, "svg");
    i.setAttribute("class", "ssui-knob__ticks"), i.setAttribute("viewBox", "0 0 100 100"), i.setAttribute("aria-hidden", "true");
    const n = 46;
    for (let u = 0; u < e; u++) {
      const d = -this.sweep / 2 + u / (e - 1) * this.sweep, p = (d - 90) * Math.PI / 180, f = document.createElementNS(ut, "circle");
      f.setAttribute("cx", (50 + n * Math.cos(p)).toFixed(2)), f.setAttribute("cy", (50 + n * Math.sin(p)).toFixed(2)), f.setAttribute("r", "1.6"), f.setAttribute("class", "ssui-knob__tick"), i.append(f), this.ticks.push({ el: f, angle: d });
    }
    const r = o("div", { class: "ssui-knob__face" }, [o("div", { class: "ssui-knob__indicator" })]);
    this.dial = o("div", {
      class: "ssui-knob__dial",
      role: "slider",
      tabindex: 0,
      id: this.inputId,
      "aria-labelledby": `${this.inputId}-label`,
      "aria-valuemin": String(this.min),
      "aria-valuemax": String(this.max)
    }, [i, r]), this.kbox = o("div", { class: `ssui-knob ssui-knob--${t.size ?? "md"}${t.layout === "stack" ? " ssui-knob--stack" : ""}`, "data-ssui-state": "idle" }, [this.dial, this.readout.widget]), this.kbox.style.setProperty("--ssui-knob-size", `${Lt[t.size ?? "md"]}px`), t.layout === "stack" && (this.el.classList.add("ssui-row--stack", "ssui-row--knob-stack"), this.el.append(this.labelEl));
    const h = this.max - this.min, c = t.mode === "rotary", l = (u, d) => {
      const p = this.dial.getBoundingClientRect();
      return Math.atan2(d - (p.top + p.height / 2), u - (p.left + p.width / 2)) * 180 / Math.PI + 90;
    };
    return this.cleanups.push(D(this.dial, {
      cursor: c ? "grabbing" : "ns-resize",
      immediate: c,
      onStart: (u) => {
        this.kStart = this.binding.read(), this.dragAngle = this.valueToAngle(this.kStart), this.prevAngle = l(u.x, u.y), this.setState("dragging"), this.kbox.setAttribute("data-ssui-state", "dragging");
      },
      onMove: (u) => {
        if (c) {
          const d = l(u.x, u.y);
          let p = d - this.prevAngle;
          p > 180 ? p -= 360 : p < -180 && (p += 360), this.prevAngle = d, this.dragAngle = m(this.dragAngle + p, -this.sweep / 2, this.sweep / 2), this.setValue(st(this.dragAngle, -this.sweep / 2, this.sweep / 2, this.min, this.max));
        } else {
          const d = (this.opts.scrubSpeed ?? h / 150) * L(u);
          this.setValue(this.kStart - u.dy * d);
        }
      },
      onEnd: () => {
        this.setState("idle"), this.kbox.setAttribute("data-ssui-state", "idle"), this.emit("finish", this.binding.read());
      }
    })), this.dial.addEventListener("dblclick", () => this.setValue(this.initial, !0)), this.dial.addEventListener("keydown", (u) => {
      const d = q(u, this, this.binding.read());
      d !== null && (u.preventDefault(), this.setValue(this.binding.read() + d, !0));
    }), this.opts.wheel && this.dial.addEventListener("wheel", (u) => {
      u.preventDefault(), this.setValue(this.binding.read() - Math.sign(u.deltaY) * this.step * L(u), !0);
    }, { passive: !1 }), this.kbox;
  }
  valueToAngle(t) {
    return st(m(t, this.min, this.max), this.min, this.max, -this.sweep / 2, this.sweep / 2);
  }
  update(t) {
    const e = this.valueToAngle(t);
    this.dial.style.setProperty("--ssui-knob-angle", `${e.toFixed(2)}deg`), this.dial.setAttribute("aria-valuenow", String(t)), this.dial.setAttribute("aria-valuetext", I(t, { precision: this.precision }) + (this.opts.unit ?? ""));
    const s = this.sweep / (this.ticks.length - 1) * 3;
    for (const i of this.ticks) {
      const n = m(1 - Math.abs(i.angle - e) / s, 0, 1);
      i.el.style.setProperty("--ssui-tick-w", (n * n).toFixed(3)), i.el.toggleAttribute("data-ssui-on", i.angle <= e + 0.01);
    }
    this.readout?.refresh();
  }
  edit() {
    this.readout.edit();
  }
  get widget() {
    return this.kbox;
  }
}
class it extends _ {
  constructor(t, e = {}) {
    super(t, e, "pad2d"), this.ro = null, this.size = 0, this.stacked = !0;
    const s = t.read();
    this.ax = it.axis(e.x, s.x, "x", !1), this.ay = it.axis(e.y, s.y, "y", !0), this.mount();
  }
  static axis(t = {}, e, s, i) {
    const n = t.min ?? -1, r = t.max ?? 1, h = t.step ?? yt(e, n, r);
    return { min: n, max: r, step: h, precision: Z(h), label: t.label ?? s, invert: t.invert ?? i };
  }
  render() {
    const t = (i, n) => {
      const r = N(this.binding.read()[n]);
      r.read = () => this.binding.read()[n], r.write = (c) => this.setValue({ ...this.binding.read(), [n]: c });
      const h = S.widget(r, { min: i.min, max: i.max, step: i.step, precision: i.precision, label: `${this.opts.label ?? this.id} ${i.label}`, id: `${this.id}-${n}` });
      return h.on("finish", () => this.emit("finish", this.binding.read())), h.on("state", (c) => this.setState(c === "editing" || c === "dragging" ? c : "idle")), this.cleanups.push(() => h.dispose()), h;
    };
    this.rx = t(this.ax, "x"), this.ry = t(this.ay, "y"), this.labelEl.append(o("span", { class: "ssui-pad2d__readouts" }, [
      o("span", { class: "ssui-pad2d__axis" }, [this.ax.label]),
      this.rx.widget,
      o("span", { class: "ssui-pad2d__axis" }, [this.ay.label]),
      this.ry.widget
    ])), this.canvas = o("canvas", { class: "ssui-pad2d__dots", "aria-hidden": "true" }), this.thumb = o("div", { class: "ssui-pad2d__thumb", "aria-hidden": "true" }), this.surface = o("div", {
      class: "ssui-pad2d__surface",
      role: "slider",
      tabindex: 0,
      id: this.inputId,
      "aria-labelledby": `${this.inputId}-label`
    }, [
      this.canvas,
      this.thumb,
      o("span", { class: "ssui-pad2d__letter ssui-pad2d__letter--y", "aria-hidden": "true" }, ["y"]),
      o("span", { class: "ssui-pad2d__letter ssui-pad2d__letter--x", "aria-hidden": "true" }, ["x"])
    ]);
    const e = o("div", { class: "ssui-pad2d", "data-ssui-state": "idle" }, [this.surface]);
    this.opts.size && e.style.setProperty("--ssui-pad-size", `${this.opts.size}px`);
    const s = (i, n) => {
      const r = this.surface.getBoundingClientRect(), h = m((i - r.left) / r.width, 0, 1), c = m((n - r.top) / r.height, 0, 1), l = this.ax.min + (this.ax.invert ? 1 - h : h) * (this.ax.max - this.ax.min), u = this.ay.min + (this.ay.invert ? 1 - c : c) * (this.ay.max - this.ay.min);
      this.setValue({ x: l, y: u });
    };
    return this.cleanups.push(D(this.surface, {
      immediate: !0,
      cursor: "crosshair",
      onStart: (i) => {
        this.setState("dragging"), e.setAttribute("data-ssui-state", "dragging"), s(i.x, i.y);
      },
      onMove: (i) => s(i.x, i.y),
      onEnd: () => {
        this.setState("idle"), e.setAttribute("data-ssui-state", "idle"), this.emit("finish", this.binding.read());
      }
    })), this.surface.addEventListener("dblclick", () => this.setValue(this.clone(this.initial), !0)), this.surface.addEventListener("keydown", (i) => {
      const n = this.binding.read(), r = q(i, this.ax, n.x, !0), h = r === null ? q(i, this.ay, n.y, !1) : null;
      r === null && h === null || (i.preventDefault(), this.setValue({ x: n.x + (r ?? 0), y: n.y + (h ?? 0) }, !0));
    }), this.ro = new ResizeObserver(() => {
      this.size = this.surface.clientWidth, this.surface.style.setProperty("--ssui-pad-w", `${this.size}px`), this.draw(this.binding.read());
    }), this.ro.observe(this.surface), this.cleanups.push(() => this.ro?.disconnect()), e;
  }
  sanitize(t) {
    const e = m(W(t.x, this.ax.step, this.ax.min), this.ax.min, this.ax.max), s = m(W(t.y, this.ay.step, this.ay.min), this.ay.min, this.ay.max);
    return { x: isFinite(e) ? e : this.binding.read().x, y: isFinite(s) ? s : this.binding.read().y };
  }
  norm(t) {
    let e = (t.x - this.ax.min) / (this.ax.max - this.ax.min || 1), s = (t.y - this.ay.min) / (this.ay.max - this.ay.min || 1);
    return this.ax.invert && (e = 1 - e), this.ay.invert && (s = 1 - s), { x: m(e, 0, 1), y: m(s, 0, 1) };
  }
  update(t) {
    const e = this.norm(t);
    this.surface.style.setProperty("--ssui-pad-x", e.x.toFixed(4)), this.surface.style.setProperty("--ssui-pad-y", e.y.toFixed(4)), this.surface.setAttribute("aria-valuetext", `x ${I(t.x, { precision: this.ax.precision })} · y ${I(t.y, { precision: this.ay.precision })}`), this.rx?.refresh(), this.ry?.refresh(), this.draw(t);
  }
  onThemeChange() {
    this.draw(this.binding.read());
  }
  draw(t) {
    const e = this.size;
    if (!e) return;
    const s = Math.min(2, devicePixelRatio || 1);
    this.canvas.width !== e * s && (this.canvas.width = e * s, this.canvas.height = e * s);
    const i = this.canvas.getContext("2d");
    i.setTransform(s, 0, 0, s, 0, 0), i.clearRect(0, 0, e, e);
    const n = this.el.closest(".ssui-panel"), r = n ? getComputedStyle(n) : null, h = r?.getPropertyValue("--ssui-color-canvas-grid").trim() || "#ccc", c = r?.getPropertyValue("--ssui-color-fill").trim() || "#000", l = this.norm(t), u = l.x * e, d = l.y * e, p = Math.max(2, this.opts.grid ?? 8), f = e / p, g = e * 0.45, b = Math.max(1, e / 128);
    for (let v = 0; v < p; v++)
      for (let x = 0; x < p; x++) {
        const A = (v + 0.5) * f, y = (x + 0.5) * f, w = Math.hypot(A - u, y - d), C = w < g ? 1 - w / g : 0, T = b * (1 + C * 1.5);
        i.beginPath(), i.arc(A, y, T, 0, Math.PI * 2), i.fillStyle = h, i.fill(), C > 0 && (i.globalAlpha = C * C, i.fillStyle = c, i.fill(), i.globalAlpha = 1);
      }
  }
}
class Pt extends _ {
  constructor(t, e = {}) {
    super(t, e, "toggle"), this.pulseTimer = 0, this.mount();
  }
  render() {
    return this.btn = o("button", { class: "ssui-toggle", type: "button", role: "switch", id: this.inputId, "aria-labelledby": `${this.inputId}-label`, "aria-checked": "false" }, [
      o("span", { class: "ssui-toggle__track" }, [o("span", { class: "ssui-toggle__thumb" })]),
      this.opts.indicator === !1 ? null : o("span", { class: "ssui-toggle__dot", "aria-hidden": "true" })
    ]), this.btn.addEventListener("click", () => this.toggle()), this.btn;
  }
  toggle() {
    this.setValue(!this.binding.read(), !0), this.binding.read() && (this.btn.setAttribute("data-ssui-pulse", ""), clearTimeout(this.pulseTimer), this.pulseTimer = window.setTimeout(() => this.btn.removeAttribute("data-ssui-pulse"), 500));
  }
  sanitize(t) {
    return !!t;
  }
  update(t) {
    this.btn.setAttribute("aria-checked", String(!!t));
  }
}
class lt extends _ {
  constructor(t, e) {
    super(t, e, "select"), this.optionEls = [], this.active = -1, this.canvas = null, this.time = 0, this.stopAnim = null, this.typeahead = "", this.typeTimer = 0, this.items = lt.normalize(e.options), e.preview && (this.stacked = !0), this.mount();
  }
  static normalize(t) {
    return Array.isArray(t) ? t.map((e) => e && typeof e == "object" && "value" in e ? e : { label: String(e), value: e }) : Object.entries(t).map(([e, s]) => ({ label: e, value: s }));
  }
  render() {
    this.indexEl = o("span", { class: "ssui-select__index", "aria-hidden": "true" }, [o("span", { class: "ssui-select__index-cur" }, ["01"]), o("span", { class: "ssui-select__index-sep" }, ["/"]), o("span", {}, [rt(this.items.length)])]), this.currentEl = o("span", { class: "ssui-select__current" });
    const t = E.chevron();
    t.classList.add("ssui-select__chevron"), this.trigger = o("button", { class: "ssui-select__trigger", type: "button", id: this.inputId, "aria-haspopup": "listbox", "aria-expanded": "false", "aria-labelledby": `${this.inputId}-label` }, [this.indexEl, this.currentEl, t]), this.menu = o("ul", { class: "ssui-select__menu", role: "listbox", tabindex: -1, "aria-labelledby": `${this.inputId}-label` }), this.items.forEach((s, i) => {
      const n = o("li", { class: "ssui-select__option", role: "option", "aria-selected": "false", "data-i": i }, [s.label, o("span", { class: "ssui-select__option-index" }, [rt(i + 1)])]);
      n.style.setProperty("--i", String(i)), n.addEventListener("pointerenter", () => this.setActive(i)), n.addEventListener("click", (r) => {
        r.stopPropagation(), this.select(i);
      }), this.optionEls.push(n), this.menu.append(n);
    }), this.box = o("div", { class: "ssui-select" }, [this.trigger, this.menu]), this.trigger.addEventListener("click", (s) => {
      s.stopPropagation(), this.isOpen ? this.close() : this.open();
    }), this.trigger.addEventListener("keydown", (s) => this.onKey(s)), this.menu.addEventListener("keydown", (s) => this.onKey(s));
    const e = (s) => {
      this.box.contains(s.target) || this.close();
    };
    if (document.addEventListener("pointerdown", e, !0), this.cleanups.push(() => document.removeEventListener("pointerdown", e, !0)), this.opts.preview) {
      this.canvas = o("canvas", { class: "ssui-select__preview-canvas", "aria-hidden": "true" });
      const s = o("div", { class: "ssui-select__preview" }, [this.canvas]);
      this.labelEl.append(this.box);
      const i = new ResizeObserver(() => this.draw());
      return i.observe(s), this.cleanups.push(() => i.disconnect()), this.opts.previewAnimate && !bt() && (this.stopAnim = B.animate({ flush() {
      }, poll() {
      }, tick: (n) => {
        this.time += n / 1e3, this.draw();
      } }), this.cleanups.push(() => this.stopAnim?.())), s;
    }
    return this.box;
  }
  get isOpen() {
    return this.box.hasAttribute("data-ssui-open");
  }
  open() {
    this.isOpen || (this.box.setAttribute("data-ssui-open", ""), this.trigger.setAttribute("aria-expanded", "true"), this.setState("open"), this.setActive(Math.max(0, this.selectedIndex())), this.menu.focus({ preventScroll: !0 }));
  }
  close(t = !1) {
    this.isOpen && (this.box.removeAttribute("data-ssui-open"), this.trigger.setAttribute("aria-expanded", "false"), this.setState("idle"), t && this.trigger.focus());
  }
  selectedIndex() {
    const t = this.binding.read();
    return this.items.findIndex((e) => e.value === t);
  }
  setActive(t) {
    this.active = t, this.optionEls.forEach((e, s) => e.toggleAttribute("data-ssui-active", s === t)), this.optionEls[t]?.scrollIntoView({ block: "nearest" });
  }
  select(t) {
    const e = this.items[t];
    e && (this.setValue(e.value, !0), this.close(!0));
  }
  onKey(t) {
    const e = this.items.length;
    if (!this.isOpen) {
      ["Enter", " ", "ArrowDown", "ArrowUp"].includes(t.key) ? (t.preventDefault(), this.open()) : t.key === "ArrowRight" ? (t.preventDefault(), this.select((this.selectedIndex() + 1) % e)) : t.key === "ArrowLeft" && (t.preventDefault(), this.select((this.selectedIndex() - 1 + e) % e));
      return;
    }
    switch (t.key) {
      case "ArrowDown":
        t.preventDefault(), this.setActive((this.active + 1) % e);
        break;
      case "ArrowUp":
        t.preventDefault(), this.setActive((this.active - 1 + e) % e);
        break;
      case "Home":
        t.preventDefault(), this.setActive(0);
        break;
      case "End":
        t.preventDefault(), this.setActive(e - 1);
        break;
      case "Enter":
      case " ":
        t.preventDefault(), this.select(this.active);
        break;
      case "Escape":
        t.preventDefault(), this.close(!0);
        break;
      case "Tab":
        this.close();
        break;
      default:
        if (t.key.length === 1 && !t.metaKey && !t.ctrlKey) {
          clearTimeout(this.typeTimer), this.typeahead += t.key.toLowerCase(), this.typeTimer = window.setTimeout(() => {
            this.typeahead = "";
          }, 600);
          const s = this.items.findIndex((i) => i.label.toLowerCase().startsWith(this.typeahead));
          s >= 0 && this.setActive(s);
        }
    }
  }
  update(t) {
    const e = this.items.findIndex((r) => r.value === t), s = this.items[e];
    this.currentEl.textContent = s ? s.label : String(t);
    const i = this.indexEl.firstElementChild, n = rt(Math.max(0, e) + 1);
    i.textContent !== n && (i.textContent = n, i.removeAttribute("data-ssui-flip"), i.offsetWidth, i.setAttribute("data-ssui-flip", "")), this.optionEls.forEach((r, h) => r.setAttribute("aria-selected", String(h === e))), this.draw();
  }
  onThemeChange() {
    this.draw();
  }
  draw() {
    if (!this.canvas || !this.opts.preview) return;
    const t = this.canvas.parentElement, e = t.clientWidth, s = t.clientHeight;
    if (!e || !s) return;
    const i = Math.min(2, devicePixelRatio || 1);
    (this.canvas.width !== e * i || this.canvas.height !== s * i) && (this.canvas.width = e * i, this.canvas.height = s * i);
    const n = this.canvas.getContext("2d");
    n.setTransform(i, 0, 0, i, 0, 0), n.clearRect(0, 0, e, s);
    const r = this.el.closest(".ssui-panel"), h = (c) => r ? getComputedStyle(r).getPropertyValue(`--ssui-${c}`).trim() : "";
    this.opts.preview(n, this.binding.read(), e, s, this.time, h);
  }
}
function xt(a, t, e) {
  const s = Math.max(a, t, e), i = Math.min(a, t, e), n = s - i;
  let r = 0;
  return n > 0 && (s === a ? r = (t - e) / n % 6 : s === t ? r = (e - a) / n + 2 : r = (a - t) / n + 4, r *= 60, r < 0 && (r += 360)), { h: r, s: s === 0 ? 0 : n / s, v: s };
}
function wt(a, t, e) {
  a = (a % 360 + 360) % 360;
  const s = e * t, i = s * (1 - Math.abs(a / 60 % 2 - 1)), n = e - s;
  let r = 0, h = 0, c = 0;
  return a < 60 ? [r, h, c] = [s, i, 0] : a < 120 ? [r, h, c] = [i, s, 0] : a < 180 ? [r, h, c] = [0, s, i] : a < 240 ? [r, h, c] = [0, i, s] : a < 300 ? [r, h, c] = [i, 0, s] : [r, h, c] = [s, 0, i], { r: r + n, g: h + n, b: c + n };
}
function Dt(a, t, e) {
  const { h: s, s: i, v: n } = xt(a, t, e), r = n * (1 - i / 2), h = r === 0 || r === 1 ? 0 : (n - r) / Math.min(r, 1 - r);
  return { h: s, s: h, l: r };
}
function Tt(a, t, e) {
  const s = e + t * Math.min(e, 1 - e), i = s === 0 ? 0 : 2 * (1 - e / s);
  return wt(a, i, s);
}
const O = (a) => Math.min(1, Math.max(0, a));
function j(a, t) {
  const e = a.trim();
  if (e === "none") return 0;
  if (e.endsWith("%")) return parseFloat(e) / 100;
  const s = parseFloat(e);
  return t === 1 ? s : s / t;
}
function Vt(a) {
  const t = a.trim();
  return t.endsWith("deg") ? parseFloat(t) : t.endsWith("rad") ? parseFloat(t) * 180 / Math.PI : t.endsWith("turn") ? parseFloat(t) * 360 : t.endsWith("grad") ? parseFloat(t) * 0.9 : parseFloat(t);
}
function It(a) {
  let t = null, e = a;
  if (a.includes("/")) {
    const [i, n] = a.split("/");
    e = i, t = n;
  }
  const s = e.split(/[\s,]+/).filter(Boolean);
  return s.length === 4 && t === null && (t = s.pop()), { c: s, a: t };
}
function G(a) {
  if (typeof a == "number") {
    if (!isFinite(a)) return null;
    const u = Math.max(0, Math.min(16777215, Math.round(a)));
    return { r: (u >> 16 & 255) / 255, g: (u >> 8 & 255) / 255, b: (u & 255) / 255, a: 1 };
  }
  if (typeof a == "object" && a !== null) {
    if (typeof a.r != "number" || typeof a.g != "number" || typeof a.b != "number") return null;
    const d = Math.max(a.r, a.g, a.b) > 1 ? 255 : 1;
    return { r: O(a.r / d), g: O(a.g / d), b: O(a.b / d), a: a.a === void 0 ? 1 : O(a.a) };
  }
  if (typeof a != "string") return null;
  const t = a.trim().toLowerCase(), e = t.match(/^#?([0-9a-f]{3,8})$/);
  if (e) {
    let u = e[1];
    if ((u.length === 3 || u.length === 4) && (u = u.split("").map((p) => p + p).join("")), u.length !== 6 && u.length !== 8) return null;
    const d = parseInt(u, 16);
    return u.length === 6 ? { r: (d >> 16 & 255) / 255, g: (d >> 8 & 255) / 255, b: (d & 255) / 255, a: 1 } : { r: (d >>> 24 & 255) / 255, g: (d >> 16 & 255) / 255, b: (d >> 8 & 255) / 255, a: (d & 255) / 255 };
  }
  const s = t.match(/^(rgba?|hsla?)\((.*)\)$/);
  if (!s) return null;
  const { c: i, a: n } = It(s[2]);
  if (i.length !== 3) return null;
  const r = n === null ? 1 : O(j(n, 1));
  if (s[1].startsWith("rgb"))
    return { r: O(j(i[0], 255)), g: O(j(i[1], 255)), b: O(j(i[2], 255)), a: r };
  const { r: h, g: c, b: l } = Tt(Vt(i[0]), O(j(i[1], 100)), O(j(i[2], 100)));
  return { r: h, g: c, b: l, a: r };
}
function Rt(a) {
  return G(a) ?? { r: 0, g: 0, b: 0, a: 1 };
}
const P = (a) => Math.round(Math.min(1, Math.max(0, a)) * 255), Q = (a) => P(a).toString(16).padStart(2, "0"), tt = (a) => Math.round(a * 10) / 10;
function _t(a, t, e = !1) {
  const s = a.a === void 0 ? 1 : a.a;
  switch (t) {
    case "hex":
      return `#${Q(a.r)}${Q(a.g)}${Q(a.b)}${e ? Q(s) : ""}`;
    case "rgb":
      return e ? `rgb(${P(a.r)} ${P(a.g)} ${P(a.b)} / ${tt(s * 100)}%)` : `rgb(${P(a.r)} ${P(a.g)} ${P(a.b)})`;
    case "hsl": {
      const { h: i, s: n, l: r } = Dt(a.r, a.g, a.b), h = `${Math.round(i)} ${tt(n * 100)}% ${tt(r * 100)}%`;
      return e ? `hsl(${h} / ${tt(s * 100)}%)` : `hsl(${h})`;
    }
    case "number":
      return P(a.r) << 16 | P(a.g) << 8 | P(a.b);
    case "object":
      return e ? { r: a.r, g: a.g, b: a.b, a: s } : { r: a.r, g: a.g, b: a.b };
  }
}
function Ft(a) {
  if (typeof a == "number") return "number";
  if (typeof a == "object" && a !== null) return "object";
  const t = String(a).trim().toLowerCase();
  return t.startsWith("rgb") ? "rgb" : t.startsWith("hsl") ? "hsl" : "hex";
}
function Bt(a) {
  if (typeof a == "number") return !1;
  if (typeof a == "object" && a !== null) return typeof a.a == "number";
  const t = String(a).trim();
  return t.startsWith("#") ? t.length === 5 || t.length === 9 : /\/|rgba|hsla|^(rgb|hsl)\(\s*[^,]+,[^,]+,[^,]+,/.test(t);
}
function zt(a, t) {
  return _t(a, "hex", t);
}
class Ht extends _ {
  constructor(t, e = {}) {
    super(t, e, "color"), this.hsv = { h: 0, s: 0, v: 0 }, this.a = 1, this.mode = "hsv", this.alphaEl = null, this.hsvWidgets = [], this.rgbWidgets = [], this.dirtySinceOpen = !1, this.closeTimer = 0;
    const s = t.read();
    this.format = e.format ?? Ft(s), this.alpha = e.alpha ?? (this.format !== "number" && Bt(s)), this.readInto(Rt(s), !0), this.mount();
  }
  // ---- value plumbing -----------------------------------------------------
  readInto(t, e = !1) {
    const { h: s, s: i, v: n } = xt(t.r, t.g, t.b);
    (e || i > 1e-3 && n > 1e-3) && (this.hsv.h = s), (e || n > 1e-3) && (this.hsv.s = i), this.hsv.v = n, this.a = t.a === void 0 ? 1 : t.a;
  }
  rgba() {
    return { ...wt(this.hsv.h, this.hsv.s, this.hsv.v), a: this.a };
  }
  out(t = this.rgba()) {
    return _t(t, this.format, this.alpha);
  }
  sanitize(t) {
    const e = G(t);
    return e ? this.out(e) : this.binding.read();
  }
  /** object format: mutate the consumer's object in place (references stay valid) */
  setValue(t, e = !1) {
    if (this.format === "object") {
      const s = this.sanitize(t), i = this.binding.read();
      if (i && typeof i == "object") {
        this.binding.equals(s, i) || (this.alpha || delete i.a, Object.assign(i, s), this.binding.write(i), this.emit("change", i)), this.refreshSoon(), e && this.emit("finish", i);
        return;
      }
    }
    super.setValue(t, e);
  }
  refreshSoon() {
    B.request(this);
  }
  apply(t = !1) {
    this.dirtySinceOpen = !0, this.setValue(this.out(), t);
  }
  setHSV(t, e = !1) {
    t.h !== void 0 && (this.hsv.h = (t.h % 360 + 360) % 360), t.s !== void 0 && (this.hsv.s = m(t.s, 0, 1)), t.v !== void 0 && (this.hsv.v = m(t.v, 0, 1)), t.a !== void 0 && (this.a = m(t.a, 0, 1)), this.apply(e), this.paint();
  }
  setRGBChannel(t, e, s = !1) {
    const i = this.rgba();
    i[t] = m(e, 0, 255) / 255, this.readInto(i), this.apply(s), this.paint();
  }
  // ---- DOM ----------------------------------------------------------------
  render() {
    this.swatch = o("button", { class: "ssui-color__swatch", type: "button", id: this.inputId, "aria-haspopup": "dialog", "aria-expanded": "false", "aria-labelledby": `${this.inputId}-label`, title: "Pick color" }), this.hex = o("input", { class: "ssui-color__hex", type: "text", name: this.id, spellcheck: "false", autocomplete: "off", "aria-label": `${this.opts.label ?? this.id} hex`, size: this.alpha ? 9 : 7 }), this.sv = o("div", { class: "ssui-color__sv", role: "slider", tabindex: 0, "aria-label": "Saturation and value" }, [o("span", { class: "ssui-color__thumb" })]), this.hue = o("div", { class: "ssui-color__hue", role: "slider", tabindex: 0, "aria-label": "Hue", "aria-valuemin": 0, "aria-valuemax": 360 }, [o("span", { class: "ssui-color__thumb" })]), this.alpha && (this.alphaEl = o("div", { class: "ssui-color__alpha", role: "slider", tabindex: 0, "aria-label": "Alpha", "aria-valuemin": 0, "aria-valuemax": 100 }, [o("span", { class: "ssui-color__thumb" })]));
    const t = (s, i, n, r) => {
      const h = N(i());
      h.read = i, h.write = (l) => n(l);
      const c = S.widget(h, { min: 0, max: r, step: 1, precision: 0, label: s, id: `${this.id}-${s.toLowerCase()}`, dim: !0 });
      return c.on("finish", () => this.apply(!0)), c.on("state", (l) => {
        l === "dragging" ? this.dragging(!0) : l === "idle" && this.dragging(!1);
      }), this.cleanups.push(() => c.dispose()), c;
    };
    this.hsvWidgets = [
      t("H", () => Math.round(this.hsv.h), (s) => this.setHSV({ h: s }), 360),
      t("S", () => Math.round(this.hsv.s * 100), (s) => this.setHSV({ s: s / 100 }), 100),
      t("V", () => Math.round(this.hsv.v * 100), (s) => this.setHSV({ v: s / 100 }), 100)
    ], this.rgbWidgets = ["r", "g", "b"].map((s) => t(s.toUpperCase(), () => Math.round(this.rgba()[s] * 255), (i) => this.setRGBChannel(s, i), 255));
    const e = (s, i) => o("div", { class: "ssui-color__field" }, [o("span", { class: "ssui-color__field-label" }, [i]), s.widget]);
    return this.hsvRow = o("div", { class: "ssui-color__fields" }, this.hsvWidgets.map((s, i) => e(s, "HSV"[i]))), this.rgbRow = o("div", { class: "ssui-color__fields", hidden: !0 }, this.rgbWidgets.map((s, i) => e(s, "RGB"[i]))), this.modeBtn = o("button", { class: "ssui-color__mode", type: "button", "aria-label": "Switch readout mode" }, ["HSV"]), this.modeBtn.addEventListener("click", () => this.setMode(this.mode === "hsv" ? "rgb" : "hsv")), this.pop = o("div", { class: "ssui-color__popover", role: "dialog", "aria-label": `${this.opts.label ?? this.id} color`, "aria-modal": "false" }, [
      this.sv,
      this.hue,
      this.alphaEl,
      o("div", { class: "ssui-color__readouts" }, [this.hsvRow, this.rgbRow, this.modeBtn])
    ]), this.box = o("div", { class: "ssui-color", "data-ssui-state": "idle" }, [this.swatch, this.hex, this.pop]), this.wireSwatch(), this.wireHex(), this.wireSliders(), this.wirePopover(), this.box;
  }
  wireSwatch() {
    this.swatch.addEventListener("click", (t) => {
      t.stopPropagation(), this.isOpen ? this.close(!0) : this.open();
    });
  }
  wireHex() {
    this.hex.addEventListener("input", () => {
      const t = G(this.hex.value.trim());
      this.hex.toggleAttribute("data-ssui-invalid", !t), t && (this.readInto(t), this.setValue(this.out(t)), this.paint(!1));
    }), this.hex.addEventListener("focus", () => this.setState("editing")), this.hex.addEventListener("blur", () => {
      this.hex.removeAttribute("data-ssui-invalid"), this.setState("idle"), this.paint();
    }), this.hex.addEventListener("keydown", (t) => {
      const e = t;
      if (e.stopPropagation(), e.key === "Enter") {
        e.preventDefault();
        const s = G(this.hex.value.trim());
        s && (this.readInto(s), this.setValue(this.out(s), !0)), this.hex.blur();
      } else e.key === "Escape" && (e.preventDefault(), this.paint(), this.hex.blur());
    });
  }
  dragging(t) {
    const e = t ? "dragging" : this.isOpen ? "open" : "idle";
    this.box.setAttribute("data-ssui-state", e), this.setState(e);
  }
  wireSliders() {
    const t = (e, s) => {
      const i = (n, r) => {
        const h = e.getBoundingClientRect();
        s(m((n - h.left) / h.width, 0, 1), m((r - h.top) / h.height, 0, 1));
      };
      this.cleanups.push(D(e, {
        immediate: !0,
        cursor: "crosshair",
        onStart: (n) => {
          this.dragging(!0), i(n.x, n.y);
        },
        onMove: (n) => i(n.x, n.y),
        onEnd: () => {
          this.dragging(!1), this.apply(!0), e.focus({ preventScroll: !0 });
        }
      }));
    };
    t(this.sv, (e, s) => this.setHSV({ s: e, v: 1 - s })), t(this.hue, (e) => this.setHSV({ h: e * 359.999 })), this.alphaEl && t(this.alphaEl, (e) => this.setHSV({ a: e })), this.sv.addEventListener("keydown", (e) => {
      const s = L(e) * 0.01;
      let i = null;
      e.key === "ArrowLeft" ? i = { s: this.hsv.s - s } : e.key === "ArrowRight" ? i = { s: this.hsv.s + s } : e.key === "ArrowUp" ? i = { v: this.hsv.v + s } : e.key === "ArrowDown" && (i = { v: this.hsv.v - s }), i && (e.preventDefault(), e.stopPropagation(), this.setHSV(i, !0));
    }), this.hue.addEventListener("keydown", (e) => {
      const s = L(e);
      (e.key === "ArrowLeft" || e.key === "ArrowDown") && (e.preventDefault(), e.stopPropagation(), this.setHSV({ h: this.hsv.h - s }, !0)), (e.key === "ArrowRight" || e.key === "ArrowUp") && (e.preventDefault(), e.stopPropagation(), this.setHSV({ h: this.hsv.h + s }, !0));
    }), this.alphaEl?.addEventListener("keydown", (e) => {
      const s = L(e) * 0.01;
      (e.key === "ArrowLeft" || e.key === "ArrowDown") && (e.preventDefault(), e.stopPropagation(), this.setHSV({ a: this.a - s }, !0)), (e.key === "ArrowRight" || e.key === "ArrowUp") && (e.preventDefault(), e.stopPropagation(), this.setHSV({ a: this.a + s }, !0));
    });
  }
  wirePopover() {
    const t = (n) => {
      this.isOpen && !this.box.contains(n.target) && this.close();
    };
    document.addEventListener("pointerdown", t, !0), this.cleanups.push(() => document.removeEventListener("pointerdown", t, !0));
    const e = () => {
      this.isOpen && this.close();
    }, s = () => this.el.closest(".ssui-panel__body");
    let i = null;
    this.cleanups.push(() => i?.removeEventListener("scroll", e)), this.pop.addEventListener("keydown", (n) => {
      if (n.key === "Escape") {
        n.preventDefault(), n.stopPropagation(), this.close(!0);
        return;
      }
      if (n.key !== "Tab") return;
      const r = [...this.pop.querySelectorAll('[tabindex="0"],button,input')].filter((l) => !l.hidden && l.offsetParent !== null);
      if (!r.length) return;
      const h = r.indexOf(document.activeElement), c = n.shiftKey ? h <= 0 ? r[r.length - 1] : r[h - 1] : h === -1 || h >= r.length - 1 ? r[0] : r[h + 1];
      n.preventDefault(), c.focus();
    }), this.open = /* @__PURE__ */ ((n) => () => {
      i || (i = s(), i?.addEventListener("scroll", e, { passive: !0 }), window.addEventListener("resize", e), this.cleanups.push(() => window.removeEventListener("resize", e))), n();
    })(this.open.bind(this));
  }
  setMode(t) {
    this.mode = t, this.hsvRow.hidden = t !== "hsv", this.rgbRow.hidden = t !== "rgb", this.modeBtn.textContent = t === "hsv" ? "HSV" : "RGB", this.paint();
  }
  // ---- open / close -------------------------------------------------------
  get isOpen() {
    return this.box.hasAttribute("data-ssui-open");
  }
  open() {
    this.isOpen || (clearTimeout(this.closeTimer), this.dirtySinceOpen = !1, this.place(), this.box.setAttribute("data-ssui-open", ""), this.swatch.setAttribute("aria-expanded", "true"), this.setState("open"), this.box.setAttribute("data-ssui-state", "open"), this.sv.focus({ preventScroll: !0 }));
  }
  close(t = !1) {
    this.isOpen && (this.box.removeAttribute("data-ssui-open"), this.swatch.setAttribute("aria-expanded", "false"), this.setState("idle"), this.box.setAttribute("data-ssui-state", "idle"), this.dirtySinceOpen && (this.dirtySinceOpen = !1, this.emit("finish", this.binding.read())), t && this.swatch.focus({ preventScroll: !0 }));
  }
  /** position: fixed popover so it escapes the panel's overflow clip; clip origin = swatch center */
  place() {
    const t = this.swatch.getBoundingClientRect(), e = this.el.getBoundingClientRect(), s = this.pop.offsetWidth || 208, i = this.pop.offsetHeight || 220, n = 6;
    let r = m(e.right - s, 8, innerWidth - s - 8), h = t.bottom + n;
    h + i > innerHeight - 8 && (h = Math.max(8, t.top - n - i)), this.pop.style.left = `${Math.round(r)}px`, this.pop.style.top = `${Math.round(h)}px`;
    const c = t.left + t.width / 2 - r, l = t.top + t.height / 2 - h;
    this.pop.style.setProperty("--ssui-cx", `${Math.round(c)}px`), this.pop.style.setProperty("--ssui-cy", `${Math.round(l)}px`);
  }
  // ---- paint --------------------------------------------------------------
  update(t) {
    const e = G(t);
    e && this._state !== "dragging" && this.readInto(e), this.paint();
  }
  paint(t = !0) {
    const e = this.rgba(), s = `rgb(${Math.round(e.r * 255)} ${Math.round(e.g * 255)} ${Math.round(e.b * 255)} / ${this.a})`, i = `rgb(${Math.round(e.r * 255)} ${Math.round(e.g * 255)} ${Math.round(e.b * 255)})`;
    this.box.style.setProperty("--ssui-color-current", s), this.box.style.setProperty("--ssui-color-opaque", i), this.box.style.setProperty("--ssui-h", `${this.hsv.h.toFixed(1)}`), this.box.style.setProperty("--ssui-sx", `${(this.hsv.s * 100).toFixed(2)}%`), this.box.style.setProperty("--ssui-sy", `${((1 - this.hsv.v) * 100).toFixed(2)}%`), this.box.style.setProperty("--ssui-hx", `${(this.hsv.h / 360 * 100).toFixed(2)}%`), this.box.style.setProperty("--ssui-ax", `${(this.a * 100).toFixed(2)}%`), t && document.activeElement !== this.hex && (this.hex.value = zt(e, this.alpha)), this.sv.setAttribute("aria-valuetext", `s ${Math.round(this.hsv.s * 100)}% v ${Math.round(this.hsv.v * 100)}%`), this.hue.setAttribute("aria-valuenow", String(Math.round(this.hsv.h))), this.hue.setAttribute("aria-valuetext", `${Math.round(this.hsv.h)}°`), this.alphaEl?.setAttribute("aria-valuenow", String(Math.round(this.a * 100))), this.alphaEl?.setAttribute("aria-valuetext", `${Math.round(this.a * 100)}%`), (this.mode === "hsv" ? this.hsvWidgets : this.rgbWidgets).forEach((n) => n.refresh());
  }
}
class Nt extends _ {
  constructor(t, e = {}) {
    super(t, e, "text"), e.multiline && (this.stacked = !0), this.mount();
  }
  render() {
    const t = { class: "ssui-text__input", id: this.inputId, name: this.id, placeholder: this.opts.placeholder ?? "", maxlength: this.opts.maxLength, "aria-labelledby": `${this.inputId}-label` };
    return this.input = this.opts.multiline ? o("textarea", { ...t, rows: 3 }) : o("input", { ...t, type: "text", autocomplete: "off", spellcheck: "false" }), this.input.addEventListener("input", () => this.setValue(this.input.value)), this.input.addEventListener("focus", () => this.setState("editing")), this.input.addEventListener("blur", () => {
      this.setState("idle"), this.emit("finish", this.binding.read());
    }), this.input.addEventListener("keydown", (e) => {
      const s = e;
      s.stopPropagation(), s.key === "Enter" && !this.opts.multiline && (s.preventDefault(), this.input.blur()), s.key === "Escape" && (this.input.value = this.last, this.setValue(this.last), this.input.blur());
    }), o("div", { class: `ssui-text${this.opts.multiline ? " ssui-text--multiline" : ""}` }, [this.input]);
  }
  sanitize(t) {
    return String(t ?? "");
  }
  update(t) {
    this.input.value !== t && (this.input.value = t);
  }
}
class ct extends K {
  constructor(t, e) {
    super(), this.serializable = !1, this.buttons = [], this.id = t.length === 1 ? t[0].id ?? H(t[0].label) : H(e ?? t.map((n) => n.label).join("-"));
    const s = o("div", { class: "ssui-button-group" });
    for (const n of t) {
      const r = o("button", { class: `ssui-button${n.variant && n.variant !== "default" ? ` ssui-button--${n.variant}` : ""}${n.icon && !n.label ? " ssui-button--icon" : ""}`, type: "button", title: n.title }, [
        n.icon ? $(n.icon) : null,
        n.label || null
      ]);
      r.addEventListener("click", () => {
        n.onClick?.(), this.emit("click", n.id ?? H(n.label));
      }), this.buttons.push(r), s.append(r);
    }
    const i = t.length > 1 && !e;
    this.el = o("div", { class: `ssui-row ssui-row--${i ? "buttons" : "button"}`, "data-ssui-id": this.id }, [
      o("div", { class: "ssui-row__label" }, [e ?? ""]),
      o("div", { class: "ssui-row__control" }, [s])
    ]);
  }
  click(t = 0) {
    this.buttons[t]?.click();
  }
  disable(t = !0) {
    return this.el.toggleAttribute("data-ssui-disabled", t), this;
  }
  hide(t = !0) {
    return this.el.toggleAttribute("data-ssui-hidden", t), this;
  }
  dispose() {
    this.el.remove(), this.emit("dispose"), this.clear();
  }
}
function pt(a, t, e, s) {
  const i = (u, d) => 1 - 3 * d + 3 * u, n = (u, d) => 3 * d - 6 * u, r = (u) => 3 * u, h = (u, d, p) => ((i(d, p) * u + n(d, p)) * u + r(d)) * u, c = (u, d, p) => 3 * i(d, p) * u * u + 2 * n(d, p) * u + r(d);
  if (a === t && e === s) return (u) => u;
  const l = (u) => {
    let d = u;
    for (let g = 0; g < 8; g++) {
      const b = c(d, a, e);
      if (Math.abs(b) < 1e-6) break;
      const v = h(d, a, e) - u;
      if (Math.abs(v) < 1e-7) return d;
      d -= v / b;
    }
    let p = 0, f = 1;
    d = u;
    for (let g = 0; g < 32 && f - p > 1e-7; g++)
      h(d, a, e) < u ? p = d : f = d, d = (p + f) / 2;
    return d;
  };
  return (u) => u <= 0 ? 0 : u >= 1 ? 1 : h(l(u), t, s);
}
function ft(a) {
  const t = [...a].sort((l, u) => l[0] - u[0]), e = t.length;
  if (e === 0) return (l) => l;
  if (e === 1) return () => t[0][1];
  const s = t.map((l) => l[0]), i = t.map((l) => l[1]), n = [], r = [], h = [];
  for (let l = 0; l < e - 1; l++)
    n.push(s[l + 1] - s[l] || 1e-9), r.push(i[l + 1] - i[l]), h.push(r[l] / n[l]);
  const c = new Array(e).fill(0);
  c[0] = h[0], c[e - 1] = h[e - 2];
  for (let l = 1; l < e - 1; l++)
    if (h[l - 1] * h[l] <= 0) c[l] = 0;
    else {
      const u = 2 * n[l] + n[l - 1], d = n[l] + 2 * n[l - 1];
      c[l] = (u + d) / (u / h[l - 1] + d / h[l]);
    }
  return (l) => {
    if (l <= s[0]) return i[0];
    if (l >= s[e - 1]) return i[e - 1];
    let u = 0;
    for (; u < e - 2 && l > s[u + 1]; ) u++;
    const d = n[u], p = (l - s[u]) / d, f = 2 * p ** 3 - 3 * p ** 2 + 1, g = p ** 3 - 2 * p ** 2 + p, b = -2 * p ** 3 + 3 * p ** 2, v = p ** 3 - p ** 2;
    return f * i[u] + g * d * c[u] + b * i[u + 1] + v * d * c[u + 1];
  };
}
const qt = (a) => {
  const t = a.toFixed(4).replace(/\.?0+$/, "");
  return t === "" || t === "-0" ? "0" : t;
};
function jt(a, t = 24) {
  const e = [];
  for (let s = 0; s <= t; s++) e.push(qt(a(s / t)));
  return `linear(${e.join(", ")})`;
}
const k = (a, t, e, s) => ({ type: "bezier", points: [a, t, e, s] }), Jt = {
  type: "points",
  points: [[0, 0], [0.12, 0.34], [0.25, 0.7], [0.36, 0.94], [0.46, 1.05], [0.58, 1.045], [0.72, 1.02], [0.86, 1.005], [1, 1]]
}, Wt = {
  linear: k(0, 0, 1, 1),
  ease: k(0.25, 0.1, 0.25, 1),
  easeIn: k(0.42, 0, 1, 1),
  easeOut: k(0, 0, 0.58, 1),
  easeInOut: k(0.42, 0, 0.58, 1),
  easeInQuad: k(0.11, 0, 0.5, 0),
  easeInCubic: k(0.32, 0, 0.67, 0),
  easeInExpo: k(0.7, 0, 0.84, 0),
  easeOutQuad: k(0.5, 1, 0.89, 1),
  easeOutCubic: k(0.33, 1, 0.68, 1),
  easeOutExpo: k(0.16, 1, 0.3, 1),
  easeInOutCubic: k(0.65, 0, 0.35, 1),
  spring: Jt
}, Kt = "http://www.w3.org/2000/svg", V = (a, t = {}) => {
  const e = document.createElementNS(Kt, a);
  for (const [s, i] of Object.entries(t)) e.setAttribute(s, String(i));
  return e;
}, et = (a) => (Math.round(a * 1e3) / 1e3).toString().replace(/^(-?)0\./, "$1."), R = 0.2, J = 0.03;
class Ut extends _ {
  constructor(t, e = {}) {
    super(t, e, "curve"), this.modeBtns = [], this.handles = [], this.fn = (s) => s, this.time = 0, this.stopAnim = null, this.copyTimer = 0, this.dragIndex = -1, this.focusIndex = -1, this.sx = (1 + 2 * J) / 288, this.sy = (1 + 2 * R) / 128, this.presets = e.presets ?? Wt, this.stacked = !0, this.mount();
  }
  // ---- public output --------------------------------------------------------
  toFunction() {
    return this.fn;
  }
  toCSS(t = 24) {
    const e = this.binding.read();
    return e.type === "bezier" ? `cubic-bezier(${e.points.map(et).join(", ")})` : jt(this.fn, t);
  }
  toArray(t) {
    const e = new Float32Array(t);
    for (let s = 0; s < t; s++) e[s] = this.fn(t === 1 ? 0 : s / (t - 1));
    return e;
  }
  /** name of the matching preset or null */
  presetOf(t = this.binding.read()) {
    const e = JSON.stringify(t);
    for (const [s, i] of Object.entries(this.presets)) if (JSON.stringify(i) === e) return s;
    return null;
  }
  // ---- render ---------------------------------------------------------------
  render() {
    const t = this.opts.mode ?? "both", e = E.chevron();
    this.presetName = o("span", { class: "ssui-curve__preset-name" });
    const s = o("button", { class: "ssui-curve__preset", type: "button", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": "Curve preset" }, [this.presetName, e]);
    this.presetMenu = o("ul", { class: "ssui-select__menu", role: "listbox", tabindex: -1 }), Object.keys(this.presets).forEach((l, u) => {
      const d = o("li", { class: "ssui-select__option", role: "option", "aria-selected": "false", "data-name": l }, [l]);
      d.style.setProperty("--i", String(u)), d.addEventListener("click", (p) => {
        p.stopPropagation(), this.applyPreset(l), this.closeMenu(!0);
      }), this.presetMenu.append(d);
    }), this.presetBox = o("div", { class: "ssui-select ssui-curve__menu-wrap" }, [s, this.presetMenu]), s.addEventListener("click", (l) => {
      l.stopPropagation(), this.isMenuOpen ? this.closeMenu() : this.openMenu();
    }), s.addEventListener("keydown", (l) => this.onMenuKey(l)), this.presetMenu.addEventListener("keydown", (l) => this.onMenuKey(l));
    const i = (l) => {
      this.presetBox.contains(l.target) || this.closeMenu();
    };
    document.addEventListener("pointerdown", i, !0), this.cleanups.push(() => document.removeEventListener("pointerdown", i, !0));
    const n = o("div", { class: "ssui-curve__head" }, [this.presetBox]);
    if (t === "both") {
      const l = o("div", { class: "ssui-curve__mode", role: "group", "aria-label": "Curve mode" });
      for (const u of ["bezier", "points"]) {
        const d = o("button", { type: "button", "aria-pressed": "false", "data-mode": u }, [u]);
        d.addEventListener("click", () => this.switchMode(u)), this.modeBtns.push(d), l.append(d);
      }
      n.append(l);
    }
    this.labelEl.append(n), this.svg = V("svg", { class: "ssui-curve__svg", viewBox: `${-J} ${-R} ${1 + 2 * J} ${1 + 2 * R}`, preserveAspectRatio: "none", "aria-hidden": "true" });
    const r = V("path", { class: "ssui-curve__grid", d: "M.25 -1V2M.5 -1V2M.75 -1V2M-1 .25H2M-1 .5H2M-1 .75H2" }), h = V("path", { class: "ssui-curve__unit", d: "M-1 0H2M-1 1H2" });
    this.arms = V("path", { class: "ssui-curve__arm" }), this.path = V("path", { class: "ssui-curve__path" }), this.ballX = V("line", { class: "ssui-curve__ball-x", y1: -R, y2: 1 + R }), this.ball = V("circle", { class: "ssui-curve__ball" }), this.handlesG = V("g"), this.svg.append(r, h, this.arms, this.path, this.ballX, this.ball, this.handlesG), this.svg.style.transform = "scaleY(-1)", this.stage = o("div", { class: "ssui-curve__stage", role: "application", "aria-label": `${this.opts.label ?? "curve"} editor`, tabindex: -1 }, [
      this.svg,
      o("span", { class: "ssui-curve__hint", "aria-hidden": "true" }, ["dbl-click: add"])
    ]), this.opts.height && this.stage.style.setProperty("--ssui-curve-height", `${this.opts.height}px`);
    const c = new ResizeObserver(() => {
      const l = this.stage.clientWidth, u = this.stage.clientHeight;
      !l || !u || (this.sx = (1 + 2 * J) / l, this.sy = (1 + 2 * R) / u, this.fitHandleRadius(), this.drawBall());
    });
    return c.observe(this.stage), this.cleanups.push(() => c.disconnect()), this.stage.addEventListener("dblclick", (l) => this.onDblClick(l)), this.stage.addEventListener("keydown", (l) => this.onStageKey(l)), this.cssOut = o("output", { class: "ssui-curve__css", title: "Click to copy", "aria-label": "CSS easing, click to copy" }), this.cssOut.addEventListener("click", () => this.copyCSS()), bt() ? this.time = 0.5 : (this.stopAnim = B.animate({ flush() {
    }, poll() {
    }, tick: (l) => {
      this.time = (this.time + l / 1400) % 1, this.drawBall();
    } }), this.cleanups.push(() => this.stopAnim?.())), o("div", { class: "ssui-curve" }, [this.stage, this.cssOut]);
  }
  // ---- value -> DOM ---------------------------------------------------------
  sanitize(t) {
    const e = this.opts.overshoot !== !1, s = (n) => e ? m(n, -0.5, 1.5) : m(n, 0, 1);
    if (t.type === "bezier") {
      const [n, r, h, c] = t.points;
      return { type: "bezier", points: [m(n, 0, 1), s(r), m(h, 0, 1), s(c)] };
    }
    const i = t.points.map(([n, r]) => [m(n, 0, 1), s(r)]).sort((n, r) => n[0] - r[0]);
    return i.length < 2 ? { type: "points", points: [[0, 0], [1, 1]] } : (i[0][0] = 0, i[i.length - 1][0] = 1, { type: "points", points: i });
  }
  update(t) {
    this.fn = t.type === "bezier" ? pt(...t.points) : ft(t.points);
    const e = 64;
    let s = "";
    for (let r = 0; r <= e; r++) {
      const h = r / e;
      s += `${r ? "L" : "M"}${h.toFixed(4)} ${this.fn(h).toFixed(4)}`;
    }
    this.path.setAttribute("d", s);
    const i = t.type === "bezier" ? [[t.points[0], t.points[1]], [t.points[2], t.points[3]]] : t.points;
    this.arms.setAttribute("d", t.type === "bezier" ? `M0 0L${i[0][0]} ${i[0][1]}M1 1L${i[1][0]} ${i[1][1]}` : ""), this.syncHandles(i, t.type), this.cssOut.textContent = this.toCSS();
    const n = this.presetOf(t);
    this.presetName.textContent = n ?? "custom", this.presetName.toggleAttribute("data-ssui-custom", !n), this.presetMenu.querySelectorAll(".ssui-select__option").forEach((r) => r.setAttribute("aria-selected", String(r.dataset.name === n))), this.modeBtns.forEach((r) => r.setAttribute("aria-pressed", String(r.dataset.mode === t.type))), this.curveRoot.setAttribute("data-ssui-mode", t.type), this.drawBall();
  }
  syncHandles(t, e) {
    for (; this.handles.length > t.length; ) this.handles.pop().remove();
    for (; this.handles.length < t.length; ) {
      const s = this.handles.length, i = V("circle", { class: "ssui-curve__handle", role: "slider", tabindex: 0, "aria-orientation": "vertical" });
      i.addEventListener("focus", () => {
        this.focusIndex = s;
      }), i.addEventListener("keydown", (n) => this.onHandleKey(n, s)), this.cleanups.push(D(i, {
        immediate: !0,
        cursor: "grabbing",
        onStart: () => {
          this.dragIndex = s, i.setAttribute("data-ssui-dragging", ""), this.setState("dragging");
        },
        onMove: (n) => this.moveHandle(s, n.x, n.y),
        onEnd: () => {
          this.dragIndex = -1, i.removeAttribute("data-ssui-dragging"), this.setState("idle"), this.emit("finish", this.binding.read());
        }
      })), this.handlesG.append(i), this.handles.push(i);
    }
    t.forEach(([s, i], n) => {
      const r = this.handles[n];
      r.dataset.x = String(s), r.dataset.y = String(i);
      const h = e === "points" && (n === 0 || n === t.length - 1);
      r.toggleAttribute("data-ssui-locked", h), r.setAttribute("aria-label", e === "bezier" ? `control point ${n + 1}` : h ? n === 0 ? "start" : "end" : `point ${n + 1}`), r.setAttribute("aria-valuetext", `x ${et(s)} y ${et(i)}`), r.setAttribute("aria-valuenow", et(i));
    }), this.fitHandleRadius();
  }
  fitHandleRadius() {
    this.handles.forEach((t) => {
      t.setAttribute("transform", `translate(${t.dataset.x ?? 0} ${t.dataset.y ?? 0}) scale(${this.sx} ${this.sy})`);
    });
  }
  drawBall() {
    const t = this.time, e = this.fn(t);
    this.ball.setAttribute("transform", `translate(${t} ${e}) scale(${this.sx} ${this.sy})`), this.ballX.setAttribute("x1", String(t)), this.ballX.setAttribute("x2", String(t));
  }
  // ---- interaction ----------------------------------------------------------
  toLocal(t, e) {
    const s = this.stage.getBoundingClientRect(), i = (t - s.left) / s.width * (1 + 2 * J) - J, n = 1 - (e - s.top) / s.height * (1 + 2 * R) + R;
    return [i, n];
  }
  moveHandle(t, e, s) {
    const i = this.clone(this.binding.read()), [n, r] = this.toLocal(e, s);
    if (i.type === "bezier")
      i.points[t * 2] = n, i.points[t * 2 + 1] = r;
    else {
      const h = i.points.length - 1, c = t === 0 ? 0 : i.points[t - 1][0] + 1e-3, l = t === h ? 1 : i.points[t + 1][0] - 1e-3;
      i.points[t] = [t === 0 || t === h ? i.points[t][0] : m(n, c, l), r];
    }
    this.setValue(i);
  }
  nudge(t, e, s, i = !0) {
    const n = this.clone(this.binding.read());
    if (n.type === "bezier")
      n.points[t * 2] += e, n.points[t * 2 + 1] += s;
    else {
      const r = n.points.length - 1, h = t === 0 ? 0 : n.points[t - 1][0] + 1e-3, c = t === r ? 1 : n.points[t + 1][0] - 1e-3, l = t === 0 || t === r ? n.points[t][0] : m(n.points[t][0] + e, h, c);
      n.points[t] = [l, n.points[t][1] + s];
    }
    this.setValue(n, i);
  }
  onHandleKey(t, e) {
    const s = 0.01 * L(t), i = this.binding.read();
    switch (t.key) {
      case "ArrowUp":
        this.nudge(e, 0, s);
        break;
      case "ArrowDown":
        this.nudge(e, 0, -s);
        break;
      case "ArrowRight":
        this.nudge(e, s, 0);
        break;
      case "ArrowLeft":
        this.nudge(e, -s, 0);
        break;
      case "Backspace":
      case "Delete":
        if (i.type === "points" && e > 0 && e < i.points.length - 1) {
          const n = this.clone(i);
          n.points.splice(e, 1), this.setValue(n, !0), this.handles[Math.max(0, e - 1)]?.focus();
        }
        break;
      default:
        return;
    }
    t.preventDefault(), t.stopPropagation();
  }
  onStageKey(t) {
    t.key === "Escape" && this.stage.blur();
  }
  onDblClick(t) {
    const e = this.binding.read();
    if (e.type !== "points" || t.target.classList.contains("ssui-curve__handle")) return;
    const [s, i] = this.toLocal(t.clientX, t.clientY), n = this.clone(e);
    n.points.push([m(s, 1e-3, 0.999), i]), n.points.sort((h, c) => h[0] - c[0]), this.setValue(n, !0);
    const r = n.points.findIndex((h) => h[0] === m(s, 1e-3, 0.999));
    requestAnimationFrame(() => this.handles[r]?.focus());
  }
  switchMode(t) {
    if (this.binding.read().type !== t)
      if (t === "points") {
        const s = [];
        for (let i = 0; i <= 6; i++) {
          const n = i / 6;
          s.push([n, +this.fn(n).toFixed(3)]);
        }
        this.setValue({ type: "points", points: s }, !0);
      } else {
        const s = this.fn(0.25), i = this.fn(0.75);
        this.setValue({ type: "bezier", points: [0.25, +s.toFixed(3), 0.75, +i.toFixed(3)] }, !0);
      }
  }
  applyPreset(t) {
    const e = this.presets[t];
    if (!e) return;
    const s = this.opts.mode ?? "both";
    if (s !== "both" && e.type !== s) {
      const i = e.type === "bezier" ? pt(...e.points) : ft(e.points);
      if (s === "points") {
        const n = [];
        for (let r = 0; r <= 8; r++) n.push([r / 8, +i(r / 8).toFixed(3)]);
        this.setValue({ type: "points", points: n }, !0);
      } else this.setValue({ type: "bezier", points: [0.25, +i(0.25).toFixed(3), 0.75, +i(0.75).toFixed(3)] }, !0);
      return;
    }
    this.setValue(this.clone(e), !0);
  }
  copyCSS() {
    const t = this.toCSS();
    navigator.clipboard?.writeText(t).catch(() => {
    }), this.cssOut.setAttribute("data-ssui-copied", ""), clearTimeout(this.copyTimer), this.copyTimer = window.setTimeout(() => this.cssOut.removeAttribute("data-ssui-copied"), 300);
  }
  // ---- preset menu ----------------------------------------------------------
  get isMenuOpen() {
    return this.el.querySelector(".ssui-curve")?.hasAttribute("data-ssui-open") ?? !1;
  }
  get curveRoot() {
    return this.el.querySelector(".ssui-curve");
  }
  openMenu() {
    this.curveRoot.setAttribute("data-ssui-open", ""), this.presetBox.setAttribute("data-ssui-open", ""), this.presetBox.querySelector("button").setAttribute("aria-expanded", "true"), this.setState("open");
    const t = this.presetMenu.querySelector('[aria-selected="true"]') ?? this.presetMenu.firstElementChild;
    this.setMenuActive(t), this.presetMenu.focus({ preventScroll: !0 });
  }
  closeMenu(t = !1) {
    this.isMenuOpen && (this.curveRoot.removeAttribute("data-ssui-open"), this.presetBox.removeAttribute("data-ssui-open"), this.presetBox.querySelector("button").setAttribute("aria-expanded", "false"), this.setState("idle"), t && this.presetBox.querySelector("button").focus());
  }
  setMenuActive(t) {
    this.presetMenu.querySelectorAll(".ssui-select__option").forEach((e) => e.toggleAttribute("data-ssui-active", e === t)), t?.scrollIntoView({ block: "nearest" });
  }
  onMenuKey(t) {
    const e = [...this.presetMenu.querySelectorAll(".ssui-select__option")], s = e.findIndex((i) => i.hasAttribute("data-ssui-active"));
    if (!this.isMenuOpen) {
      ["Enter", " ", "ArrowDown", "ArrowUp"].includes(t.key) && (t.preventDefault(), this.openMenu());
      return;
    }
    switch (t.key) {
      case "ArrowDown":
        t.preventDefault(), this.setMenuActive(e[(s + 1) % e.length]);
        break;
      case "ArrowUp":
        t.preventDefault(), this.setMenuActive(e[(s - 1 + e.length) % e.length]);
        break;
      case "Enter":
      case " ":
        t.preventDefault(), s >= 0 && (this.applyPreset(e[s].dataset.name), this.closeMenu(!0));
        break;
      case "Escape":
        t.preventDefault(), this.closeMenu(!0);
        break;
      case "Tab":
        this.closeMenu();
        break;
    }
    t.stopPropagation();
  }
  onThemeChange() {
  }
  dispose() {
    clearTimeout(this.copyTimer), super.dispose();
  }
}
class Gt extends _ {
  constructor(t, e = {}) {
    super(t, { ...e, listen: !0 }, "monitor"), this.serializable = !1, this.canvas = null, this.head = 0, this.filled = 0, this.acc = 0, this.stopTick = null, e.graph && (this.stacked = !0), this.mount();
  }
  render() {
    if (this.out = o("output", { class: "ssui-monitor__value ssui-value", id: this.inputId, "aria-live": "off", "aria-labelledby": `${this.inputId}-label` }), !this.opts.graph) return this.out;
    this.buf = new Float32Array(Math.max(2, this.opts.samples ?? 64)), this.canvas = o("canvas", { class: "ssui-monitor__graph", "aria-hidden": "true" }), this.labelEl.append(this.out);
    const t = new ResizeObserver(() => this.draw());
    return t.observe(this.canvas), this.cleanups.push(() => t.disconnect()), this.stopTick = B.animate({ flush() {
    }, poll() {
    }, tick: (e) => this.sample(e) }), this.cleanups.push(() => this.stopTick?.()), o("div", { class: "ssui-monitor" }, [this.canvas]);
  }
  sample(t) {
    const e = this.opts.interval ?? 0;
    if (this.acc += t, e > 0 && this.acc < e) return;
    this.acc = 0;
    const s = this.binding.read(), i = typeof s == "number" ? s : typeof s == "boolean" ? s ? 1 : 0 : NaN;
    isFinite(i) && (this.buf[this.head] = i, this.head = (this.head + 1) % this.buf.length, this.filled = Math.min(this.filled + 1, this.buf.length), this.draw());
  }
  update(t) {
    const e = this.opts.format ? this.opts.format(t) : typeof t == "number" ? I(t, { precision: Number.isInteger(t) ? 0 : 2 }) : typeof t == "boolean" ? t ? "on" : "off" : String(t ?? "");
    this.out.textContent = e, this.out.classList.toggle("ssui-monitor__value--bool", typeof t == "boolean"), this.out.toggleAttribute("data-ssui-on", t === !0);
  }
  onThemeChange() {
    this.draw();
  }
  draw() {
    if (!this.canvas) return;
    const t = this.canvas.clientWidth, e = this.canvas.clientHeight;
    if (!t || !e) return;
    const s = Math.min(2, devicePixelRatio || 1);
    (this.canvas.width !== t * s || this.canvas.height !== e * s) && (this.canvas.width = t * s, this.canvas.height = e * s);
    const i = this.canvas.getContext("2d");
    if (i.setTransform(s, 0, 0, s, 0, 0), i.clearRect(0, 0, t, e), this.filled < 2) return;
    const n = this.el.closest(".ssui-panel"), r = n ? getComputedStyle(n) : null, h = r?.getPropertyValue("--ssui-color-canvas-line").trim() || "#888", c = r?.getPropertyValue("--ssui-color-accent").trim() || "#f09526", l = this.buf.length, u = this.filled;
    let d = this.opts.min ?? 1 / 0, p = this.opts.max ?? -1 / 0;
    if (this.opts.min === void 0 || this.opts.max === void 0) {
      for (let w = 0; w < u; w++) {
        const C = this.buf[(this.head - u + w + l) % l];
        this.opts.min === void 0 && (d = Math.min(d, C)), this.opts.max === void 0 && (p = Math.max(p, C));
      }
      const y = (p - d || 1) * 0.1;
      this.opts.min === void 0 && (d -= y), this.opts.max === void 0 && (p += y);
    }
    const f = p - d || 1, g = 3, b = (y) => g + (t - 2 * g) * y / (l - 1), v = (y) => e - g - (y - d) / f * (e - 2 * g);
    i.beginPath(), i.strokeStyle = h, i.lineWidth = 1, i.lineJoin = "round";
    let x = 0, A = 0;
    for (let y = 0; y < u; y++) {
      const w = this.buf[(this.head - u + y + l) % l];
      x = b(l - u + y), A = v(w), y === 0 ? i.moveTo(x, A) : i.lineTo(x, A);
    }
    i.stroke(), i.beginPath(), i.fillStyle = c, i.arc(x, A, 1.5, 0, Math.PI * 2), i.fill();
  }
}
class gt {
  constructor(t, e) {
    this.serializable = !1, this.id = `${t}-${Math.random().toString(36).slice(2, 6)}`, this.el = t === "separator" ? o("hr", { class: "ssui-separator", role: "separator" }) : o("p", { class: "ssui-label" }, [e ?? ""]);
  }
  text(t) {
    return this.el.textContent = t, this;
  }
  hide(t = !0) {
    return this.el.toggleAttribute("data-ssui-hidden", t), this;
  }
  disable() {
    return this;
  }
  dispose() {
    this.el.remove();
  }
}
class Zt extends K {
  constructor(t, e, s = {}) {
    super(), this.items = e, this.opts = s, this.serializable = !1, this.active = -1, this.optionEls = [], this.outside = (n) => {
      this.box.contains(n.target) || this.close();
    }, this.id = s.id ?? H(t);
    const i = s.icon ?? "plus";
    this.trigger = o("button", { class: `ssui-button ssui-menu__trigger${s.variant && s.variant !== "default" ? ` ssui-button--${s.variant}` : ""}`, type: "button", "aria-haspopup": "menu", "aria-expanded": "false" }, [
      i === "plus" ? E.plus() : i === "more" ? E.more() : null,
      t,
      i === "chevron" ? E.chevron() : null
    ]), this.menu = o("ul", { class: "ssui-select__menu ssui-menu__list", role: "menu", tabindex: -1 }), this.box = o("div", { class: `ssui-select ssui-menu${s.align === "left" ? " ssui-menu--left" : ""}` }, [this.trigger, this.menu]), this.el = o("div", { class: `ssui-row ssui-row--menu${s.full ? " ssui-row--menu-full" : ""}`, "data-ssui-id": this.id }, [o("div", { class: "ssui-row__label" }), o("div", { class: "ssui-row__control" }, [this.box])]), this.setItems(e), this.trigger.addEventListener("click", (n) => {
      n.stopPropagation(), this.isOpen ? this.close() : this.open();
    }), this.trigger.addEventListener("keydown", (n) => this.onKey(n)), this.menu.addEventListener("keydown", (n) => this.onKey(n)), document.addEventListener("pointerdown", this.outside, !0);
  }
  setItems(t) {
    this.items = t, this.menu.textContent = "", this.optionEls = t.map((e, s) => {
      const i = o("li", { class: "ssui-select__option", role: "menuitem", "aria-disabled": e.disabled ? "true" : null }, [e.label, e.hint ? o("span", { class: "ssui-select__option-index" }, [e.hint]) : null]);
      return i.style.setProperty("--i", String(s)), i.addEventListener("pointerenter", () => this.setActive(s)), i.addEventListener("click", (n) => {
        n.stopPropagation(), this.pick(s);
      }), this.menu.append(i), i;
    });
  }
  get isOpen() {
    return this.box.hasAttribute("data-ssui-open");
  }
  open() {
    this.isOpen || (this.box.setAttribute("data-ssui-open", ""), this.trigger.setAttribute("aria-expanded", "true"), this.setActive(0), this.menu.focus({ preventScroll: !0 }), this.emit("open"));
  }
  close(t = !1) {
    this.isOpen && (this.box.removeAttribute("data-ssui-open"), this.trigger.setAttribute("aria-expanded", "false"), t && this.trigger.focus(), this.emit("close"));
  }
  setActive(t) {
    this.active = t, this.optionEls.forEach((e, s) => e.toggleAttribute("data-ssui-active", s === t));
  }
  pick(t) {
    const e = this.items[t];
    !e || e.disabled || (this.close(!0), e.onSelect?.(), this.emit("select", e));
  }
  onKey(t) {
    const e = this.items.length;
    if (!this.isOpen) {
      ["Enter", " ", "ArrowDown"].includes(t.key) && (t.preventDefault(), this.open());
      return;
    }
    switch (t.key) {
      case "ArrowDown":
        t.preventDefault(), this.setActive((this.active + 1) % e);
        break;
      case "ArrowUp":
        t.preventDefault(), this.setActive((this.active - 1 + e) % e);
        break;
      case "Enter":
      case " ":
        t.preventDefault(), this.pick(this.active);
        break;
      case "Escape":
        t.preventDefault(), this.close(!0);
        break;
      case "Tab":
        this.close();
        break;
    }
  }
  disable(t = !0) {
    return this.el.toggleAttribute("data-ssui-disabled", t), this;
  }
  hide(t = !0) {
    return this.el.toggleAttribute("data-ssui-hidden", t), this;
  }
  dispose() {
    document.removeEventListener("pointerdown", this.outside, !0), this.el.remove(), this.emit("dispose"), this.clear();
  }
}
const Xt = ["Ch 1", "Ch 2", "Ch 3", "Ch 4"];
class Yt extends _ {
  constructor(t, e = {}) {
    super(t, e, "mixer"), this.stacked = !0, this.mount();
  }
  // ---- value helpers -------------------------------------------------------
  get hasOutput() {
    return this.opts.output !== !1;
  }
  normalize(t) {
    const e = this.names.length, s = Array.isArray(t?.channels) ? t.channels : [], i = [];
    for (let r = 0; r < e; r++) {
      const h = s[r] ?? {};
      i.push({
        gain: m(W(typeof h.gain == "number" ? h.gain : 80, this.gStep, this.gMin), this.gMin, this.gMax),
        pan: m(Math.round(typeof h.pan == "number" ? h.pan : 0), -50, 50),
        mute: !!h.mute,
        solo: !!h.solo
      });
    }
    const n = this.hasOutput ? e : e - 1;
    return {
      channels: i,
      output: m(W(typeof t?.output == "number" ? t.output : 80, this.gStep, this.gMin), this.gMin, this.gMax),
      selected: m(Math.round(typeof t?.selected == "number" ? t.selected : 0), 0, Math.max(0, n))
    };
  }
  sanitize(t) {
    return this.normalize(t);
  }
  clone(t) {
    return t && { channels: (t.channels ?? []).map((e) => ({ ...e })), output: t.output, selected: t.selected };
  }
  edit(t, e = !1) {
    const s = this.normalize(this.clone(this.binding.read()));
    t(s), this.setValue(s, e);
  }
  selIsOutput(t) {
    return this.hasOutput && t.selected === this.names.length;
  }
  gainOf(t, e) {
    return e === this.names.length ? t.output : t.channels[e].gain;
  }
  setGain(t, e, s) {
    const i = m(W(s, this.gStep, this.gMin), this.gMin, this.gMax);
    e === this.names.length ? t.output = i : t.channels[e].gain = i;
  }
  // ---- render --------------------------------------------------------------
  render() {
    const t = this.opts;
    this.names = t.channels ?? Xt, this.gMin = t.gain?.min ?? 0, this.gMax = t.gain?.max ?? 100, this.gStep = t.gain?.step ?? 1, this.height = t.height ?? 96, this.cols = [], this.dragStart = 0, this.dot = o("span", { class: "ssui-mixer__dot", "aria-hidden": "true" }), this.labelEl.append(this.dot), this.highlight = o("div", { class: "ssui-mixer__highlight", "aria-hidden": "true" }), this.channelsEl = o("div", { class: "ssui-mixer__channels", role: "group", "aria-label": `${t.label ?? this.id} channels` }, [this.highlight]);
    const e = this.names.length + (this.hasOutput ? 1 : 0);
    this.channelsEl.style.setProperty("--ssui-mixer-count", String(e)), this.channelsEl.style.setProperty("--ssui-mixer-height", `${this.height}px`);
    for (let r = 0; r < e; r++) {
      const h = r === this.names.length, c = o("span", { class: "ssui-mixer__name" }, [h ? "Output" : this.names[r]]), l = o("div", {
        class: "ssui-mixer__fader",
        role: "slider",
        tabindex: 0,
        "aria-orientation": "vertical",
        "aria-label": `${h ? "Output" : this.names[r]} gain`,
        "aria-valuemin": String(this.gMin),
        "aria-valuemax": String(this.gMax)
      }, [o("span", { class: "ssui-mixer__rail" }, [o("span", { class: "ssui-mixer__fill" }), o("span", { class: "ssui-mixer__cap" })])]), u = h ? null : o("span", { class: "ssui-mixer__state", "aria-hidden": "true" }), d = o("button", { class: `ssui-mixer__channel${h ? " ssui-mixer__channel--output" : ""}`, type: "button", "aria-pressed": "false" }, [c, l, u]);
      d.addEventListener("click", () => this.select(r)), this.cleanups.push(D(l, {
        immediate: !0,
        cursor: "ns-resize",
        onStart: () => {
          this.dragStart = this.gainOf(this.normalize(this.binding.read()), r), this.edit((p) => {
            p.selected = r;
          }), this.setState("dragging"), this.box.setAttribute("data-ssui-state", "dragging"), d.setAttribute("data-ssui-dragging", "");
        },
        onMove: (p) => {
          const f = (this.gMax - this.gMin) / this.height * L(p);
          this.edit((g) => this.setGain(g, r, this.dragStart - p.dy * f));
        },
        onEnd: () => {
          this.setState("idle"), this.box.setAttribute("data-ssui-state", "idle"), d.removeAttribute("data-ssui-dragging"), d.setAttribute("data-ssui-released", ""), setTimeout(() => d.removeAttribute("data-ssui-released"), 450), this.emit("finish", this.binding.read());
        }
      })), l.addEventListener("dblclick", (p) => {
        p.stopPropagation();
        const f = this.normalize(this.initial);
        this.edit((g) => this.setGain(g, r, this.gainOf(f, r)), !0);
      }), l.addEventListener("keydown", (p) => {
        if (p.key === "ArrowLeft" || p.key === "ArrowRight") {
          p.preventDefault();
          const b = m(r + (p.key === "ArrowRight" ? 1 : -1), 0, e - 1);
          this.select(b), this.cols[b].fader.focus();
          return;
        }
        const f = this.gainOf(this.normalize(this.binding.read()), r), g = q(p, { step: this.gStep, min: this.gMin, max: this.gMax }, f);
        g !== null && (p.preventDefault(), p.stopPropagation(), this.edit((b) => {
          b.selected = r, this.setGain(b, r, f + g);
        }, !0));
      }), l.addEventListener("focus", () => this.select(r)), this.cols.push({ el: d, fader: l, name: c, state: u, index: r, isOutput: h }), this.channelsEl.append(d);
    }
    const s = N(0);
    s.read = () => {
      const r = this.normalize(this.binding.read());
      return this.gainOf(r, r.selected);
    }, s.write = (r) => this.edit((h) => this.setGain(h, h.selected, r)), this.gainRead = S.widget(s, { min: this.gMin, max: this.gMax, step: this.gStep, label: "Gain", id: `${this.id}-gain` }), this.gainRead.on("finish", () => this.emit("finish", this.binding.read())), this.gainRead.on("state", (r) => this.setState(r === "editing" || r === "dragging" ? r : "idle")), this.cleanups.push(() => this.gainRead.dispose());
    const i = o("div", { class: "ssui-mixer__field" }, [o("span", { class: "ssui-mixer__field-label" }, ["Gain"]), this.gainRead.widget]);
    if (this.panRead = null, this.panField = null, t.pan !== !1) {
      const r = N(0);
      r.read = () => {
        const h = this.normalize(this.binding.read());
        return this.selIsOutput(h) ? 0 : h.channels[h.selected].pan;
      }, r.write = (h) => this.edit((c) => {
        this.selIsOutput(c) || (c.channels[c.selected].pan = m(Math.round(h), -50, 50));
      }), this.panRead = S.widget(r, { min: -50, max: 50, step: 1, label: "Pan", id: `${this.id}-pan` }), this.panRead.on("finish", () => this.emit("finish", this.binding.read())), this.panRead.on("state", (h) => this.setState(h === "editing" || h === "dragging" ? h : "idle")), this.cleanups.push(() => this.panRead.dispose()), this.panField = o("div", { class: "ssui-mixer__field" }, [o("span", { class: "ssui-mixer__field-label" }, ["Pan"]), this.panRead.widget]);
    }
    this.muteBtn = o("button", { class: "ssui-mixer__round ssui-mixer__round--mute", type: "button", "aria-pressed": "false" }, ["Mute"]), this.soloBtn = o("button", { class: "ssui-mixer__round ssui-mixer__round--solo", type: "button", "aria-pressed": "false" }, ["Solo"]), this.muteBtn.addEventListener("click", () => this.edit((r) => {
      this.selIsOutput(r) || (r.channels[r.selected].mute = !r.channels[r.selected].mute);
    }, !0)), this.soloBtn.addEventListener("click", () => this.edit((r) => {
      this.selIsOutput(r) || (r.channels[r.selected].solo = !r.channels[r.selected].solo);
    }, !0)), this.roundsEl = o("div", { class: "ssui-mixer__rounds" }, [this.muteBtn, this.soloBtn]);
    const n = o("div", { class: "ssui-mixer__detail" }, [o("div", { class: "ssui-mixer__fields" }, [i, this.panField]), this.roundsEl]);
    return t.controls === !1 && n.setAttribute("hidden", ""), this.box = o("div", { class: `ssui-mixer${t.controls === !1 ? " ssui-mixer--bare" : ""}`, "data-ssui-state": "idle" }, [this.channelsEl, n]), this.box;
  }
  select(t) {
    this.normalize(this.binding.read()).selected !== t && this.edit((s) => {
      s.selected = t;
    }, !0);
  }
  update(t) {
    const e = this.normalize(t), s = e.channels.some((n) => n.solo);
    for (const n of this.cols) {
      const r = this.gainOf(e, n.index), h = (r - this.gMin) / (this.gMax - this.gMin || 1);
      n.fader.style.setProperty("--ssui-p", h.toFixed(4)), n.fader.setAttribute("aria-valuenow", String(r)), n.fader.setAttribute("aria-valuetext", String(r));
      const c = n.index === e.selected;
      if (n.el.toggleAttribute("data-ssui-selected", c), n.el.setAttribute("aria-pressed", String(c)), !n.isOutput) {
        const l = e.channels[n.index];
        n.el.toggleAttribute("data-ssui-muted", l.mute), n.el.toggleAttribute("data-ssui-solo", l.solo), n.el.toggleAttribute("data-ssui-dimmed", s && !l.solo);
      }
    }
    this.channelsEl.style.setProperty("--ssui-mixer-sel", String(e.selected));
    const i = this.selIsOutput(e);
    if (this.box.toggleAttribute("data-ssui-output", i), !i) {
      const n = e.channels[e.selected];
      this.muteBtn.setAttribute("aria-pressed", String(n.mute)), this.soloBtn.setAttribute("aria-pressed", String(n.solo));
    }
    this.gainRead?.refresh(), this.panRead?.refresh();
  }
}
class Qt extends _ {
  constructor(t, e = {}) {
    super(t, e, "pads"), this.stacked = !0, this.mount();
  }
  render() {
    const t = this.binding.read() ?? {}, e = (this.opts.pads ?? Object.keys(t)).map((s) => typeof s == "string" ? { key: s } : s);
    return this.pads = [], this.box = o("div", { class: "ssui-pads", role: "group", "aria-labelledby": `${this.inputId}-label` }), this.box.style.setProperty("--ssui-pads-cols", String(this.opts.columns ?? 4)), e.forEach((s, i) => {
      const n = o("button", { class: "ssui-pad__face", type: "button", role: "switch", "aria-checked": "false", "aria-label": s.label ?? s.key, id: i === 0 ? this.inputId : void 0 });
      n.addEventListener("click", () => this.togglePad(s.key)), n.addEventListener("keydown", (h) => {
        const c = this.pads.length, l = this.pads.findIndex((p) => p.key === s.key), u = this.opts.columns ?? 4, d = (p) => {
          h.preventDefault(), this.pads[(p + c) % c].btn.focus();
        };
        h.key === "ArrowRight" ? d(l + 1) : h.key === "ArrowLeft" ? d(l - 1) : h.key === "ArrowDown" ? d(l + u) : h.key === "ArrowUp" && d(l - u);
      }), n.append(o("span", { class: "ssui-pad__label", "aria-hidden": "true" }, [s.label ?? s.key]));
      const r = o("div", { class: "ssui-pad" }, [n]);
      this.box.append(r), this.pads.push({ key: s.key, btn: n });
    }), this.box;
  }
  togglePad(t) {
    const e = this.binding.read() ?? {};
    this.setValue({ ...e, [t]: !e[t] }, !0);
  }
  set(t, e) {
    this.setValue({ ...this.binding.read() ?? {}, [t]: e }, !0);
  }
  sanitize(t) {
    const e = {};
    for (const s of Object.keys(t ?? {})) e[s] = !!t[s];
    return e;
  }
  update(t) {
    for (const e of this.pads) e.btn.setAttribute("aria-checked", String(!!t?.[e.key]));
  }
}
class F extends K {
  constructor() {
    super(...arguments), this.children = [], this.parent = null, this.ids = /* @__PURE__ */ new Set();
  }
  attach(t) {
    return t instanceof F ? (t.parent = this, t.on("change", (e, s) => this.emit("change", e, s)), t.on("finish", (e, s) => this.emit("finish", e, s))) : t instanceof _ && (t.on("change", (e) => this.emit("change", t, e)), t.on("finish", (e) => this.emit("finish", t, e))), this.children.push(t), this.bodyEl.append(t.el), this.emit("add", t), this.onChildrenChanged(), t;
  }
  onChildrenChanged() {
  }
  remove(t) {
    const e = this.children.indexOf(t);
    e !== -1 && (this.children.splice(e, 1), t.dispose(), this.emit("remove", t), this.onChildrenChanged());
  }
  /** move a child to a new index (DOM + children array); emits 'reorder' */
  move(t, e) {
    const s = this.children.indexOf(t);
    if (s === -1) return;
    const i = this.children.length, n = Math.max(0, Math.min(i - 1, e));
    if (n === s) return;
    this.children.splice(s, 1), this.children.splice(n, 0, t);
    const r = this.children[n + 1];
    r ? this.bodyEl.insertBefore(t.el, r.el) : this.bodyEl.append(t.el), this.emit("reorder", t, n);
  }
  /** current order as ids (persist it, then restore with setOrder) */
  order() {
    return this.children.map((t) => t.id);
  }
  setOrder(t) {
    t.forEach((e, s) => {
      const i = this.children.find((n) => n.id === e);
      i && this.move(i, s);
    });
  }
  /** the root Panel */
  get root() {
    let t = this;
    for (; t.parent; ) t = t.parent;
    return t;
  }
  // ---- generic add with type inference ----------------------------------
  add(t, e, s = {}) {
    const i = t[e], n = { label: e, ...s };
    if (typeof i == "number")
      return s.min !== void 0 && s.max !== void 0 ? this.addSlider(t, e, n) : this.addNumber(t, e, n);
    if (typeof i == "boolean") return this.addToggle(t, e, n);
    if (typeof i == "function") return this.addButton(n.label ?? e, () => i.call(t));
    if (s.options) return this.addSelect(t, e, { ...n, options: s.options });
    if (s.color || typeof i == "string" && /^#([0-9a-f]{3,8})$/i.test(i)) return this.addColor(t, e, n);
    if (typeof i == "string") return this.addText(t, e, n);
    if (i && typeof i == "object") {
      if ("type" in i && "points" in i) return this.addCurve(t, e, n);
      if (typeof i.x == "number" && typeof i.y == "number") return this.addPad2D(t, e, n);
      if ("r" in i && "g" in i && "b" in i) return this.addColor(t, e, n);
    }
    throw new Error(`[ssui] cannot infer a control for "${e}" (${typeof i})`);
  }
  addNumber(t, e, s = {}) {
    return this.attach(new S(M(t, e), { label: e, ...s }));
  }
  addSlider(t, e, s) {
    return this.attach(new $t(M(t, e), { label: e, ...s }));
  }
  addKnob(t, e, s = {}) {
    return this.attach(new Ot(M(t, e), { label: e, ...s }));
  }
  /** addPad2D(obj, 'offset') for {x,y} objects, or addPad2D(obj, 'x', 'y', opts) for two keys */
  addPad2D(t, e, s, i) {
    const n = typeof s == "string", r = n ? Ct(t, e, s) : Mt(t, e), h = (n ? i : s) ?? {};
    return this.attach(new it(r, { label: n ? `${e} / ${s}` : e, ...h }));
  }
  addToggle(t, e, s = {}) {
    return this.attach(new Pt(M(t, e), { label: e, ...s }));
  }
  addSelect(t, e, s) {
    return this.attach(new lt(M(t, e), { label: e, ...s }));
  }
  addColor(t, e, s = {}) {
    return this.attach(new Ht(M(t, e, Y), { label: e, ...s }));
  }
  addText(t, e, s = {}) {
    return this.attach(new Nt(M(t, e), { label: e, ...s }));
  }
  addButton(t, e, s = {}) {
    return this.attach(new ct([{ label: t, onClick: e, ...s }]));
  }
  addButtons(t, e) {
    return this.attach(new ct(t, e));
  }
  addCurve(t, e, s = {}) {
    return this.attach(new Ut(M(t, e, Y), { label: e, ...s }));
  }
  addMonitor(t, e, s = {}) {
    return this.attach(new Gt(M(t, e), { label: e, ...s }));
  }
  addMenu(t, e, s = {}) {
    return this.attach(new Zt(t, e, s));
  }
  addMixer(t, e, s = {}) {
    return this.attach(new Yt(M(t, e, Y), { label: e, ...s }));
  }
  /** square on/off pads, one per key of the bound object: addPads(S, 'pads') with S.pads = { amp: true, freq: false } */
  addPads(t, e, s = {}) {
    return this.attach(new Qt(M(t, e, Y), { label: e, ...s }));
  }
  addSeparator() {
    return this.attach(new gt("separator"));
  }
  addLabel(t) {
    return this.attach(new gt("label", t));
  }
  // ---- lookup -------------------------------------------------------------
  /** deep lookup by id or 'folder/id' path */
  get(t) {
    const [e, ...s] = t.split("/"), i = this.children.find((n) => n.id === e);
    if (i)
      return s.length ? i instanceof F ? i.get(s.join("/")) : void 0 : i;
  }
  /** flat list of value controllers, deep */
  controllers() {
    const t = [];
    for (const e of this.children)
      e instanceof F ? t.push(...e.controllers()) : e instanceof _ && t.push(e);
    return t;
  }
  folders() {
    return this.children.filter((t) => t instanceof F);
  }
  /** registers an id, deduping with -2, -3 … */
  registerId(t) {
    let e = t, s = 2;
    for (; this.ids.has(e); ) e = `${t}-${s++}`;
    return this.ids.add(e), e;
  }
  disable(t = !0) {
    return this.children.forEach((e) => e.disable?.(t)), this;
  }
  hide(t = !0) {
    return this.el.toggleAttribute("data-ssui-hidden", t), this;
  }
  show() {
    return this.hide(!1);
  }
  reset() {
    return this.controllers().forEach((t) => t.reset()), this;
  }
  /** pull every binding into the DOM now (after writing to the target object without listen()) */
  refresh() {
    return this.controllers().forEach((t) => t.refresh()), this;
  }
  onChange(t) {
    return this.on("change", t), this;
  }
  onFinishChange(t) {
    return this.on("finish", t), this;
  }
  // ---- serialization ------------------------------------------------------
  toJSON() {
    const t = {};
    for (const e of this.children)
      if (e instanceof F)
        for (const [s, i] of Object.entries(e.toJSON())) t[`${e.id}/${s}`] = i;
      else e instanceof _ && e.serializable && (t[e.id] = e.toJSON());
    return t;
  }
  fromJSON(t, e = {}) {
    const s = [];
    for (const [i, n] of Object.entries(t)) {
      const r = this.get(i);
      if (r instanceof _)
        try {
          r.fromJSON(n);
        } catch {
          s.push(i);
        }
      else s.push(i);
    }
    s.length && !e.silent && console.warn(`[ssui] preset: skipped ${s.length} value(s): ${s.join(", ")}`);
  }
  dispose() {
    for (const t of this.children.splice(0)) t.dispose();
    this.el.remove(), this.emit("dispose"), this.clear();
  }
}
class nt extends F {
  constructor(t, e = {}) {
    super(), this.soloBtn = null, this.menuEl = null, this.opts = e, this._id = e.id ?? H(t);
    const s = ot("ssui-folder");
    this.titleEl = o("span", { class: "ssui-folder__title" }, [t]), this.countEl = o("span", { class: "ssui-folder__count", "aria-hidden": "true" });
    const i = o("span", { class: "ssui-folder__chevron" }, [E.chevron()]);
    this.gripEl = o("span", { class: "ssui-folder__grip", "aria-hidden": "true" }, [E.grip()]), this.header = o("button", { class: "ssui-folder__header", type: "button", "aria-expanded": "true", "aria-controls": s }, [this.gripEl, this.titleEl, e.count ? this.countEl : null, i]), this.bodyEl = o("div", { class: "ssui-folder__body", id: s, role: "group", "aria-label": t }), this.el = o("div", { class: "ssui-folder", "data-ssui-id": this._id }, [this.header, o("div", { class: "ssui-folder__clip" }, [this.bodyEl])]), this.header.addEventListener("click", (n) => {
      this.el.hasAttribute("data-ssui-dragged") || this.isRenaming || n.target.closest(".ssui-folder__solo") || this.toggle();
    }), e.collapsed && (this.collapsed = !0), e.layout === "grid" && (this.el.setAttribute("data-ssui-layout", "grid"), this.el.style.setProperty("--ssui-folder-cols", String(e.columns ?? 3))), this.setEditable(e);
  }
  /** (re)wire rename / context menu / solo — Panel calls this with its `editable` defaults */
  setEditable(t) {
    t.renamable && !this.el.hasAttribute("data-ssui-renamable") && (this.el.setAttribute("data-ssui-renamable", ""), this.header.addEventListener("dblclick", (e) => {
      e.preventDefault(), this.rename();
    })), t.contextMenu && !this.el.hasAttribute("data-ssui-contextmenu") && (this.el.setAttribute("data-ssui-contextmenu", ""), this.el.addEventListener("contextmenu", (e) => {
      e.target.closest(".ssui-folder") === this.el && (e.preventDefault(), this.openMenu(e.clientX, e.clientY));
    })), t.soloable && !this.soloBtn && (this.soloBtn = o("button", { class: "ssui-folder__solo", type: "button", "aria-pressed": "false", title: "Solo this block" }, ["solo"]), this.soloBtn.addEventListener("click", (e) => {
      e.stopPropagation(), this.solo = !this.solo;
    }), this.el.insertBefore(this.soloBtn, this.header.nextSibling), this.el.setAttribute("data-ssui-soloable", ""));
  }
  get id() {
    return this._id;
  }
  /** the element a reorder drag starts from */
  get handle() {
    return this.header;
  }
  get titleText() {
    return this.titleEl.textContent ?? "";
  }
  title(t) {
    return this.titleEl.textContent = t, this.bodyEl.setAttribute("aria-label", t), this;
  }
  get collapsed() {
    return this.el.hasAttribute("data-ssui-collapsed");
  }
  set collapsed(t) {
    this.el.toggleAttribute("data-ssui-collapsed", t), this.header.setAttribute("aria-expanded", String(!t));
  }
  toggle() {
    this.collapsed = !this.collapsed;
  }
  open() {
    return this.collapsed = !1, this;
  }
  close() {
    return this.collapsed = !0, this;
  }
  // ---- solo ---------------------------------------------------------------
  get solo() {
    return this.el.hasAttribute("data-ssui-solo");
  }
  set solo(t) {
    t !== this.solo && (this.el.toggleAttribute("data-ssui-solo", t), this.soloBtn?.setAttribute("aria-pressed", String(t)), this.emit("solo", t));
  }
  /** dimmed = another block is soloed */
  set dimmed(t) {
    this.el.toggleAttribute("data-ssui-dimmed", t);
  }
  // ---- rename -------------------------------------------------------------
  get isRenaming() {
    return this.el.hasAttribute("data-ssui-renaming");
  }
  rename() {
    if (this.isRenaming) return;
    const t = o("input", { class: "ssui-folder__rename", type: "text", value: this.titleText, "aria-label": "Rename block", spellcheck: "false" });
    this.el.setAttribute("data-ssui-renaming", ""), this.titleEl.replaceWith(t), t.focus(), t.select();
    let e = !1;
    const s = (i) => {
      if (e) return;
      e = !0;
      const n = t.value.trim();
      t.replaceWith(this.titleEl), this.el.removeAttribute("data-ssui-renaming"), i && n && n !== this.titleText && (this.title(n), this.emit("rename", n));
    };
    t.addEventListener("keydown", (i) => {
      i.stopPropagation(), i.key === "Enter" ? (i.preventDefault(), s(!0)) : i.key === "Escape" && (i.preventDefault(), s(!1));
    }), t.addEventListener("blur", () => s(!0)), t.addEventListener("pointerdown", (i) => i.stopPropagation());
  }
  // ---- context menu -------------------------------------------------------
  openMenu(t, e) {
    this.closeMenu();
    const s = [
      { label: this.collapsed ? "Expand" : "Collapse", run: () => this.toggle() }
    ];
    this.el.hasAttribute("data-ssui-renamable") && s.push({ label: "Rename", run: () => this.rename() }), this.soloBtn && s.push({ label: this.solo ? "Unsolo" : "Solo", run: () => {
      this.solo = !this.solo;
    } }), s.push({ label: "Remove", danger: !0, run: () => this.emit("remove-request") });
    const i = o("ul", { class: "ssui-select__menu ssui-folder__menu", role: "menu" });
    s.forEach((c, l) => {
      const u = o("li", { class: `ssui-select__option${c.danger ? " ssui-select__option--danger" : ""}`, role: "menuitem", tabindex: -1 }, [c.label]);
      u.style.setProperty("--i", String(l)), u.addEventListener("click", (d) => {
        d.stopPropagation(), this.closeMenu(), c.run();
      }), i.append(u);
    });
    const n = this.el.getBoundingClientRect();
    i.style.left = `${Math.max(0, Math.min(t - n.left, n.width - 160))}px`, i.style.top = `${e - n.top}px`, this.menuEl = i, this.el.append(i), this.el.setAttribute("data-ssui-menu", ""), requestAnimationFrame(() => i.setAttribute("data-ssui-open", ""));
    const r = (c) => {
      i.contains(c.target) || this.closeMenu();
    }, h = (c) => {
      c.key === "Escape" && this.closeMenu();
    };
    document.addEventListener("pointerdown", r, { capture: !0, once: !0 }), document.addEventListener("keydown", h, { once: !0 }), document.addEventListener("scroll", () => this.closeMenu(), { capture: !0, once: !0 });
  }
  closeMenu() {
    this.menuEl?.remove(), this.menuEl = null, this.el.removeAttribute("data-ssui-menu");
  }
  addFolder(t, e = {}) {
    return this.attach(new nt(t, e));
  }
  onChildrenChanged() {
    const t = this.controllers().length;
    this.countEl.textContent = t ? String(t).padStart(2, "0") : "";
  }
}
class te extends K {
  constructor(t, e = "auto") {
    super(), this.root = t, this.mq = typeof matchMedia < "u" ? matchMedia("(prefers-color-scheme: dark)") : null, this.timer = 0, this.raf = 0, this.onSystem = () => {
      this.mode === "auto" && this.transition(!0);
    }, this.mode = e, t.setAttribute("data-ssui-theme", e), this.mq?.addEventListener("change", this.onSystem);
  }
  get() {
    return this.mode;
  }
  resolved() {
    return this.mode === "auto" ? this.mq?.matches ? "dark" : "light" : this.mode;
  }
  set(t, e = !0) {
    if (t === this.mode) return;
    const s = this.resolved();
    this.mode = t, this.root.setAttribute("data-ssui-theme", t), this.resolved() !== s && this.transition(e);
  }
  transition(t) {
    const e = t && parseFloat(getComputedStyle(this.root).getPropertyValue("--ssui-dur-theme")) || 0;
    if (this.emit("change", this.resolved()), clearTimeout(this.timer), cancelAnimationFrame(this.raf), e <= 0) {
      this.emit("frame"), this.emit("settle", this.resolved());
      return;
    }
    this.root.setAttribute("data-ssui-switching", "");
    const s = performance.now(), i = () => {
      this.emit("frame"), performance.now() - s < e && (this.raf = requestAnimationFrame(i));
    };
    this.raf = requestAnimationFrame(i), this.timer = window.setTimeout(() => {
      this.root.removeAttribute("data-ssui-switching"), this.emit("frame"), this.emit("settle", this.resolved());
    }, e + 20);
  }
  read(t) {
    return getComputedStyle(this.root).getPropertyValue(`--ssui-${t}`).trim();
  }
  dispose() {
    this.mq?.removeEventListener("change", this.onSystem), clearTimeout(this.timer), cancelAnimationFrame(this.raf), this.clear();
  }
}
const ee = {
  get(a) {
    try {
      return globalThis.localStorage?.getItem(a) ?? null;
    } catch {
      return null;
    }
  },
  set(a, t) {
    try {
      globalThis.localStorage?.setItem(a, t);
    } catch {
    }
  },
  remove(a) {
    try {
      globalThis.localStorage?.removeItem(a);
    } catch {
    }
  }
};
function se() {
  const a = /* @__PURE__ */ new Map();
  return {
    get: (t) => a.get(t) ?? null,
    set: (t, e) => {
      a.set(t, e);
    },
    remove: (t) => {
      a.delete(t);
    }
  };
}
const z = "Default", U = (a) => JSON.parse(JSON.stringify(a)), ie = (a, t) => JSON.stringify(a) === JSON.stringify(t);
class ne extends K {
  constructor(t, e, s) {
    super(), this.panel = t, this.storageKey = e, this.current = null, this.presets = [], this.defaults = null, this.loaded = null, this.lastDirty = !1, this.offs = [], this.seen = /* @__PURE__ */ new WeakSet(), this.warned = !1, this.key = e ? `ssui:${e}:presets` : null, this.adapter = s ?? (this.key ? ee : se()), this.presets = this.read(), this.watch(t), typeof queueMicrotask == "function" && queueMicrotask(() => this.captureDefaults());
  }
  // ---- defaults -----------------------------------------------------------
  /** snapshot current values as "Default" (idempotent; merges ids added later) */
  captureDefaults() {
    const t = this.panel.toJSON();
    return this.defaults = this.defaults ? { ...t, ...this.defaults } : t, this.loaded || (this.loaded = this.defaults), this.defaults;
  }
  get hasDefaults() {
    return this.defaults !== null;
  }
  // ---- list ---------------------------------------------------------------
  list() {
    return this.key && (this.presets = this.read()), this.presets.slice();
  }
  has(t) {
    return this.list().some((e) => e.name === t);
  }
  getPreset(t) {
    return this.list().find((e) => e.name === t);
  }
  // ---- dirty --------------------------------------------------------------
  get dirty() {
    if (!this.defaults) return !1;
    const t = this.loaded ?? this.defaults;
    return !ie(this.panel.toJSON(), t);
  }
  /** recompute and emit when it flips */
  checkDirty() {
    this.captureDefaults();
    const t = this.dirty;
    return t !== this.lastDirty && (this.lastDirty = t, this.emit("dirty", t)), t;
  }
  // ---- crud ---------------------------------------------------------------
  save(t) {
    if (t = t.trim(), !t || t === z) throw new Error(`[ssui] invalid preset name "${t}"`);
    this.captureDefaults();
    const e = this.panel.toJSON(), s = this.list(), i = Date.now(), n = s.findIndex((h) => h.name === t), r = n >= 0 ? { ...s[n], values: e, updatedAt: i } : { name: t, values: e, createdAt: i, updatedAt: i };
    return n >= 0 ? s[n] = r : s.push(r), this.presets = s, this.write(), this.current = t, this.loaded = U(e), this.emit("save", r), this.emit("change"), this.checkDirty(), r;
  }
  load(t) {
    if (t === null || t === z) {
      this.applyDefault();
      return;
    }
    const e = this.getPreset(t);
    if (!e) {
      this.warnOnce(`preset "${t}" not found`);
      return;
    }
    this.captureDefaults();
    try {
      this.panel.fromJSON(U(e.values), { silent: !1 });
    } catch (s) {
      this.warnOnce(String(s));
    }
    this.current = t, this.loaded = U(e.values), this.emit("load", e), this.checkDirty();
  }
  applyDefault() {
    const t = this.captureDefaults();
    try {
      this.panel.fromJSON(U(t), { silent: !0 });
    } catch (e) {
      this.warnOnce(String(e));
    }
    this.current = null, this.loaded = t, this.emit("load", { name: z, values: U(t), createdAt: 0, updatedAt: 0 }), this.checkDirty();
  }
  remove(t) {
    const e = this.list(), s = e.findIndex((i) => i.name === t);
    s !== -1 && (e.splice(s, 1), this.presets = e, this.write(), this.current === t && (this.current = null, this.loaded = this.defaults), this.emit("remove", t), this.emit("change"), this.checkDirty());
  }
  rename(t, e) {
    if (e = e.trim(), !e || e === z || t === e) return;
    const s = this.list(), i = s.find((n) => n.name === t);
    if (i) {
      if (s.some((n) => n.name === e)) {
        this.warnOnce(`preset "${e}" already exists`);
        return;
      }
      i.name = e, i.updatedAt = Date.now(), this.presets = s, this.write(), this.current === t && (this.current = e), this.emit("change");
    }
  }
  // ---- json ---------------------------------------------------------------
  exportJSON() {
    const t = { format: "ssui-presets", version: 1, panel: this.panel.id, presets: this.list() };
    return JSON.stringify(t, null, 2);
  }
  importJSON(t, e = {}) {
    let s;
    try {
      s = JSON.parse(t);
    } catch {
      throw new Error("[ssui] import: invalid JSON");
    }
    if (!s || s.format !== "ssui-presets" || !Array.isArray(s.presets)) throw new Error("[ssui] import: not a ssui-presets file");
    const i = s.presets.filter((r) => r && typeof r.name == "string" && r.values && typeof r.values == "object");
    let n = e.merge === !1 ? [] : this.list();
    for (const r of i) {
      const h = n.findIndex((l) => l.name === r.name), c = { name: r.name, values: r.values, createdAt: r.createdAt ?? Date.now(), updatedAt: r.updatedAt ?? Date.now() };
      h >= 0 ? n[h] = c : n.push(c);
    }
    return this.presets = n, this.write(), this.current && !n.some((r) => r.name === this.current) && (this.current = null, this.loaded = this.defaults), this.emit("change"), this.checkDirty(), i.length;
  }
  clearAll() {
    this.presets = [], this.key && this.adapter.remove(this.key), this.current = null, this.loaded = this.defaults, this.emit("change"), this.checkDirty();
  }
  // ---- internals ----------------------------------------------------------
  read() {
    if (!this.key) return this.presets;
    try {
      const t = this.adapter.get(this.key), e = t ? JSON.parse(t) : [];
      return Array.isArray(e) ? e : [];
    } catch {
      return [];
    }
  }
  write() {
    this.key && this.adapter.set(this.key, JSON.stringify(this.presets));
  }
  /** subscribe to `finish` of every controller, present and future, for dirty tracking */
  watch(t) {
    const e = (s) => {
      if (!(!s || this.seen.has(s))) {
        if (this.seen.add(s), s instanceof _) {
          this.offs.push(s.on("finish", () => this.checkDirty()));
          return;
        }
        typeof s.on == "function" && Array.isArray(s.children) && (this.offs.push(s.on("add", e)), s.children.forEach(e), this.defaults && this.captureDefaults());
      }
    };
    typeof t.on == "function" && this.offs.push(t.on("add", (s) => {
      e(s), this.defaults && this.captureDefaults();
    })), t.controllers?.().forEach(e);
  }
  warnOnce(t) {
    this.warned || (this.warned = !0, console.warn(`[ssui] presets: ${t}`));
  }
  dispose() {
    for (const t of this.offs.splice(0)) t();
    super.clear();
  }
}
class mt {
  constructor(t, e, s, i) {
    this.wrap = t, this.trigger = e, this.role = s, this.onOpen = i, this.items = [], this.lis = [], this.active = -1, this.confirmTimer = 0, this.confirming = -1, this.el = o("ul", { class: "ssui-select__menu", role: s, tabindex: -1 }), t.append(this.el), e.addEventListener("click", (n) => {
      n.stopPropagation(), this.isOpen ? this.close() : this.open();
    }), e.addEventListener("keydown", (n) => this.key(n)), this.el.addEventListener("keydown", (n) => this.key(n));
  }
  set(t) {
    this.items = t.filter((e) => !e.hidden), this.el.replaceChildren(), this.lis = this.items.map((e, s) => {
      const i = o("li", { class: "ssui-select__option", role: this.role === "listbox" ? "option" : "menuitem", "aria-selected": this.role === "listbox" ? String(!!e.selected) : null, "data-ssui-danger": e.danger || null }, [
        o("span", { class: "ssui-presets__option-text" }, [e.label]),
        e.index !== void 0 ? o("span", { class: "ssui-select__option-index" }, [e.index]) : e.selected ? E.check() : null
      ]);
      return i.style.setProperty("--i", String(s)), i.addEventListener("pointerenter", () => this.setActive(s)), i.addEventListener("click", (n) => {
        n.stopPropagation(), this.pick(s);
      }), i;
    }), this.el.append(...this.lis);
  }
  get isOpen() {
    return this.wrap.hasAttribute("data-ssui-open");
  }
  open() {
    this.isOpen || (this.onOpen?.(), this.wrap.setAttribute("data-ssui-open", ""), this.trigger.setAttribute("aria-expanded", "true"), this.setActive(Math.max(0, this.items.findIndex((t) => t.selected))), this.el.focus({ preventScroll: !0 }));
  }
  close(t = !1) {
    this.isOpen && (this.wrap.removeAttribute("data-ssui-open"), this.trigger.setAttribute("aria-expanded", "false"), this.resetConfirm(), t && this.trigger.focus());
  }
  setActive(t) {
    this.active = t, this.lis.forEach((e, s) => e.toggleAttribute("data-ssui-active", s === t));
  }
  resetConfirm() {
    clearTimeout(this.confirmTimer), this.confirming >= 0 && this.lis[this.confirming] && (this.lis[this.confirming].querySelector(".ssui-presets__option-text").textContent = this.items[this.confirming].label), this.confirming = -1;
  }
  pick(t) {
    const e = this.items[t];
    if (e) {
      if (e.confirm && this.confirming !== t) {
        this.resetConfirm(), this.confirming = t, this.lis[t].querySelector(".ssui-presets__option-text").textContent = `${e.label}?`, this.confirmTimer = window.setTimeout(() => this.resetConfirm(), 2e3);
        return;
      }
      this.resetConfirm(), this.close(!0), e.onPick();
    }
  }
  key(t) {
    const e = this.items.length;
    if (!this.isOpen) {
      ["Enter", " ", "ArrowDown", "ArrowUp"].includes(t.key) && (t.preventDefault(), this.open());
      return;
    }
    switch (t.key) {
      case "ArrowDown":
        t.preventDefault(), this.setActive((this.active + 1) % e);
        break;
      case "ArrowUp":
        t.preventDefault(), this.setActive((this.active - 1 + e) % e);
        break;
      case "Home":
        t.preventDefault(), this.setActive(0);
        break;
      case "End":
        t.preventDefault(), this.setActive(e - 1);
        break;
      case "Enter":
      case " ":
        t.preventDefault(), this.pick(this.active);
        break;
      case "Escape":
        t.preventDefault(), this.close(!0);
        break;
      case "Tab":
        this.close();
        break;
    }
  }
}
class re {
  constructor(t, e = {}) {
    this.panel = t, this.opts = e, this.id = "presets", this.serializable = !1, this.editMode = null, this.offs = [], this.liveTimer = 0, this.copiedTimer = 0, this.store = t.presets, this.nameEl = o("span", { class: "ssui-select__current ssui-presets__name" }), this.dirtyEl = o("span", { class: "ssui-presets__dirty", "aria-hidden": "true" }, ["*"]);
    const s = E.chevron();
    s.classList.add("ssui-select__chevron");
    const i = o("button", { class: "ssui-select__trigger ssui-presets__trigger", type: "button", "aria-haspopup": "listbox", "aria-expanded": "false", "aria-label": "Preset" }, [this.nameEl, this.dirtyEl, s]);
    this.input = o("input", { class: "ssui-presets__input", type: "text", name: "ssui-preset-name", "aria-label": "Preset name", autocomplete: "off", spellcheck: "false", tabindex: -1 });
    const n = o("div", { class: "ssui-select ssui-presets__pick" }, [i, this.input]);
    this.pick = new mt(n, i, "listbox", () => this.refresh()), this.saveBtn = o("button", { class: "ssui-button ssui-button--ghost ssui-presets__save", type: "button" }, ["Save"]), this.saveBtn.addEventListener("click", () => this.onSave());
    const r = o("button", { class: "ssui-button ssui-button--ghost ssui-button--icon", type: "button", "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": "More preset actions" }, [E.more()]), h = o("div", { class: "ssui-select ssui-presets__more" }, [r]);
    this.more = new mt(h, r, "menu", () => this.refresh()), this.fileInput = o("input", { type: "file", accept: "application/json,.json", class: "ssui-presets__file", tabindex: -1, "aria-hidden": "true" }), this.fileInput.addEventListener("change", () => this.onImportFile()), this.el = o("div", { class: "ssui-presets", "data-ssui-id": this.id, role: "group", "aria-label": "Presets" }, [
      o("span", { class: "ssui-presets__label" }, ["presets"]),
      n,
      o("div", { class: "ssui-presets__actions" }, [this.saveBtn, h, this.fileInput])
    ]), this.input.addEventListener("keydown", (l) => {
      l.stopPropagation(), l.key === "Enter" ? (l.preventDefault(), this.commitEdit()) : l.key === "Escape" && (l.preventDefault(), this.cancelEdit());
    }), this.input.addEventListener("blur", () => {
      this.editMode && this.commitEdit();
    });
    const c = (l) => {
      this.el.contains(l.target) || (this.pick.close(), this.more.close());
    };
    document.addEventListener("pointerdown", c, !0), this.offs.push(() => document.removeEventListener("pointerdown", c, !0)), this.offs.push(this.store.on("change", () => this.refresh())), this.offs.push(this.store.on("dirty", () => this.refresh())), this.offs.push(this.store.on("save", () => this.swapName())), this.offs.push(this.store.on("load", () => {
      this.swapName(), this.pulse();
    })), this.offs.push(this.store.on("remove", () => this.swapName())), queueMicrotask(() => {
      this.store.captureDefaults(), this.refresh();
    }), this.refresh();
  }
  // ---- rendering ----------------------------------------------------------
  refresh() {
    const t = this.store.current, e = this.store.dirty;
    this.nameEl.textContent = t ?? z, this.dirtyEl.toggleAttribute("data-ssui-on", e), this.el.toggleAttribute("data-ssui-dirty", e), this.saveBtn.textContent = t ? "Save" : "Save as", this.saveBtn.title = t ? `Overwrite “${t}”` : "Save current values as a new preset";
    const s = this.store.list(), i = [];
    this.opts.includeDefault !== !1 && i.push({ label: z, selected: t === null, onPick: () => this.store.applyDefault() }), s.forEach((r, h) => i.push({ label: r.name, selected: t === r.name, index: String(h + 1).padStart(2, "0"), onPick: () => this.store.load(r.name) })), this.pick.set(i);
    const n = t !== null;
    this.more.set([
      { label: "Save as…", onPick: () => this.startEdit("save") },
      { label: "Rename…", hidden: !n, onPick: () => this.startEdit("rename") },
      { label: "Delete", hidden: !n || this.opts.allowDelete === !1, danger: !0, confirm: !0, onPick: () => this.store.remove(t) },
      { label: "Export JSON", hidden: this.opts.allowExport === !1, onPick: () => this.exportFile() },
      { label: "Import JSON", hidden: this.opts.allowExport === !1, onPick: () => this.fileInput.click() },
      { label: "Copy JSON", onPick: () => this.copy() }
    ]);
  }
  /** the one micro-interaction: the name cross-fades in (4px rise) */
  swapName() {
    this.refresh(), this.nameEl.removeAttribute("data-ssui-swap"), this.nameEl.offsetWidth, this.nameEl.setAttribute("data-ssui-swap", "");
  }
  /** header dot pulses once on load */
  pulse() {
    const t = this.panel.el;
    t.setAttribute("data-ssui-live", ""), clearTimeout(this.liveTimer), this.liveTimer = window.setTimeout(() => {
      t.querySelector('[data-ssui-state="dragging"],[data-ssui-state="editing"]') || t.removeAttribute("data-ssui-live");
    }, 400);
  }
  // ---- actions ------------------------------------------------------------
  onSave() {
    const t = this.store.current;
    if (t) {
      this.store.save(t);
      return;
    }
    this.startEdit("save");
  }
  startEdit(t) {
    this.editMode = t, this.el.setAttribute("data-ssui-editing", "");
    const e = this.store.list();
    this.input.value = t === "rename" ? this.store.current ?? "" : this.nextName(e.map((s) => s.name)), this.input.focus(), this.input.select();
  }
  nextName(t) {
    let e = t.length + 1, s = `Preset ${e}`;
    for (; t.includes(s); ) s = `Preset ${++e}`;
    return s;
  }
  commitEdit() {
    const t = this.editMode;
    if (!t) return;
    this.editMode = null, this.el.removeAttribute("data-ssui-editing");
    const e = this.input.value.trim();
    if (!e || e === z) {
      this.refresh();
      return;
    }
    try {
      t === "save" ? this.store.save(e) : this.store.current && this.store.rename(this.store.current, e);
    } catch (s) {
      console.warn(s);
    }
    this.refresh();
  }
  cancelEdit() {
    this.editMode = null, this.el.removeAttribute("data-ssui-editing"), this.refresh();
  }
  exportFile() {
    const t = new Blob([this.store.exportJSON()], { type: "application/json" }), e = URL.createObjectURL(t), s = o("a", { href: e, download: `${this.panel.id}-presets.json` });
    document.body.append(s), s.click(), s.remove(), setTimeout(() => URL.revokeObjectURL(e), 1e3);
  }
  onImportFile() {
    const t = this.fileInput.files?.[0];
    t && t.text().then((e) => {
      try {
        this.store.importJSON(e, { merge: !0 });
      } catch (s) {
        console.warn(s);
      }
    }).finally(() => {
      this.fileInput.value = "";
    });
  }
  copy() {
    const t = this.store.exportJSON(), e = () => {
      this.el.setAttribute("data-ssui-copied", ""), clearTimeout(this.copiedTimer), this.copiedTimer = window.setTimeout(() => this.el.removeAttribute("data-ssui-copied"), 1200);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(e, e);
    else {
      const s = o("textarea", {}, [t]);
      document.body.append(s), s.select();
      try {
        document.execCommand("copy");
      } catch {
      }
      s.remove(), e();
    }
  }
  // ---- ChildLike ----------------------------------------------------------
  disable(t = !0) {
    return this.el.toggleAttribute("data-ssui-disabled", t), this;
  }
  hide(t = !0) {
    return this.el.toggleAttribute("data-ssui-hidden", t), this;
  }
  dispose() {
    for (const t of this.offs.splice(0)) t();
    clearTimeout(this.liveTimer), clearTimeout(this.copiedTimer), this.el.remove();
  }
}
const at = (a) => "handle" in a && a.handle instanceof HTMLElement;
function ae(a) {
  const t = /* @__PURE__ */ new Map(), e = a.el, s = (r) => {
    if (!at(r) || t.has(r)) return;
    r.el.setAttribute("data-ssui-reorderable", "");
    let h = [], c = 0, l = 0, u = 0, d = -1 / 0, p = 1 / 0;
    const f = () => parseFloat(getComputedStyle(r.el.parentElement).gap) || 0, g = D(r.handle, {
      threshold: 6,
      cursor: "grabbing",
      ignore: (b) => {
        const v = b.target.closest("button, input");
        return !!v && v !== r.handle;
      },
      onStart: (b) => {
        const v = a.children.filter(at);
        c = l = v.indexOf(r), u = b.y0, h = v.map((y) => {
          const w = y.el.getBoundingClientRect();
          return { el: y.el, mid: w.top + w.height / 2, h: w.height };
        });
        const x = r.el.parentElement.getBoundingClientRect(), A = r.el.getBoundingClientRect();
        d = x.top - A.top, p = x.bottom - A.bottom, r.el.setAttribute("data-ssui-reordering", ""), e.setAttribute("data-ssui-reorder-live", "");
      },
      onMove: (b) => {
        const v = Math.max(d, Math.min(p, b.y - u));
        r.el.style.transform = `translateY(${v}px)`;
        const x = h[c], A = x.mid + v;
        let y = 0;
        h.forEach((C, T) => {
          T !== c && C.mid < A && y++;
        }), l = y;
        const w = f();
        h.forEach((C, T) => {
          if (T === c) return;
          let X = 0;
          T > c && T <= l ? X = -(x.h + w) : T < c && T >= l && (X = x.h + w), C.el.style.transform = X ? `translateY(${X}px)` : "";
        });
      },
      onEnd: () => {
        if (h.forEach((b) => {
          b.el.style.transform = "";
        }), r.el.style.transform = "", r.el.removeAttribute("data-ssui-reordering"), e.removeAttribute("data-ssui-reorder-live"), l !== c) {
          const v = a.children.filter(at)[l];
          a.move(r, a.children.indexOf(v));
        }
        r.el.setAttribute("data-ssui-dragged", ""), requestAnimationFrame(() => r.el.removeAttribute("data-ssui-dragged"));
      }
    });
    t.set(r, () => {
      g(), r.el.removeAttribute("data-ssui-reorderable");
    });
  };
  a.children.forEach(s);
  const i = a.on("add", s), n = a.on("remove", (r) => {
    t.get(r)?.(), t.delete(r);
  });
  return () => {
    i(), n(), t.forEach((r) => r()), t.clear();
  };
}
const oe = '<svg class="ssui-panel__logo" viewBox="0 0 78 16" width="78" height="16" fill="currentColor" aria-label="superserif"><path d="M22.9082 3.7627C23.5931 3.75668 24.2639 3.95631 24.834 4.33594C25.4311 4.73889 25.9082 5.29596 26.2139 5.94824C26.5542 6.6403 26.7246 7.45836 26.7246 8.40234C26.7246 9.33403 26.5571 10.147 26.2227 10.8398C25.9239 11.4914 25.4487 12.0468 24.8516 12.4434C24.2736 12.819 23.5975 13.0156 22.9082 13.0078C22.3284 13.0062 21.7584 12.8576 21.251 12.5771C20.7426 12.3136 20.327 11.9009 20.0596 11.3945V16H17.9092V3.99512H20.0059V5.375C20.2743 4.85582 20.7006 4.43556 21.2236 4.1748C21.7438 3.90421 22.3219 3.76285 22.9082 3.7627ZM10.7393 9.24512C10.7393 10.7502 11.2775 11.5029 12.3525 11.5029C12.6286 11.5114 12.903 11.4555 13.1533 11.3389C13.4038 11.2222 13.6238 11.048 13.7949 10.8311C14.1597 10.3832 14.3414 9.77693 14.3408 9.0127V3.99609H16.4727V12.7754H14.3945V11.3955C14.1342 11.8942 13.7364 12.3077 13.248 12.5869C12.7398 12.8723 12.1648 13.0174 11.582 13.0078C10.5787 13.0078 9.82871 12.6822 9.33301 12.0312C8.8375 11.3804 8.58991 10.5416 8.58984 9.51465V3.99609H10.7393V9.24512ZM3.8877 3.76172C4.92689 3.76172 5.7606 3.98003 6.3877 4.41602C6.68665 4.61312 6.93327 4.87994 7.10645 5.19336C7.27966 5.50701 7.37426 5.85857 7.38184 6.2168H5.41113C5.4079 6.05606 5.36518 5.89835 5.28711 5.75781C5.20904 5.61733 5.09761 5.49779 4.96289 5.41016C4.67625 5.20721 4.2997 5.10547 3.83398 5.10547C3.34438 5.10551 2.96781 5.21656 2.70508 5.4375C2.57487 5.54814 2.47159 5.68712 2.40332 5.84375C2.33504 6.00048 2.30387 6.17102 2.31152 6.3418C2.30455 6.47218 2.32644 6.60283 2.37598 6.72363C2.42553 6.84443 2.50115 6.95308 2.59766 7.04102C2.78877 7.20884 3.09366 7.32834 3.51172 7.39941L5.08887 7.68555C6.76091 7.98421 7.59668 8.79727 7.59668 10.123C7.59659 11.0663 7.25948 11.7828 6.58496 12.2725C5.91015 12.7621 5.01696 13.0068 3.90625 13.0068C2.78344 13.0068 1.86599 12.7594 1.15527 12.2637C0.444751 11.768 0.0597154 11.1016 0 10.2656H1.98926C2.0125 10.4657 2.07729 10.6591 2.18066 10.832C2.28414 11.005 2.42346 11.1544 2.58887 11.2695C2.94124 11.5317 3.38068 11.6625 3.90625 11.6631C4.39572 11.663 4.78372 11.55 5.07031 11.3232C5.35699 11.0963 5.50098 10.7735 5.50098 10.3555C5.50758 10.2184 5.4849 10.0811 5.43555 9.95312C5.3862 9.82531 5.31062 9.70932 5.21387 9.6123C5.02276 9.42717 4.71221 9.2926 4.28223 9.20898L2.8125 8.94043C1.94134 8.7732 1.29653 8.50402 0.87793 8.13379C0.459296 7.76351 0.250379 7.24971 0.250977 6.59277C0.251032 5.69711 0.582357 5.00152 1.24512 4.50586C1.90799 4.0102 2.78893 3.76177 3.8877 3.76172ZM31.9346 3.76172C33.2127 3.76172 34.2195 4.14472 34.9541 4.90918C35.6884 5.6736 36.0556 6.7843 36.0557 8.24121V8.76074H29.6768C29.7012 9.62066 29.9225 10.3077 30.3398 10.8213C30.7572 11.3348 31.3127 11.5917 32.0059 11.5918C32.5075 11.5918 32.9235 11.4638 33.252 11.207C33.5675 10.9698 33.7917 10.631 33.8877 10.248H35.9482C35.8789 10.6506 35.7302 11.0354 35.5107 11.3799C35.2913 11.7244 35.0054 12.0219 34.6699 12.2549C33.9694 12.7565 33.0695 13.0068 31.9707 13.0068C31.0635 13.0068 30.2778 12.8196 29.6143 12.4434C28.9579 12.0741 28.4247 11.5193 28.082 10.8486C27.7237 10.1618 27.5449 9.34598 27.5449 8.40234C27.545 7.459 27.7239 6.64089 28.082 5.94824C28.4243 5.27269 28.9571 4.71137 29.6143 4.33496C30.2771 3.95278 31.0507 3.76173 31.9346 3.76172ZM46.8467 3.76172C47.8859 3.76172 48.7196 3.98003 49.3467 4.41602C49.6457 4.61311 49.8922 4.87993 50.0654 5.19336C50.2386 5.50701 50.3332 5.85857 50.3408 6.2168H48.3701C48.3669 6.05606 48.3242 5.89835 48.2461 5.75781C48.168 5.61737 48.0566 5.49777 47.9219 5.41016C47.6352 5.20726 47.2586 5.10547 46.793 5.10547C46.3041 5.10554 45.9283 5.21668 45.665 5.4375C45.5347 5.5482 45.4306 5.68697 45.3623 5.84375C45.294 6.00048 45.2629 6.17102 45.2705 6.3418C45.2635 6.47216 45.2854 6.60284 45.335 6.72363C45.3845 6.84439 45.4602 6.95309 45.5566 7.04102C45.7483 7.20882 46.0533 7.32834 46.4707 7.39941L48.0479 7.68555C49.72 7.98419 50.5557 8.79723 50.5557 10.123C50.5556 11.0664 50.2185 11.7828 49.5439 12.2725C48.8691 12.7622 47.976 13.0068 46.8652 13.0068C45.7432 13.0068 44.8265 12.7593 44.1152 12.2637C43.4039 11.768 43.0181 11.1018 42.959 10.2656H44.9482C44.9717 10.4658 45.0372 10.6591 45.1406 10.832C45.2441 11.0049 45.3826 11.1543 45.5479 11.2695C45.9008 11.5317 46.3403 11.6625 46.8652 11.6631C47.3553 11.6631 47.7433 11.55 48.0293 11.3232C48.3154 11.0963 48.4594 10.7735 48.46 10.3555C48.4666 10.2184 48.4439 10.0811 48.3945 9.95312C48.3452 9.82529 48.2696 9.70932 48.1729 9.6123C47.9823 9.42716 47.6718 9.2926 47.2412 9.20898L45.7725 8.94043C44.9005 8.7732 44.255 8.50408 43.8369 8.13379C43.4189 7.76351 43.21 7.24966 43.21 6.59277C43.21 5.69715 43.5414 5.00151 44.2041 4.50586C44.8669 4.01022 45.748 3.76179 46.8467 3.76172ZM55.6562 3.76172C56.9336 3.76177 57.9397 4.14477 58.6748 4.90918C59.4099 5.67361 59.7779 6.78409 59.7773 8.24121V8.76074H53.3984C53.4217 9.62076 53.6429 10.3077 54.0615 10.8213C54.4802 11.3349 55.0354 11.5918 55.7275 11.5918C56.229 11.5918 56.6442 11.4637 56.9727 11.207C57.2879 10.9695 57.5131 10.6308 57.6094 10.248H59.6689C59.5991 10.6507 59.4503 11.0354 59.2305 11.3799C59.0106 11.7243 58.7245 12.022 58.3887 12.2549C57.6899 12.7566 56.7903 13.0068 55.6914 13.0068C54.7833 13.0068 53.9981 12.8194 53.3359 12.4434C52.6796 12.0741 52.1464 11.5192 51.8037 10.8486C51.4454 10.1618 51.2666 9.34598 51.2666 8.40234C51.2666 7.45894 51.4455 6.64092 51.8037 5.94824C52.146 5.27269 52.6788 4.71137 53.3359 4.33496C53.9988 3.95287 54.7725 3.76172 55.6562 3.76172ZM69.3037 12.7754H67.1709V3.99609H69.3037V12.7754ZM42.1572 3.7627C42.2441 3.76266 42.3309 3.76831 42.417 3.78027V5.57227C42.3211 5.56062 42.2198 5.55119 42.1123 5.54492C42.005 5.53866 41.8914 5.53614 41.7725 5.53613C41.0319 5.53613 40.44 5.78077 39.998 6.27051C39.5561 6.76024 39.335 7.4114 39.335 8.22363V12.7744H37.1855V3.99512H39.2812V5.64355C39.5321 5.03441 39.8728 4.5686 40.3027 4.24609C40.7543 3.91668 41.3026 3.74689 41.8613 3.7627H42.1572ZM65.8906 3.7627C65.9774 3.7627 66.0644 3.76834 66.1504 3.78027V5.57227C66.0546 5.56063 65.9531 5.55119 65.8457 5.54492C65.7382 5.53865 65.624 5.53613 65.5049 5.53613C64.7645 5.53617 64.1733 5.78091 63.7314 6.27051C63.2895 6.76024 63.0684 7.41139 63.0684 8.22363V12.7744H60.918V3.99512H63.0146V5.64355C63.2655 5.03437 63.6061 4.5686 64.0361 4.24609C64.4878 3.91669 65.0359 3.74684 65.5947 3.7627H65.8906ZM74.4961 0C74.7775 0.00043544 75.0587 0.0183472 75.3379 0.0537109V1.54102C75.2594 1.51768 75.1776 1.50532 75.0957 1.50488H74.8359C74.4305 1.50492 74.1377 1.60373 73.958 1.80078C73.7783 1.99788 73.6889 2.30569 73.6895 2.72363V3.99512H75.3418V5.48242H73.6934V12.7744H71.5576V5.48242H70.2852V3.99512H71.5576V2.8125C71.5577 1.91688 71.8023 1.22402 72.292 0.734375C72.7817 0.244728 73.5167 0 74.4961 0ZM77.1748 12.7744H74.8809V10.4453H77.1748V12.7744ZM22.3164 5.21387C21.9887 5.20721 21.6643 5.2802 21.3711 5.42676C21.0777 5.57344 20.8242 5.78931 20.6328 6.05566C20.2028 6.61766 19.9873 7.3582 19.9873 8.27734V8.49219C19.9873 9.42374 20.2086 10.1673 20.6504 10.7227C21.0923 11.278 21.6476 11.5566 22.3164 11.5566C22.9853 11.5566 23.5236 11.2725 23.9297 10.7051C24.3357 10.1377 24.5381 9.36411 24.5381 8.38477C24.5381 7.39339 24.3264 6.61705 23.9023 6.05566C23.4783 5.49426 22.9495 5.21387 22.3164 5.21387ZM31.8984 5.15918C31.2775 5.15927 30.7757 5.37758 30.3936 5.81348C30.0114 6.2494 29.7846 6.80192 29.7129 7.4707H33.9414C33.9175 6.74219 33.7293 6.17463 33.377 5.76855C33.0246 5.36254 32.5314 5.15918 31.8984 5.15918ZM55.6201 5.15918C54.9985 5.15919 54.4968 5.37759 54.1152 5.81348C53.7336 6.2494 53.5069 6.80192 53.4346 7.4707H57.6631C57.6392 6.74219 57.451 6.17463 57.0986 5.76855C56.7463 5.36243 56.2532 5.15918 55.6201 5.15918ZM69.375 2.29395H67.0996V0.34082H69.375V2.29395Z"/></svg>';
class le extends F {
  constructor(t = {}) {
    super(), this.cleanups = [], this.soloed = null, this.footerCenter = null, this.footerRight = null, this.fpsEl = null, this.stopFps = null, this.opts = t, this._id = t.id ?? H(t.title ?? "panel");
    const e = t.position ?? (t.container ? "static" : "top-right"), s = ot("ssui-body"), i = o("span", { class: "ssui-panel__title" }, [t.title ?? "Controls"]), n = t.meta ? o("span", { class: "ssui-panel__meta" }, [t.meta]) : null, r = o("span", { class: "ssui-panel__dot", "aria-hidden": "true" });
    this.collapseBtn = o("button", { class: "ssui-panel__collapse", type: "button", "aria-expanded": "true", "aria-controls": s, "aria-label": "Collapse panel" }, [E.chevron()]);
    const h = o("div", { class: "ssui-panel__toggle" }, [r, i, n]);
    t.fps && (this.fpsEl = o("span", { class: "ssui-panel__fps", "aria-label": "frames per second" }, ["— fps"])), this.header = o("header", { class: "ssui-panel__header" }, [h, this.fpsEl, this.collapseBtn]), this.subEl = o("div", { class: "ssui-panel__sub" }), this.bodyEl = o("div", { class: "ssui-panel__body", id: s });
    const c = o("div", { class: "ssui-panel__clip" }, [this.bodyEl]), l = [];
    if (t.footer instanceof HTMLElement) l.push(t.footer);
    else if (t.footer !== !1) {
      const f = document.createElement("template");
      f.innerHTML = oe, l.push(o("a", { class: "ssui-panel__brand", href: "https://superserif.studio", target: "_blank", rel: "noopener noreferrer", "aria-label": "Super Serif" }, [f.content.firstElementChild])), this.footerCenter = o("div", { class: "ssui-panel__footer-center" }), l.push(this.footerCenter);
      const g = t.link === void 0 ? { label: "see our work", href: "https://superserif.studio" } : t.link;
      this.footerRight = o("div", { class: "ssui-panel__footer-right" }, [g ? o("a", { class: "ssui-panel__link", href: g.href, target: "_blank", rel: "noopener noreferrer" }, [g.label]) : o("span", { class: "ssui-panel__meta" }, ["ui"])]), l.push(this.footerRight);
    }
    const u = l.length ? o("footer", { class: "ssui-panel__footer" }, l) : null, d = t.resizable === !1 ? null : o("div", { class: "ssui-panel__resize", "aria-hidden": "true" });
    if (this.el = o("section", { class: "ssui-panel", role: "region", "aria-label": t.title ?? "Controls", "data-ssui-position": e, id: t.id }, [this.header, this.subEl, c, u, d]), t.width && this.el.style.setProperty("--ssui-panel-width", `${t.width}px`), t.tokens) for (const [f, g] of Object.entries(t.tokens)) this.setToken(f, g);
    this.theme = new te(this.el, t.theme ?? "auto"), this.theme.on("frame", () => this.controllers().forEach((f) => f.onThemeChange())), this.cleanups.push(() => this.theme.dispose()), this.presets = new ne(this, t.storageKey ?? null), this.collapseBtn.addEventListener("click", () => this.toggle()), t.collapsed && (this.collapsed = !0), e !== "static" && t.draggable !== !1 ? this.enableDrag(e) : this.header.style.cursor = "default", d && this.enableResize(d);
    const p = t.hotkey === void 0 ? e === "static" ? null : "h" : t.hotkey;
    if (p) {
      const f = (g) => {
        g.key.toLowerCase() !== p.toLowerCase() || g.metaKey || g.ctrlKey || g.altKey || St(document.activeElement) || document.querySelector('.ssui-panel [data-ssui-state="editing"]') || this.toggle();
      };
      window.addEventListener("keydown", f), this.cleanups.push(() => window.removeEventListener("keydown", f));
    }
    if ((t.container ?? document.body).append(this.el), this.restoreGeometry(), this.startFps(), t.reorderable) {
      this.cleanups.push(ae(this));
      const f = t.storageKey ? `ssui:${t.storageKey}:order` : null;
      f && (this.on("reorder", () => {
        try {
          localStorage.setItem(f, JSON.stringify(this.order()));
        } catch {
        }
      }), queueMicrotask(() => {
        try {
          const g = JSON.parse(localStorage.getItem(f) ?? "null");
          Array.isArray(g) && this.setOrder(g);
        } catch {
        }
      }));
    }
  }
  get id() {
    return this._id;
  }
  // ---- theme / tokens -----------------------------------------------------
  get themeMode() {
    return this.theme.get();
  }
  set themeMode(t) {
    this.theme.set(t);
  }
  get resolvedTheme() {
    return this.theme.resolved();
  }
  setTheme(t) {
    return this.theme.set(t), this;
  }
  setToken(t, e) {
    return this.el.style.setProperty(t.startsWith("--") ? t : `--ssui-${t}`, e), this;
  }
  // ---- collapse -----------------------------------------------------------
  get collapsed() {
    return this.el.hasAttribute("data-ssui-collapsed");
  }
  set collapsed(t) {
    this.el.toggleAttribute("data-ssui-collapsed", t), this.collapseBtn.setAttribute("aria-expanded", String(!t)), this.saveGeometry();
  }
  toggle() {
    this.collapsed = !this.collapsed;
  }
  open() {
    return this.collapsed = !1, this;
  }
  close() {
    return this.collapsed = !0, this;
  }
  title(t) {
    return this.el.querySelector(".ssui-panel__title").textContent = t, this.el.setAttribute("aria-label", t), this;
  }
  addFolder(t, e = {}) {
    const s = this.attach(new nt(t, e));
    return this.opts.editable && (s.setEditable({ renamable: !0, contextMenu: !0, soloable: !0 }), s.on("remove-request", () => {
      this.soloed === s && this.setSolo(null), this.remove(s);
    }), s.on("solo", (i) => this.setSolo(i ? s : this.soloed === s ? null : this.soloed))), s;
  }
  /** the block currently soloed, or null */
  get solo() {
    return this.soloed;
  }
  setSolo(t) {
    this.soloed && this.soloed !== t && (this.soloed.solo = !1), this.soloed = t;
    for (const e of this.children) e instanceof nt && (e.dimmed = !!t && e !== t);
    this.emit("panel-solo", t);
  }
  /** preset bar: pinned under the title by default (outside the scrolling body); `placement: 'body'` adds it as a row */
  addPresets(t = {}) {
    const e = new re(this, t);
    return t.placement === "body" ? this.attach(e) : (e.el.setAttribute("data-ssui-placement", "header"), this.subEl.replaceChildren(e.el), this.el.setAttribute("data-ssui-has-sub", ""), e);
  }
  // ---- fps ----------------------------------------------------------------
  startFps() {
    if (!this.fpsEl || this.stopFps) return;
    let t = 0, e = 0;
    this.stopFps = B.animate({ flush() {
    }, poll() {
    }, tick: (s) => {
      if (t += s, e++, t >= 500) {
        const i = Math.round(1e3 / (t / e));
        this.fpsEl.textContent = `${i} fps`, this.fpsEl.toggleAttribute("data-ssui-low", i < 50), t = 0, e = 0;
      }
    } }), this.cleanups.push(() => {
      this.stopFps?.(), this.stopFps = null;
    });
  }
  // ---- transport (footer): play/pause pill + reset -------------------------
  setTransport(t = {}) {
    if (!this.footerCenter) throw new Error("[ssui] setTransport needs the default footer");
    const [e, s] = t.labels ?? ["Play", "Pause"];
    let i = t.playing ?? !0;
    const n = o("span", { class: "ssui-transport__icon", "aria-hidden": "true" }, [E.play(), E.pause()]), r = o("span", { class: "ssui-transport__label" }, [i ? s : e]), h = o("button", { class: "ssui-transport__toggle", type: "button", "aria-pressed": String(i) }, [n, r]), c = o("button", { class: "ssui-transport__reset", type: "button", "aria-label": "Reset", title: "Reset" }, [E.refresh()]), l = o("div", { class: "ssui-transport", "data-ssui-playing": i ? "" : null }, [h, c]), u = () => {
      l.toggleAttribute("data-ssui-playing", i), h.setAttribute("aria-pressed", String(i)), r.textContent = i ? s : e;
    };
    if (h.addEventListener("click", () => {
      i = !i, u(), t.onToggle?.(i);
    }), c.addEventListener("click", () => {
      c.setAttribute("data-ssui-spin", ""), setTimeout(() => c.removeAttribute("data-ssui-spin"), 500), t.onReset ? t.onReset() : this.reset();
    }), this.footerCenter.replaceChildren(l), t.action && this.footerRight) {
      const d = o("button", { class: "ssui-transport__action", type: "button" }, [t.action.label]);
      d.addEventListener("click", () => t.action.onClick()), this.footerRight.replaceChildren(d);
    }
    return {
      el: l,
      get playing() {
        return i;
      },
      set playing(d) {
        d !== i && (i = d, u());
      },
      dispose: () => l.remove()
    };
  }
  // ---- drag / resize ------------------------------------------------------
  enableDrag(t) {
    let e = 0, s = 0, i = 0, n = 0;
    this.cleanups.push(D(this.header, {
      cursor: "grabbing",
      ignore: (r) => !!r.target.closest("button"),
      onStart: () => {
        const r = this.el.getBoundingClientRect();
        this.el.style.left = `${r.left}px`, this.el.style.top = `${r.top}px`, this.el.style.right = "auto", this.el.style.bottom = "auto", e = r.left, s = r.top, i = r.width, n = r.height;
      },
      onMove: (r) => {
        const h = m(e + r.dx, 0, innerWidth - i), c = m(s + r.dy, 0, innerHeight - Math.min(n, 48));
        this.el.style.left = `${h}px`, this.el.style.top = `${c}px`;
      },
      onEnd: () => this.saveGeometry()
    }));
  }
  enableResize(t) {
    let e = 0;
    this.cleanups.push(D(t, {
      immediate: !0,
      cursor: "ew-resize",
      onStart: () => {
        e = this.el.getBoundingClientRect().width, this.el.setAttribute("data-ssui-resizing", "");
      },
      onMove: (s) => this.el.style.setProperty("--ssui-panel-width", `${Math.round(e + s.dx)}px`),
      onEnd: () => {
        this.el.removeAttribute("data-ssui-resizing"), this.saveGeometry();
      }
    }));
  }
  geomKey() {
    return this.opts.storageKey ? `ssui:${this.opts.storageKey}:geometry` : null;
  }
  saveGeometry() {
    const t = this.geomKey();
    if (t)
      try {
        localStorage.setItem(t, JSON.stringify({ left: this.el.style.left, top: this.el.style.top, width: this.el.style.getPropertyValue("--ssui-panel-width"), collapsed: this.collapsed }));
      } catch {
      }
  }
  restoreGeometry() {
    const t = this.geomKey();
    if (t)
      try {
        const e = JSON.parse(localStorage.getItem(t) ?? "null");
        if (!e) return;
        e.left && e.top && this.opts.position !== "static" && (this.el.style.left = e.left, this.el.style.top = e.top, this.el.style.right = "auto", this.el.style.bottom = "auto"), e.width && this.el.style.setProperty("--ssui-panel-width", e.width), typeof e.collapsed == "boolean" && (this.collapsed = e.collapsed);
      } catch {
      }
  }
  dispose() {
    for (const t of this.cleanups.splice(0)) t();
    this.presets.dispose(), super.dispose();
  }
}
const he = "0.1.0";
export {
  ct as ButtonControl,
  Ht as ColorControl,
  F as Container,
  _ as Controller,
  Ut as CurveControl,
  nt as Folder,
  Ot as KnobControl,
  Zt as MenuControl,
  Yt as MixerControl,
  Gt as MonitorControl,
  S as NumberControl,
  it as Pad2DControl,
  Qt as PadBankControl,
  le as Panel,
  re as PresetBar,
  ne as PresetStore,
  B as Scheduler,
  lt as SelectControl,
  $t as SliderControl,
  Nt as TextControl,
  te as Theme,
  Pt as ToggleControl,
  M as bindKey,
  N as bindValue,
  Ct as bindXY,
  Mt as bindXYObject,
  ae as makeReorderable,
  D as trackPointer,
  he as version
};
//# sourceMappingURL=index.js.map
