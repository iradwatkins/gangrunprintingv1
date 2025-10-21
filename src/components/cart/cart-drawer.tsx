'use client'

import { useState } from 'react'
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context'
import { CartItemImages } from './cart-item-images'
import { ShippingPreview } from './shipping-preview'
import { FileThumbnails } from '../product/FileThumbnails'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from '@/lib/toast'

interface ShippingRate {
  provider: string
  providerName: string
  serviceType: string
  carrier: string
  rate: {
    amount: number
    currency: string
  }
  delivery: {
    estimatedDays: {
      min: number
      max: number
    }
    text: string
    guaranteed: boolean
  }
}

export function CartDrawer() {
  const router = useRouter()
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
  } = useCart()

  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null)

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Shopping Cart
            </span>
            {items.length > 0 && (
              <Button
                className="text-destructive hover:text-destructive"
                size="sm"
                variant="ghost"
                onClick={clearCart}
              >
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground text-center">
              Add products to your cart to see them here
            </p>
            <Button asChild onClick={closeCart}>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 mt-4" style={{ height: 'calc(100vh - 320px)' }}>
              <div className="space-y-4 pr-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <CartItemImages item={item} />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-sm">{item.productName}</h4>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {item.options.size && <p>Size: {item.options.size}</p>}
                          {item.options.paperStock && <p>Paper: {item.options.paperStock}</p>}
                          {item.options.coating && <p>Coating: {item.options.coating}</p>}
                          {item.options.sides && <p>Sides: {item.options.sides}</p>}
                          {item.fileName && <p>File: {item.fileName}</p>}
                        </div>
                        {/* Artwork Files */}
                        {item.artworkFiles && item.artworkFiles.length > 0 && (
                          <div className="mt-2">
                            <FileThumbnails files={item.artworkFiles} maxDisplay={3} size="sm" />
                          </div>
                        )}
                      </div>
                      <Button
                        className="h-8 w-8"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Qty: </span>
                        <span className="text-sm font-medium">{item.quantity}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {selectedShipping && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${selectedShipping.rate.amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (estimated)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>${((selectedShipping?.rate.amount || 0) + total).toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Preview Section - Moved above checkout button */}
              <div className="px-2">
                <ShippingPreview
                  cartItems={items}
                  selectedShipping={selectedShipping}
                  onShippingSelected={setSelectedShipping}
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (items.length === 0) {
                      toast.error('Your cart is empty')
                      return
                    }

                    // Store selected shipping for checkout
                    if (selectedShipping) {
                      localStorage.setItem('selected_shipping', JSON.stringify(selectedShipping))
                    }

                    closeCart()
                    router.push('/checkout')
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {items.length > 0 && items[0].productSlug && (
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/products/${items[0].productSlug}`} onClick={closeCart}>
                      Edit Product
                    </Link>
                  </Button>
                )}
              </div>

              {/* Trust Badge */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Secure checkout powered by Square
                </p>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
