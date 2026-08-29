# Course Learning Path Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four generic course cards with an accessible seven-course photo carousel ordered from Happy Kids through IELTS.

**Architecture:** Keep the existing static HTML/CSS/JavaScript stack. The course content remains semantic HTML, CSS provides a native horizontal scroll-snap track, and a small JavaScript enhancement adds previous/next controls without becoming required for access to the content.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node.js built-in test runner, imagegen-generated JPG assets.

## Global Constraints

- Follow the approved spec at `docs/superpowers/specs/2026-07-22-course-learning-path-carousel-design.md`.
- Preserve `#courses`, all other anchors, navigation, contact details, logo, menu behavior and lightbox behavior.
- Replace the four generic course cards. Do not append the seven new cards beneath them.
- Course order is exactly Happy Kids, Starter, Movers, Flyers, KET, PET, IELTS.
- Grade mapping is exactly: lớp 2 trở xuống, lớp 3, lớp 4, lớp 5, lớp 6-7, lớp 8-9, từ lớp 10.
- Keep the existing light page theme, blue/orange brand palette, 12px card radius and low-motion behavior.
- Do not add frameworks, packages, CDNs, APIs or a build step.
- Do not place text over course images and do not create fake logos or readable brand marks inside generated images.
- Visible page copy must contain no em dash or en dash characters.
- Use `apply_patch` for source and test edits.
- `D:\Nancy\Web` is not currently a Git repository. Do not run commit commands unless the user initializes Git first.
- Current baseline has two stale About contract failures. Task 1 restores those assertions to the already-approved vertical gallery behavior without changing About production markup or CSS.

---

### Task 1: Restore the Existing Test Baseline

**Files:**
- Modify: `tests/page-contract.test.mjs:97-183`
- Reference: `docs/superpowers/specs/2026-07-22-about-vertical-feature-gallery-design.md`
- Verify only: `index.html:121-178`
- Verify only: `styles.css:246-308`

**Interfaces:**
- Consumes: Current About markup with two `.about-feature` blocks and three gallery images.
- Produces: A green 13-test baseline before any course behavior is introduced.

- [ ] **Step 1: Confirm the known baseline failures**

Run:

```powershell
node --test
```

Expected: 13 tests run, 11 pass and these 2 fail:

```text
image loading preserves layout and prioritizes the hero
about section uses the approved compact two-row feature layout
```

- [ ] **Step 2: Replace the brittle image-count assertion**

Replace the existing `image loading preserves layout and prioritizes the hero` test with:

```js
test("image loading preserves layout and prioritizes the hero", () => {
  assert.match(
    html,
    /<img src="images\/hero\.jpg"[^>]*width="2048"[^>]*height="1152"[^>]*fetchpriority="high"[^>]*decoding="async"/,
  );

  const allImages = html.match(/<img\b/g) ?? [];
  const lazyImages =
    html.match(/<img\b[^>]*loading="lazy" decoding="async"/g) ?? [];

  assert.equal(lazyImages.length, allImages.length - 1);
});
```

This keeps the hero eager while allowing the approved course images to be added later without changing a global magic number.

- [ ] **Step 3: Restore the approved About gallery contract**

Replace the stale `about section uses the approved compact two-row feature layout` test with:

```js
test("about section uses the approved two-block vertical feature gallery", async () => {
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
  assert.doesNotMatch(about, /<h3>Quan tâm sát sao học viên<\/h3>/);

  for (const source of [
    "images/about-teacher-1.jpg",
    "images/about-teacher-2.jpg",
    "images/about-program.jpg",
  ]) {
    assert.ok(about.includes(source), `missing About image source: ${source}`);
    await access(new URL(`../${source}`, import.meta.url));
  }

  const teacherGallery = about.match(
    /<div class="about-feature__gallery about-feature__gallery--teacher">([\s\S]*?)<\/div>/,
  );
  assert.ok(teacherGallery, "missing teacher gallery");
  assert.equal((teacherGallery[1].match(/<img /g) ?? []).length, 2);

  const programGallery = about.match(
    /<div class="about-feature__gallery">([\s\S]*?)<\/div>/,
  );
  assert.ok(programGallery, "missing program gallery");
  assert.equal((programGallery[1].match(/<img /g) ?? []).length, 1);

  assert.match(
    css,
    /\.about-feature__gallery--teacher\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s,
  );
  assert.match(
    css,
    /@media \(max-width:\s*767px\)[\s\S]*?\.about-feature__gallery--teacher\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.match(
    css,
    /\.about-feature__image\s*\{[^}]*width:\s*100%[^}]*aspect-ratio:\s*4\s*\/\s*3[^}]*object-fit:\s*cover/s,
  );
});
```

