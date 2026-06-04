<template>
  <Transition name="banner-slide">
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-[9998] bg-amber-500 text-white px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2"
    >
      <WifiOff :size="14" />
      当前处于离线模式 · 数据已保存在本地
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { WifiOff } from 'lucide-vue-next'

const isOnline = ref(navigator.onLine)

/** 更新在线状态 */
function updateStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<style scoped>
/* 横幅滑入滑出动画 */
.banner-slide-enter-active {
  transition: transform 0.3s ease;
}
.banner-slide-leave-active {
  transition: transform 0.3s ease;
}
.banner-slide-enter-from {
  transform: translateY(-100%);
}
.banner-slide-leave-to {
  transform: translateY(-100%);
}
</style>
