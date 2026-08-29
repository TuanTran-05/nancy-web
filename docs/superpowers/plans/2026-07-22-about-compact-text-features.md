# About Compact Text Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all large photos from `#about` and leave a compact, centered pair of vertically stacked text rows with small brand-color icons.

**Architecture:** Keep the existing `experience-heading`, section semantics, two `article.about-feature` elements, icons, headings, and copy. Update the contract test first so it requires an image-free About section, then remove only the gallery markup and gallery CSS while constraining `about-features` to a centered 900px column. Retain the three physical image files for future reuse.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner.

## Global Constraints

- Preserve `#about`, `aria-labelledby="about-heading"`, `role="heading"`, `aria-level="2"`, and the complete `experience-heading` copy.
- Preserve exactly two `article.about-feature` elements in their current order.
- Preserve the current teacher/program headings, descriptions, icons, and brand colors.
- Remove all `<img>`, `.about-feature__gallery`, and `.about-feature__image` references from `#about`.
- Keep `images/about-teacher-1.jpg`, `images/about-teacher-2.jpg`, and `images/about-program.jpg` on disk.
- Center `.about-features` with `max-width: 900px`.
- Use only whitespace and the current top border for grouping; do not add cards, backgrounds, shadows, badges, numbering, animations, JavaScript, or dependencies.
- Remove the obsolete 767px gallery breakpoint.
- Keep mobile icon sizing and spacing at the existing 580px breakpoint.
- Do not modify navigation, hero, courses, activities, contact, footer, or `script.js`.
- This workspace is not a Git repository, so commit checkpoints are unavailable.

---

### Task 1: Convert About to compact text-only rows

**Files:**

- Modify: `tests/page-contract.test.mjs`
- Modify: `index.html`
- Modify: `styles.css`
- Verify: `tests/page-behavior.test.mjs`
- Verify: `script.js`

**Interfaces:**

- Consumes: the existing `#about` markup and CSS classes `about-features`, `about-feature`, `about-feature__intro`, `about-feature__icon`, and `about-feature__body`.
- Produces: an image-free About section with two stacked feature rows in a centered 900px content column.

- [ ] **Step 1: Replace the old image-focused contract with a failing text-only contract**

In `image loading preserves layout and prioritizes the hero`, restore the lazy-image count to five:

```js
assert.equal((html.match(/loading="lazy" decoding="async"/g) ?? []).length, 5);
```

Replace the current About gallery test with:

```js
test("about section uses the approved compact two-row feature layout", async () => {
  const aboutStart = html.indexOf('<section class="section about"');
  const aboutEnd = html.indexOf('<section class="section courses"');
  const about = html.slice(aboutStart, aboutEnd);

  assert.match(
    about,
    /<section class="section about" id="about" aria-labelledby="about-heading">/,
  );
  assert.match(
    about,
    /<div\s+class="experience-heading"\s+id="about-heading"\s+role="heading"\s+aria-level="2"/s,
  );
  assert.doesNotMatch(about, /Về <span class="accent-navy">Nancy English Center/);
  assert.doesNotMatch(about, /class="section-lead"/);
  assert.equal((about.match(/class="about-feature"/g) ?? []).length, 2);
  assert.match(
    about,
    /<h3>Giáo viên kinh nghiệm &amp; quan tâm sát sao học viên<\/h3>/,
  );
  assert.match(about, /<h3>Chương trình bài bản<\/h3>/);
  assert.doesNotMatch(about, /<img\b/);
  assert.doesNotMatch(about, /about-feature__gallery/);
  assert.doesNotMatch(about, /about-feature__image/);

  for (const source of [
    "images/about-teacher-1.jpg",
    "images/about-teacher-2.jpg",
    "images/about-program.jpg",
  ]) {
    assert.ok(!html.includes(source), `unexpected About image reference: ${source}`);
    await access(new URL(`../${source}`, import.meta.url));
  }

  assert.match(
    css,
    /\.about-features\s*\{[^}]*max-width:\s*900px[^}]*margin:\s*26px auto 0[^}]*display:\s*grid/s,
  );
  assert.doesNotMatch(css, /\.about-feature__gallery/);
  assert.doesNotMatch(css, /\.about-feature__image/);
  assert.doesNotMatch(css, /@media \(max-width:\s*767px\)/);
  assert.match(
    css,
    /@media \(max-width: 580px\)[\s\S]*?\.about-feature__icon\s*\{[^}]*width:\s*48px;\s*height:\s*48px/s,
  );
});
```

