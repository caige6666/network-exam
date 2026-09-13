# -*- coding: utf-8 -*-
"""生成应用图标 PNG（纯标准库，无需 PIL）"""
import struct, zlib, os

def make_png(size, path):
    W = H = size
    px = bytearray()
    # 圆角矩形 + 白色条纹，边缘抗锯齿（简单 4x 超采样）
    def in_round(x, y, r):
        cx = min(max(x, r), W - r)
        cy = min(max(y, r), H - r)
        return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
    r = int(W * 0.22)
    stripe_w = int(W * 0.09)
    for y in range(H):
        px.append(0)  # filter none
        for x in range(W):
            # 4x 子采样抗锯齿
            a = 0.0; R = 0.0; G = 0.0; B = 0.0
            for sy in (0.25, 0.75):
                for sx in (0.25, 0.75):
                    xx, yy = x + sx, y + sy
                    inside = in_round(xx, yy, r)
                    if not inside:
                        continue
                    a += 1
                    # 三条白色横条
                    is_stripe = (0.16 * W <= yy <= 0.24 * W or
                                 0.41 * W <= yy <= 0.49 * W or
                                 0.66 * W <= yy <= 0.74 * W)
                    # 圆角内颜色
                    if is_stripe:
                        R += 255; G += 255; B += 255
                    else:
                        R += 47; G += 111; B += 237
            cov = a / 4.0
            if cov <= 0:
                R = G = B = 0
            else:
                R = int(R / a); G = int(G / a); B = int(B / a)
            px += bytes((R, G, B, int(255 * cov)))
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xffffffff)
    raw = zlib.compress(bytes(px), 9)
    png = (b"\x89PNG\r\n\x1a\n" +
           chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 6, 0, 0, 0)) +
           chunk(b"IDAT", raw) +
           chunk(b"IEND", b""))
    with open(path, "wb") as f:
        f.write(png)
    print("OK ->", path)

base = os.path.dirname(os.path.abspath(__file__))
make_png(192, os.path.join(base, "icon-192.png"))
make_png(512, os.path.join(base, "icon-512.png"))
