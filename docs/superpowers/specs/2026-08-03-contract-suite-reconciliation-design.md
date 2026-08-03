# Thiết kế đồng bộ website và bộ kiểm thử hợp đồng

## Mục tiêu

Đưa toàn bộ bộ kiểm thử `tests/page-contract.test.mjs` về trạng thái xanh bằng cách sửa đúng nguồn gây sai lệch: triển khai các thiết kế đã được duyệt nhưng chưa có trong trang, sửa các lỗi HTML/CSS/khả năng truy cập thực tế, và cập nhật các kiểm thử cũ đang mâu thuẫn với đặc tả hiện hành.

## Nguồn chuẩn

Các tài liệu đặc tả đã duyệt trong `docs/superpowers/specs/` là nguồn chuẩn. Khi kiểm thử mâu thuẫn với đặc tả, kiểm thử được cập nhật. Khi trang chưa triển khai yêu cầu trong đặc tả, HTML/CSS/JavaScript được cập nhật.

Ưu tiên áp dụng:

1. `2026-07-23-nancy-local-seo-design.md` cho tên thương hiệu và dữ liệu SEO.
2. `2026-07-22-about-full-reference-redesign.md` cho section About.
3. `2026-07-22-courses-heading-redesign.md` cho tiêu đề khóa học.
4. `2026-07-23-course-autoplay-design.md` cho hai hàng khóa học.
5. `2026-07-23-responsive-layout-design.md` và thiết kế Nancy reference cho responsive, accessibility và visual tokens.
6. Yêu cầu ngày 2026-08-03 cho hai ảnh IELTS và Luyện thi đại học.

## Quyết định theo từng nhóm lỗi

### Nhận diện và SEO

- Giữ tên chính `Nancy English Center` và tên thay thế `Anh Ngữ Nancy An Phú` như đặc tả SEO.
- Giữ header hiện tại gồm `NANCY ENGLISH CENTER` và `thienuy.edu.vn`; cập nhật kiểm thử cũ đang yêu cầu `ANH NGỮ THIÊN UY`.
- Giữ Open Graph và JSON-LD theo đặc tả SEO; cập nhật các kỳ vọng kiểm thử bị đảo tên chính/tên thay thế hoặc yêu cầu danh sách alias ngoài đặc tả.
- Thêm favicon dùng `/images/logo.png`, PNG `252x252`.

### Hợp đồng CSS và typography

- Chấp nhận `border-radius: var(--r-md)` vì token này bằng `12px`; kiểm thử phải xác nhận token và cách sử dụng thay vì yêu cầu literal trùng lặp.
- Giữ font cục bộ `Be Vietnam Pro` và `Baloo 2`. Xóa hoặc đổi câu chú thích chứa URL Google Fonts làm kiểm thử hiểu sai; kiểm thử chỉ cấm request tài nguyên từ Google Fonts.
- Dùng hệ token hiện hành `--accent` thay cho tên cũ `--orange`; kiểm thử tương phản đọc token thực tế.
- Kiểm thử icon đồng hồ giờ làm việc theo SVG hiện hành và bỏ kỳ vọng path bị gắn nhãn sai “môi trường thân thiện”.

### Accessibility và responsive

- Sửa kiểm thử gallery để nhận section có thuộc tính xuống nhiều dòng; vẫn yêu cầu đủ năm phần tử có `tabindex="0"`, `role="button"`, thao tác Enter/Space và trả focus sau khi đóng lightbox.
- Đồng bộ vị trí menu mobile với chiều cao header thực tế và kiểm tra nhãn bản đồ ở breakpoint phù hợp, không ép quy tắc phải nằm trong một block CSS cụ thể nếu kết quả responsive tương đương.
- Thay kiểm thử đếm cứng 17 ảnh lazy bằng hợp đồng hành vi: hero ưu tiên tải, mọi ảnh nội dung dưới màn hình đầu có kích thước và dùng `loading="lazy"`/`decoding="async"` phù hợp.

### About

- Thay About hiện tại bằng thiết kế full-reference đã duyệt: heading kinh nghiệm, dòng giá trị, năm showcase card, logo trung tâm, năm benefit và câu kết.
- Dùng cấu trúc responsive 3/2/1 cột theo đặc tả, không thêm JavaScript hay ảnh mạng.

### Khóa học

- Triển khai tiêu đề `KHÓA HỌC DÀNH CHO MỌI ĐỘ TUỔI` với capsule cam và spark trang trí như đặc tả.
- Bỏ nút điều hướng cũ; hai hàng tự chạy ngược chiều, tạm dừng độc lập khi hover/focus/pointer và tắt autoplay khi `prefers-reduced-motion`.
- Giữ nội dung thẻ và hai ảnh vừa duyệt: IELTS dùng `images/IMG_20260803_165233.jpg`, Luyện thi đại học dùng ảnh IELTS cũ.

## Kiểm thử

- Dùng TDD cho từng nhóm: chạy kiểm thử đang lỗi, thực hiện thay đổi nhỏ nhất, chạy lại nhóm đó.
- Chạy toàn bộ `node --test tests/page-contract.test.mjs` sau mỗi nhóm lớn.
- Xác minh trình duyệt ở desktop và mobile 320px/390px, gồm overflow ngang, menu, About, carousel, gallery lightbox và ảnh khóa học.
- Tiêu chí hoàn tất: 22 kiểm thử chạy, 21 đạt, 1 kiểm thử legacy được đánh dấu skip như hiện tại, không còn failure.

## Ngoài phạm vi

- Không đổi thông tin liên hệ, URL, anchor hoặc nội dung marketing ngoài các đoạn đã được đặc tả.
- Không thêm dependency, framework, backend hoặc request font mới.
- Không thay đổi hay xóa các ảnh người dùng đã cung cấp.
