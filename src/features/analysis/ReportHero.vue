<script setup lang="ts">
import { computed, ref } from 'vue';
import type { AnalysisContext } from '@/engine';
import { mineChecks, mineVerdict } from '@/engine';
import { qualityScoreOf } from '@/engine';
import { flowTypeRows } from '@/engine';
import EChart from '@/features/charts/EChart.vue';

const props = defineProps<{ ctx: AnalysisContext }>();

// ── 数据层：全部来自引擎共享口径（与排雷/体检/八型模块一致）──
const checks = computed(() => mineChecks(props.ctx));
const verdict = computed(() => mineVerdict(checks.value));
const quality = computed(() => qualityScoreOf(props.ctx));
const flows = computed(() => flowTypeRows(props.ctx));
const latestFlow = computed(() => flows.value[flows.value.length - 1]);

// ── Zone A：Verdict 头 ──
const verdictMeta = computed(() => {
  if (verdict.value === 'danger')
    return { label: '高危', cls: 'bg-red-500', tip: '发现高危信号，建议核查后再决策' };
  if (verdict.value === 'watch') return { label: '关注', cls: 'bg-amber-500', tip: '无高危，但存在中度信号' };
  return { label: '安全', cls: 'bg-emerald-500', tip: '未触发老唐排雷清单的警戒线' };
});

const ring = computed(() => {
  const r = 52;
  const c = 2 * Math.PI * r;
  return { r, c, dash: (quality.value.score / 100) * c };
});

const triggered = computed(() => checks.value.filter((c) => c.status === 'triggered'));
const naChecks = computed(() => checks.value.filter((c) => c.status === 'na'));

const scoreSentence = computed(() => {
  const q = quality.value;
  if (q.weak.length === 0 && q.strong.length > 0)
    return `七维质量无短板，长板：${q.strong.map((s) => s.cn).join('、')}。`;
  if (q.weak.length === 0) return '七维质量无显著短板。';
  return `质量短板：${q.weak.map((s) => `${s.cn}(${s.score}分)`).join('、')}。`;
});

// ── Zone B：清单展开状态 ──
const expanded = ref<string | null>(null);
function toggle(id: string) {
  expanded.value = expanded.value === id ? null : id;
}

// ── Zone D：结论段 ──
const conclusion = computed(() => {
  const t = triggered.value;
  if (t.length === 0)
    return `本次排雷 ${checks.value.length - naChecks.value.length} 项检查全部通过，${scoreSentence.value} 重点关注两项不能自动化的功课：一是毛利率与商业模式的相互印证，二是管理层诚信记录。`;
  const high = t.filter((c) => c.severity === 'high');
  const mid = t.filter((c) => c.severity === 'mid');
  const parts: string[] = [];
  if (high.length) parts.push(`高危信号 ${high.map((c) => c.name).join('、')}`);
  if (mid.length) parts.push(`中度信号 ${mid.map((c) => c.name).join('、')}`);
  return `发现${parts.join('，以及')}。${scoreSentence.value}这些信号不等于造假，但意味着你需要按下方「下一步」逐项核实——排雷的目的不是一票否决，而是把不确定性变成可核查的清单。`;
});
</script>

