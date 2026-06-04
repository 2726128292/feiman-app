<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部问候区 -->
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ greeting }}，Alex</h1>
          <p class="text-sm text-slate-500 mt-0.5">继续把复杂知识讲简单</p>
        </div>
        <div class="flex flex-col items-center justify-center w-14 h-14 rounded-full bg-blue-50 border border-blue-100">
          <span class="text-lg font-bold text-[#4F6EF7] leading-none">{{ streakDays }}</span>
          <span class="text-[10px] text-blue-500 font-medium leading-none mt-0.5">连续</span>
        </div>
      </div>

      <!-- 全局搜索栏 -->
      <div class="relative">
        <div class="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3">
          <Search :size="18" class="text-slate-400 shrink-0" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索主题、闪卡、讲解记录..."
            class="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            @focus="showSearchResults = true"
            @input="onSearchInput"
          />
          <button v-if="searchQuery" @click="clearSearch" class="text-slate-400">
            <X :size="16" />
          </button>
        </div>

        <!-- 搜索结果下拉框 -->
        <div
          v-if="showSearchResults && searchQuery.length >= 2"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 z-50 max-h-[70vh] overflow-y-auto"
        >
          <!-- 无结果提示 -->
          <div v-if="!hasAnySearchResults" class="p-4 text-center text-sm text-slate-400">
            未找到相关内容
          </div>

          <!-- 分组结果列表 -->
          <div v-else>
            <!-- 主题组 -->
            <div v-if="searchResults.topicResults.length > 0" class="border-b border-slate-100 last:border-b-0">
              <div class="px-4 pt-3 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">主题</div>
              <div
                v-for="(item, idx) in searchResults.topicResults.slice(0, 3)"
                :key="'topic-' + idx"
                class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors flex items-center justify-between"
                @click="navigateToTopic(item.id)"
              >
                <span class="text-sm text-slate-700">{{ item.title }}</span>
                <ChevronRight :size="14" class="text-slate-300" />
              </div>
            </div>

            <!-- 闪卡组 -->
            <div v-if="searchResults.cardResults.length > 0" class="border-b border-slate-100 last:border-b-0">
              <div class="px-4 pt-3 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">闪卡</div>
              <div
                v-for="(item, idx) in searchResults.cardResults.slice(0, 3)"
                :key="'card-' + idx"
                class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors flex items-center justify-between"
                @click="router.push('/review/cards')"
              >
                <span class="text-sm text-slate-700 truncate max-w-[200px]">{{ item.question || item.answer }}</span>
                <ChevronRight :size="14" class="text-slate-300 shrink-0" />
              </div>
            </div>

            <!-- 讲解记录组 -->
            <div v-if="searchResults.sessionResults.length > 0">
              <div class="px-4 pt-3 pb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">讲解记录</div>
              <div
                v-for="(item, idx) in searchResults.sessionResults.slice(0, 3)"
                :key="'session-' + idx"
                class="px-4 py-2.5 hover:bg-slate-50 cursor-pointer active:bg-slate-100 transition-colors flex items-center justify-between"
                @click="router.push('/explain/list')"
              >
                <span class="text-sm text-slate-700 truncate max-w-[200px]">{{ item.content?.slice(0, 30) || '讲解记录' }}</span>
                <ChevronRight :size="14" class="text-slate-300 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        <!-- 点击遮罩关闭搜索结果 -->
        <div
          v-if="showSearchResults && searchQuery.length >= 2"
          class="fixed inset-0 z-40"
          @click="closeSearch"
        />
      </div>

      <!-- AI 学习教练建议卡片 -->
      <Card variant="gradient-blue" class="p-5 !rounded-2xl">
        <h2 class="text-base font-bold mb-1.5">AI 学习教练建议</h2>
        <p class="text-sm text-white/90 leading-relaxed mb-3">
          你在「{{ dashboard.suggestionTopic }}」概念上重复卡顿，建议先完成 8 分钟类比讲解。
        </p>
        <div class="flex items-center gap-2">
          <div class="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform" @click="router.push('/explain/new')">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span class="text-xs font-medium text-white">查看详细分析</span>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform" @click="router.push('/ai')">
            <span class="text-xs font-medium text-white">问 AI 助手</span>
          </div>
        </div>
      </Card>

      <!-- 快捷入口网格 -->
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="(entry, index) in quickEntries"
          :key="index"
          class="bg-white rounded-2xl shadow-sm p-4 text-left active:scale-[0.97] transition-transform duration-150"
          @click="handleEntryClick(entry.route)"
        >
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
            :style="{ backgroundColor: entry.iconBg + '20' }"
          >
            <component
              :is="entry.icon"
              :size="20"
              :stroke-width="2"
              :style="{ color: entry.iconBg }"
            />
          </div>
          <p class="text-sm font-semibold text-slate-800">{{ entry.title }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ entry.subtitle }}</p>
        </button>
      </div>

      <!-- 本周成长曲线 -->
      <div class="bg-white rounded-2xl shadow-sm p-5">
        <div class="flex items-baseline justify-between mb-1">
          <h2 class="text-base font-bold text-slate-800">本周成长曲线</h2>
        </div>
        <p class="text-xs text-slate-400 mb-4">
          讲解清晰度 +18%，薄弱点减少 7 个
        </p>

        <!-- SVG 折线图 -->
        <svg viewBox="0 0 300 120" class="w-full h-auto" preserveAspectRatio="none">
          <!-- 渐变填充定义 -->
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#4F6EF7" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#4F6EF7" stop-opacity="0.02" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#6B8CF7" />
              <stop offset="100%" stop-color="#4F6EF7" />
            </linearGradient>
          </defs>

          <!-- 填充区域 -->
          <path
            :d="areaPath"
            fill="url(#chartGradient)"
          />

          <!-- 折线 -->
          <path
            :d="linePath"
            fill="none"
            stroke="url(#lineGradient)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- 数据点 -->
          <g v-for="(point, i) in chartPoints" :key="i">
            <circle
              :cx="point.x"
              :cy="point.y"
              r="4"
              fill="white"
              stroke="#4F6EF7"
              stroke-width="2"
            />
          </g>
        </svg>

        <!-- X 轴标签 -->
        <div class="flex justify-between mt-2 px-1">
          <span v-for="day in weekLabels" :key="day" class="text-[10px] text-slate-400">{{ day }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Brain, Target, Route, Network, TrendingUp, Zap, Sparkles, Search, X, ChevronRight } from 'lucide-vue-next'
