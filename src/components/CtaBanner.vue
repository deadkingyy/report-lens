<script setup lang="ts">
import { useAppStore } from '@/store/useApp';

defineProps<{ title?: string; desc?: string }>();
const store = useAppStore();
</script>

<template>
  <a
    :href="store.proUrl"
    target="_blank"
    rel="noopener"
    class="block rounded-xl border border-brand/30 bg-brandsoft px-4 py-3 transition hover:shadow"
  >
    <div class="font-medium text-brand">{{ title || '需要真实数据 / 全市场对比？' }}</div>
    <div class="mt-0.5 text-sm text-slate-600">
      {{
        desc ||
        '升级赢麻了专业版：连接开放平台获取实时财报、深度同业基准与 AI 研判。'
      }}
    </div>
    <span class="mt-1 inline-block font-medium text-brand">前往 winmale.com →</span>
  </a>
</template>
