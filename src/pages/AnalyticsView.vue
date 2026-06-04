<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">学习分析</h1>
        <p class="text-sm text-slate-500 mt-0.5">多维度追踪理解质量</p>
      </div>

      <!-- 空状态 -->
      <div v-if="isEmpty" class="bg-white rounded-2xl shadow-sm p-8 text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <span class="text-3xl">📊</span>
        </div>
        <h3 class="text-base font-semibold text-slate-800">还没有学习数据</h3>
        <p class="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
          完成第一次讲解或闪卡复习后，这里将展示你的学习分析报告。开始你的费曼学习之旅吧！
        </p>
        <button
          class="mt-2 px-5 py-2 rounded-full bg-[#4F6EF7] text-white text-sm font-medium"
          @click="$router.push('/home')"
        >
          开始学习
        </button>
      </div>

      <!-- 有数据时显示 -->
      <template v-else>
        <!-- 指标网格 2x2 -->
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="(metric, index) in metrics"
            :key="index"
            class="bg-white rounded-2xl shadow-sm p-4"
          >
            <p class="text-xs text-slate-400 mb-1">{{ metric.label }}</p>
            <div class="flex items-baseline gap-2">
              <span
                class="text-2xl font-bold tabular-nums"
                :class="metric.valueClass"
              >{{ metric.value }}</span>
              <span
                class="text-xs font-medium flex items-center gap-0.5"
                :class="metric.trend > 0 ? 'text-emerald-600' : metric.trend < 0 ? 'text-red-500' : 'text-slate-400'"
              >
                {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
                <TrendingUp v-if="metric.trend > 0" :size="12" />
                <TrendingDown v-else-if="metric.trend < 0" :size="12" />
              </span>
            </div>
          </div>
        </div>

        <!-- 热力日历 -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <h2 class="text-base font-bold text-slate-800 mb-4">热力日历</h2>
          <!-- 星期标题行 -->
          <div class="grid grid-cols-7 gap-1.5 mb-1.5">
            <span
              v-for="day in weekDayLabels"
              :key="day"
              class="text-[10px] text-slate-400 text-center"
            >{{ day }}</span>
          </div>
          <!-- 月份标签 + 热力格子 -->
          <div class="space-y-1">
            <div v-for="(week, weekIdx) in heatmapWeeks" :key="'month-' + weekIdx" class="flex items-center gap-1.5">
              <span v-if="week.monthLabel" class="text-[10px] text-slate-400 w-7 shrink-0">{{ week.monthLabel }}</span>
              <span v-else class="w-7 shrink-0" />
              <div class="grid grid-cols-7 gap-1.5 flex-1">
                <div
                  v-for="(cell, cellIdx) in week.cells"
                  :key="cellIdx"
                  class="w-full aspect-square rounded-sm cursor-default"
                  :class="cell.color"
                  :title="cell.date ? `${cell.date} · ${cell.count} 次活动` : ''"
                />
              </div>
            </div>
          </div>
          <!-- 图例 -->
          <div class="flex items-center justify-end gap-1.5 mt-3">
            <span class="text-[10px] text-slate-400">少</span>
            <div class="w-3 h-3 rounded-sm bg-slate-100" />
            <div class="w-3 h-3 rounded-sm bg-blue-200" />
            <div class="w-3 h-3 rounded-sm bg-blue-300" />
            <div class="w-3 h-3 rounded-sm bg-blue-400" />
            <div class="w-3 h-3 rounded-sm bg-blue-600" />
            <span class="text-[10px] text-slate-400">多</span>
          </div>
        </div>

        <!-- 本月建议 -->
        <div class="bg-white rounded-2xl shadow-sm p-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Lightbulb :size="20" class="text-amber-500" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-800">本月建议</h3>
              <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {{ suggestionText }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-vue-next'
import type { UserProfile, StudyTopic, FeynmanSession, ReviewCard, Achievement } from '@/types'

// ====== 类型定义 ======
interface WrongBookItem {
  id: string
  topicId: string
  question: string
  correctAnswer: string
  userAnswer: string
  addedAt: string
}

// ====== 从 localStorage 读取数据 ======
function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const userProfile = safeGet<UserProfile>('feiman_user_profile')
const topics = safeGet<StudyTopic[]>('feiman_topics') ?? []
const sessions = safeGet<FeynmanSession[]>('feiman_sessions') ?? []
const cards = safeGet<ReviewCard[]>('feiman_cards') ?? []
const achievements = safeGet<Achievement[]>('feiman_achievements') ?? []
const wrongBook = safeGet<WrongBookItem[]>('feiman_wrong_book') ?? []

// ====== 判断是否为空 ======
const isEmpty = computed(() => {
  return sessions.length === 0 && cards.length === 0 && topics.length === 0
})

// ====== 工具函数：日期相关 ======
function getDaysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return date >= startOfWeek && date < endOfWeek
}

function isLastWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const thisWeekStart = new Date(now)
  thisWeekStart.setDate(now.getDate() - now.getDay())
  thisWeekStart.setHours(0, 0, 0, 0)
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)
  return date >= lastWeekStart && date < thisWeekStart
}

