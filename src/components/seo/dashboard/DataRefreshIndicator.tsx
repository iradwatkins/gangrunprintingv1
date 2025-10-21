/**
 * Data Refresh Indicator Component
 *
 * Shows last update time and provides manual refresh button.
 */

'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTimeAgo } from '@/hooks/use-seo-realtime'

export interface DataRefreshIndicatorProps {
  lastUpdate: Date | null
  onRefresh: () => void
  isLoading?: boolean
}

export function DataRefreshIndicator({
  lastUpdate,
  onRefresh,
  isLoading = false,
}: DataRefreshIndicatorProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Last updated: {formatTimeAgo(lastUpdate)}</span>
      </div>
      <Button
        disabled={isLoading}
        size="sm"
        variant="ghost"
        onClick={onRefresh}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
