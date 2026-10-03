#!/usr/bin/env bash
# 一键导入 Typora 写的 Markdown 到博客
# 用法: ./import-wp.sh "C:\Users\...\你的文章.md"
set -e
cd "$(dirname "$0")"
python3 tools/import-wp.py "$@"
