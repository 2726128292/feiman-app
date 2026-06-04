/**
 * 自动备份 Composable
 * 定期将 localStorage 数据备份到内部副本
 * 数据损坏时可一键恢复
 */

const BACKUP_KEY = 'feiman_auto_backup'
const BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24小时
const MAX_BACKUPS = 7 // 保留最近7天

/** 备份条目接口 */
interface BackupEntry {
  date: string           // ISO 字符串
  data: Record<string, any>
  size: number           // 字符数
}

export function useAutoBackup() {
  /** 创建一次自动备份 */
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

  /** 检查是否需要备份（超过24小时未备份则执行） */
  function checkAndBackup(): void {
    const raw = localStorage.getItem(BACKUP_KEY)
    if (!raw) {
      createBackup()
      return
    }

    const backups: BackupEntry[] = JSON.parse(raw)
    if (backups.length === 0) {
      createBackup()
      return
    }

    const lastBackupDate = new Date(backups[0].date).getTime()
    const now = Date.now()

    if (now - lastBackupDate >= BACKUP_INTERVAL_MS) {
      createBackup()
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

  return { createBackup, checkAndBackup, getBackups, restoreFromBackup, clearBackups }
}
