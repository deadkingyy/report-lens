import type { AnalysisContext, AnalysisModule, AnalysisResult, InsightBlock } from './define';
import { periodLabel, safeDiv } from '../utils';
import { compareBars } from '../methods/horizontal';
import { trendLine } from '../methods/trend';

export function runFixedAssets(ctx: AnalysisContext): AnalysisResult {
  const labels = ctx.computed.periods.map(periodLabel);
  const reports = ctx.dataset.reports;
  const m = ctx.computed.metrics;

  const fa = reports.map((r) => r.balance.fixed_assets ?? null);
  const cip = reports.map((r) => r.balance.cip ?? null);
  const turnover = m.map((x) => x.fa_turnover);
  const cipRatio = cip.map((v, i) => safeDiv(v, fa[i]));

  const blocks: InsightBlock[] = [];

  blocks.push({
    id: 'fa_turnover',
    title: '固定资产周转率',
    summary: '单位固定资产创造的营收。越高说明产能利用越充分；走低往往是产能闲置或需求下滑。',
    charts: [trendLine(labels, [{ name: '固定资产周转率', values: turnover }], { title: '固定资产周转率' })],
  });

  blocks.push({
    id: 'scale',
    title: '固定资产与在建工程规模',
    summary: '固定资产扩张靠在建工程转固。在建工程长期不转固会少计提折旧、虚增利润。',
    charts: [
      compareBars(
        labels,
        [
          { name: '固定资产(亿)', data: fa.map((v) => (v == null ? null : v / 1e8)) },
          { name: '在建工程(亿)', data: cip.map((v) => (v == null ? null : v == null ? null : v / 1e8)) },
        ],
        { title: '产能规模', unit: '亿' },
      ),
    ],
  });

  blocks.push({
    id: 'cip_ratio',
    title: '在建工程 / 固定资产',
    summary: '比重持续偏高，留意转固节奏与产能是否真实达产。',
    charts: [trendLine(labels, [{ name: '在建工程/固定资产', values: cipRatio.map((v) => (v == null ? null : v * 100)) }], { title: '在建工程占固定资产', unit: '%' })],
  });

  return { moduleId: 'fixedAssets', moduleTitle: '固定资产分析', blocks };
}

export const fixedAssetsModule: AnalysisModule = {
  id: 'fixedAssets',
  title: '固定资产分析',
  desc: '固定资产周转率、产能规模与在建工程转固节奏。',
  problems: ['assetQuality', 'operations'],
  industries: ['manufacturing', 'cyclical'],
  run: runFixedAssets,
};
