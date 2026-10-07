---
title: 01 数组与哈希表
date: 2026-10-05 20:21:46
categories:
  - 算法
tags:
  - 哈希查找
description: python的哈希查找
cover: /img/cover-tech.svg
comments: true
---

> 一句话定位：这一讲解决「在一个数组里找东西 / 数东西 / 判断东西出现过没有」这一类题，
> 面试考它是因为它同时考察「你会不会选数据结构」和「你会不会做边界判断」。
> 一句话心法：**凡是双重循环里在做「查找」的，都可以用哈希表把它降成一层循环。**
>
> 下面 4 个模板是「零件」。例题就是这些零件按顺序拼起来，所以先背零件。

### 模板 T1：哈希查找（一次遍历）—— 本讲最重要的骨架

```python
def find_pair(nums, target):
    """在数组里找和为 target 的两个下标，找不到返回 []。"""
    if not nums:                      # 边界永远第一行：空数组直接返回
        return []
    seen = {}                         # key = 值，value = 它第一次出现的下标
    for i, v in enumerate(nums):      # enumerate 一次给出下标和值
        need = target - v             # 「还差多少」
        if need in seen:              # O(1) 判断 key 在不在字典里
            return [seen[need], i]
        seen[v] = i                   # 先查后存，避免同一个下标被用两次
    return []
```

### 模板 T2：集合判重

```python
def has_duplicate(nums):
    """只要有一个值出现两次就返回 True。"""
    if not nums:                      # 边界：空数组没有重复
        return False
    seen = set()                      # set 只存 key，自动去重
    for v in nums:
        if v in seen:                 # 撞上了就立刻返回，不用扫完
            return True
        seen.add(v)                   # 用 add，不是 append（set 没有 append）
    return False
```

### 模板 T3：计数字典（`dict.get` 的正确用法）

```python
def count_values(nums):
    """返回「值 -> 出现次数」的字典。"""
    count = {}
    for v in nums:
        count[v] = count.get(v, 0) + 1    # get(v, 0)：没有这个 key 时拿 0，避免 KeyError
    return count
```

- 时间 O(n)，空间 O(不同值的个数)。
- **默写要点**：`count[v] = count.get(v, 0) + 1` 必须背成肌肉记忆，别写成 `count[v] += 1`（会 KeyError）。

### 模板 T4：值域 1..n 时的下标标记（O(1) 空间）

```python
def mark_by_index(nums):
    """值域 1..n：数字 v 出现过，就把下标 v-1 位置取负当记号。"""
    if not nums:
        return []
    n = len(nums)
    arr = nums[:]                     # 切片复制，别污染调用方的数组
    for v in arr:
        idx = abs(v) - 1              # 该位置可能已被取负，所以取绝对值
        if arr[idx] > 0:              # 只在正数时取负，否则负负得正就白标了
            arr[idx] = -arr[idx]
    missing = []
    for i in range(n):
        if arr[i] > 0:                # 没被标过 → 数字 i+1 从未出现
            missing.append(i + 1)
    return missing
```

- 时间 O(n)，空间 O(1)（不算返回结果和那份复制件）。
- **默写要点**：`abs(v) - 1` 和 `arr[idx] > 0` 这两个保护条件，漏一个就错。

### 顺手补 6 个 Python 语法（基础薄弱就先看这张表）

| 语法 | 例子 | 一句话解释 |
|---|---|---|
| `dict.get` | `count.get(ch, 0)` | key 不存在时返回第二个参数，而不是报 KeyError |
| `set` | `seen = set()` / `seen.add(v)` / `v in seen` | 只存不重复元素，`add` 添加，`in` 判断 |
| `enumerate` | `for i, v in enumerate(nums):` | 同时拿到下标 `i` 和值 `v`，省掉手写的计数器 |
| 元组解包 | `left, right = 0, len(s) - 1` | 一行给多个变量赋值，面试写指针全靠它 |
| 负下标 | `nums[-1]` | 最后一个元素；`triangle[-1]` 就是最后一行 |
| 切片 | `nums[:]` 复制整个列表；`strs[1:]` 从第 2 个开始 | 左闭右开，`[:]` 是最稳的浅拷贝写法 |

## 3. 例题精讲（3 题）

### 例题 1：两数之和（LC 1，Easy）

**题面**：给定一个整数数组 `nums` 和一个整数目标值 `target`，请你在该数组中找出**和为 `target` 的那两个整数**，并返回它们的数组下标。你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。答案可以按任意顺序返回。

