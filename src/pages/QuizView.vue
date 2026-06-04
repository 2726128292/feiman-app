<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900">模拟测验</h1>
        <p class="text-sm text-slate-500 mt-0.5">根据薄弱点自动出题</p>
      </div>

      <!-- 进度条 -->
      <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-[#4F6EF7] rounded-full transition-all duration-500"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <!-- 题号 -->
      <p class="text-base font-bold text-[#4F6EF7] tabular-nums">
        {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(totalQuestions).padStart(2, '0') }}
      </p>

      <!-- 题目文字 -->
      <p class="text-lg font-bold text-slate-900 leading-relaxed">
        {{ currentQuestion.question }}
      </p>

      <!-- 选项列表 -->
      <div class="space-y-3">
        <button
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          class="w-full rounded-xl border-2 p-4 text-left transition-all duration-200 flex items-start gap-3"
          :class="optionClass(idx)"
          @click="selectOption(idx)"
        >
          <span class="font-bold shrink-0 mt-0.5" :class="optionLabelColor(idx)">
            {{ optionLabels[idx] }}.
          </span>
          <span class="text-sm font-medium leading-snug" :class="optionTextColor(idx)">
            {{ option.replace(/^[A-D]\.\s*/, '') }}
          </span>
        </button>
      </div>

      <!-- 解析面板（选择后显示） -->
      <div v-if="selectedOption !== null" class="bg-emerald-50 rounded-2xl p-4 space-y-1">
        <p class="text-sm font-semibold text-emerald-600">解析</p>
        <p class="text-sm text-slate-700 leading-relaxed">{{ currentQuestion.explanation }}</p>
      </div>

      <!-- 下一题按钮 -->
      <button
        v-if="selectedOption !== null && currentIndex < totalQuestions - 1"
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150"
        @click="nextQuestion"
      >
        下一题
      </button>

      <!-- 完成提示 -->
      <div
        v-if="selectedOption !== null && currentIndex >= totalQuestions - 1"
        class="text-center py-4"
      >
        <p class="text-lg font-bold text-slate-800">测验完成！</p>
        <p class="text-sm text-slate-500 mt-1">得分：{{ score }} / {{ totalQuestions }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockQuizQuestions } from '@/utils/mock'

const questions = [...mockQuizQuestions]
const currentIndex = ref(0)
const selectedOption = ref<number | null>(null)
const score = ref(0)

const totalQuestions = computed(() => questions.length)
const currentQuestion = computed(() => questions[currentIndex.value])

const progressPercent = computed(() =>
  Math.round(((currentIndex.value + (selectedOption.value !== null ? 1 : 0)) / totalQuestions.value) * 100)
)

const optionLabels = ['A', 'B', 'C', 'D']

function optionClass(idx: number): string {
  if (selectedOption.value === null) {
    return 'border-slate-200 bg-white hover:border-blue-300'
  }

  if (idx === currentQuestion.value.correctIndex) {
    return 'border-emerald-500 bg-emerald-50'
  }
  if (idx === selectedOption.value && selectedOption.value !== currentQuestion.value.correctIndex) {
    return 'border-red-400 bg-red-50'
  }
  return 'border-slate-200 bg-white opacity-60'
}

function optionLabelColor(idx: number): string {
  if (selectedOption.value === null) return 'text-slate-600'
  if (idx === currentQuestion.value.correctIndex) return 'text-emerald-600'
  if (idx === selectedOption.value && selectedOption.value !== currentQuestion.value.correctIndex) return 'text-red-500'
  return 'text-slate-400'
}

function optionTextColor(idx: number): string {
  if (selectedOption.value === null) return 'text-slate-800'
  if (idx === currentQuestion.value.correctIndex) return 'text-emerald-800'
  if (idx === selectedOption.value && selectedOption.value !== currentQuestion.value.correctIndex) return 'text-red-700'
  return 'text-slate-500'
}

function selectOption(idx: number) {
  if (selectedOption.value !== null) return
  selectedOption.value = idx
  if (idx === currentQuestion.value.correctIndex) {
    score.value++
  }
}

function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value++
    selectedOption.value = null
  }
}
</script>
