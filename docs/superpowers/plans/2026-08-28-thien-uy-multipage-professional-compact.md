# Thien Uy Multipage Professional Compact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all eleven Thien Uy pages into the approved A2 and Professional Compact system while shortening the conversion path to placement testing and phone consultation.

**Architecture:** Keep the current static HTML, CSS, and vanilla JavaScript architecture. Put shared tokens and components in `styles.css`, keep the five page-family layouts in `pages.css`, and preserve current JavaScript hooks so the mobile menu, form, filters, galleries, course details, and results modal continue to work. Retain every existing route, but reduce top navigation to the five approved destinations and move secondary routes into contextual links and the footer.

**Tech Stack:** HTML5, CSS custom properties, vanilla ES5-compatible JavaScript, Node built-in test runner, Python `unittest`, self-hosted WOFF2 fonts.

**Spec:** `docs/superpowers/specs/2026-08-28-thien-uy-multipage-professional-compact-design.md`

**Baseline:** `node --test tests/page-contract.test.mjs tests/website-pages.test.mjs tests/page-behavior.test.mjs tests/results-modal.test.mjs` passes 54 tests before implementation.

## Global Constraints

- Preserve all eleven routes: `index.html`, `about.html`, `teachers.html`, `courses.html`, `course.html`, `learning-path.html`, `achievements.html`, `activities.html`, `knowledge.html`, `faq.html`, and `contact.html`.
- Keep the project dependency-free: no package manifest, build step, framework, UI library, animation library, or CDN.
- Keep brand blue exactly `#0E4EA1`, brand hover `#0A3B7D`, accent `#C24C00`, accent hover `#A84200`, and accent text `#B04500`.
- Keep a light theme only. Do not add a dark-mode media query or an inverted section theme.
- Keep `Be Vietnam Pro` and `Baloo 2` self-hosted font declarations and font preload tags.
- Keep the homepage H1 exactly `TIẾNG ANH VỮNG VÀNG -` followed by `TƯƠNG LAI TƯƠI SÁNG`; do not render “Anh ngữ tại An Phú” above it.
- Use `Kiểm tra trình độ miễn phí` as the one primary CTA label and `Gọi tư vấn` as the phone CTA label.
- Preserve the Google Form endpoint and exact mappings: `name` to `entry.380148302`, `phone` to `entry.1988606558`, `child` to `entry.1215349974`, `grade` to `entry.1485252148`, and `note` to `entry.153390468`.
- Preserve verified phone, email, Zalo, Facebook, address, opening hours, result totals, local image paths, metadata, and structured data.
- Do not invent teacher identities, credentials, prices, schedules, guarantees, testimonials, or statistics.
- Keep body horizontal overflow at zero at widths `360`, `390`, `768`, `1024`, `1440`, and `1920` pixels.
- Use a maximum content width of `1280px`, gutters from `16px` to `48px`, desktop section padding from `40px` to `68px`, and mobile section padding from `34px` to `52px`.
- Honor `prefers-reduced-motion`; animate only `transform` and `opacity`.
- Do not use long dash characters in visible copy.
- Treat existing modified and untracked files as the user's baseline. Never use `git add -A`; stage only the explicit files listed in each task.

## File Responsibility Map

- `styles.css`: font declarations, tokens, reset, shared typography, buttons, focus, header, mobile action bar, forms, lightboxes, footer, and global responsive rules.
- `pages.css`: page heroes, page-family layouts, homepage A2, program catalog, learning roadmap, evidence layouts, contact/FAQ layouts, and page-specific responsive rules.
- `script.js`: existing shared interactions. Edit only when a new regression test proves a behavior change is needed.
- `pages.js`: existing filter behavior for courses and achievements. Keep its `data-filter-*` interface stable.
- `course-detail.js`: existing query-driven course data binding. Keep its `data-course-*` interface stable.
- `results-modal.js` and `results-data.js`: existing result viewer and verified data. Do not redesign their data interface.
- `tests/page-contract.test.mjs`: cross-route shell, link, asset, CTA, form, SEO, and design-token contracts.
- `tests/website-pages.test.mjs`: content depth and page-family structure contracts.
- `tests/page-behavior.test.mjs`: menu, gallery, carousel, result trigger, and form behavior.
- `tests/results-modal.test.mjs`: result viewer rendering, keyboard behavior, privacy, and focus restoration.

---

### Task 1: Shared Professional Compact shell

**Files:**
- Modify: `tests/page-contract.test.mjs:1-279`
- Modify: `styles.css:147-572`
- Modify: `styles.css:1484-1564`
- Modify: `styles.css:1715-1965`
- Modify: `index.html:24-32,74-77`
- Modify: `about.html:62-95,231-274`
- Modify: `teachers.html:14-26`
- Modify: `courses.html:51-82,258-279`
- Modify: `course.html:14-45,93-98`
- Modify: `learning-path.html:14-24`
- Modify: `achievements.html:41-72,172-193`
- Modify: `activities.html:14-25`
- Modify: `knowledge.html:14-25`
- Modify: `faq.html:14-31`
- Modify: `contact.html:14-32`

**Interfaces:**
- Consumes: Existing `.site-header`, `.main-nav`, `.nav-toggle`, `.header-cta`, `.site-footer`, `.btn`, and `.skip-link` hooks used by `script.js` and current tests.
- Produces: Shared `.mobile-action-bar`, compact five-route navigation, canonical CTA labels, and final spacing tokens used by every later task.

- [ ] **Step 1: Reconfirm the green baseline**

Run:

```powershell
node --test tests/page-contract.test.mjs tests/website-pages.test.mjs tests/page-behavior.test.mjs tests/results-modal.test.mjs
```

Expected: PASS, 54 tests, 0 failures.

- [ ] **Step 2: Add failing shared-shell contracts**

