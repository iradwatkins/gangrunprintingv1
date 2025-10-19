/**
 * SEO Metrics Chart Component
 *
 * Displays keyword ranking trends over time using Recharts.
 */

'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface SEOMetricsDataPoint {
  date: string
  position: number
  clicks: number
  impressions: number
}

export interface SEOMetricsChartProps {
  data: SEOMetricsDataPoint[]
  title?: string
  description?: string
  showPosition?: boolean
  showClicks?: boolean
  showImpressions?: boolean
}

export function SEOMetricsChart({
  data,
  title = 'SEO Performance Over Time',
  description = 'Track ranking position and traffic metrics',
  showPosition = true,
  showClicks = true,
  showImpressions = false,
}: SEOMetricsChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available for the selected date range
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              yAxisId="position"
              reversed={showPosition}
              domain={showPosition ? [0, 100] : undefined}
              hide={!showPosition}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={showPosition ? { value: 'Position', angle: -90, position: 'insideLeft' } : undefined}
            />
            <YAxis
              yAxisId="traffic"
              orientation="right"
              hide={!showClicks && !showImpressions}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              label={showClicks || showImpressions ? { value: 'Traffic', angle: 90, position: 'insideRight' } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
            />
            <Legend />
            {showPosition && (
              <Line
                yAxisId="position"
                type="monotone"
                dataKey="position"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                name="Position"
              />
            )}
            {showClicks && (
              <Line
                yAxisId="traffic"
                type="monotone"
                dataKey="clicks"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142 76% 36%)' }}
                name="Clicks"
              />
            )}
            {showImpressions && (
              <Line
                yAxisId="traffic"
                type="monotone"
                dataKey="impressions"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(221 83% 53%)' }}
                name="Impressions"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
