# Thiết kế cập nhật nhận diện Thien Uy English Center

## Mục tiêu

Cập nhật nhận diện chính trên website từ Nancy English Center sang Thien Uy English Center mà không làm mất các từ khóa Nancy đang hỗ trợ phụ huynh tìm thấy website trên Google.

## Phạm vi giao diện

- Đổi tên thương hiệu hiển thị cạnh logo ở đầu trang thành `THIEN UY ENGLISH CENTER`.
- Đổi tên thương hiệu hiển thị ở chân trang thành `THIEN UY ENGLISH CENTER`.
- Thay tài sản `images/logo.png` hiện tại bằng logo do người dùng cung cấp tại `https://i.postimg.cc/5NPyBH5z/8f924ba5-ebef-4ae7-837e-808057d68243.png`.
- Giữ nguyên bố cục, kích thước vùng logo và hành vi responsive hiện tại; chỉ điều chỉnh CSS nếu logo mới bị méo, cắt hoặc khó đọc.

## Phạm vi nội dung và SEO

- Giữ nguyên các đoạn mô tả hiện có nhắc đến Nancy English Center.
- Giữ nguyên thông tin liên hệ, liên kết Facebook, bản đồ và địa chỉ hiện tại.
- Cập nhật tiêu đề và metadata nhận diện để có cả `Thien Uy English Center` và `Nancy English Center`.
- Dữ liệu có cấu trúc dùng `Thien Uy English Center` làm tên chính và giữ `Nancy English Center` cùng `Anh Ngữ Nancy An Phú` như các tên nhận diện cũ/thay thế khi cấu trúc dữ liệu cho phép.
- Không thay các mô tả ảnh hoặc nội dung khóa học đang nhắc đến Nancy, nhằm bảo toàn nội dung và tín hiệu tìm kiếm cũ.

## Cách triển khai

Website là trang tĩnh. Thay đổi tập trung ở `index.html`, tài sản `images/logo.png` và các bài kiểm tra hợp đồng liên quan. Logo mới được lưu cục bộ thay vì tải trực tiếp từ Postimg để tránh phụ thuộc bên thứ ba và giữ tốc độ tải ổn định.

## Kiểm tra

- Xác nhận tên mới xuất hiện đúng ở đầu trang và chân trang.
- Xác nhận cả hai tên Thien Uy và Nancy đều còn trong metadata SEO.
- Xác nhận logo mới là tệp PNG hợp lệ và được dùng tại cả đầu trang lẫn chân trang.
- Chạy toàn bộ bộ kiểm thử hiện có và kiểm tra giao diện ở kích thước desktop/mobile nếu cần điều chỉnh CSS.

## Ngoài phạm vi

- Không đổi nội dung bài viết, khóa học, hình ảnh lớp học hoặc kết quả học viên.
- Không đổi URL, tên miền, số điện thoại, địa chỉ, Facebook hoặc vị trí bản đồ.
- Không thực hiện tái thiết kế giao diện.
