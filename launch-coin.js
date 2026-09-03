// ============================================================
//  Story.fun 发射台 · 数据与规则引擎（纯前端 mock 原型）
//  pons v2 语义：curve 阶段 → 毕业 → Uniswap 池
//  全部数值为演示 mock，集中在 CONFIG 中
// ============================================================

(function () {
  'use strict';

  // ============================================================
  //  CONFIG — 演示经济参数（集中可调）
  // ============================================================
  var CONFIG = {
    ETH_USD: 3200,            // 演示汇率 1 ETH = $3200
    totalSupply: 1000000000,  // 发行总量 10 亿
    curveK: 20,               // 毕业时价格 ≈ 初始价 × (1+20) = 21x
    feeRate: 0.01,            // 交易费 1%
    creatorShare: 0.70,       // 创作者分成 70%（协议 30%）
    launchFeeUsd: 1.6,        // 发行费 $1.6 ≈ 0.0005 ETH
    genFeeUsd: 64,            // AI 生成费 $64 ≈ 0.02 ETH
    gradThresholdUsd: 13440,  // 毕业池阈值 ≈ 4.2 ETH
    quick: [0.25, 0.5, 1]     // 快捷比例
  };
  var K = CONFIG;

  // ============================================================
  //  全局可用：余额 / 持仓 / 关注 / 通知 / 交易历史
  // ============================================================
  var USER = {
    id: 'u_' + (typeof currentUser !== 'undefined' && currentUser.id ? currentUser.id : 'demo'),
    eth: 2.5,                  // 可用 ETH（含已用？简化：可用）
    holdings: {},              // coinId -> {amount, avgUsd}
    created: [],               // 我创建的 coinId
    watch: [],                 // 关注列表
    claimable: {},             // coinId -> usd 可领取创作者收益
    claimed: {},               // coinId -> 已领取 usd
    tx: []                     // 我的交易历史
  };
  var STORE_KEY = 'storyfun_launch_v1';
  var SCHEMA_VERSION = 2;

  // ============================================================
  //  种子币（演示数据 12 个，覆盖全部状态）
  // ============================================================
  var now = Date.now();
  var D = function (h) { return now - h * 3600000; };

  function seedCoin(o) {
    var graduated = !!o.graduated;
    var gradT = o.gradThresholdUsd || K.gradThresholdUsd;
    var pool0 = o.poolUsd || 0;
    var prog0 = graduated ? 1 : clamp(pool0 / gradT, 0.05, 0.99);
    // 固定初始价：由种子价倒推（毕业币的 p0 视为毕业价基准，买卖在其附近波动）
    var p0 = graduated ? o.priceUsd : (o.priceUsd / (1 + K.curveK * prog0));
    var price = graduated ? o.priceUsd : (p0 * (1 + K.curveK * prog0));
    var marketCap = price * K.totalSupply;
    return {
      id: o.id,
      name: o.name,
      symbol: o.symbol,
      tagline: o.tagline,
      creator: o.creator,
      creatorAddr: o.creatorAddr,
      cover: o.cover,
      video: o.video || '',
      sourceType: o.sourceType || 'ai',   // ai | work
      sourceTitle: o.sourceTitle || '',
      supply: K.totalSupply,
      p0: p0,
      priceUsd: price,
      marketCap: marketCap,
      holders: o.holders,
      volumeUsd: o.volumeUsd,
      launchedAt: o.launchedAt,
      graduated: graduated,
      gradAt: o.gradAt || null,
      gradThresholdUsd: gradT,
      progress: prog0,                     // curve 池额比例（毕业=1）
      poolUsd: pool0,                      // curve/池 收集金额
      change24h: o.change24h,
      isNew: o.isNew || false,
      // 创建页扩展字段
      social: o.social || null,          // {x, tg}
      creatorTaxPct: o.creatorTaxPct || 0, // 每笔交易费中归创作者的比例(额外税)
      shareToHolders: !!o.shareToHolders,  // 是否将 creator 费分给持有者
      devBuyEth: o.devBuyEth || 0,       // 开发者预买（ETH）
      snipeExempts: o.snipeExempts || [],  // 狙击税豁免钱包列表
      // 演示静态 K 线（svg 折线用 0..1 归一化）
      spark: o.spark || [0.3, 0.4, 0.35, 0.5, 0.6, 0.55, 0.7, 0.8, 0.9]
    };
  }

  // 素材资源
  var IMG = {
    feng: 'image/fenggu_cover.jpg',
    cheng: 'image/chengxiangfu_cover.jpg',
    xie: 'image/xiejia_cover.jpg',
    allin: 'image/cover-allin.jpg',
    candle: 'image/cover-candle.jpg',
    names: 'image/cover-names.jpg',
    pyramid: 'image/cover-pyramid.jpg',
    survivor: 'image/cover-survivor.jpg',
    zero: 'image/cover-zero-night.jpg',
    hero: 'image/hero-bg-blur.jpg',
    poster: 'image/trailer-poster.jpg'
  };
  var VID = {
    feng: 'video/凤骨琉璃.mp4',
    cheng: 'video/丞相府今日开饭.mp4',
    fight: 'video/打斗视频.mp4',
    xie: 'video/我卸甲后天下大乱了.mp4'
  };

  var SEED = [
    seedCoin({
      id: 'c_feng', name: '凤骨琉璃', symbol: 'FENGGU', tagline: '琉璃易碎，凤骨不折。',
      creator: '林晚棠', creatorAddr: '0x7A2b…fD81', cover: IMG.feng, video: VID.feng, sourceType: 'work', sourceTitle: '短剧《凤骨琉璃》',
      priceUsd: 0.0009, holders: 2841, volumeUsd: 124000, launchedAt: D(52), graduated: false, progress: 0.94,
      poolUsd: 12650, change24h: 0.42, spark: [0.2, 0.35, 0.3, 0.45, 0.6, 0.72, 0.8, 0.94],
      social: { x: 'lintang_fenggu', tg: 'fenggu_official' },
      creatorTaxPct: 2,
    }),
    seedCoin({
      id: 'c_cheng', name: '丞相府今日开饭', symbol: 'XIANG', tagline: '天下粮仓，开饭为敬。',
      creator: '厨子老王', creatorAddr: '0x9F3c…aa12', cover: IMG.cheng, video: VID.cheng, sourceType: 'work', sourceTitle: '短剧《丞相府今日开饭》',
      priceUsd: 0.0021, holders: 5210, volumeUsd: 389000, launchedAt: D(120), graduated: true, gradAt: D(88),
      poolUsd: 61200, change24h: 0.68, spark: [0.1, 0.2, 0.5, 0.45, 0.7, 0.85, 0.9, 1]
    }),
    seedCoin({
      id: 'c_xie', name: '我卸甲后天下大乱了', symbol: 'XIEJIA', tagline: '卸甲归田，天下却需要我。',
      creator: '慕容战', creatorAddr: '0x1D8a…b40e', cover: IMG.xie, video: VID.xie, sourceType: 'work', sourceTitle: '短剧《我卸甲后天下大乱了》',
      priceUsd: 0.0014, holders: 1976, volumeUsd: 156000, launchedAt: D(30), graduated: false, progress: 0.71,
      poolUsd: 9660, change24h: -0.12, spark: [0.3, 0.5, 0.62, 0.55, 0.7, 0.66, 0.74, 0.71]
    }),
    seedCoin({
      id: 'c_mooncat', name: '月球打碟猫', symbol: 'MOONCAT', tagline: '一只穿西装的猫，在月球打碟。',
      creator: 'Astra', creatorAddr: '0xE45b…77c9', cover: IMG.zero, video: VID.fight, sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.000042, holders: 318, volumeUsd: 12000, launchedAt: D(3), graduated: false, progress: 0.12,
      poolUsd: 890, change24h: 2.31, isNew: true, spark: [0.4, 0.6, 0.5, 0.8, 0.7, 1],
      social: { x: 'mooncat_eth', tg: '' },
      creatorTaxPct: 1,
      shareToHolders: true,
    }),
    seedCoin({
      id: 'c_candle', name: '烛火与王冠', symbol: 'CANDLE', tagline: '在权力的烛光里，谁先燃尽。',
      creator: 'Sylvan', creatorAddr: '0xB20f…9e01', cover: IMG.candle, video: '', sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.0001, holders: 1206, volumeUsd: 22000, launchedAt: D(10), graduated: false, progress: 0.28,
      poolUsd: 2210, change24h: 0.05, spark: [0.3, 0.35, 0.4, 0.38, 0.45]
    }),
    seedCoin({
      id: 'c_survivor', name: '末日幸存指南', symbol: 'SURVIVE', tagline: '天亮之前，先活过今晚。',
      creator: 'Noah', creatorAddr: '0x57C9…f1a3', cover: IMG.survivor, video: '', sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.00018, holders: 2304, volumeUsd: 88000, launchedAt: D(40), graduated: true, gradAt: D(21),
      poolUsd: 15400, change24h: -0.24, spark: [0.3, 0.5, 0.8, 0.9, 0.7, 0.6, 0.62, 0.5],
      social: { x: 'noah_survive', tg: 'noah_bunker' },
      creatorTaxPct: 3,
    }),
    seedCoin({
      id: 'c_zero', name: '零点计划', symbol: 'ZERO', tagline: '世界重置前的最后一分钟。',
      creator: 'Kai', creatorAddr: '0x08eD…31b6', cover: IMG.zero, video: VID.xie, sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.00032, holders: 884, volumeUsd: 31200, launchedAt: D(2), graduated: false, progress: 0.06,
      poolUsd: 420, change24h: 0.84, isNew: true, spark: [0.5, 0.6, 0.55, 0.7]
    }),
    seedCoin({
      id: 'c_names', name: '无名者档案', symbol: 'NAMES', tagline: '名字被夺走的人，自己写回自己的名字。',
      creator: '白鹭', creatorAddr: '0x33A1…c8f0', cover: IMG.names, video: '', sourceType: 'work', sourceTitle: '短剧《无名者档案》',
      priceUsd: 0.00055, holders: 1732, volumeUsd: 67100, launchedAt: D(66), graduated: true, gradAt: D(49),
      poolUsd: 20300, change24h: 0.11, spark: [0.2, 0.3, 0.5, 0.55, 0.8, 0.75]
    }),
    seedCoin({
      id: 'c_pyramid', name: '金字塔之梦', symbol: 'PYRAMID', tagline: '梦境深处，法老仍在等待。',
      creator: 'Ramesh', creatorAddr: '0xF90C…d2e8', cover: IMG.pyramid, video: '', sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.000078, holders: 501, volumeUsd: 8900, launchedAt: D(1), graduated: false, progress: 0.03,
      poolUsd: 190, change24h: 0.15, isNew: true, spark: [0.4, 0.45]
    }),
    seedCoin({
      id: 'c_hero', name: '孤胆英雄传', symbol: 'HERO', tagline: '无人记得的名字，撑起整座城。',
      creator: '陈破晓', creatorAddr: '0x6E2b…a4d7', cover: IMG.hero, video: VID.fight, sourceType: 'work', sourceTitle: '短剧《孤胆英雄传》',
      priceUsd: 0.00041, holders: 958, volumeUsd: 24000, launchedAt: D(18), graduated: false, progress: 0.42,
      poolUsd: 4800, change24h: -0.08, spark: [0.4, 0.6, 0.5, 0.55, 0.48, 0.45]
    })
  ];

  // ============================================================
  //  存储
  // ============================================================
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) { var s = JSON.parse(raw); if (s && s.user) return s; }
    } catch (e) {}
    return null;
  }
  var persisted = load();
  // 版本一致才恢复 coins（避免旧缓存种子缺新字段）；user 始终恢复
  if (persisted) {
    USER = persisted.user;
    if (persisted.v === SCHEMA_VERSION && Array.isArray(persisted.coins) && persisted.coins.length) {
      SEED = persisted.coins;
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ v: SCHEMA_VERSION, user: USER, coins: SEED }));
    } catch (e) {}
  }
  // 登录态联动：auth.js 若已登录，保持同一 userId（演示简化，不强制）
  function syncUser() {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.id) {
      USER.id = 'u_' + currentUser.id;
    }
  }
  syncUser();
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('auth-ready', syncUser);
  }

  // ============================================================
  //  工具
  // ============================================================
  function coinById(id) {
    for (var i = 0; i < SEED.length; i++) if (SEED[i].id === id) return SEED[i];
    return null;
  }
  function fmtPrice(u) {
    if (u == null || isNaN(u)) return '—';
    if (u >= 1) return '$' + u.toFixed(2);
    if (u >= 0.01) return '$' + u.toFixed(3);
    if (u >= 0.0001) return '$' + u.toFixed(6);
    // 极小价格：固定 10 位小数并去掉尾零
    var s = u.toFixed(10).replace(/0+$/, '');
    if (s.charAt(s.length - 1) === '.') s = s.slice(0, -1);
    return '$' + s;
  }
  function fmtUsd(u) {
    if (u == null) return '—';
    if (u >= 1000000) return '$' + (u / 1000000).toFixed(1) + 'M';
    if (u >= 1000) return '$' + (u / 1000).toFixed(1) + 'K';
    if (u >= 1) return '$' + u.toFixed(2);
    return '$' + u.toFixed(2);
  }
  function fmtNum(n) {
    if (n == null) return '—';
    return n.toLocaleString('en-US');
  }
  function fmtEth(eth) { return eth.toFixed(4) + ' ETH'; }
  function pct(n) {
    var p = (n * 100);
    return (p >= 0 ? '+' : '') + (p >= 10 || p <= -10 ? p.toFixed(0) : p.toFixed(1)) + '%';
  }
  function timeAgo(ts) {
    var s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return s + 's';
    var m = Math.floor(s / 60); if (m < 60) return m + 'm';
    var h = Math.floor(m / 60); if (h < 24) return h + 'h';
    var d = Math.floor(h / 24); return d + 'd';
  }
  function shortAddr(a) { return a || '—'; }
  function usdToEth(u) { return u / K.ETH_USD; }
  function ethToUsd(e) { return e * K.ETH_USD; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  // 涨跌色
  function dirClass(n) { return n >= 0 ? 'up' : 'down'; }
  function dirSign(n) { return n >= 0 ? '+' : '-'; }

  // ============================================================
  //  Toast（自绘，无浏览器弹窗）
  // ============================================================
  var toastTimer = null;
  function toast(msg, type) {
    type = type || 'ok'; // ok | err | warn
    var host = document.getElementById('launch-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'launch-toast-host';
      host.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.style.cssText =
      'min-width:220px;max-width:420px;padding:12px 18px;border-radius:14px;background:#0A0B0D;color:#fff;' +
      'font-size:13px;font-weight:500;line-height:1.5;box-shadow:0 10px 30px rgba(0,0,0,.18);' +
      'opacity:0;transform:translateY(-8px);transition:all .25s ease;text-align:center;';
    if (type === 'err') el.style.background = '#1C1012';
    if (type === 'warn') el.style.background = '#1A1608';
    el.textContent = msg;
    host.appendChild(el);
    requestAnimationFrame(function () { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    setTimeout(function () {
      el.style.opacity = '0'; el.style.transform = 'translateY(-8px)';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, 2600);
  }

  // ============================================================
  //  Curve / 价格规则引擎
  //  简化 AMM：价格随池内资金单调上升（买入推价、卖出压价）
  //  progress ≈ 池额/毕业阈值，price = p0 × (1 + K × progress)
  // ============================================================
  function progressOf(coin) {
    if (coin.graduated) return 1;
    var t = coin.gradThresholdUsd || K.gradThresholdUsd;
    return clamp((coin.poolUsd || 0) / t, 0.001, 1);
  }
  function priceAt(coin) {
    if (coin.graduated) return coin.priceUsd; // 毕业后按池现价
    var p0 = coin.p0 || (coin.priceUsd / (1 + K.curveK * progressOf(coin)));
    return p0 * (1 + K.curveK * progressOf(coin));
  }
  // 毕业时的理论价格（curve 售罄）
  function priceAtGraduation(coin) {
    if (coin.graduated) return coin.priceUsd;
    var p0 = coin.p0 || (coin.priceUsd / (1 + K.curveK * progressOf(coin)));
    return p0 * (1 + K.curveK);
  }
  // 买入：ethInUsd → 获得币数，推进池额
  function buy(coinId, ethInUsd) {
    var c = coinById(coinId);
    if (!c) return { ok: false, msg: '币不存在' };
    if (c.graduated) return { ok: false, msg: '已毕业，请在池中交易' };
    if (ethInUsd <= 0) return { ok: false, msg: '金额无效' };
    var fee = ethInUsd * K.feeRate;
    var net = ethInUsd - fee;
    var pNow = priceAt(c);
    var p0 = c.p0 || (pNow / (1 + K.curveK * progressOf(c)));
    var poolAfter = (c.poolUsd || 0) + net;
    var pAfter = p0 * (1 + K.curveK * clamp(poolAfter / (c.gradThresholdUsd || K.gradThresholdUsd), 0.001, 1));
    var avgP = (pNow + pAfter) / 2;
    var coins = net / Math.max(avgP, 1e-12);
    // 更新
    c.poolUsd = poolAfter;
    c.progress = progressOf(c);
    c.priceUsd = priceAt(c);
    c.marketCap = c.priceUsd * c.supply;
    c.volumeUsd = (c.volumeUsd || 0) + net;
    c.holders = (c.holders || 1) + Math.floor(Math.random() * 2);
    if (typeof c.spark === 'undefined') c.spark = [];
    c.spark.push(c.progress);
    if (c.spark.length > 40) c.spark.shift();
    // 费用：creator 与 protocol
    addFee(c, fee);
    addTx(c, 'buy', ethInUsd, net, coins, '我');
    // 毕业检测
    var grad = tryGraduate(c);
    persist();
    return { ok: true, coins: coins, fee: fee, net: net, avgP: avgP, graduated: grad, impact: net / Math.max((c.poolUsd - net) || 100, 100) };
  }
  // 卖出：卖出 coins → 得到 usd
  function sell(coinId, coins) {
    var c = coinById(coinId);
    if (!c) return { ok: false, msg: '币不存在' };
    if (c.graduated) return { ok: false, msg: '已毕业，请在池中交易' };
    var h = USER.holdings[coinId];
    if (!h || h.amount < 1) return { ok: false, msg: '无持仓' };
    if (coins > h.amount) coins = h.amount;
    var pNow = priceAt(c);
    var p0 = c.p0 || (pNow / (1 + K.curveK * progressOf(c)));
    var gross = coins * pNow;
    if (gross > (c.poolUsd || 0)) { // 不能取走超过池内资金（防归零超卖）
      coins = (c.poolUsd || 0) / pNow;
      gross = coins * pNow;
    }
    var fee = gross * K.feeRate;
    var net = gross - fee;
    // 更新
    c.poolUsd = Math.max(0, (c.poolUsd || 0) - gross);
    c.progress = progressOf(c);
    c.priceUsd = priceAt(c);
    c.marketCap = c.priceUsd * c.supply;
    if (typeof c.spark === 'undefined') c.spark = [];
    c.spark.push(c.progress);
    if (c.spark.length > 40) c.spark.shift();
    h.amount -= coins;
    if (h.amount < 0.000001) delete USER.holdings[coinId];
    addFee(c, fee);
    addTx(c, 'sell', gross, net, coins, '我');
    persist();
    return { ok: true, proceedsUsd: net, fee: fee, coins: coins };
  }
  function addFee(coin, feeUsd) {
    if (USER.created.indexOf(coin.id) !== -1) {
      // 创作者税（创建页设置的额外比例）归创作者；若开启共享则进入持有者分红池
      var taxShare = coin.creatorTaxPct ? (feeUsd * 0.01 * coin.creatorTaxPct) : 0;
      var baseShare = feeUsd * K.creatorShare;
      if (coin.shareToHolders) {
        // 共享模式：基础分成与税均进入持有者分红（原型从简：计入 claimable，由"持有者"身份领取演示）
        USER.claimable[coin.id] = (USER.claimable[coin.id] || 0) + baseShare * 0.5 + taxShare;
      } else {
        USER.claimable[coin.id] = (USER.claimable[coin.id] || 0) + baseShare + taxShare;
      }
    }
    // 协议侧（buyback）— 演示不展开
  }
  function addTx(coin, side, grossUsd, netUsd, amount, who) {
    USER.tx.unshift({
      at: Date.now(), coinId: coin.id, symbol: coin.symbol, side: side,
      grossUsd: grossUsd, netUsd: netUsd, amount: amount, who: who
    });
    if (USER.tx.length > 60) USER.tx.pop();
  }
  function tryGraduate(coin) {
    if (coin.graduated) return false;
    var threshold = coin.gradThresholdUsd || K.gradThresholdUsd;
    if ((coin.poolUsd || 0) >= threshold || coin.progress >= 1) {
      coin.graduated = true;
      coin.gradAt = Date.now();
      coin.progress = 1;
      coin.poolUsd = Math.max(coin.poolUsd || 0, threshold);
      return true;
    }
    return false;
  }

  // 交易（毕业池内：按现价成交 + 轻微随机波动模拟自由市场）
  function tradePool(coinId, side, ethUsd) {
    var c = coinById(coinId);
    if (!c) return { ok: false, msg: '币不存在' };
    var fee = ethUsd * K.feeRate;
    var net = ethUsd - fee;
    var coins = net / Math.max(c.priceUsd, 1e-9);
    // 价格微幅波动（方向偏向成交方向 + 噪声）
    var dir = side === 'buy' ? 1 : -1;
    var wiggle = dir * (0.004 + Math.random() * 0.02);
    c.priceUsd = Math.max(c.priceUsd * (1 + wiggle), 1e-10);
    c.marketCap = c.priceUsd * c.supply;
    c.volumeUsd = (c.volumeUsd || 0) + net;
    c.holders = (c.holders || 1) + Math.floor(Math.random() * 2);
    if (typeof c.spark === 'undefined') c.spark = [];
    c.spark.push(1);
    if (c.spark.length > 40) c.spark.shift();
    if (side === 'buy') {
      addFee(c, fee);
      addTx(c, 'buy', ethUsd, net, coins, '我');
    } else {
      addFee(c, fee);
      addTx(c, 'sell', ethUsd, net, coins, '我');
    }
    persist();
    return { ok: true, coins: coins, fee: fee, proceedsUsd: net };
  }

  // 买入/卖出的入口：ETH ↔ USD → 扣/加余额
  function swap(coinId, side, ethIn) {
    if (!isLoggedIn()) return { ok: false, msg: 'need_login' };
    if (ethIn <= 0) return { ok: false, msg: '金额无效' };
    var usd = ethToUsd(ethIn);
    var c = coinById(coinId);
    if (!c) return { ok: false, msg: '币不存在' };
    var fee = usd * K.feeRate;
    var net = usd - fee;
    if (side === 'buy') {
      if (USER.eth < ethIn) return { ok: false, msg: 'ETH 余额不足' };
      var r = c.graduated ? tradePool(coinId, 'buy', usd) : buy(coinId, usd);
      if (r.ok) {
        USER.eth -= ethIn;
        var h = USER.holdings[coinId] || { amount: 0, avgUsd: 0 };
        var totalAmt = h.amount + r.coins;
        h.avgUsd = (h.avgUsd * h.amount + net) / totalAmt;
        h.amount = totalAmt;
        USER.holdings[coinId] = h;
        persist();
      }
      return r;
    } else {
      // 卖出：传币数 = usd 按现价折算
      var coinsToSell = usd / Math.max(c.priceUsd, 1e-9);
      var h = USER.holdings[coinId];
      if (!h || h.amount < coinsToSell) coinsToSell = h ? h.amount : 0;
      if (coinsToSell <= 0) return { ok: false, msg: '无持仓' };
      var r2 = c.graduated ? tradePool(coinId, 'sell', coinsToSell * c.priceUsd) : sell(coinId, coinsToSell);
      if (r2.ok) {
        USER.eth += usdToEth(r2.proceedsUsd || (coinsToSell * c.priceUsd - fee));
        persist();
      }
      return r2;
    }
  }

  // 创建币
  function createCoin(data) {
    var id = 'c_' + Math.random().toString(36).slice(2, 9);
    var coin = seedCoin({
      id: id, name: data.name, symbol: (data.symbol || '').toUpperCase(),
      tagline: data.tagline || '', creator: data.creator || currentUserName(),
      creatorAddr: '0x' + Math.random().toString(16).slice(2, 6) + '…' + Math.random().toString(16).slice(2, 6),
      cover: data.cover || IMG.hero, video: data.video || '',
      sourceType: data.sourceType || 'ai', sourceTitle: data.sourceTitle || '',
      priceUsd: data.priceUsd || 0.0001, holders: 1, volumeUsd: 0,
      launchedAt: Date.now(), graduated: false, progress: 0.001, poolUsd: 0,
      change24h: 0, isNew: true, spark: [0.05],
      social: data.social || null,
      creatorTaxPct: data.creatorTaxPct || 0,
      shareToHolders: !!data.shareToHolders,
      devBuyEth: data.devBuyEth || 0,
      snipeExempts: data.snipeExempts || []
    });
    // 发行费
    USER.eth -= usdToEth(K.launchFeeUsd + (data.sourceType === 'ai' ? K.genFeeUsd : 0));
    SEED.unshift(coin);
    USER.created.unshift(id);
    persist();
    return coin;
  }
  function currentUserName() {
    if (typeof currentUser !== 'undefined' && currentUser && currentUser.name) return currentUser.name;
    return '创作者';
  }
  function isLoggedIn() {
    return typeof currentUser !== 'undefined' && currentUser && currentUser.isLoggedIn;
  }
  // 领取创作者收益
  function claim(coinId) {
    var v = USER.claimable[coinId] || 0;
    if (v <= 0) return { ok: false, msg: '暂无可领取收益' };
    USER.eth += usdToEth(v);
    USER.claimed[coinId] = (USER.claimed[coinId] || 0) + v;
    USER.claimable[coinId] = 0;
    persist();
    return { ok: true, usd: v };
  }

  // 关注 / 通知
  function toggleWatch(coinId) {
    var i = USER.watch.indexOf(coinId);
    if (i >= 0) USER.watch.splice(i, 1); else USER.watch.unshift(coinId);
    persist();
    return i < 0;
  }
  var notifications = [];
  function notifyGraduated(coin) {
    if (!coin) return;
    notifications.unshift({ at: Date.now(), kind: 'grad', coinId: coin.id, symbol: coin.symbol });
    if (notifications.length > 20) notifications.pop();
    persist();
  }
  function notifyBigTrade(coin, usd) {
    notifications.unshift({ at: Date.now(), kind: 'trade', coinId: coin.id, symbol: coin.symbol, usd: usd });
    if (notifications.length > 20) notifications.pop();
    persist();
  }

  // ============================================================
  //  Debug 面板辅助
  // ============================================================
  function setEth(v) { USER.eth = v; persist(); }
  function forceGraduate(id) { var c = coinById(id); if (!c) return false; c.graduated = true; c.progress = 1; c.gradAt = Date.now(); c.poolUsd = Math.max(c.poolUsd||0, c.gradThresholdUsd||K.gradThresholdUsd); notifyGraduated(c); persist(); return true; }
  function forceUngraduate(id) { var c = coinById(id); if (!c) return false; c.graduated = false; c.progress = 0.5; c.gradAt = null; persist(); return true; }
  function resetAll() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    location.reload();
  }
  function watchNotifCount() { return notifications.length; }

  // ============================================================
  //  暴露 API
  // ============================================================
  window.Launch = {
    CONFIG: K,
    USER: USER,
    coins: SEED,
    coinById: coinById,
    fmtPrice: fmtPrice, fmtUsd: fmtUsd, fmtNum: fmtNum, fmtEth: fmtEth,
    pct: pct, timeAgo: timeAgo, shortAddr: shortAddr,
    usdToEth: usdToEth, ethToUsd: ethToUsd,
    dirClass: dirClass, dirSign: dirSign,
    toast: toast,
    priceAt: priceAt,
    priceAtGraduation: priceAtGraduation,
    swap: swap,
    createCoin: createCoin,
    claim: claim,
    toggleWatch: toggleWatch,
    isLoggedIn: isLoggedIn,
    currentUserName: currentUserName,
    buy: buy, sell: sell, tradePool: tradePool,
    tryGraduate: tryGraduate,
    notifyGraduated: notifyGraduated,
    notifyBigTrade: notifyBigTrade,
    notifications: notifications,
    watchNotifCount: watchNotifCount,
    persist: persist,
    // debug
    debug: { setEth: setEth, forceGraduate: forceGraduate, forceUngraduate: forceUngraduate, resetAll: resetAll }
  };
  window.__sf_launch = { toast: toast }; // 兼容老引用
})();
