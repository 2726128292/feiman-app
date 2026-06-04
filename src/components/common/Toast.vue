<template>
  <!-- 全局 Toast 通知容器：固定在屏幕顶部居中 -->
  <div class="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center pointer-events-none pt-4 px-4">
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col items-center gap-2 w-full max-w-md"
    >
      <div
        v-for="t in visibleToasts"
        :key="t.id"
        class="pointer-events-auto w-full rounded-xl shadow-lg border backdrop-blur-sm px-4 py-3 flex items-center gap-3 min-h-[48px] transition-colors"
        :class="typeClasses(t.type)"
        role="alert"
        aria-live="polite"
      >
        <!-- 图标 -->
        <component :is="iconComponent(t.type)" :size="20" class="shrink-0" />
        <!-- 消息文本 -->
        <p class="text-sm font-medium leading-snug flex-1">{{ t.message }}</p>
        <!-- 手动关闭按钮 -->
        <button
          class="shrink-0 opacity-60 hover:opacity-100 transition-opacity p-0.5 -mr-1"
          @click="removeToast(t.id)"
          aria-label="关闭通知"
        >
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import type { ToastItem } from '@/composables/useToast'

const props = defineProps<{
  toasts: ToastItem[]
}>()

const emit = defineEmits<{
  (e: 'close', id: string): void
}>()

// 只显示可见的 toast（用于动画过渡）
const visibleToasts = computed(() =>
  props.toasts.filter(t => t.visible)
)

// 根据类型返回对应的样式类名
function typeClasses(type: ToastItem['type']): string {
  const map: Record<ToastItem['type'], string> = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-orange-50 text-orange-800 border-orange-200',
  }
  return map[type]
}

// 根据类型返回对应的图标组件
function iconComponent(type: ToastItem['type']) {
  const map: Record<ToastItem['type'], ReturnType<typeof CheckCircle>> = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  }
  return map[type]
}

// 手动移除 toast
function removeToast(id: string) {
  emit('close', id)
}
</script>

<style scoped>
/* ====== Toast 进入/离开动画 ====== */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.95);
}

/* 列表移动时的过渡 */
.toast-move {
  transition: transform 0.3s ease;
}

/* 移动端适配：小屏幕时减小内边距和字号 */
@media (max-width: 480px) {
  .pointer-events-auto {
    padding-left: 12px;
    padding-right: 12px;
    font-size: 13px;
  }
}
</style>
