<template>
  <div class="app-root" :class="{ 'desktop-layout': isDesktop }">
    <!-- 全局 Toast 通知 -->
    <Toast :toasts="toasts" @close="closeToast" />
    <OfflineBanner />
    <!-- 首次使用引导 -->
    <OnboardingGuide />

    <!-- 桌面端固定侧边导航栏（>=1024px 时显示） -->
    <aside
      v-if="isDesktop"
      class="fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 z-50 hidden lg:flex flex-col"
    >
      <div class="p-5 border-b border-slate-100">
        <h1 class="text-lg font-bold text-[#4F6EF7]">费曼学习法</h1>
        <p class="text-[11px] text-slate-400 mt-0.5">把知识讲明白</p>
      </div>
      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <button
          v-for="(tab, i) in desktopTabs"
          :key="tab.path"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :class="currentPath.startsWith(tab.path) ? 'bg-blue-50 text-[#4F6EF7]' : 'text-slate-600 hover:bg-slate-50'"
          @click="$router.push(tab.path)"
        >
          <component :is="tab.icon" :size="18" />
          {{ tab.label }}
        </button>
      </nav>
      <div class="p-3 border-t border-slate-100">
        <button
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors"
          @click="$router.push('/settings')"
        >
          <Settings :size="18" /> 设置
        </button>
      </div>
    </aside>

    <!-- 主内容区（桌面端时左边距 240px = w-60） -->
    <div :class="isDesktop ? 'lg:ml-60' : ''">
      <AppLayout :current-tab="currentTab" :is-desktop="isDesktop" @update:tab="onTabChange">
        <router-view v-slot="{ Component }">
          <Suspense timeout="0">
            <template #default>
              <transition
                :name="transitionName"
                mode="out-in"
                @before-leave="onBeforeLeave"
                @after-enter="onAfterEnter"
              >
                <component :is="Component" :key="route.path" />
              </transition>
            </template>
            <template #fallback>
              <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-10 h-10 rounded-full animate-spin" style="border: 3px solid rgba(79,110,247,0.2); border-top-color: #4F6EF7;" />
                  <span class="text-sm text-slate-400">加载中...</span>
                </div>
              </div>
            </template>
          </Suspense>
        </router-view>
      </AppLayout>
    </div>

    <!-- 快捷键帮助面板（Overlay） -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showShortcutHelp"
          class="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-5"
          @click.self="showShortcutHelp = false"
        >
          <div class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 class="text-lg font-bold text-slate-800 mb-4">⌨️ 键盘快捷键</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">聚焦搜索</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">Ctrl K</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">加粗</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">Ctrl B</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">斜体</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">Ctrl I</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">保存</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">Ctrl S</kbd>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-600">显示帮助</span>
                <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">?</kbd>
              </div>
            </div>
            <button
              class="mt-5 w-full py-2.5 rounded-xl bg-slate-100 text-sm text-slate-600 font-medium hover:bg-slate-200 transition-colors"
              @click="showShortcutHelp = false"
            >关闭</button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 全局快捷创建闪卡按钮 -->
    <QuickCardFab />

    <!-- PWA 安装引导 -->
    <PWAPrompt />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, provide, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Home, BookOpen, Mic, Layers, User, Settings } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import Toast from '@/components/common/Toast.vue'
import OfflineBanner from '@/components/common/OfflineBanner.vue'
import OnboardingGuide from '@/components/common/OnboardingGuide.vue'
import QuickCardFab from '@/components/common/QuickCardFab.vue'
import PWAPrompt from '@/components/common/PWAPrompt.vue'
import { useToast } from '@/composables/useToast'
import { useAutoBackup } from '@/composables/useAutoBackup'
import { runMigrations } from '@/composables/useMigration'
import { useAppStore } from '@/stores/app'
import { startPerformanceMonitor } from '@/composables/usePerformance'

const router = useRouter()
const route = useRoute()
const { hasSeenSplash, markSplashSeen } = useAppStore()

// 初始化全局 Toast
const { showToast, toasts, closeToast } = useToast()

// 初始化自动备份
const autoBackup = useAutoBackup()

// 通过 provide 注入，让子组件也能调用 showToast
provide('toast', showToast)
const currentTab = ref(0)

// ==================== 页面转场动画（功能1） ====================

/** 当前过渡动画名称 */
const transitionName = ref('page-fade')

/** 上一次路由路径，用于判断导航方向 */
let prevPath = ''

/**
 * 根据路由变化更新过渡动画名称
 * - 进入子页面（深度增加）：slide-left（从右滑入）
 * - 返回父页面（深度减少）：slide-right（从左滑入）
 * - 同级切换：page-fade（淡入淡出）
 */
function updateTransition(to: string): void {
  const from = prevPath || '/'
  const toDepth = getDepth(to)
  const fromDepth = getDepth(from)

  if (toDepth > fromDepth) {
    transitionName.value = 'slide-left'   // 进入子页面：从右滑入
  } else if (toDepth < fromDepth) {
    transitionName.value = 'slide-right'  // 返回父页面：从左滑入
  } else {
    transitionName.value = 'page-fade'    // 同级切换：淡入淡出
  }

  prevPath = to
}

