<template>
  <div ref="refreshContainer" class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
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

      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">讲解记录</h1>
        <p class="text-sm text-slate-500 mt-0.5">历史讲解回顾</p>
      </div>

      <!-- 搜索框 -->
      <div class="relative">
        <Search
          :size="16"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索主题名..."
          class="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-300 focus:outline-none focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7]/20 transition-colors"
        />
      </div>

      <!-- 排序按钮组 -->
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="
            sortMode === 'time'
              ? 'bg-[#4F6EF7] text-white'
              : 'bg-white text-slate-500 shadow-sm active:bg-slate-50'
          "
          @click="sortMode = 'time'"
        >
          <Clock :size="12" />
          时间
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          :class="
            sortMode === 'score'
              ? 'bg-[#4F6EF7] text-white'
              : 'bg-white dark:bg-slate-800 text-slate-500 shadow-sm active:bg-slate-50 dark:active:bg-slate-700'
          "
          @click="sortMode = 'score'"
        >
          <BarChart3 :size="12" />
          分数
        </button>
      </div>

      <!-- 统计概览条 -->
      <div class="flex gap-3">
        <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 text-center">
          <p class="text-xl font-bold text-[#4F6EF7]">{{ filteredSessions.length }}</p>
          <p class="text-[11px] text-slate-400">总记录</p>
        </div>
        <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 text-center">
          <p class="text-xl font-bold text-emerald-600">{{ avgScore }}</p>
          <p class="text-[11px] text-slate-400">平均分</p>
        </div>
        <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-3 text-center">
          <p class="text-xl font-bold text-amber-500">{{ voiceCount }}</p>
          <p class="text-[11px] text-slate-400">语音讲解</p>
        </div>
      </div>

      <!-- 讲解记录列表（虚拟滚动） -->
      <div v-if="filteredSessions.length > 0" class="relative">
        <!-- 虚拟滚动容器 -->
        <div
          ref="virtualScrollContainer"
          class="space-y-3 overflow-y-auto"
          style="max-height: 70vh;"
        >
          <!-- 占位元素：撑开总高度 -->
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <!-- 可见项渲染区 -->
            <div :style="{ transform: `translateY(${offsetY}px)` }">
              <div
                v-for="session in visibleSessions"
                :key="session.id"
                class="relative overflow-hidden rounded-2xl mb-3"
              >
                <!-- 滑动操作背景层 -->
                <div class="absolute inset-0 flex">
                  <div
                    class="flex-1 bg-emerald-500 flex items-center px-4"
                    :style="{ opacity: Math.min(1, swipeVal(session.id) / 80) }"
                  >
                    <Check :size="18" class="text-white mr-1" /> 标记完成
                  </div>
                  <div
                    class="flex-1 bg-red-500 flex items-center justify-end px-4"
                    :style="{ opacity: Math.min(1, Math.abs(swipeVal(session.id)) / 80) }"
                  >
                    删除 <Trash2 :size="18" class="text-white ml-1" />
                  </div>
                </div>
                <!-- 内容层 -->
                <div
                  class="relative bg-white dark:bg-slate-800 shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-transform duration-150 touch-none"
                  :style="{
                    transform: `translateX(${swipeVal(session.id)}px)`,
                    transition: swipeVal(session.id) === 0 ? 'transform 0.3s ease' : 'none'
                  }"
                  @click="handleClick(session)"
                  @touchstart.passive="handleSwipeStart(session.id, $event)"
                  @touchmove.prevent="handleSwipeMove(session.id, $event)"
                  @touchend="handleSwipeEnd(session.id)"
                >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <!-- 类型标签 + 标题 -->
                    <div class="flex items-center gap-2 mb-1.5">
                      <component
                        :is="session.type === 'voice' ? Mic : FileText"
                        :size="14"
                        :class="session.type === 'voice' ? 'text-purple-500' : 'text-blue-500'"
                      />
                      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{{ session.topicName }}</h3>
                    </div>

                    <!-- 日期 -->
                    <p class="text-xs text-slate-400">{{ formatDate(session.createdAt) }}</p>
                  </div>

                  <!-- 右侧操作区：闪卡按钮 + 分数 + 删除按钮 -->
                  <div class="shrink-0 flex items-center gap-2">
                    <!-- 创建闪卡按钮 -->
                    <button
                      class="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 hover:bg-purple-100 dark:hover:bg-purple-500/20 active:scale-90 transition-all shrink-0"
                      title="根据此讲解生成闪卡"
                      @click.stop="generateFlashcard(session)"
                    >
                      <Layers :size="15" />
                    </button>
                    <!-- 分数 -->
                    <div
                      class="w-11 h-11 rounded-xl flex flex-col items-center justify-center"
                      :style="{ backgroundColor: getScoreColor(session.score) + '12' }"
                    >
                      <span
                        class="text-sm font-bold tabular-nums"
                        :style="{ color: getScoreColor(session.score) }"
                      >{{ session.score }}</span>
                      <span class="text-[9px] text-slate-400">分</span>
                    </div>
                    <!-- 删除按钮 -->
                    <button
                      class="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-90 transition-all shrink-0"
                      title="删除这条讲解记录"
                      @click.stop="confirmDelete(session)"
                    >
                      <Trash2 :size="15" />
                    </button>
                  </div>
                </div>
                <!-- 内容层结束 -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示（当没有记录时） -->
      <div v-if="sessions.length === 0" class="text-center py-16">
        <BookOpen :size="48" class="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
        <p class="text-sm text-slate-400 dark:text-slate-500">还没有讲解记录</p>
        <p class="text-xs text-slate-300 dark:text-slate-600 mt-1">开始你的第一次费曼讲解吧</p>
        <button
          class="mt-4 px-5 py-2.5 rounded-full bg-[#4F6EF7] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150"
          style="min-height: 44px;"
          @click="router.push('/explain/new')"
        >
          去讲解
        </button>
      </div>

      <!-- 搜索无结果提示 -->
      <div v-if="sessions.length > 0 && filteredSessions.length === 0" class="text-center py-16">
        <Search :size="48" class="mx-auto text-slate-200 dark:text-slate-700 mb-3" />
        <p class="text-sm text-slate-400 dark:text-slate-500">未找到匹配的讲解记录</p>
        <p class="text-xs text-slate-300 dark:text-slate-600 mt-1">试试其他关键词</p>
      </div>

      <!-- 长按弹出菜单（操作浮层） -->
      <Teleport to="body">
        <div
          v-if="showMenu && menuSession"
          class="fixed inset-0 z-50 bg-black/30 flex items-end justify-center"
          @click="closeMenu"
          @touchstart.prevent="closeMenu"
        >
          <div
            class="w-full max-w-md bg-white rounded-t-2xl p-4 pb-8 space-y-1 animate-slide-up"
            @click.stop
            @touchstart.stop
          >
            <div class="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <p class="text-sm font-semibold text-slate-800 px-2 mb-2 truncate">{{ menuSession.topicName }}</p>
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-700 dark:text-slate-300 active:bg-slate-50 dark:active:bg-slate-700 transition-colors"
              @click="viewDetail(menuSession)"
            >
              <Eye :size="18" class="text-[#4F6EF7]" />
              查看详情
            </button>
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-purple-600 dark:text-purple-400 active:bg-purple-50 dark:active:bg-purple-500/10 transition-colors"
              @click="generateFlashcardFromMenu(menuSession)"
            >
              <Layers :size="18" />
              生成闪卡
            </button>
            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 active:bg-red-50 transition-colors"
              @click="confirmDelete(menuSession)"
            >
              <Trash2 :size="18" />
              删除记录
            </button>
            <button
              class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 active:bg-slate-50 transition-colors mt-2"
              @click="closeMenu"
            >
              取消
            </button>
          </div>
        </div>
      </Teleport>

      <!-- 自定义删除确认弹窗（替代 window.confirm） -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="showDeleteConfirm && deleteTargetSession"
            class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
            @click="showDeleteConfirm = false"
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
                  <p class="text-xs text-slate-400 mt-0.5">
                    确定要删除「{{ deleteTargetSession.topicName }}」这条讲解记录吗？
                  </p>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-colors"
                  style="min-height: 44px;"
                  @click="showDeleteConfirm = false; deleteTargetSession = null"
                >
                  取消
                </button>
                <button
                  class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white active:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                  style="min-height: 44px;"
                  @click="executeDelete"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Mic,
  FileText,
  BookOpen,
  Search,
  Clock,
  BarChart3,
  Eye,
  Trash2,
  Check,
  Layers,    // 创建闪卡图标
} from 'lucide-vue-next'
import type { FeynmanSession } from '@/types'
import { usePullRefresh } from '@/composables/usePullRefresh'
import { useUndoRedo } from '@/composables/useUndoRedo'
import { useVirtualScroll } from '@/composables/useVirtualScroll'

