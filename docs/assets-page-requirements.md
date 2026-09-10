# 我的资产「assets」· 产品需求说明

> 按真实产品语义撰写；不含演示数值。
> 页面：`assets.html`（我的资产 = Portfolio 总览 + 持仓/历史/流水/发射）
> 阅读建议：本页是「账户级」页面：先读第 1 节（登录 / 访客两态），再看第 2 节结构总览，各页签细节按 §6–§9。
> 未定义细节处理原则：以 pons 实测为准；观测不到的取最简默认，不再展开评审。

---

## 0. 页面定位与用户故事

- **定位**：登录用户的资产中枢：看总市值与 PnL 曲线、管持仓（含分享）、领持有人分红与 Creator fees、回看历史与流水、管理自己发射的币。
- **用户故事**
  - 作为用户，我打开就能看到 Portfolio balance、一段时间 PnL 走势，以及可一键领取的 Holder dividends / Creator fees。
  - 作为持仓者，我想按行查看 Entry mcap / Current mcap / Value / PnL，并把它做成分享卡发给别人。
  - 作为发射者，我想看自己发射的币与未领取的 Creator fees。
  - 作为访客，我应能通过地址只读浏览某账户的资产（演示数据），但不能领取任何收益。

---

## 1. 访问态与权限

| 状态 | 行为 |
|---|---|
| 未登录 | 隐藏 hero / Portfolio / 横幅；内容区显示“登录后查看资产”卡（`needLogin`），点击弹登录引导；`auth-ready` 后自动重渲染 |
| 已登录（本人） | 完整功能：总览、四个页签、两个领取横幅、持仓分享 |
| 访客 `assets.html?address=0x{40}` | 顶部出现“访客视图 · 演示数据 · 返回我的资产”条；地址展示为所查地址（头像取地址首字符）；数据为同一演示档案；**领取一律禁用**（横幅隐藏 / 按钮 toast 提示） |

> 实现说明：`address` 校验 `0x` + 40 位 hex；访客与本人共用同一份演示数据源，仅身份展示与领取能力不同。

---

## 2. 页面结构（自上而下）

```
1 身份 hero：头像（登录用户头像或占位）+ 地址 + 「复制」
2 钱包条：ETH 余额 +「充值」「提现」占位按钮（禁用态，不可点）
3 领取横幅（仅本人、有可领内容时出现；位于 Portfolio 上方）：
   - Holder dividends ready（◎）+ Claim all holder dividends
   - Creator fees（◆）+ Claim fees
4 Portfolio：左 = Portfolio balance（大字 + “Across N open pons position(s)”小字）
             右 = PnL 走势卡：头部大字 PnL（±$，随 1D/7D/30D 切换）+ 折线图
5 页签：Positions / History / Activity / Launches（下划线高亮当前）
6 内容区（随页签渲染；未登录时为登录引导卡）
7 分享浮层：HTML 分享卡（“看起来像图片”，仅示意，不生成文件）
```

---

## 3. 身份 hero 与 Portfolio 总览

### 3.1 身份 hero
- 头像：登录用户有头像则显示图片，否则占位字符；访客态显示所查地址第 3 位大写字符。
- 地址：全量 0x 地址；「复制」写剪贴板并 toast“地址已复制”。

### 3.2 Portfolio balance
- `Portfolio balance` = Σ（持仓量 × 当前价 USD）。
- 小字 pons 口径：`Across {N} open pons position(s)`（N=当前持仓币数）。

### 3.3 PnL 走势卡
- 头部大字：总 PnL = 未实现（持仓现价 − 成本）+ 已实现（`USER.realizedPnl`），带符号（`+`/`−`），后缀 `PnL · {1d|7d|30d}`；正绿负红。
- 范围按钮 1D / 7D / 30D：切换后曲线与头部重绘。
- 图：确定性演示序列（按用户 id + 范围种子生成，向 PnL 方向漂移）；Y 轴 4 条网格 + 美元刻度（上界 = max(总市值, 总 PnL, 1)）；渐变面积 + 折线 + 末端点。
- 窗口 resize 时重绘。
- 语义声明：走势为**演示示意**，非实时行情。

