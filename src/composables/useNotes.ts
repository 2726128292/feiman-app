/**
 * 笔记系统 Composable
 * 每个学习主题可以关联笔记
 */

export interface Note {
  id: string
  topicId: string   // 关联的主题ID（空则为全局笔记）
  content: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'feiman_notes'

export function useNotes() {
  /** 从 localStorage 加载所有笔记 */
  function loadNotes(): Note[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }

  /** 将笔记列表保存到 localStorage */
  function saveNotes(notes: Note[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }

  /** 获取某个主题的笔记 */
  function getTopicNotes(topicId: string): Note[] {
    return loadNotes().filter(n => n.topicId === topicId)
  }

  /** 创建/更新笔记（同一 topicId 只保留一条） */
  function upsertNote(topicId: string, content: string): Note {
    const notes = loadNotes()
    const existing = notes.find(n => n.topicId === topicId)

    if (existing) {
      existing.content = content
      existing.updatedAt = new Date().toISOString()
    } else {
      const note: Note = {
        id: crypto.randomUUID(),
        topicId,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      notes.push(note)
    }

    saveNotes(notes)
    return notes.find(n => n.topicId === topicId)!
  }

  /** 删除笔记 */
  function deleteNote(noteId: string) {
    const notes = loadNotes().filter(n => n.id !== noteId)
    saveNotes(notes)
  }

  return { loadNotes, getTopicNotes, upsertNote, deleteNote }
}
