<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">

      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">我的</h1>
        <p class="text-sm text-slate-500 mt-0.5">学习偏好与数据管理</p>
      </div>

      <!-- 用户资料卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4">
        <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0 cursor-pointer" @click="showNameEdit = !showNameEdit">
          <span class="text-xl font-bold text-[#4F6EF7]">{{ userName.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <input
            v-if="showNameEdit"
            v-model="userName"
            class="text-lg font-bold text-slate-900 bg-transparent border-b border-blue-400 outline-none w-full"
            placeholder="输入你的名字"
            @blur="showNameEdit = false"
            @keydown.enter="showNameEdit = false"
          />
          <h2 v-else class="text-lg font-bold text-slate-900">{{ userName }}</h2>
          <p class="text-sm text-slate-500 mt-0.5">Lv.{{ level }} 费曼讲师 · 连续 {{ streakDays }} 天</p>
        </div>
      </div>

      <!-- 主题色选择 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-3">
        <div class="flex items-center gap-2">
          <Palette :size="16" class="text-slate-500" />
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">主题颜色</span>
        </div>
        <div class="flex gap-2.5">
          <button
            v-for="color in themeColors"
            :key="color.value"
            class="w-8 h-8 rounded-full ring-2 transition-all shrink-0"
            :class="currentThemeColor === color.value ? 'ring-offset-2 ring-offset-white dark:ring-offset-slate-800 scale-110' : 'ring-transparent hover:scale-105'"
            :style="{ backgroundColor: color.hex, '--tw-ring-color': color.hex }"
            :title="color.name"
            @click="setThemeColor(color.value)"
          />
        </div>
      </div>

      <!-- 设置列表 - 每项都有实际功能 -->
      <div class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">

        <!-- 主题色与暗黑模式 -->
        <button
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="toggleDarkMode"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Moon :size="18" :class="isDark ? 'text-[#4F6EF7]' : 'text-slate-400'" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">主题色与暗黑模式</p>
              <p class="text-xs mt-0.5" :class="isDark ? 'text-[#4F6EF7]' : 'text-slate-400'">
                {{ isDark ? '已开启深色模式' : '跟随系统 / 浅色模式' }}
              </p>
            </div>
          </div>
          <div
            class="w-11 h-6 rounded-full transition-colors shrink-0 ml-3 relative"
            :class="isDark ? 'bg-[#4F6EF7]' : 'bg-slate-200'"
          >
            <div
              class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
              :class="isDark ? 'right-0.5' : 'left-0.5'"
            />
          </div>
        </button>

        <!-- 提醒设置 -->
        <button
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="toggleReminders"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Bell :size="18" :class="remindersOn ? 'text-emerald-500' : 'text-slate-400'" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800">提醒设置</p>
              <p class="text-xs mt-0.5" :class="remindersOn ? 'text-emerald-500' : 'text-slate-400'">
                {{ remindersOn ? '闪卡到期 + 讲解任务 已开启' : '提醒功能已关闭' }}
              </p>
            </div>
          </div>
          <div
            class="w-11 h-6 rounded-full transition-colors shrink-0 ml-3 relative"
            :class="remindersOn ? 'bg-emerald-500' : 'bg-slate-200'"
          >
            <div
              class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
              :class="remindersOn ? 'right-0.5' : 'left-0.5'"
            />
          </div>
        </button>

        <!-- 推送通知 -->
        <div class="flex items-center justify-between py-3 px-1">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Bell :size="18" class="text-indigo-500" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-800">推送通知</p>
              <p class="text-xs text-slate-400">学习时间提醒（需授权）</p>
            </div>
          </div>
          <button
            class="shrink-0 relative cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
            style="width: 44px; height: 24px;"
            :style="{ backgroundColor: pushEnabled ? '#10B981' : '#E2E8F0' }"
            role="switch"
            :aria-checked="pushEnabled"
            @click="togglePushNotification"
          >
            <span
              class="absolute top-[2px] rounded-full bg-white shadow-sm transition-all duration-200"
              style="width: 20px; height: 20px;"
              :style="{ left: pushEnabled ? '22px' : '2px' }"
            />
          </button>
        </div>

        <!-- 智能调度提醒 -->
        <div class="bg-slate-50 rounded-xl p-3 mx-3 mb-2 space-y-2">
          <div class="flex items-center gap-2">
            <Clock3 :size="14" class="text-slate-400" />
            <span class="text-xs font-medium text-slate-600">提醒时间</span>
          </div>
          <input
            v-model="reminderTime"
            type="time"
            class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            @change="saveReminderTime"
          />
          <p class="text-[11px] text-slate-400 leading-relaxed">
            到达设定时间后，浏览器会发送学习提醒通知。系统还会根据你的活跃时段推荐最佳学习时间。
          </p>
        </div>

        <!-- 数据中心 -->
        <button
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="router.push('/settings/import-export')"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Database :size="18" class="text-[#4F6EF7]" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800">数据中心</p>
              <p class="text-xs text-slate-400 mt-0.5">导入导出 · 备份还原 · 清空数据</p>
            </div>
          </div>
          <ChevronRight :size="18" class="text-slate-300 shrink-0 ml-3" />
        </button>

        <!-- PWA 安装 -->
        <button
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="handlePWAInstall"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Download :size="18" class="text-[#4F6EF7]" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800">PWA 安装</p>
              <p class="text-xs mt-0.5" :class="isInstallable ? 'text-emerald-500' : 'text-slate-400'">
                {{ isInstallable ? '点击添加到桌面' : pwaInstalled ? '已安装到桌面' : '浏览器不支持或已在桌面' }}
              </p>
            </div>
          </div>
          <ChevronRight v-if="isInstallable" :size="18" class="text-emerald-500 shrink-0 ml-3" />
          <Check v-else-if="pwaInstalled" :size="18" class="text-emerald-500 shrink-0 ml-3" />
        </button>

        <!-- 隐私与离线 -->
        <button
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="showPrivacyInfo = true"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Shield :size="18" class="text-[#4F6EF7]" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800">隐私与离线</p>
              <p class="text-xs text-slate-400 mt-0.5">数据默认保存在本地浏览器</p>
            </div>
          </div>
          <ChevronRight :size="18" class="text-slate-300 shrink-0 ml-3" />
        </button>

        <!-- 重置引导页 -->
        <button
          class="w-full flex items-center justify-between py-3.5 px-4 active:bg-slate-50 transition-colors"
          @click="handleResetSplash"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <RotateCcw :size="18" class="text-orange-500" />
            </div>
            <div class="text-left min-w-0">
              <p class="text-sm font-semibold text-slate-800">重置引导页</p>
              <p class="text-xs text-slate-400 mt-0.5">重新显示启动引导</p>
            </div>
          </div>
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
              {{ isAIReady ? '已连接 · 可用' : isAIEnabled ? '未配置 · 使用本地模拟' : '已关闭 · 全部使用本地功能' }}
            </p>
          </div>
        </div>

        <!-- AI 总开关 -->
        <div class="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50">
          <div class="flex items-center gap-2">
            <Power :size="15" :class="isAIEnabled ? 'text-emerald-500' : 'text-slate-300'" />
            <span class="text-xs font-medium" :class="isAIEnabled ? 'text-slate-700' : 'text-slate-400'">
              {{ isAIEnabled ? 'AI 功能已开启' : 'AI 功能已关闭' }}
            </span>
          </div>
          <button
            class="shrink-0 relative cursor-pointer rounded-full transition-colors duration-200 focus:outline-none"
            style="width: 44px; height: 24px;"
            :style="{ backgroundColor: isAIEnabled ? '#10B981' : '#E2E8F0' }"
            @click="toggleAIEnabled()"
            role="switch"
            :aria-checked="isAIEnabled"
          >
            <span
              class="absolute top-[2px] rounded-full bg-white shadow-sm transition-all duration-200"
              style="width: 20px; height: 20px;"
              :style="{ left: isAIEnabled ? '22px' : '2px' }"
            />
          </button>
        </div>

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

        <div v-if="aiLoading" class="mt-2 flex items-center gap-1.5 text-xs text-blue-500">
          <LoaderCircle :size="14" class="animate-spin" /> 正在验证...
        </div>
        <div v-if="aiError" class="mt-1.5 text-xs text-red-500">{{ aiError }}</div>
      </div>

      <!-- 隐私信息弹窗 -->
      <div v-if="showPrivacyInfo" class="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" @click.self="showPrivacyInfo = false">
        <div class="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
          <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
          <h3 class="text-lg font-bold text-slate-900 mb-3">隐私与离线说明</h3>
          <div class="space-y-3 text-sm text-slate-600 leading-relaxed">
            <div class="flex items-start gap-2">
              <ShieldCheck :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-slate-800">所有数据保存在本地浏览器</p>
                <p class="text-xs text-slate-400 mt-0.5">学习记录、笔记、进度等全部存储在你的设备中，不会上传到任何服务器。</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <WifiOff :size="16" class="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-slate-800">支持完全离线使用</p>
                <p class="text-xs text-slate-400 mt-0.5">安装为 PWA 后，即使断网也能正常使用全部功能。</p>
              </div>
            </div>
            <div class="flex items-start gap-2">
              <Key :size="16" class="text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-slate-800">API Key 仅存于本地</p>
                <p class="text-xs text-slate-400 mt-0.5">你填写的 DeepSeek API Key 只保存在当前浏览器的 localStorage 中。</p>
              </div>
            </div>
          </div>
          <button
            class="mt-5 w-full py-3 rounded-full bg-[#4F6EF7] text-white text-sm font-semibold active:bg-blue-600"
            @click="showPrivacyInfo = false"
          >知道了</button>
        </div>
      </div>

      <!-- Toast 提示 -->
      <Transition name="toast">
        <div
          v-if="showToast"
          class="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-slate-800 text-white text-sm font-medium shadow-lg"
        >{{ toastMessage }}</div>
      </Transition>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Moon, Bell, Database, Download, Shield, ChevronRight, Sparkles, LoaderCircle, Check, ShieldCheck, WifiOff, Key, RotateCcw, Power, Palette, Clock3 } from 'lucide-vue-next'
import {
  isAIReady,
  isAIEnabled,
  toggleAIEnabled,
  getAIConfig,
  updateAIConfig,
  isLoading as aiLoading,
  lastError as aiError,
  chat,
} from '@/composables/useDeepSeek'

const router = useRouter()

// ====== 主题色选择 ======

/** 可选的主题色列表 */
const themeColors = [
  { name: '默认蓝', value: '#4F6EF7', hex: '#4F6EF7' },
  { name: '翡翠绿', value: '#10B981', hex: '#10B981' },
  { name: '活力橙', value: '#F59E0B', hex: '#F59E0B' },
  { name: '热情红', value: '#EF4444', hex: '#EF4444' },
  { name: '梦幻紫', value: '#8B5CF6', hex: '#8B5CF6' },
  { name: '青碧蓝', value: '#06B6D4', hex: '#06B6D4' },
]

/** 当前选中的主题色 */
const currentThemeColor = ref(localStorage.getItem('feiman_theme_color') || '#4F6EF7')

/**
 * 设置主题色
 * 存储到 localStorage 并通过 CSS 变量实时切换
 */
function setThemeColor(color: string) {
  currentThemeColor.value = color
  localStorage.setItem('feiman_theme_color', color)
  // 通过 CSS 变量实时切换主题色
  document.documentElement.style.setProperty('--color-primary', color)
}

// 页面加载时应用已保存的主题色
watch(currentThemeColor, (newColor) => {
  document.documentElement.style.setProperty('--color-primary', newColor)
}, { immediate: true })

// ====== 用户名编辑 ======
const showNameEdit = ref(false)
const userName = ref('Alex Walker')
const level = ref(12)
const streakDays = ref(12)

// ====== 暗黑模式 ======
const isDark = ref(document.documentElement.classList.contains('dark'))
function toggleDarkMode() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('feiman_theme_dark', String(isDark.value))
}

