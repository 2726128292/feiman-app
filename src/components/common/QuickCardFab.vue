<template>
  <Teleport to="body">
    <!-- 可拖动悬浮球（收起状态） -->
    <Transition name="fab-fade">
      <div
        v-if="!expanded"
        ref="fabRef"
        class="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#4F6EF7] to-[#6B8CF7] text-white shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-none"
        :style="{ left: posX + 'px', top: posY + 'px' }"
        @mousedown.prevent="onDragStart"
        @touchstart.prevent="onDragStart"
        @click.stop="onFabClick"
      >
        <!-- 外圈脉冲动画 -->
        <div class="absolute inset-0 rounded-full bg-white/20 animate-ping-slow" />
        <!-- 内圈内容 -->
        <div class="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Plus :size="24" class="drop-shadow-md" />
        </div>
      </div>
    </Transition>

    <!-- 展开面板 -->
    <Transition name="fab-panel">
      <div
        v-if="expanded"
        class="fixed z-50 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 space-y-3"
        :style="{ left: panelX + 'px', top: panelY + 'px' }"
      >
        <!-- 面板头部 -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">快速创建闪卡</h3>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            @click="expanded = false"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- 表单 -->
        <input
          ref="questionInputRef"
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
          class="w-full py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold active:bg-blue-600 disabled:opacity-50 transition-colors"
          style="min-height: 44px;"
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
import { ref, inject, nextTick, onMounted } from 'vue'
import { Plus, X } from 'lucide-vue-next'

const expanded = ref(false)
const question = ref('')
const answer = ref('')
const tagsInput = ref('')
const questionInputRef = ref<HTMLInputElement>()

const showToast = inject<(msg: string, type?: string) => void>('toast') || console.log

// ==================== 拖动逻辑 ====================

const fabRef = ref<HTMLElement>()
const panelX = ref(0)
const panelY = ref(0)

/** 悬浮球位置（相对于视口） */
const posX = ref(0)
const posY = ref(0)

/** 是否正在拖动中 */
let isDragging = false

/** 拖动起始位置 */
let dragStartX = 0
let dragStartY = 0
let dragOffsetX = 0
let dragOffsetY = 0

/** 初始化悬浮球位置（右下角，避开底部导航） */
function initPosition(): void {
  const vw = window.innerWidth
  const vh = window.innerHeight
  // 默认在右侧底部，距离边缘 20px，避开底部导航栏（约 80px）
  posX.value = vw - 20 - 56 // 56 = w-14 (3.5rem)
  posY.value = vh - 100     // 底部导航栏上方
}

/** 拖动开始 */
function onDragStart(e: MouseEvent | TouchEvent): void {
  isDragging = true

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  dragStartX = clientX
  dragStartY = clientY
  dragOffsetX = clientX - posX.value
  dragOffsetY = clientY - posY.value

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('touchend', onDragEnd)
}

/** 拖动移动 */
function onDragMove(e: MouseEvent | TouchEvent): void {
  if (!isDragging) return
  e.preventDefault()

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

  const fabSize = 56 // w-14 = 56px
  const padding = 8   // 边缘最小间距
  const vw = window.innerWidth
  const vh = window.innerHeight

  let newX = clientX - dragOffsetX
  let newY = clientY - dragOffsetY

  // 限制在屏幕范围内
  newX = Math.max(padding, Math.min(vw - fabSize - padding, newX))
  newY = Math.max(padding, Math.min(vh - fabSize - padding, newY))

  posX.value = newX
  posY.value = newY
}

/** 拖动结束：吸附到最近的左右边缘 */
function onDragEnd(e: MouseEvent | TouchEvent): void {
  isDragging = false

  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('touchend', onDragEnd)

  const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
  const moveDistance = Math.abs(clientX - dragStartX)

  // 如果拖动距离小于 10px，视为点击（不吸附）
  if (moveDistance < 10) return

  // 吸附到左或右边缘（取较近的一侧）
  const vw = window.innerWidth
  const midX = vw / 2
  const edgeGap = 12

  if (posX.value + 28 > midX) {
    // 靠近右侧 → 吸附到右边
    posX.value = vw - 56 - edgeGap
  } else {
    // 靠近左侧 → 吸附到左边
    posX.value = edgeGap
  }
}

/** 点击悬浮球：区分点击和拖动 */
function onFabClick(): void {
  // isDragging 会在 onDragEnd 中判断，如果距离小则不算拖动
  // 这里通过检测最近一次拖动的距离来决定是否触发点击
  const clientX = dragStartX
  const currentX = posX.value
  if (Math.abs(currentX + 28 - clientX) < 15 && !isDragging) {
    expanded.value = true
    // 展开时将面板定位到悬浮球附近（优先向上展开）
    positionPanel()
    nextTick(() => {
      questionInputRef.value?.focus()
    })
  }
}

/** 定位展开面板（确保不超出屏幕边界） */
function positionPanel(): void {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const panelW = 288 // w-72 = 288px
  const panelH = 320 // 大约高度

  let x = posX.value - panelW + 56 // 默认向左展开
  let y = posY.value - panelH       // 向上展开

  // 超出左边界 → 向右展开
  if (x < 8) x = posX.value + 56 + 4
  // 超出右边界 → 对齐右边
  if (x + panelW > vw - 8) x = vw - panelW - 8
  // 超出顶部 → 向下展开
  if (y < 60) y = posY.value + 64
  // 超出底部 → 上移
  if (y + panelH > vh - 8) y = vh - panelH - 8

  panelX.value = Math.max(8, x)
  panelY.value = Math.max(60, y)
}

// 初始化位置
onMounted(() => {
  initPosition()
})

// ==================== 创建闪卡 ====================

function createCard(): void {
  if (!question.value.trim()) return

  const cardsRaw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards')
  const cards = cardsRaw ? JSON.parse(cardsRaw) : []

  cards.push({
    id: crypto.randomUUID(),
    question: question.value.trim(),
    answer: answer.value.trim() || '请补充答案',
    tags: tagsInput.value.split(/[,，]/).map((t: string) => t.trim()).filter(Boolean),
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

  // 重置表单并收起
  question.value = ''
  answer.value = ''
  tagsInput.value = ''
  expanded.value = false
}
</script>

<style scoped>
/* 悬浮球淡入淡出 */
.fab-fade-enter-active { transition: opacity 0.2s ease; }
.fab-fade-leave-active { transition: opacity 0.15s ease; }
.fab-fade-enter-from, .fab-fade-leave-to { opacity: 0; }

/* 面板弹入动画 */
.fab-panel-enter-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.fab-panel-leave-active { transition: all 0.15s ease; }
.fab-panel-enter-from { opacity: 0; transform: scale(0.9) translateY(10px); }
.fab-panel-leave-to { opacity: 0; transform: scale(0.95); }

/* 缓慢脉冲动画（外圈光晕） */
@keyframes ping-slow {
  0% { transform: scale(1); opacity: 0.2; }
  70%, 100% { transform: scale(1.8); opacity: 0; }
}
.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
