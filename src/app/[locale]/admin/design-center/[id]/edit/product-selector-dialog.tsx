'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Package, Search, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  slug: string
  category?: { name: string }
}

interface ProductSelectorDialogProps {
  open: boolean
  onClose: () => void
  imageUrl: string
  promptId: string
  testImageId: string
}

export function ProductSelectorDialog({
  open,
  onClose,
  imageUrl,
  promptId,
  testImageId,
}: ProductSelectorDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    if (open) {
      fetchProducts()
    }
  }, [open])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.slug.toLowerCase().includes(query) ||
            p.category?.name.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/products?limit=100&include=category')
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToProduct = async () => {
    if (!selectedProduct) return

    setAssigning(true)
    try {
      const response = await fetch('/api/admin/design-center/assign-to-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          imageUrl,
          promptId,
          testImageId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to assign image')
      }

      toast.success(`Image assigned to "${selectedProduct.name}"`)
      onClose()
    } catch (error) {
      console.error('Error assigning image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to assign image to product')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Image to Product</DialogTitle>
          <DialogDescription>
            Select a product to add this AI-generated image to its gallery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Products</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Product List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No products found matching your search' : 'No products available'}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedProduct?.id === product.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category?.name || 'Uncategorized'} • /{product.slug}
                            </p>
                          </div>
                        </div>
                        {selectedProduct?.id === product.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={assigning}>
            Cancel
          </Button>
          <Button onClick={handleAssignToProduct} disabled={!selectedProduct || assigning}>
            {assigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              'Assign to Product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
