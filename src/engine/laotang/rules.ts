// 《手把手教你读财报》（老唐）方法论落地：排雷要点与点评引用。
// 这些规则是专业版 sys/audit 思路在纯前端的最小可用实现，用于「财报排雷」模块。

export const LAOTANG_MINING_RULES: {
  id: string;
  name: string;
  severity: 'high' | 'mid' | 'low';
  principle: string;
}[] = [
  {
    id: 'ar_growth',
    name: '应收增速持续高于营收增速',
    severity: 'high',
    principle: '老唐：营收没增长、应收却猛增，或应收增速长期高于营收，是「虚假繁荣」的第一信号——东西可能没真卖出去，只是压给了渠道。',
  },
  {
    id: 'inventory_growth',
    name: '存货增速持续高于营收增速',
    severity: 'high',
    principle: '老唐：存货增速高于营收，往往意味着产品滞销或虚增库存；要结合跌价准备看是否「藏利润」或「埋雷」。',
  },
  {
    id: 'cfo_vs_profit',
    name: '经营现金流长期低于净利润',
    severity: 'high',
    principle: '老唐：利润是算出来的，现金是赚到的。经营现金流净额长期明显低于净利润，利润的「含金量」存疑。',
  },
  {
    id: 'other_receivables',
    name: '其他应收款异常庞大',
    severity: 'high',
    principle: '老唐：其他应收款是「装不下只好藏这里」的科目，大股东占用资金常走此道，是排雷重点。',
  },
  {
    id: 'big_deposit_big_loan',
    name: '大存大贷',
    severity: 'mid',
    principle: '老唐：账上躺着大把货币资金，同时还有巨额有息负债、年年付着高昂利息，钱的真实性与受限情况要打问号。',
  },
  {
    id: 'goodwill',
    name: '商誉占净资产过高',
    severity: 'mid',
    principle: '老唐：商誉是并购时多付的溢价，不是资产。一旦标的业绩不达标，巨额减值会直接吞噬利润。',
  },
  {
    id: 'nonrecurring',
    name: '归母净利润主要靠非经常性损益',
    severity: 'mid',
    principle: '老唐：靠卖资产、政府补贴、投资收益撑利润，主业不行，这种「盈利」不可持续。',
  },
  {
    id: 'gross_margin_anomaly',
    name: '毛利率畸高且无明显护城河',
    severity: 'mid',
    principle: '老唐：高于同业的毛利率若无品牌/技术/牌照护城河支撑，需警惕收入确认或成本结转的人为调节。',
  },
  {
    id: 'cip_stuck',
    name: '在建工程长期不转固',
    severity: 'low',
    principle: '老唐：在建工程不转固可规避折旧、美化利润，长期挂账且金额巨大要留意。',
  },
];

export const LAOTANG_DUPONT_NOTE =
  '老唐：ROE 是巴菲特最看重的指标。用杜邦拆开看——高 ROE 到底来自高净利（生意好）、高周转（运营强）还是高杠杆（借来的），性质天差地别。';

export const LAOTANG_GROSS_MARGIN_NOTE =
  '老唐：毛利率不仅要看高低，更要看「稳定性」。能长期维持高毛利，往往意味着产品有护城河；毛利突然跳变，多半是产品结构或会计政策变了。';

export const LAOTANG_NOTE_QUALITY =
  '老唐：看财报先防假，再看质。排雷过了关，才谈得上用 ROE、毛利率去判断一门生意好不好。';
