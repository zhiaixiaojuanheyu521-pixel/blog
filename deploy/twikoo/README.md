# 留言板后端：Twikoo on Cloudflare Workers + D1

## 现状（已完成部署）

| 项 | 值 |
| --- | --- |
| 后端地址 | `https://twikoo.yuu-blog.top` |
| 平台 | Cloudflare Workers |
| 数据库 | Cloudflare D1（亚太区），4 张表 |
| D1 数据库 ID | `6b096cce-49eb-40be-bbb1-1dae365ba2c2` |
| Worker 名称 | `twikoo` |
| 构建目录 | `/tmp/twikoo-build/packages/server-cloudflare` ⚠️ **临时目录，重启会丢** |

博客侧配置在 `_config.butterfly.yml`：

```yaml
comments:
  use: Twikoo
twikoo:
  envId: https://twikoo.yuu-blog.top
```

---

## 为什么不用其他方案

| 方案 | 为什么放弃 |
| --- | --- |
| **Giscus** | `giscus.app` 在国内无法访问，**访客也加载不出评论** |
| **Vercel** | 官方文档标注「中国大陆访问速度较慢甚至无法访问」 |
| **腾讯云 CloudBase** | 官方明确：**免费体验版无法配置跨域**，需付费套餐 |
| **Netlify + MongoDB** | MongoDB Atlas 新版界面只提供 M30/M10/Flex 付费档，找不到免费 M0 |
| **自建服务器** | 没有服务器 |

**Cloudflare Workers 的优势**：已有 Cloudflare 账号、D1 免费、不用注册新服务、数据在亚太区。
**代价**：部署要命令行（已由我代劳）。

---

## ⚠️ 两个关键坑

### 1. `workers.dev` 在国内被 DNS 污染

官方文档原话：

> `*.workers.dev` 在国内存在 DNS 污染，直接访问会超时。国内使用时建议绑定自定义域名

所以 `wrangler.toml` 里必须绑自定义域名：

```toml
routes = [
  { pattern = "twikoo.yuu-blog.top", custom_domain = true }
]
```

绑上之后 `workers.dev` 会自动禁用（这是好事）。

### 2. Node 26 跑不起来，但 Node 24 能构建

官方要求 `Node.js >= 26`，但本机 Node 26 缺 `libatomic.so.1` 无法启动。
**实测 Node 24 完全能构建成功**，`engines: >=26` 只是建议。

---

## 完整部署流程（事后复盘）

```bash
# 1. 克隆（稀疏检出只能拉部分包，要展开成完整 packages/）
git clone --depth 1 --filter=blob:none --sparse https://github.com/twikoojs/twikoo.git
cd twikoo && git sparse-checkout set packages

# 2. 装依赖 + 构建（Node 24 即可）
pnpm install --filter '@twikoojs/cloudflare...' --ignore-scripts
pnpm -r --filter '@twikoojs/cloudflare...' build

# 3. 登录（会输出一个很长的授权链接，在 Windows 浏览器打开）
cd packages/server-cloudflare
wrangler login

# 4. 建 D1 数据库，记下输出的 database_id
wrangler d1 create twikoo

# 5. 写 wrangler.toml（内容见上）

# 6. 建表
wrangler d1 execute twikoo --remote --file=./schema.sql

# 7. 部署
wrangler deploy
```

**踩过的坑**：
- 稀疏检出只拉了 2 个包，构建时报 `Cannot find package '@twikoojs/tsdown-config'` → 要 `git sparse-checkout set packages`
- `npm install wrangler` 在 pnpm workspace 里会报 `EUNSUPPORTEDPROTOCOL: workspace:*` → 改用全局安装
- `wrangler login` 的授权页可能出现 `access_denied`，但日志里其实是 `Successfully logged in`，**以 `wrangler whoami` 为准**

---

## 日常操作

```bash
cd /tmp/twikoo-build/packages/server-cloudflare
export PATH="$HOME/.local/node/bin:$HOME/.local/npm-global/bin:$PATH"

# 看评论数据
wrangler d1 execute twikoo --remote --command "SELECT * FROM Comment ORDER BY created DESC LIMIT 10"

# 重新部署
wrangler deploy

# 看实时日志
wrangler tail
```

---

## 找回管理员密码

在留言板页面评论区，按 `F12` 打开控制台执行：

```js
twikoo.getCommentsCount  // 确认 twikoo 已加载
```

或者清掉浏览器 localStorage 里的 `twikoo-*` 键，重新进入会再让你设置。

> 管理员密码存在 D1 的 `Config` 表里，忘了可以重置。
