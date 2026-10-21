<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ChartSpec } from '@/engine';

// 仅注册用到的模块，控制打包体积
echarts.use([BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const props = defineProps<{ spec: ChartSpec }>();
const el = ref<HTMLElement | null>(null);
let chart: echarts.EChartsType | null = null;

// 把通用 ChartSpec 翻译成 ECharts option（图表适配层，框架无关）
function build(spec: ChartSpec): Record<string, unknown> {
  if (spec.type === 'pie') {
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, type: 'scroll' },
      series: [
        {
          type: 'pie',
          radius: ['42%', '70%'],
          data: spec.pie || [],
          label: { formatter: '{b}: {d}%' },
        },
      ],
    };
  }
  const isLine = spec.type === 'line';
  const series = (spec.series || []).map((s) => ({
    name: s.name,
    type: isLine ? 'line' : 'bar',
    data: s.data,
    smooth: isLine,
    areaStyle: isLine && s.area ? {} : undefined,
    stack: spec.type === 'stackedBar' ? 'total' : undefined,
  }));
  return {
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, type: 'scroll' },
    grid: { left: 52, right: 18, top: 36, bottom: 52 },
    xAxis: { type: 'category', data: spec.categories, axisLabel: { interval: 0 } },
    yAxis: { type: 'value', name: spec.unit },
    series,
    ...spec.option,
  };
}

function render() {
  if (!el.value) return;
  if (!chart) chart = echarts.init(el.value);
  chart.setOption(build(props.spec), true);
}

function onResize() {
  chart?.resize();
}

onMounted(() => {
  render();
  window.addEventListener('resize', onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  chart?.dispose();
});
watch(() => props.spec, render, { deep: true });
</script>

<template>
  <div ref="el" class="h-72 w-full"></div>
</template>
