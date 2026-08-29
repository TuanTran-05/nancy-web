# About Vertical Feature Gallery Design

## Mục tiêu

Tinh gọn section `#about` và thay hàng ba thẻ ngang bằng hai cụm nội dung xếp dọc có ảnh thật. Giao diện tiếp tục sử dụng ngôn ngữ thương hiệu xanh, cam, thân thiện và giữ nguyên khối tiêu đề `TỰ HÀO 10+ NĂM HOẠT ĐỘNG / GIẢNG DẠY TIẾNG ANH`.

## Phạm vi nội dung

- Xóa tiêu đề `Về Nancy English Center` khỏi đầu section.
- Xóa đoạn giới thiệu bắt đầu bằng `Với hơn 10 năm kinh nghiệm giảng dạy`.
- Giữ nguyên khối `experience-heading` và nội dung của khối.
- Thay ba thẻ `Giáo viên kinh nghiệm`, `Chương trình bài bản`, `Quan tâm sát sao học viên` bằng hai cụm dọc.
- Gộp nội dung `Quan tâm sát sao học viên` vào cụm giáo viên. Không còn mục thứ ba riêng biệt.

## Nội dung hai cụm

### Giáo viên kinh nghiệm & quan tâm sát sao học viên

Mô tả: `Đội ngũ giáo viên giàu chuyên môn, tận tâm, luôn đồng hành, theo dõi tiến độ và hỗ trợ kịp thời để mỗi học viên tiến bộ mỗi ngày.`

Bên dưới nội dung là hai ảnh:

- Ảnh được cung cấp thứ nhất, giáo viên nước ngoài tổ chức hoạt động cùng học viên.
- Ảnh được cung cấp thứ ba, giáo viên tương tác gần với nhóm học viên.

### Chương trình bài bản

Mô tả: `Lộ trình học khoa học, cập nhật theo chuẩn quốc tế và phù hợp từng cấp độ.`

Bên dưới nội dung là ảnh được cung cấp thứ hai, thể hiện hoạt động học tương tác trong lớp.

## Bố cục và thẩm mỹ

Reading this as: targeted evolution của landing page trung tâm tiếng Anh cho phụ huynh và học viên, với ngôn ngữ thân thiện, sáng rõ, dựa trên hệ HTML/CSS hiện tại.

- `DESIGN_VARIANCE: 4`: giữ cấu trúc rõ ràng và đáng tin cậy, tạo khác biệt bằng tỷ lệ ảnh thay vì bố cục quá phá cách.
- `MOTION_INTENSITY: 2`: chỉ giữ hover nhẹ hiện có, không thêm chuyển động tự động.
- `VISUAL_DENSITY: 4`: nội dung gọn, khoảng cách vừa phải, ảnh đủ lớn nhưng không kéo section quá dài.
- Redesign mode: preserve. Giữ màu, font, bán kính bo góc, anchor và giọng văn hiện tại.
- Hai cụm nội dung xếp dọc với khoảng cách rõ ràng.
- Phần đầu mỗi cụm dùng icon tròn hiện có, tiêu đề và mô tả đặt cạnh icon.
- Thư viện giáo viên có hai ảnh cạnh nhau trên desktop, cùng chiều cao thị giác.
- Ảnh chương trình chiếm toàn bộ chiều rộng cụm để tạo nhịp khác biệt.
- Ảnh dùng cùng hệ bo góc và viền nhẹ với giao diện hiện tại, không phủ nhãn hoặc chữ lên ảnh.

## Responsive

- Từ 768px trở lên, hai ảnh giáo viên hiển thị thành hai cột.
- Dưới 768px, hai ảnh giáo viên chuyển thành một cột.
- Ảnh chương trình luôn rộng toàn khối.
- Tất cả ảnh dùng `object-fit: cover` và tỷ lệ khung được khai báo để tránh thay đổi chiều cao khi tải.
- Section không tạo overflow ngang ở chiều rộng 320px.

## Tài nguyên ảnh

Ba ảnh URL do người dùng cung cấp được tải về thư mục `images/` để tránh phụ thuộc hotlink và tăng độ ổn định:

- `images/about-teacher-1.jpg`
- `images/about-teacher-2.jpg`
- `images/about-program.jpg`

Mỗi ảnh có `width`, `height`, `loading="lazy"`, `decoding="async"` và mô tả `alt` bằng tiếng Việt đúng nội dung ảnh.

## Phạm vi kỹ thuật

- Chỉnh `index.html` để thay markup của phần sau `experience-heading`.
- Chỉnh `styles.css` để tạo bố cục dọc và thư viện ảnh responsive.
- Chỉnh `tests/page-contract.test.mjs` để kiểm tra hợp đồng nội dung, tài nguyên ảnh và responsive.
- Không thay đổi `script.js`, navigation, route, anchor, khóa học, hoạt động hoặc liên hệ.
- Không thêm thư viện hoặc JavaScript mới.

## Kiểm thử và nghiệm thu

- `Về Nancy English Center` và đoạn giới thiệu cũ không còn trong section `#about`.
- `experience-heading` vẫn xuất hiện đúng một lần và giữ nguyên nội dung.
- Section có đúng hai cụm dọc.
- Nội dung `Quan tâm sát sao học viên` được gộp vào cụm giáo viên và không còn mục thứ ba.
- Hai ảnh giáo viên và một ảnh chương trình dùng đúng vị trí, alt text và thuộc tính kích thước.
- Desktop hiển thị thư viện giáo viên hai cột; mobile hiển thị một cột.
- Không có overflow ngang ở 320px.
- Toàn bộ test hiện tại và test mới đều pass.
