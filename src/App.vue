<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore } from '@/store/useApp';

const store = useAppStore();
onMounted(() => store.init());
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <router-link to="/" class="flex items-center gap-2 font-semibold">
          <span class="text-xl">📊</span>
          <span>财报透视</span>
          <span class="rounded bg-brandsoft px-1.5 py-0.5 text-xs text-brand">赢麻了开源版</span>
        </router-link>
        <nav class="flex items-center gap-4 text-sm">
          <router-link to="/" class="text-slate-600 hover:text-brand">首页</router-link>
          <router-link to="/about" class="text-slate-600 hover:text-brand">关于</router-link>
          <a
            :href="store.proUrl"
            target="_blank"
            rel="noopener"
            class="rounded-full bg-brand px-3 py-1.5 font-medium text-white hover:opacity-90"
            >赢麻了专业版 →</a
          >
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <router-view />
    </main>

    <footer class="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
      财报透视 · 基于老唐《手把手教你读财报》方法论与赢麻了专业版分析资产 · 仅供学习，不构成投资建议
    </footer>
  </div>
</template>
