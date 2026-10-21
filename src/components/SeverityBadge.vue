<script setup lang="ts">
import { computed } from 'vue';
import type { Severity } from '@/engine';

const props = defineProps<{ severity?: Severity }>();
const map: Record<Severity, { t: string; c: string }> = {
  high: { t: '高危', c: 'bg-red-50 text-red-600 border-red-200' },
  mid: { t: '中度', c: 'bg-amber-50 text-amber-600 border-amber-200' },
  low: { t: '轻度', c: 'bg-slate-200 text-slate-600 border-slate-300' },
  info: { t: '提示', c: 'bg-blue-50 text-blue-600 border-blue-200' },
};
const s = computed(() => (props.severity ? map[props.severity] : map.info));
</script>

<template>
  <span class="rounded border px-2 py-0.5 text-xs font-medium" :class="s.c">{{ s.t }}</span>
</template>
