# -*- coding: utf-8 -*-
p = r"C:\Users\X\Doubao\chats\2026-09-13\new-chat\network-exam\index.html"
s = open(p, encoding="utf-8").read()
print("tail:", repr(s[-80:]))
print("script tags:", s.count("<script"), s.count("</script>"))
print("real qs:", s.count('source:"real"'))
print("mock qs:", s.count('source:"mock"'))
# 校验题库对象数量（近似：每个题目对象以 { id: 开头）
import re
print("q objects:", len(re.findall(r'\{ id:"[rm]\d{4}-?\d*"', s)))
