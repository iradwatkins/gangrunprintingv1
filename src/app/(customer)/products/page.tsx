'use client'

import { useState } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
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
    popular: true
  },
  {
    id: '2', 
    name: 'Flyers & Brochures',
    category: 'Marketing Materials',
    description: 'Eye-catching flyers and brochures for your marketing campaigns',
    startingPrice: 49.99,
    image: '/images/flyers.jpg',
    turnaround: '5-7 business days',
    popular: false
  },
  {
    id: '3',
    name: 'Posters',
    category: 'Large Format',
    description: 'High-quality posters in various sizes',
    startingPrice: 19.99,
    image: '/images/posters.jpg',
    turnaround: '3-5 business days',
    popular: true
  },
  {
    id: '4',
    name: 'Banners',
    category: 'Large Format',
    description: 'Durable vinyl banners for indoor and outdoor use',
    startingPrice: 89.99,
    image: '/images/banners.jpg',
    turnaround: '5-7 business days',
    popular: false
  },
  {
    id: '5',
    name: 'T-Shirts',
    category: 'Apparel',
    description: 'Custom printed t-shirts with your design',
    startingPrice: 14.99,
    image: '/images/tshirts.jpg',
    turnaround: '7-10 business days',
    popular: true
  },
  {
    id: '6',
    name: 'Stickers & Labels',
    category: 'Marketing Materials',
    description: 'Custom die-cut stickers and product labels',
    startingPrice: 24.99,
    image: '/images/stickers.jpg',
    turnaround: '3-5 business days',
    popular: false
  },
  {
    id: '7',
    name: 'Postcards',
    category: 'Marketing Materials',
    description: 'Professional postcards for direct mail campaigns',
    startingPrice: 39.99,
    image: '/images/postcards.jpg',
    turnaround: '3-5 business days',
    popular: false
  },
  {
    id: '8',
    name: 'Yard Signs',
    category: 'Large Format',
    description: 'Weather-resistant yard signs with H-stakes',
    startingPrice: 34.99,
    image: '/images/yard-signs.jpg',
    turnaround: '5-7 business days',
    popular: false
  }
]

const categories = ['All', 'Marketing Materials', 'Large Format', 'Apparel']
const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Name A-Z']

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Featured')

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'Price: Low to High':
        return a.startingPrice - b.startingPrice
      case 'Price: High to Low':
        return b.startingPrice - a.startingPrice
      case 'Name A-Z':
        return a.name.localeCompare(b.name)
      default: // Featured
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Our Products</h1>
        <p className="text-muted-foreground">
          Browse our wide selection of printing products and services
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                {selectedCategory}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                Sort: {sortBy}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group block"
          >
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 relative">
                {product.popular && (
                  <Badge className="absolute top-2 right-2 z-10">
                    Popular
                  </Badge>
                )}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  [Product Image]
                </div>
              </div>
              <div className="p-4">
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
                    <p className="text-lg font-semibold">${product.startingPrice}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {product.turnaround}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}