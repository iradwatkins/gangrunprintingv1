'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'
import Image from 'next/image'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface Props {
  children: ReactNode
  productName?: string
  fallbackImage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ProductImageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to error reporting service
    console.error('ProductImageErrorBoundary caught error:', error, errorInfo)

    // In production, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Log to monitoring service
      console.error('Product image display error:', {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        productName: this.props.productName,
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when there's an error
      return (
        <div className="relative aspect-square bg-gray-100 rounded-lg">
          {/* Fallback placeholder image */}
          <Image
            fill
            alt={`${this.props.productName || 'Product'} - Image unavailable`}
            className="object-cover opacity-50"
            sizes="(max-width: 768px) 100vw, 50vw"
            src={this.props.fallbackImage || '/images/product-placeholder.jpg'}
          />

          {/* Error message overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Alert className="max-w-sm bg-white/95 backdrop-blur">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Image Display Error</AlertTitle>
              <AlertDescription>
                Unable to display product image. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Functional component wrapper with error boundary
 */
export function ProductImageWithErrorBoundary({
  children,
  productName,
  fallbackImage,
}: {
  children: ReactNode
  productName?: string
  fallbackImage?: string
}) {
  return (
    <ProductImageErrorBoundary
      productName={productName}
      fallbackImage={fallbackImage}
    >
      {children}
    </ProductImageErrorBoundary>
  )
}

/**
 * Safe image component with built-in error handling
 */
export function SafeProductImage({
  src,
  alt,
  className,
  productName,
  ...props
}: {
  src: string | undefined | null
  alt: string
  className?: string
  productName?: string
  [key: string]: any
}) {
  const [imageError, setImageError] = React.useState(false)
  const fallbackSrc = '/images/product-placeholder.jpg'

  // Handle invalid or missing src
  const imageSrc = React.useMemo(() => {
    if (!src || imageError) {
      return fallbackSrc
    }

    // Validate URL format
    try {
      // Check if it's a valid URL or a valid path
      if (src.startsWith('http') || src.startsWith('https')) {
        new URL(src)
      } else if (!src.startsWith('/')) {
        // Relative paths should start with /
        return fallbackSrc
      }
      return src
    } catch {
      console.error('Invalid image URL:', src)
      return fallbackSrc
    }
  }, [src, imageError])

  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      src={imageSrc}
      onError={() => {
        console.error(`Failed to load image: ${src}`)
        setImageError(true)
      }}
    />
  )
}

export default ProductImageErrorBoundary