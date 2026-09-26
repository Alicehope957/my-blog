/*!
 * live2d-widget 命中精度增强（独立补丁，不改 autoload.js，也不改 CDN 上的 widget 代码）
 *
 * 解决的问题
 *   widget 的 Cubism 2 分支（cubism2/index.ts 里的 modelTurnHead / followPointer）把「整块画布」
 *   的归一化坐标直接当成命中判定喂给 hitTest。于是用 hit_areas_custom 时，指针落在画布空白区域
 *   也算"摸到模型" —— 划过会乱弹文案、点空白也会触发反应。
 *
 * 做法
 *   把画布当前帧缩到 96x96 采样 alpha，得到"模型剪影"；只有指针压在不透明像素上（含 3x3 邻域
 *   宽容）才放行事件：
 *     ① 空白处的 click 直接拦掉 → 不播动作、不弹文案（只影响 Cubism 2 分支；
 *        拉菲的点击走 pointerdown，不受影响）
 *     ② 空白处派发的 live2d:hoverbody 事件拦掉 → waifu-tips 不会弹文案（视线跟随照旧）
 *
 * 为什么必须在 autoload.js 之前加载
 *   live2d:hoverbody 是 dispatch 到 window 上的事件，目标阶段按注册顺序执行；
 *   只有先注册（capture）才能用 stopImmediatePropagation 拦住 waifu-tips.js 的提示。
 *   它不依赖 widget 是否已初始化：所有 DOM 访问都推迟到事件发生时才做。
 */
(function () {
  'use strict';

  var GRID = 96;        // 剪影缓存分辨率
  var REFRESH_MS = 150; // 重新采样间隔
  var ALPHA = 24;       // alpha 阈值：大于它才算"这里有模型像素"

  var cache = { canvas: null, ctx: null, data: null, at: 0 };
  var last = null;
  var hitLog = window.__hitLog = window.__hitLog || [];

  function refresh() {
    var c = document.getElementById('live2d');
    if (!c) return;
    if (!cache.canvas) {
      cache.canvas = document.createElement('canvas');
      cache.ctx = cache.canvas.getContext('2d', { willReadFrequently: true });
    }
    cache.canvas.width = GRID;
    cache.canvas.height = GRID;
    try {
      // widget 的 WebGL 上下文开了 preserveDrawingBuffer，所以这里能拿到最后一帧
      cache.ctx.drawImage(c, 0, 0, GRID, GRID);
      cache.data = cache.ctx.getImageData(0, 0, GRID, GRID).data;
      cache.at = performance.now();
    } catch (e) {
      cache.data = null; // 读不到像素就退回"整块画布"的老行为，不影响可用性
    }
  }

  function onModelPixel(x, y) {
    var c = document.getElementById('live2d');
    if (!c) return false;
    var r = c.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
    if (!cache.data || performance.now() - cache.at > REFRESH_MS) refresh();
    if (!cache.data) return true;
    var gx = Math.min(GRID - 1, Math.max(0, Math.floor((x - r.left) / r.width * GRID)));
    var gy = Math.min(GRID - 1, Math.max(0, Math.floor((y - r.top) / r.height * GRID)));
    for (var ox = -1; ox <= 1; ox++) {
      for (var oy = -1; oy <= 1; oy++) {
        var px = gx + ox, py = gy + oy;
        if (px < 0 || py < 0 || px >= GRID || py >= GRID) continue;
        if (cache.data[(py * GRID + px) * 4 + 3] > ALPHA) return true;
      }
    }
    return false;
  }

  document.addEventListener('mousemove', function (e) {
    last = { x: e.clientX, y: e.clientY };
  }, true);

  // ① 空白处的点击不再触发"摸她"
  document.addEventListener('click', function (e) {
    var c = document.getElementById('live2d');
    if (!c) return;
    if (!(e.target === c || (e.target.closest && e.target.closest('#live2d')))) return;
    var okClick = onModelPixel(e.clientX, e.clientY);
    hitLog.push(['click', okClick, Math.round(e.clientX), Math.round(e.clientY)]);
    if (okClick) return;
    e.stopImmediatePropagation();
    e.preventDefault();
  }, true);

  // ② 空白处的划过不再弹文案（只拦事件本身，视线跟随照旧）
  window.addEventListener('live2d:hoverbody', function (e) {
    var okHover = !!(last && onModelPixel(last.x, last.y));
    hitLog.push(['hover', okHover, last ? Math.round(last.x) : -1, last ? Math.round(last.y) : -1]);
    if (okHover) return;
    e.stopImmediatePropagation();
  }, true);

  window.__hitPrecisionLoaded = true;   // 供自动化测试确认本补丁已生效
})();