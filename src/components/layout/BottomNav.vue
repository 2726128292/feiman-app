<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur border-t border-slate-200 dark:border-slate-700">
    <div class="max-w-md mx-auto flex items-center justify-around h-14 px-2" style="padding-bottom: env(safe-area-inset-bottom)">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 px-2 relative transition-colors"
        :class="currentTab === index ? 'text-[#4F6EF7] font-medium' : 'text-slate-400'"
        @click="$emit('update:tab', index)"
      >
        <span
          v-if="currentTab === index"
          class="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#4F6EF7]"
        />
        <component :is="tab.icon" :size="22" :stroke-width="currentTab === index ? 2.2 : 1.8" />
        <span class="text-[10px] leading-none">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, Route, Mic, BookOpen, User } from 'lucide-vue-next'

defineProps<{
  currentTab: number
}>()

defineEmits<{
  (e: 'update:tab', value: number): void
}>()

const tabs = [
  { icon: LayoutDashboard, label: '首页' },
  { icon: Route, label: '路径' },
  { icon: Mic, label: '讲解' },
  { icon: BookOpen, label: '复习' },
  { icon: User, label: '我的' },
]
</script>
