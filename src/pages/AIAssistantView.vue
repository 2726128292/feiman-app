<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 flex flex-col" style="height: 100dvh;">
      <!-- 顶部标题 -->
      <div class="flex items-center gap-3 mb-4 shrink-0">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
          <Sparkles :size="20" class="text-white" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-lg font-bold text-slate-900 dark:text-slate-100">AI 学习助手</h1>
          <p class="text-xs mt-0.5" :class="isAIReady ? 'text-emerald-500' : 'text-slate-400'">
            {{ isAIReady ? 'DeepSeek 已连接' : isAIEnabled ? '未配置 API Key · 本地模式' : 'AI 已关闭 · 本地模式' }}
          </p>
        </div>
        <!-- 上传 Skill 按钮 -->
        <button
          class="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 active:bg-slate-200 shrink-0"
          @click="showUploadPanel = !showUploadPanel"
        >
          上传资料
        </button>
      </div>

      <!-- 上传面板 -->
      <div
        v-if="showUploadPanel"
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-4 shrink-0 animate-fade-up"
      >
        <h3 class="text-sm font-semibold text-slate-700 mb-2">上传学习资料</h3>
        <p class="text-[11px] text-slate-400 mb-3">上传后 AI 将基于你的资料回答问题</p>

        <label
          class="flex flex-col items-center justify-center w-full py-4 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#4F6EF7] transition-colors"
        >
          <Upload :size="24" class="text-slate-400 mb-1" />
          <span class="text-sm text-slate-500">点击上传 TXT / JSON / MD 文件</span>
          <span class="text-[11px] text-slate-300 mt-1">支持笔记、题目、知识点等格式</span>
          <input type="file" accept=".txt,.json,.md,.markdown" class="hidden" @change="handleSkillUpload" />
        </label>

        <!-- 已上传的文件列表 -->
        <div v-if="uploadedFiles.length > 0" class="mt-3 space-y-1.5">
          <div
            v-for="(file, i) in uploadedFiles"
            :key="i"
            class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-xs"
          >
            <FileText :size="14" class="text-emerald-500 shrink-0" />
            <span class="flex-1 truncate text-emerald-700">{{ file.name }}</span>
            <span class="text-emerald-400">{{ file.size }}</span>
            <button @click="removeFile(i)" class="text-red-400 hover:text-red-500">×</button>
          </div>
        </div>

        <p v-if="uploadMsg" class="mt-2 text-xs" :class="uploadSuccess ? 'text-emerald-600' : 'text-red-500'">{{ uploadMsg }}</p>
      </div>

      <!-- 快捷场景按钮 -->
      <div class="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
        <button
          v-for="preset in presets"
          :key="preset.label"
          class="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
          :class="activePreset === preset.label ? 'bg-[#4F6EF7] text-white' : 'bg-white text-slate-600 shadow-sm'"
          @click="applyPreset(preset)"
        >
          {{ preset.icon }} {{ preset.label }}
        </button>
      </div>

      <!-- 对话消息区域 -->
      <div ref="chatContainerRef" class="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-hide">
        <!-- 欢迎消息 -->
        <div v-if="messages.length === 0" class="text-center pt-12 space-y-3">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 flex items-center justify-center">
            <Sparkles :size="28" class="text-[#4F6EF7]" />
          </div>
          <p class="text-sm text-slate-500">我是你的 AI 学习助手</p>
          <p class="text-xs text-slate-400 leading-relaxed px-8">
            可以帮你解释概念、生成练习题、优化讲解内容、制定学习计划，也可以直接问我任何问题。
          </p>
          <!-- 快捷提问 -->
          <div class="grid grid-cols-2 gap-2 px-4 pt-2">
            <button
              v-for="quick in quickQuestions"
              :key="quick"
              class="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-400 active:bg-slate-50 dark:active:bg-slate-700 text-left"
              @click="sendMessage(quick)"
            >{{ quick }}</button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
            :class="
              msg.role === 'user'
                ? 'bg-[#4F6EF7] text-white rounded-br-md'
                : 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-slate-200 rounded-bl-md'
            "
          >
            <p class="whitespace-pre-wrap">{{ msg.content }}</p>
            <p
              class="text-[10px] mt-1.5 opacity-50 text-slate-400"
            >
              {{ formatTime(msg.time) }}
            </p>
          </div>
        </div>

        <!-- 加载中 -->
        <div v-if="isWaiting" class="flex justify-start">
          <div class="bg-white dark:bg-slate-800 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 0ms" />
              <div class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 150ms" />
              <div class="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style="animation-delay: 300ms" />
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="shrink-0 pt-3 border-t border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur -mx-5 px-5 pb-4">
        <div class="flex items-end gap-2">
          <textarea
            v-model="inputText"
            placeholder="输入问题..."
            rows="1"
            class="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-600 px-3.5 py-2.5 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 max-h-24 placeholder:text-slate-400"
            @keydown.enter.exact.prevent="handleSend"
            @input="autoResize"
          />
          <button
            class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            :class="inputText.trim() && !isWaiting ? 'bg-[#4F6EF7] text-white active:bg-blue-600' : 'bg-slate-100 text-slate-400'"
            :disabled="!inputText.trim() || isWaiting"
            @click="handleSend"
          >
            <Send :size="18" />
          </button>
        </div>
        <p class="text-[11px] mt-2 text-center" :class="isAIReady ? 'text-emerald-500' : 'text-slate-400'">
          {{ isAIReady ? 'DeepSeek 已连接' : isAIEnabled ? '本地模拟模式 · 配置 API Key 可获得更强能力' : '本地模式 · AI 功能已手动关闭' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Sparkles, Upload, FileText, Send } from 'lucide-vue-next'
import {
  isAIReady,
  isAIEnabled,
  isLoading,
  chat as aiChat,
} from '@/composables/useDeepSeek'

// ====== 状态 ======
interface Message {
  role: 'user' | 'assistant'
  content: string
  time: Date
}

const messages = ref<Message[]>([])
const inputText = ref('')
const isWaiting = ref(false)
const chatContainerRef = ref<HTMLDivElement>()
const showUploadPanel = ref(false)
const activePreset = ref('')

// ====== 已上传的资料 ======
interface UploadedFile {
  name: string
  size: string
  content: string
}
const uploadedFiles = ref<UploadedFile[]>([])
const uploadMsg = ref('')
const uploadSuccess = ref(true)

function handleSkillUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const content = reader.result as string
    const sizeKB = (file.size / 1024).toFixed(1)
    uploadedFiles.value.push({ name: file.name, size: sizeKB + 'KB', content })
    uploadMsg.value = `已加载：${file.name}`
    uploadSuccess.value = true
  }
  reader.readAsText(file)
  ;(e.target as HTMLInputElement).value = ''
}

