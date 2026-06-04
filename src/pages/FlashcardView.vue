<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900">闪卡复习</h1>
        <p class="text-sm text-slate-500 mt-0.5">间隔重复：今天到期 {{ totalCards }} 张</p>
      </div>

      <!-- 闪卡区域 -->
      <div
        class="bg-white rounded-3xl shadow-lg min-h-64 flex flex-col items-center justify-center px-6 py-8 relative"
        :class="{ 'animate-flip': isFlipping }"
        @animationend="isFlipping = false"
      >
        <!-- 卡片标签 -->
        <span class="text-sm font-medium text-[#4F6EF7] mb-4">
          {{ showAnswer ? '答案' : '问题' }}
        </span>

        <!-- 问题 / 答案内容 -->
        <p class="text-xl font-bold text-slate-900 text-center leading-relaxed">
          {{ showAnswer ? currentCard.answer : currentCard.question }}
        </p>

        <!-- 提示文字（仅未翻面时显示） -->
        <p v-if="!showAnswer" class="text-sm text-gray-400 text-center mt-4 leading-relaxed px-2">
          请先在心里讲一遍，再点击翻面查看答案。
        </p>

        <!-- 翻面按钮（仅未翻面时显示） -->
        <button
          v-if="!showAnswer"
          class="mt-8 bg-[#4F6EF7] text-white rounded-full py-3 px-8 text-base font-semibold active:scale-[0.97] transition-transform duration-150 shadow-md shadow-blue-500/20"
          @click="flipCard"
        >
          翻面查看答案
        </button>
      </div>

      <!-- 自评按钮组（翻面后显示） -->
      <div v-if="showAnswer" class="flex items-center justify-center gap-4">
        <button
          class="rounded-full border-2 border-red-400 text-red-500 px-6 py-2 text-sm font-medium active:scale-95 transition-transform"
          @click="rateCard('forget')"
        >
          忘记
        </button>
        <button
          class="rounded-full border-2 border-orange-400 text-orange-500 px-6 py-2 text-sm font-medium active:scale-95 transition-transform"
          @click="rateCard('hard')"
        >
          模糊
        </button>
        <button
          class="rounded-full border-2 border-emerald-400 text-emerald-500 px-6 py-2 text-sm font-medium active:scale-95 transition-transform"
          @click="rateCard('easy')"
        >
          掌握
        </button>
      </div>

      <!-- 卡片计数器 -->
      <p class="text-center text-sm text-slate-400 tabular-nums">
        {{ currentIndex + 1 }} / {{ totalCards }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockCards } from '@/utils/mock'
import { updateSM2, type SM2Params } from '@/composables/useSpacedRepetition'
import type { ReviewCard } from '@/types/card'

const cards = ref<ReviewCard[]>([...mockCards])
const currentIndex = ref(0)
const showAnswer = ref(false)
const isFlipping = ref(false)

const totalCards = computed(() => cards.value.length)
const currentCard = computed(() => cards.value[currentIndex.value] || mockCards[0])

function flipCard() {
  isFlipping.value = true
  setTimeout(() => {
    showAnswer.value = true
  }, 150)
}

function rateCard(quality: 'forget' | 'hard' | 'easy') {
  const qualityMap: Record<string, number> = { forget: 1, hard: 3, easy: 5 }
  const q = qualityMap[quality]

  const params: SM2Params = {
    interval: currentCard.value.interval,
    easeFactor: currentCard.value.easeFactor,
    repetition: currentCard.value.reviewCount,
  }

  const updated = updateSM2(params, q)

  // 更新卡片参数
  const card = cards.value[currentIndex.value]
  if (card) {
    card.interval = updated.interval
    card.easeFactor = updated.easeFactor
    card.reviewCount = updated.repetition
  }

  // 进入下一张
  nextCard()
}

function nextCard() {
  if (currentIndex.value < cards.value.length - 1) {
    currentIndex.value++
    showAnswer.value = false
  } else {
    // 复习完成
    alert('🎉 今日闪卡复习已完成！')
  }
}
</script>

<style scoped>
@keyframes flip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); opacity: 0.5; }
  100% { transform: rotateY(0deg); }
}
.animate-flip {
  animation: flip 0.3s ease-in-out;
}
</style>
