---
title: 03 二分
date: 2026-10-07 20:26:30
categories:
  - 算法
tags:
  - 二分查找
description: 一些二分查找
cover: /img/cover-erfen.webp
comments: true
---

> 一句话定位：二分不是「在有序数组里找数」这一个技巧，而是一套「每次砍掉一半搜索范围」的思想。它有两副面孔：① 在**有序数组**里找下标（查找型），② 在**答案的取值范围**里找最优值（二分答案型）。面试里它出现频率极高，而且**边界最容易写错**——所以这一讲的重点不是思路，是「把边界写成条件反射」。

## 1 核心模板代码

### 模板 A：左闭右开的 lower_bound（第一个 ≥ target）

```python
def lower_bound(nums, target):
    """第一个 >= target 的下标；都不满足则返回 len(nums)。区间写法：左闭右开 [lo, hi)。"""
    lo, hi = 0, len(nums)          # hi 取 len，是「够不到的位置」，所以循环条件是 lo < hi
    while lo < hi:
        mid = (lo + hi) // 2       # 左闭右开固定配这个 mid，不会死循环
        if nums[mid] < target:
            lo = mid + 1           # mid 不满足，答案只可能在右边
        else:
            hi = mid               # mid 满足，它本身可能是答案，所以 hi = mid 不能写成 mid-1
    return lo                      # 收拢到一个点，它左边全部 < target，它是第一个 >= target
```

- **时间 O(log n)，空间 O(1)**。循环结束时 `lo == hi`，它指向第一个 ≥ target 的位置；如果所有元素都 < target，返回 `len(nums)`（一个合法的「插入位置」，也是个哨兵值）。
- **默写要点**：`hi = len(nums)`、`while lo < hi`、`hi = mid`（不减 1）、`lo = mid + 1`。

### 模板 B：左闭右开的 upper_bound（第一个 > target）

```python
def upper_bound(nums, target):
    """第一个 > target 的下标；都不满足则返回 len(nums)。"""
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] <= target:
            lo = mid + 1           # 等于 target 也要往右走，这正是 upper 和 lower 的唯一区别
        else:
            hi = mid
    return lo
```

- **时间 O(log n)，空间 O(1)**。
- **默写要点**：和 lower_bound 相比**只改一个符号**：`<` 变 `<=`。背的时候要把两个一起背，改符号是最不容易忘的记法。

### 模板 C：左闭右闭（精确查找，最贴近直觉）

```python
def exact_search(nums, target):
    """找到就返回下标，找不到返回 -1。区间写法：左闭右闭 [lo, hi]。"""
    lo, hi = 0, len(nums) - 1      # 两个端点都在搜索范围内
    while lo <= hi:                # 闭区间用 <= ：lo == hi 时区间里还有 1 个元素没查
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1           # mid 已经查过了，跳过它，保证每轮范围都变小
        else:
            hi = mid - 1
    return -1
```

- **时间 O(log n)，空间 O(1)**。
- **默写要点**：闭区间配 `lo <= hi`、`lo = mid + 1`、`hi = mid - 1`；三个地方只要有一个不配套就会死循环或漏元素。

### 模板 D：二分答案的两个骨架（★ 本讲最该背的东西）

```python
def min_feasible(lo, hi, ok):
    """在 [lo, hi] 里找最小的可行值：越往后越容易可行（ok 单调 False...True）。保证 ok(hi) 为真。"""
    while lo < hi:
        mid = (lo + hi) // 2       # 找最小可行值：下取整
        if ok(mid):
            hi = mid               # mid 可行 → 先记住它，继续往左找更小的
        else:
            lo = mid + 1           # mid 不可行 → 一定在右边
    return lo


def max_feasible(lo, hi, ok):
    """在 [lo, hi] 里找最大的可行值：越往后越难可行（ok 单调 True...False）。保证 ok(lo) 为真。"""
    while lo < hi:
        mid = (lo + hi + 1) // 2   # ★★ 必须加 1 向上取整，否则 lo 和 hi 相邻时会死循环
        if ok(mid):
            lo = mid               # mid 可行 → 先记住它，继续往右找更大的
        else:
            hi = mid - 1           # mid 不可行 → 一定在左边
    return lo
```