- [ ] **Step 4: Run the restored baseline**

Run:

```powershell
node --test
```

Expected: 13 tests pass, 0 fail.

- [ ] **Step 5: Record the checkpoint**

Confirm the only modified file is `tests/page-contract.test.mjs`. Do not commit because this workspace has no Git repository.

---

### Task 2: Build the Static Seven-Course Carousel with Generated Photos

**Files:**
- Create: `images/course-happy-kids.jpg`
- Create: `images/course-starter.jpg`
- Create: `images/course-movers.jpg`
- Create: `images/course-flyers.jpg`
- Create: `images/course-ket.jpg`
- Create: `images/course-pet.jpg`
- Create: `images/course-ielts.jpg`
- Modify: `tests/page-contract.test.mjs`
- Modify: `index.html:179-227`
- Modify: `styles.css:310-323`
- Modify: `styles.css:455-503`

**Interfaces:**
- Consumes: Existing `.section-title`, `.wrap`, blue/orange CSS tokens and global focus/reduced-motion rules.
- Produces: `[data-course-carousel]`, `[data-course-track]`, `[data-course-controls]`, `[data-course-prev]`, `[data-course-next]` for Task 3.
- Produces: Seven `.course-card[data-course]` articles in the approved order.

- [ ] **Step 1: Write the failing course contract test**

Append this test to `tests/page-contract.test.mjs`:

```js
test("course section presents the approved seven-level learning path", async () => {
  const courseStart = html.indexOf('<section class="section courses"');
  const courseEnd = html.indexOf('<section class="section activities"');
  const courses = html.slice(courseStart, courseEnd);
  const expected = [
    {
      slug: "happy-kids",
      title: "Happy Kids",
      grade: "Lớp 2 trở xuống",
      image: "images/course-happy-kids.jpg",
      alt: "Học viên nhỏ tuổi tham gia trò chơi tiếng Anh trong lớp Happy Kids",
    },
    {
      slug: "starter",
      title: "Starter",
      grade: "Lớp 3",
      image: "images/course-starter.jpg",
      alt: "Học viên lớp 3 luyện từ vựng bằng thẻ hình trong lớp Starter",
    },
    {
      slug: "movers",
      title: "Movers",
      grade: "Lớp 4",
      image: "images/course-movers.jpg",
      alt: "Học viên lớp 4 thực hành giao tiếp theo nhóm trong lớp Movers",
    },
    {
      slug: "flyers",
      title: "Flyers",
      grade: "Lớp 5",
      image: "images/course-flyers.jpg",
      alt: "Học viên lớp 5 cùng luyện đọc và viết trong lớp Flyers",
    },
    {
      slug: "ket",
      title: "KET",
      grade: "Lớp 6-7",
      image: "images/course-ket.jpg",
      alt: "Học viên lớp 6 và lớp 7 luyện nói theo cặp trong khóa KET",
    },
    {
      slug: "pet",
      title: "PET",
      grade: "Lớp 8-9",
      image: "images/course-pet.jpg",
      alt: "Học viên lớp 8 và lớp 9 thảo luận bằng tiếng Anh trong khóa PET",
    },
    {
      slug: "ielts",
      title: "IELTS",
      grade: "Từ lớp 10",
      image: "images/course-ielts.jpg",
      alt: "Học viên trung học luyện kỹ năng học thuật trong khóa IELTS",
    },
  ];

  assert.match(
    courses,
    /<section class="section courses" id="courses" aria-labelledby="courses-heading">/,
  );
  assert.match(courses, /data-course-carousel/);
  assert.match(courses, /data-course-track/);
  assert.match(courses, /data-course-controls hidden/);

  const cards = [
    ...courses.matchAll(
      /<article class="course-card" data-course="([^"]+)">([\s\S]*?)<\/article>/g,
    ),
  ];
  assert.equal(cards.length, 7);
  assert.deepEqual(
    cards.map((card) => card[1]),
    expected.map((course) => course.slug),
  );

  for (let index = 0; index < expected.length; index += 1) {
    const course = expected[index];
    const card = cards[index][2];
    assert.ok(card.includes(`<h3>${course.title}</h3>`));
    assert.ok(card.includes(`>${course.grade}</span>`));
    assert.ok(
      card.includes(
        `<img src="${course.image}" alt="${course.alt}" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />`,
      ),
    );
    await access(new URL(`../${course.image}`, import.meta.url));
  }

  assert.match(
    css,
    /\.course-track\s*\{[^}]*display:\s*flex[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x mandatory/s,
  );
  assert.match(
    css,
    /\.course-card\s*\{[^}]*flex:\s*0 0 clamp\(300px,\s*29vw,\s*380px\)/s,
  );
  assert.match(css, /\.course-card__image\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/s);
  assert.doesNotMatch(courses, /class="cards-4"/);
  assert.doesNotMatch(courses, /class="cc-ic/);
});
```