Add these helpers and tests to `tests/page-contract.test.mjs` after the `section` helper:

```js
const primaryNavHrefs = [
  "about.html",
  "courses.html",
  "learning-path.html",
  "achievements.html",
  "contact.html",
];

const navMarkup = (source) => {
  const match = source.match(/<nav class="main-nav"[\s\S]*?<\/nav>/);
  assert.ok(match, "missing primary navigation");
  return match[0];
};

test("uses the approved five-route navigation and conversion shell", () => {
  for (const [name, source] of pages) {
    const nav = navMarkup(source);
    const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(hrefs, primaryNavHrefs, `${name} primary nav`);
    assert.match(source, />Kiểm tra trình độ miễn phí<\/a>/, name);
    assert.match(source, /class="mobile-action-bar"[\s\S]*href="tel:0866169569"[\s\S]*>Gọi tư vấn<[\s\S]*>Kiểm tra trình độ miễn phí</s, name);
  }
});

test("locks the approved Professional Compact tokens", () => {
  assert.match(css, /--brand:\s*#0e4ea1/i);
  assert.match(css, /--brand-strong:\s*#0a3b7d/i);
  assert.match(css, /--accent:\s*#c24c00/i);
  assert.match(css, /--wrap:\s*1280px/);
  assert.match(css, /--gutter:\s*clamp\(16px,\s*3\.6vw,\s*48px\)/);
  assert.match(css, /--section-y:\s*clamp\(40px,\s*4\.4vw,\s*68px\)/);
  assert.match(css, /--section-y-mobile:\s*clamp\(34px,\s*10vw,\s*52px\)/);
});
```

- [ ] **Step 3: Run the new contracts and confirm the intended failure**

Run:

```powershell
node --test --test-name-pattern="approved five-route|Professional Compact tokens" tests/page-contract.test.mjs
```

Expected: FAIL because current navigation omits `contact.html`, includes `index.html`, has no `.mobile-action-bar`, and still uses the old width and section tokens.

- [ ] **Step 4: Implement the shared header, footer, CTA, and mobile action bar**

Use this exact navigation structure in every page. Add `aria-current="page"` only to the matching core route; `course.html` maps to `courses.html`, `teachers.html` maps to `about.html`, and `faq.html` maps to `contact.html`.

```html
<nav class="main-nav" id="main-nav" aria-label="Điều hướng chính">
  <a href="about.html">Giới thiệu</a>
  <a href="courses.html">Khóa học</a>
  <a href="learning-path.html">Lộ trình</a>
  <a href="achievements.html">Thành tích</a>
  <a href="contact.html">Liên hệ</a>
</nav>
<div class="header-cta">
  <a class="header-phone" href="tel:0866169569">0866 169 569</a>
  <a class="btn btn-accent" href="contact.html#register">Kiểm tra trình độ miễn phí</a>
</div>
```

Use `href="#register"` for the primary CTA on `index.html` and `contact.html`. Place this action bar after `</main>` and before the footer on every page:

```html
<nav class="mobile-action-bar" aria-label="Hành động nhanh">
  <a class="mobile-action-bar__phone" href="tel:0866169569">Gọi tư vấn</a>
  <a class="mobile-action-bar__register" href="contact.html#register">Kiểm tra trình độ miễn phí</a>
</nav>
```

Use the local `#register` target on `index.html` and `contact.html`. Keep footer links to `teachers.html`, `activities.html`, `knowledge.html`, and `faq.html` so every secondary route remains discoverable.

Replace the rhythm tokens and add the mobile bar rules in `styles.css`:

```css
:root {
  --brand: #0e4ea1;
  --brand-strong: #0a3b7d;
  --accent: #c24c00;
  --accent-hover: #a84200;
  --accent-ink: #b04500;
  --wrap: 1280px;
  --gutter: clamp(16px, 3.6vw, 48px);
  --section-y: clamp(40px, 4.4vw, 68px);
  --section-y-mobile: clamp(34px, 10vw, 52px);
}

.mobile-action-bar {
  display: none;
}

@media (max-width: 680px) {
  body {
    padding-bottom: 68px;
  }

  .mobile-action-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 120;
    display: grid;
    grid-template-columns: minmax(112px, 0.72fr) minmax(0, 1.28fr);
    gap: 8px;
    padding: 8px max(12px, env(safe-area-inset-right)) calc(8px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
    border-top: 1px solid var(--line);
    background: var(--surface);
    box-shadow: 0 -8px 28px rgba(11, 40, 79, 0.12);
  }

  .mobile-action-bar a {
    display: inline-flex;
    min-height: 48px;
    align-items: center;
    justify-content: center;
    border-radius: var(--r-sm);
    font-size: 0.82rem;
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
  }

  .mobile-action-bar__phone {
    border: 1px solid var(--brand);
    color: var(--brand-ink);
  }

  .mobile-action-bar__register {
    background: var(--accent);
    color: #fff;
  }
}
```

- [ ] **Step 5: Run shared-shell and behavior regressions**

Run:

```powershell
node --test tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: PASS. Menu tests must remain green because `.nav-toggle`, `.main-nav`, `#main-nav`, `aria-expanded`, and link-close behavior remain intact.

- [ ] **Step 6: Commit the shared shell**

```powershell
git add tests/page-contract.test.mjs styles.css index.html about.html teachers.html courses.html course.html learning-path.html achievements.html activities.html knowledge.html faq.html contact.html
git commit -m "feat: unify Thien Uy conversion shell"
```

---

### Task 2: Homepage A2 conversion layout

**Files:**
- Modify: `tests/page-contract.test.mjs:86-132`
- Modify: `index.html:33-73`
- Modify: `pages.css:1514-1906`

