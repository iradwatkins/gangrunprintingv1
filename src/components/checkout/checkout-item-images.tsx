'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { CartItem } from '@/lib/cart-types'

interface CustomerImage {
  id: string
  url: string
  thumbnailUrl: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface CheckoutItemImagesProps {
  item: CartItem
}

export function CheckoutItemImages({ item }: CheckoutItemImagesProps) {
  const [customerImages, setCustomerImages] = useState<CustomerImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCustomerImages = async () => {
      if (!item.productId) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/products/customer-images?productId=${item.productId}`)

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.images) {
            setCustomerImages(data.images)
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerImages()
  }, [item.productId])

  // If we have customer uploaded images, show them in compact format
  if (customerImages.length > 0) {
    return (
      <div className="flex items-center gap-2 mt-1">
        {/* Show first customer image as preview */}
        <div className="relative w-8 h-8 rounded border border-primary/50 overflow-hidden">
          <Image
            fill
            alt={customerImages[0].fileName}
            className="object-cover"
            src={customerImages[0].thumbnailUrl || customerImages[0].url}
          />
        </div>

        {/* Show file info */}
        <div className="text-xs text-primary">
          <span className="font-medium">Your Design:</span>{' '}
          <span className="truncate max-w-[120px] inline-block">{customerImages[0].fileName}</span>
          {customerImages.length > 1 && (
            <span className="ml-1">+{customerImages.length - 1} more</span>
          )}
        </div>
      </div>
    )
  }

  // Show product image if available
  if (item.image) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <div className="relative w-8 h-8 rounded border overflow-hidden">
          <Image fill alt={item.productName} className="object-cover" src={item.image} />
        </div>
        <span className="text-xs text-muted-foreground">Product image</span>
      </div>
    )
  }

  // No images - just show file name if uploaded
  if (item.fileName) {
    return (
      <div className="text-xs text-muted-foreground mt-1">
        <span className="font-medium">File:</span> {item.fileName}
      </div>
    )
  }

  return null
}
