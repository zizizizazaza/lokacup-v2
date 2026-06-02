# LokaCup v2 — 直播桌 PRD

> 版本：2026-06-01 v2
> 分支：`demo-v2`
> 范围：仅功能（页面 / 输入 / 输出 / 交互），定价不讨论

---

## 一、产品定位

### 一句话

**世界杯 AI 预测的"赌桌直播间"**——用户进来不是面对一个空输入框，而是看到正在进行的"主播 × AI 多 Agent"对话，可以围观、可以 fork 出来自己跟 AI 聊。

### v1 → v2 的最大变化

| 维度 | v1 | v2 |
|------|----|----|
| **核心交互** | 单人对 AI 提问，得到分析结果 | 围观"主播 × AI"对话流；可 fork 成私聊 |
| **首页主体** | 输入框 + 热门市场卡片 | **赌桌列表**（live tables 网格） |
| **冷启动** | 用户必须自己提问 | 系统永远兜底 8-12 张官方 AI 主播桌 |
| **传播形态** | 单人分析 → 分享卡片 | 围观 → fork → 发布 → 新桌（自带裂变） |
| **AI 角色** | 工具 | **主播 + 工具 双重身份** |

### 不做什么

- ❌ 不做真钱下注（保留"去 Polymarket 下注"跳转）
- ❌ 不做用户竞猜积分（MVP 不做，预留位置）
- ❌ 不做多 AI 人格化（统一"LokaCup AI"主播）
- ❌ 不做语音 / 视频直播（纯文本桌）
- ❌ 不做账号系统（fork 用本地 ID + 钱包风格匿名 handle）

---

## 二、核心概念

### 2.1 桌（Table）

**一个市场 + 一个主播 + 多人围观**的最小单元。

```
Table {
  id, marketUrl, marketTitle, currentPrice
  host: { id, handle, isAI }
  status: live | paused | closed
  spectatorCount, forkCount
  messages: [ {role: 'host'|'ai'|'spectator', text, ts} ]
  spectators: [ {handle, joinedAt} ]
}
```

### 2.2 主播（Host）

桌的话语权拥有者，唯一能直接 prompt AI 的人。两种来源：

- **AI 主播**（官方桌）：系统自动开桌，AI 自己发问、自己分析、自己迭代
- **用户主播**（用户桌）：用户开桌后自己当主播

### 2.3 围观者（Spectator）

加入桌但不发言的人。可以：
- 实时看主播 × AI 的对话流
- 看到其他围观者列表
- 随时 **fork**

### 2.4 Fork

把当前桌的对话历史复制到自己的私聊里，从某条 AI 消息之后继续问。
- Fork 默认 **私有**
- Fork 后我成为我自己 fork 的"主播"
- 可以选择 **Publish**——我的 fork 出现在桌列表，成为新桌

---

## 三、页面结构

总共 **3 个核心页面 + 1 个辅助页面**。

```
┌─────────────────────────────────┐
│  /  桌列表（首页）                │
│  - 视频 Hero（保留）              │
│  - Live Tables 网格              │
│  - 顶部 Filter                  │
│  - "Open my own table" 入口     │
└─────────────────────────────────┘
            ↓ 点桌子
┌─────────────────────────────────┐
│  /table/{id}  桌内              │
│  - 主聊天区（主播 × AI 对话流）   │
│  - 右栏：市场信息 / 围观者 / 弹幕  │
│  - 每条 AI 消息可 Fork           │
└─────────────────────────────────┘
            ↓ 点 Fork
┌─────────────────────────────────┐
│  /fork/{id}  我的私聊            │
│  - 顶部：From 原桌 + Publish     │
│  - 主聊天区：我 ↔ AI 一对一      │
└─────────────────────────────────┘

辅助：
┌─────────────────────────────────┐
│  /open  开桌引导                 │
│  - 粘贴 Polymarket 链接         │
│  - 选 AI 主播 or 自己当主播      │
└─────────────────────────────────┘
```

**导航**：顶部 Nav 只有两项 ——「Tables」「My Forks」。

---

## 四、页面一：桌列表（/）

### 4.1 视频 Hero（保留 v1）

视频背景 + 大标题，但去掉输入框，改成单一 CTA：

- 标题：**WORLD CUP AI PREDICTION**
- 副标题：**Live tables, real-time AI analysis. Watch, fork, debate.**
- 主 CTA：[Browse live tables ↓]（滚动到下方）
- 次 CTA：[Open my own table]（去 `/open`）

### 4.2 桌列表网格

