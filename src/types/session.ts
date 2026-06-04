export interface VoiceMetrics {
  wpm: number
  pauseStatus: 'normal' | 'long'
  clarityScore: number
}

export interface FeynmanSession {
  id: string
  topicId: string
  content: string
  score: number
  gaps: GapItem[]
  type: 'text' | 'voice'
  duration?: number
  metrics?: VoiceMetrics
  step: number
  totalSteps: number
  createdAt: string
}

export interface GapItem {
  text: string
  priority: 'high' | 'medium' | 'low'
}