- [ ] **Step 2: Run the new contract test and verify RED**

Run:

```powershell
node --test --test-name-pattern="course section presents" tests/page-contract.test.mjs
```

Expected: FAIL because `[data-course-carousel]`, the seven cards and the seven JPG files do not exist.

- [ ] **Step 3: Generate the seven course photographs**

Invoke the `imagegen` skill before generating assets. Generate each image directly at a 4:3 composition and save it to its exact path. Use this shared visual direction for all seven images:

```text
Photorealistic editorial classroom photograph for a Vietnamese English center landing page, 4:3 horizontal composition, natural daylight, Vietnamese students, candid engaged expressions, clean modern classroom, restrained blue orange and white palette, realistic skin and hands, age-appropriate learning materials, no readable text, no logo, no emblem, no watermark, no text overlay, no border. Keep the main students away from the extreme crop edges.
```

Add the following course-specific direction to the shared prompt:

```text
course-happy-kids.jpg: children ages 6-7 learning English through a colorful tabletop matching game with a friendly teacher.
course-starter.jpg: students age 8 practicing basic English vocabulary with picture cards and pointing to objects.
course-movers.jpg: students age 9 in a lively small-group speaking activity, taking turns and listening.
course-flyers.jpg: students age 10 reading a short English story and writing together at one table.
course-ket.jpg: students ages 11-12 practicing an A2 paired-speaking task with prompt cards.
course-pet.jpg: students ages 13-14 discussing a school topic in English and presenting an idea to classmates.
course-ielts.jpg: students ages 15-17 in a focused academic English workshop with reading notes and a speaking discussion.
```

Save the final files at 1280 x 960 pixels. Inspect every image with the local image viewer. Reject and regenerate any result with distorted faces or hands, visible brand text, fake logos, incorrect age, non-Vietnamese classroom context or embedded text.

- [ ] **Step 4: Replace the course markup**

Replace the complete `#courses` section with:

