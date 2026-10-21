# 参与贡献

感谢你关注 **财报透视 · 赢麻了开源版**！无论是新增分析模块、补充行业、修复排雷误报，还是改进文档，我们都欢迎。

## 开发环境

要求 Node ≥ 18.18。

```bash
npm install
npm run dev        # 本地开发
npm run test       # 运行单测
npm run typecheck  # 类型检查
npm run lint       # Lint（oxlint）
npm run fmt        # 格式化（oxfmt）
```

提交前请确保 `npm run typecheck && npm run lint && npm run test` 全部通过（CI 也会校验）。

## 代码规范

- 语言：TypeScript（strict 模式）+ Vue 3 `<script setup>`。
- 样式：UnoCSS 原子类；品牌色 `#2f6bff` / `#eaf1ff`。
- Lint/Format：统一使用 `oxlint` / `oxfmt`，请勿混用 ESLint/Prettier 配置。
- 分析引擎 `src/engine` **必须与框架无关**（不引入 `vue` / `echarts` 依赖），图表只产出框架中立的 `ChartSpec`，由 UI 层渲染。

## 如何新增一个分析模块

1. 在 `src/engine/analysis/` 新建 `yourModule.ts`，导出一个 `run*(ctx: AnalysisContext): AnalysisResult` 函数与一个 `AnalysisModule` 对象（含 `id` / `title` / `desc` / `problems` / `industries` / `run`）。
2. 结论通过 `InsightBlock` 表达：每个 block 含 `severity`（红绿灯）、`summary`（结论性陈述）、`charts`（ChartSpec 数组）、可选 `laotang`（老唐视角点评）。
3. 图表用 `src/engine/methods/` 提供的 `trendLine` / `compareBars` / `pieShare` / `commonSize*` 等工厂函数生成，保证四大分析方法统一。
4. 在 `src/engine/registry.ts` 的 `MODULES` 数组中注册。
5. 在 `src/engine/analysis/__tests__` 或对应 `*.test.ts` 中补充分支测试，尤其覆盖「优质公司不误报、异常公司触发」两类样本。

## 提交约定

- 分支：`feat/`、`fix/`、`docs/` 等前缀。
- 提交信息清晰描述「为什么改」。
- PR 描述请关联对应 Issue，并说明测试覆盖情况。

## 行为准则

参与本社区即视为同意 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。
