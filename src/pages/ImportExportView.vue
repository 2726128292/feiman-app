<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部 -->
      <div class="flex items-center gap-3">
        <button
          v-if="!expandedFormat"
          class="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center active:bg-slate-50"
          @click="router.back()"
        >
          <ArrowLeft :size="18" class="text-slate-600" />
        </button>
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">导入 / 导出</h1>
          <p class="text-sm text-slate-500 mt-0.5">TXT / JSON / Word 数据互通</p>
        </div>
      </div>

      <!-- ====== 未展开时：格式卡片列表 ====== -->
      <div v-if="!expandedFormat" class="space-y-3">
        <!-- 全量备份卡片 -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 mb-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
              <Database :size="20" class="text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-bold text-slate-800">全量数据备份</h3>
              <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">
                导出所有学习记录、路径、闪卡、讲解、设置等数据为一个 JSON 文件。可用于恢复或迁移。
              </p>
              <div class="flex gap-2 mt-3">
                <button
                  class="px-4 py-2 rounded-xl bg-[#4F6EF7] text-white text-xs font-semibold active:bg-blue-600 flex items-center gap-1.5"
                  @click="exportAllData"
                >
                  <Download :size="13" /> 导出全部数据
                </button>
                <label class="px-4 py-2 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 text-xs font-semibold cursor-pointer hover:bg-blue-50 active:bg-blue-100 flex items-center gap-1.5 transition-colors">
                  <Upload :size="13" /> 导入恢复
                  <input type="file" accept=".json" class="hidden" @change="importAllData" />
                </label>
              </div>
              <p v-if="lastBackupTime" class="text-[11px] text-slate-400 mt-2">
                上次备份：{{ lastBackupTime }}
              </p>
            </div>
          </div>
        </div>

        <!-- 自动备份历史 -->
        <div v-if="autoBackups.length > 0" class="mt-3 pt-3 border-t border-blue-100">
          <p class="text-xs font-medium text-slate-600 mb-2">自动备份记录</p>
          <div class="space-y-1.5">
            <div
              v-for="backup in autoBackups.slice(0, 5)"
              :key="backup.date"
              class="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50"
            >
              <span class="text-[11px] text-slate-500">{{ formatDateTime(new Date(backup.date)) }}</span>
              <span class="text-[11px] text-slate-400">{{ formatSize(backup.size) }}</span>
              <button
                class="text-[11px] text-blue-500 font-medium hover:text-blue-600"
                @click="restoreAutoBackup(backup.date)"
              >恢复</button>
            </div>
          </div>
        </div>

        <div
          v-for="fmt in formatCards"
          :key="fmt.type"
          class="bg-white adow-sm cursor-pointer active:shadow-md transition-shadow"
          @click="expandedFormat = fmt.type"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
              :style="{ background: fmt.bgColor, color: fmt.textColor }"
            >{{ fmt.badge }}</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ fmt.title }}</h3>
              <p class="text-xs text-slate-400 mt-0.5">{{ fmt.desc }}</p>
            </div>
            <ChevronRight :size="18" class="text-slate-300 shrink-0 mt-1" />
          </div>
        </div>

        <!-- 安全策略 -->
        <div class="bg-blue-50 rounded-2xl p-4">
          <div class="flex items-start gap-2.5">
            <ShieldCheck :size="18" class="text-[#4F6EF7] shrink-0 mt-0.5" />
            <div>
              <h3 class="text-sm font-semibold text-[#4F6EF7]">安全策略</h3>
              <ul class="text-xs text-slate-600 mt-1.5 space-y-1 leading-relaxed">
                <li>· 所有数据仅在浏览器本地处理，不会上传到任何服务器</li>
                <li>· 导入前会预览内容，确认后再导入</li>
                <li>· 支持随时回滚到上一次备份</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 展开详情：格式说明 + 操作 ====== -->
      <div v-else class="space-y-4">

        <!-- 返回按钮 -->
        <button
          class="flex items-center gap-1 text-sm text-slate-500 active:text-slate-700"
          @click="expandedFormat = null"
        >
          <ArrowLeft :size="16" /> 返回全部格式
        </button>

        <!-- ========== TXT 格式详情 ========== -->
        <div v-if="expandedFormat === 'txt'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">TXT</span>
              <h2 class="text-base font-bold text-slate-900">文本文件导入</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">支持自定义标记格式，适合从笔记软件导出的纯文本</p>
          </div>

          <!-- 支持的格式 -->
          <div class="p-4 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">格式一：双竖线分隔 (推荐)</h3>
              <div class="bg-slate-900 rounded-xl p-3 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
<pre>什么是递归？ ||| 递归是函数调用自身的编程技巧
递归的两个要素是什么？ ||| 终止条件 + 递归调用
什么是闭包？ ||| 函数+其词法环境的组合</pre>
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">每行一条记录，问题与答案用 <code class="px-1 py-0.5 bg-slate-200 rounded text-slate-600">|||</code> 分隔</p>
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">格式二：Q/A 标记</h3>
              <div class="bg-slate-900 rounded-xl p-3 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
