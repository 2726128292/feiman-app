/**
 * 自动备份 Composable
 * 定期将 localStorage 数据备份到内部副本
 * 数据损坏时可一键恢复
 */

const BACKUP_KEY = 'feiman_auto_backup'
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24小时
const MAX_BACKUPS = 7 // 保留最近7天
const BACKUP_VERSION = '1.0'
const BATCH_SIZE = 3 // 每批处理的 key 数量
const MAX_VALUE_SIZE = 100 * 1024 // 100KB，超过此大小的 value 不备份

/** 需要跳过的不需要备份的 key */
const SKIP_KEYS = new Set(['feiman_pomodoro_history'])

/** 备份条目接口 */
interface BackupEntry {
  date: string           // ISO 字符串
  data: Record<string, any>
  size: number           // 字符数
}

export function useAutoBackup() {
  /** 创建一次自动备份（异步分片，避免 UI 冻结） */
  async function createBackupAsync(): Promise<boolean> {
    try {
      const backup: BackupEntry = {
        date: new Date().toISOString(),
        data: {},
        size: 0,
      }

      // 收集需要备份的 key（过滤跳过的 key 和超大 value）
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith('feiman_')) continue
        if (SKIP_KEYS.has(key)) continue

        const rawValue = localStorage.getItem(key)
        if (rawValue && rawValue.length > MAX_VALUE_SIZE) continue

        keys.push(key)
      }

      // 分批处理：每批 BATCH_SIZE 个 key，避免长时间阻塞
      for (let i = 0; i < keys.length; i += BATCH_SIZE) {
        const batch = keys.slice(i, i + BATCH_SIZE)
        for (const key of batch) {
          try {
            backup.data[key] = JSON.parse(localStorage.getItem(key) || '{}')
            backup.size += JSON.stringify(backup.data[key]).length
          } catch {
            backup.data[key] = localStorage.getItem(key)
          }
        }
        // 让出主线程，保持 UI 响应
        await new Promise(resolve => setTimeout(resolve, 0))
      }

      // 最终写入前再让出一次，避免大 JSON 序列化卡顿
      await new Promise(resolve => setTimeout(resolve, 0))

      // 读取现有备份列表
      const raw = localStorage.getItem(BACKUP_KEY)
      const backups: BackupEntry[] = raw ? JSON.parse(raw) : []

      backups.unshift(backup)

      // 只保留最近 N 次
      if (backups.length > MAX_BACKUPS) backups.length = MAX_BACKUPS

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups))
      return true
    } catch {
      return false
    }
  }

  /** 创建一次自动备份（同步版本，保留兼容） */
  function createBackup(): boolean {
    try {
      const backup: BackupEntry = {
        date: new Date().toISOString(),
        data: {},
        size: 0,
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('feiman_')) {
          try {
            backup.data[key] = JSON.parse(localStorage.getItem(key)!)
            backup.size += JSON.stringify(backup.data[key]).length
          } catch {
            backup.data[key] = localStorage.getItem(key)
          }
        }
      }

      // 读取现有备份列表
      const raw = localStorage.getItem(BACKUP_KEY)
      const backups: BackupEntry[] = raw ? JSON.parse(raw) : []

      backups.unshift(backup)

      // 只保留最近 N 次
      if (backups.length > MAX_BACKUPS) backups.length = MAX_BACKUPS

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups))
      return true
    } catch {
      return false
    }
  }

  /** 检查是否需要备份（超过24小时未备份则执行，异步避免 UI 冻结） */
  async function checkAndBackup(): Promise<void> {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) {
      await createBackupAsync()
      return
    }

    const backups: BackupEntry[] = JSON.parse(raw)
    if (backups.length === 0) {
      await createBackupAsync()
      return
    }

    const lastBackupDate = new Date(backups[0].date).getTime()
    const now = Date.now()

    if (now - lastBackupDate >= BACKUP_INTERVAL_MS) {
      await createBackupAsync()
    }
  }

  /** 获取所有备份 */
  function getBackups(): BackupEntry[] {
    try {
      const raw = localStorage.getItem(BACKUP_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  /** 从指定备份恢复 */
  function restoreFromBackup(date: string): boolean {
    const backups = getBackups()
    const target = backups.find(b => b.date === date)
    if (!target) return false

    for (const [key, value] of Object.entries(target.data)) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }

    return true
  }

  /** 清理所有备份 */
  function clearBackups(): void {
    localStorage.removeItem(BACKUP_KEY)
  }

  return { createBackup, createBackupAsync, checkAndBackup, getBackups, restoreFromBackup, clearBackups }
}
