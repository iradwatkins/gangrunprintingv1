'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface SimpleProduct {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  isActive: boolean
}

export default function SimpleProductsPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        // Filter only active products and simplify data
        const activeProducts: SimpleProduct[] = data
          .filter((product: any) => product.isActive)
          .map((product: any) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description || 'High-quality printing product',
            basePrice: product.basePrice,
            isActive: product.isActive,
          }))

        setProducts(activeProducts)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <h2 className="text-xl font-semibold mb-2">Error Loading Products</h2>
              <p>{error}</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Our Printing Products</h1>
        <p className="text-xl text-muted-foreground">High-quality paper printing solutions</p>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">No Products Available</h2>
              <p className="text-muted-foreground">Check back soon for new products!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <Badge className="w-fit">Available Now</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">{product.description}</p>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${product.basePrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">Starting price</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link className="flex-1" href={`/products/${product.slug}`}>
                      <Button className="w-full" variant="outline">
                        View Details
                      </Button>
                    </Link>
                    <Button className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Order Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
            <p className="text-muted-foreground mb-4">
              Our team is here to help you find the perfect printing solution
            </p>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
