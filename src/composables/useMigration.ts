/**
 * 数据版本迁移系统
 * 当 localStorage 数据结构变更时，自动将旧格式迁移到新格式
 */

const VERSION_KEY = 'feiman_data_version'
const CURRENT_VERSION = 2

/** 迁移任务接口 */
interface Migration {
  version: number
  description: string
  migrate: () => void
}

/** 迁移规则列表（按版本号升序排列） */
const migrations: Migration[] = [
  {
    version: 1,
    description: '初始版本结构',
    migrate: () => {
      // v0 -> v1: 确保 feiman_sessions 有 score 字段
      try {
        const raw = localStorage.getItem('feiman_sessions')
        if (!raw) return
        const sessions = JSON.parse(raw)
        let changed = false
        for (const s of sessions) {
          if (typeof s.score === 'undefined') {
            s.score = s.type === 'voice' ? 75 : 70
            changed = true
          }
        }
        if (changed) {
          localStorage.setItem('feiman_sessions', JSON.stringify(sessions))
        }
      } catch { /* ignore */ }
    },
  },
  {
    version: 2,
    description: '新增知识点 items 字段',
    migrate: () => {
      // v1 -> v2: 为 chapters 添加 items 数组
      try {
        const raw = localStorage.getItem('feiman_topics')
        if (!raw) return
        const topics = JSON.parse(raw)
        let changed = false
        for (const t of topics) {
          if (t.chapters && Array.isArray(t.chapters)) {
            for (const ch of t.chapters) {
              if (!ch.items) {
                ch.items = [
                  { id: crypto.randomUUID(), title: `${ch.title} - 核心概念`, done: false },
                  { id: crypto.randomUUID(), title: `${ch.title} - 关键要点`, done: false },
                ]
                changed = true
              }
            }
          }
        }
        if (changed) {
          localStorage.setItem('feiman_topics', JSON.stringify(topics))
        }
      } catch { /* ignore */ }
    },
  },
]

/**
 * 运行所有待执行的迁移
 * @returns 执行的迁移数量和当前版本号
 */
export function runMigrations(): { executed: number; currentVersion: number } {
  const savedVersion = parseInt(localStorage.getItem(VERSION_KEY) || '0')

  if (savedVersion >= CURRENT_VERSION) {
    return { executed: 0, currentVersion: savedVersion }
  }

  let executed = 0

  for (const migration of migrations) {
    if (migration.version > savedVersion) {
      console.log(`[Migration] Running v${migration.version}: ${migration.description}`)
      try {
        migration.migrate()
        executed++
      } catch (err) {
        console.error(`[Migration] Failed v${migration.version}:`, err)
      }
    }
  }

  localStorage.setItem(VERSION_KEY, String(CURRENT_VERSION))
  return { executed, currentVersion: CURRENT_VERSION }
}
