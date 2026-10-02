#!/usr/bin/env bash
# 一键部署：本地生成静态文件 -> rsync 同步到服务器
# 用法： ./deploy.sh
set -euo pipefail

# ====== 改这里 ======
SERVER="root@1.2.3.4"          # 你的服务器地址
WEB_ROOT="/var/www/blog"       # 服务器上的网站目录
SSH_PORT="22"
# ===================

cd "$(dirname "$0")"

echo "==> 1/3 清理旧产物"
npx hexo clean

echo "==> 2/3 生成静态页面"
npx hexo generate

echo "==> 3/3 同步到 $SERVER:$WEB_ROOT"
rsync -avz --delete \
  -e "ssh -p $SSH_PORT" \
  public/ "$SERVER:$WEB_ROOT/"

echo "==> 完成！打开你的域名看看"
