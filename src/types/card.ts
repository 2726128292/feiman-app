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
}
