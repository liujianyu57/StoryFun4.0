# 创作者 IP 经济模型方案

## **一、背景与动机**



### **现状问题**

现有体系以「角色 IP」为核心：

用户发行角色 IP（NFT）

→ 短剧绑定角色 IP 

→ 用户签约角色 

→ 按角色绑定的短剧数据挖矿。

流程四步、概念多重（发行/绑定/签约/挖矿），用户理解成本高。



### **改版目标**

- 简化概念层级：去掉「角色 IP」中间层，使用账号发行IP

- 降低用户理解成本，兼顾 Web2 与 Web3 用户

- 保留创作者经济与收益分配闭环



## **二、核心心智模型**



```Plain Text
账号 = 创作者 = 一个 IP
  ├── 名下所有短剧/短视频自动归属（无需手动绑定）
  ├── 发行「IP 卡」合集（限量）
  └── 购买者持卡 → 分享该创作者的作品收益
```



一句话：**收藏你喜欢的创作者IP卡，卡片持有者分享他的作品收益。**





## **三、词汇表（旧 → 新）**



|旧词|新词|说明|
|---|---|---|
|角色 IP / 角色|创作者 IP|账号 = 创作者|
|签约角色|购买 IP 卡|购买NFT获得 IP 卡|
|NFT|IP 卡|Web2 友好，限量、可升级、可转售|
|片酬|积分|按认证粉丝数每周产出|
|片酬/h|积分/h|产出单位|
|角色IP市场页|IP 市场|购买IP的市场|
|经纪人页|IP 收益|持卡 \+ 积分 \+ 收益|
|演出|激活|IP 卡激活中 → 产出积分|
|候场|未激活|IP 卡未激活 → 不产出积分|
|休息|停用|用户主动停止产出|
|体力|能量|激活期间消耗，耗尽自动转未激活|
|体力包|能量包|恢复卡片产出|
|训练手册|经验包|提升收益权重|
|挖矿|瓜分奖池|积分占比瓜分平台周奖池|
|Pass|通行证|平台通用入场资格，防刷（关注与持有无先后顺序）|
|粉丝|粉丝|只看关注关系|
|认证粉丝|认证粉丝|同时满足「持有通行证 \+ 关注该创作者」的用户（无先后顺序）|
|创作者|创作者|发行 IP 卡的人|



## **四、完整用户流程**



### **创作者侧**

1. 注册账号

2. 创作短剧 / 短视频（自动归属账号）

3. 发行 IP 卡：选择发行数量100\-5000 → 生成创作者IP 

    1. 限制条件：认证粉丝数 ≥ 10

    2. 持有通行证

4. 粉丝增长 → 认证粉丝增多 → 积分产出增加

5. 创作者可自持一部分 IP 卡（自己也是持卡人，产出积分）

6. 收益来源：卖卡收入分成USDC \+ 持卡产出积分瓜分奖池STORY \+ 交易版税USDC

### **投资者侧**

1. 购买平台通行证（通用入场资格，防刷；与关注无先后顺序）

2. 关注创作者（与持有通行证无先后顺序）→ 同时满足即成为认证粉丝

3. 购买该创作者的 IP 卡（限量）

4. 每周积分 = 所持卡片所属账号的认证粉丝数总和

5. 按积分占比瓜分平台每周 STORY 奖池

6. IP 卡可升级（消耗资源，提升收益权重）

    1. 消耗经验包

    2. 消耗同IP同等级卡

7. IP 卡可二级市场转售

**\-\-\-**



## **五、收益模型**



### **第 1 步：积分产出（线性，无上限）**

```Plain Text
积分 = A + B × 认证粉丝数
A = 固定小值（如 10），永不衰减
B = 1（1 粉丝 = 1 积分）
```

- 1 认证粉丝 = 1 积分（线性）

- 多卡持有：积分相加

- 积分无上限（仅作占比凭证，不直接产生 STORY）

### **第 2 步：瓜分平台奖池**

```Plain Text
我的 STORY = 全网周奖池 ×（我的积分 ÷ 全网积分）
```

- 平台每周设置总 STORY 奖池

- 所有用户按积分占比瓜分

### 升级