**为什么「找最大可行值」必须 `+1`？** 设 `lo = 3, hi = 4`，若 `mid = (3+4)//2 = 3`，而 `ok(3)` 为真，那么执行 `lo = mid = 3` —— `lo` 和 `hi` 都没变，死循环。加 1 之后 `mid = (3+4+1)//2 = 4`，收敛的是 `hi`，循环必然结束。

- **时间 O(log(范围) × 每次判定的代价)**；空间 O(1)。
- **默写要点**：
  - 找**最小**可行值 → `mid = (lo + hi) // 2`，可行时 `hi = mid`；
  - 找**最大**可行值 → `mid = (lo + hi + 1) // 2`，可行时 `lo = mid`；
  - 记法：「往左收（hi = mid）配下取整，往右收（lo = mid）配上取整」，两边不对称的那一半才需要 `+1`。
- 用法示例（LC 875：`ok(k)` 表示速度 k 时能否在 h 小时内吃完）：

```python
# lambda 是「临时函数」的写法：「lambda 参数: 表达式」等价于一个只有 return 一句话的小函数
speed = min_feasible(1, 11, lambda k: sum((p + k - 1) // k for p in [3, 6, 7, 11]) <= 8)
# speed == 4
```

## 3. 例题精讲（3 题）

### 例题 1：二分查找（LC 704，Easy）

**题面**：给定一个 n 个元素有序的（升序）整型数组 `nums` 和一个目标值 `target`，写一个函数搜索 `nums` 中的 `target`，如果目标值存在返回下标，否则返回 -1。

- 示例 1：`nums = [-1,0,3,5,9,12], target = 9`，输出 `4`（9 出现在下标 4）。
- 示例 2：`nums = [-1,0,3,5,9,12], target = 2`，输出 `-1`。
- 约束：`1 <= nums.length <= 10^4`；`-10^4 < nums[i], target < 10^4`；`nums` 中的所有元素**互不相同**、按升序排列。要求必须写 O(log n) 的算法。

**完整代码**：

```python
def search(nums, target):
    """LC 704 二分查找，找不到返回 -1。左闭右闭写法 [lo, hi]，最容易背。"""
    if not nums:                   # 边界：空数组
        return -1
    lo, hi = 0, len(nums) - 1      # 两个端点都在区间里
    while lo <= hi:                # 闭区间用 <=，因为 lo == hi 时区间里还有一个元素要查
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1           # 闭区间里 mid 已经查过了，直接跳过，不会漏、不会死循环
        else:
            hi = mid - 1
    return -1
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `if not nums:` | 空数组保护 | 空数组 `hi = -1`，虽然 `lo <= hi` 不成立也能返回 -1，但显式写出来面试官更放心 |
| 2 | `lo, hi = 0, len(nums) - 1` | 初始化闭区间 | 元组解包一行赋两个变量；闭区间两个端点都能取到 |
| 3 | `while lo <= hi:` | 循环条件 | 闭区间要 `<=`：只剩一个元素时要继续查，否则会漏掉它 |
| 4 | `mid = (lo + hi) // 2` | 取中点 | `//` 是整数除法；这种写法中点偏左，配 `hi = mid - 1` 不会死循环 |
| 5 | `if nums[mid] == target:` | 命中 | 立即 return，不用继续 |
| 6 | `if nums[mid] < target:` | 往右 | 目标更大，`mid` 及左边全部排除 |
| 7 | `lo = mid + 1` | 收缩左端 | `+1` 是因为 `mid` 已经比较过了，闭区间里不能留它 |
| 8 | `hi = mid - 1` | 收缩右端 | 同理 |
| 9 | `return -1` | 没找到 | 区间空了才走到这里 |

**走查**（普通用例 `nums = [-1,0,3,5,9,12], target = 9`）：

