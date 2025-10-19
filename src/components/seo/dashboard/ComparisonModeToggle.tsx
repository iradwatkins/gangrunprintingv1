/**
 * Comparison Mode Toggle Component
 *
 * Allows toggling between current period and period-over-period comparison.
 */

'use client'

import { TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface ComparisonModeToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function ComparisonModeToggle({ enabled, onChange }: ComparisonModeToggleProps) {
  return (
    <Button
      variant={enabled ? 'default' : 'outline'}
      onClick={() => onChange(!enabled)}
    >
      <TrendingUp className="mr-2 h-4 w-4" />
      Compare Periods
      {enabled && <Badge variant="secondary" className="ml-2">Active</Badge>}
    </Button>
  )
}
