# Thiết kế đồng bộ website Thien Uy theo hướng Professional Compact

Ngày: 2026-08-28

Trạng thái: Đã duyệt trong phiên brainstorming

Phạm vi: Toàn bộ website tĩnh nhiều trang trong `D:\Nancy\Web`

## 1. Bối cảnh

Thien Uy English Center là trung tâm tiếng Anh dành cho trẻ em và thiếu niên. Người dùng chính là phụ huynh truy cập bằng điện thoại, cần nhanh chóng đánh giá độ tin cậy của trung tâm, hiểu chương trình phù hợp và thực hiện một trong hai hành động:

1. Đăng ký kiểm tra trình độ miễn phí.
2. Gọi tư vấn qua số `0866 169 569`.

Website hiện có đầy đủ nội dung, ảnh thật, kết quả học viên, form Google Form và nhiều trang chuyên đề. Điểm cần cải thiện là hệ thống thị giác chưa hoàn toàn đồng bộ, nhiều trang sử dụng nhịp bố cục lặp lại, CTA chưa thống nhất và một số khu vực có khoảng trống lớn so với mật độ người dùng mong muốn.

## 2. Mục tiêu

- Tạo một hệ thống thị giác chuyên nghiệp, tin cậy và ấm áp cho toàn bộ website.
- Tăng số lượt đăng ký kiểm tra trình độ và gọi tư vấn.
- Giảm khoảng trống không cần thiết nhưng vẫn giữ khả năng đọc và phân cấp rõ ràng.
- Rút gọn, sắp xếp lại nội dung giữa các trang để hành trình phụ huynh ngắn hơn.
- Giữ các URL hiện có để tránh làm hỏng liên kết, SEO và thói quen sử dụng.
- Giữ website ở dạng HTML, CSS và JavaScript thuần, không thêm build step hoặc framework.
- Bảo toàn các hành vi đang hoạt động như menu mobile, sticky header, form, gallery, kết quả học viên và trang chi tiết khóa học.

## 3. Ngoài phạm vi

- Không thay logo hoặc tên thương hiệu Thien Uy English Center.
- Không thêm dark mode.
- Không thay đổi Google Form endpoint hoặc các `data-entry`.
- Không phát minh học phí, tên giáo viên, chứng chỉ, đánh giá, thành tích hoặc số liệu mới.
- Không thêm framework, thư viện UI, animation library hoặc CDN.
- Không xóa route hiện tại.
- Không tạo popup đăng ký hoặc hành vi gây gián đoạn.

## 4. Design Read và các thông số

Đọc thiết kế: website trung tâm Anh ngữ dành cho phụ huynh, mobile-first, chuyên nghiệp và đáng tin cậy nhưng vẫn gần gũi; dựa trên ảnh lớp học thật, hệ màu Thien Uy và HTML/CSS thuần.

- `DESIGN_VARIANCE: 7/10`: bố cục có bất đối xứng vừa đủ, ảnh và nội dung có nhịp riêng nhưng không mang tính thử nghiệm.
- `MOTION_INTENSITY: 4/10`: reveal ngắn, hover và phản hồi trạng thái; không parallax, marquee hoặc scroll hijack.
- `VISUAL_DENSITY: 6/10`: section chặt, CTA xuất hiện sớm, tránh các vùng trống lớn.
- Chế độ redesign: Preserve có tái cấu trúc nội dung. Giữ thương hiệu và route, thay đổi hệ thống trình bày và vị trí nội dung.

## 5. Hệ thống thị giác

### 5.1 Màu sắc

- Brand chính: `#0E4EA1`.
- Brand đậm cho hover: `#0A3B7D`.
- Accent chuyển đổi: `#C24C00`.
- Accent hover: `#A84200`.
- Accent text trên nền sáng: `#B04500`.
- Nền chính: trắng và các sắc xanh rất nhạt trong cùng họ thương hiệu.
- Chỉ sử dụng một brand màu xanh và một accent màu cam trên toàn site.
- Không dùng nền đen, section đảo theme hoặc gradient tím xanh.

### 5.2 Typography

- `Be Vietnam Pro` cho body, điều hướng, form và phần lớn heading.
- `Baloo 2` dành cho H1 và số liệu display khi cần tăng sự ấm áp.
- H1 phải giữ dấu tiếng Việt rõ ràng, không cắt dấu hoặc descender.
- H2 sử dụng phân cấp bằng cỡ chữ, trọng lượng và khoảng cách thay cho eyebrow lặp lại.
- Giới hạn eyebrow tối đa một trên ba section; ưu tiên bỏ hoàn toàn khi heading đã đủ rõ.

### 5.3 Khoảng cách và container

