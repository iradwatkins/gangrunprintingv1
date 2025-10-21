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
        <ResponsiveContainer height={300} width="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid className="stroke-muted" strokeDasharray="3 3" />
            <XAxis
              className="text-xs"
              dataKey="date"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs"
              domain={showPosition ? [0, 100] : undefined}
              hide={!showPosition}
              label={showPosition ? { value: 'Position', angle: -90, position: 'insideLeft' } : undefined}
              reversed={showPosition}
              tick={{ fill: 'currentColor' }}
              yAxisId="position"
            />
            <YAxis
              className="text-xs"
              hide={!showClicks && !showImpressions}
              label={showClicks || showImpressions ? { value: 'Traffic', angle: 90, position: 'insideRight' } : undefined}
              orientation="right"
              tick={{ fill: 'currentColor' }}
              yAxisId="traffic"
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
                dataKey="position"
                dot={{ fill: 'hsl(var(--primary))' }}
                name="Position"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                type="monotone"
                yAxisId="position"
              />
            )}
            {showClicks && (
              <Line
                dataKey="clicks"
                dot={{ fill: 'hsl(142 76% 36%)' }}
                name="Clicks"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                type="monotone"
                yAxisId="traffic"
              />
            )}
            {showImpressions && (
              <Line
                dataKey="impressions"
                dot={{ fill: 'hsl(221 83% 53%)' }}
                name="Impressions"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                type="monotone"
                yAxisId="traffic"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
