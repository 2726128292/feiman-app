<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <!-- 有数据时 -->
    <div v-if="topic" class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部导航栏 -->
      <div class="flex items-center gap-3">
        <button
          class="flex items-center justify-center w-9 h-9 -ml-2 rounded-xl bg-white shadow-sm text-slate-600 active:bg-slate-50 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-slate-900 truncate">{{ topic.title }}</h1>
          <p class="text-xs text-slate-400 mt-0.5">{{ chapters.length }} 个章节 · {{ totalItems }} 个知识点</p>
        </div>
        <!-- 编辑模式切换 -->
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="isEditMode ? 'bg-[#4F6EF7] text-white' : 'bg-white shadow-sm text-slate-600'"
          @click="toggleEditMode"
        >
          {{ isEditMode ? '完成' : '编辑' }}
        </button>
        <!-- 分享路径按钮 -->
        <button
          class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200 transition-colors flex items-center gap-1"
          @click="sharePathLink"
        >
          <Share2 :size="14" /> 分享
        </button>
      </div>

      <!-- 总进度概览 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-slate-700">整体进度</span>
          <span class="text-sm font-bold" :class="overallProgress >= 100 ? 'text-emerald-500' : 'text-[#4F6EF7]'">{{ overallProgress }}%</span>
        </div>
        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :class="overallProgress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-[#4F6EF7] to-[#6B8CF7]'"
            :style="{ width: overallProgress + '%' }"
          />
        </div>
        <div class="flex justify-between mt-2">
          <span class="text-[11px] text-slate-400">已完成 {{ doneItemsCount }}/{{ totalItems }} 个知识点</span>
          <span v-if="overallProgress >= 100" class="text-[11px] text-emerald-500 font-medium">恭喜完成全部学习！</span>
        </div>
      </div>

      <!-- 章节列表 -->
      <div class="space-y-3">
        <div
          v-for="(chapter, chIdx) in chapters"
          :key="chapter.id"
          class="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <!-- 章节头部 -->
          <div class="p-4">
            <div class="flex items-start gap-3">
              <!-- 展开/折叠 + 完成状态 -->
              <button
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition-all active:scale-90"
                :class="
                  chapter.completed
                    ? 'bg-emerald-500 border-emerald-500'
                    : chapterHasProgress(chapter) ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
                "
                @click="toggleChapterComplete(chapter.id)"
              >
                <Check v-if="chapter.completed" :size="14" class="text-white" />
              </button>

              <!-- 章节标题（可编辑） -->
              <div class="flex-1 min-w-0">
                <div v-if="editingChapterId === chapter.id" class="flex items-center gap-1.5">
                  <input
                    ref="chapterInputRef"
                    v-model="editChapterTitle"
                    class="flex-1 px-2 py-1 text-sm font-semibold border border-blue-300 dark:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    @keydown.enter="saveChapterTitle(chapter.id)"
                    @keydown.escape="cancelChapterEdit"
                    @blur="saveChapterTitle(chapter.id)"
                  />
                </div>
                <h3
                  v-else
                  class="text-sm font-semibold leading-snug cursor-pointer hover:text-blue-600 transition-colors"
                  :class="chapter.completed ? 'text-slate-400 line-through' : 'text-slate-800'"
                  @click="startEditChapter(chapter)"
                >
                  {{ chapter.title }}
                </h3>

                <!-- 章节级进度 -->
                <p class="text-[11px] text-slate-400 mt-1">
                  {{ getChapterDoneCount(chapter) }}/{{ getChapterItemCount(chapter) }} 完成
                  <template v-if="getChapterItemCount(chapter) > 0">
                    · {{ getChapterProgress(chapter) }}%
                  </template>
                </p>

                <!-- 知识点展开区域 -->
                <div v-if="expandedChapters.has(chapter.id)" class="mt-3 space-y-1.5">
                  <!-- 知识点列表 -->
                  <div
                    v-for="item in (chapter.items || [])"
                    :key="item.id"
                    class="group flex items-center gap-2 py-1.5 px-2.5 rounded-xl transition-colors"
                    :class="item.done ? 'bg-emerald-50/50' : 'hover:bg-slate-50'"
                  >
                    <!-- 知识点勾选 -->
                    <button
                      class="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all active:scale-90"
                      :class="item.done ? 'border-emerald-400 bg-emerald-500' : 'border-slate-300'"
                      @click="toggleItem(chapter.id, item.id)"
                    >
                      <Check v-if="item.done" :size="12" class="text-white" />
                    </button>

                    <!-- 知识点标题（可编辑） -->
                    <input
                      v-if="editingItemId === item.id"
                      ref="itemInputRef"
                      v-model="editItemTitle"
                      class="flex-1 px-2 py-0.5 text-sm border border-blue-300 dark:border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                      @keydown.enter="saveItemTitle(chapter.id, item.id)"
                      @keydown.escape="cancelItemEdit"
                      @blur="saveItemTitle(chapter.id, item.id)"
                    />
                    <span
                      v-else
                      class="flex-1 text-sm leading-relaxed cursor-pointer"
                      :class="item.done ? 'text-slate-400 line-through' : 'text-slate-700'"
                      @click="startEditItem(item)"
                    >{{ item.title }}</span>

                    <!-- 删除知识点按钮（编辑模式下显示） -->
                    <button
                      v-if="isEditMode"
                      class="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-500 transition-all shrink-0"
                      @click="deleteItem(chapter.id, item.id)"
                    >
                      <X :size="13" />
                    </button>

                    <!-- 生成闪卡按钮（编辑模式下显示） -->
                    <button
                      v-if="isEditMode"
                      class="text-xs text-purple-500 hover:text-purple-600 font-medium flex items-center gap-0.5 shrink-0"
                      @click="generateFlashcard(chapter.id, item)"
                    >
                      <Layers :size="11" /> 闪卡
                    </button>
                  </div>

                  <!-- 添加知识点输入框 -->
                  <div v-if="addingItemId === chapter.id" class="flex items-center gap-2 py-1 pl-8">
                    <input
                      ref="newItemInputRef"
                      v-model="newItemTitle"
                      placeholder="输入知识点名称..."
                      class="flex-1 px-2 py-1.5 text-sm border border-dashed border-blue-300 dark:border-blue-400 rounded-lg focus:outline-none focus:border-solid focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      @keydown.enter="addNewItem(chapter.id)"
                      @keydown.escape="addingItemId = null"
                      @blur="addItemOnBlur(chapter.id)"
                    />
                  </div>

                  <!-- 添加知识点按钮 -->
                  <button
                    v-if="!addingItemId && isEditMode"
                    class="w-full py-1.5 text-left pl-8 text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                    @click="showAddItemInput(chapter.id)"
                  >
                    <Plus :size="13" /> 添加知识点
                  </button>
                </div>

                <!-- 展开知识点的提示（未展开且有内容时） -->
                <button
                  v-if="!expandedChapters.has(chapter.id) && (chapter.items || []).length > 0"
                  class="mt-1.5 text-[11px] text-blue-500 hover:text-blue-600 font-medium"
                  @click="expandedChapters.add(chapter.id); expandedChapters = new Set(expandedChapters)"
                >
                  展开 {{ (chapter.items || []).length }} 个知识点 ▾
                </button>
              </div>

              <!-- 操作按钮组（编辑模式） -->
              <div v-if="isEditMode" class="flex flex-col gap-1 shrink-0 ml-1">
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  title="添加知识点"
                  @click="showAddItemInput(chapter.id); if (!expandedChapters.has(chapter.id)) { expandedChapters.add(chapter.id); expandedChapters = new Set(expandedChapters) }"
                >
                  <Plus :size="14" />
                </button>
                <button
                  class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="删除章节"
                  @click="deleteChapter(chapter.id)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- 章节底部操作区 -->
          <div v-if="!chapter.completed && !isEditMode" class="px-4 pb-4 pt-0">
            <button
              class="mt-1 px-4 py-1.5 rounded-full bg-[#4F6EF7]/10 text-[#4F6EF7] text-xs font-semibold active:bg-[#4F6EF7]/20 transition-colors"
              @click="startLearning(chapter.id)"
            >
              开始学习此章节 →
            </button>
          </div>

          <!-- ====== 功能18：笔记入口 ====== -->
          <div class="px-4 pb-3 pt-0">
            <div class="mt-2 pt-2 border-t border-dashed border-slate-200">
              <button
                class="w-full flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-500 py-1.5"
                @click="toggleNoteEditor(chapter.id)"
              >
                <StickyNote :size="13" />
                {{ getChapterNote(chapter.id) ? '编辑笔记' : '添加笔记' }}
              </button>
              <textarea
                v-if="showNoteEditor === chapter.id"
                v-model="noteContents[chapter.id]"
                placeholder="记录这个章节的学习心得、灵感..."
                class="w-full mt-2 px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                rows="3"
                @blur="saveChapterNote(chapter.id)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏（编辑模式） -->
      <div v-if="isEditMode" class="space-y-3 pb-4">
        <!-- 添加新章节 -->
        <button
          class="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 text-sm font-medium text-[#4F6EF7] hover:bg-blue-50 active:bg-blue-100 transition-colors"
          @click="addNewChapter"
        >
          <Plus :size="18" /> 添加新章节
        </button>

        <!-- 批量操作 -->
        <div class="flex gap-2">
          <button
            class="flex-1 bg-white rounded-xl shadow-sm py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            @click="expandAll"
          >
            <ChevronDown :size="14" /> 全部展开
          </button>
          <button
            class="flex-1 bg-white rounded-xl shadow-sm py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            @click="collapseAll"
          >
            <ChevronUp :size="14" /> 全部收起
          </button>
        </div>
      </div>
    </div>

    <!-- 路径不存在空状态 -->
    <div v-else class="max-w-md mx-auto px-5 pt-20 text-center">
      <FolderOpen :size="56" class="mx-auto text-slate-200 mb-4" />
      <h2 class="text-lg font-semibold text-slate-700">路径不存在</h2>
      <p class="text-sm text-slate-400 mt-2">未找到 ID 为「{{ routeParamId }}」的学习路径</p>
      <button
        class="mt-6 px-6 py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold active:bg-blue-600 transition-colors"
        @click="router.push('/paths')"
      >
        返回路径列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  FolderOpen,
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  StickyNote,
} from 'lucide-vue-next'
import type { StudyTopic, Chapter, KnowledgePoint } from '@/types'
import { useXPSystem } from '@/composables/useXPSystem'
import { useNotes } from '@/composables/useNotes'
import { triggerHaptic } from '@/composables/useHaptic'

