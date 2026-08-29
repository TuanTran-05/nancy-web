# Course Learning Path Carousel Design

## Mục tiêu

Thay bốn thẻ khóa học tổng quan trong `#courses` bằng một lộ trình gồm bảy khóa học cụ thể: Happy Kids, Starter, Movers, Flyers, KET, PET và IELTS. Phần mới lấy cảm hứng từ thẻ ảnh trong tài liệu tham khảo nhưng được thu gọn thành thanh cuộn ngang để phù hợp với nhịp bố cục hiện tại và tránh hàng cuối bị lẻ.

## Chế độ thiết kế

- Loại công việc: Redesign - Preserve.
- `DESIGN_VARIANCE: 4`: giữ cấu trúc ổn định của trang, dùng thanh ngang để tạo khác biệt vừa đủ.
- `MOTION_INTENSITY: 2`: chỉ dùng hover, active, focus và cuộn theo thao tác của người dùng.
- `VISUAL_DENSITY: 5`: mỗi thẻ có đủ ảnh, cấp lớp và mục tiêu nhưng phần khóa học không kéo dài quá mức.
- Nền tảng: HTML, CSS và JavaScript thuần hiện có. Không thêm framework hoặc dependency.

## Phạm vi thay đổi

- Giữ nguyên section `#courses`, tiêu đề “Các khóa học nổi bật” và liên kết điều hướng tới section.
- Xóa bốn thẻ tổng quan hiện có trong `.cards-4`.
- Thêm bảy thẻ khóa học theo đúng thứ tự lộ trình.
- Thêm hai nút điều hướng trước và sau cho thanh khóa học.
- Thêm bảy ảnh khóa học mới có phong cách đồng nhất.
- Không thay đổi header, hero, giới thiệu, hoạt động, liên hệ, footer, lightbox hoặc menu mobile ngoài phần kiểm thử hồi quy cần thiết.

## Nội dung khóa học

| Thứ tự | Khóa học | Cấp lớp hiển thị | Mô tả |
| --- | --- | --- | --- |
| 1 | Happy Kids | Lớp 2 trở xuống | Làm quen tiếng Anh qua trò chơi, âm nhạc và hoạt động tương tác. |
| 2 | Starter | Lớp 3 | Xây dựng từ vựng, mẫu câu và phản xạ giao tiếp nền tảng. |
| 3 | Movers | Lớp 4 | Phát triển cân bằng nghe, nói, đọc, viết qua chủ đề gần gũi. |
| 4 | Flyers | Lớp 5 | Củng cố kỹ năng và chuẩn bị nền tảng cho chứng chỉ Cambridge. |
| 5 | KET | Lớp 6-7 | Rèn năng lực tiếng Anh trình độ A2 và kỹ năng làm bài. |
| 6 | PET | Lớp 8-9 | Phát triển tiếng Anh trình độ B1 cho học tập và giao tiếp. |
| 7 | IELTS | Từ lớp 10 | Xây dựng tư duy học thuật và chiến lược cho bốn kỹ năng. |

Tên khóa học, cấp lớp và mô tả được hiển thị đúng như bảng. Không thêm điểm số cam kết, tỷ lệ thành công hoặc số liệu không có nguồn.

## Hình ảnh

- Tạo bảy ảnh riêng ở tỷ lệ 4:3, kích thước mục tiêu 1280 x 960 pixel.
- Phong cách ảnh: nhiếp ảnh lớp học sáng, học viên Việt Nam đúng nhóm tuổi, biểu cảm tự nhiên, hoạt động học tập phù hợp từng cấp độ.
- Màu trang phục và đạo cụ ưu tiên xanh, cam và trắng để liên kết với nhận diện Nancy.
- Không tạo logo, huy hiệu hoặc chữ thương hiệu giả trên trang phục.
- Không đặt nhãn, badge hoặc chữ phủ lên ảnh.
- Mỗi ảnh có tên tệp ổn định và văn bản thay thế mô tả đúng nội dung nhìn thấy.
- Ảnh dùng `loading="lazy"`, `decoding="async"`, khai báo `width` và `height` để tránh dịch chuyển bố cục.

