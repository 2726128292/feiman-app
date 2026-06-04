export interface KnowledgePoint {
  id: string
  title: string
  done: boolean
}

export interface Chapter {
  id: string
  title: string
  completed: boolean
  progress: number
  /** 知识点/子任务列表 */
  items?: KnowledgePoint[]
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
