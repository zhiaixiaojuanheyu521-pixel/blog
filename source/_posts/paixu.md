---
title: 04 排序
date: 2026-10-08 23:20:24
categories:
  - 算法
tags:
  - 排序
description: 又学了一点算法喵！
cover: /img/cover-tech.svg
comments: true
---

> 一句话定位：这一讲解决两件事 —— ① 面试官让你**手写**快排/归并（不是让你调 `sorted()`）；② 「第 K 大 / 前 K 高频」这类题用**堆**把 O(n log n) 压到 O(n log k)。

## . 核心模板代码

### 模板 1：手写快速排序（挖坑法 + 随机基准）★必背

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr)//2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

print(quick_sort([3, 0, 1, 8, 2, 1, 4]))        基础版以中心值为基准进行排序
```



```python
def quick_sort(nums):
    # 边界：空数组/单元素直接返回，避免后面 randint 报错
    if not nums:
        return []
    a = list(nums)                    # 复制一份，不改调用者的列表（面试时说明这个选择）
    _quick_sort(a, 0, len(a) - 1)
    return a


def _quick_sort(a, lo, hi):
    if lo >= hi:                      # 区间只剩 0 或 1 个元素，天然有序
        return
    p = _partition(a, lo, hi)         # p 位置的元素已经站好了最终位置
    _quick_sort(a, lo, p - 1)         # 左半边：全部 <= a[p]，不可能再跑到右边
    _quick_sort(a, p + 1, hi)         # 右半边：全部 >= a[p]


def _partition(a, lo, hi):
    # 随机基准：先用 random 挑一个位置换到 lo，避免「已经有序的输入」退化成 O(n^2)
    r = random.randint(lo, hi)        # randint 是闭区间 [lo, hi]，一定要写闭区间
    a[lo], a[r] = a[r], a[lo]
    pivot = a[lo]                     # 基准值先存起来，lo 这个位置就成了第一个「坑」
    while lo < hi:
        # 右指针往左找第一个 < pivot 的数，填进左边的坑
        while lo < hi and a[hi] >= pivot:
            hi -= 1
        a[lo] = a[hi]
        # 左指针往右找第一个 > pivot 的数，填进右边的坑
        while lo < hi and a[lo] <= pivot:
            lo += 1
        a[hi] = a[lo]
    a[lo] = pivot                     # 两个指针相遇处就是基准的最终位置
    return lo
```

- **时间**：期望 O(n log n)，最坏 O(n²)（全相等，或每次都切在最边上）；**空间**：递归栈期望 O(log n)、最坏 O(n)
- **默写要点**：「随机换到 lo → pivot 存起来 → 右找小填左坑 → 左找大填右坑 → 相遇处放 pivot」。**两个内层 while 都必须带 `lo < hi`**，否则指针会跑出区间。

### 模板 2：归并排序（O(n) 辅助数组版）★必背

```python
def merge_sort(nums):
    if not nums:
        return []
    a = list(nums)
    tmp = [0] * len(a)                # 只申请一次辅助数组，避免每层递归反复开内存
    _merge_sort(a, tmp, 0, len(a) - 1)
    return a


def _merge_sort(a, tmp, lo, hi):
    if lo >= hi:
        return
    mid = (lo + hi) // 2              # Python 的 // 是向下取整，不会越界（不用防溢出）
    _merge_sort(a, tmp, lo, mid)
    _merge_sort(a, tmp, mid + 1, hi)  # 是 mid+1，写成 mid 会区间重叠、无限递归
    # 归并：两个有序段是 [lo, mid] 和 [mid+1, hi]，谁小取谁
    i, j, k = lo, mid + 1, lo
    while i <= mid and j <= hi:
        if a[i] <= a[j]:              # 取 <= 才能保证稳定排序
            tmp[k] = a[i]
            i += 1
        else:
            tmp[k] = a[j]
            j += 1
        k += 1
    while i <= mid:                   # 左段还有剩，直接搬
        tmp[k] = a[i]
        i += 1
        k += 1
    while j <= hi:                    # 右段还有剩，直接搬
        tmp[k] = a[j]
        j += 1
        k += 1
    a[lo:hi + 1] = tmp[lo:hi + 1]     # 一次性写回，比逐个赋值少写一行循环
```

- **时间**：任何情况都是 O(n log n)（递归 log n 层，每层合并共 n 次操作）；**空间**：O(n) 的 tmp + O(log n) 递归栈
- **默写要点**：「先递归两半 → i/j/k 三指针 → 谁小取谁 → 剩的整段搬 → 切片写回」。写回是 `tmp[lo:hi+1]`，切片右端不含所以要 +1。

### 模板 3：冒泡排序

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):              # 需要 n-1 轮
        for j in range(n - 1 - i):      # 每轮比较范围逐渐缩小
            if arr[j] > arr[j + 1]:     # 前比后大 → 交换
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr


# 测试
nums = [5, 2, 9, 1, 5, 6]
print(bubble_sort(nums))   # [1, 2, 5, 5, 6, 9]
```

