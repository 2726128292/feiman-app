<template>
  <div ref="refreshContainer" class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 下拉刷新指示器 -->
      <div
        v-if="isPulling || isRefreshing"
        class="flex items-center justify-center py-3 text-xs text-slate-400"
        :style="{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }"
      >
        <svg v-if="isRefreshing" class="animate-spin h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        <span>{{ isRefreshing ? '正在刷新...' : pullDistance >= 80 ? '释放立即刷新' : '下拉刷新' }}</span>
      </div>

      <!-- 模式切换：选择模式 / 复习模式 -->
      <div v-if="mode === 'select'" class="space-y-4">
        <!-- 顶部标题 -->
        <div>
          <h1 class="text-xl font-bold text-slate-900">闪卡复习</h1>
          <p class="text-sm text-slate-500 mt-0.5">自由选择要复习的内容</p>
        </div>

        <!-- 新建闪卡 -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <button
            v-if="!showCreateForm"
            class="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-500 cursor-pointer hover:border-[#4F6EF7] hover:text-[#4F6EF7] transition-colors"
            @click="showCreateForm = true"
          >
            <Plus :size="18" />
            新建闪卡
          </button>

          <!-- 内联创建表单 -->
          <div v-else class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-700">新建闪卡</h3>
              <button class="text-xs text-slate-400 hover:text-slate-600" @click="cancelCreate">取消</button>
            </div>

            <!-- 问题输入 -->
            <input
              v-model="createForm.question"
              type="text"
              placeholder="输入问题（如：什么是闭包？）"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7]/20"
            />

            <!-- 答案输入 -->
            <textarea
              v-model="createForm.answer"
              placeholder="输入答案（可以详细写）"
              rows="3"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm placeholder:text-slate-300 focus:outline-none focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7]/20 resize-none"
            />

            <!-- 主题选择 -->
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="topic in createTopics"
                :key="topic"
                class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                :class="createForm.topic === topic ? 'bg-[#4F6EF7] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                @click="createForm.topic = topic"
              >
                {{ topic }}
              </button>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-1">
              <button
                class="flex-1 py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
                :disabled="!createForm.question.trim()"
                @click="saveNewCard"
              >
                保存
              </button>
              <button
                class="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-medium active:scale-[0.98] transition-transform"
                @click="cancelCreate"
              >
                取消
              </button>
            </div>

            <p v-if="createSuccessMsg" class="text-xs text-emerald-600 text-center">{{ createSuccessMsg }}</p>
          </div>
        </div>

        <!-- 上传自定义卡片 -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-slate-700">导入自定义卡片</h3>
            <span class="text-[11px] text-slate-400">支持 TXT / JSON</span>
          </div>
          <label
            class="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 cursor-pointer hover:border-[#4F6EF7] hover:text-[#4F6EF7] transition-colors"
          >
            <Upload :size="18" />
            点击上传或拖拽文件
            <input type="file" accept=".txt,.json" class="hidden" @change="handleFileUpload" />
          </label>
          <p v-if="uploadStatus" class="mt-2 text-xs" :class="uploadSuccess ? 'text-emerald-600' : 'text-red-500'">{{ uploadStatus }}</p>
        </div>

        <!-- 错题本 -->
        <div v-if="wrongBookEntries.length > 0" class="bg-white rounded-2xl shadow-sm p-4 border border-red-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-base">🔴</span>
              <h3 class="text-sm font-semibold text-slate-700">错题本</h3>
              <span class="text-xs text-red-500 font-medium">({{ wrongBookEntries.length }} 张)</span>
            </div>
            <button
              class="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-colors"
              @click="startWrongBookReview"
            >
              复习
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="entry in wrongBookEntries.slice(0, 5)"
              :key="entry.cardId"
              class="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50/50"
            >
              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium text-slate-700 truncate">{{ entry.question }}</p>
                <p class="text-[10px] text-red-400 mt-0.5">忘了 {{ entry.forgetCount }} 次</p>
              </div>
            </div>
            <p v-if="wrongBookEntries.length > 5" class="text-[10px] text-slate-400 text-center pt-1">
              还有 {{ wrongBookEntries.length - 5 }} 张...
            </p>
          </div>
        </div>

        <!-- 按主题分组选择 -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">按主题选择</h3>

          <!-- 全选/取消 -->
          <button
            class="mb-3 text-xs font-medium px-3 py-1.5 rounded-full"
            :class="allSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'"
            @click="toggleAll"
          >
            {{ allSelected ? '取消全选' : '全选所有' }}
          </button>

          <!-- 主题列表 -->
          <div class="space-y-2">
            <label
              v-for="group in cardGroups"
              :key="group.topic"
              class="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors"
              :class="selectedTopics.has(group.topic) ? 'bg-blue-50' : 'hover:bg-slate-50'"
              @click="toggleTopic(group.topic)"
            >
              <!-- 复选框 -->
              <div
                class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors"
                :class="selectedTopics.has(group.topic) ? 'bg-[#4F6EF7] border-[#4F6EF7]' : 'border-slate-300'"
              >
                <Check v-if="selectedTopics.has(group.topic)" :size="12" class="text-white" />
              </div>

              <!-- 主题信息 -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800">{{ group.topic }}</p>
                <p class="text-xs text-slate-400 mt-0.5">{{ group.cards.length }} 张卡片</p>
              </div>

              <!-- 预览标签 -->
              <div class="flex flex-wrap gap-1 max-w-[120px]">
                <span
                  v-for="(card, i) in group.cards.slice(0, 2)"
                  :key="i"
                  class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 truncate max-w-[55px]"
                >{{ card.question }}</span>
                <span v-if="group.cards.length > 2" class="text-[10px] text-slate-300">+{{ group.cards.length - 2 }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 已选统计 + 开始按钮 -->
        <div class="sticky bottom-20 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm text-slate-600">已选择</span>
            <span class="text-sm font-bold text-[#4F6EF7]">{{ selectedCount }} 张卡片</span>
          </div>
          <button
            class="w-full py-3 rounded-full text-base font-semibold active:scale-[0.98] transition-transform"
            :class="selectedCount > 0 ? 'bg-[#4F6EF7] text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
            :disabled="selectedCount === 0"
            @click="startReview"
          >
            开始复习 ({{ selectedCount }} 张)
          </button>
        </div>
      </div>

      <!-- ====== 复习模式 ====== -->
      <div v-else class="space-y-5">
        <!-- 顶部：返回选择 + 进度 -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-slate-900">闪卡复习</h1>
            <p class="text-sm text-slate-500 mt-0.5">{{ currentIndex + 1 }} / {{ reviewCards.length }}</p>
          </div>
          <button
            class="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 active:bg-slate-200"
            @click="backToSelect"
          >
            返回选择
          </button>
        </div>

        <!-- 整体进度条 -->
        <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-[#4F6EF7] to-emerald-400 rounded-full transition-all duration-300"
            :style="{ width: progressPercent + '%' }"
          />
        </div>

        <!-- 闪卡区域 -->
        <div
          class="bg-white rounded-3xl shadow-lg min-h-64 flex flex-col items-center justify-center px-6 py-8 relative"
          :class="{ 'animate-flip': isFlipping }"
          @animationend="isFlipping = false"
        >
          <span class="text-sm font-medium text-[#4F6EF7] mb-4">
            {{ showAnswer ? '答案' : '问题' }}
          </span>

          <p class="text-xl font-bold text-slate-900 text-center leading-relaxed">
            {{ showAnswer ? currentCard.answer : currentCard.question }}
          </p>

          <p v-if="!showAnswer" class="text-sm text-gray-400 text-center mt-4 leading-relaxed px-2">
            请先在心里讲一遍，再点击翻面查看答案。
          </p>

          <button
            v-if="!showAnswer"
            class="mt-8 bg-[#4F6EF7] text-white rounded-full py-3 px-8 text-base font-semibold active:scale-[0.97] transition-transform duration-150 shadow-md shadow-blue-500/20"
            @click="flipCard"
          >
            翻面查看答案
          </button>
        </div>

        <!-- 自评按钮组 -->
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

        <!-- 操作栏 -->
        <div class="flex items-center justify-between text-sm text-slate-400">
          <button class="flex items-center gap-1 hover:text-slate-600" @click="prevCard" :disabled="currentIndex === 0">
            <ChevronLeft :size="16" /> 上一张
          </button>
          <span>{{ reviewedCount }}/{{ reviewCards.length }} 已评</span>
          <button class="flex items-center gap-1 hover:text-slate-600" @click="skipCard">
            跳过 <ChevronRight :size="16" />
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, inject } from 'vue'
import { mockCards } from '@/utils/mock'
import { updateSM2, type SM2Params } from '@/composables/useSpacedRepetition'
import type { ReviewCard } from '@/types/card'
import { Check, Upload, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { usePullRefresh } from '@/composables/usePullRefresh'

// 下拉刷新
const refreshContainerRef = ref<HTMLElement>()
const { isPulling, isRefreshing, pullDistance, init } = usePullRefresh({
  onRefresh: () => {
    // 从 localStorage 重新加载卡片数据
    loadCardsFromStorage()
  },
})

// 注入全局 Toast
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast')!

// ====== 模式状态 ======
type Mode = 'select' | 'review'
const mode = ref<Mode>('select')

// ====== 新建卡片表单 ======
const showCreateForm = ref(false)
const createSuccessMsg = ref('')
const createTopics = ['前端工程化', '计算机网络', '高等数学', '数据结构', '自定义']
const createForm = reactive({
  question: '',
  answer: '',
  topic: '前端工程化',
})

function saveNewCard() {
  if (!createForm.question.trim()) return

  const newCard: ReviewCard = {
    id: crypto.randomUUID(),
    topicId: createForm.topic,
    question: createForm.question.trim(),
    answer: createForm.answer.trim() || '(待补充)',
    dueAt: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    reviewCount: 0,
  }

  allCards.value.push(newCard)
  // 自动选中新卡片所属主题
  selectedTopics.add(createForm.topic)

  // 显示成功提示
  createSuccessMsg.value = '✅ 卡片创建成功！'
  setTimeout(() => { createSuccessMsg.value = '' }, 2000)

  // 重置表单并关闭
  cancelCreate()
}

function cancelCreate() {
  showCreateForm.value = false
  createForm.question = ''
  createForm.answer = ''
  createForm.topic = '前端工程化'
}

// ====== 错题本 ======
interface WrongBookEntry {
  cardId: string
  topicId: string
  question: string
  forgetCount: number
  lastForgottenAt: string
}

const WRONG_BOOK_KEY = 'feiman_wrong_book'
const wrongBookEntries = ref<WrongBookEntry[]>([])

function loadWrongBook() {
  try {
    const raw = localStorage.getItem(WRONG_BOOK_KEY)
    if (raw) {
      wrongBookEntries.value = JSON.parse(raw) as WrongBookEntry[]
    }
  } catch {
    wrongBookEntries.value = []
  }
}

function saveWrongBook() {
  try {
    localStorage.setItem(WRONG_BOOK_KEY, JSON.stringify(wrongBookEntries.value))
  } catch {
    // ignore write errors
  }
}

function addToWrongBook(cardId: string, topicId: string, question: string) {
  const existing = wrongBookEntries.value.find(e => e.cardId === cardId)
  if (existing) {
    existing.forgetCount++
    existing.lastForgottenAt = new Date().toISOString()
  } else {
    wrongBookEntries.value.push({
      cardId,
      topicId,
      question,
      forgetCount: 1,
      lastForgottenAt: new Date().toISOString(),
    })
  }
  saveWrongBook()
}

function startWrongBookReview() {
  // 收集错题本中的卡片（从 allCards 中查找）
  const wrongCardIds = new Set(wrongBookEntries.value.map(e => e.cardId))
  const wrongCards = allCards.value.filter(c => wrongCardIds.has(c.id))

  // 重置错题卡片的间隔为 1（明天再复习）
  for (const card of wrongCards) {
    card.interval = 1
    card.dueAt = new Date().toISOString()
  }

  reviewCards.value = wrongCards
  currentIndex.value = 0
  showAnswer.value = false
  reviewedCount.value = 0
  mode.value = 'review'
}

// ====== 选择模式数据 ======

/** 按主题分组的卡片 */
interface CardGroup {
  topic: string
  cards: ReviewCard[]
}

// 所有卡片（mock + 用户上传的）
const allCards = ref<ReviewCard[]>([...mockCards])

// 按主题分组
const cardGroups = computed<CardGroup[]>(() => {
  const map = new Map<string, ReviewCard[]>()
  for (const card of allCards.value) {
    const topic = card.topicId || '未分类'
    if (!map.has(topic)) map.set(topic, [])
    map.get(topic)!.push(card)
  }
  return Array.from(map.entries()).map(([topic, cards]) => ({ topic, cards }))
})

// 已选择的主题
const selectedTopics = reactive(new Set<string>())

function toggleTopic(topic: string) {
  if (selectedTopics.has(topic)) {
    selectedTopics.delete(topic)
  } else {
    selectedTopics.add(topic)
  }
}

function toggleAll() {
  if (allSelected.value) {
    selectedTopics.clear()
  } else {
    for (const g of cardGroups.value) {
      selectedTopics.add(g.topic)
    }
  }
}

const allSelected = computed(() => selectedTopics.size === cardGroups.value.length)

const selectedCount = computed(() => {
  let count = 0
  for (const topic of selectedTopics) {
    const group = cardGroups.value.find(g => g.topic === topic)
    if (group) count += group.cards.length
  }
  return count
})

// ====== 文件上传 ======
const uploadStatus = ref('')
const uploadSuccess = ref(false)

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const content = reader.result as string
      let imported: ReviewCard[] = []

      if (file.name.endsWith('.json')) {
        const data = JSON.parse(content)
        imported = Array.isArray(data) ? data : data.cards || []
      } else {
        // TXT 格式：每行 "问题 ||| 答案" 或 "Q: ... A: ..."
        const lines = content.split('\n').filter(l => l.trim())
        for (const line of lines) {
          let q = '', a = ''
          if (line.includes('|||')) {
            [q, a] = line.split('|||').map(s => s.trim())
          } else if (line.toLowerCase().includes('a:')) {
            const idx = line.toLowerCase().indexOf('a:')
            q = line.substring(0, idx).replace(/^[qQ][:：]\s*/, '').trim()
            a = line.substring(idx + 2).trim()
          } else {
            // 单行作为问题，答案留空
            q = line.trim()
          }
          if (q) {
            imported.push({
              id: crypto.randomUUID(),
              topicId: `自定义-${file.name}`,
              question: q,
              answer: a || '(待补充)',
              dueAt: new Date().toISOString(),
              interval: 1,
              easeFactor: 2.5,
              reviewCount: 0,
            })
          }
        }
      }

      if (imported.length > 0) {
        allCards.value.push(...imported)
        uploadStatus.value = `成功导入 ${imported.length} 张卡片`
        uploadSuccess.value = true
        // 自动选中新导入的主题
        const newTopic = imported[0]?.topicId || ''
        if (newTopic) selectedTopics.add(newTopic)
      } else {
        uploadStatus.value = '文件格式不正确，请检查内容'
        uploadSuccess.value = false
      }
    } catch {
      uploadStatus.value = '文件解析失败，请检查格式'
      uploadSuccess.value = false
    }
  }
  reader.readAsText(file)
  // 重置 input 以便重复选择同一文件
  ;(e.target as HTMLInputElement).value = ''
}

