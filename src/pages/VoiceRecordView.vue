<template>
  <div class="min-h-screen bg-[#1E293B] text-white pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-6">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-white">语音讲解模式</h1>
        <p class="text-sm text-slate-400 mt-0.5">录音后自动转文字与评分</p>
      </div>

      <!-- 错误提示 -->
      <div
        v-if="errorMessage"
        class="bg-red-500/20 border border-red-500/40 rounded-xl p-4 flex items-start gap-3"
      >
        <span class="text-red-400 text-lg leading-none mt-0.5">⚠</span>
        <div>
          <p class="text-sm text-red-300">{{ errorMessage }}</p>
          <a
            v-if="errorLink"
            :href="errorLink"
            target="_blank"
            class="text-xs text-blue-400 underline mt-1 inline-block"
          >了解更多</a>
        </div>
      </div>

      <!-- 录音区域 -->
      <div class="flex flex-col items-center py-8">
        <!-- 录音按钮 -->
        <button
          class="w-48 h-48 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer"
          :class="isRecording
            ? 'bg-[#EF4444] shadow-red-500/30 animate-pulse-scale'
            : 'bg-[#4F6EF7] shadow-blue-500/30'"
          @click="toggleRecording"
        >
          <span class="text-4xl font-bold text-white">{{ isRecording ? '停' : '录' }}</span>
        </button>

        <!-- 计时器 -->
        <p class="text-4xl font-bold text-white mt-8 tabular-nums tracking-wider">{{ formattedTime }}</p>

        <!-- 转写文本 -->
        <div class="mt-5 w-full max-w-sm">
          <p class="text-sm text-slate-500 mb-1.5">
            {{ isRecording ? '正在识别...' : hasRecorded ? '识别结果：' : '等待开始录音...' }}
          </p>
          <p class="text-sm text-slate-400 leading-relaxed line-clamp-3 min-h-[4.2rem]">
            {{ transcription || (hasRecorded ? '未识别到语音内容' : '') }}
          </p>
          <!-- 语音识别不支持提示 -->
          <p v-if="stUnsupported" class="text-xs text-amber-400/80 mt-1.5">
            当前浏览器不支持语音转文字，录音仍会保存
          </p>
        </div>

        <!-- 录音回放 -->
        <div v-if="audioUrl && !isRecording" class="mt-4 w-full max-w-sm bg-slate-800/60 rounded-xl p-4 flex items-center gap-3">
          <button
            class="w-10 h-10 rounded-full bg-[#4F6EF7] flex items-center justify-center shrink-0 cursor-pointer"
            @click="togglePlayback"
          >
            <span v-if="!isPlaying" class="text-white text-base leading-none ml-0.5">▶</span>
            <span v-else class="text-white text-base leading-none">❚❚</span>
          </button>
          <audio ref="audioRef" :src="audioUrl" class="hidden" />
          <div class="flex-1">
            <p class="text-xs text-slate-400">录音回放</p>
            <p class="text-xs text-slate-500">{{ formattedDuration }}</p>
          </div>
        </div>
      </div>

      <!-- 实时指标面板 -->
      <div v-if="hasRecorded" class="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
        <h2 class="text-base font-bold text-slate-200 mb-4">实时指标</h2>
        <div class="space-y-4">
          <!-- 语速 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm text-slate-400">语速</span>
              <span class="text-sm font-semibold text-cyan-400">{{ metrics.wpm }} 字/分</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-500"
                :style="{ width: Math.min(metrics.wpm / 3, 100) + '%' }"
              />
            </div>
          </div>
          <!-- 停顿 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm text-slate-400">停顿</span>
              <span class="text-sm font-semibold text-emerald-400">{{ metrics.pauseStatus === 'normal' ? '正常' : '偏长' }}</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                :style="{ width: metrics.pauseStatus === 'normal' ? '45%' : '75%' }"
              />
            </div>
          </div>
          <!-- 清晰度 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-sm text-slate-400">清晰度</span>
              <span class="text-sm font-semibold text-blue-400">{{ metrics.clarityScore }} 分</span>
            </div>
            <div class="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                :style="{ width: metrics.clarityScore + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 保存录音按钮 -->
      <button
        v-if="hasRecorded"
        class="w-full py-3 rounded-full border-2 border-emerald-200 text-emerald-600 text-sm font-medium active:bg-emerald-50 transition-colors mb-3"
        @click="saveRecording"
      >
        💾 保存录音到本地
      </button>

      <!-- 历史录音列表 -->
      <div v-if="historyList.length > 0" class="mt-2">
        <h3 class="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
          <Clock :size="15" /> 历史录音 ({{ historyList.length }})
        </h3>
        <div class="space-y-2">
          <div
            v-for="item in historyList"
            :key="item.id"
            class="bg-slate-800/60 rounded-xl p-3 shadow-sm flex items-center gap-3"
          >
            <button
              class="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 cursor-pointer"
              @click="playHistoryItem(item)"
            >
              <Play :size="14" class="text-blue-400" />
            </button>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-slate-300 truncate">{{ item.topic || '未命名讲解' }}</p>
              <p class="text-[11px] text-slate-500">
                {{ item.duration }}秒 · {{ formatTimeAgo(item.createdAt) }} · 语速{{ item.wpm }}字/分
              </p>
            </div>
            <button class="text-slate-600 hover:text-red-400 shrink-0 cursor-pointer" @click="deleteRecording(item.id)">
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- 底部按钮（结束并分析） -->
      <button
        class="w-full py-3.5 rounded-full text-base font-semibold active:scale-[0.98] transition-transform duration-150"
        :class="hasRecorded
          ? 'bg-white text-slate-900'
          : 'bg-slate-600 text-slate-400 cursor-not-allowed'"
        :disabled="!hasRecorded"
        @click="handleFinish"
      >
        结束并分析
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Play, Trash2 } from 'lucide-vue-next'

