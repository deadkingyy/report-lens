import type { AnalysisContext, AnalysisModule, AnalysisResult, ChartSpec, InsightBlock } from './define';
import { LAOTANG_NOTE_QUALITY } from '../laotang/rules';

// 模块源：../script 资产「基本面.质量体检包」
// 注意：赢麻了质量体检包用的是内部专有权重与行业分位模型，此处为「透明启发式」对齐其七维思路，
// 并非复刻其专有打分；权重与阈值在下方显式声明，便于审阅与调整。

export interface QualitySub {
  key: string;
  cn: string;
  value: number | null; // 原始值（小数比率）
  score: number; // 0-100 子分
  text: string; // 原始值展示文本
  weight: number; // 权重（透明声明）
}

export interface QualityScore {
  score: number; // 0-100 综合分
  grade: string; // 优秀/良好/一般/偏弱
  subs: QualitySub[]; // 七维明细
  weak: QualitySub[]; // 子分 < 30 的短板
  strong: QualitySub[]; // 子分 ≥ 80 的长板
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

const pct1 = (v: number | null) => (v == null ? '—' : `${(v * 100).toFixed(1)}%`);

// 七维质量分（Hero 报告与质量体检模块共用，保证口径一致）
export function qualityScoreOf(ctx: AnalysisContext): QualityScore {
  const m = ctx.computed.metrics;
  const last = m[m.length - 1];

  const gm = last.gross_margin;
  const nm = last.net_margin_parent;
  const roe = last.roe_parent;
  const turn = last.asset_turnover;
  const lev = last.equity_multiplier;
  const ncf = last.cfo_to_net_profit;
  const accrual = last.accrual_ta;

  // 权重透明声明：盈利能力与现金质量占大头（合计 0.7），周转与杠杆为辅
  const subs: QualitySub[] = [
    { key: 'gm', cn: '毛利率', value: gm, score: gm == null ? 0 : Math.round(clamp01((gm - 0.1) / 0.6) * 100), text: pct1(gm), weight: 0.15 },
    { key: 'nm', cn: '净利率', value: nm, score: nm == null ? 0 : Math.round(clamp01(nm / 0.3) * 100), text: pct1(nm), weight: 0.15 },
    { key: 'roe', cn: 'ROE(杜邦)', value: roe, score: roe == null ? 0 : Math.round(clamp01(roe / 0.2) * 100), text: pct1(roe), weight: 0.2 },
    { key: 'turn', cn: '总资产周转', value: turn, score: turn == null ? 0 : Math.round(clamp01(turn / 1.5) * 100), text: turn == null ? '—' : turn.toFixed(2), weight: 0.1 },
    // 杠杆越低越安全：1 倍=满分，3 倍及以上=0
    { key: 'lev', cn: '杠杆(权益乘数)', value: lev, score: lev == null ? 50 : Math.round(clamp01(1 - (lev - 1) / 2) * 100), text: lev == null ? '—' : `${lev.toFixed(2)}x`, weight: 0.1 },
    // 盈利含金量：NCFO/NP，30% 起计分，100% 满分
    { key: 'ncf', cn: '盈利含金量', value: ncf, score: ncf == null ? 0 : Math.round(clamp01((ncf - 0.3) / 0.7) * 100), text: pct1(ncf), weight: 0.2 },
    // 应计利润/总资产：<=0 满分（保守），>=0.1 为 0（利润全在纸上）
    { key: 'accrual', cn: '应计利润占比', value: accrual, score: accrual == null ? 50 : Math.round(clamp01(1 - accrual / 0.1) * 100), text: pct1(accrual), weight: 0.1 },
  ];

  const score = Math.round(subs.reduce((s, x) => s + x.score * x.weight, 0));
  const grade = score >= 80 ? '优秀' : score >= 60 ? '良好' : score >= 40 ? '一般' : '偏弱';

  return {
    score,
    grade,
    subs,
    weak: subs.filter((s) => s.score < 30),
    strong: subs.filter((s) => s.score >= 80),
  };
}

export function runQualityCheck(ctx: AnalysisContext): AnalysisResult {
  const q = qualityScoreOf(ctx);

  const barChart: ChartSpec = {
    type: 'bar',
    title: '质量七维子分',
    unit: '分',
    categories: q.subs.map((s) => s.cn),
    series: [{ name: '子分(0-100)', data: q.subs.map((s) => s.score) }],
  };

  const tableChart: ChartSpec = {
    type: 'table',
    title: '质量体检明细（最新期）',
    table: {
      columns: [
        { key: 'cn', cn: '维度' },
        { key: 'value', cn: '原始值' },
        { key: 'score', cn: '子分' },
        { key: 'weight', cn: '权重' },
      ],
      rows: q.subs.map((s) => ({ cn: s.cn, value: s.text, score: s.score, weight: `${(s.weight * 100) | 0}%` })),
    },
  };

  const blocks: InsightBlock[] = [];

  blocks.push({
    id: 'quality_score',
    title: `质量体检得分：${q.score}/100（${q.grade}）`,
    summary:
      q.weak.length === 0
        ? `综合质量分 ${q.score}，判定「${q.grade}」。七维（毛利率/净利率/ROE/周转/杠杆/盈利含金量/应计）整体无显著短板。`
        : `综合质量分 ${q.score}，判定「${q.grade}」。短板：${q.weak.map((s) => `${s.cn}(${s.score}分)`).join('、')}。`,
    severity: q.score >= 60 ? 'low' : q.score >= 40 ? 'mid' : 'high',
    charts: [barChart],
    laotang: LAOTANG_NOTE_QUALITY,
  });

  blocks.push({
    id: 'quality_detail',
    title: '七维明细',
    summary: '各维度原始值、子分与权重，便于定位质量短板来自盈利、周转还是现金含量。',
    charts: [tableChart],
  });

  if (ctx.peerBench?.gross_margin != null && q.subs[0].value != null) {
    const gm = q.subs[0].value!;
    const bench = ctx.peerBench.gross_margin;
    const pct = Math.round(clamp01(gm / (bench * 1.3)) * 100);
    blocks.push({
      id: 'quality_industry',
      title: '同业毛利率分位（参考）',
      summary: `最新毛利率 ${(gm * 100).toFixed(1)}%，相对同业基准 ${(bench * 100).toFixed(0)}% 约处于 ${pct} 分位（演示口径，连接赢麻了可获真实行业分位）。`,
      charts: [],
    });
  }

  return { moduleId: 'qualityCheck', moduleTitle: '质量体检', blocks };
}

export const qualityCheckModule: AnalysisModule = {
  id: 'qualityCheck',
  title: '质量体检',
  desc: '毛利率/净利率/ROE/周转/杠杆/盈利含金量/应计 七维合成质量分，一眼看穿公司「成色」。',
  problems: ['assetQuality', 'profitability'],
  industries: [],
  run: runQualityCheck,
};
