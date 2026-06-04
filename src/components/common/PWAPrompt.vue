<template>
  <div v-if="showPrompt" class="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl p-4 mx-auto max-w-md">
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
        <Download :size="20" class="text-[#4F6EF7]" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-bold text-slate-800">安装到主屏幕</h3>
        <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">添加到桌面可获得更好的使用体验，离线也能访问。</p>
        <div class="flex gap-2 mt-3">
          <button class="px-4 py-2 rounded-xl bg-[#4F6EF7] text-white text-xs font-semibold" @click="installPWA">安装</button>
          <button class="px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-600" @click="dismissPrompt">稍后</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Download } from 'lucide-vue-next'

const showPrompt = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt = e as any
    // 3秒后显示提示（避免干扰用户首次体验）
    setTimeout(() => {
      if (!localStorage.getItem('feiman_pwa_dismissed')) showPrompt.value = true
    }, 3000)
  })
})

/** 触发 PWA 安装流程 */
async function installPWA() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice
  if (result.outcome === 'accepted') {
    showPrompt.value = false
  }
  deferredPrompt = null
}

/** 关闭提示并标记为已忽略 */
function dismissPrompt() {
  showPrompt.value = false
  localStorage.setItem('feiman_pwa_dismissed', 'true')
}
</script>
