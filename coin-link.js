// ============================================================
//  Story.fun · 播放/详情页「已上链」浮标（可复用组件）
//  当前短剧/视频若对应发射台上的币，右上角显示一枚精致卡片：
//  [封面] $SYMBOL · 市值 MC
//  使用前可在页面设置 window.CoinLinkCfg 覆盖：
//    CoinLinkCfg = { pages: [/drama-player\.html/], top: 70, right: 16 }
// ============================================================
(function () {
  'use strict';

  function cfg() {
    return (typeof window !== 'undefined' && window.CoinLinkCfg) || {};
  }

  function shouldRun(pathname) {
    var pages = cfg().pages;
    if (pages && pages.length) {
      return pages.some(function (rx) {
        try { return rx.test(pathname); } catch (e) { return false; }
      });
    }
    // 默认：播放页
    return /drama-player\.html/.test(pathname);
  }

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

  function fmtMcap(u) {
    var n = Number(u) || 0;
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  }

  function inject(coin) {
    var C = cfg();
    var top = C.top != null ? C.top : 76;
    var right = C.right != null ? C.right : 18;

    // 图片兜底：无封面时显示首字母色块
    var thumb = coin.cover
      ? '<img class="cl-img" src="' + coin.cover.replace(/"/g, '&quot;') + '" alt="" />'
      : '<span class="cl-fallback">' + String((coin.symbol || '?')).charAt(0).toUpperCase() + '</span>';

    var host = document.createElement('a');
    host.className = 'cl-badge';
    host.href = 'coin-detail.html?id=' + encodeURIComponent(coin.id);
    host.setAttribute('aria-label', '查看代币 ' + coin.symbol);
    host.innerHTML =
      '<span class="cl-thumb">' + thumb + '</span>' +
      '<span class="cl-copy">' +
        '<strong class="cl-sym">$' + String(coin.symbol || '').toUpperCase() + '</strong>' +
        '<small class="cl-mc num">' + fmtMcap(coin.marketCap != null ? coin.marketCap : coin.fdv) + ' MC</small>' +
      '</span>' +
      '<span class="cl-arrow">' +
        '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h7v7"/><path d="M13 3 4.5 11.5"/></svg>' +
      '</span>';

    var st = document.createElement('style');
    st.id = 'coinlink-styles';
    if (!document.getElementById('coinlink-styles')) {
      st.textContent = '' +
        '.cl-badge{position:fixed;top:' + top + 'px;right:' + right + 'px;z-index:1200;display:inline-flex;align-items:center;gap:9px;' +
          'height:46px;padding:0 12px 0 6px;border-radius:999px;text-decoration:none;color:#0A0B0D;' +
          'background:rgba(255,255,255,.92);border:1px solid rgba(10,11,13,.08);box-shadow:0 8px 24px rgba(16,24,40,.14);' +
          'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
          'opacity:0;transform:translateY(-6px);transition:opacity .25s ease,transform .25s ease,box-shadow .2s ease}' +
        '.cl-badge:hover{box-shadow:0 10px 30px rgba(16,24,40,.2);transform:translateY(-1px)}' +
        '.cl-badge.cl-in{opacity:1;transform:translateY(0)}' +
        '.cl-thumb{width:34px;height:34px;border-radius:50%;overflow:hidden;flex-shrink:0;display:grid;place-items:center;' +
          'background:linear-gradient(135deg,#F3F0FF,#E7F6EF);border:1px solid rgba(10,11,13,.06)}' +
        '.cl-img{width:100%;height:100%;object-fit:cover;display:block}' +
        '.cl-fallback{font-size:15px;font-weight:800;color:#0A0B0D}' +
        '.cl-copy{display:flex;flex-direction:column;line-height:1.15;min-width:0}' +
        '.cl-sym{font-size:13.5px;font-weight:800;letter-spacing:-.01em;white-space:nowrap}' +
        '.cl-mc{font-size:11px;color:rgba(10,11,13,.55);font-weight:600;margin-top:2px;white-space:nowrap}' +
        '.cl-arrow{color:rgba(10,11,13,.35);display:inline-flex;align-items:center;flex-shrink:0;transition:color .15s,transform .15s}' +
        '.cl-badge:hover .cl-arrow{color:#0A0B0D;transform:translate(2px,-2px)}' +
        '@media(max-width:640px){.cl-badge{top:14px;right:12px}}';
      document.head.appendChild(st);
    }

    document.body.appendChild(host);
    // 入场
    requestAnimationFrame(function () { host.classList.add('cl-in'); });
  }

  function boot() {
    if (typeof document === 'undefined' || !shouldRun(location.pathname)) return;
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
