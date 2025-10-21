/**
 * Export Button Component
 *
 * Provides dropdown menu for exporting SEO reports in various formats.
 */

'use client'

import { useState } from 'react'
import { Download, FileText, Table, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { downloadSEOReportPDF, type SEOReportData } from '@/lib/seo/export-pdf'
import { downloadSEOReportCSV, type KeywordRankingCSV } from '@/lib/seo/export-csv'
import { downloadSEOReportJSON, type SEOReportJSON } from '@/lib/seo/export-json'

export interface ExportButtonProps {
  data: {
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
      clicksChange?: number
    }>
    summary: {
      totalClicks: number
      totalImpressions: number
      avgPosition: number
      totalKeywords: number
    }
    alerts?: Array<{
      type: string
      severity: string
      keyword: string
      oldValue: number
      newValue: number
      change: number
      suggestion: string
    }>
  }
  disabled?: boolean
}

export function ExportButton({ data, disabled = false }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const pdfData: SEOReportData = {
        ...data,
        alerts: data.alerts || [],
      }
      downloadSEOReportPDF(pdfData)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const csvRankings: KeywordRankingCSV[] = data.rankings.map(r => ({
        keyword: r.keyword,
        position: r.position,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        positionChange: r.positionChange,
        clicksChange: r.clicksChange,
      }))

      downloadSEOReportCSV(
        csvRankings,
        undefined,
        {
          productName: data.productName,
          dateRange: data.dateRange,
        }
      )
    } catch (error) {
      console.error('Failed to export CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = async () => {
    setIsExporting(true)
    try {
      const jsonData: Partial<SEOReportJSON> = {
        metadata: {
          generatedAt: new Date().toISOString(),
          productName: data.productName,
          productUrl: data.productUrl,
          dateRange: data.dateRange,
        },
        summary: {
          totalKeywords: data.summary.totalKeywords,
          avgPosition: data.summary.avgPosition,
          totalClicks: data.summary.totalClicks,
          totalImpressions: data.summary.totalImpressions,
          avgCTR: data.summary.totalImpressions > 0
            ? (data.summary.totalClicks / data.summary.totalImpressions) * 100
            : 0,
        },
        rankings: data.rankings,
        alerts: data.alerts || [],
      }

      downloadSEOReportJSON(jsonData)
    } catch (error) {
      console.error('Failed to export JSON:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={disabled || isExporting} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
