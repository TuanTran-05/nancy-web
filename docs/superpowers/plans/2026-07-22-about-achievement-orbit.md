# About Achievement Orbit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay hai hàng nội dung About bằng một khối sáu thành tựu bao quanh logo Nancy, dùng nội dung đã xác thực và chuyển thành một cột trên màn hình nhỏ.

**Architecture:** Giữ nguyên `section#about` và tiêu đề kinh nghiệm. Khối mới dùng một container CSS Grid ba cột, hai danh sách ngữ nghĩa ở hai bên và logo ở giữa; breakpoint 767px chuyển grid thành logo trước, hai danh sách sau. Test hợp đồng đọc trực tiếp HTML/CSS để khóa nội dung, thứ tự, tài sản và responsive mà không cần JavaScript.

**Tech Stack:** HTML5, CSS Grid, Node.js built-in test runner.

## Global Constraints

- Chỉ sửa About trong `index.html`, CSS tương ứng trong `styles.css` và hợp đồng trong `tests/page-contract.test.mjs`.
- Giữ nguyên `section#about`, `aria-labelledby="about-heading"` và toàn bộ tiêu đề kinh nghiệm.
- Dùng đúng sáu nội dung đã duyệt, không thêm số lượng giáo viên, học viên, cơ sở hoặc chứng chỉ.
- Dùng `images/logo.png`; không tạo ảnh, JavaScript hoặc dependency mới.
- Ba tệp ảnh About cũ vẫn nằm trong `images/` nhưng không được tham chiếu trong HTML/CSS.
- Từ 768px dùng ba cột; dưới 768px logo đứng trước và sáu ô xếp một cột.
- Giao diện giữ theme sáng, màu Nancy hiện có và không thêm chuyển động tự động.
- Workspace không phải Git repository, vì vậy không có bước commit.

---

### Task 1: Xây dựng khối thành tựu sáu mục

**Files:**
- Modify: `tests/page-contract.test.mjs:97-190`
- Modify: `index.html:128-169`
- Modify: `styles.css:250-286`
- Modify: `styles.css:472-503`

**Interfaces:**
- Consumes: `images/logo.png`, các token CSS `--blue`, `--blue-deep`, `--sky`, `--line`, `--white`.
- Produces: `.achievement-orbit`, `.achievement-orbit__brand`, `.achievement-orbit__list`, `.achievement-orbit__list--left`, `.achievement-orbit__list--right`, `.achievement-pill`.

- [ ] **Step 1: Viết hợp đồng test mới**

Thay test `about section uses the approved compact two-row feature layout` bằng:

```js
test("about section uses the approved six-item achievement orbit", async () => {
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
  assert.doesNotMatch(about, /class="about-features"/);
  assert.doesNotMatch(about, /class="about-feature"/);
  assert.match(about, /class="achievement-orbit"/);
  assert.equal((about.match(/src="images\/logo\.png"/g) ?? []).length, 1);
  assert.match(
    about,
    /<img\s+src="images\/logo\.png"\s+alt="Nancy English Center"\s+width="256"\s+height="256"\s+loading="lazy"\s+decoding="async"/s,
  );

  const pillCopy = [...about.matchAll(
    /<li class="achievement-pill">\s*<strong>(.*?)<\/strong>\s*<span>(.*?)<\/span>\s*<\/li>/gs,
  )].map(([, title, detail]) => [title, detail]);
  assert.deepEqual(pillCopy, [
    ["10+ NĂM HOẠT ĐỘNG", "GIẢNG DẠY TIẾNG ANH"],
    ["GIÁO VIÊN", "GIÀU CHUYÊN MÔN"],
    ["QUAN TÂM SÁT SAO", "TỪNG HỌC VIÊN"],
    ["CHƯƠNG TRÌNH HỌC", "BÀI BẢN"],
    ["CẬP NHẬT THEO", "CHUẨN QUỐC TẾ"],
    ["HỖ TRỢ PHỤ HUYNH", "THƯỜNG XUYÊN"],
  ]);

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
    /\.achievement-orbit\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+170px\s+minmax\(0,\s*1fr\)[^}]*grid-template-areas:\s*"left brand right"/s,
  );
  assert.match(
    css,
    /\.achievement-pill\s*\{[^}]*border-radius:\s*999px[^}]*background:\s*var\(--white\)/s,
  );
  assert.match(
    css,
    /@media \(max-width: 767px\)[\s\S]*?\.achievement-orbit\s*\{[^}]*grid-template-columns:\s*1fr[^}]*grid-template-areas:\s*"brand"\s*"left"\s*"right"/s,
  );
});
```

- [ ] **Step 2: Chạy focused test để xác nhận RED**

Run:

```powershell
node --test --test-name-pattern="about section uses the approved six-item achievement orbit" tests/page-contract.test.mjs
```

Expected: test About mới FAIL vì About vẫn có `.about-features`, chưa có `.achievement-orbit` và CSS chưa có grid mới. Không sửa test tổng số ảnh lazy đang thuộc hợp đồng chương trình chưa triển khai.

- [ ] **Step 3: Thay markup About**

Giữ nguyên phần `experience-heading`. Thay toàn bộ `<div class="about-features">...</div>` bằng:

