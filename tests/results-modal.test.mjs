import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../results-modal.js", import.meta.url), "utf8");

function loadModule() {
  const window = {};
  vm.runInNewContext(source, { window });
  return window.NancyResults;
}

const course = {
  label: "KET",
  cefr: "A2",
  grade: "Lớp 6-7",
  org: "Cambridge English",
  shape: "portrait",
  stats: { total: 19, highest: "143", range: "A2-B1" },
  items: [
    { src: "images/results/ket/01.jpg", caption: "Pass · Grade B", meta: "136 · A2" },
    { src: "images/results/ket/02.jpg", caption: "Pass · Grade A", meta: "143 · B1" },
    { src: "images/results/ket/03.jpg", caption: "", meta: "" },
  ],
};

test("escapes characters that would break out of markup", () => {
  const { escapeHtml } = loadModule();
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  assert.equal(escapeHtml("Nguyễn & Trần"), "Nguyễn &amp; Trần");
  assert.equal(escapeHtml(undefined), "");
});

test("stats strip shows the three populated figures", () => {
  const html = loadModule().renderStats(course);
  assert.match(html, /19/);
  assert.match(html, /143/);
  assert.match(html, /A2-B1/);
  assert.match(html, /học viên/);
});

test("stats strip omits figures that were left empty", () => {
  const bare = { ...course, stats: { total: 8, highest: "", range: "" } };
  const html = loadModule().renderStats(bare);
  assert.match(html, /8/);
  assert.equal(html.includes("Điểm cao nhất"), false);
  assert.equal(html.includes("Trình độ đạt"), false);
});

test("grid renders one lazy-loaded tile per item, indexed in order", () => {
  const html = loadModule().renderGrid(course);
  assert.equal((html.match(/data-action="zoom"/g) || []).length, 3);
  assert.match(html, /data-index="0"/);
  assert.match(html, /data-index="2"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /images\/results\/ket\/01\.jpg/);
});

test("grid tiles carry captions, and stay silent when the score was unreadable", () => {
  const html = loadModule().renderGrid(course);
  assert.match(html, /Pass · Grade B/);
  assert.match(html, /136 · A2/);
  assert.equal((html.match(/results-tile__cap/g) || []).length, 2);
});

test("grid carries the shape so CSS can pick a column count", () => {
  const portrait = loadModule().renderGrid(course);
  const landscape = loadModule().renderGrid({ ...course, shape: "landscape" });
  assert.match(portrait, /data-shape="portrait"/);
  assert.match(landscape, /data-shape="landscape"/);
});

test("detail view shows a counter and the current image", () => {
  const html = loadModule().renderDetail(course, 1);
  assert.match(html, /2\s*\/\s*3/);
  assert.match(html, /images\/results\/ket\/02\.jpg/);
  assert.match(html, /Pass · Grade A/);
});

test("detail view keeps prev and next available so navigation can wrap", () => {
  const first = loadModule().renderDetail(course, 0);
  assert.match(first, /data-action="prev"/);
  assert.match(first, /data-action="next"/);
});

test("alt text describes the document without naming a student", () => {
  const html = loadModule().renderGrid(course);
  assert.match(html, /alt="Phiếu điểm KET của học viên Nancy English Center"/);
  assert.equal(/alt="[^"]*(Nguyen|Nguyễn|Dinh|Đinh)/.test(html), false);
});

class FakeNode {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new Set();
    this.classList.remove = (v) => this.classList.delete(v);
    this.innerHTML = "";
    this.parentElement = null;
    this.focused = 0;
    this.hidden = false;
  }
  addEventListener(type, listener) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }
  dispatch(type, event = {}) {
    event.target ??= this;
    event.preventDefault ??= () => {};
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  // Đi ngược lên cây cha tìm phần tử có thuộc tính khớp [data-x].
  closest(selector) {
    const name = selector.replace(/^\[|\]$/g, "");
    let node = this;
    while (node) {
      if (node.attributes.has(name)) return node;
      node = node.parentElement;
    }
    return null;
  }
  focus() {
    this.focused += 1;
  }
}

function createModalFixture() {
  const root = new FakeNode();
  const body = new FakeNode();
  body.classList = { add(v) { this.v = v; }, remove() { this.v = null; }, v: null };
  const document = {
    body,
    listeners: new Map(),
    addEventListener(type, listener) {
      const list = this.listeners.get(type) ?? [];
      list.push(listener);
      this.listeners.set(type, list);
    },
    dispatch(type, event = {}) {
      event.preventDefault ??= () => {};
      for (const listener of this.listeners.get(type) ?? []) listener(event);
      return event;
    },
  };
  const window = { document, matchMedia: () => ({ matches: false }) };
  vm.runInNewContext(source, { window, document });
  const modal = window.NancyResults.createResultsModal(root, { ket: course });
  return { modal, root, document, body };
}

// Giả một lần bấm vào phần tử con nằm trong nút mang data-action.
function clickAction(root, action, index) {
  const button = new FakeNode();
  button.setAttribute("data-action", action);
  if (index !== undefined) button.setAttribute("data-index", String(index));
  const inner = new FakeNode();
  inner.parentElement = button;
  return root.dispatch("click", { target: inner });
}

test("modal starts closed and hidden from assistive tech", () => {
  const { modal, root } = createModalFixture();
  assert.equal(modal.isOpen(), false);
  assert.equal(root.getAttribute("aria-hidden"), "true");
});

test("opening renders the grid and locks background scrolling", () => {
  const { modal, root, body } = createModalFixture();
  modal.open("ket", new FakeNode());
  assert.equal(modal.isOpen(), true);
  assert.match(root.innerHTML, /results-grid/);
  assert.match(root.innerHTML, /19/);
  assert.equal(root.getAttribute("aria-hidden"), "false");
  assert.equal(body.classList.v, "lightbox-active");
});

test("opening an unknown course does nothing", () => {
  const { modal, root } = createModalFixture();
  modal.open("movers", new FakeNode());
  assert.equal(modal.isOpen(), false);
  assert.equal(root.innerHTML, "");
});

test("clicking a tile swaps the grid for the detail view", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "zoom", 1);
  assert.match(root.innerHTML, /results-detail/);
  assert.match(root.innerHTML, /2 \/ 3/);
});

test("next and prev wrap around the ends", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "zoom", 2);
  clickAction(root, "next");
  assert.match(root.innerHTML, /1 \/ 3/);
  clickAction(root, "prev");
  assert.match(root.innerHTML, /3 \/ 3/);
});

test("Escape steps back to the grid before closing the modal", () => {
  const { modal, root, document } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "zoom", 0);
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(modal.isOpen(), true);
  assert.match(root.innerHTML, /results-grid/);
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(modal.isOpen(), false);
});

test("closing returns focus to the element that opened the modal", () => {
  const { modal } = createModalFixture();
  const trigger = new FakeNode();
  modal.open("ket", trigger);
  modal.close();
  assert.equal(trigger.focused, 1);
});

test("clicking the backdrop closes, clicking inside does not", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  const inside = new FakeNode();
  inside.parentElement = root;
  root.dispatch("click", { target: inside });
  assert.equal(modal.isOpen(), true);
  root.dispatch("click", { target: root });
  assert.equal(modal.isOpen(), false);
});
