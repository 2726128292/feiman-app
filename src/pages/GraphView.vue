<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-5">
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">知识图谱</h1>
          <p class="text-sm text-slate-500 mt-0.5">查看主题之间的关联</p>
        </div>
        <!-- 添加节点按钮 -->
        <button
          class="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#4F6EF7] text-white shadow-md hover:bg-[#3B5AE0] active:scale-95 transition-all duration-200 flex items-center gap-1"
          @click="showAddDialog = true"
        >
          <span class="text-sm leading-none">+</span> 添加节点
        </button>
      </div>

      <!-- 主题选择器 -->
      <div class="flex items-center gap-2 flex-wrap">
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
      <div
        class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 relative overflow-hidden"
        style="min-height: 320px;"
        @click.self="clearSelection"
      >
        <!-- SVG 连接线层 -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 0;">
          <defs>
            <linearGradient :id="'grad-' + selectedTopicId" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#4F6EF7" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#4F6EF7" stop-opacity="0.12" />
            </linearGradient>
          </defs>
          <line
            v-for="node in currentGraph.nodes"
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
            class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            :style="{ left: currentGraph.center.pos.x + '%', top: currentGraph.center.pos.y + '%' }"
            @click="selectNode(currentGraph.center)"
          >
            <div
              class="px-5 py-2.5 rounded-full shadow-lg text-sm font-bold text-white flex items-center gap-1.5 transition-transform duration-200 hover:scale-105"
              :class="{ 'ring-2 ring-offset-2 ring-[#4F6EF7] ring-offset-white dark:ring-offset-slate-800': selectedNode?.id === currentGraph.center.id }"
              style="background-color: #4F6EF7;"
            >
              {{ currentGraph.center.label }}
            </div>
          </div>

          <!-- 周围节点 -->
          <div
            v-for="node in currentGraph.nodes"
            :key="node.id"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            :style="{ left: node.pos.x + '%', top: node.pos.y + '%' }"
          >
            <div
              class="px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold text-white transition-all duration-200 hover:scale-110 relative"
              :class="{ 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800': selectedNode?.id === node.id }"
              :style="{ backgroundColor: node.color, '--tw-ring-color': node.color }"
              @click="selectNode(node)"
            >
              {{ editingNode?.id === node.id ? '' : node.label }}

              <!-- 节点内编辑输入框（行内编辑） -->
              <input
                v-if="editingNode?.id === node.id && !isCenterNode(node)"
                ref="editInputRef"
                v-model="editingLabel"
                class="absolute inset-0 w-full h-full rounded-full bg-transparent text-center text-xs font-semibold text-white placeholder-white/70 outline-none px-3.5"
                :style="{ backgroundColor: node.color }"
                placeholder="输入名称"
                @keyup.enter="saveEdit()"
                @blur="saveEdit()"
                @click.stop
              />

              <!-- 删除小按钮 -->
              <button
                v-if="!isCenterNode(node)"
                class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-90 group-hover:scale-100 shadow-sm"
                @click.stop="confirmDelete(node)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 节点详情面板 -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div class="flex items-start justify-between">
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">
            节点详情：{{ selectedNode?.label || '未选择' }}
          </h3>
          <div v-if="selectedNode" class="flex items-center gap-2">
            <!-- 编辑按钮 -->
            <button
              class="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              @click="startEdit(selectedNode)"
            >
              编辑
            </button>
            <!-- 删除按钮 -->
            <button
              v-if="!isCenterNode(selectedNode)"
              class="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              @click="confirmDelete(selectedNode)"
            >
              删除
            </button>
          </div>
        </div>

        <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {{ selectedNode?.description || '点击上方节点查看详细信息' }}
        </p>

        <!-- 描述编辑区 -->
        <div v-if="editingNode?.id === selectedNode?.id" class="space-y-2">
          <label class="text-xs font-medium text-slate-600 dark:text-slate-400">描述</label>
          <textarea
            v-model="editingDescription"
            class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/30"
            rows="2"
            placeholder="输入节点描述..."
            @keyup.enter.ctrl="saveEdit()"
          />
          <div class="flex justify-end gap-2">
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              @click="cancelEdit()"
            >
              取消
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#4F6EF7] text-white hover:bg-[#3B5AE0] transition-colors"
              @click="saveEdit()"
            >
              保存
            </button>
          </div>
        </div>

        <div v-if="selectedNode" class="flex items-center gap-3">
          <span class="text-xs text-slate-500">掌握度</span>
          <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: (selectedNode.mastery ?? 50) + '%',
                backgroundColor: selectedNode.color || '#4F6EF7',
              }"
            />
          </div>
          <span class="text-xs font-bold tabular-nums" :style="{ color: selectedNode.color || '#4F6EF7' }">
            {{ selectedNode.mastery ?? 50 }}%
          </span>
        </div>
      </div>
    </div>

    <!-- 添加节点弹窗 -->
    <Teleport to="body">
      <div
        v-if="showAddDialog"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="showAddDialog = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 animate-slide-up shadow-xl">
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">添加新节点</h3>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">节点名称</label>
              <input
                ref="addInputRef"
                v-model="newNodeLabel"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/30"
                placeholder="例如：TypeScript、Docker..."
                @keyup.enter="addNode()"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">描述（可选）</label>
              <textarea
                v-model="newNodeDesc"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#4F6EF7]/30"
                rows="2"
                placeholder="简要描述该知识点..."
              />
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              @click="showAddDialog = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium bg-[#4F6EF7] text-white hover:bg-[#3B5AE0] active:scale-95 transition-all disabled:opacity-50"
              :disabled="!newNodeLabel.trim()"
              @click="addNode()"
            >
              确认添加
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="showDeleteConfirm = false"
      >
        <div class="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-6 space-y-4 animate-slide-up shadow-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <span class="text-red-500 text-lg">⚠</span>
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">确认删除</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                确定要删除「{{ nodeToDelete?.label }}」吗？此操作不可撤销。
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              @click="showDeleteConfirm = false"
            >
              取消
            </button>
            <button
              class="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all"
              @click="deleteNode()"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, inject } from 'vue'
