'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowUpDown,
  ChevronDown,
  Grid3x3,
  List,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Slider } from '@/components/ui/slider'

// Types for API data
type ProductCategory = {
  id: string
  name: string
  slug: string
  description?: string
  sortOrder: number
  isActive: boolean
  _count: {
    Product: number
  }
}

type Product = {
  id: string
  name: string
  slug: string
  description?: string
  shortDescription?: string
  basePrice: number
  isActive: boolean
  isFeatured: boolean
  ProductCategory: ProductCategory
  ProductImage: Array<{
    url: string
    thumbnailUrl?: string
    alt?: string
    isPrimary: boolean
  }>
}
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name A-Z', value: 'name-asc' },
]

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // API data state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Fetch categories and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setFetchError(null)

        // Fetch categories and products in parallel
        const [categoriesResponse, productsResponse] = await Promise.all([
          fetch('/api/product-categories?active=true&withProducts=true'),
          fetch('/api/products?isActive=true')
        ])

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories')
        }
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products')
        }

        const [categoriesData, productsData] = await Promise.all([
          categoriesResponse.json(),
          productsResponse.json()
        ])

        setCategories(categoriesData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setFetchError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle URL search parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam && categories.length > 0) {
      // Find category by slug
      const category = categories.find(cat => cat.slug === categoryParam)
      if (category && !selectedCategories.includes(category.name)) {
        setSelectedCategories([category.name])
      }
    }
  }, [searchParams, selectedCategories, categories])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.shortDescription && product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.ProductCategory.name)

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategories, products])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.basePrice - b.basePrice)
      case 'price-desc':
        return sorted.sort((a, b) => b.basePrice - a.basePrice)
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      default: // featured
        return sorted.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
    }
  }, [filteredProducts, sortBy])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSearchQuery('')
  }

  const activeFiltersCount = selectedCategories.length

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <div className="space-y-2">
          {categories
            .filter((c) => c !== 'All')
            .map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  id={`category-${category}`}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <Label
                  className="text-sm font-normal cursor-pointer"
                  htmlFor={`category-${category}`}
                >
                  {category}
                </Label>
              </div>
            ))}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <Button className="w-full" variant="outline" onClick={() => setSelectedCategories([])}>
          Clear Categories
        </Button>
      )}
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Our Products</h1>
        <p className="text-muted-foreground">
          Browse our wide selection of printing products and services
        </p>
      </div>

      {/* Search and Controls Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Search products..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {/* Mobile Categories Toggle */}
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Categories
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px]" side="right">
                <SheetHeader>
                  <SheetTitle>Product Categories</SheetTitle>
                  <SheetDescription>Browse products by category</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {sortOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className={sortBy === option.value ? 'bg-primary/10' : ''}
                    onClick={() => setSortBy(option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                className="rounded-r-none"
                size="icon"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                className="rounded-l-none"
                size="icon"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Categories Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                className="bg-primary/10 text-primary border-primary/20"
                variant="secondary"
              >
                {category}
                <button
                  className="ml-2 hover:text-primary-foreground"
                  onClick={() => toggleCategory(category)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Products Grid/List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>

          {isLoading ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 mb-2" />
                    <Skeleton className="h-4 mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer h-full">
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                      {product.popular && (
                        <Badge className="absolute top-3 right-3 z-10 bg-primary text-primary-foreground">
                          Popular
                        </Badge>
                      )}
                      <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-20 w-20 text-primary/30" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                      <p className="text-sm mb-3 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-muted-foreground">Starting at</span>
                          <p className="text-lg font-bold text-primary">${product.startingPrice}</p>
                        </div>
                        <Badge className="text-xs" variant="outline">
                          {product.turnaround}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary/50 group cursor-pointer">
                    <div className="flex">
                      <div className="w-48 bg-gradient-to-br from-primary/10 to-primary/5 relative flex-shrink-0">
                        {product.popular && (
                          <Badge className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground">
                            Popular
                          </Badge>
                        )}
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-primary/30" />
                        </div>
                      </div>
                      <CardContent className="flex-1 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-1 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
                            <p className="text-sm mb-3">{product.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {product.sizes.slice(0, 3).map((size) => (
                                <Badge key={size} className="text-xs" variant="outline">
                                  {size}
                                </Badge>
                              ))}
                              {product.sizes.length > 3 && (
                                <Badge className="text-xs" variant="outline">
                                  +{product.sizes.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-sm text-muted-foreground">Starting at</span>
                            <p className="text-2xl font-bold text-primary">
                              ${product.startingPrice}
                            </p>
                            <Badge className="mt-2" variant="outline">
                              {product.turnaround}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {sortedProducts.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No products found matching your criteria.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Desktop Categories Sidebar - Right Side */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Product Categories</h2>
              {activeFiltersCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">{activeFiltersCount}</Badge>
              )}
            </div>
            <FilterContent />
          </Card>
        </aside>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <div className="h-8 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-80 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  )
}
