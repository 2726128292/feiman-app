export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topicId: string
}

export interface QuizRecord {
  id: string
  questions: QuizQuestion[]
  answers: number[]
  score: number
  completedAt: string
}
