<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">讲解记录</h1>
        <p class="text-sm text-slate-500 mt-0.5">历史讲解回顾</p>
      </div>

      <!-- 统计概览条 -->
      <div class="flex gap-3">
        <div class="flex-1 bg-white rounded-2xl shadow-sm p-3 text-center">
          <p class="text-xl font-bold text-[#4F6EF7]">{{ sessions.length }}</p>
          <p class="text-[11px] text-slate-400">总记录</p>
        </div>
        <div class="flex-1 bg-white rounded-2xl shadow-sm p-3 text-center">
          <p class="text-xl font-bold text-emerald-600">{{ avgScore }}</p>
          <p class="text-[11px] text-slate-400">平均分</p>
        </div>
        <div class="flex-1 bg-white rounded-2xl shadow-sm p-3 text-center">
          <p class="text-xl font-bold text-amber-500">{{ voiceCount }}</p>
          <p class="text-[11px] text-slate-400">语音讲解</p>
        </div>
      </div>

      <!-- 讲解记录列表 -->
      <div class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="bg-white rounded-2xl shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-transform duration-150"
          @click="router.push(`/explain/${session.id}`)"
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
                <h3 class="text-sm font-semibold text-slate-800 truncate">{{ session.topic }}</h3>
              </div>

              <!-- 日期 -->
              <p class="text-xs text-slate-400">{{ session.date }}</p>
            </div>

            <!-- 分数 -->
            <div
              class="shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center"
              :style="{ backgroundColor: getScoreColor(session.score) + '12' }"
            >
              <span
                class="text-sm font-bold tabular-nums"
                :style="{ color: getScoreColor(session.score) }"
              >{{ session.score }}</span>
              <span class="text-[9px] text-slate-400">分</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态提示（当没有记录时） -->
      <div v-if="sessions.length === 0" class="text-center py-16">
        <BookOpen :size="48" class="mx-auto text-slate-200 mb-3" />
        <p class="text-sm text-slate-400">还没有讲解记录</p>
        <p class="text-xs text-slate-300 mt-1">开始你的第一次费曼讲解吧</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Mic, FileText, BookOpen } from 'lucide-vue-next'

const router = useRouter()

const sessions = [
  {
    id: 'sess-001',
    topic: 'JavaScript 事件循环机制',
    date: '2026-06-03 14:30',
    score: 91,
    type: 'text' as const,
  },
  {
    id: 'sess-002',
    topic: 'HTTP 缓存策略详解',
    date: '2026-06-02 20:15',
    score: 85,
    type: 'voice' as const,
  },
  {
    id: 'sess-003',
    topic: 'Vue 3 响应式原理',
    date: '2026-06-01 09:45',
    score: 78,
    type: 'text' as const,
  },
  {
    id: 'sess-004',
    topic: 'CSS Grid 布局实战',
    date: '2026-05-31 16:20',
    score: 92,
    type: 'voice' as const,
  },
  {
    id: 'sess-005',
    topic: 'TypeScript 泛型深入',
    date: '2026-05-30 11:00',
    score: 73,
    type: 'text' as const,
  },
]

const avgScore = computed(() => {
  if (sessions.length === 0) return 0
  const sum = sessions.reduce((acc, s) => acc + s.score, 0)
  return Math.round(sum / sessions.length)
})

const voiceCount = computed(() =>
  sessions.filter((s) => s.type === 'voice').length
)

function getScoreColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#4F6EF7'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}
</script>
