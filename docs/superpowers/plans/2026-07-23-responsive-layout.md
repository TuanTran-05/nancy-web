# Responsive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the wide-screen left whitespace and make the static homepage layout fluid across large desktop, laptop, tablet, and mobile viewports.

**Architecture:** Keep the existing static HTML/CSS/JavaScript structure. Align `.hero-grid` with the shared `.wrap` container, remove the hero-only right anchoring and fixed 500px minimum column, and preserve the existing 980px/679px responsive stacking behavior.

**Tech Stack:** Static HTML5, native CSS, Node.js built-in test runner.

## Global Constraints

- Preserve HTML, copy, URLs, brand colors, images, navigation, JavaScript, anchors, and analytics hooks.
- Keep the shared container width at `--wrap: 1320px`.
- Keep desktop hero as two columns and stack hero content above the image at `max-width: 980px`.
- Do not introduce dependencies or a build step.
- The workspace is not a valid Git repository, so verify with tests and leave changes uncommitted.

---

### Task 1: Add the responsive hero contract

**Files:**
- Modify: `D:\Nancy\Web\tests\page-contract.test.mjs:196-203`

**Interfaces:**
- Consumes: the loaded `css` source string.
- Produces: assertions that encode centered shared-container behavior for `.hero-grid`.

- [ ] **Step 1: Replace the stale visual assertion with the failing responsive assertion**

Update the visual contract so the hero must use the shared container and flexible columns:

```js
test("matches the approved static visual contract", () => {
  assert.match(css, /--wrap:\s*1320px/);
  assert.match(css, /\.btn\s*\{[^}]*border-radius:\s*12px/s);
  assert.match(
    css,
    /\.hero-grid\s*\{[^}]*width:\s*min\(var\(--wrap\),\s*calc\(100%\s*-\s*96px\)\)[^}]*margin-inline:\s*auto[^}]*grid-template-columns:\s*minmax\(0,\s*\.86fr\)\s+minmax\(0,\s*1\.34fr\)/s,
  );
  assert.doesNotMatch(css, /\.hero-grid\s*\{[^}]*margin-right:\s*0/s);
  assert.doesNotMatch(css, /\.hero-grid\s*\{[^}]*minmax\(500px,/s);
  assert.doesNotMatch(html, /class="floating-contact"/);
  assert.doesNotMatch(css, /animation:\s*mapBob/);
  assert.match(css, /\.gal figcaption\s*\{[^}]*display:\s*none/s);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="matches the approved static visual contract" tests/page-contract.test.mjs
```

Expected: FAIL because `.hero-grid` still has `max-width: 1440px`, is right-anchored, and contains `minmax(500px, ...)`.

### Task 2: Center and fluidize the hero CSS

**Files:**
- Modify: `D:\Nancy\Web\styles.css:116-128`
- Modify: `D:\Nancy\Web\styles.css:142-145`

**Interfaces:**
- Consumes: the responsive contract from Task 1.
- Produces: a centered `.hero-grid` that uses the shared container and flexible desktop columns.

- [ ] **Step 1: Apply the minimal production CSS change**

Replace the current `.hero-grid` block with:

```css
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, .86fr) minmax(0, 1.34fr);
  gap: 0;
  align-items: center;
  position: relative;
  width: min(var(--wrap), calc(100% - 96px));
  margin-inline: auto;
  padding-bottom: 12px;
}
```

Change the desktop-only title rule to allow safe wrapping at narrower desktop widths:

```css
@media (min-width: 1240px) {
  .hero-title { white-space: nowrap; }
}
```

- [ ] **Step 2: Run the focused test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="matches the approved static visual contract" tests/page-contract.test.mjs
```

Expected: PASS.

### Task 3: Run regression checks and inspect the final diff

**Files:**
- Verify: `D:\Nancy\Web\index.html`
- Verify: `D:\Nancy\Web\styles.css`
- Verify: `D:\Nancy\Web\tests\page-contract.test.mjs`
- Verify: `D:\Nancy\Web\tests\page-behavior.test.mjs`

**Interfaces:**
- Consumes: all changes from Tasks 1-2.
- Produces: fresh test evidence and a focused diff showing no unrelated changes.

- [ ] **Step 1: Run all automated tests**

Run:

```powershell
node --test
```

Expected: exit code `0`; active contract and behavior tests pass, with only intentionally skipped legacy tests remaining skipped.

- [ ] **Step 2: Check the changed CSS and test diff**

Run:

```powershell
git diff -- styles.css tests/page-contract.test.mjs
```

Expected: the diff only changes the hero container contract and CSS; if Git metadata is unavailable, inspect the edited file sections directly with `rg --line-number`.

- [ ] **Step 3: Verify the responsive invariants directly**

Run:

```powershell
rg --line-number "\.hero-grid|grid-template-columns: minmax\(0, \.86fr\)|margin-inline: auto|margin-right: 0|minmax\(500px" styles.css
```

Expected: the base `.hero-grid` has the shared width, centered margin, flexible columns, and no right-anchor or 500px minimum; the existing `max-width: 980px` and `max-width: 580px` media behavior remains present.
