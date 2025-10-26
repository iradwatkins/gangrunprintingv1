'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, Filter, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'

import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { logSearch } from '@/components/GoogleAnalytics'

interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  inStock?: boolean
  sizes?: string[]
  paperStocks?: string[]
  coatings?: string[]
  turnaroundTime?: string
}

export function ProductSearch({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout>()

  // Load filters from URL params
  useEffect(() => {
    const newFilters: SearchFilters = {}
    if (searchParams.get('category')) newFilters.category = searchParams.get('category')!
    if (searchParams.get('minPrice'))
      newFilters.minPrice = parseFloat(searchParams.get('minPrice')!)
    if (searchParams.get('maxPrice'))
      newFilters.maxPrice = parseFloat(searchParams.get('maxPrice')!)
    if (searchParams.get('sortBy')) newFilters.sortBy = searchParams.get('sortBy')!
    if (searchParams.get('inStock')) newFilters.inStock = searchParams.get('inStock') === 'true'
    setFilters(newFilters)
  }, [searchParams])

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions([...data.products, ...data.categories])
      }
    } catch (error) {}
  }, [])

  // Debounced search for suggestions
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [query, fetchSuggestions])

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!query.trim() && Object.keys(filters).length === 0) return

    setIsSearching(true)
    setShowSuggestions(false)

    // Build URL params
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, String(value))
        }
      }
    })

    // Log search analytics
    if (query.trim()) {
      logSearch(query.trim())
    }

    // Navigate to search results
    router.push(`/products/search?${params.toString()}`)
    setIsSearching(false)
  }

  // Handle filter changes
  const updateFilter = (key: keyof SearchFilters, value: string | number | boolean | undefined | string[]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
    setQuery('')
    router.push('/products')
  }

  // Handle clicking outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className={className}>
      <form className="flex gap-2" onSubmit={handleSearch}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 pr-10"
            placeholder="Search products..."
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              type="button"
              onClick={() => {
                setQuery('')
                setSuggestions([])
                setShowSuggestions(false)
              }}
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}

          {/* Autocomplete suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                  type="button"
                  onClick={() => {
                    if (suggestion.type === 'category') {
                      updateFilter('category', suggestion.text)
                      setQuery('')
                    } else {
                      setQuery(suggestion.text)
                    }
                    setShowSuggestions(false)
                    handleSearch()
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{suggestion.text}</span>
                    {suggestion.category && (
                      <span className="text-xs text-muted-foreground">
                        in {suggestion.category}
                      </span>
                    )}
                    {suggestion.type === 'category' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Category
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter button (mobile) */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button size="icon" variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
              <SheetDescription>Refine your search results</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <SearchFiltersContent
                clearFilters={clearFilters}
                filters={filters}
                updateFilter={updateFilter as any}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Search button */}
        <Button disabled={isSearching} type="submit">
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </form>

      {/* Desktop filters */}
      <div className="hidden lg:block mt-4">
        <div className="flex gap-4 items-center">
          <Select
            value={filters.sortBy || 'relevance'}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={filters.inStock || false}
              id="inStock"
              onCheckedChange={(checked) => updateFilter('inStock', checked)}
            />
            <Label htmlFor="inStock">In Stock Only</Label>
          </div>

          {Object.keys(filters).length > 0 && (
            <Button className="ml-auto" size="sm" variant="ghost" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Filters component content
function SearchFiltersContent({
  filters,
  updateFilter,
  clearFilters,
}: {
  filters: SearchFilters
  updateFilter: (key: keyof SearchFilters, value: any) => void
  clearFilters: () => void
}) {
  return (
    <>
      {/* Sort By */}
      <div className="space-y-2">
        <Label>Sort By</Label>
        <RadioGroup
          value={filters.sortBy || 'relevance'}
          onValueChange={(value) => updateFilter('sortBy', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="relevance" value="relevance" />
            <Label htmlFor="relevance">Relevance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="price_asc" value="price_asc" />
            <Label htmlFor="price_asc">Price: Low to High</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="price_desc" value="price_desc" />
            <Label htmlFor="price_desc">Price: High to Low</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="name" value="name" />
            <Label htmlFor="name">Name: A to Z</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="newest" value="newest" />
            <Label htmlFor="newest">Newest First</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="popular" value="popular" />
            <Label htmlFor="popular">Most Popular</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2 items-center">
          <Input
            className="w-24"
            placeholder="Min"
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) =>
              updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)
            }
          />
          <span>to</span>
          <Input
            className="w-24"
            placeholder="Max"
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={filters.inStock || false}
          id="inStockFilter"
          onCheckedChange={(checked) => updateFilter('inStock', checked)}
        />
        <Label htmlFor="inStockFilter">In Stock Only</Label>
      </div>

      {/* Clear Filters */}
      {Object.keys(filters).length > 0 && (
        <Button className="w-full" variant="outline" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </>
  )
}
