import { useStorage } from '@/composables/useStorage'
import type { UserProfile } from '@/types'

export const useUserStore = () => {
  const profile = useStorage<UserProfile>('feiman_user_profile', {
    userName: 'Alex Walker',
    avatar: '',
    level: 12,
    streakDays: 12,
    themeColor: '#4F6EF7',
    darkMode: false,
    reminderRules: []
  })

  return { profile }
}
