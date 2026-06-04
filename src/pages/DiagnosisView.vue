<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900">知识缺口诊断</h1>
        <p class="text-sm text-slate-500 mt-0.5">AI 根据讲解发现薄弱点</p>
      </div>

      <!-- 评分卡片 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-6">
        <!-- 左侧评分 -->
        <div class="flex-shrink-0 text-center">
          <p class="text-xs text-slate-500 mb-1">讲解评分</p>
          <div class="flex items-baseline justify-center gap-0.5">
            <span class="text-5xl font-black text-[#4F6EF7] tabular-nums">{{ diagnosis.score }}</span>
            <span class="text-lg text-slate-400 font-medium">/100</span>
          </div>
        </div>

        <!-- 右侧雷达图 -->
        <div class="flex-1 min-w-0">
          <svg viewBox="0 0 200 180" class="w-full h-auto">
            <!-- 五边形背景网格 -->
            <polygon
              points="100,15 175,65 155,150 45,150 25,65"
              fill="none"
              stroke="#E2E8F0"
              stroke-width="1"
            />
            <polygon
              points="100,40 145,75 132,135 68,135 55,75"
              fill="none"
              stroke="#E2E8F0"
              stroke-width="1"
            />
            <polygon
              points="100,65 115,85 110,120 90,120 85,85"
              fill="none"
              stroke="#E2E8F0"
              stroke-width="1"
            />

            <!-- 数据多边形 -->
            <polygon
              :points="radarPoints"
              fill="#4F6EF720"
              stroke="#4F6EF7"
              stroke-width="2"
            />

            <!-- 轴线 -->
            <line v-for="(axis, i) in radarAxes" :key="'axis-' + i" x1="100" y1="88" :x2="axis.x" :y2="axis.y" stroke="#E2E8F0" stroke-width="0.5" />

            <!-- 顶点标签 -->
            <text v-for="(label, i) in radarLabels" :key="'label-' + i" :x="label.x" :y="label.y" class="text-[9px]" fill="#94A3B8" text-anchor="middle">{{ label.text }}</text>
          </svg>
        </div>
      </div>

      <!-- 缺口列表 -->
      <div class="space-y-3">
        <div
          v-for="(gap, idx) in diagnosis.gaps"
          :key="idx"
          class="bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3"
        >
          <!-- 状态圆点 -->
          <span
            class="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
            :class="{
              'bg-red-500': gap.priority === 'high',
              'bg-orange-500': gap.priority === 'medium',
              'bg-blue-500': gap.priority === 'low',
            }"
          />
          <!-- 内容 -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-slate-800 leading-snug">{{ gap.text }}</p>
          </div>
          <!-- 优先级标签 -->
          <span
            class="shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
            :class="{
              'bg-red-50 text-red-600': gap.priority === 'high',
              'bg-orange-50 text-orange-600': gap.priority === 'medium',
              'text-blue-600': gap.priority === 'low',
            }"
          >
            {{ priorityLabels[gap.priority] }}
          </span>
        </div>
      </div>

      <!-- CTA 按钮 -->
      <button
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150"
        @click="router.push('/review/cards')"
      >
        一键生成补救任务
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { mockSessions } from '@/utils/mock'

const router = useRouter()
const diagnosis = mockSessions[0]

const priorityLabels: Record<string, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '建议补充',
}

// 雷达图数据（5轴：清晰度、完整性、准确性、逻辑性、表达力）
const radarData = [82, 60, 78, 85, 70]
const center = { x: 100, y: 88 }
const maxRadius = 73

const radarAxes = [
  { x: 100, y: 15 },
  { x: 175, y: 65 },
  { x: 155, y: 150 },
  { x: 45, y: 150 },
  { x: 25, y: 65 },
]

const radarLabels = [
  { x: 100, y: 10, text: '清晰度' },
  { x: 182, y: 68, text: '完整性' },
  { x: 162, y: 160, text: '准确性' },
  { x: 38, y: 160, text: '逻辑性' },
  { x: 18, y: 68, text: '表达力' },
]

const radarPoints = computed(() => {
  return radarData.map((val, i) => {
    const angle = (Math.PI / 2) + ((2 * Math.PI * i) / 5)
    const r = (val / 100) * maxRadius
    const x = center.x + r * Math.cos(angle)
    const y = center.y - r * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
})
</script>
