import type { ComputedDataset, PeriodMetrics } from '../compute';
import type { IndustryKey, ReportDataset } from '../schema/types';
import type { ProblemId } from '../schema/industry';

export type Severity = 'high' | 'mid' | 'low' | 'info';

// 通用图表描述（UI 层 EChart.vue 据此渲染 ECharts），与框架无关
export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'stackedBar'
  | 'groupedBar'
  | 'waterfall'
  | 'table';

export interface ChartSpec {
  type: ChartType;
  title?: string;
  unit?: string;
  note?: string;
  // 折线 / 柱状
  categories?: string[];
  series?: { name: string; data: (number | null)[]; area?: boolean }[];
  // 饼图
  pie?: { name: string; value: number }[];
  // 表格
  table?: { columns: { key: string; cn: string }[]; rows: Record<string, unknown>[] };
  // 瀑布（杜邦分解等）
  waterfall?: { categories: string[]; values: number[]; label?: string };
  // 额外 ECharts option 覆盖
  option?: Record<string, unknown>;
}

export interface InsightBlock {
  id: string;
  title: string;
  severity?: Severity; // 红绿灯
  summary: string; // 结论性陈述
  charts: ChartSpec[];
  details?: string[]; // 支撑要点
  laotang?: string; // 老唐视角点评
}

export interface AnalysisResult {
  moduleId: string;
  moduleTitle: string;
  blocks: InsightBlock[];
  warnings?: string[]; // 数据缺口提示
}

export interface AnalysisContext {
  dataset: ReportDataset;
  computed: ComputedDataset;
  industry: IndustryKey;
  // 同业基准（可选，来自赢麻了后端或内置行业常量）
  peerBench?: Record<string, number>;
}

export interface AnalysisModule {
  id: string;
  title: string;
  desc: string;
  problems: ProblemId[]; // 适配的投资问题
  industries: IndustryKey[]; // 适用行业；空数组 = 通用
  run: (ctx: AnalysisContext) => AnalysisResult;
}

export type { PeriodMetrics };
