export interface UserProfile {
  userName: string
  avatar: string
  level: number
  streakDays: number
  themeColor: string
  darkMode: boolean
  reminderRules: ReminderRule[]
}

export interface ReminderRule {
  id: string
  type: 'flashcard' | 'explain' | 'review'
  enabled: boolean
  time: string
}
