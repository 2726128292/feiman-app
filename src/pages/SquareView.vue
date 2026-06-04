<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题区 -->
      <div>
        <h1 class="text-2xl font-bold text-slate-900">讲解广场</h1>
        <p class="text-sm text-slate-500 mt-0.5">分享讲解，获得同伴反馈</p>
      </div>

      <!-- 帖子列表 -->
      <div class="space-y-3">
        <div
          v-for="post in posts"
          :key="post.id"
          class="bg-white rounded-2xl shadow-sm p-4 cursor-pointer active:scale-[0.98] transition-transform duration-150"
          @click="handlePostClick(post.id)"
        >
          <!-- 用户信息行 -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                :style="{ backgroundColor: post.avatarColor }"
              >
                {{ post.avatarLetter }}
              </div>
              <span class="text-sm font-semibold text-slate-800">{{ post.author }}</span>
            </div>
            <button
              class="px-3 py-1 rounded-full bg-blue-50 text-[#4F6EF7] text-xs font-semibold active:bg-blue-100 transition-colors"
              @click.stop="handleLearn(post.id)"
            >
              学习
            </button>
          </div>

          <!-- 标题 -->
          <h3 class="text-base font-semibold text-slate-900 mb-2 leading-snug">{{ post.title }}</h3>

          <!-- 元数据 -->
          <div class="flex items-center gap-3 text-xs text-slate-400">
            <span>清晰度 {{ post.clarity }}</span>
            <span>·</span>
            <span>{{ post.likes }} 赞</span>
          </div>
        </div>
      </div>

      <!-- 底部互评机制提示 -->
      <div class="bg-emerald-50 rounded-2xl p-4">
        <div class="flex items-start gap-3">
          <Users :size="20" class="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 class="text-sm font-semibold text-emerald-800">互评机制</h3>
            <p class="text-xs text-emerald-700/80 mt-1 leading-relaxed">
              可关闭社交功能，默认仅本地学习。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Users } from 'lucide-vue-next'

const router = useRouter()

const posts = [
  {
    id: 1,
    author: '小林',
    avatarLetter: '小林',
    avatarColor: '#06B6D4',
    title: '用咖啡机解释事件循环',
    clarity: 91,
    likes: 120,
  },
  {
    id: 2,
    author: 'Mia',
    avatarLetter: 'M',
    avatarColor: '#10B981',
    title: '三分钟讲懂 HTTP 缓存',
    clarity: 88,
    likes: 96,
  },
  {
    id: 3,
    author: '张同学',
    avatarLetter: '张',
    avatarColor: '#8B5CF6',
    title: '递归与动态规划区别',
    clarity: 84,
    likes: 73,
  },
]

function handlePostClick(id: number) {
  router.push('/explain/new')
}

function handleLearn(id: number) {
  router.push('/explain/new')
}
</script>
