<template>
  <Teleport to="body">
    <Transition name="fab-up">
      <!-- FAB 按钮 -->
      <button
        v-if="!expanded"
        class="fixed right-4 bottom-24 z-50 w-12 h-12 rounded-full bg-[#4F6EF7] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        @click="expanded = true"
        title="快速创建闪卡"
      >
        <Plus :size="24" />
      </button>

      <!-- 展开面板 -->
      <div
        v-else
        class="fixed right-4 bottom-20 z-50 w-72 bg-white rounded-2xl shadow-2xl p-4 space-y-3"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800">快速创建闪卡</h3>
          <button class="text-slate-400 hover:text-slate-600" @click="expanded = false">
            <X :size="18" />
          </button>
        </div>

        <input
          v-model="question"
          placeholder="问题 / 概念名称"
          class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
        />
        <textarea
          v-model="answer"
          placeholder="答案 / 解释"
          rows="3"
          class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
        />
        <input
          v-model="tagsInput"
          placeholder="标签（逗号分隔）"
          class="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
        />

        <button
          class="w-full py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold active:bg-blue-600 disabled:opacity-50"
          :disabled="!question.trim()"
          @click="createCard"
        >
          创建闪卡
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Plus, X } from 'lucide-vue-next'

const expanded = ref(false)
const question = ref('')
const answer = ref('')
const tagsInput = ref('')

const showToast = inject<(msg: string, type?: string) => void>('toast') || console.log

/** 创建闪卡并保存到 localStorage */
function createCard() {
  if (!question.value.trim()) return

  // 兼容两种存储 key：优先 feiman_review_cards
  const cardsRaw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards')
  const cards = cardsRaw ? JSON.parse(cardsRaw) : []

  cards.push({
    id: crypto.randomUUID(),
    question: question.value.trim(),
    answer: answer.value.trim() || '请补充答案',
    tags: tagsInput.value.split(/[,，]/).map(t => t.trim()).filter(Boolean),
    deck: 'default',
    interval: 1,
    easeFactor: 2.5,
    repetition: 0,
    nextReview: new Date(Date.now() + 86400000).toISOString(),
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    source: 'quick_create',
  })

  localStorage.setItem('feiman_review_cards', JSON.stringify(cards))
  showToast(`闪卡「${question.value.trim()}」已创建`, 'success')

  // 重置表单
  question.value = ''
  answer.value = ''
  tagsInput.value = ''
  expanded.value = false
}
</script>

<style scoped>
.fab-up-enter-active { transition: all 0.25s ease; }
.fab-up-leave-active { transition: all 0.15s ease; }
.fab-up-enter-from { opacity: 0; transform: translateY(20px) scale(0.9); }
.fab-up-leave-to { opacity: 0; transform: scale(0.9); }
</style>
