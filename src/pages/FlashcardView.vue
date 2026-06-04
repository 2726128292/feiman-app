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
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7]/20"
            />

            <!-- 答案输入 -->
            <textarea
              v-model="createForm.answer"
              placeholder="输入答案（可以详细写）"
              rows="3"
              class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7]/20 resize-none"
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
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">按主题选择</h3>

          <!-- 全选/取消 -->
          <button
            class="mb-3 text-xs font-medium px-3 py-1.5 rounded-full"
            :class="allSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'"
            @click="toggleAll"
          >
            {{ allSelected ? '取消全选' : '全选所有' }}
          </button>

          <!-- 主题列表（可展开查看单张卡片） -->
          <div class="space-y-2">
            <div
              v-for="group in cardGroups"
              :key="group.topic"
              class="rounded-xl overflow-hidden border transition-colors"
              :class="selectedTopics.has(group.topic) ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'"
            >
              <!-- 主题行：点击选中/取消 + 展开 -->
              <div
                class="flex items-center gap-3 p-3 cursor-pointer"
                @click="toggleTopic(group.topic)"
              >
                <!-- 复选框 -->
                <div
                  class="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors"
                  :class="selectedTopics.has(group.topic) ? 'bg-[#4F6EF7] border-[#4F6EF7]' : 'border-slate-300'"
                  @click.stop="toggleTopic(group.topic)"
                >
                  <Check v-if="selectedTopics.has(group.topic)" :size="12" class="text-white" />
                </div>

                <!-- 主题信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ group.topic }}</p>
                    <span class="text-[10px] text-slate-400">{{ group.cards.length }} 张</span>
                  </div>
                </div>

                <!-- 展开/折叠箭头 -->
                <button
                  class="w-6 h-6 flex items-center justify-center rounded shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
                  @click.stop="toggleExpandTopic(group.topic)"
                >
                  <ChevronDown :size="14" :class="{ 'rotate-180': expandedTopics.has(group.topic) }" class="transition-transform" />
                </button>
              </div>

              <!-- 展开的卡片列表 -->
              <Transition name="card-expand">
                <div v-if="expandedTopics.has(group.topic)" class="px-3 pb-3 space-y-1.5 border-t border-slate-100 dark:border-slate-700 pt-2">
                  <div
                    v-for="card in group.cards"
                    :key="card.id"
                    class="group/card flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white dark:bg-slate-700/60 border border-slate-100 dark:border-slate-600"
                  >
                    <!-- 编辑模式 -->
                    <template v-if="editingCardId === card.id">
                      <div class="flex-1 space-y-1.5 min-w-0">
                        <input
                          :value="editCardForm.question"
                          placeholder="问题"
                          class="w-full px-2 py-1.5 text-xs border border-blue-300 dark:border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                          @input="editCardForm.question = ($event.target as HTMLInputElement).value"
                        />
                        <textarea
                          :value="editCardForm.answer"
                          placeholder="答案"
                          rows="2"
                          class="w-full px-2 py-1.5 text-xs border border-blue-300 dark:border-blue-400 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                          @input="editCardForm.answer = ($event.target as HTMLTextAreaElement).value"
                        />
                        <div class="flex gap-1.5">
                          <button
                            class="px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-500 text-white"
                            @click.stop="saveEditCard(card.id)"
                          >保存</button>
                          <button
                            class="px-2 py-1 rounded-md text-[10px] font-medium bg-slate-200 text-slate-600"
                            @click.stop="cancelEditCard"
                          >取消</button>
                        </div>
                      </div>
                    </template>

                    <!-- 显示模式 -->
                    <template v-else>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{{ card.question }}</p>
                        <p class="text-[10px] text-slate-400 truncate mt-0.5">{{ card.answer?.slice(0, 40) || '(无答案)' }}</p>
                      </div>
                      <!-- 操作按钮 -->
                      <div class="shrink-0 flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 group-hover/card:opacity-100 transition-opacity">
                        <button
                          class="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          title="编辑"
                          @click.stop="startEditCard(card)"
                        >
                          <Pencil :size="12" />
                        </button>
                        <button
                          class="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="删除"
                          @click.stop="confirmDeleteCard(card.id)"
                        >
                          <Trash2 :size="12" />
                        </button>
                      </div>
                    </template>
                  </div>
                </div>
              </Transition>
            </div>
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

    <!-- 删除卡片确认弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCardDeleteConfirm"
          class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          @click="showCardDeleteConfirm = false"
        >
          <div
            class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-5 space-y-4 animate-slide-up"
            @click.stop
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 :size="20" class="text-red-500" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">确认删除</h3>
                <p class="text-xs text-slate-400 mt-0.5">确定要删除这张闪卡吗？此操作不可撤销。</p>
              </div>
            </div>
            <div class="flex gap-3">
              <button
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-colors"
                style="min-height: 44px;"
                @click="showCardDeleteConfirm = false"
              >
                取消
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white active:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                style="min-height: 44px;"
                @click="executeDeleteCard"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, inject, onUnmounted } from 'vue'