import { generateId } from '@/utils/id'

// ==================== 类型定义 ====================

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

interface GraphTopic {
  id: string
  label: string
}

// ==================== 常量与默认数据 ====================

const COLOR_POOL = [
  '#06B6D4', // cyan
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EF4444', // red
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
]

const STORAGE_KEY = 'feiman_graph_data'

/** 默认示例图谱数据 */
const DEFAULT_GRAPHS: Record<string, GraphData> = {
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

const DEFAULT_TOPICS: GraphTopic[] = [
  { id: 'vue3', label: 'Vue3 工程化知识网络' },
  { id: 'network', label: '计算机网络知识网络' },
  { id: 'math', label: '高等数学知识网络' },
]

// ==================== Toast 注入 ====================

const showToast = inject<(msg: string, type?: string) => void>('toast')

// ==================== 响应式状态 ====================

const selectedTopicId = ref<string>('vue3')
const graphTopics = ref<GraphTopic[]>([...DEFAULT_TOPICS])
const graphs = ref<Record<string, GraphData>>(JSON.parse(JSON.stringify(DEFAULT_GRAPHS)))
const selectedNode = ref<GraphNode | null>(null)

// 添加节点弹窗状态
const showAddDialog = ref(false)
const newNodeLabel = ref('')
const newNodeDesc = ref('')
const addInputRef = ref<HTMLInputElement | null>(null)

// 编辑状态
const editingNode = ref<GraphNode | null>(null)
const editingLabel = ref('')
const editingDescription = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

// 删除确认弹窗状态
const showDeleteConfirm = ref(false)
const nodeToDelete = ref<GraphNode | null>(null)

// ==================== 计算属性 ====================

const currentGraph = computed(() => graphs.value[selectedTopicId.value] || graphs.value['vue3'])

const centerPos = computed(() => currentGraph.value.center.pos)

// ==================== 数据持久化 ====================

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      topics: graphTopics.value,
      graphs: graphs.value,
      selectedTopicId: selectedTopicId.value,
    }))
  } catch (e) {
    console.warn('保存图谱数据失败:', e)
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const data = JSON.parse(raw)
    if (data.topics) graphTopics.value = data.topics
    if (data.graphs) graphs.value = data.graphs
    if (data.selectedTopicId) selectedTopicId.value = data.selectedTopicId
  } catch (e) {
    console.warn('加载图谱数据失败:', e)
  }
}

// 防抖写入计时器
let graphSaveTimer: ReturnType<typeof setTimeout> | null = null

/** 防抖保存图谱数据（500ms内只执行一次写入） */
function debouncedSaveGraph(): void {
  if (graphSaveTimer !== null) clearTimeout(graphSaveTimer)
  graphSaveTimer = setTimeout(() => {
    saveToStorage()
    graphSaveTimer = null
  }, 500)
}

// 监听数据变化自动保存（防抖）
watch([graphs, graphTopics, selectedTopicId], debouncedSaveGraph, { deep: true })

// ==================== 工具函数 ====================

function isCenterNode(node: GraphNode | null): boolean {
  if (!node) return false
  return node.id === currentGraph.value.center.id
}

function getNextColor(): string {
  const existingColors = currentGraph.value.nodes.map(n => n.color)
  for (const color of COLOR_POOL) {
    if (!existingColors.includes(color)) return color
  }
  return COLOR_POOL[currentGraph.value.nodes.length % COLOR_POOL.length]
}

