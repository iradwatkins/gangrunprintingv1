import Link from 'next/link'
import { StatsCard } from '@/components/admin/stats-cards'
import { PrintQueueTable } from '@/components/admin/print-queue-table'
import { GangRunSchedule } from '@/components/admin/gang-run-schedule'
import { ProductionChart } from '@/components/admin/production-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Printer,
  Layers,
  Clock,
  DollarSign,
  Package,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function GangRunDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Gang Run Printing Dashboard
        </h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Print Shop Specific Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          change={18.2}
          icon={<DollarSign className="h-4 w-4" />}
          iconBg="bg-primary/10"
          title="Today's Revenue"
          value="$12,435"
        />
        <StatsCard
          icon={<Printer className="h-4 w-4" />}
          iconBg="bg-accent/10"
          subtitle="12 urgent"
          title="Jobs in Queue"
          value="47"
        />
        <StatsCard
          icon={<Layers className="h-4 w-4" />}
          iconBg="bg-secondary/10"
          subtitle="3 scheduled"
          title="Gang Runs Today"
          value="8"
        />
        <StatsCard
          change={3.1}
          icon={<CheckCircle className="h-4 w-4" />}
          iconBg="bg-chart-1/10"
          title="Completion Rate"
          value="94%"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Link href="/admin/paper-stocks">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Material Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage material types, coatings, and sides options
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/products">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure products and assign material types
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage customer orders and production
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Production Overview */}
      <div className="grid gap-4 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <ProductionChart />
        </div>
        <div className="lg:col-span-3">
          <GangRunSchedule />
        </div>
      </div>

      {/* Active Print Queue */}
      <PrintQueueTable />

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Production Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertDescription>
                Low stock alert: 100lb Gloss Cover - Only 500 sheets remaining
              </AlertDescription>
            </Alert>
            <Alert>
              <AlertDescription>
                Maintenance scheduled: Digital Press #2 - Tomorrow 6:00 AM
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}