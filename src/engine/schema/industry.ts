import type { IndustryKey } from './types';

// 投资问题（用户入口先选「问题」，再聚焦模块）—— 对应「以解决某个投资问题为主要设计思路」
export type ProblemId = 'risk' | 'profitability' | 'assetQuality' | 'operations';

export interface ProblemMeta {
  id: ProblemId;
  question: string; // 用户视角的投资问题
  title: string;
  desc: string;
  icon: string; // 用于 UI 展示
}

export const PROBLEMS: ProblemMeta[] = [
  {
    id: 'risk',
    question: '这家公司财务造假 / 爆雷风险高吗？',
    title: '财报排雷',
    desc: '用老唐排雷清单逐项扫描：应收、存货、经营现金流、商誉、其他应收、大存大贷等红绿灯。',
    icon: '🛡️',
  },
  {
    id: 'profitability',
    question: '这门生意赚不赚钱、能不能持续？',
    title: '盈利质量',
    desc: 'ROE 杜邦拆解、毛利率趋势与结构、净利润含金量，看清利润是真金白银还是纸面富贵。',
    icon: '💰',
  },
  {
    id: 'assetQuality',
    question: '资产厚不厚实？钱压在哪里？',
    title: '资产质量',
    desc: '资产结构轻重、固定资产效率、商誉与有息负债，判断家底虚实。',
    icon: '🏦',
  },
  {
    id: 'operations',
    question: '东西卖得动吗？产能匹配吗？',
    title: '营运与产销',
    desc: '存货周转、产销量匹配、固定资产产能利用，看经营链条是否顺畅。',
    icon: '📦',
  },
];

export interface IndustryMeta {
  key: IndustryKey;
  name: string;
  focus: ProblemId[]; // 该行业最该关心的投资问题
  note: string;
}

export const INDUSTRIES: IndustryMeta[] = [
  {
    key: 'liquor',
    name: '白酒 / 高端消费',
    focus: ['profitability', 'risk'],
    note: '聚焦毛利率、合同负债(预收款)、净利率与排雷；先款后货、高毛利是护城河信号。',
  },
  {
    key: 'manufacturing',
    name: '制造业',
    focus: ['operations', 'assetQuality', 'profitability'],
    note: '聚焦固定资产效率、产销量匹配、存货周转与 ROE。',
  },
  {
    key: 'cyclical',
    name: '周期 / 资源',
    focus: ['operations', 'profitability'],
    note: '聚焦产销量、产能利用率与盈利的周期性摆动。',
  },
  {
    key: 'realestate',
    name: '地产 / 商贸',
    focus: ['risk', 'assetQuality'],
    note: '聚焦存货(土储/库存)、预收、有息负债与排雷。',
  },
  {
    key: 'tech',
    name: '科技 / 软件',
    focus: ['profitability', 'assetQuality'],
    note: '聚焦研发费用率、毛利率与轻资产质量。',
  },
  {
    key: 'general',
    name: '其他 / 通用于全行业',
    focus: ['risk', 'profitability', 'assetQuality', 'operations'],
    note: '排雷、ROE、资产结构等通用模块全部可用。',
  },
];

export function getIndustry(key: IndustryKey): IndustryMeta {
  return INDUSTRIES.find((i) => i.key === key) ?? INDUSTRIES[INDUSTRIES.length - 1];
}
