// ============================================================
//  Story.fun · 播放页「已上链」反链
//  当前播放的短剧/视频若对应发射台上的币，显示已上链徽标
// ============================================================
(function () {
  'use strict';

  function findCoinForTitle(title) {
    if (!title) return null;
    var raw = null;
    try { raw = localStorage.getItem('storyfun_launch_v1'); } catch (e) {}
    if (!raw) return null;
    var data = null;
    try { data = JSON.parse(raw); } catch (e) {}
    if (!data || !data.coins) return null;
    var norm = function (s) {
      return String(s || '')
        .replace(/《|》|「|」|短剧|·|／|\//g, '')
        .trim().toLowerCase();
    };
    var t = norm(title);
    if (!t) return null;
    for (var i = 0; i < data.coins.length; i++) {
      var c = data.coins[i];
      var src = norm(c.sourceTitle || '');
      var nm = norm(c.name || '');
      if ((src && (t.indexOf(src) !== -1 || src.indexOf(t) !== -1)) ||
          (nm && (t.indexOf(nm) !== -1 || nm.indexOf(t) !== -1))) {
        return c;
      }
    }
    return null;
  }

  function inject(coin) {
    var host = document.createElement('a');
    host.href = 'coin-detail.html?id=' + encodeURIComponent(coin.id);
    host.style.cssText =
      'position:fixed;top:70px;right:16px;z-index:999;display:inline-flex;align-items:center;gap:6px;' +
      'height:30px;padding:0 12px;border-radius:999px;background:rgba(255,255,255,.92);' +
      'border:1px solid rgba(10,11,13,.08);box-shadow:0 6px 20px rgba(16,24,40,.12);' +
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#0A0B0D;' +
      'font-size:12px;font-weight:700;text-decoration:none;';
    host.innerHTML = '💰 已上链 · $' + (coin.symbol || '').toUpperCase();
    document.body.appendChild(host);
  }

  function boot() {
    if (!/drama-player\.html/.test(location.pathname)) return;
    var title = new URLSearchParams(location.search).get('title') || '';
    var coin = findCoinForTitle(title);
    if (coin) inject(coin);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
