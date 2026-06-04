/**
 * 性能监控 - 采集关键 Core Web Vitals 指标
 * 使用 PerformanceObserver API 收集 FCP / LCP / FID
 */

export interface PerformanceMetrics {
  fcp: number | null  // First Contentful Paint（首次内容绘制）
  lcp: number | null  // Largest Contentful Paint（最大内容绘制）
  fid: number | null  // First Input Delay（首次输入延迟）
  navigationStart: number
}

let metrics: PerformanceMetrics = {
  fcp: null,
  lcp: null,
  fid: null,
  navigationStart: performance.timing.navigationStart,
}

/**
 * 开始采集性能指标
 * 仅在支持 PerformanceObserver 的浏览器中生效
 */
export function startPerformanceMonitor(): void {
  if (!('PerformanceObserver' in window)) return

  // 监听 FCP（首次内容绘制）
  try {
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime
        }
      }
    })
    paintObserver.observe({ type: 'paint', buffered: true })
  } catch { /* 当前环境不支持 paint 类型 */ }

  // 监听 LCP（最大内容绘制）
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) metrics.lcp = lastEntry.startTime
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch { /* 当前环境不支持 LCP 类型 */ }

  // 监听 FID（首次输入延迟）
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'first-input') {
          metrics.fid = (entry as any).processingStart - entry.startTime
        }
      }
    })
    fidObserver.observe({ type: 'first-input', buffered: true })
  } catch { /* 当前环境不支持 first-input 类型 */ }

  // 开发环境下延迟输出指标到控制台
  if (import.meta.env.DEV) {
    setTimeout(() => {
      console.table({
        'FCP (ms)': metrics.fcp?.toFixed(1) || '测量中...',
        'LCP (ms)': metrics.lcp?.toFixed(1) || '测量中...',
        'FID (ms)': metrics.fid?.toFixed(1) || '等待交互...',
      })
    }, 3000)
  }
}

/** 获取当前已采集的性能指标快照 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return { ...metrics }
}
