<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">成就系统</h1>
        <p class="text-sm text-slate-500 mt-0.5">让坚持有反馈</p>
      </div>

      <!-- 等级进度横幅 -->
      <div class="rounded-2xl p-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white">
        <p class="text-xs font-medium text-white/80 mb-1">已解锁成就</p>
        <p class="text-xl font-bold mb-3">{{ unlockedCount }} / {{ allBadges.length }} 个徽章</p>
        <div class="w-full h-2.5 bg-white/25 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            class="h-full bg-white rounded-full transition-all duration-500"
            :style="{ width: (unlockedCount / allBadges.length * 100) + '%' }"
          />
        </div>
        <p class="text-[11px] text-white/70 mt-1.5">继续努力解锁更多！</p>
      </div>

      <!-- 动态徽章列表 -->
      <div class="space-y-3">
        <div
          v-for="badge in allBadges"
          :key="badge.type + '-' + badge.level"
          class="bg-white rounded-2xl shadow-sm p-4 transition-colors"
          :class="{
            'ring-2 ring-amber-300/50': badge.status === 'unlocked',
            'opacity-60': badge.status === 'locked',
          }"
        >
          <div class="flex items-start gap-3">
            <!-- 图标区域 -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 text-lg"
              :class="badge.status === 'unlocked'
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300'
                : badge.status === 'in-progress'
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-50 border-slate-100'
              "
            >
              {{ badge.icon }}
            </div>

            <!-- 信息区 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold" :class="badge.status === 'unlocked' ? 'text-amber-700' : 'text-slate-800'">
                  {{ badge.name }}
                </p>
                <span
                  class="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  :class="{
                    'bg-emerald-100 text-emerald-700': badge.status === 'unlocked',
                    'bg-blue-50 text-blue-600': badge.status === 'in-progress',
                    'bg-slate-100 text-slate-400': badge.status === 'locked',
                  }"
                >
                  {{ statusText(badge.status) }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ badge.description }}</p>

              <!-- 进度条（仅进行中显示） -->
              <div v-if="badge.status === 'in-progress' && badge.maxProgress > 0" class="mt-2">
                <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full transition-all duration-500"
                    :style="{ width: Math.min(100, (badge.progress / badge.maxProgress) * 100) + '%' }"
                  />
                </div>
                <p class="text-[10px] text-slate-400 mt-1">{{ badge.progress }} / {{ badge.maxProgress }}</p>
              </div>
            </div>

            <!-- 状态图标 / 分享按钮 -->
            <div class="shrink-0 pt-1 flex items-center gap-1">
              <CheckCircle v-if="badge.status === 'unlocked'" :size="18" class="text-emerald-500" />
              <Clock v-else-if="badge.status === 'in-progress'" :size="18" class="text-blue-400" />
              <Lock v-else :size="18" class="text-slate-300" />
              <!-- 已解锁成就的分享按钮 -->
              <button
                v-if="badge.status === 'unlocked'"
                class="p-1 rounded-full text-slate-400 hover:text-emerald-500 active:bg-emerald-50 transition-colors"
                @click.stop="handleShareBadge(badge)"
              >
                <Share2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 积分统计卡片 -->
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-semibold text-slate-800">学习统计</h3>
          <span class="text-xs text-slate-400">实时数据</span>
        </div>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-xl font-bold text-[#4F6EF7]">{{ streakDays }}</p>
            <p class="text-[11px] text-slate-400 mt-0.5">连续天数</p>
          </div>
          <div>
            <p class="text-xl font-bold text-emerald-600">{{ sessionCount }}</p>
            <p class="text-[11px] text-slate-400 mt-0.5">讲解次数</p>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-500">{{ reviewCount }}</p>
            <p class="text-[11px] text-slate-400 mt-0.5">复习卡片</p>
          </div>
        </div>
      </div>

      <!-- ====== 功能17：我的学习曲线 ====== -->
      <div class="bg-white rounded-2xl shadow-sm p-4 mt-4">
        <h3 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <TrendingUp :size="15" class="text-emerald-500" /> 我的学习曲线
        </h3>

        <!-- 简易折线图（纯 SVG 实现） -->
        <div class="relative h-32 w-full">
          <svg viewBox="0 0 300 100" class="w-full h-full" preserveAspectRatio="none">
            <!-- Y轴网格线 -->
            <line x1="0" y1="25" x2="300" y2="25" stroke="#f1f5f9" stroke-width="0.5" />
            <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f5f9" stroke-width="0.5" />
            <line x1="0" y1="75" x2="300" y2="75" stroke="#f1f5f9" stroke-width="0.5" />

            <!-- 折线 -->
            <polyline
              :points="curvePoints"
              fill="none"
              stroke="#4F6EF7"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <!-- 数据点 -->
            <circle
              v-for="(pt, idx) in curvePointsArray"
              :key="idx"
              :cx="pt.x"
              :cy="pt.y"
              r="3"
              fill="#4F6EF7"
            />

            <!-- 渐变填充 -->
            <polygon
              :points="curveAreaPoints"
              fill="url(#curveGradient)"
              opacity="0.15"
            />

            <defs>
              <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4F6EF7" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#4F6EF7" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <!-- X轴标签 -->
          <div class="flex justify-between mt-1">
            <span v-for="label in curveLabels" :key="label" class="text-[9px] text-slate-400">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CheckCircle, Clock, Lock, Share2, TrendingUp } from 'lucide-vue-next'
