---
title: 02 模拟与字符串
date: 2026-10-07 15:53:45
categories:
  - 算法
tags:
  - 模和字符串
description: 偷偷学习算法中ing
cover: /img/cover-tech.svg
comments: true
---

> 一句话定位：这一讲解决「题目把过程描述得很清楚，你只要照着一步步做」这一类题——
> 所谓模拟题，就是**没有巧妙的算法，只有清晰的步骤和不出错的边界**。
> 一句话心法：**先把人脑里的步骤写成 1) 2) 3)，再照着步骤写循环**，不要一上来就写代码。

##  核心模板代码

### 模板 T1：逐行构造二维表（杨辉三角型）

```python
def build_rows(num_rows):
    """只依赖上一行来生成下一行，返回全部行。"""
    if num_rows <= 0:                     # 边界：先判行数，别让 range 拿到负数
        return []
    rows = [[1]]                          # 第 1 行固定
    for _ in range(1, num_rows):          # 从第 2 行开始生成
        prev = rows[-1]                   # -1 取最后一行
        cur = [1]                         # 首元素固定是 1
        for j in range(1, len(prev)):     # 中间部分：上一行相邻两项之和
            cur.append(prev[j - 1] + prev[j])
        cur.append(1)                     # 尾元素固定是 1
        rows.append(cur)
    return rows
```

- 时间 O(n²)（第 n 行有 n 个元素，总共约 n²/2 个数），空间 O(n²)（答案本身就这么大）。
- **默写要点**：`rows[-1]` 取上一行 + 首尾各补一个 1，中间用 `prev[j-1] + prev[j]`。

### 模板 T2：边界收缩（螺旋遍历型）

```python
def spiral(matrix):
    """从外圈往内圈一圈圈读。"""
    if not matrix or not matrix[0]:               # 空矩阵 / 第一行为空
        return []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    res = []
    while top <= bottom and left <= right:        # 边界没交错就还有一圈
        for c in range(left, right + 1):          # 上：左 → 右
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):          # 右：上 → 下
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:                         # 只剩一行时，下边不能再读
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                         # 只剩一列时，左边不能再读
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res
```

- 时间 O(m×n)（每个格子正好读一次），空间 O(1)（不算返回的答案列表）。
- **默写要点**：`range` 是左闭右开，所以向右/向下要写 `+1`，向左/向上要写 `-1` 当步长；
  第三、四条边前**必须**再判一次边界，否则会重复读取。

### 模板 T3：竖式逐位相加（进位型）

```python
def add_by_digit(a, b):
    """两个数字字符串相加，按竖式从个位往高位算。"""
    i, j = len(a) - 1, len(b) - 1        # 指针从各自最低位开始
    carry = 0                            # 进位：十进制里只会是 0 或 1
    digits = []                          # 字符串不可变，先收集字符
    while i >= 0 or j >= 0 or carry:     # 三个条件缺一不可
        total = carry
        if i >= 0:
            total += int(a[i])           # 逐字符转数字
            i -= 1
        if j >= 0:
            total += int(b[j])
            j -= 1
        digits.append(str(total % 10))   # 本位
        carry = total // 10              # 进位
    return "".join(reversed(digits))     # 反转拼接
```

- 时间 O(max(len(a), len(b)))，空间 O(max(len(a), len(b)))。
- **默写要点**：`while` 的三个条件（`i >= 0 or j >= 0 or carry`）一个都不能少；
  `str(total % 10)` 与 `total // 10` 这一对是竖式的心跳。

### 模板 T4：原地进位（加一型）

```python
def add_one(digits):
    """digits 是十进制各位数字，返回加一后的数组。"""
    if not digits:
        return [1]
    res = digits[:]                      # 复制一份，不改调用方的数组
    for i in range(len(res) - 1, -1, -1):    # 从最后一位往前遍历
        if res[i] < 9:
            res[i] += 1
            return res                   # 不用进位，改完就结束
        res[i] = 0                       # 是 9 就变 0，进位继续往前
    res.insert(0, 1)                     # 全进位（999 → 1000）才走到这里
    return res
```

