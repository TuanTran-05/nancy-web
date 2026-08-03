# Course Results Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bấm vào thẻ khóa học KET, PET, IELTS hoặc Tuyển sinh 10 mở hộp thoại hiển thị ảnh phiếu điểm học viên đã che thông tin cá nhân, kèm số liệu tổng hợp có thật.

**Architecture:** Một pipeline Python offline che thông tin cá nhân thẳng vào file ảnh và chuẩn hoá kích thước, sinh ra `images/results/`. Ảnh gốc chuyển ra `_private/` ngoài phạm vi triển khai. Phía trình duyệt, `results-modal.js` phơi ra các hàm dựng chuỗi HTML thuần cộng một hàm khởi tạo dùng uỷ nhiệm sự kiện; `script.js` nối thẻ khóa học với hộp thoại.

**Tech Stack:** HTML/CSS/JavaScript thuần không có bước build. Python 3 với Pillow 12.3 cho pipeline ảnh. Kiểm thử bằng `node:test` với DOM giả tự viết, và `unittest` cho Python.

## Global Constraints

- Không có bước build, không có `package.json`, không có phụ thuộc npm. JavaScript phải chạy trực tiếp trong trình duyệt.
- Lệnh chạy test JavaScript: `node --test "tests/*.test.mjs"`. Dạng `node --test tests/` **không chạy được** trên môi trường này.
- Lệnh chạy test Python: `python -m unittest discover -s tools -p "test_*.py"`.
- Baseline trước khi bắt đầu: 25 test pass, 0 fail.
- JavaScript theo phong cách sẵn có: `var`, hàm ẩn danh, `"use strict"`, không dùng cú pháp ES6+ trong tệp chạy ở trình duyệt.
- CSS chỉ dùng token sẵn có trong `:root`: `--brand` `#0e4ea1`, `--brand-tint` `#e4eefa`, `--accent` `#c24c00`, `--accent-tint` `#fcebdd`, `--surface` `#ffffff`, `--surface-2` `#f5f8fc`, `--text` `#16212e`, `--text-2` `#47566a`, `--text-3` `#64748b`, `--line` `#e2e9f1`, `--r-md` `12px`, `--r-lg` `18px`, `--r-pill` `999px`, `--sh-3`, `--ease`.
- Toàn bộ chữ hiển thị cho người dùng bằng tiếng Việt, dùng dấu gạch nối thường (`-`), không dùng gạch dài. Có một test sẵn có kiểm tra điều này.
- Màu che thông tin cá nhân: `#16212e` đặc, không dùng làm mờ. Làm mờ có thể đảo ngược được.
- Không đưa lên trang bất kỳ số liệu nào không đọc được trực tiếp từ ảnh. Không nêu tỉ lệ đỗ.

---

## File Structure

| Tệp | Trạng thái | Trách nhiệm |
| --- | --- | --- |
| `.gitignore` | Tạo | Loại `_private/` và `.superpowers/` khỏi git |
| `_private/` | Tạo | Ảnh gốc còn nguyên thông tin cá nhân, không triển khai |
| `tools/redact-map.json` | Tạo | Tọa độ vùng che và nhãn điểm của từng ảnh |
| `tools/redact_results.py` | Tạo | Hàm che, chuẩn hoá khung, ghi ảnh |
| `tools/test_redact_results.py` | Tạo | Test đơn vị cho pipeline ảnh |
| `images/results/` | Sinh ra | Ảnh đã che, phục vụ trên web |
| `results-data.js` | Tạo | Dữ liệu điểm, không logic |
| `results-modal.js` | Tạo | Hàm dựng HTML thuần và khởi tạo hộp thoại |
| `index.html` | Sửa | `data-results`, huy hiệu, nút, khung hộp thoại |
| `styles.css` | Sửa | Style hộp thoại, lưới, huy hiệu |
| `script.js` | Sửa | Mục 8 nối thẻ khóa học với hộp thoại |
| `tests/page-contract.test.mjs` | Sửa | Kiểm tra markup và chống rò rỉ dữ liệu |
| `tests/page-behavior.test.mjs` | Sửa | Kiểm tra hành vi hộp thoại |
| `tests/results-modal.test.mjs` | Tạo | Test cho hàm dựng HTML và khởi tạo |

`results-modal.js` không tự tìm thẻ khóa học và không biết gì về carousel. Nó nhận vào phần tử gốc và đối tượng dữ liệu. `script.js` chịu trách nhiệm nối hai bên. Nhờ vậy hộp thoại kiểm thử được mà không cần dựng cả trang.

---

## Task 1: Đưa ảnh gốc ra khỏi phạm vi triển khai

Làm đầu tiên. Chừng nào ảnh gốc còn nằm trong `images/` thì mọi lần triển khai đều công khai họ tên và mã tra cứu của học sinh.

**Files:**
- Create: `.gitignore`
- Move: `images/{ieltsresult,ketresult,petresult,result10}` sang `_private/`

**Interfaces:**
- Consumes: không có
- Produces: `_private/ieltsresult/`, `_private/ketresult/`, `_private/petresult/`, `_private/result10/` — thư mục nguồn cho Task 3

- [ ] **Step 1: Xác nhận ảnh gốc chưa từng được commit**

```bash
cd "D:/Nancy/Web"
git log --all --diff-filter=A --name-only -- "images/*result*" "images/result10/*"
```

Kết quả mong đợi: không in ra gì. Nếu có kết quả, ảnh đã nằm trong lịch sử git và phải xử lý lịch sử trước, dừng lại và báo lại.

- [ ] **Step 2: Tạo `.gitignore`**

```gitignore
# Ảnh gốc còn nguyên thông tin cá nhân của học sinh.
# Chỉ bản đã che trong images/results/ được phép triển khai.
_private/

# Phiên brainstorm trực quan
.superpowers/

# Tạm
*.zip
```

- [ ] **Step 3: Chuyển ảnh gốc sang `_private/`**

```bash
cd "D:/Nancy/Web"
mkdir -p _private
mv images/ieltsresult _private/ieltsresult
mv images/ketresult   _private/ketresult
mv images/petresult   _private/petresult
mv images/result10    _private/result10
```

- [ ] **Step 4: Xác nhận đã chuyển đủ và không mất ảnh**

```bash
cd "D:/Nancy/Web"
for d in ieltsresult ketresult petresult result10; do
  echo -n "$d: "; ls "_private/$d" | wc -l
done
ls images | grep -E "result" || echo "images/ đã sạch"
```

Kết quả mong đợi: `ieltsresult: 8`, `ketresult: 19`, `petresult: 20`, `result10: 25`, và dòng `images/ đã sạch`.

- [ ] **Step 5: Xác nhận git không còn thấy ảnh gốc**

```bash
cd "D:/Nancy/Web"
git status --porcelain | grep -E "_private|result" || echo "git không thấy ảnh gốc"
```

Kết quả mong đợi: `git không thấy ảnh gốc`.

- [ ] **Step 6: Commit**

```bash
cd "D:/Nancy/Web"
git add .gitignore
git commit -m "chore: move raw result images out of deploy scope

Ảnh gốc chứa họ tên, ngày sinh, ảnh chân dung và mã tra cứu Cambridge.
Chuyển sang _private/ và thêm vào .gitignore để không triển khai."
```

---

## Task 2: Lập bản đồ che và trích điểm

Đây là công việc đọc dữ liệu, không phải viết mã. Sản phẩm là một tệp dữ liệu.

Mỗi ảnh được mở đúng một lần. Trong lần mở đó ghi lại cả hai thứ: vùng cần che và điểm số. Kích thước ảnh không đồng nhất, riêng `result10` có 18 kích thước khác nhau, nên không có công thức tọa độ chung.

**Files:**
- Create: `tools/redact-map.json`

**Interfaces:**
- Consumes: `_private/*/` từ Task 1
- Produces: `tools/redact-map.json` với cấu trúc dưới đây, dùng bởi Task 3 và Task 5

- [ ] **Step 1: Nắm cấu trúc tệp**

```json
{
  "ket": {
    "source": "_private/ketresult",
    "canvas": [848, 1200],
    "label": "KET",
    "cefr": "A2",
    "grade": "Lớp 6-7",
    "org": "Cambridge English",
    "shape": "portrait",
    "images": [
      {
        "file": "IMG_20260803_172159.jpg",
        "out": "01.jpg",
        "masks": [[0.070, 0.212, 0.660, 0.040], [0.755, 0.150, 0.190, 0.038]],
        "caption": "Pass · Grade B",
        "meta": "136 · A2"
      }
    ]
  }
}
```

