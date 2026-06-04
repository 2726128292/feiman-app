<template>
  <div class="space-y-3 animate-pulse">
    <!-- 头部骨架 -->
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
      <div class="flex-1">
        <div class="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div class="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800 mt-2" />
      </div>
    </div>
    <!-- 卡片骨架 -->
    <div
      v-for="i in cardCount"
      :key="i"
      class="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm"
    >
      <div class="flex items-start gap-3">
        <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div class="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
          <div class="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 全局骨架屏加载组件
 * 用于数据加载阶段的占位展示，提升用户体验
 */
defineProps<{
  /** 骨架卡片数量，默认 5 */
  cardCount?: number
}>()
</script>
