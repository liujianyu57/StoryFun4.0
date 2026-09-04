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
    tx: [],                    // 我的交易历史
    realizedPnl: 0,            // 账户级已实现盈亏（USD，卖出时结算）
    realizedByCoin: {}         // coinId -> 已实现盈亏（USD）
  };
  var STORE_KEY = 'storyfun_launch_v1';
  var SCHEMA_VERSION = 13;

  // ============================================================
  //  配对资产（quote）：ETH + 股票代币
  //  顺序必须与市场 Pair 筛选按钮一致（launchpad 动态注入同一列表）
  // ============================================================
  var PAIR_STOCKS = ['AAPL','AMD','AMZN','BB','COIN','COST','CRCL','DELL','DJT','FIG','GLD','GME','GOOGL','HIMS','JNJ','LLY','LULU','META','MRNA','MRVL','MSFT','MSTR','MU','NVDA','PFE','PLTR','QQQ','RBLX','RDDT','RIVN','SKHY','SNAP','SNDK','SPCX','SPY','TSLA','TSM','TTWO','USO','WYFI'];
  // 演示美元价（≈真实价位）：用于毕业阈值换算 / 演示钱包余额与水龙头
  var ASSET_PRICES = {
    ETH: 3200, AAPL: 210, AMD: 160, AMZN: 205, BB: 4.2, COIN: 265, COST: 940,
    CRCL: 150, DELL: 130, DJT: 30, FIG: 95, GLD: 255, GME: 26, GOOGL: 192,
    HIMS: 62, JNJ: 148, LLY: 820, LULU: 245, META: 555, MRNA: 42, MRVL: 108,
    MSFT: 462, MSTR: 420, MU: 132, NVDA: 175, PFE: 27, PLTR: 118, QQQ: 470,
    RBLX: 78, RDDT: 245, RIVN: 21, SKHY: 145, SNAP: 12, SNDK: 128, SPCX: 340,
    SPY: 560, TSLA: 350, TSM: 195, TTWO: 152, USO: 88, WYFI: 34
  };
  var ALL_PAIRS = ['ETH'].concat(PAIR_STOCKS);
  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  // 确定性随机配对：同一 id 永远得到同一 pair（演示数据稳定）
  // ETH 判定与股票取模互质（%7 与 %40）→ 40 个股票桶均会被覆盖，筛选不会出现空桶
  function pairOf(id) {
    var h = hashStr(id || '');
    if (h % 7 === 0) return 'ETH';
    return PAIR_STOCKS[Math.floor(h / 7) % PAIR_STOCKS.length];
  }

  // ============================================================
  //  种子币（演示数据 12 个，覆盖全部状态）
  // ============================================================
  var now = Date.now();
  var D = function (h) { return now - h * 3600000; };

  function seedCoin(o) {
    var graduated = !!o.graduated;
    var gradT = o.gradThresholdUsd || K.gradThresholdUsd;
    var pool0 = o.poolUsd || 0;
    var prog0 = graduated ? 1 : clamp(pool0 / gradT, 0.01, 0.99); // 下限 1%（与详情页/模拟引擎一致，避免模拟买入时进度“倒退”）
    // 固定初始价：由种子价倒推（毕业币的 p0 视为毕业价基准，买卖在其附近波动）
    var p0 = graduated ? o.priceUsd : (o.priceUsd / (1 + K.curveK * prog0));
    var price = graduated ? o.priceUsd : (p0 * (1 + K.curveK * prog0));
    // 锁仓：部分币有一定比例供应锁定/预留 → FDV > MC；流通供应 = 总量 × (1−lockedPct)
    var lockedPct = o.lockedPct || 0;
    var circulating = K.totalSupply * (1 - lockedPct);
    var fdv = price * K.totalSupply;          // 总市值（完全稀释）
    var marketCap = price * circulating;      // 流通市值 MC
    return {
      id: o.id,
      name: o.name,
      symbol: o.symbol,
      tagline: o.tagline,
      creator: o.creator,
      creatorAddr: o.creatorAddr,
      creatorWallet: o.creatorWallet || '',   // 高级设置：创作者费收款钱包（留空=连接钱包）
      cover: o.cover,
      video: o.video || '',
      sourceType: o.sourceType || 'ai',   // ai | work
      sourceTitle: o.sourceTitle || '',
      pair: o.pair || 'ETH',           // 配对资产：ETH 或股票代币（由创建时选择/演示分配）
      supply: K.totalSupply,
      circulating: circulating,               // 流通供应量
      lockedPct: lockedPct,                   // 锁定/预留比例 0–1
      p0: p0,
      priceUsd: price,
      marketCap: marketCap,                   // 流通市值 MC
      fdv: fdv,                               // 完全稀释 FDV
      holders: o.holders,
      volumeUsd: o.volumeUsd,
      // 成交量时间窗（Volume 排序语义用）：无真实分窗时派生；冷门币（总量 0）约 1/4 24h 无量
      vol24hUsd: (function () {
        if (o.vol24hUsd != null) return o.vol24hUsd;
        var seed = ((o.id || '').length * 7919 + ((o.id || '').charCodeAt(0) || 0) * 131) % 100;
        if (!o.volumeUsd && seed < 25) return 0;   // 冷门币 24h 无成交 → 会被 volume+24h 过滤
        return Math.max((o.volumeUsd || 0) * (0.12 + ((o.id || '').length % 4) * 0.09), 300 + seed * 137);
      })(),
      vol7dUsd: (function () {
        if (o.vol7dUsd != null) return o.vol7dUsd;
        var seed = ((o.id || '').length * 104729 + ((o.id || '').charCodeAt(0) || 0) * 233) % 97;
        return Math.max((o.volumeUsd || 0) * 0.85, 900 + seed * 620);
      })(),
      launchedAt: o.launchedAt,
      graduated: graduated,
      gradAt: o.gradAt || null,
      gradThresholdUsd: gradT,
      progress: prog0,                     // curve 池额比例（毕业=1）
      poolUsd: pool0,                      // curve/池 收集金额
      change24h: o.change24h,
      isNew: o.isNew || false,
      lastBuyAt: o.lastBuyAt || o.launchedAt || Date.now(),  // 最近一次买入时间（市场排序用）
      buyerAddr: o.buyerAddr || walletFrom('seed:' + o.id),       // 最近买入钱包（展示用，确定性模拟）
      creatorHoldsPct: o.creatorHoldsPct == null ? 0 : o.creatorHoldsPct, // 创建者持仓占比 %（>20 触发警示）
      isOriginal: !!o.isOriginal,         // OG：本币名/代号首次发行
      buybackLockedPct: o.buybackLockedPct || null, // 锁入创建者回购的比例
      // 创建页扩展字段
      social: o.social || null,          // {x, tg}
      creatorTaxPct: o.creatorTaxPct || 0, // 每笔交易费中归创作者的比例(额外税)
      shareToHolders: !!o.shareToHolders,  // 是否将 creator 费分给持有者
      devBuyEth: o.devBuyEth || 0,       // 开发者预买（ETH，兼容旧字段）
      devBuyQty: o.devBuyQty || 0,       // 开发者预买数量（按配对资产单位）
      devBuyPair: o.devBuyPair || 'ETH', // 开发者预买的计价资产
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
      id: 'c_feng', name: '凤骨琉璃', symbol: 'FENGGU', tagline: '琉璃易碎，凤骨不折。', shareToHolders: true, creatorHoldsPct: 12,
      creator: '林晚棠', creatorAddr: '0x7A2b…fD81', cover: IMG.feng, video: VID.feng, sourceType: 'work', sourceTitle: '短剧《凤骨琉璃》',
      priceUsd: 0.0009, holders: 2841, volumeUsd: 124000, launchedAt: D(52), graduated: false, progress: 0.94,
      poolUsd: 12650, change24h: 0.42, lastBuyAt: D(1.2), spark: [0.2, 0.35, 0.3, 0.45, 0.6, 0.72, 0.8, 0.94],
      social: { x: 'lintang_fenggu', tg: 'fenggu_official' },
      creatorTaxPct: 2,
    }),
    seedCoin({
      id: 'c_cheng', name: '丞相府今日开饭', symbol: 'XIANG', tagline: '天下粮仓，开饭为敬。', lockedPct: 0.30,
      creator: '厨子老王', creatorAddr: '0x9F3c…aa12', cover: IMG.cheng, video: VID.cheng, sourceType: 'work', sourceTitle: '短剧《丞相府今日开饭》',
      priceUsd: 0.0021, holders: 5210, volumeUsd: 389000, launchedAt: D(120), graduated: true, gradAt: D(88),
      poolUsd: 61200, change24h: 0.68, lastBuyAt: D(26), spark: [0.1, 0.2, 0.5, 0.45, 0.7, 0.85, 0.9, 1]
    }),
    seedCoin({
      id: 'c_xie', name: '我卸甲后天下大乱了', symbol: 'XIEJIA', tagline: '卸甲归田，天下却需要我。', creatorHoldsPct: 38,
      creator: '慕容战', creatorAddr: '0x1D8a…b40e', cover: IMG.xie, video: VID.xie, sourceType: 'work', sourceTitle: '短剧《我卸甲后天下大乱了》',
      priceUsd: 0.0014, holders: 1976, volumeUsd: 156000, launchedAt: D(30), graduated: false, progress: 0.71,
      poolUsd: 9660, change24h: -0.12, lastBuyAt: D(5), spark: [0.3, 0.5, 0.62, 0.55, 0.7, 0.66, 0.74, 0.71]
    }),
    seedCoin({
      id: 'c_mooncat', name: '月球打碟猫', symbol: 'MOONCAT', tagline: '一只穿西装的猫，在月球打碟。', lockedPct: 0.12,
      creator: 'Astra', creatorAddr: '0xE45b…77c9', cover: IMG.zero, video: VID.fight, sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.000042, holders: 318, volumeUsd: 12000, launchedAt: D(3), graduated: false, progress: 0.12,
      poolUsd: 890, change24h: 2.31, isNew: true, lastBuyAt: D(0.3), spark: [0.4, 0.6, 0.5, 0.8, 0.7, 1],
      social: { x: 'mooncat_eth', tg: '' },
      pair: 'NVDA',
      creatorTaxPct: 1,
      shareToHolders: true,
    }),
    seedCoin({
      id: 'c_candle', name: '烛火与王冠', symbol: 'CANDLE', tagline: '在权力的烛光里，谁先燃尽。',
      creator: 'Sylvan', creatorAddr: '0xB20f…9e01', cover: IMG.candle, video: '', sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.0001, holders: 1206, volumeUsd: 22000, launchedAt: D(10), graduated: false, progress: 0.28,
      poolUsd: 2210, change24h: 0.05, lastBuyAt: D(4), spark: [0.3, 0.35, 0.4, 0.38, 0.45],
      pair: 'GLD'
    }),
    seedCoin({
      id: 'c_survivor', name: '末日幸存指南', symbol: 'SURVIVE', tagline: '天亮之前，先活过今晚。', lockedPct: 0.18, creatorHoldsPct: 29,
      creator: 'Noah', creatorAddr: '0x57C9…f1a3', cover: IMG.survivor, video: '', sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.00018, holders: 2304, volumeUsd: 88000, launchedAt: D(40), graduated: true, gradAt: D(21),
      poolUsd: 15400, change24h: -0.24, lastBuyAt: D(12), spark: [0.3, 0.5, 0.8, 0.9, 0.7, 0.6, 0.62, 0.5],
      social: { x: 'noah_survive', tg: 'noah_bunker' },
      creatorTaxPct: 3,
    }),
    seedCoin({
      id: 'c_zero', name: '零点计划', symbol: 'ZERO', tagline: '世界重置前的最后一分钟。',
      creator: 'Kai', creatorAddr: '0x08eD…31b6', cover: IMG.zero, video: VID.xie, sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.00032, holders: 884, volumeUsd: 31200, launchedAt: D(2), graduated: false, progress: 0.06,
      poolUsd: 420, change24h: 0.84, isNew: true, lastBuyAt: D(0.6), spark: [0.5, 0.6, 0.55, 0.7],
      pair: 'SPY'
    }),
    seedCoin({
      id: 'c_names', name: '无名者档案', symbol: 'NAMES', tagline: '名字被夺走的人，自己写回自己的名字。', shareToHolders: true,
      creator: '白鹭', creatorAddr: '0x33A1…c8f0', cover: IMG.names, video: '', sourceType: 'work', sourceTitle: '短剧《无名者档案》',
      priceUsd: 0.00055, holders: 1732, volumeUsd: 67100, launchedAt: D(66), graduated: true, gradAt: D(49),
      poolUsd: 20300, change24h: 0.11, lastBuyAt: D(30), spark: [0.2, 0.3, 0.5, 0.55, 0.8, 0.75]
    }),
    seedCoin({
      id: 'c_pyramid', name: '金字塔之梦', symbol: 'PYRAMID', tagline: '梦境深处，法老仍在等待。',
      creator: 'Ramesh', creatorAddr: '0xF90C…d2e8', cover: IMG.pyramid, video: '', sourceType: 'ai', sourceTitle: 'AI 叙事 · 15s',
      priceUsd: 0.000078, holders: 501, volumeUsd: 8900, launchedAt: D(1), graduated: false, progress: 0.03,
      poolUsd: 190, change24h: 0.15, isNew: true, lastBuyAt: D(0.4), spark: [0.4, 0.45]
    }),
    seedCoin({
      id: 'c_hero', name: '孤胆英雄传', symbol: 'HERO', tagline: '无人记得的名字，撑起整座城。', shareToHolders: true,
      creator: '陈破晓', creatorAddr: '0x6E2b…a4d7', cover: IMG.hero, video: VID.fight, sourceType: 'work', sourceTitle: '短剧《孤胆英雄传》',
      priceUsd: 0.00041, holders: 958, volumeUsd: 24000, launchedAt: D(18), graduated: false, progress: 0.42,
      poolUsd: 4800, change24h: -0.08, lastBuyAt: D(14), spark: [0.4, 0.6, 0.5, 0.55, 0.48, 0.45]
    })
  ];

  // ============================================================
  //  批量模拟数据：Explore 分页（50/页）与 Graduated（10/页）
  //  为展示分页器生成足量确定性伪币，id/symbol/名称均唯一稳定
  // ============================================================
  (function () {
    var NAMES = [
      ['Quantum','Nebula','Turbo','Lunar','Cosmic','Neon','Crypto','Mega','Hyper','Rocket','Astro','Solar','Pixel','Cyber','Zen','Golden','Storm','Frost','Ember','Nova','Vapor','Orbit','Prism','Echo','Apex'],
      ['Cat','Dog','Frog','Duck','Wolf','Fox','Panda','Whale','Dragon','Phoenix','Raven','Otter','Bunny','Koala','Yeti','Moose','Shark','Lynx','Hawk','Wombat','Mantis','Tiger','Owl','Crab','Lion']
    ];
    var COVERS = [IMG.feng, IMG.cheng, IMG.xie, IMG.allin, IMG.candle, IMG.names, IMG.pyramid, IMG.survivor, IMG.zero, IMG.hero];
    var TAGLINES = ['故事开始前，价格先起步。','把名字写回历史。','天亮前的一笔。','一个人的孤勇。','梦醒之前的赌注。','守住最后的光。','风向变了。','曲线之上是新的曲线。','谁先燃尽，谁先封神。','没有人记得，不代表没有发生。'];
    var usedSym = {};
    SEED.forEach(function (c) { usedSym[c.symbol] = true; });
    // 打散序号 → 唯一名组合：j 以 257 步进遍历 0..624（与 625 互质），A/B 双词表共 625 种组合
    function nm(i0) {
      var j = (257 * (i0 + 13)) % 625;
      return { A: NAMES[0][j % 25], B: NAMES[1][Math.floor(j / 25) % 25] };
    }
    // gen 参数：count、毕业比例、ID 前缀
    function gen(count, gradShare, i0) {
      for (var n = 0; n < count; n++, i0++) {
        var nb = nm(i0);
        var A = nb.A, B = nb.B;
        var baseSym = (A.slice(0, 3) + B.slice(0, 3)).toUpperCase();
        var sym = baseSym;
        var k = 1;
        while (usedSym[sym]) sym = baseSym + k++;
        usedSym[sym] = true;
        var graduated = (i0 % 100) < gradShare;
        var launchH = graduated ? (2 + (i0 * 13) % 2880) : (0.1 + (i0 * 7) % 720); // 发行于 N 小时前
        var isNew = !graduated && launchH < 20;
        // 毕业发生在发行之后（gradH < launchH）；池内最近成交在毕业之后（lastH < gradH）
        var gradH = graduated ? Math.max(0.5, launchH * (0.4 + ((i0 * 11) % 50) / 100)) : null;
        var lastH = graduated
          ? Math.max(0.05, gradH * (0.1 + ((i0 * 7) % 80) / 100))
          : Math.min((i0 % 48) * 0.05, Math.max(0.02, launchH * 0.9));
        var mc = graduated
          ? (2 + (i0 * 37) % 900) * 1e6           // FDV 目标 $2M–$900M+
          : (1 + (i0 * 53) % 900) * 1000;          // FDV 目标 $1K–$900K
        // 锁定比例：已毕业更常见锁仓（团队/预留），活跃币少数带锁
        var lockedPct = graduated
          ? ((i0 * 7) % 5 === 0 ? (10 + (i0 % 26)) / 100 : 0)   // 约 1/5 已毕业带 10–35% 锁
          : ((i0 * 11) % 9 === 0 ? (5 + (i0 % 15)) / 100 : 0);  // 约 1/9 活跃带 5–19% 锁
        // 收益共享（Creator rewards → holders）：毕业/活跃都会出现（pons 两区均有该徽章）
        var shareToHolders = ((i0 * 13) % 7) < 2;               // 约 2/7 开启费共享
        // 创建者持仓占比：约 1/8 币 >20%（触发左上角警示）
        var creatorHoldsPct = ((i0 * 17) % 8) === 0
          ? 22 + (i0 % 45)                                       // 22–66%
          : 1 + (i0 % 18);                                       // 1–18%（正常区间）
        // OG：约 1/6 币视为本名首次发行（毕业/活跃均可能）；buyback：约 1/10 有回购锁仓
        var isOriginal = ((i0 * 19) % 6) === 0;
        var buybackLockedPct = ((i0 * 23) % 10) === 0 ? (3 + (i0 % 15)) / 100 : null;
        var price = mc / K.totalSupply;
        var pool = graduated
          ? (K.gradThresholdUsd + (i0 * 29) % 400000)
          : Math.max((K.gradThresholdUsd * (0.02 + (i0 * 11) % 90) / 100), 200);
        SEED.push(seedCoin({
          id: 'gen_' + i0, name: A + ' ' + B, symbol: sym,
          tagline: TAGLINES[(i0 * 13 + 5) % TAGLINES.length],
          creator: 'Creator' + (i0 % 97), creatorAddr: walletFrom('genc:' + i0),
          cover: COVERS[i0 % COVERS.length], video: '', sourceType: (i0 % 3 === 0 ? 'ai' : 'work'),
          sourceTitle: '', supply: K.totalSupply,
          pair: pairOf('gen_' + i0),   // 确定性随机配对资产（含约 1/5 ETH）
          lockedPct: lockedPct,
          shareToHolders: shareToHolders,
          creatorHoldsPct: creatorHoldsPct,
          isOriginal: isOriginal,
          buybackLockedPct: buybackLockedPct,
          priceUsd: price, holders: graduated ? (200 + (i0 * 47) % 9000) : (2 + (i0 * 19) % 600),
          volumeUsd: graduated ? (100000 + (i0 * 911) % 9000000) : (i0 * 97) % 50000,
          // 部分冷门活跃币近 24h 无成交（演示 Volume+24h 窗口过滤）
          vol24hUsd: (!graduated && (i0 * 29) % 8 === 0) ? 0 : undefined,
          launchedAt: D(launchH), graduated: graduated, gradAt: graduated ? D(gradH) : null,
          poolUsd: pool, change24h: ((i0 * 7) % 100) / 100 - 0.3,
          isNew: isNew, lastBuyAt: D(lastH),
          spark: [0.3, 0.5, 0.4, 0.6, 0.5, 0.7, 0.6, 0.8, 0.9]
        }));
      }
    }
    // 名字组合上限 625（25×25）：Graduated 160（16 页 ×10）+ Explore 460（9.2 页 ×50）→ 全唯一
    gen(160, 100, 9000);   // 160 个已毕业（9000–9159）
    gen(460, 0, 9160);     // 460 个活跃（9160–9619），与上段连续 → 620 个唯一名
  })();

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
  // 旧存档迁移：补齐已实现盈亏字段
  USER.realizedPnl = USER.realizedPnl || 0;
  USER.realizedByCoin = USER.realizedByCoin || {};

  // ============================================================
  //  演示钱包：各配对资产余额（开发者预买/水龙头用）
  // ============================================================
  var DEFAULT_CREDIT_USD = 500; // 每个资产初始给等值 500 美元
  var FAUCET_USD = 250;         // 每次领取等值 250 美元
  function assetPrice(sym) { return ASSET_PRICES[sym] || null; }
  function ensureBalances() {
    if (!USER.balances) USER.balances = {};
    for (var i = 0; i < ALL_PAIRS.length; i++) {
      var s = ALL_PAIRS[i];
      if (USER.balances[s] == null) {
        var px = assetPrice(s);
        USER.balances[s] = px ? DEFAULT_CREDIT_USD / px : 0;
      }
    }
  }
  ensureBalances();
  function balanceOf(sym) { ensureBalances(); return USER.balances[sym] || 0; }
  // 模拟水龙头：领取等值 FAUCET_USD 的指定资产，返回领取数量（单位）
  function faucet(sym) {
    ensureBalances();
    var px = assetPrice(sym);
    var amt = px ? FAUCET_USD / px : 0;
    USER.balances[sym] = (USER.balances[sym] || 0) + amt;
    persist();
    return amt;
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
  function walletFrom(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    var hex = ('00000000' + (h >>> 0).toString(16)).slice(-8).toUpperCase();
    return '0x' + hex.slice(0, 2) + hex.slice(2, 4).toLowerCase() + '…' + hex.slice(4, 6).toLowerCase() + hex.slice(6, 8).toUpperCase();
  }
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
    c.marketCap = c.priceUsd * (c.circulating || c.supply);
    c.fdv = c.priceUsd * c.supply;
    c.volumeUsd = (c.volumeUsd || 0) + net;
    c.lastBuyAt = Date.now();
    c.buyerAddr = walletFrom(USER.id);
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
  // 卖出：卖出 coins → 得到 usd（curve 与毕业池统一：扣持仓 + 结算已实现盈亏）
  function sell(coinId, coins) {
    var c = coinById(coinId);
    if (!c) return { ok: false, msg: '币不存在' };
    var h = USER.holdings[coinId];
    if (!h || h.amount < 1) return { ok: false, msg: '无持仓' };
    if (coins > h.amount) coins = h.amount;
    var graduated = !!c.graduated;
    var pNow = graduated ? c.priceUsd : priceAt(c);
    var gross = coins * pNow;
    var fee = gross * K.feeRate;
    var net = gross - fee;
    if (!graduated) {
      // curve：池内资金防线（防归零超卖）
      if (gross > (c.poolUsd || 0)) {
        coins = (c.poolUsd || 0) / Math.max(pNow, 1e-12);
        gross = coins * pNow;
        fee = gross * K.feeRate;
        net = gross - fee;
      }
      c.poolUsd = Math.max(0, (c.poolUsd || 0) - gross);
      c.progress = progressOf(c);
      c.priceUsd = priceAt(c);
    } else {
      // 池内：价格微幅下行 + 噪声
      var wiggle = -(0.004 + Math.random() * 0.02);
      c.priceUsd = Math.max(c.priceUsd * (1 + wiggle), 1e-10);
    }
    c.marketCap = c.priceUsd * (c.circulating || c.supply);
    c.fdv = c.priceUsd * c.supply;
    c.volumeUsd = (c.volumeUsd || 0) + gross;
    if (typeof c.spark === 'undefined') c.spark = [];
    c.spark.push(graduated ? 1 : c.progress);
    if (c.spark.length > 40) c.spark.shift();
    // 已实现盈亏 = 卖出净得 − 卖出币数 × 平均成本（成本含费口径）
    var realized = net - coins * (h.avgUsd || 0);
    USER.realizedPnl = (USER.realizedPnl || 0) + realized;
    USER.realizedByCoin[coinId] = (USER.realizedByCoin[coinId] || 0) + realized;
    // 扣持仓
    h.amount -= coins;
    if (h.amount < 0.000001) delete USER.holdings[coinId];
    addFee(c, fee);
    addTx(c, 'sell', gross, net, coins, '我');
    if (USER.tx.length) USER.tx[0].realizedUsd = realized; // 供资产页逐笔标记
    persist();
    return { ok: true, proceedsUsd: net, fee: fee, coins: coins, realizedUsd: realized };
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
    c.marketCap = c.priceUsd * (c.circulating || c.supply);
    c.fdv = c.priceUsd * c.supply;
    c.volumeUsd = (c.volumeUsd || 0) + net;
    if (side === 'buy') { c.lastBuyAt = Date.now(); c.buyerAddr = walletFrom(USER.id); }
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
      // 卖出：传币数 = usd 按现价折算；统一走 sell()（curve 与池内都扣持仓 + 记已实现）
      var coinsToSell = usd / Math.max(c.priceUsd, 1e-9);
      var h = USER.holdings[coinId];
      if (!h || h.amount < coinsToSell) coinsToSell = h ? h.amount : 0;
      if (coinsToSell <= 0) return { ok: false, msg: '无持仓' };
      var r2 = sell(coinId, coinsToSell);
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
      pair: data.pair || 'ETH',
      social: data.social || null,
      creatorTaxPct: data.creatorTaxPct || 0,
      shareToHolders: !!data.shareToHolders,
      creatorWallet: data.creatorWallet || '',
      devBuyEth: data.devBuyEth || 0,
      devBuyQty: data.devBuyQty || 0,
      devBuyPair: data.devBuyPair || 'ETH',
      snipeExempts: data.snipeExempts || []
    });
    // 开发者预买：从演示钱包扣减配对资产（防御：超出部分按余额封顶）
    ensureBalances();
    var dbQty = Number(data.devBuyQty != null ? data.devBuyQty : 0) || 0;
    var dbPair = data.devBuyPair || 'ETH';
    if (dbQty > 0) {
      var bal = USER.balances[dbPair] || 0;
      var use = Math.min(dbQty, bal);
      USER.balances[dbPair] = bal - use;
      coin.devBuyQty = use;
      if (dbPair === 'ETH') coin.devBuyEth = use;
    }
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
  //  Analytics 聚合
  // ============================================================
  function analytics(mode) {
    // mode: '24h' | 'all'
    var coins = SEED || [];
    var is24h = mode === '24h';
    var cutoff = is24h ? Date.now() - 86400000 : 0;
    var totalCap = 0, totalVol = 0, holdersTotal = 0, createdToday = 0;
    var graduatedToday = 0, graduations = [], newCoins = [];
    var recentTrades = [];
    coins.forEach(function (c) {
      totalCap += c.marketCap || 0;
      var vol = c.volumeUsd || 0;
      if (is24h) vol = Math.round(vol * 0.2); // 演示：24h 占总量的约 20%
      totalVol += vol;
      holdersTotal += c.holders || 0;
      if (c.launchedAt >= cutoff) { createdToday++; newCoins.push(c); }
      if (c.graduated && c.gradAt && c.gradAt >= cutoff) { graduatedToday++; }
      if (c.graduated) graduations.push(c);
    });
    // 发行趋势 + 交易量趋势（演示 mock：近 14 天）
    var DAYS = 14;
    var trend = [];
    var volTrend = [];
    var realTotalVol = coins.reduce(function (s, c) { return s + (c.volumeUsd || 0); }, 0);
    for (var d = DAYS - 1; d >= 0; d--) {
      var day = Date.now() - d * 86400000;
      var n = 0;
      coins.forEach(function (c) { if (c.launchedAt >= day && c.launchedAt < day + 86400000) n++; });
      // 用确定性伪随机补一点趋势（原型演示）
      n = Math.max(n, Math.round((d === DAYS - 1 ? 1 : 2) + Math.sin(d * 0.9) * 0.8 + 1));
      trend.push({ label: fmtDay(day), value: n });
      // 交易量：以平台总量按 14 天分配，近期温和抬升 + 波形（确定性，刷新不跳）
      var volBase = Math.max(realTotalVol, 4000) / DAYS;
      var lift = d < 3 ? (3 - d) * 0.25 : 0;            // 最近三天抬升
      var wave = 0.8 + Math.abs(Math.sin(d * 1.3)) * 0.6;
      volTrend.push({ label: fmtDay(day), value: Math.round(volBase * wave * (1 + lift)) });
    }
    graduations.sort(function (a, b) { return (b.gradAt || 0) - (a.gradAt || 0); });
    newCoins.sort(function (a, b) { return b.launchedAt - a.launchedAt; });
    // 交易历史（演示用 tx 池汇总）
    var txPool = USER.tx || [];
    recentTrades = txPool.slice(0, 8);
    return {
      totalCap: totalCap,
      totalVol: totalVol,
      holders: holdersTotal,
      launched: coins.length,
      createdToday: createdToday,
      graduatedToday: graduatedToday,
      graduations: graduations.slice(0, 6),
      newCoins: newCoins.slice(0, 6),
      trend: trend,
      volTrend: volTrend,
      recentTrades: recentTrades,
      gradThresholdUsd: K.gradThresholdUsd
    };
  }
  function fmtDay(ts) {
    var dt = new Date(ts);
    return (dt.getMonth() + 1) + '/' + dt.getDate();
  }

  // ============================================================
  //  模拟活跃引擎（演示氛围）
  //  calm 不启动；live/hot 以固定间隔模拟随机成交，
  //  仅改内存 coin 字段 —— 不落盘、不产生手续费/交易记录/不触发真毕业
  // ============================================================
  var SIM_KEY = 'sf_sim_live';
  var SIM_MS = { calm: 0, live: 2400, hot: 900 };
  var sim = { level: 'calm', timer: null, subs: [], focus: null };
  (function initSim() {
    try {
      var v = localStorage.getItem(SIM_KEY);
      if (v === 'live' || v === 'hot') sim.level = v;
    } catch (e) {}
  })();
  function simLevel() { return sim.level; }
  function simStart() {
    if (sim.timer || sim.level === 'calm' || !sim.subs.length) return;
    sim.timer = setInterval(simTick, SIM_MS[sim.level]);
  }
  function simStop() { if (sim.timer) { clearInterval(sim.timer); sim.timer = null; } }
  function simSubscribe(fn) {
    sim.subs.push(fn);
    simStart();
  }
  function simFocus(id) { sim.focus = id || null; }
  function setSimLevel(lv) {
    if (!SIM_MS[lv]) lv = 'calm';
    sim.level = lv;
    try { localStorage.setItem(SIM_KEY, lv); } catch (e) {}
    if (lv === 'calm') { simStop(); return; }
    simStop(); simStart();
  }
  function simTick() {
    var n = (sim.level === 'hot' && Math.random() < 0.6) ? 2 : 1;
    for (var i = 0; i < n; i++) simOne();
  }
  function simOne() {
    var coin;
    // 焦点币优先（详情页希望当前币活跃时用）
    if (sim.focus && Math.random() < 0.6) {
      var fc = coinById(sim.focus);
      if (fc) coin = fc;
    }
    if (!coin) {
      var live = SEED.filter(function (c) { return !c.graduated; });
      var pool = (live.length && Math.random() < 0.7) ? live : SEED;
      coin = pool[Math.floor(Math.random() * pool.length)];
    }
    if (!coin) return;
    // 池额接近封顶的币让位给其他币（避免顶格/伪毕业观感）
    if (!coin.graduated) {
      var thr0 = coin.gradThresholdUsd || K.gradThresholdUsd;
      if ((coin.poolUsd || 0) >= thr0 * 0.985) {
        var live2 = SEED.filter(function (c) { return !c.graduated && c !== coin && (c.poolUsd || 0) < ((c.gradThresholdUsd || K.gradThresholdUsd) * 0.985); });
        var alt = live2.length ? live2 : SEED.filter(function (c) { return c !== coin; });
        if (alt.length) coin = alt[Math.floor(Math.random() * alt.length)];
      }
    }
    simTrade(coin);
  }
  function simTrade(coin) {
    var thr = coin.gradThresholdUsd || K.gradThresholdUsd;
    var usd = (20 + Math.random() * 180) * (sim.level === 'hot' ? 2 : 1);
    if (coin.graduated) {
      // 池内自由波动：价格微调
      var w = (Math.random() - 0.42) * 0.02;
      coin.priceUsd = Math.max(coin.priceUsd * (1 + w), 1e-10);
      coin.marketCap = coin.priceUsd * coin.supply;
      coin.volumeUsd = (coin.volumeUsd || 0) + usd;
    } else {
      var newPool = Math.min((coin.poolUsd || 0) + usd, thr * 0.99);
      coin.poolUsd = newPool;
      coin.progress = progressOf(coin);
      coin.priceUsd = priceAt(coin);
      coin.marketCap = coin.priceUsd * coin.supply;
      coin.volumeUsd = (coin.volumeUsd || 0) + usd;
      if (Math.random() < 0.35) coin.holders = (coin.holders || 1) + 1;
    }
    coin.lastBuyAt = Date.now();
    coin.buyerAddr = walletFrom('sim:' + Math.floor(Math.random() * 9000 + 1000));
    for (var i = 0; i < sim.subs.length; i++) {
      try { sim.subs[i](coin); } catch (e) {}
    }
  }

  // 切后台暂停、回前台恢复（避免不可见时空转）
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) simStop();
      else if (sim.level !== 'calm' && sim.subs.length) simStart();
    });
  }

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
    analytics: analytics,
    // 配对资产（quote 股票代币表，顺序=市场 Pair 按钮顺序）
    pairStocks: PAIR_STOCKS.slice(),
    // 演示钱包：资产美元价 / 余额 / 水龙头
    assetPrice: assetPrice,
    balanceOf: balanceOf,
    faucet: faucet,
    fmtDay: fmtDay,
    persist: persist,
    // 模拟活跃引擎
    simLevel: simLevel,
    setSimLevel: setSimLevel,
    simSubscribe: simSubscribe,
    simFocus: simFocus,
    // debug
    debug: { setEth: setEth, forceGraduate: forceGraduate, forceUngraduate: forceUngraduate, resetAll: resetAll }
  };
  window.__sf_launch = { toast: toast }; // 兼容老引用
})();