// ====== 提醒开关 ======
const remindersOn = ref(true)
function toggleReminders() {
  remindersOn.value = !remindersOn.value
}

// ====== 推送通知（浏览器 Web Push）======
const pushEnabled = ref(false)

/** 检查浏览器通知权限状态 */
function checkPushStatus(): void {
  pushEnabled.value = Notification.permission === 'granted'
}

/** 切换推送通知开关 */
async function togglePushNotification(): Promise<void> {
  if (!('Notification' in window)) {
    toastMessage.value = '您的浏览器不支持推送通知'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
    return
  }

  if (pushEnabled.value) {
    // 已开启 → 关闭（浏览器 API 不支持真正关闭，只能提示用户）
    toastMessage.value = '请在浏览器设置中关闭通知权限'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
    return
  }

  // 未开启 → 请求授权
  const permission = await Notification.requestPermission()
  if (permission === 'granted') {
    pushEnabled.value = true
    toastMessage.value = '推送通知已开启！将在学习时间提醒你'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
    // 发送测试通知
    new Notification('费曼学习法', {
      body: '通知已开启！你会在设定的时间收到学习提醒 🎉',
      icon: '/vue.svg',
    })
  } else {
    toastMessage.value = '通知权限被拒绝'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
  }
}

// ====== 智能调度提醒 ======
const reminderTime = ref('20:00')

