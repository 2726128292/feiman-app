<template>
  <header
    class="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center h-[52px] px-4 shrink-0"
    style="padding-top: max(env(safe-area-inset-top), 12px)"
  >
    <button
      v-if="showBack"
      class="flex items-center justify-center w-8 h-8 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 active:bg-slate-100 dark:active:bg-slate-700 transition-colors"
      @click="$emit('back')"
    >
      <ArrowLeft :size="20" />
    </button>
    <h1
      class="text-base font-semibold text-slate-900 dark:text-white truncate"
      :class="showBack ? '' : 'mx-auto text-center'"
    >
      {{ title }}
    </h1>
  </header>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

withDefaults(defineProps<{
  title: string
  showBack?: boolean
}>(), {
  showBack: false,
})

defineEmits<{
  (e: 'back'): void
}>()
</script>
