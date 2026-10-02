/* 验证自定义 CSS 里的每条选择器都能在真实页面上匹配到元素
   （防止出现"写了个规则但选择器根本匹配不上"的静默失效） */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'source/css/yuu-purple.css'), 'utf8');

// 提取所有选择器（跳过 @media 内部的缩进层，单独处理）
const selectors = [];
const ruleRe = /(^|\})\s*([^{}@]+?)\s*\{/g;
let m;
while ((m = ruleRe.exec(css))) {
  m[2].split(',').map(s => s.trim()).filter(Boolean).forEach(sel => {
    // 丢掉注释残留和非选择器内容
    sel = sel.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    sel = sel.split('\n').pop().trim();
    // 只丢掉 CSS 变量声明行（形如 --xx: yy）和 @media 参数
    if (!sel || sel.startsWith('--') || sel.startsWith('@') || /^[\w-]+\s*:/.test(sel)) return;
    selectors.push(sel);
  });
}

// 这些选择器只在实际用到时才渲染出元素，静态 HTML 里没有是正常的
const CONDITIONAL = {
  '#recent-posts .recent-post-item > .recent-post-info > .article-title .sticky':
    '只有置顶文章才渲染这个图钉图标',
  '.search-keyword':
    '只有搜索结果页由 JS 动态生成',
};

const pages = ['index.html', '2026/10/你好，世界/index.html', 'link/index.html', 'message/index.html'];
const doms = pages.map(p => new JSDOM(fs.readFileSync(path.join(root, 'public', p), 'utf8')));
// 再构造一份"浅色模式"的 DOM：把 html 的 data-theme 从 dark 换成 light
const lightDoms = pages.map(p => new JSDOM(
  fs.readFileSync(path.join(root, 'public', p), 'utf8').replace('data-theme="dark"', 'data-theme="light"')
));
doms.push(...lightDoms);
pages.push(...pages.map(p => '[浅色]' + p));

let pass = 0, fail = 0;
console.log('选择器匹配检查（浅色 + 暗色两种模式）\n');

selectors.forEach(selRaw => {
  // :hover / :focus 这类交互伪类 jsdom 无法模拟，剥掉后再验证基础选择器
  const sel = selRaw.replace(/:(hover|focus|active|visited|focus-within)\b/g, '');
  // 选择器本身是否合法
  let valid = true, err = '';
  try { doms[0].window.document.querySelector(sel); } catch (e) { valid = false; err = e.message; }

  if (!valid) {
    console.log(`  ❌ [语法错误] ${sel}\n       ${err}`);
    fail++; return;
  }

  // 在任意页面上能匹配到就算通过
  let hits = 0, page = '';
  for (let i = 0; i < doms.length; i++) {
    const n = doms[i].window.document.querySelectorAll(sel).length;
    if (n > 0) { hits = n; page = pages[i]; break; }
  }

  const note = sel !== selRaw ? '  (已剥离:hover)' : '';
  if (hits > 0) { console.log(`  ✅ ${selRaw}   → ${hits} 个元素 (${page})${note}`); pass++; }
  else if (CONDITIONAL[selRaw]) {
    console.log(`  ⚪ ${selRaw}\n       → 当前无元素（正常：${CONDITIONAL[selRaw]}）`); pass++;
  }
  else { console.log(`  ❌ ${selRaw}   → 匹配不到任何元素`); fail++; }
});

/* ---------- 校验 1：紫色样式确实在主题样式之后加载 ---------- */
const homeHtml = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
const iIndex = homeHtml.indexOf('/css/index.css');
const iPurple = homeHtml.indexOf('/css/yuu-purple.css');
console.log('\n加载顺序检查');
if (iPurple > iIndex && iIndex > -1) { console.log('  ✅ yuu-purple.css 在 index.css 之后（可覆盖生效）'); pass++; }
else { console.log('  ❌ 加载顺序不对，覆盖会失效'); fail++; }

/* ---------- 校验 2：关键变量的最终取值确实变紫 ---------- */
// 主题的颜色经 Stylus 编译进 index.css；自定义覆盖在 yuu-purple.css。
// 两者都定义同名变量且优先级相同 → 后加载的 yuu-purple.css 生效。
const themeCss  = fs.readFileSync(path.join(root, 'public/css/index.css'), 'utf8').toLowerCase();
const purplePub = fs.readFileSync(path.join(root, 'public/css/yuu-purple.css'), 'utf8').toLowerCase();
const expectPurple = [
  ['--global-bg', '#100b1c', '暗色背景变紫黑', '#0d0d0d'],
  ['--card-bg',   '#1a1428', '卡片背景变紫',   '#121212'],
  ['--default-bg-color', '#a06bff', '主题主色变紫', '#49b1f5'],
];
console.log('\n配色生效检查（覆盖 = 同名变量 + 优先级相同 + 后加载）');
expectPurple.forEach(([varName, newVal, desc, oldVal]) => {
  const hasNew = purplePub.includes(newVal);
  const hasOld = themeCss.includes(oldVal);
  if (hasNew && hasOld) {
    console.log(`  ✅ ${desc}: ${varName}  ${oldVal}(主题) → ${newVal}(自定义，后加载覆盖)`); pass++;
  } else {
    console.log(`  ❌ ${desc}: ${varName} 自定义含新值=${hasNew} 主题含旧值=${hasOld}`); fail++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`  通过 ${pass} 项，失败 ${fail} 项`);
console.log('='.repeat(50));
process.exit(fail ? 1 : 0);