```Plain Text
1 张主体卡（保留，升级）
+ 1 张同等级耗材卡（销毁，作升级材料）
+ 训练手册（经验包，消耗）
→ 主体卡升 1 级（Lv1→Lv2）

例：Lv1→Lv2 = 1 张 Lv1 主体 + 1 张 Lv1 耗材 + N 本训练手册
```

- 总量 \-1（耗材销毁）→ 通缩升值保留

- 主体保留 → 玩家不损失「主卡」情感

- 训练手册有消耗场景 → 商店不空转（之前定「训练手册=升级 IP 卡」正好吻合）

### **已定决策汇总**

|项|结论|
|---|---|
|角色 IP 层|删除，账号 = IP|
|参与方式|购买 IP 卡|
|发行量|创作者自选，选完锁定，永不扩容|
|卡片升级|保留，2合1，消耗平台资源（经验包、同IP同等级卡）|
|玩法保留|激活/未激活/停用/能量（原演出/候场/休息/体力），对象换成IP 卡|
|道具|体力包=补能量、训练手册=升级卡|
|通行证|平台通用入场资格，防刷|
|收益判据|认证粉丝数（线性 = 积分）|
|积分|无上限，作占比凭证|
|奖池|平台周设总池，按积分占比瓜分|
|防摆烂|不设规则，信市场（NFT 价格 / 粉丝流失自然惩罚）|

## **六、共同创作**

- 功能和交互逻辑参考抖音

- 每个账号每月有4次共创

- 认证粉丝量达到10可以使用共创

- 默认一个视频可以邀请1个共创者，花费500STORY可以解锁1个位置， 可额外解锁2个。

- 发布短视频或短剧的时候可以邀请共创用户，但该用户账号必须发行了IP。

- 受邀者会收到邀请共创的通知，接受后即加入共创。



---



# 发行IP

## 一、目标与成功标准

把旧「发行角色IP」页（`create-actor.html`）改造为新模型下的\*\*「发行 IP」\*\*：账号 = 创作者 = 一个 IP，创作者发行限量 IP 卡合集，自己也是持卡人。所有导航入口文案同步「发行角色IP」→「发行IP」。

成功标准：从任一入口进入发行页 → 显示账号头像 \+ 默认带出 IP 名称/简介 → 填发行参数 → 发行成功弹窗 → 引导跳转「我的 IP」（`studio.html`），全程无「角色/签约/NFT」旧概念残留（本页范围内）。

## 二、已确认的产品决策

## 三、页面改造（create\-actor\.html）

### 3\.1 删除（旧「角色」概念）

- DreamOS 素材选择整块：`.dreamos-section`、搜索框、素材网格、`ACTOR_IP_DB`、`loadActorMaterials`/`renderActorGrid`/`selectActorMaterial`/`_selectedMaterial`/`renderEmptyState` 及相关 CSS

- 右侧调试开关 `dev-toggle-fixed`（「有素材/无素材」仅服务于素材选择）

- 旧成功文案「发行者也需要签约才能获得该角色哦～」

### 3\.2 新增/保留

- 头像预览：页面顶部显示账号头像（圆形，取自 `currentUser.avatar`），说明「IP 形象使用账号头像」

- IP 名称（默认 `currentUser.name`，可修改，20 字上限）\+ IP 简介（默认 `currentUser.bio`，可修改，500 字上限）

- 发行参数（保留旧逻辑）：发行总量 100–5000（锁定不可扩容）；定价模式 固定/曲线 切换；固定价格或曲线初始价格（USDC）；价格系数实时显示与 tooltip

- 手续费 1 USDC：保留

- 移动端（\<680px）布局：保留 step\-nav\-bar、底部发行按钮；标题改「发行IP」

### 3\.3 文案映射（本页内）

### 3\.4 数据与交互

- 提交数据改为 IP 卡语义：`{ name, desc, avatar: currentUser.avatar, totalSupply, minted: 1, available, holders: 1, price, initPrice, creator: currentUser.username, … }`（`minted/available` 按「创作者自持 1 张创世卡」处理，便于后续「我的 IP」页读取；如需不预持可调）

- localStorage 沿用 `storyfun_pending_actor` / `storyfun_created_actors` key（`actor-profile.html` 等仍读取，避免破坏跳转），值内字段语义调整