/** 获取路由层级深度 */
function getDepth(path: string): number {
  const depths: Record<string, number> = {
    '/': 0,
    '/paths': 1, '/explain': 1, '/review': 1, '/square': 1, '/ai': 1,
    '/plan': 1, '/graph': 1, '/project': 1, '/profile': 1, '/settings': 1,
  }
  // 子路由深度+1（如 /paths/:id, /explain/new 等）
  if (depths[path] !== undefined) return depths[path]
  return 2
}

/** 过渡离开前回调 */
function onBeforeLeave(): void {
  // 可在此处添加页面离开前的逻辑（如保存状态）
}

/** 过渡进入后回调 */
function onAfterEnter(): void {
  // 可在此处添加页面进入后的逻辑（如滚动到顶部）
}

// 监听路由路径变化，动态更新过渡动画
watch(() => route.path, (newPath) => {
  updateTransition(newPath)
}, { immediate: true })

// Tab 路由映射
const tabRoutes = ['/home', '/paths', '/explain', '/review/cards', '/settings']

// 点击底部导航栏时切换路由
function onTabChange(index: number) {
  currentTab.value = index
  router.push(tabRoutes[index])
}

// 根据路由meta.tab更新底部导航高亮
watch(() => route.path, (path) => {
  const matched = router.getRoutes().find(r => r.path === path || (r.path.includes(':') && path.startsWith(r.path.split('/:')[0])))
  if (matched?.meta?.tab !== undefined) {
    currentTab.value = matched.meta.tab as number
  }
}, { immediate: true })

onMounted(() => {
  if (!hasSeenSplash.value) {
    router.replace('/splash')
  }

  // ====== 功能23：启动性能监控 ======
  startPerformanceMonitor()

  // 功能8：执行数据版本迁移
  const migrationResult = runMigrations()
  if (migrationResult.executed > 0) {
    console.log(`已执行 ${migrationResult.executed} 项数据迁移`)
  }

  // 功能6：检查并执行自动备份
  autoBackup.checkAndBackup()

  // 功能7：存储健康检查
  checkStorageHealth()
})

/**
 * 存储健康检查（功能7）
 * 检测存储空间使用情况和数据完整性
 */
function checkStorageHealth(): void {
  // 1. 检测关键数据是否存在
  const criticalKeys = ['feiman_sessions', 'feiman_topics']
  let totalSize = 0

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      totalSize += (localStorage.getItem(key) || '').length
    }
  }

  // 2. 如果总数据超过 4MB（接近浏览器 localStorage 5MB 限制），发出警告
  if (totalSize > 4 * 1024 * 1024) {
    const warned = sessionStorage.getItem('feiman_storage_warned')
    if (!warned) {
      showToast('存储空间即将满载，建议导出备份数据', 'warning')
      sessionStorage.setItem('feiman_storage_warned', 'true')
    }
  }

  // 3. 检测数据损坏（JSON 解析失败）
  const corruptedKeys: string[] = []
  for (const key of criticalKeys) {
    try {
      JSON.parse(localStorage.getItem(key) || 'null')
    } catch {
      corruptedKeys.push(key)
    }
  }

  if (corruptedKeys.length > 0) {
    showToast(`检测到 ${corruptedKeys.length} 个数据异常，建议从备份恢复`, 'error')
  }
}

// ==================== 功能16：桌面端双栏布局检测 ====================

/** 是否为桌面端（屏幕宽度 >= 1024px） */
const isDesktop = ref(window.innerWidth >= 1024)

/** 当前路由路径（用于侧边栏高亮） */
const currentPath = computed(() => route.path)

/** 桌面端侧边栏导航项配置 */
const desktopTabs = [
  { label: '首页', path: '/', icon: Home },
  { label: '学习路径', path: '/paths', icon: BookOpen },
  { label: '费曼讲解', path: '/explain', icon: Mic },
  { label: '复习中心', path: '/review', icon: Layers },
  { label: '个人中心', path: '/profile', icon: User },
]

/** 监听窗口尺寸变化，更新桌面端状态 */
function checkScreen(): void {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(() => {
  window.addEventListener('resize', checkScreen)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreen)
})

// ==================== 功能17：全局键盘快捷键 ====================

/** 是否显示快捷键帮助面板 */
const showShortcutHelp = ref(false)

/**
 * 全局键盘事件处理器
 * - Ctrl/Cmd + K: 聚焦搜索框（通过自定义事件通知 HomeView）
 * - ?: 显示/隐藏快捷键帮助面板（非输入框内）
 */
function handleGlobalKeydown(e: KeyboardEvent): void {
  // Ctrl/Cmd + K: 聚焦搜索框
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    // 通过自定义事件通知 HomeView 聚焦搜索框
    window.dispatchEvent(new CustomEvent('focus-search'))
    return
  }

  // ?: 显示/隐藏快捷键帮助（仅在非输入框内生效）
  if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    const target = e.target as HTMLElement | null
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
    e.preventDefault()
    showShortcutHelp.value = !showShortcutHelp.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style>
/* 快捷键帮助面板淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
