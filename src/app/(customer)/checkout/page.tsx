'use client'

import { useState } from 'react'
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, tax, shipping: _shipping, total: _total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    shippingMethod: 'standard'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error('Your cart is empty')
      router.push('/cart')
      return
    }

    setIsProcessing(true)

    try {
      // Prepare checkout data
      const checkoutData = {
        cartItems: items,
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: 'US'
        },
        billingAddress: sameAsShipping ? null : {
          street: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zipCode: formData.billingZipCode,
          country: 'US'
        },
        shippingMethod: formData.shippingMethod,
        subtotal,
        tax,
        shipping: formData.shippingMethod === 'express' ? 25.00 : 10.00,
        total: subtotal + tax + (formData.shippingMethod === 'express' ? 25.00 : 10.00)
      }

      // Create Square checkout session
      const response = await fetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkoutData)
      })

      const result = await response.json()

      if (result.success && result.checkoutUrl) {
        // Store order info in session storage for success page
        sessionStorage.setItem('lastOrder', JSON.stringify({
          orderNumber: result.orderNumber,
          orderId: result.orderId,
          total: checkoutData.total
        }))

        // Clear cart
        clearCart()
        
        // Redirect to Square checkout
        window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process checkout. Please try again.')
      setIsProcessing(false)
    }
  }

  const shippingCost = formData.shippingMethod === 'express' ? 25.00 : 10.00
  const orderTotal = subtotal + tax + shippingCost

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add items to your cart before checking out
          </p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6" href="/cart">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    required
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      required
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      required
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    required
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    required
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      required
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      required
                      id="state"
                      maxLength={2}
                      name="state"
                      placeholder="TX"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    required
                    id="zipCode"
                    maxLength={10}
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Billing Address</h2>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={sameAsShipping}
                    id="sameAsShipping"
                    onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                  />
                  <Label className="text-sm font-normal cursor-pointer" htmlFor="sameAsShipping">
                    Same as shipping
                  </Label>
                </div>
              </div>
              
              {!sameAsShipping && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="billingAddress">Street Address</Label>
                    <Input
                      id="billingAddress"
                      name="billingAddress"
                      required={!sameAsShipping}
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        name="billingCity"
                        required={!sameAsShipping}
                        value={formData.billingCity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingState">State</Label>
                      <Input
                        id="billingState"
                        maxLength={2}
                        name="billingState"
                        placeholder="TX"
                        required={!sameAsShipping}
                        value={formData.billingState}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="billingZipCode">ZIP Code</Label>
                    <Input
                      id="billingZipCode"
                      maxLength={10}
                      name="billingZipCode"
                      required={!sameAsShipping}
                      value={formData.billingZipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Method */}
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
              <RadioGroup 
                value={formData.shippingMethod}
                onValueChange={(value) => setFormData({...formData, shippingMethod: value})}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="standard" value="standard" />
                      <Label className="cursor-pointer" htmlFor="standard">
                        <div>
                          <p className="font-medium">Standard Shipping</p>
                          <p className="text-sm text-muted-foreground">5-7 business days</p>
                        </div>
                      </Label>
                    </div>
                    <span className="font-medium">$10.00</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="express" value="express" />
                      <Label className="cursor-pointer" htmlFor="express">
                        <div>
                          <p className="font-medium">Express Shipping</p>
                          <p className="text-sm text-muted-foreground">2-3 business days</p>
                        </div>
                      </Label>
                    </div>
                    <span className="font-medium">$25.00</span>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mb-4 border-t pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 font-semibold">
                  <div className="flex justify-between text-lg">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full"
                disabled={isProcessing} 
                size="lg"
                type="submit"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay with Square
                  </>
                )}
              </Button>

              <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
                <Lock className="mr-1 h-4 w-4" />
                Secure checkout powered by Square
              </div>

              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                <p>By placing this order, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}