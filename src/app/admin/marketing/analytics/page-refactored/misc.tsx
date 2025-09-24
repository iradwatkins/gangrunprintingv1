/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import {

'use client'

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
  BarChart3,
  TrendingUp,
  TrendingDown,
  Mail,
  Users,
  MousePointer,
  DollarSign,
  Calendar,
  Target,
  Zap,
  MessageSquare,
} from 'lucide-react'

interface AnalyticsData {
  campaigns: {
    total: number
    sent: number
    active: number
    deliveryRate: number
    openRate: number
    clickRate: number
  }
  workflows: {
    total: number
    active: number
    executions: number
    completionRate: number
  }
  segments: {
    total: number
    customers: number
  }
  performance: {
    revenue: number
    orders: number
    avgOrderValue: number
    conversionRate: number
  }
  trends: {
    period: string
    campaigns: number[]
    opens: number[]
    clicks: number[]
    revenue: number[]
  }
}
