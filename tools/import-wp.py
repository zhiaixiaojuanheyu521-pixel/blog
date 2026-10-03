#!/usr/bin/env python3
"""
把 Typora 写的 Markdown 一键导入成 Hexo 文章。

用法：
    python3 tools/import-wp.py "C:\\Users\\...\\你的文章.md"
    python3 tools/import-wp.py "/mnt/c/Users/.../你的文章.md"

脚本会自动：
    1. 读取标题（从第一个 # 标题）
    2. 找出所有本地图片，转成 WebP 并搬到 source/img/posts/<slug>/
    3. 把 Markdown 里的本地路径改写成网站路径
    4. 加上 front matter（分类、标签、封面等）
    5. 生成 source/_posts/<slug>.md

★ 原文件一个字都不会改，全程在副本上操作。
"""
import os
import re
import sys
import hashlib
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("❌ 缺少 Pillow，请先运行：pip install Pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
POSTS = ROOT / "source" / "_posts"
IMGROOT = ROOT / "source" / "img" / "posts"

MAX_WIDTH = 1600      # 图片最大宽度（超过就等比缩放，只缩不裁）
WEBP_QUALITY = 88


def win_to_wsl(p: str) -> Path:
    """把 Windows 路径转成 WSL 路径，已经是 WSL 路径就原样返回。"""
    p = p.strip().strip('"').strip("'")
    if re.match(r"^[A-Za-z]:[\\/]", p):
        drive = p[0].lower()
        rest = p[2:].lstrip("\\/").replace("\\", "/")
        return Path(f"/mnt/{drive}/{rest}")
    return Path(p)


def ask(prompt: str, default: str = "") -> str:
    suffix = f" [{default}]" if default else ""
    try:
        ans = input(f"  {prompt}{suffix}: ").strip()
    except EOFError:
        ans = ""
    return ans or default


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    src = win_to_wsl(sys.argv[1])
    if not src.exists():
        print(f"❌ 找不到文件: {src}")
        sys.exit(1)

    print(f"\n📄 源文件: {src.name}")
    raw = src.read_text(encoding="utf-8").replace("\r\n", "\n").replace("\r", "\n")

    if raw.lstrip().startswith("---"):
        print("⚠️  这个文件已经有 front matter 了，脚本会跳过添加步骤（但图片仍会处理）")
        has_fm = True
    else:
        has_fm = False

    # ---------- 标题 ----------
    m = re.search(r"^#\s+(.+)$", raw, re.M)
    default_title = m.group(1).strip() if m else src.stem
    print(f"\n📌 检测到标题: {default_title}")

    # ---------- 交互收集信息 ----------
    print("\n请填写以下信息（直接回车用默认值）：")
    title = ask("文章标题", default_title)
    slug = ask("英文链接名（会成为 URL）", "")
    while not slug:
        slug = ask("英文链接名（必填，用短横线连接，如 cmd-injection）")
    slug = re.sub(r"[^a-zA-Z0-9\-_]", "-", slug).strip("-").lower()

    category = ask("分类", "CTF")
    tags_raw = ask("标签（英文逗号分隔）", "CTF,Web安全")
    tags = [t.strip() for t in re.split(r"[,，]", tags_raw) if t.strip()]

    cover = ask("封面图", "/img/cover-tech.svg")
    desc = ask("文章摘要（可留空，首页卡片显示）", "")

    # ---------- 处理图片 ----------
    imgs = re.findall(r"!\[([^\]]*)\]\(([^)]+)\)", raw)
    local = [(a, p) for a, p in imgs if re.match(r"^(C:|/mnt/|[A-Za-z]:)", p.strip())]

    print(f"\n🖼️  发现 {len(imgs)} 处图片引用，其中 {len(local)} 处是本地路径")

    imgdir = IMGROOT / slug
    mapping = {}
    ok = miss = 0
    before = after = 0

    for idx, (alt, winpath) in enumerate(local, 1):
        wsl = win_to_wsl(winpath)
        if not wsl.exists():
            print(f"    ⚠️  [{idx}] 找不到: {wsl}")
            miss += 1
            continue

        imgdir.mkdir(parents=True, exist_ok=True)
        name = f"{idx:02d}.webp"
        dst = imgdir / name

        try:
            size_before = wsl.stat().st_size
            im = Image.open(wsl)
            im = im.convert("RGB") if im.mode in ("RGBA", "P", "LA") else im
            if im.width > MAX_WIDTH:
                h = round(im.height * MAX_WIDTH / im.width)
                im = im.resize((MAX_WIDTH, h), Image.LANCZOS)
            im.save(dst, "WEBP", quality=WEBP_QUALITY, method=6)
            size_after = dst.stat().st_size
            before += size_before
            after += size_after
            mapping[winpath] = f"/img/posts/{slug}/{name}"
            ok += 1
        except Exception as e:
            print(f"    ❌ [{idx}] 转换失败: {e}")
            miss += 1

    for win, url in mapping.items():
        raw = raw.replace(f"]({win})", f"]({url})")

    if ok:
        saved = (1 - after / before) * 100 if before else 0
        print(f"    ✅ 成功 {ok} 张，失败/缺失 {miss} 张")
        print(f"    📦 体积: {before/1024:.0f} KB → {after/1024:.0f} KB (省 {saved:.0f}%)")

    # ---------- 加 front matter ----------
    body = raw
    if not has_fm:
        body = re.sub(r"^#\s+.+\n", "", raw, count=1).lstrip("\n")
        fm = ["---", f"title: {title}", f"date: {src.stat().st_mtime and __import__('datetime').datetime.fromtimestamp(src.stat().st_mtime):%Y-%m-%d %H:%M:%S}",
              "categories:", f"  - {category}", "tags:"]
        fm += [f"  - {t}" for t in tags]
        if desc:
            fm.append(f"description: {desc}")
        fm += [f"cover: {cover}", "comments: true", "---", "", ""]
        body = "\n".join(fm) + body

    POSTS.mkdir(parents=True, exist_ok=True)
    out = POSTS / f"{slug}.md"
    if out.exists():
        ans = ask(f"⚠️  {out.name} 已存在，覆盖吗？(y/N)", "N")
        if ans.lower() != "y":
            print("已取消")
            sys.exit(0)
    out.write_text(body, encoding="utf-8")

    print(f"\n✅ 完成！")
    print(f"   文章: {out.relative_to(ROOT)}")
    print(f"   图片: {(imgdir.relative_to(ROOT) if ok else '无')}")
    print(f"   链接: /日期/{slug}/")
    print(f"\n👉 下一步: ./dev.sh preview   然后打开 http://localhost:4000 看效果")


if __name__ == "__main__":
    main()
