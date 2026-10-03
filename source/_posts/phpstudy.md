---
title: php类型的题
date: 2026-09-28 19:01:31
categories:
  - CTF
tags:
  - CTF
  - PHP
description: 关于一些PHP题的wp
cover: /img/cover-tech.svg
comments: true
---

## 第一题

```php
<?php
show_source(__FILE__);
include("flag.php");
$a=@$_GET['a'];
$b=@$_GET['b'];
if($a and $a==0){
    if(is_numeric($b)){
        exit("nono");
    }else{
        if($b>2026){
            echo $flag;
        }
    }
}else{
    exit("no");
}

?>  no
```

首先给定俩个参数a和b，通过if语句判断其需要绕过俩个条件，`$a and $a==0`和b是否为数字和数字字符是的话就结束了，不是的话就进入下一个循环，判断b>2026,因为b为非字符型，所以取b为2027a后面随便带啥都行，取a=a，因为字符“a”=0为真，最后直接输入hackbar就有了flag   

![image-20260503195814097](/img/posts/phpstudy/01.webp)

## 第二题

```php
<?php
highlight_file(__FILE__);
$flag = fopen('/admin_secret.txt', 'r');
if (isset($_GET['filename']) && strlen($_GET['filename']) < 17) {
  readfile($_GET['filename']);
} else {
  echo "The filename parameter does not exist or the filename is too long";
}

?>

The filename parameter does not exist or the filename is too long
```

`fopen` 在第 3 行已经打开了 `/admin_secret.txt`，文件描述符被分配在 `/proc/self/fd/` 下。计算长度：

| 路径                | 长度      |
| ------------------- | --------- |
| `/admin_secret.txt` | 18 ❌ 超长 |
| `/proc/self/fd/5`   | 15 ✅ 符合 |

### 4. 爆破 fd 编号

不知道具体分配了几个 fd，从 3 开始逐个尝试（0=stdin, 1=stdout, 2=stderr）：



```
fd=3: No such file
fd=4: No such file
fd=5: ✅ flag{02dc5ffe-b766-4cd5-b80d-68b9d505f407}
```

## 第三题

```php
<?php
show_source(__FILE__);
include("flag.php");
if (!isset($_GET['qc']) || $_GET['qc'] === '') exit("no");
$qc = (array)json_decode($_GET['qc'], true);
$key = array_search("QCCTF", $qc);
if($key === 1){
    echo $flag;
}else{
    exit("no");
}

?>  no
```

JSON 数组索引从 0 开始，`json_decode` 后得到 `[0 => null, 1 => "QCCTF"]`。

`array_search` 遍历过程：

- 索引 0：`null == "QCCTF"` → PHP 将 null 转为 `""`，不匹配，跳过
- 索引 1：`"QCCTF" == "QCCTF"` → 匹配，返回整数 `1`
- `1 === 1` → **true**
- 要使得QCCTF的键值为1，及其下标为1，所以我在数组第0位插入null，下一位即为QCCTF。

在hackbar中输入该值即可求得flag

```
/?qc=[null,"QCCTF"]
```

## 第四题

![image-20260506213205451](/img/posts/phpstudy/02.webp)

解题过程：

首先看代码，发现if语句和foreach，仔细看过代码后发现有三层绕过，首先阐述一个概念（在PHP弱类型比较的时候，整数0与无法解析为数字的字符串比较时，结果往往都是ture，比如  0 == "QCCTF"的结果就为true）

第一层是该层是在qc组成的数组中找到QCCTF，如果找不到则失败·。会输出no!

```php
if (array_search("QCCTF", $qc) === false) die("no...");
```

第二层是在qc的子数组中找到QCyyds的字符串，如果没有也会失败

```php
if (array_search("QCyyds", $qc["n"]) === false) die("no...");
```

第三层是一个循环检查：它要求在qc的子数组里面的每一个值**不能全等于**Qcyyds，否则就会停止

```php
foreach ($qc["n"] as $val) {
    if ($val === "QCyyds") die("no......");
```

![](/img/posts/phpstudy/03.webp)

但是发现第二层与第三层发生的矛盾，所以将QCyyds该字符串化0，所以最终构造一个payload  （ ？qc={“n”：[0],"m"="QCCTF"}满足三层条件，输入最后得到flag。

有些可以途径穿越一把嗦的方法

```
/???/???/?l /fla? /fla?.??? /fla????? fla? fla?.??? fla????? /???/fla? /????/fla? /???/???/fla? /???? /????? /?????? /??????? /????????
所有题目均由青岑提供，若有侵权，请及时联系作者
```