**Interfaces:**
- Consumes: Shared tokens, header, `.btn`, `.reveal`, `.contact-form-shell`, `#register`, and exact Google Form wiring from Task 1.
- Produces: `.home-hero--a2`, `.home-facts`, `.home-programs`, `.home-method`, and `.home-evidence`, which define the homepage conversion path.

- [ ] **Step 1: Replace the old homepage shape test with the approved A2 contract**

Replace the existing “homepage is an overview” assertions in `tests/page-contract.test.mjs` with:

```js
test("homepage follows the approved A2 conversion sequence", () => {
  assert.doesNotMatch(html, /class="home-kicker"/);
  assert.match(
    html,
    /<h1[^>]*>\s*TIẾNG ANH VỮNG VÀNG -\s*<br\s*\/>?\s*<span>TƯƠNG LAI TƯƠI SÁNG<\/span>\s*<\/h1>/s,
  );
  const ids = ["trust", "featured-courses", "method", "results", "register"];
  const positions = ids.map((id) => html.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position > -1));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.equal((html.match(/class="home-program-card/g) ?? []).length, 3);
  assert.equal((html.match(/class="home-fact/g) ?? []).length, 4);
  assert.doesNotMatch(html, /class="home-bento/);
  assert.doesNotMatch(html, /id="process-heading"/);
  assert.match(section(html, "register"), />Kiểm tra trình độ miễn phí<\/h2>/);
});
```

- [ ] **Step 2: Run the homepage contract and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="homepage follows" tests/page-contract.test.mjs
```

Expected: FAIL because the current hero still has `.home-kicker`, the H1 uses sentence case, and the current homepage has more repeated sections.

- [ ] **Step 3: Recompose `index.html` into the six approved blocks**

Use this exact hero opening and keep the current hero image attributes:

```html
<section class="home-hero home-hero--a2" aria-labelledby="home-heading">
  <div class="wrap home-hero__grid">
    <div class="home-hero__copy">
      <h1 class="home-title" id="home-heading">
        TIẾNG ANH VỮNG VÀNG -<br />
        <span>TƯƠNG LAI TƯƠI SÁNG</span>
      </h1>
      <p>Hơn 10 năm đồng hành cùng học viên từ nền tảng đầu đời đến Cambridge, IELTS và các kỳ thi chuyển cấp.</p>
      <div class="page-actions">
        <a class="btn btn-accent btn-lg" href="#register">Kiểm tra trình độ miễn phí</a>
        <a class="btn btn-ghost btn-lg" href="courses.html">Khám phá khóa học</a>
      </div>
    </div>
    <figure class="home-hero__visual reveal">
      <img src="images/hero.jpg" alt="Giáo viên Thien Uy hướng dẫn học viên trong lớp tiếng Anh" width="1279" height="720" fetchpriority="high" decoding="async" />
    </figure>
  </div>
</section>
```

Create these sections in order:

```html
<section class="home-trust" id="trust" aria-label="Thông tin tổng quan"></section>
<section class="page-section page-section--soft" id="featured-courses" aria-labelledby="courses-heading"></section>
<section class="page-section" id="method" aria-labelledby="method-heading"></section>
<section class="page-section page-section--soft" id="results" aria-labelledby="results-heading"></section>
<section class="page-section home-register" id="register" aria-labelledby="register-heading"></section>
```

Populate `.home-facts` with the verified values `10+`, `1.000+`, `11`, and `71`. Populate exactly three asymmetric `.home-program-card` links for `Happy Kids`, `Cambridge`, and `IELTS, chuyển cấp, đại học`. Keep the current three teaching-principle strings and the verified result breakdown `28`, `11`, `8`, and `24`. Move the existing form element byte-for-byte into the new `#register` section so its endpoint, mappings, IDs, honeypot, status region, and field order remain unchanged.

- [ ] **Step 4: Replace the old homepage CSS with compact A2 rules**

Delete the old `.home-kicker`, `.home-hero__badge`, `.home-bento*`, repeated `.home-split*`, and four-card process rules. Build from this layout:

```css
.home-hero--a2 {
  padding: clamp(32px, 4vw, 60px) 0;
  background: linear-gradient(150deg, var(--surface) 0%, var(--brand-wash) 100%);
}

.home-hero__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(440px, 1.12fr);
  gap: clamp(28px, 4.8vw, 64px);
  align-items: center;
}

.home-title {
  max-width: 14ch;
  color: var(--brand-ink);
  font-family: "Baloo 2", sans-serif;
  font-size: clamp(2.55rem, 1.8rem + 3.3vw, 5.2rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}

.home-title span {
  color: var(--accent-ink);
}

.home-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-block: 1px solid var(--line);
}

.home-programs {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 0.9fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .home-hero__grid,
  .home-programs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .home-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 5: Run homepage, form, and link tests**

Run:

```powershell
node --test tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: PASS. Form success, validation, honeypot, internal links, image dimensions, and homepage sequence remain green.

- [ ] **Step 6: Commit the homepage**

```powershell
git add tests/page-contract.test.mjs index.html pages.css
git commit -m "feat: build A2 conversion homepage"
```

---

### Task 3: Story and teaching-team page family

**Files:**
- Modify: `tests/website-pages.test.mjs:78-101`
- Modify: `about.html:96-230`
- Modify: `teachers.html:17-22`
- Modify: `pages.css:241-323`
- Modify: `pages.css:961-1065`

**Interfaces:**
- Consumes: `.page-hero`, `.page-section`, `.page-cta`, `.reveal`, and the shared CTA shell.
- Produces: `#team`, `.team-evidence`, `.teaching-practice-list`, and `.teaching-practice-row` for the story and team family.

- [ ] **Step 1: Write the new story-family contract**

Replace the old profile-count assertions in `tests/website-pages.test.mjs` with:

```js
test("about and teachers form one concise story and team family", () => {
  const about = pages.get("about.html");
  const teachers = pages.get("teachers.html");

  assert.match(about, /id="team"/);
  assert.equal((about.match(/class="team-evidence/g) ?? []).length, 2);
  assert.match(about, /href="teachers\.html"/);
  assert.equal((teachers.match(/class="teaching-practice-row/g) ?? []).length, 3);
  assert.doesNotMatch(teachers, /class="teacher-profile/);
  assert.match(teachers, /Hồ sơ đội ngũ đang được trung tâm xác nhận/);
  assert.doesNotMatch(teachers, /ThS\.|Tiến sĩ|IELTS 9\.0|CELTA|TESOL/);
});
```

Also add `teachers.html` to `pageNames` in that test file.

- [ ] **Step 2: Run the story-family contract and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="concise story" tests/website-pages.test.mjs
```

Expected: FAIL because `about.html` has no `#team` and `teachers.html` still uses two profile cards.

- [ ] **Step 3: Recompose `about.html` and `teachers.html`**

Keep `about.html` focused on four compact sections: hero, story, teaching principles, and team evidence. Use this team section after the principles:

```html
<section class="page-section" id="team" aria-labelledby="team-heading">
  <div class="wrap">
    <div class="page-section__head">
      <h2 class="h2" id="team-heading">Người đồng hành trong từng chặng tiến bộ</h2>
      <p class="lead">Giáo viên quan sát điểm bắt đầu, tạo cơ hội thực hành và theo dõi tiến bộ trong từng giai đoạn.</p>
    </div>
    <div class="team-evidence-grid">
      <figure class="team-evidence reveal">
        <img src="images/about-teacher-1.jpg" alt="Giáo viên hướng dẫn học viên trong lớp tiếng Anh" width="1276" height="956" loading="lazy" decoding="async" />
      </figure>
      <figure class="team-evidence reveal">
        <img src="images/about-teacher-2.jpg" alt="Giáo viên tổ chức hoạt động nhóm trong lớp" width="1276" height="956" loading="lazy" decoding="async" />
      </figure>
    </div>
    <a class="text-action" href="teachers.html">Tìm hiểu cách giáo viên đồng hành</a>
  </div>
</section>
```

Turn `teachers.html` into a concise support page with exactly three rows titled `Hiểu điểm bắt đầu`, `Tạo cơ hội sử dụng`, and `Theo dõi tiến bộ`. Replace pseudo-profile cards with one verification note containing the exact sentence `Hồ sơ đội ngũ đang được trung tâm xác nhận trước khi công bố tên, chứng chỉ và kinh nghiệm.` Keep both teacher images and the primary placement-test CTA.

- [ ] **Step 4: Add compact story-family CSS**

