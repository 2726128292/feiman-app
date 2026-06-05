/**
 * DeepSeek V4 API 服务层
 *
 * 使用方式：
 * 1. 在 设置中心 → 隐私与离线 → 填入 DeepSeek API Key
 * 2. 或在浏览器控制台执行：localStorage.setItem('feiman_deepseek_key', '你的key')
 */

import { ref, computed } from 'vue'
import { useStorage } from './useStorage'

// ====== 配置常量 ======
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

// 存储键名
const STORAGE_KEY = 'feiman_deepseek_config'
const ENABLED_KEY = 'feiman_ai_enabled'

/** AI 配置 */
interface DeepSeekConfig {
  apiKey: string
  baseUrl: string
  model: string
}

const defaultConfig: DeepSeekConfig = {
  apiKey: '',
  baseUrl: DEEPSEEK_API_URL,
  model: DEEPSEEK_MODEL,
}

// ====== 状态管理 ======

const { data: config } = useStorage<DeepSeekConfig>(STORAGE_KEY, defaultConfig)
const isLoading = ref(false)
const lastError = ref<string>('')

/** AI 功能总开关（默认开启） */
function readAIEnabled(): boolean {
  try {
    const val = localStorage.getItem(ENABLED_KEY)
    return val === null ? true : val === 'true'
  } catch { return true }
}
const isAIEnabled = ref(readAIEnabled())

/** 是否已配置 API Key 且 AI 开关已打开 */
export const isAIReady = computed(() => isAIEnabled.value && !!config.value.apiKey?.trim())

/** AI 功能总开关状态（供 UI 绑定） */
export { isAIEnabled }

/**
 * 切换 AI 总开关
 */
export function toggleAIEnabled(enabled?: boolean) {
  const next = enabled ?? !isAIEnabled.value
  isAIEnabled.value = next
  try { localStorage.setItem(ENABLED_KEY, String(next)) } catch { /* ignore */ }
}

/** 获取当前配置（只读） */
export function getAIConfig(): Readonly<DeepSeekConfig> {
  return config.value
}

/**
 * 更新 AI 配置
 * @param newConfig - 新配置（可部分更新）
 */
export function updateAIConfig(newConfig: Partial<DeepSeekConfig>) {
  Object.assign(config.value, newConfig)
}

/** 清除 API Key */
export function clearAPIKey() {
  config.value.apiKey = ''
}

// ====== 核心调用方法 ======

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIResponse {
  content: string
  usage?: { prompt_tokens: number; completion_tokens: number }
}

/**
 * 调用 DeepSeek Chat API
 * @param messages - 对话消息数组
 * @param options - 可选参数 (temperature, max_tokens 等)
 * @returns AI 回复内容
 */
