#!/usr/bin/env bash
# 发布博客到线上（不需要梯子、不需要 GitHub）
#
#   ./publish.sh
#
# 原理：直接把 public/ 目录上传到 Cloudflare Pages
# 走的是 Cloudflare 的 API，国内可以直连
set -e
cd "$(dirname "$0")"
export PATH="$HOME/.local/node/bin:$HOME/.local/npm-global/bin:$PATH"

echo ""
echo "════════ 发布到 Cloudflare Pages ════════"
echo ""

echo "① 清理旧产物"
hexo clean > /dev/null 2>&1

echo "② 生成静态页面"
hexo generate 2>&1 | grep -E "files generated" || true
node tools/copy-cf.js 2>&1 | tail -1

echo "③ 上传到 Cloudflare"
wrangler pages deploy public \
  --project-name=yuu-blog \
  --branch=main \
  --commit-dirty=true 2>&1 | grep -E "Uploaded|complete" | sed 's/^/   /'

echo ""
echo "✅ 发布完成！"
echo "   线上地址: https://yuu-blog.top"
echo "   （CDN 生效需要几秒，看的时候按 Ctrl+F5 强制刷新）"
echo ""
echo "   ⚠️ 注意：这只更新了线上，本地代码还没提交到 Git。"
echo "      想保留版本记录的话记得另外跑:"
echo "         git add -A && git commit -m \"更新\""
echo ""