function removeFile(index: number) {
  uploadedFiles.value.splice(index, 1)
}

// ====== 预设场景 ======
interface Preset {
  label: string
  icon: string
  prompt: string
}

const presets: Preset[] = [
  { label: '讲解评分', icon: '📝', prompt: '请帮我评估以下讲解内容的质量（从清晰度、准确性、完整性三个维度），并给出改进建议：\n\n' },
  { label: '生成闪卡', icon: '🃏', prompt: '请根据以下主题生成一组问答闪卡（格式：Q: 问题 A: 答案）：\n主题：' },
  { label: '出测验题', icon: '📋', prompt: '请针对以下主题生成 5 道选择题（含选项和解析）：\n主题：' },
  { label: '知识诊断', icon: '🔍', prompt: '我学习了以下内容，请帮我分析可能存在的薄弱点：\n内容：' },
  { label: '路径规划', icon: '🗺️', prompt: '我想学习以下内容，请帮我制定一个学习计划：\n目标：' },
  { label: '自由对话', icon: '💬', prompt: '' },
]

const quickQuestions = [
  '什么是递归？用简单的话解释',
  '帮我出几道关于 HTTP 的题',
  '如何提高记忆效率？',
  '帮我优化这段讲解文字',
]

function applyPreset(preset: Preset) {
  if (activePreset.value === preset.label) {
    activePreset.value = ''
    inputText.value = ''
  } else {
    activePreset.value = preset.label
    inputText.value = preset.prompt
  }
}

