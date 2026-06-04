import type { UserProfile, FeynmanSession, ReviewCard, Achievement } from '@/types'

const UNLOCKED_KEY = 'feiman_unlocked_achievements'

function getUnlockedTypes(): Set<string> {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveUnlockedTypes(types: Set<string>) {
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...types]))
  } catch {
    // ignore
  }
}

export function checkAchievements(
  profile: UserProfile,
  sessions: FeynmanSession[],
  cards: ReviewCard[]
): Achievement[] {
  const unlocked = getUnlockedTypes()
  const newlyUnlocked: Achievement[] = []

  // --- 连续打卡成就 ---
  const streakMilestones = [3, 7, 14, 30, 60, 100]
  for (const day of streakMilestones) {
    const key = `streak_${day}`
    if (!unlocked.has(key) && profile.streakDays >= day) {
      unlocked.add(key)
      newlyUnlocked.push({
        type: 'streak',
        level: day,
        unlockedAt: new Date().toISOString(),
        icon: '🔥',
        name: `连续打卡 ${day} 天`,
        description: `保持每日学习不间断，已连续打卡 ${day} 天！`,
      })
    }
  }

  // --- 讲解达人成就 ---
  const sessionMilestones = [5, 10, 20, 50]
  for (const count of sessionMilestones) {
    const key = `explainer_${count}`
    if (!unlocked.has(key) && sessions.length >= count) {
      const avgScore = sessions.reduce((s, c) => s + c.score, 0) / sessions.length
      if (avgScore >= 75) {
        unlocked.add(key)
        newlyUnlocked.push({
          type: 'explainer',
          level: count,
          unlockedAt: new Date().toISOString(),
          icon: '🎯',
          name: '讲解达人',
          description: `累计完成 ${count} 次费曼讲解，平均清晰度 ${Math.round(avgScore)} 分。`,
        })
      }
    }
  }

  // --- 图谱探索者 ---
  const exploredTopics = new Set(sessions.map((s) => s.topicId)).size
  const topicMilestones = [3, 5, 10]
  for (const n of topicMilestones) {
    const key = `graph_explorer_${n}`
    if (!unlocked.has(key) && exploredTopics >= n) {
      unlocked.add(key)
      newlyUnlocked.push({
        type: 'graph_explorer',
        level: n,
        unlockedAt: new Date().toISOString(),
        icon: '🕸️',
        name: '图谱探索者',
        description: `已在 ${exploredTopics} 个不同主题上完成费曼讲解。`,
      })
    }
  }

  // --- 测验满分 ---
  const perfectQuizCount = cards.filter((c) => c.easeFactor >= 2.9 && c.reviewCount >= 3).length
  const quizMilestones = [1, 3, 5, 10]
  for (const n of quizMilestones) {
    const key = `quiz_perfect_${n}`
    if (!unlocked.has(key) && perfectQuizCount >= n) {
      unlocked.add(key)
      newlyUnlocked.push({
        type: 'quiz_perfect',
        level: n,
        unlockedAt: new Date().toISOString(),
        icon: '🏆',
        name: '测验满分',
        description: `已有 ${perfectQuizCount} 张卡片达到熟练掌握水平。`,
      })
    }
  }

  saveUnlockedTypes(unlocked)

  return newlyUnlocked
}