```html
<div class="achievement-orbit">
  <div class="achievement-orbit__brand">
    <img src="images/logo.png" alt="Nancy English Center" width="256" height="256" loading="lazy" decoding="async" />
  </div>

  <ul class="achievement-orbit__list achievement-orbit__list--left">
    <li class="achievement-pill">
      <strong>10+ NĂM HOẠT ĐỘNG</strong>
      <span>GIẢNG DẠY TIẾNG ANH</span>
    </li>
    <li class="achievement-pill">
      <strong>GIÁO VIÊN</strong>
      <span>GIÀU CHUYÊN MÔN</span>
    </li>
    <li class="achievement-pill">
      <strong>QUAN TÂM SÁT SAO</strong>
      <span>TỪNG HỌC VIÊN</span>
    </li>
  </ul>

  <ul class="achievement-orbit__list achievement-orbit__list--right">
    <li class="achievement-pill">
      <strong>CHƯƠNG TRÌNH HỌC</strong>
      <span>BÀI BẢN</span>
    </li>
    <li class="achievement-pill">
      <strong>CẬP NHẬT THEO</strong>
      <span>CHUẨN QUỐC TẾ</span>
    </li>
    <li class="achievement-pill">
      <strong>HỖ TRỢ PHỤ HUYNH</strong>
      <span>THƯỜNG XUYÊN</span>
    </li>
  </ul>
</div>
```

Logo đứng trước hai danh sách trong source order để trình đọc màn hình và mobile gặp thương hiệu trước, còn desktop dùng `grid-template-areas` để đặt logo giữa.

- [ ] **Step 4: Thay CSS About và thêm responsive**

Giữ `.about { background: #fff; }`, xóa các rule `.about-features`, `.about-feature`, `.about-feature__intro`, `.about-feature__icon`, `.about-feature__body h3`, `.about-feature__body p`. Thêm:

```css
.achievement-orbit {
  max-width: 1080px;
  margin: 30px auto 0;
  padding: 42px clamp(22px, 4vw, 46px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 170px minmax(0, 1fr);
  grid-template-areas: "left brand right";
  align-items: center;
  gap: 28px;
  border: 1px solid #D5EBFF;
  border-radius: 28px;
  background: linear-gradient(135deg, #EAF8FF 0%, #DDF3FF 100%);
}
.achievement-orbit__brand {
  grid-area: brand;
  width: 160px;
  height: 160px;
  justify-self: center;
  display: grid;
  place-items: center;
  padding: 20px;
  border: 1px solid rgba(14, 78, 161, .12);
  border-radius: 50%;
  background: var(--white);
  box-shadow: 0 10px 26px rgba(14, 78, 161, .10);
}
.achievement-orbit__brand img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
.achievement-orbit__list {
  display: grid;
  gap: 20px;
}
.achievement-orbit__list--left { grid-area: left; }
.achievement-orbit__list--right { grid-area: right; }
.achievement-pill {
  min-height: 84px;
  padding: 14px 22px;
  display: grid;
  place-content: center;
  text-align: center;
  border: 1px solid rgba(14, 78, 161, .10);
  border-radius: 999px;
  background: var(--white);
  color: var(--blue-deep);
  box-shadow: 0 5px 16px rgba(14, 78, 161, .07);
}
.achievement-pill strong,
.achievement-pill span { display: block; }
.achievement-pill strong {
  font-family: "Baloo 2", "Be Vietnam Pro", sans-serif;
  font-size: 1.02rem;
  line-height: 1.15;
}
.achievement-pill span {
  margin-top: 3px;
  font-size: .76rem;
  font-weight: 700;
  line-height: 1.35;
}
```

Thêm trước `@media (max-width: 580px)`:

```css
@media (max-width: 767px) {
  .achievement-orbit {
    padding: 30px 18px;
    grid-template-columns: 1fr;
    grid-template-areas:
      "brand"
      "left"
      "right";
    gap: 18px;
    border-radius: 22px;
  }
  .achievement-orbit__brand {
    width: 136px;
    height: 136px;
    padding: 18px;
  }
  .achievement-orbit__brand img {
    width: 100px;
    height: 100px;
  }
  .achievement-orbit__list { gap: 12px; }
}
```

Trong `@media (max-width: 580px)`, xóa ba rule cũ của `.about-feature` và thêm:

```css
.achievement-orbit { padding: 26px 14px; }
.achievement-pill {
  min-height: 76px;
  padding: 12px 16px;
}
```

- [ ] **Step 5: Chạy focused test để xác nhận GREEN**

Run:

```powershell
node --test --test-name-pattern="about section uses the approved six-item achievement orbit" tests/page-contract.test.mjs
```

Expected: test About mới pass; các test không khớp tên được skip.

- [ ] **Step 6: Chạy xác minh đầy đủ**

Run:

```powershell
node --test tests/page-behavior.test.mjs tests/page-contract.test.mjs
node --check script.js
```

Expected: `node --check` exit code 0. Full suite vẫn có đúng hai lỗi baseline đã được người dùng chấp thuận: tổng số ảnh lazy và chương trình bảy cấp độ; không có lỗi mới từ About.

- [ ] **Step 7: Rà pre-flight giao diện**

Kiểm tra trực tiếp trong HTML/CSS:

- About có đúng sáu `li.achievement-pill`, không có `article.about-feature`.
- Không có tham chiếu đến ba ảnh About cũ và ba tệp vẫn tồn tại.
- Không có em dash hoặc en dash trong nội dung hiển thị mới.
- Desktop có ba cột với logo giữa; dưới 768px chỉ còn một cột, không dùng absolute positioning.
- Chữ xanh đậm trên nền trắng, logo có kích thước dự trữ để tránh layout shift.
- Không có chuyển động hoặc thay đổi JavaScript.

Nếu in-app browser không có phiên khả dụng, ghi rõ giới hạn visual QA trong bàn giao thay vì dùng một browser khác.