| 轮次 | lo | hi | mid | nums[mid] | 比较结果 | 动作 |
|---|---|---|---|---|---|---|
| 1 | 0 | 5 | 2 | 3 | 3 < 9 | lo = 3 |
| 2 | 3 | 5 | 4 | 9 | 相等 | 返回 4 |

返回 4 ✅。

**边界与极端用例**：

| 用例 | 类型 | 结果 | 说明 |
|---|---|---|---|
| `[1,3,5], target=0` | 边界 | -1 | 比最小值还小：mid=1（3>0）→ hi=0；mid=0（1>0）→ hi=-1，循环结束 |
| `[1,3,5], target=6` | 边界 | -1 | 比最大值还大：一路 lo 加到 3 > hi=2，结束 |
| `[5], target=5` | 边界 | 0 | 单元素：lo=hi=0，第一轮就命中 |
| `[]`, `target=1` | 边界 | -1 | 第 1 行返回 |
| `[1,3,5], target=5` | 普通 | 2 | 命中最后一个元素，验证 `hi = mid - 1` 不会提前退出 |

**复杂度**：每轮区间长度从 n 变成约 n/2，最多 log₂n 轮，每轮常数次比较 ⇒ 时间 O(log n)（n = 10^4 时最多 14 轮）。只用 `lo, hi, mid` 三个变量 ⇒ 空间 O(1)。

### 例题 2：搜索插入位置（LC 35，Easy）

**题面**：给定一个排序数组和一个目标值，在数组中找到目标值并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。请必须使用时间复杂度为 O(log n) 的算法。可以假设数组中无重复元素。

- 示例 1：`nums = [1,3,5,6], target = 5`，输出 `2`。
- 示例 2：`nums = [1,3,5,6], target = 2`，输出 `1`。
- 示例 3：`nums = [1,3,5,6], target = 7`，输出 `4`。
- 示例 4：`nums = [1,3,5,6], target = 0`，输出 `0`。
- 约束：`1 <= nums.length <= 10^4`；`-10^4 <= nums[i] <= 10^4`；`nums` 为无重复元素的升序数组；`-10^4 <= target <= 10^4`。

**完整代码**：

```python
def search_insert(nums, target):
    """LC 35 搜索插入位置。其实就是 lower_bound：返回第一个 >= target 的位置。"""
    if not nums:                   # 边界：空数组，插到 0 号位
        return 0
    lo, hi = 0, len(nums)          # 左闭右开，hi 取 len 覆盖「插到末尾」的情况
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo                      # 可能是 0..len(nums) 中的任何一个值
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `if not nums:` | 空数组保护 | 空数组的插入位置就是 0 |
| 2 | `lo, hi = 0, len(nums)` | 初始化 | 右端取 `len` 而不是 `len - 1`：返回值可能是 `len`，必须让它落在搜索范围内 |
| 3 | `while lo < hi:` | 循环条件 | 左闭右开配 `<`；区间为空时 `lo == hi` 自然结束，不用额外 return -1 |
| 4 | `mid = (lo + hi) // 2` | 取中点 | 左闭右开固定配下取整 |
| 5 | `if nums[mid] < target:` | 不满足条件 | `< target` 的位置一定不是答案（我们要的是第一个 ≥） |
| 6 | `lo = mid + 1` | 排除 mid | mid 已判定不合格，左端跳到它右边 |
| 7 | `hi = mid` | 保留 mid | mid 可能是答案，所以右端**不能**写 `mid - 1`，否则可能把它删掉 |
| 8 | `return lo` | 答案 | 循环结束 `lo == hi`，左边全是 `< target`，它就是第一个 `>= target` |

**走查**（`nums = [1,3,5,6], target = 2`）：

| 轮次 | lo | hi | mid | nums[mid] | 比较 | 动作 |
|---|---|---|---|---|---|---|
| 1 | 0 | 4 | 2 | 5 | 5 ≥ 2 | hi = 2 |
| 2 | 0 | 2 | 1 | 3 | 3 ≥ 2 | hi = 1 |
| 3 | 0 | 1 | 0 | 1 | 1 < 2 | lo = 1 |
| 结束 | 1 | 1 | — | — | — | 返回 1 |