const route = useRoute()
const router = useRouter()
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast') || ((msg: string) => console.log(msg))

// ====== 功能15：XP 经验值系统 ======
const xpSystem = useXPSystem()

// ====== 功能18：笔记系统 ======
const notesSystem = useNotes()
const showNoteEditor = ref<string | null>(null)  // 当前展开笔记编辑器的章节ID
const noteContents = ref<Record<string, string>>({})  // 各章节的笔记内容缓存

/** 获取某章节的笔记内容 */
function getChapterNote(chapterId: string): string {
  if (noteContents.value[chapterId] !== undefined) return noteContents.value[chapterId]
  const notes = notesSystem.getTopicNotes(chapterId)
  noteContents.value[chapterId] = notes.length > 0 ? notes[0].content : ''
  return noteContents.value[chapterId]
}

/** 切换笔记编辑器显示状态 */
function toggleNoteEditor(chapterId: string): void {
  if (showNoteEditor.value === chapterId) {
    showNoteEditor.value = null
  } else {
    showNoteEditor.value = chapterId
    getChapterNote(chapterId)
  }
}

/** 保存笔记 */
function saveChapterNote(chapterId: string): void {
  const content = noteContents.value[chapterId] || ''
  if (content.trim()) {
    notesSystem.upsertNote(chapterId, content)
    showToast('笔记已保存', 'success')
  }
}

