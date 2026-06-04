<template>
  <div class="min-h-screen bg-gradient-to-b from-[#E0E7FF] to-[#C7D2FE] relative overflow-hidden flex flex-col items-center px-6 py-10">
    <!-- 背景装饰圆 -->
    <div class="absolute -top-16 -right-12 w-56 h-56 rounded-full bg-blue-300/30 blur-2xl" />
    <div class="absolute top-32 -left-20 w-72 h-72 rounded-full bg-indigo-300/25 blur-3xl" />
    <div class="absolute bottom-40 -left-24 w-64 h-64 rounded-full bg-purple-300/20 blur-2xl" />
    <div class="absolute bottom-20 right-4 w-48 h-48 rounded-full bg-cyan-300/25 blur-2xl" />

    <!-- 主卡片区域 -->
    <div class="relative z-10 w-full max-w-sm flex-1 flex flex-col justify-center gap-5">
      <!-- 品牌卡片 -->
      <div class="bg-white rounded-3xl shadow-lg p-8 text-center">
        <h1 class="text-3xl font-bold text-[#4F6EF7] mb-1.5">费曼学习</h1>
        <p class="text-sm text-slate-500 mb-5">把知识讲明白，才是真的学会</p>
        <button
          class="w-14 h-14 mx-auto rounded-full bg-[#4F6EF7] text-white text-xl font-bold shadow-md shadow-blue-400/40 active:scale-95 transition-transform"
          @click="handleBrainTap"
        >
          脑
        </button>
      </div>

      <!-- 今日目标卡片 -->
      <div class="bg-white rounded-2xl shadow-md p-5">
        <p class="text-sm font-semibold text-slate-800 mb-1">今日目标</p>
        <p class="text-xs text-slate-500 mb-3">完成 1 次费曼讲解 + 10 张闪卡复习</p>
        <ProgressBar :value="goalProgress" color="bg-[#4F6EF7]" height="h-2.5" />
      </div>
    </div>

    <!-- 底部 CTA 区域 -->
    <div class="relative z-10 w-full max-w-sm mt-auto pb-8 space-y-4">
      <p class="text-center text-sm font-medium text-slate-700">开始构建你的知识宇宙</p>
      <button
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/35 active:scale-[0.98] transition-all duration-200"
        @click="handleStart"
      >
        立即开始
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import ProgressBar from '@/components/common/ProgressBar.vue'

const router = useRouter()
const { markSplashSeen, hasSeenSplash } = useAppStore()

const goalProgress = ref(60)

onMounted(() => {
  // 如果已经看过启动页，直接跳转到首页
  if (hasSeenSplash.value) {
    router.replace('/home')
  }
})

function handleBrainTap() {
  // 轻微动画反馈已通过 CSS active:scale-95 实现
}

function handleStart() {
  markSplashSeen()
  localStorage.setItem('feiman_splash_seen', 'true')
  router.push('/home')
}
</script>
