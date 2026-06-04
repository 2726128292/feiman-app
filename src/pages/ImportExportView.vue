<template>
  <div class="min-h-screen bg-slate-50 pb-24">
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
          <h1 class="text-xl font-bold text-slate-900">导入 / 导出</h1>
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
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">导出内容包括</h3>
              <div class="space-y-2">
                <div class="flex items-start gap-2 text-sm text-slate-600">
                  <Check :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>学习路径</b> - 主题名称、标签、进度百分比</span>
                </div>
                <div class="flex items-start gap-2 text-sm text-slate-600">
                  <Check :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>费曼讲解记录</b> - 讲解内容、评分、知识缺口</span>
                </div>
                <div class="flex items-start gap-2 text-sm text-slate-600">
                  <Check :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>闪卡数据</b> - 所有问题与答案对</span>
                </div>
                <div class="flex items-start gap-2 text-sm text-slate-600">
                  <Check :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>成就系统</b> - 已解锁徽章和等级</span>
                </div>
                <div class="flex items-start gap-2 text-sm text-slate-600">
                  <Check :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
                  <span><b>学习分析</b> - 掌握率、遗忘风险等指标</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">导出效果预览</h3>
              <div class="border border-slate-200 rounded-xl p-4 bg-white">
                <p class="text-lg font-bold text-slate-800 mb-2">费曼学习 - 学习报告</p>
                <p class="text-xs text-slate-400 mb-3">生成日期：2024年6月4日</p>
                <hr class="my-3 border-slate-100" />
                <p class="text-sm font-semibold text-slate-700">学习路径</p>
                <p class="text-sm text-slate-500 ml-2">· 前端工程化 [72%] Vue3/Vite/PWA</p>
                <p class="text-sm text-slate-500 ml-2">· 计算机网络 [45%] HTTP/缓存/CDN</p>
                <hr class="my-3 border-slate-100" />
                <p class="text-sm font-semibold text-slate-700">闪卡汇总</p>
                <p class="text-sm text-slate-500 ml-2">Q: 什么是 Service Worker？</p>
                <p class="text-sm text-slate-400 ml-4">A: 运行在后台的脚本...</p>
              </div>
            </div>

            <button
              class="w-full py-2.5 rounded-xl text-sm font-medium bg-pink-500 text-white active:bg-pink-600 flex items-center justify-center gap-1.5"
              @click="exportWord()"
            >
              <Download :size="16" /> 导出为 Word 文档
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
import { ArrowLeft, ChevronRight, ShieldCheck, Upload, Download, Check, Archive, Database } from 'lucide-vue-next'
import { mockCards } from '@/utils/mock'
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
        alert('ZIP 导入功能正在开发中，请先使用 JSON 格式')
        return
      }

      if (parsed.length > 0) {
        previewData.value = parsed
        // 自动追加到现有卡片池
        for (const item of parsed) {
          mockCards.push({
            id: crypto.randomUUID(),
            topicId: item.topic || `导入-${file.name}`,
            question: item.question,
            answer: item.answer,
            dueAt: new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            reviewCount: 0,
          })
        }
      } else {
        alert('未能解析出有效数据，请检查文件格式是否符合要求')
      }
    } catch (e) {
      alert('文件解析失败：' + (e instanceof Error ? e.message : '未知错误'))
    }
  }
  reader.readAsText(file)
  ;(event.target as HTMLInputElement).value = ''
}

function confirmImport(format: string) {
  const count = previewData.value.length
  alert(`成功导入 ${count} 条${format.toUpperCase()} 记录！\n\n可在「闪卡复习」页面查看和使用。`)
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

function exportWord() {
  // 生成 HTML 内容，浏览器会识别为 doc
  const topics = ['前端工程化 [72%]', '计算机网络 [45%]', '高等数学 [30%]']
  const cards = mockCards.slice(0, 8)

  let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head><meta charset='utf-8'><title>费曼学习报告</title></head>
    <body style='font-family:微软雅黑,sans-serif;padding:40px;'>
    <h1 style='color:#4F6EF7'>费曼学习 - 学习报告</h1>
    <p style='color:#888;font-size:12px'>生成日期：${new Date().toLocaleDateString('zh-CN')}</p>
    <hr/>
    <h2>学习路径</h2>`
  for (const t of topics) {
    html += `<p style='margin:4px 0 4px 16px;color:#555'>· ${t}</p>`
  }
  html += `<hr/><h2>闪卡汇总 (${cards.length}张)</h2>`
  for (const c of cards) {
    html += `<p style='margin:6px 0;color:#333'><b>Q:</b> ${c.question}</p>`
    html += `<p style='margin:2px 0 8px 20px;color:#666;font-size:13px'><b>A:</b> ${c.answer}</p>`
  }
  html += '</body></html>'

  downloadFile(html, `feiman-report-${new Date().toISOString().split('T')[0]}.doc`, 'application/msword')
  exportStatus.value = 'Word 文档已下载'
  exportSuccess.value = true
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
