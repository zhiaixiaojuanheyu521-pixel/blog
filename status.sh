#!/usr/bin/env bash
# 一键检查博客状态：本地 → GitHub → 线上
cd "$(dirname "$0")"
export PATH="$HOME/.local/node/bin:$HOME/.local/npm-global/bin:$PATH"

BRANCH=$(git branch --show-current)
SITE="yuu-blog.top"

echo ""
echo "═══════════ 博客状态检查 ═══════════"
echo ""

# ---------- 第 1 层：本地有没有没提交的改动 ----------
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
  echo "① 本地改动      ✅ 没有未提交的改动"
else
  echo "① 本地改动      ⚠️  有东西没提交："
  echo "$CHANGES" | head -8 | sed 's/^/                 /'
fi

# ---------- 第 2 层：有没有没推的提交 ----------
git fetch origin -q 2>/dev/null
AHEAD=$(git rev-list --count "origin/$BRANCH..HEAD" 2>/dev/null || echo "?")
if [ "$AHEAD" = "0" ]; then
  echo "② 推送到 GitHub  ✅ 已全部推送"
else
  echo "② 推送到 GitHub  ⚠️  有 $AHEAD 个提交还没推上去"
  git log --oneline "origin/$BRANCH..HEAD" 2>/dev/null | head -5 | sed 's/^/                 /'
fi

# ---------- 第 3 层：线上是否可访问 ----------
if curl -s -o /dev/null -m 15 "https://$SITE/" 2>/dev/null; then
  echo "③ 线上网站      ✅ https://$SITE 可以访问"
else
  echo "③ 线上网站      ❌ 打不开（可能是本地网络问题）"
fi

echo ""
echo "═══════════ 结论 ═══════════"

if [ -z "$CHANGES" ] && [ "$AHEAD" = "0" ]; then
  echo "  ✅ 全部同步，线上就是最新版本"
  echo ""
  echo "  看线上内容: https://$SITE"
else
  echo "  ⚠️  还有东西没上线！执行这两条："
  [ -n "$CHANGES" ] && echo "     git add -A && git commit -m \"更新\""
  [ "$AHEAD" != "0" ] && echo "     git push"
  echo ""
  echo "  推送后等 1~2 分钟，Cloudflare 会自动部署"
fi
echo ""