```html
  <!-- ===================== COURSES ===================== -->
  <section class="section courses" id="courses" aria-labelledby="courses-heading">
    <div class="wrap">
      <h2 class="section-title" id="courses-heading">Các khóa học <span class="accent-navy">nổi bật</span><span class="heading-line"></span></h2>
      <p class="courses-intro">Lộ trình tiếng Anh phù hợp theo từng độ tuổi và mục tiêu học tập.</p>

      <div class="course-carousel" data-course-carousel>
        <div class="course-carousel__toolbar" data-course-controls hidden>
          <button class="course-nav" type="button" data-course-prev aria-label="Xem khóa học trước">
            <span aria-hidden="true">←</span>
          </button>
          <button class="course-nav" type="button" data-course-next aria-label="Xem khóa học tiếp theo">
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div class="course-track" data-course-track tabindex="0" aria-label="Lộ trình các khóa học từ Happy Kids đến IELTS">
          <article class="course-card" data-course="happy-kids">
            <img src="images/course-happy-kids.jpg" alt="Học viên nhỏ tuổi tham gia trò chơi tiếng Anh trong lớp Happy Kids" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>Happy Kids</h3>
                <span class="course-card__grade">Lớp 2 trở xuống</span>
              </div>
              <p>Làm quen tiếng Anh qua trò chơi, âm nhạc và hoạt động tương tác.</p>
            </div>
          </article>

          <article class="course-card" data-course="starter">
            <img src="images/course-starter.jpg" alt="Học viên lớp 3 luyện từ vựng bằng thẻ hình trong lớp Starter" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>Starter</h3>
                <span class="course-card__grade">Lớp 3</span>
              </div>
              <p>Xây dựng từ vựng, mẫu câu và phản xạ giao tiếp nền tảng.</p>
            </div>
          </article>

          <article class="course-card" data-course="movers">
            <img src="images/course-movers.jpg" alt="Học viên lớp 4 thực hành giao tiếp theo nhóm trong lớp Movers" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>Movers</h3>
                <span class="course-card__grade">Lớp 4</span>
              </div>
              <p>Phát triển cân bằng nghe, nói, đọc, viết qua chủ đề gần gũi.</p>
            </div>
          </article>

          <article class="course-card" data-course="flyers">
            <img src="images/course-flyers.jpg" alt="Học viên lớp 5 cùng luyện đọc và viết trong lớp Flyers" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>Flyers</h3>
                <span class="course-card__grade">Lớp 5</span>
              </div>
              <p>Củng cố kỹ năng và chuẩn bị nền tảng cho chứng chỉ Cambridge.</p>
            </div>
          </article>

          <article class="course-card" data-course="ket">
            <img src="images/course-ket.jpg" alt="Học viên lớp 6 và lớp 7 luyện nói theo cặp trong khóa KET" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>KET</h3>
                <span class="course-card__grade">Lớp 6-7</span>
              </div>
              <p>Rèn năng lực tiếng Anh trình độ A2 và kỹ năng làm bài.</p>
            </div>
          </article>

          <article class="course-card" data-course="pet">
            <img src="images/course-pet.jpg" alt="Học viên lớp 8 và lớp 9 thảo luận bằng tiếng Anh trong khóa PET" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>PET</h3>
                <span class="course-card__grade">Lớp 8-9</span>
              </div>
              <p>Phát triển tiếng Anh trình độ B1 cho học tập và giao tiếp.</p>
            </div>
          </article>

          <article class="course-card" data-course="ielts">
            <img src="images/course-ielts.jpg" alt="Học viên trung học luyện kỹ năng học thuật trong khóa IELTS" width="1280" height="960" loading="lazy" decoding="async" class="course-card__image" />
            <div class="course-card__body">
              <div class="course-card__heading">
                <h3>IELTS</h3>
                <span class="course-card__grade">Từ lớp 10</span>
              </div>
              <p>Xây dựng tư duy học thuật và chiến lược cho bốn kỹ năng.</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **Step 5: Replace the old four-card CSS**

Replace the complete `/* ---------- Courses Section ---------- */` block through `.cc-ic` with:

```css
/* ---------- Courses Section ---------- */
.courses { background: #F8FBFF; }
.courses-intro {
  margin-top: 10px;
  max-width: 62ch;
  color: #5F6C7C;
  font-size: .88rem;
  line-height: 1.6;
}
.course-carousel { margin-top: 18px; }
.course-carousel__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}
.course-nav {
  width: 42px;
  height: 42px;
  border: 1px solid #C9D7E8;
  border-radius: 10px;
  background: #fff;
  color: var(--blue-deep);
  font: inherit;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform .15s ease, background .2s ease, border-color .2s ease;
}
.course-nav:hover:not(:disabled) {
  background: var(--sky);
  border-color: #9DB9DA;
  transform: translateY(-1px);
}
.course-nav:active:not(:disabled) { transform: translateY(1px); }
.course-nav:disabled { opacity: .38; cursor: default; box-shadow: none; }
.course-track {
  --course-gap: 18px;
  display: flex;
  gap: var(--course-gap);
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 4px;
  scrollbar-color: #9FB8D4 transparent;
  scrollbar-width: thin;
  padding: 4px 4px 18px;
}
.course-card {
  flex: 0 0 clamp(300px, 29vw, 380px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  scroll-snap-align: start;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  transition: transform .2s ease, box-shadow .2s ease;
}
.course-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.course-card__image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: var(--sky);
}
.course-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 17px 18px 19px;
}
.course-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.course-card h3 {
  margin: 0;
  color: var(--blue-mid);
  font-family: "Baloo 2", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.2;
}
.course-card__grade {
  flex: none;
  padding: 5px 8px;
  border-radius: 8px;
  background: #FFF1E6;
  color: var(--orange-dk);
  font-size: .7rem;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
}
.course-card p {
  color: #5F6C7C;
  font-size: .79rem;
  line-height: 1.55;
}
.course-track:focus-visible {
  outline: 3px solid #FFD9A8;
  outline-offset: 3px;
  border-radius: 8px;
}
```

Add this rule inside `@media (max-width: 1100px)`:

```css
  .course-card { flex-basis: min(42vw, 360px); }
