# Readable Results Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mở popup thành tích trực tiếp bằng một phiếu điểm lớn, kèm dải ảnh thu nhỏ để đổi phiếu nhanh trên máy tính và điện thoại.

**Architecture:** Giữ mô-đun JavaScript thuần hiện có và thay hai trạng thái lưới/chi tiết bằng một trạng thái viewer duy nhất. `createResultsModal` quản lý khóa học đang mở và `selectedIndex`; một hàm render thuần dựng ảnh lớn, điều hướng, bộ đếm và dải thumbnail để tiếp tục kiểm thử bằng `node:test` không cần trình duyệt thật.

**Tech Stack:** HTML, CSS và JavaScript thuần; kiểm thử bằng `node:test` với DOM giả hiện có; không thêm thư viện hoặc bước build.

## Global Constraints

- Chỉ sửa popup thành tích trong `results-modal.js`, các kiểu `results-*` trong `styles.css`, cache key liên quan trong `index.html` và các test tương ứng.
- Không thay đổi `results-data.js`, nội dung phiếu điểm, thẻ khóa học hoặc cấu trúc điều hướng của trang.
- Popup mở khóa học hợp lệ tại chỉ mục `0`; khóa học không tồn tại hoặc không có `items` thì không mở.
- Desktop dùng một ảnh lớn với dải thumbnail bên phải; màn hình hẹp chuyển thumbnail xuống dưới thành hàng cuộn ngang.
- Thumbnail đang chọn dùng `aria-current="true"`; alt text không chứa tên học viên.
- Escape đóng popup; ArrowLeft và ArrowRight điều hướng vòng; khi đóng phải trả focus và mở khóa cuộn nền.
- JavaScript tiếp tục theo phong cách tệp hiện có: IIFE, `var`, hàm ẩn danh và không thêm dependency.
- CSS dùng token thương hiệu hiện có; chuyển động phải tôn trọng `prefers-reduced-motion`.
- Lệnh test JavaScript chuẩn là `node --test "tests/*.test.mjs"`.
- Baseline ngày 2026-08-04: 55 test pass, 0 fail.

---

## File Structure

| Tệp | Trách nhiệm sau thay đổi |
| --- | --- |
| `results-modal.js` | Dựng viewer, quản lý ảnh đang chọn, xử lý click và bàn phím |
| `styles.css` | Bố cục ảnh lớn + thumbnail dọc, responsive thành thumbnail ngang |
| `index.html` | Đổi cache key cho CSS và JavaScript để trình duyệt tải giao diện mới |
| `tests/results-modal.test.mjs` | Kiểm thử HTML, trạng thái mở mặc định, thumbnail và điều hướng |
| `tests/page-contract.test.mjs` | Khóa hợp đồng CSS responsive và cache key của tài nguyên |

Không tạo component hoặc tệp runtime mới. Phạm vi đủ nhỏ để giữ ranh giới hiện tại: `results-modal.js` chịu trách nhiệm hành vi, `styles.css` chịu trách nhiệm bố cục.

---

### Task 1: Chuyển modal sang viewer một ảnh lớn

**Files:**
- Modify: `tests/results-modal.test.mjs:51-90, 179-223`
- Modify: `results-modal.js:52-117, 119-238`

**Interfaces:**
- Consumes: `course.items: Array<{src: string, caption: string, meta: string}>` từ `results-data.js`
- Produces: `renderViewer(course, selectedIndex): string`
- Produces: `createResultsModal(root, data)` với các action `close`, `select`, `prev`, `next`

- [ ] **Step 1: Viết test thất bại cho markup viewer và thumbnail**

Trong `tests/results-modal.test.mjs`, thay các test của lưới và detail bằng các test sau:

```js
test("viewer renders one readable image and one thumbnail per result", () => {
  const html = loadModule().renderViewer(course, 0);
  assert.match(html, /class="results-viewer"/);
  assert.match(html, /class="results-main__image"[^>]*01\.jpg/);
  assert.equal((html.match(/class="results-thumb"/g) || []).length, 3);
  assert.equal((html.match(/aria-current="true"/g) || []).length, 1);
  assert.match(html, /data-action="select" data-index="0"[^>]*aria-current="true"/);
  assert.match(html, /1\s*\/\s*3/);
});

test("viewer marks the selected thumbnail and shows its score", () => {
  const html = loadModule().renderViewer(course, 1);
  assert.match(html, /class="results-main__image"[^>]*02\.jpg/);
  assert.match(html, /data-index="1"[^>]*aria-current="true"/);
  assert.match(html, /Pass · Grade A/);
  assert.match(html, /2\s*\/\s*3/);
});

test("viewer keeps private names out of image alternatives", () => {
  const html = loadModule().renderViewer(course, 0);
  assert.match(html, /alt="Phiếu điểm KET của học viên Nancy English Center"/);
  assert.equal(/alt="[^"]*(Nguyen|Nguyễn|Dinh|Đinh)/.test(html), false);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại đúng lý do**

Run:

```powershell
node --test tests/results-modal.test.mjs
```

Expected: FAIL vì `renderViewer` chưa tồn tại.

- [ ] **Step 3: Dựng hàm `renderViewer` tối thiểu**

Trong `results-modal.js`, thay `renderGrid` và `renderDetail` bằng hàm dưới đây. Giữ nguyên `escapeHtml`, `renderStats` và `altText`.

```js
function renderViewer(course, selectedIndex) {
  var item = course.items[selectedIndex];
  var alt = escapeHtml(altText(course));
  var caption = item.caption
    ? '<p class="results-detail__cap">' +
      escapeHtml(item.caption) +
      " <em>" +
      escapeHtml(item.meta) +
      "</em></p>"
    : "";
  var thumbs = course.items
    .map(function (thumb, index) {
      var current = index === selectedIndex ? ' aria-current="true"' : "";
      return (
        '<button class="results-thumb" type="button" data-action="select" data-index="' +
        index +
        '" aria-label="Xem phiếu điểm ' +
        (index + 1) +
        " / " +
        course.items.length +
        '"' +
        current +
        "><img src=\"" +
        escapeHtml(thumb.src) +
        '" alt="" loading="lazy" decoding="async" /></button>'
      );
    })
    .join("");

  return (
    '<div class="results-viewer" data-shape="' +
    escapeHtml(course.shape) +
    '"><div class="results-main"><div class="results-detail__stage">' +
    '<button class="results-nav" type="button" data-action="prev" aria-label="Phiếu điểm trước">&#8249;</button>' +
    '<div class="results-main__document"><img class="results-main__image" src="' +
    escapeHtml(item.src) +
    '" alt="' +
    alt +
    '" decoding="async" />' +
    caption +
    '<p class="results-detail__count">' +
    (selectedIndex + 1) +
    " / " +
    course.items.length +
    "</p></div>" +
    '<button class="results-nav" type="button" data-action="next" aria-label="Phiếu điểm tiếp theo">&#8250;</button>' +
    '</div></div><div class="results-thumbs" role="list" aria-label="Danh sách phiếu điểm">' +
    thumbs +
    "</div></div>"
  );
}
```

Trong object trả về cuối mô-đun, bỏ `renderGrid`, `renderDetail` và xuất `renderViewer`.

- [ ] **Step 4: Chạy test renderer để xác nhận pass**

Run:

```powershell
node --test tests/results-modal.test.mjs
```

Expected: các test renderer mới PASS; các test hành vi cũ về màn hình lưới vẫn FAIL và sẽ được cập nhật ở bước kế tiếp.

- [ ] **Step 5: Viết test thất bại cho trạng thái mở, chọn thumbnail và bàn phím**

Thay các test hành vi lưới cũ bằng:

```js
test("opening shows the first result and locks background scrolling", () => {
  const { modal, root, body } = createModalFixture();
  modal.open("ket", new FakeNode());
  assert.equal(modal.isOpen(), true);
  assert.match(root.innerHTML, /results-viewer/);
  assert.match(root.innerHTML, /1 \/ 3/);
  assert.match(root.innerHTML, /01\.jpg/);
  assert.equal(root.getAttribute("aria-hidden"), "false");
  assert.equal(body.classList.v, "lightbox-active");
});

test("opening a course without results does nothing", () => {
  const { root, document, body } = createModalFixture();
  const window = { document };
  vm.runInNewContext(source, { window, document });
  const modal = window.NancyResults.createResultsModal(root, {
    empty: { ...course, items: [] },
  });
  modal.open("empty", new FakeNode());
  assert.equal(modal.isOpen(), false);
  assert.equal(root.innerHTML, "");
  assert.equal(body.classList.v, null);
});

test("clicking a thumbnail selects its result", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "select", 1);
  assert.match(root.innerHTML, /2 \/ 3/);
  assert.match(root.innerHTML, /02\.jpg/);
  assert.match(root.innerHTML, /data-index="1"[^>]*aria-current="true"/);
});

test("Arrow keys navigate results and wrap around", () => {
  const { modal, root, document } = createModalFixture();
  modal.open("ket", new FakeNode());
  document.dispatch("keydown", { key: "ArrowLeft" });
  assert.match(root.innerHTML, /3 \/ 3/);
  document.dispatch("keydown", { key: "ArrowRight" });
  assert.match(root.innerHTML, /1 \/ 3/);
});

