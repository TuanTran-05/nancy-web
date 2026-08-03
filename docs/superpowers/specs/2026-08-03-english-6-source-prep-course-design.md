# Thiết kế khóa Luyện thi tạo nguồn tiếng Anh 6

## Mục tiêu

Thay thẻ “Chương trình chuẩn Bộ Giáo dục” bằng “Luyện thi tạo nguồn tiếng Anh 6” và đặt thẻ mới ngay trước “Luyện thi tuyển sinh 10” trong hàng khóa bổ trợ và luyện thi.

## Nội dung thẻ

- Slug kỹ thuật: `tao-nguon-anh-6`.
- Tiêu đề: “Luyện thi tạo nguồn tiếng Anh 6”.
- Không hiển thị nhãn lớp.
- Mô tả: “Củng cố từ vựng, ngữ pháp và kỹ năng làm bài để chuẩn bị kỳ thi tạo nguồn tiếng Anh lớp 6.”
- Giữ `images/course-flyers.jpg` và đổi `alt` thành mô tả học viên luyện thi tạo nguồn tiếng Anh lớp 6.

## Thứ tự hiển thị

Hàng khóa bổ trợ và luyện thi có thứ tự:

1. Tiếng Anh tăng cường
2. Luyện thi tạo nguồn tiếng Anh 6
3. Luyện thi tuyển sinh 10
4. Luyện thi đại học

Tên và nội dung của “Luyện thi tuyển sinh 10” được giữ nguyên.

## Dữ liệu liên quan

- Thay tên chương trình cũ trong câu trả lời FAQ có cấu trúc bằng “luyện thi tạo nguồn tiếng Anh 6”.
- Giữ nguyên cấu trúc carousel, điều khiển cuộn, CSS và các thẻ khóa học khác.

## Kiểm thử

- Kiểm thử hợp đồng xác nhận thứ tự slug mới trong DOM.
- Kiểm thử xác nhận tiêu đề, ảnh và mô tả của thẻ mới.
- Kiểm thử xác nhận thẻ mới không chứa `course-card__grade`.
- Kiểm thử xác nhận FAQ có cấu trúc dùng tên mới và không còn tên chương trình cũ.
- Chạy toàn bộ kiểm thử Node hiện có để phát hiện hồi quy.
