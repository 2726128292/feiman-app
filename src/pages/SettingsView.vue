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

      <!-- DeepSeek AI 配置卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
            <Sparkles :size="18" class="text-white" />
          </div>
          <div>
            <p class="text-sm font-semibold text-slate-800">DeepSeek AI 助手</p>
            <p class="text-xs" :class="isAIReady ? 'text-emerald-500' : 'text-slate-400'">
              {{ isAIReady ? '已连接 · 可用' : '未配置 · 使用本地模拟' }}
            </p>
          </div>
        </div>

        <!-- API Key 输入区 -->
        <div v-if="!showKeyInput" class="flex items-center gap-2">
          <div
            class="flex-1 px-3 py-2 rounded-xl text-xs font-mono truncate"
            :class="isAIReady ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'"
          >
            {{ isAIReady ? maskKey(apiKey) : 'sk-xxxxxxxxxxxxxxxx' }}
          </div>
          <button
            class="px-3 py-2 rounded-xl text-xs font-medium bg-[#4F6EF7] text-white active:bg-blue-600 shrink-0"
            @click="showKeyInput = true"
          >
            {{ isAIReady ? '修改' : '配置' }}
          </button>
        </div>

        <div v-else class="space-y-2.5">
          <input
            v-model="apiKeyInput"
            type="password"
            placeholder="输入 DeepSeek API Key (sk-...)"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            @keydown.enter="saveKey"
          />
          <div class="flex items-center gap-2">
            <button
              class="flex-1 px-3 py-2 rounded-xl text-xs font-medium bg-[#4F6EF7] text-white active:bg-blue-600"
              :disabled="!apiKeyInput.trim()"
              :class="{ 'opacity-50': !apiKeyInput.trim() }"
              @click="saveKey"
            >
              保存并连接
            </button>
            <button
              class="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-600 active:bg-slate-200"
              @click="showKeyInput = false; apiKeyInput = ''"
            >
              取消
            </button>
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed">
            获取 Key：打开 <a href="https://platform.deepseek.com/" target="_blank" class="text-[#4F6EF7] underline" rel="noopener">platform.deepseek.com</a> → 登录 → API Keys → 创建
          </p>
        </div>

        <!-- 连接状态提示 -->
        <div v-if="aiLoading" class="mt-2 flex items-center gap-1.5 text-xs text-blue-500">
          <LoaderCircle :size="14" class="animate-spin" /> 正在验证...
        </div>
        <div v-if="aiError" class="mt-1.5 text-xs text-red-500">{{ aiError }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Moon, Bell, Database, Download, Shield, ChevronRight, Sparkles, LoaderCircle } from 'lucide-vue-next'
import {
  isAIReady,
  getAIConfig,
  updateAIConfig,
  clearAPIKey,
  isLoading as aiLoading,
  lastError as aiError,
  chat,
} from '@/composables/useDeepSeek'

const router = useRouter()

// API Key 管理状态
const showKeyInput = ref(false)
const apiKeyInput = ref('')
const apiKey = computed(() => getAIConfig().apiKey)

function maskKey(key: string): string {
  if (!key || key.length <= 8) return key
  return key.slice(0, 6) + '****' + key.slice(-4)
}

async function saveKey() {
  if (!apiKeyInput.value.trim()) return

  // 先保存 Key
  updateAIConfig({ apiKey: apiKeyInput.value.trim() })
  showKeyInput.value = false
  apiKeyInput.value = ''

  // 验证连接（发送一条测试消息）
  try {
    await chat('你好，这是一条连接测试', '费曼学习法App')
    alert('✅ DeepSeek AI 连接成功！')
  } catch (e) {
    // 验证失败但 key 已保存，用户可以稍后重试
    console.error('API验证失败:', e)
  }
}

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