```
┌───────────────────────────────────────────┐
│  🔴 Live tables                            │
│  All · Official · User · Hot              │
│                                            │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ 🤖 Official  │ │ 👤 0xA1c3... │ 👀 24  │
│  │              │ │              │ 🍴 3   │
│  │ Brazil vs    │ │ Will France  │         │
│  │ Morocco who  │ │ top Group D? │         │
│  │ wins?        │ │              │         │
│  │              │ │              │         │
│  │ AI: 71% BRA  │ │ AI: 88% YES  │         │
│  │ Market: 68%  │ │ Market: 82%  │         │
│  │              │ │              │         │
│  │ "Casemiro    │ │ "Mbappé      │         │
│  │  doubt may"  │ │  starts..."  │         │
│  │              │ │              │         │
│  │  Watch →     │ │  Watch →     │         │
│  └──────────────┘ └──────────────┘         │
│                                            │
│  ... 8-12 张桌                              │
└───────────────────────────────────────────┘
```

每张卡片显示：

| 元素 | 内容 |
|------|------|
| 主播头像 + 标签 | 🤖 Official AI / 👤 0xA1c3...b27e（匿名 handle） |
| 围观数 | 👀 24 |
| Fork 数 | 🍴 3 |
| 市场问题 | "Brazil vs Morocco who wins?" |
| AI 共识价 vs 市场价 | "AI 71% · Market 68%" |
| 最近一条话题摘要 | 一句话引用最新 AI 消息开头 |
| 状态指示 | 🔴 LIVE / ⏸ Paused / ⏹ Closed |
| 入口 | "Watch →" |

### 4.3 Filter Chips

`All | Official | User | Hot 🔥 | Closing soon ⏰`

- **Official**：AI 主播桌
- **User**：真人主播桌
- **Hot**：按围观数 + fork 数排序
- **Closing soon**：对应市场即将解算（< 2h）

### 4.4 "Open my own table" 入口

固定在网格右下角的浮动按钮 ➕，跳 `/open`。

---

## 五、页面二：桌内（/table/{id}）

### 5.1 整体布局

```
┌──────────────────────────────────────────┬────────────────────┐
│  顶部条                                    │                    │
│  [← Back]  🇧🇷 Brazil vs Morocco 🇲🇦       │  右侧栏（可折叠）   │
│  Host: 🤖 LokaCup AI · 👀 24 · 🍴 3       │                    │
│  AI consensus 71% · Market 68% (+3pt)    │  ── 市场详情 ──     │
│                                            │  Polymarket link   │
├──────────────────────────────────────────┤  Current orderbook │
│                                            │  Volume 24h        │
│  主聊天区（主播 × AI 对话流）              │                    │
│                                            │  ── 围观者 ──      │
│  🤖 [Host]                                 │  0xA1c3 (host)    │
│  > What's the xG difference?               │  0xB244            │
│                                            │  0x91dd            │
│  🧠 [AI · 4 agents]                        │  +21 more         │
│  Reading live data: BRA xG 1.8 vs 0.9...   │                    │
│  [Block 1 · Snapshot]   [🍴 Fork from here]│  ── 弹幕 ──        │
│                                            │  (mode: read only) │
│  🤖 [Host]                                 │  spectator 1: "BRA│
│  > What if Casemiro goes off?              │   looks shaky"    │
│                                            │  spectator 2: "MAR│
│  🧠 [AI]                                   │   xG rising..."   │
│  Probability drops to 64%...               │  [Send a comment] │
│  [🍴 Fork from here]                       │                    │
│                                            │                    │
└──────────────────────────────────────────┴────────────────────┘
```

### 5.2 主聊天区

**消息类型**：

| 类型 | 渲染 | 谁能发 |
|------|------|--------|
| **Host message** | 头像 🤖/👤 + 问题文本，对齐左侧 | 仅主播 |
| **AI message** | AI 头像 + 结构化回答 + Fork 按钮 + Meta 标签（如 "Block 01 · Snapshot"） | 系统 |
| **System event** | 居中浅色（"Vinicius scored at 58'"、"Polymarket moved 62% → 68%"） | 系统 |

**Fork 按钮**：每条 AI 消息**右下角**有 `🍴 Fork from here` 小按钮。点击 → 创建 fork → 跳 `/fork/{newId}`。

**流式输出**：AI 消息逐字流式显示。围观者实时看到打字过程。

**滚动**：默认自动跟到最底；用户手动上滑后 → 显示 "Jump to latest ↓" 浮动按钮。

### 5.3 右侧栏（三段）

#### (a) 市场详情
- Polymarket / Kalshi 链接 + "View on Polymarket ↗"
- 当前实时 orderbook（YES / NO 一价 + 深度）
- 24h volume + 价格走势 mini chart

#### (b) 围观者列表
- 头像 + handle（钱包风格 ID）
- Host 高亮标记
- 显示前 5 个 + "+N more"

#### (c) 弹幕区（可选 v2.1）
- 围观者可发短弹幕评论（≤ 100 字）
- 弹幕**不进入主聊天区**，只显示在右栏
- AI 不会读弹幕——纯人类之间互动
- MVP 可先做"只读弹幕"：仅显示，不可发；v2.1 再开放发言