test("Escape closes directly from the result viewer", () => {
  const { modal, document } = createModalFixture();
  modal.open("ket", new FakeNode());
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(modal.isOpen(), false);
});
```

Giữ các test hiện có cho course không tồn tại, điều hướng nút trước/sau, trả focus và click backdrop.

- [ ] **Step 6: Chạy test để xác nhận hành vi cũ làm test mới thất bại**

Run:

```powershell
node --test tests/results-modal.test.mjs
```

Expected: FAIL vì `open()` còn đặt chỉ mục `-1`, action `select` và phím mũi tên chưa được xử lý.

- [ ] **Step 7: Cập nhật `createResultsModal`**

Đổi `detailIndex` thành `selectedIndex`. `paint()` luôn dựng một `.results-panel` có header, stats và viewer:

```js
var selectedIndex = -1;

function paint() {
  if (!current) return;
  root.innerHTML =
    '<div class="results-panel">' +
    '<div class="results-head">' +
    '<span class="results-badge">' +
    escapeHtml(current.cefr || current.grade) +
    "</span>" +
    "<div><h3>Thành tích học viên " +
    escapeHtml(current.label) +
    "</h3><p>" +
    escapeHtml(current.org) +
    " · " +
    escapeHtml(current.grade) +
    "</p></div>" +
    '<button class="results-close" type="button" data-action="close" aria-label="Đóng">&#10005;</button>' +
    "</div>" +
    renderStats(current) +
    renderViewer(current, selectedIndex) +
    "</div>";
}
```

Trong `open`, từ chối dữ liệu rỗng và chọn ảnh đầu tiên:

```js
var course = data[key];
if (!course || !course.items || !course.items.length) return;
current = course;
selectedIndex = 0;
```

Trong `close`, đặt `selectedIndex = -1`. Trong `step`, dùng `selectedIndex`. Trong click delegation, thay hai nhánh `grid`/`zoom` bằng:

```js
else if (action === "select") {
  var nextIndex = parseInt(trigger.getAttribute("data-index"), 10);
  if (nextIndex >= 0 && nextIndex < current.items.length) {
    selectedIndex = nextIndex;
    paint();
  }
} else if (action === "next") step(1);
else if (action === "prev") step(-1);
```

Thay keydown handler bằng:

```js
document.addEventListener("keydown", function (event) {
  if (!current) return;
  if (event.key === "Escape") {
    close();
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    step(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    step(1);
  }
});
```

- [ ] **Step 8: Chạy test mô-đun và toàn bộ suite**

Run:

```powershell
node --test tests/results-modal.test.mjs
node --test "tests/*.test.mjs"
```

Expected: tất cả test PASS, 0 fail.

- [ ] **Step 9: Commit hành vi viewer**

```powershell
git add results-modal.js tests/results-modal.test.mjs
git commit -m "feat: open results in readable viewer"
```

---

### Task 2: Tạo bố cục responsive và xác minh trực quan

**Files:**
- Modify: `tests/page-contract.test.mjs:472-480`
- Modify: `styles.css:2015-2279`
- Modify: `index.html:158, 1590`

**Interfaces:**
- Consumes: các class `.results-viewer`, `.results-main`, `.results-main__image`, `.results-thumbs`, `.results-thumb` từ Task 1
- Produces: viewer hai cột trên desktop, một cột với thumbnail cuộn ngang ở `max-width: 720px`

- [ ] **Step 1: Viết contract test thất bại cho layout và cache key**

Trong `tests/page-contract.test.mjs`, thay test lưới landscape bằng:

```js
test("results viewer keeps thumbnails beside the document on desktop", () => {
  assert.match(
    css,
    /\.results-viewer\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+116px/s,
  );
  assert.match(css, /\.results-thumbs\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css, /\.results-thumb\[aria-current="true"\]/);
});

test("results thumbnails become a horizontal strip on small screens", () => {
  assert.match(
    css,
    /@media\s*\(max-width:\s*720px\)[\s\S]*?\.results-viewer\s*\{[^}]*grid-template-columns:\s*1fr/s,
  );
  assert.match(
    css,
    /@media\s*\(max-width:\s*720px\)[\s\S]*?\.results-thumbs\s*\{[^}]*overflow-x:\s*auto/s,
  );
});

test("results viewer assets use the current cache key", () => {
  assert.match(html, /styles\.css\?v=20260804-results-viewer/);
  assert.match(html, /results-modal\.js\?v=20260804-results-viewer/);
});
```

Giữ test hiện có về `.results-modal`, trạng thái ẩn và reduced motion.

- [ ] **Step 2: Chạy contract test để xác nhận thất bại**

Run:

```powershell
node --test tests/page-contract.test.mjs
```

Expected: FAIL vì CSS viewer và cache key mới chưa tồn tại.

- [ ] **Step 3: Thay CSS lưới/detail cũ bằng viewer desktop**

Giữ `.results-modal`, `.results-panel`, header, stats và animation hiện có, nhưng thu padding stats còn `10px 20px` và thay phần từ `.results-grid` đến trước media query bằng:

```css
.results-viewer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 116px;
  gap: 14px;
  padding: 14px 20px 20px;
  min-height: 0;
}