- 时间 O(n)（最坏全进位扫一遍），空间 O(n)（复制了一份）。
- **默写要点**：`range(n-1, -1, -1)` 是倒序遍历的固定写法（起点、终点前一位、步长 -1）。

### 顺手补 7 个 Python 语法（本讲几乎每题都用到）

| 语法 | 例子 | 一句话解释 |
|---|---|---|
| `range` 三参数 | `range(len(res) - 1, -1, -1)` | 左闭右开、步长 -1 表示倒着走；终点要写成「想停的位置再前一个」 |
| 负下标 | `triangle[-1]` | 最后一个元素，等于 `triangle[len(triangle)-1]` |
| 元组解包 | `rows, cols = len(matrix), len(matrix[0])` | 一行拿到多个值，双指针/边界全靠它 |
| 字符串不可变 | 不能 `s[i] = 'x'` | 所以要「先用列表收集，最后 `"".join(列表)`」 |
| `int` / `str` 互转 | `int("7")` → `7`，`str(7)` → `"7"` | 逐位运算时的必备转换 |
| `reversed` | `"".join(reversed(digits))` | 反转后再拼；`for _ in range(1, n)` 里的 `_` 表示这个变量用不到 |

## 3. 例题精讲（3 题）

### 例题 1：杨辉三角（LC 118，Easy）

**题面**：给定一个非负整数 `numRows`，生成「杨辉三角」的前 `numRows` 行。
在杨辉三角中，每个数是它左上方和右上方的数之和；每行首尾都是 1。

- 示例 1：`numRows = 5` → `[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]`
- 示例 2：`numRows = 1` → `[[1]]`
- 约束：`1 <= numRows <= 30：

```python
def generate_pascal_triangle(num_rows):
    """LC 118 杨辉三角：返回前 num_rows 行（每行首尾都是 1，中间是上一行相邻两项之和）。"""
    if num_rows <= 0:                    # 边界：负数或 0 行，返回空列表而不是崩掉
        return []
    triangle = [[1]]                     # 第 1 行是死的，先放进去
    for _ in range(1, num_rows):         # 从第 2 行开始，用 _ 表示这个循环变量用不到
        prev = triangle[-1]              # -1 取最后一个元素，也就是上一行
        cur = [1]                        # 每一行都以 1 开头
        for j in range(1, len(prev)):    # 中间部分：上一行的第 j-1 项加第 j 项
            cur.append(prev[j - 1] + prev[j])
        cur.append(1)                    # 再以 1 结尾（第 2 行 prev 只有 1 项，结果正好是 [1, 1]）
        triangle.append(cur)
    return triangle
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 1 | `def generate_pascal_triangle(num_rows):` | 函数签名 | 名字用题目语义命名；参数名保持题目给的样子 |
| 3–4 | `if num_rows <= 0: return []` | 行数边界 | 不返回 `[[]]` 也不返回 `[[1]]`，0 行就是空列表 |
| 5 | `triangle = [[1]]` | 第 1 行当种子 | 循环从第 2 行开始，能少写一层特殊判断 |
| 6 | `for _ in range(1, num_rows):` | 生成第 2 到第 num_rows 行 | `range(1, num_rows)` 共 `num_rows - 1` 次，正好补足剩下的行 |
| 7 | `prev = triangle[-1]` | 取上一行 | 只依赖上一行，别写成遍历整个 `triangle` |
| 8 | `cur = [1]` | 新行以 1 开头 | 首元素固定，先放进去，后面只管中间 |
| 9–10 | `for j in range(1, len(prev)):` / `cur.append(prev[j-1] + prev[j])` | 算中间元素 | `j` 从 1 到 `len(prev)-1`；第 j 个元素 = 上一行左上方（`j-1`）+ 右上方（`j`） |
| 11 | `cur.append(1)` | 补上结尾的 1 | 第 2 行时 `prev` 只有 1 个元素，循环不执行，这里补完正好是 `[1, 1]` |
| 12 | `triangle.append(cur)` | 把新行存进结果 | 循环结束才 append，保证行长完整 |
| 13 | `return triangle` | 返回全部行 | 放在循环外，别不小心缩进到 for 里面 |