async function callDeepSeek(
  messages: ChatMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<AIResponse> {
  if (!config.value.apiKey?.trim()) {
    throw new Error('请先在设置中配置 DeepSeek API Key')
  }

  lastError.value = ''
  isLoading.value = true

  try {
    const response = await fetch(config.value.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.value.apiKey}`,
      },
      body: JSON.stringify({
        model: config.value.model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2000,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.error?.message || `API 请求失败 (${response.status})`)
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '未知错误'
    lastError.value = msg
    throw error
  } finally {
    isLoading.value = false
  }
}

// ====== 业务场景封装 ======

/**
 * 场景1：费曼讲解评分 + 追问
 * @param content - 用户写的讲解内容
 * @param topic - 学习主题
 * @returns 评分结果和追问问题
 */
export async function scoreExplanation(
  content: string,
  topic: string
): Promise<{
  score: number // 0-100
  clarity: number // 清晰度 0-100
  gaps: string[] // 发现的知识缺口
  followUpQuestions: string[] // 追问问题
  feedback: string // 总体反馈
}> {
  const systemPrompt = `你是一位专业的费曼学习法评估教练。你的任务是根据用户的讲解内容，从以下维度进行评分并给出反馈。

评分标准（总分100分）：
- 内容完整性(25分)：是否有开头、展开、总结
- 概念准确性(25分)：核心概念是否解释正确
- 类比运用(20分)：是否使用生活化类比帮助理解
- 表达清晰度(15分)：语言是否简洁易懂
- 深度洞察(15分)：是否触及本质或边界情况

输出格式（严格JSON，不要其他文字）：
{
  "score": 数字(0-100),
  "clarity": 数字(0-100),
  "gaps": ["缺口1", "缺口2"],
  "followUpQuestions": ["追问1", "追问2"],
  "feedback": "总体反馈文字"
}`

  const userMessage = `学习主题：${topic}\n\n我的讲解内容：\n${content}\n\n请根据上述内容进行评分和反馈。`

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ])

  // 解析 JSON 响应
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch {
    // JSON 解析失败，返回默认值
  }

  // 兜底：从文本中提取信息
  return {
    score: extractScore(result.content) ?? 75,
    clarity: extractScore(result.content) ?? 80,
    gaps: ['需要更详细解释核心概念'],
    followUpQuestions: ['能否举一个具体的例子？'],
    feedback: result.content.slice(0, 200),
  }
}

/**
 * 场景2：生成学习路径
 * @param goalName - 目标名称
 * @param currentLevel - 当前水平
 * @param timeCommitment - 时间投入
 * @param preferences - 学习偏好标签
 * @returns 生成的路径结构
 */
export async function generateLearningPath(
  goalName: string,
  currentLevel: string,
  timeCommitment: string,
  preferences: string[]
): Promise<{
  title: string
  chapters: { title: string; description: string; days: number }[]
  dailyTasks: string[]
  suggestions: string
}> {
  const systemPrompt = `你是一个专业的学习规划师。根据用户输入的目标，生成一个结构化的学习路径。

输出格式（严格JSON）：
{
  "title": "路径标题",
  "chapters": [
    {"title": "章节名", "description": "描述", "days": 天数}
  ],
  "dailyTasks": ["每日任务1", "每日任务2"],
  "suggestions": "学习建议"
}

注意：
- 章节数量根据目标复杂度决定（3-8个）
- 每个章节的天数要合理分配
- 每日任务要具体可执行`

  const userMessage = `目标：${goalName}
当前水平：${currentLevel}
时间投入：${timeCommitment}
学习偏好：${preferences.join('、')}

请为我生成一个完整的学习路径。`

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ], { temperature: 0.8 })

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch { /* ignore */ }

  return {
    title: goalName,
    chapters: [
      { title: '基础入门', description: '了解基本概念', days: 3 },
      { title: '核心深入', description: '掌握核心原理', days: 7 },
      { title: '实战应用', description: '通过项目巩固', days: 5 },
    ],
    dailyTasks: ['阅读文档', '动手实践', '写讲解笔记'],
    suggestions: result.content.slice(0, 300),
  }
}

/**
 * 场景3：知识缺口诊断
 * @param content - 讲解内容
 * @param topic - 主题
 * @returns 诊断结果
 */
export async function diagnoseGaps(
  content: string,
  topic: string
): Promise<{
  score: number
  gaps: Array<{ text: string; priority: 'high' | 'medium' | 'low'; suggestion: string }>
  summary: string
}> {
  const systemPrompt = `你是一位知识诊断专家。分析用户的学习内容，找出其中的薄弱点和知识缺口。

优先级定义：
- high(高优)：缺少关键概念、存在理解偏差、可能影响后续学习
- medium(中优)：解释不够充分、缺少例子支撑
- low(建议补充)：可以锦上添花的进阶内容

输出格式（严格JSON）：
{
  "score": 数字(0-100),
  "gaps": [
    {"text": "问题描述", "priority": "high|medium|low", "suggestion": "补救建议"}
  ],
  "summary": "总体诊断摘要"
}`

  const userMessage = `主题：${topic}\n讲解内容：\n${content}\n\n请分析其中的知识缺口。`

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ])

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch { /* ignore */ }

  return {
    score: 78,
    gaps: [
      { text: '缺少对边界情况的讨论', priority: 'high', suggestion: '研究极端场景下的行为' },
      { text: '类比可以更具体', priority: 'medium', suggestion: '用日常生活中的例子类比' },
    ],
    summary: result.content.slice(0, 200),
  }
}

/**
 * 场景4：智能测验出题
 * @param topic - 出题主题
 * @param gaps - 知识薄弱点（可选）
 * @param count - 题目数量
 * @returns 生成的题目
 */
export async function generateQuiz(
  topic: string,
  gaps?: string[],
  count: number = 5
): Promise<Array<{
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}>> {
  const systemPrompt = `你是一位教育测评专家。根据指定主题生成选择题。

输出格式（严格JSON数组）：
[
  {
    "question": "题目",
    "options": ["A选项", "B选项", "C选项", "D选项"],
    "correctIndex": 0-3,
    "explanation": "解析说明"
  }
]

要求：
- 题目难度适中，覆盖不同层次
- 选项要有迷惑性但正确答案明确
- 解析要简明扼要`

  const gapHint = gaps?.length ? `\n重点关注这些薄弱点：${gaps.join('、')}` : ''

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `主题：${topic}${gapHint}\n请生成 ${count} 道选择题。` },
  ])

  try {
    const jsonMatch = result.content.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch { /* ignore */ }

  return []
}

/**
 * 场景5：AI 辅助优化讲解内容
 * @param currentContent - 当前的讲解内容
 * @returns 优化后的内容和建议
 */
export async function optimizeExplanation(currentContent: string): Promise<{
  optimized: string
  suggestion: string
}> {
  const systemPrompt = `你是一位写作教练。帮用户优化他们的讲解内容，使其更加清晰易懂。

优化方向：
1. 用更生活化的语言替代专业术语
2. 加入恰当的类比或比喻
3. 补充可能遗漏的关键点
4. 改善段落结构和逻辑

输出格式（严格JSON）：
{
  "optimized": "优化后的完整内容",
  "suggestion": "修改要点说明"
}

注意保持原文的核心意思不变。`

  const result = await callDeepSeek([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: currentContent },
  ])

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch { /* ignore */ }

  return {
    optimized: currentContent,
    suggestion: result.content.slice(0, 300),
  }
}

/**
 * 场景6：通用对话（用于自由问答）
 * @param message - 用户消息
 * @param context - 可选上下文
 * @returns AI 回复
 */
export async function chat(message: string, context?: string): Promise<string> {
  const systemContext = context
    ? `上下文信息：${context}\n\n你是费曼学习法的AI助教，用中文回答，语气友好鼓励。`
    : '你是费曼学习法的AI助教，用中文回答，语气友好鼓励。回答要简洁实用。'

  const result = await callDeepSeek([
    { role: 'system', content: systemContext },
    { role: 'user', content: message },
  ])

  return result.content
}

// ====== 工具函数 ======

function extractScore(text: string): number | null {
  const match = text.match(/(\d{1,3})\s*[/／]?\s*(100|分)/)
  return match ? parseInt(match[1]) : null
}

export { isLoading, lastError }
