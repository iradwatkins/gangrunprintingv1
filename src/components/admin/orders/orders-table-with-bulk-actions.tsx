'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Download, FileArchive } from 'lucide-react'
import Link from 'next/link'
import { OrderQuickActions } from './order-quick-actions'
import { OrderStatusDropdown } from './order-status-dropdown'
import { BulkActionsBar } from './bulk-actions-bar'

interface Order {
  id: string
  orderNumber: string
  email: string | null
  phone: string | null
  total: number
  subtotal: number
  status: string
  createdAt: Date
  trackingNumber: string | null
  carrier: string | null
  OrderItem: Array<{
    productName: string
  }>
  File: Array<{
    fileUrl: string | null
    filename: string
  }>
  _count: {
    OrderItem: number
  }
}

interface OrdersTableWithBulkActionsProps {
  orders: Order[]
  searchQuery: string
  statusFilter: string
}

export function OrdersTableWithBulkActions({
  orders,
  searchQuery,
  statusFilter,
}: OrdersTableWithBulkActionsProps) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const allOrderIds = orders.map((o) => o.id)
  const isAllSelected = allOrderIds.length > 0 && selectedOrderIds.length === allOrderIds.length
  const isSomeSelected = selectedOrderIds.length > 0 && selectedOrderIds.length < allOrderIds.length

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(allOrderIds)
    } else {
      setSelectedOrderIds([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrderIds((prev) => [...prev, orderId])
    } else {
      setSelectedOrderIds((prev) => prev.filter((id) => id !== orderId))
    }
  }

  const handleClearSelection = () => {
    setSelectedOrderIds([])
  }

  const handleSuccess = () => {
    // Force refresh by incrementing key
    setRefreshKey((prev) => prev + 1)
    // In a real scenario, you'd re-fetch data here or use router.refresh()
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  className="ml-2"
                  indeterminate={isSomeSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Uploads</TableHead>
              <TableHead>Tracking Number</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8" colSpan={9}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'No orders found matching your filters'
                    : 'No orders yet. Orders will appear here when customers place them.'}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                // Get customer files for uploads column
                const customerFiles = order.File || []

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedOrderIds.includes(order.id)}
                        className="ml-2"
                        onCheckedChange={(checked) =>
                          handleSelectOrder(order.id, checked as boolean)
                        }
                      />
                    </TableCell>

                    {/* Order */}
                    <TableCell className="font-medium">
                      <Link
                        className="hover:underline text-blue-600"
                        href={`/admin/orders/${order.id}`}
                      >
                        {order.orderNumber}
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1">
                        {order.email && (
                          <a
                            className="hover:underline text-blue-600"
                            href={`mailto:${order.email}`}
                          >
                            {order.email}
                          </a>
                        )}
                        {order.phone && (
                          <>
                            <br />
                            <a
                              className="hover:underline text-green-600"
                              href={`tel:${order.phone}`}
                            >
                              {order.phone}
                            </a>
                          </>
                        )}
                      </div>
                    </TableCell>

                    {/* Date */}
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

                    {/* Status */}
                    <TableCell>
                      <OrderStatusDropdown
                        currentStatus={order.status}
                        orderId={order.id}
                        onStatusChange={() => setRefreshKey((prev) => prev + 1)}
                      />
                    </TableCell>

                    {/* Total Spent (subtotal before tax/shipping) */}
                    <TableCell className="font-medium">${order.subtotal.toFixed(2)}</TableCell>

                    {/* Total (final amount) */}
                    <TableCell className="font-bold">${order.total.toFixed(2)}</TableCell>

                    {/* Uploads (customer files) */}
                    <TableCell>
                      {customerFiles.length > 0 ? (
                        <Button
                          asChild
                          className="h-7 px-2 gap-1 cursor-pointer"
                          size="sm"
                          variant="outline"
                        >
                          <a
                            download
                            href={`/api/admin/orders/${order.id}/download-files`}
                            title={`Download ${customerFiles.length} file${customerFiles.length > 1 ? 's' : ''}`}
                          >
                            <FileArchive className="h-3 w-3" />
                            {customerFiles.length} {customerFiles.length === 1 ? 'file' : 'files'}
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No files</span>
                      )}
                    </TableCell>

                    {/* Tracking Number (editable, clickable to FedEx) */}
                    <TableCell>
                      {order.trackingNumber ? (
                        <a
                          className="text-sm text-blue-600 hover:underline font-mono"
                          href={`https://www.fedex.com/fedextrack/?trknbr=${order.trackingNumber}`}
                          rel="noopener noreferrer"
                          target="_blank"
                          title="Track on FedEx"
                        >
                          {order.trackingNumber}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Origin (traffic source) */}
                    <TableCell>
                      <span className="text-xs">{order.carrier || 'Direct'}</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          className="inline-flex items-center justify-center h-9 px-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                          href={`/admin/orders/${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <OrderQuickActions order={order} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <BulkActionsBar
        selectedOrderIds={selectedOrderIds}
        onClearSelection={handleClearSelection}
        onSuccess={handleSuccess}
      />
    </>
  )
}
