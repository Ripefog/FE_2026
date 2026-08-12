import os
import json
import re

# Thư mục chứa ảnh
folder = r"assets/K20/K20_V004"

# Danh sách kết quả
results = []

# Regex để tách thông tin từ filename
# Ví dụ: L26_V356_0356.80s.jpg
pattern = re.compile(r"^(?P<video_id>K\d+_V\d+)_(?P<frame_idx>\d+)\.(?P<timestamp>\d+)s\.jpg$")

for filename in os.listdir(folder):
    if filename.lower().endswith(".jpg"):
        match = pattern.match(filename)
        if match:
            video_id = match.group("video_id")
            keyframe_idx = match.group("frame_idx")
            timestamp = match.group("timestamp")

            results.append({
                "video_id": video_id,
                "keyframe_id": filename,
                "timestamp": timestamp,
                "keyframe_idx": keyframe_idx
            })

# Xuất ra file JSON
out_path = "keyframes.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Đã lưu {len(results)} keyframes vào {out_path}")
