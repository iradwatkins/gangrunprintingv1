'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Loader2,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  AlertTriangle,
} from 'lucide-react'
import Image from 'next/image'

interface ReorderItem {
  id: string
  productId?: string
  productName: string
  productSlug?: string
  productSku: string
  quantity: number
  originalPrice: number
  currentPrice?: number
  priceChanged?: boolean
  available: boolean
  reason?: string
  image?: string | null
  options?: Record<string, any>
}

interface ReorderData {
  success: boolean
  order: {
    id: string
    orderNumber: string
    createdAt: string
    originalTotal: number
  }
  items: ReorderItem[]
  summary: {
    totalItems: number
    availableItems: number
    unavailableItems: number
    currentTotal: number
    originalTotal: number
    priceChanged: boolean
  }
}

interface ReorderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  orderNumber: string
}

export function ReorderModal({ open, onOpenChange, orderId, orderNumber }: ReorderModalProps) {
  const router = useRouter()
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reorderData, setReorderData] = useState<ReorderData | null>(null)

  // Fetch reorder data when modal opens
  useEffect(() => {
    if (open && !reorderData) {
      fetchReorderData()
    }
  }, [open, orderId])

  const fetchReorderData = async () => {
    setFetching(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/reorder`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load order data')
      }

      setReorderData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order data')
    } finally {
      setFetching(false)
    }
  }

  const handleReorderProduct = (item: ReorderItem) => {
    // Redirect to product page to configure and add to cart
    if (item.productSlug) {
      router.push(`/products/${item.productSlug}`)
      onOpenChange(false)
    }
  }

  const availableItems = reorderData?.items.filter((item) => item.available) || []
  const unavailableItems = reorderData?.items.filter((item) => !item.available) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Re-Order #{orderNumber}</DialogTitle>
          <DialogDescription>Review items from your original order</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading order data...</span>
          </div>
        )}

        {!fetching && reorderData && (
          <div className="space-y-4">
            {/* Summary Alert */}
            {reorderData.summary.unavailableItems > 0 && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {reorderData.summary.unavailableItems} of {reorderData.summary.totalItems} items
                  are no longer available
                </AlertDescription>
              </Alert>
            )}

            {/* Available Items */}
            {availableItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Available Items ({availableItems.length})
                </h4>
                {availableItems.map((item) => (
                  <Card key={item.id} className="border-green-200">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {item.image ? (
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image
                              fill
                              alt={item.productName}
                              className="object-cover rounded"
                              src={item.image}
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 flex-shrink-0 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">{item.productName}</h5>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} • $
                            {(item.currentPrice || item.originalPrice).toFixed(2)} each
                          </p>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            Total: $
                            {((item.currentPrice || item.originalPrice) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Button size="sm" onClick={() => handleReorderProduct(item)}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Unavailable Items */}
            {unavailableItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Unavailable Items ({unavailableItems.length})
                </h4>
                {unavailableItems.map((item) => (
                  <Card key={item.id} className="border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="h-16 w-16 flex-shrink-0 bg-muted rounded flex items-center justify-center opacity-50">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-muted-foreground">{item.productName}</h5>
                          <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          <Badge className="mt-1" variant="destructive">
                            {item.reason}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Info Note */}
            {availableItems.length > 1 && (
              <Alert className="border-blue-500 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click "Reorder" on each item to configure and add it to your cart.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
