<template>
  <AppLayout :current-tab="currentTab" @update:tab="onTabChange">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const route = useRoute()
const { hasSeenSplash, markSplashSeen } = useAppStore()
const currentTab = ref(0)

// Tab 路由映射
const tabRoutes = ['/home', '/paths', '/explain', '/review/cards', '/settings']

// 点击底部导航栏时切换路由
function onTabChange(index: number) {
  currentTab.value = index
  router.push(tabRoutes[index])
}

// 根据路由meta.tab更新底部导航高亮
watch(() => route.path, (path) => {
  const matched = router.getRoutes().find(r => r.path === path || (r.path.includes(':') && path.startsWith(r.path.split('/:')[0])))
  if (matched?.meta?.tab !== undefined) {
    currentTab.value = matched.meta.tab as number
  }
}, { immediate: true })

onMounted(() => {
  if (!hasSeenSplash.value) {
    router.replace('/splash')
  }
})
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
