# Thiết kế hai hàng khóa học tự động

## Mục tiêu

Hai hàng khóa học nằm gần nhau hơn và tự động chuyển động liên tục theo
hai hướng đối nghịch. Hàng trên trôi sang phải, hàng dưới trôi sang trái.
Chuyển động phải nhẹ, liền mạch và không làm mất khả năng kéo ngang thủ công.

## Bố cục

- Bỏ hai thanh nút điều hướng và toàn bộ nút mũi tên khỏi HTML.
- Bỏ đường phân cách, khoảng đệm phía trên của hàng thứ hai.
- Giữ khoảng cách dọc giữa hai hàng ở mức 8-10px trên desktop và mobile.
- Giữ kích thước, nội dung và phong cách hiện tại của từng thẻ khóa học.

## Chuyển động

- Dùng `requestAnimationFrame` để cập nhật `scrollLeft` theo thời gian thực,
  tránh phụ thuộc vào tốc độ khung hình.
- Tốc độ mục tiêu là 28px/giây cho cả hai hàng.
- Hàng đầu giảm `scrollLeft` để nội dung trôi sang phải.
- Hàng thứ hai tăng `scrollLeft` để nội dung trôi sang trái.
- JavaScript nhân đôi các thẻ khóa học sau khi tải trang. Khi vị trí cuộn đi
  hết chiều rộng của một bộ thẻ, vị trí được quy đổi về bộ tương ứng để vòng
  lặp không có bước nhảy nhìn thấy được.
- Các bản sao chỉ phục vụ trình bày, được đánh dấu `aria-hidden="true"` để
  trình đọc màn hình không đọc nội dung lặp.

## Tương tác và khả năng tiếp cận

- Một hàng tạm dừng khi con trỏ chuột nằm trên hàng đó.
- Một hàng tạm dừng khi focus bàn phím nằm trong hàng đó.
- Một hàng tạm dừng trong lúc người dùng nhấn hoặc kéo trên hàng đó.
- Hàng tiếp tục chạy khi hover, focus hoặc thao tác kéo tương ứng kết thúc.
- Hai hàng quản lý trạng thái độc lập; dừng một hàng không làm dừng hàng kia.
- Người dùng vẫn có thể cuộn bằng chuột, trackpad, bàn phím và thao tác chạm.
- Khi `prefers-reduced-motion: reduce` được bật, tự động chạy bị vô hiệu hóa,
  nhưng cuộn thủ công vẫn hoạt động.
- Tự động chạy tạm dừng khi tab trình duyệt bị ẩn và tiếp tục khi tab hiện lại.

## Kiểm thử

- Kiểm tra HTML không còn nút điều hướng khóa học.
- Kiểm tra hai carousel được khởi tạo theo hai hướng đối nghịch.
- Kiểm tra vị trí cuộn thay đổi dựa trên thời gian khung hình.
- Kiểm tra hover, focus và pointer tạm dừng đúng từng hàng.
- Kiểm tra rời hover, mất focus và nhả pointer tiếp tục chuyển động.
- Kiểm tra chế độ giảm chuyển động không khởi chạy animation.
- Chạy toàn bộ bộ kiểm thử hiện có để phát hiện hồi quy.
