export interface Chapter {
  id: string
  title: string
  completed: boolean
  progress: number
}

export interface StudyTopic {
  id: string
  title: string
  tags: string[]
  status: 'active' | 'completed' | 'paused'
  progress: number
  createdAt: string
  chapters: Chapter[]
  color: string
}
