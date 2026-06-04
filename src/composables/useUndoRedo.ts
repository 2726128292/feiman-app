/**
 * 全局撤销/重做 Hook
 * 基于 past/present/future 三栈结构实现
 * 支持任意可序列化数据类型的操作历史管理
 */
import { ref, computed } from 'vue'

/** 撤销状态结构 */
interface UndoState {
  past: any[]
  present: any
  future: any[]
}

export function useUndoRedo(initialValue: any) {
  /** 状态容器：past（撤销栈）、present（当前值）、future（重做栈） */
  const state = ref<UndoState>({
    past: [],
    present: JSON.parse(JSON.stringify(initialValue)),
    future: [],
  })

  /** 当前值（只读计算属性） */
  const currentValue = computed(() => state.value.present)

  /**
   * 执行新操作
   * 将当前状态推入撤销栈，设置新值为 present，并清空重做栈
   * @param newValue 新的操作结果值
   */
  function execute(newValue: any): void {
    state.value.past.push(JSON.parse(JSON.stringify(state.value.present)))
    state.value.present = JSON.parse(JSON.stringify(newValue))
    state.value.future = [] // 新操作清空重做栈
  }

  /**
   * 撤销操作
   * 将当前值推入重做栈，从撤销栈弹出上一个状态作为 present
   * @returns 是否成功撤销（false 表示没有可撤销的历史）
   */
  function undo(): boolean {
    if (state.value.past.length === 0) return false
    const previous = state.value.past.pop()!
    state.value.future.unshift(JSON.parse(JSON.stringify(state.value.present)))
    state.value.present = previous
    return true
  }

  /**
   * 重做操作
   * 将当前值推回撤销栈，从重做栈取出下一个状态作为 present
   * @returns 是否成功重做（false 表示没有可重做的未来）
   */
  function redo(): boolean {
    if (state.value.future.length === 0) return false
    const next = state.value.future.shift()!
    state.value.past.push(JSON.parse(JSON.stringify(state.value.present)))
    state.value.present = next
    return true
  }

  /** 是否可以撤销 */
  const canUndo = computed(() => state.value.past.length > 0)

  /** 是否可以重做 */
  const canRedo = computed(() => state.value.future.length > 0)

  return { currentValue, execute, undo, redo, canUndo, canRedo }
}
