# Course Autoplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two course rows continuously move in opposite directions, pause independently during interaction, and sit closer together without arrow controls.

**Architecture:** Keep the original course cards in static HTML, then let `script.js` clone enough presentation-only card sets to create a seamless scroll loop. Each carousel owns its direction and pause state, while a single `requestAnimationFrame` loop advances both tracks using elapsed time.

**Tech Stack:** Static HTML, CSS, browser DOM APIs, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- The first row moves right and the second row moves left at 28px per second.
- Hover, keyboard focus, and pointer interaction pause only the active row.
- Manual horizontal scrolling remains available.
- `prefers-reduced-motion: reduce` disables autoplay.
- Hidden browser tabs do not advance autoplay.
- Cloned cards use `aria-hidden="true"`.
- No new runtime dependency is added.
- Git commit steps cannot run until `D:\Nancy\Web` is recognized as a Git repository.

---

### Task 1: Markup Contract and Compact Layout

**Files:**
- Modify: `index.html:525`
- Modify: `styles.css:633`
- Test: `tests/page-contract.test.mjs:569`

**Interfaces:**
- Consumes: Existing `[data-course-carousel]` and `[data-course-track]` hooks.
- Produces: `data-course-direction="right"` and `data-course-direction="left"` for the autoplay initializer.

- [ ] **Step 1: Write the failing contract assertions**

Replace the old control assertion with:

```js
assert.doesNotMatch(courses, /data-course-controls|data-course-prev|data-course-next/);
assert.match(
  courses,
  /data-course-carousel\s+data-course-direction="right"/,
);
assert.match(
  courses,
  /data-course-carousel\s+data-course-direction="left"/,
);
assert.match(
  css,
  /\.course-carousel--extra\s*\{[^}]*margin-top:\s*8px[^}]*padding-top:\s*0[^}]*border-top:\s*0/s,
);
```

- [ ] **Step 2: Run the contract test and verify failure**

Run:

```powershell
node --test --test-name-pattern "course section" tests/page-contract.test.mjs
```

Expected: FAIL because the old controls remain and direction attributes are absent.

- [ ] **Step 3: Update the two carousel containers and remove controls**

Use these opening tags:

```html
<div
  class="course-carousel"
  data-course-carousel
  data-course-direction="right"
>
```

```html
<div
  class="course-carousel course-carousel--extra"
  data-course-carousel
  data-course-direction="left"
>
```

Delete both `.course-carousel__toolbar` blocks from `index.html`.

- [ ] **Step 4: Compact the vertical layout and remove obsolete control styles**

Use:

```css
.course-carousel { margin-top: 18px; }
.course-carousel--extra {
  margin-top: 8px;
  padding-top: 0;
  border-top: 0;
}
```

Delete the `.course-carousel__toolbar` and `.course-nav` rules. Change the
mobile override to:

```css
.course-carousel { margin-top: 14px; }
.course-carousel--extra { margin-top: 8px; }
```

- [ ] **Step 5: Run the contract test and verify success**

Run:

```powershell
node --test --test-name-pattern "course section" tests/page-contract.test.mjs
```

Expected: PASS.

### Task 2: Seamless Opposite-Direction Autoplay

**Files:**
- Modify: `tests/page-behavior.test.mjs:25`
- Modify: `tests/page-behavior.test.mjs:97`
- Modify: `script.js:96`

**Interfaces:**
- Consumes: `HTMLElement.dataset.courseDirection`, `requestAnimationFrame`, `scrollLeft`, `scrollWidth`, `clientWidth`.
- Produces: One independent autoplay controller per `[data-course-carousel]`.

- [ ] **Step 1: Extend the fake DOM for animation and cloning**

Add `dataset`, `children`, `cloneNode`, `appendChild`, and `contains` support
to `FakeElement`. Add a controllable animation queue to the fake `window`:

```js
const animationFrames = [];
window.requestAnimationFrame = (callback) => {
  animationFrames.push(callback);
  return animationFrames.length;
};
window.runAnimationFrame = (timestamp) => {
  const callbacks = animationFrames.splice(0);
  for (const callback of callbacks) callback(timestamp);
};
```

Set carousel directions in the fixture:

```js
courseCarousel.dataset.courseDirection = "right";
extraCourseCarousel.dataset.courseDirection = "left";
```

- [ ] **Step 2: Write failing direction and cloning tests**

Add:

```js
test("course rows autoplay continuously in opposite directions", () => {
  const { window, courseTrack, extraCourseTrack } = createFixture();

  window.runAnimationFrame(0);
  const firstStart = courseTrack.scrollLeft;
  const secondStart = extraCourseTrack.scrollLeft;
  window.runAnimationFrame(1000);

  assert.ok(courseTrack.scrollLeft < firstStart);
  assert.ok(extraCourseTrack.scrollLeft > secondStart);
  assert.ok(courseTrack.appendedClones.length > 0);
  assert.ok(
    courseTrack.appendedClones.every(
      (card) => card.getAttribute("aria-hidden") === "true",
    ),
  );
});
```

- [ ] **Step 3: Run the new test and verify failure**

Run:

```powershell
node --test --test-name-pattern "autoplay continuously" tests/page-behavior.test.mjs
```

Expected: FAIL because the current script only responds to arrow clicks.

- [ ] **Step 4: Replace arrow control logic with autoplay initialization**

In `script.js`, define `COURSE_SPEED = 28`, clone full card sets until
`scrollWidth >= loopWidth * 2 + clientWidth`, mark every clone
`aria-hidden="true"`, and initialize each track at `scrollLeft = loopWidth`.
On each animation frame:

```js
var elapsed = Math.min(timestamp - previousTimestamp, 64);
var direction = courseCarousel.dataset.courseDirection === "right" ? -1 : 1;
var nextScrollLeft =
  courseTrack.scrollLeft + direction * COURSE_SPEED * (elapsed / 1000);

while (nextScrollLeft < loopWidth) nextScrollLeft += loopWidth;
while (nextScrollLeft >= loopWidth * 2) nextScrollLeft -= loopWidth;
courseTrack.scrollLeft = nextScrollLeft;
```

Recalculate `loopWidth` on resize from the offset between the first original
card and the first cloned card.

- [ ] **Step 5: Run the direction test and verify success**

Run:

```powershell
node --test --test-name-pattern "autoplay continuously" tests/page-behavior.test.mjs
```

Expected: PASS.

### Task 3: Independent Pause and Accessibility Behavior

**Files:**
- Modify: `tests/page-behavior.test.mjs:300`
- Modify: `script.js:96`
- Modify: `styles.css:666`

**Interfaces:**
- Consumes: Carousel-local hover/focus/pointer flags, `document.hidden`, and the reduced-motion media query.
- Produces: `isPaused()` behavior evaluated independently for every course row.

- [ ] **Step 1: Write failing interaction tests**

Add tests that record each track's position, dispatch `mouseenter`,
`mouseleave`, `focusin`, `focusout`, `pointerdown`, and `pointerup`, then run
animation frames. Assert that the interacted track holds its position while
the other track advances, and resumes after the matching end event.

Add:

```js
test("reduced motion disables course autoplay", () => {
  const { window, courseTrack, extraCourseTrack } = createFixture({
    reduceMotion: true,
  });

  window.runAnimationFrame(0);
  const firstStart = courseTrack.scrollLeft;
  const secondStart = extraCourseTrack.scrollLeft;
  window.runAnimationFrame(1000);

  assert.equal(courseTrack.scrollLeft, firstStart);
  assert.equal(extraCourseTrack.scrollLeft, secondStart);
});

test("hidden pages do not advance course autoplay", () => {
  const { document, window, courseTrack } = createFixture();

  window.runAnimationFrame(0);
  const start = courseTrack.scrollLeft;
  document.hidden = true;
  window.runAnimationFrame(1000);

  assert.equal(courseTrack.scrollLeft, start);
});
```

- [ ] **Step 2: Run the pause tests and verify failure**

Run:

```powershell
node --test --test-name-pattern "course autoplay|reduced motion" tests/page-behavior.test.mjs
```

Expected: FAIL because pause state is not implemented.

- [ ] **Step 3: Implement independent pause state**

For each carousel, track:

```js
var isHovered = false;
var isFocused = false;
var isPointerDown = false;

var isPaused = function () {
  return (
    isHovered ||
    isFocused ||
    isPointerDown ||
    document.hidden ||
    reduceMotion.matches
  );
};
```

Wire `mouseenter`/`mouseleave`, `focusin`/`focusout`, and
`pointerdown`/`pointerup`/`pointercancel`. Reset the animation timestamp after
a paused frame so no elapsed-time jump occurs when movement resumes.

- [ ] **Step 4: Tune manual scrolling behavior**

Use:

```css
.course-track {
  scroll-snap-type: none;
  touch-action: pan-x pan-y;
}
```

Keep keyboard focus styling and the existing reduced-motion media query.

- [ ] **Step 5: Run all tests**

Run:

```powershell
node --test tests/*.mjs
```

Expected: 0 failures, with the existing single legacy test still skipped.

- [ ] **Step 6: Review the final diff**

Run:

```powershell
git diff -- index.html styles.css script.js tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: Only course-carousel markup, styling, behavior, and matching tests
change. If Git remains unavailable, inspect the named files directly.
