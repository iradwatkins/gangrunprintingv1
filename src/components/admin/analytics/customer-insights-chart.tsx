'use client'

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface CustomerInsightsChartProps {
  newCustomers: number
  returningCustomers: number
  totalCustomers: number
}

export function CustomerInsightsChart({
  newCustomers,
  returningCustomers,
  totalCustomers
}: CustomerInsightsChartProps) {
  const data = [
    {
      category: 'New Customers',
      count: newCustomers,
      percentage: totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0
    },
    {
      category: 'Returning Customers',
      count: returningCustomers,
      percentage: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0
    },
    {
      category: 'Single Purchase',
      count: totalCustomers - returningCustomers,
      percentage: totalCustomers > 0 ? ((totalCustomers - returningCustomers) / totalCustomers) * 100 : 0
    }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Count: {data.count}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600">{newCustomers}</p>
          <p className="text-sm text-muted-foreground">New This Month</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600">{returningCustomers}</p>
          <p className="text-sm text-muted-foreground">Returning</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{totalCustomers}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}