# Changelog

本项目遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [0.2.0] - 2026-10-20

### 🎯 信息架构重构：一个英雄体验做透

- **新增「排雷体检报告」Hero 视图**（默认视图）：Verdict 三态头（安全/关注/高危）+ 七维质量体检分环形图 + 老唐排雷清单（9 项全部展示、逐项可展开「为什么危险/为什么安全 + 证据图 + 下一步核查」）+ 质量七维构成条 + 结论与下一步。
- **菜单收敛**：原 13 模块平铺 → 1 个 Hero 报告 + 「更多维度」折叠（10 个次级维度）。排雷/质量体检/现金流质量转为 Hero 数据源，不再单独开门；能力全部保留。
- **问题语境条**：首页选择的「投资问题」在分析页顶部持续可见（此前选完即丢失），问题驱动真正闭环。

### ⚙️ 引擎（纯 TS，Hero 与模块共享口径）

- `mineDetect` 重构：`mineChecks()` 输出每项检查的完整档案（evidence/why/next/laotang/chart），`mineVerdict()` 输出三态综合判定；安全项也生成解释（此前安全项不可见）。
- `qualityCheck` 重构：抽出 `qualityScoreOf()` 七维透明加权评分（毛利率 15/净利率 15/ROE 20/周转 10/杠杆 10/盈利含金量 20/应计 10），Hero 与模块共用。
- `cashFlowType` 抽出 `flowTypeRows()` 八型编码（CFO/CFI/CFF 符号 → 蛮牛/老母鸡/奶牛/女巫/蝙蝠/赌徒/躺平/咸鱼）。
- 新增 `cashFlowQuality`（销售收现比/盈利含金量/FCF，源自 Script「现金流量」「真金白银包」资产）、`cashConversionCycle`（应收/存货/应付周转天数 + CCC，源自 `ccf.xs`；零应收不再断链）。
- 样例补 `accounts_payable` 字段；制造排雷样例 2024 年现金流改为「赌徒型」（经营失血、筹资续命），与大存大贷叙事自洽。

### ✅ 质量

- 测试 13 → 24（新增：八型判定、质量分两样例校准、CCC 零应收、排雷档案 verdict/next 完整性）。
- typecheck 0 错误；lint 0 警告；build 无告警；preview 冒烟 HTTP 200。

## [0.1.0] - 2026-10-20

- 首个可运行 MVP：Vue3 + Vite + TS + UnoCSS + ECharts（tree-shaking 单 chunk）。
- 纯 TS 分析引擎（schema ↔ stmt_tree.xs 一一对应；ROE 杜邦 ↔ hroe_b2.xs；附注 ↔ note_*.xs）。
- 9 个分析模块 + 老唐排雷清单 + 问题驱动首页 + 数据 Provider 抽象（SampleProvider / WinmaleOpenProvider）。
- 开源治理：MIT、README、CONTRIBUTING、CoC、CI、dependabot、docs 四篇。
