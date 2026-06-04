<template>
  <Teleport to="body">
    <Transition name="guide-fade">
      <div v-if="visible" class="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm" @click.self="skipAll">
        <!-- 进度指示器 -->
        <div class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-1.5">
          <div
            v-for="i in steps.length"
            :key="i"
            class="w-6 h-1.5 rounded-full transition-all"
            :class="i - 1 <= currentStep ? 'bg-white' : 'bg-white/30'"
          />
        </div>

        <!-- 引导卡片 -->
        <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pt-8 safe-bottom" :style="{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }">
          <!-- 插图区域 -->
          <div class="w-full h-36 rounded-2xl mb-5 flex items-center justify-center text-4xl" :style="{ background: steps[currentStep].bgGradient }">
            {{ steps[currentStep].icon }}
          </div>

          <!-- 文字 -->
          <h2 class="text-lg font-bold text-slate-800 mb-2">{{ steps[currentStep].title }}</h2>
          <p class="text-sm text-slate-500 leading-relaxed mb-6">{{ steps[currentStep].desc }}</p>

          <!-- 按钮 -->
          <div class="flex gap-3">
            <button
              v-if="currentStep > 0"
              class="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 active:bg-slate-50"
              @click="prevStep"
            >
              上一步
            </button>
            <button
              class="flex-1 py-3 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold active:bg-blue-600"
              @click="nextStep"
            >
              {{ currentStep === steps.length - 1 ? '开始学习' : '下一步' }}
            </button>
          </div>

          <!-- 跳过 -->
          <button
            v-if="currentStep < steps.length - 1"
            class="mt-3 w-full py-2 text-xs text-slate-400 hover:text-slate-600"
            @click="skipAll"
          >跳过引导</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(false)
const currentStep = ref(0)

/** 引导步骤配置 */
const steps = [
  {
    icon: '📚',
    title: '欢迎来到费曼学习法',
    desc: '"把知识讲明白，才是真的学会"。通过主动讲解来检验和巩固你的理解。',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    icon: '🎯',
    title: '设定学习目标',
    desc: '创建你的学习路径，拆解为可管理的章节和知识点，一步步攻克。',
    bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    icon: '🎤',
    title: '用讲解代替死记硬背',
    desc: '用自己的话把知识讲出来，系统会自动评分并找出你的薄弱环节。',
    bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    icon: '🔄',
    title: '间隔复习，长期记忆',
    desc: '通过闪卡复习巩固记忆，科学算法帮你安排最佳复习时间。',
    bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
]

/** 下一步 / 完成引导 */
function nextStep(): void {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    finish()
  }
}

/** 上一步 */
function prevStep(): void {
  if (currentStep.value > 0) currentStep.value--
}

/** 跳过全部引导 */
function skipAll(): void {
  finish()
}

/** 完成引导，标记 localStorage 并隐藏 */
function finish(): void {
  visible.value = false
  localStorage.setItem('feiman_onboarding_done', 'true')
}

onMounted(() => {
  const done = localStorage.getItem('feiman_onboarding_done')
  if (!done) {
    setTimeout(() => { visible.value = true }, 500)
  }
})
</script>

<style scoped>
.guide-fade-enter-active { transition: all 0.3s ease; }
.guide-fade-leave-active { transition: all 0.2s ease; }
.guide-fade-enter-from { opacity: 0; }
.guide-fade-leave-to { opacity: 0; }
</style>
