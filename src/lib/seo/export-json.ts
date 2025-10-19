/**
 * SEO Report JSON Export
 *
 * Generates JSON exports for API integrations and data analysis.
 */

/**
 * Complete SEO report data structure
 */
export interface SEOReportJSON {
  metadata: {
    generatedAt: string
    productName?: string
    productUrl?: string
    dateRange: {
      start: string
      end: string
    }
  }
  summary: {
    totalKeywords: number
    avgPosition: number
    totalClicks: number
    totalImpressions: number
    avgCTR: number
  }
  rankings: Array<{
    keyword: string
    position: number
    clicks: number
    impressions: number
    ctr: number
    positionChange?: number
    clicksChange?: number
  }>
  traffic?: {
    sessions: number
    users: number
    pageviews: number
    bounceRate: number
    avgSessionDuration: number
    newUsers: number
    returningUsers: number
  }
  performance?: {
    scores: {
      performance: number
      accessibility: number
      bestPractices: number
      seo: number
    }
    vitals: {
      lcp: number
      fid: number
      cls: number
      inp: number
      ttfb: number
      fcp: number
    }
  }
  alerts: Array<{
    type: string
    severity: string
    keyword: string
    oldValue: number
    newValue: number
    change: number
    suggestion: string
  }>
}

/**
 * Generate SEO report as JSON
 *
 * @param data - SEO report data
 * @returns Formatted JSON string
 */
export function generateSEOReportJSON(data: Partial<SEOReportJSON>): string {
  const report: SEOReportJSON = {
    metadata: {
      generatedAt: new Date().toISOString(),
      ...data.metadata,
    },
    summary: data.summary || {
      totalKeywords: 0,
      avgPosition: 0,
      totalClicks: 0,
      totalImpressions: 0,
      avgCTR: 0,
    },
    rankings: data.rankings || [],
    traffic: data.traffic,
    performance: data.performance,
    alerts: data.alerts || [],
  }

  return JSON.stringify(report, null, 2)
}

/**
 * Download JSON file
 *
 * @param jsonContent - JSON content string
 * @param filename - Output filename (without extension)
 */
export function downloadJSON(jsonContent: string, filename: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export and download SEO report as JSON
 *
 * @param data - SEO report data
 * @param filename - Output filename
 */
export function downloadSEOReportJSON(data: Partial<SEOReportJSON>, filename?: string): void {
  const json = generateSEOReportJSON(data)
  const defaultFilename = `seo-report-${data.metadata?.productName?.toLowerCase().replace(/\s+/g, '-') || 'all'}-${Date.now()}`
  downloadJSON(json, filename || defaultFilename)
}

/**
 * Parse SEO report JSON
 *
 * @param jsonString - JSON string to parse
 * @returns Parsed SEO report data
 */
export function parseSEOReportJSON(jsonString: string): SEOReportJSON | null {
  try {
    const data = JSON.parse(jsonString)
    return data as SEOReportJSON
  } catch (error) {
    console.error('Failed to parse SEO report JSON:', error)
    return null
  }
}

/**
 * Validate SEO report JSON structure
 *
 * @param data - Data to validate
 * @returns True if valid, false otherwise
 */
export function validateSEOReportJSON(data: any): data is SEOReportJSON {
  return (
    data &&
    typeof data === 'object' &&
    data.metadata &&
    typeof data.metadata === 'object' &&
    data.summary &&
    typeof data.summary === 'object' &&
    Array.isArray(data.rankings)
  )
}
