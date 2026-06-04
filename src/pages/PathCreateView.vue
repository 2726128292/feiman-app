<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部导航 -->
      <div class="flex items-center gap-3">
        <button
          class="flex items-center justify-center w-8 h-8 -ml-2 rounded-lg text-slate-600 active:bg-slate-100 transition-colors"
          @click="router.back()"
        >
          <ArrowLeft :size="20" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-slate-900">创建学习目标</h1>
          <p class="text-xs text-slate-500 mt-0.5">AI 将生成章节、任务和复习节奏</p>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="space-y-4">
        <!-- 目标名称 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">目标名称</label>
          <input
            v-model="form.goalName"
            type="text"
            placeholder="例如：30天掌握Vue3工程化"
            class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        <!-- 当前水平 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">当前水平</label>
          <input
            v-model="form.currentLevel"
            type="text"
            placeholder="初学 / 熟悉基础 / 准备面试"
            class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        <!-- 预计投入 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-1.5">预计投入</label>
          <input
            v-model="form.timeCommitment"
            type="text"
            placeholder="每天30分钟，持续4周"
            class="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        <!-- 学习偏好标签 -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">学习偏好</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="pref in preferences"
              :key="pref.key"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              :class="
                selectedPrefs.includes(pref.key)
                  ? pref.activeClass
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              "
              @click="togglePref(pref.key)"
            >
              {{ pref.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- AI 预览提示框 -->
      <div class="bg-blue-50 rounded-2xl p-4 flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Sparkles :size="18" class="text-blue-600" />
        </div>
        <div>
          <p class="text-sm font-semibold text-blue-900">将生成：</p>
          <p class="text-xs text-blue-600/80 mt-0.5 leading-relaxed">
            知识地图 + 每日任务 + 闪卡 + 测验
          </p>
        </div>
      </div>

      <!-- CTA 按钮 -->
      <button
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
        :disabled="isGenerating || isLoading"
        @click="handleGenerate"
      >
        <svg v-if="isGenerating || isLoading" class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        </svg>
        {{ isGenerating ? 'AI 生成中...' : '生成学习路径' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Sparkles } from 'lucide-vue-next'
import { generateLearningPath, isAIReady, isLoading } from '@/composables/useDeepSeek'
import type { StudyTopic, Chapter } from '@/types/topic'

const router = useRouter()
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast') || ((msg: string) => console.log(msg))

const form = reactive({
  goalName: '',
  currentLevel: '',
  timeCommitment: '',
})

const selectedPrefs = ref<string[]>(['beginner'])
const isGenerating = ref(false)

const preferences = [
  { key: 'beginner', label: '讲授小白听', activeClass: 'bg-blue-50 border border-blue-300 text-blue-700' },
  { key: 'exam', label: '考试冲刺', activeClass: 'bg-orange-50 border border-orange-300 text-orange-700' },
  { key: 'project', label: '项目实践', activeClass: 'bg-green-50 border border-green-300 text-green-700' },
  { key: 'interview', label: '面试问答', activeClass: 'bg-purple-50 border border-purple-300 text-purple-700' },
]

function togglePref(key: string) {
  const idx = selectedPrefs.value.indexOf(key)
  if (idx >= 0) selectedPrefs.value.splice(idx, 1)
  else selectedPrefs.value.push(key)
}

/**
 * 本地生成学习路径（不依赖 AI）
 * 根据目标名称智能拆解章节
 */
function generateLocalPath(goalName: string): StudyTopic {
  // 根据目标关键词匹配预设模板
  const goalLower = goalName.toLowerCase()

  let chapters: Chapter[]

  if (goalLower.includes('vue') || goalLower.includes('前端') || goalLower.includes('工程化')) {
    chapters = [
      { id: 'c1', title: '基础概念入门', completed: false, progress: 0 },
      { id: 'c2', title: '组件化开发核心', completed: false, progress: 0 },
      { id: 'c3', title: '响应式原理深入', completed: false, progress: 0 },
      { id: 'c4', title: '路由与状态管理', completed: false, progress: 0 },
      { id: 'c5', title: '工程化与性能优化', completed: false, progress: 0 },
    ]
  } else if (goalLower.includes('网络') || goalLower.includes('http') || goalLower.includes('tcp')) {
    chapters = [
      { id: 'c1', title: '网络模型分层 (OSI/TCP-IP)', completed: false, progress: 0 },
      { id: 'c2', title: 'HTTP/HTTPS 协议详解', completed: false, progress: 0 },
      { id: 'c3', title: 'TCP/IP 三次握手与四次挥手', completed: false, progress: 0 },
      { id: 'c4', title: 'DNS 解析与 CDN 原理', completed: false, progress: 0 },
      { id: 'c5', title: '网络安全与加密机制', completed: false, progress: 0 },
    ]
  } else if (goalLower.includes('算法') || goalLower.includes('数据结构') || goalLower.includes('递归')) {
    chapters = [
      { id: 'c1', title: '时间复杂度与空间复杂度', completed: false, progress: 0 },
      { id: 'c2', title: '数组、链表与栈队列', completed: false, progress: 0 },
      { id: 'c3', title: '树与图的基础遍历', completed: false, progress: 0 },
      { id: 'c4', title: '排序与查找算法', completed: false, progress: 0 },
      { id: 'c5', title: '动态规划入门', completed: false, progress: 0 },
    ]
  } else if (goalLower.includes('数学') || goalLower.includes('微积分') || goalLower.includes('线性')) {
    chapters = [
      { id: 'c1', title: '基础概念与定义', completed: false, progress: 0 },
      { id: 'c2', title: '核心公式推导', completed: false, progress: 0 },
      { id: 'c3', title: '典型例题分析', completed: false, progress: 0 },
      { id: 'c4', title: '应用场景与实践', completed: false, progress: 0 },
      { id: 'c5', title: '综合复习与测验', completed: false, progress: 0 },
    ]
  } else if (goalLower.includes('操作系统') || goalLower.includes('进程') || goalLower.includes('线程')) {
    chapters = [
      { id: 'c1', title: '进程与线程基础', completed: false, progress: 0 },
      { id: 'c2', title: '调度算法与死锁', completed: false, progress: 0 },
      { id: 'c3', title: '内存管理机制', completed: false, progress: 0 },
      { id: 'c4', title: '文件系统与 I/O', completed: false, progress: 0 },
      { id: 'c5', title: '综合实战演练', completed: false, progress: 0 },
    ]
  } else {
    // 通用模板
    chapters = [
      { id: 'c1', title: '基础概念入门', completed: false, progress: 0 },
      { id: 'c2', title: '核心机制深入', completed: false, progress: 0 },
      { id: 'c3', title: '实战案例分析', completed: false, progress: 0 },
      { id: 'c4', title: '高级应用技巧', completed: false, progress: 0 },
      { id: 'c5', title: '综合测验与复习', completed: false, progress: 0 },
    ]
  }

  // 随机分配颜色
  const colors = ['#4F6EF7', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]

  return {
    id: crypto.randomUUID(),
    title: goalName,
    tags: selectedPrefs.value,
    status: 'active' as const,
    progress: 0,
    createdAt: new Date().toISOString(),
    chapters,
    color: randomColor,
  }
}

/**
 * 将路径保存到 localStorage
 */
function saveTopicToStorage(topic: StudyTopic): void {
  try {
    const raw = localStorage.getItem('feiman_topics')
    const topics: StudyTopic[] = raw ? JSON.parse(raw) : []
    topics.push(topic)
    localStorage.setItem('feiman_topics', JSON.stringify(topics))
  } catch (e) {
    console.error('保存学习路径失败:', e)
    throw new Error('存储写入失败')
  }
}

async function handleGenerate() {
  // 表单校验
  if (!form.goalName.trim()) {
    showToast('请填写目标名称', 'warning')
    return
  }
  if (!form.currentLevel.trim()) {
    showToast('请填写当前水平', 'warning')
    return
  }
  if (!form.timeCommitment.trim()) {
    showToast('请填写预计投入时间', 'warning')
    return
  }

  const prefLabels = selectedPrefs.value.map(key => {
    const found = preferences.find(p => p.key === key)
    return found ? found.label : key
  })

  isGenerating.value = true

  try {
    let newTopic: StudyTopic

    if (isAIReady.value) {
      // AI 模式：调用 API 生成
      const aiResult = await generateLearningPath(
        form.goalName,
        form.currentLevel,
        form.timeCommitment,
        prefLabels
      )
      // 将 AI 结果转换为 StudyTopic 格式
      newTopic = {
        id: crypto.randomUUID(),
        title: form.goalName,
        tags: prefLabels,
        status: 'active' as const,
        progress: 0,
        createdAt: new Date().toISOString(),
        chapters: (aiResult.chapters || []).map((ch, i) => ({
          id: `ch-${i + 1}`,
          title: ch.title || `章节 ${i + 1}`,
          completed: false,
          progress: 0,
        })),
        color: '#4F6EF7',
      }
    } else {
      // 本地模式：根据目标名称智能生成
      newTopic = generateLocalPath(form.goalName)
    }

    // 保存到 localStorage
    saveTopicToStorage(newTopic)

    showToast(`「${newTopic.title}」创建成功！共 ${newTopic.chapters.length} 个章节`, 'success')

    // 跳转到新创建的路径详情页
    setTimeout(() => {
      router.push(`/paths/${newTopic.id}`)
    }, 500)
  } catch (err) {
    showToast('生成失败：' + (err instanceof Error ? err.message : '请重试'), 'error')
  } finally {
    isGenerating.value = false
  }
}
</script>
