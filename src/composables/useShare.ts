/**
 * 分享功能 - 支持原生 Web Share API 和降级方案
 */
export function useShare() {
  /**
   * 分享讲解成果
   */
  async function shareExplanation(data: {
    topic: string
    score: number
    summary?: string
  }): Promise<boolean> {
    const text = `【费曼学习法】我在「${data.topic}」讲解中获得了 ${data.score} 分！\n${data.summary ? '💡 ' + data.summary : '"把知识讲明白，才是真的学会"'}\n\n— 来自费曼学习法App`

    // 尝试 Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `费曼讲解 - ${data.topic}`,
          text: text,
        })
        return true
      } catch (err) {
        if ((err as Error).name === 'AbortError') return true
      }
    }

    // 降级：复制到剪贴板
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    }
  }

  /**
   * 分享成就
   */
  async function shareAchievement(data: {
    title: string
    description: string
    earnedAt?: string
  }): Promise<boolean> {
    const text = `🏆 解锁成就：【${data.title}】\n${data.description}\n\n— 来自费曼学习法App`

    if (navigator.share) {
      try {
        await navigator.share({ title: data.title, text })
        return true
      } catch (err) {
        if ((err as Error).name === 'AbortError') return true
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.cssText = 'position:fixed;left:-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      return true
    }
  }

  return { shareExplanation, shareAchievement }
}
