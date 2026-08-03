# Thiết kế hộp thoại thành tích học viên theo khóa học

## Mục tiêu

Bấm vào thẻ khóa học có kết quả sẽ mở một hộp thoại hiển thị ảnh phiếu điểm
thật của học viên khóa đó, kèm số liệu tổng hợp. Hiện tại bấm vào thẻ không có
phản hồi nào.

Bốn khóa có dữ liệu: KET, PET, IELTS, Luyện thi tuyển sinh 10.

## Cập nhật sau khi đọc toàn bộ 72 ảnh gốc (Task 2)

Hai phát hiện sau đây được ghi nhận khi thực thi Task 2 - đọc từng ảnh để lập
bản đồ che - và làm thay đổi số liệu cùng phạm vi kỹ thuật so với bản thiết kế
ban đầu ở trên. Phần thân spec giữ nguyên để thấy rõ giả định gốc; số liệu đúng
nằm ở đây.

**Thư mục không khớp loại chứng chỉ thật.** Thư mục `petresult` (20 ảnh) là hỗn
hợp: chỉ 11 ảnh thật sự là PET, 9 ảnh còn lại là chứng chỉ KET (toàn học viên
đạt Grade A, có lẽ bị tách lưu nhầm album). Số liệu đúng lấy theo nội dung ảnh,
không theo tên thư mục: **KET = 28** (19 từ `ketresult` + 9 lẫn trong
`petresult`), **PET = 11**.

**`result10` có ảnh nguồn từ tin nhắn riêng tư, không chỉ ảnh cổng tra điểm.**
Trong 25 ảnh, khoảng 8 ảnh là ảnh chụp màn hình Zalo hoặc Messenger - hiển thị
tên liên hệ đầy đủ ở thanh tiêu đề, nội dung tin nhắn cá nhân, và một trường
hợp còn nhắc tên kèm điểm của một học sinh khác. Một số ảnh cổng tra điểm còn
lộ thêm số định danh cá nhân, ngày sinh, địa chỉ phường/xã - không chỉ họ tên,
lớp, ngày đăng ký như dòng dưới đây từng ghi.

Quyết định xử lý (do người quản lý trung tâm chọn): với các ảnh nguồn từ
Zalo/Messenger, **cắt bỏ toàn bộ khung chat** (thanh tiêu đề, bong bóng tin
nhắn, avatar), chỉ giữ lại đúng khung "Kết Quả". Pipeline vì vậy cần thêm bước
cắt (crop) tùy chọn trước bước che, xem mục Pipeline bên dưới.

Một trong 25 ảnh `result10` (đoạn chat Zalo nhắc điểm số bằng văn bản thuần,
không có khung "Kết Quả" nào được chia sẻ) không còn gì hợp lệ để giữ lại sau
khi áp quyết định trên - ảnh này bị loại khỏi bản đồ che, không xử lý. Số liệu
đúng: **ts10 = 24**, tổng toàn bộ **71 ảnh** (không phải 72).

## Ràng buộc về dữ liệu cá nhân

Toàn bộ 72 ảnh là giấy tờ gốc chứa thông tin định danh học sinh:

| Nhóm | Thông tin nhạy cảm |
| --- | --- |
| IELTS | Họ tên, ngày sinh, ảnh chân dung, số báo danh, số TRF |
| KET, PET | Họ tên, Centre Reference, Verification Number |
| Tuyển sinh 10 | Họ tên, lớp, ngày đăng ký, và ở một số ảnh: số định danh cá nhân, ngày sinh, địa chỉ phường/xã, nội dung tin nhắn riêng tư |

Cặp Centre Reference và Verification Number cho phép bất kỳ ai tra cứu kết quả
tại `cambridgeenglish.org/verifiers`. Nghị định 13/2023/NĐ-CP yêu cầu sự đồng ý
của cha mẹ khi công khai dữ liệu cá nhân của trẻ dưới 16 tuổi.

Vì vậy trang chỉ được phục vụ ảnh đã che, và ảnh gốc không được nằm trong thư
mục triển khai.

**Việc che phải được ghi thẳng vào file ảnh.** Phủ phần tử HTML lên trên ảnh gốc
không đạt yêu cầu: người xem mở ảnh trong tab mới là thấy nguyên bản.

Vùng giữ nguyên: điểm số, xếp loại, thang CEFR, logo tổ chức cấp, con dấu.
Vùng che: họ tên, ngày sinh, ảnh chân dung, mọi mã số định danh và mã tra cứu.

## Pipeline xử lý ảnh

Chạy offline một lần bằng `tools/redact-results.py` (Pillow 12.3 đã có sẵn trên
máy).

Với mỗi ảnh, script:

1. Nếu ảnh có khai báo `crop` (chỉ áp dụng cho ảnh nguồn Zalo/Messenger trong
   Tuyển sinh 10), cắt về đúng vùng khung "Kết Quả" trước, bỏ toàn bộ khung
   chat xung quanh.