- Container nội dung: tối đa `1280px`.
- Gutter linh hoạt: `16-48px` tùy viewport.
- Padding section desktop: `40-68px`.
- Padding section mobile: `34-52px`.
- Ba cấp khoảng cách nội bộ chính: `12px`, `20px`, `28px`.
- Header desktop cao tối đa `72px` nếu nội dung cho phép; không vượt `80px`.
- Hero phải hiển thị headline, mô tả và CTA chính trong viewport đầu tiên ở kích thước phổ biến.

### 5.4 Hình khối và elevation

- Bán kính chính: `8px`, `12px`, `16px`; pill chỉ dành cho control có lý do rõ ràng.
- Shadow dùng sắc xanh thương hiệu với opacity thấp, không dùng shadow đen thuần.
- Chỉ dùng card khi card thể hiện nhóm nội dung thật; nếu không, dùng khoảng cách, nền section hoặc đường phân cách nhẹ.
- Ảnh thật là chất liệu chính. Không tạo screenshot giả bằng `div`, illustration trang trí hoặc logo giả.

## 6. Hero trang chủ đã duyệt

Hero sử dụng bố cục A2:

- Copy bên trái, ảnh thật bên phải và ảnh có độ hiện diện lớn.
- Không có dòng eyebrow “Anh ngữ tại An Phú”.
- H1 phải giữ chính xác hai dòng:

  `TIẾNG ANH VỮNG VÀNG -`<br>
  `TƯƠNG LAI TƯƠI SÁNG`

- Dòng thứ hai dùng accent cam.
- CTA chính: `Kiểm tra trình độ miễn phí`.
- CTA phụ: `Khám phá khóa học`.
- Ảnh hero hiện có tiếp tục là LCP asset và giữ preload, kích thước cùng `fetchpriority="high"`.
- Mobile xếp copy trước, ảnh sau; CTA chính chiếm bề ngang dễ chạm.

## 7. Kiến trúc thông tin

### 7.1 Điều hướng chính

Header desktop giữ năm điểm đến và một CTA:

1. Giới thiệu.
2. Khóa học.
3. Lộ trình.
4. Thành tích.
5. Liên hệ.
6. CTA `Kiểm tra trình độ miễn phí`.

Hotline hiển thị ở vùng header khi đủ không gian. Trên mobile, hotline không bị chôn trong menu mà xuất hiện trong thanh hành động cố định.

### 7.2 Vai trò từng route

| Route | Vai trò sau redesign | Thay đổi nội dung chính |
|---|---|---|
| `index.html` | Trang chủ chuyển đổi | Rút còn hero, bằng chứng tin cậy, khóa học nổi bật, phương pháp, thành tích và form |
| `about.html` | Câu chuyện và triết lý giảng dạy | Nhận thêm phần giới thiệu đội ngũ và cách tổ chức lớp |
| `teachers.html` | Trang hỗ trợ về đội ngũ | Rút gọn, không lặp toàn bộ nội dung `about.html`, chỉ dùng thông tin đã xác minh |
| `courses.html` | Danh mục chương trình | Nhóm khóa học theo nhu cầu và độ tuổi, dẫn tới trang chi tiết hoặc lộ trình |
| `course.html` | Mẫu chi tiết khóa học | Mục tiêu, nội dung, đối tượng, thông tin cần biết và CTA xếp lớp |
| `learning-path.html` | Hướng dẫn chọn lộ trình | Giúp phụ huynh xác định điểm bắt đầu, dẫn tới khóa học và form |
| `achievements.html` | Bằng chứng kết quả | Ưu tiên số liệu và ảnh kết quả thật, bảo vệ dữ liệu cá nhân |
| `activities.html` | Bằng chứng về môi trường học | Gallery ảnh thật, nội dung ngắn, CTA sau bằng chứng |
| `knowledge.html` | Nội dung hỗ trợ quyết định | Rút gọn, liên kết theo chủ đề và dẫn về khóa học phù hợp |
| `contact.html` | Trung tâm chuyển đổi | Form, hotline, Zalo, giờ làm việc, bản đồ và FAQ nổi bật |
| `faq.html` | Trang hỗ trợ chuyên sâu | Giữ route, rút gọn câu trả lời và dẫn về `contact.html#register` |

Các route phụ không cần xuất hiện trên top navigation nhưng vẫn được liên kết từ nội dung liên quan và footer.

## 8. Năm mẫu trang

### 8.1 Trang chủ chuyển đổi

Áp dụng cho `index.html`:

1. Hero A2.
2. Dải số liệu tin cậy.
3. Khóa học nổi bật bằng ảnh thật.
4. Phương pháp học, trình bày ngắn gọn.
5. Thành tích và số liệu có thể kiểm chứng.
6. Form kiểm tra trình độ.
7. CTA hỗ trợ và footer.

