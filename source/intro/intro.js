/* ==========================================================
   Yuu 博客 · 入场画面逻辑
   由 _config.butterfly.yml 的 inject.bottom 引入
   ========================================================== */
(function () {
  'use strict';

  var html = document.documentElement;

  /* ---------- 可调参数 ---------- */
  var ONCE_PER_SESSION = true;   // true=每个会话只放一次；false=每次刷新都放
  var VIDEO_SRC        = '/intro/intro.mp4';
  var HARD_TIMEOUT     = 13000;  // 兜底：无论发生什么，13 秒后必定进入博客
  /* ------------------------------ */

  // 没加 intro-active 类（已看过 / 未启用），直接不做事
  if (!html.classList.contains('intro-active')) return;

  // 每个会话只放一次：已看过就放行
  try {
    if (ONCE_PER_SESSION && sessionStorage.getItem('yuu-intro-done')) {
      html.classList.remove('intro-active');
      return;
    }
  } catch (e) { /* 隐私模式下 sessionStorage 可能不可用，忽略 */ }

  // 系统开启了"减少动态效果"就不放，直接进博客
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.remove('intro-active');
      return;
    }
  } catch (e) {}

  /* ---------- 构建 DOM ---------- */
  var root = document.createElement('div');
  root.id = 'yuu-intro';
  root.setAttribute('role', 'presentation');
  root.innerHTML =
    '<video class="intro-video" src="' + VIDEO_SRC + '"' +
      ' muted playsinline preload="auto" webkit-playsinline disablepictureinpicture></video>' +
    '<div class="intro-scrim"></div>' +
    '<div class="intro-text">' +
      '<div class="intro-line"></div>' +
      '<h1 class="intro-title">欢迎来到 Yuu 的博客</h1>' +
      '<p class="intro-sub">记录技术与生活</p>' +
    '</div>' +
    '<button class="intro-skip" type="button" aria-label="跳过入场动画">跳过 ›</button>';

  (document.body || html).appendChild(root);

  var video = root.querySelector('.intro-video');
  var finished = false;

  // HTML 属性之外再显式设一次：部分浏览器/旧版内核对 muted 属性反射不可靠
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');

  /* ---------- 结束入场 ---------- */
  function finish() {
    if (finished) return;
    finished = true;

    try { sessionStorage.setItem('yuu-intro-done', '1'); } catch (e) {}

    root.classList.add('is-hiding');
    // 先恢复正文显示，再让遮罩淡出，衔接更自然
    html.classList.remove('intro-active');

    try { video.pause(); } catch (e) {}

    setTimeout(function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    }, 1000);
  }

  /* ---------- 触发条件 ---------- */
  video.addEventListener('ended', function () { setTimeout(finish, 320); });
  video.addEventListener('error', finish);          // 视频加载失败 → 直接放行
  video.addEventListener('stalled', function () { setTimeout(finish, 2500); });

  var skipBtn = root.querySelector('.intro-skip');
  skipBtn.addEventListener('click', function (e) { e.stopPropagation(); finish(); });
  root.addEventListener('click', finish);           // 点任意位置也能跳过
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') finish();
  });

  // 兜底定时器：视频卡住/自动播放被拦截时也能进站
  setTimeout(finish, HARD_TIMEOUT);

  /* ---------- 播放 ---------- */
  // 双保险：先 play()，被拦截也不影响文字展示与兜底计时
  var p = video.play();
  if (p && typeof p.catch === 'function') { p.catch(function () { /* 忽略 */ }); }
})();
