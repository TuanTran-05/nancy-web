# Thiết kế lại toàn bộ About theo bản mẫu Nancy

Ngày: 2026-07-22

## Nguồn tham khảo

Thiết kế do người dùng cung cấp: `C:\Users\ASUS\Downloads\ChatGPT Image Jul 22, 2026, 10_51_14 PM.png`.

Ảnh chỉ được dùng làm chuẩn đối chiếu. Giao diện sẽ được tái dựng bằng HTML/CSS để chữ sắc nét, truy cập được và thích ứng tốt trên nhiều kích thước màn hình.

## Mục tiêu

Thay toàn bộ nội dung trực quan của `section#about` bằng thiết kế mới gồm tiêu đề kinh nghiệm, dòng giá trị cốt lõi, khung năm thẻ thông tin với logo Nancy ở giữa, dải năm lợi ích và câu kết. Bản dựng phải gần mẫu trên desktop và có bố cục rõ ràng trên tablet, điện thoại.

## Phạm vi

- Giữ nguyên `section#about`, `id="about"`, `aria-labelledby="about-heading"` và vị trí của About trong trang.
- Thay khối Achievement Orbit hiện tại bằng khối showcase mới.
- Giữ nguyên các phần hero, khóa học, hoạt động, liên hệ, footer và JavaScript.
- Không đưa ảnh tham khảo vào HTML.
- Không dùng ba ảnh About cũ; các tệp vẫn được giữ trong `images/`.
- Không thêm dependency hoặc tải thêm font.

## Hướng thiết kế

Đây là redesign bảo toàn landing page giáo dục Nancy dành cho phụ huynh và học viên. Ngôn ngữ thị giác chỉn chu, thân thiện, sáng và giàu thông tin, dùng HTML/CSS thuần cùng palette hiện có.

- Design variance: 5, bố cục cân đối nhưng có logo tạo điểm neo.
- Motion intensity: 2, giao diện tĩnh và không có chuyển động tự động.
- Visual density: 6, nhiều thông tin nhưng được chia thành hai tầng rõ ràng.
- Theme: sáng, nền trắng và xanh rất nhạt.
- Màu chính: xanh Nancy và cam; xanh ngọc, tím, xanh lá và hồng chỉ dùng làm màu phân loại nhỏ trong icon, đường sóng và dải lợi ích như bản mẫu.
- Hệ bo góc: thẻ 28px, khung lớn 24px, dải lợi ích 20px, icon tròn.

## Cấu trúc nội dung

### Tiêu đề

- Dòng đầu: `TỰ HÀO 10+ NĂM HOẠT ĐỘNG`.
- Dòng thứ hai: `GIẢNG DẠY TIẾNG ANH`.
- `10+ NĂM HOẠT ĐỘNG` dùng màu cam và có nét gạch cong bên dưới.
- Giữ `id="about-heading"`, `role="heading"` và `aria-level="2"` hiện tại.

### Dòng giá trị cốt lõi

Ngay dưới tiêu đề là một pill trắng có bóng xanh nhẹ với nội dung:

`UY TÍN - CHẤT LƯỢNG - TẬN TÂM - HIỆU QUẢ`

Hai bên pill có đường xanh ngắn và chấm cam trang trí. Các chi tiết này dùng pseudo-element và `aria-hidden` về mặt ngữ nghĩa.

### Khung năm thẻ

Khung chính có nền xanh rất nhạt, viền xanh mảnh và khoảng đệm rộng. Desktop dùng CSS Grid ba cột và hai hàng:

```text
01  02  03
04 LOGO 05
```

Nội dung thẻ:

1. `CHƯƠNG TRÌNH HỌC`
   - `Bài bản, khoa học, cập nhật liên tục`
   - Màu nhấn xanh dương, icon sách.
2. `GIÁO VIÊN GIÀU KINH NGHIỆM`
   - `Đội ngũ giáo viên giỏi chuyên môn, tận tâm và truyền cảm hứng`
   - Màu nhấn cam, icon mũ tốt nghiệp.
3. `CẬP NHẬT THEO CHUẨN QUỐC TẾ`
   - `Giáo trình hiện đại, tiệm cận chuẩn quốc tế`
   - Màu nhấn xanh dương, icon quả địa cầu.
4. `QUAN TÂM SÁT SAO`
   - `Theo sát quá trình học, đánh giá và hỗ trợ kịp thời`
   - Màu nhấn xanh ngọc, icon tiến bộ.
5. `HỖ TRỢ PHỤ HUYNH`
   - `Đồng hành cùng phụ huynh trong suốt quá trình học`
   - Màu nhấn tím, icon đồng hành.

Mỗi thẻ có:

- Nền trắng, bóng xanh nhẹ và bo góc lớn.
- Icon tròn ở giữa phía trên.
- Tiêu đề in đậm, nội dung tối đa ba dòng.
- Số `01-05` mờ ở góc dưới phải, dùng `aria-hidden="true"` vì chỉ là yếu tố trang trí do người dùng thiết kế.
- Hai lớp đường sóng màu ở cạnh dưới, tạo bằng pseudo-element CSS và không dùng ảnh nền.

