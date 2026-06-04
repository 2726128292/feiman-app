<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">导入 / 导出</h1>
        <p class="text-sm text-slate-500 mt-0.5">TXT、Word、JSON 数据互通</p>
      </div>

      <!-- 格式卡片列表 -->
      <div class="space-y-3">
        <div
          v-for="(format, index) in formatCards"
          :key="index"
          class="bg-white rounded-2xl shadow-sm p-4 flex items-start gap-3 cursor-pointer active:scale-[0.98] transition-transform duration-150"
          @click="handleFormatClick(format.type)"
        >
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold shrink-0 h-fit"
            :class="format.badgeClass"
          >
            {{ format.badge }}
          </span>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-semibold text-slate-800">{{ format.title }}</h3>
            <p class="text-xs text-slate-400 mt-1 leading-relaxed">{{ format.desc }}</p>
          </div>
        </div>
      </div>

      <!-- 安全策略提示卡片 -->
      <div class="bg-blue-50 rounded-2xl p-4">
        <div class="flex items-start gap-3">
          <ShieldCheck :size="20" class="text-[#4F6EF7] shrink-0 mt-0.5" />
          <div>
            <h3 class="text-sm font-semibold text-[#4F6EF7]">安全策略</h3>
            <p class="text-xs text-slate-600/80 mt-1 leading-relaxed">
              导入前预览差异，支持回滚到上一次备份。
            </p>
          </div>
        </div>
        <p v-if="exportStatus" class="mt-2 text-xs text-emerald-600 font-medium">{{ exportStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'

const exportStatus = ref('')

const formatCards = [
  {
    badge: 'TXT',
    badgeClass: 'bg-blue-100 text-blue-700',
    title: 'TXT 导入',
    desc: '自定义标记解析，支持转义',
    type: 'txt',
  },
  {
    badge: 'DOC',
    badgeClass: 'bg-pink-100 text-pink-700',
    title: 'Word 导出',
    desc: 'HTML → .doc，零依赖生成',
    type: 'doc',
  },
  {
    badge: 'JSON',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    title: 'JSON 备份',
    desc: '完整 localStorage 数据备份',
    type: 'json',
  },
  {
    badge: 'ZIP',
    badgeClass: 'bg-amber-100 text-amber-700',
    title: '批量迁移',
    desc: '多主题压缩包导入导出',
    type: 'zip',
  },
]

function handleFormatClick(type: string) {
  const actions: Record<string, () => void> = {
    txt: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.txt'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) exportStatus.value = `已选择文件：${file.name}`
      }
      input.click()
    },
    doc: () => {
      exportStatus.value = '正在生成 Word 文档...'
      setTimeout(() => { exportStatus.value = 'Word 文档已生成（演示模式）' }, 1500)
    },
    json: () => {
      const data = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('feiman_')) {
          data[key] = JSON.parse(localStorage.getItem(key) || '{}')
        }
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `feiman-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      exportStatus.value = 'JSON 备份已下载'
    },
    zip: () => {
      exportStatus.value = '批量迁移功能需要额外依赖，当前使用 JSON 备份替代'
    },
  }
  ;(actions[type] ?? (() => { exportStatus.value = '未知格式' }))()
}
</script>
