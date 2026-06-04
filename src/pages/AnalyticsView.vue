<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">学习分析</h1>
        <p class="text-sm text-slate-500 mt-0.5">多维度追踪理解质量</p>
      </div>

      <!-- 指标网格 2x2 -->
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(metric, index) in metrics"
          :key="index"
          class="bg-white rounded-2xl shadow-sm p-4"
        >
          <p class="text-xs text-slate-400 mb-1">{{ metric.label }}</p>
          <div class="flex items-baseline gap-2">
            <span
              class="text-2xl font-bold tabular-nums"
              :class="metric.valueClass"
            >{{ metric.value }}</span>
            <span
              class="text-xs font-medium flex items-center gap-0.5"
              :class="metric.trend > 0 ? 'text-emerald-600' : 'text-red-500'"
            >
              {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
              <TrendingUp v-if="metric.trend > 0" :size="12" />
              <TrendingDown v-else :size="12" />
            </span>
          </div>
        </div>
      </div>

      <!-- 热力日历 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <h2 class="text-base font-bold text-slate-800 mb-4">热力日历</h2>
        <div class="grid grid-cols-7 gap-1.5">
          <div
            v-for="(cell, index) in heatmapCells"
            :key="index"
            class="w-full aspect-square rounded-sm"
            :class="cell.color"
            :title="`第 ${index + 1} 天 · ${cell.level} 次活动`"
          />
        </div>
        <!-- 图例 -->
        <div class="flex items-center justify-end gap-1.5 mt-3">
          <span class="text-[10px] text-slate-400">少</span>
          <div class="w-3 h-3 rounded-sm bg-slate-100" />
          <div class="w-3 h-3 rounded-sm bg-blue-200" />
          <div class="w-3 h-3 rounded-sm bg-blue-300" />
          <div class="w-3 h-3 rounded-sm bg-blue-400" />
          <div class="w-3 h-3 rounded-sm bg-blue-600" />
          <span class="text-[10px] text-slate-400">多</span>
        </div>
      </div>

      <!-- 本月建议 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Lightbulb :size="20" class="text-amber-500" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-800">本月建议</h3>
            <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
              你在「被动阅读」上耗时较多，建议增加讲解和练习的比重。尝试每天用 10 分钟把学到的概念用自己的话讲出来，理解深度可提升约 30%。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-vue-next'

const metrics = [
  { label: '掌握率', value: '68%', valueClass: 'text-[#4F6EF7]', trend: 12 },
  { label: '遗忘风险', value: '中', valueClass: 'text-amber-500', trend: -8 },
  { label: '讲解清晰', value: '84', valueClass: 'text-emerald-600', trend: 9 },
  { label: '薄弱点', value: '17', valueClass: 'text-red-500', trend: -5 },
]

// 生成 35 个热力格子 (5周 x 7天)
const heatmapCells = computed(() => {
  const levels = [0, 1, 2, 3, 4]
  const colors = ['bg-slate-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-600']
  // 模拟活动分布：越近越活跃
  const pattern = [
    0, 1, 0, 2, 1, 0, 0,
    1, 2, 1, 3, 2, 1, 1,
    2, 3, 2, 4, 3, 2, 1,
    3, 4, 3, 4, 4, 3, 2,
    4, 4, 3, 4, 4, 4, 3,
  ]
  return pattern.map((level) => ({
    level,
    color: colors[level],
  }))
})
</script>
