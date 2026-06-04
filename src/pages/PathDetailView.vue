<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部导航栏 -->
      <div class="flex items-center gap-3">
        <button
          class="flex items-center justify-center w-9 h-9 -ml-2 rounded-xl bg-white shadow-sm text-slate-600 active:bg-slate-50 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-slate-900 truncate">{{ topicTitle }}</h1>
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

      <!-- 章节列表 -->
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
              <p class="text-xs text-slate-400 mt-1">{{ chapter.description }}</p>

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

              <!-- 开始学习按钮 -->
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const topicTitle = computed(() => (route.params.title as string) || '学习路径详情')

const chapters = [
  {
    id: 1,
    title: '基础概念入门',
    description: '了解核心术语与基本原理',
    progress: 100,
    completed: true,
  },
  {
    id: 2,
    title: '核心机制深入',
    description: '掌握内部工作流程与关键算法',
    progress: 60,
    completed: false,
  },
  {
    id: 3,
    title: '实战案例分析',
    description: '通过真实项目加深理解',
    progress: 0,
    completed: false,
  },
  {
    id: 4,
    title: '高级应用技巧',
    description: '性能优化与最佳实践',
    progress: 0,
    completed: false,
  },
  {
    id: 5,
    title: '综合测验与复习',
    description: '检验学习成果，巩固知识点',
    progress: 0,
    completed: false,
  },
]

const overallProgress = computed(() => {
  const total = chapters.length
  const done = chapters.filter((c) => c.completed).length
  return Math.round((done / total) * 100)
})

function startLearning(chapterId: number) {
  console.log('Start learning chapter:', chapterId)
}
</script>