import { mockCards } from '@/utils/mock'
import { updateSM2, type SM2Params } from '@/composables/useSpacedRepetition'
import type { ReviewCard } from '@/types/card'
import { Check, Upload, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { usePullRefresh } from '@/composables/usePullRefresh'
import { useUndoRedo } from '@/composables/useUndoRedo'
import { triggerHaptic } from '@/composables/useHaptic'
import { useXPSystem } from '@/composables/useXPSystem'

// 下拉刷新
const refreshContainerRef = ref<HTMLElement>()
const { isPulling, isRefreshing, pullDistance, init } = usePullRefresh({
  onRefresh: () => {
    // 从 localStorage 重新加载卡片数据（兼容两个 key）
    loadCards()
  },
})

// 注入全局 Toast
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast')!

// XP 经验值系统
const xpSystem = useXPSystem()

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

// ====== 卡片编辑/删除 ======
const editingCardId = ref<string | null>(null)
const editCardForm = reactive({
  question: '',
  answer: '',
})
/** 展开查看详情的主题 */
const expandedTopics = ref<Set<string>>(new Set())
// 删除确认
const showCardDeleteConfirm = ref(false)
const deleteTargetCardId = ref<string | null>(null)

/**
 * A2：新建闪卡保存逻辑
 * 1. 校验输入 → 2. 读取现有 cards → 3. 构建 SM-2 完整 card → 4. push 并写入 localStorage → 5. 刷新列表
 */
function saveNewCard(): void {
  if (!createForm.question.trim()) {
    showToast('请输入问题', 'warning')
    return
  }

  // 构建包含完整 SM-2 字段的新卡片对象
  const newCard = {
    id: crypto.randomUUID(),
    question: createForm.question.trim(),
    answer: createForm.answer.trim() || '待补充答案',
    tags: [createForm.topic || '默认'],
    deck: 'default',
    interval: 1,
    easeFactor: 2.5,
    repetition: 0,
    nextReview: new Date(Date.now() + 86400000).toISOString(), // 明天
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    source: 'manual',
    topicId: createForm.topic,
    dueAt: new Date(Date.now() + 86400000).toISOString(),
  }

  // 读取现有卡片（兼容两个 key）
  const raw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards') || '[]'
  const cards = JSON.parse(raw)
  cards.push(newCard)

  // 统一写入 feiman_review_cards
  localStorage.setItem('feiman_review_cards', JSON.stringify(cards))

  // 显示成功提示 + 获得经验值
  showToast(`闪卡「${newCard.question}」已创建`, 'success')
  xpSystem.gainXP('create_card')

  // 重置表单并关闭
  createForm.question = ''
  createForm.answer = ''
  createForm.topic = '前端工程化'
  showCreateForm.value = false
  createSuccessMsg.value = '创建成功！'
  setTimeout(() => { createSuccessMsg.value = '' }, 2000)

  // 刷新列表（重新从 localStorage 加载）
  loadCards()
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

// ==================== 全局撤销/重做（功能2） ====================

const { undo, redo, canUndo, canRedo, execute } = useUndoRedo(allCards.value)

/**
 * 全局键盘快捷键：Ctrl+Z 撤销，Ctrl+Y/Ctrl+Shift+Z 重做
 */
function handleGlobalKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    if (undo()) {
      // 撤销后从 localStorage 重新加载卡片数据（兼容双 key）
      loadCards()
      showToast('已撤销删除操作', 'info')
    }
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  }
}

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

