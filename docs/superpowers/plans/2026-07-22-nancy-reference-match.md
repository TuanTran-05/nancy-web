# Nancy English Center Reference Match Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chỉnh landing page hiện tại để bám sát ảnh thiết kế, giữ nguyên toàn bộ ảnh, nội dung chính và liên kết.

**Architecture:** Giữ cấu trúc HTML/CSS/JavaScript thuần. Dùng một bài kiểm tra hợp đồng tĩnh bằng `node:test` để khóa các yêu cầu có thể xác minh tự động; sau đó chỉnh HTML, CSS và JavaScript theo hướng CSS-first, cuối cùng chạy kiểm tra cú pháp và hợp đồng toàn trang.

**Tech Stack:** HTML5, CSS3, JavaScript ES5-compatible, Node.js built-in test runner.

## Global Constraints

- Không tạo, chỉnh sửa hoặc thay thế file trong `images/`.
- Không thêm framework, package hoặc build tool.
- Giữ nguyên các anchor `#about`, `#courses`, `#activities`, `#contact`.
- Giữ nguyên thông tin liên hệ, URL và thứ tự ảnh.
- Button và card dùng bán kính 10-12px; icon tròn được giữ nguyên.
- Không có floating contact, caption phủ gallery, pin map chuyển động hoặc reveal-on-scroll hàng loạt.
- Responsive không tạo overflow ngang.
- Lightbox hỗ trợ chuột, Enter, Space, Escape và hoàn trả focus.

---

### Task 1: Khóa yêu cầu bằng kiểm thử hợp đồng

**Files:**
- Create: `tests/page-contract.test.mjs`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: `index.html`, `styles.css`, `script.js` dưới dạng UTF-8.
- Produces: bộ kiểm thử `node:test` xác minh các yêu cầu thiết kế và hành vi trọng yếu.

- [ ] **Step 1: Viết kiểm thử thất bại**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, css, js] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../script.js", import.meta.url), "utf8"),
]);