- 示例 1：`nums = [2,7,11,15]`, `target = 9` → `[0,1]`（`nums[0] + nums[1] == 9`）
- 示例 2：`nums = [3,2,4]`, `target = 6` → `[1,2]`
- 示例 3：`nums = [3,3]`, `target = 6` → `[0,1]`
- 约束：`2 <= nums.length <= 10^4`；`-10^9 <= nums[i], target <= 10^9`；只会存在一个有效答案


```python
def two_sum(nums, target):
    """LC 1 两数之和：返回和为 target 的两个下标（题目保证恰好一组解）。

    思路：一边往后走，一边把「见过的值 -> 它的下标」存进字典。
    走到 v 时只要问一句 target - v 见过没有，就把双重循环 O(n^2) 降成 O(n)。
    """
    if not nums:                     # 空数组凑不出两个数，直接返回
        return []
    seen = {}                        # key 是数值，value 是它第一次出现的下标
    for i, v in enumerate(nums):     # enumerate 同时给出下标 i 和值 v，省掉手写计数器
        need = target - v            # 还差多少才能凑成 target
        if need in seen:             # 判断 key 在不在字典里，是 O(1) —— 全题的核心
            return [seen[need], i]   # 题目不要求下标有序，返回顺序按「先来后到」即可
        seen[v] = i                  # 先查后存：保证同一个下标不会被用两次
    return []                        # 题目保证有解，这里只是兜底
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `def two_sum(nums, target):` | 函数签名 | 参数名直接用题目给的 `nums`/`target`，面试官一眼看懂 |
| 2–6 | 三引号 docstring | 写清楚返回什么 | 纸上写代码也建议留一行注释说明返回值，方便面试官跟上你 |
| 7–8 | `if not nums:` / `return []` | 空数组保护 | `not []` 为 True；**任何用到 `nums[0]` 的写法都必须先有这行** |
| 9 | `seen = {}` | 建立「值 → 下标」的字典 | 注意不是 `set()`，因为要额外记住下标 |
| 10 | `for i, v in enumerate(nums):` | 同时遍历下标和值 | 等价于 `for i in range(len(nums)): v = nums[i]`，但少一行、不易写错 |
| 11 | `need = target - v` | 算出「还差多少」 | 把问题从「找两数」变成「查一个数在不在」，这是关键转化 |
| 12 | `if need in seen:` | O(1) 查找 | `in` 用在字典上是判断 **key**，不是 value |
| 13 | `return [seen[need], i]` | 返回两个下标 | 顺序是先来的在前；题目说顺序随意 |
| 14 | `seen[v] = i` | 记录当前值的下标 | **必须在 if 之后**：否则 `[3,3], target=6` 时同一个下标会被用两次 |
| 15 | `return []` | 兜底 | 题目保证有解，但函数不能什么都不返回（否则返回 `None`，调用方会崩） |

**走查**

| 用例 | 步骤 | i | v | need | 字典状态（查完/存完） | 结果 |
|---|---|---|---|---|---|---|
| 普通：`[2,7,11,15]`, 9 | 第 1 轮 | 0 | 2 | 7 | 7 不在 → `{2:0}` | 继续 |
| | 第 2 轮 | 1 | 7 | 2 | 2 在下标 0 → 命中 | `[0,1]` ✅ |
| 边界：`[3,3]`, 6 | 第 1 轮 | 0 | 3 | 3 | 3 不在 → `{3:0}` | 继续 |
| | 第 2 轮 | 1 | 3 | 3 | 3 在下标 0 → 命中 | `[0,1]` ✅ |
| 极端：`[1,2,3]`, 100 | 3 轮 | 0/1/2 | 1/2/3 | 99/98/97 | 全都不在 → `{1:0, 2:1, 3:2}` | 循环结束 `[]` ✅ |

**复杂度**：时间 O(n) —— 循环执行 n 次，每次只做常数次字典操作（`in` 和赋值平均 O(1)），
所以总次数和 n 成正比。空间 O(n) —— 最坏情况（无解）字典里存了全部 n 个数。

### 例题 2：存在重复元素（LC 217，Easy）

**题面**：给你一个整数数组 `nums`。如果任一值在数组中出现**至少两次**，返回 `true`；如果数组中每个元素互不相同，返回 `false`。

- 示例 1：`nums = [1,2,3,1]` → `true`
- 示例 2：`nums = [1,2,3,4]` → `false`
- 示例 3：`nums = [1,1,1,3,3,4,3,2,4,2]` → `true`
- 约束：`1 <= nums.length <= 10^5`；`-10^9 <= nums[i] <= 10^9`

```python
def contains_duplicate(nums):
    """LC 217 存在重复元素：只要有任意一个值出现两次就返回 True。"""
    if not nums:                     # 空数组没有任何元素，谈不上重复
        return False
    seen = set()                     # 集合只存 key、自动去重，查找也是 O(1)
    for v in nums:
        if v in seen:                # 见过就立刻返回，不用把数组扫完
            return True
        seen.add(v)                  # 没见过的值记下来
    return False                     # 全部走完都没撞上，说明各不相同
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `def contains_duplicate(nums):` | 函数签名 | 布尔函数用 `is_`/`has_`/`contains_` 命名，读起来就是一句话 |
| 3–4 | `if not nums:` / `return False` | 空数组保护 | 空数组没有重复，返回 `False` 是唯一合理答案 |
| 5 | `seen = set()` | 建集合 | 只判存在性就用 `set`；用 `{}` 会建出一个空**字典**，这是最常见的笔误 |
| 6 | `for v in nums:` | 顺序遍历 | 不需要下标，所以不用 `enumerate` |
| 7–8 | `if v in seen: return True` | 命中即返回 | 提前退出让平均情况快很多 |
| 9 | `seen.add(v)` | 记下这个值 | `set` 用 `add`；写 `append` 会 `AttributeError` |
| 10 | `return False` | 扫完没命中 | 循环结束后才执行，位置不能放到循环里（否则第一轮就返回了） |