// ==================== 数据读取 ====================

function loadTopic(): StudyTopic | null {
  try {
    const raw = localStorage.getItem('feiman_topics')
    if (!raw) return null
    const topics: StudyTopic[] = JSON.parse(raw)
    const paramId = route.params.id as string
    const paramTitle = route.params.title as string
    if (paramId) {
      const found = topics.find((t) => t.id === paramId)
      if (found) return found
    }
    if (paramTitle) {
      const found = topics.find((t) => t.title === paramTitle)
      if (found) return found
    }
    return null
  } catch {
    return null
  }
}

const topic = ref<StudyTopic | null>(loadTopic())
const routeParamId = computed(() => (route.params.id || route.params.title) as string)

// ==================== 编辑模式 ====================

const isEditMode = ref(false)

function toggleEditMode() {
  isEditMode.value = !isEditMode.value
}

// ==================== 章节数据 ====================

/**
 * 从 topic.chapters 读取，确保每个章节都有 items 数组
 * 如果没有则自动生成默认知识点
 */
const chapters = computed<Chapter[]>(() => {
  if (!topic.value) return []
  let topicChapters = topic.value.chapters || []

  // 自动为没有 items 的章节生成默认知识点
  topicChapters = topicChapters.map((ch, idx) => {
    if (!ch.items || ch.items.length === 0) {
      return {
        ...ch,
        items: generateDefaultItems(ch.title, idx),
      }
    }
    return ch
  })

  return topicChapters
})