- 成功弹窗：「IP 卡合集「\{名称\}」已发行」\+ 主按钮「去我的 IP」→ `location.href='studio.html'`，副按钮「稍后再说」

## 四、入口文案同步（6 处 \+ 页面标题）

## 五、边界（本轮不做）

- 不改 `studio.html` 本体（其改造成「我的 IP」是后续需求；本轮发行成功仅跳转占位，页面标题届时再改）

- 不改 `actors.html` / `actor-profile.html` / `sign-modal.js` 等市场与签约链路（后续需求）

- 不做词表全站替换，只动本功能相关文件

## 六、验证与提交

- 浏览器验证：桌面 \+ 移动宽度打开 `create-actor.html`（头像、默认名称/简介、参数填写、提交、成功弹窗、跳转 studio\.html）；抽查 header/bottom\-nav 入口文案

- 每个入口文件改动后确认无残留「发行角色IP」文案（本功能范围）

- 单一 commit（如 `feat: 发行IP功能改造`）后 `git push`

## 七、假设

- 沿用文件名 `create-actor.html`（不重命名，避免 15 处引用连锁改动；URL 语义后续如需再议）

- `auth.js` 已提供 `currentUser.name/bio/avatar`，未登录时沿用 mock 用户兜底显示

- demo 无后端，发行即写 localStorage，与现有模式一致

# IP市场

## 一、目标与成功标准

1. 入口改「IP 市场」：actors\.html 页面标题及全站所有指向 actors\.html 的导航/链接入口文案统一

2. 片酬 → 积分：actors\.html 及其渲染组件内的「片酬」全部改为「积分」（含「片酬/h」→「积分/h」）

3. IP 编号统一：内置 6 个 IP 的短编号 `C001-C006` 改为 23 位数字（与发行页 `31389183018301831830801` 格式一致），卡片角标完整显示

## 二、改动清单

### A\. 入口「IP 市场」（页面标题 \+ 全部导航入口）

### B\. 片酬 → 积分

`actors.html`（12 处，含引导弹窗文案）：L426 排序 `片酬↓`→`积分↓`、L496 `片酬详情`→`积分详情`、L525 `片酬升级规则`→`积分升级规则`、L552/L567 `坐享片酬`→`坐享积分`、L575 `签约片酬高的演员`→`签约积分高的演员`、L579/L600 `赚取片酬`→`赚取积分`、L596 `提升 IP 的片酬`→`提升 IP 的积分`、L899 `· 片酬`→`· 积分`、L903 `Lv.1 片酬 = 价格系数 × 热度系数`→`Lv.1 积分 = …`、L956 `片酬 ×`→`积分 ×`

`actors_ios.html`（12 处）：与 actors\.html 一一对应同步

`actor-card.js`（6 处）：L451 `片酬/h`→`积分/h`（用户可见），其余为注释（L7/L338/L349/L389）同步替换

### C\. IP 编号统一为 23 位数字

- `actors.html` ACTORS\_DATA：6 个 `collection: 'C001'-'C006'` → 固定 23 位数字（首位非 0，与发行页 `generateIpId` 格式一致；示例格式 `31389183018301831830801`，6 个编号互不相同）

- `actors_ios.html` ACTORS\_DATA：同步替换

- `actor-card.js`：`ac-collection-tag` 角标样式适配 23 位长数字——缩小字号、允许 `word-break` 完整显示（用户已确认卡片完整显示，不缩写）

- `sign-modal.js` L932：tag 自动带出新的 23 位 collection，无需改逻辑，检查长数字在弹窗 badge 中不溢出

- 内部 `id`（'1'\-'6'）保持不变，跳转 actor\-profile 的 `?id=` 参数不受影响（已确认）

## 三、边界（本次不动，后续需求处理）

- 「签约/购买」概念（`sign-modal.js` 按钮文案、`studio.html` L1811 签约角色、`drama-player.html`/`recommend.html` 的「签约更多角色 IP」）

- 「角色 IP → 创作者 IP」概念替换（除上述入口外，页面内引导弹窗正文中的「角色 IP」说明文案）

- `index.html` 的「片酬/h」、`drama-card.js` 的「片酬/h」（非 actors 链路）