import { useShare } from '@/composables/useShare'

// 分享功能
const { shareAchievement } = useShare()

interface BadgeItem {
  type: string
  level: number
  unlockedAt: string
  icon: string
  name: string
  description: string
  progress: number
  maxProgress: number
  status: 'unlocked' | 'in-progress' | 'locked'
}

// ====== 从 localStorage 读取真实数据 ======
const streakDays = ref(0)
const sessionCount = ref(0)
const reviewCount = ref(0)
const hasApiKey = ref(false)
const topicCount = ref(0)
const hasPerfectScore = ref(false)

function loadRealData() {
  try {
    // 用户档案 - 连续天数
    const profileRaw = localStorage.getItem('feiman_user_profile')
    if (profileRaw) {
      const profile = JSON.parse(profileRaw)
      streakDays.value = profile.streakDays || 0
    }

    // 费曼讲解 sessions
    const sessionsRaw = localStorage.getItem('feiman_sessions')
    if (sessionsRaw) {
      const sessions = JSON.parse(sessionsRaw)
      sessionCount.value = Array.isArray(sessions) ? sessions.length : 0
      // 检查是否有满分记录
      hasPerfectScore.value = Array.isArray(sessions) && sessions.some((s: any) => s.score >= 90)
    }

    // 复习卡片数
    const cardsRaw = localStorage.getItem('feiman_cards')
    if (cardsRaw) {
      const cards = JSON.parse(cardsRaw)
      reviewCount.value = Array.isArray(cards)
        ? cards.filter((c: any) => c.reviewCount > 0).length
        : 0
    }

    // AI 配置
    const configRaw = localStorage.getItem('feiman_deepseek_config')
    if (configRaw) {
      const config = JSON.parse(configRaw)
      hasApiKey.value = !!(config && config.apiKey)
    }

    // 学习路径/主题
    const topicsRaw = localStorage.getItem('feiman_topics')
    if (topicsRaw) {
      const topics = JSON.parse(topicsRaw)
      topicCount.value = Array.isArray(topics) ? topics.length : 0
    }
  } catch {
    // ignore parse errors
  }
}

// ====== 定义所有成就 ======
function checkAllAchievements(): BadgeItem[] {
  loadRealData()

  const badges: BadgeItem[] = []

  // --- 连续打卡系列 ---
  const streakMilestones = [
    { key: 'streak-days-3', days: 3, icon: '🔥', name: '初出茅庐', desc: '连续打开 App 3 天' },
    { key: 'streak-days-7', days: 7, icon: '🔥', name: '一周达人', desc: '连续打卡 7 天' },
    { key: 'streak-days-30', days: 30, icon: '🔥', name: '月度坚持者', desc: '连续学习 30 天' },
  ]

  for (const m of streakMilestones) {
    const unlocked = streakDays.value >= m.days
    badges.push({
      type: m.key,
      level: m.days,
      unlockedAt: unlocked ? new Date().toISOString() : '',
      icon: m.icon,
      name: m.name,
      description: m.desc,
      progress: streakDays.value,
      maxProgress: m.days,
      status: unlocked ? 'unlocked' : streakDays.value > 0 ? 'in-progress' : 'locked',
    })
  }

  // --- 讲解系列 ---
  const explainMilestones = [
    { key: 'explain-first', count: 1, icon: '🎯', name: '初次讲解', desc: '完成首次费曼讲解' },
    { key: 'explain-5', count: 5, icon: '🎯', name: '小试牛刀', desc: '完成 5 次讲解' },
    { key: 'explain-20', count: 20, icon: '🎯', name: '讲解达人', desc: '完成 20 次讲解' },
  ]

  for (const m of explainMilestones) {
    const unlocked = sessionCount.value >= m.count
    badges.push({
      type: m.key,
      level: m.count,
      unlockedAt: unlocked ? new Date().toISOString() : '',
      icon: m.icon,
      name: m.name,
      description: m.desc,
      progress: sessionCount.value,
      maxProgress: m.count,
      status: unlocked ? 'unlocked' : sessionCount.value > 0 ? 'in-progress' : 'locked',
    })
  }

  // --- 闪卡复习系列 ---
  const cardMilestones = [
    { key: 'card-review-10', count: 10, icon: '📇', name: '闪卡新手', desc: '复习 10 张闪卡' },
    { key: 'card-review-50', count: 50, icon: '📇', name: '闪卡达人', desc: '复习 50 张闪卡' },
  ]

  for (const m of cardMilestones) {
    const unlocked = reviewCount.value >= m.count
    badges.push({
      type: m.key,
      level: m.count,
      unlockedAt: unlocked ? new Date().toISOString() : '',
      icon: m.icon,
      name: m.name,
      description: m.desc,
      progress: reviewCount.value,
      maxProgress: m.count,
      status: unlocked ? 'unlocked' : reviewCount.value > 0 ? 'in-progress' : 'locked',
    })
  }

  // --- 满分自评 ---
  badges.push({
    type: 'card-perfect',
    level: 90,
    unlockedAt: hasPerfectScore ? new Date().toISOString() : '',
    icon: '⭐',
    name: '完美掌握',
    description: '某次自评全选"掌握"，评分达到 90+',
    progress: hasPerfectScore ? 100 : 0,
    maxProgress: 100,
    status: hasPerfectScore ? 'unlocked' : sessionCount.value > 0 ? 'in-progress' : 'locked',
  })

  // --- 创建学习路径 ---
  badges.push({
    type: 'topic-create',
    level: 1,
    unlockedAt: topicCount.value >= 1 ? new Date().toISOString() : '',
    icon: '🗺️',
    name: '路径创建者',
    description: '创建首个学习路径',
    progress: topicCount.value,
    maxProgress: 1,
    status: topicCount.value >= 1 ? 'unlocked' : 'locked',
  })

  // --- 首次使用AI ---
  badges.push({
    type: 'ai-user',
    level: 1,
    unlockedAt: hasApiKey ? new Date().toISOString() : '',
    icon: '🤖',
    name: 'AI 探索者',
    description: '首次使用 AI 助手',
    progress: hasApiKey ? 1 : 0,
    maxProgress: 1,
    status: hasApiKey ? 'unlocked' : 'locked',
  })

  return badges
}