// ====== 进入复习 ======
const reviewCards = ref<ReviewCard[]>([])
const currentIndex = ref(0)
const showAnswer = ref(false)
const isFlipping = ref(false)
const reviewedCount = ref(0)

function startReview() {
  if (selectedCount.value === 0) return

  // 收集已选主题的所有卡片
  const collected: ReviewCard[] = []
  for (const topic of selectedTopics) {
    const group = cardGroups.value.find(g => g.topic === topic)
    if (group) collected.push(...group.cards)
  }

  reviewCards.value = collected
  currentIndex.value = 0
  showAnswer.value = false
  reviewedCount.value = 0
  mode.value = 'review'
}

function backToSelect() {
  mode.value = 'select'
  showAnswer.value = false
}

// ====== 复习操作 ======
const currentCard = computed(() => reviewCards.value[currentIndex.value])
const progressPercent = computed(() =>
  reviewCards.value.length > 0 ? Math.round(((reviewedCount.value) / reviewCards.value.length) * 100) : 0
)

function flipCard() {
  isFlipping.value = true
  setTimeout(() => { showAnswer.value = true }, 150)
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
  const card = reviewCards.value[currentIndex.value]
  if (card) {
    card.interval = updated.interval
    card.easeFactor = updated.easeFactor
    card.reviewCount = updated.repetition

    // 忘记时自动加入错题本
    if (quality === 'forget') {
      addToWrongBook(card.id, card.topicId || '', card.question)
    }
  }

  reviewedCount.value++
  nextCard()
}

