/**
 * Utility functions
 */

const STEPS: { id: CheckoutStep; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'information', label: 'Information', icon: User },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Check }
]

function CheckoutPageContent() {
  const router = useRouter()
  const { items, subtotal, tax, shipping: _shipping, total: _total, clearCart } = useCart()
  const SQUARE_APPLICATION_ID =
    process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || 'sandbox-sq0idb-YOUR_APP_ID'
  const SQUARE_LOCATION_ID = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'YOUR_LOCATION_ID'

  // Get the single item (since we're doing one product at a time)
  const currentItem = items.length > 0 ? items[0] : null

  // Fetch uploaded images for the current item
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

    const stepIndex = STEPS.findIndex(s => s.id === currentStep)
    if (stepIndex < STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(STEPS[stepIndex + 1].id)
    }
  }

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

  const shippingCost = selectedShippingRate?.rateAmount || 0
  const orderTotal = subtotal + tax + shippingCost

  if (!currentItem) {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = completedSteps.has(step.id)
              const stepIndex = STEPS.findIndex(s => s.id === step.id)
              const currentStepIndex = STEPS.findIndex(s => s.id === currentStep)
              const isAccessible = stepIndex <= currentStepIndex || isCompleted

export { STEPS, CheckoutPageContent, router, SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, currentItem, fetchUploadedImages, storedImages, stepIndex, validateInformation, validateShipping, processPayment, processSquareCheckout, checkoutData, response, errorText, result, errorMessage, createCheckoutData, shippingCost, total, orderTotal, Icon, isActive, isCompleted, currentStepIndex, isAccessible };
