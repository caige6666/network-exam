# -*- coding: utf-8 -*-
"""迁移旧真题数据：加 sem 字段，改 id 格式为 r<年><上|下>-<nn>"""
import re, os

BASE = r"C:\Users\X\Desktop\网工真题\parts"

# 文件 -> (年份, sem)
FILES = {
    "04a-real-2024.js": (2024, "上"),
    "04b-real-2022.js": (2022, "下"),
    "04c-real-2021.js": (2021, "上"),
    "04d-real-2016.js": (2016, "上"),
}

for fname, (year, sem) in FILES.items():
    path = os.path.join(BASE, fname)
    with open(path, encoding="utf-8") as f:
        content = f.read()

    # 1. id: r2024-01 -> r2024上-01
    old_id_pat = f'r{year}-'
    new_id_pat = f'r{year}{sem}-'
    content = content.replace(old_id_pat, new_id_pat)

    # 2. 加 sem 字段: year:2024, paper:"上午" -> year:2024, sem:"上", paper:"上午"
    old_year_pat = f'year:{year}, paper:"上午"'
    new_year_pat = f'year:{year}, sem:"{sem}", paper:"上午"'
    content = content.replace(old_year_pat, new_year_pat)

    # 3. 更新文件头注释
    content = re.sub(
        r'/\* 真题库 · \d+ 年[^*]*\*/',
        f'/* 真题库 · {year} {("上半年" if sem == "上" else "下半年")} */',
        content, count=1
    )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    # 统计
    id_count = content.count(f'r{year}{sem}-')
    sem_count = content.count(f'sem:"{sem}"')
    print(f"{fname}: 迁移完成, id匹配={id_count}, sem字段={sem_count}")

print("\n全部迁移完成")
