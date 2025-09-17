'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import toast from '@/lib/toast'

interface Product {
  id: string
  name: string
  slug: string
  sku: string
  ProductCategory: {
    id: string
    name: string
  }
  basePrice: number
  productionTime: number
  isActive: boolean
  isFeatured: boolean
  gangRunEligible: boolean
  ProductImage: Array<{
    id: string
    url: string
    isPrimary: boolean
  }>
  productPaperStocks: Array<{
    paperStock: {
      id: string
      name: string
      coating?: string
      sides?: string
    }
    isDefault: boolean
  }>
  _count: {
    ProductImage: number
    productPaperStocks: number
    ProductOption: number
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast.error('Failed to load products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Product deleted')
        fetchProducts()
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        toast.success(`Product ${!isActive ? 'activated' : 'deactivated'}`)
        fetchProducts()
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      })

      if (response.ok) {
        toast.success(`Product ${!isFeatured ? 'featured' : 'unfeatured'}`)
        fetchProducts()
      } else {
        throw new Error('Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your print products and configurations
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {products.filter(p => p.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.isFeatured).length}
            </div>
            <p className="text-xs text-muted-foreground">Featured products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gang Run Eligible</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.gangRunEligible).length}
            </div>
            <p className="text-xs text-muted-foreground">Can be gang run</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p._count?.ProductImage > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Have product images</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Paper Stocks</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={8}>
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={8}>
                    No products found. Create your first product to get started.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.ProductImage?.length > 0 ? (
                          <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-500" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.ProductCategory?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{product._count?.productPaperStocks || 0} stocks</span>
                        {product.productPaperStocks?.[0] && (
                          <span className="text-xs text-muted-foreground">
                            Default: {product.productPaperStocks[0].paperStock.name}
                            {product.productPaperStocks[0].paperStock.coating && product.productPaperStocks[0].paperStock.coating !== 'None' &&
                              ` (${product.productPaperStocks[0].paperStock.coating})`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>${product.basePrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{product.productionTime} days</span>
                        {product.gangRunEligible && (
                          <Badge className="text-xs w-fit" variant="outline">
                            Gang Run
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge 
                          className="w-fit cursor-pointer"
                          variant={product.isActive ? 'default' : 'secondary'}
                          onClick={() => toggleActive(product.id, product.isActive)}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.isFeatured && (
                          <Badge 
                            className="w-fit text-xs cursor-pointer" 
                            variant="outline"
                            onClick={() => toggleFeatured(product.id, product.isFeatured)}
                          >
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}