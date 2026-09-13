# -*- coding: utf-8 -*-
"""将本地完整项目上传到 caige6666/network-exam 仓库（一次 git tree 提交）"""
import base64
import json
import os
import subprocess
import sys

GH = r"C:\Program Files\GitHub CLI\gh.exe"
REPO = "caige6666/network-exam"
SRC = r"C:\Users\X\Desktop\网络工程师模拟考试系统"
SKIP = {"_shots", "_gh_sync", ".git", "_list_repo.py"}
MSG = "上传完整项目：23套真题1690题+77模拟（含 parts 源码与构建脚本）"


def gh(args):
    r = subprocess.run([GH] + args, capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        raise RuntimeError(f"gh {args[0]} {args[1] if len(args)>1 else ''}: {r.stderr[:300]}")
    return r.stdout


# 1) 收集本地文件
files = []
for root, dirs, names in os.walk(SRC):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for n in names:
        if n in SKIP:
            continue
        p = os.path.join(root, n)
        rel = os.path.relpath(p, SRC).replace("\\", "/")
        files.append((rel, p))
files.sort()
print("本地文件数:", len(files))

# 2) 当前 HEAD / tree
try:
    head = json.loads(gh(["api", f"repos/{REPO}/git/ref/heads/main"]))
    branch = "main"
except RuntimeError:
    head = json.loads(gh(["api", f"repos/{REPO}/git/ref/heads/master"]))
    branch = "master"
head_sha = head["object"]["sha"]
head_commit = json.loads(gh(["api", f"repos/{REPO}/git/commits/{head_sha}"]))
base_tree = head_commit["tree"]["sha"]
print("分支:", branch, "HEAD:", head_sha[:8], "base_tree:", base_tree[:8])

# 3) 创建 blobs
tree_items = []
for rel, p in files:
    with open(p, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    body = json.dumps({"content": b64, "encoding": "base64"})
    body_path = os.path.join(SRC, "_gh_body.json")
    with open(body_path, "w", encoding="utf-8") as f:
        f.write(body)
    blob = json.loads(gh(["api", "--method", "POST", f"repos/{REPO}/git/blobs", "--input", body_path]))
    tree_items.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
print("blobs 创建完成")

# 4) 创建 tree（继承 base，覆盖/新增）
tree_body = json.dumps({"base_tree": base_tree, "tree": tree_items})
body_path = os.path.join(SRC, "_gh_body.json")
with open(body_path, "w", encoding="utf-8") as f:
    f.write(tree_body)
tree = json.loads(gh(["api", "--method", "POST", f"repos/{REPO}/git/trees", "--input", body_path]))
new_tree_sha = tree["sha"]
print("tree:", new_tree_sha[:8])

# 5) 创建 commit
commit_body = json.dumps({"message": MSG, "tree": new_tree_sha, "parents": [head_sha]})
with open(body_path, "w", encoding="utf-8") as f:
    f.write(commit_body)
commit = json.loads(gh(["api", "--method", "POST", f"repos/{REPO}/git/commits", "--input", body_path]))
print("commit:", commit["sha"][:8])

# 6) 更新 ref
ref_body = json.dumps({"sha": commit["sha"]})
with open(body_path, "w", encoding="utf-8") as f:
    f.write(ref_body)
gh(["api", "--method", "PATCH", f"repos/{REPO}/git/refs/heads/{branch}", "--input", body_path])
print("push 完成:", branch)

os.remove(body_path)
