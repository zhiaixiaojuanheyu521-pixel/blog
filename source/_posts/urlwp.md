---
title: URL协议
date: 2026-06-16 21:24:47
categories:
  - HTML
tags:
  - URL
description: 一些url的基础知识
cover: /img/cover-tech.svg
comments: true
---

## 1. `http://`

**HTTP** 是最常见的网页访问协议。

意思是：通过网络访问一个网页或接口，数据是明文传输的。

例子：

```
http://example.com/index.html
```

常见用途：

```
访问网页
调用接口
下载文件
```

特点：

```
不加密
容易被抓包看到内容
默认端口是 80
```

------

## 2. `https://`

**HTTPS** 可以理解成“加密版 HTTP”。

例子：

```
https://example.com
```

特点：

```
数据会加密传输
更安全
浏览器地址栏一般会显示锁标志
默认端口是 443
```

简单理解：

```
HTTP  = 明文网页访问
HTTPS = 加密网页访问
```

------

## 3. `file://`

`file` 协议用于访问 **本地文件**。

例子：

```
file:///C:/Windows/win.ini
file:///etc/passwd
```

在 Windows 上可能是：

```
file:///C:/Users/test/Desktop/a.txt
```

在 Linux 上可能是：

```
file:///etc/passwd
```

它不是访问网络，而是访问本机文件系统。

在安全漏洞里，比如 **XXE、SSRF、LFI**，`file://` 经常被用来尝试读取服务器本地文件。

例如 XXE 里可能会看到：

```
<!ENTITY xxe SYSTEM "file:///etc/passwd">
```

意思是尝试读取服务器上的 `/etc/passwd` 文件。

------

## 4. `gopher://`

`gopher` 是一个很老的网络协议，现在正常网站基本不用了。

但是在 CTF、安全测试、SSRF 里经常出现，因为它可以比较底层地向某个端口发送数据。

例子：

```
gopher://127.0.0.1:6379
```

简单理解：

```
http/https：主要访问网页
file：读取本地文件
gopher：可以构造更底层的网络请求
```

在 SSRF 里，`gopher://` 有时被用来访问内网服务，比如 Redis、MySQL、FastCGI 等。但真实环境中这是高风险操作，学习时建议只在本地靶场或 CTF 环境里测试。

------

## 总结表

| 协议        | 含义         | 常见用途                | 默认端口           |
| ----------- | ------------ | ----------------------- | ------------------ |
| `http://`   | 普通网页协议 | 访问网页/API            | 80                 |
| `https://`  | 加密网页协议 | 安全访问网页/API        | 443                |
| `file://`   | 本地文件协议 | 读取本地文件            | 无                 |
| `gopher://` | 老式网络协议 | CTF/SSRF 中构造底层请求 | 70，实际可指定端口 |