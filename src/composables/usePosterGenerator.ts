/**
 * 海报生成器 - 将讲解成果渲染为可分享的图片
 * 使用 Canvas 绘制海报，无需外部依赖
 */

export interface PosterOptions {
  /** 讲解主题 */
  topic: string
  /** 评分（0-100） */
  score: number
  /** 总结文案 */
  summary?: string
  /** 日期字符串 */
  date?: string
  /** 连续学习天数 */
  streakDays?: number
}

/**
 * 生成讲解成果海报图片
 * @param options 海报配置选项
 * @returns base64 编码的 PNG 图片字符串
 */
export async function generatePoster(options: PosterOptions): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = 750       // 适配手机屏幕宽度
  canvas.height = 1068     // 3:4 比例
  const ctx = canvas.getContext('2d')!

  // ====== 背景渐变 ======
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#667eea')
  gradient.addColorStop(0.5, '#764ba2')
  gradient.addColorStop(1, '#f093fb')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // ====== 装饰圆圈 ======
  ctx.globalAlpha = 0.1
  ctx.beginPath()
  ctx.arc(canvas.width * 0.85, canvas.height * 0.15, 120, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(canvas.width * 0.1, canvas.height * 0.8, 80, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // ====== Logo / 标题 ======
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 42px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('费曼学习法', canvas.width / 2, 120)

  ctx.font = '26px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText('"把知识讲明白，才是真的学会"', canvas.width / 2, 165)

  // ====== 分数圆环 ======
  const cx = canvas.width / 2
  const cy = canvas.height * 0.45
  const radius = 130
  const lineWidth = 16

  // 背景环
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.lineWidth = lineWidth
  ctx.stroke()

  // 分数环
  const scoreRatio = options.score / 100
  ctx.beginPath()
  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * scoreRatio)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.stroke()

  // 分数文字
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 72px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(options.score), cx, cy - 10)
  ctx.font = '24px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillText('分', cx, cy + 40)

  // ====== 主题名 ======
  ctx.font = 'bold 32px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'alphabetic'
  const maxTopicWidth = canvas.width - 80
  let topicText = options.topic
  if (ctx.measureText(topicText).width > maxTopicWidth) {
    while (ctx.measureText(topicText + '...').width > maxTopicWidth && topicText.length > 0) {
      topicText = topicText.slice(0, -1)
    }
    topicText += '...'
  }
  ctx.fillText(topicText, canvas.width / 2, cy + radius + 90)

  // ====== 日期 & 连续天数 ======
  ctx.font = '22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  const dateStr = options.date || new Date().toLocaleDateString('zh-CN')
  let footerText = dateStr
  if (options.streakDays && options.streakDays > 0) {
    footerText += `  ·  连续学习 ${options.streakDays} 天 🔥`
  }
  ctx.fillText(footerText, canvas.width / 2, canvas.height - 180)

  // ====== 底部标语 ======
  ctx.font = '20px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('— 来自费曼学习法App —', canvas.width / 2, canvas.height - 100)

  // ====== 二维码占位 ======
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(canvas.width / 2 - 60, canvas.height - 220, 120, 120)
  ctx.fillStyle = '#333'
  ctx.font = '16px sans-serif'
  ctx.fillText('扫码体验', canvas.width / 2, canvas.height - 155)

  return canvas.toDataURL('image/png')
}
