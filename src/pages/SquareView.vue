<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">精选范例</h1>
        <p class="text-sm text-slate-500 mt-0.5">高分讲解范例 · 一键学习</p>
      </div>

      <!-- 筛选 tabs -->
      <div class="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
        <button
          v-for="tab in filterTabs"
          :key="tab.key"
          class="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200"
          :class="activeTab === tab.key
            ? 'bg-[#4F6EF7] text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 范例卡片列表 -->
      <div class="space-y-3">
        <div
          v-for="example in filteredExamples"
          :key="example.id"
          class="bg-white rounded-2xl shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-transform duration-150"
        >
          <!-- 卡片头部：标题 + 一键学习按钮 -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-semibold text-slate-900 leading-snug flex-1 pr-3">{{ example.title }}</h3>
            <button
              class="shrink-0 px-3 py-1.5 rounded-full bg-blue-50 text-[#4F6EF7] text-xs font-semibold active:bg-blue-100 transition-colors whitespace-nowrap"
              @click.stop="handleLearn(example)"
            >
              一键学习
            </button>
          </div>

          <!-- 主题名称 -->
          <p class="text-sm text-slate-600 mb-3">{{ example.topic }}</p>

          <!-- 标签行 -->
          <div class="flex items-center gap-2 mb-3 flex-wrap">
            <!-- 难度标签 -->
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-medium"
              :class="difficultyClass(example.difficulty)"
            >
              {{ example.difficulty }}
            </span>
            <!-- 来源标签 -->
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-medium"
              :class="example.source === '本地' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'"
            >
              {{ example.source }}
            </span>
            <!-- 自定义标签 -->
            <span
              v-for="(tag, idx) in example.tags"
              :key="idx"
              class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium"
            >
              {{ tag }}
            </span>
          </div>

          <!-- 底部：清晰度分数（圆形进度） -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
            <span class="text-xs text-slate-400">讲解清晰度</span>
            <div class="flex items-center gap-2">
              <!-- 圆形进度条 -->
              <svg width="36" height="36" viewBox="0 0 36 36" class="transform -rotate-90">
                <!-- 背景圆环 -->
                <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" stroke-width="3" />
                <!-- 进度圆环 -->
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  :stroke="clarityColor(example.clarity)"
                  stroke-width="3"
                  stroke-linecap="round"
                  :stroke-dasharray="`${example.clarity * 0.94} 94`"
                />
              </svg>
              <span class="text-sm font-bold" :style="{ color: clarityColor(example.clarity) }">{{ example.clarity }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部说明卡片 -->
      <div class="bg-blue-50 rounded-2xl p-4 border border-blue-100">
        <div class="flex items-start gap-3">
          <Sparkles :size="20" class="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 class="text-sm font-semibold text-blue-800">关于精选范例</h3>
            <p class="text-xs text-blue-700/80 mt-1 leading-relaxed">
              这些范例来自你的高分讲解记录和AI推荐的优质内容。学习它们可以帮你快速掌握费曼讲解技巧。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles } from 'lucide-vue-next'

const router = useRouter()

// ==================== 筛选 tabs ====================

/** 筛选选项 */
const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'local', label: '本地高分' },
  { key: 'ai', label: 'AI推荐' }
]

/** 当前激活的筛选 */
const activeTab = ref('all')

// ==================== AI 推荐预设范例数据 ====================

interface Example {
  id: string
  title: string
  topic: string
  clarity: number
  source: string
  tags: string[]
  difficulty: string
}