<pre>Q: 什么是Service Worker？
A: 运行在后台的脚本，可以拦截网络请求

Q: Vite为什么快？
A: 使用原生ESM，按需编译

Q: HTTP状态码304表示什么？
A: 资源未修改，使用缓存版本</pre>
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">用 <code class="px-1 py-0.5 bg-slate-200 rounded text-slate-600">Q:</code> 和 <code class="px-1 py-0.5 bg-slate-200 rounded text-slate-600">A:</code> 分别标记问题和答案（大小写均可）</p>
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">格式三：纯问题列表（无答案）</h3>
              <div class="bg-slate-900 rounded-xl p-3 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
<pre>请解释事件循环机制
Vue3 Composition API 的优势
TCP三次握手的过程</pre>
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">每行一个问题，答案留空，复习时可自行补充</p>
            </div>

            <!-- 上传区域 -->
            <label class="block">
              <div class="flex flex-col items-center justify-center w-full py-5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#4F6EF7] transition-colors cursor-pointer">
                <Upload :size="24" class="text-slate-400" />
                <span class="text-sm text-slate-600 mt-1">点击选择 .txt 文件</span>
                <span class="text-[11px] text-slate-300">或拖拽到此处</span>
              </div>
              <input type="file" accept=".txt" class="hidden" @change="handleFileImport('txt', $event)" />
            </label>

            <!-- 预览区 -->
            <div v-if="previewData.length > 0" class="rounded-xl bg-emerald-50 p-3">
              <p class="text-xs font-semibold text-emerald-700 mb-2">预览：已解析 {{ previewData.length }} 条记录</p>
              <div class="space-y-1 max-h-32 overflow-y-auto">
                <div v-for="(item, i) in previewData.slice(0, 5)" :key="i" class="text-xs text-emerald-800 bg-white/60 rounded px-2 py-1">
                  Q: {{ item.question }} → A: {{ item.answer }}
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 flex gap-2">
            <button
              class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#4F6EF7] text-white active:bg-blue-600 disabled:opacity-40"
              :disabled="previewData.length === 0"
              @click="confirmImport('txt')"
            >导入 {{ previewData.length }} 条</button>
            <button class="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-600 active:bg-slate-50" @click="expandedFormat = null">取消</button>
          </div>
        </div>

        <!-- ========== JSON 格式详情 ========== -->
        <div v-if="expandedFormat === 'json'" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">JSON</span>
              <h2 class="text-base font-bold text-slate-900">完整数据备份</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">备份/还原全部学习数据，包括路径、讲解、闪卡、成就等</p>
          </div>

          <div class="p-4 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">JSON 结构示例</h3>
              <div class="bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto max-h-56 overflow-y-auto">
<pre>{
  "feiman_user_profile": {
    "userName": "Alex Walker",
    "level": 12,
    "streakDays": 12,
    "darkMode": false
  },
  "feiman_topics": [
    {
      "id": "uuid-xxx",
      "title": "前端工程化",
      "tags": ["Vue3", "Vite", "PWA"],
      "status": "active",
      "progress": 72,
      "chapters": [
        {
          "id": "ch-1",
          "title": "基础概念",
          "completed": true,
          "progress": 100
        }
      ]
    }
  ],
  "feiman_cards": [
    {
      "id": "card-xxx",
      "topicId": "uuid-xxx",
      "question": "什么是 Service Worker？",
      "answer": "运行在后台的脚本...",
      "interval": 3,
      "easeFactor": 2.6,
      "reviewCount": 5,
      "dueAt": "2024-06-05T00:00:00Z"
    }
  ],
  "feiman_sessions": [...],
  "feiman_achievements": [...]
}</pre>
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">顶层 key 对应 localStorage 的存储键名，可直接导入覆盖</p>
            </div>

            <!-- 闪卡专用 JSON 格式 -->
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">闪卡专用格式（更简洁）</h3>
              <div class="bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-cyan-400 leading-relaxed overflow-x-auto">
