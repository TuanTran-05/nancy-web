# Nancy English Center Reference Match Design

## Mục tiêu

Điều chỉnh landing page Nancy English Center để bám sát ảnh `ChatGPT Image Jul 21, 2026, 09_44_32 AM.png` nhất có thể, đồng thời giữ nguyên toàn bộ file ảnh hiện có, nội dung, logo, liên kết và cấu trúc thông tin chính.

## Chế độ thiết kế

- Loại công việc: Redesign - Preserve.
- `DESIGN_VARIANCE: 3`: bố cục ổn định, cân đối, ưu tiên độ giống ảnh.
- `MOTION_INTENSITY: 2`: chỉ giữ phản hồi hover và tương tác cần thiết.
- `VISUAL_DENSITY: 6`: nội dung tương đối dày, section gọn như ảnh tham chiếu.
- Nền tảng: HTML, CSS và JavaScript thuần hiện có. Không thêm thư viện hoặc dependency.

## Phạm vi giữ nguyên

- Giữ nguyên tất cả file trong `images/`.
- Không thay nội dung tiếng Việt, số điện thoại, email, địa chỉ hoặc URL liên hệ.
- Không đổi tên hoặc xóa các anchor `#about`, `#courses`, `#activities`, `#contact`.
- Giữ cấu trúc thông tin: header, hero, giới thiệu, khóa học, hoạt động, liên hệ và footer.
- Giữ lightbox ảnh và menu mobile, nhưng sửa hành vi và khả năng truy cập khi cần.

## Hướng triển khai

Áp dụng CSS-first với thay đổi HTML và JavaScript có kiểm soát. DOM hiện tại đã tương ứng gần như một-một với ảnh tham chiếu nên không viết lại trang. HTML chỉ được chỉnh khi một chi tiết thừa hoặc cấu trúc hiện tại ngăn cản độ khớp. JavaScript chỉ được chỉnh để sửa menu mobile, lightbox và các hiệu ứng không phù hợp với mức motion đã chốt.

## Hệ thống thị giác

### Màu sắc

- Giữ bảng màu xanh và cam của thương hiệu.
- Dùng xanh thương hiệu làm màu CTA xanh thay cho màu navy xám hiện tại.
- Giảm gradient và shadow không xuất hiện trong ảnh.
- Giữ nền trang sáng đồng nhất; các section chỉ thay đổi rất nhẹ trong cùng họ màu trắng và xanh xám.

### Hình dạng

- Button dùng bán kính khoảng 10-12px, không dùng pill hoàn toàn.
- Card dùng bán kính khoảng 10-12px.
- Icon tròn vẫn được giữ vì là đặc điểm chính của ảnh tham chiếu.
- Shadow mỏng, thiên xanh xám và chỉ dùng để tách card khỏi nền.

### Typography

- Giữ font hiện tại để tránh thay đổi nhận diện ngoài phạm vi.
- Giảm độ tròn và cảm giác quá lớn bằng cách hiệu chỉnh kích thước, line-height và weight.
- Hero tối đa hai dòng như ảnh.
- Section heading gọn, underline cam ngắn và đều.

## Bố cục desktop

### Header

- Tăng chiều rộng vùng nội dung để gần tỷ lệ ảnh tham chiếu.
- Cân lại kích thước logo, brand text, khoảng cách menu và hai CTA.
- Header nằm trên một hàng và không vượt quá chiều cao mục tiêu.
- Giữ sticky header nhưng giảm blur và shadow để trạng thái ban đầu giống ảnh tĩnh.

### Hero

- Hero dùng layout hai cột, copy bên trái và ảnh bên phải.
- Ảnh được giữ nguyên nhưng tăng vùng hiển thị, crop có kiểm soát và tràn về sát mép phải viewport.
- Thu gọn khoảng cách trong hero để CTA nằm trong vùng nhìn đầu tiên.
- Giữ sóng xanh, loại lớp màu cam không có trong ảnh và giảm chiều cao phần sóng.
- Không thêm nội dung hoặc CTA mới.

