import type { AnalysisContext, AnalysisModule, AnalysisResult, InsightBlock } from './define';
import { periodLabel } from '../utils';
import { compareBars } from '../methods/horizontal';
import { trendLine } from '../methods/trend';
import { fieldGetter } from '../compute';

export function runNetProfit(ctx: AnalysisContext): AnalysisResult {
  const labels = ctx.computed.periods.map(periodLabel);
  const m = ctx.computed.metrics;
  const reports = ctx.dataset.reports;
  const npp = reports.map((r) => fieldGetter(r)('net_profit_parent'));
  const cfo = reports.map((r) => r.cashflow.net_cash_operating);
  const excl = reports.map((r) => r.income.net_profit_excl_nonrecurring ?? null);
  const cfoRatio = m.map((x) => x.cfo_to_net_profit);

  const blocks: InsightBlock[] = [];

  blocks.push({
    id: 'np_vs_cfo',
    title: '净利润 vs 经营现金流',
    summary: '净利润是权责发生制下的「账面数」，经营现金流是实打实收回的现金。两者长期背离，利润含金量存疑。',
    charts: [
      compareBars(
        labels,
        [
          { name: '归母净利润(亿)', data: npp.map((v) => (v == null ? null : v / 1e8)) },
          { name: '经营现金流(亿)', data: cfo.map((v) => (v == null ? null : v == null ? null : v / 1e8)) },
        ],
        { title: '账面利润 vs 真金白银', unit: '亿' },
      ),
    ],
  });

  blocks.push({
    id: 'quality',
    title: '利润含金量',
    summary:
      (cfoRatio[cfoRatio.length - 1] ?? 0) >= 1
        ? '经营现金流覆盖净利润，利润质量健康。'
        : '经营现金流低于净利润，关注应收/存货占用与利润调节。',
    charts: [trendLine(labels, [{ name: '经营现金流/归母净利润', values: cfoRatio.map((v) => (v == null ? null : v * 100)) }], { title: '利润含金量（>100% 佳）', unit: '%' })],
  });

  if (excl.some((v) => v != null)) {
    blocks.push({
      id: 'kc',
      title: '扣非 vs 归母净利润',
      summary: '扣非净利润剔除一次性损益，更能反映主业成色。两者差距大，说明利润含「水分」。',
      charts: [
        compareBars(
          labels,
          [
            { name: '归母净利润(亿)', data: npp.map((v) => (v == null ? null : v / 1e8)) },
            { name: '扣非净利润(亿)', data: excl.map((v) => (v == null ? null : v == null ? null : v / 1e8)) },
          ],
          { title: '归母 vs 扣非', unit: '亿' },
        ),
      ],
    });
  }

  return { moduleId: 'netProfit', moduleTitle: '净利润质量', blocks };
}

export const netProfitModule: AnalysisModule = {
  id: 'netProfit',
  title: '净利润质量',
  desc: '经营现金流/净利润、扣非 vs 归母，看清利润是真金还是纸面。',
  problems: ['profitability'],
  industries: [],
  run: runNetProfit,
};