```

Remove these obsolete rules from `@media (max-width: 980px)` and `@media (max-width: 580px)`:

```css
  .cards-4 { grid-template-columns: repeat(2, 1fr); }
  .cards-4 { grid-template-columns: 1fr; }
```

Add these rules inside `@media (max-width: 580px)`:

```css
  .courses-intro { font-size: .82rem; }
  .course-carousel { margin-top: 14px; }
  .course-carousel__toolbar { margin-bottom: 8px; }
  .course-nav { width: 40px; height: 40px; }
  .course-track { --course-gap: 12px; padding-bottom: 14px; }
  .course-card { flex-basis: min(84vw, 360px); }
  .course-card__body { padding: 15px 16px 17px; }
```

- [ ] **Step 6: Run the course contract test and verify GREEN**

Run:

```powershell
node --test --test-name-pattern="course section presents" tests/page-contract.test.mjs
```

Expected: 1 matching test passes, 0 matching tests fail.

- [ ] **Step 7: Run the complete contract suite**

Run:

```powershell
node --test tests/page-contract.test.mjs
```

Expected: 14 tests pass, 0 fail.

- [ ] **Step 8: Record the checkpoint**

Confirm changes are limited to the seven new image files, `index.html`, `styles.css` and `tests/page-contract.test.mjs`. Do not commit because this workspace has no Git repository.

---

### Task 3: Add Progressive Carousel Controls

**Files:**
- Modify: `tests/page-behavior.test.mjs:1-171`
- Modify: `script.js:93-95`

**Interfaces:**
- Consumes: The data attributes and seven `.course-card` elements produced by Task 2.
- Produces: Previous/next scrolling, endpoint disabled states, resize-state refresh and reduced-motion behavior.
- Preserves: Existing mobile navigation and lightbox event handling.

- [ ] **Step 1: Extend the fake DOM with scroll behavior**

In `FakeElement.constructor`, add:

```js
    this.elementsBySelector = new Map();
    this.hidden = false;
    this.disabled = false;
    this.scrollLeft = 0;
    this.scrollWidth = 0;
    this.clientWidth = 0;
    this.offsetLeft = 0;
    this.rectWidth = 0;
    this.lastScrollOptions = null;