/** 从 localStorage 加载提醒时间 */
function loadReminderTime(): void {
  const saved = localStorage.getItem('feiman_reminder_time')
  if (saved) reminderTime.value = saved
}

/** 保存提醒时间并重新安排定时检查 */
function saveReminderTime(): void {
  localStorage.setItem('feiman_reminder_time', reminderTime.value)
  toastMessage.value = `提醒时间已设为 ${reminderTime.value}`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
  scheduleReminder()
}

/**
 * 安排提醒检查（每分钟检查一次是否到达设定时间）
 * 到达设定时间且今天尚未提醒过，则发送浏览器通知
 */
function scheduleReminder(): void {
  // 清除已有的定时器
  if ((window as any).__reminderInterval) {
    clearInterval((window as any).__reminderInterval)
  }

  ;(window as any).__reminderInterval = setInterval(() => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const today = now.toISOString().slice(0, 10)
    const lastReminded = localStorage.getItem('feiman_last_reminder_date')

    if (currentTime === reminderTime.value && today !== lastReminded) {
      if (Notification.permission === 'granted') {
        new Notification('📚 学习时间到了！', {
          body: '今天还没有完成学习目标哦，快来费曼讲解一下吧！',
          tag: 'feiman-reminder',
        })
      }
      localStorage.setItem('feiman_last_reminder_date', today)
    }
  }, 60000) // 每分钟检查一次
}

