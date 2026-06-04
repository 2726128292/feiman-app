<template>
  <div class="min-h-screen bg-[#1E293B] text-white pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-6">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-white">语音讲解模式</h1>
        <p class="text-sm text-slate-400 mt-0.5">录音后自动转文字与评分</p>
      </div>

      <!-- 录音区域 -->
      <div class="flex flex-col items-center py-8">
        <!-- 录音按钮 -->
        <button
          class="w-48 h-48 rounded-full bg-[#4F6EF7] flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-all duration-300 cursor-pointer"
          :class="{ 'animate-pulse-scale': isRecording }"
          @click="toggleRecording"
        >
          <span class="text-4xl font-bold text-white">{{ isRecording ? '停' : '录' }}</span>
        </button>

        <!-- 计时器 -->
        <p class="text-4xl font-bold text-white mt-8 tabular-nums tracking-wider">{{ formattedTime }}</p>

        <!-- 转写文本 -->
        <div class="mt-5 w-full max-w-sm">
          <p class="text-sm text-slate-500 mb-1.5">正在识别：</p>
          <p class="text-sm text-slate-400 leading-relaxed line-clamp-3">
            {{ transcription || '等待开始录音...' }}
          </p>
        </div>
      </div>

      <!-- 实时指标面板 -->
      <div class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
        <h2 class="text-base font-bold text-slate-200 mb-4">实时指标</h2>
        <div class="space-y-4">
          <!-- 语速 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm text-slate-400">语速</span>
              <span class="text-sm font-semibold text-cyan-400">186 字/分</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full w-[62%] bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" />
            </div>
          </div>
          <!-- 停顿 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm text-slate-400">停顿</span>
              <span class="text-sm font-semibold text-emerald-400">正常</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full w-[45%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
            </div>
          </div>
          <!-- 清晰度 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm text-slate-400">清晰度</span>
              <span class="text-sm font-semibold text-blue-400">86 分</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full w-[86%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <button
        class="w-full py-3.5 rounded-full bg-white text-slate-900 text-base font-semibold active:scale-[0.98] transition-transform duration-150"
        @click="handleFinish"
      >
        结束并分析
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isRecording = ref(false)
const seconds = ref(222) // 03:42
let timerInterval: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60).toString().padStart(2, '0')
  const s = (seconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const transcription = ref('递归是一种函数调用自己的方式，就像俄罗斯套娃，每个套娃里面还有一个更小的...')

function toggleRecording() {
  isRecording.value = !isRecording.value
  if (isRecording.value) {
    timerInterval = setInterval(() => {
      seconds.value++
    }, 1000)
  } else {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}

function handleFinish() {
  if (timerInterval) clearInterval(timerInterval)
  router.push('/explain/new/diagnosis')
}

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.animate-pulse-scale {
  animation: pulseScale 1.5s ease-in-out infinite;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
