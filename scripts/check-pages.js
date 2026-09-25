/* global hexo */

/**
 * 构建后自检
 * ------------------------------------------------------------
 * 为什么需要它：
 * Hexo 处理某个文件失败时（最常见的是 front-matter 的 --- 被 Markdown
 * 格式化工具转义成了 \---，或开头多了 BOM / 空行），它只在日志里打一行
 * `ERROR Process failed: xxx.md`，**然后依然返回退出码 0**。
 * 结果：Cloudflare 显示「构建成功」，但那个页面被静默丢掉，
 * 线上要么 404，要么一直停留在旧内容。
 *
 * 这里做两层检查，任何一层不过就让构建以非 0 退出码失败：
 *   A. 拦截 Hexo 的 "Process failed" 错误日志（准确，覆盖所有文件）
 *   B. 检查 source 下的每个页面是否都注册了路由（兜底）
 *
 * 注意 A 必须用日志拦截而不是读 public/：after_generate 钩子执行时
 * 文件还没写到磁盘上。也不能只看路由：Fluid 主题自己会生成
 * /tags/ 和 /categories/ 页面，会把它们对应的处理失败掩盖掉。
 *
 * 由 Hexo 自动加载（项目根目录的 scripts/ 是 Hexo 的插件目录）。
 */

const fs = require('fs');
const path = require('path');

const ANSI = /\u001b\[[0-9;]*m/g;

// ---- A. 拦截 Hexo 的文件处理错误 ----
// Hexo 源码 lib/box/index.js：
//   ctx.log.error({ err }, 'Process failed: %s', magenta(path));
const processFailed = [];

const originalError = hexo.log.error;
hexo.log.error = function (...args) {
  if (args.some(a => typeof a === 'string' && a.includes('Process failed'))) {
    const last = args[args.length - 1];
    processFailed.push(String(last).replace(ANSI, '').trim());
  }
  return originalError.apply(hexo.log, args);
};

// ---- B. 生成后检查路由 ----
hexo.extend.filter.register('after_generate', function () {
  const srcDir = hexo.source_dir;
  const routes = new Set(hexo.route.list());
  const missing = [];

  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // _posts / _drafts 等以下划线开头的目录由 Hexo 自己管理，跳过
        if (entry.name.startsWith('_')) continue;
        walk(full);
        continue;
      }

      if (!entry.name.endsWith('.md')) continue;

      const rel = path.relative(srcDir, full).replace(/\\/g, '/');
      if (rel.startsWith('_') || rel.includes('/_')) continue;

      const expected = rel.replace(/\.md$/, '.html');
      if (!routes.has(expected)) missing.push({ src: rel, out: expected });
    }
  }

  walk(srcDir);

  if (processFailed.length === 0 && missing.length === 0) {
    hexo.log.info('[构建自检] 所有页面均已生成 ✓');
    return;
  }

  const lines = ['', '[构建自检失败] 构建有问题，已阻止部署。', ''];

  if (processFailed.length > 0) {
    lines.push('Hexo 处理这些文件时出错了（它们的内容不会出现在网站上）：');
    processFailed.forEach(f => lines.push(`  ✗ ${f}`));
    lines.push('');
  }

  if (missing.length > 0) {
    lines.push('这些源文件没有生成对应页面：');
    missing.forEach(m => lines.push(`  ✗ source/${m.src}  →  缺少 ${m.out}`));
    lines.push('');
  }

  lines.push(
    '最常见的原因：front-matter 的 --- 被破坏了',
    '  · 被 Markdown 格式化工具转义成 \\---（第 1 行变成三个字符：反斜杠 + 三横）',
    '  · 文件开头多了 UTF-8 BOM 或空行',
    '  · 用了 UTF-16 编码保存',
    '检查方法：确认文件第 1 行就是三个短横线，前面没有反斜杠、空格或 BOM。',
    ''
  );

  hexo.log.error(lines.join('\n'));

  // 让 npm run build / Cloudflare 构建真正失败，
  // 避免「显示构建成功、页面却被静默丢掉」
  process.exitCode = 1;
});