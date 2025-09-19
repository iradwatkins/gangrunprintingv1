'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import Image from 'next/image'
import toast from '@/lib/toast'

export default function CartPage() {
  const router = useRouter()
  const {
    items: cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    tax,
    shipping,
    total,
  } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(0.1)
      toast.success('Promo code applied: 10% off')
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(0.2)
      toast.success('Promo code applied: 20% off')
    } else {
      setDiscount(0)
      toast.error('Invalid promo code')
    }
  }

  const discountAmount = subtotal * discount
  const finalTotal = total - discountAmount

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    router.push('/checkout')
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some products to get started with your order
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
          href="/products"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          {cartItems.length > 0 && (
            <Button
              className="text-destructive hover:text-destructive"
              size="sm"
              variant="ghost"
              onClick={clearCart}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex gap-4">
                {item.image && (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                    <Image fill alt={item.productName} className="object-cover" src={item.image} />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.productName}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {item.options.size && <p>Size: {item.options.size}</p>}
                    {item.options.paperStock && <p>Paper: {item.options.paperStock}</p>}
                    {item.options.coating && <p>Coating: {item.options.coating}</p>}
                    {item.options.sides && <p>Sides: {item.options.sides}</p>}
                    {item.fileName && <p>File: {item.fileName}</p>}
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {item.turnaround}
                  </Badge>
                </div>
                <Button
                  className="text-destructive hover:text-destructive"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    disabled={item.quantity <= 1}
                    size="icon"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-20 text-center">
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${item.subtotal.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 font-semibold">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-4">
              <Label className="text-sm mb-2 block" htmlFor="promo">
                Promo Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="promo"
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button variant="outline" onClick={applyPromoCode}>
                  Apply
                </Button>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Secure checkout powered by Square</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 border rounded-lg p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Why choose us?</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ 100% Satisfaction Guarantee</li>
              <li>✓ Free Design Review</li>
              <li>✓ Fast Turnaround Times</li>
              <li>✓ Secure Payment Processing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
