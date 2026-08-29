# About Full Reference Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current About achievement-orbit block with the user supplied full Nancy reference design using native HTML/CSS and focused tests.

**Architecture:** Keep the existing static HTML page structure and the `section#about` anchor. Replace only the About visual content after the existing experience heading with semantic `article` cards, one central logo block, one benefit list, and one tagline. Use CSS Grid and CSS pseudo-elements for the waves, numbers, orbit marks, and responsive placement.

**Tech Stack:** Static HTML, CSS, Node.js built-in test runner, existing image assets.

## Global Constraints

- Work in `D:\Nancy\Web`; this folder is not a Git repository, so do not create commits.
- Preserve `section#about`, `id="about"`, `aria-labelledby="about-heading"`, and `id="about-heading"`.
- Do not change hero, courses, activities, contact, footer, or `script.js`.
- Do not add dependencies, new fonts, JavaScript, raster editing, image downloads, or the user reference PNG in HTML.
- Do not reference `images/about-teacher-1.jpg`, `images/about-teacher-2.jpg`, or `images/about-program.jpg` from HTML/CSS, but keep the physical files.
- Reuse `images/logo.png` with `alt="Nancy English Center"`, `width="256"`, `height="256"`, `loading="lazy"`, and `decoding="async"`.
- Desktop grid must be exactly `"card-1 card-2 card-3"` and `"card-4 brand card-5"`.
- Tablet layout from 680px to 1023px must use two columns.
- Mobile layout below 680px must use one column with cards in order `01` through `05` and the logo after card `05`.
- Full suite currently has two accepted baseline failures outside About: lazy image count and course seven-level learning path. Do not fix those in this task.

---

## File Structure

- Modify `tests/page-contract.test.mjs`: replace the old six-pill orbit test with a full About showcase contract.
- Modify `index.html`: replace `.achievement-orbit` markup with the new About showcase, benefits strip, and tagline.
- Modify `styles.css`: remove old `.achievement-orbit*` and `.achievement-pill` rules, add `.about-quality`, `.about-showcase`, `.about-showcase__card`, `.about-brand`, `.about-benefits`, and `.about-tagline` styles.
- Do not modify `script.js`.
- Do not modify image files.

## Task 1: Write The About Contract First

**Files:**
- Modify: `tests/page-contract.test.mjs`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: current static `html` and `css` strings loaded at the top of `tests/page-contract.test.mjs`.
- Produces: one focused test named `about section matches the user supplied full reference design`.

- [ ] **Step 1: Replace the old orbit test with the new failing test**

Replace the test named `about section uses the approved six-item achievement orbit` with a test that asserts:

