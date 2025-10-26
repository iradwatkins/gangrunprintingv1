'use client'

import { useState } from 'react'
import { type Product, type ProductImage, type ProductCategory } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, X, DollarSign, Percent } from 'lucide-react'
import Image from 'next/image'

type ProductWithDetails = Product & {
  ProductImage: ProductImage[]
  ProductCategory: ProductCategory
}

interface ProductSelectorProps {
  products: ProductWithDetails[]
  selectedProducts: any[]
  onAddProduct: (productId: string, data: any) => void
  onRemoveProduct: (productId: string) => void
  onUpdateProduct: (productId: string, data: any) => void
}

export function ProductSelector({
  products,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateProduct,
}: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [discountValue, setDiscountValue] = useState<string>('')
  const [priceOverride, setPriceOverride] = useState<string>('')

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ProductCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = () => {
    if (!selectedProductId) return

    const data = {
      quantity: 1,
      priceOverride: priceOverride ? parseFloat(priceOverride) : null,
      discountType: discountValue ? discountType : null,
      discountValue: discountValue ? parseFloat(discountValue) : null,
      isDefault: selectedProducts.length === 0,
      sortOrder: selectedProducts.length,
    }

    onAddProduct(selectedProductId, data)

    // Reset form
    setSelectedProductId('')
    setDiscountType('PERCENTAGE')
    setDiscountValue('')
    setPriceOverride('')
  }

  const getProductImageUrl = (product: ProductWithDetails) => {
    const primaryImage =
      product.ProductImage.find((img: any) => img.isPrimary) || product.ProductImage[0]
    return (primaryImage as any)?.Image?.url || '/placeholder-product.png'
  }

  return (
    <div className="space-y-6">
      {/* Selected Products List */}
      {selectedProducts.length > 0 && (
        <div className="space-y-3">
          <Label>Selected Products ({selectedProducts.length})</Label>
          {selectedProducts.map((sp) => {
            const product = products.find((p) => p.id === sp.productId)
            if (!product) return null

            return (
              <Card key={sp.id || sp.productId}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        fill
                        alt={product.name}
                        className="object-cover rounded"
                        src={getProductImageUrl(product)}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.ProductCategory.name}
                          </p>
                          <div className="flex gap-2 mt-2">
                            {sp.isDefault && <Badge variant="default">Default</Badge>}
                            {sp.priceOverride && (
                              <Badge variant="secondary">Override: ${sp.priceOverride}</Badge>
                            )}
                            {sp.discountValue && (
                              <Badge variant="outline">
                                {sp.discountType === 'PERCENTAGE'
                                  ? `${sp.discountValue}% OFF`
                                  : `$${sp.discountValue} OFF`}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveProduct(sp.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Product Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Product to Step</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="grid gap-2">
            <Label htmlFor="search">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                id="search"
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Product Select */}
          <div className="grid gap-2">
            <Label htmlFor="product">Select Product</Label>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.basePrice}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priceOverride">Price Override (optional)</Label>
              <Input
                id="priceOverride"
                placeholder="Custom price"
                step="0.01"
                type="number"
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={discountType} onValueChange={(value: any) => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2" />
                      Percentage
                    </div>
                  </SelectItem>
                  <SelectItem value="FIXED">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Fixed Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="discountValue">Discount Value (optional)</Label>
            <Input
              id="discountValue"
              placeholder={discountType === 'PERCENTAGE' ? '10 (for 10%)' : '5.00'}
              step={discountType === 'PERCENTAGE' ? '1' : '0.01'}
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          <Button className="w-full" disabled={!selectedProductId} onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product to Step
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