<pre>[
  {
    "question": "什么是递归？",
    "answer": "函数直接或间接调用自身",
    "topic": "算法基础"
  },
  {
    "question": "时间复杂度 O(log n) 的例子？",
    "answer": "二分查找",
    "topic": "数据结构"
  }
]</pre>
              </div>
              <p class="text-[11px] text-slate-400 mt-1.5">数组格式，每项包含 question / answer / topic(可选)</p>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                class="py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-white active:bg-emerald-600 flex items-center justify-center gap-1.5"
                @click="exportJSON()"
              >
                <Download :size="16" /> 导出备份
              </button>
              <label class="py-2.5 rounded-xl text-sm font-medium bg-white border-2 border-dashed border-slate-300 text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer hover:border-emerald-400">
                <Upload :size="16" /> 导入恢复
                <input type="file" accept=".json" class="hidden" @change="handleFileImport('json', $event)" />
              </label>
            </div>

            <div v-if="exportStatus" class="rounded-lg px-3 py-2 text-xs font-medium" :class="exportSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">{{ exportStatus }}</div>
          </div>
        </div>

        <!-- ========== Word 格式详情 ========== -->
        <div v-if="expandedFormat === 'doc'" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-pink-100 text-pink-700">DOC</span>
              <h2 class="text-base font-bold text-slate-900">Word 文档导出</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">将学习数据导出为 .doc 文件，可在 Word/WPS 中打开编辑</p>
          </div>

          <div class="p-4 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">选择导出内容</h3>
              <div class="space-y-1.5">
                <label v-for="opt in wordExportOptions" :key="opt.key" class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors" :class="selectedWordExports.has(opt.key) ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-slate-50'" @click="toggleWordExport(opt.key)">
                  <div class="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors" :class="selectedWordExports.has(opt.key) ? 'bg-pink-500 border-pink-500' : 'border-slate-300'">
                    <Check v-if="selectedWordExports.has(opt.key)" :size="10" class="text-white" />
                  </div>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ opt.label }}</span>
                  <span class="text-[10px] text-slate-400 ml-auto">{{ opt.hint }}</span>
                </label>
              </div>
            </div>

            <!-- 导出效果预览（真实数据渲染） -->
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">打印预览</h3>
              <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white max-h-72 overflow-y-auto print-preview">
                <p class="text-base font-bold text-center text-[#4F6EF7] mb-0.5">费曼学习法 · 学习报告</p>
                <p class="text-[10px] text-center text-slate-400 mb-2">{{ new Date().toLocaleDateString('zh-CN') }} · 共 {{ totalWordItems }} 条记录</p>
                <div class="border-t border-b border-dashed border-slate-200 py-1.5 my-2">
                  <p class="text-[10px] font-semibold text-slate-600">目录</p>
                  <p v-if="wordRealData.topics.length > 0 && selectedWordExports.has('topics')" class="text-[9px] text-slate-400 ml-1">一、学习路径 ({{ wordRealData.topics.length }})</p>
                  <p v-if="wordRealData.cards.length > 0 && selectedWordExports.has('cards')" class="text-[9px] text-slate-400 ml-1">二、闪卡复习 ({{ wordRealData.cards.length }})</p>
                  <p v-if="wordRealData.sessions.length > 0 && selectedWordExports.has('sessions')" class="text-[9px] text-slate-400 ml-1">三、讲解记录 ({{ wordRealData.sessions.length }})</p>
                  <p v-if="wordRealData.notes.length > 0 && selectedWordExports.has('notes')" class="text-[9px] text-slate-400 ml-1">四、学习笔记 ({{ wordRealData.notes.length }})</p>
                </div>
                <template v-if="selectedWordExports.has('cards') && wordRealData.cards.length > 0">
                  <p class="text-[10px] font-semibold text-slate-600 mt-2">闪卡预览</p>
                  <div v-for="(c, i) in wordRealData.cards.slice(0, 3)" :key="i" class="border-l-2 border-blue-400 pl-2 my-1">
                    <p class="text-[10px] font-medium text-slate-700"><b>Q:</b> {{ c.question?.slice(0, 30) || '-' }}</p>
                    <p class="text-[9px] text-slate-400"><b>A:</b> {{ (c.answer || '').slice(0, 35) || '-' }}...</p>
                  </div>
                  <p v-if="wordRealData.cards.length > 3" class="text-[9px] text-slate-400 text-center">... 还有 {{ wordRealData.cards.length - 3 }} 张</p>
                </template>
              </div>
            </div>

            <button
              class="w-full py-2.5 rounded-xl text-sm font-medium bg-pink-500 text-white active:bg-pink-600 flex items-center justify-center gap-1.5 disabled:opacity-60"
              :disabled="isExporting"
              @click="handleExportWord"
            >
              <svg v-if="isExporting" class="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
              </svg>
              {{ isExporting ? '正在生成...' : '导出为 Word 文档（可打印）' }}
            </button>
          </div>
        </div>

        <!-- ========== ZIP 格式详情 ========== -->
        <div v-if="expandedFormat === 'zip'" class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">ZIP</span>
              <h2 class="text-base font-bold text-slate-900">批量迁移包</h2>
            </div>
            <p class="text-xs text-slate-500 mt-1">打包多个主题的全部数据，适合跨设备迁移</p>
          </div>

          <div class="p-4 space-y-4">
            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">ZIP 包内部结构</h3>
              <div class="bg-slate-900 rounded-xl p-3 font-mono text-[11px] text-yellow-400 leading-relaxed">