- `actor-profile.html` 内部签约/金库展示逻辑（仅返回链接 title 属本次）

## 四、验证

- 浏览器打开 actors\.html：标题「IP 市场」、卡片角标显示完整 23 位编号且不溢出、全页无「片酬」字样（grep 验证）

- 导航抽查：header/bottom\-nav/recommend 底部 tab/sidebar 显示「IP 市场」

- actors\_ios\.html 同步验证

- 点击卡片仍正常跳转 actor\-profile（id 参数不变）

## 五、提交

单一 commit（`feat: actors IP市场改版——入口/积分/IP编号统一`）后 push。

## 六、假设

- 底部导航等紧凑位置用「IP市场」（无空格），标题/导航用「IP 市场」（有空格）

- 23 位编号写死固定值（非随机），保证 demo 可复现、与发行页格式可对照

# 个人主页

## 一、背景与目标

保留 `actor-profile.html`（单 IP 详情页，一个账号可发行多个 IP 时各自有详情）。本次在三处页面增加「该用户发行的 IP」区块（强化显示），点击 IP 卡片进入 `actor-profile.html?name=xxx`：

1. `profile-center.html`（我的个人中心，桌面\+移动）

2. `profile-center-ios.html`（iOS 风格个人中心）

3. `user-profile-visitor.html`（他人主页）

## 二、已确认决策

## 三、数据契约（复用现有）

`storyfun_created_actors`（create\-actor\.html 发行时写入，key = IP 名称，value 含）：

- `name`（IP 名称）、`avatar`（账号头像）、`ipId`（23 位编号）、`totalSupply`（发行量）、`minted`/`available`（持有/剩余）

读取逻辑统一为一个内联函数（各页面独立实现，保持原型风格）：

js

复制

```Plain Text
function getMyIssuedIPs() {  try { return Object.values(JSON.parse(localStorage.getItem('storyfun_created_actors')) || {}); }  catch(e) { return []; }}
```

## 四、改动明细

### profile\-center\.html（桌面 \+ 移动）

- 桌面：在「Desktop User Info Card」与「Desktop Tabs」之间插入区块（`id="issuedIPSection"`）：标题「发行的 IP」\+ 横向卡片列表（每卡：头像、名称、23 位编号）；无发行时显示「还未发行 IP」\+「去发行」按钮（跳 `create-actor.html`）

- 移动：在「MOBILE ASSETS ACTIONS」与「MOBILE TABS」之间插入同区块（移动横向滑动）

- JS：`DOMContentLoaded` 后调用渲染函数，读 `storyfun_created_actors`，卡片 `onclick` → `actor-profile.html?name=<encodeURIComponent(name)>`

- 样式：复用现有卡片风格，强化显示（区块标题稍大、卡片描边）

### profile\-center\-ios\.html

- 在「MOBILE PROFILE SECTION / MOBILE ASSETS」之后、「MOBILE TABS」之前插入同区块（结构与移动端一致）

- JS 渲染逻辑同上

### user\-profile\-visitor\.html（他人主页）

- 在「mobile\-profile\-section」（含关注按钮、stats）之后、「mobile\-tabs」之前插入区块，标题「TA 发行的 IP」

- 他人视角数据：优先读 `storyfun_created_actors`（demo 中当前用户即创作者）；空态显示「TA 还未发行 IP」；JS 渲染逻辑同上（不含「去发行」引导，仅展示）

## 五、边界（本轮不动）

- `actor-profile.html` 本体内容（发行信息/金库/签约/曲线/升级）——保留原样

- 底部导航/侧边栏的 profile 入口结构

- 卡片点击后的 actor\-profile 展示逻辑（后续需求若需重构再议）

## 六、验证

- 先在 create\-actor\.html 发行 1\-2 个 IP → 打开三个页面，均显示发行的 IP 卡片（头像/名称/23 位编号），点击进入 actor\-profile

- 未发行时：profile\-center 显示空态 \+ 去发行引导；visitor 页显示空态

- 桌面/移动宽度分别检查 profile\-center 布局

## 七、提交

单一 commit（`feat: 个人中心增加发行的IP区块`）后 push。

## 八、假设

