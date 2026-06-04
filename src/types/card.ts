export interface ReviewCard {
  id: string
  topicId: string
  question: string
  answer: string
  dueAt: string
  interval: number
  easeFactor: number
  reviewCount: number
  lastReviewAt?: string
  // SM-2 完整字段（用于新建闪卡和复习评级持久化）
  repetition?: number          // SM-2 重复次数
  nextReview?: string          // 下次复习时间 ISO
  tags?: string[]              // 标签列表
  deck?: string                // 卡组名称
  createdAt?: string           // 创建时间 ISO
  source?: string              // 来源：manual / import / ai
}
