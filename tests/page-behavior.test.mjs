import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const scriptSource = await readFile(
  new URL("../script.js", import.meta.url),
  "utf8",
);

class FakeClassList {
  constructor(...values) {
    this.values = new Set(values);
  }

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }

  toggle(value, force) {
    const enabled =
      typeof force === "boolean" ? force : !this.values.has(value);
    if (enabled) this.values.add(value);
    else this.values.delete(value);
    return enabled;
  }
}

class FakeElement {
  constructor(ownerDocument) {
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.childrenBySelector = new Map();
    this.elementsBySelector = new Map();
    this.links = [];
    this.parentField = null;
    this.src = "";
    this.alt = "";
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.scrollLeft = 0;
    this.scrollWidth = 0;
    this.clientWidth = 0;
    this.offsetLeft = 0;
    this.rectWidth = 0;
    this.lastScrollOptions = null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type, event = createEvent()) {
    event.target ??= this;
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }

  querySelector(selector) {
    return this.childrenBySelector.get(selector) ?? null;
  }

  querySelectorAll(selector) {
    if (this.elementsBySelector.has(selector)) {
      return this.elementsBySelector.get(selector);
    }
    return selector === "a" ? this.links : [];
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "src") this.src = "";
  }

  closest(selector) {
    return selector === ".field" ? this.parentField : null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  getBoundingClientRect() {
    return { width: this.rectWidth };
  }

  scrollBy(options) {
    const maxScroll = Math.max(0, this.scrollWidth - this.clientWidth);
    this.lastScrollOptions = options;
    this.scrollLeft = Math.max(
      0,
      Math.min(this.scrollLeft + options.left, maxScroll),
    );
    this.dispatch("scroll");
  }
}

function createEvent(properties = {}) {
  return {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    ...properties,
  };
}

function createDocument() {
  const listeners = new Map();
  const document = {
    activeElement: null,
    hidden: false,
    addEventListener(type, listener) {
      const handlers = listeners.get(type) ?? [];
      handlers.push(listener);
      listeners.set(type, handlers);
    },
    dispatch(type, event = createEvent()) {
      for (const listener of listeners.get(type) ?? []) listener(event);
      return event;
    },
  };
  document.body = new FakeElement(document);
  document.body.prepend = () => {};
  document.createElement = () => new FakeElement(document);
  return document;
}

function createPageFixture({ withCarousel = true, reduceMotion = false } = {}) {
  const document = createDocument();
  const animationFrames = [];
  const windowListeners = new Map();
  const requestAnimationFrame = (callback) => {
    animationFrames.push(callback);
    return animationFrames.length;
  };
  const window = {
    matchMedia: () => ({ matches: reduceMotion }),
    requestAnimationFrame,
    addEventListener(type, listener) {
      const handlers = windowListeners.get(type) ?? [];
      handlers.push(listener);
      windowListeners.set(type, handlers);
    },
    dispatch(type, event = createEvent()) {
      for (const listener of windowListeners.get(type) ?? []) listener(event);
    },
    runAnimationFrame(timestamp = 0) {
      const callbacks = animationFrames.splice(0);
      for (const callback of callbacks) callback(timestamp);
    },
  };

  const toggle = new FakeElement(document);
  const nav = new FakeElement(document);
  const navLink = new FakeElement(document);
  nav.links = [navLink];

  const gallery = new FakeElement(document);
  const galleryImage = new FakeElement(document);
  galleryImage.src = "http://localhost/images/g1.jpg";
  galleryImage.alt = "Trao thưởng học viên xuất sắc";
  const galleryCaption = new FakeElement(document);
  galleryCaption.textContent = "Trao thưởng";
  gallery.childrenBySelector.set("img", galleryImage);
  gallery.childrenBySelector.set("figcaption", galleryCaption);

  const lightbox = new FakeElement(document);
  const lightboxImage = new FakeElement(document);
  const lightboxCaption = new FakeElement(document);
  const lightboxClose = new FakeElement(document);

  const makeCarousel = ({ scrollWidth }) => {
    const carousel = new FakeElement(document);
    const track = new FakeElement(document);
    const controls = new FakeElement(document);
    const prev = new FakeElement(document);
    const next = new FakeElement(document);
    const firstCard = new FakeElement(document);
    const secondCard = new FakeElement(document);

    controls.hidden = true;
    track.scrollWidth = scrollWidth;
    track.clientWidth = 320;
    firstCard.offsetLeft = 0;
    firstCard.rectWidth = 312;
    secondCard.offsetLeft = 330;
    secondCard.rectWidth = 312;
    track.elementsBySelector.set(".course-card", [firstCard, secondCard]);
    carousel.childrenBySelector.set("[data-course-track]", track);
    carousel.childrenBySelector.set("[data-course-controls]", controls);
    carousel.childrenBySelector.set("[data-course-prev]", prev);
    carousel.childrenBySelector.set("[data-course-next]", next);
    return { carousel, track, controls, prev, next };
  };

  const first = makeCarousel({ scrollWidth: 980 });
  const second = makeCarousel({ scrollWidth: 760 });
  const selectorMap = new Map([
    [".nav-toggle", toggle],
    [".main-nav", nav],
    [".lightbox-img", lightboxImage],
    [".lightbox-caption", lightboxCaption],
    [".lightbox-close", lightboxClose],
  ]);

  document.querySelector = (selector) => selectorMap.get(selector) ?? null;
  document.querySelectorAll = (selector) => {
    if (selector === ".gal") return [gallery];
    if (selector === "[data-course-carousel]") {
      return withCarousel ? [first.carousel, second.carousel] : [];
    }
    return [];
  };
  document.getElementById = (id) => (id === "lightbox" ? lightbox : null);

  vm.runInNewContext(scriptSource, {
    document,
    window,
    requestAnimationFrame,
  });

  return {
    document,
    window,
    toggle,
    nav,
    navLink,
    gallery,
    lightbox,
    lightboxImage,
    lightboxClose,
    first,
    second,
  };
}