const router = useRouter()

// 获取全局 Toast（用于右滑标记提示）
const showToast = inject<(msg: string, type?: string) => void>('toast')

// ==================== 滑动手势跟踪 ====================

/** 各列表项的滑动偏移量映射 */
const swipeMaps = ref<Record<string, number>>({})

/** 各列表项的触摸起始 X 坐标 */
const swipeStartX = ref<Record<string, number>>({})

/** 获取滑动值（确保为数字类型） */
function swipeVal(id: string): number {
  return Number(swipeMaps.value[id] || 0)
}

/**
 * 滑动开始 - 记录起始位置
 */
function handleSwipeStart(id: string, e: TouchEvent) {
  swipeStartX.value[id] = e.touches[0].clientX
  swipeMaps.value[id] = 0
}

/**
 * 滑动中 - 计算并限制偏移量
 */
function handleSwipeMove(id: string, e: TouchEvent) {
  const diff = e.touches[0].clientX - (swipeStartX.value[id] || 0)
  // 限制最大偏移范围，添加阻力
  const clamped = Math.max(-120, Math.min(120, diff * 0.6))
  swipeMaps.value[id] = clamped
}

/**
 * 滑动结束 - 判断是否触发操作
 */
function handleSwipeEnd(id: string) {
  const x = swipeMaps.value[id] || 0
  if (x <= -80) {
    // 左滑删除
    const session = sessions.value.find((s) => s.id === id)
    if (session) {
      confirmDelete(session)
    }
  } else if (x >= 80) {
    // 右滑标记完成
    showToast?.('已标记为已完成', 'success')
  }
  // 弹回原位
  swipeMaps.value[id] = 0
}