**走查**：

| 用例 | 步骤 | v | 集合（查完/加完） | 结果 |
|---|---|---|---|---|
| 普通：`[1,2,3,1]` | 第 1 轮 | 1 | 1 不在 → `{1}` | 继续 |
| | 第 2/3 轮 | 2 / 3 | 不在 → `{1,2,3}` | 继续 |
| | 第 4 轮 | 1 | 1 在集合里 → 命中 | `True` ✅ |
| 边界：`[]` | 直接 | — | 不建集合 | `False` ✅ |
| 极端：`[7,7,7,7]` | 第 1 轮 | 7 | 7 不在 → `{7}` | 继续 |
| | 第 2 轮 | 7 | 7 在 → 命中 | `True` ✅ |

### 例题 3：有效的字母异位词（LC 242，Easy）

**题面**：给定两个字符串 `s` 和 `t`，编写一个函数来判断 `t` 是否是 `s` 的字母异位词。
字母异位词指两个字符串包含的字母**种类和个数完全相同**，只是排列顺序不同。

- 示例 1：`s = "anagram"`, `t = "nagaram"` → `true`
- 示例 2：`s = "rat"`, `t = "car"` → `false`
- 约束：`1 <= s.length, t.length <= 5 * 10^4`；`s` 和 `t` 仅包含小写字母