test("keeps the supplied image assets and page anchors", () => {
  for (const source of ["images/logo.png", "images/hero.jpg", "images/g1.jpg", "images/g2.jpg", "images/g3.jpg", "images/g4.jpg", "images/g5.jpg"]) {
    assert.match(html, new RegExp(source.replace(".", "\\.")));
  }
  for (const id of ["about", "courses", "activities", "contact"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test("matches the approved static visual contract", () => {
  assert.match(css, /--wrap:\s*1320px/);
  assert.match(css, /\.btn\s*\{[^}]*border-radius:\s*12px/s);
  assert.match(css, /\.hero-grid\s*\{[^}]*max-width:\s*1440px/s);
  assert.doesNotMatch(html, /class="floating-contact"/);
  assert.doesNotMatch(css, /animation:\s*mapBob/);
  assert.match(css, /\.gal figcaption\s*\{[^}]*display:\s*none/s);
});

test("gallery lightbox has keyboard and focus support", () => {
  assert.equal((html.match(/class="gal /g) ?? []).length, 5);
  assert.equal((html.match(/tabindex="0"/g) ?? []).length, 5);
  assert.equal((html.match(/role="button"/g) ?? []).length, 5);
  assert.match(html, /class="lightbox-close"[^>]*type="button"/);
  assert.match(js, /item\.addEventListener\("keydown"/);
  assert.match(js, /lastTrigger\.focus\(\)/);
});

test("mobile menu does not toggle the hidden desktop CTA group", () => {
  assert.doesNotMatch(js, /cta\.classList\.toggle\("open"\)/);
  assert.doesNotMatch(js, /cta\.classList\.remove\("open"\)/);
});
```

- [ ] **Step 2: Chạy kiểm thử để xác nhận thất bại đúng lý do**

Run: `node --test tests/page-contract.test.mjs`

Expected: FAIL tại các hợp đồng `--wrap: 1320px`, button radius, hero max-width, floating contact và keyboard lightbox.

### Task 2: Chỉnh cấu trúc HTML và hành vi JavaScript

**Files:**
- Modify: `index.html`
- Modify: `script.js`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: class hiện có của header, hero, gallery, lightbox và navigation.
- Produces: DOM gọn theo ảnh tham chiếu; gallery item có thể focus; lightbox quản lý focus; mobile menu chỉ điều khiển navigation.

- [ ] **Step 1: Chỉnh HTML tối thiểu**

```html
<figure class="gal g1" tabindex="0" role="button" aria-label="Xem ảnh: Trao thưởng học viên xuất sắc">
  <img src="images/g1.jpg" alt="Trao thưởng học viên xuất sắc" />
  <figcaption>Trao thưởng</figcaption>
</figure>

<div id="lightbox" class="lightbox" role="dialog" aria-modal="true" aria-hidden="true" aria-label="Xem ảnh hoạt động">
  <button class="lightbox-close" type="button" aria-label="Đóng ảnh">&times;</button>
  <img class="lightbox-img" src="" alt="" />
  <div class="lightbox-caption"></div>
</div>
```

Xóa lớp path sóng cam và toàn bộ `.floating-contact`. Áp dụng `tabindex`, `role` và `aria-label` tương ứng cho đủ năm gallery item. Không thay bất kỳ `src` ảnh nào.

- [ ] **Step 2: Chỉnh JavaScript menu và lightbox**

```js
var toggle = document.querySelector(".nav-toggle");
var nav = document.querySelector(".main-nav");

var lastTrigger = null;

var openLightbox = function (item) {
  var img = item.querySelector("img");
  var cap = item.querySelector("figcaption");
  if (!img) return;
  lastTrigger = item;
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt || "";
  lightboxCaption.textContent = cap ? cap.textContent : "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-active");
  if (lightboxClose) lightboxClose.focus();
};

var closeLightbox = function () {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-active");
  if (lastTrigger) lastTrigger.focus();
};
```

Mỗi gallery item gọi `openLightbox(item)` khi click và khi nhấn Enter hoặc Space. Xóa toàn bộ reveal-on-scroll và các thay đổi inline opacity/transform.

- [ ] **Step 3: Chạy kiểm thử hợp đồng**

Run: `node --test tests/page-contract.test.mjs`

Expected: phần HTML và JavaScript PASS; phần CSS vẫn FAIL.

### Task 3: Hiệu chỉnh hệ thống CSS theo ảnh tham chiếu

**Files:**
- Modify: `styles.css`
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: class HTML hiện tại.
- Produces: desktop reference match và responsive fallback không overflow.

- [ ] **Step 1: Hiệu chỉnh token và khung chung**

```css
:root {
  --radius: 12px;
  --wrap: 1320px;
  --shadow-sm: 0 3px 12px rgba(14, 78, 161, 0.06);
  --shadow-md: 0 8px 24px rgba(14, 78, 161, 0.1);
}

.wrap { width: min(var(--wrap), calc(100% - 96px)); }
.btn { border-radius: 12px; }
.section { padding: 38px 0; }
```

- [ ] **Step 2: Hiệu chỉnh header và hero**

```css
.header-inner { height: 94px; }
.logo-img { width: 58px; height: 58px; }
.hero { padding-top: 22px; }
.hero-grid {
  width: calc(100% - 72px);
  max-width: 1440px;
  margin-left: auto;
  margin-right: 0;
  grid-template-columns: minmax(480px, 0.86fr) minmax(0, 1.34fr);
  gap: 12px;
  padding-bottom: 12px;
}
.hero-photo-img { height: 530px; object-fit: cover; }
.hero-wave-wrapper { height: 96px; margin-top: -66px; }
```

- [ ] **Step 3: Thu gọn section, card, gallery, contact và footer**

Áp dụng `border-radius: 12px`, shadow nhẹ, card padding 18-20px, grid gap 12-16px, gallery một hàng năm ảnh, stats bar padding khoảng 18px, contact map tối thiểu 230px và footer padding khoảng 30px. Đặt `.gal figcaption { display: none; }`, xóa `mapBob` và không tạo animation liên tục.

- [ ] **Step 4: Hoàn thiện responsive**

```css
@media (max-width: 980px) {
  .wrap { width: min(100% - 40px, var(--wrap)); }
  .hero-grid { width: min(100% - 40px, 720px); margin-inline: auto; grid-template-columns: 1fr; }
  .hero-copy { order: 1; }
  .hero-visual { order: 2; }
}

@media (max-width: 580px) {
  .wrap, .hero-grid { width: min(100% - 28px, var(--wrap)); }
  .header-inner { height: 72px; }
  .section { padding: 30px 0; }
}
```

- [ ] **Step 5: Chạy toàn bộ kiểm thử**

Run: `node --test tests/page-contract.test.mjs`

Expected: PASS toàn bộ.

### Task 4: Kiểm tra cuối

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `script.js`
- Verify: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: toàn bộ thay đổi từ Task 1-3.
- Produces: bằng chứng kiểm tra hoàn tất.

- [ ] **Step 1: Kiểm tra JavaScript**

Run: `node --check script.js`

Expected: exit code 0, không có output lỗi.

- [ ] **Step 2: Kiểm tra hợp đồng trang**

Run: `node --test tests/page-contract.test.mjs`

Expected: tất cả test PASS.

- [ ] **Step 3: Kiểm tra asset và nội dung bị thay đổi ngoài phạm vi**

Run: `Get-FileHash images\* | Format-Table Path,Hash`

Expected: các file ảnh vẫn tồn tại và không bị ghi trong quá trình triển khai.

- [ ] **Step 4: Kiểm tra chuỗi cấm và overflow-risk**

Run: `rg --line-number "floating-contact|animation:\\s*mapBob|border-radius:\\s*999px|cta\\.classList" index.html styles.css script.js`

Expected: không còn floating contact, map animation, pill button hoặc logic mobile CTA cũ.
