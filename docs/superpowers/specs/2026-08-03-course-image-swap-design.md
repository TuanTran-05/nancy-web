# Thiết kế đổi ảnh khóa IELTS

## Mục tiêu

Ảnh `images/IMG_20260803_165233.jpg` được hiển thị trong thẻ khóa IELTS. Ảnh đang dùng trong thẻ IELTS được chuyển xuống thẻ “Luyện thi đại học”.

## Phạm vi

- Chỉ thay thuộc tính `src` và nội dung `alt` của hai ảnh trong `index.html`.
- Giữ nguyên cấu trúc thẻ, kích thước khai báo, lazy loading, cách cắt ảnh và toàn bộ nội dung khóa học.
- Không xóa tệp ảnh cũ khỏi thư mục `images`, vì tệp có thể còn được những thẻ khác sử dụng.

## Chi tiết

- IELTS: `src="images/IMG_20260803_165233.jpg"`, mô tả ảnh nói rõ đây là các phiếu kết quả IELTS.
- Luyện thi đại học: nhận URL ảnh IELTS cũ `https://i.postimg.cc/ZRrpDX67/748741212-1553232193481313-2232384107086123280-n.jpg`, mô tả ảnh phù hợp với học viên ôn thi đại học.

## Kiểm thử

- Kiểm thử hợp đồng trang xác nhận đúng `src` và `alt` cho từng `data-course`.
- Kiểm tra tệp ảnh IELTS mới tồn tại.
- Chạy toàn bộ bộ kiểm thử Node hiện có sau khi thay ảnh.

