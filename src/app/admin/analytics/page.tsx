/**
 * page - Refactored Entry Point
 * Original: 507 lines
 * Refactored: Multiple modules < 300 lines each
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

// Re-export refactored modules
export * from './page-refactored/misc';
export * from './page-refactored/utils';

// Main export (if component file)
import MainComponent from './page-refactored/component';
export default MainComponent;
