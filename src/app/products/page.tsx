'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, ChevronDown, Grid3x3, List, SlidersHorizontal, X, ArrowUpDown, Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import Image from 'next/image'

const products = [
  {
    id: '1',
    name: 'Business Cards',
    category: 'Marketing Materials',
    description: 'Premium quality business cards with various finishes',
    startingPrice: 29.99,
    image: '/images/business-cards.jpg',
    turnaround: '3-5 business days',
    popular: true,
    sizes: ['Standard', 'Square', 'Mini'],
    finishes: ['Matte', 'Gloss', 'UV Coating']
  },
  {
    id: '2', 
    name: 'Flyers & Brochures',
    category: 'Marketing Materials',
    description: 'Eye-catching flyers and brochures for your marketing campaigns',
    startingPrice: 49.99,
    image: '/images/flyers.jpg',
    turnaround: '5-7 business days',
    popular: false,
    sizes: ['8.5x11', '5.5x8.5', 'Tri-fold'],
    finishes: ['Matte', 'Gloss']
  },
  {
    id: '3',
    name: 'Posters',
    category: 'Large Format',
    description: 'High-quality posters in various sizes',
    startingPrice: 19.99,
    image: '/images/posters.jpg',
    turnaround: '3-5 business days',
    popular: true,
    sizes: ['11x17', '18x24', '24x36'],
    finishes: ['Matte', 'Gloss']
  },
  {
    id: '4',
    name: 'Banners',
    category: 'Large Format',
    description: 'Durable vinyl banners for indoor and outdoor use',
    startingPrice: 89.99,
    image: '/images/banners.jpg',
    turnaround: '5-7 business days',
    popular: false,
    sizes: ['2x4', '3x6', '4x8'],
    finishes: ['Vinyl', 'Mesh']
  },
  {
    id: '5',
    name: 'T-Shirts',
    category: 'Apparel',
    description: 'Custom printed t-shirts with your design',
    startingPrice: 14.99,
    image: '/images/tshirts.jpg',
    turnaround: '7-10 business days',
    popular: true,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    finishes: ['Screen Print', 'DTG']
  },
  {
    id: '6',
    name: 'Stickers & Labels',
    category: 'Marketing Materials',
    description: 'Custom die-cut stickers and product labels',
    startingPrice: 24.99,
    image: '/images/stickers.jpg',
    turnaround: '3-5 business days',
    popular: false,
    sizes: ['2x2', '3x3', 'Custom'],
    finishes: ['Matte', 'Gloss', 'Clear']
  },
  {
    id: '7',
    name: 'Postcards',
    category: 'Marketing Materials',
    description: 'Professional postcards for direct mail campaigns',
    startingPrice: 39.99,
    image: '/images/postcards.jpg',
    turnaround: '3-5 business days',
    popular: false,
    sizes: ['4x6', '5x7', '6x9'],
    finishes: ['Matte', 'Gloss', 'UV Coating']
  },
  {
    id: '8',
    name: 'Yard Signs',
    category: 'Large Format',
    description: 'Weather-resistant yard signs with H-stakes',
    startingPrice: 34.99,
    image: '/images/yard-signs.jpg',
    turnaround: '5-7 business days',
    popular: false,
    sizes: ['18x24', '24x36'],
    finishes: ['Corrugated Plastic']
  }
]

const categories = ['All', 'Marketing Materials', 'Large Format', 'Apparel']
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name A-Z', value: 'name-asc' }
]

