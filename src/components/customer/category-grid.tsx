'use client'

import { useEffect, useState } from 'react'
import { Link } from 'next-intl'
import Image from 'next/image'
import { Package, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  thumbnailUrl?: string | null
  _count: {
    Product: number
  }
}

interface CategoryGridProps {
  limit?: number
  showViewAll?: boolean
}

export function CategoryGrid({ limit, showViewAll = true }: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch(
          '/api/product-categories?active=true&topLevel=true&withProducts=true'
        )
        if (response.ok) {
          const data = await response.json()
          setCategories(limit ? data.slice(0, limit) : data)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: limit || 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No categories available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
          const imageUrl = category.thumbnailUrl || category.imageUrl

          return (
            <Link key={category.id} href={`/category/${category.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer h-full">
                {/* Category Image */}
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform relative">
                    {imageUrl ? (
                      <Image
                        fill
                        alt={category.name}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        src={imageUrl}
                      />
                    ) : (
                      <Package className="h-20 w-20 text-primary/30" />
                    )}
                  </div>
                </div>

                {/* Category Info */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {category._count.Product}{' '}
                      {category._count.Product === 1 ? 'product' : 'products'}
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* View All Button */}
      {showViewAll && (
        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
