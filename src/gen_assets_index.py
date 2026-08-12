# import os
# import json

# # Thư mục chứa assets
# base_dir = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
# base_dir = os.path.abspath(base_dir)  # chuẩn hóa đường dẫn

# def walk(dir_path):
#     result = {}
#     for entry in os.scandir(dir_path):
#         if entry.is_dir():
#             result[entry.name] = walk(entry.path)
#         elif entry.is_file() and entry.name.lower().endswith((".jpg", ".jpeg", ".png", ".gif")):
#             result.setdefault("_files", []).append(entry.name)
#     return result

# index = walk(base_dir)

# out_path = os.path.join(os.path.dirname(__file__), "data", "assetsIndex.json")
# with open(out_path, "w", encoding="utf-8") as f:
#     json.dump(index, f, ensure_ascii=False, indent=2)

# print(f"✅ Generated {out_path}")

import os
import json

# Thư mục chứa assets
base_dir = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
base_dir = os.path.abspath(base_dir)  # chuẩn hóa đường dẫn

def walk(dir_path):
    result = {}
    for entry in os.scandir(dir_path):
        if entry.is_dir():
            result[entry.name] = walk(entry.path)
        elif entry.is_file() and entry.name.lower().endswith((".jpg", ".jpeg", ".png", ".gif")):
            result.setdefault("_files", []).append(entry.name)
    return result

def count_images(index_dict):
    count = 0
    for v in index_dict.values():
        if isinstance(v, dict):
            count += count_images(v)
        elif isinstance(v, list):  # gặp _files
            count += len(v)
    return count

# Tạo toàn bộ index
full_index = walk(base_dir)

# Tách dữ liệu theo yêu cầu
l_index = {}
k_index = {}

for key, value in full_index.items():
    if key.startswith("L"):
        l_index[key] = value
    elif key.startswith("K"):
        try:
            number = int(key[1:])  # Lấy số sau chữ 'K'
            if 1 <= number <= 20:
                k_index[key] = value
        except ValueError:
            continue

# Đếm tổng số ảnh
l_count = count_images(l_index)
k_count = count_images(k_index)

# Lưu file L
out_path_l = os.path.join(os.path.dirname(__file__), "data", "assetsIndex_L.json")
with open(out_path_l, "w", encoding="utf-8") as f:
    json.dump(l_index, f, ensure_ascii=False, indent=2)

# Lưu file K01 → K20
out_path_k = os.path.join(os.path.dirname(__file__), "data", "assetsIndex_K01_K20.json")
with open(out_path_k, "w", encoding="utf-8") as f:
    json.dump(k_index, f, ensure_ascii=False, indent=2)

# In kết quả
print(f"✅ Generated: {out_path_l} ({l_count} images)")
print(f"✅ Generated: {out_path_k} ({k_count} images)")
print(f"📦 Tổng số ảnh: {l_count + k_count}")
