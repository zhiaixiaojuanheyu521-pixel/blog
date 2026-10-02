# Cloudflare Pages 部署

## 构建配置（在 Cloudflare 后台填）

| 配置项 | 值 |
| --- | --- |
| Framework preset | `Hexo` |
| Build command | `npm run build` |
| Build output directory | `public` |
| Node 版本 | 读 `.nvmrc`（已固定为 22） |

`npm run build` = `hexo generate && node tools/copy-cf.js`

第二个脚本是干嘛的见下面「踩的坑」。

---

## 踩过的坑：`_headers` 复制不进去

Cloudflare Pages 靠构建产物根目录的 `_headers` 文件配置缓存和安全响应头。

但 **Hexo 会忽略 `source/` 里以下划线开头的文件**，所以不能直接放 `source/_headers`。

我先试了用 Hexo 的 `after_generate` 钩子复制，结果报 ENOENT：

```
Error: ENOENT: no such file or directory,
  copyfile '/home/qiayu/blog/_headers' -> '/home/qiayu/blog/public/_headers'
```

加日志一查：

```
[debug] public_dir 存在? false
```

**`after_generate` 触发时 `public/` 还没创建**，钩子里复制必然失败。

所以改成放在 `hexo generate` **之后**的独立脚本里执行：

```json
"build": "hexo generate && node tools/copy-cf.js"
```

独立脚本放在 `tools/` 而**不是** `scripts/` —— `scripts/` 会被 Hexo 自动加载，
放那儿会在加载时就执行一遍。

---

## ⚠️ 橙色小云朵：和教程里的情况**相反**

参考教程（Vercel）里写：

> 添加 CNAME 记录时，最右边那个代理状态（Proxy status）的橙色小云朵，需要点灰它，
> 不然 CF 的证书和 Vercel 的证书可能会发生冲突

**这条对 Cloudflare Pages 不适用，要反着来。**

| | Vercel | Cloudflare Pages |
| --- | --- | --- |
| 橙色云朵 | **关掉**（Vercel 要自己签证书） | **保持开启**（Pages 靠它提供 CDN 和证书） |

Cloudflare Pages 绑定自定义域名时会**自动创建**那条记录并开启代理，不用手动加，也别去关。

---

## 完整步骤

### 1. 推代码到 GitHub

```bash
cd ~/blog
git push -u origin main
```

### 2. Cloudflare 添加站点

```
dash.cloudflare.com → 添加站点 → 输入 yuu-blog.top
→ 套餐选 Free → 继续
→ Cloudflare 给两个 NS，例如 xxx.ns.cloudflare.com
```

### 3. 回阿里云改 NS

```
阿里云控制台 → 域名 → 找到 yuu-blog.top → 管理
→ DNS 修改 → 修改 DNS 服务器
→ 删掉 dns13/dns14.hichina.com，填 Cloudflare 给的两个
```

生效通常几分钟到 24 小时。

> 改完阿里云的云解析就失效了，以后所有解析都在 Cloudflare 控制台改。
> 你现在还没有任何解析记录，所以不会丢东西。

### 4. 创建 Pages 项目

```
Cloudflare 控制台 → Workers 和 Pages → 创建 → Pages
→ 连接到 Git → 选你的仓库
→ 填上面的构建配置 → 保存并部署
```

等 1~2 分钟，得到 `xxx.pages.dev`，**先确认这个能打开**。

### 5. 绑定自定义域名

```
Pages 项目 → 自定义域 → 设置自定义域 → 输入 yuu-blog.top
```

Cloudflare 会自动配好 DNS 和 HTTPS 证书。

### 6. 检查

- `https://yuu-blog.top` 能打开
- 地址栏有小锁（HTTPS 生效，证书签发可能要等几分钟）
- 手机上也打开看看

---

## 备案

**不用备案。** Cloudflare Pages 是境外服务，只有服务器在中国大陆才需要 ICP 备案。


---

## 补充：修掉「软 404」

部署完成后实测发现一个 SEO 隐患：**访问不存在的路径，返回的是 HTTP 200 + 首页内容**。

```
/this-page-does-not-exist-12345/  →  HTTP 200, 21709 字节（和首页一样）
```

这是 Cloudflare Pages 的默认回退行为。搜索引擎会因此索引出无数个重复页面。

**修法**：在产物根目录放一个 `404.html`，Pages 就会用它响应未匹配的请求（并返回 404 状态码）。

Hexo + Butterfly 的做法：

1. `_config.butterfly.yml` 里启用：
   ```yaml
   error_404:
     enable: true
     subtitle: '这个页面走丢了'
     background: /img/error-page.png
   ```

2. 建 `source/404/index.md`：
   ```yaml
   ---
   title: 404
   type: '404'          # ⚠️ 引号必须加
   permalink: /404.html
   comments: false
   top_img: false
   ---
   ```

### ⚠️ 踩的坑：`type: '404'` 的引号不能省

写成 `type: 404`（不加引号）时，YAML 会把它解析成**整数 404**，
而主题模板 `page.pug` 里判断的是**字符串**：

```pug
case page.type
  when '404'
    include includes/page/404.pug
```

整数和字符串永远不相等 → 走了 `default` 分支 → 404 页面渲染成普通页面，
没有大号 404 数字、没有副标题，**而且不会报任何错**。

验证方法：看产物里 `public/404.html` 有没有 `error_title` 这个 class。

### 验证结果（修复前 / 修复后）

| | 修复前 | 修复后 |
| --- | --- | --- |
| 不存在的路径 | HTTP 200 + 首页 | HTTP 404 + 404 页 |
