<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-5">
    <div class="text-center max-w-sm">
      <div class="text-7xl font-black text-slate-200 dark:text-slate-700 mb-4">404</div>
      <h1 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">页面不存在</h1>
      <p class="text-sm text-slate-400 mb-8 leading-relaxed">
        你访问的页面可能已被移除或地址有误
      </p>
      <div class="flex gap-3 justify-center">
        <button
          class="px-5 py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold active:bg-blue-600 transition-colors"
          @click="$router.push('/')"
        >
          返回首页
        </button>
        <button
          class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          @click="$router.back()"
        >
          返回上页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 兜底页面 - 捕获所有未匹配的路由
</script>
