# About Experience Heading Design

## Mục tiêu

Thêm một tiêu đề kinh nghiệm nổi bật vào section `#about`, lấy cảm hứng từ ảnh người dùng cung cấp nhưng sử dụng nội dung và màu thương hiệu Nancy English Center.

## Nội dung chính xác

- Dòng 1: `TỰ HÀO 10+ NĂM HOẠT ĐỘNG`
- Dòng 2: `GIẢNG DẠY TIẾNG ANH`

## Vị trí

Khối mới nằm ngay sau tiêu đề `Về Nancy English Center` và trước đoạn mô tả kinh nghiệm hiện tại. Không thay thế hoặc xóa nội dung nào đang có.

## Trình bày

- Toàn bộ khối căn giữa và dùng chữ in hoa, đậm.
- `TỰ HÀO` và `GIẢNG DẠY TIẾNG ANH` dùng màu xanh thương hiệu.
- `10+ NĂM HOẠT ĐỘNG` dùng màu cam thương hiệu.
- Một đường cong màu cam nằm dưới cụm `10+ NĂM HOẠT ĐỘNG`, được tạo bằng CSS pseudo-element để không thêm ảnh hoặc SVG.
- Font kế thừa hệ typography hiện tại, ưu tiên `Baloo 2` cho cảm giác gần ảnh mẫu.
- Khoảng cách được giữ gọn để section không trở nên quá cao.

## Responsive

- Desktop hiển thị đúng hai dòng theo nội dung đã chốt.
- Tablet giảm font nhưng vẫn ưu tiên hai dòng.
- Mobile cho phép dòng đầu tự xuống hàng nếu cần, không tạo overflow ngang.
- Đường cong luôn bám theo chiều rộng cụm chữ cam.

## Phạm vi kỹ thuật

- Chỉnh `index.html` để thêm markup có class riêng.
- Chỉnh `styles.css` để thêm typography, màu, đường cong và breakpoint.
- Bổ sung kiểm thử hợp đồng vào `tests/page-contract.test.mjs`.
- Không cần thay đổi JavaScript.
- Không chỉnh sửa file ảnh, URL, anchor hoặc nội dung hiện tại.

## Tiêu chí nghiệm thu

- Câu mới xuất hiện đúng một lần trong `#about`.
- Hai dòng và phần nhấn màu khớp thiết kế đã duyệt.
- Có đường cong cam dưới cụm `10+ NĂM HOẠT ĐỘNG`.
- Không có overflow ngang tại 320px.
- Toàn bộ test hiện tại và test mới đều pass.