### 3.4 钱包条：ETH 余额与充值 / 提现占位入口
- **展示**：仅原生 ETH 余额（`Launch.balanceOf('ETH')`），不显示等值美元；位置在身份 hero 与领取横幅之间，仅登录后显示。
- **口径独立**：ETH 属钱包资产，**不计入** `Portfolio balance`（后者仅 Σ 持仓市值），否则 PnL 与 `Across N open pons position(s)` 口径都会被污染。
- **同源要求**：与币详情交易面板、创建页预买行的「可用 X ETH」使用同一余额接口，页面内不得出现两个不同的 ETH 数值。
- **刷新**：随 Portfolio 总览一起重渲染（登录、领取收益、切换 PnL 范围等既有刷新链路都会更新余额）。
- **权限**：未登录隐藏（与 hero / Portfolio 一致）；访客态（`?address=0x…`）按所查地址展示余额，只读、无操作入口。
- **充值 / 提现占位按钮**：钱包条右侧固定展示「充值」（主样式）与「提现」（次级样式）两个入口，当前均为**禁用态（`disabled`）**：
  - 不可点击、无 hover 反馈、不绑定任何事件、不打开任何浮层；
  - `title` 提示为「充值功能暂未开放 / 提现功能暂未开放」；
  - 说明本页暂不提供资金进出能力，入口先占位，后续接入链上转账流程时再启用。
- **窄屏**：≤560px 时按钮组独占一行，两个按钮等宽。

---

## 4. 领取横幅（位于 Portfolio 上方）

| 横幅 | 出现条件（本人） | 文案 | 行为 |
|---|---|---|---|
| Holder dividends | 持有币中至少一个 `ready` 且金额 > 0 | `{合计} ready across {N} coin(s)` | Claim all：逐个入账（按该币配对资产 credit），并标记已领；toast 汇总 |
| Creator fees | 自己发射币中有 `claimable > 0` | `{合计} claimable across {N} launch(es)` | Claim fees：循环 `Launch.claim(id)`，toast 汇总 |

- 判定口径与币详情页一致：
  - 持有人分红：发行配置 `shareToHolders` 且未领（`sf_div_claimed` 记录 id）→ `ready`；另有演示态覆盖（见 §9）。
  - Creator fees：`USER.claimable[id] > 0` → ready；`USER.claimed[id] > 0` → claimed；否则 Open。
- 已领取 / 无可领时横幅不出现。

---

## 5. 页签总览

| 页签 | 英文标题 | 内容 | 空态 |
|---|---|---|---|
| Positions | Open positions | 当前持仓列表（Entry, current mcap, value, PnL）+ 分红演示开关 | 去市场看看 |
| History | Closed positions | 已完全退出的持仓（Realized / Invested / PnL） | No closed positions yet |
| Activity | Recent buys and sells across pons pools | 最近买/卖流水（至多 40 条） | 买入第一笔后展示 |
| Launches | Tokens you launched on Robinhood Chain | 自己发射的币 + Creator fees 状态 + 演示开关 | Launch a token |

---

## 6. Positions（Open positions）

### 6.1 行字段
| 列 | 取值 |
|---|---|
| 币 | 封面/占位 + 名称 + `$代号 · {time ago} · {N} trades`（N=自上次完整退出以来的买+卖次数） |
| Entry mcap | 建仓均价对应市值 = 当前市值 ×（均价 ÷ 现价） |
| Current mcap | 当前市值 |
| Value | 持仓量 × 现价（USD） |
| PnL | ▲/▼ + 带符号金额 + 百分比（成本 > 0 时），红绿着色 |

- 行整体点击 → 币详情页；行内分享按钮阻止冒泡。
- 表头带「分红演示」切换按钮（见 §9）。

### 6.2 分享卡（OPEN POSITION）
- 弹层展示 HTML 分享卡：`OPEN POSITION · story.fun` + 币图/名称/代号 + Entry mcap / Current mcap / Value / PnL 四格 + 页脚日期。
- 「复制图片 / 下载图片」为**演示占位**：toast“演示占位（不生成文件）”，不真实产出图片。
- 关闭：✕ 或点击遮罩。

### 6.3 空态
- “还没有持仓 / 发现一个叙事，从第一笔开始” + 去市场按钮。

---

## 7. History（Closed positions）

- 数据源：完全退出记录 `USER.closed`（记录 `coinId / name / symbol / entryMcapUsd / investedUsd / realizedPnlUsd / totalPnlUsd / totalPnlPct / buys / sells / exitAt`）。
- 行字段：币（含 `{time ago} · {N} trades`）、`Entry mcap`、`Realized`（红绿）、`Invested`、`PnL`（▲/▼ + 金额 + %）。
- 分享卡：`CLOSED POSITION`，字段同上（Realized / Invested / PnL）。
- 空态：No closed positions yet.（完全卖出后出现已实现 PnL）。

---

## 8. Activity

- 数据源：`USER.tx`（倒序，至多显示 40 条）；行点击回币详情。
- 行内容：`Bought/Sold {数量缩写} ${代号}`（大写行）+ `{币名} · ${净额或总额 USD}`（小字）+ 右侧时间 `{timeAgo} ago`。
- 数量缩写（pons 口径，小写 k）：`1.23k / 1.20M / 1.10B / 2 位小数 / <1 用 3 位有效数字`。
- 空态：No trades found in the recent lookback window.（含引导按钮）。