返回 1 ✅（和示例 2 一致）。

**边界与极端用例**：

| 用例 | 类型 | 结果 | 说明 |
|---|---|---|---|
| `[1,3,5,6], 5` | 普通 | 2 | 命中已有元素 |
| `[1,3,5,6], 7` | 边界 | 4 | 插到末尾，返回值等于 `len(nums)`，验证 `hi` 初值必须是 len |
| `[1,3,5,6], 0` | 边界 | 0 | 插到最前，验证 `lo` 初值 0 正确 |
| `[], 3` | 边界 | 0 | 空数组 |
| `[2], 1` | 极端 | 0 | 单元素且比它小，mid=0 判定 `2 < 1` 为假 → hi=0，返回 0 |

**复杂度**：区间长度每轮减半，最多 log₂(n+1) 轮 ⇒ 时间 O(log n)；空间 O(1)。

### 例题 3：在排序数组中查找元素的第一个和最后一个位置（LC 34，Medium）

**题面**：给你一个按照非递减顺序排列的整数数组 `nums` 和一个目标值 `target`，请你找出给定目标值在数组中的开始位置和结束位置。如果数组中不存在目标值，返回 `[-1, -1]`。你必须设计并实现时间复杂度为 O(log n) 的算法解决此问题。

- 示例 1：`nums = [5,7,7,8,8,10], target = 8`，输出 `[3,4]`。
- 示例 2：`nums = [5,7,7,8,8,10], target = 6`，输出 `[-1,-1]`。
- 示例 3：`nums = [], target = 0`，输出 `[-1,-1]`。
- 约束：`0 <= nums.length <= 10^5`；`-10^9 <= nums[i], target <= 10^9`；`nums` 是一个非递减数组。

**完整代码**：

