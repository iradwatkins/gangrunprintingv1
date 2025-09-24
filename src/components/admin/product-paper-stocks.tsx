'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from '@/lib/toast'
import { FileText, Plus, X, Star, DollarSign, Package, Droplets } from 'lucide-react'

interface PaperStock {
  id: string
  name: string
  weight: number
  pricePerSqInch: number
  tooltipText: string | null
  isActive: boolean
  paperStockCoatings: Array<{
    coatingId: string
    isDefault: boolean
    coating: {
      id: string
      name: string
      description: string | null
    }
  }>
  paperStockSides: Array<{
    sidesOptionId: string
    priceMultiplier: number
    isEnabled: boolean
    sidesOption: {
      id: string
      name: string
      code: string
      description: string | null
    }
  }>
}

interface ProductPaperStock {
  paperStockId: string
  paperStock?: PaperStock
  isDefault: boolean
  additionalCost: number
}

interface ProductPaperStocksProps {
  selectedStocks: ProductPaperStock[]
  onStocksChange: (stocks: ProductPaperStock[]) => void
}

export function ProductPaperStocks({ selectedStocks, onStocksChange }: ProductPaperStocksProps) {
  const [availableStocks, setAvailableStocks] = useState<PaperStock[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchPaperStocks()
  }, [])

  const fetchPaperStocks = async () => {
    try {
      const res = await fetch('/api/paper-stocks')
      if (res.ok) {
        const data = await res.json()
        setAvailableStocks(data.filter((stock: PaperStock) => stock.isActive))
      }
    } catch (error) {
      toast.error('Failed to load paper stocks')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStock = (stockId: string) => {
    const existing = selectedStocks.find((s) => s.paperStockId === stockId)

    if (existing) {
      // Remove stock
      const newStocks = selectedStocks.filter((s) => s.paperStockId !== stockId)
      // If removed stock was default and there are other stocks, make first one default
      if (existing.isDefault && newStocks.length > 0) {
        newStocks[0].isDefault = true
      }
      onStocksChange(newStocks)
    } else {
      // Add stock
      const newStock: ProductPaperStock = {
        paperStockId: stockId,
        isDefault: selectedStocks.length === 0, // Make first stock default
        additionalCost: 0,
      }
      onStocksChange([...selectedStocks, newStock])
    }
  }

  const handleSetDefault = (stockId: string) => {
    const newStocks = selectedStocks.map((stock) => ({
      ...stock,
      isDefault: stock.paperStockId === stockId,
    }))
    onStocksChange(newStocks)
  }

  const handleAdditionalCostChange = (stockId: string, cost: number) => {
    const newStocks = selectedStocks.map((stock) =>
      stock.paperStockId === stockId ? { ...stock, additionalCost: cost } : stock
    )
    onStocksChange(newStocks)
  }

  const filteredStocks = availableStocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(filter.toLowerCase()) ||
      (stock.tooltipText && stock.tooltipText.toLowerCase().includes(filter.toLowerCase()))
    return matchesSearch
  })

  // Remove category filtering since we simplified the schema
  // const categories = []

  const getStockStatus = (stock: PaperStock) => {
    // Since we simplified the schema, all active stocks are considered available
    return { label: 'Available', color: 'success' }
  }

  const getDefaultCoating = (stock: PaperStock) => {
    return stock.paperStockCoatings.find((pc) => pc.isDefault)?.coating.name || 'None'
  }

  const getSidesOptions = (stock: PaperStock) => {
    return stock.paperStockSides
      .map((ps) => `${ps.sidesOption.name} (${ps.priceMultiplier}x)`)
      .join(', ')
  }

  if (loading) {
    return <div className="text-center py-8">Loading paper stocks...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          className="max-w-sm"
          placeholder="Search paper stocks..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Paper Stock</TableHead>
              <TableHead>Weight (shipping)</TableHead>
              <TableHead>Coating Options</TableHead>
              <TableHead>Sides Options</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Additional Cost</TableHead>
              <TableHead className="w-20">Default</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => {
              const isSelected = selectedStocks.some((s) => s.paperStockId === stock.id)
              const selectedStock = selectedStocks.find((s) => s.paperStockId === stock.id)
              const status = getStockStatus(stock)

              return (
                <TableRow key={stock.id} className={isSelected ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleStock(stock.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{stock.name}</div>
                      {stock.tooltipText && (
                        <div className="text-xs text-muted-foreground">{stock.tooltipText}</div>
                      )}
                      <Badge className="text-xs" variant={stock.isActive ? 'default' : 'secondary'}>
                        {stock.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{stock.weight.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">Shipping weight</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {stock.paperStockCoatings.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {stock.paperStockCoatings.map((pc) => (
                            <Badge key={pc.coating.id} className="text-xs" variant="outline">
                              {pc.coating.name}
                              {pc.isDefault && <span className="ml-1">★</span>}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No coatings</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {stock.paperStockSides.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {stock.paperStockSides.map((ps) => (
                            <Badge key={ps.sidesOption.id} className="text-xs" variant="outline">
                              {ps.sidesOption.name} ({ps.priceMultiplier}x)
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No sides</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>${stock.pricePerSqInch.toFixed(4)}/sq in</div>
                      <div className="text-xs text-muted-foreground">Base pricing</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isSelected && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm">$</span>
                        <Input
                          className="w-20 h-8"
                          disabled={!isSelected}
                          min="0"
                          step="0.01"
                          type="number"
                          value={selectedStock?.additionalCost || 0}
                          onChange={(e) =>
                            handleAdditionalCostChange(stock.id, parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isSelected && (
                      <Button
                        className="h-8"
                        size="sm"
                        variant={selectedStock?.isDefault ? 'default' : 'outline'}
                        onClick={() => handleSetDefault(stock.id)}
                      >
                        <Star
                          className={`h-3 w-3 ${selectedStock?.isDefault ? 'fill-current' : ''}`}
                        />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {selectedStocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Paper Stocks Summary</CardTitle>
            <CardDescription>
              {selectedStocks.length} paper stock{selectedStocks.length !== 1 ? 's' : ''} selected
              for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedStocks.map((stock) => {
                const paperStock = availableStocks.find((s) => s.id === stock.paperStockId)
                if (!paperStock) return null

                return (
                  <Badge key={stock.paperStockId} className="py-1" variant="secondary">
                    {stock.isDefault && <Star className="h-3 w-3 mr-1 fill-current" />}
                    {paperStock.name}
                    {stock.additionalCost > 0 && (
                      <span className="ml-1 text-muted-foreground">
                        (+${stock.additionalCost.toFixed(2)})
                      </span>
                    )}
                    <button
                      className="ml-2 hover:text-destructive"
                      onClick={() => handleToggleStock(stock.paperStockId)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
