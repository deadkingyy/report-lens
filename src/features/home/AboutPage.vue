<script setup lang="ts">
import { useAppStore } from '@/store/useApp';
const store = useAppStore();
</script>

<template>
  <div class="space-y-6">
    <section>
      <h1 class="text-2xl font-bold">关于「财报透视」</h1>
      <p class="mt-2 leading-7 text-slate-600">
        财报透视是
        <a :href="store.proUrl" target="_blank" rel="noopener" class="font-medium text-brand"
          >赢麻了（winmale.com）</a
        >
        的开源免费版前端，聚焦「用财报解决一个投资问题」。它复用赢麻了专业版的分析资产（三大报表口径、ROE
        杜邦、附注分析、排雷清单），以纯前端、离线可用的方式，把老唐《手把手教你读财报》的方法论产品化。
      </p>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <h2 class="mt-0 text-lg font-semibold">开源免费版 vs 专业版</h2>
      <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>免费版：内置示例数据、核心分析模块、图表化结论，开箱即用，纯前端运行。</li>
        <li>专业版：用 Open AppId 连接赢麻了后端，获取全市场实时财报、深度同业基准、AI 研判与排雷报告。</li>
        <li>分析引擎（<code>src/engine</code>）是纯 TypeScript，Vue / React 两端可共享复用。</li>
      </ul>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <h2 class="mt-0 text-lg font-semibold">如何接入赢麻了开放平台（获取真实数据）</h2>
      <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
        <li>在赢麻了开放平台申请 Open AppId。</li>
        <li>
          在项目根目录 <code>.env.local</code> 中配置
          <code>VITE_WINMALE_OPEN_APPID=你的AppId</code> 与
          <code>VITE_WINMALE_OPEN_BASE=https://open.winmale.com</code>。
        </li>
        <li>重启开发服务器，数据提供方自动切换为真实数据；缺失字段仍会优雅降级到示例逻辑。</li>
      </ol>
    </section>

    <section class="rounded-xl border border-slate-200 bg-white p-4">
      <h2 class="mt-0 text-lg font-semibold">贡献与合规</h2>
      <p class="mt-2 text-sm text-slate-600">
        欢迎在 GitHub 提交 Issue / PR 完善分析模块与方法论。本工具仅用于学习与教育，所有结论不构成任何投资建议。
      </p>
    </section>

    <div class="text-center">
      <a
        :href="store.proUrl"
        target="_blank"
        rel="noopener"
        class="rounded-full bg-brand px-8 py-3 text-lg font-medium text-white hover:opacity-90"
        >前往赢麻了专业版 →</a
      >
    </div>
  </div>
</template>
