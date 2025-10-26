'use client'

import { useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Package, Search, X } from 'lucide-react'
import { Link } from '@/lib/i18n/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrderCard } from './order-card'

interface Order {
  id: string
  orderNumber: string
  referenceNumber?: string | null
  status: string
  total: number
  subtotal: number
  tax: number
  shipping: number
  createdAt: string
  paidAt?: string | null
  OrderItem: Array<{
    id: string
    quantity: number
    productName: string
    productSku: string
  }>
}

interface OrdersListProps {
  orders: Order[]
  currentPage: number
  statusFilter: string
  searchQuery: string
  sortBy: string
  startDate?: string
  endDate?: string
  isBroker: boolean
}

const ORDERS_PER_PAGE = 20

// Order statuses
const ORDER_STATUSES = [
  { value: 'all', label: 'All Orders' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAYMENT_DECLINED', label: 'Payment Declined' },
  { value: 'CONFIRMATION', label: 'Confirmation' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
  { value: 'ON_THE_WAY', label: 'On the Way' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'REPRINT', label: 'Reprint' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
]

// Sort options
const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest First)' },
  { value: 'date_asc', label: 'Date (Oldest First)' },
  { value: 'amount_desc', label: 'Amount (High to Low)' },
  { value: 'amount_asc', label: 'Amount (Low to High)' },
  { value: 'status_asc', label: 'Status (A-Z)' },
]

export function OrdersList({
  orders,
  currentPage,
  statusFilter,
  searchQuery: initialSearchQuery,
  sortBy,
  startDate,
  endDate,
  isBroker,
}: OrdersListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchInput, setSearchInput] = useState(initialSearchQuery)

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders]

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter)
    }

    // Apply date range filter
    if (startDate || endDate) {
      result = result.filter((order) => {
        const orderDate = new Date(order.createdAt)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        if (start && orderDate < start) return false
        if (end && orderDate > end) return false
        return true
      })
    }

    // Apply search filter
    if (initialSearchQuery) {
      const query = initialSearchQuery.toLowerCase()
      result = result.filter((order) => {
        // Search in order number
        if (order.orderNumber.toLowerCase().includes(query)) return true
        if (order.referenceNumber?.toLowerCase().includes(query)) return true

        // Search in product names
        return order.OrderItem.some((item) => item.productName.toLowerCase().includes(query))
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'amount_desc':
          return b.total - a.total
        case 'amount_asc':
          return a.total - b.total
        case 'status_asc':
          return a.status.localeCompare(b.status)
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [orders, statusFilter, startDate, endDate, initialSearchQuery, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ORDERS_PER_PAGE)
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE
  const endIndex = startIndex + ORDERS_PER_PAGE
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, endIndex)

  // URL update helper
  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    updateURL({ status: value === 'all' ? undefined : value, page: '1' })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    updateURL({ sort: value, page: '1' })
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchInput(value)
    updateURL({ search: value || undefined, page: '1' })
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() })
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('')
    router.push(pathname)
  }

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || initialSearchQuery || startDate || endDate

  // Empty state
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="mb-4">You haven't placed any orders yet</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No results from filters
  if (filteredAndSortedOrders.length === 0 && hasActiveFilters) {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 pr-9"
              placeholder="Search by order number or product..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchInput && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => handleSearch('')}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* No results */}
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="mb-4">No orders match your filters</p>
              <Button onClick={clearFilters}>Reset Filters</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder="Search by order number or product..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchInput && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => handleSearch('')}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedOrders.length)} of{' '}
        {filteredAndSortedOrders.length} orders
      </div>

      {/* Order Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedOrders.map((order) => (
          <OrderCard key={order.id} isBroker={isBroker} order={order} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            disabled={currentPage === 1}
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  size="sm"
                  variant={page === currentPage ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page}>...</span>
            }
            return null
          })}

          <Button
            disabled={currentPage === totalPages}
            size="sm"
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
