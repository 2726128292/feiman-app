<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
    <div class="max-w-md mx-auto px-5 pt-6 space-y-4">
      <!-- 顶部标题栏 -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">我的项目</h1>
          <p class="text-sm text-slate-500 mt-0.5">用作品验证理解</p>
        </div>
        <!-- 创建项目按钮 -->
        <button
          class="w-9 h-9 rounded-xl bg-[#4F6EF7] text-white flex items-center justify-center shadow-lg shadow-blue-500/25 active:scale-95 transition-transform"
          @click="showCreateForm = !showCreateForm"
        >
          <Plus :size="20" />
        </button>
      </div>

      <!-- 空状态引导 -->
      <div v-if="projects.length === 0 && !showCreateForm" class="pt-16 pb-8 text-center space-y-4">
        <div class="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
          <FolderOpen :size="36" class="text-[#4F6EF7]" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">还没有项目</h2>
          <p class="text-sm text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
            创建一个学习项目，把知识转化为实际作品。关联学习路径，追踪子任务进度。
          </p>
        </div>
        <button
          class="px-6 py-2.5 rounded-full bg-[#4F6EF7] text-white text-sm font-semibold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
          @click="showCreateForm = true"
        >
          创建第一个项目
        </button>
      </div>

      <!-- 创建/编辑项目表单（内联展开面板） -->
      <Transition name="slide-down">
        <div v-if="showCreateForm" class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 space-y-3 border border-blue-100 dark:border-blue-900/30">
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ editingProject ? '编辑项目' : '创建新项目' }}</h3>

          <!-- 项目标题 -->
          <input
            v-model="formData.title"
            type="text"
            placeholder="项目标题，如：Vue3 重构计划"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700"
            ref="titleInputRef"
          />

          <!-- 项目描述 -->
          <textarea
            v-model="formData.description"
            placeholder="简要描述项目目标..."
            rows="2"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none transition-colors text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700"
          />

          <!-- 关联路径选择 -->
          <div>
            <label class="text-xs font-medium text-slate-500 mb-1.5 block">可选：关联学习路径</label>
            <select
              v-model="formData.linkedPathId"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-colors"
            >
              <option value="">不关联路径</option>
              <option v-for="topic in availableTopics" :key="topic.id" :value="topic.id">
                {{ topic.title }} ({{ topic.progress }}%)
              </option>
            </select>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-2 pt-1">
            <button
              class="flex-1 py-2.5 rounded-xl bg-slate-100 text-sm font-medium text-slate-600 hover:bg-slate-200 transition-colors"
              @click="cancelForm"
            >
              取消
            </button>
            <button
              class="flex-1 py-2.5 rounded-xl bg-[#4F6EF7] text-white text-sm font-semibold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-transform"
              @click="saveProject"
            >
              {{ editingProject ? '保存修改' : '创建项目' }}
            </button>
          </div>
        </div>
      </Transition>

      <!-- 项目卡片列表 -->
      <div v-if="projects.length > 0" class="space-y-3">
        <div
          v-for="project in sortedProjects"
          :key="project.id"
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <!-- 项目头部 -->
          <div class="p-4" @contextmenu.prevent="openContextMenu($event, project)">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0" @click="toggleExpand(project.id)">
                <!-- 状态标签 + 标题 -->
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    :class="statusClass(project.status)"
                  >
                    {{ statusLabel(project.status) }}
                  </span>
                  <h3
                    class="text-base font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-blue-600 transition-colors"
                    @click.stop="startEdit(project)"
                  >
                    {{ project.title }}
                  </h3>
                </div>

                <!-- 描述 -->
                <p v-if="project.description" class="text-xs text-slate-500 line-clamp-2 mt-1">
                  {{ project.description }}
                </p>

                <!-- 进度条 + 子任务统计 -->
                <div class="mt-2.5">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[11px] text-slate-400">
                      子任务 {{ completedSubtasks(project) }}/{{ project.subtasks.length }}
                    </span>
                    <!-- 子任务完成图标 -->
                    <div class="flex items-center gap-0.5">
                      <span
                        v-for="(st, idx) in project.subtasks.slice(0, 5)"
                        :key="st.id"
                        class="w-4 h-4 rounded-full text-[9px] flex items-center justify-center"
                        :class="st.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'"
                      >{{ st.completed ? '✓' : '○' }}</span>
                      <span v-if="project.subtasks.length > 5" class="text-[10px] text-slate-400 ml-0.5">
                        +{{ project.subtasks.length - 5 }}
                      </span>
                    </div>
                  </div>
                  <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="subtaskProgress(project) === 100 ? 'bg-emerald-500' : 'bg-[#4F6EF7]'"
                      :style="{ width: subtaskProgress(project) + '%' }"
                    />
                  </div>
                </div>

                <!-- 关联路径信息 -->
                <div v-if="project.linkedPathId && linkedPathTitle(project)" class="mt-2 flex items-center gap-1.5">
                  <Link2 :size="12" class="text-purple-400" />
                  <span class="text-[11px] text-purple-500">{{ linkedPathTitle(project) }} · {{ linkedPathProgress(project) }}%</span>
                </div>
              </div>

              <!-- 展开/折叠箭头 -->
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-1"
                @click="toggleExpand(project.id)"
              >
                <ChevronDown
                  :size="16"
                  class="transition-transform duration-200"
                  :class="{ 'rotate-180': expandedProjects.has(project.id) }"
                />
              </button>
            </div>

            <!-- 展开的子任务列表 -->
            <Transition name="expand">
              <div v-if="expandedProjects.has(project.id)" class="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <!-- 子任务项 -->
                <div
                  v-for="(st, stIdx) in project.subtasks"
                  :key="st.id"
                  class="group flex items-center gap-2.5"
                >
                  <!-- 复选框 -->
                  <div
                    class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                    :class="st.completed ? 'bg-emerald-500' : 'bg-slate-100 hover:bg-slate-200'"
                    @click="toggleSubtask(project.id, st.id)"
                  >
                    <svg
                      v-if="st.completed"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-3 h-3"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  <!-- 子任务文本（可编辑） -->
                  <input
                    v-if="editingSubtaskId === st.id"
                    v-model="editSubtaskText"
                    class="flex-1 px-2 py-1 text-sm border border-blue-300 dark:border-blue-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                    @keydown.enter="saveSubtaskText(project.id, st.id)"
                    @keydown.escape="cancelSubtaskEdit"
                    @blur="saveSubtaskText(project.id, st.id)"
                  />
                  <span
                    v-else
                    class="flex-1 text-sm leading-snug cursor-pointer"
                    :class="st.completed ? 'text-slate-400 line-through' : 'text-slate-700'"
                    @click="startEditSubtask(st)"
                  >{{ st.text }}</span>

                  <!-- 删除子任务按钮 -->
                  <button
                    class="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-slate-300 hover:text-red-500 transition-all shrink-0"
                    @click="deleteSubtask(project.id, st.id)"
                  >
                    <X :size="13" />
                  </button>
                </div>

                <!-- 添加子任务输入框 -->
                <div v-if="addingSubtaskProjectId === project.id" class="flex items-center gap-2 pl-7">
                  <input
                    v-model="newSubtaskText"
                    placeholder="输入新子任务..."
                    class="flex-1 px-2 py-1.5 text-sm border border-dashed border-blue-300 rounded-lg focus:outline-none focus:border-solid focus:ring-2 focus:ring-blue-500/20"
                    @keydown.enter="addSubtask(project.id)"
                    @keydown.escape="addingSubtaskProjectId = null"
                    @blur="addSubtaskOnBlur(project.id)"
                    ref="newSubtaskInputRef"
                  />
                </div>

                <!-- 添加子任务按钮 -->
                <button
                  v-if="addingSubtaskProjectId !== project.id"
                  class="w-full pl-7 py-1 text-left text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                  @click="showAddSubtaskInput(project.id)"
                >
                  <Plus :size="13" /> 添加子任务
                </button>

                <!-- 项目操作按钮组 -->
                <div class="flex gap-2 pt-2 mt-2 border-t border-slate-50">
                  <button
                    v-if="project.status !== 'completed'"
                    class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    @click="advanceStatus(project.id)"
                  >
                    标记完成 →
                  </button>
                  <button
                    class="flex-1 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                    @click="startEdit(project)"
                  >
                    编辑
                  </button>
                  <button
                    class="py-1.5 px-3 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    @click="confirmDelete(project.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- 右键菜单（删除确认） -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="contextMenu.visible"
          class="fixed z-[9999] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 min-w-[140px]"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        >
          <button
            class="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
            @click="confirmDelete(contextMenu.projectId!); closeContextMenu()"
          >
            <Trash2 :size="14" /> 删除项目
          </button>
        </div>
      </Transition>
    </Teleport>

    <!-- 自定义删除确认弹窗（替代 window.confirm） -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showDeleteConfirm && deleteTargetProjectId"
          class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
          @click="showDeleteConfirm = false"
        >
          <div
            class="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-5 space-y-4 animate-slide-up"
            @click.stop
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 :size="20" class="text-red-500" />
              </div>
              <div>
                <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">确认删除</h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  确定要删除该项目吗？所有子任务也将被删除。
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <button
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:bg-slate-200 transition-colors"
                style="min-height: 44px;"
                @click="showDeleteConfirm = false; deleteTargetProjectId = null"
              >
                取消
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white active:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                style="min-height: 44px;"
                @click="executeDelete"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject, onMounted } from 'vue'