/** 生成默认知识点（基于章节标题智能拆解） */
function generateDefaultItems(chapterTitle: string, idx: number): KnowledgePoint[] {
  const templates: Record<string, string[]> = {
    '基础概念': ['理解核心定义', '掌握基本术语', '了解历史背景'],
    '核心机制': ['理解工作原理', '分析关键流程', '对比不同方案'],
    '实战案例': ['阅读经典案例', '动手实践练习', '总结经验教训'],
    '高级应用': ['学习进阶技巧', '探索边界情况', '优化性能表现'],
    '综合测验': ['回顾重点知识', '完成自测题目', '查漏补缺'],
  }

  for (const [key, items] of Object.entries(templates)) {
    if (chapterTitle.includes(key)) {
      return items.map((title, i) => ({
        id: `kp-${idx}-${i}`,
        title,
        done: false,
      }))
    }
  }

  // 通用默认：拆成3个基础知识点
  return [
    { id: `kp-${idx}-0`, title: `${chapterTitle} - 基础概念`, done: false },
    { id: `kp-${idx}-1`, title: `${chapterTitle} - 核心要点`, done: false },
    { id: `kp-${idx}-2`, title: `${chapterTitle} - 实践验证`, done: false },
  ]
}

// ==================== 进度计算 ====================

const totalItems = computed(() =>
  chapters.value.reduce((sum, ch) => sum + getChapterItemCount(ch), 0)
)

const doneItemsCount = computed(() =>
  chapters.value.reduce((sum, ch) => sum + getChapterDoneCount(ch), 0)
)

const overallProgress = computed(() => {
  if (totalItems.value === 0) return 0
  return Math.round((doneItemsCount.value / totalItems.value) * 100)
})

/** 获取章节数量 */
function getChapterItemCount(ch: Chapter): number {
  return (ch.items || []).length
}

/** 获取章节已完成数 */
function getChapterDoneCount(ch: Chapter): number {
  return (ch.items || []).filter((i) => i.done).length
}

/** 获取章节百分比 */
function getChapterProgress(ch: Chapter): number {
  const count = getChapterItemCount(ch)
  if (count === 0) return 0
  return Math.round((getChapterDoneCount(ch) / count) * 100)
}

/** 章节是否有进度 */
function chapterHasProgress(ch: Chapter): boolean {
  return getChapterDoneCount(ch) > 0
}

