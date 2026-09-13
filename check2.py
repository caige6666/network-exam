# -*- coding: utf-8 -*-
"""定位 index.html 中 script 内的可疑字符"""
import re
p = r"C:\Users\X\Doubao\chats\2026-09-13\new-chat\network-exam\index.html"
s = open(p, encoding="utf-8").read()
m = re.search(r"<script>(.*?)</script>", s, re.S)
js = m.group(1)
print("js length:", len(js))
# 非 ASCII 控制字符 / 不可见字符
suspects = []
for i, ch in enumerate(js):
    o = ord(ch)
    if o < 32 and ch not in "\n\r\t":
        suspects.append((i, hex(o), repr(ch)))
    elif 0x7f <= o <= 0x9f:
        suspects.append((i, hex(o), repr(ch)))
    elif 0x200b <= o <= 0x200f or o == 0xfeff:
        suspects.append((i, hex(o), repr(ch)))
print("suspect chars:", suspects[:30])
# 行号定位
lines = js.split("\n")
for i, line in enumerate(lines):
    for o in range(len(line)):
        c = line[o]
        if ord(c) < 32 and c not in "\n\r\t":
            print("line", i + 1, "char", o, repr(c), "|", line[:80])
