import { ref, watch } from 'vue'

export function useStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(readValue())

  function readValue(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  watch(
    data,
    (val) => {
      try {
        localStorage.setItem(key, JSON.stringify(val))
      } catch {
        // ignore write errors
      }
    },
    { deep: true }
  )

  return data
}