// 下拉刷新
const refreshContainerRef = ref<HTMLElement>()
const { isPulling, isRefreshing, pullDistance, init } = usePullRefresh({
  onRefresh: () => {
    // 重新从 localStorage 加载讲解记录
    sessions.value = loadSessions()
  },
})

// ==================== 类型定义 ====================

/** 展示用的会话数据（兼容旧格式） */
interface DisplaySession {
  id: string
  topicId: string
  topicName: string
  content: string
  score: number
  type: 'text' | 'voice'
  createdAt: string
}

// ==================== 状态 ====================

/** 搜索关键词 */
const searchKeyword = ref('')

/** 排序模式：time=时间倒序，score=分数从高到低 */
const sortMode = ref<'time' | 'score'>('time')

/** 长按菜单是否显示 */
const showMenu = ref(false)

/** 当前长按选中的会话 */
const menuSession = ref<DisplaySession | null>(null)

/** 自定义删除确认弹窗 */
const showDeleteConfirm = ref(false)
const deleteTargetSession = ref<DisplaySession | null>(null)

/** 长按计时相关 */
let touchStartTime = 0
let touchTimer: ReturnType<typeof setTimeout> | null = null
let isLongPress = false

// ==================== 数据读取与转换 ====================

/**
 * 从 localStorage 读取 feiman_sessions 并转换为展示格式
 * 兼容旧数据：缺少字段时使用默认值
 * 使用 topics 缓存避免 N+1 次 localStorage 读取
 */
function loadSessions(): DisplaySession[] {
  try {
    const raw = localStorage.getItem('feiman_sessions')
    if (!raw) return []

    const parsed: unknown[] = JSON.parse(raw)

    // 一次性加载 topics 缓存，避免 N+1 次读取
    let topicsCache: Array<{ id: string; title: string }> | null = null
    function getTopicsCache(): Array<{ id: string; title: string }> {
      if (!topicsCache) {
        try {
          const topicsRaw = localStorage.getItem('feiman_topics')
          topicsCache = topicsRaw ? JSON.parse(topicsRaw) : []
        } catch {
          topicsCache = []
        }
      }
      return topicsCache
    }

    return parsed.map((item): DisplaySession => {
      // 兼容 FeynmanSession 标准格式
      const session = item as Record<string, unknown>
      return {
        id: (session.id as string) || '',
        topicId: (session.topicId as string) || '',
        topicName: resolveTopicNameCached(session, getTopicsCache()),
        content: (session.content as string) || '',
        score: typeof session.score === 'number' ? session.score : 0,
        type: (session.type === 'voice' ? 'voice' : 'text') as 'text' | 'voice',
        createdAt: (session.createdAt as string) || new Date().toISOString(),
      }
    })
  } catch {
    return []
  }
}