const router = useRouter()

// 注入全局 Toast
const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast') || ((msg: string) => console.log(msg))

// ====== 状态 ======
const isRecording = ref(false)
const seconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

// 录音相关
let mediaRecorder: MediaRecorder | null = null
let audioStream: MediaStream | null = null
const chunks: Blob[] = []
const audioUrl = ref<string>('')
const audioBlob = ref<Blob | null>(null)
const hasRecorded = ref(false)
const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

// 转写相关
const transcription = ref('')
const stUnsupported = ref(false)
let recognition: SpeechRecognition | null = null

// 错误提示
const errorMessage = ref('')
const errorLink = ref('')

// 指标（录音结束后计算）
const metrics = ref({
  wpm: 0,
  pauseStatus: 'normal' as 'normal' | 'long',
  clarityScore: 0,
})

// ====== 计算属性 ======
const formattedTime = computed(() => {
  const m = Math.floor(seconds.value / 60).toString().padStart(2, '0')
  const s = (seconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const formattedDuration = computed(() => {
  const totalSeconds = seconds.value
  if (totalSeconds === 0) return ''
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `时长 ${m}:${s}`
})

// ====== 浏览器支持检测 ======
function checkBrowserSupport(): { mediaRecorder: boolean; speechRecognition: boolean } {
  const mr = typeof MediaRecorder !== 'undefined'
  // 兼容 webkitSpeechRecognition
  const sr = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  return { mediaRecorder: mr, speechRecognition: sr }
}

// ====== 初始化语音识别 ======
function initSpeechRecognition(): void {
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognitionCtor) {
    stUnsupported.value = true
    return
  }

  recognition = new SpeechRecognitionCtor()
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let finalTranscript = ''
    let interimTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalTranscript += result[0].transcript
      } else {
        interimTranscript += result[0].transcript
      }
    }

    transcription.value = finalTranscript || interimTranscript
  }

  recognition.onerror = (event: Event) => {
    const e = event as SpeechRecognitionErrorEvent
    if (e.error !== 'no-speech') {
      console.warn('语音识别错误:', e.error)
    }
  }

  recognition.onend = () => {
    // 如果仍在录音中，尝试重新启动（语音识别会自动结束）
    if (isRecording.value) {
      try {
        recognition?.start()
      } catch {
        // 忽略重启失败
      }
    }
  }
}