**走查**：

| 用例 | 步骤 | `prev` | `cur` 中间计算 | `triangle` 新增 |
|---|---|---|---|---|
| 普通：`numRows = 5` | 初始 | — | — | `[[1]]` |
| | 第 2 行 | `[1]` | `range(1,1)` 空，只补首尾 1 | `[1,1]` |
| | 第 3 行 | `[1,1]` | j=1: 1+1=2 | `[1,2,1]` |
| | 第 4 行 | `[1,2,1]` | j=1: 1+2=3；j=2: 2+1=3 | `[1,3,3,1]` |
| | 第 5 行 | `[1,3,3,1]` | j=1: 4；j=2: 6；j=3: 4 | `[1,4,6,4,1]` ✅ |
| 边界：`numRows = 1` | 直接 | — | 循环 `range(1,1)` 一次都不进 | 返回 `[[1]]` ✅ |
| 极端：`numRows = 0` | 第 3 行 | — | — | 返回 `[]` ✅ |

**复杂度**：时间 O(n²) —— 第 k 行的中间元素有 k-2 个，总工作量是 1+2+…+n ≈ n²/2。
空间 O(n²) —— 返回的答案本身就含约 n²/2 个数字，这是输出规模决定的下界，不算额外开销。

### 例题 2：螺旋矩阵（LC 54，Medium）

**题面**：给你一个 `m` 行 `n` 列的矩阵 `matrix`，请按照**顺时针螺旋顺序**，返回矩阵中的所有元素。

- 示例 1：`matrix = [[1,2,3],[4,5,6],[7,8,9]]` → `[1,2,3,6,9,8,7,4,5]`
- 示例 2：`matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]` → `[1,2,3,4,8,12,11,10,9,5,6,7]`
- 约束：`m == matrix.length`，`n == matrix[i].length`，`1 <= m, n <= 10`，`-100 <= matrix[i][j] <= 100`

