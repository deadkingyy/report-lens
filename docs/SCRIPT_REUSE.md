# `../script` 资产复用说明

本开源项目刻意**复用赢麻了专业版的分析资产**（`../script` 目录下的同花顺 XScript），而非另起炉灶。这样做的好处：开源版与专业版**计算口径一致**，且字段可逐一定位到专业版源码。

> 以下路径与键名均来自 `../script` 实际文件，可作为溯源依据。

## 1. 复用的资产清单

| 专业版资产 | 本仓库对应 | 复用内容 |
| --- | --- | --- |
| `sys/rptdom/stmt_tree.xs` | `schema/types.ts` + `compute.ts` + `derivations.ts` | 三表字段 schema（`col`）+ 派生指标 `drv` 运算 |
| `sys/rptdom/note_query.xs` | `schema/types.ts` (`FootnoteItem`) + `data/provider.ts` | 附注角标 `note_index`、明细 `notes_for`（按专业代码） |
| `sys/rptdom/note_links.xs` | （静态目录） | 专业代码 ↔ 科目（`IO`=存货、`MFNS`=货币资金…） |
| `sys/metric/hroe_b2.xs` | `analysis/roe.ts` | ROE 杜邦分解（归母/普通股口径） |
| `sys/statement.xs` | `data/loader.ts` + `provider.ts` | 期间 / 报表加载次序 |

## 2. stmt_tree.xs —— 三表 schema 与派生指标

`stmt_tree.xs` 是聚源线三表 schema 的快照（由 `scripts/gen_stmt_tree_xs.py` 重抽生成）。每个叶子节点形如：

```xs
{"k":"AR","cn":"　　(其中)应收账款","col":"accounts_receivable"}
{"k":"GM","cn":"　　毛利率(GM)","pct":1,"drv":{"d":"margin","a":"operating_cost","b":"total_revenue"}}
```

- `col`：直接成为本仓库 `BalanceSheet` / `IncomeStatement` / `CashFlowStatement` 的字段名（**同名**）。
- `drv`：派生指标的运算式。`derivations.ts` 的 `evalDrv()` 复刻了这些运算：
  - `margin(a, b)` → (b − a)/b，毛利率
  - `share(a, b)` → a/b，费用率
  - `sum_share(b, [..])` → 多项之和 / b，四费率
  - `div(a, b)` → a/b，流动比率
  - `quick(a, b, m)` → (a − m)/b，速动比率（剔除存货）
  - `sub(a, b)` → a − b，净营运资本
  - `sum([..])` → 五项和，有息负债
  - `add(a, a2)` → 应收票据 + 应收账款

口径披露（`stmt_tree.xs` 头注释 §4.3）：速动=(流动−存货)/流动负债；净营运资本=合计差；**有息负债=五项和**（短借/一年内到期/长借/应付债券/租赁负债）；重资产缺生产性生物资产列。本仓库 `compute.ts` 完全遵循。

## 3. note_query.xs —— 附注分析

专业版附注查询通过两个 XScript 函数暴露：

- `rptdom.note_index(sym)` → **附注角标**，返回 `{ code: { cn, periods } }`，按专业代码（IO/MFNS/…）索引某标的哪些科目有附注、覆盖哪些年份。
- `rptdom.notes_for(sym, code, period)` → **某字段某年的附注明细**，返回 `{ code, cn, period, source, sections:[{title, columns, rows}] }`。

本仓库的 `FootnoteItem.code` 直接使用这些专业代码；`data/provider.ts` 的 `WinmaleOpenProvider` 在接入开放平台后，可用同样的 `(sym, code, period)` 语义回填真实附注明细，车道（`sina` 优先、缺则回落 `pdf`）与专业版一致。

> 开源内置示例仅含精简后的附注明细（`src/data/samples/*`），用于演示「关键科目穿透」；完整附注网格由赢麻了专业版提供。

## 4. hroe_b2.xs —— ROE 杜邦

`sys/metric/hroe_b2.xs` 对 ROE 做口径拆分：

- **归母口径**：`归母ROE = 归母净利率 × 总资产周转率 × 杠杆系数`，其中
  - 归母净利率 = 归母净利润 TTM / 营收 TTM
  - 总资产周转率 = 营收 TTM / 平均总资产
  - 杠杆系数 = 平均总资产 / 平均归母权益
- **普通股口径**：再扣除其他权益工具（`OEIR`，含优先股/永续债），即 `普通股权益 = 归母权益 − 其他权益工具`。

本仓库 `analysis/roe.ts` 实现**归母口径**杜邦（用相邻期均值近似 TTM 多点均值），并以瀑布图展示 `净利率 × 周转率 × 杠杆` 三因子对 ROE 的贡献。普通股口径与加权/多点近似的更精细版本在专业版中提供。

## 5. 复用原则（给贡献者）

1. **字段不动名**：若专业版 `stmt_tree.xs` 的 `col` 改名，本仓库 `schema` 应同步改名并保留注释溯源；不要为「好看」自造字段。
2. **公式对齐**：新增派生指标时，优先在 `derivations.ts` 用 `evalDrv` 表达，与 `drv` 运算同构，不要手写裸算式。
3. **口径披露**：涉及速动、有息负债等敏感口径，注释里写明与专业版 §4.3 口径一致。
4. **缺失即降级**：真实数据常有缺口（扣非、同业基准），用 `warnings` 提示并引导连接赢麻了专业版，不要静默造假值。