import Card from '@/components/common/Card.vue'
import { mockDashboardSummary, mockAnalytics } from '@/utils/mock'

const router = useRouter()
const dashboard = mockDashboardSummary

const streakDays = computed(() => mockDashboardSummary.dueCardsCount > 30 ? 12 : 8)

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

const quickEntries = [
  {
    icon: Route,
    title: '知识路径',
    subtitle: `${dashboard.activeTopicsCount} 条进行中`,
    iconBg: '#3B82F6',
    route: '/paths',
  },
  {
    icon: BookOpen,
    title: '闪卡复习',
    subtitle: `${dashboard.dueCardsCount} 张到期`,
    iconBg: '#10B981',
    route: '/review/cards',
  },
  {
    icon: Target,
    title: '模拟测验',
    subtitle: `${dashboard.pendingQuizzesCount} 套待完成`,
    iconBg: '#F59E0B',
    route: '/review/quiz',
  },
  {
    icon: Network,
    title: '知识图谱',
    subtitle: `${dashboard.knowledgeNodesCount} 个节点`,
    iconBg: '#8B5CF6',
    route: '/graph',
  },
  {
    icon: Zap,
    title: '今日计划',
    subtitle: 'AI 智能排程',
    iconBg: '#EC4899',
    route: '/plan',
  },
  {
    icon: TrendingUp,
    title: '学习分析',
    subtitle: '查看报告',
    iconBg: '#06B6D4',
    route: '/analytics',
  },
  {
    icon: Sparkles,
    title: 'AI 助手',
    subtitle: '自由对话 · 上传资料',
    iconBg: '#06B6D4',
    route: '/ai',
  },
]

function handleEntryClick(route: string) {
  router.push(route)
}

// ==================== 图表数据与计算 ====================

const chartData = mockAnalytics.weeklyScores // [72, 78, 75, 82, 79, 86, 90]
const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const chartWidth = 300
const chartHeight = 110
const paddingX = 16
const paddingY = 12

const chartPoints = computed(() => {
  const dataRange = Math.max(...chartData) - Math.min(...chartData) || 1
  const minVal = Math.min(...chartData)

  return chartData.map((val, idx) => ({
    x: paddingX + (idx / (chartData.length - 1)) * (chartWidth - 2 * paddingX),
    y: chartHeight - paddingY - ((val - minVal) / dataRange) * (chartHeight - 2 * paddingY),
  }))
})

