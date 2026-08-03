# Happy Kids and Starter Image Swap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the supplied `images/IMG_20260803_171902.jpg` photo in both the Happy Kids and Starter course cards.

**Architecture:** Keep the existing static course-card HTML and CSS unchanged. Update the two image contracts in the Node test suite first, then make the smallest matching HTML change to each card.

**Tech Stack:** Static HTML, Node.js built-in test runner

## Global Constraints

- Both `data-course="happy-kids"` and `data-course="starter"` must use `images/IMG_20260803_171902.jpg`.
- Preserve card markup, declared image dimensions, lazy loading, decoding, crop behavior, course copy, and all CSS.
- Do not copy, edit, or delete the supplied image file.

---

### Task 1: Protect and implement the two image assignments

**Files:**
- Modify: `tests/page-contract.test.mjs:281-282`
- Modify: `index.html:539-568`
- Verify: `images/IMG_20260803_171902.jpg`

**Interfaces:**
- Consumes: course cards selected by `article.course-card[data-course="happy-kids"]` and `article.course-card[data-course="starter"]`
- Produces: exact image-source and accessible-alt-text contracts for both cards

- [ ] **Step 1: Write the failing contract test**

Update the two entries in `expectedCards` and add assertions after its loop:

```js
["happy-kids", ["Happy Kids", "Lớp 2 trở xuống", "images/IMG_20260803_171902.jpg"]],
["starter", ["Starter", "Lớp 3", "images/IMG_20260803_171902.jpg"]],
```

```js
const sharedCoursePhoto = "images/IMG_20260803_171902.jpg";
await access(new URL(`../${sharedCoursePhoto}`, import.meta.url));
for (const slug of ["happy-kids", "starter"]) {
  assert.match(
    cardMarkup(slug),
    /alt="Chứng nhận và lễ vinh danh học viên tại Nancy English Center"/,
  );
}
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```powershell
node --test --test-name-pattern="course section follows" tests/page-contract.test.mjs
```

Expected: FAIL because both cards still reference their former teacher photos.

- [ ] **Step 3: Implement the minimal HTML change**

For both target cards, replace only the `src` and `alt` attributes with:

```html
src="images/IMG_20260803_171902.jpg"
alt="Chứng nhận và lễ vinh danh học viên tại Nancy English Center"
```

- [ ] **Step 4: Run the focused and full test suites**

Run:

```powershell
node --test --test-name-pattern="course section follows" tests/page-contract.test.mjs
node --test tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: both commands PASS with zero failures.

- [ ] **Step 5: Review the diff**

Run:

```powershell
git diff --check
git diff -- index.html tests/page-contract.test.mjs
```

Expected: no whitespace errors; the functional diff contains only the two image contracts, two matching HTML image attributes, and the local-file/alt assertions.

- [ ] **Step 6: Commit the implementation**

```powershell
git add -- index.html tests/page-contract.test.mjs
git commit -m "feat: update happy kids and starter images"
```