## 3. 例题精讲（3 题）

### 例题 1：排序数组（LC 912，Medium）

**题面**：给你一个整数数组 `nums`，将该数组升序排列。请**不要**使用任何内置排序函数（面试官要求手写）。

- 示例 1：`nums = [5,2,3,1]` → `[1,2,3,5]`
- 示例 2：`nums = [5,1,1,2,0,0]` → `[0,0,1,1,2,5]`
- 约束：`1 <= nums.length <= 5*10^4`；`-5*10^4 <= nums[i] <= 5*10^4`


```python
# ===== 版本一：快排（辅助函数 _quick_sort / _partition 见 §2 模板 1）=====
def quick_sort(nums):
    if not nums:
        return []
    a = list(nums)
    _quick_sort(a, 0, len(a) - 1)
    return a


# ===== 版本二：归并（辅助函数 _merge_sort 见 §2 模板 2）=====
def merge_sort(nums):
    if not nums:
        return []
    a = list(nums)
    tmp = [0] * len(a)
    _merge_sort(a, tmp, 0, len(a) - 1)
    return a
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 入口 | `if not nums: return []` | 空输入保护 | 空数组进 `_partition` 会 `randint(0,-1)` 报错 |
| 入口 | `a = list(nums)` | 复制成新列表 | 裸 `a = nums` 只是换个名字，还是同一个列表 |
| 快排 | `if lo >= hi: return` | 递归出口 | 长度 ≤ 1 天然有序，同时防无限递归 |
| 快排 | `random.randint(lo, hi)` | 随机选基准 | 闭区间！写成 `hi-1` 就漏掉最后一个元素 |
| 快排 | `pivot = a[lo]` | 存住基准值 | 后面 `a[lo]` 会被填坑覆盖，值必须先留一份 |
| 快排 | `a[lo] = a[hi]` | 填左坑 | 挖坑法是「搬数」而非「交换」，少两次写操作 |
| 快排 | `a[lo] = pivot; return lo` | 基准归位 | 相遇点左边全 ≤ pivot、右边全 ≥ pivot，位置终局已定 |
| 归并 | `mid = (lo + hi) // 2` | 取中点 | Python 整数不溢出，不用写 `lo+(hi-lo)//2` |
| 归并 | `_merge_sort(a, tmp, mid + 1, hi)` | 递归右半 | 必须是 `mid+1`，否则区间重叠、无限递归 |
| 归并 | `if a[i] <= a[j]` | 优先取左段 | 带等号才稳定；写成 `<` 就不稳定了 |

**走查**：

用例 1（普通）`[3,1,2]`，假设随机基准落在下标 0（基准值 3）：

| 步骤 | lo | hi | 数组 a | 说明 |
|---|---|---|---|---|
| 初始 | 0 | 2 | `[3,1,2]` | 坑在 lo=0 |
| 右指针找 < 3 | 0 | 1 | `[2,1,2]` | a[2]=2 < 3，填进左坑 |
| 左指针找 > 3 | 2 | 1 | `[2,1,2]` | a[0]=2、a[1]=1 都 ≤ 3，lo 走到 2 与 hi 相遇 |
| 放基准 | 2 | 2 | `[2,1,3]` | 返回 p=2；递归左边 [0,1] 后得 `[1,2,3]` |

用例 2（边界）：`[]` → 第 1 个 `if` 直接返回 `[]`；`[7]` → `_quick_sort` 里 `lo >= hi` 立即返回，结果 `[7]`。
用例 3（极端）`[5,5,5,5]`：pivot=5 时 `a[hi] >= pivot` 一路成立，hi 直接滑到 0，返回 p=0；下一轮 p=1……**每轮只切掉 1 个元素，退化成 O(n²)**。面试要主动说这句，并补一句「可以改成三路划分，把等于基准的元素集中到中间，下次不再递归」；归并在这种输入下仍是 O(n log n)。

**复杂度**：快排每层 partition 合计扫 n 个元素、期望切 log n 层 → O(n log n)；最坏每次只切 1 个 → n+(n-1)+… = O(n²)。空间是递归深度 → 期望 O(log n)、最坏 O(n)。归并递归 log n 层、每层合并共 n 次 → 恒定 O(n log n)；空间 tmp O(n) + 栈 O(log n) = O(n)。
