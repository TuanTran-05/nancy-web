# Nancy responsive layout design

## Mục tiêu

Loại bỏ khoảng trắng lớn bên trái trên màn hình rộng hơn 15.6 inch và làm cho trang chủ thích nghi ổn định với desktop lớn, laptop, tablet và mobile, đồng thời giữ nguyên nội dung, màu sắc, hình ảnh, anchor và hành vi hiện tại.

## Chẩn đoán

`.hero-grid` đang dùng `width: calc(100% - 72px)`, `max-width: 1440px`, `margin-left: auto` và `margin-right: 0`. Khi viewport rộng hơn 1512px, grid bị neo về bên phải nên phần còn lại bên trái trở thành khoảng trắng. Các section khác đã dùng `.wrap` căn giữa, vì vậy hero là ngoại lệ gây lệch trục.

## Thiết kế được chọn

- Dùng cùng container responsive với các section khác: tối đa `var(--wrap)` và có khoảng đệm hai bên theo viewport.
- Căn giữa `.hero-grid` bằng `margin-inline: auto`.
- Đổi cột hero thành `minmax(0, .86fr) minmax(0, 1.34fr)` để không tạo overflow ở laptop và tablet.
- Giữ bố cục hai cột ở desktop; tại breakpoint hiện có `980px`, xếp chữ trên ảnh như hiện tại.
- Giảm phụ thuộc vào `white-space: nowrap` của tiêu đề hero ở các viewport hẹp để tiêu đề tự xuống dòng an toàn.
- Không thay đổi HTML, copy, URL, màu thương hiệu, ảnh, navigation hay JavaScript.

## Breakpoint contract

- Desktop lớn `>= 1441px`: hero và header/section cùng trục giữa, không còn khoảng trắng bất đối xứng.
- Desktop/laptop `981px-1440px`: hai cột co giãn, không tràn tiêu đề hoặc ảnh.
- Tablet `680px-980px`: hero một cột, nội dung và ảnh có cùng bề rộng tối đa.
- Mobile `<= 679px`: giữ một cột, padding hẹp, tiêu đề được phép wrap.

## Kiểm thử

- Thêm contract test đọc `styles.css` để ngăn hero quay lại trạng thái neo phải (`margin-right: 0`) và yêu cầu grid dùng hai cột co giãn không có giới hạn tối thiểu 500px.
- Chạy test mới ở trạng thái RED trước khi sửa CSS.
- Chạy lại test mới và toàn bộ `node --test` sau khi sửa.
- Kiểm tra thêm bằng cách tính layout ở các viewport 1366, 1536, 1920, 1024, 768 và 390px qua các contract CSS hiện hữu.

## Phạm vi không đổi

Không đổi nội dung SEO, cấu trúc HTML, asset, interaction, route, analytics hook hoặc thiết kế section ngoài những điều chỉnh cần thiết để giữ cùng trục responsive.