function nextCard() {
  showAnswer.value = false
  if (currentIndex.value < reviewCards.value.length - 1) {
    currentIndex.value++
  } else {
    showToast(`复习完成！共 ${reviewedCount} 张卡片`, 'success')
    backToSelect()
  }
}

function prevCard() {
  if (currentIndex.value > 0) {
    showAnswer.value = false
    currentIndex.value--
  }
}

function skipCard() {
  showAnswer.value = false
  if (currentIndex.value < reviewCards.value.length - 1) {
    currentIndex.value++
  }
}

// 从 localStorage 重新加载卡片数据（用于下拉刷新）
function loadCardsFromStorage() {
  try {
    const cardsRaw = localStorage.getItem('feiman_cards')
    if (cardsRaw) {
      const stored = JSON.parse(cardsRaw)
      if (Array.isArray(stored) && stored.length > 0) {
        // 合并去重：以存储的数据为准，保留 mock 中不存在的
        const storedIds = new Set(stored.map((c: any) => c.id))
        // 保留不在存储中的 mock 卡片
        const remainingMock = mockCards.filter((c: ReviewCard) => !storedIds.has(c.id))
        allCards.value = [...stored, ...remainingMock]
      }
    }
  } catch {
    // 解析失败时保持当前数据
  }
}

// 初始化加载错题本 + 下拉刷新绑定
onMounted(() => {
  loadWrongBook()
  if (refreshContainerRef.value) {
    init(refreshContainerRef.value)
  }
})
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
