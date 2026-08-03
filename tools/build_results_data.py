#!/usr/bin/env python3
"""Sinh results-data.js từ tools/redact-map.json.

Mọi con số trên trang phải đọc được từ ảnh phiếu điểm. Script này chỉ đọc
lại các nhãn `caption` và `meta` đã ghi trong bản đồ che rồi rút ra ô số
liệu tổng hợp, không nhập tay giá trị nào. Sửa bản đồ che rồi chạy lại,
đừng sửa tay results-data.js.

Điểm tổng của Tuyển sinh 10 là tổng ba môn Toán, Ngữ văn, Ngoại ngữ - đây
là phép cộng trên số đọc trực tiếp từ ảnh, không phải suy diễn.
"""
import json
import re
import sys
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    if hasattr(_stream, "reconfigure"):
        _stream.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
MAP_PATH = ROOT / "tools" / "redact-map.json"
OUT_PATH = ROOT / "results-data.js"

CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]


def _numbers(text):
    return [float(n) for n in re.findall(r"\d+(?:\.\d+)?", text)]


def cambridge_stats(items):
    """KET và PET: `meta` dạng "136 · A2" - điểm tổng rồi bậc CEFR."""
    scores, levels = [], []
    for item in items:
        if not item["meta"]:
            continue
        parts = [p.strip() for p in item["meta"].split("·")]
        nums = _numbers(parts[0])
        if nums:
            scores.append(nums[0])
        for part in parts[1:]:
            if part in CEFR_ORDER:
                levels.append(part)
    return scores, levels


def ielts_totals(items):
    """IELTS: `caption` dạng "Overall 7.5"."""
    totals = []
    for item in items:
        nums = _numbers(item["caption"])
        if nums:
            totals.append(nums[0])
    return totals


def ts10_totals(items):
    """Tuyển sinh 10: cộng ba môn trong `meta` dạng "Toán 8 · Văn 8.5 · Anh 9.75"."""
    totals = []
    for item in items:
        if not item["meta"]:
            continue
        nums = _numbers(item["meta"])
        if len(nums) >= 3:
            totals.append(sum(nums[:3]))
    return totals


def tidy(value, decimals=None):
    """Bỏ đuôi .0 cho số nguyên, trừ khi được yêu cầu giữ số lẻ cố định.

    IELTS luôn viết band một chữ số thập phân ("6.0", "7.5"), nên khối đó
    truyền decimals=1; các khối khác để rơi đuôi cho gọn.
    """
    if decimals is not None:
        return "%.*f" % (decimals, value)
    text = ("%.2f" % value).rstrip("0").rstrip(".")
    return text or "0"


def span(values, decimals=None):
    if not values:
        return ""
    low, high = min(values), max(values)
    if low == high:
        return tidy(low, decimals)
    return "%s-%s" % (tidy(low, decimals), tidy(high, decimals))


def build_stats(key, items):
    if key in ("ket", "pet"):
        scores, levels = cambridge_stats(items)
        present = [lv for lv in CEFR_ORDER if lv in levels]
        level_range = ""
        if present:
            level_range = present[0] if len(present) == 1 else "%s-%s" % (present[0], present[-1])
        return {
            "total": len(items),
            "highest": tidy(max(scores)) if scores else "",
            "range": level_range,
        }

    decimals = 1 if key == "ielts" else None
    totals = ielts_totals(items) if key == "ielts" else ts10_totals(items)
    return {
        "total": len(items),
        "highest": tidy(max(totals), decimals) if totals else "",
        "range": span(totals, decimals),
    }


def main():
    mapping = json.loads(MAP_PATH.read_text(encoding="utf-8"))
    lines = [
        "// Dữ liệu thành tích học viên. Sinh ra từ tools/redact-map.json.",
        "// Mọi con số ở đây đọc trực tiếp từ ảnh phiếu điểm, không suy diễn.",
        "// Chạy lại: python tools/build_results_data.py",
        "window.NANCY_RESULTS = {",
    ]

    for key, block in mapping.items():
        items = block["images"]
        stats = build_stats(key, items)
        lines.append("  %s: {" % key)
        for field in ("label", "cefr", "grade", "org", "shape"):
            lines.append("    %s: %s," % (field, json.dumps(block[field], ensure_ascii=False)))
        lines.append(
            '    stats: { total: %d, highest: %s, range: %s },'
            % (
                stats["total"],
                json.dumps(stats["highest"], ensure_ascii=False),
                json.dumps(stats["range"], ensure_ascii=False),
            )
        )
        lines.append("    items: [")
        for item in items:
            lines.append(
                '      { src: "images/results/%s/%s", caption: %s, meta: %s },'
                % (
                    key,
                    item["out"],
                    json.dumps(item["caption"], ensure_ascii=False),
                    json.dumps(item["meta"], ensure_ascii=False),
                )
            )
        lines.append("    ],")
        lines.append("  },")
        print("%s: %d ảnh, cao nhất %s, khoảng %s" % (key, stats["total"], stats["highest"] or "-", stats["range"] or "-"))

    lines.append("};")
    OUT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Đã ghi %s" % OUT_PATH.name)
    return 0


if __name__ == "__main__":
    sys.exit(main())