```

Replace `FakeElement.querySelectorAll` and add the two methods below it:

```js
  querySelectorAll(selector) {
    if (this.elementsBySelector.has(selector)) {
      return this.elementsBySelector.get(selector);
    }

    return selector === "a" ? this.links : [];
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
```

- [ ] **Step 2: Extend `createFixture` with optional carousel state**

Change the signature to:

```js
function createFixture({ withCarousel = true, reduceMotion = false } = {}) {
```

After creating `document`, add a fake window:

```js
  const windowListeners = new Map();
  const window = {
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) ?? [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    dispatch(type) {
      for (const listener of windowListeners.get(type) ?? []) listener();
    },
    matchMedia() {
      return { matches: reduceMotion };
    },
  };
```

Before constructing `selectorMap`, create the carousel fixture:

```js
  const courseCarousel = new FakeElement(document);
  const courseTrack = new FakeElement(document);
  const courseControls = new FakeElement(document);
  const coursePrev = new FakeElement(document);
  const courseNext = new FakeElement(document);
  const firstCourse = new FakeElement(document);
  const secondCourse = new FakeElement(document);

  courseControls.hidden = true;
  courseTrack.scrollWidth = 980;
  courseTrack.clientWidth = 320;
  firstCourse.offsetLeft = 0;
  firstCourse.rectWidth = 312;
  secondCourse.offsetLeft = 330;
  secondCourse.rectWidth = 312;
  courseTrack.elementsBySelector.set(".course-card", [
    firstCourse,
    secondCourse,
  ]);
  courseCarousel.childrenBySelector.set("[data-course-track]", courseTrack);
  courseCarousel.childrenBySelector.set(
    "[data-course-controls]",
    courseControls,
  );
  courseCarousel.childrenBySelector.set("[data-course-prev]", coursePrev);
  courseCarousel.childrenBySelector.set("[data-course-next]", courseNext);
```

After the existing `selectorMap` declaration, conditionally add the carousel:

```js
  if (withCarousel) {
    selectorMap.set("[data-course-carousel]", courseCarousel);
  }
```

Run the script with both globals:

```js
  vm.runInNewContext(scriptSource, { document, window });
```

Add the following values to the returned fixture object:

```js
    window,
    courseControls,
    courseTrack,
    coursePrev,
    courseNext,
```

- [ ] **Step 3: Write the failing carousel behavior tests**

Append:

```js
test("course carousel scrolls one card and updates endpoint controls", () => {
  const {
    window,
    courseControls,
    courseTrack,
    coursePrev,
    courseNext,
  } = createFixture();

  assert.equal(courseControls.hidden, false);
  assert.equal(coursePrev.disabled, true);
  assert.equal(courseNext.disabled, false);

  courseNext.dispatch("click");
  assert.equal(courseTrack.scrollLeft, 330);
  assert.equal(courseTrack.lastScrollOptions.left, 330);
  assert.equal(courseTrack.lastScrollOptions.behavior, "smooth");
  assert.equal(coursePrev.disabled, false);

  courseNext.dispatch("click");
  assert.equal(courseTrack.scrollLeft, 660);
  assert.equal(courseNext.disabled, true);

  coursePrev.dispatch("click");
  assert.equal(courseTrack.scrollLeft, 330);
  assert.equal(courseTrack.lastScrollOptions.left, -330);

  courseTrack.clientWidth = 980;
  window.dispatch("resize");
  assert.equal(courseNext.disabled, true);
});

test("course carousel honors reduced-motion preference", () => {
  const { courseTrack, courseNext } = createFixture({ reduceMotion: true });

  courseNext.dispatch("click");

  assert.equal(courseTrack.lastScrollOptions.behavior, "auto");
});

test("page behavior initializes safely without a course carousel", () => {
  const { toggle, nav } = createFixture({ withCarousel: false });

  toggle.dispatch("click");

  assert.equal(nav.classList.contains("open"), true);
});
```

- [ ] **Step 4: Run the new behavior tests and verify RED**

Run:

```powershell
node --test --test-name-pattern="course carousel|without a course carousel" tests/page-behavior.test.mjs
```

Expected: the carousel tests fail because the controls remain hidden and clicking Next does not scroll.

- [ ] **Step 5: Implement the minimal carousel enhancement**

Insert this block before the closing `})();` in `script.js`:

```js
  // 3. Course Carousel Controls
  var courseCarousel = document.querySelector("[data-course-carousel]");

  if (courseCarousel) {
    var courseTrack = courseCarousel.querySelector("[data-course-track]");
    var courseControls = courseCarousel.querySelector(
      "[data-course-controls]",
    );
    var coursePrev = courseCarousel.querySelector("[data-course-prev]");
    var courseNext = courseCarousel.querySelector("[data-course-next]");

    if (courseTrack && courseControls && coursePrev && courseNext) {
      var courseCards = courseTrack.querySelectorAll(".course-card");

      var getCourseStep = function () {
        if (courseCards.length > 1) {
          return courseCards[1].offsetLeft - courseCards[0].offsetLeft;
        }

        if (courseCards.length === 1) {
          return courseCards[0].getBoundingClientRect().width;
        }

        return 0;
      };

      var updateCourseControls = function () {
        var maxScroll = Math.max(
          0,
          courseTrack.scrollWidth - courseTrack.clientWidth,
        );
        coursePrev.disabled = courseTrack.scrollLeft <= 1;
        courseNext.disabled =
          maxScroll <= 1 || courseTrack.scrollLeft >= maxScroll - 1;
      };

      var scrollCourseTrack = function (direction) {
        var step = getCourseStep();
        if (!step) return;

        var reduceMotion =
          typeof window !== "undefined" &&
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        courseTrack.scrollBy({
          left: direction * step,
          behavior: reduceMotion ? "auto" : "smooth",
        });
      };

      courseControls.hidden = false;
      coursePrev.addEventListener("click", function () {
        scrollCourseTrack(-1);
      });
      courseNext.addEventListener("click", function () {
        scrollCourseTrack(1);
      });
      courseTrack.addEventListener("scroll", updateCourseControls);

      if (typeof window !== "undefined") {
        window.addEventListener("resize", updateCourseControls);
      }

      updateCourseControls();
    }
  }