// ==================== 展开/折叠 ====================

const expandedChapters = ref<Set<string>>(new Set())

function expandAll() {
  expandedChapters.value = new Set(chapters.value.map((c) => c.id))
}

function collapseAll() {
  expandedChapters.value = new Set()
}

// ==================== 章节操作 ====================

/** 标记章节完成/取消 */
function toggleChapterComplete(chapterId: string): void {
  if (!topic.value) return
  const ch = findChapter(chapterId)
  if (!ch) return

  // 切换所有知识点的完成状态
  const newState = !ch.completed
  if (ch.items) {
    ch.items.forEach((i) => { i.done = newState })
  }
  ch.completed = newState
  ch.progress = newState ? 100 : 0
  saveTopicsToStorage()

  if (newState) {
    triggerHaptic('success') // 章节全部完成触觉反馈
    showToast(`「${ch.title}」已完成！`, 'success')
    // ====== 功能15：完成章节获得 XP ======
    xpSystem.gainXP('chapter_complete')
  }
}

/** 删除章节 */
function deleteChapter(chapterId: string): void {
  if (!topic.value) return
  const ch = findChapter(chapterId)
  if (!ch) return

  if (!window.confirm(`确定删除「${ch.title}」吗？\n该章节下的所有知识点也将被删除。`)) return

  topic.value.chapters = topic.value.chapters.filter((c) => c.id !== chapterId)
  saveTopicsToStorage()
  showToast('已删除章节', 'info')
}

/** 添加新章节 */
function addNewChapter(): void {
  if (!topic.value) return
  const newChapter: Chapter = {
    id: crypto.randomUUID(),
    title: `新章节 ${topic.value.chapters.length + 1}`,
    completed: false,
    progress: 0,
    items: [
      { id: crypto.randomUUID(), title: '知识点 1', done: false },
      { id: crypto.randomUUID(), title: '知识点 2', done: false },
    ],
  }
  topic.value.chapters.push(newChapter)
  saveTopicsToStorage()

  // 自动展开并进入编辑模式
  expandedChapters.value.add(newChapter.id)
  expandedChapters.value = new Set(expandedChapters.value)
  editingChapterId.value = newChapter.id
  editChapterTitle.value = newChapter.title

  nextTick(() => {
    focusChapterInput()
  })
}

/** 开始学习某章节 */
function startLearning(chapterId: string): void {
  if (!topic.value) return
  const ch = findChapter(chapterId)
  if (ch) {
    ch.progress = Math.max(ch.progress, 10)
    saveTopicsToStorage()
  }
  router.push('/explain/new')
}

// ==================== 章节标题编辑 ====================

const editingChapterId = ref<string | null>(null)
const editChapterTitle = ref('')
const chapterInputRef = ref<HTMLInputElement[]>([])

function startEditChapter(ch: Chapter): void {
  if (!isEditMode.value) return
  editingChapterId.value = ch.id
  editChapterTitle.value = ch.title
  nextTick(() => focusChapterInput())
}

function saveChapterTitle(_chapterId: string): void {
  if (!topic.value || !editingChapterId.value) return
  const trimmed = editChapterTitle.value.trim()
  if (!trimmed) {
    cancelChapterEdit()
    return
  }
  const ch = findChapter(editingChapterId.value)
  if (ch) {
    ch.title = trimmed
    saveTopicsToStorage()
  }
  cancelChapterEdit()
}

function cancelChapterEdit(): void {
  editingChapterId.value = null
  editChapterTitle.value = ''
}

function focusChapterInput(): void {
  nextTick(() => {
    const el = chapterInputRef.value?.[0]
    if (el) { el.focus(); el.select() }
  })
}

// ==================== 知识点操作 ====================

const editingItemId = ref<string | null>(null)
const editItemTitle = ref('')
const addingItemId = ref<string | null>(null)
const newItemTitle = ref('')
const itemInputRef = ref<HTMLInputElement[]>([])
const newItemInputRef = ref<HTMLInputElement[]>([])