```python
def spiral_order(matrix):
    """LC 54 螺旋矩阵：从外圈往内圈一圈圈读，返回读到的顺序。"""
    if not matrix or not matrix[0]:      # 空矩阵，或第一行是空的（列数为 0）
        return []
    rows, cols = len(matrix), len(matrix[0])   # 元组解包：一次拿到行数和列数
    top, bottom, left, right = 0, rows - 1, 0, cols - 1
    res = []
    while top <= bottom and left <= right:     # 四条边界还没交错，就还有一圈可读
        for c in range(left, right + 1):       # 1) 上边：从左到右
            res.append(matrix[top][c])
        top += 1                               # 上边读完了，上边界往下缩一行
        for r in range(top, bottom + 1):       # 2) 右边：从上到下
            res.append(matrix[r][right])
        right -= 1                             # 右边读完了，右边界往左缩一列
        if top <= bottom:                      # 3) 下边：只剩一行时不能再读，否则会重复
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:                      # 4) 左边：只剩一列时同理先判一下
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])
            left += 1
    return res
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 3–4 | `if not matrix or not matrix[0]: return []` | 双重判空 | 只写 `if not matrix` 不够：`[[]]` 这种「有行但没列」的输入会在取 `matrix[0]` 时误判 |
| 5 | `rows, cols = len(matrix), len(matrix[0])` | 取行列数 | 列数必须从 `matrix[0]` 取长度，不能想当然当成 `rows` |
| 6 | `top, bottom, left, right = 0, rows-1, 0, cols-1` | 四条边界 | 用四个「边界线」而不是「当前位置 + 方向」，逻辑更不容易错 |
| 7 | `res = []` | 结果容器 | 一维列表，按读取顺序 append |
| 8 | `while top <= bottom and left <= right:` | 圈循环 | 两个条件都要满足；任一交错就说明没有完整的圈了 |
| 9–10 | 上边 `for c in range(left, right + 1)` | 读第 top 行 | `range` 右端开区间，所以要 `right + 1` |
| 11 | `top += 1` | 收缩上边界 | 上边已经读进结果，再访问就是重复 |
| 12–13 | 右边 `for r in range(top, bottom + 1)` | 读第 right 列 | 起点用刚收缩过的 `top`，避免把右上角重复读一次 |
| 14 | `right -= 1` | 收缩右边界 | 同理 |
| 15–18 | `if top <= bottom:` + 下边倒序读 | 读第 bottom 行 | **关键保护**：只剩一行时上边已经把它读完，不判就会重复 |
| 19–22 | `if left <= right:` + 左边倒序读 | 读第 left 列 | 只剩一列时同样会重复（例如 3×1 的矩阵） |
| 23 | `return res` | 返回 | 循环外返回 |

**走查**：

| 用例 | 圈 | 取值顺序 | 边界变化 | 结果 |
|---|---|---|---|---|
| 普通：3×3 `[[1,2,3],[4,5,6],[7,8,9]]` | 第 1 圈 上 | 1, 2, 3 | top 0→1 | |
| | 右 | 6, 9 | right 2→1 | |
| | 下 | 8, 7 | bottom 2→1 | |
| | 左 | 4 | left 0→1 | |
| | 第 2 圈 | 上边读 5（top 1→2）；右边 `range(2,2)` 空（right 1→0）；下边 `top(2) <= bottom(1)` 不成立，跳过；左边 `left(1) <= right(0)` 不成立，跳过 | top 2，right 0 | `[1,2,3,6,9,8,7,4,5]` ✅ |
| 边界：1×1 `[[1]]` | 第 1 圈 | 上边读 1；右边 `range(1,1)` 空；下边/左边边界已交错跳过 | top 0→1 | `[1]` ✅ |
| 极端：3×1 `[[1],[2],[3]]`（只有一列） | 第 1 圈 | 上边读 `matrix[0][0]=1`；右边读 `matrix[1][0]=2`、`matrix[2][0]=3`；下边 `range(-1,-1,-1)` 空；左边边界交错跳过 | top 0→1，right 0→−1 | `[1,2,3]` ✅（没有重复） |

**复杂度**：时间 O(m×n) —— 每个格子恰好被 append 一次，四次内层循环加起来正好覆盖全部格子。
空间 O(1) —— 只用了 `top/bottom/left/right` 四个整数（答案列表 `res` 是必须返回的输出，不计入额外空间）。

### 例题 3：字符串相加（LC 415，Easy）

**题面**：给定两个字符串形式的非负整数 `num1` 和 `num2`，计算它们的和并以字符串形式返回。
**不能使用任何内置的大整数库**（也不能直接把输入转成整数）。

- 示例 1：`num1 = "11"`, `num2 = "123"` → `"134"`
- 示例 2：`num1 = "456"`, `num2 = "77"` → `"533"`
- 示例 3：`num1 = "0"`, `num2 = "0"` → `"0"`
- 约束：`1 <= num1.length, num2.length <= 10^4`；只含数字；除 `"0"` 本身外不含前导零

```python
def add_strings(num1, num2):
    """LC 415 字符串相加：不许转成整数，按竖式从个位往前加。"""
    if not num1:                             # 边界：某个加数是空串（题目不会给，但别留坑）
        return num2
    if not num2:
        return num1
    i, j = len(num1) - 1, len(num2) - 1      # 两个指针分别指向各自最后一位（个位）
    carry = 0                                # 进位，只可能是 0 或 1
    digits = []                              # 从低位往高位收集结果字符，最后整体反转
    while i >= 0 or j >= 0 or carry:         # 三个条件缺一不可：还有数没加完，或还有进位
        total = carry
        if i >= 0:
            total += int(num1[i])            # int('7') 得到 7，逐位转数字
            i -= 1
        if j >= 0:
            total += int(num2[j])
            j -= 1
        digits.append(str(total % 10))       # 本位 = 总和取个位
        carry = total // 10                  # 进位 = 总和整除 10（int 除法，向下取整）
    return "".join(reversed(digits))         # 反转再拼成字符串；reversed 不修改原列表