### Giới thiệu và khóa học

- Giảm padding dọc toàn section.
- Giữ ba card giới thiệu và bốn card khóa học.
- Thu gọn padding card, kích thước icon, khoảng cách chữ và shadow.
- Các card cùng hàng có chiều cao đồng đều như ảnh.

### Hoạt động

- Giữ nguyên năm ảnh và thứ tự hiện tại.
- Dùng một hàng năm ảnh trên desktop, tỷ lệ crop gần ảnh tham chiếu.
- Không hiển thị caption phủ lên ảnh ở trạng thái tĩnh hoặc hover.
- Giữ lightbox khi click.
- Thu gọn caption mô tả và thanh thống kê.

### Liên hệ

- Giữ bốn khối thông tin, hai CTA và bản đồ hiện tại.
- Thu gọn chiều cao card, button và bản đồ để gần tỷ lệ ảnh.
- Giữ bản đồ dạng minh họa hiện có, nhưng bỏ chuyển động pin và CTA nổi không xuất hiện trong ảnh.

### Footer

- Giảm padding dọc, kích thước logo và social icon.
- Giữ ba cột nội dung và copyright.
- Cân lại đường phân cột, khoảng cách và màu chữ để gần ảnh.

### Thành phần loại bỏ hoặc ẩn

- Floating Zalo và điện thoại ở góc màn hình.
- Caption phủ trên ảnh gallery.
- Chuyển động pin bản đồ.
- Hiệu ứng reveal hàng loạt khi cuộn nếu làm thay đổi trạng thái tĩnh của thiết kế.

## Responsive

- Dưới 980px, header chuyển sang menu hamburger.
- Menu mobile chỉ điều khiển navigation, không giữ logic `.header-cta.open` bị thiếu CSS hiện tại.
- Hero chuyển thành một cột với copy trước, ảnh sau.
- Grid 3 hoặc 4 cột chuyển thành 2 cột trên tablet và 1 cột trên mobile nhỏ.
- Gallery chuyển 3 cột trên tablet và 2 cột trên mobile.
- Contact và footer chuyển một cột khi không đủ chiều rộng.
- Không tạo overflow ngang ở bất kỳ breakpoint nào.

## Tương tác và khả năng truy cập

- Button có trạng thái hover, active và focus rõ ràng.
- Tôn trọng `prefers-reduced-motion`.
- Lightbox có thể mở bằng bàn phím từ gallery item.
- Khi mở lightbox, focus chuyển vào nút đóng; khi đóng, focus trả về gallery item đã kích hoạt.
- Escape đóng lightbox; click nền đóng lightbox.
- Không dùng animation liên tục.

## Tiêu chí nghiệm thu

- Desktop bám sát tỷ lệ header, hero, section, card, contact và footer trong ảnh tham chiếu.
- Tất cả ảnh và nội dung hiện tại được giữ nguyên.
- Hero và navigation không tràn hoặc xuống dòng ngoài ý muốn.
- Không còn button dạng pill lớn, floating contact, caption phủ gallery hoặc pin map chuyển động.
- Menu mobile mở và đóng ổn định.
- Lightbox hoạt động bằng chuột và bàn phím.
- Không có lỗi JavaScript trong console.
- HTML, CSS và JavaScript vượt qua kiểm tra cú pháp phù hợp với dự án tĩnh.
- Trang hoạt động ở desktop, tablet và mobile mà không xuất hiện thanh cuộn ngang.

## Ngoài phạm vi

- Không tạo hoặc chỉnh sửa ảnh.
- Không thay logo hoặc nội dung marketing.
- Không thay URL, thông tin liên hệ hoặc cấu trúc SEO.
- Không thêm framework, build tool hoặc package manager.
- Không triển khai backend, form gửi dữ liệu hoặc CMS.
