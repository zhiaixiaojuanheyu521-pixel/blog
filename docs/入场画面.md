# 入场画面

打开博客时全屏播放的一段开场动画，中间显示「欢迎来到 Yuu 的博客」。

## 文件

| 文件 | 作用 |
| --- | --- |
| `intro.mp4` | 入场视频 |
| `intro.css` | 样式（含遮罩、动画） |
| `intro.js` | 播放、淡出、跳过等逻辑 |

三者通过 `_config.butterfly.yml` 的 `inject` 注入到每个页面：

```yaml
inject:
  head:
    - "<script>…</script>"          # 提前锁屏，防止正文闪一下
    - '<link rel="stylesheet" href="/intro/intro.css">'
  bottom:
    - '<script src="/intro/intro.js" defer></script>'
```

## 视频规格

- 原始素材：1280×720 / 30fps / HEVC，9.7 秒，406 KB
- 已转码为 **H.264**（HEVC 在 Chrome 里多数放不出来）
- 已**去除音轨**（浏览器只允许静音视频自动播放）
- 已开启 **faststart**（moov 原子前置，可边下边播）
- 最终 626 KB

重新转码命令：

```bash
ffmpeg -i 原视频.mp4 -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 28 -preset slow -movflags +faststart -an intro.mp4
```

## 可调参数

改 `intro.js` 顶部：

```js
var ONCE_PER_SESSION = true;   // false = 每次刷新都播放
var HARD_TIMEOUT     = 13000;  // 兜底放行时间（毫秒）
```

改文案：`intro.js` 里的 `.intro-title` / `.intro-sub`。

## 配色为什么这么定

视频末尾会亮到淡紫灰（`#928BA0`，亮度中位数 145）。
**纯白字在这种背景上对比度只有 3.1:1，不够用。**

所以文字下方加了一层"横贯屏幕的暗带"遮罩（`intro-scrim`）。
注意必须是**横向的**：文字是横向铺开的，用径向椭圆遮罩左右两端会保护不到，
实测最差处只有 1.0:1（等于隐形）。

`alpha = 0.62` 是对全片逐帧用 WCAG 公式算出来的：
文字区最差对比度 **5.16:1**，高于 AA 标准 4.5:1，且这还没算 text-shadow 的深色光晕。

文字色 `#F6F3FC` 是带一点紫的近白，和背景淡紫同色系；
最外层还叠了一圈紫色光晕 `rgba(150,110,240,.40)`，呼应站点的紫蓝主题。

## 测试

```bash
npm install --no-save jsdom   # 首次需要
node tests/test_intro.js
```

覆盖：首次访问展示、播放结束自动进站、同会话不重复、点击跳过、视频加载失败兜底。