```

- [ ] **Step 6: Run the behavior tests and verify GREEN**

Run:

```powershell
node --test tests/page-behavior.test.mjs
```

Expected: 6 tests pass, 0 fail.

- [ ] **Step 7: Run the full suite**

Run:

```powershell
node --test
```

Expected: 17 tests pass, 0 fail.

- [ ] **Step 8: Record the checkpoint**

Confirm this task changed only `script.js` and `tests/page-behavior.test.mjs`. Do not commit because this workspace has no Git repository.

---

### Task 4: Visual QA, Accessibility Audit and Final Verification

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `script.js`
- Verify: `images/course-*.jpg`
- Modify only if a verified defect is found: the corresponding source or test file

**Interfaces:**
- Consumes: Completed static carousel and JavaScript enhancement.
- Produces: Verified desktop, tablet, mobile, keyboard and reduced-motion behavior.

- [ ] **Step 1: Verify generated asset count and dimensions**

Run:

```powershell
Add-Type -AssemblyName System.Drawing
Get-ChildItem -LiteralPath 'images' -Filter 'course-*.jpg' | ForEach-Object {
  $courseBitmap = [System.Drawing.Image]::FromFile($_.FullName)
  try {
    "{0} {1}x{2}" -f $_.Name, $courseBitmap.Width, $courseBitmap.Height
  } finally {
    $courseBitmap.Dispose()
  }
}
```

Expected: exactly seven lines, each ending in `1280x960`.

- [ ] **Step 2: Run visible-copy and legacy-markup checks**

Run:

```powershell
rg --line-number "[—–]" index.html
```

Expected: no output.

Run:

```powershell
rg --line-number "cards-4|cc-head|cc-ic|Tiếng Anh thiếu nhi|Tiếng Anh thiếu niên|Luyện phát âm|Bổ trợ ngữ pháp" index.html styles.css
```

Expected: no output.

- [ ] **Step 3: Start a local preview**

Run from `D:\Nancy\Web`:

```powershell
$coursePreview = Start-Process -FilePath python -ArgumentList '-m','http.server','4173','--bind','127.0.0.1' -WorkingDirectory 'D:\Nancy\Web' -WindowStyle Hidden -PassThru
$coursePreview.Id
```

Open `http://127.0.0.1:4173/#courses` in the in-app browser if it is available. If the browser remains unavailable, report that limitation and do not substitute unrelated browser automation.