const turnaroundOptions = ['3-5 business days', '5-7 business days', '7-10 business days']
const finishOptions = ['Matte', 'Gloss', 'UV Coating', 'Vinyl', 'Screen Print', 'DTG']

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTurnarounds, setSelectedTurnarounds] = useState<string[]>([])
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 200])
  const [sortBy, setSortBy] = useState('featured')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Handle URL search parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      // Map URL category to display category name
      const categoryMap: Record<string, string> = {
        'business-cards': 'Marketing Materials',
        'flyers': 'Marketing Materials',
        'banners': 'Large Format',
        'stickers': 'Marketing Materials',
        'apparel': 'Apparel',
        'postcards': 'Marketing Materials'
      }

      const displayCategory = categoryMap[categoryParam]
      if (displayCategory && !selectedCategories.includes(displayCategory)) {
        setSelectedCategories([displayCategory])
      }
    }
  }, [searchParams])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesTurnaround = selectedTurnarounds.length === 0 || selectedTurnarounds.includes(product.turnaround)
      const matchesFinish = selectedFinishes.length === 0 || product.finishes.some(f => selectedFinishes.includes(f))
      const matchesPrice = product.startingPrice >= priceRange[0] && product.startingPrice <= priceRange[1]
      
      return matchesSearch && matchesCategory && matchesTurnaround && matchesFinish && matchesPrice
    })
  }, [searchQuery, selectedCategories, selectedTurnarounds, selectedFinishes, priceRange])

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts]
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.startingPrice - b.startingPrice)
      case 'price-desc':
        return sorted.sort((a, b) => b.startingPrice - a.startingPrice)
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      default: // featured
        return sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    }
  }, [filteredProducts, sortBy])

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleTurnaround = (turnaround: string) => {
    setSelectedTurnarounds(prev =>
      prev.includes(turnaround)
        ? prev.filter(t => t !== turnaround)
        : [...prev, turnaround]
    )
  }

  const toggleFinish = (finish: string) => {
    setSelectedFinishes(prev =>
      prev.includes(finish)
        ? prev.filter(f => f !== finish)
        : [...prev, finish]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedTurnarounds([])
    setSelectedFinishes([])
    setPriceRange([0, 200])
    setSearchQuery('')
  }

  const activeFiltersCount = selectedCategories.length + selectedTurnarounds.length + selectedFinishes.length + (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0)

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.filter(c => c !== 'All').map(category => (
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

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <Slider
            className="[&_[role=slider]]:bg-primary"
            max={200}
            min={0}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
          />
          <div className="flex items-center justify-between text-sm">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Turnaround Time */}
      <div>
        <h3 className="font-semibold mb-3">Turnaround Time</h3>
        <div className="space-y-2">
          {turnaroundOptions.map(turnaround => (
            <div key={turnaround} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedTurnarounds.includes(turnaround)}
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                id={`turnaround-${turnaround}`}
                onCheckedChange={() => toggleTurnaround(turnaround)}
              />
              <Label
                className="text-sm font-normal cursor-pointer"
                htmlFor={`turnaround-${turnaround}`}
              >
                {turnaround}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Finish Options */}
      <div>
        <h3 className="font-semibold mb-3">Finish</h3>
        <div className="space-y-2">
          {finishOptions.map(finish => (
            <div key={finish} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedFinishes.includes(finish)}
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                id={`finish-${finish}`}
                onCheckedChange={() => toggleFinish(finish)}
              />
              <Label
                className="text-sm font-normal cursor-pointer"
                htmlFor={`finish-${finish}`}
              >
                {finish}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <Button
          className="w-full"
          variant="outline"
          onClick={clearFilters}
        >
          Clear All Filters
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
            {/* Mobile Filter Toggle */}
            <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
              <SheetTrigger asChild>
                <Button className="lg:hidden" variant="outline">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[300px]" side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Refine your product search
                  </SheetDescription>
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

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(category => (
              <Badge key={category} className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                {category}
                <button
                  className="ml-2 hover:text-primary-foreground"
                  onClick={() => toggleCategory(category)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedTurnarounds.map(turnaround => (
              <Badge key={turnaround} className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                {turnaround}
                <button
                  className="ml-2 hover:text-primary-foreground"
                  onClick={() => toggleTurnaround(turnaround)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {selectedFinishes.map(finish => (
              <Badge key={finish} className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                {finish}
                <button
                  className="ml-2 hover:text-primary-foreground"
                  onClick={() => toggleFinish(finish)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {(priceRange[0] > 0 || priceRange[1] < 200) && (
              <Badge className="bg-primary/10 text-primary border-primary/20" variant="secondary">
                ${priceRange[0]} - ${priceRange[1]}
                <button
                  className="ml-2 hover:text-primary-foreground"
                  onClick={() => setPriceRange([0, 200])}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              {activeFiltersCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <FilterContent />
          </Card>
        </aside>

        {/* Products Grid/List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>

          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
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
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                >
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
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.category}
                      </p>
                      <p className="text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
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
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                >
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
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.category}
                            </p>
                            <p className="text-sm mb-3">
                              {product.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {product.sizes.slice(0, 3).map(size => (
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
                            <p className="text-2xl font-bold text-primary">${product.startingPrice}</p>
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
                <p className="text-muted-foreground mb-4">No products found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
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
    }>
      <ProductsPageContent />
    </Suspense>
  )
}