const linePath = computed(() =>
  chartPoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
)

const areaPath = computed(() => {
  const line = linePath.value
  const firstX = chartPoints.value[0]?.x ?? 0
  const lastX = chartPoints.value[chartPoints.value.length - 1]?.x ?? chartWidth
  return `${line} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`
})

// ==================== 全局搜索功能 ====================

/** 搜索关键词 */
const searchQuery = ref('')
/** 是否显示搜索结果 */
const showSearchResults = ref(false)

/** 搜索结果类型定义 */
interface SearchResult {
  topicResults: Array<{ id: string; title: string }>
  cardResults: Array<{ question?: string; answer?: string }>
  sessionResults: Array<{ id: string; content?: string; topicId?: string }>
}

/** 搜索结果 */
const searchResults = ref<SearchResult>({
  topicResults: [],
  cardResults: [],
  sessionResults: []
})

/** 是否有搜索结果 */
const hasAnySearchResults = computed(() => {
  const r = searchResults.value
  return r.topicResults.length > 0 || r.cardResults.length > 0 || r.sessionResults.length > 0
})

/**
 * 执行搜索 - 从 localStorage 读取数据并匹配
 * 最少2个字符触发搜索
 */
function onSearchInput(): void {
  const query = searchQuery.value.trim().toLowerCase()

  // 少于2个字符不触发搜索，清空结果
  if (query.length < 2) {
    searchResults.value = { topicResults: [], cardResults: [], sessionResults: [] }
    return
  }

  // 从 localStorage 读取数据
  const topicsData = localStorage.getItem('feiman_topics')
  const cardsData = localStorage.getItem('feiman_cards') || localStorage.getItem('feiman_review_cards')
  const sessionsData = localStorage.getItem('feiman_sessions')

  // 搜索主题（按标题和tags）
  let topicResults: Array<{ id: string; title: string }> = []
  if (topicsData) {
    try {
      const topics = JSON.parse(topicsData)
      topicResults = (Array.isArray(topics) ? topics : []).filter((t: any) => {
        const titleMatch = t.title?.toLowerCase().includes(query)
        const tagsMatch = Array.isArray(t.tags) && t.tags.some((tag: string) =>
          tag.toLowerCase().includes(query)
        )
        return titleMatch || tagsMatch
      }).map((t: any) => ({ id: t.id, title: t.title }))
    } catch {
      // JSON 解析失败时忽略
    }
  }

  // 搜索闪卡（按问题和答案）
  let cardResults: Array<{ question?: string; answer?: string }> = []
  if (cardsData) {
    try {
      const cards = JSON.parse(cardsData)
      cardResults = (Array.isArray(cards) ? cards : []).filter((c: any) => {
        const questionMatch = c.question?.toLowerCase().includes(query)
        const answerMatch = c.answer?.toLowerCase().includes(query)
        return questionMatch || answerMatch
      }).slice(0, 3)
    } catch {
      // JSON 解析失败时忽略
    }
  }

  // 搜索讲解记录（按 topicId 和 content）
  let sessionResults: Array<{ id: string; content?: string; topicId?: string }> = []
  if (sessionsData) {
    try {
      const sessions = JSON.parse(sessionsData)
      sessionResults = (Array.isArray(sessions) ? sessions : []).filter((s: any) => {
        const topicIdMatch = s.topicId?.toLowerCase().includes(query)
        const contentMatch = s.content?.toLowerCase().includes(query)
        return topicIdMatch || contentMatch
      }).slice(0, 3).map((s: any) => ({
        id: s.id,
        content: s.content,
        topicId: s.topicId
      }))
    } catch {
      // JSON 解析失败时忽略
    }
  }

  searchResults.value = { topicResults, cardResults, sessionResults }
}

/** 清空搜索 */
function clearSearch(): void {
  searchQuery.value = ''
  showSearchResults.value = false
  searchResults.value = { topicResults: [], cardResults: [], sessionResults: [] }
}

/** 关闭搜索结果 */
function closeSearch(): void {
  showSearchResults.value = false
}

/** 跳转到主题详情页 */
function navigateToTopic(topicId: string): void {
  closeSearch()
  router.push(`/paths/${topicId}`)
}
</script>
