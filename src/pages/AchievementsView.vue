<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">成就系统</h1>
        <p class="text-sm text-slate-500 mt-0.5">让坚持有反馈</p>
      </div>

      <!-- 等级进度横幅 -->
      <div class="rounded-2xl p-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white">
        <p class="text-xs font-medium text-white/80 mb-1">本周等级提升</p>
        <p class="text-xl font-bold mb-3">Lv.12 → Lv.13</p>
        <div class="w-full h-2.5 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
          <div class="h-full bg-white rounded-full transition-all duration-500" style="width: 70%" />
        </div>
        <p class="text-[11px] text-white/70 mt-1.5">还需 420 经验升级</p>
      </div>

      <!-- 徽章网格 2x2 -->
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="(badge, index) in badges"
          :key="index"
          class="bg-white rounded-2xl shadow-sm min-h-28 flex flex-col items-center justify-center gap-2 p-4 cursor-pointer active:scale-[0.97] transition-transform duration-150"
        >
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center border-2"
            :style="{ borderColor: badge.color + '40', backgroundColor: badge.color + '10' }"
          >
            <component :is="badge.icon" :size="24" :style="{ color: badge.color }" />
          </div>
          <p class="text-sm font-semibold text-slate-800 text-center">{{ badge.name }}</p>
        </div>
      </div>

      <!-- 积分统计卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-slate-800">积分总览</h3>
          <span class="text-xs text-slate-400">本季度</span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xl font-bold text-[#4F6EF7]">2,480</p>
            <p class="text-[11px] text-slate-400 mt-0.5">总积分</p>
          </div>
          <div>
            <p class="text-xl font-bold text-emerald-600">186</p>
            <p class="text-[11px] text-slate-400 mt-0.5">本月获得</p>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-500">Top 8%</p>
            <p class="text-[11px] text-slate-400 mt-0.5">排名</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, Award, Compass, CheckCircle } from 'lucide-vue-next'

const badges = [
  { name: '连续打卡 12 天', icon: X, color: '#F59E0B' },
  { name: '讲解达人', icon: Award, color: '#4F6EF7' },
  { name: '图谱探索者', icon: Compass, color: '#8B5CF6' },
  { name: '测验满分', icon: CheckCircle, color: '#10B981' },
]
</script>