```

**逐行讲解**：

| 行 | 代码片段 | 作用 | 为什么这么写 |
|---|---|---|---|
| 3–6 | 两个空串判断 | 输入保护 | 题目保证非空，但两行代码换「绝不崩」，值得写 |
| 7 | `i, j = len(num1) - 1, len(num2) - 1` | 指针指向个位 | **一定是从末尾开始**，因为进位是从低位向高位传播的 |
| 8 | `carry = 0` | 进位变量 | 初始化成 0，每轮结束后更新 |
| 9 | `digits = []` | 收集结果 | Python 字符串不可变，不能用 `res = res + ch`（退化成 O(n²)），先收集再 join |
| 10 | `while i >= 0 or j >= 0 or carry:` | 循环条件 | **`or carry` 是关键**：`"999" + "1"` 最后一轮两串都空了但进位还是 1 |
| 11 | `total = carry` | 本轮总和 | 从进位开始累加，避免多写一个变量 |
| 12–14 | `if i >= 0: total += int(num1[i]); i -= 1` | 加上 `num1` 这一位 | 用 `if` 而不是 `for`：两串长度不同，先空的那边要停下来 |
| 15–17 | `if j >= 0: ... j -= 1` | 加上 `num2` 这一位 | 同上 |
| 18 | `digits.append(str(total % 10))` | 本位 | 最大 9+9+1 = 19，所以 `% 10` 一定是本位数字 |
| 19 | `carry = total // 10` | 进位 | 19 → 1；`//` 是整除（向下取整），别写成 `/`（会得到小数） |
| 20 | `return "".join(reversed(digits))` | 反转拼接 | 我们是从低位收集的，所以输出前要反过来 |

**走查**：

| 用例 | 轮次 | i | j | carry 进入 | total 计算 | digits（低位在前） | 结果 |
|---|---|---|---|---|---|---|---|
| 普通：`"11" + "123"` | 第 1 轮 | 1 | 2 | 0 | 0+1+3 = 4 | `["4"]` | |
| | 第 2 轮 | 0 | 1 | 0 | 0+1+2 = 3 | `["4","3"]` | |
| | 第 3 轮 | −1 | 0 | 0 | 0+1 = 1 | `["4","3","1"]` | 反转 → `"134"` ✅ |
| 边界：`"0" + "0"` | 第 1 轮 | 0 | 0 | 0 | 0+0+0 = 0 | `["0"]` | 循环条件变假 → `"0"` ✅ |
| 极端：`"999" + "1"` | 第 1–4 轮 | 2→−1 | 0→−1 | 0,1,1,1 | 每轮都是 10（9+1、9+1、9+1），第 4 轮只剩进位 1 | `["0","0","0"]` → 第 4 轮补 `"1"` | carry 清零 → `"1000"` ✅ |

**复杂度**：时间 O(max(len(num1), len(num2))) —— 每轮至少让 `i` 或 `j` 前进一步，
最多再加一轮处理最后的进位，所以循环次数是两串较长者的长度加常数。
空间 O(max(len)) —— `digits` 列表的长度就是结果的位数；如果把 `digits` 算作输出，则额外空间是 O(1)。

## 4. 变式练习（3 题）

**变式 1 · LC 14 最长公共前缀（Easy）**

