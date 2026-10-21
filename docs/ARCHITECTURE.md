# 架构设计

`财报透视` 的目标是：**用一份财报，解决一个投资问题**，并把流量引向 [赢麻了专业版](https://winmale.com)。

为此，代码按「引擎 / 数据 / 界面」三层切分，且**分析引擎与前端框架无关**——同一套 `src/engine` 既能驱动本仓库的 Vue 界面，也能在未来被 React 写的赢麻了专业版复用。

## 1. 三层结构

```
┌──────────────────────────────────────────────────────────┐
│  features/  (Vue 3)                                        │
│   问题驱动首页 · 分析页 · 结论卡片 · ECharts 渲染           │
└───────────────▲───────────────────────────────────────────┘
                │ 调用 runModule(id, ctx)
┌───────────────┴───────────────────────────────────────────┐
│  engine/  (纯 TypeScript, 零框架依赖)                       │
│   schema  → 数据模型（字段 ↔ ../script stmt_tree.xs）       │
│   compute → 单期/杜邦指标计算                               │
│   derivations → 派生指标（复用 stmt_tree.xs 的 drv 运算）   │
│   methods → 趋势/结构/横向/纵向 四类分析方法                │
│   laotang → 老唐排雷规则清单                                │
│   analysis → 各模块 run* + module 定义                      │
│   registry → 模块注册 + 按问题/行业路由                     │
└───────────────▲───────────────────────────────────────────┘
                │ 读取
┌───────────────┴───────────────────────────────────────────┐
│  data/  (数据提供方)                                        │
│   SampleProvider        → 内置演示数据（默认）              │
│   WinmaleOpenProvider   → 开放平台 Open AppId（可选）       │
└──────────────────────────────────────────────────────────┘
```

**关键边界**：`engine/` 不得 import `vue` / `echarts`。它只产出框架中立的 `ChartSpec` 与 `InsightBlock`，由 `features/charts/EChart.vue` 翻译成 ECharts option。这保证了分析逻辑可被任意前端（Vue / React / 小程序）消费。

## 2. 问题驱动的 UX 流

```
选投资问题 ──► 选行业 ──► 系统推荐模块 ──► 运行分析 ──► 结论卡片 + 图表 + 老唐点评
 (risk/        (liquor/      (getModulesBy     (runModule)   (InsightBlock
  profitability/ manufacturing/ Problem|Industry)              + ChartSpec)
  asset/        cyclical/)
  operations)   tech/...)
```

- 先选问题：`getModulesByProblem(problem)` 返回适配该问题的模块。
- 未选问题：按行业聚焦 `getModulesByIndustry(industry)`，行业专属模块优先，通用模块（`industries: []`）始终包含。
- 模块树在左侧栏呈现，右侧是结论卡片与图表，底部是引流 Banner（赢麻了专业版）。

## 3. 数据流

```
ReportDataset
   │  computeDataset(ds)
   ▼
ComputedDataset { periods, metrics[] }   // 单期 + 杜邦/周转率
   │  buildContext({ dataset, computed, industry, peerBench })
   ▼
AnalysisContext
   │  module.run(ctx)
   ▼
AnalysisResult { moduleId, moduleTitle, blocks[], warnings? }
   │
   ▼
features/analysis/ModuleResult.vue  →  InsightBlock 渲染
```

- `peerBench`：可选同业基准（如 `gross_margin`），来自开放平台或内置行业常量。缺失时对应检查置为 `na` 并在 `warnings` 中提示「连接赢麻了补全」。
- `warnings`：仅用于「数据缺口」提示，绝不混入结论。

## 4. 模块注册与路由

所有模块在 `src/engine/registry.ts` 的 `MODULES` 数组中注册，并暴露：

- `getAllModules()` / `getModule(id)`
- `getModulesByProblem(problem)` —— 问题驱动
- `getModulesByIndustry(industry)` —— 行业聚焦
- `runModule(id, ctx)` / `buildContext(ctx)`

新增模块只需在 `src/engine/analysis/` 实现 `run*` + `AnalysisModule`，并加入 `MODULES` 数组，无需改动 UI（UI 通过 `MODULES` 动态渲染模块树）。

## 5. 为什么是纯 TS 引擎

赢麻了专业版前端是 React。把分析逻辑沉淀为框架无关的 TS，意味着：

1. 开源版与专业版**共享同一套计算口径**，排雷/杜邦结论一致；
2. 修复一个阈值 bug（如排雷误报）只需改一处，两边同步收益；
3. 字段命名与 `../script` 的 `stmt_tree.xs` 一一对应，便于核对「复用资产」的逐字段溯源（见 [SCRIPT_REUSE.md](./SCRIPT_REUSE.md)）。
