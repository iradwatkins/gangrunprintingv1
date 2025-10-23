/**
 * SEO Report PDF Export
 *
 * Generates branded PDF reports with SEO metrics, charts, and recommendations.
 * Uses jsPDF and jsPDF-AutoTable for professional formatting.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * SEO report data structure
 */
export interface SEOReportData {
  productName?: string
  productUrl?: string
  dateRange: {
    start: string
    end: string
  }
  rankings: Array<{
    keyword: string
    position: number
    clicks: number
    impressions: number
    ctr: number
    positionChange?: number
  }>
  traffic?: {
    sessions: number
    users: number
    pageviews: number
    bounceRate: number
  }
  performance?: {
    performanceScore: number
    lcp: number
    fid: number
    cls: number
  }
  alerts: Array<{
    severity: string
    keyword: string
    suggestion: string
    oldValue: number
    newValue: number
  }>
  summary: {
    totalClicks: number
    totalImpressions: number
    avgPosition: number
    totalKeywords: number
  }
}

/**
 * Generate SEO report as PDF
 *
 * @param data - SEO report data
 * @returns PDF blob
 */
export function generateSEOReportPDF(data: SEOReportData): Blob {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(255, 87, 34) // Orange brand color
  doc.text('SEO Performance Report', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('GangRun Printing', 14, 27)

  // Product info
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  if (data.productName) {
    doc.text(`Product: ${data.productName}`, 14, 37)
  }

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Date Range: ${data.dateRange.start} to ${data.dateRange.end}`, 14, 43)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48)

  let yPos = 58

  // Summary section
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('Summary', 14, yPos)
  yPos += 3

  autoTable(doc, {
    startY: yPos,
    head: [['Metric', 'Value']],
    body: [
      ['Total Keywords Tracked', data.summary.totalKeywords.toString()],
      ['Average Position', `#${data.summary.avgPosition.toFixed(1)}`],
      ['Total Clicks', data.summary.totalClicks.toLocaleString()],
      ['Total Impressions', data.summary.totalImpressions.toLocaleString()],
      [
        'Overall CTR',
        data.summary.totalImpressions > 0
          ? `${((data.summary.totalClicks / data.summary.totalImpressions) * 100).toFixed(2)}%`
          : '0%',
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [255, 87, 34] },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Traffic section (if available)
  if (data.traffic) {
    doc.setFontSize(14)
    doc.text('Traffic Metrics', 14, yPos)
    yPos += 3

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Sessions', data.traffic.sessions.toLocaleString()],
        ['Users', data.traffic.users.toLocaleString()],
        ['Pageviews', data.traffic.pageviews.toLocaleString()],
        ['Bounce Rate', `${data.traffic.bounceRate.toFixed(1)}%`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [255, 87, 34] },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Performance section (if available)
  if (data.performance) {
    doc.setFontSize(14)
    doc.text('Page Performance', 14, yPos)
    yPos += 3

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value', 'Status']],
      body: [
        [
          'Performance Score',
          data.performance.performanceScore.toString(),
          data.performance.performanceScore >= 90
            ? 'Good'
            : data.performance.performanceScore >= 50
              ? 'Fair'
              : 'Poor',
        ],
        [
          'LCP (ms)',
          data.performance.lcp.toFixed(0),
          data.performance.lcp <= 2500 ? 'Good' : data.performance.lcp <= 4000 ? 'Fair' : 'Poor',
        ],
        [
          'FID (ms)',
          data.performance.fid.toFixed(0),
          data.performance.fid <= 100 ? 'Good' : data.performance.fid <= 300 ? 'Fair' : 'Poor',
        ],
        [
          'CLS',
          data.performance.cls.toFixed(3),
          data.performance.cls <= 0.1 ? 'Good' : data.performance.cls <= 0.25 ? 'Fair' : 'Poor',
        ],
      ],
      theme: 'striped',
      headStyles: { fillColor: [255, 87, 34] },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage()
    yPos = 20
  }

  // Keyword rankings section
  doc.setFontSize(14)
  doc.text('Keyword Rankings', 14, yPos)
  yPos += 3

  const rankingsData = data.rankings
    .slice(0, 20)
    .map((r) => [
      r.keyword,
      `#${r.position}`,
      r.clicks.toString(),
      r.impressions.toLocaleString(),
      `${r.ctr.toFixed(1)}%`,
      r.positionChange
        ? r.positionChange > 0
          ? `+${r.positionChange}`
          : r.positionChange.toString()
        : '-',
    ])

  autoTable(doc, {
    startY: yPos,
    head: [['Keyword', 'Position', 'Clicks', 'Impressions', 'CTR', 'Change']],
    body: rankingsData,
    theme: 'grid',
    headStyles: { fillColor: [255, 87, 34] },
    styles: { fontSize: 8 },
  })

  yPos = (doc as any).lastAutoTable.finalY + 10

  // Alerts section
  if (data.alerts.length > 0) {
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.text('Alerts & Recommendations', 14, yPos)
    yPos += 3

    const alertsData = data.alerts.map((a) => [
      a.severity,
      a.keyword,
      `#${a.oldValue} → #${a.newValue}`,
      a.suggestion,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Severity', 'Keyword', 'Change', 'Suggestion']],
      body: alertsData,
      theme: 'grid',
      headStyles: { fillColor: [255, 87, 34] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { cellWidth: 80 },
      },
    })
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount} | Generated by GangRun Printing SEO Dashboard`,
      14,
      doc.internal.pageSize.height - 10
    )
  }

  // Convert to blob
  return doc.output('blob')
}

/**
 * Download SEO report as PDF
 *
 * @param data - SEO report data
 * @param filename - Output filename (without extension)
 */
export function downloadSEOReportPDF(data: SEOReportData, filename?: string): void {
  const blob = generateSEOReportPDF(data)
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
    ? `${filename}.pdf`
    : `seo-report-${data.productName?.toLowerCase().replace(/\s+/g, '-') || 'all'}-${Date.now()}.pdf`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
