<template>
  <div class="max-w-md mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 relative">
    <slot />
    <BottomNav :current-tab="currentTab" @update:tab="$emit('update:tab', $event)" />
    <div class="h-[env(safe-area-inset-bottom)]" />
  </div>
</template>

<script setup lang="ts">
import BottomNav from './BottomNav.vue'

defineProps<{
  currentTab: number
}>()

defineEmits<{
  (e: 'update:tab', value: number): void
}>()
</script>