/** 切换知识点完成状态 */
function toggleItem(chapterId: string, itemId: string): void {
  if (!topic.value) return
  const ch = findChapter(chapterId)
  if (!ch || !ch.items) return
  const item = ch.items.find((i) => i.id === itemId)
  if (!item) return

  item.done = !item.done
  triggerHaptic('selection') // 知识点勾选触觉反馈

  // 更新章节整体状态
  updateChapterStatus(ch)
  saveTopicsToStorage()
}

/** 更新章节的完成状态和进度 */
function updateChapterStatus(ch: Chapter): void {
  if (!ch.items || ch.items.length === 0) return
  const allDone = ch.items.every((i) => i.done)
  const someDone = ch.items.some((i) => i.done)
  ch.completed = allDone
  ch.progress = Math.round((ch.items.filter((i) => i.done).length / ch.items.length) * 100)
  if (allDone) {
    showToast(`「${ch.title}」全部知识点已掌握！`, 'success')
  }
}

/** 开始编辑知识点标题 */
function startEditItem(item: KnowledgePoint): void {
  if (!isEditMode.value) return
  editingItemId.value = item.id
  editItemTitle.value = item.title
  nextTick(() => focusItemInput())
}

function saveItemTitle(chapterId: string, _itemId: string): void {
  if (!topic.value || !editingItemId.value) return
  const trimmed = editItemTitle.value.trim()
  if (!trimmed) { cancelItemEdit(); return }
  const ch = findChapter(chapterId)
  if (!ch?.items) return
  const item = ch.items.find((i) => i.id === editingItemId.value)
  if (item) { item.title = trimmed; saveTopicsToStorage() }
  cancelItemEdit()
}

function cancelItemEdit(): void {
  editingItemId.value = null
  editItemTitle.value = ''
}

function focusItemInput(): void {
  nextTick(() => {
    const el = itemInputRef.value?.[0]
    if (el) { el.focus(); el.select() }
  })
}

/** 显示添加知识点输入框 */
function showAddItemInput(chapterId: string): void {
  addingItemId.value = chapterId
  newItemTitle.value = ''
  nextTick(() => focusNewItemInput())
}

/** 添加新知识点 */
function addNewItem(chapterId: string): void {
  if (!topic.value || !newItemTitle.value.trim()) return
  const ch = findChapter(chapterId)
  if (!ch) return
  if (!ch.items) ch.items = []
  ch.items.push({
    id: crypto.randomUUID(),
    title: newItemTitle.value.trim(),
    done: false,
  })
  updateChapterStatus(ch)
  saveTopicsToStorage()
  newItemTitle.value = ''
  // 保持输入框焦点
  nextTick(() => focusNewItemInput())
}

/** 失焦时也尝试添加 */
function addItemOnBlur(chapterId: string): void {
  if (newItemTitle.value.trim()) {
    addNewItem(chapterId)
  }
  addingItemId.value = null
}

function focusNewItemInput(): void {
  nextTick(() => {
    const el = newItemInputRef.value?.[0]
    if (el) el.focus()
  })
}

/** 删除知识点 */
function deleteItem(chapterId: string, itemId: string): void {
  if (!topic.value) return
  const ch = findChapter(chapterId)
  if (!ch?.items) return
  ch.items = ch.items.filter((i) => i.id !== itemId)
  updateChapterStatus(ch)
  saveTopicsToStorage()
  showToast('已删除知识点', 'info')
}

// ==================== 工具函数 ====================

/** 在当前 topic 中查找指定章节 */
function findChapter(id: string): Chapter | undefined {
  return topic.value?.chapters.find((c) => c.id === id)
}

/** 将变更同步回 localStorage */
function saveTopicsToStorage(): void {
  try {
    const raw = localStorage.getItem('feiman_topics')
    if (!raw || !topic.value) return
    const topics: StudyTopic[] = JSON.parse(raw)
    const idx = topics.findIndex((t) => t.id === topic.value!.id)
    if (idx !== -1) {
      topics[idx] = JSON.parse(JSON.stringify(topic.value))
      localStorage.setItem('feiman_topics', JSON.stringify(topics))
    }
  } catch {
    /* 静默处理 */
  }
}