```python
def search_range(nums, target):
    """LC 34 在排序数组中查找元素的第一个和最后一个位置。lower/upper 各跑一次。"""
    if not nums:                   # 边界：空数组
        return [-1, -1]
    first = lower_bound(nums, target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]            # 第一个 >= target 的位置越界，或者那一位不是 target
    last = upper_bound(nums, target) - 1   # 第一个 > target 的左边一格就是最后一个 target
    return [first, last]
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `if not nums:` | 空数组保护 | 空数组直接返回 `[-1,-1]` |
| 2 | `first = lower_bound(nums, target)` | 找左端点 | 第一个 ≥ target 的位置；若 target 不存在，它指向「第一个比 target 大的元素」 |
| 3 | `if first == len(nums) or nums[first] != target:` | 存在性判定 | `== len(nums)` 说明全数组都 < target；`!= target` 说明 target 不在数组里。这一步是本题最容易漏的 |
| 4 | `last = upper_bound(nums, target) - 1` | 找右端点 | 「第一个 > target」的**前一格**就是最后一个 target；`-1` 不能省 |
| 5 | `return [first, last]` | 返回 | 题目要的是起始和结束位置两个值 |

**走查**（`nums = [5,7,7,8,8,10], target = 8`）：

先看 `lower_bound(nums, 8)`：

| 轮次 | lo | hi | mid | nums[mid] | 判定 `nums[mid] < 8` | 动作 |
|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 8 | 否 | hi = 3 |
| 2 | 0 | 3 | 1 | 7 | 是 | lo = 2 |
| 3 | 2 | 3 | 2 | 7 | 是 | lo = 3 |
| 结束 | 3 | 3 | — | — | — | 返回 3 |

`first = 3`，且 `nums[3] = 8 == target`，通过存在性判定。再看 `upper_bound(nums, 8)`：

| 轮次 | lo | hi | mid | nums[mid] | 判定 `nums[mid] <= 8` | 动作 |
|---|---|---|---|---|---|---|
| 1 | 0 | 6 | 3 | 8 | 是 | lo = 4 |
| 2 | 4 | 6 | 5 | 10 | 否 | hi = 5 |
| 3 | 4 | 5 | 4 | 8 | 是 | lo = 5 |
| 结束 | 5 | 5 | — | — | — | 返回 5 |

`last = 5 - 1 = 4`，最终返回 `[3, 4]` ✅。

**边界与极端用例**：

| 用例 | 类型 | 结果 | 说明 |
|---|---|---|---|
| `[5,7,7,8,8,10], 6` | 普通 | `[-1,-1]` | `lower_bound` 返回 3（`nums[3] = 8 ≠ 6`），被存在性判定拦下 |
| `[5,7,7,8,8,10], 10` | 边界 | `[5,5]` | 命中最右端元素，`upper_bound` 返回 `len`，减 1 正好是最后一个下标 |
| `[1], 1` | 边界 | `[0,0]` | 单元素，两个边界重合 |
| `[1], 0` | 边界 | `[-1,-1]` | `lower_bound` 返回 0 但 `nums[0] = 1 ≠ 0` |
| `[], 0` | 边界 | `[-1,-1]` | 第 1 行返回 |
| `[2,2], 2` | 极端 | `[0,1]` | 全是重复元素：`lower = 0`，`upper = 2`，结果 `[0,1]` |

**复杂度**：两次二分，各 O(log n)，加起来的 O(2 log n) 记作 O(log n)；只用了几个下标变量，空间 O(1)。

## 4. 变式练习（3 题）

| 题号 | 题面摘要 | 关键提示（不给答案） | 对应函数名 |
|---|---|---|---|
| LC 69 | 计算并返回 x 的平方根，只保留整数部分（小数部分舍去），不允许使用任何内置指数/开方函数 | **二分答案**，而且是「找最大可行值」：`ok(v)` 就是 `v * v <= x`。所以 `mid` 必须 `(lo + hi + 1) // 2`、可行时 `lo = mid`。上界可以直接取 `x // 2`（x ≥ 2 时答案不会超过它），注意 0 和 1 要提前返回 | `my_sqrt(x)` |
| LC 875 | n 堆香蕉，第 i 堆有 `piles[i]` 根；每小时选一堆吃 k 根（这小时吃完这堆就不会再吃别的），求在 h 小时内吃完的**最小**速度 k | **二分答案**「找最小可行值」：`ok(k)` = 每堆耗时 `ceil(piles[i] / k)` 之和 ≤ h；向上取整写成 `(p + k - 1) // k`（避免 `math.ceil` 和浮点）。下界 1、上界 `max(piles)`；`mid = (lo + hi) // 2`、可行时 `hi = mid` | `min_eating_speed(piles, h)` |
| LC 153 | 已知一个长度为 n 的升序数组经过未知次数的旋转（例如 `[0,1,2,4,5,6,7]` 变成 `[4,5,6,7,0,1,2]`），找出其中**最小**的元素，要求 O(log n) | 别和 `nums[lo]` 比（没旋转时会错），要和 **`nums[hi]`** 比：`nums[mid] > nums[hi]` 说明最小值在右半边（`lo = mid + 1`），否则在左半边（`hi = mid`）。用闭区间 `[0, n-1]` + `while lo < hi` 收拢 | `find_min(nums)` |

```python
变式1
def my_sqrt(x):
    if x < 2:
        return x
    lo, hi = 1, x // 2
    while lo < hi:
        mid = (lo + hi + 1) // 2   # ⚠️ 向上取整
        if mid * mid <= x:         # 可行
            lo = mid               # 往右找更大
        else:
            hi = mid - 1
    return lo
```

```python
变式2
def min_eating_speed(piles, h):
    def ok(k):
        total = 0
        for p in piles:
            total += (p + k - 1) // k   # 向上取整，避免浮点
            if total > h:               # 剪枝，提前退出
                return False
        return total <= h

    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2            # ⚠️ 向下取整
        if ok(mid):
            hi = mid                    # 可行，往左找更小
        else:
            lo = mid + 1
    return lo
```

```python
变式3
def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:                       # 闭区间，lo==hi 时就是答案
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1                 # 最小值在右边
        else:
            hi = mid                     # 最小值在左边或就是 mid
    return nums[lo]
```

