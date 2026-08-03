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