// ==================== 一键生成闪卡 ====================

/**
 * 根据知识点自动生成闪卡，保存到 feiman_review_cards 或 feiman_cards 中
 * @param chapterId 所属章节ID
 * @param item 知识点对象
 */
function generateFlashcard(chapterId: string, item: KnowledgePoint): void {
  // 查找对应章节
  const chapter = findChapter(chapterId)
  if (!chapter) return

  // 读取现有闪卡数据（兼容两种存储 key）
  const cardsRaw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards')
  const cards = cardsRaw ? JSON.parse(cardsRaw) : []

  // 检查是否已存在同名闪卡（防止重复生成）
  const exists = cards.some((c: any) => c.question === item.title)
  if (exists) {
    showToast('该知识点已有对应闪卡', 'info')
    return
  }

  // 构建新闪卡对象
  const newCard = {
    id: crypto.randomUUID(),
    question: item.title,
    answer: `【${topic.value?.title || ''}】${chapter.title} - 知识点\n\n请用自己的话解释这个概念，检验是否真正掌握。`,
    tags: ['路径', topic.value?.title || '', chapter.title],
    deck: 'default',
    interval: 1,
    easeFactor: 2.5,
    repetition: 0,
    nextReview: new Date(Date.now() + 86400000).toISOString(),
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    source: 'knowledge_point' as string,
  }

  cards.push(newCard)

  // 保存回 localStorage（优先使用 feiman_review_cards）
  localStorage.setItem('feiman_review_cards', JSON.stringify(cards))

  showToast(`「${item.title}」闪卡已生成`, 'success')
}

// ====== 学习路径分享链接 ======

/**
 * 生成分享链接并复制到剪贴板
 * 将路径数据编码为 URL-safe base64，附加到当前 URL 后作为查询参数
 */
function sharePathLink(): void {
  if (!topic.value) return

  // 将路径数据编码为 URL-safe 的 base64
  const shareData = {
    title: topic.value.title,
    tags: topic.value.tags,
    chapters: topic.value.chapters.map(ch => ({
      title: ch.title,
      items: ch.items?.map(it => it.title) || [],
    })),
    source: '费曼学习法App',
  }

  const json = JSON.stringify(shareData)
  const encoded = btoa(encodeURIComponent(json))

  // 生成本地分享链接（实际部署后替换为真实域名）
  const shareUrl = `${window.location.origin}${window.location.pathname}?import_path=${encoded}`

  // 复制到剪贴板
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('分享链接已复制！', 'success')
    })
  } else {
    // 降级方案：使用 textarea 复制
    const ta = document.createElement('textarea')
    ta.value = shareUrl
    ta.style.cssText = 'position:fixed;left:-9999px'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast('分享链接已复制！', 'success')
  }
}

/**
 * 从 URL 参数中导入学习路径
 * 解码 base64 编码的路径数据并转换为 StudyTopic 格式
 * @returns 导入的 StudyTopic 对象，如果无导入数据则返回 null
 */
function importPathFromUrl(): StudyTopic | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('import_path')
  if (!encoded) return null

  try {
    const json = decodeURIComponent(atob(encoded))
    const data = JSON.parse(json)

    return {
      id: crypto.randomUUID(),
      title: data.title + ' (导入)',
      tags: data.tags || [],
      status: 'active' as const,
      progress: 0,
      createdAt: new Date().toISOString(),
      chapters: (data.chapters || []).map((ch: any, i: number) => ({
        id: `import-ch-${i}`,
        title: ch.title,
        completed: false,
        progress: 0,
        items: (ch.items || []).map((it: string, j: number) => ({
          id: `import-kp-${j}`,
          title: it,
          done: false,
        })),
      })),
      color: '#4F6EF7',
    }
  } catch {
    return null
  }
}
</script>
