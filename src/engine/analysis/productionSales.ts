import type { AnalysisContext, AnalysisModule, AnalysisResult, InsightBlock } from './define';
import { periodLabel, safeDiv } from '../utils';
import { compareBars } from '../methods/horizontal';

export function runProductionSales(ctx: AnalysisContext): AnalysisResult {
  const blocks: InsightBlock[] = [];
  const ps = ctx.dataset.productionSales;

  if (!ps || ps.length === 0) {
    blocks.push({
      id: 'guide',
      title: '产销量数据缺失',
      severity: 'info',
      summary: '产销量不在三大报表内，通常来自年报「主营业务构成 / 产量销量」小节或行业数据库。',
      charts: [],
      details: [
        '当前数据集未包含产销量，本模块暂以说明呈现。',
        '连接赢麻了开放平台（Open AppId）或上传含产销量字段的数据集后即可自动分析。',
        '分析重点：产量 vs 销量 → 产销率；销量 vs 产能 → 产能利用率；库存累积 → 滞销风险。',
      ],
    });
    return { moduleId: 'productionSales', moduleTitle: '产销量分析', blocks };
  }

  const labels = ps.map((r) => periodLabel(r.period));
  const production = ps.map((r) => r.production ?? null);
  const sales = ps.map((r) => r.sales ?? null);
  const rate = ps.map((r) => safeDiv(r.sales ?? null, r.production ?? null));

  blocks.push({
    id: 'ps',
    title: '产量 vs 销量',
    summary: `产销率最新为 ${((rate[rate.length - 1] ?? 0) * 100).toFixed(1)}%。产销率长期<100% 意味着库存累积，需警惕滞销。`,
    charts: [
      compareBars(
        labels,
        [
          { name: '产量', data: production },
          { name: '销量', data: sales },
        ],
        { title: '产销量', unit: ps[0].unit ?? '' },
      ),
    ],
  });

  blocks.push({
    id: 'rate',
    title: '产销率',
    summary: '产销率 = 销量 / 产量。持续低于 100% 是需求弱于供给的红灯。',
    charts: [compareBars(labels, [{ name: '产销率%', data: rate.map((v) => (v == null ? null : v * 100)) }], { title: '产销率', unit: '%' })],
  });

  return { moduleId: 'productionSales', moduleTitle: '产销量分析', blocks };
}

export const productionSalesModule: AnalysisModule = {
  id: 'productionSales',
  title: '产销量分析',
  desc: '产量、销量与产销率，看产能是否匹配需求。',
  problems: ['operations'],
  industries: ['manufacturing', 'cyclical'],
  run: runProductionSales,
};