- [ ] **Step 4: Inspect desktop at 1320px content width**

Verify:

- Approximately three complete cards and a visible portion of the fourth card.
- The fourth-card preview clearly communicates horizontal continuation.
- All cards share equal height; images remain 4:3 without distortion.
- Course title, grade badge and description do not overlap or clip.
- Previous is disabled at the start; Next advances exactly one card.
- At the end, IELTS snaps fully into view and Next becomes disabled.

- [ ] **Step 5: Inspect tablet and 320px mobile**

Verify at tablet width:

- Approximately two complete cards and a visible portion of the next card.
- Navigation controls remain reachable and do not collide with the heading.

Verify at 320px:

- One card occupies roughly 84vw and the next card remains partially visible.
- The page itself has no horizontal overflow.
- The track supports touch-style horizontal scrolling and snap alignment.
- Text remains readable without a two-line navigation button label.

- [ ] **Step 6: Inspect keyboard and reduced motion**

Verify:

- Tab reaches the two course controls and the focus ring is visible.
- Tab reaches the scroll track; horizontal keyboard scrolling remains available.
- Disabled buttons are skipped or announced as disabled by the browser.
- With reduced motion enabled, button navigation moves without smooth animation.

- [ ] **Step 7: Run the design pre-flight subset**

Confirm:

- Redesign mode remains Preserve.
- The page remains one light theme with one blue/orange brand palette.
- Card radius remains 12px; control radius remains 10px by the existing component rule.
- No text, badge or decorative label overlays any photo.
- No em dash or en dash appears in visible copy.
- Motion is limited to user-triggered scroll, hover and active feedback.
- `prefers-reduced-motion` is honored.
- No new dependency, hand-rolled SVG or fake product UI was introduced.
- Course photo subjects and activities match the corresponding age level.

- [ ] **Step 8: Run fresh final verification**

Run:

```powershell
node --test
```

Expected: 17 tests pass, 0 fail, with no warnings or uncaught errors.

- [ ] **Step 9: Stop the local preview process**

Run:

```powershell
Get-CimInstance Win32_Process | Where-Object {
  $_.CommandLine -match 'http\.server 4173' -and
  $_.CommandLine -match '127\.0\.0\.1'
} | ForEach-Object {
  Stop-Process -Id $_.ProcessId
}
```

Expected: only the Python HTTP server started for this preview stops. This is not a repository file change.

- [ ] **Step 10: Final requirements audit**

Re-read `docs/superpowers/specs/2026-07-22-course-learning-path-carousel-design.md` and verify every acceptance criterion against the rendered page and fresh test output. Report any visual-QA limitation explicitly. Do not claim completion without the evidence from Steps 1, 2 and 8.

## Plan Self-Review

- Spec coverage: all approved content, imagery, layout, progressive enhancement, accessibility, failure modes and tests are mapped to Tasks 1-4.
- Placeholder scan: no implementation placeholder remains.
- Type and selector consistency: HTML data attributes, JavaScript selectors and fake DOM selectors use the same exact names.
- Baseline isolation: the stale About assertions are repaired from the existing approved About spec without modifying About production code.
- Scope: no route, navigation, contact, gallery, footer or framework change is included.