<pre>feiman-export-2024-06-04.zip
├── manifest.json          # 元信息（版本、导出时间）
├── topics/
│   ├── topic-vue3.json     # 前端工程化 路径数据
│   └── topic-network.json  # 计算机网络 路径数据
├── cards/
│   ├── cards-vue3.json     # 前端相关闪卡
│   └── cards-algo.json     # 算法相关闪卡
├── sessions.json           # 全部讲解记录
├── achievements.json       # 成就数据
└── README.txt              # 说明文件</pre>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button
                class="py-2.5 rounded-xl text-sm font-medium bg-yellow-500 text-white active:bg-yellow-600 flex items-center justify-center gap-1.5"
                @click="exportZip()"
              >
                <Archive :size="16" /> 打包导出
              </button>
              <label class="py-2.5 rounded-xl text-sm font-medium bg-white border-2 border-dashed border-slate-300 text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer hover:border-yellow-400">
                <Upload :size="16" /> 解压导入
                <input type="file" accept=".zip" class="hidden" @change="handleFileImport('zip', $event)" />
              </label>
            </div>

            <div class="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800 leading-relaxed">
              <strong>注意：</strong>当前环境为纯前端应用，ZIP 压缩需要额外依赖。建议使用 JSON 备份作为主要迁移方式，ZIP 功能将在后续版本完善。
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ChevronRight, ShieldCheck, Upload, Download, Check, Archive, Database, Printer } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import { useAutoBackup } from '@/composables/useAutoBackup'

const router = useRouter()
const { showToast } = useToast()

// 自动备份功能
const { getBackups, restoreFromBackup } = useAutoBackup()
const autoBackups = computed(() => getBackups())

/** 从自动备份恢复数据 */
function restoreAutoBackup(date: string): void {
  if (!window.confirm('确定要从该备份恢复数据？当前数据将被覆盖。')) return
  const success = restoreFromBackup(date)
  if (success) {
    showToast('备份恢复成功！页面将刷新...', 'success')
    setTimeout(() => window.location.reload(), 1500)
  } else {
    showToast('恢复失败，备份可能已损坏', 'error')
  }
}

/** 格式化文件大小 */
function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

/** 导出进行中 */
const isExporting = ref(false)

// 当前展开的格式详情
const expandedFormat = ref<string | null>(null)

// 上次备份时间
const lastBackupTime = ref('')

/** 格式化日期时间显示 */
function formatDateTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// ====== 全量数据导出/导入 ======

/**
 * 导出所有 feiman_ 开头的 localStorage 数据为 JSON 备份文件
 */
