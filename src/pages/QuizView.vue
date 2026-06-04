<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">模拟测验</h1>
        <p class="text-sm text-slate-500 mt-0.5">根据薄弱点自动出题</p>
      </div>

      <!-- 进度条 -->
      <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-[#4F6EF7] rounded-full transition-all duration-500"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <!-- 加载中提示 -->
      <div v-if="isGeneratingQuiz" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 mx-auto text-[#4F6EF7]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">AI 正在生成测验题目...</p>
      </div>

      <!-- 题目区域（加载完成后显示） -->
      <template v-if="!isGeneratingQuiz">

      <!-- 题号 -->
      <p class="text-base font-bold text-[#4F6EF7] tabular-nums">
        {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(totalQuestions).padStart(2, '0') }}
      </p>

      <!-- 题目文字 -->
      <p class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
        {{ currentQuestion.question }}
      </p>

      <!-- 选项列表 -->
      <div class="space-y-3">
        <button
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          class="w-full rounded-xl border-2 p-4 text-left transition-all duration-200 flex items-start gap-3"
          :class="optionClass(idx)"
          style="min-height: 52px;"
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
      <div v-if="selectedOption !== null" class="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 space-y-1">
        <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">解析</p>
        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{{ currentQuestion.explanation }}</p>
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
        class="text-center py-4 space-y-4"
      >
        <div class="py-4">
          <p class="text-lg font-bold text-slate-800 dark:text-slate-200">测验完成！</p>
          <p class="text-sm text-slate-500 mt-1">得分：{{ score }} / {{ totalQuestions }}</p>
          <p class="text-xs text-slate-400 mt-2">
            {{ wrongCount > 0 ? `已将 ${wrongCount} 道错题加入闪卡复习池` : '全部正确！太棒了！' }}
          </p>
        </div>
        <button
          class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150"
          style="min-height: 48px;"
          @click="restartQuiz"
        >
          再来一套
        </button>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue'
import { generateQuiz, isAIReady, isLoading } from '@/composables/useDeepSeek'
import { mockQuizQuestions } from '@/utils/mock'

const questions = ref([...mockQuizQuestions])
const currentIndex = ref(0)
const selectedOption = ref<number | null>(null)
const score = ref(0)

// 测验主题（用于记录和闪卡标签）
const quizTopic = ref('通用')

// AI 出题状态
const isGeneratingQuiz = ref(false)

// 注入全局 Toast
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast') || ((msg: string) => console.log(msg))

const totalQuestions = computed(() => questions.value.length)
const currentQuestion = computed(() => questions.value[currentIndex.value])

const progressPercent = computed(() =>
  Math.round(((currentIndex.value + (selectedOption.value !== null ? 1 : 0)) / totalQuestions.value) * 100)
)

const optionLabels = ['A', 'B', 'C', 'D']

/** 答错题目数量 */
const wrongCount = computed((): number => {
  return questions.value.filter(
    (q: { selectedAnswer?: number; correctIndex: number }) => q.selectedAnswer !== q.correctIndex
  ).length
})

/**
 * 保存本次测验结果到 localStorage
 * 同时将错题自动生成闪卡加入复习池
 */
function saveQuizResult(): void {
  const correctCount = questions.value.filter(
    (q: { selectedAnswer?: number; correctIndex: number }) => q.selectedAnswer === q.correctIndex
  ).length

  const record = {
    id: crypto.randomUUID(),
    topic: quizTopic.value,
    totalQuestions: questions.value.length,
    correctCount,
    score: Math.round((correctCount / questions.value.length) * 100),
    wrongAnswers: questions.value
      .filter((q: { selectedAnswer?: number; correctIndex: number }) => q.selectedAnswer !== q.correctIndex)
      .map((q: { question: string; options: string[]; selectedAnswer?: number; correctIndex: number; explanation?: string }) => ({
        question: q.question,
        yourAnswer: q.options[q.selectedAnswer || 0],
        correctAnswer: q.options[q.correctIndex],
        explanation: q.explanation || '',
      })),
    createdAt: new Date().toISOString(),
  }

  // 保存测验记录到 feiman_quiz_records（保留最近30条）
  try {
    const recordsRaw = localStorage.getItem('feiman_quiz_records')
    const records = recordsRaw ? JSON.parse(recordsRaw) : []
    records.unshift(record)
    if (records.length > 30) records.length = 30
    localStorage.setItem('feiman_quiz_records', JSON.stringify(records))
  } catch {
    console.warn('保存测验记录失败')
  }

  // 错题自动生成闪卡加入复习池 feiman_review_cards
  if (record.wrongAnswers.length > 0) {
    try {
      const cardsRaw = localStorage.getItem('feiman_review_cards') || '[]'
      const cards = JSON.parse(cardsRaw)

      for (const wrong of record.wrongAnswers) {
        cards.push({
          id: crypto.randomUUID(),
          question: wrong.question,
          answer: `${wrong.correctAnswer}\n\n解析：${wrong.explanation}`,
          tags: ['错题', quizTopic.value],
          deck: 'default',
          interval: 1,
          easeFactor: 2.5,
          repetition: 0,
          nextReview: new Date(Date.now() + 86400000).toISOString(),
          reviewCount: 0,
          createdAt: new Date().toISOString(),
          source: 'quiz_wrong',
        })
      }

      localStorage.setItem('feiman_review_cards', JSON.stringify(cards))
      showToast(`已将 ${record.wrongAnswers.length} 道错题加入闪卡复习池`, 'success')
    } catch {
      console.warn('生成错题闪卡失败')
    }
  } else {
    showToast('全部正确！太棒了！', 'success')
  }
}

// 监听测验完成状态，自动保存结果
watch(
  () => selectedOption.value !== null && currentIndex.value >= totalQuestions.value - 1,
  (isFinished) => {
    if (isFinished) {
      saveQuizResult()
    }
  },
)

function optionClass(idx: number): string {
  if (selectedOption.value === null) {
    return 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300'
  }

  if (idx === currentQuestion.value.correctIndex) {
    return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
  }
  if (idx === selectedOption.value && selectedOption.value !== currentQuestion.value.correctIndex) {
    return 'border-red-400 bg-red-50 dark:bg-red-900/20'
  }
  return 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 opacity-60'
}

function optionLabelColor(idx: number): string {
  if (selectedOption.value === null) return 'text-slate-600 dark:text-slate-400'
  if (idx === currentQuestion.value.correctIndex) return 'text-emerald-600 dark:text-emerald-400'
  if (idx === selectedOption.value && selectedOption.value !== currentQuestion.value.correctIndex) return 'text-red-500 dark:text-red-400'
  return 'text-slate-400 dark:text-slate-500'
}

function optionTextColor(idx: number): string {
  if (selectedOption.value === null) return 'text-slate-800 dark:text-slate-200'
  if (idx === currentQuestion.value.correctIndex) return 'text-emerald-800 dark:text-emerald-300'
  if (idx === selectedOption.value && selectedOption.value !== currentQuestion.value.correctIndex) return 'text-red-700 dark:text-red-300'
  return 'text-slate-500 dark:text-slate-400'
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

/** 重新开始测验（再来一套） */
function restartQuiz() {
  // 重新加载题目（优先尝试 AI 出题，否则使用 mock）
  questions.value = [...mockQuizQuestions]
  currentIndex.value = 0
  selectedOption.value = null
  score.value = 0

  // 如果 AI 可用，尝试重新生成
  if (isAIReady.value) {
    isGeneratingQuiz.value = true
    generateQuiz('通用', undefined, 5)
      .then(aiQuestions => {
        if (aiQuestions && aiQuestions.length > 0) {
          questions.value = aiQuestions.map((q, i) => ({
            id: `quiz-ai-${i}`,
            ...q,
            topicId: 'topic-general',
          }))
        }
      })
      .catch(() => { /* 保持 mock 数据 */ })
      .finally(() => { isGeneratingQuiz.value = false })
  }

  showToast?.('已重置测验，加油！', 'info')
}

// 组件挂载时尝试调用真实 API 出题
onMounted(async () => {
  if (isAIReady.value) {
    isGeneratingQuiz.value = true
    try {
      const aiQuestions = await generateQuiz('递归', undefined, 5)
      if (aiQuestions && aiQuestions.length > 0) {
        questions.value = aiQuestions.map((q, i) => ({
          id: `quiz-ai-${i}`,
          ...q,
          topicId: 'topic-3',
        }))
      }
    } catch (err) {
      console.error('AI 出题失败，使用模拟数据：', err)
      // 保持 mock 数据不变
    } finally {
      isGeneratingQuiz.value = false
    }
  }
})
</script>