.results-main {
  min-width: 0;
}

.results-detail__stage {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: center;
  gap: 12px;
  min-height: 0;
  padding: 12px;
  border-radius: var(--r-md);
  background: var(--surface-2);
}

.results-main__document {
  min-width: 0;
  text-align: center;
}

.results-main__image {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: calc(100vh - 280px);
  margin: 0 auto;
  border-radius: 6px;
  box-shadow: var(--sh-1);
}

.results-thumbs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 2px 4px 2px 2px;
}

.results-thumb {
  flex: none;
  padding: 0;
  overflow: hidden;
  border: 2px solid transparent;
  border-radius: 8px;
  background: var(--surface-2);
  cursor: pointer;
  opacity: 0.72;
  transition: opacity 0.2s var(--ease), border-color 0.2s var(--ease);
}

.results-thumb img {
  display: block;
  width: 100%;
  height: auto;
}

.results-thumb:hover,
.results-thumb:focus-visible {
  opacity: 1;
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

.results-thumb[aria-current="true"] {
  border-color: var(--accent);
  opacity: 1;
}
```

Giữ `.results-nav`, `.results-detail__cap`, `.results-detail__count`; bỏ `.results-detail__back`, `.results-grid`, `.results-tile` và selector `.results-detail` không còn dùng.

- [ ] **Step 4: Thêm mobile layout và reduced-motion fallback**

Trong `@media (max-width: 720px)`, dùng:

```css
.results-modal {
  padding: 8px;
}

.results-head {
  flex-wrap: nowrap;
  padding: 12px;
}

.results-stats {
  padding: 8px 12px;
}

.results-viewer {
  grid-template-columns: 1fr;
  padding: 10px 12px 14px;
}

.results-detail__stage {
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  gap: 6px;
  padding: 8px;
}

.results-main__image {
  max-height: 60vh;
}

.results-thumbs {
  flex-direction: row;
  max-height: none;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 6px;
}

.results-thumb {
  flex: 0 0 72px;
}
```

Trong `@media (prefers-reduced-motion: reduce)`, đặt `.results-thumb { transition: none; }`; không thêm animation mới.

- [ ] **Step 5: Đổi cache key trong `index.html`**

```html
<link rel="stylesheet" href="styles.css?v=20260804-results-viewer" />
...
<script src="results-modal.js?v=20260804-results-viewer"></script>
```

- [ ] **Step 6: Chạy contract test và toàn bộ suite**

Run:

```powershell
node --test tests/page-contract.test.mjs
node --test "tests/*.test.mjs"
git diff --check
```

Expected: tất cả test PASS, 0 fail; `git diff --check` không in lỗi.

- [ ] **Step 7: Xác minh trực quan trên desktop và mobile**

Mở `D:/Nancy/Web/index.html`, cuộn đến khóa học KET và bấm “Xem thành tích”. Kiểm tra ở viewport khoảng `1440 x 900`:

- Phiếu đầu tiên xuất hiện lớn ngay, không qua màn hình lưới.
- Header và ba thống kê vẫn nhìn thấy nhưng không lấn nhiều chiều cao.
- Thumbnail nằm bên phải, có thể cuộn dọc; ảnh đang chọn có viền cam.
- Bấm thumbnail, hai nút điều hướng và phím mũi tên đều đổi ảnh cùng bộ đếm.
- Escape đóng popup và focus trở về thẻ khóa học.

Đổi viewport về khoảng `390 x 844` và kiểm tra:

- Ảnh không tràn ngang.
- Thumbnail nằm dưới ảnh thành một hàng cuộn ngang.
- Nút trước/sau không che nội dung phiếu.
- Nút đóng vẫn nhìn thấy, dùng được; nền trang không cuộn khi popup mở.

- [ ] **Step 8: Commit layout responsive**

```powershell
git add styles.css index.html tests/page-contract.test.mjs
git commit -m "style: make results viewer readable"
```

---

## Final Verification

Chạy lại từ worktree sạch:

```powershell
node --test "tests/*.test.mjs"
git status --short
```

Expected: toàn bộ suite PASS, 0 fail. `git status --short` chỉ được hiển thị các tệp có sẵn từ trước và không thuộc phạm vi kế hoạch; bốn tệp runtime/test của tính năng không còn thay đổi chưa commit.