function calculatePosition(index: number): { x: number; y: number } {
  const totalNodes = currentGraph.value.nodes.length
  const angle = (2 * Math.PI * index) / Math.max(totalNodes + 1, 5) - Math.PI / 2
  const radius = 32
  return {
    x: Math.round(50 + radius * Math.cos(angle)),
    y: Math.round(50 + radius * Math.sin(angle)),
  }
}

// ==================== 选择节点 ====================

function selectNode(node: GraphNode) {
  selectedNode.value = node
  // 如果正在编辑其他节点，先取消编辑
  if (editingNode.value && editingNode.value.id !== node.id) {
    cancelEdit()
  }
}

function clearSelection() {
  if (editingNode.value) return
  selectedNode.value = null
}

// ==================== 添加节点 ====================

async function addNode() {
  const label = newNodeLabel.value.trim()
  if (!label) return

  const newNode: GraphNode = {
    id: 'n-' + generateId().slice(0, 8),
    label,
    color: getNextColor(),
    pos: calculatePosition(currentGraph.value.nodes.length),
    mastery: Math.floor(Math.random() * 40) + 20,
    description: newNodeDesc.value.trim() || `新添加的知识点「${label}」，可点击编辑补充详细描述。`,
  }

  currentGraph.value.nodes.push(newNode)
  showAddDialog.value = false
  newNodeLabel.value = ''
  newNodeDesc.value = ''
  selectedNode.value = newNode

  showToast?.(`已添加节点「${label}」`, 'success')
}

// 监听添加弹窗打开，自动聚焦输入框
watch(showAddDialog, async (val) => {
  if (val) {
    await nextTick()
    addInputRef.value?.focus()
  }
})

// ==================== 编辑节点 ====================

function startEdit(node: GraphNode) {
  editingNode.value = node
  editingLabel.value = node.label
  editingDescription.value = node.description || ''

  nextTick(() => {
    if (!isCenterNode(node)) {
      editInputRef.value?.focus()
      editInputRef.value?.select()
    }
  })
}

function saveEdit() {
  if (!editingNode.value) return

  const newLabel = editingLabel.value.trim()
  if (!newLabel) {
    showToast?.('节点名称不能为空', 'warning')
    return
  }

  const target = isCenterNode(editingNode.value)
    ? currentGraph.value.center
    : currentGraph.value.nodes.find(n => n.id === editingNode.value!.id)

  if (target) {
    target.label = newLabel
    target.description = editingDescription.value.trim() || undefined
  }

  selectedNode.value = target || null
  editingNode.value = null
  editingLabel.value = ''
  editingDescription.value = ''

  showToast?.('节点已更新', 'success')
}

function cancelEdit() {
  editingNode.value = null
  editingLabel.value = ''
  editingDescription.value = ''
}

// ==================== 删除节点 ====================

function confirmDelete(node: GraphNode) {
  nodeToDelete.value = node
  showDeleteConfirm.value = true
}

function deleteNode() {
  if (!nodeToDelete.value) return

  const nodeName = nodeToDelete.value.label
  const idx = currentGraph.value.nodes.findIndex(n => n.id === nodeToDelete.value!.id)
  if (idx !== -1) {
    currentGraph.value.nodes.splice(idx, 1)
  }

  if (selectedNode.value?.id === nodeToDelete.value.id) {
    selectedNode.value = null
  }

  showDeleteConfirm.value = false
  nodeToDelete.value = null

  showToast?.(`已删除节点「${nodeName}」`, 'success')
}

// ==================== 生命周期 ====================

onMounted(() => {
  loadFromStorage()

  // 尝试从 feiman_topics 动态生成主题选择器
  try {
    const topicsRaw = localStorage.getItem('feiman_topics')
    if (topicsRaw) {
      const topics = JSON.parse(topicsRaw) as Array<{ id: string; title: string; color: string }>
      if (topics.length > 0) {
        const dynamicTopics: GraphTopic[] = topics.map(t => ({
          id: t.id,
          label: t.title,
        }))
        // 合并默认主题和动态主题，去重
        const existingIds = new Set(graphTopics.value.map(t => t.id))
        for (const dt of dynamicTopics) {
          if (!existingIds.has(dt.id)) {
            graphTopics.value.push(dt)
            // 为新主题创建空图谱
            if (!graphs.value[dt.id]) {
              graphs.value[dt.id] = {
                center: {
                  id: 'c-' + dt.id,
                  label: dt.label,
                  color: topics.find((t: { id: string }) => t.id === dt.id)?.color || '#4F6EF7',
                  pos: { x: 50, y: 50 },
                  mastery: 0,
                },
                nodes: [],
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('动态生成主题失败:', e)
  }
})
</script>

<style scoped>
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.25s ease-out;
}
</style>