import { Plus, ChevronDown, X, Trash2, Link2, FolderOpen } from 'lucide-vue-next'
import type { StudyTopic } from '@/types'

// ==================== 类型定义 ====================

/** 子任务 */
interface SubTask {
  id: string
  text: string
  completed: boolean
}

/** 项目 */
interface Project {
  id: string
  title: string
  description: string
  status: 'planning' | 'active' | 'completed'
  linkedPathId: string | null // 关联的学习路径ID
  subtasks: SubTask[]
  createdAt: string
  completedAt?: string
}

// ==================== Toast 注入 ====================

const showToast = inject<(message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void>('toast') || ((msg: string) => console.log(msg))

// ==================== 数据存储 ====================

const STORAGE_KEY = 'feiman_projects'

/** 从 localStorage 加载项目列表 */
function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch {
    return []
  }
}

/** 保存项目列表到 localStorage */
function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

// ==================== 响应式数据 ====================

const projects = ref<Project[]>(loadProjects())
const showCreateForm = ref(false)
const expandedProjects = ref<Set<string>>(new Set())
const editingProject = ref<Project | null>(null)

// 表单数据
const formData = ref({
  title: '',
  description: '',
  linkedPathId: '',
})

// 子任务编辑相关
const editingSubtaskId = ref<string | null>(null)
const editSubtaskText = ref('')
const addingSubtaskProjectId = ref<string | null>(null)
const newSubtaskText = ref('')

