import { describe, expect, it } from 'vitest';
import { computeDataset, evalDrv } from '@/engine';
import { maotaiSample } from '@/data/samples/maotai';
import { manufacturingSample } from '@/data/samples/manufacturing';

describe('derivations.evalDrv', () => {
  const get = (k: string) => {
    const map: Record<string, number> = {
      total_revenue: 1000,
      operating_cost: 600,
      total_current_assets: 800,
      total_current_liabilities: 400,
      inventories: 200,
      short_term_loans: 100,
      long_term_loans: 100,
    };
    return map[k] ?? null;
  };
  it('毛利率 = (营收-成本)/营收', () => {
    expect(evalDrv({ d: 'margin', a: 'operating_cost', b: 'total_revenue' }, get)).toBeCloseTo(0.4);
  });
  it('流动比率 = 流动/流动负债', () => {
    expect(evalDrv({ d: 'div', a: 'total_current_assets', b: 'total_current_liabilities' }, get)).toBeCloseTo(2);
  });
  it('速动比率剔除存货', () => {
    expect(evalDrv({ d: 'quick', a: 'total_current_assets', b: 'total_current_liabilities', m: 'inventories' }, get)).toBeCloseTo(1.5);
  });
  it('有息负债求和', () => {
    expect(evalDrv({ d: 'sum', as: ['short_term_loans', 'long_term_loans'] }, get)).toBeCloseTo(200);
  });
});

describe('computeDataset · 白酒样例', () => {
  const cd = computeDataset(maotaiSample);
  const last = cd.metrics[cd.metrics.length - 1];
  it('毛利率高（>85%）', () => {
    expect(last.gross_margin!).toBeGreaterThan(0.85);
  });
  it('ROE 优秀（>20%）', () => {
    expect(last.roe_parent!).toBeGreaterThan(0.2);
  });
  it('利润含金量高（经营现金流>净利润）', () => {
    expect(last.cfo_to_net_profit!).toBeGreaterThan(1);
  });
});

describe('computeDataset · 排雷样例', () => {
  const cd = computeDataset(manufacturingSample);
  const last = cd.metrics[cd.metrics.length - 1];
  it('毛利率低（<30%）', () => {
    expect(last.gross_margin!).toBeLessThan(0.3);
  });
  it('利润含金量差（经营现金流<<净利润）', () => {
    expect(last.cfo_to_net_profit!).toBeLessThan(0.5);
  });
  it('大存大贷：有息负债/总资产>30%', () => {
    expect(last.interest_bearing_debt! / maotaiSafe(manufacturingSample)).toBeGreaterThan(0.3);
  });
});

// 取排雷样例最新期总资产
function maotaiSafe(ds: typeof manufacturingSample) {
  const lastR = ds.reports[ds.reports.length - 1];
  return lastR.balance.total_assets!;
}