- demo 无真实多用户，「他人主页」的 IP 数据也读同一 localStorage（当前用户视角），符合原型演示定位

- 22 位编号直接展示完整数字（与 actors\.html 角标风格一致）

# Pass

# Pass（通行证）功能规划：独立页面 \+ 多入口（需求 5）

## 一、目标

新增「Pass 通行证」——平台通用入场资格（防刷，持有通行证 \+ 关注 = 认证粉丝），以独立页面 `pass.html` 承载，多入口组合触达：桌面侧边栏 \+ 移动「我」页资产区 \+ IP 市场引导条。

## 二、已确认决策

## 三、改动明细

### 新建 `pass.html`（独立页面，纯前端 mock）

结构（参考 actors\.html 黑白风 \+ profile\-center 卡片风格，引入 auth\.js / load\-sidebar\.js / load\-desktop\-header\.js）：

- 顶部状态卡：Pass 持有状态（已持有/未持有），未持有显示价格与「购买」主按钮，已持有显示「已生效」\+ 到期/状态

- 权益说明区（3 项卡片）：

    1. 入场资格——持有 Pass 才能成为「认证粉丝」、参与积分瓜分

    2. 防刷机制——一个账号一份，平台级通用，与关注先后无关

    3. 创作者权益——发行 IP、被认证粉丝支持获得分成

- 购买流程：点击购买 → 确认弹窗（价格，mock 如 9\.9 USDC）→ 购买成功 → 状态卡刷新为「已持有」\+ localStorage 记录（`storyfun_pass_held` = '1'）

- 未持有空态引导文案从创作者/用户利益角度（沿用「将账号发行成 IP…」的文案风格）

### 桌面侧边栏入口（`load-sidebar.js`）

- 在「我的」与「白皮书」之间的 nav 插入：

- html

- 复制

```Plain Text
<a href="pass.html" class="sb-nav-item" data-page="pass.html">  <svg>…票券图标…</svg><span class="sb-label">Pass</span></a>
```

### 移动「我」页资产区（`profile-center.html` \+ `profile-center-ios.html`）

- 在 `.mobile-assets`（STORY/USDC 行）后追加 Pass 行（或与资产行并列）：

    - 未持有：显示「Pass 通行证 · 未持有」\+ 点击跳 `pass.html`

    - 已持有：显示「Pass 通行证 · 已生效」

- 桌面端 `user-info-card` 右栏下方或资产相关位置不加（桌面已走侧边栏入口，避免重复）

### IP 市场引导条（`actors.html` \+ `actors_ios.html`）

- 页面顶部标题行下方插入轻量引导条：未持有 Pass 时显示「购买 IP 卡需先持有 Pass 通行证 → 去购买」（点击跳 `pass.html`）；已持有则隐藏

- 读取 `localStorage.storyfun_pass_held` 控制显隐

### 数据契约

- `localStorage.storyfun_pass_held`：'1' = 已持有，null/其他 = 未持有

- pass\.html 购买成功写入；入口与引导条读取

- mock 价格：9\.9 USDC（可后续调整）

## 四、边界（本轮不做）

- 不接入真实支付/链上逻辑（原型 mock）

- 不改认证粉丝判定逻辑（social\.html 的 certified 数据仍为静态 mock）

- 不改底部导航 tab（已满，不加第 6 项）

## 五、验证

- 打开 pass\.html：未持有 → 购买 → 成功 → 状态刷新；刷新页面状态保持（localStorage）

- 桌面侧边栏出现「Pass」项，点击进入 pass\.html，当前页高亮

- 移动「我」页资产区显示 Pass 状态，点击跳 pass\.html

- IP 市场顶部引导条：未持有显示、已持有隐藏

- 三处入口与 pass\.html 状态联动（购买后全部显示已持有）

- 语法检查 \+ 冒烟测试

## 六、提交

单一 commit（`feat: Pass通行证页面与多入口`）后 push。

## 七、假设

- 桌面用侧边栏入口（用户指定）；顶部 header 不加（避免与侧边栏重复）

- 移动端「我」页资产区是主入口，IP 市场引导条是场景化补充

- 页面风格沿用现有黑白高对比 \+ 卡片式，不引入新设计语言