Logo `images/logo.png` nằm giữa hàng thứ hai, trong một vòng tròn trắng có viền quỹ đạo mảnh. Các chấm màu quanh vòng tròn là trang trí CSS, không thêm nội dung hoặc chuyển động.

## Dải năm lợi ích

Dưới khung chính là một dải trắng có bóng nhẹ, chia thành năm mục. Mỗi mục có icon tròn, tiêu đề và mô tả:

1. `HỌC ĐÚNG MỤC TIÊU`
   - `Lộ trình cá nhân hóa theo năng lực`
2. `KẾT QUẢ THỰC CHẤT`
   - `Tiến bộ rõ rệt qua từng giai đoạn`
3. `MÔI TRƯỜNG TÍCH CỰC`
   - `Lớp học năng động, thân thiện`
4. `UY TÍN HƠN 10 NĂM`
   - `Được hàng nghìn học viên và phụ huynh tin tưởng`
5. `CỘNG ĐỒNG HỌC VIÊN`
   - `Kết nối - Chia sẻ - Cùng nhau phát triển`

Các mục được ngăn bằng một đường dọc mảnh trên desktop. Không dùng đường phân cách trên mobile.

## Câu kết

Phía cuối About có câu:

`Học tiếng Anh - Mở rộng tương lai`

Câu kết dùng màu xanh, cỡ chữ nổi bật vừa phải và font chữ viết tay hệ thống như `Segoe Script`, có nét gạch cam mảnh bên dưới. Không tải font mới.

## Icon

- Dùng inline SVG nhẹ, đồng nhất nét và phong cách với icon hiện có trên trang.
- Mọi icon trang trí có `aria-hidden="true"`.
- Không dùng emoji, icon font hoặc dependency ngoài.
- Màu icon được giới hạn theo bản mẫu và không thay đổi màu CTA của toàn trang.

## Responsive

- Từ 1024px: giữ đúng lưới `3 trên + 2 dưới`, logo giữa hàng hai.
- Từ 680px đến 1023px: thẻ chuyển thành hai cột; logo là mục cuối, cùng kích thước cân đối với thẻ.
- Dưới 680px: năm thẻ xếp một cột theo thứ tự `01-05`, logo đặt sau thẻ 05.
- Dải lợi ích: năm cột trên desktop, hai cột trên tablet, một cột trên điện thoại.
- Tiêu đề và pill giá trị giảm cỡ chữ; nội dung không tràn ngang ở 320px.
- Không dùng định vị tuyệt đối cho cấu trúc lưới; absolute chỉ được dùng cho số thứ tự, sóng và chấm trang trí bên trong phần tử có kích thước ổn định.

## Khả năng truy cập và hiệu năng

- Giữ heading semantics và nhãn section hiện tại.
- Năm thẻ dùng `article`, dải lợi ích dùng danh sách `ul` và `li`.
- Logo có `alt="Nancy English Center"`, `width="256"`, `height="256"`, `loading="lazy"` và `decoding="async"`.
- SVG trang trí không nhận focus.
- Màu chữ phải đạt tương phản dễ đọc trên nền trắng hoặc xanh nhạt.
- Không thêm JavaScript, animation hoặc request mạng mới.
- Ảnh tham khảo không được tải trên trang, vì vậy không tăng tải trang.

## Hợp đồng kiểm thử

- About giữ `aria-labelledby="about-heading"` và heading hiện tại.
- Dòng giá trị cốt lõi có đúng nội dung và chỉ xuất hiện một lần.
- Có đúng năm `article.about-showcase__card`, đúng tiêu đề, mô tả và thứ tự `01-05`.
- Có đúng một logo trong About, dùng `images/logo.png` với thuộc tính kích thước và tải lazy.
- CSS desktop có grid area:

```text
"card-1 card-2 card-3"
"card-4 brand card-5"
```

- CSS tablet có hai cột; CSS mobile dưới 680px có một cột.
- Dải lợi ích có đúng năm mục và đúng nội dung đã duyệt.
- Câu kết dùng đúng `Học tiếng Anh - Mở rộng tương lai`.
- Không còn class `achievement-orbit` hoặc `achievement-pill` trong HTML/CSS.
- Không tham chiếu ảnh tham khảo hoặc ba ảnh About cũ trong HTML/CSS; ba ảnh About cũ vẫn tồn tại vật lý.
- Focused test About phải vượt qua.
- Full suite không được phát sinh lỗi mới ngoài hai lỗi baseline đã được người dùng chấp thuận trước đó: tổng số ảnh lazy và chương trình bảy cấp độ.

## Ngoài phạm vi

- Không sửa phần chương trình bảy cấp độ hoặc test baseline liên quan.
- Không thay đổi nội dung các phần khác.
- Không tạo hoặc chỉnh sửa ảnh raster.
- Không thêm dark mode, animation, carousel hoặc tương tác mới.
- Không tạo commit vì workspace không phải Git repository.