// Ref 引用
const titleInputRef = ref<HTMLInputElement>()
const newSubtaskInputRef = ref<HTMLInputElement[]>()

// 右键菜单
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  projectId: null as string | null,
})

// 自定义删除确认弹窗（替代 window.confirm）
const showDeleteConfirm = ref(false)
const deleteTargetProjectId = ref<string | null>(null)

// ==================== 可用路径列表（用于关联） ====================

const availableTopics = computed<StudyTopic[]>(() => {
  try {
    const raw = localStorage.getItem('feiman_topics')
    if (!raw) return []
    return JSON.parse(raw) as StudyTopic[]
  } catch {
    return []
  }
})

// ==================== 计算属性 ====================

/** 按状态排序的项目列表 */
const sortedProjects = computed(() => {
  const order: Record<string, number> = { active: 0, planning: 1, completed: 2 }
  return [...projects.value].sort((a, b) => (order[a.status] ?? 99) - (order[b.status] ?? 99))
})

// ==================== 项目 CRUD 操作 ====================

/** 创建或更新项目 */
function saveProject(): void {
  const trimmedTitle = formData.value.title.trim()
  if (!trimmedTitle) {
    showToast('请输入项目标题', 'warning')
    return
  }

  if (editingProject.value) {
    // 编辑模式：更新现有项目
    const idx = projects.value.findIndex(p => p.id === editingProject.value!.id)
    if (idx !== -1) {
      projects.value[idx].title = trimmedTitle
      projects.value[idx].description = formData.value.description.trim()
      projects.value[idx].linkedPathId = formData.value.linkedPathId || null
      saveProjects(projects.value)
      showToast('项目已更新', 'success')
    }
  } else {
    // 创建模式：新增项目
    const newProject: Project = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      description: formData.value.description.trim(),
      status: 'planning',
      linkedPathId: formData.value.linkedPathId || null,
      subtasks: [],
      createdAt: new Date().toISOString(),
    }
    projects.value.push(newProject)
    saveProjects(projects.value)
    showToast('项目已创建', 'success')
    // 自动展开新创建的项目
    expandedProjects.value.add(newProject.id)
    expandedProjects.value = new Set(expandedProjects.value)
  }

  cancelForm()
}

