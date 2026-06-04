<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900">今日计划</h1>
        <p class="text-sm text-slate-500 mt-0.5">AI 按优先级安排学习任务</p>
      </div>

      <!-- 周历头部 -->
      <div class="space-y-2">
        <!-- 星期行 -->
        <div class="flex justify-between px-1">
          <span
            v-for="(day, i) in weekDays"
            :key="'day-name-' + i"
            class="text-xs font-medium text-slate-400 w-9 text-center"
          >
            {{ day }}
          </span>
        </div>
        <!-- 日期行 -->
        <div class="flex justify-between px-1">
          <button
            v-for="(dateNum, i) in weekDates"
            :key="'day-date-' + i"
            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors cursor-pointer"
            :class="isSelectedDay(i) ? 'bg-[#4F6EF7] text-white' : 'text-slate-700 hover:bg-slate-100'"
            @click="selectDay(i)"
          >
            {{ dateNum }}
          </button>
        </div>
      </div>

      <!-- 任务时间线列表 -->
      <div class="space-y-4">
        <div
          v-for="(task, idx) in plan.tasks"
          :key="task.id"
          class="flex gap-3"
        >
          <!-- 时间标签 -->
          <span class="w-12 text-sm text-slate-400 font-medium shrink-0 pt-2 text-right">
            {{ task.time }}
          </span>
          <!-- 任务卡片 -->
          <div class="flex-1 bg-white rounded-2xl shadow-sm p-4 border-l-4" :class="taskBorderColor(task)">
            <p class="text-sm font-bold text-slate-900 leading-snug">{{ task.title }}</p>
            <p class="text-xs mt-1 font-medium" :class="taskTagColor(task)">
              {{ taskTagText(task) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 自动排程规则面板 -->
      <div class="bg-yellow-50 rounded-2xl p-4 space-y-1">
        <p class="text-sm font-semibold text-amber-600">自动排程规则</p>
        <p class="text-xs text-slate-600 leading-relaxed">
          优先安排遗忘风险高、评分低、即将考试相关的内容。高优先级任务自动靠前，确保核心知识点不被遗漏。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { mockDailyPlans } from '@/utils/mock'
import type { PlanTask } from '@/types/plan'

const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const weekDates = [1, 2, 3, 4, 5, 6, 7]
const selectedDayIndex: Ref<number> = ref(3) // 周四

function isSelectedDay(i: number): boolean {
  return i === selectedDayIndex.value
}

function selectDay(i: number) {
  selectedDayIndex.value = i
}

const plan = ref(mockDailyPlans[0])

function taskBorderColor(task: PlanTask): string {
  switch (task.type) {
    case 'flashcard': return 'border-emerald-500'
    case 'explain': return 'border-[#4F6EF7]'
    case 'remediation': return 'border-red-500'
    default: return 'border-slate-300'
  }
}

function taskTagColor(task: PlanTask): string {
  switch (task.type) {
    case 'flashcard': return 'text-emerald-600'
    case 'explain': return 'text-[#4F6EF7]'
    case 'remediation': return 'text-red-500'
    default: return 'text-slate-500'
  }
}

function taskTagText(task: PlanTask): string {
  switch (task.type) {
    case 'flashcard': return '到期复习'
    case 'explain': return '8分钟训练'
    case 'remediation': return '高优先级'
    default: return ''
  }
}
</script>
