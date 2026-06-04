import { ref, onUnmounted } from 'vue'

export interface UsePullRefreshOptions {
  onRefresh: () => void | Promise<void>
  threshold?: number
}

/**
 * 下拉刷新 Hook - 用于移动端列表页面
 */
export function usePullRefresh(options: UsePullRefreshOptions) {
  const threshold = options.threshold || 80
  const isPulling = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)

  let startY = 0
  let element: HTMLElement | null = null

  function onTouchStart(e: TouchEvent) {
    if (element && element.scrollTop === 0) {
      startY = e.touches[0].clientY
      isPulling.value = true
    }
  }

  function onTouchMove(e: TouchEvent) {
    if (!isPulling.value || isRefreshing.value) return
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    if (diff > 0) {
      e.preventDefault()
      pullDistance.value = Math.min(diff * 0.4, threshold * 1.5)
    }
  }

  async function onTouchEnd() {
    if (!isPulling.value) return
    isPulling.value = false
    if (pullDistance.value >= threshold && !isRefreshing.value) {
      isRefreshing.value = true
      try {
        await options.onRefresh()
      } finally {
        setTimeout(() => {
          isRefreshing.value = false
          pullDistance.value = 0
        }, 500)
      }
    } else {
      pullDistance.value = 0
    }
  }

  function init(el: HTMLElement | null) {
    if (!el) return
    element = el
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
  }

  function cleanup() {
    if (element) {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
      element = null
    }
  }

  onUnmounted(cleanup)

  return { isPulling, isRefreshing, pullDistance, init, cleanup }
}