### 5.4 顶部条

| 元素 | 内容 |
|------|------|
| 返回 | `← Back to tables` |
| 桌标题 | 🇧🇷 Brazil vs Morocco 🇲🇦 |
| Host 信息 | 🤖 LokaCup AI / 👤 0xA1c3... |
| 围观数 | 👀 24 |
| Fork 数 | 🍴 3 |
| 价格对比 | AI consensus 71% · Market 68% (+3pt) |
| 折叠右栏 | `[<] / [>]` 切换 |

### 5.5 交互逻辑

| 用户身份 | 能做什么 |
|---------|---------|
| **匿名访客** | 围观、看弹幕、Fork |
| **主播本人**（如果是用户主播） | 围观所有以上 + 唯一能发问给 AI 的人 |
| **官方桌** | 主播是 AI 自己，没人能 prompt（除非 fork 自己问） |

### 5.6 AI 主播怎么"主持"官方桌

完全不需要人类介入。AI 自己跑一个循环：

```
while (market is open and table is live):
  1. 检测新事件：比赛事件 / 价格变动 / 阵容变化
  2. 如果有 → AI 自己提问（模拟主播）："Vinicius just scored — does this change AI consensus?"
  3. AI 自答（多 Agent 共识）
  4. 等 ~30 秒；如果围观者发了高质量弹幕（v2.1+），可加入参考
  5. 回到 step 1
```

效果：**任何时候进来都有内容在更新**，对话流持续滚动。

### 5.7 空状态

| 状态 | 行为 |
|------|------|
| 0 围观者 | 不显示围观数；仅显示桌内容 |
| 比赛已结束 | 自动 archive 桌；对话变成只读历史；标记 "Closed" |
| AI 卡顿 / 错误 | 顶部红条 "AI is reconnecting..." |

---

## 六、页面三：Fork 私聊（/fork/{id}）

### 6.1 布局

```
┌────────────────────────────────────────────┐
│  顶部                                       │
│  [← Back]  🍴 Forked from "Brazil vs MAR"  │
│  by 🤖 LokaCup AI · forked at msg #17      │
│  [Publish to public table]                 │
├────────────────────────────────────────────┤
│  历史对话（复制自原桌截至 fork 点）          │
│  - 灰色背景标识 "─ from original ─"        │
│                                             │
│  我的对话（从这里开始我和 AI 一对一）        │
│  - 标识 "─ my fork ─"                      │
│                                             │
│  [输入框] Ask AI anything...                │
└────────────────────────────────────────────┘
```

### 6.2 复制规则

- 复制原桌**截至 fork 点**的所有 Host 消息 + AI 消息
- 不复制原桌的弹幕 / 围观者
- fork 创建后，原桌的新消息**不再同步**到我的 fork

### 6.3 Publish

- 默认 fork 为私有
- 点 "Publish to public table" → 我的 fork 出现在桌列表
- Publish 后**禁止再修改 fork 起点**（防止主播搞坏对话历史）
- Publish 后我自己成为这个新桌的主播

### 6.4 关系链

- Fork 顶部永远显示 "Forked from `[原桌名]`"
- 原桌内有 "Forks: 3" 计数，点开可看到所有 published fork 的列表
- 形成一个 "讨论树"

---

## 七、辅助页面：Open Table（/open）

非常简单的引导页：

```
┌─────────────────────────────────────────┐
│  Open your own table                     │
│                                          │
│  [Polymarket / Kalshi URL          ]    │
│                                          │
│  Host preference:                        │
│  ( ) Let LokaCup AI host (auto)         │
│  (•) I'll host (I prompt the AI)        │
│                                          │
│  [ Open table ]                          │
└─────────────────────────────────────────┘
```

提交后跳到 `/table/{new_id}` 我成为主播（或 AI 自动接管）。

---

## 八、关键工程能力

### 8.1 后端

| 能力 | 说明 |
|------|------|
| **桌列表 API** | 返回所有 live 桌 + 元数据（围观数、fork 数等） |
| **桌实时订阅** | WebSocket 推送：新消息 / 围观数变化 / 市场价变化 |
| **AI 主播任务** | 后台 worker 每 ~30s 检查官方桌是否需要新发言 |
| **Fork 创建** | 服务器 atomic 复制对话上下文 + 生成新桌 |
| **匿名 handle** | 浏览器首次访问生成 `0xXXXX...XXXX` 形式 ID 写入 localStorage |
| **市场数据接入** | Polymarket Gamma + CLOB 订阅 |
| **比赛数据接入** | Sportradar / StatsBomb（赛事事件用于触发 AI 主播发言） |

### 8.2 前端核心组件

