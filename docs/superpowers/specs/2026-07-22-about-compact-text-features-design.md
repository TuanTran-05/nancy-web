# About Compact Text Features Design

## Mục tiêu

Tinh gọn section `#about` sau khi bố cục ảnh lớn được đánh giá là nặng và không phù hợp. Giữ nội dung cốt lõi theo dạng hai hàng xếp dọc, không hiển thị ảnh, đồng thời học cách phân cấp nội dung ngắn và rõ từ trang tham chiếu TESOL Premium.

## Tham chiếu

Trang `https://tse-tesol.edu.vn/khoa-hoc-tesol-premium/` tổ chức phần thành tựu quanh một tiêu đề mạnh, nội dung hỗ trợ ngắn và các khối thông tin gọn. Thiết kế Nancy chỉ tiếp thu nhịp phân cấp và độ cô đọng, không sao chép màu sắc, nội dung, con số hoặc thành phần thương hiệu của TSE.

## Design Read

Reading this as: targeted evolution của landing page trung tâm tiếng Anh cho phụ huynh và học viên, với ngôn ngữ gọn, thân thiện và đáng tin cậy, dựa trên hệ HTML/CSS hiện tại.

- `DESIGN_VARIANCE: 4`: bố cục rõ ràng, hai hàng xếp dọc, không tạo bất đối xứng không cần thiết.
- `MOTION_INTENSITY: 2`: không thêm chuyển động tự động; giữ reduced-motion và trạng thái tương tác hiện tại của trang.
- `VISUAL_DENSITY: 4`: nội dung ngắn, khoảng cách vừa phải, section không bị kéo dài bởi ảnh.
- Redesign mode: preserve. Giữ màu xanh/cam, font, anchor, heading kinh nghiệm và giọng văn Nancy.
- Aesthetic foundation: native HTML/CSS hiện có, không thêm design system hoặc dependency.

## Nội dung giữ lại

- Khối `TỰ HÀO 10+ NĂM HOẠT ĐỘNG / GIẢNG DẠY TIẾNG ANH` tiếp tục là heading cấp 2 và nhãn của section `#about`.
- Cụm thứ nhất: `Giáo viên kinh nghiệm & quan tâm sát sao học viên`.
- Mô tả thứ nhất: `Đội ngũ giáo viên giàu chuyên môn, tận tâm, luôn đồng hành, theo dõi tiến độ và hỗ trợ kịp thời để mỗi học viên tiến bộ mỗi ngày.`
- Cụm thứ hai: `Chương trình bài bản`.
- Mô tả thứ hai: `Lộ trình học khoa học, cập nhật theo chuẩn quốc tế và phù hợp từng cấp độ.`

## Bố cục

- `about-features` được giới hạn chiều rộng khoảng 900px và căn giữa dưới heading kinh nghiệm.
- Có đúng hai `article.about-feature`, xếp dọc.
- Mỗi hàng gồm một icon tròn nhỏ và khối tiêu đề/mô tả đặt bên phải.
- Icon giáo viên dùng màu xanh thương hiệu; icon chương trình dùng màu cam thương hiệu.
- Mỗi hàng chỉ có một đường phân cách mảnh ở phía trên để tổ chức nội dung.
- Không dùng card lớn, background riêng, shadow, badge, số thứ tự hoặc ảnh.
- Nội dung được căn trái để dễ quét, trong khi heading kinh nghiệm tiếp tục căn giữa.

## Ảnh

- Xóa ba thẻ `<img>` và hai gallery wrapper khỏi `#about`.
- Không tham chiếu `images/about-teacher-1.jpg`, `images/about-teacher-2.jpg` hoặc `images/about-program.jpg` trong `index.html`.
- Giữ ba file ảnh trong thư mục `images/` để người dùng có thể sử dụng lại sau. Không xóa file vật lý.
- Sau thay đổi, tổng số ảnh lazy trên trang trở về năm ảnh của gallery hoạt động hiện có.

## Responsive

- Desktop và tablet đều hiển thị hai hàng một cột trong khối tối đa 900px.
- Dưới 580px, icon giảm từ 54px xuống 48px, khoảng cách và padding hàng giảm nhẹ.
- Tiêu đề và mô tả được phép wrap tự nhiên; không tạo overflow ngang ở 320px.
- Không cần breakpoint gallery 767px sau khi ảnh bị loại khỏi giao diện.

## Accessibility và hiệu năng

- Giữ `aria-labelledby="about-heading"`, `role="heading"` và `aria-level="2"` hiện có.
- Hai icon tiếp tục có `aria-hidden="true"` vì chỉ mang tính minh họa.
- Các `h3` giữ đúng thứ bậc dưới heading cấp 2.
- Bỏ ba ảnh giúp giảm khoảng 613KB tài nguyên không cần tải trong section này.
- Không thêm JavaScript, animation hoặc dependency.

## Phạm vi kỹ thuật

- Chỉnh `tests/page-contract.test.mjs` trước để mô tả hợp đồng không ảnh và xác nhận test thất bại.
- Chỉnh `index.html` để xóa gallery wrapper và ba thẻ ảnh.
- Chỉnh `styles.css` để xóa toàn bộ rule gallery/image, bỏ breakpoint 767px và căn giữa khối nội dung tối đa 900px.
- Không chỉnh `script.js`, navigation, hero, khóa học, hoạt động, liên hệ hoặc footer.

## Tiêu chí nghiệm thu

- `#about` giữ nguyên heading kinh nghiệm và có đúng hai `article.about-feature`.
- Không có thẻ `<img>`, `about-feature__gallery` hoặc `about-feature__image` trong `#about`.
- Không còn ba nguồn ảnh About trong `index.html`.
- Hai icon, hai tiêu đề và hai mô tả xuất hiện đúng nội dung và thứ tự.
- `about-features` được căn giữa với `max-width: 900px`.
- Không còn CSS gallery hoặc breakpoint gallery 767px.
- Tổng số ảnh lazy trên trang là năm.
- Không có overflow ngang ở 320px.
- Toàn bộ test hiện tại và test mới đều pass.
