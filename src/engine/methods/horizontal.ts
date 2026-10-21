import type { ChartSpec } from '../analysis/define';
import type { Num } from '../schema/types';

// 方法三：横向对比（同业 / 同业基准）
// categories = 公司名列表（含本公司），series = 各指标
export function compareBars(
  categories: string[],
  series: { name: string; data: Num[] }[],
  opts?: { title?: string; unit?: string },
): ChartSpec {
  return {
    type: 'groupedBar',
    title: opts?.title,
    unit: opts?.unit,
    categories,
    series,
  };
}
