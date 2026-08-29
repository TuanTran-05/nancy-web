# Nancy Local Brand SEO Design

## Mục tiêu

Giúp trang chủ `https://thienuy.edu.vn/` đủ tín hiệu kỹ thuật và nội dung để Google có thể lập chỉ mục và liên kết website với hai truy vấn thương hiệu:

- `anh ngữ nancy an phú`
- `nancy english center`

Thiết kế này cải thiện khả năng được Google hiểu và hiển thị, nhưng không cam kết thứ hạng hoặc thời điểm xuất hiện vì kết quả cuối cùng do hệ thống Google quyết định.

## Phạm vi

Triển khai SEO thương hiệu và SEO địa phương trên website tĩnh hiện tại:

- Cập nhật metadata và nội dung nhận diện trên trang chủ.
- Thêm canonical, Open Graph và dữ liệu cấu trúc JSON-LD.
- Cập nhật địa chỉ, hotline và giờ hoạt động ở phần liên hệ.
- Thêm `robots.txt` và `sitemap.xml`.
- Thêm kiểm thử tự động cho các hợp đồng SEO quan trọng.
- Chuẩn bị checklist thao tác thủ công trên Google Search Console và Google Business Profile sau khi triển khai.

Không thay đổi bố cục hoặc phong cách hình ảnh của website, không tạo thêm trang nội dung và không triển khai Google Ads.

## Dữ liệu doanh nghiệp chuẩn

- Tên chính: `Nancy English Center`
- Tên thay thế: `Anh Ngữ Nancy An Phú`
- Website: `https://thienuy.edu.vn/`
- Điện thoại hiển thị: `0866 169 569`
- Điện thoại dạng máy đọc: `+84866169569`
- Địa chỉ đường: `Đường Nguyễn Văn Trỗi`
- Phường/khu vực: `An Phú`
- Tỉnh/thành phố: `Hồ Chí Minh`
- Mã bưu chính: `75256`
- Quốc gia: `VN`
- Giờ hoạt động: Thứ Hai đến Chủ Nhật, `08:00–19:30`
- Facebook: `https://www.facebook.com/anhngunancyanphu?locale=vi_VN`

Các giá trị này phải được dùng nhất quán trên website, Google Business Profile và các hồ sơ mạng xã hội.

## Phương án được chọn

Áp dụng SEO thương hiệu kết hợp SEO địa phương trên một trang chủ duy nhất. Đây là mức triển khai phù hợp cho website hiện tại: đủ tín hiệu để Google nhận diện tên thương hiệu, địa điểm và doanh nghiệp thật mà không tạo nhiều trang mỏng hoặc nhồi từ khóa.

## Metadata trang chủ

Trang chủ dùng các giá trị sau:

- Title: `Anh Ngữ Nancy An Phú | Nancy English Center`
- Meta description: `Nancy English Center – Anh Ngữ Nancy An Phú, trung tâm tiếng Anh tại Hồ Chí Minh dành cho thiếu nhi và thiếu niên. Liên hệ 0866 169 569.`
- Canonical: `https://thienuy.edu.vn/`
- Open Graph type: `website`
- Open Graph locale: `vi_VN`
- Open Graph site name: `Nancy English Center`
- Open Graph title đồng nhất với title trang.
- Open Graph description đồng nhất với meta description.
- Open Graph URL: `https://thienuy.edu.vn/`
- Open Graph image: `https://thienuy.edu.vn/images/logo.png`

Không thêm `meta keywords` vì Google không sử dụng thẻ này để xếp hạng web.

## Nội dung nhìn thấy

Giữ nguyên khẩu hiệu chính và cấu trúc hero. Chỉnh đoạn giới thiệu hero để có một lần xuất hiện tự nhiên của cụm:

`Nancy English Center – Anh Ngữ Nancy An Phú`

Phần liên hệ phải hiển thị:

- `Đường Nguyễn Văn Trỗi, An Phú, Hồ Chí Minh 75256`
- `0866 169 569`
- `Thứ Hai–Chủ Nhật, 08:00–19:30`

Tất cả liên kết gọi điện tiếp tục dùng `tel:0866169569`. Không thay bằng số `1900 886866`.

## Dữ liệu cấu trúc

Trang chủ chứa một khối JSON-LD với `@graph` để các thực thể dùng chung URL và tránh khai báo rời rạc.

### WebSite

- `@type`: `WebSite`
- `@id`: `https://thienuy.edu.vn/#website`
- `url`: `https://thienuy.edu.vn/`
- `name`: `Nancy English Center`
- `alternateName`: `Anh Ngữ Nancy An Phú`
- `inLanguage`: `vi-VN`

