'use client'

import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  productName: string
  productId: string
  size: string
  paperType: string
  quantity: number
  finish: string
  price: number
  fileName: string
  turnaround: string
}

// Mock cart data - in production this would come from context/state management
const initialCartItems: CartItem[] = [
  {
    id: '1',
    productName: 'Business Cards',
    productId: '1',
    size: 'Standard (3.5" x 2")',
    paperType: '16pt Matte',
    quantity: 500,
    finish: 'UV Coating',
    price: 64.99,
    fileName: 'my-business-card.pdf',
    turnaround: '3-5 business days'
  },
  {
    id: '2',
    productName: 'Flyers',
    productId: '2',
    size: '8.5" x 11"',
    paperType: '100lb Text',
    quantity: 100,
    finish: 'Gloss Finish',
    price: 134.99,
    fileName: 'event-flyer.pdf',
    turnaround: '5-7 business days'
  }
]

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems)
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)

  const updateQuantity = (id: string, change: number) => {
    setCartItems(items =>
      items.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change)
          // Recalculate price based on quantity (simplified)
          const basePrice = item.price / item.quantity
          return { ...item, quantity: newQuantity, price: basePrice * newQuantity }
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const applyPromoCode = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(0.1) // 10% discount
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(0.2) // 20% discount
    } else {
      setDiscount(0)
      alert('Invalid promo code')
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const discountAmount = subtotal * discount
  const tax = (subtotal - discountAmount) * 0.0825 // 8.25% tax
  const total = subtotal - discountAmount + tax

  const handleCheckout = () => {
    // TODO: Implement checkout with Square
    console.log('Proceeding to checkout with items:', cartItems)
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
            <Button size="lg">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4" href="/products">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.productName}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Size: {item.size}</p>
                    <p>Paper: {item.paperType}</p>
                    <p>Finish: {item.finish}</p>
                    <p>File: {item.fileName}</p>
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
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    disabled={item.quantity <= 50}
                    size="icon"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, -50)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="w-20 text-center">
                    <span className="font-medium">{item.quantity}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, 50)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${item.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">
                    ${(item.price / item.quantity).toFixed(3)} each
                  </p>
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
              <div className="border-t pt-2 font-semibold">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-4">
              <Label className="text-sm mb-2 block" htmlFor="promo">Promo Code</Label>
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

            <Button 
              className="w-full"
              size="lg" 
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Secure checkout powered by Square
              </p>
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