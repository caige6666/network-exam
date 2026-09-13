# -*- coding: utf-8 -*-
import os, re

PARTS = r"C:\Users\X\Desktop\网工真题\parts"
print("=== 所有数据文件题量统计 ===\n")

all_ids = []
for f in sorted(os.listdir(PARTS)):
    if f.endswith(".js") and ("real" in f or f.startswith("04") or f.startswith("05")):
        path = os.path.join(PARTS, f)
        with open(path, encoding="utf-8") as fh:
            content = fh.read()
        ids = re.findall(r'id:"(r\d+[上下]?-\d+|m\d+)"', content)
        real_ids = [i for i in ids if i.startswith("r")]
        mock_ids = [i for i in ids if i.startswith("m")]
        sems = set(re.findall(r'sem:"([上下])"', content))
        years = set(re.findall(r'year:(\d+)', content))
        all_ids.extend(real_ids)
        if real_ids or mock_ids:
            print(f"{f}: 真题={len(real_ids)}, 模拟={len(mock_ids)}, year={sorted(years)}, sem={sorted(sems)}")

print(f"\n真题 ID 总数: {len(all_ids)}")
print(f"真题 ID 唯一数: {len(set(all_ids))}")
dupes = [i for i in set(all_ids) if all_ids.count(i) > 1]
if dupes:
    print(f"重复 ID: {dupes}")
else:
    print("无重复 ID")

# 检查 real-*.js 新文件
print("\n=== 新增 real-*.js 文件 ===")
for f in sorted(os.listdir(PARTS)):
    if f.startswith("real-") and f.endswith(".js"):
        path = os.path.join(PARTS, f)
        size = os.path.getsize(path)
        with open(path, encoding="utf-8") as fh:
            content = fh.read()
        ids = re.findall(r'id:"(r\d+[上下]-\d+)"', content)
        has_concat = "REAL_BANK = REAL_BANK.concat" in content
        print(f"  {f}: {len(ids)}题, {size}字节, concat模式={has_concat}")
