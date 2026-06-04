import { computed } from 'vue'
import { useStorage } from '@/composables/useStorage'
import type { StudyTopic } from '@/types'
import { mockTopics } from '@/utils/mock'

export const useTopicStore = () => {
  const topics = useStorage<StudyTopic[]>('feiman_topics', mockTopics)

  const activeTopics = computed(() => topics.value.filter(t => t.status === 'active'))

  function addTopic(topic: Omit<StudyTopic, 'id' | 'createdAt'>) {
    topics.value.push({
      ...topic,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    })
  }

  function updateTopic(id: string, data: Partial<StudyTopic>) {
    const idx = topics.value.findIndex(t => t.id === id)
    if (idx !== -1) Object.assign(topics.value[idx], data)
  }

  return { topics, activeTopics, addTopic, updateTopic }
}