```js
test("about section matches the user supplied full reference design", async () => {
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
  assert.match(about, /class="about-quality"/);
  assert.equal((about.match(/UY TÍN - CHẤT LƯỢNG - TẬN TÂM - HIỆU QUẢ/g) ?? []).length, 1);
  assert.match(about, /class="about-showcase"/);
  assert.equal((about.match(/<article class="about-showcase__card/g) ?? []).length, 5);

  const cards = [...about.matchAll(
    /<article class="about-showcase__card about-showcase__card--([^"]+)"[^>]*data-card="(\d{2})">([\s\S]*?)<\/article>/g,
  )];
  assert.deepEqual(cards.map((card) => card[2]), ["01", "02", "03", "04", "05"]);

  const expectedCards = [
    ["program", "01", "CHƯƠNG TRÌNH HỌC", "Bài bản, khoa học, cập nhật liên tục"],
    ["teacher", "02", "GIÁO VIÊN GIÀU KINH NGHIỆM", "Đội ngũ giáo viên giỏi chuyên môn, tận tâm và truyền cảm hứng"],
    ["standard", "03", "CẬP NHẬT THEO CHUẨN QUỐC TẾ", "Giáo trình hiện đại, tiệm cận chuẩn quốc tế"],
    ["care", "04", "QUAN TÂM SÁT SAO", "Theo sát quá trình học, đánh giá và hỗ trợ kịp thời"],
    ["parent", "05", "HỖ TRỢ PHỤ HUYNH", "Đồng hành cùng phụ huynh trong suốt quá trình học"],
  ];

  for (let index = 0; index < expectedCards.length; index += 1) {
    const [theme, number, title, detail] = expectedCards[index];
    const [cardMarkup, actualTheme, actualNumber, body] = cards[index];
    assert.equal(actualTheme, theme);
    assert.equal(actualNumber, number);
    assert.match(cardMarkup, new RegExp(`aria-label="${number} ${title}"`));
    assert.ok(body.includes(`<span class="about-showcase__number" aria-hidden="true">${number}</span>`));
    assert.ok(body.includes(`<h3>${title}</h3>`));
    assert.ok(body.includes(`<p>${detail}</p>`));
    assert.match(body, /<svg[\s\S]*aria-hidden="true"[\s\S]*focusable="false"/);
  }

  assert.equal((about.match(/src="images\/logo\.png"/g) ?? []).length, 1);
  assert.match(
    about,
    /<img\s+src="images\/logo\.png"\s+alt="Nancy English Center"\s+width="256"\s+height="256"\s+loading="lazy"\s+decoding="async"/s,
  );

  const benefitItems = [...about.matchAll(
    /<li class="about-benefits__item about-benefits__item--([^"]+)">([\s\S]*?)<\/li>/g,
  )];
  assert.equal(benefitItems.length, 5);
  assert.deepEqual(
    benefitItems.map(([, , item]) => [
      item.match(/<strong>(.*?)<\/strong>/s)?.[1],
      item.match(/<span>(.*?)<\/span>/s)?.[1],
    ]),
    [
      ["HỌC ĐÚNG MỤC TIÊU", "Lộ trình cá nhân hóa theo năng lực"],
      ["KẾT QUẢ THỰC CHẤT", "Tiến bộ rõ rệt qua từng giai đoạn"],
      ["MÔI TRƯỜNG TÍCH CỰC", "Lớp học năng động, thân thiện"],
      ["UY TÍN HƠN 10 NĂM", "Được hàng nghìn học viên và phụ huynh tin tưởng"],
      ["CỘNG ĐỒNG HỌC VIÊN", "Kết nối - Chia sẻ - Cùng nhau phát triển"],
    ],
  );
  assert.match(about, /<p class="about-tagline">Học tiếng Anh - Mở rộng tương lai<\/p>/);

  assert.doesNotMatch(html, /achievement-orbit|achievement-pill/);
  assert.doesNotMatch(css, /achievement-orbit|achievement-pill/);
  for (const source of [
    "images/about-teacher-1.jpg",
    "images/about-teacher-2.jpg",
    "images/about-program.jpg",
  ]) {
    assert.ok(!html.includes(source), `unexpected About image reference: ${source}`);
    assert.ok(!css.includes(source), `unexpected About image CSS reference: ${source}`);
    await access(new URL(`../${source}`, import.meta.url));
  }

  assert.match(
    css,
    /\.about-showcase__grid\s*\{[^}]*grid-template-areas:\s*"card-1 card-2 card-3"\s*"card-4 brand card-5"/s,
  );
  assert.match(css, /\.about-showcase__card--program\s*\{[^}]*grid-area:\s*card-1/s);
  assert.match(css, /\.about-showcase__card--teacher\s*\{[^}]*grid-area:\s*card-2/s);
  assert.match(css, /\.about-showcase__card--standard\s*\{[^}]*grid-area:\s*card-3/s);
  assert.match(css, /\.about-showcase__card--care\s*\{[^}]*grid-area:\s*card-4/s);
  assert.match(css, /\.about-showcase__card--parent\s*\{[^}]*grid-area:\s*card-5/s);
  assert.match(css, /\.about-brand\s*\{[^}]*grid-area:\s*brand/s);
  assert.match(
    css,
    /@media \(max-width: 1023px\) and \(min-width: 680px\)[\s\S]*?\.about-showcase__grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    css,
    /@media \(max-width: 679px\)[\s\S]*?\.about-showcase__grid\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.match(css, /\.about-benefits\s*\{[^}]*grid-template-columns:\s*repeat\(5,\s*1fr\)/s);
});
```

- [ ] **Step 2: Run focused About test and verify RED**

Run:

```bash
node --test --test-name-pattern="about section matches the user supplied full reference design" tests/page-contract.test.mjs
```

Expected: FAIL because `.about-quality`, `.about-showcase`, new cards, benefit strip, and tagline do not exist yet.

## Task 2: Implement About HTML

**Files:**
- Modify: `index.html`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: existing `section#about` and existing `.experience-heading`.
- Produces: `.about-quality`, `.about-showcase`, `.about-showcase__grid`, five `.about-showcase__card` articles, `.about-brand`, `.about-benefits`, and `.about-tagline`.

- [ ] **Step 1: Replace `.achievement-orbit` markup**

