<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">学习路径</h1>
        <p class="text-sm text-slate-500 mt-0.5">用路线拆解大目标</p>
      </div>

      <!-- 搜索栏 -->
      <div class="relative">
        <Search
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索课程、主题、知识点"
          class="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
        />
      </div>

      <!-- 学习主题卡片列表 -->
      <div class="space-y-3">
        <div
          v-for="topic in filteredTopics"
          :key="topic.id"
          class="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform duration-150"
          @click="router.push(`/paths/${topic.id}`)"
        >
          <!-- 左侧：图标 + 信息 -->
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- 彩色圆形图标 -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              :style="{ backgroundColor: topic.color + '18', color: topic.color }"
            >
              <BookOpen :size="20" />
            </div>
            <!-- 标题 + 标签 + 进度条 -->
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-semibold text-slate-900 truncate">{{ topic.title }}</h3>
              <div class="flex gap-1.5 mt-1 mb-2">
                <span
                  v-for="tag in topic.tags"
                  :key="tag"
                  class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  :style="{ backgroundColor: topic.color + '14', color: topic.color }"
                >
                  {{ tag }}
                </span>
              </div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :style="{ width: `${topic.progress}%`, backgroundColor: topic.color }"
                />
              </div>
            </div>
          </div>
          <!-- 右侧：进度百分比 -->
          <span
            class="text-lg font-bold ml-4 shrink-0 tabular-nums"
            :style="{ color: topic.color }"
          >
            {{ topic.progress }}%
          </span>
        </div>
      </div>

      <!-- 底部：生成学习路径卡片 -->
      <div
        class="bg-emerald-50 rounded-2xl p-5 cursor-pointer active:scale-[0.98] transition-transform duration-150"
        @click="router.push('/paths/create')"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Sparkles :size="20" class="text-emerald-600" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-emerald-900">生成学习路径</h3>
            <p class="text-xs text-emerald-600/80 mt-1 leading-relaxed">
              输入你的学习目标，AI 将自动拆解为章节、任务和复习节点，为你规划最优学习路线。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, BookOpen, Sparkles } from 'lucide-vue-next'
import { mockTopics } from '@/utils/mock'

const router = useRouter()
const searchQuery = ref('')

const filteredTopics = computed(() => {
  if (!searchQuery.value.trim()) return mockTopics
  const q = searchQuery.value.toLowerCase()
  return mockTopics.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
  )
})
</script>
