export interface PlanTask {
  id: string
  title: string
  time: string
  type: 'flashcard' | 'explain' | 'remediation' | 'other'
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  topicId?: string
  pomodoroStarted?: boolean
}

export interface DailyPlan {
  date: string
  tasks: PlanTask[]
}
