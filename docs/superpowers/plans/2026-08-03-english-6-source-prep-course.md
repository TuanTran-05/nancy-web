# English 6 Source Preparation Course Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Ministry curriculum card with “Luyện thi tạo nguồn tiếng Anh 6” and position it immediately before the grade-10 entrance-exam card.

**Architecture:** Keep the existing static carousel and card styling. Protect the new semantic slug, DOM order, card copy, absent grade badge, and structured FAQ copy in the existing Node contract suite before changing the HTML.

**Tech Stack:** Static HTML, JSON-LD, Node.js built-in test runner

## Global Constraints

- Use `data-course="tao-nguon-anh-6"` and the exact title “Luyện thi tạo nguồn tiếng Anh 6”.
- The new card must not render a `course-card__grade` element.
- Keep `images/course-flyers.jpg`, the existing carousel structure, controls, CSS, and every unrelated course unchanged.
- Order the specialty row as `tang-cuong`, `tao-nguon-anh-6`, `tuyen-sinh-10`, `dai-hoc`.
- Keep the title and content of “Luyện thi tuyển sinh 10” unchanged.

---

### Task 1: Replace and reorder the specialty course card

**Files:**
- Modify: `tests/page-contract.test.mjs:264-308`
- Modify: `index.html:79-83`
- Modify: `index.html:744-834`

**Interfaces:**
- Consumes: `cardMarkup(slug)` and the `#courses` section contract
- Produces: a `tao-nguon-anh-6` course card before `tuyen-sinh-10`, with synchronized JSON-LD FAQ copy

- [ ] **Step 1: Write the failing contract assertions**

Change the expected slug order to:

```js
assert.deepEqual(slugs, [
  "happy-kids",
  "starter",
  "movers",
  "flyers",
  "ket",
  "pet",
  "ielts",
  "tang-cuong",
  "tao-nguon-anh-6",
  "tuyen-sinh-10",
  "dai-hoc",
]);
```

Remove the `chuan-bo-gd` entry from `expectedCards`. After the `expectedCards` loop, add:

```js
const sourcePrepCard = cardMarkup("tao-nguon-anh-6");
assert.match(sourcePrepCard, /<h4>Luyện thi tạo nguồn tiếng Anh 6<\/h4>/);
assert.ok(sourcePrepCard.includes('src="images/course-flyers.jpg"'));
assert.match(
  sourcePrepCard,
  /alt="Học viên luyện thi tạo nguồn tiếng Anh lớp 6 tại Nancy English Center"/,
);
assert.match(
  sourcePrepCard,
  /Củng cố từ vựng, ngữ pháp và kỹ năng làm bài để chuẩn bị kỳ thi tạo nguồn tiếng Anh lớp 6\./,
);
assert.doesNotMatch(sourcePrepCard, /course-card__grade/);
assert.match(
  html,
  /Ngoài ra trung tâm có các khóa bổ trợ và luyện thi: tiếng Anh tăng cường, luyện thi tạo nguồn tiếng Anh 6, luyện thi tuyển sinh lớp 10 và luyện thi đại học\./,
);
assert.doesNotMatch(html, /chương trình tiếng Anh chuẩn Bộ Giáo dục|Chương trình chuẩn Bộ Giáo dục/);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="Courses present" tests/page-contract.test.mjs
```

Expected: FAIL because `chuan-bo-gd` is still last, `tao-nguon-anh-6` does not exist, and the old structured FAQ copy remains.

- [ ] **Step 3: Implement the minimal HTML and JSON-LD changes**

Replace the FAQ structured answer's specialty-course clause with:

```text
Ngoài ra trung tâm có các khóa bổ trợ và luyện thi: tiếng Anh tăng cường, luyện thi tạo nguồn tiếng Anh 6, luyện thi tuyển sinh lớp 10 và luyện thi đại học.
```

Move the former `chuan-bo-gd` article directly after `tang-cuong` and replace its content with:

```html
<article class="course-card" data-course="tao-nguon-anh-6">
  <div class="course-card__media">
    <img
      src="images/course-flyers.jpg"
      alt="Học viên luyện thi tạo nguồn tiếng Anh lớp 6 tại Nancy English Center"
      width="1280"
      height="960"
      loading="lazy"
      decoding="async"
    />
  </div>
  <div class="course-card__body">
    <div class="course-card__heading">
      <h4>Luyện thi tạo nguồn tiếng Anh 6</h4>
    </div>
    <p>
      Củng cố từ vựng, ngữ pháp và kỹ năng làm bài để chuẩn bị kỳ thi tạo
      nguồn tiếng Anh lớp 6.
    </p>
  </div>
</article>
```

Leave the existing `tuyen-sinh-10` and `dai-hoc` articles unchanged after it.

- [ ] **Step 4: Run focused and full verification**

Run:

```powershell
node --test --test-name-pattern="Courses present" tests/page-contract.test.mjs
node --test tests/page-contract.test.mjs tests/page-behavior.test.mjs
```

Expected: both commands PASS with zero failures.

- [ ] **Step 5: Review and commit only the intended files**

Run:

```powershell
git diff --check
git diff -- index.html tests/page-contract.test.mjs
git status --short
```

Expected: the tracked diff contains only the planned HTML/JSON-LD and contract-test changes; unrelated untracked files remain unstaged.

Commit:

```powershell
git add -- index.html tests/page-contract.test.mjs
git commit -m "feat: add english 6 source prep course"
```
