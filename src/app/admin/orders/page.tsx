import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Status configuration with colors and icons
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock,
  },
  PAID: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: DollarSign,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    icon: Package,
  },
  PRINTING: {
    label: 'Printing',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    icon: Package,
  },
  QUALITY_CHECK: {
    label: 'Quality Check',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
    icon: CheckCircle,
  },
  PACKAGING: {
    label: 'Packaging',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: XCircle,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: AlertCircle,
  },
}

interface OrdersPageProps {
  searchParams?: Promise<{
    page?: string
    status?: string
    search?: string
  }>
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const pageSize = 20
  const statusFilter = params?.status || 'all'
  const searchQuery = params?.search || ''

  // Build where clause for filtering
  const where: any = {}

  if (statusFilter !== 'all') {
    where.status = statusFilter
  }

  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: 'insensitive' } },
      { user: { email: { contains: searchQuery, mode: 'insensitive' } } },
      { user: { name: { contains: searchQuery, mode: 'insensitive' } } },
    ]
  }

  // Get orders with pagination
  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        OrderItem: true,
        _count: {
          select: {
            OrderItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  // Get order statistics
  const stats = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })

  const statsMap = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate total revenue from delivered orders
  const revenue = await prisma.order.aggregate({
    where: {
      status: 'DELIVERED',
    },
    _sum: {
      total: true,
    },
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-2">Manage and track all printing orders</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(statsMap['PENDING_PAYMENT'] || 0) +
                (statsMap['PAID'] || 0) +
                (statsMap['PROCESSING'] || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Orders in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsMap['DELIVERED'] || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {((revenue._sum.total || 0) / 100).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>A list of all orders including their status and details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <form>
                <Input
                  className="pl-10"
                  defaultValue={searchQuery}
                  name="search"
                  placeholder="Search by order number, customer name or email..."
                  type="text"
                />
              </form>
            </div>
            <form>
              <Select defaultValue={statusFilter} name="status">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </form>
            <Button disabled variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
            <Button disabled variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Orders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center py-8" colSpan={7}>
                      {searchQuery || statusFilter !== 'all'
                        ? 'No orders found matching your filters'
                        : 'No orders yet. Orders will appear here when customers place them.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.PENDING_PAYMENT
                    const StatusIcon = status.icon

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link className="hover:underline" href={`/admin/orders/${order.id}`}>
                            {order.orderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.user?.name || 'Guest'}</p>
                            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order._count.OrderItem} items</p>
                            {order.OrderItem[0] && (
                              <p className="text-sm text-muted-foreground">
                                {order.OrderItem[0].product?.name}
                                {order.OrderItem.length > 1 &&
                                  ` +${order.OrderItem.length - 1} more`}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${(order.total / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{' '}
                {totalCount} orders
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/orders?page=${Math.max(1, page - 1)}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                >
                  <Button disabled={page <= 1} size="sm" variant="outline">
                    Previous
                  </Button>
                </Link>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = page <= 3 ? i + 1 : page + i - 2
                    if (pageNum > totalPages) return null
                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/orders?page=${pageNum}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                      >
                        <Button size="sm" variant={pageNum === page ? 'default' : 'outline'}>
                          {pageNum}
                        </Button>
                      </Link>
                    )
                  })}
                </div>
                <Link
                  href={`/admin/orders?page=${Math.min(totalPages, page + 1)}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`}
                >
                  <Button disabled={page >= totalPages} size="sm" variant="outline">
                    Next
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
