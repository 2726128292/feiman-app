export interface SM2Params {
  interval: number
  easeFactor: number
  repetition: number
}

export function updateSM2(params: SM2Params, quality: number): SM2Params {
  if (quality < 3) {
    return { interval: 1, easeFactor: 2.5, repetition: 0 }
  }

  let { interval, easeFactor, repetition } = params

  if (repetition === 0) {
    interval = 1
    repetition = 1
  } else if (repetition === 1) {
    interval = 6
    repetition = 2
  } else {
    const q = quality
    const newEF = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    )
    easeFactor = newEF
    interval = Math.round(interval * newEF)
    repetition += 1
  }

  return { interval, easeFactor, repetition }
}

export function calculateDueDate(baseDate: Date, intervalDays: number): string {
  const due = new Date(baseDate)
  due.setDate(due.getDate() + intervalDays)
  return due.toISOString().split('T')[0]
}
