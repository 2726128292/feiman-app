import { ref, computed, onMounted, watchEffect } from 'vue'
import { useStorage } from './useStorage'

export function useTheme() {
  const { data: darkMode } = useStorage<boolean>('feiman_dark_mode', false)

  const isDark = computed(() => darkMode.value)

  function toggleDark() {
    darkMode.value = !darkMode.value
  }

  function applyDarkMode(dark: boolean) {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  onMounted(() => {
    // 优先使用已持久化的值
    if (darkMode.value !== undefined) {
      applyDarkMode(darkMode.value)
    } else {
      // 回退到系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      darkMode.value = prefersDark
      applyDarkMode(prefersDark)
    }
  })

  // 响应式同步 class
  watchEffect(() => {
    applyDarkMode(darkMode.value)
  })

  return { isDark, toggleDark }
}

