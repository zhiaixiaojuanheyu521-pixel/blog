#!/usr/bin/env bash
# 日常用这个：./dev.sh [new "标题" | preview | build | clean]
set -e
export PATH="$HOME/.local/node/bin:$HOME/.local/npm-global/bin:$PATH"
cd "$(dirname "$0")"

case "${1:-preview}" in
  new)     hexo new "${2:?用法: ./dev.sh new \"文章标题\"}" ;;
  preview) echo "→ http://localhost:4000"; hexo server -p 4000 ;;
  build)   hexo clean && hexo generate && echo "→ 产物在 public/" ;;
  clean)   hexo clean ;;
  *)       echo "用法: ./dev.sh [new \"标题\" | preview | build | clean]" ;;
esac