// ====== 指标计算 ======

/** 掌握率：主题平均进度 或 会话平均分数 */
function calcMasteryRate(): number {
  if (topics.length > 0) {
    const totalProgress = topics.reduce((sum, t) => sum + (t.progress || 0), 0)
    return Math.round(totalProgress / topics.length)
  }
  if (sessions.length > 0) {
    const scoredSessions = sessions.filter(s => s.score != null && s.score > 0)
    if (scoredSessions.length > 0) {
      const avgScore = scoredSessions.reduce((sum, s) => sum + s.score!, 0) / scoredSessions.length
      return Math.round(avgScore)
    }
  }
  return 0
}

/** 掌握率趋势：本周 vs 上周 */
function calcMasteryTrend(): number {
  const thisWeekScores = sessions.filter(s => isThisWeek(s.createdAt))
  const lastWeekScores = sessions.filter(s => isLastWeek(s.createdAt))

  if (thisWeekScores.length === 0 && lastWeekScores.length === 0) return 0
  if (lastWeekScores.length === 0) return thisWeekScores.length > 0 ? 15 : 0
  if (thisWeekScores.length === 0) return -10

  const thisAvg = thisWeekScores.reduce((s, x) => s + (x.score || 0), 0) / thisWeekScores.length
  const lastAvg = lastWeekScores.reduce((s, x) => s + (x.score || 0), 0) / lastWeekScores.length
  return Math.round(((thisAvg - lastAvg) / Math.max(lastAvg, 1)) * 100)
}

