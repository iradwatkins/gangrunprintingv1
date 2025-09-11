'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, Droplets, Layers } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import toast from '@/lib/toast'

interface SidesOption {
  id: string
  name: string
  code: string
  description: string
  priceMultiplier: number
  sortOrder: number
  isDefault: boolean
  isActive: boolean
}

interface CoatingOption {
  id: string
  name: string
  description: string
  costPerSquareInch: number
  sortOrder: number
  isDefault: boolean
  isActive: boolean
}

export default function PrintOptionsPage() {
  // Sides Options State
  const [sidesOptions, setSidesOptions] = useState<SidesOption[]>([
    {
      id: '1',
      name: 'Single Sided',
      code: '4/0',
      description: 'Full color front, blank back',
      priceMultiplier: 1.0,
      sortOrder: 1,
      isDefault: true,
      isActive: true
    },
    {
      id: '2',
      name: 'Double Sided',
      code: '4/4',
      description: 'Full color both sides',
      priceMultiplier: 1.8,
      sortOrder: 2,
      isDefault: false,
      isActive: true
    },
    {
      id: '3',
      name: 'Front Color/Back B&W',
      code: '4/1',
      description: 'Full color front, black & white back',
      priceMultiplier: 1.3,
      sortOrder: 3,
      isDefault: false,
      isActive: true
    }
  ])

  // Coating Options State
  const [coatingOptions, setCoatingOptions] = useState<CoatingOption[]>([
    {
      id: '1',
      name: 'No Coating',
      description: 'Natural paper finish',
      costPerSquareInch: 0,
      sortOrder: 1,
      isDefault: true,
      isActive: true
    },
    {
      id: '2',
      name: 'UV Coating (High Gloss)',
      description: 'Ultra-glossy protective coating',
      costPerSquareInch: 0.02,
      sortOrder: 2,
      isDefault: false,
      isActive: true
    },
    {
      id: '3',
      name: 'Matte Coating',
      description: 'Smooth, non-reflective finish',
      costPerSquareInch: 0.015,
      sortOrder: 3,
      isDefault: false,
      isActive: true
    },
    {
      id: '4',
      name: 'Soft Touch',
      description: 'Velvety, premium feel',
      costPerSquareInch: 0.03,
      sortOrder: 4,
      isDefault: false,
      isActive: true
    }
  ])

  const [editingSides, setEditingSides] = useState<SidesOption | null>(null)
  const [editingCoating, setEditingCoating] = useState<CoatingOption | null>(null)

  const calculateSamplePrice = (multiplier: number, basePrice: number = 44.95) => {
    return (basePrice * multiplier).toFixed(2)
  }

  const calculateCoatingSample = (costPerSqIn: number, size: number = 24, qty: number = 500) => {
    return (costPerSqIn * size * qty).toFixed(2)
  }

  const handleSetDefaultSides = (id: string) => {
    setSidesOptions(prev => prev.map(option => ({
      ...option,
      isDefault: option.id === id
    })))
    toast.success('Default sides option updated')
  }

  const handleSetDefaultCoating = (id: string) => {
    setCoatingOptions(prev => prev.map(option => ({
      ...option,
      isDefault: option.id === id
    })))
    toast.success('Default coating option updated')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Print Options Management</h1>
        <p className="text-muted-foreground">
          Configure printing sides and coating options
        </p>
      </div>

      <Tabs className="space-y-4" defaultValue="sides">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="flex items-center gap-2" value="sides">
            <Layers className="h-4 w-4" />
            Printing Sides
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="coating">
            <Droplets className="h-4 w-4" />
            Coating Options
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sides">
          <Card>
            <CardHeader>
              <CardTitle>Printing Sides Options</CardTitle>
              <CardDescription>
                Configure how many sides can be printed on products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price Multiplier</TableHead>
                    <TableHead>Sample Impact</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sidesOptions
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="font-medium">{option.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{option.code}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {option.description}
                      </TableCell>
                      <TableCell>{option.priceMultiplier}x</TableCell>
                      <TableCell>
                        ${calculateSamplePrice(option.priceMultiplier)}
                      </TableCell>
                      <TableCell>
                        {option.isDefault ? (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetDefaultSides(option.id)}
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={option.isActive}
                          onCheckedChange={(checked) => {
                            setSidesOptions(prev => prev.map(opt => 
                              opt.id === option.id ? { ...opt, isActive: checked } : opt
                            ))
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coating">
          <Card>
            <CardHeader>
              <CardTitle>Coating Options</CardTitle>
              <CardDescription>
                Configure available coating finishes for products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Cost/sq inch</TableHead>
                    <TableHead>Sample Cost (4x6, 500qty)</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coatingOptions
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="font-medium">{option.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {option.description}
                      </TableCell>
                      <TableCell>
                        ${option.costPerSquareInch.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        {option.costPerSquareInch > 0 ? (
                          <span className="text-green-600">
                            +${calculateCoatingSample(option.costPerSquareInch)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">$0.00</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {option.isDefault ? (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetDefaultCoating(option.id)}
                          >
                            Set Default
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={option.isActive}
                          onCheckedChange={(checked) => {
                            setCoatingOptions(prev => prev.map(opt => 
                              opt.id === option.id ? { ...opt, isActive: checked } : opt
                            ))
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Reference Card */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing Formula Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-mono bg-muted p-2 rounded">
              Final Price = (Base Paper Price × Size × Quantity × Sides Multiplier) + (Coating Cost × Size × Quantity)
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold mb-2">Example: 4x6 Flyer, 500 qty</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Base: $0.00001234 × 24 sq in × 500 = $0.15</li>
                  <li>• Double Sided: $0.15 × 1.8 = $0.27</li>
                  <li>• UV Coating: $0.02 × 24 × 500 = $240</li>
                  <li>• Total: $240.27 (before markup)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Standard Markups</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Small quantities (100-500): 150% markup</li>
                  <li>• Medium quantities (500-2500): 125% markup</li>
                  <li>• Large quantities (2500+): 100% markup</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}