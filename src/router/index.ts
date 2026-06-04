import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { defineAsyncComponent } from 'vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/splash',
    name: 'splash',
    component: defineAsyncComponent(() => import('@/pages/SplashView.vue')),
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: defineAsyncComponent(() => import('@/pages/HomeView.vue')),
    meta: { tab: 0, label: '首页' },
  },
  // 路径相关
  {
    path: '/paths',
    name: 'paths',
    component: defineAsyncComponent(() => import('@/pages/PathListView.vue')),
    meta: { tab: 1, label: '路径' },
  },
  {
    path: '/paths/create',
    name: 'path-create',
    component: defineAsyncComponent(() => import('@/pages/PathCreateView.vue')),
  },
  {
    path: '/paths/:id',
    name: 'path-detail',
    component: defineAsyncComponent(() => import('@/pages/PathDetailView.vue')),
  },
  // 讲解相关
  {
    path: '/explain',
    name: 'explain-list',
    component: defineAsyncComponent(() => import('@/pages/ExplainListView.vue')),
    meta: { tab: 2, label: '讲解' },
  },
  {
    path: '/explain/new',
    name: 'explain-new',
    component: defineAsyncComponent(() => import('@/pages/ExplainEditView.vue')),
  },
  {
    path: '/explain/:id',
    name: 'explain-edit',
    component: defineAsyncComponent(() => import('@/pages/ExplainEditView.vue')),
  },
  {
    path: '/explain/:id/voice',
    name: 'voice-record',
    component: defineAsyncComponent(() => import('@/pages/VoiceRecordView.vue')),
  },
  {
    path: '/explain/:id/diagnosis',
    name: 'diagnosis',
    component: defineAsyncComponent(() => import('@/pages/DiagnosisView.vue')),
  },
  // 知识图谱
  {
    path: '/graph',
    name: 'graph',
    component: defineAsyncComponent(() => import('@/pages/GraphView.vue')),
    meta: { tab: 1, label: '路径' },
  },
  // 复习相关
  {
    path: '/review/cards',
    name: 'flashcard',
    component: defineAsyncComponent(() => import('@/pages/FlashcardView.vue')),
    meta: { tab: 3, label: '复习' },
  },
  {
    path: '/review/quiz',
    name: 'quiz',
    component: defineAsyncComponent(() => import('@/pages/QuizView.vue')),
    meta: { tab: 3, label: '复习' },
  },
  {
    path: '/plan',
    name: 'plan',
    component: defineAsyncComponent(() => import('@/pages/PlanView.vue')),
    meta: { tab: 3, label: '复习' },
  },
  // 项目实践
  {
    path: '/project',
    name: 'project',
    component: defineAsyncComponent(() => import('@/pages/ProjectView.vue')),
    meta: { tab: 1, label: '路径' },
  },
  // 设置与个人中心
  {
    path: '/settings',
    name: 'settings',
    component: defineAsyncComponent(() => import('@/pages/SettingsView.vue')),
    meta: { tab: 4, label: '我的' },
  },
  {
    path: '/settings/import-export',
    name: 'import-export',
    component: defineAsyncComponent(() => import('@/pages/ImportExportView.vue')),
    meta: { tab: 4, label: '我的' },
  },
  // 广场与分析
  {
    path: '/square',
    name: 'square',
    component: defineAsyncComponent(() => import('@/pages/SquareView.vue')),
    meta: { tab: 2, label: '讲解' },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: defineAsyncComponent(() => import('@/pages/AnalyticsView.vue')),
    meta: { tab: 4, label: '我的' },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: defineAsyncComponent(() => import('@/pages/AchievementsView.vue')),
    meta: { tab: 4, label: '我的' },
  },
  // AI 助手（独立功能）
  {
    path: '/ai',
    name: 'ai-assistant',
    component: defineAsyncComponent(() => import('@/pages/AIAssistantView.vue')),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
