import { ref, computed, onUnmounted, type Ref } from 'vue'

/**
 * 虚拟滚动 Hook（简化版）
 * 只渲染可视区域内的列表项，适用于长列表性能优化
 */
export function useVirtualScroll<T>(options: {
  items: T[] | Ref<T[]>
  itemHeight: number
  containerHeight: number
  overscan?: number
}) {
  const overscan = options.overscan || 5
  const scrollTop = ref(0)
  let containerEl: HTMLElement | null = null

  /** 解构 items（支持 Ref 和普通数组） */
  const itemsRef = 'value' in options.items ? (options.items as Ref<T[]>) : ref(options.items)

  /** 总条目数 */
  const totalCount = computed(() => itemsRef.value.length)

  /** 总内容高度 */
  const totalHeight = computed(() => totalCount.value * options.itemHeight)

  /** 可视区域起始索引 */
  const startIndex = computed(() => {
    const start = Math.floor(scrollTop.value / options.itemHeight) - overscan
    return Math.max(0, start)
  })

  /** 可视区域结束索引 */
  const endIndex = computed(() => {
    const end = Math.ceil((scrollTop.value + options.containerHeight) / options.itemHeight) + overscan
    return Math.min(totalCount.value - 1, end)
  })

  /** 当前可见的子集 */
  const visibleItems = computed(() =>
    itemsRef.value.slice(startIndex.value, endIndex.value + 1)
  )

  /** 顶部偏移量（撑开空白区域） */
  const offsetY = computed(() => startIndex.value * options.itemHeight)

  /** 滚动事件处理器 */
  function handleScroll(e: Event) {
    scrollTop.value = (e.target as HTMLElement).scrollTop
  }

  /** 绑定容器元素 */
  function init(el: HTMLElement | null) {
    containerEl = el
    if (el) el.addEventListener('scroll', handleScroll, { passive: true })
  }

  /** 清理事件监听 */
  function cleanup() {
    if (containerEl) containerEl.removeEventListener('scroll', handleScroll)
  }

  onUnmounted(() => {
    cleanup()
  })

  return { visibleItems, offsetY, totalHeight, init, cleanup }
}
