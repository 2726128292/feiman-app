<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 移动端底部导航（桌面端隐藏） -->
    <BottomNav v-if="!isDesktop" :current-tab="currentTab" @update:tab="$emit('update:tab', $event)" />
    <div class="h-[env(safe-area-inset-bottom)]" v-if="!isDesktop" />

    <!-- 主内容区 -->
    <main :class="isDesktop ? 'pt-0' : 'pt-safe-top pb-safe-bottom'">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import BottomNav from './BottomNav.vue'

withDefaults(defineProps<{
  currentTab: number
  /** 是否为桌面端布局（>=1024px） */
  isDesktop?: boolean
}>(), {
  isDesktop: false,
})

defineEmits<{
  (e: 'update:tab', value: number): void
}>()
</script>