2. Vẽ hình chữ nhật đặc màu `#16212e` lên các vùng nhạy cảm còn lại, tọa độ
   tính theo ảnh **sau khi cắt** (nếu có cắt).
3. Chuẩn hoá lên một khung cố định cho từng khóa, nền trắng, ảnh đặt lọt trong
   khung theo kiểu contain.
4. Thu nhỏ về cạnh dài tối đa 1200px và mã hoá lại JPEG chất lượng 82.
5. Ghi ra `images/results/<khóa>/NN.jpg` với tên tuần tự.

Kích thước ảnh gốc không đồng nhất nên không thể dùng một bộ tọa độ tỉ lệ chung
cho cả thư mục:

| Thư mục | Số ảnh | Kích thước |
| --- | --- | --- |
| `ketresult` | 19 | Đồng nhất quanh 1075x1520 |
| `petresult` | 20 (11 PET + 9 KET lẫn) | Đồng nhất quanh 1080x1515 |
| `ieltsresult` | 8 | Mỗi ảnh một khung khác nhau: chụp scan, chụp màn hình điện thoại, ảnh CamScanner |
| `result10` | 25 | 18 kích thước khác nhau, từ 692x362 đến 1820x900; khoảng 8 ảnh cần cắt trước khi che vì chụp từ khung chat

Tọa độ che của từng ảnh được ghi riêng trong `tools/redact-map.json`. Bản đồ này
được lập trong cùng lượt đọc ảnh dùng để trích điểm, nên mỗi ảnh chỉ mở một lần.

Khung chuẩn hoá theo khóa:

| Khóa | Khung | Cột desktop | Cột dưới 720px |
| --- | --- | --- | --- |
| KET, PET, IELTS | 1075x1520 (dọc) | 4 | 2 |
| Tuyển sinh 10 | 1280x720 (ngang) | 2 | 1 |

Ảnh ngang của Tuyển sinh 10 rút về một cột trên màn hình hẹp; xếp hai cột sẽ
làm chữ trong ảnh nhỏ tới mức không đọc được.

Ảnh gốc chuyển sang `_private/` ở gốc dự án và thêm vào `.gitignore`. Thư mục
`images/` đang được triển khai nguyên vẹn, nên để ảnh gốc lại trong đó đồng
nghĩa với việc vẫn công khai chúng.

Dung lượng dự kiến giảm từ 9,4 MB xuống khoảng 1,5 MB.

## Dữ liệu

`results-data.js` chứa dữ liệu thuần, không có logic:

```js
window.NANCY_RESULTS = {
  ket: {
    label: "KET",
    cefr: "A2",
    grade: "Lớp 6-7",
    org: "Cambridge English",
    ratio: "portrait",
    stats: { total: 28, highest: 143, range: "A2-B1" },
    items: [
      { src: "images/results/ket/01.jpg", caption: "Pass · Grade B", meta: "136 · A2" }
    ]
  }
};
```

Số liệu trong `stats` và nhãn trong `items` được đọc trực tiếp từ ảnh, không
suy diễn. Ảnh nào không đọc được điểm rõ ràng thì `caption` và `meta` để chuỗi
rỗng, và mục đó hiển thị không có nhãn.

Không đưa lên trang bất kỳ chỉ số nào không kiểm chứng được từ ảnh. Cụ thể,
không nêu tỉ lệ đỗ: bộ ảnh chỉ gồm các em đã đạt nên không xác định được mẫu số.

## Thẻ khóa học

Bốn thẻ có dữ liệu nhận thêm thuộc tính `data-results`. Thuộc tính `data-course`
sẵn có giữ nguyên, không đổi tên:

| `data-course` (đã có) | `data-results` (thêm) | Thư mục ảnh gốc |
| --- | --- | --- |
| `ket` | `ket` | `ketresult` |
| `pet` | `pet` | `petresult` |
| `ielts` | `ielts` | `ieltsresult` |
| `tuyen-sinh-10` | `ts10` | `result10` |

Bốn thẻ này được bổ sung:

- Huy hiệu số lượng ở góc trên ảnh, dạng `19 kết quả`.
- Một phần tử `button` trong thân thẻ với nhãn `Xem thành tích`, đóng vai trò
  điểm kích hoạt cho bàn phím và trình đọc màn hình.
- Toàn bộ thẻ cũng nhận sự kiện bấm để mở hộp thoại, thuận tiện cho chuột và
  cảm ứng.

Bảy thẻ còn lại giữ nguyên hoàn toàn: không huy hiệu, không con trỏ tay, không
hiệu ứng hover mới. Thẻ không có dữ liệu thì không gợi ý rằng bấm được.

## Hộp thoại

Dùng lại hệ thống thiết kế sẵn có: `--brand` `#0e4ea1`, `--accent` `#c24c00`,
bo góc `--r-lg`, đổ bóng `--sh-3`, chữ Baloo 2 cho tiêu đề và Be Vietnam Pro cho
nội dung.

