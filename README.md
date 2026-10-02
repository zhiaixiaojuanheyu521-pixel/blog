# Yuu

个人博客，基于 **Hexo 8** + **Butterfly 5.7** 主题。

## 环境

Node.js 装在用户目录：`~/.local/node`，npm 全局包在 `~/.local/npm-global`（已写入 `~/.bashrc`）。
如果新开终端提示找不到 `hexo`，先执行：

```bash
source ~/.bashrc
```

## 日常写作流程

```bash
cd ~/blog

hexo new "文章标题"      # 新建文章，文件在 source/_posts/
# 用编辑器写 Markdown（VS Code 远程连进来，或 vim）
hexo server -p 4000      # 本地预览 http://localhost:4000
hexo clean && hexo generate   # 生成静态页面到 public/
```

改配置：

| 想改什么 | 改哪个文件 |
| --- | --- |
| 站点标题、作者、网址 | `_config.yml` |
| 主题外观、菜单、头像、封面 | `_config.butterfly.yml` |
| 文章内容 | `source/_posts/*.md` |
| 标签页/分类页/关于页 | `source/tags`、`source/categories`、`source/about` |
| 友链列表 | `source/_data/link.yml` |
| 留言板/评论后端 | `_config.butterfly.yml` 的 `twikoo.envId`（见 `deploy/twikoo/README.md`） |

## 页面结构

| 路径 | 说明 |
| --- | --- |
| `/` | 首页（文章列表） |
| `/archives/` | 归档 |
| `/tags/` `/categories/` | 标签 / 分类 |
| `/link/` | 友链，条目在 `source/_data/link.yml` 里加 |
| `/message/` | 留言板，评论用 Twikoo（后端待部署） |
| `/about/` | 关于我 |

## 入场画面

打开博客会全屏播放一段开场动画（详见 `docs/入场画面.md`）。
不想要了就把 `_config.butterfly.yml` 里 `inject` 下的三条内容清空。

## 外观

- 配色：**紫色系**，主色 `#A06BFF`。分两层，见 `docs/紫色主题与卡片布局.md`
- 首页：**大图卡片**（`index_layout: 4`，封面在上信息在下）
- 自定义样式：`source/css/yuu-purple.css`，删掉即恢复主题默认外观

> ⚠️ 改 `_config.butterfly.yml` 里的 `theme_color` 后必须 `hexo clean && hexo generate`，
> 因为颜色是编译期通过 Stylus 注入的。

## 部署

### 方式一：自己的服务器（VPS）

```bash
vi deploy.sh       # 改 SERVER 和 WEB_ROOT
./deploy.sh
```

服务器上首次需要装好 nginx，并配置：

```nginx
server {
    listen 80;
    server_name 你的域名;
    root /var/www/blog;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
```

### 方式二：GitHub Pages（免费）

1. 在 GitHub 新建仓库，把本目录推上去（分支用 `main`）
2. 仓库 Settings → Pages → Source 选 **GitHub Actions**
3. 之后每次 `git push` 会自动构建部署（工作流见 `.github/workflows/pages.yml`）
4. 绑定自己的域名：仓库 Settings → Pages → Custom domain 填域名，
   同时在你的 DNS 服务商加一条 CNAME 记录指向 `你的用户名.github.io`；
   并在 `source/` 下放一个 `CNAME` 文件，内容就是你的域名

### 方式三：Cloudflare Pages / Vercel（免费 + 自带 HTTPS + 国内可访问）

- 构建命令：`npx hexo generate`
- 输出目录：`public`
- 连上 Git 仓库即可，推送自动部署

## 备份

源码目录已经 `git init`，建议推到私有仓库：

```bash
git remote add origin git@github.com:你的用户名/blog-source.git
git push -u origin main
```

> 注意：`public/` 和 `node_modules/` 已被 `.gitignore` 忽略，只备份源码，这是对的。