// ====== 卡片编辑/删除操作 ======

/** 切换主题展开状态 */
function toggleExpandTopic(topic: string): void {
  if (expandedTopics.value.has(topic)) {
    expandedTopics.value.delete(topic)
  } else {
    expandedTopics.value.add(topic)
  }
  expandedTopics.value = new Set(expandedTopics.value)
}

/** 开始编辑卡片 */
function startEditCard(card: ReviewCard): void {
  editingCardId.value = card.id
  editCardForm.question = card.question
  editCardForm.answer = card.answer || ''
}

/** 保存编辑的卡片 */
function saveEditCard(cardId: string): void {
  if (!editCardForm.question.trim()) {
    showToast('问题不能为空', 'warning')
    return
  }

  // 在 allCards 中更新
  const card = allCards.value.find(c => c.id === cardId)
  if (card) {
    card.question = editCardForm.question.trim()
    card.answer = editCardForm.answer.trim() || '待补充答案'

    // 同步到 localStorage
    try {
      const raw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards') || '[]'
      const stored = JSON.parse(raw)
      const idx = stored.findIndex((c: any) => c.id === cardId)
      if (idx !== -1) {
        stored[idx] = { ...stored[idx], question: card.question, answer: card.answer }
        localStorage.setItem('feiman_review_cards', JSON.stringify(stored))
      }
    } catch { /* ignore */ }

    showToast('闪卡已更新', 'success')
  }
  cancelEditCard()
}

/** 取消编辑 */
function cancelEditCard(): void {
  editingCardId.value = null
  editCardForm.question = ''
  editCardForm.answer = ''
}

/** 确认删除卡片 */
function confirmDeleteCard(cardId: string): void {
  deleteTargetCardId.value = cardId
  showCardDeleteConfirm.value = true
}

/** 执行删除卡片 */
function executeDeleteCard(): void {
  const cardId = deleteTargetCardId.value
  if (!cardId) return

  // 从 allCards 移除
  const idx = allCards.value.findIndex(c => c.id === cardId)
  if (idx !== -1) {
    const removed = allCards.value.splice(idx, 1)[0]

    // 同步到 localStorage
    try {
      const raw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards') || '[]'
      const stored = JSON.parse(raw)
      const filtered = stored.filter((c: any) => c.id !== cardId)
      localStorage.setItem('feiman_review_cards', JSON.stringify(filtered))

      // 同时从错题本中移除
      const wrongRaw = localStorage.getItem('feiman_wrong_book')
      if (wrongRaw) {
        const wrong = JSON.parse(wrongRaw)
        localStorage.setItem('feiman_wrong_book', JSON.stringify(wrong.filter((e: any) => e.cardId !== cardId)))
      }
    } catch { /* ignore */ }

    showToast(`已删除「${removed.question}」`, 'info')
  }

  showCardDeleteConfirm.value = false
  deleteTargetCardId.value = null
}

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
  triggerHaptic('light') // 翻卡触觉反馈
  isFlipping.value = true
  setTimeout(() => { showAnswer.value = true }, 150)
}

