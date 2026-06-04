<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">我的</h1>
        <p class="text-sm text-slate-500 mt-0.5">学习偏好与数据管理</p>
      </div>

      <!-- 用户资料卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <span class="text-xl font-bold text-[#4F6EF7]">A</span>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-bold text-slate-900">Alex Walker</h2>
          <p class="text-sm text-slate-500 mt-0.5">Lv.12 费曼讲师 · 连续 12 天</p>
        </div>
      </div>

      <!-- 设置列表 -->
      <div class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
        <button
          v-for="(item, index) in settingsItems"
          :key="index"
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="handleSettingClick(item.route)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <component :is="item.icon" :size="18" class="text-[#4F6EF7]" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800">{{ item.title }}</p>
              <p class="text-xs text-slate-400 mt-0.5 truncate">{{ item.desc }}</p>
            </div>
          </div>
          <ChevronRight :size="18" class="text-slate-300 shrink-0 ml-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Moon, Bell, Database, Download, Shield, ChevronRight } from 'lucide-vue-next'

const router = useRouter()

const settingsItems = [
  {
    icon: Moon,
    title: '主题色与暗黑模式',
    desc: '跟随系统 / 手动切换',
    route: '/settings/theme',
  },
  {
    icon: Bell,
    title: '提醒设置',
    desc: '到时闪卡、讲解任务',
    route: '/settings/notifications',
  },
  {
    icon: Database,
    title: '数据中心',
    desc: '备份、还原、清空数据',
    route: '/settings/import-export',
  },
  {
    icon: Download,
    title: 'PWA 安装',
    desc: '添加到手机桌面',
    route: '/settings/pwa',
  },
  {
    icon: Shield,
    title: '隐私与离线',
    desc: '数据默认保存在本地',
    route: '/settings/privacy',
  },
]

function handleSettingClick(route: string) {
  router.push(route)
}
</script>
