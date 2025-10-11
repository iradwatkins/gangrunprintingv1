'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, DollarSign, Eye, Rocket } from 'lucide-react'

interface FunnelStatsProps {
  stats: {
    totalFunnels: number
    activeFunnels: number
    totalViews: number
    totalRevenue: number
  }
}

export function FunnelStats({ stats }: FunnelStatsProps) {
  const cards = [
    {
      title: 'Total Funnels',
      value: stats.totalFunnels,
      icon: Rocket,
      description: `${stats.activeFunnels} active`,
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      description: 'All time',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: 'All time',
    },
    {
      title: 'Avg Conversion',
      value:
        stats.totalViews > 0
          ? `${((stats.totalRevenue / stats.totalViews) * 100).toFixed(2)}%`
          : '0%',
      icon: BarChart3,
      description: 'Overall',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
