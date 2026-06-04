<template>
  <div class="w-full rounded-full overflow-hidden" :class="height">
    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div
        class="rounded-full transition-all duration-300 ease-out"
        :class="color"
        :style="{ width: `${Math.min(Math.max(value, 0), 100)}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  value: number
  color?: string
  height?: string
}>(), {
  color: 'bg-blue-500',
  height: 'h-2',
})
</script>
