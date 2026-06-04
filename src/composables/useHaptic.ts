/**
 * 触觉反馈 Hook
 * 在关键操作时触发手机振动反馈
 * 仅在支持的设备上生效（需要 navigator.vibrate API）
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection'

/** 振动模式映射（毫秒数组） */
const patterns: Record<HapticPattern, number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  success: [10, 50, 10],
  error: [30, 50, 30, 50, 30],
  warning: [15, 30, 15],
  selection: [5],
}

/**
 * 触发触觉反馈
 * @param pattern 反馈类型，默认为轻触
 */
export function triggerHaptic(pattern: HapticPattern = 'light'): void {
  try {
    if ('vibrate' in navigator) {
      ;(navigator as any).vibrate(patterns[pattern])
    }
  } catch {
    // 静默失败：部分浏览器不支持 Vibration API
  }
}
