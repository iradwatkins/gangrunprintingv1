'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  User,
  Truck,
  Shield,
  Check,
  ChevronRight,
  Package2,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react'
import Image from 'next/image'

import { PaymentMethods } from '@/components/checkout/payment-methods'
import { ShippingRates } from '@/components/checkout/shipping-rates'
import { SquareCardPayment } from '@/components/checkout/square-card-payment'
import { CashAppPayment } from '@/components/checkout/cash-app-payment'
import { PayPalButton } from '@/components/checkout/paypal-button'
// import { PageErrorBoundary } from '@/components/error-boundary'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/contexts/cart-context'
import toast from '@/lib/toast'
import { cn } from '@/lib/utils'
import SquareDebugger from '@/components/debug/SquareDebugger'
import { associateTemporaryFilesWithOrder, getUploadedFilesFromSession, clearUploadedFilesFromSession } from '@/lib/services/order-file-service'

interface PayPalOrderDetails {
  paymentID: string
  orderID: string
  payerID?: string
  intent?: string
  status?: string
}

interface UploadedImage {
  id: string
  url: string
  thumbnailUrl?: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

// Checkout step types
type CheckoutStep = 'order-summary' | 'shipping' | 'payment'

const STEPS: {
  id: CheckoutStep
  label: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'order-summary', label: 'Order Summary', subtitle: '', icon: Package2 },
  { id: 'shipping', label: 'Shipping Method', subtitle: 'Complete Address for Shipping Options', icon: Truck },
  { id: 'payment', label: 'Payment', subtitle: 'Confirm your order', icon: CreditCard },
]

