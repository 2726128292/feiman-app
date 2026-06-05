import { ref, watch, onUnmounted, type Ref, type UnwrapRef } from 'vue'

interface UseStorageOptions {
  /** 防抖写入延迟(ms)，默认300。设为0则每次变化立即写入 */
  debounce?: number
}

interface UseStorageReturn<T> {
  /** 响应式数据 */
  data: Ref<T>
  /** 立即持久化到localStorage（跳过防抖） */
  save: () => void
  /** 同 save */
  flush: () => void
}

export function useStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseStorageOptions | number
): UseStorageReturn<T> {
  const opts = typeof options === 'number' ? { debounce: options } : options ?? {}
  const debounceMs = opts.debounce ?? 300

  const data = ref<T>(readValue())

  let writeTimer: ReturnType<typeof setTimeout> | null = null

  function readValue(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }

  function doWrite(val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch {
      // ignore write errors
    }
  }

  function scheduleWrite(val: T): void {
    if (debounceMs <= 0) {
      doWrite(val)
      return
    }
    if (writeTimer !== null) {
      clearTimeout(writeTimer)
    }
    writeTimer = setTimeout(() => {
      doWrite(val)
      writeTimer = null
    }, debounceMs)
  }

  function save(): void {
    flush()
  }

  function flush(): void {
    if (writeTimer !== null) {
      clearTimeout(writeTimer)
      writeTimer = null
    }
    doWrite(data.value)
  }

  watch(
    data,
    (val) => {
      scheduleWrite(val)
    },
    { deep: true }
  )

  onUnmounted(() => {
    if (writeTimer !== null) {
      clearTimeout(writeTimer)
      writeTimer = null
    }
    doWrite(data.value)
  })

  return { data, save, flush } as UseStorageReturn<T>
}