/** 遗忘风险：interval < 3 且 easeFactor < 2.4 的卡片比例 */
function calcForgetRisk(): { level: '低' | '中' | '高'; trend: number } {
  if (cards.length === 0) return { level: '低', trend: 0 }

  const riskyCards = cards.filter(c => c.interval < 3 && c.easeFactor < 2.4)
  const ratio = riskyCards.length / cards.length

  let level: '低' | '中' | '高' = '低'
  if (ratio > 0.25) level = '高'
  else if (ratio > 0.1) level = '中'

  // 趋势：比较近期新增的 vs 较早的卡片
  const recentRisky = riskyCards.filter(c => {
    if (!c.lastReviewAt) return false
    const daysSince = (Date.now() - new Date(c.lastReviewAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSince <= 14
  })
  const olderRisky = riskyCards.filter(c => !recentRisky.includes(c))

  const trend = olderRisky.length > recentRisky.length ? -8 : recentRisky.length > olderRisky.length ? 5 : 0
  return { level, trend }
}

/** 讲解清晰度：会话平均分 */
function calcClarityScore(): { score: number; trend: number } {
  const scoredSessions = sessions.filter(s => s.score != null && s.score > 0)
  if (scoredSessions.length === 0) return { score: 0, trend: 0 }

  const totalScore = scoredSessions.reduce((s, x) => s + x.score!, 0)
  const avgScore = Math.round(totalScore / scoredSessions.length)

  const thisWeekS = scoredSessions.filter(s => isThisWeek(s.createdAt))
  const lastWeekS = scoredSessions.filter(s => isLastWeek(s.createdAt))

  let trend = 0
  if (thisWeekS.length > 0 && lastWeekS.length > 0) {
    const tAvg = thisWeekS.reduce((s, x) => s + x.score!, 0) / thisWeekS.length
    const lAvg = lastWeekS.reduce((s, x) => s + x.score!, 0) / lastWeekS.length
    trend = Math.round(((tAvg - lAvg) / Math.max(lAvg, 1)) * 100)
  } else if (thisWeekS.length > 0) {
    trend = 5
  }

  return { score: avgScore, trend }
}

/** 薄弱点数量：所有会话的 gaps 数 + 错题本数 */
function calcGapCount(): { count: number; trend: number } {
  const sessionGaps = sessions.reduce((total, s) => total + (s.gaps?.length || 0), 0)
  const totalCount = sessionGaps + wrongBook.length

  // 趋势：本周新增 gaps vs 上周
  const thisWeekGaps = sessions
    .filter(s => isThisWeek(s.createdAt))
    .reduce((t, s) => t + (s.gaps?.length || 0), 0)
  const lastWeekGaps = sessions
    .filter(s => isLastWeek(s.createdAt))
    .reduce((t, s) => t + (s.gaps?.length || 0), 0)

  const trend = lastWeekGaps > 0
    ? Math.round(((thisWeekGaps - lastWeekGaps) / lastWeekGaps) * 100)
    : (thisWeekGaps > 0 ? 10 : 0)

  return { count: totalCount, trend }
}

// ====== 指标数据 ======
const masteryRate = calcMasteryRate()
const forgetRisk = calcForgetRisk()
const clarityData = calcClarityScore()
const gapData = calcGapCount()

const metrics = computed(() => [
  {
    label: '掌握率',
    value: `${masteryRate}%`,
    valueClass: 'text-[#4F6EF7]',
    trend: calcMasteryTrend(),
  },
  {
    label: '遗忘风险',
    value: forgetRisk.level,
    valueClass: forgetRisk.level === '高' ? 'text-red-500' : forgetRisk.level === '中' ? 'text-amber-500' : 'text-emerald-600',
    trend: forgetRisk.trend,
  },
  {
    label: '讲解清晰',
    value: String(clarityData.score),
    valueClass: clarityData.score >= 80 ? 'text-emerald-600' : clarityData.score >= 60 ? 'text-amber-500' : 'text-red-500',
    trend: clarityData.trend,
  },
  {
    label: '薄弱点',
    value: String(gapData.count),
    valueClass: gapData.count > 20 ? 'text-red-500' : gapData.count > 10 ? 'text-amber-500' : 'text-emerald-600',
    trend: gapData.trend,
  },
])

// ====== 热力日历生成 ======
const weekDayLabels = ['一', '二', '三', '四', '五', '六', '日']

const heatColors = [
  'bg-slate-100',
  'bg-blue-200',
  'bg-blue-300',
  'bg-blue-400',
  'bg-blue-600',
]

interface HeatCell {
  color: string
  count: number
  date: string
}

interface HeatWeek {
  monthLabel: string
  cells: HeatCell[]
}

function buildActivityMap(): Map<string, number> {
  const map = new Map<string, number>()

  // 收集所有会话日期
  for (const s of sessions) {
    const d = new Date(s.createdAt).toISOString().split('T')[0]
    map.set(d, (map.get(d) || 0) + 1)
  }

  // 收集所有卡片复习日期
  for (const c of cards) {
    if (c.lastReviewAt) {
      const d = new Date(c.lastReviewAt).toISOString().split('T')[0]
      map.set(d, (map.get(d) || 0) + 1)
    }
  }

  // 收集错题本添加日期
  for (const w of wrongBook) {
    if (w.addedAt) {
      const d = new Date(w.addedAt).toISOString().split('T')[0]
      map.set(d, (map.get(d) || 0) + 1)
    }
  }

  // 收集成就解锁日期
  for (const a of achievements) {
    if (a.unlockedAt) {
      const d = new Date(a.unlockedAt).toISOString().split('T')[0]
      map.set(d, (map.get(d) || 0) + 1)
    }
  }

  return map
}

const heatmapWeeks = computed((): HeatWeek[] => {
  const activityMap = buildActivityMap()
  const weeks: HeatWeek[] = []
  const today = new Date()

  // 从90天前开始
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 89)

  // 找到起始周的周一
  const startDay = startDate.getDay()
  const firstMonday = new Date(startDate)
  firstMonday.setDate(startDate.getDate() - (startDay === 0 ? 6 : startDay - 1))

  let currentMonthLabel = ''
  let weekCells: HeatCell[] = []

  for (let i = 0; i < 98; i++) {
    // 最多约14周（98天）
    const date = new Date(firstMonday)
    date.setDate(firstMonday.getDate() + i)

    // 如果超过今天，停止
    if (date > today) {
      if (weekCells.length > 0) {
        weeks.push({ monthLabel: currentMonthLabel, cells: weekCells })
      }
      break
    }

    const dateKey = date.toISOString().split('T')[0]
    const count = activityMap.get(dateKey) || 0
    const level = Math.min(count, 4)

    // 检查是否需要月份标签（每周的第一天）
    const monthName = `${date.getMonth() + 1}月`
    if (i % 7 === 0) {
      currentMonthLabel = monthName
    }

    weekCells.push({
      color: heatColors[level],
      count,
      date: dateKey,
    })

    // 每7天一周
    if ((i + 1) % 7 === 0) {
      weeks.push({ monthLabel: currentMonthLabel, cells: [...weekCells] })
      weekCells = []
      currentMonthLabel = ''
    }
  }

  // 处理剩余不足一周的天数
  if (weekCells.length > 0) {
    while (weekCells.length < 7) {
      weekCells.push({ color: 'bg-transparent', count: 0, date: '' })
    }
    weeks.push({ monthLabel: '', cells: weekCells })
  }

  return weeks
})

// ====== 动态建议 ======
const suggestionText = computed(() => {
  const suggestions: string[] = []

  // 错题本较多
  if (wrongBook.length >= 5) {
    suggestions.push(`你有 ${wrongBook.length} 道错题待攻克，建议优先集中复习薄弱知识点。`)
  }

  // 近期无会话
  const recentDays = sessions.filter(s => {
    const daysDiff = (Date.now() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 3
  })
  if (sessions.length > 0 && recentDays.length === 0) {
    suggestions.push('已经 3 天没有进行讲解了，建议每天花 10 分钟用费曼法巩固一个概念。')
  }

  // 连续打卡提醒
  if (userProfile?.streakDays && userProfile.streakDays >= 3) {
    suggestions.push(`已连续打卡 ${userProfile.streakDays} 天，太棒了！保持下去，习惯正在养成。`)
  }

  // 分数较高
  if (clarityData.score >= 85 && sessions.length >= 3) {
    suggestions.push('你的讲解清晰度很高！可以尝试更有挑战性的主题，或尝试教给他人。')
  }

  // 遗忘风险高
  if (forgetRisk.level === '高') {
    suggestions.push('部分卡片即将进入遗忘期，建议增加复习频率。')
  }

  // 数据太少
  if (sessions.length > 0 && sessions.length < 3) {
    suggestions.push('积累更多讲解记录后，将为你提供更精准的分析建议。继续加油！')
  }

  if (suggestions.length === 0) {
    if (sessions.length === 0) {
      return '完成第一次讲解或闪卡复习后，这里将为你提供个性化建议。'
    }
    return '坚持使用费曼学习法，每次讲解都会让理解更深入一步。'
  }

  return suggestions[0]
})
</script>
