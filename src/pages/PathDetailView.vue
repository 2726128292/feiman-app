<template>
  <div class="min-h-screen bg-slate-50 pb-24">
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
          <!-- 动态标题：从 topic.title 显示 -->
          <h1 class="text-lg font-bold text-slate-900 truncate">{{ topic.title }}</h1>
          <p class="text-xs text-slate-400 mt-0.5">{{ chapters.length }} 个章节</p>
        </div>
      </div>

      <!-- 总进度概览 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-slate-700">整体进度</span>
          <span class="text-sm font-bold text-[#4F6EF7]">{{ overallProgress }}%</span>
        </div>
        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-[#4F6EF7] to-[#6B8CF7] rounded-full transition-all duration-300"
            :style="{ width: overallProgress + '%' }"
          />
        </div>
      </div>

      <!-- 章节列表（从 topic.chapters 动态渲染） -->
      <div class="space-y-3">
        <div
          v-for="chapter in chapters"
          :key="chapter.id"
          class="bg-white rounded-2xl shadow-sm p-4"
        >
          <div class="flex items-start gap-3">
            <!-- 完成状态图标 -->
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 transition-colors"
              :class="
                chapter.completed
                  ? 'bg-emerald-500 border-emerald-500'
                  : chapter.progress > 0 ? 'border-blue-400 bg-blue-50' : 'border-slate-200'
              "
            >
              <Check v-if="chapter.completed" :size="14" class="text-white" />
            </div>

            <!-- 章节信息 -->
            <div class="flex-1 min-w-0">
              <h3
                class="text-sm font-semibold leading-snug"
                :class="chapter.completed ? 'text-slate-400 line-through' : 'text-slate-800'"
              >
                {{ chapter.title }}
              </h3>

              <!-- 进度条（未完成时显示） -->
              <div v-if="!chapter.completed && chapter.progress > 0" class="mt-2.5">
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="chapter.progress >= 100 ? 'bg-emerald-500' : 'bg-[#4F6EF7]'"
                    :style="{ width: Math.min(chapter.progress, 100) + '%' }"
                  />
                </div>
                <p class="text-[11px] text-slate-400 mt-1">{{ chapter.progress }}% 已完成</p>
              </div>

              <!-- 开始学习按钮（未开始时显示） -->
              <button
                v-if="!chapter.completed && chapter.progress === 0"
                class="mt-3 px-4 py-1.5 rounded-full bg-[#4F6EF7] text-white text-xs font-semibold active:bg-blue-600 transition-colors"
                @click="startLearning(chapter.id)"
              >
                开始学习
              </button>

              <span
                v-if="chapter.completed"
                class="inline-block mt-2 text-[11px] text-emerald-600 font-medium"
              >
                ✓ 已完成
              </span>
            </div>
          </div>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, FolderOpen } from 'lucide-vue-next'
import type { StudyTopic, Chapter } from '@/types'

const route = useRoute()
const router = useRouter()

// ==================== 数据读取 ====================

/**
 * 从 localStorage 读取 feiman_topics 并查找匹配的 topic
 * 同时支持 route.params.id 和 route.params.title（向后兼容）
 */
function loadTopic(): StudyTopic | null {
  try {
    const raw = localStorage.getItem('feiman_topics')
    if (!raw) return null

    const topics: StudyTopic[] = JSON.parse(raw)
    const paramId = route.params.id as string
    const paramTitle = route.params.title as string

    // 优先按 id 匹配
    if (paramId) {
      const found = topics.find((t) => t.id === paramId)
      if (found) return found
    }

    // 向后兼容：按 title 匹配
    if (paramTitle) {
      const found = topics.find((t) => t.title === paramTitle)
      if (found) return found
    }

    return null
  } catch {
    return null
  }
}

/** 当前学习路径主题 */
const topic = ref<StudyTopic | null>(loadTopic())

/** 用于空状态展示的路由参数 */
const routeParamId = computed(() => (route.params.id || route.params.title) as string)

// ==================== 章节数据 ====================

/**
 * 从 topic.chapters 读取章节列表
 * 如果 chapters 为空，返回默认的 5 个章节模板
 */
const chapters = computed<Chapter[]>(() => {
  if (!topic.value) return []

  const topicChapters = topic.value.chapters
  if (!topicChapters || topicChapters.length === 0) {
    // 空时使用默认 5 个章节模板
    return getDefaultChapters()
  }

  return topicChapters
})

/**
 * 生成默认的 5 个章节模板
 */
function getDefaultChapters(): Chapter[] {
  const titlePrefix = topic.value?.title || ''
  return [
    { id: 'default-ch-1', title: `${titlePrefix} - 基础概念入门`, completed: false, progress: 0 },
    { id: 'default-ch-2', title: `${titlePrefix} - 核心机制深入`, completed: false, progress: 0 },
    { id: 'default-ch-3', title: `${titlePrefix} - 实战案例分析`, completed: false, progress: 0 },
    { id: 'default-ch-4', title: `${titlePrefix} - 高级应用技巧`, completed: false, progress: 0 },
    { id: 'default-ch-5', title: `${titlePrefix} - 综合测验与复习`, completed: false, progress: 0 },
  ]
}

// ==================== 进度计算 ====================

/**
 * 基于 chapters 的 completed 状态计算整体进度百分比
 */
const overallProgress = computed(() => {
  if (chapters.value.length === 0) return 0
  const doneCount = chapters.value.filter((c) => c.completed).length
  return Math.round((doneCount / chapters.value.length) * 100)
})

// ==================== 交互操作 ====================

/**
 * 开始学习：
 * 1. 更新对应 chapter 的 progress 为 10%
 * 2. 将更新后的 topics 数组存回 localStorage
 * 3. 跳转到 /explain/new
 */
function startLearning(chapterId: string): void {
  if (!topic.value) return

  // 找到目标章节并更新进度
  const targetChapter = topic.value.chapters.find((ch) => ch.id === chapterId)
  if (targetChapter) {
    targetChapter.progress = 10
  }

  // 将更新后的完整 topics 数组写回 localStorage
  saveTopicsToStorage()

  // 跳转到费曼讲解页面开始学习
  router.push('/explain/new')
}

/**
 * 将当前 topic 的变更同步回 localStorage 的 feiman_topics
 */
function saveTopicsToStorage(): void {
  try {
    const raw = localStorage.getItem('feiman_topics')
    if (!raw || !topic.value) return

    const topics: StudyTopic[] = JSON.parse(raw)
    const idx = topics.findIndex((t) => t.id === topic.value!.id)
    if (idx !== -1) {
      // 用更新后的 topic 替换原数据
      topics[idx] = { ...topic.value }
      localStorage.setItem('feiman_topics', JSON.stringify(topics))
    }
  } catch {
    // 写入失败时静默处理
  }
}
</script>
