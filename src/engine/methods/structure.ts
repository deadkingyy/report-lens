import type { ChartSpec } from '../analysis/define';
import type { Num } from '../schema/types';

// 方法二：看结构比例（饼图 / 堆叠构成）
export function pieShare(parts: { name: string; value: number }[], title?: string): ChartSpec {
  return { type: 'pie', title, pie: parts };
}

// 多年结构堆叠（如费用构成随年份的占比）
export function stackedShares(
  categories: string[],
  series: { name: string; data: Num[] }[],
  title?: string,
): ChartSpec {
  return { type: 'stackedBar', title, categories, series };
}

// 构成百分比柱状（已为百分比数值）
export function percentBars(
  categories: string[],
  data: Num[],
  name = '占比',
  unit = '%',
): ChartSpec {
  return { type: 'bar', unit, categories, series: [{ name, data }] };
}
