/**
 * XP 经验值等级系统
 * 每次学习操作获得 XP，累计升级获得成就
 */

export interface XPState {
  totalXP: number
  level: number
  xpToNextLevel: number
  currentLevelXP: number
  history: XPEvent[]
}

export interface XPEvent {
  action: string
  amount: number
  timestamp: string
}

/** 每级所需 XP（递增式） */
function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1))
}

/** 操作对应的 XP 奖励 */
const XP_REWARDS: Record<string, number> = {
  explain_session: 50,     // 完成一次讲解
  perfect_score: 100,      // 满分讲解
  flashcard_review: 20,    // 复习一张闪卡
  pomodoro_complete: 30,   // 完成一个番茄钟
  daily_login: 10,         // 每日登录
  streak_day: 25,          // 连续打卡一天
  chapter_complete: 40,    // 完成一个章节
  quiz_perfect: 80,        // 测验满分
  create_topic: 30,        // 创建学习路径
  create_card: 10,         // 创建闪卡
}

const STORAGE_KEY = 'feiman_xp_state'

export function useXPSystem() {
  /** 从 localStorage 加载状态 */
  function loadState(): XPState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch { /* 解析失败时返回默认值 */ }
    return { totalXP: 0, level: 1, xpToNextLevel: xpForLevel(1), currentLevelXP: 0, history: [] }
  }

  /** 将状态持久化到 localStorage */
  function saveState(state: XPState) {
    try {
      // 历史只保留最近 100 条
      if (state.history.length > 100) state.history = state.history.slice(0, 100)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch { /* 写入失败时静默处理 */ }
  }

  /**
   * 获得 XP
   * @param action 操作类型（对应 XP_REWARDS 的 key）
   * @param count 重复次数（默认 1）
   * @returns 更新后的状态
   */
  function gainXP(action: string, count = 1): XPState {
    const state = loadState()
    const amount = (XP_REWARDS[action] || 10) * count

    state.totalXP += amount
    state.history.unshift({ action, amount, timestamp: new Date().toISOString() })

    // 根据总 XP 重新计算等级
    let xpNeeded = xpForLevel(state.level)
    let remaining = state.totalXP
    let level = 1
    while (remaining >= xpNeeded) {
      remaining -= xpNeeded
      level++
      xpNeeded = xpForLevel(level)
    }

    state.level = level
    state.currentLevelXP = remaining
    state.xpToNextLevel = xpNeeded

    saveState(state)
    return state
  }

  /** 获取当前状态（不写入） */
  function getState(): XPState {
    return loadState()
  }

  return { gainXP, getState, xpForLevel }
}