function CheckoutPageContent() {
  const router = useRouter()
  const { items, subtotal, tax, shipping: _shipping, total: _total, clearCart } = useCart()
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('order-summary')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('square')
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

  // New state for notes and billing
  const [orderNotes, setOrderNotes] = useState<string>('')
  const [shippingNotes, setShippingNotes] = useState<string>('')
  const [showOrderNotes, setShowOrderNotes] = useState<boolean>(false)
  const [showShippingNotes, setShowShippingNotes] = useState<boolean>(false)
  const [billingDifferent, setBillingDifferent] = useState<boolean>(false)

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

  // Square configuration - reading from environment variables
  const SQUARE_APPLICATION_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID!
  const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
  const SQUARE_ENVIRONMENT = (process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production'

  // Debug logging for Square environment
  console.log('[Checkout] Square Environment:', {
    raw: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT,
    resolved: SQUARE_ENVIRONMENT
  })

  // Get the single item (since we're doing one product at a time)
  const currentItem = items.length > 0 ? items[0] : null

  // Memoize mapped items for shipping calculation - stable reference
  const mappedShippingItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return []
    }

    const mapped = items.map((item) => ({
      productId: item.productId, // ✅ ADD productId for free shipping check
      quantity: Number(item.quantity) || 1,
      width: Number(item.dimensions?.width) || 4,
      height: Number(item.dimensions?.height) || 6,
      paperStockWeight: Number(item.paperStockWeight) || 0.0009,
      paperStockId: item.options?.paperStockId,
    }))

    return mapped
  }, [items])

  // Memoize shipping address - stable reference
  const shippingAddress = useMemo(() => {
    const addr = {
      street: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      country: 'US',
    }
    return addr
  }, [formData.address, formData.city, formData.state, formData.zipCode])

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
          setUploadedImages([
            {
              id: '1',
              url: currentItem.fileUrl,
              thumbnailUrl: currentItem.fileUrl,
              fileName: currentItem.fileName || 'Uploaded Design',
              fileSize: currentItem.fileSize || 0,
              uploadedAt: new Date().toISOString(),
            },
          ])
        }
      } catch (_error) {
        // Intentionally ignoring error - image fetch is optional
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

  /**
   * Associate temporary uploaded files with order after successful payment
   * Converts temporary files to permanent OrderFile records with CUSTOMER_ARTWORK type
   */
  const associateFilesWithOrder = async (orderId: string) => {
    try {
      // Get all uploaded files from sessionStorage for all cart items
      const allFiles: any[] = []
      for (const item of items) {
        const filesForProduct = getUploadedFilesFromSession(item.productId)
        if (filesForProduct.length > 0) {
          allFiles.push(...filesForProduct)
        }
      }

      // If no files uploaded, skip association
      if (allFiles.length === 0) {
        console.log('[Checkout] No files to associate with order')
        return
      }

      console.log(`[Checkout] Associating ${allFiles.length} files with order ${orderId}`)

      // Call service to associate files
      const result = await associateTemporaryFilesWithOrder(orderId, allFiles)

      if (result.success) {
        console.log(`[Checkout] Successfully associated ${result.files?.length || 0} files with order`)

        // Clear uploaded files from sessionStorage
        for (const item of items) {
          clearUploadedFilesFromSession(item.productId)
        }
      } else {
        console.error('[Checkout] Failed to associate files:', result.error)
        // Don't block order completion if file association fails
        // Files are already uploaded to temp storage, admin can manually associate if needed
      }
    } catch (error) {
      console.error('[Checkout] Error associating files with order:', error)
      // Don't block order completion
    }
  }

  const handleNextStep = () => {
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
    if (stepIndex < STEPS.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      setCurrentStep(STEPS[stepIndex + 1].id)
    }
  }

  const handlePreviousStep = () => {
    const stepIndex = STEPS.findIndex((s) => s.id === currentStep)
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
      case 'order-summary':
        handleNextStep()
        break
      case 'shipping':
        if (validateInformation() && validateShipping()) {
          handleNextStep()
        }
        break
      case 'payment':
        // Payment processing handled by payment method components
        break
    }
  }

  const handlePaymentMethodSelect = async (method: string) => {
    setSelectedPaymentMethod(method)
    // In the new flow, we'll handle payment at the review step
    handleNextStep()
  }

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    setIsProcessing(true)

    try {
      if (selectedPaymentMethod === 'test_cash') {
        await processTestCashPayment()
      } else if (selectedPaymentMethod === 'square') {
        // Square payment will be handled by SquareCardPayment component
        // Just advance to review step where Square form will be shown
        handleNextStep()
        setIsProcessing(false)
      } else if (selectedPaymentMethod === 'paypal') {
        // PayPal payment will be handled by PayPal button component
        // Just advance to review step where PayPal button will be shown
        handleNextStep()
        setIsProcessing(false)
      } else {
        toast.error(`${selectedPaymentMethod} payment is coming soon!`)
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      toast.error('Failed to process payment. Please try again.')
      setIsProcessing(false)
    }
  }

  const processTestCashPayment = async () => {
    try {
      const checkoutData = createCheckoutData()

      // Create order in database via API (same as Square, but with test payment method)
      const response = await fetch('/api/checkout/create-test-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Simulate a successful payment (for testing purposes)
        toast.success('🧪 Test payment successful!')

        // Associate uploaded files with order
        if (result.orderId) {
          await associateFilesWithOrder(result.orderId)
        }

        // Store order info in sessionStorage
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
            paymentMethod: 'test_cash',
            testMode: true,
          })
        )

        // Clear cart
        clearCart()

        // Redirect to success page after a short delay
        setTimeout(() => {
          router.push('/checkout/success')
        }, 1000)
      } else {
        throw new Error(result.error || 'Failed to create test order')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process test payment'
      toast.error(errorMessage)
      throw error
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
        console.error('Error response:', errorText)
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
      billingAddress: billingDifferent
        ? {
            street: formData.billingAddress,
            city: formData.billingCity,
            state: formData.billingState,
            zipCode: formData.billingZipCode,
            country: 'US',
          }
        : null, // null means same as shipping
      shippingRate: selectedShippingRate,
      selectedAirportId,
      orderNotes: orderNotes || null,
      shippingNotes: shippingNotes || null,
      subtotal,
      tax,
      shipping: shippingCost,
      total,
    }
  }

  const handleCardPaymentSuccess = async (result: {
    paymentId?: string
    orderId?: string
    orderNumber?: string
  }) => {
    toast.success('Payment processed successfully!')

    // Associate uploaded files with order
    if (result.orderId) {
      await associateFilesWithOrder(result.orderId)
    }

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

  const handlePayPalSuccess = async (details: PayPalOrderDetails) => {
    toast.success('PayPal payment successful!')

    // Create order in database
    try {
      const checkoutData = createCheckoutData()
      const response = await fetch('/api/checkout/create-test-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...checkoutData,
          paymentMethod: 'paypal',
          paymentId: details.paymentID,
          paypalOrderId: details.orderID,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Associate uploaded files with order
        if (result.orderId) {
          await associateFilesWithOrder(result.orderId)
        }

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
            paymentMethod: 'paypal',
          })
        )

        clearCart()
        router.push('/checkout/success')
      }
    } catch (error) {
      console.error('Failed to create order:', error)
      toast.error('Payment successful but order creation failed. Please contact support.')
    }
  }

  const handlePayPalError = (error: string) => {
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
      {/* Square Payment Debugger - Shows in dev or with ?debug=true */}
      <SquareDebugger />

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
              const stepIndex = STEPS.findIndex((s) => s.id === step.id)
              const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)
              const isAccessible = stepIndex <= currentStepIndex || isCompleted

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    className="flex items-center focus:outline-none"
                    disabled={!isAccessible}
                    onClick={() => isAccessible && setCurrentStep(step.id)}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                        isActive && 'bg-primary text-white',
                        isCompleted && !isActive && 'bg-green-500 text-white',
                        !isActive && !isCompleted && 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'ml-3 font-medium hidden md:inline-block',
                        isActive && 'text-primary',
                        isCompleted && 'text-green-600',
                        !isActive && !isCompleted && 'text-gray-500'
                      )}
                    >
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
                {/* Step 1: Order Summary */}
                {currentStep === 'order-summary' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Order Summary</h2>
                    </div>

                    {/* Product Details Card - NOT collapsible on this step */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
                      <div className="flex items-start gap-4">
                        {/* Product Icon */}
                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-3">{currentItem.productName}</h3>

                          {/* Product Options Grid */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div>
                              <span className="text-gray-500 uppercase text-xs font-medium">Quantity:</span>{' '}
                              <span className="font-medium">{currentItem.quantity}</span>
                            </div>
                            {currentItem.options.size && (
                              <div>
                                <span className="text-gray-500 uppercase text-xs font-medium">Size:</span>{' '}
                                <span className="font-medium">{currentItem.options.size}</span>
                              </div>
                            )}
                            {currentItem.options.paperStock && (
                              <div>
                                <span className="text-gray-500 uppercase text-xs font-medium">Paper:</span>{' '}
                                <span className="font-medium">{currentItem.options.paperStock}</span>
                              </div>
                            )}
                            {currentItem.options.sides && (
                              <div>
                                <span className="text-gray-500 uppercase text-xs font-medium">Sides:</span>{' '}
                                <span className="font-medium">{currentItem.options.sides}</span>
                              </div>
                            )}
                            {currentItem.options.coating && (
                              <div>
                                <span className="text-gray-500 uppercase text-xs font-medium">Coating:</span>{' '}
                                <span className="font-medium">{currentItem.options.coating}</span>
                              </div>
                            )}
                            {currentItem.turnaround && (
                              <div>
                                <span className="text-gray-500 uppercase text-xs font-medium">Turnaround:</span>{' '}
                                <span className="font-medium">{currentItem.turnaround.displayName}</span>
                              </div>
                            )}
                          </div>

                          {/* Addons */}
                          {(currentItem.options.addOns || currentItem.addons) && (currentItem.options.addOns || currentItem.addons)!.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-sm">
                                <span className="text-gray-500 uppercase text-xs font-medium">Addons:</span>{' '}
                                <span className="font-medium">
                                  {(currentItem.options.addOns || currentItem.addons)!.map((a: any) => a.name).join(', ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ${subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="mt-6 pt-4 border-t border-gray-300">
                        <div className="space-y-2 text-sm max-w-xs ml-auto">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="font-medium text-gray-400">TBD</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-300">
                            <span className="font-semibold text-base">Total:</span>
                            <span className="font-bold text-lg text-primary">
                              ${(subtotal + tax).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Images */}
                    {uploadedImages.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-900">
                          <Check className="h-4 w-4 text-green-600" />
                          Design Files Uploaded ({uploadedImages.length})
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {uploadedImages.map((img) => (
                            <div
                              key={img.id}
                              className="relative aspect-square rounded border-2 border-white bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                              <Image
                                fill
                                alt={img.fileName}
                                className="object-contain p-2"
                                src={img.thumbnailUrl || img.url}
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          Files will be reviewed after order placement
                        </p>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                      <Link href="/cart">
                        <Button size="lg" type="button" variant="outline">
                          <ArrowLeft className="mr-2 h-5 w-5" />
                          Back to Cart
                        </Button>
                      </Link>
                      <Button
                        className="min-w-[220px] text-base"
                        size="lg"
                        type="button"
                        onClick={handleNextStep}
                      >
                        Continue to Shipping
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Shipping Method */}
                {currentStep === 'shipping' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Shipping Method</h2>
                      <p className="text-sm text-gray-600">
                        Complete Address for Shipping Options
                      </p>
                    </div>

                    {/* Collapsible Order Summary */}
                    <details className="mb-8 bg-gray-50 rounded-lg p-4 border">
                      <summary className="flex justify-between items-center cursor-pointer font-medium hover:text-primary">
                        <span className="flex items-center gap-2">
                          <Package2 className="h-5 w-5" />
                          Show Order Summary
                        </span>
                        <span className="text-lg font-bold">${(subtotal + tax).toFixed(2)}</span>
                      </summary>
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                        <p className="font-medium mb-2">{currentItem.productName}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>Quantity: {currentItem.quantity}</div>
                          {currentItem.options.size && <div>Size: {currentItem.options.size}</div>}
                          {currentItem.options.paperStock && <div>Paper: {currentItem.options.paperStock}</div>}
                          {currentItem.options.coating && <div>Coating: {currentItem.options.coating}</div>}
                        </div>
                        <div className="mt-3 pt-3 border-t space-y-1">
                          <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold pt-1 border-t">
                            <span>Total:</span><span>${(subtotal + tax).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* Contact Information */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium">Contact Details</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-1.5 block" htmlFor="email">
                            Email Address *
                          </Label>
                          <Input
                            required
                            className="h-11"
                            id="email"
                            name="email"
                            placeholder="john.doe@example.com"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Order confirmation will be sent to this email
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="firstName">
                              First Name *
                            </Label>
                            <Input
                              required
                              className="h-11"
                              id="firstName"
                              name="firstName"
                              placeholder="John"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="lastName">
                              Last Name *
                            </Label>
                            <Input
                              required
                              className="h-11"
                              id="lastName"
                              name="lastName"
                              placeholder="Doe"
                              value={formData.lastName}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="phone">
                              Phone Number *
                            </Label>
                            <Input
                              required
                              className="h-11"
                              id="phone"
                              name="phone"
                              placeholder="(555) 123-4567"
                              type="tel"
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="company">
                              Company (Optional)
                            </Label>
                            <Input
                              className="h-11"
                              id="company"
                              name="company"
                              placeholder="ACME Corp"
                              value={formData.company}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium">Shipping Address</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-1.5 block" htmlFor="address">
                            Street Address *
                          </Label>
                          <Input
                            required
                            className="h-11"
                            id="address"
                            name="address"
                            placeholder="123 Main Street"
                            value={formData.address}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="city">
                              City *
                            </Label>
                            <Input
                              required
                              className="h-11"
                              id="city"
                              name="city"
                              placeholder="Dallas"
                              value={formData.city}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="state">
                              State *
                            </Label>
                            <Input
                              required
                              className="h-11"
                              id="state"
                              maxLength={2}
                              name="state"
                              placeholder="TX"
                              value={formData.state}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium mb-1.5 block" htmlFor="zipCode">
                              ZIP Code *
                            </Label>
                            <Input
                              required
                              className="h-11"
                              id="zipCode"
                              maxLength={10}
                              name="zipCode"
                              placeholder="75001"
                              value={formData.zipCode}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Billing Address - Smart Show/Hide */}
                    <div className="mb-8 bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center gap-2 mb-3">
                        <Checkbox
                          checked={!billingDifferent}
                          id="sameBilling"
                          onCheckedChange={(checked) => setBillingDifferent(!checked)}
                        />
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="sameBilling">
                          Billing address same as shipping
                        </Label>
                      </div>

                      {billingDifferent && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center mb-4">
                            <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                            <h4 className="text-base font-medium">Billing Address</h4>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingAddress">
                                Street Address *
                              </Label>
                              <Input
                                required={billingDifferent}
                                className="h-11"
                                id="billingAddress"
                                name="billingAddress"
                                placeholder="123 Billing Street"
                                value={formData.billingAddress}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingCity">
                                  City *
                                </Label>
                                <Input
                                  required={billingDifferent}
                                  className="h-11"
                                  id="billingCity"
                                  name="billingCity"
                                  placeholder="Dallas"
                                  value={formData.billingCity}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingState">
                                  State *
                                </Label>
                                <Input
                                  required={billingDifferent}
                                  className="h-11"
                                  id="billingState"
                                  maxLength={2}
                                  name="billingState"
                                  placeholder="TX"
                                  value={formData.billingState}
                                  onChange={handleInputChange}
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium mb-1.5 block" htmlFor="billingZipCode">
                                  ZIP Code *
                                </Label>
                                <Input
                                  required={billingDifferent}
                                  className="h-11"
                                  id="billingZipCode"
                                  maxLength={10}
                                  name="billingZipCode"
                                  placeholder="75001"
                                  value={formData.billingZipCode}
                                  onChange={handleInputChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shipping Rates */}
                    <div className="mb-8">
                      <div className="flex items-center mb-4">
                        <Truck className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-medium">Select Shipping Method</h3>
                      </div>

                      {formData.address && formData.city && formData.state && formData.zipCode && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-900">
                          <strong>Shipping to:</strong> {formData.firstName} {formData.lastName}, {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                        </div>
                      )}

                      {mappedShippingItems.length === 0 ? (
                        <div className="text-red-600 p-4 border border-red-300 rounded bg-red-50">
                          Error: Cart items not properly loaded. Please refresh the page.
                        </div>
                      ) : !formData.address || !formData.city || !formData.state || !formData.zipCode ? (
                        <div className="text-gray-600 p-4 border border-gray-300 rounded bg-gray-50">
                          Please complete shipping address to see shipping options.
                        </div>
                      ) : (
                        <ShippingRates
                          items={mappedShippingItems}
                          toAddress={shippingAddress}
                          onAirportSelected={setSelectedAirportId}
                          onRateSelected={(rate) => {
                            setSelectedShippingRate({
                              carrier: rate.carrier,
                              serviceName: rate.serviceName,
                              rateAmount: rate.rateAmount,
                              estimatedDays: rate.estimatedDays,
                              transitDays: rate.estimatedDays,
                            })
                          }}
                        />
                      )}
                    </div>

                    {/* Order Notes - Hidden Behind Checkbox */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={showOrderNotes}
                          id="showOrderNotes"
                          onCheckedChange={(checked) => setShowOrderNotes(checked as boolean)}
                        />
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="showOrderNotes">
                          Add notes for your order
                        </Label>
                      </div>
                      {showOrderNotes && (
                        <div className="mt-3">
                          <textarea
                            id="orderNotes"
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            placeholder="Add any special instructions for your order (e.g., color preferences, special finishing requests)..."
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Shipping Notes - Hidden Behind Checkbox */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                          checked={showShippingNotes}
                          id="showShippingNotes"
                          onCheckedChange={(checked) => setShowShippingNotes(checked as boolean)}
                        />
                        <Label className="text-sm font-medium cursor-pointer" htmlFor="showShippingNotes">
                          Add notes for shipping
                        </Label>
                      </div>
                      {showShippingNotes && (
                        <div className="mt-3">
                          <textarea
                            id="shippingNotes"
                            className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            placeholder="Add delivery instructions (e.g., gate code, leave at side door, call on arrival)..."
                            value={shippingNotes}
                            onChange={(e) => setShippingNotes(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                      <Button
                        size="lg"
                        type="button"
                        variant="outline"
                        onClick={handlePreviousStep}
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Back
                      </Button>
                      <Button
                        className="min-w-[240px] bg-red-600 hover:bg-red-700 text-white h-12 text-base font-semibold"
                        disabled={!selectedShippingRate}
                        size="lg"
                        type="button"
                        onClick={handleStepSubmit}
                      >
                        NEXT PAYMENT OPTIONS
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {currentStep === 'payment' && (
                  <div className="p-8">
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold mb-2">Payment</h2>
                      <p className="text-sm text-gray-600">Confirm your order</p>
                    </div>

                    {/* Collapsible Order Summary - Expanded by default */}
                    <details open className="mb-8 bg-gray-50 rounded-lg p-4 border">
                      <summary className="flex justify-between items-center cursor-pointer font-medium hover:text-primary">
                        <span className="flex items-center gap-2">
                          <Package2 className="h-5 w-5" />
                          Order Summary
                        </span>
                        <span className="text-lg font-bold">${orderTotal.toFixed(2)}</span>
                      </summary>
                      <div className="mt-4 pt-4 border-t border-gray-200 text-sm">
                        <p className="font-medium mb-2">{currentItem.productName}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                          <div>Quantity: {currentItem.quantity}</div>
                          {currentItem.options.size && <div>Size: {currentItem.options.size}</div>}
                          {currentItem.options.paperStock && <div>Paper: {currentItem.options.paperStock}</div>}
                          {currentItem.options.coating && <div>Coating: {currentItem.options.coating}</div>}
                          {currentItem.turnaround && <div>Turnaround: {currentItem.turnaround.displayName}</div>}
                        </div>
                        <div className="mt-3 pt-3 border-t space-y-1">
                          <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Shipping:</span><span>${shippingCost.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Tax:</span><span>${tax.toFixed(2)}</span></div>
                          <div className="flex justify-between font-bold pt-1 border-t">
                            <span>Total:</span><span>${orderTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </details>

                    {/* Review Section with Change Links */}
                    <div className="mb-8 bg-white border rounded-lg p-5">
                      <div className="space-y-4">
                        {/* Contact Info */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-500 mb-1">CONTACT</div>
                            <div className="text-sm">
                              <div>{formData.email}</div>
                              <div>{formData.phone}</div>
                              <div>{formData.firstName} {formData.lastName}</div>
                              {formData.company && <div className="text-gray-600">{formData.company}</div>}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary/80"
                            onClick={() => setCurrentStep('shipping')}
                          >
                            Change
                          </Button>
                        </div>

                        <div className="border-t"></div>

                        {/* Shipping Method */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-500 mb-1">SHIP TO</div>
                            <div className="text-sm">
                              <div>{formData.address}</div>
                              <div>{formData.city}, {formData.state} {formData.zipCode}</div>
                            </div>
                            {selectedShippingRate && (
                              <div className="mt-2 text-sm">
                                <div className="text-sm font-medium text-gray-500 mb-1">METHOD</div>
                                <div className="font-medium">{selectedShippingRate.carrier} - {selectedShippingRate.serviceName}</div>
                                <div className="text-gray-600 text-xs">Est. {selectedShippingRate.estimatedDays} business days</div>
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary/80"
                            onClick={() => setCurrentStep('shipping')}
                          >
                            Change
                          </Button>
                        </div>
                      </div>

                      {/* Order Notes Display */}
                      {orderNotes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium text-gray-500 mb-1">ORDER NOTES</div>
                          <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-3">
                            {orderNotes}
                          </div>
                        </div>
                      )}

                      {/* Shipping Notes Display */}
                      {shippingNotes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium text-gray-500 mb-1">SHIPPING NOTES</div>
                          <div className="text-sm bg-blue-50 border border-blue-200 rounded p-3">
                            {shippingNotes}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Section */}
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-center mb-6">
                        Order Total: ${orderTotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">Payment Information</h3>
                      <p className="text-sm text-gray-600 mb-4">All transactions are secure and encrypted.</p>

                      {/* Payment Method Selection */}
                      <div className="space-y-3">
                        {/* Credit Card */}
                        <div className="border rounded-lg overflow-hidden">
                          <div
                            className={cn(
                              'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                              selectedPaymentMethod === 'square' ? 'bg-blue-50 border-l-4 border-l-primary' : 'hover:bg-gray-50'
                            )}
                            onClick={() => setSelectedPaymentMethod('square')}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={selectedPaymentMethod === 'square'}
                              onChange={() => setSelectedPaymentMethod('square')}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <CreditCard className="h-5 w-5" />
                              <span className="font-medium">Credit Card</span>
                            </div>
                            <span className="text-xs text-gray-500">Visa, Mastercard, Amex</span>
                          </div>
                          {selectedPaymentMethod === 'square' && (
                            <div className="p-4 bg-white border-t">
                              <p className="text-sm text-gray-600 mb-4">Pay securely using your credit card.</p>
                              <SquareCardPayment
                                applicationId={SQUARE_APPLICATION_ID}
                                locationId={SQUARE_LOCATION_ID}
                                environment={SQUARE_ENVIRONMENT}
                                total={orderTotal}
                                billingContact={{
                                  givenName: formData.firstName,
                                  familyName: formData.lastName,
                                  email: formData.email,
                                  phone: formData.phone,
                                  addressLines: billingDifferent
                                    ? [formData.billingAddress]
                                    : [formData.address],
                                  city: billingDifferent ? formData.billingCity : formData.city,
                                  state: billingDifferent ? formData.billingState : formData.state,
                                  countryCode: 'US',
                                  postalCode: billingDifferent ? formData.billingZipCode : formData.zipCode,
                                }}
                                onBack={handlePreviousStep}
                                onPaymentError={handleCardPaymentError}
                                onPaymentSuccess={handleCardPaymentSuccess}
                              />
                            </div>
                          )}
                        </div>

                        {/* PayPal */}
                        <div className="border rounded-lg overflow-hidden">
                          <div
                            className={cn(
                              'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                              selectedPaymentMethod === 'paypal' ? 'bg-blue-50 border-l-4 border-l-primary' : 'hover:bg-gray-50'
                            )}
                            onClick={() => setSelectedPaymentMethod('paypal')}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={selectedPaymentMethod === 'paypal'}
                              onChange={() => setSelectedPaymentMethod('paypal')}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium">PayPal</span>
                            </div>
                            <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
                          </div>
                          {selectedPaymentMethod === 'paypal' && (
                            <div className="p-4 bg-white border-t">
                              <p className="text-sm text-gray-600 mb-4">Pay via PayPal.</p>
                              <PayPalButton
                                total={orderTotal}
                                onError={handlePayPalError}
                                onSuccess={handlePayPalSuccess}
                              />
                              <div className="mt-4 text-center">
                                <Link href="/cart" className="text-sm text-primary hover:underline">
                                  « Back to Cart
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Cash App Pay */}
                        <div className="border rounded-lg overflow-hidden">
                          <div
                            className={cn(
                              'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                              selectedPaymentMethod === 'cashapp' ? 'bg-blue-50 border-l-4 border-l-primary' : 'hover:bg-gray-50'
                            )}
                            onClick={() => setSelectedPaymentMethod('cashapp')}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={selectedPaymentMethod === 'cashapp'}
                              onChange={() => setSelectedPaymentMethod('cashapp')}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium">Cash App Pay</span>
                            </div>
                            <span className="text-green-600 font-bold text-xl">$</span>
                          </div>
                          {selectedPaymentMethod === 'cashapp' && (
                            <div className="p-4 bg-white border-t">
                              <p className="text-sm text-gray-600 mb-4">Pay securely using Cash App Pay.</p>
                              <CashAppPayment
                                applicationId={SQUARE_APPLICATION_ID}
                                locationId={SQUARE_LOCATION_ID}
                                total={orderTotal}
                                onBack={handlePreviousStep}
                                onPaymentError={handleCardPaymentError}
                                onPaymentSuccess={handleCardPaymentSuccess}
                              />
                            </div>
                          )}
                        </div>

                        {/* Test Gateway - Dev Only */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="border rounded-lg overflow-hidden border-orange-300 bg-orange-50">
                            <div
                              className={cn(
                                'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                                selectedPaymentMethod === 'test_cash' ? 'bg-orange-100 border-l-4 border-l-orange-500' : 'hover:bg-orange-100'
                              )}
                              onClick={() => setSelectedPaymentMethod('test_cash')}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedPaymentMethod === 'test_cash'}
                                onChange={() => setSelectedPaymentMethod('test_cash')}
                                className="w-4 h-4"
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <span className="font-medium">🧪 Test Gateway By FunnelKit</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Privacy & Terms */}
                    <div className="mb-6 bg-gray-50 border rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
                        <Link href="/privacy-policy" className="text-primary hover:underline">privacy policy</Link>.
                      </p>
                      <div className="flex items-start gap-2">
                        <Checkbox id="terms" required className="mt-1" />
                        <Label htmlFor="terms" className="text-sm cursor-pointer">
                          I have read and agree to the website{' '}
                          <Link href="/terms-and-conditions" className="text-primary hover:underline">terms and conditions</Link> *
                        </Label>
                      </div>
                    </div>

                    {/* Action Buttons - Only for non-Square, non-PayPal */}
                    {selectedPaymentMethod !== 'square' && selectedPaymentMethod !== 'paypal' && (
                      <div className="mb-6">
                        <Button
                          className="w-full bg-red-600 hover:bg-red-700 text-white h-14 text-lg font-bold"
                          disabled={isProcessing}
                          size="lg"
                          onClick={processPayment}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="mr-2 h-5 w-5" />
                              PLACE ORDER NOW ${orderTotal.toFixed(2)}
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Return Links */}
                    <div className="text-center text-sm text-gray-600 space-x-3 mb-6">
                      <button
                        className="text-primary hover:underline"
                        onClick={() => setCurrentStep('shipping')}
                      >
                        « Return to Shipping Options
                      </button>
                      <span>|</span>
                      <Link href="/cart" className="text-primary hover:underline">
                        « Back to Cart
                      </Link>
                    </div>

                    {/* Trust Badges */}
                    <div className="border-t pt-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div className="text-xs">
                              <div className="font-semibold">McAfee Secure</div>
                              <div className="text-gray-500">Protected</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Lock className="h-8 w-8 text-yellow-600" />
                            <div className="text-xs">
                              <div className="font-semibold">Norton Secured</div>
                              <div className="text-gray-500">SSL Encrypted</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-center text-xs text-gray-600">
                          <div className="font-medium">256-Bit Bank Level Security</div>
                          <div className="text-gray-500">100% Secure Payments</div>
                        </div>
                      </div>
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
                    {(currentItem.options.size ||
                      currentItem.options.paperStock ||
                      currentItem.options.coating) && (
                      <div className="pt-2 border-t border-gray-200 space-y-1">
                        {currentItem.options.size && (
                          <p className="text-sm">
                            <span className="text-gray-500">Size:</span> {currentItem.options.size}
                          </p>
                        )}
                        {currentItem.options.paperStock && (
                          <p className="text-sm">
                            <span className="text-gray-500">Paper:</span>{' '}
                            {currentItem.options.paperStock}
                          </p>
                        )}
                        {currentItem.options.coating && (
                          <p className="text-sm">
                            <span className="text-gray-500">Coating:</span>{' '}
                            {currentItem.options.coating}
                          </p>
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
                            <div
                              key={img.id}
                              className="relative aspect-square rounded border bg-white overflow-hidden"
                            >
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
                          <p className="text-xs text-gray-500 mt-1">
                            +{uploadedImages.length - 2} more files
                          </p>
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
                      <Package2 className="h-4 w-4 mr-1 text-gray-400" />
                      Weight
                    </span>
                    <span className="font-medium text-gray-600">
                      {currentItem && currentItem.dimensions && currentItem.paperStockWeight
                        ? `${(currentItem.paperStockWeight * currentItem.dimensions.width * currentItem.dimensions.height * currentItem.quantity).toFixed(2)} lbs`
                        : 'Calculating...'}
                    </span>
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
                      <span className="text-lg font-bold text-primary">
                        ${orderTotal.toFixed(2)}
                      </span>
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
                    Need help? Call us at
                    <br />
                    <a
                      className="font-medium text-primary hover:underline"
                      href="tel:1-800-PRINTING"
                    >
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

export default function CheckoutPage() {
  return (
    // Error boundary temporarily disabled for build
    <CheckoutPageContent />
  )
}