Tên tệp:

- `images/course-happy-kids.jpg`
- `images/course-starter.jpg`
- `images/course-movers.jpg`
- `images/course-flyers.jpg`
- `images/course-ket.jpg`
- `images/course-pet.jpg`
- `images/course-ielts.jpg`

## Bố cục và hệ thống thị giác

### Section header

- Giữ nguyên kiểu tiêu đề và gạch cam đang có để không phá nhận diện.
- Thêm một câu dẫn ngắn dưới tiêu đề: “Lộ trình tiếng Anh phù hợp theo từng độ tuổi và mục tiêu học tập.”
- Hai nút điều hướng nằm trong một hàng điều khiển riêng phía trên thanh thẻ, không tạo đoạn mô tả nổi ở góc tiêu đề.

### Course track

- Dùng một hàng ngang với `display: flex`, `overflow-x: auto` và `scroll-snap-type: x mandatory`.
- Mỗi thẻ dùng `scroll-snap-align: start` và không co lại.
- Desktop rộng hiển thị khoảng ba thẻ đầy đủ cùng một phần thẻ kế tiếp.
- Tablet hiển thị khoảng hai thẻ cùng một phần thẻ kế tiếp.
- Mobile hiển thị một thẻ gần trọn chiều rộng và cho phép vuốt ngang tự nhiên.
- Track có khoảng trống cuối đủ để thẻ IELTS căn đúng điểm snap, không tạo ô trống giả.

### Course card

- Ảnh 4:3 ở phía trên, dùng `object-fit: cover` và cùng chiều cao hiển thị.
- Phần chữ ở dưới ảnh gồm tên khóa học, cấp lớp và mô tả.
- Tên khóa học dùng xanh thương hiệu; cấp lớp dùng cam thương hiệu trên nền nhạt có độ tương phản đạt chuẩn.
- Mô tả tối đa hai đến ba dòng ở kích thước desktop.
- Card dùng bán kính 12px, border xanh xám mảnh và shadow nhuốm xanh nhẹ như hệ thống hiện tại.
- Hover chỉ nâng card tối đa 2px. Active tạo phản hồi nhấn nhẹ.
- Mọi thẻ có chiều cao đồng đều trong cùng breakpoint.

## Tương tác và progressive enhancement

HTML và CSS là trạng thái nền tảng. Người dùng luôn có thể cuộn bằng chuột, trackpad, bàn phím hoặc vuốt cảm ứng mà không cần JavaScript.

JavaScript chỉ nâng cấp hai nút điều hướng:

1. Tìm container khóa học, track và hai nút bằng data attribute riêng.
2. Nếu thiếu bất kỳ thành phần nào, bỏ qua phần khởi tạo và không gây lỗi cho menu hoặc lightbox.
3. Khi khởi tạo thành công, hiển thị hai nút điều hướng.
4. Mỗi lần bấm, cuộn một khoảng bằng chiều rộng thẻ hiện tại cộng với khoảng cách giữa hai thẻ.
5. Nút trước bị vô hiệu hóa ở đầu track; nút sau bị vô hiệu hóa ở cuối track.
6. Trạng thái nút được cập nhật sau thao tác cuộn và khi kích thước track thay đổi.
7. Cuộn mượt chỉ dùng khi người dùng không yêu cầu giảm chuyển động. Với `prefers-reduced-motion: reduce`, chuyển vị trí tức thời.

Không dùng vòng lặp animation, listener theo dõi toàn trang hoặc thư viện chuyển động.

## Khả năng truy cập

