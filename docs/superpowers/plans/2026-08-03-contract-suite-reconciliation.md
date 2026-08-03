# Contract Suite Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile the static Nancy website with its approved specifications so all active page-contract tests pass without regressing the newly assigned IELTS images.

**Architecture:** Treat approved specs as the source of truth. Update stale assertions when they contradict those specs, implement missing About and course designs in the existing static HTML/CSS/JavaScript, and verify behavior through Node contracts plus real-browser checks.

**Tech Stack:** Static HTML5, CSS, vanilla JavaScript, Node.js built-in test runner

## Global Constraints

- Primary brand name remains `Nancy English Center`; alternate name remains `Anh Ngữ Nancy An Phú`.
- Keep all contact data, URLs, anchors, images, and marketing copy outside explicitly approved redesign sections.
- IELTS uses `images/IMG_20260803_165233.jpg`.
- Luyện thi đại học uses `https://i.postimg.cc/ZRrpDX67/748741212-1553232193481313-2232384107086123280-n.jpg`.
- Add no dependencies, frameworks, backends, or external font requests.
- Final result: 22 tests, 21 pass, 1 legacy skip, 0 fail.

---

### Task 1: Reconcile stale identity, CSS, accessibility, and loading contracts

**Files:**
- Modify: `tests/page-contract.test.mjs:54-368`
- Modify: `index.html:10-190`
- Modify: `styles.css:145-210`

**Interfaces:**
- Consumes: approved SEO values and current CSS token names
- Produces: accurate contracts for metadata, header, favicon, typography, SVG, gallery, mobile layout, color contrast, and image loading

- [ ] **Step 1: Run the failing contract group**

Run:

```powershell
node --test --test-name-pattern="brand metadata|favicon|header brand|business identity|visual contract|typography|numeric path|gallery lightbox|orange graphics|small-screen|image loading" tests/page-contract.test.mjs
```

Expected: the current 11 contract failures reproduce.

- [ ] **Step 2: Rewrite stale assertions against approved behavior**

Update the tests to assert these literal outcomes:

```js
assert.match(html, /<meta property="og:site_name" content="Nancy English Center" \/>/);
assert.equal(website.name, "Nancy English Center");
assert.equal(website.alternateName, "Anh Ngữ Nancy An Phú");
assert.equal(business.name, "Nancy English Center");
assert.equal(business.alternateName, "Anh Ngữ Nancy An Phú");
assert.match(brand, /<strong>NANCY ENGLISH CENTER<\/strong>/);
assert.match(brand, /<em>thienuy\.edu\.vn<\/em>/);
assert.match(css, /--r-md:\s*12px/);
assert.match(css, /\.btn\s*\{[^}]*border-radius:\s*var\(--r-md\)/s);
assert.doesNotMatch(html, /href=["']https:\/\/fonts\.(?:googleapis|gstatic)\.com/i);
assert.match(css, /--accent:\s*(#[a-f\d]{6})/i);
```

For the gallery, locate the section with a multiline-safe boundary:

```js
const galleryStart = html.search(/<section\s+class="section activities"/s);
const galleryEnd = html.search(/<section\s+class="section contact"/s);
```

Rename the clock-path test and assert the current numeric clock path. Replace exact lazy-image count `17` with iteration over below-fold images, requiring explicit width/height and requiring lazy/async on every non-hero raster image that is not an intentional eager brand asset.

- [ ] **Step 3: Verify the rewritten tests fail only on real missing behavior**

Run the command from Step 1.

Expected: stale assertion failures disappear; favicon remains failing until implementation.

- [ ] **Step 4: Add the missing favicon and remove the misleading font URL comment**

Add to `<head>`:

```html
<link rel="icon" type="image/png" href="/images/logo.png" sizes="252x252" />
```

Change the font comment so it contains no external Google Fonts URL while retaining the explanation that fonts are self-hosted.

- [ ] **Step 5: Run the group and full suite**

Run:

```powershell
node --test --test-name-pattern="brand metadata|favicon|header brand|business identity|visual contract|typography|numeric path|gallery lightbox|orange graphics|small-screen|image loading" tests/page-contract.test.mjs
node --test tests/page-contract.test.mjs
```

Expected: this group passes; only About and course-design contracts remain failing.

### Task 2: Implement the approved full-reference About section

**Files:**
- Modify: `index.html:395-489`
- Modify: `styles.css`
- Test: `tests/page-contract.test.mjs:369-616`
- Reference: `.superpowers/sdd/snapshots/feature-head/index.html:313-513`
- Reference: `.superpowers/sdd/snapshots/feature-head/styles.css:224-560`

**Interfaces:**
- Consumes: `images/logo.png`, existing `#about` anchor, current brand tokens
- Produces: `experience-heading`, `about-quality`, five `about-showcase__card` articles, `about-benefits`, and `about-closing`

- [ ] **Step 1: Run the two failing About tests**

Run:

```powershell
node --test --test-name-pattern="about section" tests/page-contract.test.mjs
```

Expected: both tests fail because the current section uses `h2.h2` and `ol.pillars`.

- [ ] **Step 2: Replace the About markup with the approved structure**

Use the validated snapshot markup at `.superpowers/sdd/snapshots/feature-head/index.html:313` as the structural source. Preserve the exact approved content and these required nodes:

```html
<div class="experience-heading" id="about-heading" role="heading" aria-level="2">
  <div class="experience-heading__primary">
    <span class="experience-heading__lead">TỰ HÀO</span>
    <strong class="experience-heading__accent">10+ NĂM HOẠT ĐỘNG</strong>
  </div>
  <p class="experience-heading__secondary">GIẢNG DẠY TIẾNG ANH</p>
</div>
```

The five articles must retain `data-card="01"` through `data-card="05"`; the central logo must use `images/logo.png`, `256x256`, lazy loading, and async decoding. Add the five approved benefit items and the closing text `Học tiếng Anh - Mở rộng tương lai`.

- [ ] **Step 3: Add About styling adapted to current tokens**

Port the snapshot selectors from `.superpowers/sdd/snapshots/feature-head/styles.css:224-560`, mapping legacy tokens as follows:

```css
--blue -> var(--brand)
--blue-deep -> var(--brand-strong)
--orange -> var(--accent)
--ink -> var(--text)
```

Keep the approved desktop grid:

```css
grid-template-areas:
  "card-1 card-2 card-3"
  "card-4 brand card-5";
```

At `max-width: 1023px`, use two columns; below `680px`, use one column and remove benefit separators.

- [ ] **Step 4: Run About tests and mutation-check the contract**

Run:

```powershell
node --test --test-name-pattern="about section" tests/page-contract.test.mjs
```

Expected: both pass. Confirm changing any card number, title, benefit count, logo source, or closing copy would fail at least one assertion.

### Task 3: Implement the approved course heading and bidirectional autoplay

**Files:**
- Modify: `index.html:490-845`
- Modify: `styles.css`
- Modify: `script.js:220-287`
- Modify: `tests/page-contract.test.mjs:617-811`
- Reference: `.superpowers/sdd/snapshots/feature-head/index.html:516-801`
- Reference: `.superpowers/sdd/snapshots/feature-head/styles.css:562-700`
- Reference: `.superpowers/sdd/snapshots/feature-head/script.js:94-300`

**Interfaces:**
- Consumes: `[data-course-carousel]`, `[data-course-track]`, existing course-card markup
- Produces: `data-course-direction="right"` and `"left"`, seamless 28px/s autoplay, independent pause state, reduced-motion opt-out

- [ ] **Step 1: Strengthen and run the failing course contract**

Keep the image assignments added on 2026-08-03 and add behavior assertions for:

```js
assert.doesNotMatch(courses, /data-course-controls|data-course-prev|data-course-next/);
assert.match(courses, /data-course-carousel\s+data-course-direction="right"/);
assert.match(courses, /data-course-carousel\s+data-course-direction="left"/);
assert.match(js, /var COURSE_SPEED = 28/);
assert.match(js, /prefers-reduced-motion: reduce/);
assert.match(js, /requestAnimationFrame\(animateCourseRows\)/);
```

Run:

```powershell
node --test --test-name-pattern="course section|course images|source-class" tests/page-contract.test.mjs
```

Expected: course section fails; image and ordering tests pass.

- [ ] **Step 2: Replace the heading and remove navigation controls**

Use this heading:

```html
<h2 class="section-title courses-heading" id="courses-heading">
  <span class="courses-heading__lead">KHÓA HỌC DÀNH CHO</span>
  <span class="courses-heading__pill">
    MỌI ĐỘ TUỔI
    <span class="courses-heading__spark" aria-hidden="true"></span>
  </span>
</h2>
```

Remove both `course-carousel__toolbar` blocks and add `data-course-direction="right"` to the first carousel and `data-course-direction="left"` to the second. Preserve all original course articles and the two newly assigned image sources.

- [ ] **Step 3: Add heading and row-spacing CSS**

Port the snapshot course-heading selectors and adapt colors to current tokens. Set `.course-carousel--extra` to `margin-top: 8px`, `padding-top: 0`, and `border-top: 0`. Preserve horizontal manual scrolling and visible focus.

- [ ] **Step 4: Replace button carousel logic with autoplay controller**

Replace the current control-button code with the validated controller in `.superpowers/sdd/snapshots/feature-head/script.js:94-300`. It must clone cards with `aria-hidden="true"`, disable clone focus, normalize `scrollLeft`, pause on hover/focus/pointer/native scroll/document hidden/reduced motion, and animate at `28px/s` using elapsed timestamps.

- [ ] **Step 5: Run course and full tests**

Run:

```powershell
node --test --test-name-pattern="course section|course images|source-class" tests/page-contract.test.mjs
node --test tests/page-contract.test.mjs
```

Expected: 22 tests, 21 pass, 1 skip, 0 fail.

### Task 4: Browser verification and final review

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `script.js`

**Interfaces:**
- Consumes: completed static site
- Produces: evidence that contract-green markup also works visually and interactively

- [ ] **Step 1: Start a local static server**

Run a workspace-local HTTP server and open the page through the browser verification tooling.

- [ ] **Step 2: Verify desktop**

At 1440px or wider, confirm: centered hero, full About grid, heading capsule, two course rows moving in opposite directions, correct IELTS/university images, gallery lightbox keyboard operation, and no console errors.

- [ ] **Step 3: Verify mobile**

At 390px and 320px, confirm: no horizontal overflow, hamburger panel stays in viewport, About collapses to one column, heading wraps cleanly, course rows remain manually scrollable, and map CTA stays within the viewport.

- [ ] **Step 4: Run final automated verification**

Run:

```powershell
node --test tests/page-contract.test.mjs
git diff --check
```

Expected: 21 pass, 1 skip, 0 fail; no whitespace errors.
