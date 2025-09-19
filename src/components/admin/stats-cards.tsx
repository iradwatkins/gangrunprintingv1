'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  subtitle?: string
  icon?: React.ReactNode
  iconBg?: string
}

export function StatsCard({
  title,
  value,
  change,
  subtitle,
  icon,
  iconBg = 'bg-primary/10',
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className={cn('p-2 rounded-lg', iconBg)}>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {change !== undefined && (
            <span
              className={cn(
                'flex items-center gap-1',
                change > 0 ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change > 0 ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
              {Math.abs(change)}%
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