- Section dùng `aria-labelledby` liên kết tới tiêu đề hiện tại.
- Track có tên truy cập mô tả đây là lộ trình các khóa học.
- Hai nút dùng `<button type="button">` và nhãn tiếng Việt rõ nghĩa.
- Trạng thái `disabled` phản ánh đúng vị trí đầu hoặc cuối.
- Focus ring giữ màu cam nhạt có độ tương phản rõ trên nền section.
- Thứ tự DOM trùng với thứ tự học từ Happy Kids tới IELTS.
- Nội dung vẫn đọc được đầy đủ khi CSS hoặc JavaScript không tải.

## Luồng dữ liệu và xử lý lỗi

Toàn bộ dữ liệu khóa học là nội dung tĩnh trong HTML; không có API, trạng thái tải hoặc trạng thái rỗng.

Các trường hợp suy giảm được xử lý như sau:

- Ảnh không tải: văn bản thay thế vẫn mô tả khóa học và kích thước khai báo giữ nguyên bố cục.
- JavaScript không tải: thanh cuộn ngang vẫn hoạt động tự nhiên, nút tăng cường không xuất hiện.
- Thiếu một phần tử carousel trong DOM: hàm khởi tạo trả về sớm, các chức năng khác tiếp tục hoạt động.
- Trình duyệt không hỗ trợ cuộn mượt: hành vi tự hạ xuống cuộn tức thời.

## Kiểm thử

### Contract tests

- `#courses` vẫn tồn tại và giữ nguyên tiêu đề chính.
- Section chứa đúng bảy `.course-card`.
- Tên khóa học xuất hiện đúng một lần và theo thứ tự đã duyệt.
- Cấp lớp của từng khóa khớp bảng nội dung.
- Mỗi thẻ có ảnh riêng, văn bản thay thế, `width="1280"`, `height="960"`, `loading="lazy"` và `decoding="async"`.
- CSS chứa track ngang, `overflow-x: auto`, scroll snap và kích thước thẻ responsive.
- Không có chữ phủ lên ảnh và không có em dash hoặc en dash trong nội dung hiển thị.

### Behavior tests

- Nút tiếp theo cuộn đúng một thẻ.
- Nút quay lại cuộn đúng một thẻ theo hướng ngược lại.
- Nút trước bị vô hiệu hóa ở đầu; nút sau bị vô hiệu hóa ở cuối.
- Khởi tạo an toàn khi thiếu carousel.
- Các test menu mobile và lightbox hiện có tiếp tục đạt.

### Kiểm tra trực quan

- Ở 1320px, thấy khoảng ba thẻ và một phần thẻ kế tiếp.
- Ở tablet, thấy khoảng hai thẻ và một phần thẻ kế tiếp.
- Ở 320px, một thẻ gần trọn chiều rộng, không có overflow toàn trang.
- Nội dung không bị cắt, nút không xuống dòng, ảnh không méo.
- Card, tiêu đề, màu sắc và bán kính đồng bộ với phần còn lại của trang.
- Kiểm tra focus, thao tác bàn phím và chế độ giảm chuyển động.

## Tiêu chí nghiệm thu

- Bốn thẻ tổng quan cũ được thay hoàn toàn bằng bảy khóa học đã duyệt.
- Lộ trình hiển thị đúng thứ tự từ Happy Kids tới IELTS.
- Bố cục giữ được tinh thần thẻ ảnh của mẫu tham khảo nhưng không tạo section quá dài.
- Thanh khóa học hoạt động với chuột, bàn phím, trackpad và cảm ứng.
- JavaScript chỉ là progressive enhancement và không ảnh hưởng menu hoặc lightbox.
- Không thêm dependency và không thay đổi các section ngoài phạm vi.
- Toàn bộ kiểm thử Node đạt và không có lỗi JavaScript.

## Ngoài phạm vi

- Trang chi tiết riêng cho từng khóa học.
- Form đăng ký hoặc backend lưu thông tin học viên.
- CMS để quản lý khóa học.
- Thay đổi navigation, logo, thông tin liên hệ hoặc nội dung các section khác.
- Cam kết điểm thi hoặc kết quả đầu ra chưa được người dùng cung cấp.