| 组件 | 用途 |
|------|------|
| `<TableCard />` | 桌列表卡片 |
| `<TableRoom />` | 桌内主聊天 + 右栏 |
| `<HostMessage />` | 主播消息气泡 |
| `<AIMessage />` | AI 回答气泡（含 Fork 按钮 + Meta 标签） |
| `<SystemEvent />` | 系统事件（进球、价格变动） |
| `<SpectatorList />` | 围观者列表 |
| `<MarketSidebar />` | 右栏市场详情 |
| `<DanmakuPanel />` | 弹幕区（v2.1） |
| `<ForkButton />` | Fork 按钮 |
| `<ForkPage />` | Fork 私聊页 |
| `<PublishDialog />` | Publish fork 弹窗 |

### 8.3 实时性预算

| 数据 | 推送频率 |
|------|---------|
| 主聊天新消息 | 实时（WebSocket） |
| AI 流式输出 | 流式 SSE / WS |
| 围观者人数 | 5s |
| Polymarket 价格 | 10s |
| 弹幕 | 实时 |
| 桌列表卡片更新 | 30s |

---

## 九、范围内 vs 范围外

### v2 MVP 范围内

- ✅ 桌列表页（含官方 AI 主播桌 + 用户桌）
- ✅ 桌内页（主播 × AI 对话流 + 围观者列表 + 市场详情）
- ✅ AI 主播自动循环主持官方桌
- ✅ 用户开桌（自己当主播 prompt AI）
- ✅ Fork 机制 + Publish
- ✅ 匿名 handle 系统
- ✅ Polymarket 跳转
- ✅ 中英双语

### v2 MVP 范围外（v2.1+ 再做）

- ⏸️ 弹幕（围观者互相聊）—— 先做只读
- ⏸️ 竞猜机制（猜主播下哪边）
- ⏸️ 多 AI 人格化（Dataman / Newshound 分头开桌）
- ⏸️ 真实账号系统 / 钱包登录
- ⏸️ 推送通知（"你 fork 的桌有新消息"）
- ⏸️ 排行榜（top forker / top accuracy）
- ⏸️ 历史 archive 浏览（已结束桌的复盘）
- ⏸️ 私桌 / 邀请制

---

## 十、用户旅程示例

### Journey A — 第一次访问者（80% 用户）

1. 进 `/` → 看到视频 Hero + 下方 8 张桌
2. 随便点一张官方桌"Brazil vs Morocco who wins?"
3. 看 AI 主播 × AI 对话流（每 30s 更新一条）
4. 觉得有趣，看了 3 分钟
5. 想知道"如果 Casemiro 下场会怎样" → 点最后一条 AI 消息的 🍴 Fork
6. 进 `/fork/abc123` → 自己问 AI → 得到回答
7. 觉得回答不错，点 Publish → fork 出现在桌列表
8. 自己回到 `/` 看到自己的桌已经有 2 个围观者了 😊

### Journey B — 重度用户（Polymarket 玩家）

1. 进 `/` → 看到 12 张桌
2. Filter "Hot 🔥" → 找成交量最大的市场
3. 进桌 → 边看 AI 主播分析 + 边看右栏 Polymarket 实时 orderbook
4. 看到一条 AI 论据自己有疑问 → Fork → 私聊深挖
5. Fork 里 AI 给出 +5pt edge 信号
6. 点桌内顶部"View on Polymarket ↗"跳过去下注
7. 回来继续围观下一张桌

### Journey C — 想自己当主播

1. 进 `/` → 右下角 ➕ "Open my own table"
2. 粘贴 Polymarket 链接 + 选"I'll host"
3. 跳到自己的桌
4. 自己问 AI 问题，AI 回答
5. 桌出现在公开列表，开始有人围观
6. 一边主持一边看围观数涨

---

## 十一、设计原则

1. **进来就有内容**：永远不让用户面对空界面；官方桌兜底
2. **观察优于参与**：80% 用户只想看，20% 想参与；fork 是参与的轻量入口
3. **匿名优先**：避免身份焦虑；自动生成钱包风格 handle
4. **AI 是主角，不是工具**：v2 的 AI 既"答问题"也"主持节目"
5. **可分叉、可发布、可重组**：内容可流动，自带传播机制
6. **不阻断跳 Polymarket**：分析的目的就是去下注

---

## 附录：与 v1 的迁移说明

| v1 概念 | v2 对应 |
|---------|---------|
| 提问页（输入框 + Hot markets + Suggested questions） | 桌列表页（输入框被移除，CTA 换成"Browse tables" + "Open your own"） |
| 分析结果页（6 个 Block） | 桌内页（AI 消息保留 Block 结构，但流式追加，不再一次性渲染完整报告） |
| 历史准确率页 | 桌列表的"Closed" filter（已结束桌即历史档案） |

**复用**：v1 的多 Agent 共识架构、数据接入、视频 Hero、设计系统 100% 复用。变的只是产品形态。
