---
title: Hexo 博客搭建踩坑记录
date: 2026-10-02 13:29:00
tags:
  - Hexo
  - 建站
categories:
  - 技术
description: 记录用 Hexo + Butterfly 主题搭建博客的完整过程，以及过程中遇到的一些小坑。
cover: /img/cover-tech.svg
---

把搭建过程完整记一遍，方便以后换机器重来。

## 一、安装 Node.js

Hexo 基于 Node.js，所以第一步是装 Node（建议 18 以上）：

```bash
# 查看版本
node -v
npm -v
```

## 二、安装 Hexo 并初始化

```bash
npm install -g hexo-cli
hexo init my-blog
cd my-blog
npm install
```

## 三、装主题

Butterfly 主题可以直接从 npm 装，比 git clone 稳：

```bash
npm install hexo-theme-butterfly \
  hexo-renderer-pug hexo-renderer-stylus --save
```

然后把 `_config.yml` 里的 `theme` 改成 `butterfly`。

## 四、常用命令

| 命令 | 作用 |
| --- | --- |
| `hexo new "标题"` | 新建文章 |
| `hexo generate` | 生成静态页面 |
| `hexo server` | 本地预览（默认 4000 端口） |
| `hexo clean` | 清掉缓存和 public |
| `hexo deploy` | 部署 |

## 五、踩过的坑

**坑 1：端口被占用**

```bash
hexo server -p 5001
```

**坑 2：改了配置没生效**

八成是缓存，来一套三连：

```bash
hexo clean && hexo generate && hexo server
```

**坑 3：`hexo generate` 报错找不到模块**

```bash
rm -rf node_modules package-lock.json
npm install
```

## 小结

整体流程其实不复杂：**装环境 → 初始化 → 换主题 → 写文章 → 生成静态页 → 部署**。
真正花时间的是域名、解析和部署那一段，这个留到下一篇写。
