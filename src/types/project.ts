export interface SubTask {
  id: string
  text: string
  completed: boolean
}

export interface ProjectTask {
  id: string
  title: string
  subTasks: SubTask[]
  status: 'active' | 'completed'
  submittedAt?: string
}
