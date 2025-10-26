'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Check, X, ChevronLeft, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImageData {
  id: string
  url: string
  alt: string | null
  cityName: string | null
  locale: string | null
  version: number
  campaign: {
    id: string
    name: string
    locale: string
  } | null
}

interface ReviewStats {
  total: number
  approved: number
  pending: number
  declined: number
  progress: {
    percentage: number
    remaining: number
  }
}

export function ImageReviewClient() {
  const [currentImage, setCurrentImage] = useState<ImageData | null>(null)
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Touch gesture state
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const imageRef = useRef<HTMLDivElement>(null)

  // Fetch next image
  const fetchNextImage = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/ai-images/review/next')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch image')
      }

      if (data.data.completed) {
        setCompleted(true)
        setStats(data.data.stats)
      } else {
        setCurrentImage(data.data.image)
        setStats(data.data.stats)
        setCompleted(false)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Approve image
  const handleApprove = useCallback(async () => {
    if (!currentImage || processing) return

    try {
      setProcessing(true)

      const response = await fetch(`/api/admin/ai-images/${currentImage.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createProduct: false, // For now, just approve the image
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to approve image')
      }

      // Fetch next image
      await fetchNextImage()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }, [currentImage, processing, fetchNextImage])

  // Decline image
  const handleDecline = useCallback(async () => {
    if (!currentImage || processing) return

    try {
      setProcessing(true)

      const response = await fetch(`/api/admin/ai-images/${currentImage.id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Quality review',
          autoRegenerate: true,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to decline image')
      }

      // Fetch next image
      await fetchNextImage()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }, [currentImage, processing, fetchNextImage])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processing || completed) return

      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight') {
        e.preventDefault()
        handleApprove()
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowLeft') {
        e.preventDefault()
        handleDecline()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleApprove, handleDecline, processing, completed])

  // Touch gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isRightSwipe) {
      handleApprove()
    } else if (isLeftSwipe) {
      handleDecline()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Initial load
  useEffect(() => {
    fetchNextImage()
  }, [fetchNextImage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top Progress Bar */}
      {stats && !completed && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-orange-500" />
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  AI Image Review
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="secondary" className="font-mono">
                  {stats.approved}/{stats.total} Approved
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {stats.pending} Pending
                </Badge>
              </div>
            </div>
            <Progress value={stats.progress.percentage} className="h-2" />
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
              {stats.progress.percentage}% Complete • {stats.progress.remaining} Remaining
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-28 pb-8 px-4 max-w-7xl mx-auto">
        {loading && !currentImage ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading next image...</p>
          </div>
        ) : completed ? (
          <Card className="p-12 text-center max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                All Done!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                You've reviewed all pending images
              </p>
            </div>
            {stats && (
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.approved}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Approved</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats.declined}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Declined</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.total}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
                </div>
              </div>
            )}
            <Button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="mt-8"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center max-w-2xl mx-auto border-red-200 dark:border-red-900">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
              Error
            </h2>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <Button onClick={fetchNextImage} variant="outline">
              Try Again
            </Button>
          </Card>
        ) : currentImage ? (
          <div className="space-y-6">
            {/* Image Info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {currentImage.campaign && (
                  <Badge variant="secondary">
                    {currentImage.campaign.name}
                  </Badge>
                )}
                {currentImage.cityName && (
                  <Badge variant="outline">
                    {currentImage.cityName}
                  </Badge>
                )}
                {currentImage.locale && (
                  <Badge>
                    {currentImage.locale.toUpperCase()}
                  </Badge>
                )}
                {currentImage.version > 1 && (
                  <Badge variant="destructive">
                    v{currentImage.version} (Regenerated)
                  </Badge>
                )}
              </div>
            </div>

            {/* Image Preview */}
            <Card className="overflow-hidden">
              <div
                ref={imageRef}
                className="relative bg-slate-900 aspect-square md:aspect-video touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt || 'AI generated image'}
                  fill
                  className="object-contain"
                  priority
                />
                {/* Swipe hint for mobile */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden">
                  <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full">
                    Swipe ← Decline | Approve →
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleDecline}
                disabled={processing}
                size="lg"
                variant="outline"
                className="h-16 md:h-20 text-lg font-semibold border-2 hover:border-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                {processing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <X className="h-6 w-6 mr-2" />
                    Decline
                    <span className="hidden md:inline ml-2 text-sm opacity-60">(D)</span>
                  </>
                )}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                size="lg"
                className="h-16 md:h-20 text-lg font-semibold bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                {processing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Check className="h-6 w-6 mr-2" />
                    Approve
                    <span className="hidden md:inline ml-2 text-sm opacity-60">(A)</span>
                  </>
                )}
              </Button>
            </div>

            {/* Desktop Keyboard Hints */}
            <div className="hidden md:block text-center text-sm text-slate-500 dark:text-slate-400">
              <p>
                Keyboard shortcuts: <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">D</kbd> or{' '}
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">←</kbd> to decline,{' '}
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">A</kbd> or{' '}
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">→</kbd> to approve
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
