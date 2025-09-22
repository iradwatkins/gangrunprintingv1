/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
import { AnalyticsService, type DateRange } from '@/lib/admin/analytics'
import { RevenueChart } from '@/components/admin/analytics/revenue-chart'
import { OrderStatusChart } from '@/components/admin/analytics/order-status-chart'
import { CustomerInsightsChart } from '@/components/admin/analytics/customer-insights-chart'
import { ProductPerformanceChart } from '@/components/admin/analytics/product-performance-chart'
import { TopCustomersTable } from '@/components/admin/analytics/top-customers-table'
import { TopProductsTable } from '@/components/admin/analytics/top-products-table'


  CalendarDays,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  Download,
  Filter,
} from 'lucide-react'