Không đặt hai section split ảnh và text giống nhau liên tiếp. Không dùng bốn card bằng nhau nếu có thể trình bày bằng dải số liệu hoặc một layout bất đối xứng.

### 8.2 Câu chuyện và đội ngũ

Áp dụng cho `about.html` và `teachers.html`:

- Hero trang con gọn, heading và ảnh thật.
- Câu chuyện phát triển và triết lý giảng dạy.
- Đội ngũ dưới dạng phần bằng chứng con người, không phát minh tên hoặc chứng chỉ.
- Không gian lớp học và phương pháp tổ chức.
- CTA xếp lớp ở cuối hành trình.

### 8.3 Chương trình học

Áp dụng cho `courses.html`, `course.html` và `learning-path.html`:

- Danh mục khóa học phân nhóm theo độ tuổi hoặc mục tiêu thay vì một danh sách dài.
- Course detail dùng một template thống nhất nhưng nội dung thay đổi theo query hiện tại.
- Lộ trình thể hiện quan hệ giữa các giai đoạn, không dùng bốn card giống nhau.
- CTA xuất hiện sau khi phụ huynh hiểu đối tượng và đầu ra, sau đó lặp ở cuối trang.

### 8.4 Bằng chứng và cộng đồng

Áp dụng cho `achievements.html`, `activities.html` và `knowledge.html`:

- Ảnh kết quả, hoạt động và nội dung thật là trọng tâm.
- Kết quả thi hiển thị theo nhóm, không dựng số liệu mới.
- Gallery giữ khả năng mở lightbox và điều khiển bằng bàn phím.
- Bài kiến thức được nhóm thành các cụm nhỏ, tránh danh sách đường dẫn dài.

### 8.5 Liên hệ và hỏi đáp

Áp dụng cho `contact.html` và `faq.html`:

- Form là khối chính của `contact.html`.
- Hotline, Zalo, email, giờ làm việc và bản đồ xuất hiện gần form.
- FAQ nổi bật nằm sau thông tin liên hệ để xử lý băn khoăn cuối cùng.
- `faq.html` vẫn tồn tại cho nội dung chuyên sâu và liên kết SEO.

## 9. Component dùng chung

Sáu nhóm component phải đồng bộ trên mọi trang:

1. Header và mobile navigation.
2. Button cùng các trạng thái hover, active, focus và busy.
3. Hero trang con.
4. Form đăng ký.
5. CTA cuối trang.
6. Footer.

Các thành phần dùng chung nằm trong `styles.css`. Các mẫu trang và biến thể nội dung nằm trong `pages.css`. Vì đây là website tĩnh không có template engine, header và footer trong từng HTML phải được đồng bộ bằng test contract.

## 10. Luồng chuyển đổi

- Một nhãn CTA chính trên toàn site: `Kiểm tra trình độ miễn phí`.
- Một nhãn CTA gọi điện: `Gọi tư vấn`.
- Trang chủ và trang liên hệ chứa form đầy đủ.
- Các trang khác sử dụng CTA gọn dẫn tới `contact.html#register` hoặc form trang chủ khi phù hợp.
- Trên mobile có thanh hành động cố định với đúng hai lựa chọn: `Gọi tư vấn` và `Kiểm tra trình độ miễn phí`.
- Không dùng nhiều nhãn khác nhau cho cùng một ý định.
- Không dùng popup, interstitial hoặc animation làm chậm thao tác.

## 11. Form và trạng thái lỗi

Form tiếp tục gửi dữ liệu tới Google Form hiện tại:

- Giữ nguyên `data-mode="google-form"`.
- Giữ nguyên `data-endpoint="https://docs.google.com/forms/d/e/1FAIpQLScZ61EKmEnvKekNxQALbSdPsFqJ7B7WB7fUYYF63QL_F_7sKg/formResponse"`.
- Giữ chính xác mapping `name` thành `entry.380148302`.
- Giữ chính xác mapping `phone` thành `entry.1988606558`.
- Giữ chính xác mapping `child` thành `entry.1215349974`.
- Giữ chính xác mapping `grade` thành `entry.1485252148`.
- Giữ chính xác mapping `note` thành `entry.153390468`.
- Giữ honeypot `website` không focus được và không dùng `display:none`.
- Lỗi hiển thị ngay dưới trường có vấn đề và liên kết bằng `aria-describedby`.
- Trường lỗi có border và focus ring rõ ràng, không chỉ đổi màu chữ.
- Khi gửi, nút chuyển sang trạng thái busy và ngăn gửi lặp.
- Khi thành công, hiển thị xác nhận rõ ràng trong vùng `aria-live`.
- Khi thất bại, giữ dữ liệu người dùng và cho phép thử lại.

## 12. Responsive và khả năng truy cập

Các viewport bắt buộc kiểm tra: `360`, `390`, `768`, `1024`, `1440`, `1920` pixel.

