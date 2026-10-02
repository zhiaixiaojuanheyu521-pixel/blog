/* 把 Cloudflare Pages 需要的配置文件复制进构建产物。
 *
 * 为什么不写成 Hexo 插件：实测 Hexo 的 after_generate 钩子触发时
 * public/ 目录还没创建，copyFileSync 会报 ENOENT。
 * 所以放在 hexo generate 之后的独立脚本里跑（见 package.json 的 build）。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public');
const FILES = ['_headers', '_redirects'];

if (!fs.existsSync(outDir)) {
  console.error('❌ public/ 不存在，hexo generate 可能失败了');
  process.exit(1);
}

let copied = 0;
for (const name of FILES) {
  const src = path.join(root, name);
  if (!fs.existsSync(src)) continue;
  fs.copyFileSync(src, path.join(outDir, name));
  console.log(`✅ 已复制 ${name} → public/`);
  copied++;
}
console.log(`Cloudflare Pages 配置：复制了 ${copied} 个文件`);