---

## 9. Launches（自己发射的币）

- 数据源：`USER.created`（发行流程落库的币 id 列表）。
- 行：封面 + 名称 + `$代号 · Graduated/curve · 市值`，右侧状态：
  | 状态 | 展示 |
  |---|---|
  | Ready | `Ready · {金额 USD}`（有 claimable） |
  | Claimed | `Claimed · {金额 USD}` |
  | 其他 | `Open` |
- 表头带「领取状态演示」按钮（见下）。
- 空态：No launches yet. + Launch a token。
- 行点击 → 币详情页。

### 9.1 演示开关（原型专用）
- 页签内右上角循环按钮切换 localStorage 状态，即时重渲染与横幅同步：
  - 持有人分红演示（Positions 表头，`sf_div_demo`）：自动（按配置与已领记录判定）/ 待领取 ready / 已领取 claimed / 无 none。
  - Creator fees 演示（Launches 表头，`sf_fee_demo`）：自动 / 待领取 ready / 已领取 claimed / 无收益 open。
- 演示态下点领取按钮：不真实入账，仅 toast“演示：已领取…”并把状态切到已领取（`sf_div_demo`/`sf_fee_demo`），便于走查 UI 各状态。

---

## 10. 数据与状态口径（引擎）

- 数据引擎：`launch-coin.js`（`window.Launch`），账户状态存 `Launch.USER`：
  - `holdings{coinId:{amount, avgUsd}}`、`closed[]`、`tx[]`、`created[]`、`realizedPnl`、`claimable/claimed{coinId}`。
- 币数据按 id 取 `Launch.coinById`；价格 `coin.priceUsd`；市值 `coin.marketCap`。
- 分红/费用领取均以币的**配对资产**入账（`Launch.credit(pair, qtyOfUsd(usd))`），与币详情页一致。
- localStorage 演示键：`sf_div_claimed`（已领分红 id）、`sf_div_demo`、`sf_fee_demo`；地址角色演示键沿用全局（auth / `sf_demo_role`）。
- 页面就绪走 `window.onLaunchShellReady`（切换范围、复制、页签、两个 Claim、resize、auth-ready、首渲）。

---

## 11. 异常与边界

| 场景 | 行为 |
|---|---|
| 未登录打开 | 显示登录引导卡，其余区块隐藏 |
| 访客打开并点领取 | 横幅不出现；即使触发也 toast“访客视图不可领取” |
| 无可领分红/费用点 Claim | toast“暂无可领取…” |
| 持仓成本为 0 | PnL % 显示 0 基线，金额照常 |
| 分享按钮（复制/下载图片） | 演示占位 toast，不生成文件 |
| resize | PnL 图重绘 |
| 空持仓 / 无流水 / 无发射 | 各页签空态与引导按钮 |

---

## 12. 验收清单

- [ ] 登录前显示登录引导卡，登录后（含 auth-ready 事件）自动恢复完整视图
- [ ] 访客态（?address=0x…）：访客条 + 地址展示，领取/横幅禁用
- [ ] Portfolio balance = Σ持仓×现价；PnL 头 = 未实现+已实现，随 1D/7D/30D 切换
- [ ] 钱包条：ETH 余额与交易面板「可用」一致、不显示等值美元；未登录隐藏、访客按地址只读、不并入 Portfolio 口径
- [ ] 两个领取横幅位于 Portfolio 上方（有可领内容时才出现）
- [ ] 充值 / 提现按钮为禁用态：不可点击、无 hover、不触发任何浮层或提示（仅 `title` 说明未开放）
- [ ] PnL 图四线网格 + Y 轴美元刻度 + 渐变折线；resize 重绘
- [ ] Positions：行字段齐全、Entry mcap 口径正确、点击跳详情、分享卡可开/关（复制/下载为占位）
- [ ] History：Closed 列表字段/分享卡/空态正确
- [ ] Activity：Bought/Sold 流水 ≤40 条、时间与数量缩写格式正确
- [ ] Launches：状态 Ready·/Claimed·/Open 与 Creator fees 横幅联动
- [ ] Holder dividends 横幅与 Claim all（含配对资产入账、已领记录）
- [ ] Creator fees 横幅与 Claim fees（`Launch.claim` 路径）
- [ ] 两个“演示状态”循环开关均可走查各 UI 状态且不污染真实余额（演示路径）

---

> 备注：页面代码另含未挂入口的「AI 视频资产网格」渲染逻辑（`renderAi` / `playModal`，供复用发币/预览），为原型遗留能力，不在当前页签内暴露。
