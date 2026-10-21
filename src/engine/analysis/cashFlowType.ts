import type { AnalysisContext, AnalysisModule, AnalysisResult, InsightBlock, ChartSpec } from './define';
import { periodLabel } from '../utils';
import type { Num } from '../schema/types';

// 模块源：../script/sys/metric/screen_cf.xs + ccf.xs 的八类现金流编码（CFO/CFI/CFF 正负号）
// 老唐《手把手读财报》现金流章同此思路：按三类现金流正负，把企业分成八种「性格」。
type Sign = '+' | '-' | '0';
interface FlowType {
  sig: string; // 如 '+-+'，依次为 CFO / CFI / CFF 符号
  name: string;
  healthy: 'good' | 'warn' | 'bad';
  desc: string;
}

const FLOW_TYPES: Record<string, FlowType> = {
  '+-+': { sig: '+-+', name: '蛮牛型', healthy: 'warn', desc: '经营赚、投资花、还靠筹资输血扩张——成长故事，但依赖外部钱。' },
  '++-': { sig: '++-', name: '老母鸡型', healthy: 'good', desc: '经营赚、投资也赚、筹资在回报股东——成熟现金牛，最舒服。' },
  '+--': { sig: '+--', name: '奶牛型', healthy: 'good', desc: '经营赚的钱自己覆盖投资与还贷——内生健康增长。' },
  '+++': { sig: '+++', name: '女巫型', healthy: 'warn', desc: '三类都正，罕见；要么数据异常，要么有一次性大额收益，需细查。' },
  '---': { sig: '---', name: '蝙蝠型', healthy: 'bad', desc: '三类都负，经营自身难造血还要持续流血——高危。' },
  '--+': { sig: '--+', name: '赌徒型', healthy: 'bad', desc: '经营、投资都失血，全靠筹资续命——在赌反转。' },
  '-+-': { sig: '-+-', name: '躺平型', healthy: 'bad', desc: '经营不赚、靠变卖资产和投资回血、还在还钱——收缩求生。' },
  '-++': { sig: '-++', name: '咸鱼型', healthy: 'bad', desc: '经营不赚，变卖资产 + 筹资输血——最脆弱的一类。' },
};

function signOf(v: Num): Sign {
  if (v == null) return '0';
  if (v > 0) return '+';
  if (v < 0) return '-';
  return '0';
}

// 单期现金流类型行（Hero 报告复用）
export interface FlowTypeRow {
  period: string;
  type: string;
  signature: string;
  cfo: number | null;
  cfi: number | null;
  cff: number | null;
  healthy: 'good' | 'warn' | 'bad';
  desc?: string;
}

export function flowTypeRows(ctx: AnalysisContext): FlowTypeRow[] {
  const reports = ctx.computed.dataset.reports;
  return reports.map((r) => {
    const cfo = r.cashflow.net_cash_operating ?? null;
    const cfi = r.cashflow.net_cash_investing ?? null;
    const cff = r.cashflow.net_cash_financing ?? null;
    const sig = `${signOf(cfo)}${signOf(cfi)}${signOf(cff)}`;
    const t = FLOW_TYPES[sig] ?? { sig, name: '数据缺失', healthy: 'warn' as const, desc: '某类现金流缺失，无法归类。' };
    return {
      period: periodLabel(r.period),
      type: t.name,
      signature: sig,
      cfo: cfo == null ? null : +(cfo / 1e8).toFixed(1),
      cfi: cfi == null ? null : +(cfi / 1e8).toFixed(1),
      cff: cff == null ? null : +(cff / 1e8).toFixed(1),
      healthy: t.healthy,
      desc: t.desc,
    };
  });
}

export function runCashFlowType(ctx: AnalysisContext): AnalysisResult {
  const rows = flowTypeRows(ctx);

  // 类型频次（用于分布柱状）
  const freq: Record<string, number> = {};
  rows.forEach((x) => (freq[x.type] = (freq[x.type] ?? 0) + 1));
  const freqChart: ChartSpec = {
    type: 'bar',
    title: '现金流类型分布（按年）',
    unit: '年',
    categories: Object.keys(freq),
    series: [{ name: '出现年数', data: Object.values(freq) }],
  };

  const tableChart: ChartSpec = {
    type: 'table',
    title: '逐年现金流类型',
    table: {
      columns: [
        { key: 'period', cn: '年度' },
        { key: 'type', cn: '类型' },
        { key: 'signature', cn: '签名(CFO/CFI/CFF)' },
        { key: 'cfo', cn: '经营(亿)' },
        { key: 'cfi', cn: '投资(亿)' },
        { key: 'cff', cn: '筹资(亿)' },
      ],
      rows: rows.map((x) => ({
        period: x.period,
        type: x.type,
        signature: x.signature,
        cfo: x.cfo,
        cfi: x.cfi,
        cff: x.cff,
      })),
    },
  };

  // 结论：主要类型 + 是否出现高危型
  const last = rows[rows.length - 1];
  const badYears = rows.filter((x) => x.healthy === 'bad').length;
  const summary =
    badYears > 0
      ? `近 ${rows.length} 年中有 ${badYears} 年出现「${rows.filter((x) => x.healthy === 'bad').map((x) => x.type).join('、')}」等高危现金流类型，需高度警惕造血能力。`
      : `近 ${rows.length} 年现金流以「${last.type}」为主，未出现高危类型，造血结构相对健康。`;

  const blocks: InsightBlock[] = [
    {
      id: 'flow_type_table',
      title: '逐年现金流类型（老唐八型）',
      summary,
      charts: [tableChart],
      details: Object.values(FLOW_TYPES).map((t) => `${t.sig} ${t.name}：${t.desc}`),
      laotang: '老唐：最理想的是经营现金流入、投资与筹资现金流出（奶牛/老母鸡）；若经营不造血、靠筹资续命，多半在掩饰问题。',
    },
    {
      id: 'flow_type_freq',
      title: '现金流类型分布',
      summary: '看公司在各年度「性格」是否稳定，频繁切换或落入高危型是信号。',
      charts: [freqChart],
    },
  ];

  return { moduleId: 'cashFlowType', moduleTitle: '现金流八型', blocks };
}

export const cashFlowTypeModule: AnalysisModule = {
  id: 'cashFlowType',
  title: '现金流八型',
  desc: '按经营/投资/筹资三类现金流正负，给公司贴「性格标签」，一眼看穿造血结构。',
  problems: ['risk'],
  industries: [],
  run: runCashFlowType,
};
