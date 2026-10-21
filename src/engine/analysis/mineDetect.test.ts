import { describe, expect, it } from 'vitest';
import { computeDataset, runMineDetect, runRoe, type AnalysisContext } from '@/engine';
import { maotaiSample } from '@/data/samples/maotai';
import { manufacturingSample } from '@/data/samples/manufacturing';

function ctx(ds: typeof maotaiSample | typeof manufacturingSample): AnalysisContext {
  return { dataset: ds, computed: computeDataset(ds), industry: ds.industry, peerBench: ds.peerBench };
}

describe('财报排雷', () => {
  it('排雷样例应触发高危信号', () => {
    const r = runMineDetect(ctx(manufacturingSample));
    const high = r.blocks.filter((b) => b.severity === 'high');
    expect(high.length).toBeGreaterThan(0);
    expect(r.warnings).toBeUndefined(); // 排雷样例含扣非，不应缺数据
  });

  it('白酒样例不应触发高危（优质画像）', () => {
    const r = runMineDetect(ctx(maotaiSample));
    const high = r.blocks.filter((b) => b.severity === 'high');
    expect(high.length).toBe(0);
  });
});

describe('ROE 杜邦', () => {
  it('白酒样例产出杜邦分解', () => {
    const r = runRoe(ctx(maotaiSample));
    expect(r.blocks.length).toBeGreaterThan(0);
    expect(r.blocks.find((b) => b.id === 'dupont_table')).toBeTruthy();
  });
});
