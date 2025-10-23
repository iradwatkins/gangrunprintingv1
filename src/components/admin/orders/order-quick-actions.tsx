/**
 * Order Quick Actions Component
 *
 * Provides quick status updates, payment capture, and invoice generation
 * from the admin dashboard
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  DollarSign,
  FileText,
  Mail,
  MoreVertical,
  RefreshCw,
  Send,
  Trash2,
  Truck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Order {
  id: string
  orderNumber: string
  status: string
  email: string
  total: number
  vendorId?: string | null
}

interface OrderQuickActionsProps {
  order: Order
  onUpdate?: () => void
}

export function OrderQuickActions({ order, onUpdate }: OrderQuickActionsProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Default to page reload if no onUpdate provided
  const handleUpdate = onUpdate || (() => window.location.reload())
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [shippingDialogOpen, setShippingDialogOpen] = useState(false)

  const [newStatus, setNewStatus] = useState(order.status)
  const [statusNotes, setStatusNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  const [paymentAmount, setPaymentAmount] = useState(order.total / 100)
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')

  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('FEDEX')

  /**
   * Update order status
   */
  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toStatus: newStatus,
          notes: statusNotes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Status update failed')
      }

      toast.success(`Order status updated to ${newStatus}`)
      setStatusDialogOpen(false)
      handleUpdate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  /**
   * Capture payment manually (for phone/in-person orders)
   */
  const handlePaymentCapture = async () => {
    setUpdating(true)
    try {
      // TODO: Integrate with Square Terminal API or manual entry
      const response = await fetch(`/api/admin/orders/${order.id}/capture-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: paymentAmount * 100,
          method: paymentMethod,
        }),
      })

      if (!response.ok) throw new Error('Payment capture failed')

      toast.success('Payment captured successfully')
      setPaymentDialogOpen(false)
      handleUpdate()
    } catch (error) {
      toast.error('Failed to capture payment')
    } finally {
      setUpdating(false)
    }
  }

  /**
   * Generate and send invoice
   */
  const handleSendInvoice = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/send-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to send invoice')

      const data = await response.json()
      toast.success(`Invoice sent to ${order.email}`)
      setInvoiceDialogOpen(false)
      handleUpdate()

      // Open payment link in new tab
      if (data.paymentUrl) {
        window.open(data.paymentUrl, '_blank')
      }
    } catch (error) {
      toast.error('Failed to send invoice')
    } finally {
      setUpdating(false)
    }
  }

  /**
   * Update shipping info
   */
  const handleShippingUpdate = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/shipping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          carrier,
        }),
      })

      if (!response.ok) throw new Error('Failed to update shipping')

      toast.success('Shipping info updated')
      setShippingDialogOpen(false)
      handleUpdate()
    } catch (error) {
      toast.error('Failed to update shipping')
    } finally {
      setUpdating(false)
    }
  }

  /**
   * Delete order
   */
  const handleDeleteOrder = async () => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/delete`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete order')
      }

      toast.success('Order deleted successfully', {
        description: `Order ${order.orderNumber} and ${data.filesDeleted} associated files have been deleted.`,
      })

      setDeleteDialogOpen(false)
      handleUpdate()
    } catch (error) {
      console.error('Error deleting order:', error)
      toast.error('Failed to delete order', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Status
          </DropdownMenuItem>

          {order.status === 'PENDING_PAYMENT' && (
            <>
              <DropdownMenuItem onClick={() => setPaymentDialogOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Capture Payment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setInvoiceDialogOpen(true)}>
                <FileText className="mr-2 h-4 w-4" />
                Send Invoice
              </DropdownMenuItem>
            </>
          )}

          {order.status === 'PRODUCTION' && (
            <DropdownMenuItem onClick={() => setShippingDialogOpen(true)}>
              <Truck className="mr-2 h-4 w-4" />
              Add Shipping Info
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => window.open(`/admin/orders/${order.id}`, '_blank')}>
            <Mail className="mr-2 h-4 w-4" />
            View Full Order
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status for order {order.orderNumber}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMATION">Confirmation</SelectItem>
                  <SelectItem value="PRODUCTION">Production</SelectItem>
                  <SelectItem value="SHIPPED">Shipped</SelectItem>
                  <SelectItem value="READY_FOR_PICKUP">Ready for Pickup</SelectItem>
                  <SelectItem value="ON_THE_WAY">On the Way</SelectItem>
                  <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={updating} onClick={handleStatusUpdate}>
              {updating ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Capture Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture Payment</DialogTitle>
            <DialogDescription>Record payment for order {order.orderNumber}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                step="0.01"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="WIRE_TRANSFER">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={updating} onClick={handlePaymentCapture}>
              {updating ? 'Processing...' : 'Capture Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
            <DialogDescription>Send a payment invoice to {order.email}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will generate an invoice and send it to the customer with a payment link.
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Order:</strong> {order.orderNumber}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> ${(order.total / 100).toFixed(2)}
              </p>
              <p className="text-sm">
                <strong>Send to:</strong> {order.email}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={updating} onClick={handleSendInvoice}>
              <Send className="mr-2 h-4 w-4" />
              {updating ? 'Sending...' : 'Send Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shipping Info Dialog */}
      <Dialog open={shippingDialogOpen} onOpenChange={setShippingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shipping Information</DialogTitle>
            <DialogDescription>
              Enter tracking information for order {order.orderNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger id="carrier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEDEX">FedEx</SelectItem>
                  <SelectItem value="UPS">UPS</SelectItem>
                  <SelectItem value="SOUTHWEST_CARGO">Southwest Cargo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking">Tracking Number</Label>
              <Input
                id="tracking"
                placeholder="1234567890"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShippingDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={updating} onClick={handleShippingUpdate}>
              {updating ? 'Updating...' : 'Update Shipping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete order {order.orderNumber}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                ⚠️ This action cannot be undone
              </p>
              <p className="text-sm text-muted-foreground mt-2">This will permanently delete:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Order record and all order items</li>
                <li>All uploaded files from MinIO storage</li>
                <li>Payment and shipping information</li>
                <li>Order history and status updates</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={updating}
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={updating} variant="destructive" onClick={handleDeleteOrder}>
              <Trash2 className="mr-2 h-4 w-4" />
              {updating ? 'Deleting...' : 'Delete Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
