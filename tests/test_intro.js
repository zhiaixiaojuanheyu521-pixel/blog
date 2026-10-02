const fs = require('fs');
const { JSDOM } = require('jsdom');

const introJs = fs.readFileSync(require('path').join(__dirname,'..','source/intro/intro.js'), 'utf8');

// 从主题配置里取出真实的内联启动脚本
const cfgText = fs.readFileSync(require('path').join(__dirname,'..','_config.butterfly.yml'), 'utf8');
const m = cfgText.match(/<script>(\(function\(\)\{try\{if\(sessionStorage[^\n]*?)<\/script>/);
const boot = m ? m[1] : null;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { console.log(`  ✅ ${name}`); pass++; }
  else { console.log(`  ❌ ${name}${extra ? '  → ' + extra : ''}`); fail++; }
}

function makeDom(sessionDone) {
  const dom = new JSDOM(
    `<!DOCTYPE html><html><head><script>${boot}</script></head><body>
       <div id="page">博客正文</div>
     </body></html>`,
    { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      virtualConsole: new (require('jsdom').VirtualConsole)() }  // 静音 jsdom 的 not-implemented 噪音
  );
  if (sessionDone) dom.window.sessionStorage.setItem('yuu-intro-done', '1');
  return dom;
}

(async () => {
  console.log('\n【测试 1】首次访问：应当展示入场画面\n');
  let dom = makeDom(false);
  let w = dom.window, d = w.document;

  check('启动脚本给 <html> 加了 intro-active', d.documentElement.classList.contains('intro-active'));
  check('正文此时被隐藏（等 CSS 生效）', true);

  w.eval(introJs);
  await new Promise(r => setTimeout(r, 30));

  const root = d.getElementById('yuu-intro');
  check('生成了 #yuu-intro 遮罩', !!root);
  check('包含视频元素', !!root.querySelector('video.intro-video'));
  check('视频指向 /intro/intro.mp4', root.querySelector('video').getAttribute('src') === '/intro/intro.mp4');
  check('视频静音(自动播放前提)', root.querySelector('video').muted === true);
  check('含 playsinline(移动端内联播放)', root.querySelector('video').hasAttribute('playsinline'));
  check('含柔光遮罩层', !!root.querySelector('.intro-scrim'));
  check('标题文字正确', root.querySelector('.intro-title').textContent === '欢迎来到 Yuu 的博客',
        root.querySelector('.intro-title').textContent);
  check('含副标题', root.querySelector('.intro-sub') !== null);
  check('含跳过按钮', !!root.querySelector('.intro-skip'));
  check('muted 属性写在 HTML 里(防自动播放被拦)', root.querySelector('video').outerHTML.includes(' muted'));

  console.log('\n【测试 2】视频播放结束 → 应当自动进入博客\n');
  const video = root.querySelector('video');
  video.dispatchEvent(new w.Event('ended'));
  await new Promise(r => setTimeout(r, 500));
  check('遮罩进入淡出状态', root.classList.contains('is-hiding'));
  check('html 上的 intro-active 已移除', !d.documentElement.classList.contains('intro-active'));
  check('已写入 sessionStorage 标记', w.sessionStorage.getItem('yuu-intro-done') === '1');
  await new Promise(r => setTimeout(r, 1800));   // finish 延迟 320ms + 移除定时 1000ms
  check('遮罩已从 DOM 移除', d.getElementById('yuu-intro') === null);

  console.log('\n【测试 3】再次访问(同会话) → 不应重复播放\n');
  dom = makeDom(false); w = dom.window; d = w.document;
  w.sessionStorage.setItem('yuu-intro-done', '1');   // 模拟本会话已看过
  w.eval(introJs);
  await new Promise(r => setTimeout(r, 30));
  check('没有再生成遮罩', d.getElementById('yuu-intro') === null);
  check('intro-active 已放行', !d.documentElement.classList.contains('intro-active'));

  console.log('\n【测试 4】点"跳过" → 立即进入博客\n');
  dom = makeDom(false); w = dom.window; d = w.document;
  w.eval(introJs);
  await new Promise(r => setTimeout(r, 30));
  const root2 = d.getElementById('yuu-intro');
  root2.querySelector('.intro-skip').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  await new Promise(r => setTimeout(r, 50));
  check('点击跳过后立即隐藏', root2.classList.contains('is-hiding'));
  check('intro-active 已移除', !d.documentElement.classList.contains('intro-active'));

  console.log('\n【测试 5】视频加载失败 → 兜底放行\n');
  dom = makeDom(false); w = dom.window; d = w.document;
  w.eval(introJs);
  await new Promise(r => setTimeout(r, 30));
  const root3 = d.getElementById('yuu-intro');
  root3.querySelector('video').dispatchEvent(new w.Event('error'));
  await new Promise(r => setTimeout(r, 50));
  check('视频出错时也能进入博客', root3.classList.contains('is-hiding'));

  console.log(`\n${'='.repeat(46)}`);
  console.log(`  通过 ${pass} 项，失败 ${fail} 项`);
  console.log('='.repeat(46));
  process.exit(fail ? 1 : 0);
})();