/**
 * 使用缓存的 topics 解析主题名称（避免 N+1 读取）
 */
function resolveTopicNameCached(session: Record<string, unknown>, topicsCache: Array<{ id: string; title: string }>): string {
  // 旧数据可能直接有 topic 字段
  if ((session as Record<string, unknown>).topic) {
    return String((session as Record<string, unknown>).topic)
  }

  const topicId = session.topicId as string | undefined
  if (topicId) {
    const found = topicsCache.find((t) => t.id === topicId)
    if (found) return found.title
  }

  // 从内容中提取前20字作为主题名
  const content = session.content as string | undefined
  if (content && content.trim()) {
    return content.trim().slice(0, 20) + (content.length > 20 ? '...' : '')
  }

  return '未知主题'
}

/** 原始会话列表 */
const sessions = ref<DisplaySession[]>(loadSessions())

// ==================== 全局撤销/重做（功能2） ====================

const { undo, redo, execute } = useUndoRedo(sessions.value)

/**
 * 全局键盘快捷键：Ctrl+Z 撤销，Ctrl+Y/Ctrl+Shift+Z 重做
 */
function handleGlobalKeydown(e: KeyboardEvent): void {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    if (undo()) {
      sessions.value = loadSessions()
      showToast?.('已撤销删除操作', 'info')
    }
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  }
}

// 监听跨标签页 localStorage 变化（通过 storage 事件）

// ==================== 计算属性 ====================

/** 过滤+排序后的列表 */
const filteredSessions = computed(() => {
  let list = [...sessions.value]

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    list = list.filter((s) => s.topicName.toLowerCase().includes(keyword))
  }

  // 排序
  if (sortMode.value === 'time') {
    // 时间倒序（最新的在前）
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } else {
    // 分数从高到低
    list.sort((a, b) => b.score - a.score)
  }

  return list
})

/** 平均分 */
const avgScore = computed(() => {
  if (filteredSessions.value.length === 0) return 0
  const sum = filteredSessions.value.reduce((acc, s) => acc + s.score, 0)
  return Math.round(sum / filteredSessions.value.length)
})

/** 语音讲解数量 */
const voiceCount = computed(() =>
  filteredSessions.value.filter((s) => s.type === 'voice').length
)

// ==================== 虚拟滚动 ====================

const VIRTUAL_ITEM_HEIGHT = 128
const VIRTUAL_CONTAINER_HEIGHT = 600

const { visibleItems: visibleSessions, offsetY, totalHeight, init: initVirtualScroll } = useVirtualScroll<DisplaySession>({
  items: filteredSessions,
  itemHeight: VIRTUAL_ITEM_HEIGHT,
  containerHeight: VIRTUAL_CONTAINER_HEIGHT,
  overscan: 3,
})

/** 虚拟滚动容器引用 */
const virtualScrollContainer = ref<HTMLElement | null>(null)

// ==================== 工具函数 ====================

/** 格式化日期显示 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
  } catch {
    return isoString
  }
}

/** 根据分数返回颜色 */
function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#4F6EF7'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

// ==================== 交互事件 ====================

/** 点击跳转到新讲解页 */
function handleClick(session: DisplaySession) {
  // 如果刚触发过长按，忽略本次点击
  if (isLongPress) {
    isLongPress = false
    return
  }
  router.push('/explain/new')
}

/** 触摸开始 - 记录时间并启动长按检测 */
function onTouchStart(event: TouchEvent, session: DisplaySession) {
  touchStartTime = Date.now()
  isLongPress = false

  // 超过 500ms 判定为长按
  touchTimer = setTimeout(() => {
    isLongPress = true
    menuSession.value = session
    showMenu.value = true
  }, 500)
}

