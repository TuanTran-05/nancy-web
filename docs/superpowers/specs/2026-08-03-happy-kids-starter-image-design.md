# Thiết kế đổi ảnh Happy Kids và Starter

## Mục tiêu

Hiển thị ảnh `images/IMG_20260803_171902.jpg` trong cả hai thẻ khóa học Happy Kids và Starter thuộc lộ trình khóa học.

## Phạm vi

- Chỉ thay thuộc tính `src` và nội dung `alt` của ảnh trong hai thẻ `data-course="happy-kids"` và `data-course="starter"` tại `index.html`.
- Giữ nguyên cấu trúc thẻ, kích thước khai báo, lazy loading, cách cắt ảnh, nội dung khóa học và toàn bộ CSS hiện có.
- Không sao chép hoặc chỉnh sửa tệp ảnh nguồn.

## Chi tiết triển khai

- Cả hai thẻ dùng `src="images/IMG_20260803_171902.jpg"`.
- Văn bản `alt` mô tả ảnh chứng nhận và lễ vinh danh của Nancy English Center, phù hợp với nội dung thực tế của ảnh.
- Kiểm thử hợp đồng trang xác nhận chính xác đường dẫn ảnh cho cả hai `data-course` và xác nhận tệp ảnh nguồn tồn tại.

## Kiểm thử

- Chạy kiểm thử hợp đồng trang để xác nhận hai thẻ dùng đúng ảnh và có mô tả truy cập có ý nghĩa.
- Chạy toàn bộ bộ kiểm thử Node hiện có để phát hiện hồi quy ngoài ý muốn.
- Kiểm tra diff để bảo đảm mã giao diện chỉ thay đổi hai ảnh và các kiểm thử liên quan.
