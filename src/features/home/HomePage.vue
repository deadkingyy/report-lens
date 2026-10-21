<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { INDUSTRIES, PROBLEMS, type IndustryKey, type ProblemId } from '@/engine';
import { useAppStore } from '@/store/useApp';

const router = useRouter();
const store = useAppStore();
const selProblem = ref<ProblemId>('risk');
const selIndustry = ref<IndustryKey>('general');

function start() {
  store.setProblem(selProblem.value);
  store.setIndustry(selIndustry.value);
  router.push({ path: '/analyze', query: { problem: selProblem.value, industry: selIndustry.value } });
}
</script>

<template>
  <div class="space-y-8">
    <section class="text-center">
      <h1 class="text-3xl font-bold">用一个投资问题，读懂一家公司的财报</h1>
      <p class="mt-2 text-slate-500">
        财报透视 · 赢麻了开源免费版：排雷、ROE、毛利率、资产、存货、产销量，图表化呈现，思路来自老唐读财报。
      </p>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold">① 你想解决哪个投资问题？</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="p in PROBLEMS"
          :key="p.id"
          @click="selProblem = p.id"
          class="rounded-xl border p-4 text-left transition hover:shadow"
          :class="selProblem === p.id ? 'border-brand bg-brandsoft' : 'border-slate-200 bg-white'"
        >
          <div class="text-2xl">{{ p.icon }}</div>
          <div class="mt-1 font-semibold">{{ p.title }}</div>
          <div class="mt-1 text-sm text-slate-500">{{ p.question }}</div>
          <div class="mt-2 text-xs text-slate-400">{{ p.desc }}</div>
        </button>
      </div>
    </section>

    <section>
      <h2 class="mb-3 text-lg font-semibold">② 公司属于哪个行业？（聚焦不同模块）</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="ind in INDUSTRIES"
          :key="ind.key"
          @click="selIndustry = ind.key"
          class="rounded-full border px-3 py-1.5 text-sm transition"
          :class="
            selIndustry === ind.key
              ? 'border-brand bg-brand text-white'
              : 'border-slate-200 bg-white text-slate-600'
          "
        >
          {{ ind.name }}
        </button>
      </div>
      <p class="mt-2 text-xs text-slate-400">
        {{ INDUSTRIES.find((i) => i.key === selIndustry)?.note }}
      </p>
    </section>

    <div class="text-center">
      <button
        @click="start"
        class="rounded-full bg-brand px-8 py-3 text-lg font-medium text-white hover:opacity-90"
      >
        开始分析 →
      </button>
    </div>
  </div>
</template>
