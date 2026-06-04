<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900">费曼讲解</h1>
        <p class="text-sm text-slate-500 mt-0.5">步骤 {{ currentStep }}/{{ totalSteps }}：像教别人一样解释</p>
      </div>

      <!-- 步骤指示器 -->
      <div class="flex items-center gap-0">
        <template v-for="(stepLabel, idx) in stepLabels" :key="idx">
          <!-- 圆圈 -->
          <div class="flex flex-col items-center">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
              :class="
                idx + 1 < currentStep
                  ? 'bg-[#4F6EF7] text-white'
                  : idx + 1 === currentStep
                    ? 'bg-[#4F6EF7] text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-400'
              "
            >
              {{ idx + 1 }}
            </div>
            <span
              class="text-[10px] mt-1 whitespace-nowrap"
              :class="idx + 1 <= currentStep ? 'text-[#4F6EF7] font-medium' : 'text-slate-400'"
            >
              {{ stepLabel }}
            </span>
          </div>
          <!-- 连接线 -->
          <div
            v-if="idx < stepLabels.length - 1"
            class="flex-1 h-0.5 mx-1 mt-[-12px]"
            :class="idx + 1 < currentStep ? 'bg-[#4F6EF7]' : 'bg-slate-200'"
          />
        </template>
      </div>

      <!-- 当前任务卡片 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-xs font-semibold text-slate-500">当前任务</span>
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
            限时 8 分钟
          </span>
        </div>
        <p class="text-lg font-bold text-slate-900 leading-relaxed">
          请用生活类比解释：什么是递归？
        </p>
      </div>

      <!-- 编辑器区域 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-slate-700 mb-2.5">你的讲解</label>
        <div
          ref="editorRef"
          contenteditable="true"
          class="min-h-[140px] w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
          data-placeholder="在这里写下你的讲解，就像在教一个完全不懂的朋友..."
          @input="onEditorInput"
        >{{ editorContent }}</div>

        <!-- 工具栏 -->
        <div class="flex items-center gap-2 mt-3">
          <button
            v-for="tool in toolbarTools"
            :key="tool.label"
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            :title="tool.label"
            @click="handleTool(tool.action)"
          >
            {{ tool.icon }}
          </button>
        </div>
      </div>

      <!-- AI 追问面板 -->
      <div v-if="aiResult?.followUpQuestions?.length" class="bg-yellow-50 rounded-2xl p-5">
        <div class="flex items-center gap-2 mb-3">
          <MessageCircleQuestion :size="16" class="text-orange-500" />
          <span class="text-sm font-semibold text-orange-700">AI 追问</span>
        </div>
        <ul class="space-y-2">
          <li
            v-for="(q, idx) in aiResult.followUpQuestions"
            :key="idx"
            class="text-sm text-slate-700 leading-relaxed pl-4 -indent-4"
          >
            {{ q }}
          </li>
        </ul>
      </div>

      <!-- 提交讲解按钮 -->
      <button
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
        :disabled="isScoring || !editorContent.trim()"
        @click="handleSubmitScore"
      >
        <svg v-if="isScoring || isLoading" class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        {{ isScoring ? '评分中...' : '提交讲解并评分' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessageCircleQuestion } from 'lucide-vue-next'
import { scoreExplanation, optimizeExplanation, isAIReady, isLoading } from '@/composables/useDeepSeek'

const router = useRouter()
const route = useRoute()

const currentStep = ref(2)
const totalSteps = ref(5)

const stepLabels = ['选题', '讲解', '录音', '诊断', '复习']

const editorRef = ref<HTMLDivElement>()
const editorContent = ref('')

// AI 相关状态
const aiResult = ref<{
  score: number
  clarity: number
  gaps: string[]
  followUpQuestions: string[]
  feedback: string
} | null>(null)
const isScoring = ref(false)

const toolbarTools = [
  { icon: 'B', label: '加粗', action: 'bold' },
  { icon: 'I', label: '斜体', action: 'italic' },
  { icon: '链', label: '链接', action: 'link' },
  { icon: '图', label: '图片', action: 'image' },
  { icon: '录', label: '录音', action: 'record' },
  { icon: 'AI', label: 'AI辅助', action: 'ai' },
]

function onEditorInput(e: Event) {
  editorContent.value = (e.target as HTMLElement).innerText || ''
}

function handleTool(action: string) {
  const el = editorRef.value
  if (!el) return

  switch (action) {
    case 'bold': {
      document.execCommand('bold', false)
      el.focus()
      break
    }
    case 'italic': {
      document.execCommand('italic', false)
      el.focus()
      break
    }
    case 'link': {
      const url = prompt('请输入链接地址：', 'https://')
      if (url) document.execCommand('createLink', false, url)
      el.focus()
      break
    }
    case 'image': {
      alert('图片插入功能：在完整版中可从相册选择或粘贴图片URL')
      break
    }
    case 'record': {
      router.push('/explain/new/voice')
      break
    }
    case 'ai': {
      // AI 辅助：根据已有内容生成建议
      if (!editorContent.value.trim()) {
        alert('请先写一些内容，AI 将帮你优化表达')
        return
      }
      if (isAIReady.value) {
        // 调用真实 API 优化内容
        optimizeExplanation(editorContent.value).then((result) => {
          const el = editorRef.value
          if (el) {
            editorContent.value = result.optimized
            el.innerText = result.optimized
          }
          alert('✅ ' + result.suggestion)
        }).catch((err) => {
          alert('AI 优化失败：' + (err instanceof Error ? err.message : '未知错误'))
        })
      } else {
        // 降级：追加静态建议
        const suggestion = '\n\n💡 AI 建议：可以尝试用生活中的例子（如俄罗斯套娃、镜子反射）来类比解释，让听众更容易理解。'
        const el = editorRef.value
        if (el) {
          el.innerText += suggestion
          editorContent.value = el.innerText
        }
      }
      break
    }
  }
}

async function handleSubmitScore() {
  if (!editorContent.value.trim()) return

  isScoring.value = true
  try {
    const topic = '递归' // 可从路由参数或上下文获取
    const result = await scoreExplanation(editorContent.value, topic)
    aiResult.value = result
    // 将评分数据通过 query params 传递到诊断页
    router.push({
      path: '/explain/new/diagnosis',
      query: {
        score: String(result.score),
        content: encodeURIComponent(editorContent.value),
        topic: encodeURIComponent(topic),
      },
    })
  } catch (err) {
    alert('评分失败：' + (err instanceof Error ? err.message : '未知错误'))
  } finally {
    isScoring.value = false
  }
}
</script>