- Không có horizontal scroll trên body.
- Header chuyển sang menu mobile trước khi logo, nav hoặc CTA xuống hai dòng.
- Touch target tối thiểu `44x44px`.
- Form mobile dùng một cột và input tối thiểu `16px` để tránh iOS zoom.
- Ảnh có `width`, `height`, `loading` và `decoding` phù hợp.
- Focus visible áp dụng cho link, button, input, select, textarea, gallery item và control tương tác.
- `prefers-reduced-motion` tắt reveal, smooth scroll và chuyển động không cần thiết.
- Skip link, heading hierarchy và các thuộc tính ARIA hiện có phải được bảo toàn.
- Text và button phải đạt WCAG AA.

## 13. Motion

- Giữ scroll reveal bằng `IntersectionObserver` hiện tại nếu hành vi vẫn ổn định.
- Chỉ animate `transform` và `opacity`.
- Hover ảnh chỉ dùng scale rất nhẹ và không áp dụng khi reduced motion.
- Không thêm parallax, marquee, sticky scroll stack, horizontal scroll hijack hoặc cursor tùy biến.
- Tất cả animation phải phục vụ phân cấp, phản hồi hoặc trạng thái.

## 14. Cấu trúc triển khai

- `styles.css`: font-face, token, base, header, button, form, footer, focus, utility và component dùng chung.
- `pages.css`: năm mẫu trang, component theo nội dung và responsive page-level.
- `script.js`: giữ các hành vi dùng chung; chỉ sửa khi test chứng minh cần thay đổi.
- `pages.js`: giữ logic trang con hiện tại nếu vẫn cần.
- `course-detail.js`: giữ data binding và hành vi course detail.
- Các file HTML: tái cấu trúc section, rút gọn nội dung, đồng bộ header/footer và CTA.
- `tests/page-contract.test.mjs` và `tests/website-pages.test.mjs`: cập nhật contract cho navigation, route, CTA, form và nội dung bắt buộc.

Không thêm dependency hoặc build step.

## 15. SEO và bảo toàn liên kết

- Giữ mọi filename và route hiện tại.
- Mỗi trang giữ title, description, canonical và structured data phù hợp với nội dung sau redesign.
- Không đổi hotline, email, địa chỉ, Zalo hoặc Facebook.
- Không đổi form field mapping.
- Các nội dung chuyển sang trang khác cần có liên kết ngữ cảnh từ route cũ.
- Không dùng redirect bằng JavaScript hoặc meta refresh trong phạm vi redesign này.

## 16. Kiểm thử và xác minh

### 16.1 Tự động

- Chạy toàn bộ Node test hiện có.
- Chạy Python test cho công cụ xử lý ảnh nếu file liên quan bị ảnh hưởng.
- Kiểm tra mọi HTML nội bộ được liên kết đều tồn tại.
- Kiểm tra mỗi trang có đúng một H1, skip link, main landmark, header và footer.
- Kiểm tra CTA chính dùng nhãn thống nhất.
- Kiểm tra form endpoint và `data-entry` không đổi.
- Kiểm tra không có ký tự mojibake trong nội dung tiếng Việt.
- Kiểm tra không có em dash hoặc en dash trong chuỗi hiển thị mới.

### 16.2 Thủ công

- Menu mobile mở, đóng, đóng bằng Escape và trả focus.
- Sticky header chuyển trạng thái đúng.
- Thanh CTA mobile không che nội dung hoặc control cuối trang.
- Form hiển thị lỗi, busy, success và retry đúng.
- Gallery mở lightbox bằng click, Enter và đóng bằng Escape.
- Trang khóa học đổi nội dung theo query hiện tại.
- Focus order hợp lý và focus ring luôn nhìn thấy.
- Không tràn ngang tại sáu viewport bắt buộc.
- Headline tiếng Việt không bị cắt dấu.
- Ảnh hero không gây CLS và CTA hero nằm trong viewport đầu tiên.

## 17. Tiêu chí hoàn tất

Redesign được coi là hoàn tất khi:

- Toàn bộ route hiện tại vẫn hoạt động.
- Hệ thống A2 và Professional Compact xuất hiện nhất quán trên mọi trang.
- H1 trang chủ đúng nội dung đã duyệt và không có eyebrow “Anh ngữ tại An Phú”.
- Header, footer, CTA và form đồng bộ.
- Trang chủ và contact tạo đường dẫn ngắn tới đăng ký.
- Mobile có hotline và CTA trong một chạm.
- Không có khoảng trống section vượt quá hệ thống đã duyệt nếu không có lý do nội dung.
- Không có regression về menu, form, gallery, course detail, SEO hoặc accessibility.
- Tất cả test tự động vượt qua và kiểm tra responsive thủ công đạt yêu cầu.