const allBadges = ref<BadgeItem[]>([])
const unlockedCount = computed(() => allBadges.value.filter(b => b.status === 'unlocked').length)

function statusText(status: string): string {
  switch (status) {
    case 'unlocked': return '已解锁'
    case 'in-progress': return '进行中'
    case 'locked': return '未解锁'
    default: return ''
  }
}

// 分享单个成就
async function handleShareBadge(badge: BadgeItem) {
  await shareAchievement({
    title: badge.name,
    description: badge.description,
    earnedAt: badge.unlockedAt,
  })
}

onMounted(() => {
  allBadges.value = checkAllAchievements()
})

// ==================== 功能17：学习曲线数据计算 ====================

/** 最近 7 天的每日活跃度数据 */
const curveData = computed(() => {
  const data: Array<{ date: string; value: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dateStr = d.toISOString().slice(0, 10)
    let value = 0

    // 当天讲解最高分
    try {
      const sessions = JSON.parse(localStorage.getItem('feiman_sessions') || '[]')
      const daySessions = sessions.filter((s: any) => s.createdAt?.startsWith(dateStr))
      if (daySessions.length > 0) {
        value = Math.max(...daySessions.map((s: any) => s.score || 0))
      }
    } catch { /* 解析失败时忽略 */ }

    // 加上番茄钟加成（每个番茄 +5 分）
    try {
      const history = JSON.parse(localStorage.getItem('feiman_pomodoro_history') || '[]')
      const p = history.find((h: any) => h.date === dateStr)
      if (p) value += p.count * 5
    } catch { /* 解析失败时忽略 */ }

    data.push({ date: dateStr, value })
  }
  return data
})

/** SVG 折线 points 属性字符串 */
const curvePoints = computed(() => {
  if (curveData.value.length === 0) return ''
  const maxVal = Math.max(...curveData.value.map(d => d.value), 10)
  return curveData.value
    .map((d, i) => {
      const x = (i / (curveData.value.length - 1)) * 300
      const y = 100 - (d.value / maxVal) * 90 - 5
      return `${x},${y}`
    })
    .join(' ')
})

/** SVG 填充区域 points 字符串 */
const curveAreaPoints = computed(() => {
  if (curveData.value.length === 0) return ''
  const pts = curvePoints.value.split(' ').map(p => p.split(','))
  const area = [...pts, `300,100`, `0,100`]
  return area.map((p: any) => p.join(',')).join(' ')
})

/** 数据点坐标数组（用于渲染 circle） */
const curvePointsArray = computed(() =>
  curvePoints.value.split(' ').map(p => {
    const [x, y] = p.split(',')
    return { x: parseFloat(x), y: parseFloat(y) }
  })
)

/** X 轴日期标签 */
const curveLabels = computed(() =>
  curveData.value.map(d => {
    const date = new Date(d.date + 'T00:00:00')
    return `${date.getMonth() + 1}/${date.getDate()}`
  })
)
</script>
