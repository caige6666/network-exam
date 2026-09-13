# -*- coding: utf-8 -*-
import re, subprocess, tempfile, os
p = r"C:\Users\X\Doubao\chats\2026-09-13\new-chat\network-exam\index.html"
s = open(p, encoding="utf-8").read()
m = re.search(r"<script>(.*?)</script>", s, re.S)
js = m.group(1)
tmp = os.path.join(tempfile.gettempdir(), "netexam_check.js")
with open(tmp, "w", encoding="utf-8") as f:
    f.write(js)
r = subprocess.run(["node", "--check", tmp], capture_output=True, text=True)
print("STDOUT:", r.stdout)
print("STDERR:", r.stderr[:2000])
os.remove(tmp)