```python
def is_anagram(s, t):
    """LC 242 有效的字母异位词：两个字符串的字母种类和个数完全一致。"""
    if len(s) != len(t):             # 长度不同一定不是，O(1) 先干掉一批用例
        return False
    if not s:                        # 走到这里说明两边都是空串，空串互为异位词
        return True
    count = {}                       # 统计 s 里每个字符的净剩余次数
    for ch in s:
        count[ch] = count.get(ch, 0) + 1   # get(ch, 0)：key 不存在时拿 0，避免 KeyError
    for ch in t:
        if count.get(ch, 0) == 0:    # t 出现了 s 没有的字符，或某字符已经用完了
            return False
        count[ch] -= 1               # 用掉一个，扣掉一次
    return True                      # 长度相等 + 每个字符都够用 = 互为异位词
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `def is_anagram(s, t):` | 函数签名 | 布尔函数用 `is_` 前缀 |
| 3–4 | `if len(s) != len(t): return False` | 长度预检 | O(1) 的代价拦掉一大类用例，面试官喜欢这种「先说便宜的条件」 |
| 5–6 | `if not s: return True` | 空串边界 | 能走到这里说明长度相等，两个都是空串；空串互为异位词 |
| 7 | `count = {}` | 计数字典 | 通用写法，不依赖「只有 26 个小写字母」这个条件 |
| 8–9 | `for ch in s:` / `count[ch] = count.get(ch, 0) + 1` | 统计 s 的字符数 | `get(ch, 0)` 是计数的标准句式，一定要背下来 |
| 10 | `for ch in t:` | 遍历 t 做扣减 | 只遍历一次 t，不多开一个字典，省内存也省代码 |
| 11–12 | `if count.get(ch, 0) == 0: return False` | t 多出了字符 | 又用了一次 `get(..., 0)`：`t` 里出现 `s` 没有的字符时，`get` 返回 0，正好判掉 |
| 13 | `count[ch] -= 1` | 成功匹配一个就消耗一个 | 到 0 说明这个字符刚好用完；长度相等保证最后不会有剩余 |
| 14 | `return True` | 通过全部检查 | 放在循环外面 |

**走查**：

| 用例 | 步骤 | 字符 | 字典变化 | 结果 |
|---|---|---|---|---|
| 普通：`"anagram"` / `"nagaram"` | 统计 s | a×3,n,g,r,m | `{a:3, n:1, g:1, r:1, m:1}` | 进入第二轮 |
| | 扣减 t | n,a,g,a,r,a,m | 逐次 `n:0, a:2, g:0, a:1, r:0, a:0, m:0` | 全程非 0 → `True` ✅ |
| 边界：`""` / `""` | 第 3 行 | — | 长度相等（0 = 0） | 两个都是空串 → `True` ✅ |
| 边界：`"rat"` / `"car"` | 第 3 行 | — | 长度相等（3 = 3） | 继续 |
| | 扣减 t | 第一个字符 c | `count.get("c", 0) == 0` | `False` ✅ |
| 极端：`"aacc"` / `"ccac"` | 统计 s | a×2, c×2 | `{a:2, c:2}` | 继续 |
| | 扣减 t | c,c,a,c | `c:1 → c:0 → a:1 → c 为 0` | 第 4 次 `False` ✅ |

**变式 1 · LC 169 多数元素（Easy）**

- 题面摘要：找出数组中出现次数**严格大于** `n/2` 的元素（题目保证一定存在）。
- 关键提示：这就是模板 T3 的直接应用，先想「遍历到某个数时，我已经知道什么」——
  既然有元素的次数超过一半，那计数是不是到某个时刻就可以不用再扫了？想清楚「提前返回」的位置。
  另外，如果面试官要求 O(1) 空间，去查一下「投票法」的思想（两两抵消），作为加分项说给面试官听。
- 对应函数：`majority_element(nums)`（参考实现见 code 文件）
- 自查：`[3,2,3]` → `3`；`[2,2,1,1,1,2,2]` → `2`；`[1]` → `1`。

**变式 2 · LC 448 找到所有数组中消失的数字（Easy）**

- 题面摘要：长度为 n 的数组，元素都在 1 到 n 之间，有些数出现两次、有些一次，
  返回 1 到 n 里**没出现过**的所有数字（升序）。
- 关键提示：先想最直白的做法——值域正好是 1 到 n，那我把「出现过的数」记下来，
  再从头到尾问一遍「1、2、3…n 谁没被记过」。记在哪最方便？（模板 T2 的集合）
  追问空间时再想：值 v 和下标 v-1 一一对应，能不能就用数组自己的正负号当记号？（模板 T4）
  注意用 **`abs()`** 和 **先判正负再取负**，否则会负负得正。
- 对应函数：`find_disappeared_numbers(nums)`；加分版 `find_disappeared_numbers_inplace(nums)`
- 自查：`[4,3,2,7,8,2,3,1]` → `[5,6]`；`[1,1]` → `[2]`；`[2,2]` → `[1]`。

**变式 3 · LC 136 只出现一次的数字（Easy）**

- 题面摘要：除某个元素只出现一次外，其余元素都出现两次，找出那个只出现一次的元素。
- 关键提示：先用模板 T3 把次数数出来（这是主答案，稳）。
  如果面试官追问 O(1) 空间，回忆一下「成对」这个字眼：有没有一种运算，
  两个相同的数碰上会互相消掉，而遇到 0 又不改变结果？（提示：`a ^ a = 0`，`a ^ 0 = a`）
  用哪个结构无所谓，但**先把能写对的版本写出来**，再口头补充优化。
- 对应函数：`single_number(nums)`；加分版 `single_number_xor(nums)`
- 自查：`[2,2,1]` → `1`；`[4,1,2,1,2]` → `4`；`[7]` → `7`。

```python
变式1
def majority_element(nums):
   if not nums:
       return -1
   n = len(nums)
   count = {}
    for v in nums:
        count[v]  = count.get(v,0) + 1
        if count[v] > n//2:
             return v
    return nums[0]

 nums = [3,2,3]
printf(..........)
```

```python
变式2
def find_disappeared_numbers(nums):
     if not nums:
         return []
    n = len(nums)
      present = set(nums)
      misssing = []
      for i in range(1,n + 1):
        if i not in present:
             misssing.append(i)
     return misssing

 if __name__ == '__main__':
     print(find_disappeared_numbers([1,2,3,4,5,6,7,8,9,0]))
```

```python
变式3
def single_number(nums):
    if not nums:
        return 0
    count = {}
    for v in nums:
        count[v] = count.get(v, 0) + 1
        for v in nums:
            if count [v] == 1:
                return v
    return 0

if __name__ == '__main__':
    nums = [4, 1, 2, 1, 2]
    print(single_number(nums))
```