// ====== 录音控制 ======
async function toggleRecording(): Promise<void> {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

async function startRecording(): Promise<void> {
  try {
    // 检查浏览器支持
    const support = checkBrowserSupport()
    if (!support.mediaRecorder) {
      errorMessage.value = '当前浏览器不支持录音功能，请使用 Chrome、Edge 或 Safari 最新版本。'
      errorLink.value = 'https://developer.mozilla.org/zh-CN/docs/Web/API/MediaRecorder_API'
      return
    }

    // 清除之前的状态
    errorMessage.value = ''
    errorLink.value = ''
    chunks.length = 0
    transcription.value = ''
    hasRecorded.value = false
    seconds.value = 0
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
      audioUrl.value = ''
    }
    audioBlob.value = null

    // 请求麦克风权限
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })

    // 创建 MediaRecorder
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    mediaRecorder = new MediaRecorder(audioStream, { mimeType })

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      handleRecordingComplete()
    }

    mediaRecorder.onerror = (event: Event) => {
      console.error('MediaRecorder 错误:', event)
      errorMessage.value = '录音过程中出现错误，请重试。'
    }

    // 开始录音
    mediaRecorder.start(1000) // 每1000ms收集一次数据
    isRecording.value = true

    // 启动计时器
    timerInterval = setInterval(() => {
      seconds.value++
    }, 1000)

    // 启动语音识别
    initSpeechRecognition()
    if (recognition) {
      try {
        recognition.start()
      } catch {
        // 如果启动失败，忽略，录音仍然继续
      }
    }
  } catch (err: unknown) {
    const error = err as Error
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage.value = '麦克风权限被拒绝。请在浏览器地址栏左侧点击图标，允许访问麦克风后重试。'
    } else if (error.name === 'NotFoundError') {
      errorMessage.value = '未检测到可用的麦克风设备，请确认已连接麦克风。'
    } else {
      errorMessage.value = `无法启动录音：${error.message}`
    }
  }
}

function stopRecording(): void {
  // 停止 MediaRecorder
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  // 停止语音识别
  if (recognition) {
    try {
      recognition.stop()
    } catch {
      // ignore
    }
  }

  // 停止计时器
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  // 关闭音频流
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop())
    audioStream = null
  }

  isRecording.value = false
}

function handleRecordingComplete(): void {
  if (chunks.length === 0) {
    errorMessage.value = '未录制到音频内容，请检查麦克风是否正常工作。'
    return
  }

  // 创建 Blob
  const mimeType = mediaRecorder?.mimeType || 'audio/webm'
  audioBlob.value = new Blob(chunks, { type: mimeType })
  audioUrl.value = URL.createObjectURL(audioBlob.value)
  hasRecorded.value = true

  // 计算指标
  calculateMetrics()

  // 清理 mediaRecorder
  mediaRecorder = null
}

// ====== 指标计算 ======
function calculateMetrics(): void {
  const durationMinutes = Math.max(seconds.value / 60, 0.01)

  // 语速：基于转写文字字数 / 时长
  const wordCount = transcription.value.replace(/\s/g, '').length
  const wpm = durationMinutes > 0 ? Math.round(wordCount / durationMinutes) : 0

  // 停顿判断：基于音频 blob 大小与时长比例的启发式估算
  let pauseStatus: 'normal' | 'long' = 'normal'
  let clarityScore = 75 // 基础分

  if (audioBlob.value) {
    const bytesPerSecond = audioBlob.value.size / Math.max(seconds.value, 1)
    // 正常语速下 webm opus 大约 2000-8000 bytes/sec
    // 过低说明有大量静音（停顿）
    if (bytesPerSecond < 1500) {
      pauseStatus = 'long'
      clarityScore -= 15
    } else if (bytesPerSecond > 3000) {
      clarityScore += 10
    }
  }

  // 有转写文字加分
  if (wordCount > 10) {
    clarityScore += 10
  }
  // 有一定时长加分
  if (seconds.value >= 30) {
    clarityScore += 5
  }

  clarityScore = Math.max(0, Math.min(100, clarityScore))

  metrics.value = {
    wpm: Math.max(wpm, 0),
    pauseStatus,
    clarityScore,
  }
}

// ====== 回放控制 ======
function togglePlayback(): void {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play()
    isPlaying.value = true
    audioRef.value.onended = () => {
      isPlaying.value = false
    }
  }
}

