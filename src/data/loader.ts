import type { ReportDataset } from '@/engine';
import { maotaiSample } from './samples/maotai';
import { manufacturingSample } from './samples/manufacturing';

// 内置示例数据集（开箱即用、纯前端离线）
export const SAMPLES: ReportDataset[] = [maotaiSample, manufacturingSample];

export function getSample(symbol: string): ReportDataset | undefined {
  return SAMPLES.find((s) => s.symbol === symbol);
}

export function listSamples(): { symbol: string; name: string; industry: string }[] {
  return SAMPLES.map((s) => ({ symbol: s.symbol, name: s.name, industry: s.industry }));
}
