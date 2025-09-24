import { MAX_FILE_SIZE, TAX_RATE, DEFAULT_WAREHOUSE_ZIP } from '@/lib/constants'
/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShippingRates } from '@/components/checkout/shipping-rates'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import { cn } from '@/lib/utils'

'use client'

  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Image as ImageIcon,
  User,
  Truck,
  Shield,
  Check,
  ChevronRight,
  Package2,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText
} from 'lucide-react'

interface UploadedImage {
  id: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

// Checkout step types
type CheckoutStep = 'information' | 'shipping' | 'payment' | 'review'

const STEPS: { id: CheckoutStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'information', label: 'Information', icon: User },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Check }
]

function CheckoutPageContent() {
  const router = useRouter()
  const { items, subtotal, tax, shipping: _shipping, total: _total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information')
  const [_selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [selectedShippingRate, setSelectedShippingRate] = useState<{
    carrier: string
    serviceName: string
    rateAmount: number
    estimatedDays?: number
    transitDays?: number
    isAirportDelivery?: boolean
  } | null>(null)
  const [selectedAirportId, setSelectedAirportId] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set())
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
  })

  // Square configuration (these should come from environment variables)
  const SQUARE_APPLICATION_ID =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-YOUR_APP_ID'
  const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'YOUR_LOCATION_ID'

  // Get the single item (since we're doing one product at a time)
  const currentItem = items.length > 0 ? items[0] : null

  // Fetch uploaded images for the current item
  useEffect(() => {
    const fetchUploadedImages = async () => {
      if (!currentItem) return

      try {
        // First check if there are images in sessionStorage from upload
        const storedImages = sessionStorage.getItem(`uploaded_images_${currentItem.productId}`)
        if (storedImages) {
          setUploadedImages(JSON.parse(storedImages))
          return
        }

        // Otherwise fetch from API
        if (currentItem.fileUrl) {
          setUploadedImages([{
            id: '1',
            url: currentItem.fileUrl,
            thumbnailUrl: currentItem.fileUrl,
            fileName: currentItem.fileName || 'Uploaded Design',
            fileSize: currentItem.fileSize || 0,
            uploadedAt: new Date().toISOString()
          }])
        }
      } catch (error) {
        }
    }

    fetchUploadedImages()
  }, [currentItem])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleNextStep = () => {
    const stepIndex = STEPS.findIndex(s => s.id === currentStep)
    if (stepIndex < STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(STEPS[stepIndex + 1].id)
    }
  }

  const handlePreviousStep = () => {
    const stepIndex = STEPS.findIndex(s => s.id === currentStep)
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id)
    }
  }

  const validateInformation = () => {
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode
    ) {
      toast.error('Please fill in all required fields')
      return false
    }
    return true
  }

  const validateShipping = () => {
    if (!selectedShippingRate) {
      toast.error('Please select a shipping method')
      return false
    }
    return true
  }

  const handleStepSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()

    switch (currentStep) {
      case 'information':
        if (validateInformation()) {
          handleNextStep()
        }
        break
      case 'shipping':
        if (validateShipping()) {
          handleNextStep()
        }
        break
      case 'payment':
        handleNextStep()
        break
      case 'review':
        // Process the order
        break
    }
  }

  const handlePaymentMethodSelect = async (method: string) => {
    setSelectedPaymentMethod(method)
    // In the new flow, we'll handle payment at the review step
    handleNextStep()
  }

  const processPayment = async () => {
    setIsProcessing(true)

    try {
      if (_selectedPaymentMethod === 'square') {
        await processSquareCheckout()
      } else {
        toast.error(`${_selectedPaymentMethod} payment is coming soon!`)
        setIsProcessing(false)
      }
    } catch (error) {

      toast.error('Failed to process payment. Please try again.')
      setIsProcessing(false)
    }
  }

  const processSquareCheckout = async () => {
    try {
      const checkoutData = createCheckoutData()

      const response = await fetch('/api/checkout/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.checkoutUrl) {
        sessionStorage.setItem(
          'lastOrder',
          JSON.stringify({
            orderNumber: result.orderNumber,
            orderId: result.orderId,
            total: checkoutData.total,
            items: checkoutData.cartItems,
            uploadedImages: checkoutData.uploadedImages,
            customerInfo: checkoutData.customerInfo,
            shippingAddress: checkoutData.shippingAddress,
            subtotal: checkoutData.subtotal,
            tax: checkoutData.tax,
            shipping: checkoutData.shipping,
          })
        )

        clearCart()
        window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.error || 'Failed to create checkout session')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process checkout'
      toast.error(errorMessage)
      throw error
    }
  }

  const createCheckoutData = () => {
    const shippingCost = selectedShippingRate?.rateAmount || 0
    const total = subtotal + tax + shippingCost

    return {
      cartItems: items,
      uploadedImages: uploadedImages,
      customerInfo: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        phone: formData.phone,
      },
      shippingAddress: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: 'US',
      },
      billingAddress: sameAsShipping
        ? null
        : {
            street: formData.billingAddress,
            city: formData.billingCity,
            state: formData.billingState,
            zipCode: formData.billingZipCode,
            country: 'US',
          },
      shippingRate: selectedShippingRate,
      selectedAirportId,
      subtotal,
      tax,
      shipping: shippingCost,
      total,
    }
  }

  const handleCardPaymentSuccess = (result: {
    paymentId?: string
    orderId?: string
    orderNumber?: string
  }) => {
    toast.success('Payment processed successfully!')

    // Store success info
    const checkoutData = createCheckoutData()
    sessionStorage.setItem(
      'lastOrder',
      JSON.stringify({
        orderNumber: result.orderNumber || `GRP-${Date.now()}`,
        orderId: result.orderId || result.paymentId,
        total: orderTotal,
        items: checkoutData.cartItems,
        uploadedImages: checkoutData.uploadedImages,
        customerInfo: checkoutData.customerInfo,
        shippingAddress: checkoutData.shippingAddress,
        subtotal: checkoutData.subtotal,
        tax: checkoutData.tax,
        shipping: checkoutData.shipping,
      })
    )

    clearCart()
    router.push('/checkout/success')
  }

  const handleCardPaymentError = (error: string) => {
    toast.error(error)
    setIsProcessing(false)
  }

  const shippingCost = selectedShippingRate?.rateAmount || 0
  const orderTotal = subtotal + tax + shippingCost

  if (!currentItem) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No product selected</h1>
          <p className="text-muted-foreground mb-8">Please select a product to order</p>
          <Link href="/products">
            <Button size="lg">Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            href="/products"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = completedSteps.has(step.id)
              const stepIndex = STEPS.findIndex(s => s.id === step.id)
              const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
              const isAccessible = stepIndex <= currentStepIndex || isCompleted

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    className="flex items-center focus:outline-none"
                    disabled={!isAccessible}
                    onClick={() => isAccessible && setCurrentStep(step.id)}
                  >
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                      isActive && "bg-primary text-white",
                      isCompleted && !isActive && "bg-green-500 text-white",
                      !isActive && !isCompleted && "bg-gray-200 text-gray-500"
                    )}>
                      {isCompleted && !isActive ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      "ml-3 font-medium hidden md:inline-block",
                      isActive && "text-primary",
                      isCompleted && "text-green-600",
                      !isActive && !isCompleted && "text-gray-500"
                    )}>
                      {step.label}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="mx-4 h-5 w-5 text-gray-400" />

                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form Steps */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Step 1: Customer Information */}
                {currentStep === 'information' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Customer Information</h2>
                      <p className="text-sm text-gray-600">Please provide your contact details and shipping address</p>
                    </div>

                    {/* Contact Section */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium">Contact Details</h3>
                      </div>
                      <div className="space-y-4 pl-7">
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium mb-1.5">Email Address *</Label>
                          <Input
                            required
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            className="h-11"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName" className="text-sm font-medium mb-1.5">First Name *</Label>
                            <Input
                              required
                              id="firstName"
                              name="firstName"
                              placeholder="John"
                              className="h-11"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName" className="text-sm font-medium mb-1.5">Last Name *</Label>
                            <Input
                              required
                              id="lastName"
                              name="lastName"
                              placeholder="Doe"
                              className="h-11"
                              value={formData.lastName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone" className="text-sm font-medium mb-1.5">Phone Number *</Label>
                            <Input
                              required
                              id="phone"
                              name="phone"
                              type="tel"
                              placeholder="(555) 123-4567"
                              className="h-11"
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="company" className="text-sm font-medium mb-1.5">Company (Optional)</Label>
                            <Input
                              id="company"
                              name="company"
                              placeholder="ACME Corp"
                              className="h-11"
                              value={formData.company}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address Section */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium">Shipping Address</h3>
                      </div>
                      <div className="space-y-4 pl-7">
                        <div>
                          <Label htmlFor="address" className="text-sm font-medium mb-1.5">Street Address *</Label>
                          <Input
                            required
                            id="address"
                            name="address"
                            placeholder="123 Main Street"
                            className="h-11"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <Label htmlFor="city" className="text-sm font-medium mb-1.5">City *</Label>
                            <Input
                              required
                              id="city"
                              name="city"
                              placeholder="Dallas"
                              className="h-11"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state" className="text-sm font-medium mb-1.5">State *</Label>
                            <Input
                              required
                              id="state"
                              maxLength={2}
                              name="state"
                              placeholder="TX"
                              className="h-11"
                              value={formData.state}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode" className="text-sm font-medium mb-1.5">ZIP Code *</Label>
                            <Input
                              required
                              id="zipCode"
                              maxLength={10}
                              name="zipCode"
                              placeholder=DEFAULT_WAREHOUSE_ZIP
                              className="h-11"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-end pt-6 border-t">
                      <Button
                        type="button"
                        size="lg"
                        className="min-w-[200px]"
                        onClick={handleStepSubmit}
                      >
                        Continue to Shipping
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping */}
                {currentStep === 'shipping' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Shipping Method</h2>
                      <p className="text-sm text-gray-600">Choose your preferred shipping option</p>
                    </div>

                    {/* Shipping Address Display */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-1">Shipping to:</p>
                      <p className="text-sm text-gray-600">
                        {formData.firstName} {formData.lastName}
                        {formData.company && <><br />{formData.company}</>}
                        <br />{formData.address}
                        <br />{formData.city}, {formData.state} {formData.zipCode}
                      </p>
                    </div>

                    {/* Shipping Rates */}
                    <ShippingRates
                      items={items.map((item) => ({
                        quantity: item.quantity,
                        width: 8.5, // Default width
                        height: 11, // Default height

                        paperStockWeight: 0.1, // Default weight
                      }))}
                      toAddress={{
                        street: formData.address,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zipCode,
                        country: 'US',
                      }}
                      onAirportSelected={setSelectedAirportId}
                      onRateSelected={(rate) => {
                        setSelectedShippingRate({
                          carrier: rate.carrier,
                          serviceName: rate.serviceName,
                          rateAmount: rate.rateAmount,
                          estimatedDays: rate.estimatedDays,
                          transitDays: rate.estimatedDays, // For backward compatibility
                        })
                      }}
                    />

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handlePreviousStep}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        className="min-w-[200px]"
                        onClick={handleStepSubmit}
                        disabled={!selectedShippingRate}
                      >
                        Continue to Payment
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 'payment' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Payment Method</h2>
                      <p className="text-sm text-gray-600">Select how you'd like to pay for your order</p>
                    </div>

                    {/* Billing Address */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Billing Address</h3>
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
                        <div className="space-y-4 pl-7">
                          <div>
                            <Label htmlFor="billingAddress" className="text-sm font-medium mb-1.5">Street Address *</Label>
                            <Input
                              id="billingAddress"
                              name="billingAddress"
                              required={!sameAsShipping}
                              className="h-11"
                              value={formData.billingAddress}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="billingCity" className="text-sm font-medium mb-1.5">City *</Label>
                              <Input
                                id="billingCity"
                                name="billingCity"
                                required={!sameAsShipping}
                                className="h-11"
                                value={formData.billingCity}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingState" className="text-sm font-medium mb-1.5">State *</Label>
                              <Input
                                id="billingState"
                                maxLength={2}
                                name="billingState"
                                placeholder="TX"
                                required={!sameAsShipping}
                                className="h-11"
                                value={formData.billingState}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="billingZipCode" className="text-sm font-medium mb-1.5">ZIP Code *</Label>
                              <Input
                                id="billingZipCode"
                                maxLength={10}
                                name="billingZipCode"
                                required={!sameAsShipping}
                                className="h-11"
                                value={formData.billingZipCode}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-4">Payment Options</h3>
                      <PaymentMethods
                        isProcessing={isProcessing}
                        total={orderTotal}
                        onPaymentMethodSelect={handlePaymentMethodSelect}
                      />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handlePreviousStep}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Confirm */}
                {currentStep === 'review' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Review & Confirm</h2>
                      <p className="text-sm text-gray-600">Review your order details before confirming</p>
                    </div>

                    {/* Order Review Sections */}
                    <div className="space-y-6">
                      {/* Contact Info Review */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Contact Information</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep('information')}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{formData.firstName} {formData.lastName}</p>
                          <p>{formData.email}</p>
                          <p>{formData.phone}</p>
                        </div>
                      </div>

                      {/* Shipping Info Review */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Shipping Details</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep('shipping')}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{formData.address}</p>
                          <p>{formData.city}, {formData.state} {formData.zipCode}</p>
                          {selectedShippingRate && (
                            <p className="pt-2 font-medium">
                              {selectedShippingRate.carrier} - {selectedShippingRate.serviceName}
                              <br />
                              <span className="text-gray-500">Est. {selectedShippingRate.estimatedDays} business days</span>
                            </p>

                          )}
                        </div>
                      </div>

                      {/* Payment Info Review */}
                      <div className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Payment Method</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep('payment')}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="capitalize">{_selectedPaymentMethod || 'Square Checkout'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Place Order Button */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handlePreviousStep}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back
                      </Button>
                      <Button
                        size="lg"
                        className="min-w-[200px]"
                        onClick={processPayment}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-5 w-5" />
                            Place Order • ${orderTotal.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Package2 className="h-5 w-5 mr-2" />
                  Order Summary
                </h2>

                {/* Product Details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold">{currentItem.productName}</h3>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {currentItem.quantity}</p>
                    </div>

                    {/* Product Options */}
                    {(currentItem.options.size || currentItem.options.paperStock || currentItem.options.coating) && (
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        {currentItem.options.size && (
                          <p className="text-sm"><span className="text-gray-500">Size:</span> {currentItem.options.size}</p>
                        )}
                        {currentItem.options.paperStock && (
                          <p className="text-sm"><span className="text-gray-500">Paper:</span> {currentItem.options.paperStock}</p>
                        )}
                        {currentItem.options.coating && (
                          <p className="text-sm"><span className="text-gray-500">Coating:</span> {currentItem.options.coating}</p>
                        )}
                      </div>
                    )}

                    {/* Uploaded Files */}
                    {uploadedImages.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium mb-2 flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Design Files ({uploadedImages.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {uploadedImages.slice(0, 2).map((img) => (
                            <div key={img.id} className="relative aspect-square rounded border bg-white overflow-hidden">
                              <Image
                                fill
                                alt={img.fileName}
                                className="object-contain p-1"
                                src={img.thumbnailUrl || img.url}
                              />
                            </div>
                          ))}
                        </div>
                        {uploadedImages.length > 2 && (
                          <p className="text-xs text-gray-500 mt-1">+{uploadedImages.length - 2} more files</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Truck className="h-4 w-4 mr-1 text-gray-400" />
                      Shipping
                    </span>
                    <span className="font-medium">
                      {selectedShippingRate ? (
                        `$${shippingCost.toFixed(2)}`
                      ) : (
                        <span className="text-gray-400">TBD</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">${orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      <span>Safe Checkout</span>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-center text-gray-500">
                    Need help? Call us at<br />
                    <a href="tel:1-800-PRINTING" className="font-medium text-primary hover:underline">
                      1-800-PRINTING
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
