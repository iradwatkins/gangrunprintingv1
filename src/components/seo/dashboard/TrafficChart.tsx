/**
 * Traffic Chart Component
 *
 * Displays clicks and impressions using a composed bar/line chart.
 */

'use client'

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface TrafficDataPoint {
  date: string
  clicks: number
  impressions: number
  ctr?: number
}

export interface TrafficChartProps {
  data: TrafficDataPoint[]
  title?: string
  description?: string
}

export function TrafficChart({
  data,
  title = 'Traffic Metrics',
  description = 'Clicks and impressions over time',
}: TrafficChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No traffic data available for the selected date range
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
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid className="stroke-muted" strokeDasharray="3 3" />
            <XAxis
              className="text-xs"
              dataKey="date"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-xs"
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
              tick={{ fill: 'currentColor' }}
              yAxisId="count"
            />
            <YAxis
              className="text-xs"
              domain={[0, 100]}
              label={{ value: 'CTR %', angle: 90, position: 'insideRight' }}
              orientation="right"
              tick={{ fill: 'currentColor' }}
              yAxisId="ctr"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={(value: any, name: string) => {
                if (name === 'CTR') {
                  return [`${value}%`, name]
                }
                return [value.toLocaleString(), name]
              }}
            />
            <Legend />
            <Bar
              dataKey="clicks"
              fill="hsl(142 76% 36%)"
              name="Clicks"
              radius={[4, 4, 0, 0]}
              yAxisId="count"
            />
            <Bar
              dataKey="impressions"
              fill="hsl(221 83% 53%)"
              fillOpacity={0.6}
              name="Impressions"
              radius={[4, 4, 0, 0]}
              yAxisId="count"
            />
            {data.some(d => d.ctr !== undefined) && (
              <Line
                dataKey="ctr"
                dot={{ fill: 'hsl(var(--primary))' }}
                name="CTR"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                type="monotone"
                yAxisId="ctr"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
