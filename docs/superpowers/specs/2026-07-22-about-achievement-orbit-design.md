# Thiết kế khối thành tựu Nancy

Ngày: 2026-07-22

## Mục tiêu

Thay hai hàng nội dung hiện tại dưới tiêu đề "Tự hào 10+ năm hoạt động giảng dạy tiếng Anh" bằng một khối thành tựu lấy cảm hứng từ ảnh tham khảo của VUS. Thiết kế phải mang nhận diện Nancy, dễ đọc trên máy tính và điện thoại, đồng thời không đưa vào số liệu chưa được xác thực.

## Phạm vi

- Chỉ thay nội dung và kiểu trình bày bên trong phần About hiện có.
- Giữ nguyên `section#about`, tiêu đề kinh nghiệm, thứ tự các phần và liên kết điều hướng.
- Không thay hero, chương trình học, thư viện ảnh, liên hệ, footer hoặc JavaScript.
- Không dùng ba ảnh About đã cung cấp trước đây. Các tệp vẫn được giữ trong `images/`.

## Hướng thiết kế

Đây là một chỉnh sửa bảo toàn landing page giáo dục dành cho phụ huynh và học viên. Giao diện ưu tiên uy tín, thân thiện và rõ ràng. Sử dụng HTML/CSS thuần theo hệ thống màu hiện tại của Nancy.

- Design variance: 4, cân đối và có điểm nhấn ở logo trung tâm.
- Motion intensity: 2, không thêm chuyển động tự động.
- Visual density: 5, đủ sáu thông tin nhưng vẫn thoáng.
- Giữ giao diện sáng toàn trang.
- Dùng xanh Nancy làm nền nhạt, trắng cho các ô, xanh đậm cho chữ và cam làm điểm nhấn nhỏ.

## Bố cục desktop

Khối thành tựu nằm ngay dưới tiêu đề kinh nghiệm và có cấu trúc ba cột:

1. Cột trái gồm ba ô thành tựu xếp dọc.
2. Cột giữa chứa logo Nancy trong một hình tròn trắng.
3. Cột phải gồm ba ô thành tựu xếp dọc.

Các ô có hình viên thuốc, cùng ngôn ngữ bo tròn với nút bấm hiện tại nhưng không dùng bóng đổ nặng. Khoảng cách giữa các hàng tạo nhịp tương tự ảnh tham khảo. Logo trung tâm không lớn hơn các nhóm thông tin và có văn bản thay thế phù hợp.

## Nội dung đã xác thực

Cột trái:

1. `10+ NĂM HOẠT ĐỘNG` / `GIẢNG DẠY TIẾNG ANH`
2. `GIÁO VIÊN` / `GIÀU CHUYÊN MÔN`
3. `QUAN TÂM SÁT SAO` / `TỪNG HỌC VIÊN`

Cột phải:

1. `CHƯƠNG TRÌNH HỌC` / `BÀI BẢN`
2. `CẬP NHẬT THEO` / `CHUẨN QUỐC TẾ`
3. `HỖ TRỢ PHỤ HUYNH` / `THƯỜNG XUYÊN`

Không thêm số lượng giáo viên, học viên, cơ sở hoặc chứng chỉ vì website hiện không có dữ liệu xác thực cho các con số đó.

## Responsive

- Từ 768px trở lên: ba cột, hai cụm thành tựu bao quanh logo.
- Dưới 768px: logo được đưa lên trước, sáu ô xếp thành một cột theo đúng thứ tự đọc.
- Các ô rộng toàn phần trong vùng nội dung, giữ khoảng đệm ngang đủ để chữ không chạm mép.
- Không dùng định vị tuyệt đối cho các ô, tránh chồng lấn ở màn hình hẹp hoặc khi chữ phóng lớn.

## Khả năng truy cập

- Danh sách thành tựu dùng cấu trúc danh sách có ngữ nghĩa.
- Logo có `alt="Nancy English Center"`.
- Màu chữ trên nền trắng và nền xanh phải giữ tương phản dễ đọc.
- Không phụ thuộc vào màu sắc để truyền đạt ý nghĩa.
- Không thêm hiệu ứng chuyển động, do đó không phát sinh hành vi cần xử lý giảm chuyển động.

## Kiểm thử chấp nhận

- About vẫn có `aria-labelledby="about-heading"` và tiêu đề kinh nghiệm hiện tại.
- Khối mới có đúng sáu mục, đúng nội dung và đúng thứ tự đã duyệt.
- Logo dùng tệp `images/logo.png` và chỉ xuất hiện một lần trong khối.
- Hai `article.about-feature` cũ không còn trong About.
- Không có tham chiếu đến ba ảnh About cũ trong HTML hoặc CSS.
- CSS desktop có ba cột và CSS mobile chuyển thành một cột dưới 768px.
- Toàn bộ test hành vi và hợp đồng hiện có tiếp tục vượt qua sau khi cập nhật test cho thiết kế mới.

## Ngoài phạm vi

- Không xác minh hoặc sáng tác thêm thành tích kinh doanh.
- Không tạo ảnh mới.
- Không thêm thư viện CSS hay JavaScript.
- Không thay đổi logo, font chữ, điều hướng hoặc nội dung các phần khác.