- [ ] **Step 2: Run the focused test to verify RED**

Run: `node --test tests/page-contract.test.mjs`

Expected: FAIL because `#about` still contains three images and gallery wrappers, `.about-features` lacks `max-width: 900px`, and the lazy-image count is still eight.

- [ ] **Step 3: Remove only the About gallery markup**

In `index.html`, preserve the two articles and remove the gallery block from each article. The final feature markup must be:

```html
<div class="about-features">
  <article class="about-feature">
    <div class="about-feature__intro">
      <div class="about-feature__icon ic-blue" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>
      </div>
      <div class="about-feature__body">
        <h3>Giáo viên kinh nghiệm &amp; quan tâm sát sao học viên</h3>
        <p>Đội ngũ giáo viên giàu chuyên môn, tận tâm, luôn đồng hành, theo dõi tiến độ và hỗ trợ kịp thời để mỗi học viên tiến bộ mỗi ngày.</p>
      </div>
    </div>
  </article>

  <article class="about-feature">
    <div class="about-feature__intro">
      <div class="about-feature__icon ic-orange" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.1-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.35-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>
      </div>
      <div class="about-feature__body">
        <h3>Chương trình bài bản</h3>
        <p>Lộ trình học khoa học, cập nhật theo chuẩn quốc tế và phù hợp từng cấp độ.</p>
      </div>
    </div>
  </article>
</div>
```

- [ ] **Step 4: Replace the About layout CSS with the compact text-only rules**

Keep the current icon/body rules. Change `.about-features` to:

```css
.about-features {
  max-width: 900px;
  margin: 26px auto 0;
  display: grid;
}
```

Keep `.about-feature` as:

```css
.about-feature {
  padding: 22px 0;
  border-top: 1px solid var(--line);
}
```

Remove these complete rules:

```css
.about-feature__gallery {
  margin-top: 18px;
  display: grid;
  gap: 14px;
}
.about-feature__gallery--teacher {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.about-feature__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}
```

Remove the complete obsolete breakpoint:

```css
@media (max-width: 767px) {
  .about-features { gap: 28px; }
  .about-feature__gallery--teacher { grid-template-columns: 1fr; }
}
```

Within `@media (max-width: 580px)`, keep the existing compact icon/intro declarations and remove the obsolete `.about-feature__gallery` declaration. Change the row padding to:

```css
.about-feature { padding: 18px 0; }
```

- [ ] **Step 5: Run the focused test to verify GREEN**

Run: `node --test tests/page-contract.test.mjs`

Expected: all contract tests PASS.

- [ ] **Step 6: Run full automated verification**

Run:

```powershell
node --test tests/page-behavior.test.mjs tests/page-contract.test.mjs
node --check script.js
```

Expected: all tests PASS and JavaScript syntax check exits successfully.

- [ ] **Step 7: Perform final responsive review**

Inspect `#about` at desktop and 320px when a browser is available. Confirm the content column is centered, both rows remain left-aligned, headings wrap naturally, icons stay circular, and no horizontal overflow appears. If the in-app browser remains unavailable, report that limitation without substituting another browser tool.

- [ ] **Step 8: Record completion**

Do not commit because the workspace has no Git repository. Report the exact files modified, retained physical image files, verification output, and any browser-QA limitation.