### EducationalOrganization và LocalBusiness

Một thực thể sử dụng nhiều kiểu:

- `@type`: `["EducationalOrganization", "LocalBusiness"]`
- `@id`: `https://thienuy.edu.vn/#organization`
- `name`: `Nancy English Center`
- `alternateName`: `Anh Ngữ Nancy An Phú`
- `url`: `https://thienuy.edu.vn/`
- `logo`: `https://thienuy.edu.vn/images/logo.png`
- `image`: `https://thienuy.edu.vn/images/logo.png`
- `telephone`: `+84866169569`
- `address`: `PostalAddress` chứa đầy đủ đường, khu vực, tỉnh/thành phố, mã bưu chính và quốc gia
- `openingHoursSpecification`: áp dụng cho cả bảy ngày, mở `08:00`, đóng `19:30`
- `sameAs`: URL Facebook hiện tại

Không khai báo tọa độ khi chưa có kinh độ và vĩ độ chính xác. Không khai báo `aggregateRating` hoặc review tự tạo.

## Thu thập dữ liệu và lập chỉ mục

### robots.txt

Cho phép tất cả crawler truy cập nội dung công khai và khai báo sitemap:

```text
User-agent: *
Allow: /

Sitemap: https://thienuy.edu.vn/sitemap.xml
```

### sitemap.xml

Sitemap ở thư mục gốc, sử dụng URL tuyệt đối và chỉ chứa URL canonical của trang chủ. Không thêm `changefreq` hoặc `priority` vì chúng không cần thiết cho sitemap một trang.

## Xử lý lỗi và tính nhất quán

- Mọi URL SEO phải dùng HTTPS và tên miền không có `www`.
- Canonical, Open Graph URL, sitemap và JSON-LD phải trỏ về cùng `https://thienuy.edu.vn/`.
- Ảnh chia sẻ và ảnh doanh nghiệp cùng dùng logo hiện tại tại `https://thienuy.edu.vn/images/logo.png`; không tạo URL ảnh không tồn tại.
- JSON-LD phải là JSON hợp lệ, không chứa comment và không chứa trường chưa có dữ liệu.
- Website không được chứa `noindex` hoặc chặn trang chủ trong `robots.txt`.

## Kiểm thử

Mở rộng bộ kiểm thử Node hiện tại để đọc file thật và xác nhận:

- Title có cả `Anh Ngữ Nancy An Phú` và `Nancy English Center`.
- Có meta description, canonical và các trường Open Graph đã thiết kế.
- Có đúng một khối JSON-LD hợp lệ.
- JSON-LD chứa đúng tên chính, tên thay thế, URL, hotline, địa chỉ và giờ hoạt động.
- Nội dung nhìn thấy chứa địa chỉ đầy đủ, hotline và giờ hoạt động.
- Không còn số `1900 886866` trong các file website production.
- `robots.txt` cho phép crawl và trỏ đúng sitemap.
- `sitemap.xml` hợp lệ và chứa đúng URL canonical.

Sau thay đổi, chạy toàn bộ bộ kiểm thử hiện có để phát hiện hồi quy giao diện hoặc hành vi.

## Công việc sau khi triển khai

Các bước này cần thực hiện bằng tài khoản Google của chủ doanh nghiệp:

1. Xác minh thuộc tính tên miền `thienuy.edu.vn` trong Google Search Console.
2. Gửi `https://thienuy.edu.vn/sitemap.xml`.
3. Dùng URL Inspection cho `https://thienuy.edu.vn/` và yêu cầu lập chỉ mục.
4. Tạo hoặc cập nhật Google Business Profile bằng đúng dữ liệu doanh nghiệp chuẩn trong tài liệu này.
5. Đặt website của hồ sơ doanh nghiệp thành `https://thienuy.edu.vn/`.
6. Đảm bảo tên, địa chỉ, hotline và giờ hoạt động trên Facebook khớp với website.

## Tiêu chí chấp nhận

- Website cung cấp đầy đủ metadata, canonical và dữ liệu cấu trúc đã thiết kế.
- Hai tên thương hiệu xuất hiện tự nhiên trong title, dữ liệu cấu trúc và nội dung trang.
- Địa chỉ, hotline và giờ hoạt động nhất quán trong nội dung và JSON-LD.
- `robots.txt` và `sitemap.xml` có thể truy cập ở thư mục gốc sau khi triển khai.
- Toàn bộ kiểm thử tự động vượt qua.
- Không có thay đổi ngoài phạm vi đối với bố cục, màu sắc, hình ảnh hoặc hành vi hiện tại.
