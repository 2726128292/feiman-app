<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">学习路径</h1>
        <p class="text-sm text-slate-500 mt-0.5">用路线拆解大目标</p>
      </div>

      <!-- 搜索栏 -->
      <div class="relative">
        <Search
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索课程、主题、知识点"
          class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      <!-- 学习主题卡片列表 -->
      <div class="space-y-3">
        <div
          v-for="topic in filteredTopics"
          :key="topic.id"
          class="relative overflow-hidden rounded-2xl"
        >
          <!-- 滑动操作背景层 -->
          <div class="absolute inset-0 flex">
            <div
              class="flex-1 bg-emerald-500 flex items-center px-4"
              :style="{ opacity: Math.min(1, swipeVal(topic.id) / 80) }"
            >
              <Check :size="18" class="text-white mr-1" /> 标记完成
            </div>
            <div
              class="flex-1 bg-red-500 flex items-center justify-end px-4"
              :style="{ opacity: Math.min(1, Math.abs(swipeVal(topic.id)) / 80) }"
            >
              删除 <Trash2 :size="18" class="text-white ml-1" />
            </div>
          </div>
          <!-- 内容层 -->
          <div
            class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform duration-150 touch-none"
            :style="{
              transform: `translateX(${swipeVal(topic.id)}px)`,
              transition: swipeVal(topic.id) === 0 ? 'transform 0.3s ease' : 'none'
            }"
            @click="router.push(`/paths/${topic.id}`)"
            @touchstart.passive="handleSwipeStart(topic.id, $event)"
            @touchmove.prevent="handleSwipeMove(topic.id, $event)"
            @touchend="handleSwipeEnd(topic.id)"
          >
          <!-- 左侧：图标 + 信息 -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- 彩色圆形图标 -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: topic.color + '18', color: topic.color }"
            >
              <BookOpen :size="20" />
            </div>
            <!-- 标题 + 标签 + 进度条 -->
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-slate-900 truncate">{{ topic.title }}</h3>
              <div class="flex gap-1.5 mt-1 mb-2">
                <span
                  v-for="tag in topic.tags"
                  :key="tag"
                  class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  :style="{ backgroundColor: topic.color + '14', color: topic.color }"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{ width: `${topic.progress}%`, backgroundColor: topic.color }"
                />
              </div>
            </div>
          </div>
          <!-- 右侧：进度百分比 -->
          <span
            class="text-lg font-bold ml-4 shrink-0 tabular-nums"
            :style="{ color: topic.color }"
          >
            {{ topic.progress }}%
          </span>
          <!-- 内容层结束 -->
          </div>
        </div>
      </div>

      <!-- 底部：生成学习路径卡片 -->
      <div
        class="bg-emerald-50 rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform duration-150"
        @click="router.push('/paths/create')"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Sparkles :size="20" class="text-emerald-600" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-emerald-900">生成学习路径</h3>
            <p class="text-xs text-emerald-600/80 mt-1 leading-relaxed">
              输入你的学习目标，AI 将自动拆解为章节、任务和复习节点，为你规划最优学习路线。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Search, BookOpen, Sparkles, Check, Trash2 } from 'lucide-vue-next'
import { mockTopics } from '@/utils/mock'
import type { StudyTopic } from '@/types/topic'

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
    // 左滑删除：从列表中移除该主题
    const idx = allTopics.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      const topic = allTopics.value[idx]
      const confirmed = window.confirm(`确定要删除「${topic.title}」这条学习路径吗？`)
      if (confirmed) {
        allTopics.value.splice(idx, 1)
        // 同步到 localStorage
        try {
          localStorage.setItem('feiman_topics', JSON.stringify(allTopics.value))
        } catch { /* 忽略 */ }
      }
    }
  } else if (x >= 80) {
    // 右滑标记完成
    showToast?.('已标记为已完成', 'success')
  }
  // 弹回原位
  swipeMaps.value[id] = 0
}
const searchQuery = ref('')

// 优先从 localStorage 读取真实数据，无数据时使用 mock
const allTopics = ref<StudyTopic[]>([])

function loadTopics() {
  try {
    const raw = localStorage.getItem('feiman_topics')
    if (raw) {
      const stored: StudyTopic[] = JSON.parse(raw)
      if (stored.length > 0) {
        allTopics.value = stored
        return
      }
    }
  } catch {
    // 解析失败时降级到 mock 数据
  }
  // 无 localStorage 数据时使用 mock
  allTopics.value = mockTopics as unknown as StudyTopic[]
}

// 初始加载
loadTopics()

const filteredTopics = computed(() => {
  if (!searchQuery.value.trim()) return allTopics.value
  const q = searchQuery.value.toLowerCase()
  return allTopics.value.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  )
})
</script>
