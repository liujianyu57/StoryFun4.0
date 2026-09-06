# 协议数据「analytics」· 产品需求说明

> 按真实产品语义撰写；不含演示数值。
> 页面：`analytics.html`（Protocol analytics，pons 市场链上数据总览）
> 阅读建议：先读第 1 节（数据口径），再读 §3 两视图与 §4/§5 卡片内容。
> 未定义细节处理原则：以 pons 实测为准；观测不到的取最简默认，不再展开评审。

---

## 0. 页面定位与用户故事

- **定位**：面向所有访客的公共链上数据页：用 pons 官方口径汇报市场的成交量 / 发射数 / 交易数等指标，并给出“最近完整日”与“历史累计”两种视图与日趋势图。
- **用户故事**
  - 作为市场参与者，我想看最近一天的成交与发射变化（对比前一天），判断市场热度。
  - 作为研究者/观众，我想看平台累计体量（成交量、发射数、创作者数量），并跳到 pons 官方 Dune 看板核对。
  - 页面无需登录即可浏览。

---

## 1. 数据口径（重要）

- 页面对外文案为 **Dune 链上索引数据**（pons：Independent onchain reporting … Data is supplied by Dune from indexed onchain activity）；本地原型由演示引擎提供**确定性 mock**，结构与文案对齐 pons。
- **24h 视图** = 最近一个**完整 UTC 日**（实现上取昨日），不是滚动 24 小时；对比行写 `+/-x.x% from prior day`。
- **All time 视图** = 完整历史累计（Volume/Launches/Trades 由引擎汇总；Revenue / Creator earnings 在原型中标注 `Unavailable`）。
- 数据声明：页面不构成财务/链上承诺；图与数值为演示口径。

---

## 2. 页面结构（自上而下）

```
1 协议大卡（an-panel）
   标题 Protocol analytics
   副文案 Independent onchain reporting for pons markets on Robinhood Chain.
   副行（num） Dune updated {HH:MM}, latest complete day {M d} UTC
   右上：模式切换 pill（24h / All time）+ 外链按钮 View on Dune
   指标区 an-metrics（3 格 = 24h；6 格 = All time）
   注脚：Data is supplied by Dune from indexed onchain activity. The 24h view
         uses the latest completed UTC day.
2 Daily context 图卡（an-charts，两卡等宽自适应网格）
   - Trading volume 卡：大字当前值 + 说明 + 日趋势图
   - Token launches 卡：同上（发行数日趋势）
   说明：Recent daily context with the latest completed day highlighted.
```

---

## 3. 模式切换（24h / All time）

| 项 | 24h | All time |
|---|---|---|
| 指标卡数 | 3 | 6 |
| 趋势图 | 用引擎近 14 天趋势，截到最近完整日（昨天） | 60 天确定性序列（比例放大到累计量级） |
| 高亮点 | 最近完整日 | 序列末点（最近一天） |
| 图大字 | 最近完整日数值 | 累计数值 |

- 切换即时重渲染；右上 pill 高亮当前模式；重复点击当前模式不重渲染。
- 切换不刷新页面、不产生路由参数。

---

## 4. 指标区

### 4.1 24h（3 格）
| 指标 | 值 | 脚注行 |
|---|---|---|
| 24h volume | `$` + 短格式 | `+x.x% from prior day` / `No prior-day baseline`（红跌/绿涨/灰无基线） |
| 24h launches | K/M/B/T 短格式 | 同上（对比前一日发射数） |
| 24h trades | K/M/B/T 短格式 | 同上（trades ≈ volume/60 演示换算） |

### 4.2 All time（6 格）
| 指标 | 值 | 脚注 |
|---|---|---|
| All-time volume | `$` 短格式 | Complete Dune history |
| All-time launches | K/M/B/T | Complete Dune history |
| All-time trades | K/M/B/T | Complete Dune history |
| Protocol revenue | **Unavailable**（灰） | Lifetime total |
| Creator earnings | **Unavailable**（灰） | Lifetime total |
| Unique token devs | 数字 | Lifetime total（= 种子币 creator 地址去重数） |

