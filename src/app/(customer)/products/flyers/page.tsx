'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, ShoppingCart, Clock, Package, Truck } from 'lucide-react'
import Image from 'next/image'

interface PaperStock {
  id: string
  name: string
  basePrice: number
  shippingWeight: number
  isActive: boolean
  coatings: Array<{
    id: string
    label: string
    enabled: boolean
  }>
  sidesOptions: Array<{
    id: string
    label: string
    enabled: boolean
    multiplier: number
  }>
  defaultCoating: string
  defaultSides: string
}

interface QuantityOption {
  value: number
  basePrice: number
  isPopular?: boolean
}

export default function FlyerProductPage() {
  // Product configuration state
  const [paperStocks, setPaperStocks] = useState<PaperStock[]>([])
  const [selectedPaperStock, setSelectedPaperStock] = useState<string>('')
  const [selectedCoating, setSelectedCoating] = useState<string>('')
  const [selectedSides, setSelectedSides] = useState<string>('')
  const [selectedQuantity, setSelectedQuantity] = useState(500)
  const [calculatedPrice, setCalculatedPrice] = useState(0)
  
  // Load paper stocks from API
  useEffect(() => {
    const fetchPaperStocks = async () => {
      try {
        const res = await fetch('/api/paper-stocks')
        if (res.ok) {
          const paperStocks: PaperStock[] = await res.json()
          const activeStocks = paperStocks.filter(ps => ps.isActive)
          setPaperStocks(activeStocks)

          // Set default selections
          if (activeStocks.length > 0) {
            const defaultStock = activeStocks[0]
            setSelectedPaperStock(defaultStock.id)
            setSelectedCoating(defaultStock.defaultCoating)
            setSelectedSides(defaultStock.defaultSides)
          }
        }
      } catch (error) {
        console.error('Failed to fetch paper stocks:', error)
      }
    }
    fetchPaperStocks()
  }, [])

  const quantityOptions = [
    { value: 100, basePrice: 29.95 },
    { value: 250, basePrice: 39.95 },
    { value: 500, basePrice: 44.95, isPopular: true },
    { value: 1000, basePrice: 64.95 },
    { value: 2500, basePrice: 124.95 },
    { value: 5000, basePrice: 199.95 },
  ]
  
  // Get current selected paper stock
  const currentPaperStock = paperStocks.find(ps => ps.id === selectedPaperStock)

  // Calculate price whenever options change
  useEffect(() => {
    if (currentPaperStock) {
      const selectedSide = currentPaperStock.sidesOptions.find(s => s.id === selectedSides)
      const quantity = quantityOptions.find(q => q.value === selectedQuantity)
      
      if (selectedSide && quantity) {
        // Base price calculation: basePrice * size * quantity * sides multiplier
        const sizeInSquareInches = 24 // 4x6
        const baseCost = currentPaperStock.basePrice * sizeInSquareInches * selectedQuantity * selectedSide.multiplier
        
        // Add markup for retail pricing
        const markupMultiplier = 3.5 // 350% markup for retail
        const retailPrice = baseCost * markupMultiplier
        
        setCalculatedPrice(Math.round(retailPrice * 100) / 100)
      }
    }
  }, [selectedPaperStock, selectedCoating, selectedSides, selectedQuantity, currentPaperStock])

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Info & Image */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Standard Flyers</h1>
            <p className="text-muted-foreground">
              High-quality flyers perfect for promoting your business, event, or service.
            </p>
          </div>

          {/* Product Image */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center">
                <Package className="h-24 w-24 text-blue-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-blue-700">4" x 6" Flyer Preview</p>
              </div>
            </div>
          </Card>

          {/* Product Features */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <Truck className="h-8 w-8 mb-2 text-primary" />
                <h3 className="font-semibold">Fast Shipping</h3>
                <p className="text-sm text-muted-foreground">3-5 business days</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Check className="h-8 w-8 mb-2 text-green-500" />
                <h3 className="font-semibold">Quality Guaranteed</h3>
                <p className="text-sm text-muted-foreground">100% satisfaction</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 mb-2 text-blue-500" />
                <h3 className="font-semibold">Quick Turnaround</h3>
                <p className="text-sm text-muted-foreground">Ready in 2-3 days</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Configuration Options */}
        <div className="space-y-6">
          {/* Price Display */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm opacity-90">Your Price</p>
                <p className="text-4xl font-bold">${calculatedPrice.toFixed(2)}</p>
                <p className="text-sm opacity-90 mt-2">
                  {selectedQuantity} flyers • 4" x 6"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Paper Stock Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paper Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPaperStock} onValueChange={(value) => {
                setSelectedPaperStock(value)
                const paperStock = paperStocks.find(ps => ps.id === value)
                if (paperStock) {
                  setSelectedCoating(paperStock.defaultCoating)
                  setSelectedSides(paperStock.defaultSides)
                }
              }}>
                {paperStocks.map((paperStock) => (
                  <div key={paperStock.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`paper-${paperStock.id}`} value={paperStock.id} />
                      <Label className="cursor-pointer" htmlFor={`paper-${paperStock.id}`}>
                        {paperStock.name}
                      </Label>
                    </div>
                    <span className="text-sm font-medium">
                      ${(paperStock.basePrice * 24 * 500 * 3.5).toFixed(2)}
                    </span>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Coating Selection - Only show if paper stock has coating options */}
          {currentPaperStock && currentPaperStock.coatings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coating Options</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedCoating} onValueChange={setSelectedCoating}>
                  {currentPaperStock.coatings.map((coating) => (
                    <div key={coating.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id={`coating-${coating.id}`} value={coating.id} />
                        <Label className="cursor-pointer" htmlFor={`coating-${coating.id}`}>
                          {coating.label}
                          {coating.id === currentPaperStock.defaultCoating && (
                            <Badge className="ml-2" variant="secondary">Default</Badge>
                          )}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Sides Selection - Only show enabled options */}
          {currentPaperStock && currentPaperStock.sidesOptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Printing Sides</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedSides} onValueChange={setSelectedSides}>
                  {currentPaperStock.sidesOptions.map((sides) => (
                    <div key={sides.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem id={`sides-${sides.id}`} value={sides.id} />
                        <Label className="cursor-pointer" htmlFor={`sides-${sides.id}`}>
                          {sides.label}
                          {sides.multiplier !== 1.0 && (
                            <Badge className="ml-2" variant="outline">
                              {sides.multiplier}x
                            </Badge>
                          )}
                          {sides.id === currentPaperStock.defaultSides && (
                            <Badge className="ml-2" variant="secondary">Default</Badge>
                          )}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Quantity Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Quantity</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedQuantity.toString()} onValueChange={(v) => setSelectedQuantity(parseInt(v))}>
                {quantityOptions.map((qty) => (
                  <div key={qty.value} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id={`qty-${qty.value}`} value={qty.value.toString()} />
                      <Label className="cursor-pointer" htmlFor={`qty-${qty.value}`}>
                        {qty.value.toLocaleString()}
                        {qty.isPopular && (
                          <Badge className="ml-2" variant="secondary">Most Popular</Badge>
                        )}
                      </Label>
                    </div>
                    <span className="text-sm font-medium">${qty.basePrice}</span>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Add to Cart Button */}
          <Button className="w-full" size="lg">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart - ${calculatedPrice.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  )
}