In `index.html`, keep the existing `section.about` opening tag and `.experience-heading`. Delete only the old `.achievement-orbit` block. Insert the new native markup with five article cards in source order `01` through `05`, one logo block after the cards, a five-item benefit list, and the tagline.

- [ ] **Step 2: Preserve image and accessibility attributes**

Ensure the About logo is:

```html
<img src="images/logo.png" alt="Nancy English Center" width="256" height="256" loading="lazy" decoding="async" />
```

Ensure each decorative card icon SVG includes:

```html
aria-hidden="true" focusable="false"
```

- [ ] **Step 3: Run focused About test**

Run:

```bash
node --test --test-name-pattern="about section matches the user supplied full reference design" tests/page-contract.test.mjs
```

Expected: still FAIL because CSS selectors and responsive grid contracts are not implemented yet.

## Task 3: Implement About CSS

**Files:**
- Modify: `styles.css`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: classes produced by Task 2.
- Produces: desktop, tablet, and mobile layout contracts required by Task 1.

- [ ] **Step 1: Remove old orbit styles**

Delete rules for:

```css
.achievement-orbit
.achievement-orbit__brand
.achievement-orbit__brand img
.achievement-orbit__list
.achievement-orbit__list--left
.achievement-orbit__list--right
.achievement-pill
.achievement-pill strong
.achievement-pill span
```

Also delete old responsive rules for `.achievement-orbit`, `.achievement-orbit__brand`, `.achievement-orbit__brand img`, `.achievement-orbit__list`, and `.achievement-pill`.

- [ ] **Step 2: Add new desktop showcase CSS**

Add CSS for `.about-quality`, `.about-showcase`, `.about-showcase__grid`, five themed cards, `.about-brand`, `.about-benefits`, and `.about-tagline`. The desktop grid must include:

```css
.about-showcase__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-areas:
    "card-1 card-2 card-3"
    "card-4 brand card-5";
}
.about-showcase__card--program { grid-area: card-1; }
.about-showcase__card--teacher { grid-area: card-2; }
.about-showcase__card--standard { grid-area: card-3; }
.about-showcase__card--care { grid-area: card-4; }
.about-showcase__card--parent { grid-area: card-5; }
.about-brand { grid-area: brand; }
.about-benefits { grid-template-columns: repeat(5, 1fr); }
```

- [ ] **Step 3: Add responsive CSS**

Add tablet and mobile media blocks:

```css
@media (max-width: 1023px) and (min-width: 680px) {
  .about-showcase__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      "card-1 card-2"
      "card-3 card-4"
      "card-5 brand";
  }
  .about-benefits { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 679px) {
  .about-showcase__grid {
    grid-template-columns: 1fr;
    grid-template-areas:
      "card-1"
      "card-2"
      "card-3"
      "card-4"
      "card-5"
      "brand";
  }
  .about-benefits { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Run focused About test and verify GREEN**

Run:

```bash
node --test --test-name-pattern="about section matches the user supplied full reference design" tests/page-contract.test.mjs
```

Expected: PASS for the focused About test.

## Task 4: Full Verification And Completion Audit

**Files:**
- Read: `index.html`
- Read: `styles.css`
- Read: `script.js`
- Test: `tests/page-contract.test.mjs`
- Test: `tests/page-behavior.test.mjs`

**Interfaces:**
- Consumes: finished About HTML/CSS.
- Produces: verification evidence for the user.

- [ ] **Step 1: Run JavaScript syntax check**

Run:

```bash
node --check script.js
```

Expected: exit code 0.

- [ ] **Step 2: Run focused About contract**

Run:

```bash
node --test --test-name-pattern="about section matches the user supplied full reference design" tests/page-contract.test.mjs
```

Expected: 1 test pass, 0 focused failures.

- [ ] **Step 3: Run full test suite**

Run:

```bash
node --test tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: no new About failures. If the suite fails only on the known baseline lazy-image-count and course-section assertions, report those as pre-existing accepted failures. If any new failure appears, fix it before reporting completion.

- [ ] **Step 4: Static preflight**

Search for stale or forbidden references:

```bash
rg --line-number "achievement-orbit|achievement-pill|about-teacher-1|about-teacher-2|about-program|ChatGPT Image" index.html styles.css
```

Expected: no matches in `index.html` or `styles.css`.

- [ ] **Step 5: Visual QA limitation**

Do not claim browser screenshot verification unless a browser is available. Prior browser access returned `No browser is available`, so if that remains true, state that automated visual screenshot QA was not available and rely on static/test verification.