/**
 * A3：复习模式 rateCard 逻辑
 * - "忘记" → quality=1 → 加入错题本 + SM-2 重置
 * - "模糊" → quality=3 → SM-2 正常推进
 * - "掌握" → quality=5 → SM-2 加速推进
 * 评级后自动翻到下一张，最后一张显示完成摘要
 */
function rateCard(quality: 'forget' | 'hard' | 'easy') {
  triggerHaptic('medium') // 评级触觉反馈

  // 评级映射：忘记=1, 模糊=3, 掌握=5
  const qualityMap: Record<string, number> = { forget: 1, hard: 3, easy: 5 }
  const q = qualityMap[quality]

  const card = reviewCards.value[currentIndex.value]
  if (!card) return

  // 构造 SM-2 参数（使用 repetition 字段或 reviewCount 兼容）
  const params: SM2Params = {
    interval: card.interval || 1,
    easeFactor: card.easeFactor || 2.5,
    repetition: card.repetition ?? card.reviewCount ?? 0,
  }

  // 调用 SM-2 算法更新间隔参数
  const updated = updateSM2(params, q)

  // 将更新写回卡片对象
  card.interval = updated.interval
  card.easeFactor = updated.easeFactor
  card.reviewCount = updated.repetition
  card.repetition = updated.repetition
  // 更新下次复习时间
  if (updated.interval > 0) {
    card.nextReview = new Date(Date.now() + updated.interval * 86400000).toISOString()
    card.dueAt = card.nextReview
  }

  // "忘记"时：将卡片加入错题本 + SM-2 重置为初始状态
  if (quality === 'forget') {
    addToWrongBook(card.id, card.topicId || '', card.question)
    // SM-2 重置：interval 归 1，repetition 归 0
    card.interval = 1
    card.repetition = 0
    card.nextReview = new Date(Date.now() + 86400000).toISOString()
    card.dueAt = card.nextReview
  }

  // 持久化评级结果到 localStorage
  try {
    const raw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards') || '[]'
    const allStored = JSON.parse(raw)
    const idx = allStored.findIndex((c: any) => c.id === card.id)
    if (idx !== -1) {
      allStored[idx] = { ...allStored[idx], ...card }
      localStorage.setItem('feiman_review_cards', JSON.stringify(allStored))
    }
  } catch {
    // 持久化失败不影响流程继续
  }

  reviewedCount.value++
  // 复习闪卡获得 XP
  xpSystem.gainXP('flashcard_review')

  // 自动翻到下一张（最后一张完成后显示摘要）
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

/**
 * A4：统一 loadCards 函数
 * 同时读取 feiman_review_cards 和 feiman_cards 两个 key（兼容旧数据）
 * 合并去重后显示，无数据时降级到 mockCards
 */
function loadCards(): void {
  const stored: any[] = []

  // 读取两个可能的 key
  for (const key of ['feiman_review_cards', 'feiman_cards']) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) stored.push(...parsed)
      }
    } catch {
      // 解析失败时跳过该 key
    }
  }

  // 以 id 去重（后面的数据优先）
  const seen = new Set<string>()
  const unique = stored.filter(c => {
    if (!c.id || seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })

  // 有真实数据则使用，否则降级到 mock 数据
  allCards.value = unique.length > 0 ? unique : [...mockCards]
}

// 初始化加载：错题本 + 卡片数据 + 下拉刷新绑定 + 撤销/重做快捷键
onMounted(() => {
  loadWrongBook()
  loadCards() // A4：初始化时统一加载卡片数据（兼容双 key）
  if (refreshContainerRef.value) {
    init(refreshContainerRef.value)
  }
  // 注册撤销/重做全局快捷键
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  // 清理撤销/重做快捷键监听
  window.removeEventListener('keydown', handleGlobalKeydown)
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

/* 卡片展开动画 */
.card-expand-enter-active,
.card-expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.card-expand-enter-from,
.card-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* slide-up 动画 */
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up 0.2s ease-out;
}

/* fade 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