```css
.team-evidence-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 16px;
}

.team-evidence img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--r-lg);
}

.teaching-practice-list {
  border-top: 1px solid var(--line);
}

.teaching-practice-row {
  display: grid;
  grid-template-columns: minmax(180px, 0.7fr) minmax(0, 1.3fr);
  gap: 24px;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}

@media (max-width: 680px) {
  .team-evidence-grid,
  .teaching-practice-row {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run page-family and asset tests**

Run:

```powershell
node --test tests/website-pages.test.mjs tests/page-contract.test.mjs
```

Expected: PASS. Images remain local and dimensioned, no credentials are fabricated, and all links resolve.

- [ ] **Step 6: Commit the story family**

```powershell
git add tests/website-pages.test.mjs about.html teachers.html pages.css
git commit -m "feat: refine story and teaching team pages"
```

---

### Task 4: Program catalog, course detail, and learning roadmap

**Files:**
- Modify: `tests/website-pages.test.mjs:103-132`
- Modify: `tests/page-contract.test.mjs:150-176`
- Modify: `courses.html:83-257`
- Modify: `course.html:46-92`
- Modify: `learning-path.html:15-21`
- Modify: `pages.css:405-607`
- Modify: `pages.css:1067-1117`
- Verify unchanged: `pages.js`
- Verify unchanged: `course-detail.js`

**Interfaces:**
- Consumes: Existing `[data-filter-group]`, `[data-filter-item]`, `[data-filter-value]`, `[data-course-*]`, `data-results`, and result-modal script order.
- Produces: `.program-layout`, `.learning-roadmap`, and `.enrollment-steps` while retaining all eleven course slugs and all verified result entry points.

- [ ] **Step 1: Add the approved program-family structure tests**

Extend the course tests with:

```js
test("program pages use the compact catalog and roadmap family", () => {
  const catalog = pages.get("courses.html");
  const path = pages.get("learning-path.html");
  const detail = pages.get("course.html");

  assert.match(catalog, /class="program-layout"/);
  assert.equal((catalog.match(/class="catalog-card reveal/g) ?? []).length, 11);
  assert.equal((catalog.match(/class="filter-button"/g) ?? []).length, 4);
  assert.equal((path.match(/class="learning-roadmap__item/g) ?? []).length, 7);
  assert.equal((path.match(/class="enrollment-step/g) ?? []).length, 4);
  assert.doesNotMatch(path, /class="content-grid"/);
  assert.match(detail, /href="contact\.html#register"[^>]*>Kiểm tra trình độ miễn phí<\/a>/);
});
```

Add `course.html` and `learning-path.html` to the test file's `pageNames` list.

- [ ] **Step 2: Run the new program-family test and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="compact catalog" tests/website-pages.test.mjs
```

Expected: FAIL because the current catalog has no `.program-layout`, the path still uses `.journey-step`, and enrollment uses generic cards.

- [ ] **Step 3: Recompose the course catalog without changing data hooks**

Wrap the existing filter bar and catalog grid in `.program-layout`. Keep all eleven `.catalog-card` nodes, their exact `data-course`, `data-filter-item`, `data-results`, links, images, and verified text. Use a compact intro rail beside the filter and let cards use varied spans through `:nth-child` rules rather than adding empty cells.

Keep `course.html` data-binding attributes unchanged. Shorten the static layout to hero, course selector, outcomes/content, verified information, and one final CTA whose anchor is:

```html
<a class="btn btn-accent btn-lg" href="contact.html#register">Kiểm tra trình độ miễn phí</a>
```

Replace the current journey markup with this semantic roadmap, retaining all seven links:

```html
<ol class="learning-roadmap" aria-label="Lộ trình khóa học chính">
  <li class="learning-roadmap__item"><a href="course.html?course=happy-kids"><strong>Happy Kids</strong><span>Lớp 2 trở xuống</span></a></li>
  <li class="learning-roadmap__item"><a href="course.html?course=starter"><strong>Starter</strong><span>Lớp 3</span></a></li>
  <li class="learning-roadmap__item"><a href="course.html?course=movers"><strong>Movers</strong><span>Lớp 4</span></a></li>
  <li class="learning-roadmap__item"><a href="course.html?course=flyers"><strong>Flyers</strong><span>Lớp 5</span></a></li>
  <li class="learning-roadmap__item"><a href="course.html?course=ket"><strong>KET</strong><span>Lớp 6 - 7</span></a></li>
  <li class="learning-roadmap__item"><a href="course.html?course=pet"><strong>PET</strong><span>Lớp 8 - 9</span></a></li>
  <li class="learning-roadmap__item"><a href="course.html?course=ielts"><strong>IELTS</strong><span>Từ lớp 10</span></a></li>
</ol>
```

Build the four enrollment steps as one `.enrollment-steps` sequence with `.enrollment-step` children titled `Liên hệ tư vấn`, `Kiểm tra trình độ`, `Xếp lớp phù hợp`, and `Học và theo sát`.

- [ ] **Step 4: Implement compact program-family layouts**

```css
.program-layout {
  display: grid;
  grid-template-columns: minmax(220px, 0.28fr) minmax(0, 0.72fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: start;
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.catalog-card {
  grid-column: span 6;
}

.catalog-card:nth-child(1),
.catalog-card:nth-child(7) {
  grid-column: span 12;
}

.learning-roadmap {
  display: grid;
  grid-template-columns: repeat(7, minmax(150px, 1fr));
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.learning-roadmap__item {
  min-width: 150px;
  border-right: 1px solid var(--line);
  scroll-snap-align: start;
}

.enrollment-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-block: 1px solid var(--line);
}

@media (max-width: 900px) {
  .program-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .catalog-card,
  .catalog-card:nth-child(1),
  .catalog-card:nth-child(7) {
    grid-column: 1 / -1;
  }

  .enrollment-steps {
    grid-template-columns: 1fr 1fr;
  }
}
```

- [ ] **Step 5: Run program, filter, detail, and result tests**

Run:

```powershell
node --test tests/website-pages.test.mjs tests/page-contract.test.mjs tests/page-behavior.test.mjs tests/results-modal.test.mjs
```

Expected: PASS. The filter remains keyboard-accessible, eleven course records bind correctly, result buttons open the modal, and learning-path links resolve.

- [ ] **Step 6: Commit the program family**

```powershell
git add tests/website-pages.test.mjs tests/page-contract.test.mjs courses.html course.html learning-path.html pages.css
git commit -m "feat: redesign program and learning path pages"
```

---

### Task 5: Evidence, activities, and knowledge family

**Files:**
- Modify: `tests/website-pages.test.mjs:134-149`
- Modify: `tests/page-contract.test.mjs:178-240`
- Modify: `achievements.html:73-171`
- Modify: `activities.html:15-20`
- Modify: `knowledge.html:15-22`
- Modify: `pages.css:609-725`
- Modify: `pages.css:1119-1276`
- Verify unchanged: `results-data.js`
- Verify unchanged: `results-modal.js`
- Verify unchanged: `pages.js`

**Interfaces:**
- Consumes: Existing result totals, `data-results`, `data-filter-item`, `.gal`, lightbox markup, local activity images, and knowledge anchors.
- Produces: `.evidence-summary`, `.activity-story`, `.knowledge-feature`, and `.knowledge-link-card` layouts.

- [ ] **Step 1: Add evidence-family structure contracts**

Add `activities.html` and `knowledge.html` to `tests/website-pages.test.mjs`, then add:

```js
test("evidence and community pages prioritize real assets over generic cards", () => {
  const achievements = pages.get("achievements.html");
  const activities = pages.get("activities.html");
  const knowledge = pages.get("knowledge.html");

  assert.match(achievements, /class="evidence-summary"/);
  assert.equal((achievements.match(/data-results="(?:ket|pet|ielts|ts10)"/g) ?? []).length, 4);
  assert.equal((activities.match(/class="gallery-item gal reveal/g) ?? []).length, 5);
  assert.match(activities, /class="activity-story"/);
  assert.doesNotMatch(activities, /class="content-grid"/);
  assert.equal((knowledge.match(/class="knowledge-feature/g) ?? []).length, 1);
  assert.equal((knowledge.match(/class="knowledge-link-card/g) ?? []).length, 2);
});
```

- [ ] **Step 2: Run the evidence-family test and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="real assets" tests/website-pages.test.mjs
```

Expected: FAIL because current pages use generic equal-card grids and do not have the new family classes.

- [ ] **Step 3: Recompose the three evidence pages**

For `achievements.html`, preserve the `71` total, `28`, `11`, `8`, and `24` breakdown, all four `data-results` buttons, filter hooks, redacted images, modal markup, and script order. Build one `.evidence-summary` with the total and privacy statement, followed by an asymmetric four-cell result grid.

For `activities.html`, remove the three equal `.content-card` blocks. Replace them with one `.activity-story` that uses the existing three approved ideas as three short text segments beside `images/g1.jpg`. Keep all five gallery figures, their `tabindex`, `role`, `aria-label`, image attributes, and captions unchanged.

For `knowledge.html`, make `Cambridge theo khối lớp hay theo năng lực?` the single `.knowledge-feature`. Render `Chuẩn bị gì cho buổi kiểm tra trình độ?` and `Ba dấu hiệu cho thấy con đang tiến bộ` as two `.knowledge-link-card` links. Keep the three full article anchors `#cambridge`, `#placement`, and `#progress`, but reduce repeated labels above headings.

- [ ] **Step 4: Implement evidence-family CSS**

```css
.evidence-summary {
  display: grid;
  grid-template-columns: minmax(180px, 0.34fr) minmax(0, 0.66fr);
  gap: 28px;
  align-items: end;
  padding: 24px;
  border-radius: var(--r-lg);
  background: var(--brand);
  color: var(--on-brand);
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.achievement-card {
  grid-column: span 5;
}

.achievement-card:nth-child(1),
.achievement-card:nth-child(4) {
  grid-column: span 7;
}

.activity-story {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 24px;
  align-items: stretch;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.65fr);
  gap: 16px;
}

.knowledge-feature {
  grid-row: span 2;
}

@media (max-width: 680px) {
  .evidence-summary,
  .activity-story,
  .knowledge-grid {
    grid-template-columns: 1fr;
  }

  .achievement-card,
  .achievement-card:nth-child(1),
  .achievement-card:nth-child(4) {
    grid-column: 1 / -1;
  }
}
```

- [ ] **Step 5: Run evidence, privacy, gallery, and filter regressions**

Run:

```powershell
node --test tests/website-pages.test.mjs tests/page-contract.test.mjs tests/page-behavior.test.mjs tests/results-modal.test.mjs
```

Expected: PASS. Result totals, private-name protection, keyboard lightbox, result modal, filter state, local images, and link resolution remain green.

- [ ] **Step 6: Commit the evidence family**

```powershell
git add tests/website-pages.test.mjs tests/page-contract.test.mjs achievements.html activities.html knowledge.html pages.css
git commit -m "feat: strengthen evidence and community pages"
```

---

### Task 6: Contact conversion center and FAQ support

**Files:**
- Modify: `tests/page-contract.test.mjs:111-149,207-220`
- Modify: `tests/website-pages.test.mjs:151-180`
- Modify: `contact.html:15-29`
- Modify: `faq.html:15-28`
- Modify: `pages.css:1277-1468`

**Interfaces:**
- Consumes: Exact form wiring, `#register`, `.field`, `.field-error`, `.field-hint`, `.field-trap`, `[data-form-status]`, map URL, contact channels, and eight verified FAQ items.
- Produces: `.contact-conversion`, `.contact-channels`, and `.contact-faq` with four highlighted questions beside the full form.

- [ ] **Step 1: Add contact and FAQ structure contracts**

Extend the contact test with:

```js
test("contact page puts the form first and answers the four key objections", () => {
  const contact = pages.get("contact.html");
  const faq = pages.get("faq.html");
  const contactFormAt = contact.indexOf('id="register"');
  const mapAt = contact.indexOf('id="map"');

  assert.ok(contactFormAt > -1 && mapAt > contactFormAt);
  assert.match(contact, /class="contact-conversion"/);
  assert.equal((contact.match(/<details class="faq-item"/g) ?? []).length, 4);
  assert.equal((faq.match(/<details class="faq-item"/g) ?? []).length, 8);
  for (const question of [
    "Trung tâm có những khóa học nào?",
    "Con chưa từng học tiếng Anh thì bắt đầu từ đâu?",
    "Trước khi vào lớp con có được kiểm tra trình độ không?",
    "Thời lượng, lịch học và sĩ số mỗi lớp như thế nào?",
  ]) {
    assert.ok(contact.includes(question));
  }
});
```

Add `contact.html` and `faq.html` to `tests/website-pages.test.mjs` if Task 4 or Task 5 has not already added them.

- [ ] **Step 2: Run the contact contract and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="form first" tests/website-pages.test.mjs
```

Expected: FAIL because the current contact page has no `#map`, `.contact-conversion`, or embedded FAQ block.

- [ ] **Step 3: Recompose contact and FAQ content**

In `contact.html`, put the form and channel stack in the first section after the compact hero:

```html
<section class="page-section" id="register" aria-labelledby="register-heading">
  <div class="wrap contact-conversion">
    <div class="contact-form-shell"></div>
    <aside class="contact-channels" aria-label="Kênh tư vấn"></aside>
  </div>
</section>
```

Move the existing form markup unchanged into `.contact-form-shell`. Move hotline, Zalo, email, address, and hours into `.contact-channels`. Copy the first four verified FAQ `<details>` nodes from `faq.html` into a new `.contact-faq` section after the form. Add `id="map"` to the existing map section and keep its iframe title, URL, lazy loading, and external directions link.

Keep all eight FAQ items on `faq.html`, but remove its decorative eyebrow and use `Kiểm tra trình độ miễn phí` for the final primary CTA. Preserve the link to Zalo as the secondary action.

- [ ] **Step 4: Implement form-first contact CSS and complete state styling**

```css
.contact-conversion {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 24px;
  align-items: start;
}

.contact-channels {
  display: grid;
  gap: 12px;
}

.contact-faq {
  max-width: 900px;
  margin-inline: auto;
}

.field.has-error input,
.field.has-error select,
.field.has-error textarea {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger) 18%, transparent);
}

[data-form-status][data-tone="success"] {
  color: var(--brand-strong);
  background: var(--brand-tint);
}

[data-form-status][data-tone="error"] {
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 8%, var(--surface));
}

@media (max-width: 900px) {
  .contact-conversion {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Run contact, form, link, and metadata tests**

Run:

```powershell
node --test tests/page-contract.test.mjs tests/website-pages.test.mjs tests/page-behavior.test.mjs
```

Expected: PASS. Both forms retain exact mappings, all contact channels remain verified, map and hash links resolve, and form behavior remains unchanged.

- [ ] **Step 6: Commit contact and FAQ**

```powershell
git add tests/page-contract.test.mjs tests/website-pages.test.mjs contact.html faq.html pages.css
git commit -m "feat: focus contact and FAQ on conversion"
```

---

### Task 7: Accessibility, density, copy, and interaction hardening

**Files:**
- Modify: `tests/page-contract.test.mjs:221-279`
- Modify: `tests/page-behavior.test.mjs:485-540`
- Modify: `styles.css:300-421,1190-1260,1930-2323`
- Modify: `pages.css:769-936,1469-1506,1840-1906`
- Modify: all eleven HTML files where the eyebrow budget or CTA copy test identifies violations
- Verify unchanged unless a behavior test fails: `script.js`

**Interfaces:**
- Consumes: Final markup from Tasks 1 through 6 and all existing interaction hooks.
- Produces: Mechanical eyebrow budget, visible focus, reduced-motion coverage, form retry regression, compact mobile layout, and clean visible copy.

- [ ] **Step 1: Add failing quality contracts**

Add these tests to `tests/page-contract.test.mjs`:

```js
test("limits eyebrow labels and uses one primary CTA label", () => {
  for (const [name, source] of pages) {
    const sectionCount = (source.match(/<section\b/g) ?? []).length;
    const eyebrowCount = (source.match(/class="[^"]*section-label[^"]*"/g) ?? []).length;
    assert.ok(eyebrowCount <= Math.ceil(sectionCount / 3), `${name}: ${eyebrowCount} eyebrows for ${sectionCount} sections`);

    const primaryLabels = [...source.matchAll(/class="[^"]*btn-accent[^"]*"[^>]*>([^<]+)<\/a>/g)]
      .map((match) => match[1].trim())
      .filter((label) => /kiểm tra|đăng ký|tư vấn/i.test(label));
    assert.ok(primaryLabels.every((label) => label === "Kiểm tra trình độ miễn phí"), `${name}: inconsistent primary CTA`);
  }
});

test("keeps the approved compact responsive and motion rules", () => {
  const allCss = `${css}\n${pageCss}`;
  assert.doesNotMatch(allCss, /@media\s*\(prefers-color-scheme:\s*dark\)/);
  assert.doesNotMatch(allCss, /height:\s*100vh|h-screen/);
  assert.match(allCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(allCss, /:focus-visible/);
  assert.match(allCss, /\.mobile-action-bar/);
});
```

Add this behavior regression after the form success test in `tests/page-behavior.test.mjs`:

```js
test("registration failure keeps entered data and restores the submit button", async () => {
  const fixture = createRegistrationFixture({ fetchResult: Promise.reject(new Error("offline")) });
  fixture.fields.name.input.value = "Nguyễn Văn A";
  fixture.fields.phone.input.value = "0912345678";
  fixture.fields.child.input.value = "Bé An";
  fixture.fields.grade.input.value = "Lớp 4";

  fixture.form.dispatch("submit");
  await flushPromises();

  assert.equal(fixture.resetCount, 0);
  assert.equal(fixture.fields.name.input.value, "Nguyễn Văn A");
  assert.equal(fixture.status.getAttribute("data-tone"), "error");
  assert.equal(fixture.submit.getAttribute("aria-busy"), null);
  assert.equal(fixture.submit.textContent, "Gửi đăng ký");
});
```

- [ ] **Step 2: Run the quality contracts and observe the failures**

Run:

```powershell
node --test --test-name-pattern="eyebrow|compact responsive|registration failure" tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: The eyebrow or CTA test fails until all page copy is normalized. The registration failure test should pass against current JavaScript; if it fails, the failure identifies the only permitted `script.js` change.

- [ ] **Step 3: Normalize labels, focus, reduced motion, and mobile density**

Remove decorative `.section-label` nodes until each page meets the mechanical budget. Keep only labels that clarify a genuinely ambiguous section. Change every conversion-intent `.btn-accent` label to `Kiểm tra trình độ miễn phí`; leave result-modal buttons, filter buttons, and non-conversion actions unchanged.

Add or consolidate these shared rules:

```css
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: 3px solid color-mix(in srgb, var(--accent) 72%, white);
  outline-offset: 3px;
}

@media (max-width: 680px) {
  .page-section,
  .section {
    padding-block: var(--section-y-mobile);
  }

  input,
  select,
  textarea {
    font-size: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .js .reveal {
    opacity: 1;
    transform: none;
  }
}
```

If the new rejection test passes, leave `script.js` byte-for-byte unchanged. If it fails, change only the form rejection/finalization branch so `regForm.reset()` occurs exclusively in the success branch and the submit label is restored in `.finally()`.

- [ ] **Step 4: Run the complete automated suite**

Run:

```powershell
node --test tests/page-contract.test.mjs tests/website-pages.test.mjs tests/page-behavior.test.mjs tests/results-modal.test.mjs
python -m unittest tools.test_redact_results
```

Expected: All Node tests pass and all Python image-tool tests pass.

- [ ] **Step 5: Perform the first responsive interaction pass**

Run:

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

At `http://127.0.0.1:5500/`, inspect `index.html`, `courses.html`, `course.html?course=ket`, `achievements.html`, `activities.html`, and `contact.html` at widths `360`, `390`, `768`, `1024`, `1440`, and `1920`. Verify:

- No body-level horizontal scroll.
- Header never wraps to two lines.
- Mobile action bar does not cover the final focusable element.
- H1 Vietnamese marks are not clipped.
- Primary buttons remain legible and do not wrap on desktop.
- Gallery, result modal, filter buttons, menu, and form are keyboard operable.
- Reduced motion reveals all content immediately.

- [ ] **Step 6: Commit quality hardening**

Stage `script.js` only if the new rejection test required a change.

```powershell
git add tests/page-contract.test.mjs tests/page-behavior.test.mjs styles.css pages.css index.html about.html teachers.html courses.html course.html learning-path.html achievements.html activities.html knowledge.html faq.html contact.html
git commit -m "fix: harden responsive accessibility and conversion copy"
```

---

### Task 8: Cache versions, SEO, final verification, and pre-flight

**Files:**
- Modify: `tests/page-contract.test.mjs:1-279`
- Modify: all eleven HTML `<head>` and closing script blocks
- Verify: `sitemap.xml`
- Verify: `styles.css`
- Verify: `pages.css`
- Verify: `script.js`
- Verify: `pages.js`
- Verify: `course-detail.js`
- Verify: `results-modal.js`
- Verify: `results-data.js`

**Interfaces:**
- Consumes: Every completed task and the existing deployment model.
- Produces: One consistent asset version, green automated tests, clean diff, and completed visual pre-flight.

- [ ] **Step 1: Add the cache-version and route-finalization tests**

Add to `tests/page-contract.test.mjs`:

```js
test("all pages publish the final Professional Compact asset versions", () => {
  for (const [name, source] of pages) {
    assert.match(source, /href="styles\.css\?v=20260828-professional-compact"/, `${name} styles version`);
    assert.match(source, /href="pages\.css\?v=20260828-professional-compact"/, `${name} pages version`);
    assert.match(source, /src="script\.js\?v=20260828-professional-compact"/, `${name} script version`);
  }
});

test("all routes retain canonical metadata and valid structured data", () => {
  for (const [name, source] of pages) {
    const canonical = name === "index.html"
      ? "https://thienuy.edu.vn/"
      : `https://thienuy.edu.vn/${name}`;
    const jsonBlocks = [...source.matchAll(
      /<script type="application\/ld\+json"(?: id="[^"]+")?>([\s\S]*?)<\/script>/g,
    )];

    assert.match(source, /<title>[^<]+<\/title>/, `${name} title`);
    assert.match(
      source,
      /<meta name="description" content="[^"]+"\s*\/?>/,
      `${name} description`,
    );
    assert.ok(
      source.includes(`<link rel="canonical" href="${canonical}" />`),
      `${name} canonical`,
    );
    assert.ok(jsonBlocks.length > 0, `${name} structured data`);

    for (const [, json] of jsonBlocks) {
      assert.doesNotThrow(() => JSON.parse(json), `${name} structured data JSON`);
    }
  }
});
```

- [ ] **Step 2: Run the version test and confirm it fails**

Run:

```powershell
node --test --test-name-pattern="asset versions" tests/page-contract.test.mjs
```

Expected: the asset-version test FAILS because pages still use the earlier `20260806` and `20260820` cache keys. The metadata test PASSES before the redesign and protects canonical URLs, descriptions, and JSON-LD while `<head>` blocks are updated.

- [ ] **Step 3: Update cache keys without changing script order**

In all eleven HTML files, use:

```html
<link rel="stylesheet" href="styles.css?v=20260828-professional-compact" />
<link rel="stylesheet" href="pages.css?v=20260828-professional-compact" />
<script src="script.js?v=20260828-professional-compact" defer></script>
```

Keep `results-data.js` before `results-modal.js`, and both before `script.js`, on `courses.html`, `course.html`, and `achievements.html`. Keep `course-detail.js` before `script.js` on `course.html`. Keep `pages.js` after `script.js` where filter pages currently load it.

- [ ] **Step 4: Run final automated verification**

Run:

```powershell
node --test tests/page-contract.test.mjs tests/website-pages.test.mjs tests/page-behavior.test.mjs tests/results-modal.test.mjs
python -m unittest tools.test_redact_results
git diff --check
git status --short
```

Expected: all tests pass, `git diff --check` prints no errors, and `git status --short` lists only intentional files plus unrelated user-owned changes that were present before execution.

- [ ] **Step 5: Run the final design-taste pre-flight**

Check every public page against these exact conditions:

- One light theme, one blue brand color, and one orange accent.
- No “Anh ngữ tại An Phú” eyebrow above the homepage H1.
- Homepage H1 uses the exact approved two-line copy.
- Section label count is within one per three sections.
- No three equal feature cards on the homepage, activities, or knowledge pages.
- No three consecutive split image/text sections.
- No duplicate conversion CTA labels.
- Every hero uses a real local image and keeps CTA visible in the first viewport.
- Desktop nav stays on one line and under `80px` high.
- Buttons pass contrast, stay on one line at desktop, and expose hover, active, focus, and busy states.
- Forms expose label, hint, error, busy, success, and retry states.
- Motion is visible at level 4, motivated, reduced-motion safe, and limited to transform and opacity.
- Mobile layouts collapse explicitly and the fixed action bar remains usable.
- Core Web Vitals risks are controlled: hero preloaded, image space reserved, no large backdrop filters, and no new network dependencies.

- [ ] **Step 6: Commit the deployment-ready result**

```powershell
git add tests/page-contract.test.mjs index.html about.html teachers.html courses.html course.html learning-path.html achievements.html activities.html knowledge.html faq.html contact.html
git commit -m "chore: finalize Professional Compact website"
```

- [ ] **Step 7: Record the handoff evidence**

In the implementation handoff, report:

- Final Node and Python test counts.
- Viewports checked.
- Whether `script.js` remained unchanged.
- Exact files modified.
- Any pre-existing user changes intentionally left untouched.
- Any visual check that could not run because a browser was unavailable.