Cấu trúc từ trên xuống:

1. **Đầu hộp thoại** - huy hiệu trình độ, tên khóa, tổ chức cấp và cấp lớp.
2. **Dải số liệu** - ba ô: số học viên, điểm cao nhất, khoảng trình độ đạt.
3. **Lưới ảnh** - số cột theo bảng khung chuẩn hoá ở trên, rút về 2 cột dưới
   720px. Mỗi ô kèm nhãn điểm bên dưới.

Bấm vào một ảnh mở **lớp phóng to nằm trong chính hộp thoại**, không tạo hộp
thoại thứ hai. Lớp này có nút `‹` `›`, bộ đếm dạng `3 / 19` và nút quay lại lưới.

### Tương tác và khả năng tiếp cận

- Đóng bằng nút đóng, phím `Escape`, hoặc bấm ra nền tối.
- Ở lớp phóng to, `Escape` quay về lưới trước, nhấn lần nữa mới đóng hộp thoại.
- Bẫy focus trong hộp thoại khi đang mở.
- Trả focus về đúng nút đã kích hoạt khi đóng.
- Khóa cuộn nền bằng lối đã dùng cho lightbox thư viện.
- `aria-modal="true"`, `role="dialog"`, nhãn theo tên khóa.
- Chuyển cảnh tắt khi `prefers-reduced-motion: reduce`.
- Ảnh dùng `loading="lazy"` và chỉ được gắn `src` khi hộp thoại mở lần đầu, nên
  trang chủ không tải thêm byte nào nếu người xem không bấm.

## Kiến trúc tệp

| Tệp | Trạng thái | Vai trò |
| --- | --- | --- |
| `tools/redact-results.py` | mới | Pipeline che và chuẩn hoá ảnh |
| `tools/redact-map.json` | mới | Tọa độ vùng che của từng ảnh |
| `results-data.js` | mới | Dữ liệu điểm và số liệu tổng hợp |
| `results-modal.js` | mới | Thành phần hộp thoại |
| `script.js` | sửa | Thêm mục 8 nối thẻ khóa học với hộp thoại |
| `index.html` | sửa | `data-results`, huy hiệu, nút, khung hộp thoại |
| `styles.css` | sửa | Style hộp thoại, lưới, huy hiệu |

Hộp thoại nằm ở tệp riêng thay vì nối vào `script.js`. Tệp đó đang có 527 dòng
và bảy mục; thêm khoảng 200 dòng nữa sẽ vượt tầm đọc thoải mái.

`results-modal.js` phơi ra một hàm khởi tạo duy nhất nhận vào phần tử khung hộp
thoại và đối tượng dữ liệu. Nó không tự tìm thẻ khóa học và không biết gì về
carousel; `script.js` chịu trách nhiệm nối hai bên. Nhờ vậy hộp thoại kiểm thử
được độc lập.

## Kiểm thử

Nối vào bộ kiểm thử `node:test` sẵn có.

`page-contract.test.mjs`:

- Đúng bốn thẻ mang `data-results`, và đó là `ket`, `pet`, `ielts`, `ts10`.
- Bảy thẻ còn lại không mang `data-results` và không có huy hiệu.
- Khung hộp thoại tồn tại trong `index.html` với các thuộc tính ARIA cần thiết.
- Mọi `src` khai báo trong `results-data.js` đều trỏ tới tệp có thật.
- `stats.total` của mỗi khóa bằng đúng số phần tử trong `items`.

`page-behavior.test.mjs`:

- Mở hộp thoại khi bấm thẻ có dữ liệu.
- Không phản ứng khi bấm thẻ không có dữ liệu.
- `Escape` từ lớp phóng to quay về lưới, `Escape` tiếp theo mới đóng.
- Focus trả về đúng nút kích hoạt sau khi đóng.
- Nút `‹` `›` chạy vòng đúng và bộ đếm khớp.

Kiểm thử chống rò rỉ dữ liệu cá nhân:

- `images/` không còn thư mục `ieltsresult`, `ketresult`, `petresult`,
  `result10`.
- Số ảnh trong `images/results/<khóa>` khớp số ảnh gốc tương ứng.
- `_private/` có mặt trong `.gitignore`.

Ngoài phần tự động, sau khi sinh ảnh phải đọc lại toàn bộ ảnh đã che để xác
nhận bằng mắt rằng không sót họ tên, mã tra cứu hay ảnh chân dung nào. Một vùng
che lệch vài phần trăm vẫn để lộ đúng thứ cần giấu, nên bước này không bỏ được.

## Ngoài phạm vi

- Bảy khóa chưa có ảnh kết quả không nhận thêm hành vi nào.
- Không xây trang thành tích riêng; kết quả chỉ xuất hiện trong hộp thoại.
- Không thêm chức năng tải ảnh về hay chia sẻ.
