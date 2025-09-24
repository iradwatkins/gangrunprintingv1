'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface CustomerImage {
  id: string
  url: string
  thumbnailUrl: string
  fileName: string
  fileSize: number
  uploadedAt: string
}

interface CartItemImagesProps {
  item: CartItem
}

export function CartItemImages({ item }: CartItemImagesProps) {
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

  // If we have customer uploaded images, show them
  if (customerImages.length > 0) {
    return (
      <div className="space-y-2">
        {/* Show customer uploaded images */}
        <div className="flex gap-2 flex-wrap">
          {customerImages.slice(0, 2).map((image) => (
            <div
              key={image.id}
              className="relative w-16 h-16 rounded-md overflow-hidden bg-muted border-2 border-primary"
            >
              <Image
                fill
                alt={image.fileName}
                className="object-cover"
                src={image.thumbnailUrl || image.url}
              />
            </div>
          ))}
          {customerImages.length > 2 && (
            <div className="w-16 h-16 rounded-md bg-muted border-2 border-dashed border-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary">+{customerImages.length - 2}</span>
            </div>
          )}
        </div>

        {/* Show filename info */}
        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-primary">Your Design:</p>
          {customerImages.slice(0, 2).map((image) => (
            <p key={image.id} className="truncate">
              {image.fileName}
            </p>
          ))}
          {customerImages.length > 2 && <p>+{customerImages.length - 2} more files</p>}
        </div>
      </div>
    )
  }

  // Fallback to product image or placeholder
  if (item.image) {
    return (
      <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
        <Image fill alt={item.productName} className="object-cover" src={item.image} />
      </div>
    )
  }

  // No images available
  return (
    <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 mx-auto mb-1 bg-muted-foreground/20 rounded"></div>
        <span className="text-xs text-muted-foreground">No image</span>
      </div>
    </div>
  )
}
