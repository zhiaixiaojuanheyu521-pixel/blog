# 留言板后端（Twikoo）部署指南

## 为什么要这一步

Hexo 生成的是**纯静态网页**，服务器上只有 .html/.css/.js 文件，没有数据库，
所以「访客留言」这件事没有任何地方可以存。

解决办法是单独部署一个**评论后端**，它负责存留言、返回留言列表。
前端的评论区（主题里已经配好了）通过一个网址去访问它，这个网址就是 `envId`。

```
访客浏览器  ──读/写留言──>  Twikoo 后端（存 MongoDB）  ────>  留言数据
     │
     └──加载页面──> Cloudflare Pages / 你的服务器
```

## 三个方案，挑一个

| 方案 | 费用 | 国内访问 | 难度 | 适合 |
| --- | --- | --- | --- | --- |
| A. 腾讯云开发 CloudBase | 免费额度够用 | ⭐⭐⭐ 好 | 简单 | 没有服务器 |
| B. Vercel 部署 | 免费 | ⭐ 一般，可能需梯子 | 简单 | 有梯子 |
| C. 自己的 VPS + Docker | 服务器钱 | ⭐⭐⭐ 好 | 中等 | 已有服务器 |

---

## 方案 A：腾讯云开发（推荐给国内使用）

1. 注册并实名腾讯云，开通「云开发 CloudBase」（有免费额度）
2. 按 Twikoo 官方文档做「一键部署」：
   https://twikoo.js.org/quick-start.html
3. 部署完会给你一个环境 ID（形如 `xxx-1g2h3j4k5l6m7n`）
4. 把环境 ID 填到 `_config.butterfly.yml`：

   ```yaml
   twikoo:
     envId: xxx-1g2h3j4k5l6m7n
     region: ap-shanghai     # 你的环境所在地域
   ```

---

## 方案 B：Vercel 部署（最快，5 分钟）

1. 打开 https://twikoo.js.org/quick-start.html 点「Vercel 部署」一键按钮
2. 用 GitHub 登录，一路 Next，部署完会得到一个网址
3. 如果国内访问慢，在 Vercel 里给它绑一个自己的子域名（比如 `twikoo.yourdomain.com`）
4. 填到 `_config.butterfly.yml`：

   ```yaml
   twikoo:
     envId: https://twikoo.yourdomain.com
   ```

---

## 方案 C：自己的 VPS + Docker（最可控）

1. 把本目录（`deploy/twikoo/`）传到服务器
2. 启动：

   ```bash
   cd twikoo
   docker compose up -d
   ```

3. 用 nginx 反代 8081 端口到一个子域名：

   ```nginx
   server {
       listen 80;
       server_name twikoo.yourdomain.com;
       location / {
           proxy_pass http://127.0.0.1:8081;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. 配 HTTPS：

   ```bash
   certbot --nginx -d twikoo.yourdomain.com
   ```

5. 填到 `_config.butterfly.yml`：

   ```yaml
   twikoo:
     envId: https://twikoo.yourdomain.com
   ```

---

## 配好之后

```bash
cd ~/blog
hexo clean && hexo generate
```

打开留言板页面，应该就能看到评论框了。
第一次进去需要设置**管理员密码**（Twikoo 会引导你），设完之后记得在后台把评论审核打开。

## 常见问题

**Q：评论区一直是空白/转圈？**
A：八成是 `envId` 填错了，或者后端没启动。浏览器 F12 → Console 看有没有报错。

**Q：不想折腾了，能不能先关掉评论区？**
A：可以。把 `_config.butterfly.yml` 里 `comments:` 下的 `use: Twikoo` 改成 `use:`（留空），
评论区就彻底不显示了，其他功能不受影响。
