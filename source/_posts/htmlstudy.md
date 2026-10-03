---
title: HTML的简单学习
date: 2026-06-05 22:09:23
categories:
  - HTML
tags:
  - HTML
description: 关于html的一些知识补充
cover: /img/cover-tech.svg
comments: true
---

html语言就相当于一个网页页面的骨架

```html
<html>  整个网页
<head>  网页信息
<title> 浏览器标题
<body>  页面中能看到的内容
```

首先记住这四个元素，下面则是一个简单的网页页面，如果渲染该页面则会出现下面的样子。

```html
<!DOCTYPE html>
<html>
<head>
    <title>我的第一个网页</title>
</head>
<body>
    <h1>你好，HTML</h1>
    <p>这是我的第一个网页。</p>
</body>
</html>
```

![image-20260605205735433](/img/posts/htmlstudy/01.webp)

## **常见的html标签**

### 1.标题标签

```html
<h1>一级标题</h1>
<h2>二级标题</h2>
<h3>三级标题</h3>
```

h1 标题的字体最大， h6的标题字体最小哦。

### 2.段落标签

```html
<p>关注塔菲喵。</p>
```

网页中的普通文字一般用 p 标签。

### 3.换行标签

```html
第一行 <br> 第二行
```

br  用来表示换行。

### 4.链接标签

```html
<a> herf="http://www.yuanshen.com" > 打开原神 <a>
```

a  是超链接标签

 herf="http://www.yuanshen.com"    这是其超链接的属性，表示点击后会跳至哪里。

### 5.图片标签

```html
<img src="test.jpg" alt="这是一张图片">
```

sec  表示图片的路径。

alt  表示图片加载失败后显示的文字。

### 6.列表标签

（1）无序列表，即是没有标注其顺序

```html
<ul>
<li>原神</li>
<li>王者</li>
<li>塔菲</li>
</ul>
```

（2）有序列表，有数字显示为其标序

```html
<ol>
    <li>原神</li>
    <li>王者</li>
    <li>塔菲</li>
</ol>
```

### 7.块标签 div

```html
<div>
    <h2>用户信息</h2>
    <p>用户名：admin</p>
</div>
```

div  常用来保住一块内容。

### 8.行内标签 span

```html
<p>我的名字是 <span>张三</span></p>
```

`span` 常用来包住一小段文字。

## HTML的基本属性

```html
<a href="https://example.com">点击跳转</a>
```

这里面的 herf 为一个属性，作用链接地址。

```html
<input type="text" name="username" placeholder="请输入用户名">
```

这里面就有是哪个属性 type  name   placeholder。

下面是一些常见的属性

| 属性          | 作用         |
| ------------- | ------------ |
| `href`        | 链接地址     |
| `src`         | 图片路径     |
| `alt`         | 图片说明     |
| `type`        | 输入框类型   |
| `name`        | 表单字段名   |
| `value`       | 默认值       |
| `placeholder` | 输入提示     |
| `id`          | 元素唯一标识 |
| `class`       | 元素分类     |

## 表单from

下面这个即为一个简单的登录框

<form>
    <input type="text" placeholder="请输入用户名">
    <input type="password" placeholder="请输入密码">
    <button>登录</button>
</form>

```html
<form>
    <input type="text" placeholder="请输入用户名">
    <input type="password" placeholder="请输入密码">
    <button>登录</button>
</form>
```

### 1.input 输入框

普通文本框：

```html
<input type="text">
```

密码框：

```html
<input type="password">
```

提交按钮：

```html
<input type="submit" value="提交">
```

## 2.textarea 多行文本框

```html
<textarea placeholder="请输入留言"></textarea>
```

评论区留言板通常用的就是这个。xss的攻击者一般在此注入脚本。

## 3.select 下拉框

```html
<select>
    <option>男</option>
    <option>女</option>
</select>
```

选择的时候通常使用这个。

## 4. button 按钮

```html
<button>点击我</button>
```

最后自己练习一手

```html
<!DOCTYPE html>
<html>
<head>
    <title>玩原神的第一天</title>
</head>
<body>
    <h2>欢迎来到原神的世界</h2>
    <p>你好，旅行者，欢迎来到提瓦特大陆，我是你的想到</p>
<h3>这是你的任务目标</h3>
<ul>
    <li>请你获得足够多的原石</li>
    <li>请你探索整个提瓦特大陆</li>
</ul>
<h2>这是我的联系方式 </h2>
<a href ="https://www.yuanshen.com"> 开始玩原神 </a>
<h2>          登录地址      </h2>
<from>
    <p>UID ：</p>
    <input type="text" name="username" placeholder="请输入UID" >

    <p>密码：</p>
    <input type="passsword" name="passsword" placeholder="请输入密码">

    <br><br>
    <button type="submit">登录</button>
    </from>
    <br><br>
    <textarea placeholder="请输入你最喜欢的角色"></textarea>
    <br><br>
    <button>提交</button>
    </body>
    </html>
```


   ![](/img/posts/htmlstudy/02.webp)