function createRegistrationFixture({ fetchResult = Promise.resolve({}) } = {}) {
  const document = createDocument();
  const form = new FakeElement(document);
  const status = new FakeElement(document);
  const submit = new FakeElement(document);
  submit.textContent = "Gửi đăng ký";
  const fetchCalls = [];
  let resetCount = 0;

  const createField = (name, entry) => {
    const wrapper = new FakeElement(document);
    wrapper.classList.add("field");
    const error = new FakeElement(document);
    error.hidden = true;
    wrapper.childrenBySelector.set(".field-error", error);
    const input = new FakeElement(document);
    input.parentField = wrapper;
    if (entry) input.setAttribute("data-entry", entry);
    return { input, wrapper, error, name };
  };

  const fields = {
    name: createField("name", "entry.380148302"),
    phone: createField("phone", "entry.1988606558"),
    child: createField("child", "entry.1215349974"),
    grade: createField("grade", "entry.1485252148"),
    note: createField("note", "entry.153390468"),
    website: createField("website"),
  };
  form.elements = Object.fromEntries(
    Object.entries(fields).map(([name, field]) => [name, field.input]),
  );
  form.setAttribute("data-mode", "google-form");
  form.setAttribute("data-endpoint", "https://example.test/formResponse");
  form.childrenBySelector.set("[data-form-status]", status);
  form.childrenBySelector.set('button[type="submit"]', submit);
  form.elementsBySelector.set(
    "[data-entry]",
    Object.values(fields)
      .map((field) => field.input)
      .filter((input) => input.getAttribute("data-entry")),
  );
  form.elementsBySelector.set(
    "input, select, textarea",
    Object.values(fields).map((field) => field.input),
  );
  form.reset = () => {
    resetCount += 1;
  };

  class FakeFormData {
    constructor() {
      this.values = [];
    }
    append(name, value) {
      this.values.push([name, value]);
    }
  }

  const fetch = (...args) => {
    fetchCalls.push(args);
    return fetchResult;
  };
  const window = {
    matchMedia: () => ({ matches: false }),
    addEventListener() {},
  };
  document.querySelector = (selector) =>
    selector === "[data-reg-form]" ? form : null;
  document.querySelectorAll = () => [];
  document.getElementById = () => null;

  vm.runInNewContext(scriptSource, {
    document,
    window,
    FormData: FakeFormData,
    fetch,
  });

  return {
    document,
    form,
    fields,
    status,
    submit,
    fetchCalls,
    get resetCount() {
      return resetCount;
    },
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

test("mobile navigation toggles, closes from a link, and closes with Escape", () => {
  const { document, toggle, nav, navLink } = createPageFixture();

  toggle.dispatch("click");
  assert.equal(nav.classList.contains("open"), true);
  assert.equal(toggle.getAttribute("aria-expanded"), "true");

  navLink.dispatch("click");
  assert.equal(nav.classList.contains("open"), false);

  toggle.dispatch("click");
  document.dispatch("keydown", createEvent({ key: "Escape" }));
  assert.equal(nav.classList.contains("open"), false);
  assert.equal(document.activeElement, toggle);
});

test("lightbox opens from the keyboard, closes with Escape, and restores focus", () => {
  const { document, gallery, lightbox, lightboxImage, lightboxClose } =
    createPageFixture();

  gallery.dispatch("keydown", createEvent({ key: "Enter" }));
  assert.equal(lightbox.classList.contains("open"), true);
  assert.equal(lightboxImage.src, "http://localhost/images/g1.jpg");
  assert.equal(document.activeElement, lightboxClose);

  document.dispatch("keydown", createEvent({ key: "Escape" }));
  assert.equal(lightbox.classList.contains("open"), false);
  assert.equal(lightboxImage.src, "");
  assert.equal(document.activeElement, gallery);
});

test("lightbox keeps keyboard focus on its close button", () => {
  const { document, gallery, lightboxClose } = createPageFixture();
  gallery.dispatch("click");

  const tabEvent = document.dispatch(
    "keydown",
    createEvent({ key: "Tab", shiftKey: false }),
  );
  assert.equal(tabEvent.defaultPrevented, true);
  assert.equal(document.activeElement, lightboxClose);
});

test("course controls expose scrollable rows and start at the left boundary", () => {
  const { first, second } = createPageFixture();

  for (const carousel of [first, second]) {
    assert.equal(carousel.controls.hidden, false);
    assert.equal(carousel.prev.disabled, true);
    assert.equal(carousel.next.disabled, false);
  }
});

test("course controls move exactly one card and respect reduced motion", () => {
  const smooth = createPageFixture();
  smooth.first.next.dispatch("click");
  assert.equal(smooth.first.track.lastScrollOptions.left, 330);
  assert.equal(smooth.first.track.lastScrollOptions.behavior, "smooth");

  const reduced = createPageFixture({ reduceMotion: true });
  reduced.first.next.dispatch("click");
  assert.equal(reduced.first.track.lastScrollOptions.left, 330);
  assert.equal(reduced.first.track.lastScrollOptions.behavior, "auto");
});

test("course buttons update after scrolling and resizing", () => {
  const { first, window } = createPageFixture();

  first.track.scrollLeft = 660;
  first.track.dispatch("scroll");
  window.runAnimationFrame();
  assert.equal(first.prev.disabled, false);
  assert.equal(first.next.disabled, true);

  first.track.scrollWidth = 320;
  window.dispatch("resize");
  window.runAnimationFrame();
  assert.equal(first.prev.disabled, true);
  assert.equal(first.next.disabled, true);
});

test("each course row keeps independent scroll controls", () => {
  const { first, second } = createPageFixture();

  second.next.dispatch("click");
  assert.equal(first.track.scrollLeft, 0);
  assert.equal(second.track.scrollLeft, 330);

  second.prev.dispatch("click");
  assert.equal(second.track.scrollLeft, 0);
});

test("other interactions still initialize when course carousels are absent", () => {
  const { toggle, nav } = createPageFixture({ withCarousel: false });
  toggle.dispatch("click");
  assert.equal(nav.classList.contains("open"), true);
});

test("registration validation marks required fields and focuses the first error", () => {
  const fixture = createRegistrationFixture();
  const submitEvent = fixture.form.dispatch("submit");

  assert.equal(submitEvent.defaultPrevented, true);
  assert.equal(fixture.document.activeElement, fixture.fields.name.input);
  assert.equal(fixture.fields.name.input.getAttribute("aria-invalid"), "true");
  assert.equal(fixture.fields.phone.input.getAttribute("aria-invalid"), "true");
  assert.equal(fixture.status.getAttribute("data-tone"), "error");
  assert.equal(fixture.fetchCalls.length, 0);
});

test("registration posts trimmed Google Form entries and reports success", async () => {
  const fixture = createRegistrationFixture();
  fixture.fields.name.input.value = "  Nguyễn Văn A  ";
  fixture.fields.phone.input.value = "+84 912 345 678";
  fixture.fields.child.input.value = "  Bé An ";
  fixture.fields.grade.input.value = "Lớp 4";
  fixture.fields.note.input.value = "  Học buổi tối  ";

  fixture.form.dispatch("submit");
  await flushPromises();

  assert.equal(fixture.fetchCalls.length, 1);
  const [endpoint, options] = fixture.fetchCalls[0];
  assert.equal(endpoint, "https://example.test/formResponse");
  assert.equal(options.method, "POST");
  assert.equal(options.mode, "no-cors");
  assert.deepEqual(options.body.values, [
    ["entry.380148302", "Nguyễn Văn A"],
    ["entry.1988606558", "+84 912 345 678"],
    ["entry.1215349974", "Bé An"],
    ["entry.1485252148", "Lớp 4"],
    ["entry.153390468", "Học buổi tối"],
  ]);
  assert.equal(fixture.resetCount, 1);
  assert.equal(fixture.status.getAttribute("data-tone"), "success");
  assert.equal(fixture.submit.textContent, "Gửi đăng ký");
});

test("registration honeypot silently accepts bots without sending data", () => {
  const fixture = createRegistrationFixture();
  fixture.fields.website.input.value = "https://spam.test";

  fixture.form.dispatch("submit");

  assert.equal(fixture.fetchCalls.length, 0);
  assert.equal(fixture.status.getAttribute("data-tone"), "success");
});