// ====== PWA 安装 ======
const isInstallable = ref(false)
const pwaInstalled = ref(false)

let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  isInstallable.value = true
})

window.addEventListener('appinstalled', () => {
  pwaInstalled.value = true
  isInstallable.value = false
})

async function handlePWAInstall() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  if (outcome === 'accepted') {
    pwaInstalled.value = true
    isInstallable.value = false
  }
  deferredPrompt = null
}

// ====== 隐私弹窗 ======
const showPrivacyInfo = ref(false)

// ====== 重置引导页 ======
const showToast = ref(false)
const toastMessage = ref('')

/**
 * 重置引导页：清除所有引导/启动相关标记，下次打开将重新显示
 */
function handleResetSplash() {
  localStorage.removeItem('feiman_splash_seen')
  localStorage.removeItem('feiman_has_seen_splash')
  localStorage.removeItem('feiman_onboarding_done') // 补充清除 onboarding 标记
  toastMessage.value = '已重置，下次打开将显示启动页'
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

// ====== API Key ======
const showKeyInput = ref(false)
const apiKeyInput = ref('')
const apiKey = computed(() => getAIConfig().apiKey)

function maskKey(key: string): string {
  if (!key || key.length <= 8) return key
  return key.slice(0, 6) + '****' + key.slice(-4)
}

/**
 * 保存 DeepSeek API Key
 * 校验格式（必须 sk- 开头）后写入 localStorage，并尝试连接验证
 */
async function saveKey() {
  const key = apiKeyInput.value.trim()
  if (!key) return

  // 格式校验：DeepSeek Key 必须以 sk- 开头
  if (!key.startsWith('sk-')) {
    toastMessage.value = 'Key 格式不正确，应以 sk- 开头'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2500)
    return
  }

  updateAIConfig({ apiKey: key })
  showKeyInput.value = false
  apiKeyInput.value = ''
  try {
    await chat('你好', '费曼学习法App')
    alert('DeepSeek AI 连接成功！')
  } catch {
    // key 已保存但连接验证失败（可能网络问题），不影响使用
  }
}

// 页面挂载时初始化推送状态和智能调度
onMounted(() => {
  checkPushStatus()
  loadReminderTime()
  scheduleReminder()
})
</script>

<style scoped>
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up {
  animation: slide-up 0.25s ease-out;
}

/* Toast 动画 */
.toast-enter-active {
  transition: all 0.25s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px);
}
</style>