- 数值格式：≥1000 用 `$` + K/M/B/T（2 位小数，如 `$1.20K`）；<1000 用 `$` + 千分位（最多 2 位小数）；纯个数用 K/M/B/T。
- 网格：桌面 3 列（24h 一行；All time 两行，第二行带顶边框）；窄屏折为单列。

---

## 5. Daily context 图卡（Trading volume / Token launches）

- 卡结构：`k` 标题 → 大字当前值（num）→ 说明小字 → SVG 趋势图。
- 趋势图（内联 SVG）：
  - 面积渐变 + 折线（黑 2.2px）+ 数据点小圆（白心黑描边）；
  - **最近完整日高亮**：大实心圆 + 白描边 + 外圈淡环；
  - X 轴日期刻度 ≤5 个（首/中/尾自适应对齐 start/middle/end），标签 `M/D`；
  - Y 轴留上下内边距自动适配数值域，无显式 Y 刻度（同 pons daily-context 简化形态）。
- 大字取值：
  - 24h 模式：两卡均取“最近完整日”当日值；
  - All time 模式：Trading volume = 累计成交量、Token launches = 累计发射数（60 点序列为确定性演示放大）。

---

## 6. 顶部信息与 Dune 外链

- `Dune updated {本地时间 h:mm}, latest complete day {M d} UTC`：打开页面时填充（取“昨天”作为最近完整 UTC 日）。
- 时间文案失败时回退 `Dune updated —`。
- `View on Dune`：外链 `https://dune.com/adam_tehc/pons`（`target=_blank` + `rel=noopener`），标题提示为 pons 官方 Dune 看板。

---

## 7. 数据与演示口径（引擎）

- 引擎 `Launch.analytics(mode)`（`launch-coin.js`），基于种子币集合计算：
  - `totalVol`：24h 模式 = Σ 币 `volumeUsd × 0.2`（约 20%）；all 模式 = Σ 全量。
  - `trend` / `volTrend`：近 14 天确定性序列（发射数按日计数 + 正弦补形；交易量 = 总量/14 × 波形 × 近 3 日抬升），刷新稳定。
  - `trades ≈ round(volume / 60)`（演示换算）。
  - `launched = coins.length`；`Unique token devs` = 币 `creatorAddr` 去重数。
  - 另有 `createdToday / graduatedToday / graduations / newCoins / recentTrades` 等字段供后续区块使用（当前页面未全部消费）。
- All time 图卡：`seededSeries(60, …)` 确定性 60 点，标签回推 60 天 `M/D`。
- 页面所有展示与 `USER` 无关，**无需登录**；仅依赖本地演示币种子。

---

## 8. 异常与边界

| 场景 | 行为 |
|---|---|
| Dune 更新时间文案异常 | 回退 `Dune updated —` |
| 趋势数据不足 2 点 | 图表不绘制（静默），大字显示 `—` |
| 前一日基线 ≤ 0 / 缺失 | 脚注显示 `No prior-day baseline`（中性灰） |
| 数值 null/NaN | 一律显示 `—` |
| 外链打开失败 | 浏览器默认处理（新标签页），页面无感知 |
| 模式快速连点 | 忽略与当前相同模式，其余正常切换重渲染 |

---

## 9. 验收清单

- [ ] 页面免登录可访问，初始 24h 视图
- [ ] 24h / All time 切换：指标卡 3↔6、图与大字口径同步切换，pill 高亮正确
- [ ] 24h 指标脚注正确（`+x.x% from prior day` / No prior-day baseline，涨跌着色）
- [ ] All time：Protocol revenue / Creator earnings 显示 Unavailable（灰）
- [ ] 两张 Daily context 卡：大字、趋势图、最近完整日高亮、X 轴 ≤5 个 M/D 刻度正确
- [ ] Dune updated 时间行与 View on Dune 外链（新标签页 + noopener）
- [ ] 数值格式一致（K/M/B/T 大写、小数值千分位）
- [ ] 窄屏下指标区与图卡正确折为单列
