<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900">项目实践</h1>
        <p class="text-sm text-slate-500 mt-0.5">用作品验证理解</p>
      </div>

      <!-- 主项目卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <span class="text-xs font-medium text-slate-400">实战任务</span>
        <p class="text-lg font-bold text-slate-900 leading-snug">{{ project.title }}</p>
      </div>

      <!-- 子任务清单 -->
      <div class="space-y-3">
        <div
          v-for="subTask in project.subTasks"
          :key="subTask.id"
          class="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-4"
        >
          <!-- 复选圆圈 -->
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors"
            :class="subTask.completed ? 'bg-emerald-500' : 'bg-slate-100 hover:bg-slate-200'"
            @click="toggleSubtask(subTask.id)"
          >
            <svg
              v-if="subTask.completed"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-3.5 h-3.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <!-- 任务文本 -->
          <span
            class="text-sm font-medium leading-snug"
            :class="subTask.completed ? 'text-slate-900' : 'text-slate-600'"
          >
            {{ subTask.text }}
          </span>
        </div>
      </div>

      <!-- 提交按钮 -->
      <button
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150"
        @click="handleSubmit"
      >
        提交作品并复盘
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mockProjects } from '@/utils/mock'

const project = ref(mockProjects[0])

function handleSubmit() {
  const completedCount = project.value.subTasks.filter(s => s.completed).length
  const totalCount = project.value.subTasks.length
  if (completedCount < totalCount) {
    alert(`还有 ${totalCount - completedCount} 个子任务未完成，请继续加油！`)
  } else {
    alert('🎉 作品已提交！AI 将为你生成复盘报告。')
  }
}

function toggleSubtask(id: string) {
  const subTask = project.value.subTasks.find(s => s.id === id)
  if (subTask) subTask.completed = !subTask.completed
}
</script>