Giải thích từng trường:

- `canvas` — khung chuẩn hoá sau xử lý, `[848, 1200]` cho ảnh dọc và `[1200, 675]` cho ảnh ngang.
- `shape` — `"portrait"` hoặc `"landscape"`, quyết định số cột lưới ở Task 9.
- `masks` — danh sách `[x, y, rộng, cao]` theo **tỉ lệ 0-1 của chính ảnh đó**, không phải pixel. Dùng tỉ lệ nên mỗi ảnh tự đo theo kích thước riêng của nó.
- `out` — tên tệp đầu ra, đánh số tuần tự hai chữ số bắt đầu từ `01.jpg`.
- `caption`, `meta` — nhãn hiển thị dưới ảnh. Nếu đọc không rõ, để chuỗi rỗng `""`.

Bốn khóa và metadata cố định:

| Khóa | `source` | `canvas` | `shape` | `label` | `cefr` | `grade` | `org` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ket` | `_private/ketresult` | `[848, 1200]` | `portrait` | `KET` | `A2` | `Lớp 6-7` | `Cambridge English` |
| `pet` | `_private/petresult` | `[848, 1200]` | `portrait` | `PET` | `B1` | `Lớp 8-9` | `Cambridge English` |
| `ielts` | `_private/ieltsresult` | `[848, 1200]` | `portrait` | `IELTS` | `C1` | `Từ lớp 10` | `British Council · IDP · Cambridge` |
| `ts10` | `_private/result10` | `[1200, 675]` | `landscape` | `Tuyển sinh 10` | `` | `Lớp 9` | `Sở Giáo dục và Đào tạo TP.HCM` |

Với `ts10`, trường `cefr` để chuỗi rỗng vì kỳ thi này không dùng thang CEFR.

- [ ] **Step 2: Đọc và ghi nhận từng ảnh**

Mở lần lượt từng tệp trong bốn thư mục `_private/`. Với mỗi ảnh ghi lại:

Vùng **phải che**:
- Họ tên thí sinh, mọi vị trí xuất hiện
- Ngày sinh
- Ảnh chân dung
- Số báo danh, Candidate ID, Candidate Number
- Test Report Form Number
- Centre Reference và Verification Number trên phiếu Cambridge
- Số điện thoại, địa chỉ, ngày đăng ký nếu có

Vùng **phải giữ nguyên**:
- Điểm từng kỹ năng và điểm tổng
- Xếp loại, thang CEFR, biểu đồ điểm
- Logo và tên tổ chức cấp, con dấu
- Ngày thi

Giá trị **phải trích** cho `caption` và `meta`:

| Khóa | `caption` | `meta` |
| --- | --- | --- |
| `ket`, `pet` | `Pass · Grade B` | `136 · A2` (điểm tổng và CEFR) |
| `ielts` | `Overall 7.5` | `L 7.5 · R 8.5 · W 7.0 · S 6.5` |
| `ts10` | `Tổng 26.25` | `Toán 8 · Văn 8.5 · Anh 9.75` |

Nếu một ảnh mờ hoặc thiếu thông tin tới mức không đọc chắc được, để `caption` và `meta` bằng `""`. Không suy đoán.

- [ ] **Step 3: Ghi `tools/redact-map.json`**

Ghi đủ 72 bản ghi: 19 cho `ket`, 20 cho `pet`, 8 cho `ielts`, 25 cho `ts10`.

- [ ] **Step 4: Kiểm tra tệp hợp lệ và đủ số lượng**

```bash
cd "D:/Nancy/Web"
python -c "
import json, pathlib
m = json.load(open('tools/redact-map.json', encoding='utf-8'))
want = {'ket': 19, 'pet': 20, 'ielts': 8, 'ts10': 25}
for key, expected in want.items():
    block = m[key]
    got = len(block['images'])
    assert got == expected, '%s: %d ảnh, cần %d' % (key, got, expected)
    src = pathlib.Path(block['source'])
    outs = set()
    for item in block['images']:
        assert (src / item['file']).exists(), 'thiếu ảnh gốc: ' + item['file']
        assert item['masks'], 'chưa có vùng che: ' + item['file']
        for x, y, w, h in item['masks']:
            assert 0 <= x < 1 and 0 <= y < 1, 'tọa độ ngoài khoảng: ' + item['file']
            assert 0 < w <= 1 and 0 < h <= 1 and x + w <= 1.001 and y + h <= 1.001, \
                'vùng che tràn ra ngoài ảnh: ' + item['file']
        assert item['out'] not in outs, 'trùng tên đầu ra: ' + item['out']
        outs.add(item['out'])
print('redact-map.json hợp lệ, tổng', sum(len(m[k]['images']) for k in want))
"
```

Kết quả mong đợi: `redact-map.json hợp lệ, tổng 72`.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add tools/redact-map.json
git commit -m "data: map redaction regions and scores for 72 result images"
```

---

## Task 3: Pipeline che ảnh

**Files:**
- Create: `tools/redact_results.py`
- Test: `tools/test_redact_results.py`

**Interfaces:**
- Consumes: `tools/redact-map.json` từ Task 2
- Produces: các hàm `apply_masks(image, masks)`, `fit_canvas(image, canvas)`, `process_image(path, masks, canvas)`, và `main()`. Task 4 gọi `main()` qua dòng lệnh.

- [ ] **Step 1: Viết test thất bại**

Tạo `tools/test_redact_results.py`:

```python
import unittest
from PIL import Image

from redact_results import apply_masks, fit_canvas, process_image


class ApplyMasksTest(unittest.TestCase):
    def test_paints_solid_rectangle_over_fractional_region(self):
        image = Image.new("RGB", (200, 100), (255, 255, 255))
        apply_masks(image, [[0.25, 0.5, 0.5, 0.25]])
        self.assertEqual(image.getpixel((100, 62)), (22, 33, 46))

    def test_leaves_pixels_outside_the_region_untouched(self):
        image = Image.new("RGB", (200, 100), (255, 255, 255))
        apply_masks(image, [[0.25, 0.5, 0.5, 0.25]])
        self.assertEqual(image.getpixel((10, 10)), (255, 255, 255))
        self.assertEqual(image.getpixel((190, 90)), (255, 255, 255))

    def test_applies_every_region_in_the_list(self):
        image = Image.new("RGB", (100, 100), (255, 255, 255))
        apply_masks(image, [[0.0, 0.0, 0.2, 0.2], [0.8, 0.8, 0.2, 0.2]])
        self.assertEqual(image.getpixel((5, 5)), (22, 33, 46))
        self.assertEqual(image.getpixel((95, 95)), (22, 33, 46))


class FitCanvasTest(unittest.TestCase):
    def test_returns_exactly_the_requested_canvas_size(self):
        wide = Image.new("RGB", (1820, 900), (10, 20, 30))
        self.assertEqual(fit_canvas(wide, (1200, 675)).size, (1200, 675))

    def test_pads_with_white_instead_of_cropping(self):
        tall = Image.new("RGB", (100, 1000), (10, 20, 30))
        sheet = fit_canvas(tall, (848, 1200))
        self.assertEqual(sheet.getpixel((5, 600)), (255, 255, 255))

    def test_keeps_the_whole_source_visible(self):
        source = Image.new("RGB", (400, 200), (10, 20, 30))
        sheet = fit_canvas(source, (848, 1200))
        self.assertEqual(sheet.getpixel((424, 600)), (10, 20, 30))


class ProcessImageTest(unittest.TestCase):
    def test_masks_then_normalises_in_one_pass(self):
        with Image.new("RGB", (400, 200), (255, 255, 255)) as source:
            source.save("/tmp/redact-sample.jpg", quality=95)
        result = process_image("/tmp/redact-sample.jpg", [[0.0, 0.0, 1.0, 1.0]], (1200, 675))
        self.assertEqual(result.size, (1200, 675))
        self.assertLess(sum(result.getpixel((600, 337))), 120)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

```bash
cd "D:/Nancy/Web"
python -m unittest discover -s tools -p "test_*.py" -v
```

Kết quả mong đợi: FAIL với `ModuleNotFoundError: No module named 'redact_results'`.

- [ ] **Step 3: Viết `tools/redact_results.py`**

```python
#!/usr/bin/env python3
"""Che thông tin cá nhân trên ảnh kết quả và chuẩn hoá khung ảnh.

Ảnh gốc nằm trong _private/ và không bao giờ được triển khai. Script này
đọc tọa độ vùng che trong tools/redact-map.json, vẽ hình chữ nhật đặc lên
những vùng đó, đặt ảnh vào khung chuẩn của từng khóa rồi ghi ra
images/results/<khóa>/.

Việc che được ghi thẳng vào pixel. Phủ phần tử HTML lên ảnh gốc không đạt
yêu cầu vì người xem mở ảnh trong tab mới là thấy nguyên bản.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
MAP_PATH = ROOT / "tools" / "redact-map.json"
OUT_ROOT = ROOT / "images" / "results"
MASK_COLOR = (22, 33, 46)
QUALITY = 82


def apply_masks(image, masks):
    """Vẽ hình chữ nhật đặc lên các vùng cho theo tỉ lệ 0-1. Sửa tại chỗ."""
    draw = ImageDraw.Draw(image)
    width, height = image.size
    for x, y, mask_width, mask_height in masks:
        left = round(x * width)
        top = round(y * height)
        right = round((x + mask_width) * width)
        bottom = round((y + mask_height) * height)
        draw.rectangle([left, top, right, bottom], fill=MASK_COLOR)
    return image


def fit_canvas(image, canvas):
    """Đặt ảnh lọt trong khung, nền trắng, giữ nguyên tỉ lệ.

    Dùng lối contain chứ không phải cover: cắt ảnh có thể cắt mất đúng phần
    điểm số cần cho người xem thấy.
    """
    canvas_width, canvas_height = canvas
    scale = min(canvas_width / image.width, canvas_height / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    resized = image.resize(size, Image.LANCZOS)
    sheet = Image.new("RGB", (canvas_width, canvas_height), (255, 255, 255))
    sheet.paste(resized, ((canvas_width - size[0]) // 2, (canvas_height - size[1]) // 2))
    return sheet


def process_image(path, masks, canvas):
    """Đọc một ảnh, che rồi chuẩn hoá khung. Trả về ảnh mới."""
    with Image.open(path) as source:
        image = source.convert("RGB")
    apply_masks(image, masks)
    return fit_canvas(image, canvas)


def main():
    mapping = json.loads(MAP_PATH.read_text(encoding="utf-8"))
    total = 0

    for key, block in mapping.items():
        source_dir = ROOT / block["source"]
        out_dir = OUT_ROOT / key
        out_dir.mkdir(parents=True, exist_ok=True)
        canvas = tuple(block["canvas"])

        for item in block["images"]:
            source_path = source_dir / item["file"]
            if not source_path.exists():
                print("thiếu ảnh gốc: %s" % source_path, file=sys.stderr)
                return 1
            result = process_image(source_path, item["masks"], canvas)
            result.save(out_dir / item["out"], "JPEG", quality=QUALITY, optimize=True)
            total += 1

        print("%s: %d ảnh -> %s" % (key, len(block["images"]), out_dir))

    print("Đã xử lý %d ảnh." % total)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd "D:/Nancy/Web"
python -m unittest discover -s tools -p "test_*.py" -v
```

Kết quả mong đợi: `OK`, 7 test pass.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add tools/redact_results.py tools/test_redact_results.py
git commit -m "feat: add result image redaction pipeline"
```

---

## Task 4: Sinh ảnh và kiểm tra bằng mắt

Bước kiểm tra bằng mắt ở đây không bỏ được. Một vùng che lệch vài phần trăm vẫn để lộ đúng thứ cần giấu, và không có test tự động nào bắt được điều đó.

**Files:**
- Generate: `images/results/{ket,pet,ielts,ts10}/*.jpg`

**Interfaces:**
- Consumes: `tools/redact_results.py` và `tools/redact-map.json`
- Produces: 72 ảnh đã che, dùng bởi Task 5

- [ ] **Step 1: Chạy pipeline**

```bash
cd "D:/Nancy/Web"
python tools/redact_results.py
```

Kết quả mong đợi:

```
ket: 19 ảnh -> .../images/results/ket
pet: 20 ảnh -> .../images/results/pet
ielts: 8 ảnh -> .../images/results/ielts
ts10: 25 ảnh -> .../images/results/ts10
Đã xử lý 72 ảnh.
```

- [ ] **Step 2: Kiểm tra số lượng và dung lượng**

```bash
cd "D:/Nancy/Web"
for d in ket pet ielts ts10; do
  echo -n "$d: "; ls "images/results/$d" | wc -l
done
du -sh images/results
```

Kết quả mong đợi: `ket: 19`, `pet: 20`, `ielts: 8`, `ts10: 25`, tổng dung lượng dưới 2,5 MB.

- [ ] **Step 3: Đọc lại toàn bộ 72 ảnh đã che**

Mở lần lượt từng tệp trong `images/results/`. Với mỗi ảnh xác nhận:

1. Không còn đọc được họ tên thí sinh ở bất kỳ vị trí nào.
2. Không còn ảnh chân dung.
3. Không còn ngày sinh, số báo danh, Verification Number, Centre Reference, Test Report Form Number.
4. Điểm số và thang CEFR vẫn đọc được rõ.
5. Logo tổ chức cấp vẫn nhìn thấy.

Ghi lại danh sách ảnh không đạt.

- [ ] **Step 4: Sửa các ảnh không đạt**

Với mỗi ảnh không đạt, chỉnh tọa độ trong `tools/redact-map.json` rồi chạy lại:

```bash
cd "D:/Nancy/Web"
python tools/redact_results.py
```

Lặp lại Step 3 cho những ảnh vừa sửa. Chỉ đi tiếp khi cả 72 ảnh đều đạt.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add images/results tools/redact-map.json
git commit -m "assets: generate 72 redacted result images"
```

---

## Task 5: Tệp dữ liệu kết quả

**Files:**
- Create: `results-data.js`

**Interfaces:**
- Consumes: `tools/redact-map.json` từ Task 2
- Produces: biến toàn cục `window.NANCY_RESULTS`, một đối tượng có bốn khóa `ket`, `pet`, `ielts`, `ts10`. Mỗi khóa có `label`, `cefr`, `grade`, `org`, `shape`, `stats` (`{total, highest, range}`) và `items` (mảng `{src, caption, meta}`). Dùng bởi Task 7, 8, 10.

- [ ] **Step 1: Sinh tệp từ bản đồ che**

```bash
cd "D:/Nancy/Web"
python -c "
import json

mapping = json.load(open('tools/redact-map.json', encoding='utf-8'))
lines = [
    '// Dữ liệu thành tích học viên. Sinh ra từ tools/redact-map.json.',
    '// Mọi con số ở đây đọc trực tiếp từ ảnh phiếu điểm, không suy diễn.',
    '// Sửa bản đồ che rồi sinh lại, đừng sửa tay tệp này.',
    'window.NANCY_RESULTS = {',
]

for key, block in mapping.items():
    items = block['images']
    lines.append('  %s: {' % key)
    for field in ('label', 'cefr', 'grade', 'org', 'shape'):
        lines.append('    %s: %s,' % (field, json.dumps(block[field], ensure_ascii=False)))
    lines.append('    stats: { total: %d, highest: \"\", range: \"\" },' % len(items))
    lines.append('    items: [')
    for item in items:
        lines.append('      { src: \"images/results/%s/%s\", caption: %s, meta: %s },' % (
            key, item['out'],
            json.dumps(item['caption'], ensure_ascii=False),
            json.dumps(item['meta'], ensure_ascii=False),
        ))
    lines.append('    ],')
    lines.append('  },')

lines.append('};')
open('results-data.js', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('Đã ghi results-data.js')
"
```

- [ ] **Step 2: Điền `highest` và `range` bằng tay**

Script trên để trống hai trường này vì chúng là kết luận rút ra từ toàn bộ tập, không nằm trong một ảnh riêng lẻ. Đọc lại các giá trị `meta` vừa sinh trong `results-data.js` và điền:

- `highest` — điểm tổng cao nhất trong khóa, dạng chuỗi. Ví dụ `"143"` cho KET, `"8.0"` cho IELTS.
- `range` — khoảng trình độ đạt được, dạng chuỗi. Ví dụ `"A2-B1"` cho KET. Với `ts10` dùng khoảng điểm tổng, ví dụ `"21.5-28.0"`.

Nếu một khóa có quá nửa số ảnh không đọc được điểm, để cả hai trường bằng `""`. Task 7 sẽ bỏ qua ô số liệu rỗng.

- [ ] **Step 3: Xác nhận dữ liệu khớp ảnh có thật**

```bash
cd "D:/Nancy/Web"
node -e "
const fs = require('fs');
const window = {};
eval(fs.readFileSync('results-data.js', 'utf8'));
const want = { ket: 19, pet: 20, ielts: 8, ts10: 25 };
let checked = 0;
for (const [key, expected] of Object.entries(want)) {
  const course = window.NANCY_RESULTS[key];
  if (course.items.length !== expected) throw new Error(key + ': ' + course.items.length + ' mục, cần ' + expected);
  if (course.stats.total !== expected) throw new Error(key + ': stats.total sai');
  for (const item of course.items) {
    if (!fs.existsSync(item.src)) throw new Error('thiếu ảnh: ' + item.src);
    checked++;
  }
}
console.log('results-data.js hợp lệ,', checked, 'ảnh đều tồn tại');
"
```

Kết quả mong đợi: `results-data.js hợp lệ, 72 ảnh đều tồn tại`.

- [ ] **Step 4: Commit**

```bash
cd "D:/Nancy/Web"
git add results-data.js
git commit -m "data: add student results dataset"
```

---

## Task 6: Hàm dựng HTML thuần

Tách riêng phần dựng chuỗi khỏi phần thao tác DOM. Phần này kiểm thử được mà không cần DOM giả.

**Files:**
- Create: `results-modal.js`
- Test: `tests/results-modal.test.mjs`

**Interfaces:**
- Consumes: hình dạng dữ liệu từ Task 5
- Produces: `window.NancyResults` phơi ra `escapeHtml(value)`, `renderStats(course)`, `renderGrid(course)`, `renderDetail(course, index)`. Tất cả trả về chuỗi. Task 7 bổ sung `createResultsModal` vào cùng đối tượng này.

- [ ] **Step 1: Viết test thất bại**

Tạo `tests/results-modal.test.mjs`:

```javascript
import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../results-modal.js", import.meta.url), "utf8");

function loadModule() {
  const window = {};
  vm.runInNewContext(source, { window });
  return window.NancyResults;
}

const course = {
  label: "KET",
  cefr: "A2",
  grade: "Lớp 6-7",
  org: "Cambridge English",
  shape: "portrait",
  stats: { total: 19, highest: "143", range: "A2-B1" },
  items: [
    { src: "images/results/ket/01.jpg", caption: "Pass · Grade B", meta: "136 · A2" },
    { src: "images/results/ket/02.jpg", caption: "Pass · Grade A", meta: "143 · B1" },
    { src: "images/results/ket/03.jpg", caption: "", meta: "" },
  ],
};

test("escapes characters that would break out of markup", () => {
  const { escapeHtml } = loadModule();
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
  assert.equal(escapeHtml("Nguyễn & Trần"), "Nguyễn &amp; Trần");
  assert.equal(escapeHtml(undefined), "");
});

test("stats strip shows the three populated figures", () => {
  const html = loadModule().renderStats(course);
  assert.match(html, /19/);
  assert.match(html, /143/);
  assert.match(html, /A2-B1/);
  assert.match(html, /học viên/);
});

test("stats strip omits figures that were left empty", () => {
  const bare = { ...course, stats: { total: 8, highest: "", range: "" } };
  const html = loadModule().renderStats(bare);
  assert.match(html, /8/);
  assert.equal(html.includes("Điểm cao nhất"), false);
  assert.equal(html.includes("Trình độ đạt"), false);
});

test("grid renders one lazy-loaded tile per item, indexed in order", () => {
  const html = loadModule().renderGrid(course);
  assert.equal((html.match(/data-action="zoom"/g) || []).length, 3);
  assert.match(html, /data-index="0"/);
  assert.match(html, /data-index="2"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /images\/results\/ket\/01\.jpg/);
});

test("grid tiles carry captions, and stay silent when the score was unreadable", () => {
  const html = loadModule().renderGrid(course);
  assert.match(html, /Pass · Grade B/);
  assert.match(html, /136 · A2/);
  assert.equal((html.match(/results-tile__cap/g) || []).length, 2);
});

test("grid carries the shape so CSS can pick a column count", () => {
  const portrait = loadModule().renderGrid(course);
  const landscape = loadModule().renderGrid({ ...course, shape: "landscape" });
  assert.match(portrait, /data-shape="portrait"/);
  assert.match(landscape, /data-shape="landscape"/);
});

test("detail view shows a counter and the current image", () => {
  const html = loadModule().renderDetail(course, 1);
  assert.match(html, /2\s*\/\s*3/);
  assert.match(html, /images\/results\/ket\/02\.jpg/);
  assert.match(html, /Pass · Grade A/);
});

test("detail view keeps prev and next available so navigation can wrap", () => {
  const first = loadModule().renderDetail(course, 0);
  assert.match(first, /data-action="prev"/);
  assert.match(first, /data-action="next"/);
});

test("alt text describes the document without naming a student", () => {
  const html = loadModule().renderGrid(course);
  assert.match(html, /alt="Phiếu điểm KET của học viên Nancy English Center"/);
  assert.equal(/alt="[^"]*(Nguyen|Nguyễn|Dinh|Đinh)/.test(html), false);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

```bash
cd "D:/Nancy/Web"
node --test "tests/results-modal.test.mjs"
```

Kết quả mong đợi: FAIL vì `results-modal.js` chưa tồn tại.

- [ ] **Step 3: Viết phần dựng chuỗi của `results-modal.js`**

```javascript
// Hộp thoại thành tích học viên.
//
// Tách làm hai lớp: các hàm renderX dựng chuỗi HTML thuần, không chạm DOM,
// nên kiểm thử được trực tiếp. createResultsModal chỉ lo gắn chuỗi vào DOM
// và uỷ nhiệm sự kiện. Nhờ tách vậy, phần logic hiển thị không cần DOM giả
// để test.
window.NancyResults = (function () {
  "use strict";

  var ESCAPES = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  // Nhãn điểm đến từ tệp dữ liệu do người viết, không phải từ người dùng,
  // nhưng chúng vẫn đi thẳng vào innerHTML nên vẫn phải thoát ký tự.
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, function (char) {
      return ESCAPES[char];
    });
  }

  function statCell(value, label) {
    if (!value && value !== 0) return "";
    return (
      '<div class="results-stat"><b>' +
      escapeHtml(value) +
      "</b><span>" +
      escapeHtml(label) +
      "</span></div>"
    );
  }

  function renderStats(course) {
    return (
      '<div class="results-stats">' +
      statCell(course.stats.total, "học viên") +
      statCell(course.stats.highest, "Điểm cao nhất") +
      statCell(course.stats.range, "Trình độ đạt") +
      "</div>"
    );
  }

  function altText(course) {
    return "Phiếu điểm " + course.label + " của học viên Nancy English Center";
  }

  function renderGrid(course) {
    var alt = escapeHtml(altText(course));
    var tiles = course.items
      .map(function (item, index) {
        var caption = item.caption
          ? '<span class="results-tile__cap">' +
            escapeHtml(item.caption) +
            "<em>" +
            escapeHtml(item.meta) +
            "</em></span>"
          : "";

        return (
          '<button class="results-tile" type="button" data-action="zoom" data-index="' +
          index +
          '"><img src="' +
          escapeHtml(item.src) +
          '" alt="' +
          alt +
          '" loading="lazy" decoding="async" />' +
          caption +
          "</button>"
        );
      })
      .join("");

    return (
      '<div class="results-grid" data-shape="' +
      escapeHtml(course.shape) +
      '">' +
      tiles +
      "</div>"
    );
  }

  function renderDetail(course, index) {
    var item = course.items[index];
    var caption = item.caption
      ? '<p class="results-detail__cap">' +
        escapeHtml(item.caption) +
        " <em>" +
        escapeHtml(item.meta) +
        "</em></p>"
      : "";

    return (
      '<div class="results-detail">' +
      '<button class="results-detail__back" type="button" data-action="grid">Về lưới kết quả</button>' +
      '<div class="results-detail__stage">' +
      '<button class="results-nav" type="button" data-action="prev" aria-label="Phiếu điểm trước">&#8249;</button>' +
      '<img src="' +
      escapeHtml(item.src) +
      '" alt="' +
      escapeHtml(altText(course)) +
      '" decoding="async" />' +
      '<button class="results-nav" type="button" data-action="next" aria-label="Phiếu điểm tiếp theo">&#8250;</button>' +
      "</div>" +
      caption +
      '<p class="results-detail__count">' +
      (index + 1) +
      " / " +
      course.items.length +
      "</p>" +
      "</div>"
    );
  }

  return {
    escapeHtml: escapeHtml,
    renderStats: renderStats,
    renderGrid: renderGrid,
    renderDetail: renderDetail,
  };
})();
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd "D:/Nancy/Web"
node --test "tests/results-modal.test.mjs"
```

Kết quả mong đợi: 9 test pass.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add results-modal.js tests/results-modal.test.mjs
git commit -m "feat: render student results markup"
```

---

## Task 7: Khởi tạo hộp thoại và uỷ nhiệm sự kiện

Dùng uỷ nhiệm sự kiện trên phần tử gốc thay vì gắn listener cho từng ô. Nội dung được thay bằng `innerHTML` nên gắn listener riêng lẻ sẽ mất mỗi lần vẽ lại, và uỷ nhiệm cũng kiểm thử được bằng DOM giả.

**Files:**
- Modify: `results-modal.js`
- Modify: `tests/results-modal.test.mjs`

**Interfaces:**
- Consumes: `renderStats`, `renderGrid`, `renderDetail` từ Task 6
- Produces: `window.NancyResults.createResultsModal(root, data)` trả về `{ open(key, trigger), close(), isOpen() }`. Task 10 gọi hàm này.

- [ ] **Step 1: Viết test thất bại**

Thêm vào cuối `tests/results-modal.test.mjs`:

```javascript
class FakeNode {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
    this.classList = new Set();
    this.innerHTML = "";
    this.parentElement = null;
    this.focused = 0;
    this.hidden = false;
  }
  addEventListener(type, listener) {
    const list = this.listeners.get(type) ?? [];
    list.push(listener);
    this.listeners.set(type, list);
  }
  dispatch(type, event = {}) {
    event.target ??= this;
    event.preventDefault ??= () => {};
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  // Đi ngược lên cây cha tìm phần tử có thuộc tính khớp [data-x].
  closest(selector) {
    const name = selector.replace(/^\[|\]$/g, "");
    let node = this;
    while (node) {
      if (node.attributes.has(name)) return node;
      node = node.parentElement;
    }
    return null;
  }
  focus() {
    this.focused += 1;
  }
}

function createModalFixture() {
  const root = new FakeNode();
  const body = new FakeNode();
  body.classList = { add(v) { this.v = v; }, remove() { this.v = null; }, v: null };
  const document = {
    body,
    listeners: new Map(),
    addEventListener(type, listener) {
      const list = this.listeners.get(type) ?? [];
      list.push(listener);
      this.listeners.set(type, list);
    },
    dispatch(type, event = {}) {
      event.preventDefault ??= () => {};
      for (const listener of this.listeners.get(type) ?? []) listener(event);
      return event;
    },
  };
  const window = { document, matchMedia: () => ({ matches: false }) };
  vm.runInNewContext(source, { window, document });
  const modal = window.NancyResults.createResultsModal(root, { ket: course });
  return { modal, root, document, body };
}

// Giả một lần bấm vào phần tử con nằm trong nút mang data-action.
function clickAction(root, action, index) {
  const button = new FakeNode();
  button.setAttribute("data-action", action);
  if (index !== undefined) button.setAttribute("data-index", String(index));
  const inner = new FakeNode();
  inner.parentElement = button;
  return root.dispatch("click", { target: inner });
}

test("modal starts closed and hidden from assistive tech", () => {
  const { modal, root } = createModalFixture();
  assert.equal(modal.isOpen(), false);
  assert.equal(root.getAttribute("aria-hidden"), "true");
});

test("opening renders the grid and locks background scrolling", () => {
  const { modal, root, body } = createModalFixture();
  modal.open("ket", new FakeNode());
  assert.equal(modal.isOpen(), true);
  assert.match(root.innerHTML, /results-grid/);
  assert.match(root.innerHTML, /19/);
  assert.equal(root.getAttribute("aria-hidden"), "false");
  assert.equal(body.classList.v, "lightbox-active");
});

test("opening an unknown course does nothing", () => {
  const { modal, root } = createModalFixture();
  modal.open("movers", new FakeNode());
  assert.equal(modal.isOpen(), false);
  assert.equal(root.innerHTML, "");
});

test("clicking a tile swaps the grid for the detail view", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "zoom", 1);
  assert.match(root.innerHTML, /results-detail/);
  assert.match(root.innerHTML, /2 \/ 3/);
});

test("next and prev wrap around the ends", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "zoom", 2);
  clickAction(root, "next");
  assert.match(root.innerHTML, /1 \/ 3/);
  clickAction(root, "prev");
  assert.match(root.innerHTML, /3 \/ 3/);
});

test("Escape steps back to the grid before closing the modal", () => {
  const { modal, root, document } = createModalFixture();
  modal.open("ket", new FakeNode());
  clickAction(root, "zoom", 0);
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(modal.isOpen(), true);
  assert.match(root.innerHTML, /results-grid/);
  document.dispatch("keydown", { key: "Escape" });
  assert.equal(modal.isOpen(), false);
});

test("closing returns focus to the element that opened the modal", () => {
  const { modal } = createModalFixture();
  const trigger = new FakeNode();
  modal.open("ket", trigger);
  modal.close();
  assert.equal(trigger.focused, 1);
});

test("clicking the backdrop closes, clicking inside does not", () => {
  const { modal, root } = createModalFixture();
  modal.open("ket", new FakeNode());
  const inside = new FakeNode();
  inside.parentElement = root;
  root.dispatch("click", { target: inside });
  assert.equal(modal.isOpen(), true);
  root.dispatch("click", { target: root });
  assert.equal(modal.isOpen(), false);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

```bash
cd "D:/Nancy/Web"
node --test "tests/results-modal.test.mjs"
```

Kết quả mong đợi: FAIL với `createResultsModal is not a function`.

- [ ] **Step 3: Bổ sung `createResultsModal` vào `results-modal.js`**

Chèn hàm sau vào ngay trước khối `return` cuối tệp:

```javascript
  function createResultsModal(root, data) {
    var current = null;
    var detailIndex = -1;
    var lastTrigger = null;

    function paint() {
      if (!current) return;

      if (detailIndex >= 0) {
        root.innerHTML = renderDetail(current, detailIndex);
        return;
      }

      root.innerHTML =
        '<div class="results-panel">' +
        '<div class="results-head">' +
        '<span class="results-badge">' +
        escapeHtml(current.cefr || current.grade) +
        "</span>" +
        "<div><h3>Thành tích học viên " +
        escapeHtml(current.label) +
        "</h3><p>" +
        escapeHtml(current.org) +
        " · " +
        escapeHtml(current.grade) +
        "</p></div>" +
        '<button class="results-close" type="button" data-action="close" aria-label="Đóng">&#10005;</button>' +
        "</div>" +
        renderStats(current) +
        renderGrid(current) +
        "</div>";
    }

    function open(key, trigger) {
      var course = data[key];
      if (!course) return;

      current = course;
      detailIndex = -1;
      lastTrigger = trigger || null;
      paint();
      root.setAttribute("aria-hidden", "false");
      root.setAttribute("aria-label", "Thành tích học viên " + course.label);
      root.classList.add("open");
      document.body.classList.add("lightbox-active");
    }

    function close() {
      current = null;
      detailIndex = -1;
      root.innerHTML = "";
      root.setAttribute("aria-hidden", "true");
      root.classList.remove("open");
      document.body.classList.remove("lightbox-active");

      if (lastTrigger) lastTrigger.focus();
      lastTrigger = null;
    }

    function step(offset) {
      var count = current.items.length;
      detailIndex = (detailIndex + offset + count) % count;
      paint();
    }

    root.addEventListener("click", function (event) {
      // Bấm thẳng vào nền tối thì đóng. Bấm vào nội dung bên trong thì không.
      if (event.target === root) {
        close();
        return;
      }

      var trigger = event.target.closest("[data-action]");
      if (!trigger || !current) return;

      var action = trigger.getAttribute("data-action");

      if (action === "close") close();
      else if (action === "grid") {
        detailIndex = -1;
        paint();
      } else if (action === "zoom") {
        detailIndex = parseInt(trigger.getAttribute("data-index"), 10);
        paint();
      } else if (action === "next") step(1);
      else if (action === "prev") step(-1);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !current) return;

      // Từ ảnh phóng to, Escape lùi về lưới trước đã. Người xem đang ở hai
      // lớp sâu, đóng thẳng cả hộp thoại là mất chỗ đang xem.
      if (detailIndex >= 0) {
        detailIndex = -1;
        paint();
        return;
      }

      close();
    });

    root.setAttribute("aria-hidden", "true");

    return {
      open: open,
      close: close,
      isOpen: function () {
        return current !== null;
      },
    };
  }
```

Bổ sung vào đối tượng `return` cuối tệp:

```javascript
    createResultsModal: createResultsModal,
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd "D:/Nancy/Web"
node --test "tests/results-modal.test.mjs"
```

Kết quả mong đợi: 17 test pass.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add results-modal.js tests/results-modal.test.mjs
git commit -m "feat: wire results modal open, zoom, and navigation"
```

---

## Task 8: Markup trong index.html

**Files:**
- Modify: `index.html` — thẻ khóa học tại dòng 627, 647, 669, 767; khung hộp thoại trước `<script>` ở dòng 1564
- Test: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: `window.NANCY_RESULTS` từ Task 5
- Produces: bốn thẻ mang `data-results`, phần tử `#results-modal`, và ba thẻ `<script>` theo đúng thứ tự nạp. Task 10 dựa vào các thứ này.

- [ ] **Step 1: Viết test thất bại**

Thêm vào `tests/page-contract.test.mjs`:

```javascript
test("only courses with real results advertise an achievements view", () => {
  const withResults = [
    ["ket", "ket"],
    ["pet", "pet"],
    ["ielts", "ielts"],
    ["tuyen-sinh-10", "ts10"],
  ];

  for (const [slug, key] of withResults) {
    const card = cardMarkup(slug);
    assert.match(card, new RegExp(`data-results="${key}"`), `${slug} thiếu data-results`);
    assert.match(card, /class="course-card__proof"/, `${slug} thiếu huy hiệu`);
    assert.match(card, /Xem thành tích/, `${slug} thiếu nút mở`);
  }

  const withoutResults = [
    "happy-kids", "starter", "movers", "flyers",
    "tang-cuong", "dai-hoc", "chuan-bo-gd",
  ];

  for (const slug of withoutResults) {
    const card = cardMarkup(slug);
    assert.equal(card.includes("data-results"), false, `${slug} không được có data-results`);
    assert.equal(card.includes("Xem thành tích"), false, `${slug} không được mời bấm`);
  }

  assert.equal((html.match(/data-results="/g) || []).length, 4);
});

test("the results modal shell is present and hidden by default", () => {
  assert.match(html, /id="results-modal"/);
  assert.match(html, /<div\s+id="results-modal"[^>]*role="dialog"/s);
  assert.match(html, /<div\s+id="results-modal"[^>]*aria-modal="true"/s);
  assert.match(html, /<div\s+id="results-modal"[^>]*aria-hidden="true"/s);
});

test("results scripts load before the script that consumes them", () => {
  const dataAt = html.indexOf('src="results-data.js');
  const modalAt = html.indexOf('src="results-modal.js');
  const mainAt = html.indexOf('src="script.js');
  assert.ok(dataAt > -1, "thiếu results-data.js");
  assert.ok(modalAt > -1, "thiếu results-modal.js");
  assert.ok(dataAt < mainAt, "results-data.js phải nạp trước script.js");
  assert.ok(modalAt < mainAt, "results-modal.js phải nạp trước script.js");
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

```bash
cd "D:/Nancy/Web"
node --test "tests/page-contract.test.mjs"
```

Kết quả mong đợi: FAIL với `ket thiếu data-results`.

- [ ] **Step 3: Sửa bốn thẻ khóa học**

Với thẻ KET, đổi thẻ mở và thêm huy hiệu cùng nút. Thẻ hiện tại bắt đầu ở dòng 627:

```html
              <article class="course-card" data-course="ket" data-results="ket">
                <div class="course-card__media">
                  <span class="course-card__proof">19 kết quả</span>
                  <img
                    src="https://i.postimg.cc/Y2WstSzY/749330288-1553232106814655-737978265121435385-n.jpg"
                    alt="Học viên khóa KET tại Nancy English Center"
                    width="1280"
                    height="960"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div class="course-card__body">
                  <div class="course-card__heading">
                    <h4>KET</h4>
                    <span class="course-card__grade">Lớp 6-7</span>
                  </div>
                  <p>Rèn năng lực tiếng Anh trình độ A2 và kỹ năng làm bài.</p>
                  <button class="course-card__cta" type="button">
                    Xem thành tích
                  </button>
                </div>
              </article>
```

Làm tương tự cho ba thẻ còn lại, chỉ khác giá trị:

| Thẻ | `data-results` | Nội dung huy hiệu |
| --- | --- | --- |
| `data-course="pet"` (dòng 647) | `pet` | `20 kết quả` |
| `data-course="ielts"` (dòng 669) | `ielts` | `8 kết quả` |
| `data-course="tuyen-sinh-10"` (dòng 767) | `ts10` | `25 kết quả` |

Không đụng vào bảy thẻ còn lại.

- [ ] **Step 4: Thêm khung hộp thoại và các thẻ script**

Thay khối cuối `index.html` (từ dòng 1562 tới hết) bằng:

```html
    </div>

    <!-- Nội dung do results-modal.js dựng khi người xem bấm một thẻ khóa học -->
    <div
      id="results-modal"
      class="results-modal"
      role="dialog"
      aria-modal="true"
      aria-hidden="true"
      aria-label="Thành tích học viên"
    ></div>

    <script src="results-data.js?v=20260803"></script>
    <script src="results-modal.js?v=20260803"></script>
    <script src="script.js?v=20260803" defer></script>
  </body>
</html>
```

`results-data.js` và `results-modal.js` không dùng `defer` vì `script.js` chạy khi nạp xong và cần hai tệp kia đã có mặt.

- [ ] **Step 5: Chạy test để xác nhận pass**

```bash
cd "D:/Nancy/Web"
node --test "tests/page-contract.test.mjs"
```

Kết quả mong đợi: toàn bộ test pass, gồm ba test mới.

- [ ] **Step 6: Commit**

```bash
cd "D:/Nancy/Web"
git add index.html tests/page-contract.test.mjs
git commit -m "feat: mark result-bearing course cards and add modal shell"
```

---

## Task 9: Style hộp thoại

**Files:**
- Modify: `styles.css` — thêm vào cuối tệp

**Interfaces:**
- Consumes: tên lớp do Task 6, 7, 8 sinh ra
- Produces: không có gì cho các task sau

- [ ] **Step 1: Viết test thất bại**

Thêm vào `tests/page-contract.test.mjs`:

```javascript
test("results grid uses a narrower column count for landscape documents", () => {
  assert.match(css, /\.results-grid\[data-shape="portrait"\]/);
  assert.match(css, /\.results-grid\[data-shape="landscape"\]/);
});

test("results modal respects reduced motion and stays hidden until opened", () => {
  assert.match(css, /\.results-modal\s*\{[^}]*display:\s*none/s);
  assert.match(css, /\.results-modal\.open\s*\{[^}]*display:\s*flex/s);
  assert.match(css, /prefers-reduced-motion:\s*reduce[^}]*\}[\s\S]{0,400}\.results-modal/);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

```bash
cd "D:/Nancy/Web"
node --test "tests/page-contract.test.mjs"
```

Kết quả mong đợi: FAIL ở test đầu tiên trong hai test mới.

- [ ] **Step 3: Thêm CSS vào cuối `styles.css`**

```css
/* ============================================================
   THÀNH TÍCH HỌC VIÊN
   Hộp thoại mở khi bấm thẻ khóa học có dữ liệu kết quả.
   Nội dung bên trong do results-modal.js dựng.
   ============================================================ */

/* --- huy hiệu và nút trên thẻ khóa học --- */
.course-card__proof {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  background: var(--accent);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: var(--r-pill);
  box-shadow: var(--sh-1);
}

.course-card__media {
  position: relative;
}

.course-card__cta {
  margin-top: 10px;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--brand-ink);
  cursor: pointer;
}

.course-card__cta::after {
  content: " \2192";
  transition: transform 0.2s var(--ease);
  display: inline-block;
}

.course-card[data-results] {
  cursor: pointer;
}

.course-card[data-results]:hover .course-card__cta::after {
  transform: translateX(3px);
}

/* --- khung hộp thoại --- */
.results-modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(10, 36, 69, 0.86);
  padding: clamp(12px, 3vw, 32px);
  overflow-y: auto;
}

.results-modal.open {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.results-panel,
.results-detail {
  background: var(--surface);
  border-radius: var(--r-lg);
  box-shadow: var(--sh-3);
  width: min(1100px, 100%);
  margin: auto;
  animation: results-in 0.28s var(--ease);
}

@keyframes results-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
}

/* --- đầu hộp thoại --- */
.results-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.results-badge {
  background: var(--brand-tint);
  color: var(--brand-ink);
  font-size: 0.7rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: var(--r-pill);
  white-space: nowrap;
}

.results-head h3 {
  font-family: "Baloo 2", system-ui, sans-serif;
  font-size: var(--fs-h3);
  color: var(--text);
  margin: 0;
}

.results-head p {
  font-size: 0.82rem;
  color: var(--text-3);
  margin: 2px 0 0;
}

.results-close,
.results-detail__back {
  margin-left: auto;
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--text-2);
  border-radius: var(--r-pill);
  padding: 8px 14px;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.results-close {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
}

/* --- dải số liệu --- */
.results-stats {
  display: flex;
  gap: 10px;
  padding: 14px 20px;
  background: var(--brand-wash);
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.results-stat {
  flex: 1;
  min-width: 110px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 10px 14px;
}

.results-stat b {
  display: block;
  font-family: "Baloo 2", system-ui, sans-serif;
  font-size: 1.3rem;
  color: var(--brand-ink);
}

.results-stat span {
  display: block;
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 2px;
}

/* --- lưới ảnh --- */
.results-grid {
  display: grid;
  gap: 12px;
  padding: 16px 20px 22px;
}

.results-grid[data-shape="portrait"] {
  grid-template-columns: repeat(4, 1fr);
}

.results-grid[data-shape="landscape"] {
  grid-template-columns: repeat(2, 1fr);
}

.results-tile {
  position: relative;
  display: block;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--surface);
  cursor: pointer;
  transition:
    transform 0.2s var(--ease),
    box-shadow 0.2s var(--ease);
}

.results-tile:hover,
.results-tile:focus-visible {
  transform: translateY(-3px);
  box-shadow: var(--sh-2);
}

.results-tile img {
  display: block;
  width: 100%;
  height: auto;
}

.results-tile__cap {
  position: absolute;
  inset: auto 0 0;
  background: linear-gradient(transparent, rgba(10, 36, 69, 0.92));
  color: #fff;
  font-size: 0.76rem;
  font-weight: 600;
  text-align: left;
  padding: 22px 10px 8px;
}

.results-tile__cap em {
  display: block;
  font-style: normal;
  font-weight: 400;
  font-size: 0.7rem;
  opacity: 0.85;
}

/* --- ảnh phóng to --- */
.results-detail {
  padding: 16px 20px 22px;
}

.results-detail__stage {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  background: var(--surface-2);
  border-radius: var(--r-md);
  padding: 14px;
  margin-top: 12px;
}

.results-detail__stage img {
  max-width: min(620px, 100%);
  max-height: 72vh;
  width: auto;
  height: auto;
  border-radius: 6px;
  box-shadow: var(--sh-1);
}

.results-nav {
  flex: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--line-2);
  color: var(--brand-ink);
  font-size: 1.1rem;
  cursor: pointer;
}

.results-detail__cap {
  text-align: center;
  font-weight: 700;
  color: var(--text);
  margin: 12px 0 0;
}

.results-detail__cap em {
  font-style: normal;
  font-weight: 400;
  color: var(--text-3);
}

.results-detail__count {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-3);
  margin: 6px 0 0;
}

@media (max-width: 720px) {
  .results-grid[data-shape="portrait"] {
    grid-template-columns: repeat(2, 1fr);
  }

  .results-grid[data-shape="landscape"] {
    grid-template-columns: 1fr;
  }

  .results-head {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .results-panel,
  .results-detail {
    animation: none;
  }

  .results-tile {
    transition: none;
  }

  .results-tile:hover,
  .results-tile:focus-visible {
    transform: none;
  }
}
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd "D:/Nancy/Web"
node --test "tests/*.test.mjs"
```

Kết quả mong đợi: toàn bộ test pass.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add styles.css tests/page-contract.test.mjs
git commit -m "style: add results modal, grid, and card badge"
```

---

## Task 10: Nối thẻ khóa học với hộp thoại

**Files:**
- Modify: `script.js` — thêm mục 8 ngay trước dòng đóng `})();`
- Modify: `tests/page-behavior.test.mjs`

**Interfaces:**
- Consumes: `window.NancyResults.createResultsModal` từ Task 7, `window.NANCY_RESULTS` từ Task 5, `#results-modal` và `[data-results]` từ Task 8
- Produces: không có gì cho các task sau

- [ ] **Step 1: Viết test thất bại**

Trong `tests/page-behavior.test.mjs`, sửa `createPageFixture` để dựng được thẻ có kết quả. Thêm vào ngay trước dòng `const selectorMap = new Map([`:

```javascript
  const resultsModal = new FakeElement(document);
  const openCalls = [];
  const resultCard = new FakeElement(document);
  resultCard.setAttribute("data-results", "ket");
  const plainCard = new FakeElement(document);
```

Thêm vào `selectorMap` không có gì. Sửa `document.querySelectorAll` thành:

```javascript
  document.querySelectorAll = (selector) => {
    if (selector === ".gal") return [gallery];
    if (selector === "[data-course-carousel]") {
      return withCarousel ? [first.carousel, second.carousel] : [];
    }
    if (selector === "[data-results]") return [resultCard];
    return [];
  };
  document.getElementById = (id) => {
    if (id === "lightbox") return lightbox;
    if (id === "results-modal") return resultsModal;
    return null;
  };
```

Sửa lời gọi `vm.runInNewContext` thành:

```javascript
  const windowStub = Object.assign(window, {
    NANCY_RESULTS: { ket: { label: "KET", items: [] } },
    NancyResults: {
      createResultsModal: (root, data) => ({
        open: (key, trigger) => openCalls.push([key, trigger, root, data]),
        close: () => {},
        isOpen: () => false,
      }),
    },
  });

  vm.runInNewContext(scriptSource, {
    document,
    window: windowStub,
    requestAnimationFrame,
  });
```

Thêm `resultCard`, `plainCard`, `resultsModal`, `openCalls` vào đối tượng `return` của fixture.

Rồi thêm test mới vào cuối tệp:

```javascript
test("clicking a course card with results opens the modal for that course", () => {
  const fixture = createPageFixture();
  fixture.resultCard.dispatch("click");
  assert.equal(fixture.openCalls.length, 1);
  assert.equal(fixture.openCalls[0][0], "ket");
  assert.equal(fixture.openCalls[0][1], fixture.resultCard);
});

test("keyboard activation on a results card opens the modal", () => {
  const fixture = createPageFixture();
  fixture.resultCard.dispatch("keydown", createEvent({ key: "Enter" }));
  assert.equal(fixture.openCalls.length, 1);
});

test("the page still initializes when the results modal is absent", () => {
  const fixture = createPageFixture();
  assert.equal(fixture.nav.classList.contains("open"), false);
  fixture.toggle.dispatch("click");
  assert.equal(fixture.nav.classList.contains("open"), true);
});
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

```bash
cd "D:/Nancy/Web"
node --test "tests/page-behavior.test.mjs"
```

Kết quả mong đợi: FAIL với `openCalls.length` bằng `0`, cần `1`.

- [ ] **Step 3: Thêm mục 8 vào `script.js`**

Chèn ngay trước dòng cuối `})();`:

```javascript
  // ----------------------------------------------------------
  // 8. Course results modal
  // Chỉ những thẻ mang data-results mới mở được. Bảy khóa còn lại
  // chưa có ảnh kết quả nên cố tình không phản ứng khi bấm: mời bấm
  // rồi không có gì để xem còn tệ hơn là không mời.
  // ----------------------------------------------------------
  var resultsRoot = document.getElementById("results-modal");
  var resultsData = window.NANCY_RESULTS;
  var resultsApi = window.NancyResults;

  if (resultsRoot && resultsData && resultsApi) {
    var resultsModal = resultsApi.createResultsModal(resultsRoot, resultsData);

    document.querySelectorAll("[data-results]").forEach(function (card) {
      var key = card.getAttribute("data-results");

      card.addEventListener("click", function () {
        resultsModal.open(key, card);
      });

      // Thẻ là <article>, không tự nhận bàn phím. Nút "Xem thành tích"
      // bên trong mới là điểm vào chính thức, và nó nổi sự kiện click lên
      // đây. Nhánh này lo trường hợp người dùng focus thẳng vào thẻ.
      card.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        resultsModal.open(key, card);
      });
    });
  }
```

- [ ] **Step 4: Chạy test để xác nhận pass**

```bash
cd "D:/Nancy/Web"
node --test "tests/*.test.mjs"
```

Kết quả mong đợi: toàn bộ test pass.

- [ ] **Step 5: Commit**

```bash
cd "D:/Nancy/Web"
git add script.js tests/page-behavior.test.mjs
git commit -m "feat: open results modal from course cards"
```

---

## Task 11: Chốt chặn rò rỉ dữ liệu cá nhân

Đặt cuối cùng để nó bảo vệ mọi thứ đã làm. Test này tồn tại để lần sửa sau, khi không ai còn nhớ lý do, vẫn không vô tình đưa ảnh gốc trở lại.

**Files:**
- Modify: `tests/page-contract.test.mjs`

**Interfaces:**
- Consumes: cấu trúc thư mục từ Task 1 và Task 4
- Produces: không có gì

- [ ] **Step 1: Viết test thất bại**

Thêm vào đầu `tests/page-contract.test.mjs`, ngay sau các lệnh `readFile` sẵn có:

```javascript
import { readdir } from "node:fs/promises";

const imagesDir = new URL("../images/", import.meta.url);
const imageEntries = await readdir(imagesDir, { withFileTypes: true });
const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
```

Rồi thêm test vào cuối tệp:

```javascript
test("raw result images never sit inside the deployed images directory", async () => {
  const leaked = imageEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /result/i.test(name) && name !== "results");

  assert.deepEqual(
    leaked,
    [],
    `thư mục ảnh gốc còn trong images/: ${leaked.join(", ")}`,
  );
});

test("every redacted course folder holds the full set of results", async () => {
  const expected = { ket: 19, pet: 20, ielts: 8, ts10: 25 };

  for (const [key, count] of Object.entries(expected)) {
    const files = await readdir(new URL(`../images/results/${key}/`, import.meta.url));
    const jpgs = files.filter((name) => name.endsWith(".jpg"));
    assert.equal(jpgs.length, count, `${key}: ${jpgs.length} ảnh, cần ${count}`);
  }
});

test("the private original folder stays out of version control", () => {
  assert.match(gitignore, /^_private\/$/m);
});

test("no page markup points at an unredacted result image", () => {
  assert.equal(/images\/(ielts|ket|pet)result\//.test(html), false);
  assert.equal(/images\/result10\//.test(html), false);
});
```

- [ ] **Step 2: Chạy test để xác nhận pass ngay**

```bash
cd "D:/Nancy/Web"
node --test "tests/page-contract.test.mjs"
```

Bốn test này phải pass ngay vì Task 1 và Task 4 đã dựng đúng cấu trúc.

- [ ] **Step 3: Xác nhận test thật sự bắt được lỗi**

Test luôn xanh mà chưa từng đỏ thì không chứng minh được gì. Tạo tình huống hỏng rồi kiểm tra:

```bash
cd "D:/Nancy/Web"
mkdir -p images/ketresult && touch images/ketresult/leak.jpg
node --test "tests/page-contract.test.mjs" 2>&1 | grep -c "thư mục ảnh gốc"
rm -rf images/ketresult
node --test "tests/page-contract.test.mjs" 2>&1 | tail -6
```

Kết quả mong đợi: lệnh giữa in ra số lớn hơn `0`, và lệnh cuối cho thấy toàn bộ test pass trở lại.

- [ ] **Step 4: Chạy toàn bộ bộ kiểm thử**

```bash
cd "D:/Nancy/Web"
node --test "tests/*.test.mjs"
python -m unittest discover -s tools -p "test_*.py"
```

Kết quả mong đợi: không có test nào fail ở cả hai bộ.

- [ ] **Step 5: Kiểm tra trên trình duyệt thật**

Mở `index.html` trong trình duyệt và xác nhận:

1. Bốn thẻ KET, PET, IELTS, Tuyển sinh 10 có huy hiệu số lượng và dòng `Xem thành tích`.
2. Bảy thẻ còn lại không có gì thay đổi, bấm vào không có phản ứng.
3. Bấm một thẻ có kết quả mở hộp thoại đúng khóa, lưới ảnh đầy đủ.
4. Lưới Tuyển sinh 10 hiện 2 cột, ba khóa còn lại hiện 4 cột.
5. Bấm một ảnh mở lớp phóng to, nút `‹` `›` chạy vòng, bộ đếm khớp.
6. `Escape` lùi về lưới, `Escape` lần nữa đóng hộp thoại.
7. Thu cửa sổ xuống dưới 720px: lưới rút còn 2 cột và 1 cột đúng như thiết kế.
8. Mở tab Network, tải lại trang, xác nhận không có ảnh nào trong `images/results/` được tải trước khi bấm mở hộp thoại.

- [ ] **Step 6: Commit**

```bash
cd "D:/Nancy/Web"
git add tests/page-contract.test.mjs
git commit -m "test: guard against raw result images reaching deploy"
```

---

## Self-Review

**Spec coverage**

| Yêu cầu trong spec | Task |
| --- | --- |
| Che thẳng vào file ảnh, không phủ HTML | 3 |
| Ảnh gốc ra khỏi phạm vi triển khai, vào `.gitignore` | 1, 11 |
| Bản đồ che riêng từng ảnh | 2 |
| Chuẩn hoá khung theo khóa, thu nhỏ, JPEG q82 | 3, 4 |
| Kiểm tra bằng mắt toàn bộ ảnh đã che | 4 |
| `results-data.js` thuần dữ liệu, không suy diễn số liệu | 5 |
| Không nêu tỉ lệ đỗ | Global Constraints, 5 |
| Bốn thẻ có `data-results`, bảy thẻ giữ nguyên | 8 |
| Huy hiệu số lượng và nút mở | 8, 9 |
| Đầu hộp thoại, dải số liệu, lưới ảnh | 6, 7, 9 |
| Lớp phóng to trong cùng hộp thoại, có bộ đếm | 6, 7 |
| Số cột theo `shape`, rút cột dưới 720px | 9 |
| Đóng bằng nút, `Escape`, bấm nền | 7 |
| `Escape` lùi về lưới trước khi đóng | 7 |
| Trả focus về nút đã kích hoạt | 7 |
| Khóa cuộn nền dùng `.lightbox-active` | 7 |
| `aria-modal`, `role="dialog"`, nhãn theo khóa | 7, 8 |
| Tôn trọng `prefers-reduced-motion` | 9 |
| `loading="lazy"`, chỉ tải khi mở | 6, 11 |
| `results-modal.js` không biết về carousel | 6, 7, 10 |
| Test hợp đồng markup | 8 |
| Test hành vi hộp thoại | 7, 10 |
| Test chống rò rỉ | 11 |

Không có yêu cầu nào trong spec thiếu task.

**Placeholder scan**

Không còn `TBD`, `TODO`, hay bước nào mô tả suông không kèm mã. Task 2 và Task 4 là công việc đọc dữ liệu chứ không phải chỗ trống: cả hai đều có cấu trúc đầu ra cố định, tiêu chí nghiệm thu, và lệnh kiểm tra tự động.

**Type consistency**

- `apply_masks`, `fit_canvas`, `process_image` đặt tên thống nhất giữa Task 3 và test của nó.
- `escapeHtml`, `renderStats`, `renderGrid`, `renderDetail`, `createResultsModal` giữ nguyên tên từ Task 6 sang Task 7 và Task 10.
- Khóa dữ liệu `ket`, `pet`, `ielts`, `ts10` nhất quán từ Task 2 qua 5, 8, 10, 11.
- `shape` nhận đúng hai giá trị `portrait` và `landscape` ở Task 2, 6, 9.
- Lớp `lightbox-active` dùng lại đúng tên đã có trong `script.js` và `styles.css`.
- `data-action` nhận đúng năm giá trị `close`, `grid`, `zoom`, `prev`, `next`, khớp giữa Task 6, 7.
