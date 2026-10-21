import type { AnalysisContext, AnalysisModule, AnalysisResult, InsightBlock, ChartSpec } from './define';

// 附注分析 —— 复用 sys/rptdom/note_*.xs 的 note_index / notes_for 思路：
// 按专业版代码（IO=存货、MFNS=货币资金…）把附注明细结构化展示。
export function runFootnote(ctx: AnalysisContext): AnalysisResult {
  const blocks: InsightBlock[] = [];
  const fn = ctx.dataset.footnote;

  if (!fn || fn.length === 0) {
    blocks.push({
      id: 'guide',
      title: '附注明细缺失',
      severity: 'info',
      summary: '附注分析需要年报附注的结构化数据（如货币资金构成、存货分类、应收账款账龄等）。',
      charts: [],
      details: [
        '当前数据集未包含附注明细，本模块暂以说明呈现。',
        '连接赢麻了开放平台（Open AppId）可拉取真实年报附注并自动归类到专业版代码。',
        '分析重点：货币资金是否受限/质押、存货可变现净值、应收账龄与坏账、关联方往来。',
      ],
    });
    return { moduleId: 'footnote', moduleTitle: '附注分析', blocks };
  }

  // note_index：角标总览
  const overview: InsightBlock = {
    id: 'index',
    title: '附注角标（按专业版代码）',
    summary: `本数据集含 ${fn.length} 个附注科目：${fn.map((f) => `${f.cn}(${f.code})`).join('、')}。`,
    charts: [
      {
        type: 'table',
        title: '附注目录',
        table: {
          columns: [
            { key: 'code', cn: '代码' },
            { key: 'cn', cn: '科目' },
            { key: 'period', cn: '期次' },
            { key: 'source', cn: '来源' },
          ],
          rows: fn.map((f) => ({ code: f.code, cn: f.cn, period: f.period, source: f.source })),
        },
      },
    ],
  };
  blocks.push(overview);

  // notes_for：逐科目明细表
  for (const item of fn) {
    const charts: ChartSpec[] = item.sections.map((sec) => ({
      type: 'table',
      title: sec.title,
      table: { columns: sec.columns, rows: sec.rows as Record<string, unknown>[] },
    }));
    blocks.push({
      id: `note_${item.code}`,
      title: `${item.cn}（${item.code}）附注`,
      summary: `期次 ${item.period}，来源 ${item.source}。详见下方明细表。`,
      charts,
    });
  }

  return { moduleId: 'footnote', moduleTitle: '附注分析', blocks };
}

export const footnoteModule: AnalysisModule = {
  id: 'footnote',
  title: '附注分析',
  desc: '按专业版代码结构化展示年报附注（货币资金构成、存货分类、应收账龄等）。',
  problems: ['assetQuality', 'risk'],
  industries: [],
  run: runFootnote,
};
