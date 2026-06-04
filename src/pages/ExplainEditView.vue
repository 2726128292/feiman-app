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
            >{{ idx + 1 }}</div>
            <span
              class="text-[10px] mt-1 whitespace-nowrap"
              :class="idx + 1 <= currentStep ? 'text-[#4F6EF7] font-medium' : 'text-slate-400'"
            >{{ stepLabel }}</span>
          </div>
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
          <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">限时 8 分钟</span>
        </div>
        <p class="text-lg font-bold text-slate-900 leading-relaxed">
          请用生活类比解释：什么是{{ selectedTopic }}？
        </p>
      </div>

      <!-- 主题选择器 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-slate-700 mb-3">选择讲解主题</label>
        <!-- 主题 Pills -->
        <div class="flex flex-wrap gap-2 mb-3">
          <button
            v-for="topic in availableTopics"
            :key="topic"
            class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
            :class="
              selectedTopic === topic && !customInput
                ? 'bg-[#4F6EF7] text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            "
            @click="selectPill(topic)"
          >{{ topic }}</button>
        </div>
        <!-- 自定义输入 -->
        <input
          v-model="customInput"
          type="text"
          placeholder="或输入自定义主题..."
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          @input="onCustomInput"
        />
      </div>

      <!-- 编辑器区域 -->
      <div class="bg-white rounded-2xl p-5 shadow-sm">
        <label class="block text-sm font-semibold text-slate-700 mb-2.5">你的讲解</label>

        <!-- Markdown 预览模式 -->
        <div
          v-if="isPreviewMode"
          class="min-h-[200px] prose prose-sm max-w-none p-4 text-sm text-slate-700 leading-relaxed markdown-preview"
          v-html="renderedMarkdown"
        />

        <!-- 富文本编辑模式 -->
        <div
          v-else
          ref="editorRef"
          contenteditable="true"
          class="min-h-[140px] w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-slate-500"
          data-placeholder="在这里写下你的讲解，就像在教一个完全不懂的朋友..."
          @input="onEditorInput"
          @keydown="handleKeyboard"
        >{{ editorContent }}</div>

        <!-- 工具栏 -->
        <div class="flex items-center gap-2 mt-3">
          <button
            v-for="tool in toolbarTools"
            :key="tool.label"
            class="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all"
            :title="tool.label"
            @click="handleTool(tool.action)"
          >{{ tool.icon }}</button>
          <!-- 编辑/预览切换按钮 -->
          <button
            class="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            :class="isPreviewMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
            @click="isPreviewMode = !isPreviewMode"
          >
            {{ isPreviewMode ? '编辑' : '预览' }}
          </button>
        </div>
      </div>

      <!-- ====== 评分结果面板 (在当前页面展示，不跳转) ====== -->
      <div v-if="scoreResult" class="space-y-4 animate-fade-up">

        <!-- 综合评分卡片 -->
        <div class="bg-white rounded-2xl p-5 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-semibold text-slate-700">讲解评分</span>
            <span class="text-xs px-2 py-0.5 rounded-full" :class="scoreColorClass">{{ scoreLabel }}</span>
          </div>
          <div class="flex items-end gap-3">
            <span class="text-5xl font-black" :class="scoreTextColor">{{ scoreResult.score }}</span>
            <span class="text-lg text-slate-400 mb-1">/ 100</span>
          </div>
          <!-- 分数条 -->
          <div class="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="scoreBarClass"
              :style="{ width: scoreResult.score + '%' }"
            />
          </div>
        </div>

        <!-- 维度评分 -->
        <div class="bg-white rounded-2xl p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">各维度得分</h3>
          <div class="space-y-3">
            <div v-for="dim in scoreResult.dimensions" :key="dim.name">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-slate-600">{{ dim.name }}</span>
                <span class="text-xs font-bold" :class="dim.score >= 80 ? 'text-emerald-600' : dim.score >= 60 ? 'text-orange-500' : 'text-red-500'">{{ dim.score }}分</span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="dim.score >= 80 ? 'bg-emerald-400' : dim.score >= 60 ? 'bg-orange-400' : 'bg-red-400'"
                  :style="{ width: dim.score + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 知识缺口 -->
        <div v-if="scoreResult.gaps.length > 0" class="bg-white rounded-2xl p-5 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-700 mb-3">发现的知识缺口</h3>
          <div class="space-y-2">
            <div
              v-for="(gap, i) in scoreResult.gaps"
              :key="i"
              class="flex items-start gap-2 p-2.5 rounded-xl"
              :class="gap.priority === 'high' ? 'bg-red-50' : gap.priority === 'medium' ? 'bg-orange-50' : 'bg-blue-50'"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0 mt-1.5"
                :class="gap.priority === 'high' ? 'bg-red-500' : gap.priority === 'medium' ? 'bg-orange-400' : 'bg-blue-400'"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-700">{{ gap.text }}</p>
                <p class="text-[11px] mt-0.5" :class="gap.priority === 'high' ? 'text-red-400' : gap.priority === 'medium' ? 'text-orange-400' : 'text-blue-400'">
                  {{ gap.priority === 'high' ? '高优先级' : gap.priority === 'medium' ? '中优先级' : '建议补充' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 总体反馈 -->
        <div v-if="scoreResult.feedback" class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-[#4F6EF7] mb-2">总体反馈</h3>
          <p class="text-sm text-slate-700 leading-relaxed">{{ scoreResult.feedback }}</p>
        </div>

        <!-- 追问建议 -->
        <div v-if="scoreResult.followUpQuestions.length > 0" class="bg-yellow-50 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-3">
            <MessageCircleQuestion :size="16" class="text-orange-500" />
            <span class="text-sm font-semibold text-orange-700">追问建议</span>
          </div>
          <ul class="space-y-2">
            <li
              v-for="(q, idx) in scoreResult.followUpQuestions"
              :key="idx"
              class="text-sm text-slate-700 leading-relaxed pl-4 -indent-4"
            >{{ q }}</li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3">
          <button
            class="flex-1 py-3 rounded-full border-2 border-slate-200 text-slate-600 text-sm font-medium active:bg-slate-50 transition-colors"
            @click="continueEditing"
          >继续修改讲解</button>
          <button
            class="flex-1 py-3 rounded-full bg-[#4F6EF7] text-white text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-transform"
            @click="saveSession"
          >保存本次讲解</button>
        </div>
        <!-- 分享按钮 -->
        <button
          class="w-full px-4 py-3 rounded-full border-2 border-emerald-200 text-emerald-600 text-sm font-medium active:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
          @click="handleShare"
        >
          <Share2 :size="16" />
          分享成果
        </button>
      </div>

      <!-- 提交讲解按钮 (未评分时显示) -->
      <button
        v-if="!scoreResult"
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
        :disabled="isScoring || !editorContent.trim()"
        @click="handleSubmitScore"
      >
        <svg v-if="isScoring" class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        {{ isScoring ? '正在分析...' : '提交讲解并评分' }}
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { MessageCircleQuestion, Share2 } from 'lucide-vue-next'
import { optimizeExplanation, isAIReady, isAIEnabled } from '@/composables/useDeepSeek'
import { useShare } from '@/composables/useShare'
import { triggerHaptic } from '@/composables/useHaptic'
import { generatePoster } from '@/composables/usePosterGenerator'
import { useXPSystem } from '@/composables/useXPSystem'

const router = useRouter()

// 注入全局 Toast
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast')!

// 分享功能
const { shareExplanation } = useShare()

// XP 经验值系统
const xpSystem = useXPSystem()

const currentStep = ref(2)
const totalSteps = ref(5)
const stepLabels = ['选题', '讲解', '录音', '诊断', '复习']

const editorRef = ref<HTMLDivElement>()
const editorContent = ref('')

// ====== Markdown 预览模式 ======
const isPreviewMode = ref(false)

/** 超简易 Markdown → HTML 渲染器（不引入外部库） */
const renderedMarkdown = computed(() => {
  let html = editorContent.value
  // 标题
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // 行内代码
  html = html.replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-slate-100 rounded text-red-500 text-xs">$1</code>')
  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  // 分隔线
  html = html.replace(/^---$/gm, '<hr class="my-3 border-slate-200"/>')
  // 段落
  html = html.replace(/\n\n/g, '</p><p class="mb-2">')
  html = '<p class="mb-2">' + html + '</p>'
  return html
})

// ====== 主题选择器 ======
const availableTopics = ['递归', '闭包', 'Promise', '前端工程化', '计算机网络', '高等数学', '数据结构', '操作系统']
const selectedTopic = ref('递归')
const customInput = ref('')

function selectPill(topic: string) {
  selectedTopic.value = topic
  customInput.value = ''
}

function onCustomInput() {
  if (customInput.value.trim()) {
    selectedTopic.value = customInput.value.trim()
  }
}

// 评分结果
const isScoring = ref(false)
const scoreResult = ref<{
  score: number
  dimensions: Array<{ name: string; score: number }>
  gaps: Array<{ text: string; priority: 'high' | 'medium' | 'low' }>
  feedback: string
  followUpQuestions: string[]
} | null>(null)

// 分数颜色计算
const scoreLabel = computed(() => {
  if (!scoreResult.value) return ''
  const s = scoreResult.value.score
  if (s >= 90) return '优秀'
  if (s >= 75) return '良好'
  if (s >= 60) return '及格'
  return '需努力'
})

const scoreColorClass = computed(() => {
  if (!scoreResult.value) return ''
  const s = scoreResult.value.score
  if (s >= 90) return 'bg-emerald-100 text-emerald-700'
  if (s >= 75) return 'bg-blue-100 text-blue-700'
  if (s >= 60) return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
})

const scoreTextColor = computed(() => {
  if (!scoreResult.value) return 'text-slate-900'
  const s = scoreResult.value.score
  if (s >= 90) return 'text-emerald-500'
  if (s >= 75) return 'text-[#4F6EF7]'
  if (s >= 60) return 'text-orange-500'
  return 'text-red-500'
})

const scoreBarClass = computed(() => {
  if (!scoreResult.value) return 'bg-slate-300'
  const s = scoreResult.value.score
  if (s >= 90) return 'bg-emerald-400'
  if (s >= 75) return 'bg-[#4F6EF7]'
  if (s >= 60) return 'bg-orange-400'
  return 'bg-red-400'
})

const baseToolbarTools = [
  { icon: 'B', label: '加粗', action: 'bold' },
  { icon: 'I', label: '斜体', action: 'italic' },
  { icon: '链', label: '链接', action: 'link' },
  { icon: '图', label: '图片', action: 'image' },
  { icon: '录', label: '录音', action: 'record' },
]

const toolbarTools = computed(() => [
  ...baseToolbarTools,
  {
    icon: 'AI',
    label: isAIEnabled ? 'AI辅助' : '本地优化',
    action: 'ai',
  },
])

function onEditorInput(e: Event) {
  editorContent.value = (e.target as HTMLElement).innerText || ''
}

function handleTool(action: string) {
  const el = editorRef.value
  if (!el) return

  switch (action) {
    case 'bold':
      document.execCommand('bold', false)
      el.focus()
      break
    case 'italic':
      document.execCommand('italic', false)
      el.focus()
      break
    case 'link': {
      const url = prompt('请输入链接地址：', 'https://')
      if (url) document.execCommand('createLink', false, url)
      el.focus()
      break
    }
    case 'image':
      showToast('图片插入功能：可粘贴图片URL或使用剪贴板', 'info')
      break
    case 'record':
      router.push('/explain/new/voice')
      break
    case 'ai': {
      if (!editorContent.value.trim()) {
        showToast('请先写一些内容，再使用AI辅助优化', 'warning')
        return
      }
      if (isAIReady.value) {
        optimizeExplanation(editorContent.value).then((result) => {
          if (el) {
            editorContent.value = result.optimized
            el.innerText = result.optimized
          }
          // 清除之前的评分结果，让用户重新提交
          scoreResult.value = null
        }).catch(() => {
          showToast('AI 优化失败，请稍后重试', 'error')
        })
      } else {
        const suggestion = '\n\n💡 建议：尝试用生活中的例子来类比解释，比如俄罗斯套娃、镜子反射等。'
        el.innerText += suggestion
        editorContent.value = el.innerText
      }
      break
    }
  }
}

/**
 * 本地评分引擎 - 不依赖任何外部 API
 * 从内容特征分析质量，根据主题动态调整检测
 */
function localScore(content: string, topic: string): typeof scoreResult.value {
  const len = content.length

  // ====== 维度一：内容完整性 (25分) ======
  let completenessScore = 0
  const hasIntro = /^.{10,}/.test(content) // 开头有足够内容
  const hasBody = len >= 80 // 有足够正文
  const hasConclusion = /总结|总之|所以|因此|综上/.test(content)
  if (hasIntro && hasBody && hasConclusion) completenessScore = 25
  else if (hasIntro && hasBody) completenessScore = 20
  else if (hasBody) completenessScore = 15
  else completenessScore = Math.min(10, Math.floor(len / 10))

  // ====== 维度二：类比运用 (25分) ======
  let analogyScore = 0
  const analogyPatterns = [
    /像.{1,8}(一样|一般|那样|似的)/,
    /好比|仿佛|如同|类似于|可以想象/,
    /例如|比方说|打个比方|举个例子/,
    /套娃|镜子|叠盒子|洋葱|剥皮|搭积木|盖房子|做饭|开车|购物|排队|找东西/,
    /生活|日常|现实|实际/,
  ]
  const analogyCount = analogyPatterns.filter(p => p.test(content)).length
  if (analogyCount >= 3) analogyScore = 25
  else if (analogyCount >= 2) analogyScore = 20
  else if (analogyCount >= 1) analogyScore = 14
  else analogyScore = 8

  // ====== 维度三：表达清晰度 (25分) ======
  let clarityScore = 15 // 基础分
  const avgSentenceLen = len / Math.max(1, content.split(/[。！？\n]/).length)
  if (avgSentenceLen <= 30) clarityScore += 4   // 句子不长
  if (avgSentenceLen <= 50) clarityScore += 3
  if (/[，、]/.test(content)) clarityScore += 3  // 有标点分段
  if (!/[\u4e00-\u9fff]{15,}[\u4e00-\u9fff]{15,}[\u4e00-\u9fff]{15,}/.test(content)) clarityScore += 2 // 没有超长无断句
  clarityScore = Math.min(25, clarityScore)

  // ====== 维度四：深度洞察 (25分) ======
  let depthScore = 10 // 基础分
  const depthPatterns = [
    /但是|不过|然而|反之|另一方面/, // 转折/对比
    /原因|因为|由于|导致|结果是/,     // 因果关系
    /本质|核心|关键|底层|原理|机制/,    // 深层概念
    /边界|例外|特殊情况|注意|小心/,     // 边界意识
    /区别|不同|差异|对比/,             // 对比分析
  ]
  const depthCount = depthPatterns.filter(p => p.test(content)).length
  depthScore += Math.min(12, depthCount * 3)
  if (len >= 200) depthScore += 3 // 足够长说明有展开
  depthScore = Math.min(25, depthScore)

  // ====== 总分 ======
  const totalScore = completenessScore + analogyScore + clarityScore + depthScore

  // ====== 知识缺口检测（根据主题动态调整） ======
  const gaps: typeof scoreResult.value.gaps = []
  const topicLower = topic.toLowerCase()

  // 通用缺口检测
  if (!analogyPatterns.some(p => p.test(content))) {
    gaps.push({ text: '没有使用生活化类比，纯概念描述可能难以理解', priority: 'medium' as const })
  }
  if (len < 100) {
    gaps.push({ text: '讲解偏短，可能缺少展开或举例', priority: 'medium' as const })
  }
  if (!depthPatterns.slice(0, 2).some(p => p.test(content))) {
    gaps.push({ text: '可补充与相关概念的对比或因果关系', priority: 'low' as const })
  }

  // 主题特定缺口检测
  if (topicLower.includes('递归')) {
    if (!/终止|停止|结束|base case|出口/.test(content)) {
      gaps.push({ text: '缺少对「终止条件」的强调', priority: 'high' as const })
    }
  } else if (topicLower.includes('闭包')) {
    if (!/作用域|变量|引用|内存|函数/.test(content)) {
      gaps.push({ text: '缺少对「变量捕获和作用域链」的解释', priority: 'high' as const })
    }
  } else if (topicLower.includes('promise')) {
    if (!/异步|等待|then|catch|resolve|reject/.test(content)) {
      gaps.push({ text: '缺少对「异步流程和状态变化」的说明', priority: 'high' as const })
    }
  } else if (topicLower.includes('网络') || topicLower.includes('http') || topicLower.includes('tcp')) {
    if (!/协议|请求|响应|握手|包|数据/.test(content)) {
      gaps.push({ text: '缺少对「通信过程和数据格式」的描述', priority: 'high' as const })
    }
  } else if (topicLower.includes('数学') || topicLower.includes('导数') || topicLower.includes('积分')) {
    if (!/定义|公式|推导|证明|应用/.test(content)) {
      gaps.push({ text: '缺少对「公式来源或实际应用场景」的说明', priority: 'high' as const })
    }
  } else if (topicLower.includes('操作系统') || topicLower.includes('进程') || topicLower.includes('线程')) {
    if (!/调度|资源|并发|同步|锁|内核/.test(content)) {
      gaps.push({ text: '缺少对「资源管理和调度机制」的解释', priority: 'high' as const })
    }
  } else {
    // 自定义主题或其他：通用缺口
    if (!/定义|概念|本质|核心|原理/.test(content)) {
      gaps.push({ text: '建议先明确「这个概念的本质是什么」', priority: 'high' as const })
    }
  }

  // ====== 追问生成（根据主题动态调整） ======
  const followUps: string[] = []

  if (topicLower.includes('递归')) {
    if (!/终止|停止|结束/.test(content)) followUps.push(`如果${topic}没有终止条件，会发生什么？`)
    if (!/栈溢出|内存|性能|效率/.test(content)) followUps.push(`${topic}调用过深时会有什么风险？如何避免？`)
    if (!/迭代|循环|非递归/.test(content)) followUps.push(`这个问题能用非递归方式解决吗？两种方式各有什么优劣？`)
  } else if (topicLower.includes('闭包')) {
    if (!/内存|泄漏|回收|释放/.test(content)) followUps.push(`${topic}会导致内存泄漏吗？什么时候需要手动清理？`)
    if (!/模块|封装|私有|工厂/.test(content)) followUps.push(`${topic}在实际开发中有哪些常见应用模式？`)
    followUps.push(`能用一个生活中的例子来比喻${topic}的工作方式吗？`)
  } else if (topicLower.includes('promise')) {
    if (!/错误|异常|catch|失败/.test(content)) followUps.push(`${topic}链中如果某一步出错了，后面的代码还会执行吗？`)
    if (!/并行|all|race|await/.test(content)) followUps.push(`如何同时处理多个${topic}任务？`)
    followUps.push(`${topic}和回调函数相比，主要解决了什么问题？`)
  } else if (topicLower.includes('网络') || topicLower.includes('http') || topicLower.includes('tcp')) {
    followUps.push(`${topic}在传输过程中数据丢失了怎么办？`)
    followUps.push(`为什么${topic}需要三次握手而不是两次？`)
    followUps.push(`${topic}和HTTPS有什么区别？加密是在哪一层做的？`)
  } else if (topicLower.includes('数学') || topicLower.includes('导数') || topicLower.includes('积分')) {
    followUps.push(`${topic}在实际生活中有哪些应用场景？`)
    followUps.push(`能通过图形直观地理解${topic}的几何意义吗？`)
    followUps.push(`${topic}和之前学过的哪些知识有联系？`)
  } else if (topicLower.includes('操作系统') || topicLower.includes('进程') || topicLower.includes('线程')) {
    followUps.push(`进程和线程有什么区别？什么时候该用哪个？`)
    followUps.push(`死锁是怎么产生的？如何避免？`)
    followUps.push(`${topic}是如何管理内存分配的？`)
  } else {
    // 自定义主题或其他
    followUps.push(`能举一个${topic}在实际开发中的应用场景吗？`)
    followUps.push(`${topic}的核心难点是什么？初学者容易在哪里卡住？`)
    followUps.push(`可以用什么生活化的例子来帮助理解${topic}？`)
  }

  if (followUps.length === 0) {
    followUps.push('能举一个这个概念在实际开发中的应用场景吗？')
  }

  // ====== 反馈文案 ======
  let feedback = ''
  if (totalScore >= 85) {
    feedback = '讲解非常清晰！结构完整，有类比有深度。继续保持这种「教别人」的方式，你对这个概念的理解已经很扎实了。'
  } else if (totalScore >= 70) {
    feedback = '讲解整体不错，已经抓住了核心要点。如果能补充更多生活化的类比或具体例子，效果会更好。建议重点补充目前发现的薄弱点。'
  } else if (totalScore >= 55) {
    feedback = '讲解覆盖了基本内容，但还有提升空间。建议先确保解释了「是什么」和「为什么」，再用生活中的例子帮助理解。不要太担心说得不够专业——简单往往更好。'
  } else {
    feedback = '讲解还比较简短，可能只说了结论而没有展开过程。试试这样讲：假设你在给一个完全不懂的朋友解释，你会从哪里开始？用什么例子？记住：能简单讲清楚才是真的懂。'
  }

  return {
    score: totalScore,
    dimensions: [
      { name: '内容完整性', score: completenessScore },
      { name: '类比运用', score: analogyScore },
      { name: '表达清晰度', score: clarityScore },
      { name: '深度洞察', score: depthScore },
    ],
    gaps,
    feedback,
    followUpQuestions: followUps,
  }
}

async function handleSubmitScore() {
  if (!editorContent.value.trim()) return

  isScoring.value = true

  // 模拟短暂处理时间，让用户感知到"正在分析"
  await new Promise(r => setTimeout(r, 600))

  // 始终使用本地评分，不需要 API
  scoreResult.value = localScore(editorContent.value, selectedTopic.value)
  triggerHaptic('medium') // 评分提交触觉反馈

  isScoring.value = false
}

function continueEditing() {
  // 清除评分结果，回到编辑状态
  scoreResult.value = null
  // 滚动回编辑器
  editorRef.value?.focus()
}

// 分享讲解成果（生成海报图片后分享/下载）
async function handleShare() {
  if (!scoreResult.value) return
  showToast('正在生成海报...', 'info')
  try {
    const streakRaw = parseInt(localStorage.getItem('feiman_streak_days') || '0')
    const posterUrl = await generatePoster({
      topic: selectedTopic.value,
      score: scoreResult.value.score,
      summary: scoreResult.value.feedback,
      date: new Date().toLocaleDateString('zh-CN'),
      streakDays: streakRaw,
    })

    // 尝试使用 Web Share API 分享图片
    if (navigator.share && (navigator as any).canShare) {
      try {
        const response = await fetch(posterUrl)
        const blob = await response.blob()
        const file = new File([blob], 'feiman-poster.png', { type: 'image/png' })

        await navigator.share({
          title: `我在「${selectedTopic.value}」讲解中获得 ${scoreResult.value.score} 分`,
          files: [file],
        })
        return
      } catch { /* 降级到下载 */ }
    }

    // 降级方案：直接下载图片
    const a = document.createElement('a')
    a.href = posterUrl
    a.download = `feiman-${selectedTopic.value}-${scoreResult.value.score}分.png`
    a.click()
    showToast('海报已保存到下载目录', 'success')
  } catch (_err) {
    showToast('海报生成失败', 'error')
  }
}

// 键盘快捷键
function handleKeyboard(e: KeyboardEvent) {
  // Ctrl/Cmd + B: 加粗
  if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
    e.preventDefault()
    handleTool('bold')
  }
  // Ctrl/Cmd + I: 斜体
  else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
    e.preventDefault()
    handleTool('italic')
  }
  // Ctrl/Cmd + S: 保存（如果有评分结果则保存，否则提交评分）
  else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    if (scoreResult.value) {
      saveSession()
    } else if (editorContent.value.trim()) {
      handleSubmitScore()
    }
  }
}