/** 取消表单 */
function cancelForm(): void {
  showCreateForm.value = false
  editingProject.value = null
  formData.value = { title: '', description: '', linkedPathId: '' }
}

/** 开始编辑项目 */
function startEdit(project: Project): void {
  editingProject.value = project
  formData.value = {
    title: project.title,
    description: project.description,
    linkedPathId: project.linkedPathId || '',
  }
  showCreateForm.value = true
  nextTick(() => {
    titleInputRef.value?.focus()
  })
}

/** 删除项目 - 显示自定义确认弹窗（替代 window.confirm） */
function confirmDelete(projectId: string) {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return
  deleteTargetProjectId.value = projectId
  showDeleteConfirm.value = true
}

/** 执行删除操作 */
function executeDelete() {
  const projectId = deleteTargetProjectId.value
  if (!projectId) return

  projects.value = projects.value.filter(p => p.id !== projectId)
  expandedProjects.value.delete(projectId)
  expandedProjects.value = new Set(expandedProjects.value)
  saveProjects(projects.value)
  showToast('已删除项目', 'info')

  // 关闭弹窗
  showDeleteConfirm.value = false
  deleteTargetProjectId.value = null
}

// ==================== 展开/折叠 ====================

function toggleExpand(projectId: string): void {
  if (expandedProjects.value.has(projectId)) {
    expandedProjects.value.delete(projectId)
  } else {
    expandedProjects.value.add(projectId)
  }
  expandedProjects.value = new Set(expandedProjects.value)
}

// ==================== 子任务操作 ====================

/** 已完成的子任务数 */
function completedSubtasks(project: Project): number {
  return project.subtasks.filter(st => st.completed).length
}

/** 子任务完成百分比 */
function subtaskProgress(project: Project): number {
  if (project.subtasks.length === 0) return 0
  return Math.round((completedSubtasks(project) / project.subtasks.length) * 100)
}

/** 切换子任务勾选状态 */
function toggleSubtask(projectId: string, subtaskId: string): void {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return
  const subtask = project.subtasks.find(st => st.id === subtaskId)
  if (!subtask) return

  subtask.completed = !subtask.completed
  updateProjectStatus(project)
  saveProjects(projects.value)
}

/** 更新项目整体状态（基于子任务完成度） */
function updateProjectStatus(project: Project): void {
  const total = project.subtasks.length
  const done = project.subtasks.filter(st => st.completed).length
  if (total === 0) return

  if (done === total && project.status !== 'completed') {
    project.status = 'completed'
    project.completedAt = new Date().toISOString()
    showToast(`「${project.title}」已完成！🎉`, 'success')
  } else if (done > 0 && project.status === 'planning') {
    project.status = 'active'
  }
}

/** 推进项目状态 */
function advanceStatus(projectId: string): void {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return

  if (project.status === 'planning') {
    project.status = 'active'
    showToast('项目已进入进行中', 'info')
  } else if (project.status === 'active') {
    // 检查是否所有子任务都完成了
    const allDone = project.subtasks.length > 0 && project.subtasks.every(st => st.completed)
    if (allDone || window.confirm('还有未完成的子任务，确定标记为完成吗？')) {
      project.status = 'completed'
      project.completedAt = new Date().toISOString()
      showToast(`「${project.title}」已完成！🎉`, 'success')
    }
  }
  saveProjects(projects.value)
}