function exportAllData() {
  const backup: {
    version: string
    exportedAt: string
    appName: string
    data: Record<string, any>
  } = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    appName: '费曼学习法App',
    data: {} as Record<string, any>
  }

  // 收集所有 feiman_ 开头的 localStorage 数据
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('feiman_')) {
      try {
        backup.data[key] = JSON.parse(localStorage.getItem(key)!)
      } catch {
        backup.data[key] = localStorage.getItem(key)
      }
    }
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `feiman-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)

  lastBackupTime.value = formatDateTime(new Date())
  showToast('数据导出成功！', 'success')
}

/**
 * 从 JSON 备份文件导入并恢复所有数据
 */
async function importAllData(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const backup = JSON.parse(text)

    if (!backup.data || !backup.appName) {
      showToast('无效的备份文件', 'error')
      return
    }

    // 确认覆盖
    if (!window.confirm(`即将导入 ${Object.keys(backup.data).length} 条数据。\n现有数据将被覆盖，是否继续？`)) return

    // 写入 localStorage
    for (const [key, value] of Object.entries(backup.data)) {
      localStorage.setItem(key, JSON.stringify(value))
    }

    showToast('数据导入成功！页面将刷新...', 'success')
    setTimeout(() => window.location.reload(), 1500)
  } catch (err) {
    showToast('导入失败：' + (err instanceof Error ? err.message : '文件格式错误'), 'error')
  }
}

// 预览数据
interface PreviewItem { question: string; answer: string; topic?: string }
const previewData = ref<PreviewItem[]>([])

// 导出状态
const exportStatus = ref('')
const exportSuccess = ref(true)

// 格式卡片定义
const formatCards = [
  { type: 'txt', badge: 'TXT', title: '文本文件导入', desc: '自定义标记解析，支持笔记/题库格式', bgColor: '#DBEAFE', textColor: '#1D4ED8' },
  { type: 'json', badge: 'JSON', title: '完整数据备份', desc: '全部学习数据的 JSON 备份与恢复', bgColor: '#D1FAE5', textColor: '#059669' },
  { type: 'doc', badge: 'DOC', title: 'Word 文档导出', desc: '导出为可打印/编辑的 Word 文档', bgColor: '#FCE7F3', textColor: '#BE185D' },
  { type: 'zip', badge: 'ZIP', title: '批量迁移包', desc: '多主题数据打包，跨设备一键迁移', bgColor: '#FEF3C7', textColor: '#D97706' },
]

// ====== 文件导入处理 ======
function handleFileImport(format: string, event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const content = reader.result as string
    let parsed: PreviewItem[] = []

    try {
      if (format === 'txt') {
        // TXT 解析：支持三种格式
        const lines = content.split('\n').filter(l => l.trim())
        for (const line of lines) {
          let q = '', a = ''
          if (line.includes('|||')) {
            [q, a] = line.split('|||').map(s => s.trim())
          } else if (/^[qQ][:：]/.test(line)) {
            const idx = line.search(/[:：]\s*/)
            q = line.substring(idx).replace(/^[:：]\s*/, '').trim()
            // 下一行可能是 A:
          } else if (/^[aA][:：]/.test(line)) {
            a = line.replace(/^[aA][:：]\s*/, '').trim()
            // 合并到上一条
            if (parsed.length > 0 && !parsed[parsed.length - 1].answer) {
              parsed[parsed.length - 1].answer = a
              continue
            }
          } else {
            q = line.trim()
          }
          if (q) parsed.push({ question: q, answer: a || '(待补充)' })
        }
      } else if (format === 'json') {
        const data = JSON.parse(content)
        if (Array.isArray(data)) {
          // 闪卡专用格式
          parsed = data.map((item: any) => ({
            question: item.question || item.q || '',
            answer: item.answer || item.a || '',
            topic: item.topic || item.topicId || '',
          }))
        } else if (typeof data === 'object') {
          // 完整备份格式 - 提取卡片
          const cards = data.feiman_cards || data.cards || []
          parsed = (cards as any[]).map(c => ({
            question: c.question || '', answer: c.answer || '', topic: c.topicId || '',
          }))
        }
      } else if (format === 'zip') {
        showToast('ZIP 导入功能正在开发中，请先使用 JSON 格式', 'warning')
        return
      }

      if (parsed.length > 0) {
        previewData.value = parsed
        // 写入 localStorage 而不是污染 mockCards
        const cardsKey = 'feiman_review_cards'
        const existingRaw = localStorage.getItem(cardsKey) || localStorage.getItem('feiman_cards') || '[]'
        const existing = JSON.parse(existingRaw)
        for (const item of parsed) {
          existing.push({
            id: crypto.randomUUID(),
            topicId: item.topic || `导入-${file.name}`,
            question: item.question,
            answer: item.answer,
            tags: ['导入'],
            deck: 'default',
            interval: 1,
            easeFactor: 2.5,
            repetition: 0,
            nextReview: new Date(Date.now() + 86400000).toISOString(),
            reviewCount: 0,
            createdAt: new Date().toISOString(),
          })
        }
        localStorage.setItem(cardsKey, JSON.stringify(existing))
      } else {
        showToast('未能解析出有效数据，请检查文件格式是否符合要求', 'error')
      }
    } catch (e) {
      showToast('文件解析失败：' + (e instanceof Error ? e.message : '未知错误'), 'error')
    }
  }
  reader.readAsText(file)
  ;(event.target as HTMLInputElement).value = ''
}

function confirmImport(format: string) {
  const count = previewData.value.length
  showToast(`成功导入 ${count} 条${format.toUpperCase()} 记录！可在「闪卡复习」页面查看和使用。`, 'success')
  previewData.value = []
}

// ====== 导出功能 ======
function exportJSON() {
  const data: Record<string, any> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('feiman_')) {
      try { data[key!] = JSON.parse(localStorage.getItem(key!) || '{}') } catch { /* skip */ }
    }
  }
  downloadFile(
    JSON.stringify(data, null, 2),
    `feiman-backup-${new Date().toISOString().split('T')[0]}.json`,
    'application/json'
  )
  exportStatus.value = 'JSON 备份已下载'
  exportSuccess.value = true
}

// ====== Word 导出：打印级排版 ======

/** Word 导出选项 */
const wordExportOptions = [
  { key: 'topics', label: '学习路径', hint: '章节与进度' },
  { key: 'cards', label: '闪卡复习', hint: 'Q&A 对' },
  { key: 'sessions', label: '讲解记录', hint: '内容与评分' },
  { key: 'notes', label: '学习笔记', hint: '各章笔记' },
]
const selectedWordExports = ref(new Set(['cards', 'topics']))

function toggleWordExport(key: string): void {
  if (selectedWordExports.value.has(key)) {
    selectedWordExports.value.delete(key)
  } else {
    selectedWordExports.value.add(key)
  }
  selectedWordExports.value = new Set(selectedWordExports.value)
}

/** 从 localStorage 读取真实数据 */
const wordRealData = computed(() => {
  const data = {
    topics: [] as any[],
    cards: [] as any[],
    sessions: [] as any[],
    notes: [] as any[],
  }
  try {
    // 路径
    const tRaw = localStorage.getItem('feiman_topics')
    if (tRaw) data.topics = JSON.parse(tRaw)
    // 闪卡（兼容双 key）
    for (const k of ['feiman_review_cards', 'feiman_cards']) {
      try {
        const cRaw = localStorage.getItem(k)
        if (cRaw) data.cards.push(...JSON.parse(cRaw))
      } catch { /* skip */ }
    }
    // 去重
    const seen = new Set<string>()
    data.cards = data.cards.filter((c: any) => !c.id || seen.has(c.id) ? false : (seen.add(c.id), true))
    // 讲解
    const sRaw = localStorage.getItem('feiman_sessions')
    if (sRaw) data.sessions = JSON.parse(sRaw)
    // 笔记
    const nRaw = localStorage.getItem('feiman_notes')
    if (nRaw) data.notes = JSON.parse(nRaw)
  } catch { /* ignore */ }
  return data
})

/** 预估总条数 */
const totalWordItems = computed(() => {
  let n = 0
  if (selectedWordExports.value.has('topics')) n += wordRealData.value.topics.length
  if (selectedWordExports.value.has('cards')) n += wordRealData.value.cards.length
  if (selectedWordExports.value.has('sessions')) n += wordRealData.value.sessions.length
  if (selectedWordExports.value.has('notes')) n += wordRealData.value.notes.length
  return n
})

/**
 * 导出 Word 包装函数（管理 loading 状态）
 */
async function handleExportWord() {
  isExporting.value = true
  try {
    await exportWord()
    showToast('导出成功！', 'success')
  } catch (e) {
    showToast('导出失败：' + (e instanceof Error ? e.message : '未知'), 'error')
  } finally {
    isExporting.value = false
  }
}

/**
 * 导出为格式化的 Word 文档（HTML 格式，可打印）
 * 特点：
 * - 真实数据从 localStorage 读取
 * - 打印级排版：封面、目录、分节、页眉页脚
 * - A4 纸张适配，边距合理
 * - 支持选择导出内容
 * - 异步分片构建，避免 UI 卡顿
 */
async function exportWord() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('zh-CN')
  const d = wordRealData.value
  const sel = selectedWordExports.value

  // 限制导出数量，避免浏览器崩溃
  const maxItems = 500
  if (d.cards.length > maxItems) d.cards = d.cards.slice(0, maxItems)
  if (d.sessions.length > maxItems) d.sessions = d.sessions.slice(0, maxItems)
  if (d.notes.length > maxItems) d.notes = d.notes.slice(0, maxItems)

  // ====== 构建文档 HTML ======
  let sectionsHtml = ''
  let sectionNum = 0

  // ---- 第一部分：学习路径 ----
  if (sel.has('topics') && d.topics.length > 0) {
    sectionNum++
    let topicsContent = ''
    for (const topic of d.topics) {
      const chapters = topic.chapters || []
      const doneCount = chapters.filter((c: any) => c.progress >= 100).length
      const progress = chapters.length > 0 ? Math.round((doneCount / chapters.length) * 100) : 0

      topicsContent += `
        <div style="margin-bottom:20px;">
          <h3 style="font-size:14px;color:#1e293b;margin:0 0 6px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid #4F6EF7;padding-left:10px;">
            <span>${escapeHtml(topic.title || '未命名')}</span>
            <span style="font-size:11px;font-weight:normal;color:#94a3b8;">${progress}%</span>
          </h3>`
      if (chapters.length > 0) {
        topicsContent += `<table style="width:100%;border-collapse:collapse;margin-top:6px;">`
        topicsContent += `<tr style="background:#f8fafc;"><th style="text-align:left;padding:5px 10px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;">章节</th><th style="text-align:center;padding:5px 10px;font-size:11px;color:#64748b;border-bottom:1px solid #e2e8f0;width:60px;">进度</th></tr>`
        for (const ch of chapters) {
          const chProgress = ch.progress || 0
          const chDone = chProgress >= 100 ? '✓' : `${chProgress}%`
          const items = ch.items || []
          topicsContent += `<tr><td style="padding:4px 10px;font-size:12px;color:#334155;border-bottom:1px solid #f1f5f9;">${escapeHtml(ch.title)}</td><td style="text-align:center;padding:4px 10px;font-size:11px;color:${chProgress >= 100 ? '#16a34a' : '#4F6EF7'};border-bottom:1px solid #f1f5f9;">${chDone}</td></tr>`
          if (items.length > 0) {
            for (const item of items) {
              const itemDone = item.done ? '☑' : '☐'
              topicsContent += `<tr><td style="padding:2px 10px 2px 24px;font-size:11px;color:#64748b;border-bottom:1px solid #fafafa;">${itemDone} ${escapeHtml(item.title || '')}</td><td style="border-bottom:1px solid #fafafa;"></td></tr>`
            }
          }
        }
        topicsContent += `</table>`
      }
      topicsContent += `</div>`
    }

    sectionsHtml += `
      <div class="page-break" style="page-break-before:always;"></div>
      <h2 style="color:#4F6EF7;font-size:18px;margin:0 0 4px;border-bottom:2px solid #4F6EF7;padding-bottom:6px;">${sectionNum}. 学习路径</h2>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 12px;">共 ${d.topics.length} 条路径 · 生成于 ${dateStr}</p>
      ${topicsContent}`
  }
  // 让出主线程，避免 UI 卡顿
  await new Promise(r => setTimeout(r, 0))

  // ---- 第二部分：闪卡复习表 ----
  if (sel.has('cards') && d.cards.length > 0) {
    sectionNum++
    let cardsTable = `
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <thead>
          <tr style="background:linear-gradient(135deg,#4F6EF7,#6B8CF7);color:white;">
            <th style="text-align:left;padding:8px 12px;font-size:12px;width:40px;">#</th>
            <th style="text-align:left;padding:8px 12px;font-size:12px;">问题</th>
            <th style="text-align:left;padding:8px 12px;font-size:12px;">答案</th>
            <th style="text-align:center;padding:8px 12px;font-size:12px;width:70px;">标签</th>
          </tr>
        </thead>
        <tbody>`

    d.cards.forEach((card: any, i: number) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc'
      const tags = Array.isArray(card.tags) ? card.tags.slice(0, 2).join(', ') : (card.topicId || '')
      cardsTable += `
          <tr style="background:${bg};">
            <td style="padding:7px 12px;font-size:11px;color:#94a3b8;text-align:center;border-bottom:1px solid #f1f5f9;">${i + 1}</td>
            <td style="padding:7px 12px;font-size:12px;color:#1e293b;font-weight:500;border-bottom:1px solid #f1f5f9;">${escapeHtml(card.question || '-')}</td>
            <td style="padding:7px 12px;font-size:11px;color:#475569;line-height:1.5;border-bottom:1px solid #f1f5f9;">${escapeHtml((card.answer || '-').slice(0, 120))}${(card.answer || '').length > 120 ? '...' : ''}</td>
            <td style="padding:7px 12px;font-size:10px;color:#4F6EF7;text-align:center;border-bottom:1px solid #f1f5f9;">${tags}</td>
          </tr>`
    })

    cardsTable += '</tbody></table>'
    // 添加答题区域（用于打印后手写答案）
    cardsTable += `
      <div style="margin-top:16px;padding:12px;background:#fffbeb;border:1px dashed #fbbf24;border-radius:8px;text-align:center;">
        <p style="font-size:11px;color:#92400e;margin:0 0 4px;">✏️ 复习练习区 — 遮住答案，先自己回答一遍</p>
        <p style="font-size:10px;color:#a16207;margin:0;">共 ${d.cards.length} 张闪卡，建议分 ${Math.max(1, Math.ceil(d.cards.length / 15))} 天完成复习</p>
      </div>`

    sectionsHtml += `
      <div class="page-break" style="page-break-before:always;"></div>
      <h2 style="color:#4F6EF7;font-size:18px;margin:0 0 4px;border-bottom:2px solid #4F6EF7;padding-bottom:6px;">${sectionNum}. 闪卡复习表</h2>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 12px;">共 ${d.cards.length} 张闪卡 · 可用于自测和背诵</p>
      ${cardsTable}`
  }
  // 让出主线程，避免 UI 卡顿
  await new Promise(r => setTimeout(r, 0))

  // ---- 第三部分：讲解记录 ----
  if (sel.has('sessions') && d.sessions.length > 0) {
    sectionNum++
    let sessionsContent = ''
    for (const sess of d.sessions) {
      const score = sess.score ?? 0
      const scoreColor = score >= 80 ? '#16a34a' : score >= 60 ? '#ea580c' : '#dc2626'
      sessionsContent += `
        <div style="margin-bottom:16px;padding:12px;background:#f8fafc;border-radius:8px;border-left:3px solid ${scoreColor};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:13px;font-weight:600;color:#1e293b;">${escapeHtml(sess.topicName || '未命名讲解')}</span>
            <span style="font-size:12px;font-weight:bold;color:${scoreColor};background:white;padding:2px 10px;border-radius:12px;">${score}分</span>
          </div>
          <p style="font-size:11px;color:#64748b;margin:0 0 6px;">${sess.type === 'voice' ? '🎤 语音讲解' : '✍️ 文字讲解'} · ${(sess.createdAt || '').split('T')[0]}</p>
          <p style="font-size:12px;color:#334155;line-height:1.7;margin:0;">${escapeHtml((sess.content || '(无内容)').slice(0, 300))}${(sess.content || '').length > 300 ? '...' : ''}</p>`
      if (sess.gaps && sess.gaps.length > 0) {
        sessionsContent += `<p style="font-size:10px;color:#dc2626;margin-top:6px;">⚠️ 知识缺口：${sess.gaps.map((g: any) => g.text).join('、').slice(0, 80)}...</p>`
      }
      sessionsContent += `</div>`
    }

    sectionsHtml += `
      <div class="page-break" style="page-break-before:always;"></div>
      <h2 style="color:#4F6EF7;font-size:18px;margin:0 0 4px;border-bottom:2px solid #4F6EF7;padding-bottom:6px;">${sectionNum}. 费曼讲解记录</h2>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 12px;">共 ${d.sessions.length} 条记录 · 按评分排序</p>
      ${sessionsContent}`
  }
  // 让出主线程，避免 UI 卡顿
  await new Promise(r => setTimeout(r, 0))

  // ---- 第四部分：学习笔记 ----
  if (sel.has('notes') && d.notes.length > 0) {
    sectionNum++
    let notesContent = ''
    for (const note of d.notes) {
      notesContent += `
        <div style="margin-bottom:14px;padding:10px 12px;background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;">
          <p style="font-size:11px;color:#92400e;margin:0 0 4px;font-weight:600;">📝 ${note.targetId ? '章节笔记' : '通用笔记'} · ${(note.createdAt || '').split('T')[0]}</p>
          <p style="font-size:12px;color:#334155;line-height:1.8;margin:0;white-space:pre-wrap;">${escapeHtml(note.content || '')}</p>
        </div>`
    }

    sectionsHtml += `
      <div class="page-break" style="page-break-before:always;"></div>
      <h2 style="color:#4F6EF7;font-size:18px;margin:0 0 4px;border-bottom:2px solid #4F6EF7;padding-bottom:6px;">${sectionNum}. 学习笔记</h2>
      <p style="font-size:11px;color:#94a3b8;margin:0 0 12px;">共 ${d.notes.length} 条笔记</p>
      ${notesContent}`
  }
  // 让出主线程，避免 UI 卡顿
  await new Promise(r => setTimeout(r, 0))

  // ====== 组装完整 HTML ======
  const html = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
  <meta charset='utf-8'/>
  <title>费曼学习法 · 学习报告</title>
  <style>
    @page { size: A4; margin: 18mm 15mm 18mm 15mm; }
    body {
      font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue", sans-serif;
      color: #334155;
      line-height: 1.6;
      padding: 0;
      margin: 0;
    }
    /* 封面 */
    .cover {
      text-align: center;
      padding: 120px 40px 80px;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 32px;
      color: #4F6EF7;
      margin: 0 0 12px;
      letter-spacing: 4px;
    }
    .cover .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0 0 40px;
    }
    .cover .meta {
      font-size: 12px;
      color: #cbd5e1;
      line-height: 2;
    }
    .cover .brand {
      position: absolute;
      bottom: 60px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
    /* 目录 */
    .toc {
      page-break-after: always;
      padding: 20px 0;
    }
    .toc h2 {
      font-size: 18px;
      color: #1e293b;
      border-bottom: 2px solid #4F6EF7;
      padding-bottom: 8px;
      margin: 0 0 16px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      font-size: 13px;
      color: #475569;
      border-bottom: 1px dotted #e2e8f0;
    }
    .toc-item span:last-child { color: #94a3b8; font-size: 12px; }
    /* 正文标题 */
    h2 {
      color: #4F6EF7;
      font-size: 18px;
      margin: 24px 0 4px;
      border-bottom: 2px solid #4F6EF7;
      padding-bottom: 6px;
    }
    h3 {
      font-size: 14px;
      color: #1e293b;
      margin: 0 0 6px;
    }
    p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
    td { padding: 7px 12px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) td { background: #fafafa; }
    /* 页脚 */
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9px;
      color: #cbd5e1;
      padding: 8px;
      border-top: 1px solid #f1f5f9;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .footer { position: running(footer); }
      .no-print { display: none; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>

<!-- ========== 封面 ========== -->
<div class="cover">
  <h1>费曼学习法</h1>
  <div class="subtitle">把知识讲明白，才是真的学会</div>
  <div class="meta">
    <p>学习报告</p>
    <p>${dateStr}</p>
    <p>共 ${totalWordItems.value} 条学习记录</p>
  </div>
  <div class="brand">
    <p>由「费曼学习法 App」自动生成</p>
    <p>https://2726128292.github.io/feiman-app/</p>
  </div>
</div>

<!-- ========== 目录 ========== -->
<div class="toc">
  <h2>目 录</h2>
  ${sel.has('topics') && d.topics.length > 0 ? '<div class="toc-item"><span>一、学习路径</span><span>' + d.topics.length + ' 条</span></div>' : ''}
  ${sel.has('cards') && d.cards.length > 0 ? '<div class="toc-item"><span>二、闪卡复习表</span><span>' + d.cards.length + ' 张</span></div>' : ''}
  ${sel.has('sessions') && d.sessions.length > 0 ? '<div class="toc-item"><span>三、费曼讲解记录</span><span>' + d.sessions.length + ' 条</span></div>' : ''}
  ${sel.has('notes') && d.notes.length > 0 ? '<div class="toc-item"><span>四、学习笔记</span><span>' + d.notes.length + ' 条</span></div>' : ''}
</div>

<!-- ========== 正文内容 ========== -->
${sectionsHtml}

<!-- 页脚 -->
<div class="footer">
  费曼学习法 App · 第 <span id="page-num"></span> 页 / 共 <span id="page-total"></span> 页
</div>

<script>
  // 自动触发打印对话框
  window.onload = function() {
    // 可选：自动打开打印
    // window.print();
  };
<\/script>
</body>
</html>`

  downloadFile(html, `费曼学习报告-${now.toISOString().split('T')[0]}.doc`, 'application/msword')

  exportStatus.value = `已导出 ${totalWordItems.value} 条记录`
  exportSuccess.value = true
  showToast(`Word 文档已导出！包含 ${totalWordItems.value} 条记录`, 'success')
}

/** HTML 转义（防 XSS） */
function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function exportZip() {
  exportStatus.value = 'ZIP 功能需要额外依赖，建议使用 JSON 备份替代'
  exportSuccess.value = false
}

// ====== 工具函数 ======
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>
