import type { AnalysisContext, AnalysisModule, AnalysisResult, InsightBlock } from './define';
import { fieldGetter } from '../compute';
import { periodLabel, safeDiv, safeSum } from '../utils';
import { trendLine } from '../methods/trend';
import { FIELD_CN } from '../derivations';

export function runAssetStructure(ctx: AnalysisContext): AnalysisResult {
  const labels = ctx.computed.periods.map(periodLabel);
  const reports = ctx.dataset.reports;
  const m = ctx.computed.metrics;

  const tca = reports.map((r) => r.balance.total_current_assets ?? null);
  const tnca = reports.map((r) => r.balance.total_noncurrent_assets ?? null);
  const ta = reports.map((r) => r.balance.total_assets ?? null);
  const fa = reports.map((r) =>
    safeSum([r.balance.fixed_assets ?? null, r.balance.cip ?? null, r.balance.intangible_assets ?? null]),
  );

  const curPct = tca.map((v, i) => safeDiv(v, ta[i]));
  const nonPct = tnca.map((v, i) => safeDiv(v, ta[i]));
  const heavyPct = fa.map((v, i) => safeDiv(v, ta[i]));

  const blocks: InsightBlock[] = [];

  blocks.push({
    id: 'composition',
    title: '资产构成（共同比）',
    summary: '流动资产与非流动资产的占比，反映钱的「形态」。重资产公司固定资产占比高，轻资产公司现金/金融类资产占比高。',
    charts: [
      {
        type: 'stackedBar',
        title: '资产构成（% of 总资产）',
        unit: '%',
        categories: labels,
        series: [
          { name: '流动资产', data: curPct.map((v) => (v == null ? null : v * 100)) },
          { name: '非流动资产', data: nonPct.map((v) => (v == null ? null : v * 100)) },
        ],
      },
    ],
  });

  blocks.push({
    id: 'heavy',
    title: '重资产程度',
    summary: '固定资产+在建工程+无形资产占总资产比重，越高越「重」——产能刚性大、折旧负担重，周期下行时风险更高。',
    charts: [trendLine(labels, [{ name: '重资产占比', values: heavyPct.map((v) => (v == null ? null : v * 100)) }], { title: '重资产占比', unit: '%' })],
  });

  blocks.push({
    id: 'liability',
    title: '负债与杠杆',
    summary: '资产负债率与有息负债水平，决定财务弹性和利息压力。',
    charts: [
      trendLine(labels, [{ name: '资产负债率', values: m.map((x) => (x.debt_to_assets == null ? null : x.debt_to_assets * 100)) }], { title: '资产负债率', unit: '%' }),
    ],
  });

  // 最新期主要资产科目共同比表
  const last = reports[reports.length - 1];
  const g = fieldGetter(last);
  const taLast = g('total_assets');
  const lines = ['monetary_funds', 'accounts_receivable', 'inventories', 'fixed_assets', 'cip', 'intangible_assets', 'goodwill', 'short_term_loans', 'long_term_loans', 'equity_parent'];
  blocks.push({
    id: 'commonsize',
    title: '最新期主要科目共同比',
    summary: '把主要资产/负债科目表示为占总资产的比例，快速看清钱压在哪里、杠杆有多重。',
    charts: [
      {
        type: 'table',
        title: '共同比（% of 总资产）',
        table: {
          columns: [
            { key: 'item', cn: '科目' },
            { key: 'pct', cn: '占比' },
          ],
          rows: lines.map((k) => ({
            item: FIELD_CN[k] ?? k,
            pct: taLast ? `${(((g(k) ?? 0) / taLast) * 100).toFixed(1)}%` : '—',
          })),
        },
      },
    ],
  });

  return { moduleId: 'assetStructure', moduleTitle: '资产结构分析', blocks };
}

export const assetStructureModule: AnalysisModule = {
  id: 'assetStructure',
  title: '资产结构分析',
  desc: '资产轻重、共同比结构、负债与杠杆，看清家底虚实。',
  problems: ['assetQuality'],
  industries: [],
  run: runAssetStructure,
};