// ==================== 子任务编辑 ====================

/** 开始编辑子任务文本 */
function startEditSubtask(st: SubTask): void {
  editingSubtaskId.value = st.id
  editSubtaskText.value = st.text
}

/** 保存子任务文本 */
function saveSubtaskText(projectId: string, _subtaskId: string): void {
  if (!editingSubtaskId.value || !editSubtaskText.value.trim()) {
    cancelSubtaskEdit()
    return
  }
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return
  const subtask = project.subtasks.find(s => s.id === editingSubtaskId.value)
  if (subtask) {
    subtask.text = editSubtaskText.value.trim()
    saveProjects(projects.value)
  }
  cancelSubtaskEdit()
}

/** 取消子任务编辑 */
function cancelSubtaskEdit(): void {
  editingSubtaskId.value = null
  editSubtaskText.value = ''
}

/** 显示添加子任务输入框 */
function showAddSubtaskInput(projectId: string): void {
  addingSubtaskProjectId.value = projectId
  newSubtaskText.value = ''
  nextTick(() => {
    const el = newSubtaskInputRef.value?.[0]
    if (el) el.focus()
  })
}

/** 添加新子任务 */
function addSubtask(projectId: string): void {
  if (!newSubtaskText.value.trim()) return
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return

  project.subtasks.push({
    id: crypto.randomUUID(),
    text: newSubtaskText.value.trim(),
    completed: false,
  })

  updateProjectStatus(project)
  saveProjects(projects.value)
  newSubtaskText.value = ''
  // 保持焦点
  nextTick(() => {
    const el = newSubtaskInputRef.value?.[0]
    if (el) el.focus()
  })
}

/** 失焦时也尝试添加 */
function addSubtaskOnBlur(projectId: string): void {
  if (newSubtaskText.value.trim()) {
    addSubtask(projectId)
  }
  addingSubtaskProjectId.value = null
}

/** 删除子任务 */
function deleteSubtask(projectId: string, subtaskId: string): void {
  const project = projects.value.find(p => p.id === projectId)
  if (!project) return
  project.subtasks = project.subtasks.filter(s => s.id !== subtaskId)
  updateProjectStatus(project)
  saveProjects(projects.value)
  showToast('已删除子任务', 'info')
}

// ==================== 关联路径辅助函数 ====================

/** 获取关联路径的标题 */
function linkedPathTitle(project: Project): string | null {
  if (!project.linkedPathId) return null
  const topic = availableTopics.value.find(t => t.id === project.linkedPathId)
  return topic?.title || null
}

/** 获取关联路径的进度 */
function linkedPathProgress(project: Project): number {
  if (!project.linkedPathId) return 0
  const topic = availableTopics.value.find(t => t.id === project.linkedPathId)
  return topic?.progress || 0
}

// ==================== 状态样式 ====================

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    planning: '规划中',
    active: '进行中',
    completed: '已完成',
  }
  return map[status] || status
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    planning: 'bg-amber-50 text-amber-600',
    active: 'bg-blue-50 text-blue-600',
    completed: 'bg-emerald-50 text-emerald-600',
  }
  return map[status] || 'bg-slate-100 text-slate-600'
}

// ==================== 右键菜单 ====================

function openContextMenu(e: MouseEvent, project: Project): void {
  e.preventDefault()
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    projectId: project.id,
  }
  // 点击其他地方关闭菜单
  nextTick(() => {
    document.addEventListener('click', closeContextMenu, { once: true })
  })
}

function closeContextMenu(): void {
  contextMenu.value.visible = false
  contextMenu.value.projectId = null
}

// ==================== 点击外部关闭右键菜单 ====================

onMounted(() => {
  document.addEventListener('click', () => {
    if (contextMenu.value.visible) {
      closeContextMenu()
    }
  })
})
</script>

<style scoped>
/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  margin-top: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* 表单滑入动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
