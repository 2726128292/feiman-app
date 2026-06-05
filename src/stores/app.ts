import { ref } from 'vue'
import { useStorage } from '@/composables/useStorage'

export const useAppStore = () => {
  const { data: hasSeenSplash } = useStorage<boolean>('feiman_has_seen_splash', false)

  const currentTab = ref(0)

  function markSplashSeen() {
    hasSeenSplash.value = true
  }

  function setCurrentTab(tab: number) {
    currentTab.value = tab
  }

  return { hasSeenSplash, currentTab, markSplashSeen, setCurrentTab }
}