/**
 * 保存讲解后更新连续打卡状态
 * 确保每次完成讲解后都刷新打卡记录
 */
function updateStreakOnSessionSave(): void {
  const today = new Date().toISOString().slice(0, 10)
  const lastActive = localStorage.getItem('feiman_last_active_date')
  let streak = parseInt(localStorage.getItem('feiman_streak_days') || '0')

  if (lastActive !== today) {
    // 今天还没记录过
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    if (lastActive === yesterday) {
      streak++
    } else if (lastActive !== null && lastActive !== yesterday) {
      streak = 1
    } else {
      streak = 1
    }

    localStorage.setItem('feiman_streak_days', String(streak))
    localStorage.setItem('feiman_last_active_date', today)
  }
}

function saveSession() {
  // 保存到 localStorage
  try {
    const sessions = JSON.parse(localStorage.getItem('feiman_sessions') || '[]')
    sessions.push({
      id: crypto.randomUUID(),
      topicId: selectedTopic.value,
      content: editorContent.value,
      score: scoreResult.value?.score || 0,
      type: 'text',
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem('feiman_sessions', JSON.stringify(sessions))
    showToast('讲解已保存！可在「讲解记录」中查看。', 'success')
    triggerHaptic('success') // 保存成功触觉反馈

    // 更新连续打卡状态
    updateStreakOnSessionSave()

    // ====== 功能15：获得 XP 经验值 ======
    const prevLevel = xpSystem.getState().level
    const xpResult = xpSystem.gainXP('explain_session')
    // 满分额外奖励
    if (scoreResult.value && scoreResult.value.score >= 90) {
      xpSystem.gainXP('perfect_score')
    }
    // 升级提示
    if (xpResult.level > prevLevel) {
      showToast(`🎉 升级了！当前 Lv.${xpResult.level}`, 'success')
    }
  } catch {
    showToast('保存失败，请重试', 'error')
  }
}
</script>

<style scoped>
@keyframes fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up {
  animation: fade-up 0.35s ease-out both;
}

/* Markdown 预览样式 */
.markdown-preview h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: #1e293b; }
.markdown-preview h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.4rem; color: #334155; }
.markdown-preview h3 { font-size: 1rem; font-weight: 600; margin-bottom: 0.3rem; }
.markdown-preview h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.3rem; }
.markdown-preview ul { padding-left: 1.2rem; margin: 0.5rem 0; list-style-type: disc; }
.markdown-preview li { margin: 0.15rem 0; }
.markdown-preview hr { border: none; }
.markdown-preview code { font-family: ui-monospace, monospace; }
</style>
