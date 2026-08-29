# About Vertical Feature Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the About section's three horizontal cards with two vertical content blocks, merge student care into the teacher block, and place the three supplied classroom photos beneath the matching content.

**Architecture:** Keep the change local to the existing static `#about` section. Protect the new content contract with Node tests first, copy the supplied photos into the existing `images/` directory, replace only the markup after `experience-heading`, and add responsive CSS that shows the teacher gallery in two columns on desktop and one column below 768px. No JavaScript or dependency changes are needed.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner.

## Global Constraints

- Preserve the existing `#about` anchor and `experience-heading` markup and copy.
- Remove `Về Nancy English Center` and the old lead paragraph from `#about`.
- Render exactly two vertical feature blocks.
- Merge `Quan tâm sát sao học viên` into the teacher block; do not render it as a third heading.
- Use supplied photos 1 and 3 for the teacher gallery, and supplied photo 2 for the program gallery.
- Save all photos locally under `images/`; do not hotlink Postimg.
- Keep the existing blue/orange palette, typography, 12px radius system, and reduced-motion behavior.
- Collapse all image galleries to one column below 768px and prevent horizontal overflow at 320px.
- Do not modify `script.js`, navigation, routes, anchors, course content, activity content, or contact content.
- Do not add packages or JavaScript.
- This workspace is not a Git repository, so commit checkpoints are unavailable.

---

### Task 1: Lock the approved About content and image contract

**Files:**

- Modify: `tests/page-contract.test.mjs`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**

- Consumes: the `html` and `css` strings already loaded at the top of `tests/page-contract.test.mjs`.
- Produces: a contract for `.about-features`, two `.about-feature` blocks, three local image sources, and the responsive teacher gallery.

- [ ] **Step 1: Replace the old image-count assertion**

In `image loading preserves layout and prioritizes the hero`, change the expected lazy-image count from five to eight:

```js
assert.equal((html.match(/loading="lazy" decoding="async"/g) ?? []).length, 8);
```

- [ ] **Step 2: Write the failing About gallery test**

Append this test after the existing experience-heading test:

```js
test("about section uses the approved two-block vertical feature gallery", () => {
  const aboutStart = html.indexOf('<section class="section about"');
  const aboutEnd = html.indexOf('<section class="section courses"');
  const about = html.slice(aboutStart, aboutEnd);

  assert.doesNotMatch(about, /Về <span class="accent-navy">Nancy English Center/);
  assert.doesNotMatch(about, /class="section-lead"/);
  assert.equal((about.match(/class="about-feature"/g) ?? []).length, 2);
  assert.match(
    about,
    /<h3>Giáo viên kinh nghiệm &amp; quan tâm sát sao học viên<\/h3>/,
  );
  assert.doesNotMatch(about, /<h3>Quan tâm sát sao học viên<\/h3>/);

  for (const source of [
    "images/about-teacher-1.jpg",
    "images/about-teacher-2.jpg",
    "images/about-program.jpg",
  ]) {
    assert.ok(about.includes(source), `missing About image source: ${source}`);
  }

  assert.match(
    about,
    /<img src="images\/about-teacher-1\.jpg"[^>]*width="1276"[^>]*height="956"[^>]*loading="lazy" decoding="async"/,
  );
  assert.match(
    about,
    /<img src="images\/about-teacher-2\.jpg"[^>]*width="1276"[^>]*height="956"[^>]*loading="lazy" decoding="async"/,
  );
  assert.match(
    about,
    /<img src="images\/about-program\.jpg"[^>]*width="1280"[^>]*height="960"[^>]*loading="lazy" decoding="async"/,
  );
  assert.match(css, /\.about-features\s*\{[^}]*display:\s*grid/s);
  assert.match(
    css,
    /\.about-feature__gallery--teacher\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    css,
    /@media \(max-width:\s*767px\)[\s\S]*?\.about-feature__gallery--teacher\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
});
```

- [ ] **Step 3: Run the focused test to verify RED**

Run: `node --test tests/page-contract.test.mjs`

Expected: FAIL because the lazy-image count is still five, the old About title and lead remain, and the new classes and image sources do not exist.

- [ ] **Step 4: Record the test checkpoint**

Do not commit because `D:\Nancy\Web` has no Git repository. Keep the failing test in place for Task 2.

---

### Task 2: Add the local image assets and semantic vertical markup

**Files:**

- Create: `images/about-teacher-1.jpg`
- Create: `images/about-teacher-2.jpg`
- Create: `images/about-program.jpg`
- Modify: `index.html`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**

- Consumes: downloaded source images at `D:\tmp\nancy-provided-1.jpg`, `D:\tmp\nancy-provided-2.jpg`, and `D:\tmp\nancy-provided-3.jpg`.
- Produces: `.about-features`, two `.about-feature` elements, `.about-feature__gallery--teacher`, and three locally referenced images for Task 3 styling.

- [ ] **Step 1: Copy the supplied images into stable project paths**

Run these PowerShell commands:

```powershell
Copy-Item -LiteralPath 'D:\tmp\nancy-provided-1.jpg' -Destination 'D:\Nancy\Web\images\about-teacher-1.jpg'
Copy-Item -LiteralPath 'D:\tmp\nancy-provided-3.jpg' -Destination 'D:\Nancy\Web\images\about-teacher-2.jpg'
Copy-Item -LiteralPath 'D:\tmp\nancy-provided-2.jpg' -Destination 'D:\Nancy\Web\images\about-program.jpg'
```