// ====== 发送消息 ======
async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isWaiting.value) return

  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text,
    time: new Date(),
  })
  inputText.value = ''
  activePreset.value = ''
  await scrollToBottom()

  // 构建上下文（包含已上传的资料）
  let context = ''
  if (uploadedFiles.value.length > 0) {
    context = '\n\n【参考资料】\n'
    for (const f of uploadedFiles.value) {
      context += `--- ${f.name} ---\n${f.content.slice(0, 3000)}\n\n`
    }
  }

  // 调用 AI
  isWaiting.value = true

  try {
    let reply: string

    if (isAIReady.value) {
      reply = await aiChat(text, context || undefined)
    } else {
      // 本地模拟回复
      reply = getLocalReply(text)
      await new Promise(r => setTimeout(r, 800))
    }

    messages.value.push({
      role: 'assistant',
      content: reply,
      time: new Date(),
    })
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: `抱歉，出了点问题：${error instanceof Error ? error.message : '未知错误'}。请检查 API Key 配置或稍后重试。`,
      time: new Date(),
    })
  } finally {
    isWaiting.value = false
    await scrollToBottom()
  }
}

function sendMessage(text: string) {
  inputText.value = text
  handleSend()
}

// ====== 本地模拟回复（无API时）=====
function getLocalReply(question: string): string {
  const q = question.toLowerCase()

  if (q.includes('递归')) {
    return `递归就像俄罗斯套娃——大娃娃里面套着小娃娃，小娃娃里面还有更小的。

**核心要点：**
1. **基准情况**（终止条件）：什么时候停止？比如 n=0 或 n=1 时返回固定值
2. **递归调用**：函数自己调用自己，但参数要变小
3. **栈空间**：每次调用都会占用内存，太深会栈溢出

**生活类比：**
想象你在排队查人数：
- 你问后面的人："包括你后面有几个人？"
- 后面的人又问他后面的人...
- 最后一个人说"0个"
- 然后依次往回传：1、2、3...

**常见陷阱：**
❌ 忘记终止条件 → 无限循环
❌ 参数不递减 → 永远到不了终止条件`
  }

  if (q.includes('http') || q.includes('缓存') || q.includes('cache')) {
    return `HTTP 缓存是浏览器用来加速网页加载的关键机制：

**缓存流程：**
1. 浏览器请求资源 → 先检查本地缓存
2. 命中缓存 → 直接使用（强缓存）
3. 未命中或过期 → 向服务器验证（协商缓存）
4. 返回 304 → 继续使用旧缓存
5. 返回 200 + 新内容 → 更新缓存

**关键头部字段：**
- Cache-Control: max-age=3600 — 强缓存1小时
- ETag / Last-Modified — 协商缓存的标识
- no-cache — 每次都要验证
- no-store — 完全不缓存

**实际建议：**
- 静态资源(CSS/JS/图片) → 强缓存 + 文名hash
- HTML → 协商缓存
- API数据 → 不缓存或短时间缓存`
  }

  return `收到你的问题：「${question}」

这是一个很好的问题！作为费曼学习法的AI助手，我建议你可以尝试：

1. **用自己的话复述一遍** — 能讲清楚才算真懂
2. **找一个生活中的类比** — 把抽象概念和日常经验联系起来
3. **试着教给别人听** — 讲解过程最能暴露理解盲区

如果你想获得更详细的解答，可以在「设置」中配置 DeepSeek API Key，我将为你提供更精准的回答。`
}

// ====== 工具函数 ======
async function scrollToBottom() {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 96) + 'px'
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-6px); }
}
.animate-bounce {
  animation: bounce 1.4s infinite ease-in-out;
}
textarea {
  field-sizing: content;
}
</style>
