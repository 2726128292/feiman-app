<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">今日计划</h1>
        <p class="text-sm text-slate-500 mt-0.5">AI 按优先级安排学习任务</p>
      </div>

      <!-- 番茄钟计时器 -->
      <PomodoroTimer
        :duration="pomodoroDuration"
        mode="work"
        @complete="onPomodoroComplete"
        @mode-change="onModeChange"
      />

      <!-- 专注统计卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mt-3">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
            <BarChart3 :size="15" class="text-orange-500" /> 专注统计
          </h3>
          <span class="text-[11px] text-slate-400">本周 {{ weekTotalMinutes }} 分钟</span>
        </div>

        <!-- 统计网格 -->
        <div class="grid grid-cols-3 gap-3 mb-3">
          <div class="text-center bg-orange-50 rounded-xl py-2.5">
            <p class="text-xl font-bold text-orange-600">{{ todayCount }}</p>
            <p class="text-[10px] text-slate-500">今日番茄</p>
          </div>
          <div class="text-center bg-blue-50 rounded-xl py-2.5">
            <p class="text-xl font-bold text-blue-600">{{ todayMinutes }}</p>
            <p class="text-[10px] text-slate-500">今日分钟</p>
          </div>
          <div class="text-center bg-emerald-50 rounded-xl py-2.5">
            <p class="text-xl font-bold text-emerald-600">{{ bestDayCount }}</p>
            <p class="text-[10px] text-slate-500">最佳单日</p>
          </div>
        </div>

        <!-- 本周柱状图（纯CSS实现） -->
        <div class="flex items-end justify-between gap-1 h-16 px-1">
          <div
            v-for="(day, idx) in weekData"
            :key="idx"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <span class="text-[9px] font-medium text-slate-400">{{ day.count }}</span>
            <div
              class="w-full rounded-t-md transition-all min-h-[4px]"
              :class="day.isToday ? 'bg-orange-500' : 'bg-orange-200'"
              :style="{ height: Math.max(4, (day.count / maxWeekCount) * 48) + 'px' }"
            />
            <span class="text-[9px]" :class="day.isToday ? 'text-orange-500 font-bold' : 'text-slate-400'">{{ day.label }}</span>
          </div>
        </div>
      </div>

      <!-- 今日学习摘要卡片 -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-slate-700">今日学习摘要</h3>
          <span class="text-xs text-blue-500">{{ todayDate }}</span>
        </div>

        <!-- 每日目标设定 -->
        <div class="flex items-center gap-2 mb-3 pb-2 border-b border-blue-100">
          <Target :size="14" class="text-blue-500 shrink-0" />
          <span class="text-xs font-medium text-slate-600">今日目标</span>
          <input
            v-model.number="dailyGoalSessions"
            type="number"
            min="0"
            max="20"
            class="w-12 px-1.5 py-0.5 text-xs text-center border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-blue-600 font-semibold"
            @change="saveDailyGoal"
          />
          <span class="text-xs text-slate-400">次讲解 ·</span>
          <input
            v-model.number="dailyGoalCards"
            type="number"
            min="0"
            max="100"
            class="w-12 px-1.5 py-0.5 text-xs text-center border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 text-blue-600 font-semibold"
            @change="saveDailyGoal"
          />
          <span class="text-xs text-slate-400">张闪卡</span>
        </div>

        <div class="grid grid-cols-4 gap-2">
          <!-- 讲解次数 -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-2.5 text-center shadow-sm">
            <p class="text-lg font-bold text-[#4F6EF7]">{{ todayStats.explainCount }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">讲解次数</p>
            <!-- 目标进度 -->
            <div v-if="dailyGoalSessions > 0" class="mt-1 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :class="todayStats.explainCount >= dailyGoalSessions ? 'bg-emerald-500' : 'bg-blue-500'" :style="{ width: Math.min(100, (todayStats.explainCount / dailyGoalSessions) * 100) + '%' }" />
            </div>
          </div>
          <!-- 复习卡数 -->
          <div class="bg-white rounded-xl p-2.5 text-center shadow-sm">
            <p class="text-lg font-bold text-emerald-500">{{ todayStats.reviewCards }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">复习卡数</p>
            <!-- 目标进度 -->
            <div v-if="dailyGoalCards > 0" class="mt-1 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :class="todayStats.reviewCards >= dailyGoalCards ? 'bg-emerald-500' : 'bg-emerald-400'" :style="{ width: Math.min(100, (todayStats.reviewCards / dailyGoalCards) * 100) + '%' }" />
            </div>
          </div>
          <!-- 专注时长 -->
          <div class="bg-white rounded-xl p-2.5 text-center shadow-sm">
            <p class="text-lg font-bold text-amber-500">{{ todayStats.focusMinutes }}<span class="text-[10px] font-normal">分</span></p>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">专注时长</p>
          </div>
          <!-- 连续天数 -->
          <div class="bg-white dark:bg-slate-800 rounded-xl p-2.5 text-center shadow-sm">
            <p class="text-lg font-bold text-purple-500">{{ todayStats.streakDays }}</p>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-tight">连续天数</p>
          </div>
        </div>
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
          <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border-l-4" :class="taskBorderColor(task)">
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{{ task.title }}</p>
            <p class="text-xs mt-1 font-medium" :class="taskTagColor(task)">
              {{ taskTagText(task) }}
              <span v-if="task.pomodoroStarted" class="ml-1.5 text-indigo-500">· 已开始</span>
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
import { ref, computed, watch, type Ref } from 'vue'
import { BarChart3 } from 'lucide-vue-next'
import { mockDailyPlans } from '@/utils/mock'
import type { PlanTask } from '@/types/plan'
import { Target } from 'lucide-vue-next'
import PomodoroTimer from '@/components/common/PomodoroTimer.vue'
import { useToast } from '@/composables/useToast'

const { showToast } = useToast()

const weekDays = ['一', '二', '三', '四', '五', '六', '日']
const weekDates = [1, 2, 3, 4, 5, 6, 7]
const selectedDayIndex: Ref<number> = ref(3) // 周四

// 番茄钟时长（分钟）
const pomodoroDuration = ref(25)

// ====== 每日学习目标 ======

/** 每日讲解目标次数 */
const dailyGoalSessions = ref<number>(3)
/** 每日闪卡目标数量 */
const dailyGoalCards = ref<number>(10)
/** 是否已提示目标完成（避免重复弹窗） */
const goalNotified = ref<Record<string, boolean>>({})

/**
 * 从 localStorage 加载每日目标设置
 */
function loadDailyGoal(): void {
  try {
    const data = localStorage.getItem('feiman_daily_goal')
    if (data) {
      const goal = JSON.parse(data)
      dailyGoalSessions.value = goal.sessions ?? 3
      dailyGoalCards.value = goal.cards ?? 10
    }
  } catch {
    // 使用默认值
  }
}

// 初始化加载目标
loadDailyGoal()

/**
 * 保存每日目标到 localStorage
 */
function saveDailyGoal(): void {
  const goal = {
    sessions: dailyGoalSessions.value,
    cards: dailyGoalCards.value
  }
  localStorage.setItem('feiman_daily_goal', JSON.stringify(goal))
  showToast('每日目标已更新', 'success')
}

/**
 * 监听今日统计数据变化，检测是否达成目标并弹出提示
 */
watch(
  () => todayStats.value,
  (stats) => {
    // 检测讲解次数目标
    if (dailyGoalSessions.value > 0 && stats.explainCount >= dailyGoalSessions.value && !goalNotified.value.sessions) {
      goalNotified.value.sessions = true
      showToast('🎉 今日讲解目标已完成！', 'success')
    }
    // 检测闪卡复习目标
    if (dailyGoalCards.value > 0 && stats.reviewCards >= dailyGoalCards.value && !goalNotified.value.cards) {
      goalNotified.value.cards = true
      showToast('🎉 今日闪卡复习目标已完成！', 'success')
    }
  },
  { immediate: true, deep: true }
)

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

// ====== 番茄钟事件处理 ======

/** 番茄钟完成时，标记当前任务已开始 + 记录统计 */
function onPomodoroComplete(data: { mode: string; duration: number }): void {
  if (data.mode === 'work') {
    // 记录番茄钟完成到历史
    recordPomodoroComplete()

    // 找到当前时间最接近的未完成任务并标记开始
    const now = new Date()
    const currentHour = now.getHours()

    for (const task of plan.value.tasks) {
      const taskHour = parseInt(task.time.split(':')[0], 10)
      // 找到当前或之后最近的未完成任务
      if (!task.pomodoroStarted && taskHour >= currentHour - 1) {
        task.pomodoroStarted = true
        break
      }
    }

    // 如果没有匹配的任务，标记第一个未完成的任务
    const unmarkedTask = plan.value.tasks.find(t => !t.pomodoroStarted)
    if (unmarkedTask) {
      unmarkedTask.pomodoroStarted = true
    }
  }
}

/** 模式切换回调 */
function onModeChange(mode: string): void {
  // 可用于记录模式切换日志等
  console.log(`番茄钟切换到模式: ${mode}`)
}

// ====== 番茄钟历史统计 ======

/** 番茄钟历史记录类型 */
interface PomodoroRecord {
  date: string   // YYYY-MM-DD
  count: number  // 当天完成的番茄数
  minutes: number // 总分钟数
}

/**
 * 获取番茄钟历史记录（从 localStorage）
 * @returns 历史记录数组
 */
function getPomodoroHistory(): PomodoroRecord[] {
  try {
    const raw = localStorage.getItem('feiman_pomodoro_history')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * 记录一次番茄钟完成到 localStorage
 */
function recordPomodoroComplete(): void {
  const today = new Date().toISOString().slice(0, 10)
  const history = getPomodoroHistory()
  const todayRecord = history.find((r: PomodoroRecord) => r.date === today)
  if (todayRecord) {
    todayRecord.count++
    todayRecord.minutes += pomodoroDuration.value
  } else {
    history.push({ date: today, count: 1, minutes: pomodoroDuration.value })
  }
  // 只保留最近90天
  const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
  const filtered = history.filter((r: PomodoroRecord) => r.date >= cutoff)
  localStorage.setItem('feiman_pomodoro_history', JSON.stringify(filtered))
}

/** 今日日期字符串 YYYY-MM-DD */
const todayStr = new Date().toISOString().slice(0, 10)

/** 今日完成的番茄数 */
const todayCount = computed((): number => {
  const r = getPomodoroHistory().find((d: PomodoroRecord) => d.date === todayStr)
  return r?.count || 0
})

/** 今日专注分钟数 */
const todayMinutes = computed((): number => {
  const r = getPomodoroHistory().find((d: PomodoroRecord) => d.date === todayStr)
  return r?.minutes || 0
})

/** 本周总专注分钟数 */
const weekTotalMinutes = computed((): number => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const mondayStr = monday.toISOString().slice(0, 10)
  return getPomodoroHistory()
    .filter((r: PomodoroRecord) => r.date >= mondayStr)
    .reduce((sum: number, r: PomodoroRecord) => sum + r.minutes, 0)
})

/** 最佳单日番茄数 */
const bestDayCount = computed((): number => {
  const history = getPomodoroHistory()
  return history.length > 0 ? Math.max(...history.map((r: PomodoroRecord) => r.count)) : 0
})

/** 本周每日数据（用于柱状图） */
interface WeekDayData {
  label: string
  count: number
  isToday: boolean
}

const weekData = computed((): WeekDayData[] => {
  const days = ['一', '二', '三', '四', '五', '六', '日']
  const now = new Date()
  return days.map((label, i): WeekDayData => {
    const d = new Date(now)
    d.setDate(now.getDate() - ((now.getDay() + 6) % 7) + i)
    const dateStr = d.toISOString().slice(0, 10)
    const record = getPomodoroHistory().find((r: PomodoroRecord) => r.date === dateStr)
    return {
      label,
      count: record?.count || 0,
      isToday: dateStr === todayStr,
    }
  })
})

/** 本周最大番茄数（用于柱状图归一化） */
const maxWeekCount = computed(() => Math.max(...weekData.value.map(d => d.count), 1))

// ==================== 今日学习摘要 ====================

/** 今日日期格式化显示（如 "6月4日 周三"） */
const todayDate = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[now.getDay()]
  return `${month}月${day}日 ${weekDay}`
})

/** 获取今天的日期字符串（YYYY-MM-DD 格式，用于比较） */
function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 从 localStorage 统计今日学习数据（动态读取，非 mock 值）
 * 包含：讲解次数、复习卡数、专注时长、连续天数
 */
const todayStats = computed(() => {
  const today = getTodayDateString()

  // 1. 讲解次数：统计 feiman_sessions 中今天创建的记录数
  let explainCount = 0
  try {
    const sessionsData = localStorage.getItem('feiman_sessions')
    if (sessionsData) {
      const sessions = JSON.parse(sessionsData)
      if (Array.isArray(sessions)) {
        // session 可能有 createdAt / created_at / date 字段包含日期信息
        explainCount = sessions.filter((s: any) => {
          const createdAt = s.createdAt || s.created_at || s.date || ''
          return createdAt.toString().startsWith(today)
        }).length
      }
    }
  } catch {
    // JSON 解析失败时忽略
  }

  // 2. 复习卡数：优先从 feiman_daily_stats 读取，其次从 feiman_review_cards 中统计今天有变化的卡片
  let reviewCards = 0
  try {
    // 方案一：从每日统计中读取
    const dailyStatsData = localStorage.getItem('feiman_daily_stats')
    if (dailyStatsData) {
      const dailyStats = JSON.parse(dailyStatsData)
      if (Array.isArray(dailyStats)) {
        const todayStat = dailyStats.find((s: any) => s.date === today)
        reviewCards = todayStat?.reviewCount || 0
      } else if (dailyStats.date === today) {
        reviewCards = dailyStats.reviewCount || 0
      } else if (dailyStats[today]) {
        reviewCards = dailyStats[today].reviewCount || 0
      }
    }

    // 方案二：若每日统计无数据，则从复习卡片中统计今天被复习过的卡片数（reviewCount > 0 且 createdAt 是今天或 nextReview 有更新）
    if (reviewCards === 0) {
      for (const key of ['feiman_review_cards', 'feiman_cards']) {
        const cardsRaw = localStorage.getItem(key)
        if (cardsRaw) {
          const cards = JSON.parse(cardsRaw)
          if (Array.isArray(cards)) {
            // 统计今天有复习活动的卡片：reviewCount > 0 且 lastReview 日期为今天
            reviewCards = cards.filter((c: any) => {
              const lastReview = c.lastReview || c.reviewedAt || ''
              return c.reviewCount > 0 && lastReview.toString().startsWith(today)
            }).length
            if (reviewCards > 0) break // 找到数据就停止
          }
        }
      }
    }
  } catch {
    // JSON 解析失败时忽略
  }

  // 3. 专注时长：从 feiman_pomodoro_history 读取今日总分钟数（与上方番茄钟统计数据源一致）
  let focusMinutes = 0
  try {
    const historyRaw = localStorage.getItem('feiman_pomodoro_history')
    if (historyRaw) {
      const history = JSON.parse(historyRaw)
      if (Array.isArray(history)) {
        const todayRecord = history.find((r: PomodoroRecord) => r.date === today)
        focusMinutes = todayRecord?.minutes || 0
      }
    }
  } catch {
    // 解析失败时默认为0
  }

  // 4. 连续天数：从 feiman_streak_days 读取
  let streakDays = 1 // 默认值
  try {
    const streakData = localStorage.getItem('feiman_streak_days')
    if (streakData) {
      const days = parseInt(streakData, 10)
      streakDays = isNaN(days) ? 1 : days
    }
  } catch {
    // 解析失败时使用默认值
  }

  return { explainCount, reviewCards, focusMinutes, streakDays }
})
</script>