// ====== 结束并分析 ======
function handleFinish(): void {
  if (timerInterval) clearInterval(timerInterval)
  // 将录音数据传递给诊断页面（通过 sessionStorage）
  if (audioBlob.value) {
    try {
      const reader = new FileReader()
      reader.onload = () => {
        sessionStorage.setItem('feiman_voice_blob', reader.result as string)
        sessionStorage.setItem('feiman_voice_transcription', transcription.value)
        sessionStorage.setItem('feiman_voice_duration', String(seconds.value))
        sessionStorage.setItem('feiman_voice_metrics', JSON.stringify(metrics.value))
        router.push('/explain/new/diagnosis')
      }
      reader.readAsDataURL(audioBlob.value!)
    } catch {
      // 即使保存失败也跳转
      router.push('/explain/new/diagnosis')
    }
  } else {
    router.push('/explain/new/diagnosis')
  }
}

// ====== 录音保存与历史 ======

/** 当前讲解主题（用于录音命名） */
const currentTopic = ref('未命名讲解')

/** 历史录音列表 */
const historyList = ref<Array<{
  id: string
  topic: string
  duration: number
  base64: string
  mimeType: string
  wpm: number
  clarity: number
  createdAt: string
}>>([])

/** 历史录音播放引用 */
const historyAudioRef = ref<HTMLAudioElement | null>(null)

/**
 * 格式化时间差为相对时间描述
 * @param isoDate ISO 格式日期字符串
 * @returns 相对时间文本，如 "3分钟前"
 */
function formatTimeAgo(isoDate: string): string {
  const now = Date.now()
  const then = new Date(isoDate).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 7) return `${diffDay}天前`
  return new Date(isoDate).toLocaleDateString('zh-CN')
}

/** 保存录音到 localStorage */
function saveRecording(): void {
  if (!audioUrl.value || !audioBlob.value) {
    showToast('没有可保存的录音', 'warning')
    return
  }

  audioBlob.value.arrayBuffer()
    .then((buf: ArrayBuffer) => {
      const bytes = new Uint8Array(buf)
      let binary = ''
      bytes.forEach((b: number) => { binary += String.fromCharCode(b) })
      const base64 = btoa(binary)

      const recordingsRaw = localStorage.getItem('feiman_voice_recordings')
      const recordings = recordingsRaw ? JSON.parse(recordingsRaw) : []

      recordings.unshift({
        id: crypto.randomUUID(),
        topic: currentTopic.value,
        duration: Math.round(seconds.value),
        base64,
        mimeType: audioBlob.value!.type || 'audio/webm',
        wpm: metrics.value.wpm,
        clarity: metrics.value.clarityScore,
        createdAt: new Date().toISOString(),
      })

      // 只保留最近 10 条
      if (recordings.length > 10) recordings.length = 10

      localStorage.setItem('feiman_voice_recordings', JSON.stringify(recordings))
      showToast('录音已保存！', 'success')
      loadRecordings() // 刷新列表
    })
    .catch(() => {
      showToast('保存失败，请重试', 'error')
    })
}

/** 加载历史录音列表 */
function loadRecordings(): void {
  try {
    const raw = localStorage.getItem('feiman_voice_recordings')
    historyList.value = raw ? JSON.parse(raw) : []
  } catch {
    historyList.value = []
  }
}

// 初始加载历史录音
loadRecordings()

/** 删除指定历史录音 */
function deleteRecording(id: string): void {
  if (!window.confirm('确定删除这条录音？')) return
  try {
    let recordings = JSON.parse(localStorage.getItem('feiman_voice_recordings') || '[]')
    recordings = recordings.filter((r: { id: string }) => r.id !== id)
    localStorage.setItem('feiman_voice_recordings', JSON.stringify(recordings))
    loadRecordings()
    showToast('已删除', 'info')
  } catch {
    showToast('删除失败', 'error')
  }
}

/** 播放历史录音 */
function playHistoryItem(item: { mimeType: string; base64: string }): void {
  if (historyAudioRef.value) {
    historyAudioRef.value.pause()
  }
  const audio = new Audio(`data:${item.mimeType};base64,${item.base64}`)
  historyAudioRef.value = audio
  audio.play().catch(() => showToast('播放失败', 'error'))
}

// ====== 清理 ======
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (recognition) {
    try {
      recognition.stop()
    } catch {
      // ignore
    }
  }
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop())
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>

<style scoped>
@keyframes pulseScale {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.animate-pulse-scale {
  animation: pulseScale 1.5s ease-in-out infinite;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