- 题面摘要：给一个字符串数组，返回所有字符串的**公共前缀**；没有公共前缀就返回空字符串。
- 关键提示：别急着「两两求前缀再取交集」——那要写额外函数。
  换个方向：固定第 i 个字符位置，让**所有字符串排成一列**一起比较，
  一旦某个串长度不够或者字符不同就停。想想「停下来时应该返回的是什么片段」（用切片 `[:i]`）。
  还要想清楚：数组里只有一个字符串、或者有空字符串时会发生什么。
- 对应函数：`longest_common_prefix(strs)`
- 自查：`["flower","flow","flight"]` → `"fl"`；`["dog","racecar","car"]` → `""`；`["a"]` → `"a"`；`["","b"]` → `""`。

**变式 2 · LC 58 最后一个单词的长度（Easy）**

- 题面摘要：给一个字符串（可能含前导/尾随/多余空格），返回**最后一个单词**的长度；
  单词指不含空格的最大连续字符段。
- 关键提示：正着扫要处理开头空格、还要记住「上一个单词」；**倒着扫简单得多**——
  先把末尾的空格全部跳掉，再往前数非空格字符，撞到空格或字符串开头就停。
  注意循环条件里**两个条件都要写**（`i >= 0 and s[i] != " "`），只写一个就会越界或死循环。
  写成 `len(s.split()[-1])` 也能过，但要能解释 `split()` 为什么能吃掉多余空格。
- 对应函数：`length_of_last_word(s)`
- 自查：`"Hello World"` → `5`；`"   fly me   to   the moon  "` → `4`；`"a"` → `1`；`""` → `0`；`"     "` → `0`。

**变式 3 · LC 66 加一（Easy）**

- 题面摘要：`digits` 数组表示一个非负整数的各位数字（最高位在最前面），把它**加一**后返回。
- 关键提示：这就是模板 T4——从**最后一位**往前处理。分两种情况想：
  ① 某一位不是 9，加完就能立刻返回（这是绝大多数情况，所以提前返回很重要）；
  ② 这一位是 9，就变 0 并把进位交给前一位；如果每一位都进过位（比如 999），
  循环结束后还要在最前面插入一个 1（想一想用 `insert(0, 1)` 还是 `[1] + res`）。
  顺便练习「不修改调用方数组」：先 `res = digits[:]`。
- 对应函数：`plus_one(digits)`
- 自查：`[1,2,3]` → `[1,2,4]`；`[9]` → `[1,0]`；`[9,9,9]` → `[1,0,0,0]`。

```python
变式1
def longest_common_prefix(strs):
    if not strs:
        return ""

    # 以第一个字符串为基准，逐列比较
    for i in range(len(strs[0])):
        char = strs[0][i]
        for s in strs[1:]:
            # 情况1：s 长度不够（i 越界）
            # 情况2：s[i] 与基准字符不同
            if i >= len(s) or s[i] != char:
                return strs[0][:i]

    # 循环正常结束，说明第一个字符串就是公共前缀
    return strs[0]
```

```python
变式2
def length_of_last_word(s):
    i = len(s) - 1  # 指针 i 指向字符串最后一个字符
    length = 0  # 记录最后一个单词的长度

    # 第一步：从右往左，跳过所有尾部空格
    while i >= 0 and s[i] == " ":
        i -= 1  # 是空格，指针左移一格

    # 第二步：从右往左，数非空格字符
    while i >= 0 and s[i] != " ":
        length += 1  # 数到一个字符
        i -= 1  # 指针左移一格

    return length  # 返回单词长度
```

```python
变式3
def plus_one(digits):
    res = digits[:]  # 拷贝，不修改原数组

    for i in range(len(res) - 1, -1, -1):  # 从最后一位往前遍历
        if res[i] != 9:  # 情况①：不是 9
            res[i] += 1  # 直接加 1
            return res  # 提前返回
        else:  # 情况②：是 9
            res[i] = 0  # 变 0，进位继续

    return [1] + res  # 全都进位了，最前面补 1
```

