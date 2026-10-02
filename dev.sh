#!/usr/bin/env bash
# 日常用这个脚本，不用记 hexo 命令
#
#   ./dev.sh new "文章标题"              → 中文文件名（URL 会变成一串 %E4%BD%A0...）
#   ./dev.sh new "文章标题" my-post      → 指定英文链接名（URL 是 /2026/10/my-post/）✅ 推荐
#   ./dev.sh preview                     → 本地预览
#   ./dev.sh build                       → 生成 public/
#   ./dev.sh clean                       → 清缓存

set -e
export PATH="$HOME/.local/node/bin:$HOME/.local/npm-global/bin:$PATH"
cd "$(dirname "$0")"

case "${1:-preview}" in
  new)
    [ -z "$2" ] && { echo '用法: ./dev.sh new "文章标题" [英文链接名]'; exit 1; }
    hexo new "$2"
    if [ -n "$3" ]; then
      # 把生成的中文文件名改成指定的英文名，避免 URL 变成 percent-encoding
      old=$(ls -t source/_posts/*.md | head -1)
      dir=$(dirname "$old")
      new="$dir/$3.md"
      if [ -e "$new" ]; then
        echo "⚠️  $new 已存在，保留原文件名"
      else
        mv "$old" "$new"
        echo "✅ 文件名: $(basename "$old") → $3.md"
        echo "   链接会是: /日期/$3/"
      fi
    fi
    ;;
  preview) echo "→ http://localhost:4000"; hexo server -p 4000 ;;
  build)   hexo clean && hexo generate && node tools/copy-cf.js ;;
  clean)   hexo clean ;;
  *)       sed -n '2,10p' "$0" | sed 's/^# \{0,1\}//' ;;
esac
