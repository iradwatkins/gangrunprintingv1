'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Trash2, ArrowRight, Upload, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/cart-context'
import { CartItemImages } from '@/components/cart/cart-item-images'
import { FileThumbnails } from '@/components/product/FileThumbnails'
import { ArtworkUpload } from '@/components/product/ArtworkUpload'
import { Link, useRouter } from '@/lib/i18n/navigation'
import toast from '@/lib/toast'

interface UploadedFile {
  id: string
  file: File
  preview?: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
  url?: string
}

export default function CartPage() {
  const router = useRouter()
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    tax,
    shipping,
    total,
  } = useCart()

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  // CRITICAL: Restore uploaded files when customer returns to checkout page
  // This prevents customers from having to re-upload files if they navigate back/forward
  useEffect(() => {
    const savedFiles = sessionStorage.getItem('cart_artwork_files')
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles)
        // Restore files with mock File objects (actual files already uploaded to temp storage)
        const restoredFiles = parsedFiles.map((savedFile: Partial<UploadedFile>) => ({
          id: savedFile.id || Math.random().toString(36).substr(2, 9),
          file: new File([], savedFile.url?.split('/').pop() || 'file', { type: 'application/octet-stream' }), // Mock file - actual file is in temp storage
          preview: savedFile.preview,
          status: savedFile.status || 'success',
          progress: savedFile.progress || 100,
          url: savedFile.url,
        }))
        setUploadedFiles(restoredFiles as UploadedFile[])
        console.log('[Checkout] Restored', restoredFiles.length, 'uploaded files from session')
      } catch (error) {
        console.error('[Checkout] Failed to restore uploaded files:', error)
        // Clear corrupted data
        sessionStorage.removeItem('cart_artwork_files')
      }
    }
  }, []) // Run only once on mount

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files)
    // Store in sessionStorage for checkout (exclude File objects - they can't be serialized)
    const serializableFiles = files.map(({ id, preview, status, progress, url }) => ({
      id,
      preview,
      status,
      progress,
      url,
      // File object excluded - can't be serialized to JSON
    }))
    sessionStorage.setItem('cart_artwork_files', JSON.stringify(serializableFiles))
  }

  const handleContinueToCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    // Store cart data in session storage for shipping page
    const checkoutData = {
      items,
      subtotal,
      tax,
      shipping,
      total,
    }
    sessionStorage.setItem('checkout_cart_data', JSON.stringify(checkoutData))

    // Store uploaded files (already saved by handleFilesChange, but update here for safety)
    if (uploadedFiles.length > 0) {
      const serializableFiles = uploadedFiles.map(({ id, preview, status, progress, url }) => ({
        id,
        preview,
        status,
        progress,
        url,
      }))
      sessionStorage.setItem('cart_artwork_files', JSON.stringify(serializableFiles))
    }

    // CRITICAL FIX: Navigate to shipping page first (not directly to payment)
    // User must enter shipping address before payment
    router.push('/checkout/shipping')
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-lg text-muted-foreground">
            Add products to your cart to see them here
          </p>
          <Button asChild size="lg">
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBag className="h-8 w-8" />
              Checkout
            </h1>
            <p className="text-muted-foreground mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your order
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearCart}>
              Clear All
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items & Upload */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex gap-4">
                      <CartItemImages item={item} />
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold">{item.productName}</h4>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {item.options.size && <p>Size: {item.options.size}</p>}
                          {item.options.paperStock && <p>Paper: {item.options.paperStock}</p>}
                          {item.options.coating && <p>Coating: {item.options.coating}</p>}
                          {item.options.sides && <p>Sides: {item.options.sides}</p>}
                          {item.options.turnaround && <p>Turnaround: {item.options.turnaround}</p>}
                        </div>
                        {/* Artwork Files */}
                        {item.artworkFiles && item.artworkFiles.length > 0 && (
                          <div className="mt-2">
                            <FileThumbnails files={item.artworkFiles} maxDisplay={3} size="sm" />
                          </div>
                        )}
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                        {item.productSlug && (
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/products/${item.productSlug}`}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${item.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Artwork Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Artwork Files
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your print-ready files here. Accepted formats: PDF, JPG, PNG, AI, EPS, SVG
                </p>
              </CardHeader>
              <CardContent>
                <ArtworkUpload maxFiles={10} maxSizeMB={50} onFilesChange={handleFilesChange} />

                {/* Uploading status */}
                {uploadedFiles.filter(f => f.status === 'uploading').length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                      ⏳ Uploading {uploadedFiles.filter(f => f.status === 'uploading').length} file{uploadedFiles.filter(f => f.status === 'uploading').length !== 1 ? 's' : ''}...
                    </p>
                  </div>
                )}

                {/* Error notification */}
                {uploadedFiles.filter(f => f.status === 'error').length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                      ❌ {uploadedFiles.filter(f => f.status === 'error').length} file{uploadedFiles.filter(f => f.status === 'error').length !== 1 ? 's' : ''} failed to upload
                    </p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-3">
                  Note: You can also upload files after checkout if needed.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (estimated)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Shipping will be calculated at checkout
                  </p>
                </div>

                {/* Continue to Shipping Button */}
                <Button className="w-full" size="lg" onClick={handleContinueToCheckout}>
                  Continue to Shipping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {/* Continue Shopping */}
                <Button asChild className="w-full" variant="outline">
                  <Link href="/products">Continue Shopping</Link>
                </Button>

                {/* Trust Badge */}
                <div className="text-center pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure checkout powered by Square
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