/** AI 预设的高质量范例 */
const aiExamples: Example[] = [
  {
    id: 'ex-1',
    title: '用咖啡机解释事件循环',
    topic: 'JavaScript事件循环',
    clarity: 95,
    source: 'AI推荐',
    tags: ['类比', '生活化'],
    difficulty: '中级'
  },
  {
    id: 'ex-2',
    title: '三分钟讲懂HTTP缓存策略',
    topic: '网络协议',
    clarity: 92,
    source: 'AI推荐',
    tags: ['结构清晰', '实战'],
    difficulty: '初级'
  },
  {
    id: 'ex-3',
    title: '递归就像俄罗斯套娃',
    topic: '算法基础',
    clarity: 90,
    source: 'AI推荐',
    tags: ['类比', '生动'],
    difficulty: '初级'
  },
  {
    id: 'ex-4',
    title: '闭包：函数的记忆背包',
    topic: 'JavaScript核心',
    clarity: 88,
    source: 'AI推荐',
    tags: ['形象比喻', '深度'],
    difficulty: '中级'
  },
  {
    id: 'ex-5',
    title: 'Promise像餐厅叫号系统',
    topic: '异步编程',
    clarity: 91,
    source: 'AI推荐',
    tags: ['生活类比', '易懂'],
    difficulty: '中级'
  },
  {
    id: 'ex-6',
    title: 'TCP三次握手的生活场景',
    topic: '计算机网络',
    clarity: 87,
    source: 'AI推荐',
    tags: ['场景化', '通信'],
    difficulty: '高级'
  }
]

// ==================== 本地高分记录 ====================

/** 本地高分范例（从 localStorage 读取 score >= 80 的记录） */
const localExamples = ref<Example[]>([])

/**
 * 从 feiman_sessions 加载本地高分记录
 * 将 session 数据转换为 Example 格式展示
 */
function loadLocalExamples(): void {
  const sessionsData = localStorage.getItem('feiman_sessions')
  if (!sessionsData) return

  try {
    const sessions = JSON.parse(sessionsData)
    // 过滤出 score >= 80 的高分记录，并转换为 Example 格式
    const highScoreSessions = (Array.isArray(sessions) ? sessions : [])
      .filter((s: any) => s.score !== undefined && s.score >= 80)
      .slice(0, 10) // 最多取10条本地高分
      .map((s: any, index: number) => ({
        id: `local-${s.id || index}`,
        title: s.topicId || s.content?.slice(0, 20) || `讲解记录 #${index + 1}`,
        topic: s.topicId || '未知主题',
        clarity: s.score || 80,
        source: '本地',
        tags: s.tags || [],
        difficulty: s.difficulty || (s.score >= 90 ? '高级' : s.score >= 85 ? '中级' : '初级')
      }))
    localExamples.value = highScoreSessions
  } catch {
    // JSON 解析失败时忽略
  }
}

// 页面加载时读取本地数据
onMounted(() => {
  loadLocalExamples()
})

// ==================== 合并与筛选显示 ====================

/** 所有范例列表（合并本地 + AI推荐） */
const allExamples = computed<Example[]>(() => {
  return [...localExamples.value, ...aiExamples]
})

/** 根据 activeTab 筛选后的范例列表 */
const filteredExamples = computed<Example[]>(() => {
  switch (activeTab.value) {
    case 'local':
      return localExamples.value
    case 'ai':
      return aiExamples
    case 'all':
    default:
      return allExamples.value
  }
})

// ==================== 辅助方法 ====================

/** 根据难度返回对应的 CSS 类名 */
function difficultyClass(difficulty: string): string {
  switch (difficulty) {
    case '初级': return 'bg-green-50 text-green-600'
    case '中级': return 'bg-yellow-50 text-yellow-600'
    case '高级': return 'bg-red-50 text-red-600'
    default: return 'bg-slate-100 text-slate-600'
  }
}

/** 根据清晰度分数返回对应的颜色 */
function clarityColor(clarity: number): string {
  if (clarity >= 90) return '#10B981' // 绿色 - 优秀
  if (clarity >= 80) return '#3B82F6' // 蓝色 - 良好
  return '#F59E0B' // 黄色 - 一般
}

/** 点击「一键学习」跳转到讲解页面，传递主题名 */
function handleLearn(example: Example): void {
  router.push({
    path: '/explain/new',
    query: { topic: example.topic }
  })
}
</script>
