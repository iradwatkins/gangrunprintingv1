/**
 * Core Web Vitals Card Component
 *
 * Displays Core Web Vitals metrics with visual indicators.
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export interface CoreWebVitalsData {
  lcp: number // Largest Contentful Paint (ms)
  fid: number // First Input Delay (ms)
  cls: number // Cumulative Layout Shift
  inp?: number // Interaction to Next Paint (ms)
  ttfb?: number // Time to First Byte (ms)
  fcp?: number // First Contentful Paint (ms)
}

export interface CoreWebVitalsCardProps {
  data: CoreWebVitalsData
  title?: string
  description?: string
}

type VitalStatus = 'good' | 'needs-improvement' | 'poor'

interface VitalThresholds {
  good: number
  needsImprovement: number
}

const THRESHOLDS: Record<string, VitalThresholds> = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  inp: { good: 200, needsImprovement: 500 },
  ttfb: { good: 800, needsImprovement: 1800 },
  fcp: { good: 1800, needsImprovement: 3000 },
}

function getStatus(metric: string, value: number): VitalStatus {
  const threshold = THRESHOLDS[metric]
  if (!threshold) return 'poor'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

function getStatusColor(status: VitalStatus): string {
  switch (status) {
    case 'good':
      return 'text-green-600'
    case 'needs-improvement':
      return 'text-orange-600'
    case 'poor':
      return 'text-red-600'
  }
}

function getStatusIcon(status: VitalStatus) {
  switch (status) {
    case 'good':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'needs-improvement':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />
    case 'poor':
      return <XCircle className="h-4 w-4 text-red-600" />
  }
}

function getStatusBadge(status: VitalStatus): JSX.Element {
  const label = status === 'needs-improvement' ? 'Needs Improvement' : status.charAt(0).toUpperCase() + status.slice(1)
  const variant = status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'

  return <Badge variant={variant as any}>{label}</Badge>
}

function formatValue(metric: string, value: number): string {
  if (metric === 'cls') {
    return value.toFixed(3)
  }
  return `${Math.round(value)} ms`
}

function getProgressValue(metric: string, value: number): number {
  const threshold = THRESHOLDS[metric]
  if (!threshold) return 0

  const max = threshold.needsImprovement * 1.5
  return Math.min(100, (value / max) * 100)
}

export function CoreWebVitalsCard({
  data,
  title = 'Core Web Vitals',
  description = 'Page performance metrics',
}: CoreWebVitalsCardProps) {
  const vitals = [
    { key: 'lcp', label: 'LCP', description: 'Largest Contentful Paint', value: data.lcp },
    { key: 'fid', label: 'FID', description: 'First Input Delay', value: data.fid },
    { key: 'cls', label: 'CLS', description: 'Cumulative Layout Shift', value: data.cls },
  ]

  if (data.inp !== undefined) {
    vitals.push({ key: 'inp', label: 'INP', description: 'Interaction to Next Paint', value: data.inp })
  }

  if (data.fcp !== undefined) {
    vitals.push({ key: 'fcp', label: 'FCP', description: 'First Contentful Paint', value: data.fcp })
  }

  if (data.ttfb !== undefined) {
    vitals.push({ key: 'ttfb', label: 'TTFB', description: 'Time to First Byte', value: data.ttfb })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {vitals.map(vital => {
          const status = getStatus(vital.key, vital.value)
          return (
            <div key={vital.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <div>
                    <p className="text-sm font-medium">{vital.label}</p>
                    <p className="text-xs text-muted-foreground">{vital.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                    {formatValue(vital.key, vital.value)}
                  </span>
                  {getStatusBadge(status)}
                </div>
              </div>
              <Progress
                className="h-2"
                value={100 - getProgressValue(vital.key, vital.value)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
