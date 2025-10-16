'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import FileUploadZone from '@/components/product/FileUploadZone'
import { ArrowLeft, ArrowRight, CheckCircle, Upload, AlertCircle } from 'lucide-react'
import toast from '@/lib/toast'

interface CartItem {
  id: string
  productId: string
  productName: string
  quantity: number
  requiresArtwork?: boolean
}

interface UploadedFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  isImage: boolean
}

export default function UploadArtworkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({})
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // Get cart items from sessionStorage
  useEffect(() => {
    try {
      const cartData = sessionStorage.getItem('cart')
      if (!cartData) {
        toast.error('No items in cart')
        router.push('/cart')
        return
      }

      const cart = JSON.parse(cartData)
      // Filter items that require artwork
      // For now, all items require artwork - you can add logic to check product.requiresArtwork
      const itemsNeedingArtwork = cart.items || []

      if (itemsNeedingArtwork.length === 0) {
        // No items need artwork, proceed to checkout
        router.push('/checkout')
        return
      }

      setCartItems(itemsNeedingArtwork)
      setLoading(false)
    } catch (error) {
      console.error('Error loading cart:', error)
      toast.error('Failed to load cart items')
      router.push('/cart')
    }
  }, [router])

  const currentItem = cartItems[currentItemIndex]
  const currentItemFiles = uploadedFiles[currentItem?.id] || []
  const isLastItem = currentItemIndex === cartItems.length - 1
  const canProceed = currentItemFiles.length > 0 // At least one file uploaded

  const handleFilesUploaded = (files: UploadedFile[]) => {
    if (!currentItem) return

    setUploadedFiles((prev) => ({
      ...prev,
      [currentItem.id]: files,
    }))

    // Store in sessionStorage for persistence across page navigation
    // Use key pattern that matches order-file-service.ts expectations
    try {
      sessionStorage.setItem(`uploaded_images_${currentItem.productId}`, JSON.stringify(files))
    } catch (error) {
      console.error('Error saving uploaded files:', error)
    }
  }

  const handleNext = () => {
    if (!canProceed) {
      toast.error('Please upload at least one file before continuing')
      return
    }

    if (isLastItem) {
      // All items have files, proceed to checkout
      router.push('/checkout')
    } else {
      // Move to next item
      setCurrentItemIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentItemIndex > 0) {
      setCurrentItemIndex((prev) => prev - 1)
    } else {
      router.push('/cart')
    }
  }

  const handleSkipAll = () => {
    // Save empty file arrays for all items
    // Use key pattern that matches order-file-service.ts expectations
    cartItems.forEach((item) => {
      try {
        sessionStorage.setItem(`uploaded_images_${item.productId}`, JSON.stringify([]))
      } catch (error) {
        console.error('Error saving empty files:', error)
      }
    })

    // Proceed to checkout without files
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return null // Redirecting
  }

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Upload Your Artwork</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            <span>
              Item {currentItemIndex + 1} of {cartItems.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentItemIndex + 1) / cartItems.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Alert about temporary storage */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your files will be stored temporarily until payment is completed. Once your order is
          confirmed, files will be permanently associated with your order for review and approval.
        </AlertDescription>
      </Alert>

      {/* Current Product Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{currentItem.productName}</span>
            {currentItemFiles.length > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-normal">
                  {currentItemFiles.length} file{currentItemFiles.length !== 1 ? 's' : ''} uploaded
                </span>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Quantity: {currentItem.quantity} • Upload your design files for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            onFilesUploaded={handleFilesUploaded}
            maxFiles={10}
            maxFileSize={25} // 25MB per file
            maxTotalSize={100} // 100MB total
            acceptedTypes={[
              'application/pdf',
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/svg+xml',
              'image/webp',
              'application/postscript',
              'application/x-photoshop',
              'application/vnd.adobe.photoshop',
              'application/vnd.adobe.illustrator',
            ]}
          />

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">File Requirements:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Accepted formats: PDF, JPG, PNG, AI, PSD, EPS, SVG</li>
              <li>• Maximum 10 files per product</li>
              <li>• Maximum 25MB per file, 100MB total</li>
              <li>• High resolution recommended (300 DPI minimum)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentItemIndex > 0 ? 'Previous Item' : 'Back to Cart'}
        </Button>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSkipAll}>
            Skip & Continue to Checkout
          </Button>

          <Button onClick={handleNext} disabled={!canProceed} size="lg">
            {isLastItem ? 'Proceed to Checkout' : 'Next Item'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Need help? Contact us at{' '}
          <a href="mailto:support@gangrunprinting.com" className="text-primary hover:underline">
            support@gangrunprinting.com
          </a>
        </p>
      </div>
    </div>
  )
}
