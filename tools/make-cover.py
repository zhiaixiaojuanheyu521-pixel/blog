#!/usr/bin/env python3
"""
把任意图片做成博客封面。

用法：
    python3 tools/make-cover.py "C:\\Users\\...\\你的图.jpg"
    python3 tools/make-cover.py "C:\\...\\你的图.jpg" my-cover     # 指定文件名

它会：
    1. 居中裁剪成 3:1（博客封面最佳比例）
    2. 缩放到 1920x640
    3. 转成 WebP 压缩
    4. 存到 source/img/

原始文件不会被修改。
"""
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ 缺少 Pillow，请运行：pip install Pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
OUTDIR = ROOT / "source" / "img"
TARGET_W, TARGET_H = 1920, 640      # 3:1


def win_to_wsl(p: str) -> Path:
    p = p.strip().strip('"').strip("'")
    if re.match(r"^[A-Za-z]:[\\/]", p):
        drive = p[0].lower()
        rest = p[2:].lstrip("\\/").replace("\\", "/")
        return Path(f"/mnt/{drive}/{rest}")
    return Path(p)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = win_to_wsl(sys.argv[1])
    if not src.exists():
        print(f"❌ 找不到文件: {src}")
        sys.exit(1)

    name = sys.argv[2] if len(sys.argv) > 2 else src.stem
    name = re.sub(r"[^a-zA-Z0-9\-_]", "-", name).strip("-").lower() or "cover"
    dst = OUTDIR / f"{name}.webp"

    im = Image.open(src)
    print(f"\n📷 原图: {src.name}")
    print(f"   尺寸 {im.width}x{im.height}  ({im.width/im.height:.2f}:1)  {src.stat().st_size/1024:.0f} KB")

    if im.mode in ("RGBA", "P", "LA"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im.convert("RGBA"), mask=im.convert("RGBA").split()[-1])
        im = bg
    else:
        im = im.convert("RGB")

    # 居中裁剪成目标比例
    target_ratio = TARGET_W / TARGET_H
    cur_ratio = im.width / im.height
    if cur_ratio > target_ratio:
        new_w = int(im.height * target_ratio)
        cut = im.width - new_w
        left = cut // 2
        print(f"   左右各裁 {cut//2}px（共 {cut}px）→ 居中保留")
        im = im.crop((left, 0, left + new_w, im.height))
    elif cur_ratio < target_ratio:
        new_h = int(im.width / target_ratio)
        cut = im.height - new_h
        top = cut // 2
        print(f"   上下各裁 {cut//2}px（共 {cut}px）→ 居中保留")
        im = im.crop((0, top, im.width, top + new_h))
    else:
        print("   比例正好，无需裁剪")

    im = im.resize((TARGET_W, TARGET_H), Image.LANCZOS)
    OUTDIR.mkdir(parents=True, exist_ok=True)
    im.save(dst, "WEBP", quality=88, method=6)

    print(f"\n✅ 封面已生成")
    print(f"   文件: source/img/{dst.name}")
    print(f"   尺寸: {TARGET_W}x{TARGET_H} (3:1)")
    print(f"   体积: {dst.stat().st_size/1024:.0f} KB")
    print(f"\n👉 在文章 front matter 里写：")
    print(f"   cover: /img/{dst.name}")


if __name__ == "__main__":
    main()
