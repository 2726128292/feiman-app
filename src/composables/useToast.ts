import { ref, reactive } from 'vue'

/** Toast 支持的类型 */
export type ToastType = 'success' | 'error' | 'info' | 'warning'

/** 单条 Toast 数据结构 */
export interface ToastItem {
  id: string
  message: string
  type: ToastType
  visible: boolean
}

/** 默认显示时长（毫秒） */
const DEFAULT_DURATION = 2500

/** 离场动画等待时间（毫秒） */
const LEAVE_DELAY = 300

/** 最大同时显示数量 */
const MAX_TOASTS = 3

/** 全局 toast 响应式数组（单例，所有组件共享同一个实例） */
const toasts = ref<ToastItem[]>([])

/**
 * 显示一条 Toast 通知
 * @param message 提示消息
 * @param type 消息类型，默认为 'info'
 * @param duration 显示时长（毫秒），默认 2500
 */
function showToast(message: string, type: ToastType = 'info', duration: number = DEFAULT_DURATION): void {
  // 超过最大数量时移除最旧的一条
  if (toasts.value.length >= MAX_TOASTS) {
    const oldest = toasts.value[0]
    oldest.visible = false
    // 延迟后从数组删除，确保离场动画完成
    setTimeout(() => {
      const idx = toasts.value.findIndex(t => t.id === oldest.id)
      if (idx !== -1) toasts.value.splice(idx, 1)
    }, LEAVE_DELAY)
  }

  // 创建新 toast
  const item: ToastItem = {
    id: crypto.randomUUID(),
    message,
    type,
    visible: true,
  }

  toasts.value.push(item)

  // 自动消失逻辑：duration 后设置 visible=false 触发离场动画，
  // 再等 LEAVE_DELAY 后从数组中彻底移除
  setTimeout(() => {
    item.visible = false
    setTimeout(() => {
      const idx = toasts.value.findIndex(t => t.id === item.id)
      if (idx !== -1) toasts.value.splice(idx, 1)
    }, LEAVE_DELAY)
  }, duration)
}

/**
 * 手动关闭指定 toast（供组件调用）
 */
function closeToast(id: string): void {
  const item = toasts.value.find(t => t.id === id)
  if (!item || !item.visible) return
  item.visible = false
  setTimeout(() => {
    const idx = toasts.value.findIndex(t => t.id === id)
    if (idx !== -1) toasts.value.splice(idx, 1)
  }, LEAVE_DELAY)
}

/**
 * Toast Composable - 在组件中使用全局 Toast 通知系统
 *
 * 使用方式：
 * ```ts
 * const { showToast } = useToast()
 * showToast('操作成功！', 'success')
 * ```
 */
export function useToast() {
  return {
    /** 显示 toast 通知 */
    showToast,
    /** 当前所有 toast 数据（响应式，传给 Toast 组件渲染） */
    toasts,
    /** 手动关闭指定 toast */
    closeToast,
  }
}
