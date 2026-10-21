<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getIndustry, PROBLEMS, type IndustryKey, type ProblemId } from '@/engine';
import { useAppStore } from '@/store/useApp';
import ModuleResult from './ModuleResult.vue';
import ReportHero from './ReportHero.vue';
import CtaBanner from '@/components/CtaBanner.vue';

const route = useRoute();
const store = useAppStore();

const showMore = ref(false);

// 语境条：接住首页「问题驱动」的承诺
const problemMeta = computed(() => PROBLEMS.find((p) => p.id === store.problem));

function syncFromQuery() {
  const p = route.query.problem as ProblemId | undefined;
  const i = route.query.industry as IndustryKey | undefined;
  if (p) store.setProblem(p);
  if (i) store.setIndustry(i);
}
onMounted(() => syncFromQuery());
watch(() => route.query, syncFromQuery);
</script>

<template>
  <div v-if="store.error" class="rounded bg-red-50 p-3 text-sm text-red-600">{{ store.error }}</div>
  <div v-else-if="store.loading" class="text-slate-400">加载中…</div>
  <div v-else class="grid gap-4 lg:grid-cols-[260px_1fr]">
    <aside class="space-y-3">
      <!-- 两级导航：报告（Hero）置顶 + 更多维度折叠 -->
      <div class="rounded-xl border border-slate-200 bg-white p-3">
        <button
          class="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition"
          :class="
            store.view === 'report'
              ? 'bg-brandsoft text-brand'
              : 'text-slate-600 hover:bg-slate-50'
          "
          @click="store.setView('report')"
        >
          🛡 排雷体检报告
          <span class="ml-1 text-xs font-normal text-slate-400">推荐先看</span>
        </button>

        <button
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50"
          @click="showMore = !showMore"
        >
          <span>更多维度（{{ store.secondaryModules.length }}）</span>
          <span class="text-xs">{{ showMore ? '▲' : '▼' }}</span>
        </button>
        <div v-show="showMore" class="mt-1 space-y-0.5">
          <button
            v-for="m in store.secondaryModules"
            :key="m.id"
            class="block w-full rounded-lg px-3 py-1.5 pl-6 text-left text-sm transition"
            :class="
              store.view === m.id ? 'bg-brandsoft font-medium text-brand' : 'text-slate-600 hover:bg-slate-50'
            "
            @click="store.setView(m.id)"
          >
            {{ m.title }}
          </button>
        </div>
      </div>
      <CtaBanner />
    </aside>

    <section class="space-y-3">
      <!-- 语境条：你正在解决什么问题 -->
      <div
        v-if="problemMeta"
        class="flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2.5 text-sm"
      >
        <span>{{ problemMeta.icon }}</span>
        <span class="text-slate-500">你正在排查：</span>
        <b class="text-slate-700">{{ problemMeta.title }}</b>
        <span class="text-slate-400">— {{ problemMeta.question }}</span>
      </div>

      <!-- 公司条 -->
      <div
        class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"
      >
        <div>
          <div class="font-semibold">{{ store.dataset?.name }}</div>
          <div class="text-xs text-slate-400">
            {{ getIndustry(store.industry).name }} ·
            {{ store.dataset?.periods[0]?.slice(0, 4) }}–{{
              store.dataset?.periods[store.dataset.periods.length - 1]?.slice(0, 4)
            }}
            <span v-if="store.usingRealData" class="ml-1 rounded bg-emerald-50 px-1 text-emerald-600">真实数据</span>
            <span v-else class="ml-1 rounded bg-slate-100 px-1 text-slate-400">示例数据</span>
          </div>
        </div>
        <select
          :value="store.currentSymbol"
          @change="store.selectStock(($event.target as HTMLSelectElement).value)"
          class="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        >
          <option v-for="s in store.stockList" :key="s.symbol" :value="s.symbol">{{ s.name }}</option>
        </select>
      </div>

      <p
        v-if="store.dataset?.disclaimer"
        class="rounded bg-slate-50 px-3 py-2 text-xs text-slate-500"
      >
        ⓘ {{ store.dataset.disclaimer }}
      </p>

      <!-- 默认：Hero 报告；否则次级维度单图视图 -->
      <ReportHero v-if="store.view === 'report' && store.ctxReady" :ctx="store.analysisCtx!" />
      <ModuleResult v-else-if="store.lastResult" :result="store.lastResult" />
      <div v-else class="text-slate-400">选择左侧模块开始分析…</div>
    </section>
  </div>
</template>
