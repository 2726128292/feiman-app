<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div>
        <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">知识图谱</h1>
        <p class="text-sm text-slate-500 mt-0.5">查看主题之间的关联</p>
      </div>

      <!-- 主题选择器 -->
      <div class="flex items-center gap-2">
        <button
          v-for="topic in graphTopics"
          :key="topic.id"
          class="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap"
          :class="
            selectedTopicId === topic.id
              ? 'bg-[#4F6EF7] text-white shadow-md'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          "
          @click="selectedTopicId = topic.id"
        >
          {{ topic.label }}
        </button>
      </div>

      <!-- 图谱画布 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 relative overflow-hidden" style="min-height: 320px;">
        <!-- SVG 连接线层 -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 0;">
          <defs>
            <linearGradient :id="'grad-' + selectedTopicId" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#4F6EF7" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#4F6EF7" stop-opacity="0.12" />
            </linearGradient>
          </defs>
          <line
            v-for="(node, i) in currentGraph.nodes.slice(1)"
            :key="'line-' + node.id"
            :x1="centerPos.x + '%'"
            :y1="centerPos.y + '%'"
            :x2="node.pos.x + '%'"
            :y2="node.pos.y + '%'"
            :stroke="`url(#grad-${selectedTopicId})`"
            stroke-width="2"
            stroke-dasharray="6 3"
          />
        </svg>

        <!-- 节点层 -->
        <div class="relative w-full" style="height: 320px; z-index: 1;">
          <!-- 中心节点 -->
          <div
            class="absolute transform -translate-x-1/2 -translate-y-1/2"
            :style="{ left: currentGraph.center.pos.x + '%', top: currentGraph.center.pos.y + '%' }"
          >
            <div
              class="px-5 py-2.5 rounded-full shadow-lg text-sm font-bold text-white flex items-center gap-1.5"
              style="background-color: #4F6EF7;"
            >
              {{ currentGraph.center.label }}
            </div>
          </div>

          <!-- 周围节点 -->
          <div
            v-for="node in currentGraph.nodes"
            :key="node.id"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform duration-200"
            :style="{ left: node.pos.x + '%', top: node.pos.y + '%' }"
            @click="selectNode(node)"
          >
            <div
              class="px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold text-white"
              :style="{ backgroundColor: node.color }"
            >
              {{ node.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- 节点详情面板 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">节点详情：{{ selectedNode?.label || 'Vue3' }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
          {{ selectedNode?.description || '掌握度 72%，关联 Vite 构建工具、组合式 API、PWA 离线缓存等核心概念。' }}
        </p>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-500">掌握度</span>
          <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: (selectedNode?.mastery ?? 72) + '%',
                backgroundColor: selectedNode?.color || '#4F6EF7',
              }"
            />
          </div>
          <span class="text-xs font-bold tabular-nums" :style="{ color: selectedNode?.color || '#4F6EF7' }">
            {{ selectedNode?.mastery ?? 72 }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface GraphNode {
  id: string
  label: string
  color: string
  pos: { x: number; y: number }
  mastery?: number
  description?: string
}

interface GraphData {
  center: GraphNode
  nodes: GraphNode[]
}

const selectedTopicId = ref('vue3')

const graphTopics = [
  { id: 'vue3', label: 'Vue3 工程化知识网络' },
  { id: 'network', label: '计算机网络知识网络' },
  { id: 'math', label: '高等数学知识网络' },
]

const graphs: Record<string, GraphData> = {
  vue3: {
    center: { id: 'c-vue3', label: 'Vue3', color: '#4F6EF7', pos: { x: 50, y: 50 }, mastery: 72 },
    nodes: [
      { id: 'n-vite', label: 'Vite', color: '#06B6D4', pos: { x: 22, y: 20 }, mastery: 85, description: '掌握度 85%，关联 ESM 按需编译、esbuild 预构建、HMR 即时热更新。' },
      { id: 'n-router', label: 'Router', color: '#10B981', pos: { x: 78, y: 22 }, mastery: 68, description: '掌握度 68%，关联路由守卫、动态路由、嵌套路由与懒加载。' },
      { id: 'n-tailwind', label: 'Tailwind', color: '#F59E0B', pos: { x: 82, y: 65 }, mastery: 55, description: '掌握度 55%，关联原子化 CSS、响应式断点、自定义主题配置。' },
      { id: 'n-pwa', label: 'PWA', color: '#8B5CF6', pos: { x: 65, y: 86 }, mastery: 58, description: '掌握度 58%，关联 Service Worker、manifest、离线缓存策略。' },
      { id: 'n-deploy', label: '部署', color: '#EF4444', pos: { x: 20, y: 76 }, mastery: 35, description: '掌握度 35%，关联 CI/CD 流水线、GitHub Pages、Docker 容器化部署。' },
    ],
  },
  network: {
    center: { id: 'c-http', label: 'HTTP', color: '#10B981', pos: { x: 50, y: 50 }, mastery: 45 },
    nodes: [
      { id: 'n-cache', label: '缓存', color: '#F59E0B', pos: { x: 20, y: 22 }, mastery: 55, description: '掌握度 55%，关联强缓存、协商缓存、Cache-Control 与 ETag。' },
      { id: 'n-cdn', label: 'CDN', color: '#06B6D4', pos: { x: 80, y: 20 }, mastery: 40, description: '掌握度 40%，关联边缘节点、内容分发策略、回源机制。' },
      { id: 'n-tcp', label: 'TCP/IP', color: '#8B5CF6', pos: { x: 85, y: 65 }, mastery: 50, description: '掌握度 50%，关联三次握手、四次挥手、滑动窗口与拥塞控制。' },
      { id: 'n-dns', label: 'DNS', color: '#EC4899', pos: { x: 60, y: 88 }, mastery: 62, description: '掌握度 62%，关联域名解析、递归查询、缓存层级与负载均衡。' },
      { id: 'n-https', label: 'HTTPS', color: '#14B8A6', pos: { x: 18, y: 78 }, mastery: 38, description: '掌握度 38%，关联 TLS 握手、证书链、对称与非对称加密。' },
    ],
  },
  math: {
    center: { id: 'c-calc', label: '微积分', color: '#A855F7', pos: { x: 50, y: 50 }, mastery: 30 },
    nodes: [
      { id: 'n-limit', label: '极限', color: '#4F6EF7', pos: { x: 22, y: 18 }, mastery: 75, description: '掌握度 75%，关联 ε-δ 定义、夹逼准则、单调有界收敛定理。' },
      { id: 'n-deriv', label: '导数', color: '#10B981', pos: { x: 78, y: 22 }, mastery: 52, description: '掌握度 52%，关联求导法则、链式法则、隐函数求导与高阶导数。' },
      { id: 'n-integral', label: '积分', color: '#F59E0B', pos: { x: 84, y: 66 }, mastery: 28, description: '掌握度 28%，关联牛顿-莱布尼茨公式、换元积分法、分部积分法。' },
      { id: 'n-series', label: '级数', color: '#EF4444', pos: { x: 58, y: 87 }, mastery: 18, description: '掌握度 18%，关联收敛判别法、幂级数展开、傅里叶级数基础。' },
      { id: 'n-de', label: '微分方程', color: '#8B5CF6', pos: { x: 16, y: 74 }, mastery: 10, description: '掌握度 10%，关联一阶线性方程、可分离变量、常系数齐次方程。' },
    ],
  },
}

const currentGraph = computed(() => graphs[selectedTopicId.value] || graphs.vue3)

const centerPos = computed(() => currentGraph.value.center.pos)

const selectedNode = ref<GraphNode | null>(null)

function selectNode(node: GraphNode) {
  selectedNode.value = node
}
</script>
