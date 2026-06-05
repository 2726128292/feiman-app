<template>
  <div class="bg-white rounded-2xl shadow-sm p-5">
    <!-- 顶部：模式选择 + 时长设置 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex gap-1.5">
        <button
          v-for="opt in durationOptions"
          :key="opt.value"
          class="px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
          :class="selectedDuration === opt.value
            ? 'bg-[#4F6EF7] text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          @click="setDuration(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
      <span class="text-xs font-medium px-2.5 py-1 rounded-full" :class="modeLabelClass">
        {{ modeLabel }}
      </span>
    </div>

    <!-- 圆形进度环 -->
    <div class="relative w-48 h-48 mx-auto my-4">
      <svg class="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <!-- 背景环 -->
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#E2E8F0"
          stroke-width="8"
        />
        <!-- 进度环 -->
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          :stroke="progressGradientId"
          stroke-width="8"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          class="transition-all duration-1000 ease-linear"
        />
        <!-- 渐变定义 -->
        <defs>
          <linearGradient :id="'grad-' + componentId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :stop-color="gradientStartColor" />
            <stop offset="100%" :stop-color="gradientEndColor" />
          </linearGradient>
        </defs>
      </svg>

      <!-- 中间内容 -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <!-- 完成状态 -->
        <template v-if="isComplete">
          <div class="text-center space-y-2">
            <span class="text-3xl">🎉</span>
            <p class="text-base font-bold text-slate-800">完成!</p>
            <!-- 简单彩纸效果 -->
            <div v-if="showConfetti" class="relative w-full h-8 overflow-hidden">
              <span
                v-for="i in 6"
                :key="i"
                class="absolute w-1.5 h-1.5 rounded-full confetti-piece"
                :style="confettiStyle(i)"
              />
            </div>
          </div>
        </template>
        <!-- 正常状态：时间 + 播放/暂停按钮 -->
        <template v-else>
          <button
            class="w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
            :class="ringColorClass"
            @click="toggleTimer"
          >
            <span v-if="!isRunning" class="text-xl leading-none ml-0.5">▶</span>
            <span v-else class="text-base leading-none">❚❚</span>
          </button>
          <p class="text-2xl font-bold tabular-nums mt-2 tracking-wider" :class="timeTextColor">
            {{ formattedTime }}
          </p>
        </template>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex items-center justify-center gap-3 mt-3">
      <button
        class="px-4 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
        @click="resetTimer"
      >
        重置
      </button>
      <button
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
        :class="isRunning ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'"
        @click="skipToNext"
      >
        跳过{{ isRunning ? '（结束当前）' : '' }}
      </button>
    </div>

    <!-- 番茄钟计数 -->
    <div class="flex items-center justify-center gap-1.5 mt-3">
      <span
        v-for="i in 4"
        :key="i"
        class="w-4 h-4 rounded-sm transition-colors"
        :class="i <= completedPomodoros ? 'bg-[#EF4444]' : 'bg-slate-200'"
        title="已完成番茄数"
      />
    </div>

    <!-- 白噪音选择（计时运行时显示） -->
    <div v-if="isRunning" class="mt-4 pt-3 border-t border-slate-100">
      <p class="text-[11px] text-slate-400 mb-2 text-center">背景音效</p>
      <div class="flex justify-center gap-2 flex-wrap">
        <button
          v-for="sound in noiseOptions"
          :key="sound.id"
          class="px-3 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer"
          :class="activeNoise === sound.id ? 'bg-[#4F6EF7] text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
          @click="toggleNoise(sound.id)"
        >
          {{ sound.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, inject } from 'vue'
import { triggerHaptic } from '@/composables/useHaptic'
import { useXPSystem } from '@/composables/useXPSystem'

// ====== Props & Emits ======
const props = withDefaults(defineProps<{
  /** 初始时长（分钟） */
  duration?: number
  /** 模式 */
  mode?: 'work' | 'break' | 'longBreak'
  /** 是否自动开始 */
  autoStart?: boolean
}>(), {
  duration: 25,
  mode: 'work',
  autoStart: false,
})

const emit = defineEmits<{
  (e: 'complete', data: { mode: string; duration: number }): void
  (e: 'modeChange', mode: string): void
}>()

// XP 经验值系统（番茄钟完成时获得 XP）
const xpSystem = useXPSystem()
const showToast = inject<(msg: string, type?: string) => void>('toast') || console.log

// ====== 常量 ======
const DURATION_OPTIONS = [
  { label: '15分', value: 15 },
  { label: '25分', value: 25 },
  { label: '45分', value: 45 },
  { label: '60分', value: 60 },
]

const RADIUS = 88
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// 唯一 ID（用于 SVG 渐变）
const componentId = Math.random().toString(36).slice(2, 8)

// ====== 状态 ======
const selectedDuration = ref(props.duration)
const currentMode = ref<'work' | 'break' | 'longBreak'>(props.mode)
const remainingSeconds = ref(props.duration * 60)
const isRunning = ref(false)
const isComplete = ref(false)
const showConfetti = ref(false)
const completedPomodoros = ref(0)

let timerInterval: ReturnType<typeof setInterval> | null = null
let audioContext: AudioContext | null = null

// ====== 计算属性 ======
const durationOptions = computed(() => DURATION_OPTIONS)

const formattedTime = computed(() => {
  const m = Math.floor(Math.max(remainingSeconds.value, 0) / 60).toString().padStart(2, '0')
  const s = (Math.max(remainingSeconds.value, 0) % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const progress = computed(() => {
  const total = selectedDuration.value * 60
  return total > 0 ? remainingSeconds.value / total : 0
})

const circumference = computed(() => CIRCUMFERENCE)

const strokeDashoffset = computed(() => {
  return CIRCUMFERENCE * (1 - progress.value)
})

const progressGradientId = computed(() => `url(#grad-${componentId})`)

const gradientStartColor = computed(() => {
  switch (currentMode.value) {
    case 'work': return '#6366F1'
    case 'break': return '#10B981'
    case 'longBreak': return '#F59E0B'
    default: return '#6366F1'
  }
})

const gradientEndColor = computed(() => {
  switch (currentMode.value) {
    case 'work': return '#4F46E5'
    case 'break': return '#059669'
    case 'longBreak': return '#D97706'
    default: return '#4F46E5'
  }
})

const ringColorClass = computed(() => {
  switch (currentMode.value) {
    case 'work': return 'bg-indigo-500 text-white shadow-indigo-200'
    case 'break': return 'bg-emerald-500 text-white shadow-emerald-200'
    case 'longBreak': return 'bg-amber-500 text-white shadow-amber-200'
    default: return 'bg-indigo-500 text-white'
  }
})

const timeTextColor = computed(() => {
  switch (currentMode.value) {
    case 'work': return 'text-indigo-600'
    case 'break': return 'text-emerald-600'
    case 'longBreak': return 'text-amber-600'
    default: return 'text-slate-800'
  }
})

const modeLabel = computed(() => {
  switch (currentMode.value) {
    case 'work': return '专注中'
    case 'break': return '短休息'
    case 'longBreak': return '长休息'
    default: return ''
  }
})

const modeLabelClass = computed(() => {
  switch (currentMode.value) {
    case 'work': return 'bg-indigo-50 text-indigo-600'
    case 'break': return 'bg-emerald-50 text-emerald-600'
    case 'longBreak': return 'bg-amber-50 text-amber-600'
    default: return 'bg-slate-100 text-slate-600'
  }
})

// ====== 彩纸效果样式 ======
function confettiStyle(index: number): Record<string, string> {
  const colors = ['#EF4444', '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
  const leftPositions = ['10%', '30%', '50%', '70%', '85%', '45%']
  const delays = ['0s', '0.15s', '0.3s', '0.1s', '0.25s', '0.2s']
  return {
    backgroundColor: colors[index - 1],
    left: leftPositions[index - 1],
    animationDelay: delays[index - 1],
  }
}

// ====== 方法 ======

function setDuration(minutes: number): void {
  if (isRunning.value) return // 运行中不允许切换
  selectedDuration.value = minutes
  remainingSeconds.value = minutes * 60
  isComplete.value = false
}

function toggleTimer(): void {
  if (isComplete.value) {
    resetTimer()
    startTimer()
    return
  }

  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

function startTimer(): void {
  if (remainingSeconds.value <= 0) {
    remainingSeconds.value = selectedDuration.value * 60
  }
  isRunning.value = true
  isComplete.value = false

  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      handleComplete()
    }
  }, 1000)
}

function pauseTimer(): void {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function resetTimer(): void {
  pauseTimer()
  remainingSeconds.value = selectedDuration.value * 60
  isComplete.value = false
  showConfetti.value = false
}

function skipToNext(): void {
  pauseTimer()
  handleComplete(true)
}

function handleComplete(isSkip = false): void {
  pauseTimer()

  // 番茄钟结束时停止白噪音
  stopNoise()

  if (!isSkip) {
    // 播放提示音
    playBeep()
    // 显示完成动画
    isComplete.value = true
    showConfetti.value = true
    setTimeout(() => { showConfetti.value = false }, 3000)
    // 番茄钟完成触觉反馈
    triggerHaptic('success')

    if (currentMode.value === 'work') {
      completedPomodoros.value++
    }
  }

  // 发出完成事件
  emit('complete', { mode: currentMode.value, duration: selectedDuration.value })

  // 自动切换模式
  switchMode()
}

function switchMode(): void {
  if (currentMode.value === 'work') {
    // 每完成4个番茄后，长休息
    if ((completedPomodoros.value > 0 && completedPomodoros.value % 4 === 0)) {
      setMode('longBreak', 15)
    } else {
      setMode('break', 5)
    }
  } else {
    // 休息结束后回到工作模式
    setMode('work', selectedDuration.value)
  }
}

function setMode(mode: 'work' | 'break' | 'longBreak', minutes?: number): void {
  currentMode.value = mode
  if (minutes !== undefined) {
    selectedDuration.value = minutes
  } else {
    // 根据模式设默认时长
    switch (mode) {
      case 'work':
        selectedDuration.value = props.duration || 25
        break
      case 'break':
        selectedDuration.value = 5
        break
      case 'longBreak':
        selectedDuration.value = 15
        break
    }
  }
  remainingSeconds.value = selectedDuration.value * 60
  isComplete.value = false
  emit('modeChange', mode)
}

// ====== Web Audio API 提示音 ======
function playBeep(): void {
  try {
    if (!audioContext) {
      audioContext = new AudioContext()
    }
    const ctx = audioContext

    // 创建双音提示音
    const playTone = (freq: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(freq, startTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }

    const now = ctx.currentTime
    playTone(880, now, 0.15)     // 高音 A5
    playTone(1100, now + 0.18, 0.2) // 更高音
  } catch {
    // Web Audio API 不可用时静默失败
  }
}

// ==================== 白噪音（Web Audio API 生成，无需外部音频文件） ====================

/** 白噪音选项列表 */
const noiseOptions = [
  { id: 'none', label: '静音' },
  { id: 'rain', label: '雨声' },
  { id: 'fire', label: '壁炉' },
  { id: 'cafe', label: '咖啡厅' },
  { id: 'wind', label: '风声' },
]

/** 当前激活的白噪音类型 */
const activeNoise = ref('none')

/** 噪音音频上下文引用（单例复用） */
const noiseCtxRef = ref<AudioContext | null>(null)
const noiseSrcRef = ref<AudioBufferSourceNode | AudioNode | null>(null)
let noiseGainNode: GainNode | null = null

/**
 * 获取或创建 AudioContext（单例模式，避免反复重建）
 */
function getOrCreateAudioContext(): AudioContext {
  if (!noiseCtxRef.value || noiseCtxRef.value.state === 'closed') {
    noiseCtxRef.value = new AudioContext()
  }
  return noiseCtxRef.value
}

/**
 * 使用 Web Audio API 生成白噪声/环境音
 * 无需外部音频文件，纯程序化生成
 * 复用全局单例 AudioContext
 * @param type 噪音类型：rain / fire / cafe / wind
 */
function createNoise(type: string): void {
  const ctx = getOrCreateAudioContext()
  const gain = ctx.createGain()
  // 设置音量为 30%，不会太吵
  gain.gain.value = 0.3
  gain.connect(ctx.destination)

  if (type === 'rain' || type === 'wind') {
    // 使用 BufferSource 生成粉红/白噪声模拟雨声或风声
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (type === 'wind' ? 0.5 : 0.3)
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    // 添加滤波器来塑造声音特性
    const filter = ctx.createBiquadFilter()
    if (type === 'rain') {
      filter.type = 'lowpass'
      filter.frequency.value = 1000 // 雨声：低通滤波，柔和
    } else {
      filter.type = 'highpass'
      filter.frequency.value = 400 // 风声：高通滤波，更尖锐
    }
    source.connect(filter)
    filter.connect(gain)
    source.start()
    noiseSrcRef.value = source
    noiseGainNode = gain
    return
  }

  if (type === 'fire') {
    // 模拟壁炉火声（低频脉冲 + 随机噪声）
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.sin(i * 0.02) * (Math.random() * 0.3) + (Math.random() * 2 - 1) * 0.1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400 // 火声：低频为主
    source.connect(filter)
    filter.connect(gain)
    source.start()
    noiseSrcRef.value = source
    noiseGainNode = gain
    return
  }

  if (type === 'cafe') {
    // 模拟咖啡厅环境音（低音量混合白噪声）
    const bufferSize = 2 * ctx.sampleRate
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.08 // 较低音量
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 800 // 中频带通，模拟人声背景
    filter.Q.value = 0.5
    source.connect(filter)
    filter.connect(gain)
    source.start()
    noiseSrcRef.value = source
    noiseGainNode = gain
    return
  }
}

/**
 * 停止当前播放的白噪音（只停止音源，不关闭 AudioContext）
 */
function stopNoise(): void {
  try {
    if (noiseSrcRef.value) {
      const src = noiseSrcRef.value
      if ('stop' in src && typeof src.stop === 'function') {
        ;(src as AudioBufferSourceNode).stop()
      }
      src.disconnect()
      noiseSrcRef.value = null
    }
  } catch {
    // 已经停止或已断开连接，忽略错误
  }
  activeNoise.value = 'none'
  noiseGainNode = null
}

/**
 * 切换白噪音类型
 * @param noiseId 目标噪音ID
 */
function toggleNoise(noiseId: string): void {
  // 如果点击的是当前已选中的，不做任何操作
  if (activeNoise.value === noiseId) return

  // 先停止当前正在播放的噪音（只停音源，不复用 AudioContext）
  stopNoise()

  activeNoise.value = noiseId

  // 如果不是静音模式，创建并播放新噪音
  if (noiseId !== 'none') {
    createNoise(noiseId)
  }
}

// ====== 自动启动 ======
watch(() => props.autoStart, (val) => {
  if (val && !isRunning.value && !isComplete.value) {
    startTimer()
  }
}, { immediate: true })

// ====== 清理 ======
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (audioContext) {
    audioContext.close().catch(() => {})
  }
  // 停止白噪音音源
  stopNoise()
  // 安全关闭噪音 AudioContext
  if (noiseCtxRef.value && noiseCtxRef.value.state !== 'closed') {
    noiseCtxRef.value.close().catch(() => {})
    noiseCtxRef.value = null
  }
})
</script>

<style scoped>
.confetti-piece {
  position: absolute;
  top: 0;
  animation: confetti-fall 1s ease-out forwards;
}
@keyframes confetti-fall {
  0% {
    transform: translateY(-10px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(28px) rotate(360deg);
    opacity: 0;
  }
}
</style>
