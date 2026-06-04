import type { GapItem } from '@/types'

const MIN_CONTENT_LENGTH = 50
const ANALOGY_PATTERN = /像.{1,20}一样/

export function scoreExplanation(content: string, topicKeywords: string[]): {
  score: number
  gaps: GapItem[]
  clarity: number
} {
  const gaps: GapItem[] = []
  let totalScore = 0

  // 1. 内容长度评分 (满分 25)
  const lengthScore = Math.min(25, Math.floor((content.length / MIN_CONTENT_LENGTH) * 12.5))
  totalScore += lengthScore
  if (content.length < MIN_CONTENT_LENGTH) {
    gaps.push({ text: `内容过短（${content.length}字），建议至少 ${MIN_CONTENT_LENGTH} 字以上`, priority: 'high' })
  }

  // 2. 关键词覆盖度评分 (满分 30)
  const coveredKeywords = topicKeywords.filter((kw) => content.includes(kw))
  const keywordScore = topicKeywords.length > 0
    ? Math.round((coveredKeywords.length / topicKeywords.length) * 30)
    : 20
  totalScore += keywordScore

  const missingKeywords = topicKeywords.filter((kw) => !content.includes(kw))
  missingKeywords.forEach((kw) => {
    gaps.push({ text: `未提及关键概念：「${kw}」`, priority: 'high' })
  })

  // 3. 类比检测评分 (满分 20)
  const hasAnalogy = ANALOGY_PATTERN.test(content)
  const analogyScore = hasAnalogy ? 20 : 8
  totalScore += analogyScore
  if (!hasAnalogy) {
    gaps.push({ text: '缺少类比或形象化表达，建议用"像...一样"帮助理解', priority: 'medium' })
  }

  // 4. 结构完整性评分 (满分 25)
  const sections = content.split(/\n\n|\n(?=##?|\d+[.、])|；/).filter((s) => s.trim().length > 10)
  const structureScore = Math.min(25, sections.length * 6 + 7)
  totalScore += structureScore
  if (sections.length < 2) {
    gaps.push({ text: '内容结构较单一，建议分段展开讲解', priority: 'low' })
  }

  const finalScore = Math.min(100, Math.max(0, totalScore))
  const clarity = Math.round(finalScore * 0.85)

  return { score: finalScore, gaps, clarity }
}

export function generateFollowUpQuestion(content: string): string[] {
  const questions: string[] = []

  // 检测常见概念并生成追问
  const patterns: Array<{ regex: RegExp; question: string }> = [
    { regex: /递归/, question: '如果没有终止条件，会发生什么？' },
    { regex: /缓存/, question: '缓存失效的场景有哪些？' },
    { regex: /闭包/, question: '闭包会导致内存泄漏吗？如何避免？' },
    { regex: /Promise|异步/, question: '如果多个异步任务之间有依赖关系，该如何处理？' },
    { regex: /组件|Vue|React/, question: '这个概念在大型项目中如何组织？' },
    { regex: /HTTP|请求/, question: '网络请求失败时应该如何重试？' },
    { regex: /算法|复杂度/, question: '有没有更优的解法？时间和空间复杂度能再优化吗？' },
    { regex: /函数/, question: '如果输入参数不合法，函数的行为是什么？' },
    { regex: /循环/, question: '当数据量非常大时，这种写法会有性能问题吗？' },
    { regex: /数组|对象/, question: '嵌套层级很深时，如何安全地访问属性？' },
  ]

  for (const { regex, question } of patterns) {
    if (regex.test(content)) {
      questions.push(question)
      if (questions.length >= 2) break
    }
  }

  // 兜底追问
  if (questions.length === 0) {
    questions.push('能举一个具体的应用场景来说明吗？')
    questions.push('初学者容易在哪些地方踩坑？')
  }

  return questions.slice(0, 2)
}
