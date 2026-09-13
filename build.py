# -*- coding: utf-8 -*-
"""拼接 parts 生成单文件 index.html"""
import os
import glob

BASE = os.path.dirname(os.path.abspath(__file__))
PARTS_DIR = os.path.join(BASE, "parts")

# 固定骨架
FIXED_HEAD = ["parts/01-head.html", "parts/02-body.html"]

# 数据文件：04*.js（含 04a 声明 let REAL_BANK）+ real-*.js（新增真题套卷），按文件名排序
data_files = sorted(
    [os.path.relpath(p, BASE).replace("\\", "/") for p in glob.glob(os.path.join(PARTS_DIR, "04*.js"))]
    + [os.path.relpath(p, BASE).replace("\\", "/") for p in glob.glob(os.path.join(PARTS_DIR, "real-*.js"))]
)

# 模拟题 + 核心逻辑 + 视图
TAIL_FILES = ["parts/05-mock.js", "parts/03a-core.js", "parts/03b-views.js"]

PARTS = FIXED_HEAD + data_files + TAIL_FILES
TAIL = "\n</script>\n</body>\n</html>\n"

print("构建文件顺序：")
for p in PARTS:
    print("  ", p)

chunks = []
for p in PARTS:
    with open(os.path.join(BASE, p), encoding="utf-8") as f:
        chunks.append(f.read())
html = "".join(chunks) + TAIL

out = os.path.join(BASE, "index.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)

print("\nOK ->", out, len(html), "bytes")
