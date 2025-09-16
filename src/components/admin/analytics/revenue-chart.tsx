'use client'

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
    orders: number
  }>
  showDetailedTooltip?: boolean
}

export function RevenueChart({ data, showDetailedTooltip = false }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{formatDate(label)}</p>
          <p className="text-sm text-blue-600">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          {showDetailedTooltip && (
            <p className="text-sm text-muted-foreground">
              Orders: {payload[0].payload.orders}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No revenue data available
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data}>
          <XAxis
            axisLine={false}
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={formatDate}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            activeDot={{
              r: 4,
              stroke: "hsl(var(--primary))",
              strokeWidth: 2,
              fill: "hsl(var(--background))"
            }}
            dataKey="revenue"
            dot={false}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}