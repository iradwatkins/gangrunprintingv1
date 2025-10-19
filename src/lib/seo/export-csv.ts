/**
 * SEO Report CSV Export
 *
 * Generates CSV exports for Excel/Google Sheets analysis.
 * Uses papaparse for proper CSV formatting.
 */

import Papa from 'papaparse'

/**
 * Keyword ranking data for CSV export
 */
export interface KeywordRankingCSV {
  keyword: string
  position: number
  clicks: number
  impressions: number
  ctr: number
  positionChange?: number
  clicksChange?: number
}

/**
 * Traffic data for CSV export
 */
export interface TrafficDataCSV {
  date: string
  sessions: number
  users: number
  pageviews: number
  bounceRate: number
}

/**
 * Export keyword rankings to CSV
 *
 * @param data - Array of keyword ranking data
 * @returns CSV string
 */
export function exportKeywordRankingsCSV(data: KeywordRankingCSV[]): string {
  const csvData = data.map(row => ({
    Keyword: row.keyword,
    Position: row.position,
    Clicks: row.clicks,
    Impressions: row.impressions,
    CTR: `${row.ctr.toFixed(2)}%`,
    'Position Change': row.positionChange || 0,
    'Clicks Change': row.clicksChange || 0,
  }))

  return Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
  })
}

/**
 * Export traffic data to CSV
 *
 * @param data - Array of traffic data
 * @returns CSV string
 */
export function exportTrafficDataCSV(data: TrafficDataCSV[]): string {
  const csvData = data.map(row => ({
    Date: row.date,
    Sessions: row.sessions,
    Users: row.users,
    Pageviews: row.pageviews,
    'Bounce Rate': `${row.bounceRate.toFixed(2)}%`,
  }))

  return Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
  })
}

/**
 * Export complete SEO report to CSV
 *
 * @param rankings - Keyword rankings
 * @param traffic - Traffic data (optional)
 * @param metadata - Report metadata
 * @returns CSV string
 */
export function exportCompleteSEOReportCSV(
  rankings: KeywordRankingCSV[],
  traffic?: TrafficDataCSV[],
  metadata?: {
    productName?: string
    dateRange?: { start: string; end: string }
  }
): string {
  let csv = ''

  // Add metadata as comments
  if (metadata) {
    csv += `# SEO Report\n`
    if (metadata.productName) {
      csv += `# Product: ${metadata.productName}\n`
    }
    if (metadata.dateRange) {
      csv += `# Date Range: ${metadata.dateRange.start} to ${metadata.dateRange.end}\n`
    }
    csv += `# Generated: ${new Date().toLocaleString()}\n\n`
  }

  // Add keyword rankings section
  csv += '# Keyword Rankings\n'
  csv += exportKeywordRankingsCSV(rankings)

  // Add traffic section if available
  if (traffic && traffic.length > 0) {
    csv += '\n\n# Traffic Data\n'
    csv += exportTrafficDataCSV(traffic)
  }

  return csv
}

/**
 * Download CSV file
 *
 * @param csvContent - CSV content string
 * @param filename - Output filename (without extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export and download keyword rankings as CSV
 *
 * @param data - Keyword ranking data
 * @param filename - Output filename
 */
export function downloadKeywordRankingsCSV(data: KeywordRankingCSV[], filename?: string): void {
  const csv = exportKeywordRankingsCSV(data)
  downloadCSV(csv, filename || `keyword-rankings-${Date.now()}`)
}

/**
 * Export and download complete SEO report as CSV
 *
 * @param rankings - Keyword rankings
 * @param traffic - Traffic data (optional)
 * @param metadata - Report metadata
 * @param filename - Output filename
 */
export function downloadSEOReportCSV(
  rankings: KeywordRankingCSV[],
  traffic?: TrafficDataCSV[],
  metadata?: {
    productName?: string
    dateRange?: { start: string; end: string }
  },
  filename?: string
): void {
  const csv = exportCompleteSEOReportCSV(rankings, traffic, metadata)
  const defaultFilename = `seo-report-${metadata?.productName?.toLowerCase().replace(/\s+/g, '-') || 'all'}-${Date.now()}`
  downloadCSV(csv, filename || defaultFilename)
}