<template>
  <div class="space-y-4">
    <!-- Zone A: Verdict 头 -->
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-wrap items-center gap-5">
        <!-- 三态标签 -->
        <div
          class="flex items-center gap-2 rounded-full px-4 py-1.5 text-base font-semibold text-white"
          :class="verdictMeta.cls"
        >
          <span>{{ verdictMeta.label }}</span>
        </div>
        <!-- 体检分环 -->
        <div class="relative h-28 w-28 shrink-0">
          <svg viewBox="0 0 120 120" class="h-full w-full -rotate-90">
            <circle cx="60" cy="60" :r="ring.r" fill="none" stroke="#e2e8f0" stroke-width="12" />
            <circle
              cx="60" cy="60" :r="ring.r" fill="none" stroke="#2f6bff" stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="`${ring.dash} ${ring.c}`"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-2xl font-bold text-slate-800">{{ quality.score }}</div>
            <div class="text-xs text-slate-400">{{ quality.grade }}</div>
          </div>
        </div>
        <!-- 一句话结论 -->
        <div class="min-w-40 flex-1">
          <div class="font-semibold text-slate-800">{{ ctx.dataset.name }} · 质地体检</div>
          <p class="mt-1 text-sm leading-6 text-slate-600">
            {{ verdictMeta.tip }}。{{ scoreSentence }}
            <span v-if="latestFlow" class="text-slate-500">
              现金流形态为「{{ latestFlow.type }}」（{{ latestFlow.signature }}）。
            </span>
          </p>
          <div v-if="naChecks.length" class="mt-1 text-xs text-slate-400">
            ⓘ {{ naChecks.length }} 项检查因数据不足未执行（连接赢麻了开放平台可补全）
          </div>
        </div>
      </div>
    </div>

    <!-- Zone B: 排雷清单（全部展示，可展开） -->
    <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <h3 class="m-0 text-base font-semibold">老唐排雷清单 · {{ checks.length }} 项</h3>
        <span class="text-xs text-slate-400">点击任意一行看证据与下一步</span>
      </div>
      <div class="divide-y divide-slate-100">
        <div v-for="c in checks" :key="c.id">
          <button
            class="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
            @click="toggle(c.id)"
          >
            <span
              class="w-6 text-center text-base"
              :class="{
                'text-emerald-500': c.status === 'safe',
                'text-red-500': c.status === 'triggered' && c.severity === 'high',
                'text-amber-500': c.status === 'triggered' && c.severity !== 'high',
                'text-slate-300': c.status === 'na',
              }"
            >
              {{ c.status === 'safe' ? '✓' : c.status === 'triggered' ? (c.severity === 'high' ? '✗' : '△') : '—' }}
            </span>
            <span class="w-56 shrink-0 text-sm font-medium text-slate-700">{{ c.name }}</span>
            <span class="hidden flex-1 truncate text-xs text-slate-400 sm:block">{{ c.evidence }}</span>
            <span
              v-if="c.status === 'triggered'"
              class="shrink-0 rounded px-1.5 py-0.5 text-xs"
              :class="c.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'"
            >
              {{ c.severity === 'high' ? '高危' : '中度' }}
            </span>
            <span class="text-xs text-slate-300">{{ expanded === c.id ? '▲' : '▼' }}</span>
          </button>
          <!-- 展开：为什么 + 证据图 + 下一步 -->
          <div v-if="expanded === c.id" class="space-y-3 bg-slate-50/60 px-5 pb-4 pt-1">
            <p class="m-0 text-sm leading-6 text-slate-700">
              <b>{{ c.status === 'triggered' ? '为什么危险：' : c.status === 'safe' ? '为什么安全：' : '数据缺口：' }}</b>
              {{ c.why }}
            </p>
            <p v-if="c.next" class="m-0 rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">{{ c.next }}</p>
            <p v-if="c.laotang" class="m-0 rounded bg-amber-50 px-3 py-2 text-sm text-amber-800">老唐视角：{{ c.laotang }}</p>
            <EChart v-if="c.chart" :spec="c.chart" />
          </div>
        </div>
      </div>
    </div>

    <!-- Zone C: 体检分构成（七维） -->
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 class="m-0 text-base font-semibold">质量体检 · 七维构成</h3>
      <p class="mt-1 text-xs text-slate-400">
        透明启发式权重（合计 100%），对齐 Script 专业版「质量体检包」七维思路；连接赢麻了可获专有模型与真实行业分位。
      </p>
      <div class="mt-3 space-y-2">
        <div v-for="s in quality.subs" :key="s.key" class="flex items-center gap-3">
          <span class="w-32 shrink-0 text-sm text-slate-600">{{ s.cn }}</span>
          <span class="w-16 shrink-0 text-right text-xs text-slate-400">{{ s.text }}</span>
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full transition-all"
              :class="s.score >= 80 ? 'bg-emerald-400' : s.score >= 30 ? 'bg-brand' : 'bg-red-400'"
              :style="{ width: `${s.score}%` }"
            />
          </div>
          <span class="w-14 shrink-0 text-right text-xs font-medium text-slate-500">{{ s.score }}分</span>
          <span class="w-10 shrink-0 text-right text-xs text-slate-300">×{{ s.weight * 100 }}%</span>
        </div>
      </div>
    </div>

    <!-- Zone D: 结论段 -->
    <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 class="m-0 text-base font-semibold">结论与下一步</h3>
      <p class="mt-2 text-sm leading-6 text-slate-700">{{ conclusion }}</p>
    </div>
  </div>
</template>
