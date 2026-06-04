import { ref, onUnmounted } from 'vue'

export interface UseSwipeOptions {
  /** 左滑触发的回调（如删除） */
  onSwipeLeft?: () => void
  /** 右滑触发的回调（如标记） */
  onSwipeRight?: () => void
  /** 触发阈值（像素），默认 80 */
  threshold?: number
  /** 最大滑动距离比例（相对于元素宽度），默认 0.35 */
  maxRatio?: number
}

/**
 * 滑动手势 Hook
 * 用于移动端列表项的左滑删除、右滑标记操作
 */
export function useSwipeGesture(options: UseSwipeOptions) {
  const threshold = options.threshold || 80
  const translateX = ref(0)
  let startX = 0
  let startY = 0
  let startTime = 0
  let element: HTMLElement | null = null
  let swiped = false

  function onTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
    translateX.value = 0
    swiped = false
  }

  function onTouchMove(e: TouchEvent) {
    if (!element) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - startX
    const diffY = currentY - startY

    // 阻止纵向滚动干扰（仅在水平滑动幅度更大时）
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault()
    }

    const maxDist = element.offsetWidth * (options.maxRatio || 0.35)
    // 增加阻力
    const resistance = diffX > 0
      ? Math.min(diffX * 0.6, maxDist)
      : Math.max(diffX * 0.6, -maxDist)

    translateX.value = resistance
  }

  function onTouchEnd() {
    if (!translateX.value) return

    if (translateX.value <= -threshold) {
      // 左滑
      options.onSwipeLeft?.()
      translateX.value = 0
      swiped = true
    } else if (translateX.value >= threshold) {
      // 右滑
      options.onSwipeRight?.()
      translateX.value = 0
      swiped = true
    } else {
      // 弹回
      translateX.value = 0
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

  return { translateX, init, cleanup }
}
