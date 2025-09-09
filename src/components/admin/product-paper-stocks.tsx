'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { 
  FileText, 
  Plus, 
  X, 
  Star,
  DollarSign,
  Package,
  Droplets,
  Info
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PaperStock {
  id: string
  name: string
  category: string
  weight: string
  finish: string
  coating: string
  sides: string
  costPerSheet: number
  priceMultiplier: number
  sheetsInStock: number
  isActive: boolean
  isEcoFriendly: boolean
  thickness?: number
  opacity?: number
  brightness?: number
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
    const existing = selectedStocks.find(s => s.paperStockId === stockId)
    
    if (existing) {
      // Remove stock
      const newStocks = selectedStocks.filter(s => s.paperStockId !== stockId)
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
        additionalCost: 0
      }
      onStocksChange([...selectedStocks, newStock])
    }
  }

  const handleSetDefault = (stockId: string) => {
    const newStocks = selectedStocks.map(stock => ({
      ...stock,
      isDefault: stock.paperStockId === stockId
    }))
    onStocksChange(newStocks)
  }

  const handleAdditionalCostChange = (stockId: string, cost: number) => {
    const newStocks = selectedStocks.map(stock => 
      stock.paperStockId === stockId 
        ? { ...stock, additionalCost: cost }
        : stock
    )
    onStocksChange(newStocks)
  }

  const filteredStocks = availableStocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(filter.toLowerCase()) ||
                         stock.category.toLowerCase().includes(filter.toLowerCase()) ||
                         stock.finish.toLowerCase().includes(filter.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || stock.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(availableStocks.map(s => s.category)))

  const getStockStatus = (stock: PaperStock) => {
    if (stock.sheetsInStock === 0) return { label: 'Out of Stock', color: 'destructive' }
    if (stock.sheetsInStock < 1000) return { label: 'Low Stock', color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }

  const getCoatingInfo = (coating: string) => {
    const coatings: Record<string, string> = {
      'None': 'No coating applied',
      'UV': 'High-gloss UV coating for vibrant colors and durability',
      'Aqueous': 'Water-based coating for protection and subtle sheen',
      'Soft Touch': 'Velvety soft-touch coating for premium feel',
      'Spot UV': 'Selective UV coating for highlighting specific areas'
    }
    return coatings[coating] || coating
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
        <RadioGroup className="flex gap-4" value={categoryFilter} onValueChange={setCategoryFilter}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem id="all" value="all" />
            <Label htmlFor="all">All</Label>
          </div>
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <RadioGroupItem id={category} value={category} />
              <Label htmlFor={category}>{category}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Paper Stock</TableHead>
              <TableHead>Specifications</TableHead>
              <TableHead>Coating</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Additional Cost</TableHead>
              <TableHead className="w-20">Default</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => {
              const isSelected = selectedStocks.some(s => s.paperStockId === stock.id)
              const selectedStock = selectedStocks.find(s => s.paperStockId === stock.id)
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
                      <div className="flex gap-2">
                        <Badge className="text-xs" variant="outline">
                          {stock.category}
                        </Badge>
                        {stock.isEcoFriendly && (
                          <Badge className="text-xs" variant="success">
                            Eco-Friendly
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>{stock.weight} • {stock.finish}</div>
                      {stock.thickness && (
                        <div className="text-muted-foreground">
                          {stock.thickness}pt thick
                        </div>
                      )}
                      {(stock.opacity || stock.brightness) && (
                        <div className="text-muted-foreground text-xs">
                          {stock.opacity && `${stock.opacity}% opacity`}
                          {stock.opacity && stock.brightness && ' • '}
                          {stock.brightness && `${stock.brightness}% brightness`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={stock.coating === 'None' ? 'secondary' : 'default'}>
                          {stock.coating}
                        </Badge>
                        {stock.coating !== 'None' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{getCoatingInfo(stock.coating)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {stock.coating !== 'None' && (
                        <div className="text-xs text-muted-foreground">
                          {stock.sides}-sided
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge className="text-xs" variant={status.color as any}>
                        {status.label}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {stock.sheetsInStock.toLocaleString()} sheets
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>${stock.costPerSheet.toFixed(3)}/sheet</div>
                      <div className="text-xs text-muted-foreground">
                        ×{stock.priceMultiplier} multiplier
                      </div>
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
                          onChange={(e) => handleAdditionalCostChange(stock.id, parseFloat(e.target.value) || 0)}
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
                        <Star className={`h-3 w-3 ${selectedStock?.isDefault ? 'fill-current' : ''}`} />
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
              {selectedStocks.length} paper stock{selectedStocks.length !== 1 ? 's' : ''} selected for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedStocks.map(stock => {
                const paperStock = availableStocks.find(s => s.id === stock.paperStockId)
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