/** 触摸结束 - 清除计时器 */
function onTouchEnd(_event: TouchEvent, _session: DisplaySession) {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

/** 触摸移动 - 取消长按（用户在滑动） */
function onTouchMove() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

/** 关闭长按菜单 */
function closeMenu() {
  showMenu.value = false
  menuSession.value = null
}

/** 查看详情 - 跳转到新讲解页（暂无单独详情页） */
function viewDetail(session: DisplaySession) {
  closeMenu()
  router.push('/explain/new')
}

/**
 * 根据讲解记录生成闪卡
 * 提取讲解内容的核心概念作为问题，内容摘要作为答案
 */
function generateFlashcard(session: DisplaySession): void {
  // 检查是否已存在同名闪卡
  const cardsRaw = localStorage.getItem('feiman_review_cards') || localStorage.getItem('feiman_cards')
  const cards = cardsRaw ? JSON.parse(cardsRaw) : []
  const exists = cards.some((c: any) => c.question === session.topicName)
  if (exists) {
    showToast?.(`「${session.topicName}」已有对应闪卡`, 'info')
    return
  }

  // 从讲解内容提取问题（用主题名）和答案（截取前200字）
  const questionText = session.topicName
  const answerText = session.content.length > 200
    ? session.content.slice(0, 200) + '...'
    : (session.content || '请用自己的话解释这个概念')

  cards.push({
    id: crypto.randomUUID(),
    question: questionText,
    answer: answerText,
    tags: ['讲解', session.topicName, session.type === 'voice' ? '语音' : '文字'],
    deck: 'default',
    interval: 1,
    easeFactor: 2.5,
    repetition: 0,
    nextReview: new Date(Date.now() + 86400000).toISOString(),
    reviewCount: 0,
    createdAt: new Date().toISOString(),
    source: 'session_flashcard',
  })

  localStorage.setItem('feiman_review_cards', JSON.stringify(cards))
  showToast?.(`已生成闪卡「${questionText}」`, 'success')
}

/** 从长按菜单生成闪卡（需要先关闭菜单） */
function generateFlashcardFromMenu(session: DisplaySession): void {
  closeMenu()
  generateFlashcard(session)
}

/** 删除确认 - 显示自定义弹窗（替代 window.confirm） */
function confirmDelete(session: DisplaySession) {
  closeMenu()
  deleteTargetSession.value = session
  showDeleteConfirm.value = true
}

/** 执行删除操作 */
function executeDelete() {
  const session = deleteTargetSession.value
  if (!session) return

  // 删除前保存当前状态到撤销栈
  execute(sessions.value as any)

  // 从列表中移除
  const idx = sessions.value.findIndex((s) => s.id === session.id)
  if (idx !== -1) {
    sessions.value.splice(idx, 1)
  }

  // 同步回 localStorage
  saveToStorage()
  showToast?.('已删除 · 按 Ctrl+Z 可恢复', 'warning')

  // 关闭弹窗
  showDeleteConfirm.value = false
  deleteTargetSession.value = null
}

/** 将当前会话列表写回 localStorage */
function saveToStorage(): void {
  try {
    // 只保留核心字段写回，保持与 FeynmanSession 结构一致
    const rawData = sessions.value.map((s) => ({
      id: s.id,
      topicId: s.topicId,
      content: s.content,
      score: s.score,
      type: s.type,
      createdAt: s.createdAt,
    }))
    localStorage.setItem('feiman_sessions', JSON.stringify(rawData))
  } catch {
    // 写入失败时静默处理
  }
}

// 初始化下拉刷新绑定 + 撤销/重做快捷键
onMounted(() => {
  if (refreshContainerRef.value) {
    init(refreshContainerRef.value)
  }
  // 注册撤销/重做全局快捷键
  window.addEventListener('keydown', handleGlobalKeydown)
  // 监听跨标签页 localStorage 变化
  const onStorageChange = (e: StorageEvent) => {
    if (e.key === 'feiman_sessions') {
      sessions.value = loadSessions()
    }
  }
  window.addEventListener('storage', onStorageChange)
  // 初始化虚拟滚动
  if (virtualScrollContainer.value) {
    initVirtualScroll(virtualScrollContainer.value)
  }
})

onUnmounted(() => {
  // 清理撤销/重做快捷键监听
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
/* 底部弹出动画 */
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.25s ease-out;
}

/* 淡入淡出（用于删除确认弹窗） */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