- [ ] **Step 2: Replace only the old About title, lead, and three-card grid**

Keep `experience-heading` unchanged. Remove the About `h2`, `.section-lead`, and `.cards-3`, then place this markup immediately after `experience-heading`:

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
    <div class="about-feature__gallery about-feature__gallery--teacher">
      <img src="images/about-teacher-1.jpg" alt="Giáo viên nước ngoài tổ chức hoạt động tiếng Anh cùng học viên Nancy" width="1276" height="956" loading="lazy" decoding="async" class="about-feature__image" />
      <img src="images/about-teacher-2.jpg" alt="Giáo viên hướng dẫn và tương tác gần gũi với nhóm học viên Nancy" width="1276" height="956" loading="lazy" decoding="async" class="about-feature__image" />
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
    <div class="about-feature__gallery">
      <img src="images/about-program.jpg" alt="Giáo viên hướng dẫn học viên thực hành tiếng Anh tương tác trong lớp" width="1280" height="960" loading="lazy" decoding="async" class="about-feature__image" />
    </div>
  </article>
</div>
```

- [ ] **Step 3: Run the focused test and inspect the remaining failure**

Run: `node --test tests/page-contract.test.mjs`

Expected: FAIL only on the new CSS assertions because `.about-features` and gallery styles have not been added yet. All markup, copy, local image, and count assertions should pass.

- [ ] **Step 4: Record the markup checkpoint**

Do not commit because the workspace has no Git repository. Continue with the same failing test in Task 3.

---

### Task 3: Style the vertical feature gallery and complete verification

**Files:**

- Modify: `styles.css`
- Verify: `tests/page-contract.test.mjs`
- Verify: `tests/page-behavior.test.mjs`
- Verify: `script.js`

**Interfaces:**

- Consumes: the class names and image elements introduced in Task 2.
- Produces: desktop two-column teacher images, full-width program image, mobile single-column collapse, and stable 4:3 image boxes.

- [ ] **Step 1: Replace the old three-card About styles**

Remove the `.cards-3` and `.feature-card` rules in the About style block. Add these rules in their place:

```css
/* ---------- About Section (Vertical Feature Galleries) ---------- */
.about { background: #fff; }
.about-features {
  margin-top: 26px;
  display: grid;
  gap: 34px;
}
.about-feature {
  padding-top: 22px;
  border-top: 1px solid var(--line);
}
.about-feature__intro {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  max-width: 820px;
}
.about-feature__icon {
  flex: none;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
}
.about-feature__body h3 {
  margin: 0 0 5px;
  color: var(--blue-deep);
  font-size: 1.05rem;
  font-weight: 700;
  line-height: 1.3;
}
.about-feature__body p {
  max-width: 76ch;
  color: #5F6C7C;
  font-size: .86rem;
  line-height: 1.55;
}
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

- [ ] **Step 2: Remove obsolete responsive selectors**

In the existing `max-width: 980px` and `max-width: 580px` blocks, remove `.cards-3` from these selector lists while leaving `.cards-4` behavior unchanged:

```css
.cards-4 { grid-template-columns: repeat(2, 1fr); }
```

```css
.cards-4 { grid-template-columns: 1fr; }
```

- [ ] **Step 3: Add the explicit mobile collapse**

Insert this breakpoint before the existing `max-width: 580px` block:

```css
@media (max-width: 767px) {
  .about-features { gap: 28px; }
  .about-feature__gallery--teacher { grid-template-columns: 1fr; }
}
```

Within the existing `max-width: 580px` block, add compact mobile spacing without changing the heading scale:

```css
.about-feature { padding-top: 18px; }
.about-feature__intro { gap: 12px; }
.about-feature__icon { width: 48px; height: 48px; }
.about-feature__gallery { margin-top: 14px; gap: 10px; }
```

- [ ] **Step 4: Run focused verification to confirm GREEN**

Run: `node --test tests/page-contract.test.mjs`

Expected: all contract tests PASS.

- [ ] **Step 5: Run the complete automated verification**

Run:

```powershell
node --test tests/page-behavior.test.mjs tests/page-contract.test.mjs
node --check script.js
```

Expected: all behavior and contract tests PASS; JavaScript syntax check exits successfully.

- [ ] **Step 6: Perform browser visual QA**

Serve `D:\Nancy\Web` locally and inspect `#about` at desktop, 768px, and 320px widths. Confirm:

- the About title and old lead are absent;
- the experience heading remains centered and unchanged;
- the teacher block appears first with two photos side by side on desktop;
- the program block appears second with one full-width photo;
- all photos collapse to one column below 768px;
- no image is stretched, clipped around faces, or causes horizontal overflow;
- the blue/orange palette, typography, icon treatment, and 12px radii remain consistent.

- [ ] **Step 7: Run the full test command again after visual adjustments**

Run: `node --test tests/page-behavior.test.mjs tests/page-contract.test.mjs`

Expected: all tests PASS after any CSS-only visual refinements.

- [ ] **Step 8: Record final completion**

Do not commit because the workspace has no Git repository. Report the exact files created and modified, plus the verification output.
