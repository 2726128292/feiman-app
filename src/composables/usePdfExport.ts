/**
 * PDF 导出 - 将学习报告导出为 HTML 格式的打印/PDF
 * 不依赖外部库，通过 HTML 打印实现
 */

export interface PdfReportData {
  /** 报告标题 */
  title: string
  /** 报告周期描述 */
  period: string
  /** 数据指标卡片 */
  sections: { label: string; value: string; detail?: string }[]
  /** 学习总结文本 */
  summary: string
  /** 建议文本 */
  suggestion: string
  /** 生成时间 */
  generatedAt: string
}

/**
 * 打开报告打印窗口（可保存为 PDF）
 * 通过新窗口打开格式化的 HTML 报告并自动触发打印对话框
 * @param data 报告数据
 */
export function exportPdfReport(data: PdfReportData): void {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${data.title}</title>
  <style>
    body { font-family: -apple-system, "PingFang SC", sans-serif; padding: 40px; color: #334155; max-width: 700px; margin: 0 auto; }
    h1 { color: #4F6EF7; font-size: 28px; margin-bottom: 4px; }
    .subtitle { color: #94a3b8; margin-bottom: 32px; font-size: 14px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .card { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; }
    .card .value { font-size: 36px; font-weight: bold; color: #4F6EF7; }
    .card .label { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .section { margin: 20px 0; padding: 16px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; }
    .section h3 { font-size: 16px; color: #1e293b; margin: 0 0 8px; }
    .section p { font-size: 14px; line-height: 1.7; color: #475569; margin: 0; }
    .footer { margin-top: 40px; text-align: center; color: #cbd5e1; font-size: 12px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>📊 ${data.title}</h1>
  <p class="subtitle">${data.period} · ${data.generatedAt}</p>

  <div class="grid">
    ${data.sections.map(s => `
    <div class="card">
      <div class="value">${s.value}</div>
      <div class="label">${s.label}</div>
    </div>`).join('')}
  </div>

  <div class="section">
    <h3>📝 学习总结</h3>
    <p>${data.summary.replace(/\n/g, '<br/>')}</p>
  </div>

  <div class="section">
    <h3>💡 建议</h3>
    <p>${data.suggestion.replace(/\n/g, '<br/>')}</p>
  </div>

  <div class="footer">
    <p>由 费曼学习法App 自动生成</p>
    <p>— 把知识讲明白，才是真的学会 —</p>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=800,height=900')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
