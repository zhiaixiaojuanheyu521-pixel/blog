---
title: 关于python的学习
date: 2026-10-20 19:58:40
categories:
  - 语言
tags:
  - python
description: 一起学习python喵！
cover: /img/cover-tech.svg
comments: true
---

######   首先对于 python  在我的了解，是一门高级，比较易懂，解释型的编程语言，它的核心特点大概有以下这么几种：

##### 1. 语法简单易懂

##### 2.解释型语言，基本上在每个系统内都可以运行

##### 3.动态的类型（即变量不需要声明其类型）

##### 4.标注库比较丰富，大多数任务不需要安装第三方库就能完成

###### 接下来先入门一下：（我这里的python是3.14.8，若有版本问题可以参考官方文档： **[https://docs.python.org](https://docs.python.org/)** ）

  python 的环境可以自己去网上找到教程

## （1）首先写一个简单的 python 的代码：

```python
print("Hello,Python!")

name = input("请输入你的姓名：")
age = int(input("请输入你的年龄："))
city = input("请输入你所在的城市：")

print(f"你好,{name}!你今天{age}岁，来自{city}。")
```



![image-20261019191902220](/img/posts/python/01.webp)

运行程序和，确认能正常输入和输出。

```python
name = input("请输入你的姓名：")  #这里可以看到运到了一个input()的函数其结果默认是字符串
age = int(input("请输入你的年龄：")) #这里input()外面加了一个int()的函数，在这里由于年龄是一个整数，然后input()的默认是字符串，所以年龄使用int()来进行转型，转化为一个整型，此外还有float()转化为整型
```

```python
print(f"你好,{name}!你今天{age}岁，来自{city}。")
```

在这段代码中注意到了{f"  *{  }*  "}有一个 f (这里是`f-string` 是 Python 中用来**把变量或表达式嵌入字符串**的一种写法，从 Python 3.6 开始支持。)也可以把 f 理解为一个格式化字符串。而{name}则是替换变量的值。

## **（2）** 接下来学习一些 python 常见的数据类型，以及其类型转化，算术运算和比较运算。

1.先认识四种基本的数据类型：

| 类型    | 含义               | 示例                 |
| ------- | ------------------ | -------------------- |
| `int`   | 整数               | `18`、`-5`、`100`    |
| `float` | 小数               | `3.14`、`0.5`        |
| `str`   | 字符串             | `"Python"`、`"你好"` |
| `bool`  | 布尔值，只有真或假 | `True`、`False`      |

```python
输入：
age = 18
height = 1.75
name = "小明"
is_student = True

print(type(age))
print(type(height))
print(type(name))
print(type(is_student))

输出：
<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>
```

如果不清楚数据的类型，在 python 里面有一个专用的函数 type() 可以查看一个数据的类型，如上面代码所示。

2.类型转换

常见的类型转化：

```python
number = int("18")       # 字符串转整数
price = float("9.9")     # 字符串转小数
text = str(123)          # 整数转字符串
```

`input()` 得到的永远是字符串。如果用户输入的是数字，并且你需要进行计算，就要用 `int()` 或 `float()` 转换。

3.算术运算符

```python
a = 10
b = 3

print(f"加法：{a + b}")   13
print(f"减法：{a - b}")    7
print(f"乘法：{a * b}")   30
print(f"除法：{a / b}")    3.33333333
print(f"整除：{a // b}")   3
print(f"取余：{a % b}")    1
print(f"乘方：{a ** b}")   8
重点观察下面的一些例子：
10 / 3    # 结果是 3.3333333333333335，除法结果一定是小数
10 // 3   # 结果是 3，只保留整数部分
10 % 3    # 结果是 1，表示 10 除以 3 的余数
2 ** 3    # 结果是 8，表示 2 的 3 次方
```

4.比较运算

比较运算的结果是 bool 类型：注意：判断两个值是否相等要用 `==`，一个等号 `=` 是赋值

```python
print(10 > 3)     # True
print(10 < 3)     # False
print(10 == 10)   # True
print(10 != 3)    # True
```

## （3）条件判断 if /elif /else

###  **1.首先写一个简单的 if** 

```python
age = int(input("请输入你的年龄："))

if age >= 18:
    print("你已经成年")
```

语法要求：

- `if` 条件后面必须有英文冒号 `:`
- 下一行必须缩进，通常用 4 个空格
- 条件成立时，才会执行缩进的代码

### **2.if / else**   

```python
age = int(input("请输入你的年龄："))

if age >= 18:
    print("你已经成年")
else:
    print("你还未成年")
```

### **3.if / elif / else**

```python
score = int(input("请输入成绩："))

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")
```

*`elif` 的判断是有顺序的。程序一旦遇到成立的条件，就会执行对应代码，并跳过后面的分支。*(相当于只执行这一个的对应的语句，后面的条件不再判断也不在执行，随后跳出整条判断链，继续执行判断以外的语句。)

### 4. 比较运算符

| 运算符 | 含义       |
| ------ | ---------- |
| `>`    | 大于       |
| `<`    | 小于       |
| `>=`   | 大于或等于 |
| `<=`   | 小于或等于 |
| `==`   | 是否相等   |
| `!=`   | 是否不相等 |

### 5. 逻辑运算符

```python
and   # 两个条件都成立，结果才为 True
or    # 至少一个条件成立，结果就为 True
not   # 取反
```

## **(4)** 循环结构 for 和 while。（主要的任务是让程序自动的重复执行代码）

### **1.for 循环** ：循环适合执行次数明确的重复任务！

先写一个简单的 for 循环：

```python
for i(参数可以任意定制，在有些算法中会将其写为 _ ) in range(5):#range的范围为左闭右开所以不会包含5
    print(i)
```

```python
输出：
0
1
2
3
4
```

***这里强调一下 range 的常见写法：

```python
range(5)          # 0, 1, 2, 3, 4
range(1, 6)       # 1, 2, 3, 4, 5
range(1, 10, 2)   # 1, 3, 5, 7, 9
range(5, 0, -1)   # 5, 4, 3, 2, 1
range(开始值, 结束值, 步长) #结束值不会被包含
```

### **2.使用循环累加**

```python
total = 0   #一定要将初值定为0，才能继续累加

for number in range(1, 6):
    total = total + number
    print(f"当前数字：{number}，累计和：{total}")

print(f"最终结果：{total}")
```

`otal = total + number` 可以简写为：

```python
total += number
```

### **3.遍历字符串** （将字符串所有的字符打印出来）

```python
输入：
for letter in "Python":
    print(letter)
输出：
P
y
t
h
o
n
```

### **4.break 和 continue** 

break ：立即结束整个循环。

```python
for number in range(1, 10):
    if number == 5:
        break
    print(number)
```

最后输出 1,2,3,4 后结束循环。

contiune： 跳过本轮的剩余代码，进行下一轮的循环。

```python
for number in range(1, 6):
    if number == 3:
        continue
    print(number)
```

最后输出 1,2 4,5. 除了 3 以外全部输出。

### 5.while 循环。

`while` 循环适合**不确定循环次数，只知道停止条件**的场景。

写一个简单的循环：

```python
count = 1

while count <= 5:
    print(f"第 {count} 次执行")
    count += 1

print("循环结束")
```

执行过程：

1. 判断 `count <= 5` 是否成立
2. 成立就执行缩进代码
3. 执行 `count += 1`
4. 重新判断条件
5. 条件不成立时退出循环