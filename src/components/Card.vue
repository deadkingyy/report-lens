<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 v-if="title" class="mb-3 mt-0 text-base font-semibold">{{ title }}</h3>
    <slot />
  </section>
</template>
