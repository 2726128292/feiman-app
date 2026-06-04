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
        class="w-full py-3.5 rounded-full bg-[#4F6EF7] text-white text-base font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform duration-150"
        @click="handleGenerate"
      >
        生成学习路径
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Sparkles } from 'lucide-vue-next'

const router = useRouter()

const form = reactive({
  goalName: '',
  currentLevel: '',
  timeCommitment: '',
})

const selectedPrefs = ref<string[]>(['beginner'])

const preferences = [
  {
    key: 'beginner',
    label: '讲授小白听',
    activeClass: 'bg-blue-50 border border-blue-300 text-blue-700',
  },
  {
    key: 'exam',
    label: '考试冲刺',
    activeClass: 'bg-orange-50 border border-orange-300 text-orange-700',
  },
  {
    key: 'project',
    label: '项目实践',
    activeClass: 'bg-green-50 border border-green-300 text-green-700',
  },
  {
    key: 'interview',
    label: '面试问答',
    activeClass: 'bg-purple-50 border border-purple-300 text-purple-700',
  },
]

function togglePref(key: string) {
  const idx = selectedPrefs.value.indexOf(key)
  if (idx >= 0) {
    selectedPrefs.value.splice(idx, 1)
  } else {
    selectedPrefs.value.push(key)
  }
}

function handleGenerate() {
  // TODO: 调用 AI 生成逻辑后跳转
  router.push('/paths')
}
</script>
