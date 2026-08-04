# Thiết kế popup thành tích dễ đọc

## Mục tiêu

Khi người xem bấm “Xem thành tích”, nội dung của một phiếu điểm phải đọc được ngay mà không cần nhận ra rằng ảnh thu nhỏ có thể bấm để phóng lớn. Việc chuyển giữa nhiều phiếu vẫn phải nhanh, rõ ràng và dùng được trên máy tính lẫn điện thoại.

## Phạm vi

Thay đổi chỉ áp dụng cho popup thành tích hiện có trong `results-modal.js` và các kiểu `results-*` liên quan trong `styles.css`. Dữ liệu tại `results-data.js`, nội dung phiếu điểm, thẻ khóa học và cấu trúc điều hướng của trang không thay đổi.

## Bố cục được chọn

Popup mở trực tiếp ở chế độ xem chi tiết với phiếu đầu tiên được chọn.

Trên màn hình máy tính, popup gồm ba vùng:

1. Thanh đầu chứa huy hiệu trình độ, tên kỳ thi, thông tin đơn vị và nút đóng.
2. Dải thống kê được thu gọn để giảm chiều cao nhưng vẫn giữ đủ số học viên, điểm cao nhất và trình độ đạt.
3. Khu vực xem kết quả gồm một phiếu lớn ở giữa và dải ảnh thu nhỏ ở bên phải.

Ảnh thu nhỏ đang được chọn có viền màu thương hiệu rõ ràng. Bộ đếm theo dạng “1 / 28” nằm chính giữa ngay dưới ảnh lớn.

Trên màn hình hẹp, ảnh lớn chiếm toàn bộ chiều rộng hữu dụng. Dải ảnh thu nhỏ chuyển xuống dưới, xếp theo hàng ngang và có thể cuộn ngang. Các nút điều hướng không che phần quan trọng của phiếu điểm.

## Tương tác

- Mở popup luôn chọn chỉ mục `0` và hiển thị phiếu đầu tiên ở kích thước lớn.
- Bấm một ảnh thu nhỏ sẽ chọn và hiển thị phiếu tương ứng.
- Nút trước và sau chuyển tuần tự giữa các phiếu, có vòng lại ở hai đầu.
- Phím mũi tên trái và phải thực hiện cùng hành vi với nút trước và sau khi popup đang mở.
- Phím Escape, nút đóng hoặc bấm nền tối sẽ đóng popup.
- Khi đóng, focus quay lại đúng phần tử đã mở popup.
- Trang nền bị khóa cuộn trong thời gian popup mở.

Chế độ lưới cũ không còn là màn hình mở mặc định. Người xem không phải thực hiện thêm một lần bấm mới đọc được phiếu điểm.

## Khả năng tiếp cận

- Popup tiếp tục dùng `role="dialog"`, `aria-modal="true"` và nhãn mô tả theo khóa học.
- Ảnh lớn có văn bản thay thế mô tả loại tài liệu nhưng không nêu tên học viên.
- Các ảnh thu nhỏ là nút bấm có nhãn truy cập; ảnh đang chọn dùng `aria-current="true"`.
- Nút trước, sau và đóng có nhãn tiếng Việt rõ ràng.
- Trạng thái focus phải nhìn thấy được bằng bàn phím.
- Chuyển động tôn trọng `prefers-reduced-motion`.

## Dữ liệu và trạng thái

`createResultsModal` tiếp tục giữ khóa học hiện tại, chỉ mục ảnh đang chọn và phần tử đã mở popup. Chỉ mục được đặt về `0` mỗi lần mở một khóa học hợp lệ. Hàm dựng giao diện chi tiết nhận khóa học và chỉ mục, sau đó tạo ảnh lớn, dải ảnh thu nhỏ, điều hướng và bộ đếm từ cùng mảng `course.items`.

Nếu khóa học không tồn tại hoặc không có phiếu điểm, popup không mở. Nếu một ảnh không tải được, phần còn lại của popup và các ảnh khác vẫn hoạt động; văn bản thay thế vẫn cung cấp ngữ cảnh cơ bản.

## Kiểm thử

Các kiểm thử hiện có về thoát HTML, khóa cuộn nền, đóng popup, trả focus và điều hướng vòng được giữ lại hoặc cập nhật theo màn hình mở mặc định.

Bổ sung hoặc điều chỉnh kiểm thử để xác nhận:

- Mở khóa học hợp lệ hiển thị ảnh đầu tiên và bộ đếm `1 / tổng số`.
- Dải ảnh thu nhỏ có đúng số phần tử và đánh dấu đúng ảnh đang chọn.
- Bấm ảnh thu nhỏ cập nhật ảnh lớn và bộ đếm.
- Nút trước, nút sau và phím mũi tên điều hướng vòng đúng.
- Escape đóng popup trực tiếp từ chế độ xem đã chọn.
- Khóa học không tồn tại hoặc không có mục kết quả không mở popup.
- CSS có điểm gãy phù hợp để dải ảnh chuyển từ cột bên phải sang hàng ngang bên dưới.

## Tiêu chí hoàn thành

- Trên màn hình máy tính phổ biến, người xem đọc được phiếu điểm ngay sau khi mở popup.
- Trên điện thoại, ảnh lớn không tràn chiều ngang và dải ảnh nhỏ cuộn ngang thuận tiện.
- Không cần quay về lưới để chọn phiếu khác.
- Toàn bộ điều hướng chuột và bàn phím hoạt động nhất quán.
- Bộ kiểm thử dự án vượt qua sau thay đổi.
